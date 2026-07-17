import { openDB } from "./db";

// Save thousands of questions
export async function saveGameQuestions(questions) {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction("games", "readwrite");
    const store = transaction.objectStore("games");

    questions.forEach(question => {
      store.put(question);
    });

    transaction.oncomplete = () => resolve(true);
    transaction.onerror = () => reject(transaction.error);
  });
}


export async function getGameQuestions({
  subject,
  league,
  level,
}) {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction("games", "readonly");
    const store = transaction.objectStore("games");

    let request;

    if (subject && league && level !== undefined) {
      request = store
        .index("subject_league_level")
        .getAll([subject, league, level]);
    } else if (subject && league) {
      request = store
        .index("subject_league")
        .getAll([subject, league]);
    } else if (subject) {
      request = store
        .index("subject")
        .getAll(subject);
    } else {
      request = store.getAll();
    }

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function hasGameQuestions() {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction("games", "readonly");
    const store = transaction.objectStore("games");

    const request = store.count();

    request.onsuccess = () => {
      resolve(request.result > 0);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}