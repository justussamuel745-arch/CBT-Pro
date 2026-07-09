import { useEffect, useState } from "react";
import { updateSW } from "../main";
import "./PWAUpdateToast.css";

export default function PWAUpdateToast() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const handleUpdate = () => {
      setShow(true);
    };

    window.addEventListener(
      "pwa-update-available",
      handleUpdate
    );

    return () => {
      window.removeEventListener(
        "pwa-update-available",
        handleUpdate
      );
    };
  }, []);

  if (!show) return null;

  async function handleUpdate() {
    await updateSW(true);
  }

  function handleLater() {
    setShow(false);
  }

  return (
    <div className="pwa-update-toast">
      <div className="pwa-update-title">
        🚀 Update Available
      </div>

      <div className="pwa-update-text">
        A newer version of CBT Pro is available.
      </div>

      <div className="pwa-update-actions">
        <button
          className="pwa-update-btn secondary"
          onClick={handleLater}
        >
          Later
        </button>

        <button
          className="pwa-update-btn primary"
          onClick={handleUpdate}
        >
          Update
        </button>
      </div>
    </div>
  );
}