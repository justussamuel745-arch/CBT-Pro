import { openDB } from './db.js';

export async function saveHistory(history) {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    // Open a readwrite transaction
    const transaction = db.transaction("history", "readwrite");
    const store = transaction.objectStore("history");

    // Handle both single items and arrays
    const items = Array.isArray(history) ? history : [history];
    items.forEach(item => store.put(item));

    // Listen to the transaction completion instead of individual requests
    transaction.oncomplete = () => {
      resolve(history); 
    };

    transaction.onerror = () => {
      reject(transaction.error);
    };
  });
}



export async function getHistory(userId) {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction("history", "readonly");

    const store = transaction.objectStore("history");

    const index = store.index("userId");

    const request = index.getAll(userId);

    request.onsuccess = () => {
      const history = request.result.sort(
        (a, b) => b.createdAt - a.createdAt
      );

      resolve(history);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}

export async function removeHistory(_id) {
  if (!_id) {
    throw new Error("History ID is required.");
  }

  const db = await openDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction("history", "readwrite");

    const store = transaction.objectStore("history");

    const request = store.delete(_id);

    request.onsuccess = () => {
      resolve(true);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}