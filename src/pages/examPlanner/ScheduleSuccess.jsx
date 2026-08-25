import { Link } from "react-router";
import { formatDateTime, addMinutes } from '../../scripts/utilis/dateTimeOp';
import { EDIT_LOCK_MINUTES, GRACE_WINDOW_MINUTES } from './constant/time';
import "./ScheduleSuccess.css";


function buildTimeline(examDate) {
  const start = new Date(examDate);
  const editLocksAt = addMinutes(start, -EDIT_LOCK_MINUTES);
  const graceEndsAt = addMinutes(start, GRACE_WINDOW_MINUTES);

  return [
    {
      key: "open",
      icon: "fa-pen",
      title: "Freely editable",
      when: `Now until ${formatDateTime(editLocksAt).join(', ')}`,
      text: "Change any detail — subjects, duration, target score — or reschedule the date entirely.",
      tone: "neutral",
    },
    {
      key: "locked",
      icon: "fa-lock",
      title: "Locked for editing",
      when: `From ${formatDateTime(editLocksAt).join(', ')}`,
      text: `Starting ${EDIT_LOCK_MINUTES} minutes before your exam, details can no longer be changed. You can still cancel it if needed.`,
      tone: "warn",
    },
    {
      key: "start",
      icon: "fa-bolt",
      title: "Exam starts",
      when: formatDateTime(start),
      text: "Your exam becomes available. Open it and tap Start Exam whenever you're ready.",
      tone: "primary",
    },
    {
      key: "grace",
      icon: "fa-calendar-xmark",
      title: "Grace window closes",
      when: formatDateTime(graceEndsAt),
      text: `You have ${GRACE_WINDOW_MINUTES} minutes after the start time to tap Start Exam. After that, it's marked as Missed.`,
      tone: "danger",
    },
  ];
}

function TimelineStep({ step, isLast }) {
  return (
    <div className="schedulesuccess-step">
      <div className="schedulesuccess-step__rail">
        <div className={`schedulesuccess-step__dot schedulesuccess-step__dot--${step.tone}`}>
          <i className={`fa-solid ${step.icon}`} aria-hidden="true"></i>
        </div>
        {!isLast && <div className="schedulesuccess-step__line"></div>}
      </div>
      <div className="schedulesuccess-step__body">
        <div className="schedulesuccess-step__top">
          <span className="schedulesuccess-step__title">{step.title}</span>
          <span className={`schedulesuccess-step__when schedulesuccess-step__when--${step.tone}`}>
            {step.when}
          </span>
        </div>
        <p className="schedulesuccess-step__text">{step.text}</p>
      </div>
    </div>
  );
}

export default function ScheduleSuccess({ exam }) {
  const timeline = buildTimeline(exam.examDate);

  return (
    <div className="schedulesuccess-page no-select">
      {/* Success header */}
      <header className="schedulesuccess-header">
        <div className="schedulesuccess-header__icon">
          <i className="fa-solid fa-check" aria-hidden="true"></i>
        </div>
        <span className="schedulesuccess-header__eyebrow">Exam Scheduled</span>
        <h1 className="schedulesuccess-header__title">{exam.name}</h1>
        <p className="schedulesuccess-header__subtitle">
          {formatDateTime(new Date(exam.examDate))} · Target {exam.targetScore}
        </p>
      </header>

      {/* Timeline */}
      <section className="schedulesuccess-section">
        <h2 className="schedulesuccess-section__title">How This Works</h2>
        <div className="schedulesuccess-timeline">
          {timeline.map((step, i) => (
            <TimelineStep key={step.key} step={step} isLast={i === timeline.length - 1} />
          ))}
        </div>
      </section>

      {/* Key numbers, called out plainly */}
      <section className="schedulesuccess-callout">
        <div className="schedulesuccess-callout__item">
          <span className="schedulesuccess-callout__value">{EDIT_LOCK_MINUTES} min</span>
          <span className="schedulesuccess-callout__label">before exam — editing locks</span>
        </div>
        <div className="schedulesuccess-callout__divider"></div>
        <div className="schedulesuccess-callout__item">
          <span className="schedulesuccess-callout__value">{GRACE_WINDOW_MINUTES} min</span>
          <span className="schedulesuccess-callout__label">after start — or it's marked missed</span>
        </div>
      </section>

      {/* Actions */}
      <div className="schedulesuccess-actions">
        <Link className="schedulesuccess-btn schedulesuccess-btn--primary" to="/exam-planner">
          <i className="fa-solid fa-calendar-days" aria-hidden="true"></i>
          View My Exams
        </Link>
        <Link className="schedulesuccess-btn schedulesuccess-btn--ghost" to="/exam-planner/schedule">
          <i className="fa-solid fa-plus" aria-hidden="true"></i>
          Schedule Another
        </Link>
      </div>
    </div>
  );
}
