import { useState, useEffect, createContext, useContext, useRef } from "react";
import { useNavigate } from 'react-router';
import { Ic } from '../scripts/utilis/Ic'
import UserContext from '../context/UserContext.jsx';
import { fetchDataPost, fetchUserInfo } from '../scripts/utilis/fetch.js';
import './SignIn.css';

// ─────────────────────────────────────────────────────────────
// TOAST CONTEXT
// ─────────────────────────────────────────────────────────────
const ToastCtx = createContext(null);
const useToast = () => useContext(ToastCtx);
let _tid = 0;

function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const navigate = useNavigate();

  function dismiss(id, dismissType = null) {
    setToasts(p => {
      const toast = p.find(t => t.id === id);
      if (dismissType){
        //if (toast?.type === 'success') navigate('/');
        if (toast?.type === 'info') navigate('/signup')
      }
      return p.map(t => t.id === id? {...t, exiting: true } : t);
    });
    setTimeout(() => setToasts(p => p.filter(t => t.id!== id)), 220);
  }

  function push(cfg) {
    const id = ++_tid;
    const duration = cfg.duration?? 4500;
    setToasts(p => [...p, {...cfg, id, exiting: false, startedAt: Date.now(), duration }]);
    if (duration > 0) setTimeout(() => dismiss(id, 'auto'), duration);
  }

  return (
    <ToastCtx.Provider value={{ push, dismiss }}>
      {children}
      <div className="auth-toast-portal">
        {toasts.map(t => (
          <AuthToast key={t.id} {...t} onDismiss={() => dismiss(t.id)} />
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

const TOAST_ICONS = { success: "✓", error: "✕", warning: "⚠", info: "ℹ" };

function AuthToast({ type = "success", title, message, duration, startedAt, exiting, onDismiss }) {
  const [pct, setPct] = useState(100);
  const rafRef = useRef(null);

  useEffect(() => {
    if (!duration) return;
    function tick() {
      const elapsed = Date.now() - startedAt;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setPct(remaining);
      if (remaining > 0) rafRef.current = requestAnimationFrame(tick);
    }
    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [duration, startedAt]);

  return (
    <div className={`auth-toast auth-toast-${type}${exiting? " auth-toast-exiting" : ""}`}>
      <div className="auth-toast-icon-wrap">{TOAST_ICONS[type]}</div>
      <div className="auth-toast-body">
        {title && <div className="auth-toast-title">{title}</div>}
        {message && <div className="auth-toast-msg">{message}</div>}
      </div>
      <button className="auth-toast-close" onClick={onDismiss}>✕</button>
      <div className="auth-toast-progress" style={{ width: pct + "%" }} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// MODAL
// ─────────────────────────────────────────────────────────────
function AuthModal({ type, icon, title, message, primaryLabel, secondaryLabel, onPrimary, onSecondary, onClose }) {
  const btnType = type === "info"? "primary" : type;
  return (
    <div className="auth-modal-overlay" onClick={onClose}>
      <div className="auth-modal" onClick={e => e.stopPropagation()}>
        <div className={"auth-modal-stripe auth-modal-stripe-" + type} />
        <button className="auth-modal-close-x" onClick={onClose}>✕</button>
        <div className="auth-modal-body">
          <div className={"auth-modal-icon auth-modal-icon-" + type}>{icon}</div>
          <div className="auth-modal-title">{title}</div>
          <div className="auth-modal-msg" dangerouslySetInnerHTML={{ __html: message }} />
          <div className="auth-modal-actions">
            {primaryLabel && (
              <button
                className={"auth-modal-btn auth-modal-btn-" + btnType}
                onClick={onPrimary || onClose}
              >
                {primaryLabel}
              </button>
            )}
            {secondaryLabel && (
              <button
                className="auth-modal-btn auth-modal-btn-ghost"
                onClick={onSecondary || onClose}
              >
                {secondaryLabel}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// FORM ALERT BANNER
// ─────────────────────────────────────────────────────────────
function FormAlert({ kind, title, message, onDismiss }) {
  return (
    <div className={"auth-alert auth-alert-" + kind}>
      <span className="auth-alert-icon">{kind === "error"? "✕" : "⚠"}</span>
      <div className="auth-alert-body">
        {title && <div className="auth-alert-title">{title}</div>}
        <span>{message}</span>
      </div>
      <button className="auth-alert-dismiss" onClick={onDismiss}>✕</button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// VALIDATION
// ─────────────────────────────────────────────────────────────
function validate(email, password) {
  const errors = {};
  if (!email.trim()) {
    errors.email = "Email address is required.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = "Enter a valid email address.";
  }
  if (!password) {
    errors.password = "Password is required.";
  } else if (password.length < 6) {
    errors.password = "Password must be at least 6 characters.";
  }
  return errors;
}

// ─────────────────────────────────────────────────────────────
// SIGN IN FORM
// ─────────────────────────────────────────────────────────────
function Auth() {
  const { setToken, setIsActivated, setIsAdmin, setUserInfo, setProfileFields } = useContext(UserContext)
  const navigate = useNavigate()
  const toast = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [errors, setErrors] = useState({});
  const [formAlert, setFormAlert] = useState(null);
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState(null);

  function clearFieldError(field) {
    if (errors[field]) {
      setErrors(prev => { const n = {...prev }; delete n[field]; return n; });
    }
  }

  async function handleSignIn() {
    // 1. Validate
    const errs = validate(email, password);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    // 2. Loading state
    setLoading(true);
    setFormAlert(null);
    setErrors({});
    try {
      const response = await fetchDataPost({email, password}, '/api/auth');
      setToken(response.accessToken)
      setIsActivated(response.isActivated)
      setIsAdmin(response.isAdmin)
      /*========= Fetching Data for Settings Page ===========*/
      fetchUserInfo(response.accessToken, setUserInfo, setProfileFields)
      setModal({
        type: "success",
        icon: "✓",
        title: "Welcome back!",
        message: "You're signed in as <strong>" + email + "</strong>. Go to your Home Page…",
        primaryLabel: "Go to Home Page",
        onPrimary: () => {
          setModal(null);
          // toast.push({ type: "success", title: "Signed in", message: "Welcome back! Redirecting…" });
          navigate('/')
        },
      });
    } catch (err) {
      if (err.errors === 'wrong_password'){
        setFormAlert({ kind: "error", title: "Incorrect password", message: "The password you entered doesn't match this account. Try again or reset your password." });
        setErrors({ password: "Incorrect password." });
        toast.push({ type: "error", title: "Sign in failed", message: "Incorrect password." });
      } else if (err.errors === 'no_account'){
        setModal({
          type: "error", icon: <Ic.X />,
          title: "No account found",
          message: "We couldn't find an account with <strong>" + email + "</strong>. Check the email or create a new account.",
          primaryLabel: "Create account",
          secondaryLabel: "Try again",
          onPrimary: () => { setModal(null); toast.push({ type: "info", title: "Switch to Sign Up", message: "Creating a new account." });}
        });
      } else if (err.status === 429){
        setModal({
          type: "warning", icon: <Ic.Key />,
          title: "Too many attempts",
          message: "You've made too many failed sign-in attempts. Your account is temporarily locked for <strong>15 minutes</strong> to protect your data.",
          secondaryLabel: "Wait and try again",
          onPrimary: () => { setModal(null);}
        });
      } else {
        setFormAlert({
          kind: "error",
          title: "Sign in failed",
          message: "Something went wrong. Please try again.",
        });
        toast.push({
          type: "error",
          title: "Sign in failed",
          message: "Check your details and try again.",
        });
      }
    } finally {
      setLoading(false)
    }
  }

  function inputClass(field) {
    return "auth-form-input" + (errors[field]? " auth-input-error" : "");
  }

  return (
    <>
      <div className="auth-page">
        <div className="auth-wrapper">
          <div className="auth-card">

            <div className="auth-header">
              <h1>Welcome Back</h1>
              <p>Access your mock tests, AI tutor, and results.</p>
            </div>

            <div className="auth-form">

              {/* Form-level alert */}
              {formAlert && (
                <FormAlert
                  kind={formAlert.kind}
                  title={formAlert.title}
                  message={formAlert.message}
                  onDismiss={() => setFormAlert(null)}
                />
              )}

              {/* Email */}
              <div className="auth-form-group">
                <label className="auth-form-label" htmlFor="si-email">
                  Email Address
                </label>
                <input
                  id="si-email"
                  type="email"
                  className={inputClass("email")}
                  placeholder="you@example.com"
                  value={email}
                  onChange={e => { setEmail(e.target.value); clearFieldError("email"); setFormAlert(null); }}
                />
                {errors.email && (
                  <span className="auth-field-error">✕ {errors.email}</span>
                )}
              </div>

              {/* Password */}
              <div className="auth-form-group">
                <label className="auth-form-label" htmlFor="si-password">
                  Password
                </label>
                <div className="auth-password-wrapper">
                  <input
                    id="si-password"
                    type={showPw? "text" : "password"}
                    className={inputClass("password")}
                    placeholder="Enter your password"
                    value={password}
                    onChange={e => { setPassword(e.target.value); clearFieldError("password"); setFormAlert(null); }}
                  />
                  <button
                    type="button"
                    className="auth-password-toggle"
                    onClick={() => setShowPw(p =>!p)}
                  >
                    {!showPw? <i className="fas fa-eye-slash"></i> : <i className="fas fa-eye"></i>}
                  </button>
                </div>
                {errors.password && (
                  <span className="auth-field-error">✕ {errors.password}</span>
                )}
              </div>

              {/* Remember + Forgot */}
              <div className="auth-form-row">
                <div className="auth-checkbox-group">
                  <input
                    type="checkbox"
                    id="si-remember"
                    checked={remember}
                    onChange={e => setRemember(e.target.checked)}
                  />
                  <label htmlFor="si-remember">Remember me</label>
                </div>
                <a href="/forgot-password" className="auth-forgot-link">
                  Forgot password?
                </a>
              </div>

              {/* Submit — onClick, NOT a form submit */}
              <button
                className="auth-submit"
                disabled={loading}
                onClick={handleSignIn}
              >
                {loading
                 ? <><span className="auth-spinner" /> Signing in…</>
                  : "Sign In"
                }
              </button>

            </div>{/* end.auth-form */}

            <div className="auth-footer">
              Don&apos;t have an account? <a href="/signup">Sign up free</a>
            </div>

          </div>
        </div>
      </div>

      {modal && <AuthModal {...modal} onClose={() => setModal(null)} />}
    </>
  );
}

// ─────────────────────────────────────────────────────────────
// ROOT
// ─────────────────────────────────────────────────────────────
export function SignIn() {
  return (
    <ToastProvider>
      <Auth />
    </ToastProvider>
  );
}