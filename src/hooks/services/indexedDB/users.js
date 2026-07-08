import { openDB } from "./db";

/*
  Save user information.
  Save activation status.
  Update activation status.
*/

export async function saveUser(user) {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction("users", "readwrite");

    const store = transaction.objectStore("users");

    const request = store.put({
      ...user,
      id: "current-user",
    });

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}

export async function getUser() {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction("users", "readonly");

    const store = transaction.objectStore("users");

    const request = store.get("current-user");

    request.onsuccess = () => {
      resolve(request.result ?? null);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}

export async function deleteUser() {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction("users", "readwrite");

    const store = transaction.objectStore("users");

    const request = store.delete("current-user");

    request.onsuccess = () => {
      resolve(true);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}
