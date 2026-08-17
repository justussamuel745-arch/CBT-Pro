import { useEffect, useState } from "react";
import "./Offline.css";

export function Offline({
  onRetry = () => {}
}) {
  const [retrying, setRetrying] = useState(false);
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== "undefined" ? navigator.onLine : true
  );

  useEffect(() => {
    function goOnline() {
      setIsOnline(true);
    }
    function goOffline() {
      setIsOnline(false);
    }
    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);
    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, []);

  function handleRetry() {
    setRetrying(true);
    // Give the icon a moment to animate before actually retrying,
    // so a near-instant failure doesn't feel like nothing happened.
    setTimeout(() => {
      onRetry()
      setRetrying(false);
    }, 600);
  }

  return (
    <div className="offline-page no-select">
      <div className="offline-card">
        <div className={`offline-icon${retrying ? " offline-icon--spinning" : ""}`}>
          <i
            className={`fa-solid ${isOnline ? "fa-wifi" : "fa-ban"}`}
            aria-hidden="true"
          ></i>
        </div>

        <span className={`offline-status${isOnline ? " offline-status--back" : ""}`}>
          <span className="offline-status__dot"></span>
          {isOnline ? "Connection restored" : "No internet connection"}
        </span>

        <h1 className="offline-title">
          {isOnline ? "You're back online" : "You're offline"}
        </h1>
        <p className="offline-text">
          {isOnline
            ? "Your connection is back. Tap below to continue where you left off."
            : "Check your Wi-Fi or mobile data and try again. Anything you'd already loaded is still available below."}
        </p>

        <button className="offline-retry" onClick={handleRetry} disabled={retrying}>
          <i
            className={`fa-solid fa-arrow-rotate-right${retrying ? " offline-retry__spin" : ""}`}
            aria-hidden="true"
          ></i>
          {retrying ? "Checking..." : "Try Again"}
        </button>

        <div className="offline-available">
          <span className="offline-available__label">Still available offline</span>
          <div className="offline-available__list">
            <div className="offline-available__item">
              <i className="fa-solid fa-book-open" aria-hidden="true"></i>
              Previously loaded study questions
            </div>
            <div className="offline-available__item">
              <i className="fa-solid fa-bookmark" aria-hidden="true"></i>
              Bookmarked questions
            </div>
            <div className="offline-available__item">
              <i className="fa-solid fa-clock-rotate-left" aria-hidden="true"></i>
              Your test history
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
