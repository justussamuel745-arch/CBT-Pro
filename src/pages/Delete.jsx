import { useState, useEffect } from "react";
import { Link, useNavigate } from 'react-router';
import { GoogleLogin } from "@react-oauth/google";
import { toast } from 'react-hot-toast';
import {  ModalDestruct, CSS } from '../components/NotificationSystem';
import { deleteUser } from '../hooks/services/indexedDB/users';
import { request } from '../scripts/utils/request';
import { authStore } from '../stores/authStore';
import './Delete.css';

export default function Delete() {
  const userInfo = authStore(state => state.userInfo)
  const logout = authStore(state => state.logout)
  const navigate = useNavigate()

  const isGoogleOnly = userInfo?.authProvider === 'google';
  
  const [error, setError] = useState(null)
  const [password, setPassword] = useState("");
  const [googleToken, setGoogleToken] = useState(null);
  const [confirmed, setConfirmed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [btnText, setBtnText] = useState("Delete Account");

  const [modal, setModal] = useState(null);
  const closeModal = () => setModal(null);

  const isDisabled = isGoogleOnly
    ? (!googleToken || !confirmed || loading)
    : (!password.trim() || !confirmed || loading);

  /*===== Render Modal Style ======*/
  useEffect(() => {
    const el = document.createElement("style");
    el.id = "__ns_styles";
    el.textContent = CSS[0];
    document.head.appendChild(el);
    return () =>  {
      toast.dismiss()
      document.getElementById("__ns_styles")?.remove();
    }
  }, []);

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    if (error) setError("");
  };

  const handleGoogleVerify = (credentialResponse) => {
    setGoogleToken(credentialResponse.credential);
    if (error) setError("");
    toast.error('Google account verified.');
  };

  const deleteUserAccount = async () => {
    setLoading(true);
    setBtnText("Verifying...");

    try {
      const body = isGoogleOnly
        ? { googleToken }
        : { password };

      await request.auth('/api/settings/delete', {
        method: 'POST',
        body: JSON.stringify(body)
      });
      await Promise.all([
        deleteUser(),
        logout()
      ])

      setBtnText("Deleting...");
      navigate('/auth/signup')

    } catch (err) {
      if (!err.status) {
        toast.error("Couldn't connect to the server.");
      } else if (err.error === 'wrong_password') {
        setError('Incorrect password.')
      } else if (err.error === 'GOOGLE_ACCOUNT_MISMATCH') {
        setError('This Google account doesn\'t match the one linked to your CBT Pro account. Please verify with the correct Google account.')
        setGoogleToken(null);
      } else if (err.status === 401 && isGoogleOnly) {
        setError('Google verification failed or expired.')
        setGoogleToken(null);
      } else if (err.status >= 500) {
        toast.error("Unexpected error. Try again later");
      } else {
        toast.error(err.error)
      }

      setBtnText("Delete Account");
    } finally {
      setLoading(false)
    }
  };

  return (
    <>
      <title>Delete Account - CBT Pro</title>

      <nav>
        <div className="nav-container">
          <div className="nav-content">
            <Link to="/" className="logo">CBT Pro</Link>
          </div>
        </div>
      </nav>

      <header className="page-header">
        <div className="nav-container">
          <div className="breadcrumb">
            <Link to="/settings">Settings</Link> / Delete Account
          </div>
          <h1>Delete Your Account</h1>
        </div>
      </header>

      <main className="delete-container">
        <div className="delete-card">
          <div className="delete-warning">
            <span style={{ fontSize: "1.5rem" }}>🚨</span>
            This action is permanent and cannot be undone
          </div>

          <div className="delete-rules">
            <h3>Before you delete, please review the following:</h3>
            <ul>
              <li>Permanent data loss: All CBT test results, assessment scores, progress tracking, and saved practice sessions will be permanently erased and cannot be restored.</li>
              <li>Subscription & billing: Your CBT Pro subscription will be canceled immediately. You will lose access to premium assessments, advanced analytics, and priority support. No prorated refund will be issued for the current billing period.</li>
              <li>Reactivation requires new subscription: If you sign up again in the future, you must purchase a new CBT Pro subscription to regain access to all premium features. Your previous subscription and benefits will not carry over.</li>
              <li>Account access: You will lose access to your account, profile settings, and personalized recommendations. Your email and username will be released and may be used by another user.</li>
              <li>Irreversible action: Once deletion is confirmed, your account cannot be recovered, reactivated, or merged with a future account.</li>
              <li>Compliance records: We may retain minimal records required by law, such as transaction receipts, for tax and compliance purposes. These records do not include your CBT results or personal content.</li>
              <li>Starting over: If you decide to return, you will need to create a new account and complete onboarding from the beginning. Past progress and history will not be available.</li>
            </ul>
          </div>

          <form className="delete-form" onSubmit={(e) => { e.preventDefault(); setModal('delete_confirm') }} noValidate>

            {isGoogleOnly ? (
              <div className="delete-form-group">
                <label>Verify your Google account to confirm</label>
                <p className="delete-google-hint">
                  Your account uses Google Sign-In and has no password. Re-verify with Google below to confirm it&apos;s you.
                </p>
                <div className="delete-google-wrap">
                  <GoogleLogin
                    onSuccess={handleGoogleVerify}
                    onError={() => {
                      setError('Google verification failed. Please try again.');
                      toast.error('Google verification failed.');
                    }}
                    shape="pill"
                    theme="outline"
                    auto_select={false}
                  />
                </div>
                {googleToken && !error && (
                  <div className="delete-google-verified">✓ Google account verified</div>
                )}
                {error && <div className="form-error">{error}</div>}
              </div>
            ) : (
              <div className="delete-form-group">
                <label htmlFor="password">Enter your password to confirm</label>
                <input
                  type="password"
                  value={password}
                  onChange={handlePasswordChange}
                  placeholder="Your current password"
                  autoComplete="off"
                  required
                  aria-describedby="passwordError"
                  className={error ? "error" : ""}
                />
                {error && <div className="form-error">{error}</div>}
              </div>
            )}

            <div className="delete-checkbox-group">
              <input
                type="checkbox"
                id="confirmDelete"
                checked={confirmed}
                onChange={(e) => setConfirmed(e.target.checked)}
              />
              <label htmlFor="confirmDelete">
                I understand this is permanent and I want to delete my CBT Pro account and all associated data
              </label>
            </div>

            <div className="btn-row">
              <Link to="/settings" className="btn btn-outline">Cancel</Link>
              <button
                type="submit"
                className="btn delete-btn-danger"
                disabled={isDisabled}
              >
                {btnText}
              </button>
            </div>
          </form>
        </div>
        {modal === 'delete_confirm' && (
          <div className="ns-overlay" onClick={closeModal}>
            <div onClick={e => e.stopPropagation()} style={{ width: '100%', display: 'flex', justifyContent: 'center', padding: '0 1rem' }}>
              <ModalDestruct
                title="Delete your account permanently?"
                body="This will permanently delete your account, profile data, and all associated content. You won’t be able to recover anything after deletion."
                warningText="This action cannot be undone. All data will be removed from our servers immediately."
                primaryLabel="Delete account"
                onPrimary={() => { deleteUserAccount(); closeModal(); }}
                onClose={closeModal}
              />
            </div>
          </div>
        )}
      </main>
    </>
  );
}