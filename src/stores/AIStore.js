import { create } from 'zustand';
import { request } from '../scripts/utils/request.js';
import { saveUser } from '../hooks/services/indexedDB/users.js';
import { encrypt, decrypt } from '../scripts/utils/crypto.js';
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

    const res = await request.auth('/api/ai/explain', {
      method: 'POST',
      body: JSON.stringify({
        questionId: questionId ?? undefined,
        question: message,
      }),
    })

    const data = decrypt(res.body.reply)

    let nextUserInfo = { ...userInfo, aiCredits: data.creditsLeft };
    userStore.setState({
      userInfo: nextUserInfo
    })

    const blob = nextUserInfo.blob
    delete nextUserInfo.blob
    const encryptedInfo = {
      ...nextUserInfo,
      accessToken: token
    }
    await saveUser({
      "info": encrypt(encryptedInfo),
      blob,
      id: 'current-user'
    })

    return data.answer
  }
}))