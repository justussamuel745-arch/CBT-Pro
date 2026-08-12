import { create } from 'zustand';
import { request } from '../scripts/utilis/request.js';
import { decrypt } from '../scripts/utilis/crypto.js';
import { deleteAllQuestions } from '../hooks/services/indexedDB/questions.js';
import { deleteUser } from '../hooks/services/indexedDB/users';
import pushNotificationService from '../services/pushNotificationService';

export const authStore = create(set => ({
  /*========
    STORE
  ==========*/
  token: null,
  isActivated: false,
  isAdmin: false,
  isLoading: true,

  setIsLoading: (isLoading) => set({
    isLoading
  }),

  refresh: async () => {
    const res = await request.send('/api/refresh')
    const data = decrypt(res.body.data)
    if (data?.activationExpired) {
      await deleteAllQuestions()
    }
    set({
      token: data.accessToken,
      isActivated: data.isActivated,
      isAdmin: data.isAdmin,
    })
  },

  signin: async (credentials) => {
    console.log(credentials);
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
      isActivated: data.isActivated,
      isAdmin: data.isAdmim
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
      isActivated: data.isActivated,
      isAdmin: data.isAdmim
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

    set({
      token: null
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