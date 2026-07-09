/*
  Creates the IndexedDB database.
  Creates object stores.
  Opens the database.
  Handles upgrades.
*/

const DB_NAME = "CBTPro";
const DB_VERSION = 3;

export function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    // Runs only when creating the database
    // or when the version changes
    request.onupgradeneeded = (event) => {
      const db = event.target.result;

      // Users Store
      if (!db.objectStoreNames.contains("users")) {
        db.createObjectStore("users", {
          keyPath: "id"
        });
      }

      // Questions Store
      if (!db.objectStoreNames.contains("questions")) {
        const questionsStore = db.createObjectStore("questions", {
          keyPath: "id",
        });

        // Single-field indexes
        questionsStore.createIndex("subject", "subject", {
          unique: false,
        });

        questionsStore.createIndex("year", "year", {
          unique: false,
        });

        questionsStore.createIndex("topic", "topic", {
          unique: false,
        });

        questionsStore.createIndex("premium", "premium", {
          unique: false,
        });

        // Compound indexes
        questionsStore.createIndex("subject_year", ["subject", "year"], {
          unique: false,
        });

        questionsStore.createIndex(
          "subject_year_topic",
          ["subject", "year", "topic"],
          {
            unique: false,
          }
        );
      }


      // Settings Store
      if (!db.objectStoreNames.contains("settings")) {
        db.createObjectStore("settings", {
          keyPath: "id"
        });
      }

      // history store
      if (!db.objectStoreNames.contains("history")) {
        const historyStore = db.createObjectStore("history", {
          keyPath: "_id",
        });

        historyStore.createIndex("createdAt", "createdAt", {
          unique: false,
        });

        historyStore.createIndex("userId", "userId", {
          unique: false,
        });
      }

    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}