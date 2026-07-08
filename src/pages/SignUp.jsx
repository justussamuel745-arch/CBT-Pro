import { useState, useEffect, useRef, createContext, useContext, useCallback } from 'react'
import { Link, useNavigate } from 'react-router';
import { fetchDataPost } from '../scripts/utilis/fetch'
import { Ic } from '../scripts/utilis/Ic'
import './SignUp.css';

const ToastCtx = createContext(null);
const useToast = () => useContext(ToastCtx);
let _tid = 0;
 
function ToastProvider({ children }) {
  const navigate = useNavigate()
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id, dismissType = null) => {
    setToasts(p => {
      const toast = p.find(t => t.id === id);
      // Only navigate if user clicked X and toast type is success
      if (dismissType){
        if (toast?.type === "success") navigate('/signin');
      }
      
      return p.map(t => t.id === id? {...t, exiting: true } : t);
    });
    setTimeout(() => setToasts(p => p.filter(t => t.id!== id)), 220);
  }, [navigate]);

  const push = useCallback((cfg) => {
    const id = ++_tid;
    const dur = cfg.duration?? 4500;
    setToasts(p => [...p, {...cfg, id, exiting: false, progress: 100, startedAt: Date.now(), duration: dur }]);
    if (dur > 0) setTimeout(() => dismiss(id, 'auto'), dur);
    return id;
  }, [dismiss]);

  return (
    <ToastCtx.Provider value={{ push, dismiss }}>
      {children}
      <ToastPortal toasts={toasts} onDismiss={dismiss} />
    </ToastCtx.Provider>
  );
}

function ToastPortal({ toasts, onDismiss }) {
  return (
    <div className="register-toast-portal">
      {toasts.map(t => <AuthToast key={t.id} {...t} onDismiss={() => onDismiss(t.id)} />)}
    </div>
  );
}

function AuthToast({ type = "success", title, message, duration, startedAt, exiting, onDismiss }) {
  const [pct, setPct] = useState(100);
  const rafRef = useRef(null);

  useEffect(() => {
    if (!duration) return;
    const tick = () => {
      const elapsed = Date.now() - startedAt;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setPct(remaining);
      if (remaining > 0) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [duration, startedAt]);

  const ICON = { success: <Ic.Check />, error: <Ic.X />, warning: <Ic.Warn />, info: <Ic.Info /> };
  return (
    <div className={`register-toast t-${type} ${exiting? "exiting" : ""}`}>
      <div className={`register-toast-icon t-${type}`}>{ICON[type]}</div>
      <div className="register-toast-content">
        {title && <div className="register-toast-title">{title}</div>}
        {message && <div className="register-toast-msg">{message}</div>}
      </div>
      <button className="register-toast-x" onClick={onDismiss}><Ic.X /></button>
      <div className="register-toast-bar" style={{ width: `${pct}%` }} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// MODAL
// ─────────────────────────────────────────────────────────────
const STRIPE_COLORS = {
  success: "var(--c-success)",
  error: "var(--c-error)",
  warning: "var(--c-warning)",
  info: "var(--c-primary)",
};

function AuthModal({ type, icon, title, message, primaryLabel, secondaryLabel, onPrimary, onSecondary, onClose }) {
  return (
    <div className="register-overlay" onClick={onClose}>
      <div className="register-modal" onClick={e => e.stopPropagation()}>
        <div className="register-modal-stripe" style={{ background: STRIPE_COLORS[type] }} />
        <button className="register-modal-close-x" onClick={onClose}><Ic.X /></button>
        <div className="register-modal-body">
          <div className={`register-modal-icon-ring ${type}-ring`}>{icon}</div>
          <div className="register-modal-title">{title}</div>
          <div className="register-modal-msg" dangerouslySetInnerHTML={{ __html: message }} />
          <div className="register-modal-actions">
            {primaryLabel && (
              <button className={`register-modal-btn primary-${type === "info"? "primary" : type}`} onClick={onPrimary?? onClose}>
                {primaryLabel}
              </button>
            )}
            {secondaryLabel && (
              <button className="register-modal-btn ghost" onClick={onSecondary?? onClose}>
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
// FORM-LEVEL ALERT
// ─────────────────────────────────────────────────────────────
function FormAlert({ kind, title, message, onDismiss }) {
  if (!message) return null;
  const ICON = { error: <Ic.X />, warning: <Ic.Warn />, success: <Ic.Check /> };
  return (
    <div className={`register-alert ${kind}`}>
      <span className="register-alert-icon">{ICON[kind]}</span>
      <div className="register-alert-body">
        {title && <div className="register-alert-title">{title}</div>}
        {message}
      </div>
      {onDismiss && <button className="register-alert-dismiss" onClick={onDismiss}>✕</button>}
    </div>
  );
}

function validateSignUp({ fullName, email, phoneNumber, password, confirm }) {
  const errs = {};
  if (!fullName.trim()) errs.fullName = "Enter your full name.";
  if (!email.trim()) errs.email = "Enter your email address.";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = "That doesn't look like a valid email.";
  if (!phoneNumber.trim()) errs.phoneNumber = "Enter your phone number.";
  else if (!/^0[789][01]\d{8}$/.test(phoneNumber.replace(/\s/g, ""))) errs.phoneNumber = "Enter a valid Nigerian phone number (e.g. 08012345678).";
  if (!password) errs.password = "Choose a password.";
  else if (password.length < 6) errs.password = "Password must be at least 6 characters.";
  if (!confirm) errs.confirm = "Confirm your password.";
  else if (confirm!== password) errs.confirm = "Passwords don't match.";
  return errs;
}

function Register() {
  const toast = useToast();
  const [fields, setFields] = useState({ fullName: "", email: "", phoneNumber: "", password: "", confirm: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [formAlert, setFormAlert] = useState(null);
  const [modal, setModal] = useState(null);

  const set = (k, v) => {
    setFields(p => ({...p, [k]: v }));
    if (errors[k]) setErrors(p => { const n = {...p }; delete n[k]; return n; });
    setFormAlert(null);
  };

  const strength = passwordStrength(fields.password)

  // PASSWORD STRENGTH
  // ─────────────────────────────────────────────────────────────
  function passwordStrength(pw) {
    if (!pw) return { score: 0, label: "", color: "transparent", pct: 0 };
    let score = 0;
    if (pw.length >= 8) score++;
    if (pw.length >= 12) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    const levels = [
      { label: "Too short", color: "#dc2626", pct: 15 },
      { label: "Weak", color: "#dc2626", pct: 25 },
      { label: "Fair", color: "#d97706", pct: 50 },
      { label: "Good", color: "#2563eb", pct: 70 },
      { label: "Strong", color: "#16a34a", pct: 90 },
      { label: "Very strong", color: "#16a34a", pct: 100 },
    ];
    return { score,...levels[Math.min(score, 5)] };
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const errs = validateSignUp(fields);
    if (Object.keys(errs).length) {
      setErrors(errs);
      setFormAlert({ kind: "error", title: "Fix the errors above", message: `${Object.keys(errs).length} field${Object.keys(errs).length > 1? "s need" : " needs"} your attention before you can continue.` });
      return;
    }
    setLoading(true);
    setFormAlert(null);
    try {
      const response = await fetchDataPost(fields, '/api/register')
      applySignUpScenario(response.message || 'success');
      setLoading(false)
    } catch (err) {
      console.error('Error:', err);
      if (!err.status){
        applySignUpScenario('network');
      } else if (err?.errors && Array.isArray(err.errors)){
        // handle this later
      } else if (err.status === 429){
        applySignUpScenario('too_many_attempt');
      } else if (err.status >= 500) {
        applySignUpScenario('server_error');
      } else {
        applySignUpScenario(err.errors);
      }
      setLoading(false)
    }
  };

  const applySignUpScenario = (sc) => {
    const name = fields.fullName || "there";
    switch (sc) {
      case "success":
        setModal({
          type: "success", icon: <Ic.Mail2 />,
          title: "Account created",
          message: `Your account is ready, <strong>${name}</strong>. Sign in with your email and password to start practicing.`,
          primaryLabel: "Verified — sign in",
          onPrimary: () => { setModal(null); toast.push({ type: "success", title: "Account created", message: `Welcome to the platform, ${name}!`, duration: 5000 }); },
        });
        break;
      case "email_taken":
        setErrors({ email: "This email is already registered." });
        setFormAlert({ kind: "error", title: "Email already in use", message: "An account with this email already exists. Sign in instead, or use a different email address." });
        toast.push({ type: "error", title: "Email taken", message: "Try signing in instead." });
        break;
      case "network":
        setFormAlert({ kind: "error", title: "No internet connection", message: "We couldn't reach the server. Check your connection and try again." });
        toast.push({ type: "error", title: "Connection failed", message: "Server unreachable. Check your internet." });
        break;
      case "too_many_attempt":
        setModal({
          type: "warning", icon: <Ic.Key />,
          title: "Too many attempts",
          message: "You've made too many failed sign-in attempts. Your account is temporarily locked for <strong>15 minutes</strong> to protect your data.",
          secondaryLabel: "Wait and try again",
          onPrimary: () => { setModal(null)}
        });
        break;
      case "server_error":
        setModal({
          type: "error", icon: <Ic.Warn />,
          title: "Something went wrong",
          message: "We ran into an unexpected error while creating your account. Your details were <strong>not saved</strong>. Please try again in a moment.",
          primaryLabel: "Try again",
          onPrimary: () => { setModal(null); toast.push({ type: "info", title: "Retrying…", message: "Give it another go." });}
        });
        toast.push({ type: "error", title: "Server error (500)", message: "Please try again shortly." });
        break;
    }
  };

  const pwOk = fields.password && fields.password === fields.confirm;

  return (
    <>

      <div className="register-page">
        <div className="register-wrapper">
          <div className="register-card">
            <div className="register-logo">
              <h1>CBT Pro</h1>
            </div>
            <p className="register-subtitle">Create your account to start practicing</p>

            {formAlert && (
              <FormAlert kind={formAlert.kind} title={formAlert.title} message={formAlert.message} onDismiss={() => setFormAlert(null)} />
            )}

            <form className="register-form">

              <div className="register-form-group">
                <label className="register-form-label" htmlFor="fullname">Full Name</label>
                <input
                  type="text"
                  className={`register-form-input ${errors.fullName? 'has-error' : ''}`}
                  placeholder="Enter your full name"
                  value={fields.fullName}
                  onChange={(event) => set("fullName", event.target.value)}
                />
                {errors.fullName && <div className="register-field-error"><Ic.X />{errors.fullName}</div>}
              </div>

              <div className="register-form-group">
                <label className="register-form-label" htmlFor="email">Email Address</label>
                <input
                  type="email"
                  className={`register-form-input ${errors.email? 'has-error' : ''}`}
                  placeholder="Enter your email"
                  value={fields.email}
                  onChange={(event) => set("email", event.target.value)}
                />
                {errors.email && <div className="register-field-error"><Ic.X />{errors.email}</div>}
              </div>

              <div className="register-form-group">
                <label className="register-form-label" htmlFor="phone">Phone Number</label>
                <input
                  type="tel"
                  className={`register-form-input ${errors.phoneNumber? 'has-error' : ''}`}
                  placeholder="08012345678"
                  value={fields.phoneNumber}
                  onChange={(event) => set("phoneNumber", event.target.value)}
                />
                {errors.phoneNumber && <div className="register-field-error"><Ic.X />{errors.phoneNumber}</div>}
              </div>

              <div className="register-form-group">
                <label className="register-form-label" htmlFor="password">Password</label>
                <input
                  type="password"
                  className={`register-form-input ${errors.password? 'has-error' : ''}`}
                  placeholder="Create a password"
                  value={fields.password}
                  onChange={(event) => set("password", event.target.value)}
                />
                {errors.password && <div className="register-field-error"><Ic.X />{errors.password}</div>}
                {fields.password &&!errors.password && (
                  <div className="register-strength">
                    <div className="register-strength-bar">
                      <div className="register-strength-fill" style={{ width: `${strength.pct}%`, background: strength.color }} />
                    </div>
                    <div className="register-strength-label" style={{ color: strength.color }}>{strength.label}</div>
                  </div>
                )}
              </div>

              <div className="register-form-group">
                <label className="register-form-label" htmlFor="confirm-password">Confirm Password</label>
                <input
                  type="password"
                  className={`register-form-input ${errors.confirm? 'has-error' : pwOk? " has-success" : ""}`}
                  placeholder="Confirm your password"
                  value={fields.confirm}
                  onChange={(event) => set("confirm", event.target.value)}
                />
                {errors.confirm && <div className="register-field-error"><Ic.X />{errors.confirm}</div>}
                {pwOk && <div className="register-field-hint"><Ic.Check />Passwords match.</div>}
              </div>

              <button
                type="submit"
                className="register-submit"
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading? <><span className="register-spinner" /> Creating account…</> : "Create account"}
              </button>
            </form>

            <div className="register-footer">
              Already have an account? <Link to="/signin">Sign In</Link>
            </div>
          </div>
        </div>
        {modal && (
          <AuthModal {...modal} onClose={() => {setModal(null)}}/>
        )}
      </div>
    </>
  )
}

export function SignUp(){
  return (
    <ToastProvider>
      <Register />
    </ToastProvider>
  )
}