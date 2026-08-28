import { create } from 'zustand';
import { decrypt } from '../scripts/utilis/crypto.js';
import { request } from '../scripts/utilis/request.js';
import { userStore } from './userStore.js';
import { examStore } from './examStore.js';
import {
  getOfflineNotifications,
  deleteOfflineNotification,
  updateOfflineNotification
} from '../hooks/services/indexedDB/offlineNotifications.js';

const validateField = (form) => {
  const acceptedFields = [
    'name',
    'examDate',
    'subjects',
    'duration',
    'targetScore',
    'difficulty',
    'shuffle',
    'reminder',
    'reminderSent',
    'notes',
    'timeZone'
  ]

  const bodyObj = {}


  Object.keys(form)
    .filter(key => acceptedFields.includes(key))
    .forEach(key => {
      bodyObj[ key ] = form[ key ]
    })

  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  Object.assign(bodyObj, { timeZone })

  return bodyObj
}

export const scheduledExamStore = create((set, get) => ({
  stats: null,

  upcomingExams: null,

  missedExams: null,

  historyStats: null,

  history: null,

  achievements: null,

  submissionRequirement: null,

  setUpcomingExams: (updater) => set(state => ({
    upcomingExams: typeof updater === 'function'
      ? updater(state.upcomingExams)
      : updater
  })),

  setMissedExams: (updater) => set(state => ({
    missedExams: typeof updater === 'function'
      ? updater(state.missedExams)
      : updater
  })),

  setHistoryStats: (updater) => set(state => ({
    historyStats: typeof updater === 'function'
      ? updater(state.historyStats)
      : updater
  })),

  setHistory: (updater) => set(state => ({
    history: typeof updater === 'function'
      ? updater(state.history)
      : updater
  })),

  setAchievements: (updater) => set(state => ({
    achievements: typeof updater === 'function'
      ? updater(state.achievements)
      : updater
  })),

  getDashboardInfo: async () => {
    const userId = userStore.getState().userInfo?._id
    try {
      const unsyncOfflineNotifications = await getOfflineNotifications(userId)
      const unsyncExamIds = unsyncOfflineNotifications || unsyncOfflineNotifications.length
        ? unsyncOfflineNotifications
          .filter(n => n.status === 'pending')
          .map(n => n._id)
        : []
      if (unsyncExamIds.length > 0) {
        const res = await request.auth('/api/exam-planner/exam/reminder', {
          method: 'POST',
          body: JSON.stringify({
            examIds: unsyncExamIds
          })
        })

        const { invalidIds, validIds } = res.body
        if (invalidIds.length > 0) {
          for (const invalidId of invalidIds) {
            await deleteOfflineNotification(invalidId)
          }
        } else if (validIds.length > 0) {
          for (const validId of validIds) {
            await updateOfflineNotification(validId, {
              status: 'synced'
            })
          }
        }

      }
    } catch (error) {
      console.log(error)
    }

    const res = await request.auth('/api/exam-planner/dashboard', {
      method: 'GET'
    });
    const { stats, upcomingExams, missedExams } = decrypt(res.body.data);
    set({
      stats,
      upcomingExams,
      missedExams
    });
  },

  onChangeStatus: async (examId, status) => {
    const res = await request.auth(`/api/exam-planner/exam/status/${examId}`, {
      method: 'PUT',
      body: JSON.stringify({
        status
      })
    })

    const { stats, upcomingExams } = decrypt(res.body.data)

    set({
      stats,
      upcomingExams
    })
  },

  saveScheduledExam: async (form) => {

    const res = await request.auth('/api/exam-planner/exam', {
      method: 'POST',
      body: JSON.stringify(validateField(form))
    })
    const { stats, upcomingExams } = decrypt(res.body.data)
    set({
      stats,
      upcomingExams
    })

  },

  saveEditedSchedule: async (form, query = "") => {
    const res = await request.auth(`/api/exam-planner/exam/${form._id}${query}`, {
      method: 'PUT',
      body: JSON.stringify(validateField(form))
    })
    const { upcomingExams } = decrypt(res.body.data)
    set({
      upcomingExams
    })
  },

  getExamQuestions: async (reqData) => {
    const res = await request.auth('/api/exam/scheduled', {
      method: 'POST',
      body: JSON.stringify({
        ...reqData,
        subjects: reqData.subjects.map(s => s.name ?? null).filter(Boolean)
      })
    })

    const examId = res.body.examId
    const questions = decrypt(res.body.questions)

    set({
      submissionRequirement: {
        examId,
        startedAt: new Date().toISOString(),
      }
    })

    examStore.setState({
      examQuestions: questions
    })

    return questions
  },

  submitScheduledExam: async (timeSpent, navigate) => {
    const { examId, startedAt } = get().submissionRequirement
    const completedAt = new Date().toISOString()
    const answers = examStore.getState().answers
    const questions = examStore.getState().examQuestions

    const retrySubmission = get().retrySubmission

    const submissionRequirement = {
      examId,
      startedAt,
      completedAt,
      answers,
      questions
    }
    try {
      const res = await request.auth('/api/exam-planner/exam/submit', {
        method: 'POST',
        body: JSON.stringify(submissionRequirement)
      })
      const { attempt: result } = res.body
      navigate('/exam-planner/result', {
        state: {
          result
        }
      })
      set({
        stats: result.stats,
        upcomingExams: result.upcomingExams,
        submissionRequirement: null
      })
    } catch (error) {
      console.log(error)
      if (!navigator.onLine) {
        examStore.setState({
          offline: {
            onRetry: retrySubmission,
            text: {
              online: 'You are now connected to the internet. Please tap the button below to submit your exam.',
              offline: 'It looks like you are offline. Please check your internet connection and try submitting again.',
            }
          }
        })
      } else {
        examStore.setState({
          loadError: {
            title: 'Submission Failed',
            message: 'We encountered an issue while submitting your exam. Please check your connection and try again. If the problem persists, please let us know.',
            onRetry: retrySubmission,
            homeTo: "/feedback",
            homeLabel: "Send Feedback",
          }
        })
      }

      set({
        submissionRequirement
      })
      
    }
  },

  retrySubmission: async (navigate) => {
    const submissionRequirement = get().submissionRequirement
    try {
      const res = await request.auth('/api/exam-planner/exam/submit', {
        method: 'POST',
        body: JSON.stringify(submissionRequirement)
      })
      const { attempt: result } = res.body
      navigate('/exam-planner/result', {
        state: {
          result
        }
      })
      set({
        submissionRequirement: null
      })
    } catch (error) {
      console.log(error)
    }
  }

}));