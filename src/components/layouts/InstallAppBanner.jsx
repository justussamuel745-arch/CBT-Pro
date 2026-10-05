import { useState, useEffect } from "react";
import { useNotifications } from '@/context/NotificationContext';
import { detectEnvironment } from '@lib/utils/pwaInstall';
import { getInstallGuidance } from '../common/PwaInstall';
import './InstallAppBanner.css';

// ─────────────────────────────────────────────────────────────
// ICONS
// ─────────────────────────────────────────────────────────────
const Ic = {
  Download: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>,
  X: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12" /></svg>,
  Share: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" /><polyline points="16 6 12 2 8 6" /><line x1="12" y1="2" x2="12" y2="15" /></svg>,
  Plus: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round"><rect x="3" y="3" width="18" height="18" rx="4" /><line x1="12" y1="8" x2="12" y2="16" /><line x1="8" y1="12" x2="16" y2="12" /></svg>,
  Check: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>,
  Wifi: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12.55a11 11 0 0 1 14.08 0" /><path d="M1.42 9a16 16 0 0 1 21.16 0" /><path d="M8.53 16.11a6 6 0 0 1 6.95 0" /><line x1="12" y1="20" x2="12.01" y2="20" /></svg>,
  Bolt: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>,
  Bell: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>,
  Smartphone: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" /><line x1="12" y1="18" x2="12.01" y2="18" /></svg>,
  Menu: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round"><line x1="4" y1="6" x2="20" y2="6" /><line x1="4" y1="12" x2="20" y2="12" /><line x1="4" y1="18" x2="20" y2="18" /></svg>,
  MoreVert: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round"><circle cx="12" cy="5" r="1.2" fill="currentColor" /><circle cx="12" cy="12" r="1.2" fill="currentColor" /><circle cx="12" cy="19" r="1.2" fill="currentColor" /></svg>,
  Compass: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" /></svg>,
  Bookmark: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21 12 16 5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" /></svg>,
};

const DISMISS_DURATION = 24 * 60 * 60 * 1000; // 1 day

// ─────────────────────────────────────────────────────────────
// FLOATING BANNER — the recommended placement
// ─────────────────────────────────────────────────────────────
export function InstallAppBanner() {
  const { pwa } = useNotifications()
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [showGuide, setShowGuide] = useState(false);

  const { canInstall, isInstalled, install, installing } = pwa;
  const env = detectEnvironment();
  const guidance = getInstallGuidance(env, canInstall);

  useEffect(() => {
    const dismissedAt = Number(localStorage.getItem("pwa-install-dismissed"));

    if (dismissedAt) {
      const expired = Date.now() - dismissedAt > DISMISS_DURATION;

      if (!expired) {
        setDismissed(true);
        return;
      }
      localStorage.removeItem("pwa-install-dismissed");
    }

    if (isInstalled) return;

    const timer = setTimeout(() => setVisible(true), 2500);
    return () => clearTimeout(timer);
  }, [isInstalled]);

  useEffect(() => {
    function onAppInstalled() {
      localStorage.setItem("pwa-install-dismissed", Date.now().toString());
      setDismissed(true);
      setVisible(false);
      setShowGuide(false);
    }
    window.addEventListener("appinstalled", onAppInstalled);
    return () => window.removeEventListener("appinstalled", onAppInstalled);
  }, []);

  function handleClose() {
    setVisible(false);
    setShowGuide(false);
    localStorage.setItem("pwa-install-dismissed", Date.now().toString());
    setTimeout(() => setDismissed(true), 400);
  }

  async function handleInstall() {
    // Native install prompt available — trigger it directly, no guide needed.
    if (guidance.mode === "auto") {
      const installed = await install();
      if (installed) handleClose();
      return;
    }
    // Otherwise reveal the accurate manual steps for this browser.
    setShowGuide((prev) => !prev);
  }

  if (dismissed || isInstalled) return null;

  const buttonLabel = installing ? "Installing…" : guidance.mode === "auto" ? "Install" : guidance.label;

  return (
    <div className={`pwa-install-banner${visible ? ' pwa-visible' : ''}`}>
      <div className="pwa-install-stripe" />
      <div className="pwa-install-body">
        <div className="pwa-install-icon">
          <Ic.Smartphone />
        </div>
        <div className="pwa-install-text">
          <div className="pwa-install-title">Install CBT Pro</div>
          <div className="pwa-install-sub">Install CBT Pro for one-tap access, offline practice, faster loading, and a distraction-free exam experience.</div>
        </div>
        <div className="pwa-install-actions">
          <button className="pwa-install-btn" style={{ opacity: installing ? '0.5' : '1'}} disabled={installing} onClick={handleInstall}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
              <Ic.Download />
              {buttonLabel}
            </span>
          </button>
          <button className="pwa-install-close" onClick={handleClose} aria-label="Dismiss">
            <Ic.X />
          </button>
        </div>
      </div>

      {showGuide && guidance.mode === "guide" && (
        <div className="pwa-ios-sheet">
          {guidance.steps.map((step, i) => (
            <div className="pwa-ios-step" key={i}>
              <span className="pwa-ios-num">{i + 1}</span>
              <span className="pwa-ios-icon">{step.icon}</span>
              {step.text}
            </div>
          ))}
        </div>
      )}

      {showGuide && guidance.mode === "redirect" && (
        <div className="pwa-ios-sheet">
          <div className="pwa-ios-step">
            <span className="pwa-ios-icon"><Ic.Compass /></span>
            {guidance.message}
          </div>
        </div>
      )}

      {showGuide && guidance.mode === "unsupported" && (
        <div className="pwa-ios-sheet">
          <div className="pwa-ios-step">
            <span className="pwa-ios-icon"><Ic.Bookmark /></span>
            {guidance.message}
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// INLINE CARD — alternative, embed inside a <section> on the homepage
// ─────────────────────────────────────────────────────────────
export function InstallAppCard() {
  const { pwa } = useNotifications()
  const { canInstall, isInstalled, install, installing } = pwa;
  const [showGuide, setShowGuide] = useState(false);

  const env = detectEnvironment();
  const guidance = getInstallGuidance(env, canInstall);

  async function handleInstall() {
    if (guidance.mode === "auto") {
      await install();
      return;
    }
    setShowGuide((prev) => !prev);
  }

  if (isInstalled) return null;

  const buttonLabel = guidance.mode === "auto" ? "Install App" : guidance.label;

  return (
    <div className="pwa-install-card">
      <div className="pwa-install-card-icon">
        <Ic.Smartphone />
      </div>

      <div className="pwa-install-card-body">
        <h3 className="pwa-install-card-title">Get CBT Pro App</h3>

        <p className="pwa-install-card-desc">
          Install CBT Pro for faster access, offline practice,
          and a full-screen exam experience.
        </p>

        <div className="pwa-install-card-features">
          <span className="pwa-feature-chip"><Ic.Check />Works offline</span>
          <span className="pwa-feature-chip"><Ic.Bolt />Instant launch</span>
          <span className="pwa-feature-chip"><Ic.Bell />Exam reminders</span>
        </div>

        <button
          className="pwa-install-btn"
          onClick={handleInstall}
          style={{ padding: "0.65rem 1.25rem", fontSize: "0.85rem", opacity: installing ? '0.5' : '1' }}
          disabled={installing}
        >
          <span style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem" }}>
            <Ic.Download />
            {buttonLabel}
          </span>
        </button>

        {showGuide && guidance.mode === "guide" && (
          <div className="pwa-card-guide">
            {guidance.steps.map((step, i) => (
              <p key={i}>{i + 1}. {step.text}</p>
            ))}
          </div>
        )}

        {showGuide && (guidance.mode === "redirect" || guidance.mode === "unsupported") && (
          <div className="pwa-card-guide">
            <p>{guidance.message}</p>
          </div>
        )}
      </div>
    </div>
  );
}
