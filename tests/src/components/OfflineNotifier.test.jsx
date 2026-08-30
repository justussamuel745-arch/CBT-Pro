import { it, expect, describe, vi } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import { OfflineNotifier } from '../../../src/components/OfflineNotifier';

const {
  mockSetNotifications,
  mockSetUnreadCount,
  mockUpcomingExams,
  mockScheduledExamStore,
  mockAddOfflineNotifications
} = vi.hoisted(() => ({
  mockSetNotifications: vi.fn(),
  mockSetUnreadCount: vi.fn(),
  mockUpcomingExams: vi.fn(),
  mockScheduledExamStore: vi.fn(),
  mockAddOfflineNotifications: vi.fn()
}))

vi.mock('../../../src/context/NotificationContext', () => ({
  useNotifications: vi.fn()
}))

vi.mock('../../../src/stores/authStore', () => ({
  authStore: (selector) => selector({
    token: 'access_token'
  })
}))


vi.mock('../../../src/stores/userStore', () => ({
  userStore: vi.fn()
}))

vi.mock('../../../src/stores/scheduledExamStore', () => ({
  scheduledExamStore: {
    getState: vi.fn(),
    setState: vi.fn()
  }
}))

vi.mock('../../../src/hooks/services/indexedDB/offlineNotifications', () => ({
  getOfflineNotification: vi.fn(),
  addOfflineNotification: mockAddOfflineNotifications
}))

vi.mock('../../../src/services/pushNotificationService', () => ({
  default: {
    showNotification: vi.fn().mockResolvedValue({
      catch: vi.fn()
    })
  }
}))

import { useNotifications } from '../../../src/context/NotificationContext'
import { authStore } from '../../../src/stores/authStore';
import { userStore } from '../../../src/stores/userStore';
import { scheduledExamStore } from '../../../src/stores/scheduledExamStore';
import { getOfflineNotification, addOfflineNotification } from '../../../src/hooks/services/indexedDB/offlineNotifications';
import pushNotificationService from '../../../src/services/pushNotificationService';

useNotifications.mockReturnValue({
  setNotifications: mockSetNotifications,
  setUnreadCount: mockSetUnreadCount
})


describe('OfflineNotifier Components', () => {
  afterEach(() => {
    vi.clearAllMocks()
  
  })

  const createScheduledExam = (overides = {}) => {
    return {
      _id: 'test_exam1_id',
      name: 'Test Exam',
      subjects: ['English'],
      duration: 120,
      targetScrore: 60,
      examDate: new Date(Date.now() + 1000 * 60 * 60 * 60 * 20).toISOString(),
      reminder: '1d',
      status: 'scheduled',
      reminderSent: false,
      ...overides
    }
  }

  const createUserInfo = (overides = {}) => {
    return {
      _id: 'test_user_id',
      notificationSettings: {
        reminder: true
      },
      ...overides
    }
  }

  it('should not set up the interval if there is no user', () => {
    userStore.mockImplementation((selector) => selector({
      userInfo: null
    }))

    const spy = vi.spyOn(globalThis, 'setInterval')

    render(<OfflineNotifier />)
    expect(spy).not.toHaveBeenCalled()

    spy.mockRestore()
  })

  it('should set up timer interval', () => {
    userStore.mockImplementation(selector => selector({
      userInfo: createUserInfo()
    }))

    scheduledExamStore.getState.mockReturnValue({
      upcomingExams: [createScheduledExam()]
    })

    const spy = vi.spyOn(globalThis, 'setInterval')
    render(<OfflineNotifier />)
    expect(spy).toHaveBeenCalled()

    spy.mockRestore()
  })

  it('should not send notification if it has not approach the reminder date', () => {
    const { setNotifications } = useNotifications()
    
    userStore.mockImplementation(selector => selector({
      userInfo: createUserInfo()
    }))

    scheduledExamStore.getState.mockReturnValue({
      upcomingExams: [createScheduledExam({
        examDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 5).toISOString()
      })]
    })

    render(<OfflineNotifier />)


    expect(addOfflineNotification).not.toHaveBeenCalled()
    expect(setNotifications).not.toHaveBeenCalled()
  })

  it('should send a notification immediately it approaches the exam date', async () => {
    const { setNotifications } = useNotifications()
    
    userStore.mockImplementation(selector => selector({
      userInfo: createUserInfo()
    }))

    scheduledExamStore.getState.mockReturnValue({
      upcomingExams: [createScheduledExam({
        examDate: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString()
      })]
    })


    render(<OfflineNotifier />)
    
    await waitFor(() => {
      expect(addOfflineNotification).toHaveBeenCalled()
    })
    expect(setNotifications).toHaveBeenCalled()
  })
})