import { create } from 'zustand';

export const examStore = create(set => ({
  /*========
    STORE
  ==========*/
  examConfig: null,
  examQuestions: [],
  answers: [],

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
  }))
}))