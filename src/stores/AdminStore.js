import { create } from 'zustand';
import { request } from '../scripts/utils/request.js';

export const adminStore = create((set, get) => ({
  /*========
    STORE
  ==========*/
  users: [],
  payments: [],
  feedbacks: [],
  loading: true,
  page: 'users',
  
  /*========
    ACTION
  ==========*/
  setUsers: (users) => set({
    users
  }),
  
  setFeedbacks: (feedbacks) => set({
    feedbacks
  }),
  
  setLoading: (loading) => set({
    loading
  }),
  
  setPage: (page) => set({
    page
  }),
  
  fetchUsers: async () => {
    const response = await request.auth('/api/users', {
      method: 'GET'
    })
    const data = response.body;
    set({
      users: data
    })
  },
  
  fetchPayments: async () => {
    const response = await request.auth('/api/payment/records', {
      method: 'GET'
    })
    const data = response.body
    set({
      payments: data
    })
  },
  
  fetchFeedbacks: async () => {
    const response = await request.auth('/api/feedback/all', {
      method: 'GET'
    })
    const data = response.body
    set({
      feedbacks: data
    })
  },
  
  stats: () => {
    const { feedbacks } = get()
    return {
      total: feedbacks.length,
      unread: feedbacks.filter(i => !i.read).length,
      bugs: feedbacks.filter(i => i.type === 'Technical Issues').length,
      requests: feedbacks.filter(i => i.type === 'Business').length,
    }
  }
}))