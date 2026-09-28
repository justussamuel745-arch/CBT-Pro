import { openDB } from "./db";
import { encrypt, decrypt } from '../../../scripts/utils/crypto.js';
import { shuffleArray } from '../../../scripts/utils/shuffle.js';

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
      store.put({
        ...question,
        question: encrypt(question.question),
        options: encrypt(question.options),
        image: encrypt(question.image),
        correctAnswers: encrypt(question.correctAnswers),
        explanation: encrypt(question.explanation)
      });
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
  const shuffle = Boolean(filters.shuffle) 

  const results = [];
  const seen = new Set();

  // Helper function
  const executeQuery = (indexName, key) => {
    return new Promise((resolve, reject) => {
      const index = store.index(indexName);
      const request = index.getAll(key);
      
      request.onsuccess = () =>
        resolve(
          request?.result?.map(q =>
            ({
              ...q,
              question: decrypt(q.question),
              options: decrypt(q.options),
              image: decrypt(q.image),
              correctAnswers: decrypt(q.correctAnswers),
              explanation: decrypt(q.explanation)
            })
          )
        )

      request.onerror = () => reject(request.error);
    });
  };

  // Subject + Years + Topics
  if (filters.subject && years.length && topics.length) {
    for (const year of years) {
      for (const topic of topics) {
        const questions = await executeQuery(
          "subject_year_topic",
          [ filters.subject, year, topic ]
        );

        for (const question of questions) {
          if (!seen.has(question.id)) {
            seen.add(question.id);
            results.push(question);
          }
        }
      }
    }

    console.log(results)

    return shuffle ? shuffleArray(results) : results;
  }

  // Subject + Years
  if (filters.subject && years.length) {
    for (const year of years) {
      const questions = await executeQuery(
        "subject_year",
        [ filters.subject, year ]
      );

      for (const question of questions) {
        if (!seen.has(question.id)) {
          seen.add(question.id);
          results.push(question);
        }
      }
    }

    return shuffle ? shuffleArray(results) : results;
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

    return shuffle ? shuffleArray(results) : results;
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

    return shuffle ? shuffleArray(results) : results;
  }

  // Get all questions
  return new Promise((resolve, reject) => {
    const request = store.getAll();
    request.onsuccess = () => resolve(
      request.result.map(q =>
      ({
        ...q,
        question: decrypt(q.question),
        options: decrypt(q.options),
        image: decrypt(q.image),
        correctAnswers: decrypt(q.correctAnswers),
        explanation: decrypt(q.explanation)
      })
      )
    );

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

export async function loadQuestionsInBackground(
  filters = {},
  {
    limit = Infinity,
    signal,
    onQuestion,
    onComplete,
    onError
  } = {}
) {
  try {
    const db = await openDB();

    if (signal?.aborted) return

    const shuffle = Boolean(filters.shuffle);

    const years = shuffle ? shuffleArray(filters.years ?? []) : filters.years;
    const topics = shuffle ? shuffleArray(filters.topics ?? []) : filters.topics;

    const seen = new Set();
    const questions = [];

    const decryptQuestion = (q) => ({
      ...q,
      question: decrypt(q.question),
      options: decrypt(q.options),
      image: decrypt(q.image),
      correctAnswers: decrypt(q.correctAnswers),
      explanation: decrypt(q.explanation)
    });

    // The IDB request finishes fast; once its results are in memory we no
    // longer touch IndexedDB, so it's safe to await the UI callbacks here.
    const processQuestions = (request) =>
      new Promise((resolve, reject) => {
        request.onsuccess = async () => {
          try {
            let results = request.result ?? [];
            if (shuffle) results = shuffleArray(results);

            for (const rawQuestion of results) {
              if (signal?.aborted || questions.length >= limit) break;
              if (seen.has(rawQuestion.id)) continue;
              seen.add(rawQuestion.id);

              const question = decryptQuestion(rawQuestion);
              questions.push(question);

              if (onQuestion) await onQuestion(question, questions.length);
            }
            resolve();
          } catch (error) {
            reject(error);
          }
        };
        request.onerror = () => reject(request.error);
      });

    const queries = [];

    if (filters.subject && years.length && topics.length) {
      for (const year of years)
        for (const topic of topics)
          queries.push({ index: "subject_year_topic", key: [filters.subject, year, topic] });
    } else if (filters.subject && years.length) {
      for (const year of years)
        queries.push({ index: "subject_year", key: [filters.subject, year] });
    } else if (filters.subject) {
      queries.push({ index: "subject", key: filters.subject });
    } else if (years.length) {
      for (const year of years) queries.push({ index: "year", key: year });
    } else if (topics.length) {
      for (const topic of topics) queries.push({ index: "topic", key: topic });
    } else {
      queries.push({ store: true });
    }

    const shuffledQueries = shuffle ? shuffleArray(queries) : queries

    for (const query of shuffledQueries) {
      if (signal?.aborted || questions.length >= limit) break;

      // Fresh transaction per query, created synchronously right before use.
      const store = db.transaction("questions", "readonly").objectStore("questions");
      const request = query.store
        ? store.getAll()
        : store.index(query.index).getAll(query.key);

      await processQuestions(request);
    }

    if (signal?.aborted) return questions;

    if (onComplete) await onComplete(questions);
    return questions;
  } catch (error) {
    if (onError) onError(error);
    throw error;
  }
}

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