import { create } from 'zustand';
import * as examApi from '@lib/api/scheduledExamApi.js';
import { fetchScheduledExamQuestions } from '@lib/api/questionsApi.js';
import { getErrorMessage } from '@lib/api/errors.js';
import { userStore } from './userStore.js';
import { examStore } from './examStore.js';
import {
  getOfflineNotifications,
  deleteOfflineNotification,
  updateOfflineNotification
} from '@lib/db/offlineNotifications.js';
import { toast } from 'react-hot-toast';

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

// Stores a successfully submitted attempt, opens the result page and
// refreshes the exam history in the background.
const finishSubmission = (set, get, result, navigate) => {
  set({
    stats: result.stats,
    upcomingExams: result.upcomingExams,
    submissionRequirement: null
  })

  examStore.setState({
    submissionStep: 4 // done
  })

  navigate('/exam-planner/result', {
    state: {
      result
    }
  })

  get().fetchScheduledExamHistory().catch((err) => {
    toast.error(getErrorMessage(err, 'Failed to update exam history.'))
  })
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
      const offlineNotifications = (await getOfflineNotifications(userId)) ?? []
      const unsyncExamIds = offlineNotifications
        .filter(n => n.status === 'pending')
        .map(n => n._id)

      if (unsyncExamIds.length > 0) {
        const { invalidIds, validIds } = await examApi.syncExamReminders(unsyncExamIds)
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

    const { stats, upcomingExams, missedExams } = await examApi.fetchDashboard()
    set({
      stats,
      upcomingExams,
      missedExams
    });
  },

  onChangeStatus: async (examId, status) => {
    const { stats, upcomingExams } = await examApi.updateExamStatus(examId, status)

    set({
      stats,
      upcomingExams
    })
  },

  saveScheduledExam: async (form) => {
    const { stats, upcomingExams } = await examApi.createExam(validateField(form))
    set({
      stats,
      upcomingExams
    })
  },

  saveEditedSchedule: async (form, query = "") => {
    const { upcomingExams } = await examApi.updateExam(form._id, validateField(form), query)
    set({
      upcomingExams
    })
  },

  getExamQuestions: async (reqData) => {
    const { examId, questions } = await fetchScheduledExamQuestions(reqData)

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

  fetchScheduledExamHistory: async () => {
    const {
      historyStats,
      history: historyData,
      achievements: achievementsData,
    } = await examApi.fetchExamHistory()

    set({
      historyStats,
      history: Array.isArray(historyData)
        ? historyData
        : [],
      achievements: Array.isArray(achievementsData)
        ? achievementsData
        : []
    })
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
      const result = await examApi.submitExamAttempt(submissionRequirement)

      finishSubmission(set, get, result, navigate)
    } catch{
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
      const result = await examApi.submitExamAttempt(submissionRequirement)
      examStore.setState({
        offline: null,
        loadError: null
      })

      finishSubmission(set, get, result, navigate)
    } catch (error) {
      console.log(error)
    }
  }

}));
