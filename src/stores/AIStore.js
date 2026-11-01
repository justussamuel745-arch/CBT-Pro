import { create } from 'zustand';
import { explainQuestion } from '@lib/api/aiApi.js';
import { saveCurrentUser } from '@lib/db/users.js';
import { authStore } from './authStore.js';
import { userStore } from './userStore.js';

export const AIStore = create(set => ({
  /*========
    STORE
  ==========*/
  chatMessages: [{
    id: crypto.randomUUID(),
    sender: 'AI',
    message: "Hi there! I'm Astra 👋 I can explain CBT questions, break down topics, or quiz you. What should we study today?",
  }],

  aiExplanations: [],

  /*========
    ACTION
  ==========*/
  setChatMessages: (updater) => set((state) => (
    {
      chatMessages:
        typeof updater === 'function'
          ? updater(state.chatMessages)
          : updater,
    })
  ),

  setAiExplanations: (updater) => set((state) => (
    {
      aiExplanations: 
        typeof updater === 'function'
          ? updater(state.aiExplanations)
          : updater
    })
  ),

  onAskAI: async ({ questionId, message }) => {
    const { userInfo } = userStore.getState()
    const { token } = authStore.getState()
    if (!token) throw new Error('No token found')

    const data = await explainQuestion({ questionId, message })

    const nextUserInfo = { ...userInfo, aiCredits: data.creditsLeft }
    userStore.setState({
      userInfo: nextUserInfo
    })
    await saveCurrentUser(nextUserInfo, token)

    return data.answer
  }
}))
