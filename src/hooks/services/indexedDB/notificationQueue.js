import { openDB } from "./db.js";

const STORE_NAME = "notificationQueue";

/**
 * Add an action to the queue.
 */
export const addQueueAction = async ({
  userId,
  notificationId = null,
  action,
}) => {
  const db = await openDB();

  const item = {
    id: crypto.randomUUID(),
    userId,
    notificationId,
    action,
    status: "pending",
    retryCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(
      STORE_NAME,
      "readwrite"
    );

    transaction
      .objectStore(STORE_NAME)
      .put(item);

    transaction.oncomplete = () => {
      resolve(item);
    };

    transaction.onerror = () => {
      reject(transaction.error);
    };
  });
};

/**
 * Get all pending actions for a user.
 */
export const getPendingQueueActions = async (
  userId
) => {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(
      STORE_NAME,
      "readonly"
    );

    const index = transaction
      .objectStore(STORE_NAME)
      .index("userId_status");

    const request = index.getAll([
      userId,
      "pending",
    ]);

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
};

/**
 * Update queue status.
 */
export const updateQueueStatus = async (
  id,
  status
) => {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(
      STORE_NAME,
      "readwrite"
    );

    const store =
      transaction.objectStore(STORE_NAME);

    const request = store.get(id);

    request.onsuccess = () => {
      const item = request.result;

      if (!item) {
        resolve(null);
        return;
      }

      item.status = status;
      item.updatedAt =
        new Date().toISOString();

      if (status === "pending") {
        item.retryCount += 1;
      }

      store.put(item);
    };

    transaction.oncomplete = () => {
      resolve(true);
    };

    transaction.onerror = () => {
      reject(transaction.error);
    };
  });
};

/**
 * Remove a completed action.
 */
export const removeQueueAction = async (
  id
) => {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(
      STORE_NAME,
      "readwrite"
    );

    transaction
      .objectStore(STORE_NAME)
      .delete(id);

    transaction.oncomplete = () => {
      resolve(true);
    };

    transaction.onerror = () => {
      reject(transaction.error);
    };
  });
};

/**
 * Clear a user's queue.
 */
export const clearQueue = async (
  userId
) => {
  const actions =
    await getPendingQueueActions(userId);

  const db = await openDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(
      STORE_NAME,
      "readwrite"
    );

    const store =
      transaction.objectStore(STORE_NAME);

    actions.forEach((action) => {
      store.delete(action.id);
    });

    transaction.oncomplete = () => {
      resolve(true);
    };

    transaction.onerror = () => {
      reject(transaction.error);
    };
  });
};


export const processQueue = async (
  userId,
  handlers
) => {
  const actions =
    await getPendingQueueActions(userId);

  for (const action of actions) {
    try {
      await updateQueueStatus(
        action.id,
        "syncing"
      );

      switch (action.action) {
        case "MARK_READ":
          await handlers.markRead(
            action.notificationId
          );
          break;

        case "DELETE":
          await handlers.deleteNotification(
            action.notificationId
          );
          break;
      }

      await removeQueueAction(action.id);
    } catch (error) {
      await updateQueueStatus(
        action.id,
        "pending"
      );
    }
  }
};