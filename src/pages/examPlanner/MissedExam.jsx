import "./MissedExam.css";

function formatExamDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

/* ============================================================
   Mock data — swap for the real missed exam object.
   ============================================================ */
const MOCK_EXAM = {
  id: "3",
  name: "JAMB Mock 3",
  date: "2026-08-05T10:00:00",
  targetScore: 260,
};

export default function MissedExam({
  exam = MOCK_EXAM,
  onReschedule = () => {},
  onDismiss = () => {},
}) {
  return (
    <div className="missedexam-card" role="alert">
      <div className="missedexam-icon">
        <i className="fa-solid fa-calendar-xmark" aria-hidden="true"></i>
      </div>

      <div className="missedexam-body">
        <div className="missedexam-title">You missed this scheduled exam.</div>
        <div className="missedexam-meta">
          <span className="missedexam-name">{exam.name}</span>
          <span className="missedexam-sep">•</span>
          <span>{formatExamDate(exam.date)}</span>
        </div>
        <p className="missedexam-question">Reschedule?</p>
      </div>

      <div className="missedexam-actions">
        <button
          className="missedexam-btn missedexam-btn--yes"
          onClick={() => onReschedule(exam)}
        >
          Yes
        </button>
        <button
          className="missedexam-btn missedexam-btn--no"
          onClick={() => onDismiss(exam)}
          aria-label="Dismiss"
        >
          <i className="fa-solid fa-xmark" aria-hidden="true"></i>
        </button>
      </div>
    </div>
  );
}
