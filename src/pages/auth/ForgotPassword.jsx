import { useState, useRef } from 'react';
import { Link } from 'react-router';
import { toast } from 'react-hot-toast';
import { authStore } from '../../stores/authStore';
import './ForgotPassword.css'

export function ForgotPassword() {
  const forgotPassword = authStore(state => state.forgotPassword)
  const [email, setEmail] = useState('')
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const formElementRef = useRef(null)
  const btnElementRef = useRef(null)

  async function requestNewPassword(event) {
    event.preventDefault()
    if (!email) {
      setError('Email required')
      return
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())){
      setError('Enter a valid email address')
      return
    }

    const buttonElement = btnElementRef.current
    buttonElement.disabled = true
    buttonElement.innerHTML = '<span className="forget-spinner"></span>Sending...'
    try {
      await forgotPassword({ email })
      const formElement = formElementRef.current
      formElement.style.display = 'none'
      toast.success('Reset link sent')
      setSuccess(true)
    } catch (err) {
      if (!err.status){
        toast.error("Couldn't connect to the server")
      } else {
        toast.error(err.error)
      }

      btnElementRef.current.disabled = false
      btnElementRef.current.textContent = 'Send Reset Link'
    }
    
  }
  return (
    <>
      <title>Forgot Password - CBT Pro</title>

      <nav>
        <div className="nav-container">
          <div className="nav-content">
            <Link to="/" onClick={() => toast.dismiss()} className="logo">CBT Pro</Link>
          </div>
        </div>
      </nav>

      <div className="forget-wrapper">
        <div className="forget-card">
          <div id="forgetFormState" data-testid="forget-password-form" ref={formElementRef}>
            <div className="forget-header">
              <div className="forget-icon">🔒</div>
              <h1 className="forget-title">Forgot Password?</h1>
              <p className="forget-subtitle">No worries. Enter your email and we’ll send you reset instructions.</p>
            </div>

            <form className="forget-form" onSubmit={requestNewPassword}>
              <div className="forget-group">
                <label className="forget-label" htmlFor="email">Email Address</label>
                <input
                  className="forget-input"
                  id="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  onChange={(event) => { setEmail(event.target.value); setError(null) }}
                />
                <span className={`forget-error ${error && 'show'}`}>{error}</span>
              </div>

              <button type="submit" className="forget-btn" ref={btnElementRef}>
                Send Reset Link
              </button>
            </form>

            <div className="forget-back">
              Remember your password? <Link to="/auth">Back to Login</Link>
            </div>
          </div>

          {/* Success State */}
          <div className={`forget-success ${success && 'show'}`} data-testid="success-container">
            <div className="forget-success-icon">
              <svg viewBox="0 0 24 24">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>
            <div className="forget-success-text">
              <strong>Email sent!</strong><br />
              If an account exists with that email, we’ve sent password reset instructions.
              Check your inbox and spam folder. Link expires in 15 minutes.
            </div>
          </div>
        </div>
      </div>
    </>
  )
}