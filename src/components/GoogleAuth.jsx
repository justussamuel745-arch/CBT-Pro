import { useState, useRef, useEffect, memo } from 'react';
import { useNavigate } from 'react-router';
import { GoogleLogin } from "@react-oauth/google";
import { useToast } from '../pages/auth/Signin';
import { authStore } from '../stores/authStore';
import { userStore } from '../stores/userStore';
import { scheduledExamStore } from '../stores/scheduledExamStore';
import './GoogleAuth.css';

function getGoogleAuthToast(error) {
  // Network failure — request never reached the server
  if (!error.status) {
    return {
      type: 'error',
      title: 'No connection',
      message: 'Check your internet connection and try again.',
    };
  }

  switch (error.status) {
    case 400:
      return {
        type: 'error',
        title: 'Google sign-in failed',
        message: error.error || 'We couldn\'t verify your Google account. Please try again.',
      };

    case 401:
      return {
        type: 'error',
        title: 'Session expired',
        message: 'Your Google sign-in expired before it could be verified. Please try again.',
      };

    case 403:
      return {
        type: 'error',
        title: 'Access denied',
        message: 'This Google account isn\'t authorized to continue. Contact support if this seems wrong.',
      };

    case 404:
      return {
        type: 'error',
        title: 'Something went wrong',
        message: 'We couldn\'t find your account details. Please try again or use email instead.',
      };

    case 409:
      return {
        type: 'warning',
        title: 'Account already exists',
        message: 'An account with this email already exists using a different sign-in method. Try signing in with your email and password instead.',
      };

    case 429:
      return {
        type: 'warning',
        title: 'Too many attempts',
        message: 'You\'ve tried this too many times. Please wait a few minutes before trying again.',
      };

    case 500:
    case 502:
    case 503:
      return {
        type: 'error',
        title: 'Server error',
        message: 'Something went wrong on our end. Please try again in a moment.',
      };

    default:
      return {
        type: 'error',
        title: 'Sign-in failed',
        message: error.error || 'Something went wrong. Please try again.',
      };
  }
}

// GoogleButtonLoading.jsx
function GoogleButtonLoading( ) {
  return (
    <button
      className="gsi-btn"
      aria-busy={true}
      data-testid="google-loading"
    >
      <span className="gsi-spinner" aria-hidden="true" />
      <span className="gsi-text">Signing in…</span>
    </button>
  );
}


export const GoogleAuth = memo(function GoogleAuth({ dividerLabel, action }) {
  const googleAuth = authStore(state => state.googleAuth)
  const { fetchUserInfo, fetchUserHistory } = userStore(state => state)
  const getDashboardInfo = scheduledExamStore(state => state.getDashboardInfo)
  const googleWrapRef = useRef(null);
  const [googleWidth, setGoogleWidth] = useState(360);
  const [isLoading, setIsLoading] = useState(false)
  const toast = useToast()

  const navigate = useNavigate()

  useEffect(() => {
    if (googleWrapRef.current) {
      setGoogleWidth(googleWrapRef.current.offsetWidth);
    }
  }, []);

  return (
    <>
      <div className="auth-divider">
        <span>{dividerLabel}</span>
      </div>

      <div className="auth-google-wrap" ref={googleWrapRef}>
        { isLoading 
            ? <GoogleButtonLoading />
            : <GoogleLogin
                width={googleWidth}
                shape="pill"
                theme="outline"
                text={action}
                logo_alignment="center"
                onSuccess={async (credentialResponse) => {
                  try {
                    setIsLoading(true)
                    await googleAuth(credentialResponse)
                    await Promise.all([
                      fetchUserInfo(),
                      fetchUserHistory()
                    ])
                      .then(() => getDashboardInfo())
                      .catch(() => {})
                    navigate('/')
                  } catch (error) {
                    toast.push(getGoogleAuthToast(error))
                  } finally {
                    setIsLoading(false)
                  }
                }}
                onError={() => {
                  console.log("Google Auth Failed")
                  toast.push({
                    type: 'error',
                    title: 'Google sign-in cancelled',
                    message: 'The Google sign-in window was closed or failed to load. Please try again.',
                  });
                }}
              />
        }
      </div>
    </>
  )
})