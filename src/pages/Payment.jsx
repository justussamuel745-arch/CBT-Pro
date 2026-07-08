import { useState, useContext, useEffect, useRef } from 'react';
import { Link } from 'react-router';
import UserContext from '../context/UserContext';
import { fetchWithAuth } from '../scripts/utilis/fetch';
import { Message } from '../components/Message';
import { ToastProvider, useToast, CSS } from '../components/NotificationSystem';
import './Payment.css';

// ─────────────────────────────────────────────────────────────
// TOAST
// ─────────────────────────────────────────────────────────────
let _tid = 0;

function useToastState() {
  const [toasts, setToasts] = useState([]);
  function dismiss(id) {
    setToasts(p => p.map(t => t.id === id ? { ...t, exiting: true } : t));
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 220);
  }
  function push(cfg) {
    const id = ++_tid;
    const duration = cfg.duration ?? 4500;
    setToasts(p => [...p, { ...cfg, id, exiting: false, startedAt: Date.now(), duration }]);
    if (duration > 0) setTimeout(() => dismiss(id), duration);
  }
  return { toasts, push, dismiss };
}

const TOAST_ICONS = {
  success: <i className="fa-solid fa-check"></i>,
  error: <i className="fa-solid fa-xmark"></i>,
  info: <i className="fa-solid fa-circle-info"></i>
};

function PaymentToast({ type = 'success', title, message, duration, startedAt, exiting, onDismiss }) {
  const [pct, setPct] = useState(100);
  const rafRef = useRef(null);

  useEffect(() => {
    if (!duration) return;
    function tick() {
      const remaining = Math.max(0, 100 - ((Date.now() - startedAt) / duration) * 100);
      setPct(remaining);
      if (remaining > 0) rafRef.current = requestAnimationFrame(tick);
    }
    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [duration, startedAt]);

  return (
    <div className={'payment-toast t-' + type + (exiting ? ' exiting' : '')}>
      <div className="payment-toast-icon">{TOAST_ICONS[type]}</div>
      <div className="payment-toast-body">
        {title && <div className="payment-toast-title">{title}</div>}
        {message && <div className="payment-toast-msg">{message}</div>}
      </div>
      <button className="payment-toast-close" onClick={onDismiss}>
        <i className="fa-solid fa-xmark"></i>
      </button>
      <div className="payment-toast-bar" style={{ width: pct + '%' }} />
    </div>
  );
}

function ToastPortal({ toasts, onDismiss }) {
  return (
    <div className="payment-toast-portal">
      {toasts.map(t => (
        <PaymentToast key={t.id} {...t} onDismiss={() => onDismiss(t.id)} />
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// FAQ ITEM
// ─────────────────────────────────────────────────────────────
function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="payment-faq-item">
      <button className={'payment-faq-q' + (open ? ' open' : '')} onClick={() => setOpen(p => !p)}>
        {q}
        <span className={'payment-faq-chevron' + (open ? ' open' : '')}>
          <i className="fa-solid fa-chevron-down"></i>
        </span>
      </button>
      {open && <div className="payment-faq-a">{a}</div>}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// CREDIT PACKS
// ─────────────────────────────────────────────────────────────
const CREDIT_PACKS = [
  { credits: 15, price: 100, label: 'Starter', badge: null },
  { credits: 40, price: 200, label: 'Popular', badge: 'Best value' },
  { credits: 100, price: 500, label: 'Pro', badge: 'Save 20%' },
];

// ─────────────────────────────────────────────────────────────
// ACTIVATION GUIDE
// ─────────────────────────────────────────────────────────────
function ActivationGuide() {
  return (
    <div className="payment-panel">
      <div className="payment-guide-title">How app activation works</div>
      <p className="payment-guide-sub">
        A one-time annual fee of ₦1,500 unlocks full access to CBT Pro — all subjects, mock tests, past questions, and the AI tutor — for 12 months from the day you pay.
      </p>

      <div className="payment-guide-section">
        <div className="payment-guide-section-title">Payment steps</div>
        {[
          { n: '1', title: 'Enter your email', desc: 'Use the email linked to your CBT Pro account. Your receipt and activation confirmation will be sent there.' },
          { n: '2', title: 'Click "Pay with Paystack"', desc: "You'll be redirected to Paystack's secure checkout page. Don't close or refresh the tab during this process." },
          { n: '3', title: 'Choose a payment method', desc: 'Paystack accepts Debit/Credit card, Bank Transfer, USSD, and Opay/PalmPay/Kuda. Pick what works best for you.' },
          { n: '4', title: 'Authorise the payment', desc: 'Follow your bank or card prompts. You may receive a one-time password (OTP) by SMS to confirm the transaction.' },
          { n: '5', title: 'Instant activation', desc: "Once payment clears, you'll be redirected back here and your account activates immediately — no waiting, no manual review." },
        ].map(s => (
          <div className="payment-step" key={s.n}>
            <div className="payment-step-number">{s.n}</div>
            <div className="payment-step-content">
              <div className="payment-step-title">{s.title}</div>
              <div className="payment-step-desc">{s.desc}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="payment-guide-section">
        <div className="payment-guide-section-title">Accepted payment methods</div>
        <div className="payment-methods-grid">
          {[
            { icon: <i className="fa-solid fa-credit-card"></i>, label: 'Debit / Credit card' },
            { icon: <i className="fa-solid fa-building-columns"></i>, label: 'Bank Transfer' },
            { icon: <i className="fa-solid fa-mobile-screen"></i>, label: 'USSD (*737#, *770#…)' },
            { icon: <i className="fa-solid fa-wallet"></i>, label: 'Opay · PalmPay · Kuda' },
          ].map(m => (
            <div className="payment-method-chip" key={m.label}>
              {m.icon}
              <span>{m.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="payment-guide-section">
        <div className="payment-guide-section-title">Frequently asked questions</div>
        <FaqItem q="What happens when my 12 months expire?" a="Your access pauses at the expiry date. You'll be prompted to renew at the same rate. All your exam history and scores are saved — nothing is deleted." />
        <FaqItem q="Can I pay for someone else's account?" a="No. CBT Pro subscriptions can only be activated for the account you are currently logged into. This policy helps us maintain accurate records, secure your data, and prevent accidental activation of the wrong account. To activate another account, kindly log out and sign in with that account’s email, then proceed with payment. The subscription and receipt will be linked to the logged-in account only." />
        <FaqItem q="My payment went through but the app isn't activated?" a="Wait 2–3 minutes and refresh. If it's still inactive, copy your Paystack reference number and contact support — we'll resolve it within the hour." />
        <FaqItem q="Is this a recurring charge?" a="No. You will not be charged again until the subscription expires. CBT Pro operates on a one-time annual payment model. Your subscription is valid for 12 months from the date of activation. If you wish to continue with the application after your subscription expires, you will need to make a new payment to renew your access. No automatic charges will be made to your card or bank account." />
      </div>

      <a href="mailto:teamcbtpro@gmail.com" className="payment-support-btn">
        <i className="fa-solid fa-envelope"></i> Contact support
      </a>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// AI CREDITS GUIDE
// ─────────────────────────────────────────────────────────────
function CreditsGuide() {
  return (
    <div className="payment-panel">
      <div className="payment-guide-title">How AI credits work</div>
      <p className="payment-guide-sub">
        Each message you send to Astra AI costs 1 credit. Credits never expire and stack — buy more any time. New accounts receive 500 free credits on sign-up.
      </p>

      <div className="payment-guide-section">
        <div className="payment-guide-section-title">How to buy credits</div>
        {[
          { n: '1', title: 'Pick a credit pack', desc: 'Choose from 15, 40, or 100 credits. Larger packs cost less per credit — the 100-pack saves you 20% versus buying 15 at a time.' },
          { n: '2', title: 'Enter your email', desc: 'Enter the email registered to your account. This is where your credits will be delivered instantly after payment.' },
          { n: '3', title: 'Pay via Paystack', desc: 'Paystack handles the transaction securely. Card, bank transfer, USSD, and mobile wallets all work.' },
          { n: '4', title: 'Credits added instantly', desc: "Your AI credit balance updates the moment Paystack confirms payment. No manual top-up needed." },
        ].map(s => (
          <div className="payment-step" key={s.n}>
            <div className="payment-step-number">{s.n}</div>
            <div className="payment-step-content">
              <div className="payment-step-title">{s.title}</div>
              <div className="payment-step-desc">{s.desc}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="payment-guide-section">
        <div className="payment-guide-section-title">What credits are used for</div>
        {[
          { icon: <i className="fa-solid fa-robot"></i>, title: 'Astra AI messages', desc: '1 credit per message sent to the AI tutor. AI responses are free — only your messages cost credits.' },
          { icon: <i className="fa-solid fa-book-open"></i>, title: 'Detailed explanations', desc: "Ask Astra to break down any question, topic, or answer in depth. Each question you ask costs 1 credit." },
          { icon: <i className="fa-solid fa-brain"></i>, title: 'Custom quizzes', desc: "Request practice questions on any topic and Astra generates them for you. Each request costs 1 credit." },
        ].map(s => (
          <div className="payment-step" key={s.title}>
            <div className="payment-step-icon">{s.icon}</div>
            <div className="payment-step-content">
              <div className="payment-step-title">{s.title}</div>
              <div className="payment-step-desc">{s.desc}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="payment-guide-section">
        <div className="payment-guide-section-title">Frequently asked questions</div>
        <FaqItem q="Do credits expire?" a="No. Credits have no expiry date. Once purchased, they stay in your account until you use them." />
        <FaqItem q="What if I run out of credits mid-conversation?" a="Astra will let you know when your credits are low. The conversation pauses until you top up — your chat history is kept." />
        <FaqItem q="Can I get a refund on unused credits?" a="Credits are non-refundable once purchased. We recommend starting with the Starter pack if you're unsure how many you'll need." />
        <FaqItem q="I paid but my credits didn't increase?" a="Refresh the page after 2 minutes. If credits still haven't appeared, contact support with your Paystack reference number." />
      </div>

      <a href="mailto:teamcbtpro@gmail.com" className="payment-support-btn">
        <i className="fa-solid fa-envelope"></i> Contact support
      </a>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// ACTIVATION FORM
// ─────────────────────────────────────────────────────────────
function ActivationForm({ toast, setBlockPayment }) {
  const { token, setToken } = useContext(UserContext);
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const btnRef = useRef(null);

  function validate() {
    if (!email.trim()) { setError('Email address is required.'); return false; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError('Enter a valid email address.'); return false; }
    setError('');
    return true;
  }

  async function handlePay(e) {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const response = await fetchWithAuth(token, setToken, '/api/payment', {
        method: 'POST',
        body: JSON.stringify({ email, type: 'app_activation' }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw { status: response.status, error: data.message || data.error || 'Something went wrong. Try again.' };
      }
      toast.push({ type: 'info', title: 'Redirecting to Paystack…', message: 'You will be redirected to the secure payment page.' });
      setTimeout(() => { window.location.href = data.authorization_url; }, 1000);
    } catch (err) {
      if (!err.status) {
        toast.push({ type: 'error', title: 'Connection failed', message: 'Check your internet and try again.' });
      } else if (err.status >= 500) {
        toast.push({ type: 'error', title: 'Server error', message: 'Something went wrong on our end. Please try again shortly.' });
      } else if (err.status === 409) {
        setBlockPayment(true)
      } else {
        toast.push({ type: 'error', title: 'Payment error', message: err.error });
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="payment-panel">
      <div className="payment-summary">
        <div className="payment-summary-icon"><i className="fa-solid fa-unlock-keyhole"></i></div>
        <div className="payment-summary-info">
          <div className="payment-summary-label">App Activation — Annual</div>
          <div className="payment-summary-amount">₦1,500</div>
          <div className="payment-summary-desc">Full access to all subjects, mock tests, past questions, and the Astra AI tutor for 12 months.</div>
        </div>
      </div>

      <form onSubmit={handlePay} noValidate>
        <div className="payment-form-group">
          <label className="payment-label" htmlFor="act-email">Email Address</label>
          <input id="act-email" type="email" className={'payment-input' + (error ? ' payment-input-error' : '')} placeholder="you@example.com" value={email} onChange={e => { setEmail(e.target.value); if (error) setError(''); }} autoComplete="email" />
          {error && <div className="payment-field-error"><i className="fa-solid fa-circle-exclamation"></i> {error}</div>}
        </div>

        <div className="payment-form-group">
          <label className="payment-label">Amount (NGN)</label>
          <input type="text" className="payment-input" value="₦1,500" disabled />
        </div>

        <button type="submit" className="payment-submit" disabled={loading} ref={btnRef}>
          {loading ? <><span className="payment-spinner" /> Redirecting…</> : <><i className="fa-solid fa-credit-card"></i> Pay with Paystack</>}
        </button>
      </form>

      <div className="payment-security">
        <i className="fa-solid fa-shield-halved"></i> Secured by Paystack · 256-bit SSL encryption
      </div>

      <div className="payment-note">
        After successful payment your account activates instantly. A receipt is sent to the email you provide.
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// AI CREDITS FORM
// ─────────────────────────────────────────────────────────────
function CreditsForm({ toast, setMainTab }) {
  const { token, setToken, isActivated } = useContext(UserContext);
  const [selectedPack, setSelectedPack] = useState(1);
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const pack = CREDIT_PACKS[selectedPack];
  
  const toastsIdRef = useRef([])
  const nsToast = useToast()

  /*=========== Inject Notification Styles ==============*/
  useEffect(() => {
    const el = document.createElement("style");
    el.id = "__ns_styles";
    el.textContent = CSS[0];
    document.head.appendChild(el);
    return () => document.getElementById("__ns_styles")?.remove();
  }, []);

  function validate() {
    if (!email.trim()) { setError('Email address is required.'); return false; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError('Enter a valid email address.'); return false; }
    setError('');
    return true;
  }

  async function handlePay(e) {
    e.preventDefault();
    if (!validate()) return;
    if (!isActivated) {
      const id = nsToast.push({
        variant: 'card',
        type: 'info',
        title: 'Account Not Activated',
        message: 'You must complete account activation to purchase AI credits.',
        action: 'Activate Now',
        onAction: () => { 
          toastsIdRef.current.forEach((id) => {
            nsToast.dismiss(id)
          });
          setMainTab('activation')
        },
        duration: 5000,
      });
      toastsIdRef.current.push(id)
      return
    }
    setLoading(true);
    try {
      const response = await fetchWithAuth(token, setToken, '/api/payment', {
        method: 'POST',
        body: JSON.stringify({ email, type: `ai_pack_${pack.price.toLocaleString()}` }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw { status: response.status, error: data.message || data.error || 'Something went wrong. Try again.' };
      }
      toast.push({ type: 'info', title: 'Redirecting to Paystack…', message: `Purchasing ${pack.credits} credits for ₦${pack.price.toLocaleString()}.` });
      setTimeout(() => { window.location.href = data.authorization_url; }, 1000);
    } catch (err) {
      if (!err.status) {
        toast.push({ type: 'error', title: 'Connection failed', message: 'Check your internet and try again.' });
      } else if (err.status >= 500) {
        toast.push({ type: 'error', title: 'Server error', message: 'Something went wrong on our end. Please try again shortly.' });
      } else {
        toast.push({ type: 'error', title: 'Payment error', message: err.error });
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="payment-panel">
      <div className="payment-label" style={{ marginBottom: '1rem' }}>Choose a credit pack</div>
      <div className="payment-credit-grid">
        {CREDIT_PACKS.map((p, i) => (
          <div key={i} className={'payment-credit-pack' + (selectedPack === i ? ' selected' : '')} onClick={() => setSelectedPack(i)}>
            {p.badge && <div className="payment-credit-pack-badge">{p.badge}</div>}
            <div className="payment-credit-pack-amount">{p.credits}</div>
            <div className="payment-credit-pack-label">AI Credits</div>
            <div className="payment-credit-pack-price">₦{p.price.toLocaleString()}</div>
          </div>
        ))}
      </div>

      <div className="payment-summary">
        <div className="payment-summary-icon"><i className="fa-solid fa-robot"></i></div>
        <div className="payment-summary-info">
          <div className="payment-summary-label">{pack.label} pack — {pack.credits} credits</div>
          <div className="payment-summary-amount">₦{pack.price.toLocaleString()}</div>
          <div className="payment-summary-desc">₦{(pack.price / pack.credits).toFixed(1)} per credit · Added instantly · Never expire</div>
        </div>
      </div>

      <form onSubmit={handlePay} noValidate>
        <div className="payment-form-group">
          <label className="payment-label" htmlFor="cr-email">Email Address</label>
          <input id="cr-email" type="email" className={'payment-input' + (error ? ' payment-input-error' : '')} placeholder="you@example.com" value={email} onChange={e => { setEmail(e.target.value); if (error) setError(''); }} autoComplete="email" />
          {error && <div className="payment-field-error"><i className="fa-solid fa-circle-exclamation"></i> {error}</div>}
        </div>

        <div className="payment-form-group">
          <label className="payment-label">Amount (NGN)</label>
          <input type="text" className="payment-input" value={'₦' + pack.price.toLocaleString()} disabled />
        </div>

        <button type="submit" className="payment-submit" disabled={loading}>
          {loading ? <><span className="payment-spinner" /> Redirecting…</> : <><i className="fa-solid fa-credit-card"></i> Pay ₦{pack.price.toLocaleString()} with Paystack</>}
        </button>
      </form>

      <div className="payment-security">
        <i className="fa-solid fa-shield-halved"></i> Secured by Paystack · 256-bit SSL encryption
      </div>

      <div className="payment-note">
        Credits are added to the account matching the email you enter. Purchase is non-refundable once processed.
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────
function PaymentInner() {
  const { isActivated } = useContext(UserContext)
  const [mainTab, setMainTab] = useState(isActivated ? 'credits' : 'activation');
  const [innerTab, setInnerTab] = useState('pay');
  const [blockPayment, setBlockPayment] = useState(false)
  const toast = useToastState();

  function switchMain(tab) {
    setMainTab(tab);
    setInnerTab('pay');
  }

  if (blockPayment) {
    return <Message title="Account Already Activated" message="Your account is activated and ready to use. No further action needed." action={() => setBlockPayment(false)} btnLabel="Go Back" />
  }

  return (
    <div className="payment-page-wrap">
      <title>Payment — CBT Pro</title>

      <ToastPortal toasts={toast.toasts} onDismiss={toast.dismiss} />

      {/* Nav Placeholder */}
      <nav style={{ background: '#fff', borderBottom: '1px solid #e2e8f0' }}>
        <div className="payment-nav-container">
          <Link to="/" className="logo">CBT Pro</Link>
        </div>
      </nav>

      {/* Header */}
      <div className="payment-nav-container">
        <div className="payment-breadcrumb">
          <Link to="/">Home</Link> / Payment
        </div>
        <h1 className="payment-page-title">
          {mainTab === 'activation' ? 'Activate Your App' : 'Buy AI Credits'}
        </h1>
      </div>

      <div className="payment-container">
        {/* Main tabs */}
        <div className="payment-main-tabs">
          <button className={'payment-main-tab' + (mainTab === 'activation' ? ' active' : '')} onClick={() => switchMain('activation')}>
            <i className="fa-solid fa-unlock-keyhole"></i> App Activation
          </button>
          <button className={'payment-main-tab' + (mainTab === 'credits' ? ' active' : '')} onClick={() => switchMain('credits')}>
            <i className="fa-solid fa-robot"></i> AI Credits
          </button>
        </div>

        {/* Payment Card Wrapper */}
        <div className="payment-card">
          <div className="payment-inner-tabs">
            <button className={'payment-inner-tab' + (innerTab === 'pay' ? ' active' : '')} onClick={() => setInnerTab('pay')}>
              <i className="fa-regular fa-credit-card"></i> {mainTab === 'activation' ? 'Make Payment' : 'Buy Credits'}
            </button>
            <button className={'payment-inner-tab' + (innerTab === 'guide' ? ' active' : '')} onClick={() => setInnerTab('guide')}>
              <i className="fa-solid fa-book-open"></i> How it works
            </button>
          </div>

          {mainTab === 'activation'
            ? (innerTab === 'pay' ? <ActivationForm toast={toast} setBlockPayment={setBlockPayment} /> : <ActivationGuide />)
            : (innerTab === 'pay' ? <CreditsForm toast={toast} setMainTab={setMainTab} /> : <CreditsGuide />)
          }
        </div>
      </div>
    </div>
  );
}

export function Payment() {
  return (
    <ToastProvider position="top-right">
      <PaymentInner />
    </ToastProvider>
  );
}
