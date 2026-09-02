import { it, expect, describe, vi } from 'vitest';
import { MemoryRouter, Routes, Route } from 'react-router';
import UserEvent from '@testing-library/user-event';
import { render, screen, act, waitFor } from '@testing-library/react';

import { GoogleAuth } from '../../../src/components/GoogleAuth';

const {
  mockGoogleLogin,
  mockFetchUserInfo,
  mockFetchUserHistory,
  mockGetDashboardInfo,
  mockGoogleAuth,
  mockToastPush
} = vi.hoisted(() => ({
  mockGoogleLogin: vi.fn(),
  mockFetchUserInfo: vi.fn(() => 'default'),
  mockFetchUserHistory: vi.fn(),
  mockGetDashboardInfo: vi.fn(),
  mockGoogleAuth: vi.fn(),
  mockToastPush: vi.fn()
}))

vi.mock('../../../src/stores/authStore', () => ({
  authStore: vi.fn(selector => selector({
    googleAuth: mockGoogleAuth
  }))
}))

vi.mock('../../../src/stores/userStore', () => ({
  userStore: vi.fn(selector => selector({
    fetchUserInfo: mockFetchUserInfo,
    fetchUserHistory: mockFetchUserHistory
  }))
}))

vi.mock('../../../src/stores/scheduledExamStore', () => ({
  scheduledExamStore: vi.fn(selector => selector({
    getDashboardInfo: mockGetDashboardInfo
  }))
}))

vi.mock('../../../src/pages/auth/Signin', () => ({
  useToast: vi.fn(() => ({
    push: mockToastPush
  }))
}))

vi.mock('@react-oauth/google', () => ({
  GoogleLogin: mockGoogleLogin
}))


import { GoogleLogin } from "@react-oauth/google";
import { useToast } from '../../../src/pages/auth/Signin';
import { authStore } from '../../../src/stores/authStore';
import { userStore } from '../../../src/stores/userStore';
import { scheduledExamStore } from '../../../src/stores/scheduledExamStore';

describe('Google Auth', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should inform the user on Google auth failure', async () => {
    mockGoogleLogin.mockImplementation(( { onError } ) => {
      return (
        <button onClick={onError}>
          Continue with Google
        </button>
      )
    })

    const user = UserEvent.setup()
    const spy = vi.spyOn(console, 'log')

    render(
      <MemoryRouter>
        <GoogleAuth />
      </MemoryRouter>
    )

    const button = screen.getByRole('button', {
      name: 'Continue with Google'
    })

    await user.click(button)

    const toast = useToast()

    expect(spy).toHaveBeenCalledWith('Google Auth Failed')
    expect(toast.push).toHaveBeenCalledWith({
      type: 'error',
      title: 'Google sign-in cancelled',
      message: 'The Google sign-in window was closed or failed to load. Please try again.',
    })
    spy.mockRestore()
  })

  it('should display the loading state in the google button when running the onSuccess', async () => {
    mockGoogleLogin.mockImplementation(( { onSuccess } ) => {
      return (
        <button onClick={onSuccess}>
          Continue with Google
        </button>
      )
    })
    mockGoogleAuth.mockImplementationOnce(() => new Promise(() => {}))

    const user = await UserEvent.setup()

    render(
      <MemoryRouter>
        <GoogleAuth />
      </MemoryRouter>
    )

    const button = screen.getByRole('button', {
      name: 'Continue with Google'
    })

    await user.click(button)
    await waitFor(() => {
      expect(screen.getByTestId('google-loading')).toBeInTheDocument()
    })
      
    expect(screen.queryByText('Continue with Google')).not.toBeInTheDocument()
  })

  it('should not run getDashboardInfo if fetchUserInfo fails', async () => {
    mockFetchUserInfo.mockImplementationOnce(() => {
      throw new Error('Test Error')
    })

    mockGoogleLogin.mockImplementation(( { onSuccess } ) => {
      return (
        <button onClick={onSuccess}>
          Continue with Google
        </button>
      )
    })

    const user = await UserEvent.setup()

    render(
      <MemoryRouter>
        <GoogleAuth />
      </MemoryRouter>
    )

    const button = screen.getByRole('button', {
      name: 'Continue with Google'
    })

    await user.click(button)
    const getDashboardInfo = scheduledExamStore(state => state.getDashboardInfo)
    expect(getDashboardInfo).not.toHaveBeenCalled()
    
  })

  it('should attempt all function as long as neither throws an error', async () => {
    mockGoogleLogin.mockImplementation(( { onSuccess } ) => {
      return (
        <button onClick={onSuccess}>
          Continue with Google
        </button>
      )
    })

    const user = await UserEvent.setup()

    render(
      <MemoryRouter>
        <GoogleAuth />
      </MemoryRouter>
    )

    const button = screen.getByRole('button', {
      name: 'Continue with Google'
    })

    await user.click(button)

    const googleAuth = authStore(state => state.googleAuth)
    const { fetchUserInfo, fetchUserHistory } = userStore(state => state)
    const getDashboardInfo = scheduledExamStore(state => state.getDashboardInfo)
    expect(googleAuth).toHaveBeenCalled()
    expect(fetchUserInfo).toHaveBeenCalled()
    expect(fetchUserHistory).toHaveBeenCalled()
    expect(getDashboardInfo).toHaveBeenCalled()
    
  })

  it('should navigate the user after googleAuth was successful despise any other one failing', async () => {
    mockGoogleLogin.mockImplementation(( { onSuccess } ) => {
      return (
        <button onClick={onSuccess}>
          Continue with Google
        </button>
      )
    })

    mockFetchUserHistory.mockRejectedValue('Mock Error')
    const user = await UserEvent.setup()
    render(
      <MemoryRouter initialEntries={["/auth"]}>
        <Routes>
          <Route path="/auth" element={<GoogleAuth />} />
          <Route index element={<div>Welcome to CBT Pro</div>} />
        </Routes>
      </MemoryRouter>
    )

    const button = screen.getByRole('button', {
      name: 'Continue with Google'
    })

    await user.click(button)

    expect(screen.getByText('Welcome to CBT Pro')).toBeInTheDocument()
    
  })
})