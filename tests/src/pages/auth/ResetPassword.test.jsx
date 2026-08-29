import { MemoryRouter, Routes, Route } from 'react-router'
import { vi, it, expect, describe} from 'vitest'
import UserEvent from '@testing-library/user-event'
import { render, screen, waitFor } from '@testing-library/react'
import { ResetPassword } from '../../../../src/pages/auth/ResetPassword';


const resetPasswordMock = vi.fn().mockResolvedValue()

vi.mock('../../../../src/stores/authStore', () => ({
  authStore: vi.fn((selector) => selector({
    resetPassword: resetPasswordMock
  }))
}))

import { authStore } from '../../../../src/stores/authStore';

vi.mock('react-hot-toast', () => ({
  toast: {
    success: vi.fn(),
    dismiss: vi.fn()
  }
}))

import { toast } from 'react-hot-toast'



describe('ResetPassword Page', () => {
  describe('Params Token Validation', () => {
    it('should navigate user away if there is no token', async () => {
      render(
        <MemoryRouter initialEntries={["/auth/reset-password"]}>
          <Routes>
            <Route path="/auth/reset-password" element={<ResetPassword />} />
            <Route path="/auth/forgot-password" element={<h2>Forgot Password Page</h2>} />
          </Routes>
        </MemoryRouter>
      )

      const heading = await screen.findByText('Forgot Password Page')

      expect(heading).toBeInTheDocument()
      
    })

    it('should render the page if there is token in params', () => {
      render(
        <MemoryRouter initialEntries={["/auth/reset-password?token=testToken123"]}>
          <Routes>
            <Route path="/auth/reset-password" element={<ResetPassword />} />
            <Route path="/auth/forgot-password" element={<h2>Forgot Password Page</h2>} />
          </Routes>
        </MemoryRouter>
      )

      expect(screen.getByText('Set New Password')).toBeInTheDocument()
      
    })
  })

  describe('Page Interaction', () => {
    beforeEach(() => {
      render(
        <MemoryRouter initialEntries={["/auth/reset-password?token=testToken123"]}>
          <Routes>
            <Route path="/auth/reset-password" element={<ResetPassword />} />
            <Route path="/auth/forgot-password" element={<h2>Forgot Password Page</h2>} />
            <Route path="/auth" element={<h2>Sign In Page</h2>} />
          </Routes>
        </MemoryRouter>
      )
    })

    it('should not proceed with request if the required input details in not provided or mismatch', async () => {
      const resetPassword = authStore(state => state.resetPassword)
      const user = UserEvent.setup()
      const button = screen.getByRole('button', {
        name: 'Reset Password'
      })

      await user.click(button)

      await waitFor(() => {
        expect(resetPassword).not.toHaveBeenCalled()
      })

      const input1 = screen.getByLabelText('New Password')
      const input2 = screen.getByLabelText('Confirm Password')

      await user.type(input1, 'testchangepwd')
      await user.type(input2, 'testchangepwdmismatch')

      await user.click(button)

      await waitFor(() => {
        expect(resetPassword).not.toHaveBeenCalled()
      })
    })

    it('should remove the form and nav container on successful request and perform the right success operation', async () => {
      const user = UserEvent.setup()

      const resetPassword = authStore(state => state.resetPassword)
      
      const input1 = screen.getByLabelText('New Password')
      const input2 = screen.getByLabelText('Confirm Password')

      await user.type(input1, 'testchangepwd')
      await user.type(input2, 'testchangepwd')

      const button = screen.getByRole('button', {
        name: 'Reset Password'
      })

      await user.click(button)

      await waitFor(() => {
        expect(resetPassword).toHaveBeenCalled()
      })

      const reqData = {
        token: 'testToken123',
        newPassword: 'testchangepwd'
      }

      await waitFor(() => {
        expect(resetPassword).toHaveBeenCalledWith(reqData)
      })

      expect(toast.success).toHaveBeenCalled()

      expect(screen.getByTestId('form-container')).not.toBeVisible()
      const successTitle = await screen.findByText('Password Reset!')
      expect(successTitle).toBeInTheDocument()
      
    })


    it('should display the sign in button and navigate the user when clicked', async () => {
      const resetPassword = authStore(state => state.resetPassword)
      const user = UserEvent.setup()
  
      const input1 = screen.getByLabelText('New Password')
      const input2 = screen.getByLabelText('Confirm Password')
  
      await user.type(input1, 'testchangepwd')
      await user.type(input2, 'testchangepwd')
  
      const button = screen.getByRole('button', {
        name: 'Reset Password'
      })
  
      await user.click(button)
  
      const successButton = await screen.findByRole('button', {
        name: 'Sign In'
      })
  
      expect(successButton).toBeInTheDocument()
      
      await user.click(successButton)
  
      const newPageHeading = await screen.findByText('Sign In Page')
  
      expect(newPageHeading).toBeInTheDocument()
    })
  })
  
})