import { create } from 'zustand';
import { request } from '../scripts/utilis/request.js';
import { decrypt, encrypt } from '../scripts/utilis/crypto.js';
import { saveQuestions } from '../hooks/services/indexedDB/questions.js';
import { saveUser, getUser } from '../hooks/services/indexedDB/users.js';
import { saveHistory, clearHistory } from '../hooks/services/indexedDB/history.js';
import { authStore } from './authStore.js';
import { getHistory } from '../hooks/services/indexedDB/history.js';
import { submitLocalHistory } from '../scripts/utilis/submitHistory.js';

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
      ...decrypt(encrypted.info),
      blob: encrypted.blob,
      id: encrypted.id,
    };
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
  }
}))