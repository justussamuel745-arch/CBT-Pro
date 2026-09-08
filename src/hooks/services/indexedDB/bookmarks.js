import { openDB } from "./db";


/* ================================
   ADD BOOKMARK
================================ */

export const addBookmark = async (bookmark) => {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(
      "bookmarks",
      "readwrite"
    );

    const store = transaction.objectStore("bookmarks");

    const request = store.put(bookmark);

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
};


/* ================================
   GET USER BOOKMARKS
================================ */

export const getUserBookmarks = async (userId) => {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(
      "bookmarks",
      "readonly"
    );

    const store = transaction.objectStore("bookmarks");
    const index = store.index("userId");

    const request = index.getAll(userId);

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
};


/* ================================
   GET BOOKMARK
================================ */

export const getBookmark = async (id) => {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(
      "bookmarks",
      "readonly"
    );

    const store = transaction.objectStore("bookmarks");

    const request = store.get(id);

    request.onsuccess = () => {
      resolve(request.result || null);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
};


/* ================================
   DELETE BOOKMARK
================================ */

export const deleteBookmark = async (id) => {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(
      "bookmarks",
      "readwrite"
    );

    const store = transaction.objectStore("bookmarks");

    const getRequest = store.get(id);

    getRequest.onsuccess = () => {
      if (!getRequest.result) {
        resolve(false);
        return;
      }

      const deleteRequest = store.delete(id);

      deleteRequest.onsuccess = () => {
        resolve(true);
      };

      deleteRequest.onerror = () => {
        reject(deleteRequest.error);
      };
    };

    getRequest.onerror = () => {
      reject(getRequest.error);
    };
  });
};