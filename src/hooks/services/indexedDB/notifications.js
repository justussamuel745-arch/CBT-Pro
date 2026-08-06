import { openDB } from "./db.js";

const STORE_NAME = "notifications";

/**
 * Save a notification locally.
 */
export const saveNotification = async (notification) => {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(
      STORE_NAME,
      "readwrite"
    );

    const store = transaction.objectStore(STORE_NAME);

    store.put(notification);

    transaction.oncomplete = () => resolve(notification);

    transaction.onerror = () =>
      reject(transaction.error);
  });
};

/**
 * Save multiple notifications.
 */
export const saveNotifications = async (
  notifications
) => {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(
      STORE_NAME,
      "readwrite"
    );

    const store = transaction.objectStore(STORE_NAME);

    notifications.forEach((notification) => {
      store.put(notification);
    });

    transaction.oncomplete = () => resolve(true);

    transaction.onerror = () =>
      reject(transaction.error);
  });
};

/**
 * Get notifications for a specific user.
 */
export const getLocalNotifications = async (
  userId
) => {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(
      STORE_NAME,
      "readonly"
    );

    const store = transaction.objectStore(STORE_NAME);

    const request = store.getAll();

    request.onsuccess = () => {
      const notifications = request.result
        .filter(
          (notification) =>
            notification.userId === userId
        )
        .sort(
          (a, b) =>
            new Date(b.createdAt) -
            new Date(a.createdAt)
        );

      resolve(notifications);
    };

    request.onerror = () =>
      reject(request.error);
  });
};

/**
 * Get unread notification count for a user.
 */
export const getLocalUnreadCount = async (
  userId
) => {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(
      STORE_NAME,
      "readonly"
    );

    const store = transaction.objectStore(STORE_NAME);

    const request = store.getAll();

    request.onsuccess = () => {
      const unread = request.result.filter(
        (notification) =>
          notification.userId === userId &&
          notification.isRead === false
      );

      resolve(unread.length);
    };

    request.onerror = () =>
      reject(request.error);
  });
};

/**
 * Mark a notification as read.
 */
export const updateLocalNotificationRead =
  async (id, userId) => {
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
        const notification = request.result;

        if (
          !notification ||
          notification.userId !== userId
        ) {
          resolve(null);
          return;
        }

        notification.isRead = true;
        notification.readAt = new Date();

        store.put(notification);
      };

      transaction.oncomplete = () =>
        resolve(true);

      transaction.onerror = () =>
        reject(transaction.error);
    });
  };

/**
 * Delete a notification.
 */
export const deleteLocalNotification =
  async (id, userId) => {
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
        const notification = request.result;

        if (
          !notification ||
          notification.userId !== userId
        ) {
          resolve(false);
          return;
        }

        store.delete(id);
      };

      transaction.oncomplete = () =>
        resolve(true);

      transaction.onerror = () =>
        reject(transaction.error);
    });
  };

/**
 * Clear notifications for a specific user.
 */
export const clearLocalNotifications =
  async (userId) => {
    const db = await openDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(
        STORE_NAME,
        "readwrite"
      );

      const store =
        transaction.objectStore(STORE_NAME);

      const request = store.getAll();

      request.onsuccess = () => {
        request.result.forEach((notification) => {
          if (
            notification.userId === userId
          ) {
            store.delete(notification._id);
          }
        });
      };

      transaction.oncomplete = () =>
        resolve(true);

      transaction.onerror = () =>
        reject(transaction.error);
    });
  };