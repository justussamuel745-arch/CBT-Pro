import { getQuestions } from "./indexedDB//questions";
import { shuffleArray } from '../../scripts/utils/shuffle.js';
import { authStore } from '../../stores/authStore.js';

/*
  ONE SUBJECT
  await getRandomQuestions([
    {
      subject: "Physics",
      amount: 40,
    },
  ]);

  MULTIPLE SUBJECTS
  await getRandomQuestions([
    {
      subject: "Use of English",
      amount: 60,
    },
    {
      subject: "Physics",
      amount: 40,
    },
    {
      subject: "Chemistry",
      amount: 40,
    },
    {
      subject: "Mathematics",
      amount: 40,
    },
  ]);
*/

export async function getRandomQuestions(subjects) {
  const isActivated = authStore.getState()?.isActivated;

  // 1. Fetch ALL subjects in parallel — IndexedDB loves this
  const allResults = await Promise.all(
    subjects.map(async ({ subject, amount }) => {
      const subjectQuestions = await getQuestions({ subject });
      return { subject, amount, subjectQuestions };
    })
  );

  const questions = [];
  const insufficientSubjects = [];

  // 2. Process after fetch (no await here, just CPU work)
  for (const { subject, amount, subjectQuestions } of allResults) {
    if (!isActivated) {
      const sorted = [...subjectQuestions].sort((a, b) => Number(a.year) - Number(b.year));
      const selected = sorted.slice(0, Math.min(amount, sorted.length));
      questions.push(...shuffleArray(selected));
    } else {
      const shuffled = shuffleArray([...subjectQuestions]);
      const selected = shuffled.slice(0, Math.min(amount, shuffled.length));
      questions.push(...selected);
    }

    if (subjectQuestions.length < amount) {
      insufficientSubjects.push({
        subject,
        requested: amount,
        available: subjectQuestions.length,
        missing: amount - subjectQuestions.length,
      });
    }
  }

  return { questions, insufficientSubjects };
}