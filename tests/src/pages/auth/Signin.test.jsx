import { MemoryRouter, Routes, Route } from 'react-router'
import { vi, it, expect, describe} from 'vitest'
import UserEvent from '@testing-library/user-event'
import { render, screen, waitFor } from '@testing-library/react'
import { Signin } from '../../../../src/pages/auth/Signin';

vi.mock('@react-oauth/google', async () => {
  const actual = await vi.importActual('@react-oauth/google')

  return {
    ...actual,
    GoogleOAuthProvider: ({ children }) =>  children
  }
})

vi.mock('../../../../src/components/GoogleAuth', () => ({
  GoogleAuth: () => <button>Sign in with google</button>
}))

const mockSignin = vi.fn()

vi.mock('../../../../src/stores/authStore', () => ({
  authStore: (selector) => selector({
    signin: mockSignin
  })
}))

const mockFetchUser = vi.fn()
const mockFetchHistory = vi.fn()

vi.mock('../../../../src/stores/userStore', () => ({
  userStore: (selector) => selector({
    fetchUserInfo: mockFetchUser,
    fetchUserHistory: mockFetchHistory
  })
}))

const mockDashboardInfo = vi.fn().mockResolvedValue({
  catch: vi.fn()
})

vi.mock('../../../../src/stores/scheduledExamStore', () => ({
  scheduledExamStore: (selector) => selector({
    getDashboardInfo: mockDashboardInfo
  })
}))


import { GoogleOAuthProvider } from "@react-oauth/google";
import { GoogleAuth } from '../../../../src/components/GoogleAuth';
import { authStore } from '../../../../src/stores/authStore';
import { userStore } from '../../../../src/stores/userStore';
import { scheduledExamStore } from '../../../../src/stores/scheduledExamStore';

describe('Signin Page', () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  beforeEach(() => {
    render(
      <GoogleOAuthProvider>
        <MemoryRouter initialEntries={["/auth"]}>
          <Routes>
            <Route path="/auth" element={<Signin />}/>
          </Routes>
        </MemoryRouter>
      </GoogleOAuthProvider>
    )
  })

  it('should render the page', () => {
    expect(screen.getByText('Welcome Back')).toBeInTheDocument()
  })

  it('should display an error message when both field is empty and user tries to submit', async () => {
    const user = UserEvent.setup()
    const button = screen.getByRole('button', {
      name: 'Sign In'
    })

    await user.click(button)
    const error1 = await screen.findByText('✕ Email address is required.')
    const error2 = await screen.findByText('✕ Password is required.')
    expect(error1).toBeInTheDocument()
    expect(error2).toBeInTheDocument()
  })

  it('should not accept and invalid email', async () => {
    const user = UserEvent.setup()

    const input = screen.getByLabelText('Email Address')

    await user.type(input, 'invalidemail')

    const button = screen.getByRole('button', {
      name: 'Sign In'
    })

    await user.click(button)

    const error = await screen.findByText('✕ Enter a valid email address.')

    expect(error).toBeInTheDocument()
  })

  it('should pass validation if all inputted field matches the required citeria', async () => {
    const signin = authStore(state => state.signin)
    const fetchUserInfo = userStore(state => state.fetchUserInfo)
    const fetchUserHistory = userStore(state => state.fetchUserHistory)
    const getDashboardInfo = scheduledExamStore(state => state.getDashboardInfo)
    const user = UserEvent.setup()
    const EmailInput = screen.getByLabelText('Email Address')
    const passwordInput = screen.getByLabelText('Password')

    await user.type(EmailInput, 'test@gmail.com')
    await user.type(passwordInput, 'testpassword123')

    const button = screen.getByRole('button', {
      name: 'Sign In'
    })

    await user.click(button)

    await waitFor(() => {
      expect(signin).toHaveBeenCalled()
    })
    
    await waitFor(() => {
      expect(fetchUserInfo).toHaveBeenCalled()
    })
    
    await waitFor(() => {
      expect(fetchUserHistory).toHaveBeenCalled()
    })
    
    await waitFor(() => {
      expect(getDashboardInfo).toHaveBeenCalled()
    })
  })
  
})

