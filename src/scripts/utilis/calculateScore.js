export function calculateScore(userId, examQuestions, answers, timeTaken, timeAllocated) {
  let bookmarks = JSON.parse(localStorage.getItem('bookmarks')) || []
  const subjectStats = {};

  let totalCorrect = 0;
  let totalQuestions = 0;

  // Calculate correct answers per subject
  answers.forEach(({ id, subject, userAnswers, isBookmarked }) => {
    const question = examQuestions.find((q) => q.id === id);

    if (!question) return;
    
    if (isBookmarked){
      bookmarks = bookmarks.filter(bmk => bmk.id !== id )
      bookmarks.push({
        userId,
        ...question
      })
      localStorage.setItem('bookmarks', JSON.stringify(bookmarks));
    }

    if (!subjectStats[subject]) {
      subjectStats[subject] = {
        obtained: 0,
        total: 0,
      };
    }

    subjectStats[subject].total++;
    totalQuestions++;

    const userAnswer = userAnswers.join("");
    const correctAnswers = [...question.correctAnswers].sort();

    if (correctAnswers.includes(userAnswer)) {
      subjectStats[subject].obtained++;
      totalCorrect++;
    }
  });

  // Calculate percentage for each subject
  const performance = {};

  Object.entries(subjectStats).forEach(([subject, { obtained, total }]) => {
    performance[subject] = Math.round((obtained / total) * 100);
  });

  // Calculate overall score
  const obtained = Object.values(performance).reduce(
    (sum, score) => sum + score,
    0
  );

  return {
    message: "Exam submitted successfully",
    examType: "JAMB",
    subjects: Object.keys(subjectStats),

    score: {
      obtained,
      over: Object.keys(subjectStats).length * 100,
    },

    percentage: totalQuestions
      ? Math.round((totalCorrect / totalQuestions) * 100)
      : 0,

    performance,
    timeTaken,
    timeAllocated,
  };
}