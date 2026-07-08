import { getQuestions } from "./indexedDB//questions";

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

  for (const { subject, amount } of subjects) {
    const subjectQuestions = await getQuestions({
      subject,
    });

    // Fisher-Yates Shuffle
    const shuffled = [...subjectQuestions];

    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));

      [shuffled[i], shuffled[j]] = [
        shuffled[j],
        shuffled[i],
      ];
    }

    const selectedQuestions = shuffled.slice(
      0,
      Math.min(amount, shuffled.length)
    );

    // Keep subjects in the same order they were requested
    questions.push(...selectedQuestions);

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

  return {
    questions,
    insufficientSubjects,
  };
}
