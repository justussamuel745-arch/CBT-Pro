import { useState } from "react";
import Countdown, { useLiveCountdown } from "./Countdown";
import "./ExamDetail.css";

/* ============================================================
   Mock data — swap for the real scheduled exam object.
   ============================================================ */
const MOCK_EXAM = {
  id: "1",
  name: "JAMB Mock 1",
  date: "2026-08-20T10:00:00",
  subjects: ["English", "Mathematics", "Physics", "Chemistry"],
  numQuestions: 40,
  duration: 120,
  targetScore: 280,
  difficulty: "Medium",
  shuffle: true,
  autoSubmit: true,
  reminder: "1d",
  notes: "Focus on speed.",
};

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
    weekday: "long",
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

function DetailRow({ icon, label, children }) {
  return (
    <div className="examdetail-row">
      <div className="examdetail-row__icon">
        <i className={`fa-solid ${icon}`} aria-hidden="true"></i>
      </div>
      <div className="examdetail-row__body">
        <span className="examdetail-row__label">{label}</span>
        <div className="examdetail-row__value">{children}</div>
      </div>
    </div>
  );
}

export default function ExamDetail({
  exam = MOCK_EXAM,
  onClose = () => {},
  onEdit = () => {},
  onCancel = () => {},
  onStart = () => {},
}) {
  const { date, time } = formatExamDate(exam.date);
  const [ready, setReady] = useState(false);

  return (
    <div className="examdetail-overlay" role="dialog" aria-modal="true">
      <div className="examdetail-sheet">
        {/* Header */}
        <div className="examdetail-header">
          <div>
            <span className="examdetail-header__eyebrow">Scheduled Exam</span>
            <h2 className="examdetail-header__title">{exam.name}</h2>
          </div>
          <button className="examdetail-close" onClick={onClose} aria-label="Close">
            <i className="fa-solid fa-xmark" aria-hidden="true"></i>
          </button>
        </div>

        {/* Countdown / ready banner */}
        <div className="examdetail-countdown-wrap">
          <Countdown
            targetDate={exam.date}
            variant="full"
            readyLabel="Your scheduled exam is ready."
            onReady={() => setReady(true)}
          />
        </div>

        {/* Body */}
        <div className="examdetail-body">
          <DetailRow icon="fa-calendar-days" label="Date & Time">
            {date} · {time}
          </DetailRow>

          <DetailRow icon="fa-bullseye" label="Target Score">
            {exam.targetScore} <span className="examdetail-muted">/ 400</span>
          </DetailRow>

          <DetailRow icon="fa-book-open" label="Subjects">
            <div className="examdetail-chips">
              {exam.subjects.map((s) => (
                <span key={s} className="examdetail-chip">
                  {s}
                </span>
              ))}
            </div>
          </DetailRow>

          <DetailRow icon="fa-list-ol" label="Questions & Duration">
            {exam.numQuestions} questions · {exam.duration} min
          </DetailRow>

          <DetailRow icon="fa-sliders" label="Difficulty">
            {exam.difficulty}
          </DetailRow>

          <DetailRow icon="fa-shuffle" label="Exam Settings">
            <div className="examdetail-settings">
              <span className={`examdetail-tag${exam.shuffle ? " examdetail-tag--on" : ""}`}>
                <i className={`fa-solid ${exam.shuffle ? "fa-check" : "fa-xmark"}`} aria-hidden="true"></i>
                Shuffle Questions
              </span>
              <span className={`examdetail-tag${exam.autoSubmit ? " examdetail-tag--on" : ""}`}>
                <i className={`fa-solid ${exam.autoSubmit ? "fa-check" : "fa-xmark"}`} aria-hidden="true"></i>
                Auto Submit
              </span>
            </div>
          </DetailRow>

          <DetailRow icon="fa-bell" label="Reminder">
            {REMINDER_LABELS[exam.reminder] || "None"}
          </DetailRow>

          {exam.notes && (
            <DetailRow icon="fa-note-sticky" label="Notes">
              {exam.notes}
            </DetailRow>
          )}
        </div>

        {/* Actions */}
        <div className="examdetail-actions">
          {ready ? (
            <button className="examdetail-btn examdetail-btn--primary" onClick={() => onStart(exam)}>
              <i className="fa-solid fa-play" aria-hidden="true"></i>
              Start Exam
            </button>
          ) : (
            <>
              <button className="examdetail-btn examdetail-btn--ghost" onClick={() => onEdit(exam)}>
                <i className="fa-solid fa-pen" aria-hidden="true"></i>
                Edit
              </button>
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
      </div>
    </div>
  );
}
