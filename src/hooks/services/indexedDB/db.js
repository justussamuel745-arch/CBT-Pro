/*
  Creates the IndexedDB database.
  Creates object stores.
  Opens the database.
  Handles upgrades.
*/

const DB_NAME = "CBTPro";
const DB_VERSION = 14;


/* ================================
   USERS
================================ */

const createUsersStore = (db) => {
  if (!db.objectStoreNames.contains("users")) {
    db.createObjectStore("users", {
      keyPath: "id",
    });
  }
};


/* ================================
   QUESTIONS
================================ */

const createQuestionsStore = (db) => {
  if (db.objectStoreNames.contains("questions")) return;

  const store = db.createObjectStore("questions", {
    keyPath: "id",
  });

  store.createIndex("subject", "subject", {
    unique: false,
  });

  store.createIndex("year", "year", {
    unique: false,
  });

  store.createIndex("topic", "topic", {
    unique: false,
  });

  store.createIndex("premium", "premium", {
    unique: false,
  });

  store.createIndex(
    "subject_year",
    ["subject", "year"],
    {
      unique: false,
    }
  );

  store.createIndex(
    "subject_year_topic",
    ["subject", "year", "topic"],
    {
      unique: false,
    }
  );
};


/* ================================
   SETTINGS
================================ */

const createSettingsStore = (db) => {
  if (!db.objectStoreNames.contains("settings")) {
    db.createObjectStore("settings", {
      keyPath: "id",
    });
  }
};


/* ================================
   HISTORY
================================ */

const createHistoryStore = (db) => {
  if (db.objectStoreNames.contains("history")) return;

  const store = db.createObjectStore("history", {
    keyPath: "testId",
  });

  store.createIndex("createdAt", "createdAt", {
    unique: false,
  });

  store.createIndex("userId", "userId", {
    unique: false,
  });
};


/* ================================
   IMAGES
================================ */

const createImagesStore = (db) => {
  if (!db.objectStoreNames.contains("images")) {
    db.createObjectStore("images", {
      keyPath: "id",
    });
  }
};


/* ================================
   GAMES
================================ */

const createGamesStore = (db) => {
  if (db.objectStoreNames.contains("games")) return;

  const store = db.createObjectStore("games", {
    keyPath: "id",
  });

  store.createIndex("subject", "subject", {
    unique: false,
  });

  store.createIndex("league", "league", {
    unique: false,
  });

  store.createIndex("level", "level", {
    unique: false,
  });

  store.createIndex(
    "subject_league",
    ["subject", "league"],
    {
      unique: false,
    }
  );

  store.createIndex(
    "subject_league_level",
    ["subject", "league", "level"],
    {
      unique: false,
    }
  );
};


/* ================================
   NOTIFICATIONS
================================ */

const createNotificationsStore = (db) => {
  if (db.objectStoreNames.contains("notifications")) return;

  const store = db.createObjectStore(
    "notifications",
    {
      keyPath: "_id",
    }
  );

  store.createIndex("userId", "userId", {
    unique: false,
  });

  store.createIndex("isRead", "isRead", {
    unique: false,
  });

  store.createIndex("createdAt", "createdAt", {
    unique: false,
  });

  store.createIndex(
    "userId_createdAt",
    ["userId", "createdAt"],
    {
      unique: false,
    }
  );

  store.createIndex(
    "userId_isRead",
    ["userId", "isRead"],
    {
      unique: false,
    }
  );
};


/* ================================
   NOTIFICATION QUEUE
================================ */

const createNotificationQueueStore = (db) => {
  if (db.objectStoreNames.contains("notificationQueue")) {
    return;
  }

  const store = db.createObjectStore(
    "notificationQueue",
    {
      keyPath: "id",
    }
  );

  store.createIndex("userId", "userId", {
    unique: false,
  });

  store.createIndex("notificationId", "notificationId", {
    unique: false,
  });

  store.createIndex("action", "action", {
    unique: false,
  });

  store.createIndex("status", "status", {
    unique: false,
  });

  store.createIndex("createdAt", "createdAt", {
    unique: false,
  });

  store.createIndex(
    "userId_status",
    ["userId", "status"],
    {
      unique: false,
    }
  );

  store.createIndex(
    "userId_action",
    ["userId", "action"],
    {
      unique: false,
    }
  );
};


/* ================================
   OFFLINE NOTIFICATIONS
================================ */

const createOfflineNotificationsStore = (db) => {
  if (
    db.objectStoreNames.contains(
      "offlineNotifications"
    )
  ) {
    return;
  }

  const store = db.createObjectStore(
    "offlineNotifications",
    {
      keyPath: "_id",
    }
  );

  // Same fields as normal notifications

  store.createIndex("userId", "userId", {
    unique: false,
  });

  store.createIndex("isRead", "isRead", {
    unique: false,
  });

  store.createIndex("createdAt", "createdAt", {
    unique: false,
  });

  store.createIndex(
    "userId_createdAt",
    ["userId", "createdAt"],
    {
      unique: false,
    }
  );

  store.createIndex(
    "userId_isRead",
    ["userId", "isRead"],
    {
      unique: false,
    }
  );

  // Offline-specific fields

  store.createIndex(
    "scheduledAt",
    "scheduledAt",
    {
      unique: false,
    }
  );

  store.createIndex(
    "offline",
    "offline",
    {
      unique: false,
    }
  );

  store.createIndex(
    "userId_status",
    ["userId", "status"],
    {
      unique: false,
    }
  );
};


/* ================================
   UPCOMING EXAMS
================================ */

const createUpcomingExamsStore = (db) => {
  if (db.objectStoreNames.contains("upcomingExams")) {
    return;
  }

  const store = db.createObjectStore(
    "upcomingExams",
    {
      keyPath: "_id",
    }
  );

  // Only searchable/visible fields

  store.createIndex(
    "userId",
    "userId",
    {
      unique: false,
    }
  );
};

/* ================================
   EXAM STATS
================================ */

const createExamStatsStore = (db) => {
  if (db.objectStoreNames.contains("examStats")) {
    return;
  }

  db.createObjectStore("examStats", {
    keyPath: "userId",
  });
};


/* ================================
   OPEN DATABASE
================================ */

export function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(
      DB_NAME,
      DB_VERSION
    );

    request.onupgradeneeded = (event) => {
      const db = event.target.result;

      createUsersStore(db);
      createQuestionsStore(db);
      createSettingsStore(db);
      createHistoryStore(db);
      createImagesStore(db);
      createGamesStore(db);
      createNotificationsStore(db);
      createNotificationQueueStore(db);
      createOfflineNotificationsStore(db);
      createUpcomingExamsStore(db);
      createExamStatsStore(db)
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}