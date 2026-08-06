/*
  Creates the IndexedDB database.
  Creates object stores.
  Opens the database.
  Handles upgrades.
*/

const DB_NAME = "CBTPro";
const DB_VERSION = 9;

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
          keyPath: "testId",
        });

        historyStore.createIndex("createdAt", "createdAt", {
          unique: false,
        });

        historyStore.createIndex("userId", "userId", {
          unique: false,
        });
      }

      // Images Store
      if (!db.objectStoreNames.contains("images")) {
        db.createObjectStore("images", {
          keyPath: "id",
        });
      }

      // Games Store
      if (!db.objectStoreNames.contains("games")) {
        const gamesStore = db.createObjectStore("games", {
          keyPath: "id",
        });

        // Single-field indexes
        gamesStore.createIndex("subject", "subject", {
          unique: false,
        });

        gamesStore.createIndex("league", "league", {
          unique: false,
        });

        gamesStore.createIndex("level", "level", {
          unique: false,
        });

        // Compound indexes
        gamesStore.createIndex(
          "subject_league",
          ["subject", "league"],
          { unique: false }
        );

        gamesStore.createIndex(
          "subject_league_level",
          ["subject", "league", "level"],
          { unique: false }
        );
      }

      // Notifications Store
      if (!db.objectStoreNames.contains("notifications")) {
        const notificationsStore = db.createObjectStore(
          "notifications",
          {
            keyPath: "_id",
          }
        );

        // Single-field indexes
        notificationsStore.createIndex(
          "userId",
          "userId",
          {
            unique: false,
          }
        );

        notificationsStore.createIndex(
          "isRead",
          "isRead",
          {
            unique: false,
          }
        );

        notificationsStore.createIndex(
          "createdAt",
          "createdAt",
          {
            unique: false,
          }
        );

        // Compound indexes
        notificationsStore.createIndex(
          "userId_createdAt",
          ["userId", "createdAt"],
          {
            unique: false,
          }
        );

        notificationsStore.createIndex(
          "userId_isRead",
          ["userId", "isRead"],
          {
            unique: false,
          }
        );
      }

      // Notification Queue Store
      if (!db.objectStoreNames.contains("notificationQueue")) {
        const queueStore = db.createObjectStore(
          "notificationQueue",
          {
            keyPath: "id",
          }
        );

        // Single-field indexes
        queueStore.createIndex(
          "userId",
          "userId",
          {
            unique: false,
          }
        );

        queueStore.createIndex(
          "notificationId",
          "notificationId",
          {
            unique: false,
          }
        );

        queueStore.createIndex(
          "action",
          "action",
          {
            unique: false,
          }
        );

        queueStore.createIndex(
          "status",
          "status",
          {
            unique: false,
          }
        );

        queueStore.createIndex(
          "createdAt",
          "createdAt",
          {
            unique: false,
          }
        );

        // Compound indexes
        queueStore.createIndex(
          "userId_status",
          ["userId", "status"],
          {
            unique: false,
          }
        );

        queueStore.createIndex(
          "userId_action",
          ["userId", "action"],
          {
            unique: false,
          }
        );
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