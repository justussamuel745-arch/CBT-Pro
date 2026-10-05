import { useState, useEffect, useRef } from "react";
import { useNotifications } from '@/context/NotificationContext';
import { detectEnvironment } from '@lib/utils/pwaInstall.js';
import { getInstallGuidance } from '@/components/common/PwaInstall';
import "./DashInstall.css";


export default function DashInstall() {
  const { pwa } = useNotifications();
  const { canInstall, isInstalled, install, installing } = pwa;
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  const guidance = getInstallGuidance(detectEnvironment(), canInstall);

  // Close on outside tap or Escape
  useEffect(() => {
    if (!open) return;

    function onPointerDown(e) {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false);
    }
    function onKeyDown(e) {
      if (e.key === "Escape") setOpen(false);
    }

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  // Native prompt available: install straight away. Otherwise toggle the guide.
  async function handleClick() {
    if (guidance.mode === "auto") {
      setOpen(false);
      try {
        await install();
      } catch(err){
        console.log(err)
      }
      return;
    }
    setOpen((prev) => !prev);
  }

  if (isInstalled) return null;

  return (
    <div className="dash-install" ref={rootRef}>
      <button
        type="button"
        className={`dash-icon-btn dash-install-btn${open ? " dash-install-btn-open" : ""}`}
        aria-label="Install app"
        aria-expanded={open}
        aria-controls="dash-install-panel"
        title={installing ? "Installing…" : "Install app"}
        disabled={installing}
        onClick={handleClick}
      >
        <i className={installing ? "fa-solid fa-spinner fa-spin" : "fa-solid fa-download"}></i>
      </button>

      {open && guidance.mode !== "auto" && (
        <div
          id="dash-install-panel"
          className="dash-install-panel"
          role="dialog"
          aria-label="Install CBT Pro"
        >
          <div className="dash-install-head">
            <span className="dash-install-title">{guidance.label}</span>
            <button
              type="button"
              className="dash-install-close"
              aria-label="Close"
              onClick={() => setOpen(false)}
            >
              <i className="fa-solid fa-xmark"></i>
            </button>
          </div>

          {guidance.mode === "guide" && (
            <ol className="dash-install-steps">
              {guidance.steps.map((step, i) => (
                <li className="dash-install-step" key={i}>
                  <span className="dash-install-num">{i + 1}</span>
                  <span className="dash-install-icon">{step.icon}</span>
                  <span className="dash-install-text">{step.text}</span>
                </li>
              ))}
            </ol>
          )}

          {guidance.mode !== "guide" && (
            <p className="dash-install-note">
              <i
                className={`fa-solid ${guidance.mode === "redirect" ? "fa-compass" : "fa-bookmark"}`}
              ></i>
              <span>{guidance.message}</span>
            </p>
          )}
        </div>
      )}
    </div>
  );
}
