import { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link, Navigate, useNavigate } from 'react-router';
import { fetchDataPost } from '../../scripts/utilis/fetch.js'
import { ToastProvider, useToast, CSS } from '../../components/NotificationSystem';
import { Message } from '../../components/Message'
import './ResetPassword.css';

function ResetPasswordWithNotification() {
  const navigate = useNavigate()
  const toast = useToast()
  const [formData, setFormData] = useState({ password: '', confirmPassword: '' })
  const [error, setError] = useState(true)
  const [success, setSuccess] = useState(false)
  const [searchParams] = useSearchParams();
  const resetToken = searchParams.get("token");

  const btnElementRef = useRef(null)
  const formElementRef = useRef(null)
  const navRef = useRef(null)

  useEffect(() => {
    const el = document.createElement("style");
    el.id = "__ns_styles";
    el.textContent = CSS[0];
    document.head.appendChild(el);
    return () => document.getElementById("__ns_styles")?.remove();
  }, []);

  async function resetPassword(event) {
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
      await fetchDataPost(reqData, '/api/password/reset-password')
      formElementRef.current.style.display = 'none'
      navRef.current.style.display = 'none'
      toast.push({
        variant: 'card', type: 'success',
        title: 'Password Reset!',
        message: 'Your password has been updated successfully. You can now login with your new password.',
        action: 'Sign in',
        onAction: () => navigate('/signin'),
        duration: 6000,
      });
      setSuccess(true)
    } catch (err) {
      if (!err.status) {
        toast.push({ variant: 'pill', type: 'error', message: "Couldn't connect to server." });
      } else if (err.status >= 500) {
        toast.push({ variant: 'pill', type: 'error', message: "Unexpected error. Try again later" });
      } else {
        toast.push({ variant: 'pill', type: 'error', message: err.errors || "Request failed. Try again later" });
      }
      btnElementRef.current.disabled = false
      btnElementRef.current.textContent = 'Reset Password'
    }
  }

  if (!resetToken) {
    return <Navigate to="/forgot-password" />
  }
  return (
    <>
      <title>Reset Password - CBT Pro</title>

      <nav>
        <div className="nav-container" ref={navRef}>
          <div className="nav-content">
            <Link to="/" className="logo">CBT Pro</Link>
          </div>
        </div>
      </nav>

      <div className="reset-wrapper" ref={formElementRef}>
        <div className="reset-card">

          <div>
            <div className="reset-header">
              <div className="reset-icon">🔐</div>
              <h1 className="reset-title">Set New Password</h1>
              <p className="reset-subtitle">Enter a strong password you haven’t used before.</p>
            </div>

            <form className="reset-form" onSubmit={resetPassword}>
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
        success && <Message title="Password Reset!" message="Your password has been updated successfully. You can now login with your new password." action={() => navigate('/signin')} btnLabel="Sign In" />
      }
    </>
  )
}

export default function ResetPassword() {
  return (
    <ToastProvider position="top-right">
      <ResetPasswordWithNotification />
    </ToastProvider>
  );
}