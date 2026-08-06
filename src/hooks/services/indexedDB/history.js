import { openDB } from './db.js';


export async function saveHistory(history) {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction("history", "readwrite");
    const store = transaction.objectStore("history");

    const items = Array.isArray(history) ? history : [history];

    // add createdAt to each item before saving
    const modifiedItems = items.map(item => ({
      ...item,
      score: item.score.obtained,
      total: item.score.over
    }));

    modifiedItems.forEach(item => store.put(item));

    transaction.oncomplete = () => {
      resolve(modifiedItems);
    };

    transaction.onerror = () => reject(transaction.error);
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

export async function removeHistory(testId) {
  if (!testId) {
    throw new Error("History ID is required.");
  }

  const db = await openDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction("history", "readwrite");

    const store = transaction.objectStore("history");

    const request = store.delete(testId);

    request.onsuccess = () => {
      resolve(true);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}


export async function clearHistory() {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction("history", "readwrite");
    const store = transaction.objectStore("history");
    store.clear();

    transaction.oncomplete = () => resolve(true);
    transaction.onerror = () => reject(transaction.error);
  });
}