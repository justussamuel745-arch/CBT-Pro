import { create } from 'zustand';
import * as authApi from '@lib/api/authApi.js';
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

  /*========
    ACTION
  ==========*/
  refresh: async () => {
    try {
      // check if there's any session in indexedDB first
      const existingSession = await getUser()
      if (!existingSession){
        throw new Error('No existing session. Sign in required.')
      }
      const session = await authApi.refreshSession()
      if (session?.activationExpired) {
        await deleteAllQuestions()
      }
      set({
        token: session.accessToken,
        isActivated: session.isActivated
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
    const session = await authApi.signIn(credentials)

    if (session?.activationExpired) {
      await deleteAllQuestions()
    }

    if (import.meta.env.VITE_ENV === 'production'){
      await pushNotificationService.enable(session.accessToken)
    }
    set({
      token: session.accessToken,
      isActivated: session.isActivated
    })
  },

  googleAuth: async (credentialResponse) => {
    const session = await authApi.signInWithGoogle(credentialResponse.credential)
    set({
      token: session.accessToken,
      isActivated: session.isActivated
    })
  },

  signup: (credentials) => authApi.signUp(credentials),

  logout: async () => {
    await Promise.all([
      authApi.signOut(),
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

  forgotPassword: (credentials) => authApi.requestPasswordReset(credentials),

  resetPassword: (credentials) => authApi.resetPassword(credentials)
}))
