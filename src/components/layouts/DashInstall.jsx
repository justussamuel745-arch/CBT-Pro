import { useEffect, useRef } from "react";
import { useInstallAction } from "@/hooks/useInstallAction";
import { InstallGuide } from "@/components/common/InstallGuide";
import "./DashInstall.css";

export default function DashInstall() {
  const { guidance, isAuto, isInstalled, installing, open, close, trigger } = useInstallAction();
  const rootRef = useRef(null);

  // Close on outside tap or Escape
  useEffect(() => {
    if (!open) return;

    function onPointerDown(e) {
      if (rootRef.current && !rootRef.current.contains(e.target)) close();
    }
    function onKeyDown(e) {
      if (e.key === "Escape") close();
    }

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, close]);

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
        onClick={trigger}
      >
        <i className={installing ? "fa-solid fa-spinner fa-spin" : "fa-solid fa-download"}></i>
      </button>

      {open && !isAuto && (
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
              onClick={close}
            >
              <i className="fa-solid fa-xmark"></i>
            </button>
          </div>

          <InstallGuide guidance={guidance} />
        </div>
      )}
    </div>
  );
}