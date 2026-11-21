import { useState, useEffect } from "react";
import { useInstallAction } from "@/hooks/useInstallAction";
import { InstallGuide } from "@/components/common/InstallGuide";
import "./InstallAppBanner.css";

// ─────────────────────────────────────────────────────────────
// ICONS
// ─────────────────────────────────────────────────────────────
const Ic = {
  Download: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>,
  X: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12" /></svg>,
  Check: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>,
  Bolt: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>,
  Bell: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>,
  Smartphone: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" /><line x1="12" y1="18" x2="12.01" y2="18" /></svg>,
};

const DISMISS_KEY = "pwa-install-dismissed";
const DISMISS_DURATION = 24 * 60 * 60 * 1000; // 1 day

// ─────────────────────────────────────────────────────────────
// SHARED BUTTON — used by both the banner and the card
// ─────────────────────────────────────────────────────────────
function InstallButton({ label, installing, expanded, onClick, className = "" }) {
  return (
    <button
      type="button"
      className={`pwa-install-btn ${className}`.trim()}
      disabled={installing}
      aria-expanded={expanded}
      onClick={onClick}
    >
      <span className="pwa-install-btn-inner">
        <Ic.Download />
        {label}
      </span>
    </button>
  );
}

// ─────────────────────────────────────────────────────────────
// FLOATING BANNER — the recommended placement
// ─────────────────────────────────────────────────────────────
export function InstallAppBanner() {
  const { guidance, isAuto, isInstalled, installing, open, close, trigger } = useInstallAction();
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const dismissedAt = Number(localStorage.getItem(DISMISS_KEY));

    if (dismissedAt) {
      const expired = Date.now() - dismissedAt > DISMISS_DURATION;

      if (!expired) {
        setDismissed(true);
        return;
      }
      localStorage.removeItem(DISMISS_KEY);
    }

    if (isInstalled) return;

    const timer = setTimeout(() => setVisible(true), 2500);
    return () => clearTimeout(timer);
  }, [isInstalled]);

  // Accepted native install: hide the banner for good.
  useEffect(() => {
    function onAppInstalled() {
      localStorage.setItem(DISMISS_KEY, Date.now().toString());
      setDismissed(true);
      setVisible(false);
      close();
    }
    window.addEventListener("appinstalled", onAppInstalled);
    return () => window.removeEventListener("appinstalled", onAppInstalled);
  }, [close]);

  function handleClose() {
    setVisible(false);
    close();
    localStorage.setItem(DISMISS_KEY, Date.now().toString());
    setTimeout(() => setDismissed(true), 400);
  }

  if (dismissed || isInstalled) return null;

  const buttonLabel = installing ? "Installing…" : isAuto ? "Install" : guidance.label;

  return (
    <div className={`pwa-install-banner${visible ? " pwa-visible" : ""}`}>
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
          <InstallButton
            label={buttonLabel}
            installing={installing}
            expanded={isAuto ? undefined : open}
            onClick={trigger}
          />
          <button type="button" className="pwa-install-close" onClick={handleClose} aria-label="Dismiss">
            <Ic.X />
          </button>
        </div>
      </div>

      {open && !isAuto && (
        <div className="pwa-ios-sheet">
          <InstallGuide guidance={guidance} />
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// INLINE CARD — alternative, embed inside a <section> on the homepage
// ─────────────────────────────────────────────────────────────
export function InstallAppCard() {
  const { guidance, isAuto, isInstalled, installing, open, trigger } = useInstallAction();

  if (isInstalled) return null;

  const buttonLabel = isAuto ? "Install App" : guidance.label;

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

        <InstallButton
          className="pwa-install-btn-card"
          label={buttonLabel}
          installing={installing}
          expanded={isAuto ? undefined : open}
          onClick={trigger}
        />

        {open && !isAuto && (
          <div className="pwa-card-guide">
            <InstallGuide guidance={guidance} />
          </div>
        )}
      </div>
    </div>
  );
}