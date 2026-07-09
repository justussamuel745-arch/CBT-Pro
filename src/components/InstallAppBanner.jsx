import { useState, useEffect } from "react";
import usePWAInstall from "../hooks/usePWAInstall";
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
};

function getBrowser() {
  const ua = navigator.userAgent;

  if (/SamsungBrowser/i.test(ua)) return "samsung";
  if (/Edg/i.test(ua)) return "edge";
  if (/Chrome/i.test(ua) && !/Edg/i.test(ua)) return "chrome";
  if (/Safari/i.test(ua) && !/Chrome/i.test(ua)) return "safari";

  return "other";
}

const DISMISS_DURATION = 24 * 60 * 60 * 1000; // 1 days

// ─────────────────────────────────────────────────────────────
// FLOATING BANNER — the recommended placement
// ─────────────────────────────────────────────────────────────
export function InstallAppBanner() {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [showIosSteps, setShowIosSteps] = useState(false);

  const {
    canInstall,
    isInstalled,
    install,
  } = usePWAInstall();
  const browser = getBrowser();

  useEffect(() => {
    const dismissedAt = Number(
      localStorage.getItem("pwa-install-dismissed")
    );

    if (dismissedAt) {
      const expired =
        Date.now() - dismissedAt > DISMISS_DURATION;

      if (!expired) {
        setDismissed(true);
        return;
      }

      // Expired, allow the banner to show again
      localStorage.removeItem("pwa-install-dismissed");
    }

    if (isInstalled) {
      return;
    }

    const timer = setTimeout(() => {
      setVisible(true);
    }, 2500);

    return () => clearTimeout(timer);
  }, [isInstalled]);

  useEffect(() => {
    function onAppInstalled() {
      localStorage.setItem(
        "pwa-install-dismissed",
        Date.now().toString()
      );
      setDismissed(true);
      setVisible(false);
      setShowIosSteps(false);
    }

    window.addEventListener("appinstalled", onAppInstalled);

    return () => {
      window.removeEventListener("appinstalled", onAppInstalled);
    };
  }, []);

  function handleClose() {
    setVisible(false);
    setShowIosSteps(false);
    localStorage.setItem(
      "pwa-install-dismissed",
      Date.now().toString()
    );
    setTimeout(() => setDismissed(true), 400);
  }

  async function handleInstall() {
    // Native install prompt available
    if (canInstall) {
      const installed = await install();

      if (installed) {
        handleClose();
      }

      return;
    }

    // Otherwise show manual instructions
    setShowIosSteps((prev) => !prev);
  }

  if (dismissed || isInstalled) {
    return null;
  }

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
          <button className="pwa-install-btn" onClick={handleInstall}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
              <Ic.Download />
              {canInstall ? "Install" : "Installation Guide"}
            </span>
          </button>
          <button className="pwa-install-close" onClick={handleClose} aria-label="Dismiss">
            <Ic.X />
          </button>
        </div>
      </div>

      {/* iOS manual steps — Safari has no native install prompt */}
      {showIosSteps && (
        <div className="pwa-ios-sheet">

          {browser === "safari" && (
            <>
              <div className="pwa-ios-step">
                <span className="pwa-ios-num">1</span>
                Tap the <span className="pwa-ios-icon"><Ic.Share /></span> Share button.
              </div>

              <div className="pwa-ios-step">
                <span className="pwa-ios-num">2</span>
                Tap <strong>Add to Home Screen</strong>.
              </div>

              <div className="pwa-ios-step">
                <span className="pwa-ios-num">3</span>
                Tap <strong>Add</strong>.
              </div>
            </>
          )}

          {browser === "chrome" && (
            <>
              <div className="pwa-ios-step">
                <span className="pwa-ios-num">1</span>
                Tap the <strong>⋮</strong> menu in the top-right.
              </div>

              <div className="pwa-ios-step">
                <span className="pwa-ios-num">2</span>
                Tap <strong>Install app</strong>.
              </div>

              <div className="pwa-ios-step">
                <span className="pwa-ios-num">3</span>
                Confirm by tapping <strong>Install</strong>.
              </div>
            </>
          )}

          {browser === "edge" && (
            <>
              <div className="pwa-ios-step">
                <span className="pwa-ios-num">1</span>
                Tap the menu.
              </div>

              <div className="pwa-ios-step">
                <span className="pwa-ios-num">2</span>
                Tap <strong>Install this site as an app</strong>.
              </div>
            </>
          )}

          {browser === "samsung" && (
            <>
              <div className="pwa-ios-step">
                <span className="pwa-ios-num">1</span>
                Tap the <strong>☰ Menu</strong> at the bottom of Samsung Internet.
              </div>

              <div className="pwa-ios-step">
                <span className="pwa-ios-num">2</span>
                Tap <strong>Add page to</strong>.
              </div>

              <div className="pwa-ios-step">
                <span className="pwa-ios-num">3</span>
                Choose <strong>Home screen</strong>.
              </div>
            </>
          )}

          {browser === "other" && (
            <div className="pwa-ios-step">
              Open your browser menu and look for
              <strong> Install App</strong> or
              <strong> Add to Home Screen</strong>.
            </div>
          )}

        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// INLINE CARD — alternative, embed inside a <section> on the homepage
// Drop this into HomePage.jsx wherever a card fits, e.g. next to
// the simulator/syllabus grid.
// ─────────────────────────────────────────────────────────────
export function InstallAppCard() {
  const {
    canInstall,
    isInstalled,
    install,
  } = usePWAInstall();

  const [showGuide, setShowGuide] = useState(false);

  const browser = getBrowser();

  async function handleInstall() {

    if (canInstall) {
      const installed = await install();

      if (installed) {
        return;
      }

      return;
    }

    setShowGuide((prev) => !prev);
  }


  if (isInstalled) {
    return null;
  }


  return (
    <div className="pwa-install-card">

      <div className="pwa-install-card-icon">
        <Ic.Smartphone />
      </div>


      <div className="pwa-install-card-body">

        <h3 className="pwa-install-card-title">
          Get CBT Pro App
        </h3>


        <p className="pwa-install-card-desc">
          Install CBT Pro for faster access, offline practice,
          and a full-screen exam experience.
        </p>


        <div className="pwa-install-card-features">

          <span className="pwa-feature-chip">
            <Ic.Check />
            Works offline
          </span>

          <span className="pwa-feature-chip">
            <Ic.Bolt />
            Instant launch
          </span>

          <span className="pwa-feature-chip">
            <Ic.Bell />
            Exam reminders
          </span>

        </div>


        <button
          className="pwa-install-btn"
          onClick={handleInstall}
          style={{
            padding: "0.65rem 1.25rem",
            fontSize: "0.85rem"
          }}
        >

          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.4rem"
            }}
          >

            <Ic.Download />

            {canInstall
              ? "Install App"
              : "How to Install"}

          </span>

        </button>


        {showGuide && (

          <div className="pwa-card-guide">


            {browser === "samsung" && (
              <>
                <p>1. Tap ☰ Menu</p>
                <p>2. Tap Add page to</p>
                <p>3. Choose Home screen</p>
              </>
            )}


            {browser === "chrome" && (
              <>
                <p>1. Tap ⋮ menu</p>
                <p>2. Select Install app</p>
              </>
            )}


            {browser === "safari" && (
              <>
                <p>1. Tap Share button</p>
                <p>2. Select Add to Home Screen</p>
              </>
            )}


            {browser === "edge" && (
              <>
                <p>1. Open menu</p>
                <p>2. Select Install this app</p>
              </>
            )}


            {browser === "other" && (
              <p>
                Open browser menu and choose
                "Add to Home Screen".
              </p>
            )}


          </div>

        )}

      </div>

    </div>
  );
}
