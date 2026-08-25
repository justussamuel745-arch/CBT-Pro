import { create } from 'zustand';
import { request } from '../scripts/utilis/request.js';
import { decrypt, encrypt } from '../scripts/utilis/crypto.js';
import { saveQuestions } from '../hooks/services/indexedDB/questions.js';
import { saveUser, getUser } from '../hooks/services/indexedDB/users.js';
import { saveHistory, clearHistory, getHistory } from '../hooks/services/indexedDB/history.js';
import { getUserUpcomingExams, deleteUpcomingExam } from '../hooks/services/indexedDB/upcomingExams.js';
import { getExamStats } from '../hooks/services/indexedDB/examStats.js';
import { authStore } from './authStore.js';
import { scheduledExamStore } from './scheduledExamStore.js';
import { submitLocalHistory } from '../scripts/utilis/submitHistory.js';
import { addMinutes } from '../scripts/utilis/dateTimeOp';
import { showNotification } from '../services/offlineNotificationService.js';

export const userStore = create(set => ({
  /*========
    STORE
  ==========*/
  userInfo: null,
  profileFields: {},
  historyData: null,


  /*========
    ACTION
  ==========*/
  setUserInfo: (updater) => set((state) => ({
    userInfo: 
      typeof updater === 'function'
        ? updater(state.userInfo)
        : updater
  })),
  
  setProfileFields: (updater) => set((state) => ({
    profileFields: 
      typeof updater === 'function'
        ? updater(state.profileFields)
        : updater
  })),
  
  setHistoryData: (updater) => set(state => ({
    historyData: typeof updater === 'function'
      ? updater(state.historyData)
      : updater
  })),
  
  fetchUserInfo: async () => {
    const res = await request.auth('/api/settings', {
      method: 'GET',
    })
    const data = decrypt(res.body.data)
    if (data?.pendingClientUpdates && data.pendingClientUpdates.length >= 1) {
      const qs = data.pendingClientUpdates.map(q =>
      ({
        ...q,
        correctAnswers: encrypt(q.correctAnswers),
        explanation: encrypt(q.explanation)
      })
      )
      await saveQuestions(qs)
      delete data.pendingClientUpdates
    }

    let blob;
    try {
      if (data?.profileUrl) {
        const res = await fetch(data.profileUrl)
        if (!res.ok) {
          throw new Error(`Failed to load profile pic: ${res.status}`)
        }
        blob = await res.blob();
      }
    } catch (err) {
      console.error(err)
    }
    const token = authStore.getState().token

    await saveUser({
      "info": encrypt({
        ...data,
        accessToken: token
      }),
      blob: blob,
      id: 'current-user'
    })

    set({
      userInfo: {
        ...data,
        blob: blob,
        id: 'current-user'
      },
      profileFields: {
        fullName: data.fullName || '',
        phoneNumber: data.phoneNumber || '',
        targetExam: data.targetExam || 'JAMB UTME 2027',
        targetScore: data.targetScore || '',
      }
    })
  },

  fetchUserHistory: async () => {
    await submitLocalHistory()
    const res = await request.auth('/api/history', {
      method: 'GET',
    })
    const data = res.body

    if (res.status === 204) {
      await clearHistory()
      set({
        historyData: []
      })
      return
    }

    await Promise.all([
      clearHistory(),
      saveHistory(data)
    ])

    set({
      historyData: data
    })
  },

  loadCachedUser: async () => {
    const encrypted = await getUser();
    if (!encrypted || Object.keys(encrypted).length === 0) {
      authStore.setState({
        isLoading: false
      })
      return;
    }

    const user = {
      blob: encrypted.blob,
      id: encrypted.id,
    };
    const info = decrypt(encrypted.info)
    Object.assign(user, info)
    
    if (user.isActivated && new Date().toISOString() > user.expiresAt){
      user.isActivated = false
      user.expiresAt = null
      info.isActivated = false
      info.expiresAt = null
      await saveUser({
        ...encrypted,
        "info": encrypt(info),
      })
    }
    
    const accessToken = user.accessToken;
    delete user.accessToken;

    authStore.setState({
      token: accessToken,
      isActivated: user.isActivated,
      isLoading: false
    })

    const userHistory = await getHistory(user?._id);

    set({
      userInfo: user,
      profileFields: {
        fullName: user?.fullName || '',
        phoneNumber: user?.phoneNumber || '',
        targetExam: user?.targetExam || 'JAMB UTME 2027',
        targetScore: user?.targetScore || '',
      },
      historyData: userHistory
    })
    
    try {
      let hashedUpcomingExams = await getUserUpcomingExams(user._id)
      const hashedStats = await getExamStats(user._id)
      const stats = {
        ...decrypt(hashedStats.data),
      }
      if (!hashedUpcomingExams || hashedUpcomingExams?.length === 0) return
      const upcomingExams = [];
      for (const exam of hashedUpcomingExams){
        const { data, _id, userId } = exam
        const unhashed = {
          _id,
          userId
        }
        Object.assign(unhashed, decrypt(data))
        const now = new Date().toISOString()
        if (addMinutes(unhashed?.examDate, 40) <= now){
          await deleteUpcomingExam(unhashed._id)
          stats.upcoming --
          await showNotification({
            title: 'Scheduled Exam Missed',
            body: `Your scheduled exam "${exam.name}" has been marked as missed because it was not completed within 40 minutes of its scheduled time. No performance score was recorded for this attempt. Staying consistent with your scheduled exams helps you measure your progress, identify weak areas, and see how close you are to your target score. Keep your next exam on schedule and use each completed attempt as an opportunity to improve your performance.`,
          })
          continue
        }
        upcomingExams.push(unhashed)
      }
      
      scheduledExamStore.setState({
        isFirstOfflineLoad: true,
        upcomingExams,
        stats
      })
    } catch (err) {
      console.error('Error:', err);
    }
  }
}))