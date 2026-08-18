import { create } from 'zustand';
import { request } from '../scripts/utilis/request.js';
import { decrypt } from '../scripts/utilis/crypto.js';

export const scheduledExamStore = create((set) => ({
  stats: null,
  upcomingExams: null,
  
  /* schedule exam form */
  initialValues: null,
  
  setInitialValues: (updater) => set(state => ({
    initialValues: typeof updater === 'function'
    ? updater(state.initialValues)
    : updater
  })),
  
  getDashboardInfo: async () => {
    const res = await request.auth('/api/exam-planner/dashboard', {
      method: 'GET'
    })
    const { stats, upcomingExams } = decrypt(res.body.data)
    set({
      stats,
      upcomingExams
    })
  },
  
  saveScheduledExam: async (formData) => {
    const res = await request.auth('/api/exam-planner/exam', {
      method: 'POST',
      body: JSON.stringify(formData)
    })
    const { stats, upcomingExams } = decrypt(res.body.data)
    set({
      stats,
      upcomingExams
    })
  },
  
  saveEditedSchedule: async (editedFormData) => {
    const { _id: examId } = editedFormData;
    delete editedFormData._id
    const res = await request.auth(`/api/exam-planner/exam/${examId}`, {
      method: 'PUT',
      body: JSON.stringify(editedFormData)
    })
    const { upcomingExams } = decrypt(res.body.data)
    set({
      upcomingExams
    })
  },
  
  cancelScheduledExam: async (examId) => {
    const res = await request.auth(`/api/exam-planner/exam/status/${examId}`, {
      method: 'PUT',
      body: JSON.stringify({
        status: 'cancelled'
      })
    })
    const { stats, upcomingExams } = decrypt(res.body.data)
    set({
      stats,
      upcomingExams
    })
  }
}))