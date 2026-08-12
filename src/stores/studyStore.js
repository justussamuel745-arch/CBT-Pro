import { create } from 'zustand';

export const studyStore = create(set => ({
  /*========
    STORE
  ==========*/
  studyConfig: {},
  
  /*========
    ACTION
  ==========*/
  setStudyConfig: (studyConfig) => set({
    studyConfig
  })
}))