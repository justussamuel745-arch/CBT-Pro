import { openDB } from "./db";

/*
  Save questions.
  Read questions.
  Delete questions.
  Search questions.
*/

export async function saveQuestions(questions) {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction("questions", "readwrite");

    const store = transaction.objectStore("questions");

    questions.forEach((question) => {
      store.put(question);
    });

    transaction.oncomplete = () => {
      resolve(true);
    };

    transaction.onerror = () => {
      reject(transaction.error);
    };
  });
}

export async function getQuestions(filters = {}) {
  const db = await openDB();

  const transaction = db.transaction("questions", "readonly");
  const store = transaction.objectStore("questions");

  const years = filters.years ?? [];
  const topics = filters.topics ?? [];

  const results = [];
  const seen = new Set();

  // Helper function
  const executeQuery = (indexName, key) => {
    return new Promise((resolve, reject) => {
      const index = store.index(indexName);
      const request = index.getAll(key);

      request.onsuccess = () => resolve(request.result);

      request.onerror = () => reject(request.error);
    });
  };

  // Subject + Years + Topics
  if (filters.subject && years.length && topics.length) {
    for (const year of years) {
      for (const topic of topics) {
        const questions = await executeQuery(
          "subject_year_topic",
          [filters.subject, year, topic]
        );

        for (const question of questions) {
          if (!seen.has(question.id)) {
            seen.add(question.id);
            results.push(question);
          }
        }
      }
    }

    return results;
  }

  // Subject + Years
  if (filters.subject && years.length) {
    for (const year of years) {
      const questions = await executeQuery(
        "subject_year",
        [filters.subject, year]
      );

      for (const question of questions) {
        if (!seen.has(question.id)) {
          seen.add(question.id);
          results.push(question);
        }
      }
    }

    return results;
  }

  // Subject only
  if (filters.subject) {
    return executeQuery("subject", filters.subject);
  }

  // Years only
  if (years.length) {
    for (const year of years) {
      const questions = await executeQuery("year", year);

      for (const question of questions) {
        if (!seen.has(question.id)) {
          seen.add(question.id);
          results.push(question);
        }
      }
    }

    return results;
  }

  // Topics only
  if (topics.length) {
    for (const topic of topics) {
      const questions = await executeQuery("topic", topic);

      for (const question of questions) {
        if (!seen.has(question.id)) {
          seen.add(question.id);
          results.push(question);
        }
      }
    }

    return results;
  }

  // Get all questions
  return new Promise((resolve, reject) => {
    const request = store.getAll();

    request.onsuccess = () => resolve(request.result);

    request.onerror = () => reject(request.error);
  });
}

/*
  GET ALL PHYSICS QUESTIONS
  await getQuestions({
    subject: "Physics",
  });

  GET ALL 2025 QUESTIONS
  await getQuestions({
    years: [2025],
  });

  GET PHYSICS 2025 QUESTIONS
  await getQuestions({
    subject: "Physics",
    years: [2025],
  });

  GET PHYSICS QUESTIONS FOR MULTIPLE YEARS
  await getQuestions({
    subject: "Physics",
    years: [2023, 2024, 2025],
  });

  GET PHYSICS 2025 QUESTIONS FOR A SPECIFIC TOPIC
  await getQuestions({
    subject: "Physics",
    years: [2025],
    topics: ["Motion"],
  });

  GET PHYSICS QUESTIONS FOR MULTIPLE YEARS AND MULTIPLE TOPICS
  await getQuestions({
    subject: "Physics",
    years: [2023, 2024, 2025],
    topics: ["Motion", "Electricity"],
  });

  GET ALL MOTION QUESTIONS
  await getQuestions({
    topics: ["Motion"],
  });

  GET QUESTIONS FOR MULTIPLE TOPICS
  await getQuestions({
    topics: ["Motion", "Electricity"],
  });

  GET ALL QUESTIONS
  await getQuestions();
*/

export async function deleteAllQuestions() {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction("questions", "readwrite");

    const store = transaction.objectStore("questions");

    const request = store.clear();

    request.onsuccess = () => {
      resolve(true);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}