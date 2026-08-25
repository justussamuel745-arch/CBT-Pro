import { openDB } from './db';

const STORE_NAME = 'examStats';

/* ================================
   ADD / UPDATE
================================ */

export const saveExamStats = async (
  userId,
  encryptedData
) => {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(
      STORE_NAME,
      'readwrite'
    );

    const store =
      transaction.objectStore(STORE_NAME);

    const request = store.put({
      userId,
      data: encryptedData,
    });

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
};


/* ================================
   GET
================================ */

export const getExamStats = async (userId) => {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(
      STORE_NAME,
      'readonly'
    );

    const store =
      transaction.objectStore(STORE_NAME);

    const request = store.get(userId);

    request.onsuccess = () => {
      resolve(request.result || null);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
};


/* ================================
   DELETE
================================ */

export const deleteExamStats = async (userId) => {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(
      STORE_NAME,
      'readwrite'
    );

    const store =
      transaction.objectStore(STORE_NAME);

    const request = store.delete(userId);

    request.onsuccess = () => {
      resolve(true);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
};