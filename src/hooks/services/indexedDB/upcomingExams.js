import { openDB } from './db';

const STORE_NAME = 'upcomingExams';


/* ================================
   ADD ONE EXAM
================================ */

export const addUpcomingExam = async (exam) => {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(
      STORE_NAME,
      'readwrite'
    );

    const store = transaction.objectStore(STORE_NAME);

    const request = store.put(exam);

    request.onsuccess = () => {
      resolve(exam);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
};


/* ================================
   ADD MULTIPLE EXAMS
================================ */

export const addUpcomingExams = async (exams) => {
  if (!Array.isArray(exams)) {
    throw new Error('Exams must be an array');
  }

  const db = await openDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(
      STORE_NAME,
      'readwrite'
    );

    const store = transaction.objectStore(STORE_NAME);

    for (const exam of exams) {
      store.put(exam);
    }

    transaction.oncomplete = () => {
      resolve(exams);
    };

    transaction.onerror = () => {
      reject(transaction.error);
    };

    transaction.onabort = () => {
      reject(
        transaction.error ||
        new Error('Transaction aborted')
      );
    };
  });
};


/* ================================
   GET ONE EXAM
================================ */

export const getUpcomingExam = async (examId) => {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(
      STORE_NAME,
      'readonly'
    );

    const store = transaction.objectStore(STORE_NAME);

    const request = store.get(examId);

    request.onsuccess = () => {
      resolve(request.result || null);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
};


/* ================================
   GET ALL EXAMS FOR USER
================================ */

export const getUserUpcomingExams = async (userId) => {
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


/* ================================
   GET EXAMS BY USER + STATUS
================================ */

export const getUserUpcomingExamsByStatus = async (
  userId,
  status
) => {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(
      STORE_NAME,
      'readonly'
    );

    const store = transaction.objectStore(STORE_NAME);

    const index = store.index('userId_status');

    const request = index.getAll([
      userId,
      status,
    ]);

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
};


/* ================================
   UPDATE ONE EXAM
================================ */

export const updateUpcomingExam = async (
  examId,
  updates
) => {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(
      STORE_NAME,
      'readwrite'
    );

    const store = transaction.objectStore(STORE_NAME);

    const getRequest = store.get(examId);

    getRequest.onsuccess = () => {
      const exam = getRequest.result;

      if (!exam) {
        reject(
          new Error('Upcoming exam not found')
        );
        return;
      }

      const updatedExam = {
        ...exam,
        ...updates,
      };

      const updateRequest =
        store.put(updatedExam);

      updateRequest.onsuccess = () => {
        resolve(updatedExam);
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


/* ================================
   DELETE ONE EXAM
================================ */

export const deleteUpcomingExam = async (examId) => {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(
      STORE_NAME,
      'readwrite'
    );

    const store = transaction.objectStore(STORE_NAME);

    const request = store.delete(examId);

    request.onsuccess = () => {
      resolve(true);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
};


/* ================================
   DELETE ALL EXAMS FOR USER
================================ */

export const deleteUserUpcomingExams = async (userId) => {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(
      STORE_NAME,
      'readwrite'
    );

    const store = transaction.objectStore(STORE_NAME);

    const index = store.index('userId');

    const request = index.openCursor(
      IDBKeyRange.only(userId)
    );

    request.onsuccess = (event) => {
      const cursor = event.target.result;

      if (!cursor) {
        return;
      }

      cursor.delete();
      cursor.continue();
    };

    transaction.oncomplete = () => {
      resolve(true);
    };

    transaction.onerror = () => {
      reject(transaction.error);
    };
  });
};


/* ================================
   DELETE EXAMS BY STATUS FOR USER
================================ */

export const deleteUserUpcomingExamsByStatus = async (
  userId,
  status
) => {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(
      STORE_NAME,
      'readwrite'
    );

    const store = transaction.objectStore(STORE_NAME);

    const index = store.index('userId_status');

    const request = index.openCursor(
      IDBKeyRange.only([userId, status])
    );

    request.onsuccess = (event) => {
      const cursor = event.target.result;

      if (!cursor) {
        return;
      }

      cursor.delete();
      cursor.continue();
    };

    transaction.oncomplete = () => {
      resolve(true);
    };

    transaction.onerror = () => {
      reject(transaction.error);
    };
  });
};


/* ================================
   DELETE ALL EXAMS
================================ */

export const deleteAllUpcomingExams = async () => {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(
      STORE_NAME,
      'readwrite'
    );

    const store = transaction.objectStore(STORE_NAME);

    const request = store.clear();

    request.onsuccess = () => {
      resolve(true);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
};