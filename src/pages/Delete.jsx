import { useState, useEffect, useContext } from "react";
import { Link, useNavigate } from 'react-router';
import UserContext from '../context/UserContext.jsx';
import { fetchWithAuth } from '../scripts/utilis/fetch.js';
import { ToastProvider, useToast, ModalDestruct, CSS } from '../components/NotificationSystem'
import './Delete.css';

function DeleteWithToast() {
  const { token, setToken, error, setError } = useContext(UserContext);
  const toast = useToast()
  const navigate = useNavigate()
  const [password, setPassword] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [btnText, setBtnText] = useState("Delete Account");

  const [modal, setModal] = useState(null);
  const closeModal = () => setModal(null);

  const isDisabled = !password.trim() || !confirmed || loading;

  /*===== Render Notification Style ======*/
  useEffect(() => {
    const el = document.createElement("style");
    el.id = "__ns_styles";
    el.textContent = CSS[0];
    document.head.appendChild(el);
    return () => document.getElementById("__ns_styles")?.remove();
  }, []);


  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    if (error) setError(""); // clear error when user types
  };

  const deleteUser = async () => {

    setLoading(true);
    setBtnText("Verifying...");

    try {
      const response = await fetchWithAuth(token, setToken, `/api/settings?password=${password}`, { method: 'DELETE' })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) {
        throw { status: response.status, error: data?.message || data?.error || 'Request failed. Try again later.' }
      }


      setBtnText("Deleting...");
      // Proceed with deletion
      setToken(null)
      navigate('/signup')

    } catch (err) {
      if (!err.status){
        toast.push({ variant: 'pill', type: 'error',   message: "Couldn't connect to server." });
      } else if (err.error === 'wrong_password') {
        setError('Incorrect password.')
      } else if (err.status >= 500){
        toast.push({ variant: 'pill', type: 'error',   message: "Unexpected error. Try again later" });
      } else {
        toast.push({ variant: 'pill', type: 'error',   message: err.error });
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
                onPrimary={() => { deleteUser(); closeModal(); }}
                onClose={closeModal}
              />
            </div>
          </div>
        )}
      </main>
    </>
  );
}

export default function Delete() {
  return (
    <ToastProvider position="top-right">
      <DeleteWithToast />
    </ToastProvider>
  );
}