import { useState, useRef } from 'react';
import { useSearchParams, Link, Navigate, useNavigate } from 'react-router';
import { toast } from 'react-hot-toast';
import { Message } from '../../components/Message';
import { authStore } from '../../stores/authStore';
import './ResetPassword.css';

export function ResetPassword() {
  const resetPassword = authStore(state => state.resetPassword)
  const navigate = useNavigate()
  const [formData, setFormData] = useState({ password: '', confirmPassword: '' })
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const [searchParams] = useSearchParams();
  const resetToken = searchParams.get("token");

  const btnElementRef = useRef(null)
  const formElementRef = useRef(null)
  const navRef = useRef(null)

  async function resetPwd(event) {
    event.preventDefault()
    const { password, confirmPassword } = formData;
    
    if (!password) {
      setError({
        field: 'password',
        message: 'Password Required'
      })
      return
    } else if (!confirmPassword || password.trim() !== confirmPassword.trim()) {
      setError({
        field: 'confirmPassword',
        message: 'Password do not match'
      })
      return
    } else if (password.length < 6) {
      setError({
        field: 'password',
        message: 'Password must have a minimum of 6 characters'
      })
      return
    }
    

    const buttonElement = btnElementRef.current
    buttonElement.disabled = true
    buttonElement.innerHTML = '<span className="reset-spinner"></span>Resetting...'

    const reqData = {
      token: resetToken,
      newPassword: formData.password
    }

    try {
      await resetPassword(reqData)
      formElementRef.current.style.display = 'none'
      navRef.current.style.display = 'none'
      toast.success('Password Reset!')
      setSuccess(true)
    } catch (err) {
      if (!err.status) {
        toast.error("Couldn't connect to server.");
      } else {
        toast.error(err.error)
      }
      btnElementRef.current.disabled = false
      btnElementRef.current.textContent = 'Reset Password'
    }
  }

  if (!resetToken) {
    return <Navigate to="/auth/forgot-password" />
  }
  
  return (
    <>
      <title>Reset Password - CBT Pro</title>

      <nav>
        <div className="nav-container" ref={navRef}>
          <div className="nav-content">
            <Link to="/" onClick={() => toast.dismiss()} className="logo">CBT Pro</Link>
          </div>
        </div>
      </nav>
      
      <div className="reset-wrapper" ref={formElementRef} data-testid="form-container">
        <div className="reset-card">

          <div>
            <div className="reset-header">
              <div className="reset-icon">🔐</div>
              <h1 className="reset-title">Set New Password</h1>
              <p className="reset-subtitle">Enter a strong password you haven’t used before.</p>
            </div>

            <form className="reset-form" onSubmit={resetPwd}>
              <input type="hidden" value={resetToken} />

              <div className="reset-group">
                <label className="reset-label" htmlFor="newPassword">New Password</label>
                <input
                  type="password"
                  id="newPassword"
                  className={`reset-input ${error && error.field === 'password' && 'error'}`}
                  placeholder="Min 6 characters"
                  minLength="6"
                  autoComplete="new-password"
                  onChange={(event) => {
                    setFormData(prev => prev && { ...prev, password: event.target.value })
                    setError(null)
                  }}
                />
                <span className="reset-hint">Use 6+ chars with letters, numbers & symbols</span>
                <span className={`reset-error ${error && error.field === 'password' && 'show'}`}>{error?.message}</span>
              </div>

              <div className="reset-group">
                <label className="reset-label" htmlFor="confirmPassword">Confirm Password</label>
                <input
                  type="password"
                  id="confirmPassword"
                  className={`reset-input ${error && error.field === 'confirmPassword' && 'error'}`}
                  placeholder="Re-enter password"
                  autoComplete="new-password"
                  onChange={(event) => {
                    setFormData(prev => prev && { ...prev, confirmPassword: event.target.value })
                    setError(null)
                  }}
                />
                <span className={`reset-error ${error && error.field === 'confirmPassword' && 'show'}`}>{error?.message}</span>
              </div>

              <button type="submit" className="reset-btn" ref={btnElementRef}>
                Reset Password
              </button>
            </form>
          </div>
        </div>
      </div>
      
      {
        success && <Message title="Password Reset!" message="Your password has been updated successfully. You can now login with your new password." action={() => {
          toast.dismiss()
          navigate('/auth/')
        }} btnLabel="Sign In" />
      }
    </>
  )
}
