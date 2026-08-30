import { MemoryRouter, Routes, Route } from 'react-router';
import { it, expect, describe, vi } from 'vitest';
import UserEvent from '@testing-library/user-event';
import { screen, render, waitFor } from '@testing-library/react';

import Delete from '../../../src/pages/Delete';


const {
  mockGoogleLogin,
  mockLogout,
  mockUserStore,
  mockRequestAuth
} = vi.hoisted(() => ({
  mockGoogleLogin: vi.fn(),
  mockLogout: vi.fn(),
  mockUserStore: vi.fn(),
  mockRequestAuth: vi.fn()
}))


vi.mock('@react-oauth/google', () => ({
  GoogleLogin: mockGoogleLogin
}))

vi.mock('../../../src/stores/authStore', () => ({
  authStore: selector => selector({
    logout: mockLogout
  })
}))

vi.mock('../../../src/stores/userStore', () => ({
  userStore: mockUserStore
}))

vi.mock('react-hot-toast', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
    dismiss: vi.fn()
  }
}))

vi.mock('../../../src/scripts/utils/request', () => ({
  request: {
    auth: mockRequestAuth
  }
}))

vi.mock('../../../src/hooks/services/indexedDB/users', () => ({
  deleteUser: vi.fn()
}))


import { GoogleOAuthProvider } from "@react-oauth/google";
import { GoogleLogin } from "@react-oauth/google";
import { authStore } from '../../../src/stores/authStore';
import { userStore } from '../../../src/stores/userStore';
import { request } from '../../../src/scripts/utils/request';
import { deleteUser } from '../../../src/hooks/services/indexedDB/users'
import { toast } from 'react-hot-toast';



describe('Delete Account Page', () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('Local User', () => {
    beforeEach(() => {
      mockUserStore.mockImplementation(selector => selector({
        userInfo: {
          _id: 'test_user_id',
          authProvider: 'local',
        }
      }))
      
      render(
        <MemoryRouter>
          <Delete />
        </MemoryRouter>
      )
    })

    afterAll(() => {
      vi.resetAllMocks()
    })
    
    it('should show the password input if user sign up with password', () => {
      const pwdInput = screen.getByLabelText('Enter your password to confirm')
      const google = screen.queryByText('Verify Account')
      expect(pwdInput).toBeInTheDocument()
      expect(google).not.toBeInTheDocument()
    })

    it('should keep the button disabled if all the field is not filled in', async () => {
      const user = UserEvent.setup()

      const pwdInput = screen.getByLabelText('Enter your password to confirm')

      await user.type(pwdInput, 'testpassword')

      const deleteBtn = screen.getByRole('button', {
        name: 'Delete Account'
      })

      expect(deleteBtn.disabled).toBe(true)
    })

    it('should successfully delete the user', async () => {
      const user = UserEvent.setup()
      const pwdInput = screen.getByLabelText('Enter your password to confirm')

      await user.type(pwdInput, 'testpassword')

      const checkBox = screen.getByLabelText('I understand this is permanent and I want to delete my CBT Pro account and all associated data')

      await user.click(checkBox)

      const deleteBtn= screen.getByRole('button', {
        name: 'Delete Account'
      })

      await user.click(deleteBtn)

      const deleteBtnModal = screen.getByRole('button', {
        name: 'Delete account'
      })

      await user.click(deleteBtnModal)

      await waitFor(() => {
        expect(request.auth).toHaveBeenCalled()
      })

      const logout = authStore(state => state.logout)

      expect(logout).toHaveBeenCalled()
    })
  })

  describe('Google User', () => {
    beforeEach(() => {
      mockUserStore.mockImplementation(selector => selector({
        userInfo: {
          _id: 'test_user_id',
          authProvider: 'google',
        }
      }))
    })

    it('should show the google verification for google user', () => {
      mockGoogleLogin.mockImplementation(({ onSuccess, onError }) => {
        return (
          <button onClick={() => onSuccess({
            credentials: 'google_token'
          })}>
            Verify Account
          </button>
        )
      })
      
      render(
        <MemoryRouter>
          <Delete />
        </MemoryRouter>
      )
  
      const google = screen.getByRole('button', {
        name: 'Verify Account'
      })
      const input = screen.queryByLabelText('Enter your password to confirm')
  
      expect(google).toBeInTheDocument()
      expect(input).not.toBeInTheDocument()
    })

    it('should inform the user for failed verification', async () => {
    mockGoogleLogin.mockImplementation(({  onError }) => {
      return (
        <button onClick={() => onError()}>
          Verify Account
        </button>
      )
    })

    const user = UserEvent.setup()
    
    render(
      <MemoryRouter>
        <Delete />
      </MemoryRouter>
    )

    const googleButton = screen.getByRole('button', {
      name: 'Verify Account'
    })

    await user.click(googleButton)

    const error = screen.getByText('Google verification failed. Please try again.')

    expect(error).toBeInTheDocument()
    
  })

  it('should display success message  after successful verification', async () => {
    mockGoogleLogin.mockImplementation(({ onSuccess, onError }) => {
      return (
        <button onClick={() => onSuccess({
          credential: 'google_token'
        })}>
          Verify Account
        </button>
      )
    })
    mockRequestAuth.mockResolvedValue(null)
    const user = UserEvent.setup()
    
    render(
      <MemoryRouter initialEntries={["/delete"]}>
        <Routes>
          <Route path="/delete" element={<Delete />}/>
          <Route path="/auth/signup" element={<div>Sign up page</div>}/>
        </Routes>
      </MemoryRouter>
    )

    const googleButton = screen.getByRole('button', {
      name: 'Verify Account'
    })

    await user.click(googleButton)

    expect(toast.success).toHaveBeenCalled()
    expect(screen.getByText('✓ Google account verified')).toBeInTheDocument()
  })

  it('should delete the users account after successful verification and they click the delete button', async () => {
    mockGoogleLogin.mockImplementation(({ onSuccess, onError }) => {
      return (
        <button onClick={() => onSuccess({
          credential: 'google_token'
        })}>
          Verify Account
        </button>
      )
    })
    mockRequestAuth.mockResolvedValue(null)
    const user = UserEvent.setup()
    
    render(
      <MemoryRouter initialEntries={["/delete"]}>
        <Routes>
          <Route path="/delete" element={<Delete />}/>
          <Route path="/auth/signup" element={<div>Sign up page</div>}/>
        </Routes>
      </MemoryRouter>
    )

    const googleButton = screen.getByRole('button', {
      name: 'Verify Account'
    })

    await user.click(googleButton)

    const deleteBtn = screen.getByRole('button', {
      name: 'Delete Account'
    })

    await user.click(deleteBtn)

    const modalBtn = screen.getByRole('button', {
      name: 'Delete account'
    })

    await user.click(modalBtn)

    await waitFor(() => {
      expect(request.auth).toHaveBeenCalled()
    })

    const text = await screen.findByText('Sign up page')

    expect(text).toBeInTheDocument()
  
    
  })
  
  })
})