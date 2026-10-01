import { useEffect, useState, Fragment } from "react";
import "./Countdown.css";

/* ============================================================
   useLiveCountdown — ticks every second and recalculates the
   remaining time until targetDate.
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
   buildUpcomingUnits — decides which units to show on the full
   "Starts In" block, so it doesn't sit there reading "0 Days" for
   most of the countdown. Narrows as time runs down:
     days > 0    -> Days : Hours : Minutes
     hours > 0   -> Hours : Minutes
     minutes > 0 -> Minutes : Seconds
     otherwise   -> Seconds
   ============================================================ */
function buildUpcomingUnits(main) {
  if (main.days > 0) {
    return [
      { key: "days", value: main.days, label: "Days" },
      { key: "hours", value: main.hours, label: "Hours" },
      { key: "minutes", value: main.minutes, label: "Minutes" },
    ];
  }
  if (main.hours > 0) {
    return [
      { key: "hours", value: main.hours, label: "Hours" },
      { key: "minutes", value: main.minutes, label: "Minutes" },
    ];
  }
  if (main.minutes > 0) {
    return [
      { key: "minutes", value: main.minutes, label: "Minutes" },
      { key: "seconds", value: main.seconds, label: "Seconds" },
    ];
  }
  return [{ key: "seconds", value: main.seconds, label: "Seconds" }];
}

/* ============================================================
   Countdown — presentational component.
   variant="full"    -> big block used on exam detail / ready screens
   variant="compact" -> small inline chip used on dashboard cards

   States:
   1. Upcoming — before targetDate. Unchanged from before.
   2. Grace    — targetDate has passed, and a `graceEndsAt` timestamp
                 was provided and hasn't passed yet. Shows how long
                 the person has left to hit Start.
   3. Expired  — `graceEndsAt` has also passed. The window to start
                 is gone.

   Passing no `graceEndsAt` keeps the original two-state behavior
   (upcoming → ready banner) exactly as it was, so existing callers
   (ExamPlanner cards, ExamDetail without a grace prop) are unaffected.
   ============================================================ */
export default function Countdown({
  targetDate,
  graceEndsAt = null,
  variant = "full",
  readyLabel = "Your scheduled exam is ready",
  graceLabel = "Start within",
  expiredLabel = "You didn't start in time",
  onReady = () => {},
  onGraceExpired = () => {},
}) {
  const main = useLiveCountdown(targetDate);
  const grace = useLiveCountdown(graceEndsAt || targetDate);

  useEffect(() => {
    if (main.ready) onReady();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [main.ready]);

  useEffect(() => {
    if (graceEndsAt && grace.ready) onGraceExpired();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [graceEndsAt, grace.ready]);

  const hasGrace = Boolean(graceEndsAt);
  const inGraceWindow = main.ready && hasGrace && !grace.ready;
  const isExpired = main.ready && hasGrace && grace.ready;
  const isReady = main.ready && !hasGrace; // legacy ready state, no grace tracking

  const graceUrgent = grace.hours === 0 && grace.minutes < 10;

  /* ---------- Expired ---------- */
  if (isExpired) {
    return (
      <div className={"countdown countdown--expired countdown--compact"}>
        <i className="fa-solid fa-calendar-xmark" aria-hidden="true"></i>
        <span>{expiredLabel}</span>
      </div>
    );
  }

  /* ---------- Grace window ---------- */
  if (inGraceWindow) {
    if (variant === "compact") {
      return (
        <div
          className={`countdown countdown--grace-compact${
            graceUrgent ? " countdown--urgent" : ""
          }`}
        >
          <span className="countdown__grace-dot" aria-hidden="true"></span>
          {grace.hours > 0 && (
            <>
              <span className="countdown__num">{grace.hours}</span>
              <span className="countdown__unit">h</span>
            </>
          )}
          <span className="countdown__num">{grace.minutes}</span>
          <span className="countdown__unit">m left to start</span>
        </div>
      );
    }

    return (
      <div className={`countdown countdown--grace${graceUrgent ? " countdown--urgent" : ""}`}>
        <span className="countdown__title">
          <i className="fa-solid fa-bolt" aria-hidden="true"></i>
          {graceLabel}
        </span>
        <div className="countdown__units">
          {grace.hours > 0 && (
            <>
              <div className="countdown__unit-block">
                <span className="countdown__value">{grace.hours}</span>
                <span className="countdown__label">Hrs</span>
              </div>
              <span className="countdown__colon">:</span>
            </>
          )}
          <div className="countdown__unit-block">
            <span className="countdown__value">{grace.minutes}</span>
            <span className="countdown__label">Min</span>
          </div>
          <span className="countdown__colon">:</span>
          <div className="countdown__unit-block">
            <span className="countdown__value">{grace.seconds}</span>
            <span className="countdown__label">Sec</span>
          </div>
        </div>
      </div>
    );
  }

  /* ---------- Legacy ready state (no grace tracking) ---------- */
  if (isReady) {
    return (
      <div className={`countdown countdown--ready countdown--${variant}`}>
        <i className="fa-solid fa-bolt" aria-hidden="true"></i>
        <span>{readyLabel}</span>
      </div>
    );
  }

  /* ---------- Upcoming ---------- */
  if (variant === "compact") {
    return (
      <div className={`countdown countdown--compact${main.urgent ? " countdown--urgent" : ""}`}>
        <span className="countdown__num">{main.days}</span>
        <span className="countdown__unit">d</span>
        <span className="countdown__num">{main.hours}</span>
        <span className="countdown__unit">h</span>
      </div>
    );
  }

  const units = buildUpcomingUnits(main);

  return (
    <div className={`countdown countdown--full${main.urgent ? " countdown--urgent" : ""}`}>
      <span className="countdown__title">Starts In</span>
      <div className="countdown__units">
        {units.map((unit, i) => (
          <Fragment key={unit.key}>
            {i > 0 && <span className="countdown__colon">:</span>}
            <div className="countdown__unit-block">
              <span className="countdown__value">{unit.value}</span>
              <span className="countdown__label">{unit.label}</span>
            </div>
          </Fragment>
        ))}
      </div>
    </div>
  );
}
