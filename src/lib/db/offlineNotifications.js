import { openDB } from './db';

const STORE_NAME = 'offlineNotifications';

// Add
export const addOfflineNotification = async (notification) => {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(
      STORE_NAME,
      'readwrite'
    );

    const store = transaction.objectStore(STORE_NAME);

    const request = store.add(notification);

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
};


// Get one by _id
export const getOfflineNotification = async (id) => {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(
      STORE_NAME,
      'readonly'
    );

    const store = transaction.objectStore(STORE_NAME);

    const request = store.get(id);

    request.onsuccess = () => {
      resolve(request.result || null);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
};


// Get all for a specific user
export const getOfflineNotifications = async (userId) => {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(
      STORE_NAME,
      'readonly'
    );

    const store = transaction.objectStore(STORE_NAME);
    const index = store.index('userId');

    const request = index.getAll(userId);

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
};


// Update by _id
export const updateOfflineNotification = async (
  id,
  updates
) => {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(
      STORE_NAME,
      'readwrite'
    );

    const store = transaction.objectStore(STORE_NAME);

    const getRequest = store.get(id);

    getRequest.onsuccess = () => {
      const notification = getRequest.result;

      if (!notification) {
        reject(
          new Error('Offline notification not found')
        );
        return;
      }

      const updatedNotification = {
        ...notification,
        ...updates,
      };

      const updateRequest =
        store.put(updatedNotification);

      updateRequest.onsuccess = () => {
        resolve(updatedNotification);
      };

      updateRequest.onerror = () => {
        reject(updateRequest.error);
      };
    };

    getRequest.onerror = () => {
      reject(getRequest.error);
    };
  });
};


// Delete one by _id
export const deleteOfflineNotification = async (id) => {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(
      STORE_NAME,
      'readwrite'
    );

    const store = transaction.objectStore(STORE_NAME);

    const request = store.delete(id);

    request.onsuccess = () => {
      resolve(true);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
};


// Delete all for a specific user
export const deleteAllOfflineNotifications = async (
  userId
) => {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(
      STORE_NAME,
      'readwrite'
    );

    const index = transaction
      .objectStore(STORE_NAME)
      .index('userId');

    const request = index.openCursor(
      IDBKeyRange.only(userId)
    );

    request.onsuccess = (event) => {
      const cursor = event.target.result;

      if (!cursor) {
        resolve(true);
        return;
      }

      cursor.delete();
      cursor.continue();
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
};