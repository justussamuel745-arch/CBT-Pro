import { MemoryRouter } from 'react-router'
import { vi, it, expect, describe } from 'vitest'
import UserEvent from '@testing-library/user-event'
import { render, screen } from '@testing-library/react'
import { ForgotPassword } from '../../../../src/pages/auth/ForgotPassword';

vi.mock('../../../../src/stores/authStore', () => ({
  authStore: vi.fn((selector) => selector({
    forgotPassword: vi.fn().mockResolvedValue()
  }))
}))
import { authStore } from '../../../../src/stores/authStore';


describe('ForgotPassword Page', () => {
  beforeEach(() => {
    render(
      <MemoryRouter>
        <ForgotPassword />
      </MemoryRouter>
    )
  })

  
  it('should render the page', () => {
    expect(screen.getByText('Forgot Password?')).toBeInTheDocument()
  })

  it('should show the success page after a successful request', async () => {
    const user = UserEvent.setup()
    const button = screen.getByRole('button', {
      name: 'Send Reset Link'
    })
    expect(button).toBeInTheDocument()

    const input = screen.getByLabelText('Email Address')

    await user.type(input, 'test@gmail.com')
    
    await user.click(button)
    expect(screen.queryByTestId('forgot-psssword-form')).not.toBeInTheDocument()
    expect(screen.getByTestId('success-container').classList.contains('show')).toBe(true)
  })
})