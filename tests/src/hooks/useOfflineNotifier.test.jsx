import { it, expect, describe, vi, afterEach } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import { useOfflineNotifier } from '@/hooks/useOfflineNotifier';

const {
  mockSetNotifications,
  mockSetUnreadCount,
  mockAddOfflineNotifications
} = vi.hoisted(() => ({
  mockSetNotifications: vi.fn(),
  mockSetUnreadCount: vi.fn(),
  mockAddOfflineNotifications: vi.fn()
}));

vi.mock('@/context/NotificationContext', () => ({
  useNotifications: vi.fn()
}));

vi.mock('@/stores/authStore', () => ({
  authStore: (selector) => selector({
    token: 'access_token'
  })
}));

vi.mock('@/stores/userStore', () => ({
  userStore: vi.fn()
}));

vi.mock('@/stores/scheduledExamStore', () => ({
  scheduledExamStore: {
    getState: vi.fn(),
    setState: vi.fn()
  }
}));

vi.mock('@lib/db/offlineNotifications', () => ({
  getOfflineNotification: vi.fn(),
  addOfflineNotification: mockAddOfflineNotifications
}));

vi.mock('@/services/pushNotificationService', () => ({
  default: {
    showNotification: vi.fn().mockResolvedValue(undefined)
  }
}));

import { useNotifications } from '@/context/NotificationContext';
import { userStore } from '@/stores/userStore';
import { scheduledExamStore } from '@/stores/scheduledExamStore';
import {
  getOfflineNotification,
  addOfflineNotification
} from '@lib/db/offlineNotifications';
import pushNotificationService from '@/services/pushNotificationService';

useNotifications.mockReturnValue({
  setNotifications: mockSetNotifications,
  setUnreadCount: mockSetUnreadCount
});

const TestComponent = () => {
  useOfflineNotifier();
  return null;
};

describe('useOfflineNotifier', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  const createScheduledExam = (overrides = {}) => {
    return {
      _id: 'test_exam1_id',
      name: 'Test Exam',
      subjects: ['English'],
      duration: 120,
      targetScore: 60,
      examDate: new Date(
        Date.now() + 1000 * 60 * 60 * 60 * 20
      ).toISOString(),
      reminder: '1d',
      status: 'scheduled',
      reminderSent: false,
      ...overrides
    };
  };

  const createUserInfo = (overrides = {}) => {
    return {
      _id: 'test_user_id',
      notificationSettings: {
        reminder: true
      },
      ...overrides
    };
  };

  it('should not set up the interval if there is no user', () => {
    userStore.mockImplementation((selector) =>
      selector({
        userInfo: null
      })
    );

    const spy = vi.spyOn(globalThis, 'setInterval');

    render(<TestComponent />);

    expect(spy).not.toHaveBeenCalled();

    spy.mockRestore();
  });

  it('should set up timer interval', () => {
    userStore.mockImplementation((selector) =>
      selector({
        userInfo: createUserInfo()
      })
    );

    scheduledExamStore.getState.mockReturnValue({
      upcomingExams: [createScheduledExam()]
    });

    const spy = vi.spyOn(globalThis, 'setInterval');

    render(<TestComponent />);

    expect(spy).toHaveBeenCalled();

    spy.mockRestore();
  });

  it('should not send notification if it has not approached the reminder date', async () => {
    userStore.mockImplementation((selector) =>
      selector({
        userInfo: createUserInfo()
      })
    );

    scheduledExamStore.getState.mockReturnValue({
      upcomingExams: [
        createScheduledExam({
          examDate: new Date(
            Date.now() + 1000 * 60 * 60 * 24 * 5
          ).toISOString()
        })
      ]
    });

    render(<TestComponent />);

    await waitFor(() => {
      expect(addOfflineNotification).not.toHaveBeenCalled();
      expect(mockSetNotifications).not.toHaveBeenCalled();
    });
  });

  it('should send a notification immediately it approaches the exam date', async () => {
    userStore.mockImplementation((selector) =>
      selector({
        userInfo: createUserInfo()
      })
    );

    scheduledExamStore.getState.mockReturnValue({
      upcomingExams: [
        createScheduledExam({
          examDate: new Date(
            Date.now() + 1000 * 60 * 60 * 24
          ).toISOString()
        })
      ]
    });

    getOfflineNotification.mockResolvedValue(null);
    addOfflineNotification.mockResolvedValue(undefined);

    render(<TestComponent />);

    await waitFor(() => {
      expect(addOfflineNotification).toHaveBeenCalled();
    });

    expect(mockSetNotifications).toHaveBeenCalled();
    expect(mockSetUnreadCount).toHaveBeenCalled();
    expect(
      pushNotificationService.showNotification
    ).toHaveBeenCalled();
  });
});