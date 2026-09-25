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
  const questions = [];
  const insufficientSubjects = [];

  const isActivated = authStore.getState()?.isActivated

  for (const { subject, amount } of subjects) {
    const subjectQuestions = await getQuestions({
      subject,
    });

    if (!isActivated){
      const sortedQuestions = subjectQuestions.sort((a, b) => Number(a.year) - Number(b.year))
      const selectedQuestions = sortedQuestions.slice(
        0,
        Math.min(amount, sortedQuestions.length)
      );

      const shuffled = shuffleArray([...selectedQuestions]);

      questions.push(...shuffled)
    } else {

      const shuffled = shuffleArray([...subjectQuestions]);

      const selectedQuestions = shuffled.slice(
        0,
        Math.min(amount, shuffled.length)
      );

      questions.push(...selectedQuestions)
    }
    
    // Record subjects with insufficient questions
    if (subjectQuestions.length < amount) {
      insufficientSubjects.push({
        subject,
        requested: amount,
        available: subjectQuestions.length,
        missing: amount - subjectQuestions.length,
      });
    }
  }

  console.log(questions)

  return {
    questions,
    insufficientSubjects,
  };
}
