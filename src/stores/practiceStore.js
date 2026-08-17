import { create } from 'zustand';
import { authStore } from './authStore.js';
import { userStore } from './userStore.js';
import { encrypt, decrypt } from '../scripts/utilis/crypto.js';
import { submitHistory } from '../scripts/utilis/submitHistory';

export const practiceStore = create((set, get) => ({
  /*========
    STORE
  ==========*/
  examConfig: null,
  examQuestions: [],
  answers: [],
  examResults: null,

  /*========
    ACTION
  ==========*/
  setExamConfig: (examConfig) => {
    set({
      examConfig
    })
  },
  setExamQuestions: (examQuestions) => set({
    examQuestions
  }),

  setAnswers: (updater) => set(state => ({
    answers: typeof updater === 'function'
      ? updater(state.answers)
      : updater
  })),

  setExamResults: (examResults) => set({
    examResults
  }),

  getQuesNo: (event) => {
    const subName = event.target.dataset.subname;
    let qsNo = Number(event.target.value);
    const { isActivated } = authStore.getState()
    if (!isActivated) {
      if (subName === 'English') {
        qsNo = 60
      } else {
        qsNo = 40
      }
    }

    set(state => ({
      examConfig: {
        ...state.examConfig,
        subjects: state.examConfig.subjects.map(sub =>
          sub.name === subName ? { ...sub, qsNo } : sub
        )
      }
    }))
  },

  setHours: (event) => {
    set(state => ({
      examConfig: {
        ...state.examConfig,
        hours: Number(event.target.value)
      }
    }))
  },

  setMinutes: (event) => {
    set(state => ({
      examConfig: {
        ...state.examConfig,
        minutes: Number(event.target.value)
      }
    }))
  },

  calculateScore: (examQuestions, timeTaken, timeAllocated) => {
    const userId = userStore.getState().userInfo?._id
    const { answers } = get()
    const bookmarksRaw = JSON.parse(localStorage.getItem('bookmarks'))
    let bookmarks = bookmarksRaw ? decrypt(bookmarksRaw) : []
    const subjectStats = {};

    let totalCorrect = 0;
    let totalQuestions = 0;

    // Calculate correct answers per subject
    answers.forEach(({ id, subject, userAnswers, isBookmarked }) => {
      const question = examQuestions.find((q) => q.id === id);

      if (!question) return;

      if (isBookmarked) {
        bookmarks = bookmarks.filter(bmk => bmk.id !== id)
        bookmarks.push({
          userId,
          ...question
        })
        localStorage.setItem('bookmarks', JSON.stringify(encrypt(bookmarks)));
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
    const result =  {
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
    
    set({
      examResults: result
    })

    submitHistory(result)
  }

}))