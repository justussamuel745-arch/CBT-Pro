import { useState, memo } from "react";
import Countdown, { useLiveCountdown } from "./Countdown";
import "./ExamDetail.css";

const REMINDER_LABELS = {
  none: "None",
  "1h": "1 hour before",
  "12h": "12 hours before",
  "1d": "1 day before",
  "3d": "3 days before",
  "1w": "1 week before",
};

function formatExamDate(iso) {
  const d = new Date(iso);
  const date = d.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  const time = d.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
  return { date, time };
}

function StatTile({ label, value, suffix }) {
  return (
    <div className="examdetail-stat">
      <span className="examdetail-stat__label">{label}</span>
      <span className="examdetail-stat__value">
        {value}
        {suffix && <span className="examdetail-stat__suffix">{suffix}</span>}
      </span>
    </div>
  );
}

function SettingRow({ label, on }) {
  return (
    <div className="examdetail-setting-row">
      <span className="examdetail-setting-row__label">{label}</span>
      <span
        className={`examdetail-pill${on ? " examdetail-pill--on" : " examdetail-pill--off"}`}
      >
        <i className={`fa-solid ${on ? "fa-check" : "fa-xmark"}`} aria-hidden="true"></i>
        {on ? "On" : "Off"}
      </span>
    </div>
  );
}

const ExamActions = memo(function ExamActions({ exam, ready, onCancel, onEdit, onStart }) {
  const countdown = useLiveCountdown(exam.examDate)
  function editExpires(){
    const { days, hours, minutes } = countdown
    if (!days && !hours){
      if (minutes <= EDIT_LOCK_MINUTES) return true
    }
    return false
  }
  
  return (
    <div className="examdetail-actions">
      {ready ? (
        <button className="examdetail-btn examdetail-btn--primary" onClick={() => onStart(exam)}>
          <i className="fa-solid fa-play" aria-hidden="true"></i>
          Start Exam
        </button>
      ) : (
        <>
          {
            !editExpires() && 
              (
                <button className="examdetail-btn examdetail-btn--ghost" onClick={() => onEdit(exam)}>
                  <i className="fa-solid fa-pen" aria-hidden="true"></i>
                  Edit
                </button>
              )
          }
          <button
            className="examdetail-btn examdetail-btn--ghost examdetail-btn--danger"
            onClick={() => onCancel(exam)}
          >
            <i className="fa-solid fa-trash" aria-hidden="true"></i>
            Cancel
          </button>
        </>
      )}
    </div>
  )
})

export function ExamDetail({
  exam = MOCK_EXAM,
  onClose = () => { },
  onEdit = () => { },
  onCancel = () => { },
  onStart = () => { },
}) {
  const { date, time } = formatExamDate(exam.examDate);
  const [ready, setReady] = useState(false);
  const totalScore = exam.totalScore || exam.subjects.length * 100;

  function graceEndsAt(examDate) {
    const dt = new Date(examDate);

    dt.setMinutes(dt.getMinutes() + 30);

    const pad = (n) => String(n).padStart(2, '0');

    return `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}T${pad(dt.getHours())}:${pad(dt.getMinutes())}`;
  }

  return (
    <div className="examdetail-overlay" role="dialog" aria-modal="true">
      <div className="examdetail-sheet">
        {/* Header */}
        <header className="examdetail-header">
          <div className="examdetail-header__text">
            <span className="examdetail-eyebrow">Scheduled Exam</span>
            <h2 className="examdetail-title">{exam.name}</h2>
            <div className="examdetail-datetime">
              <i className="fa-regular fa-calendar" aria-hidden="true"></i>
              <span>{date}</span>
              <span className="examdetail-dot" aria-hidden="true"></span>
              <i className="fa-regular fa-clock" aria-hidden="true"></i>
              <span>{time}</span>
            </div>
          </div>
          <button className="examdetail-close" onClick={onClose} aria-label="Close">
            <i className="fa-solid fa-xmark" aria-hidden="true"></i>
          </button>
        </header>

        {/* Scrollable content */}
        <div className="examdetail-scroll">
          {/* Countdown / ready state */}
          <div className="examdetail-hero">
            <Countdown
              targetDate={exam.examDate}
              graceEndsAt={graceEndsAt(exam.examDate)}
              readyLabel="Your scheduled exam is ready."
              onReady={() => setReady(true)}
            />
          </div>

          {/* Key stats */}
          <section className="examdetail-section">
            <div className="examdetail-stats">
              <StatTile label="Target Score" value={exam.targetScore} suffix={`/ ${totalScore}`} />
              <StatTile label="Questions" value={exam.numQuestions} />
              <StatTile label="Duration" value={exam.duration} suffix="min" />
              <StatTile label="Difficulty" value={exam.difficulty} />
            </div>
          </section>

          {/* Subjects */}
          <section className="examdetail-section">
            <h3 className="examdetail-section__title">Subjects</h3>
            <div className="examdetail-chips">
              {exam.subjects.map((s) => (
                <span key={s} className="examdetail-chip">
                  {s}
                </span>
              ))}
            </div>
          </section>

          {/* Settings */}
          <section className="examdetail-section">
            <h3 className="examdetail-section__title">Exam Settings</h3>
            <div className="examdetail-settings-list">
              <SettingRow label="Shuffle Questions" on={exam.shuffle} />
              <SettingRow label="Auto Submit" on={exam.autoSubmit} />
              <div className="examdetail-setting-row">
                <span className="examdetail-setting-row__label">Reminder</span>
                <span className="examdetail-setting-row__value">
                  {REMINDER_LABELS[exam.reminder] || "None"}
                </span>
              </div>
            </div>
          </section>

          {/* Notes */}
          {exam.notes && (
            <section className="examdetail-section">
              <h3 className="examdetail-section__title">Notes</h3>
              <p className="examdetail-notes">{exam.notes}</p>
            </section>
          )}
        </div>

        {/* Actions */}
        <ExamActions exam={exam} ready={ready} onCancel={onCancel} onEdit={onEdit} onStart={onStart}/>
      </div>
    </div>
  );
}