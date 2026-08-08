import { useEffect, useState } from "react";
import "./Countdown.css";

/* ============================================================
   useLiveCountdown — ticks every second and recalculates the
   remaining time until targetDate. Replaces the one-shot
   useMemo version used earlier in ExamPlanner/ExamDetail.
   ============================================================ */
export function useLiveCountdown(targetDate) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  const diff = new Date(targetDate).getTime() - now;

  if (diff <= 0) {
    return { ready: true, days: 0, hours: 0, minutes: 0, seconds: 0, urgent: false };
  }

  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);

  return {
    ready: false,
    days,
    hours,
    minutes,
    seconds,
    urgent: diff < 86400000, // under 24h
  };
}

/* ============================================================
   Countdown — presentational component.
   variant="full"    -> "Starts In" block used on exam detail /
                         countdown screens (d / h / m, big type)
   variant="compact" -> small inline d/h chip used on cards
   ============================================================ */
export default function Countdown({
  targetDate,
  variant = "full",
  readyLabel = "Your scheduled exam is ready",
  onReady = () => {},
}) {
  const countdown = useLiveCountdown(targetDate);

  useEffect(() => {
    if (countdown.ready) onReady();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [countdown.ready]);

  if (countdown.ready) {
    return (
      <div className={`countdown countdown--ready countdown--${variant}`}>
        <i className="fa-solid fa-bolt" aria-hidden="true"></i>
        <span>{readyLabel}</span>
      </div>
    );
  }

  if (variant === "compact") {
    return (
      <div className={`countdown countdown--compact${countdown.urgent ? " countdown--urgent" : ""}`}>
        <span className="countdown__num">{countdown.days}</span>
        <span className="countdown__unit">d</span>
        <span className="countdown__num">{countdown.hours}</span>
        <span className="countdown__unit">h</span>
      </div>
    );
  }

  return (
    <div className={`countdown countdown--full${countdown.urgent ? " countdown--urgent" : ""}`}>
      <span className="countdown__title">Starts In</span>
      <div className="countdown__units">
        <div className="countdown__unit-block">
          <span className="countdown__value">{countdown.days}</span>
          <span className="countdown__label">Days</span>
        </div>
        <span className="countdown__colon">:</span>
        <div className="countdown__unit-block">
          <span className="countdown__value">{countdown.hours}</span>
          <span className="countdown__label">Hours</span>
        </div>
        <span className="countdown__colon">:</span>
        <div className="countdown__unit-block">
          <span className="countdown__value">{countdown.minutes}</span>
          <span className="countdown__label">Minutes</span>
        </div>
      </div>
    </div>
  );
}
