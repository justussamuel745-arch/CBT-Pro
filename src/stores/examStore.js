import { create } from 'zustand';

export const examStore = create(set => ({
  /*========
    STORE
  ==========*/
  examConfig: null,
  examQuestions: [],
  answers: [],
  offline: null,
  loadError: null,

  /*========
    ACTION
  ==========*/
  setExamConfig: (updater) => {
    set(state => ({
      examConfig: typeof updater === 'function'
       ? updater(state.examConfig)
       : updater
    }))
  },
  
  setExamQuestions: (examQuestions) => set({
    examQuestions
  }),

  setAnswers: (updater) => set(state => ({
    answers: typeof updater === 'function'
      ? updater(state.answers)
      : updater
  })),
  
  setOffline: (offline) => set({
    offline
  }),
  
  setLoadError: (loadError) => set({
    loadError
  })
}))