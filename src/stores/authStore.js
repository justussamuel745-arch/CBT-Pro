import { create } from 'zustand';
import { request } from '@lib/api/request.js';
import { decrypt } from '@lib/utils/crypto.js';
import { deleteAllQuestions } from '@lib/db/questions.js';
import { getUser, deleteUser } from '@lib/db/users';
import { userStore } from './userStore.js';
import pushNotificationService from '@/services/pushNotificationService';

export const authStore = create(set => ({
  /*========
    STORE
  ==========*/
  token: null,
  isActivated: false,
  isLoading: true,

  refresh: async () => {
    try {
      // check if there's any session in indexedDB first
      const existingSession = await getUser()
      if (!existingSession){
        throw new Error('No existing session. Sign in required.')
      }
      const res = await request.send('/api/refresh', {
        method: 'GET',
        credentials: 'include'
      })
      const data = decrypt(res.body.data)
      if (data?.activationExpired) {
        await deleteAllQuestions()
      }
      set({
        token: data.accessToken,
        isActivated: data.isActivated
      })
    } catch (err){
      if (err.status){
        await deleteUser()
      }
      const newError = new Error('Error refreshing session')
      newError.status = err.status
      throw newError
    }
  },

  signin: async (credentials) => {
    const res = await request.send('/api/auth', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(credentials)
    });

    const data = decrypt(res.body.data)
    if (data?.activationExpired) {
      await deleteAllQuestions()
    }
    
    if (import.meta.env.VITE_ENV === 'production'){
      await pushNotificationService.enable(data.accessToken)
    }
    set({
      token: data.accessToken,
      isActivated: data.isActivated
    })
  },

  googleAuth: async (credentialResponse) => {
    const res = await request.send('/api/auth/google', {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ token: credentialResponse.credential })
    })
    const data = decrypt(res.body.data)
    set({
      token: data.accessToken,
      isActivated: data.isActivated
    })
  },

  signup: async (credentials) => {
    await request.send('/api/register', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(credentials)
    })

  },

  logout: async () => {
    await Promise.all([
      request.send('/api/logout'),
      deleteUser()
    ])

    userStore.setState({
      userId: null,
      userInfo: null,
      profileFields: {},
      historyData: null
    })

    set({
      token: null,
      isActivated: false
    })
  },
  
  forgotPassword: async (credentials) => {
    await request.send('/api/password/forgot-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify(credentials)
    })
  },
  
  resetPassword: async (credentials) => {
    await request.send('/api/password/reset-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify(credentials)
    })
  }
}))