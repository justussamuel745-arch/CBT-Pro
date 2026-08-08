import { useMemo } from "react";
import "./ExamResult.css";

/* ============================================================
   Mock data — swap for the real completed exam result payload.
   ============================================================ */
const MOCK_RESULT = {
  examName: "JAMB Mock 5",
  score: 296,
  target: 280,
  isPersonalBest: true,
  subjects: [
    { name: "English", status: "excellent", note: "Great improvement!" },
    { name: "Mathematics", status: "good", note: "Solid, steady pace." },
    {
      name: "Physics",
      status: "needs-work",
      note: "Needs more work",
      focus: ["Mechanics", "Electricity"],
    },
    { name: "Chemistry", status: "good", note: "Consistent scoring." },
  ],
};

const STATUS_META = {
  excellent: { label: "Excellent", icon: "fa-star", tone: "great" },
  good: { label: "Good", icon: "fa-thumbs-up", tone: "good" },
  "needs-work": { label: "Needs more work", icon: "fa-triangle-exclamation", tone: "warn" },
};

function ScoreRing({ score, max = 400 }) {
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const pct = Math.min(score / max, 1);
  const offset = useMemo(() => circumference * (1 - pct), [circumference, pct]);

  return (
    <div className="examresult-ring">
      <svg viewBox="0 0 180 180" className="examresult-ring__svg">
        <circle
          cx="90"
          cy="90"
          r={radius}
          fill="none"
          stroke="var(--border)"
          strokeWidth="12"
        />
        <circle
          cx="90"
          cy="90"
          r={radius}
          fill="none"
          stroke="url(#examresult-gradient)"
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform="rotate(-90 90 90)"
        />
        <defs>
          <linearGradient id="examresult-gradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="var(--primary)" />
            <stop offset="100%" stopColor="var(--accent)" />
          </linearGradient>
        </defs>
      </svg>
      <div className="examresult-ring__center">
        <span className="examresult-ring__score">{score}</span>
        <span className="examresult-ring__max">/ {max}</span>
      </div>
    </div>
  );
}

function SubjectFeedback({ subject }) {
  const meta = STATUS_META[subject.status];
  return (
    <div className={`examresult-subject examresult-subject--${meta.tone}`}>
      <div className="examresult-subject__icon">
        <i className={`fa-solid ${meta.icon}`} aria-hidden="true"></i>
      </div>
      <div className="examresult-subject__body">
        <div className="examresult-subject__top">
          <span className="examresult-subject__name">{subject.name}</span>
          <span className="examresult-subject__status">{meta.label}</span>
        </div>
        <p className="examresult-subject__note">{subject.note}</p>
        {subject.focus && (
          <div className="examresult-subject__focus">
            <span>Recommended focus:</span>
            {subject.focus.map((topic) => (
              <span key={topic} className="examresult-subject__chip">
                {topic}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function ExamResult({
  result = MOCK_RESULT,
  onScheduleNext = () => {},
  onViewHistory = () => {},
}) {
  const diff = result.score - result.target;
  const targetMet = diff >= 0;

  return (
    <div className="examresult-page no-select">
      <header className="examresult-header">
        <span className="examresult-header__eyebrow">Exam Completed</span>
        <h1 className="examresult-header__title">{result.examName}</h1>
      </header>

      {/* Score */}
      <section className="examresult-scorecard">
        <ScoreRing score={result.score} />

        <div className="examresult-summary">
          <div className="examresult-summary__row">
            <span className="examresult-summary__label">Target</span>
            <span className="examresult-summary__value">{result.target}</span>
          </div>
          <div className="examresult-summary__row">
            <span className="examresult-summary__label">Difference</span>
            <span
              className={`examresult-summary__value ${
                targetMet ? "examresult-summary__value--pos" : "examresult-summary__value--neg"
              }`}
            >
              {targetMet ? "+" : ""}
              {diff}
            </span>
          </div>
        </div>

        {targetMet && (
          <div className="examresult-banner examresult-banner--celebrate">
            <i className="fa-solid fa-champagne-glasses" aria-hidden="true"></i>
            Congratulations! You beat your target by {diff} marks.
          </div>
        )}

        {result.isPersonalBest && (
          <div className="examresult-banner examresult-banner--best">
            <i className="fa-solid fa-trophy" aria-hidden="true"></i>
            New Personal Best!
          </div>
        )}
      </section>

      {/* AI Feedback */}
      <section className="examresult-section">
        <h2 className="examresult-section__title">
          <i className="fa-solid fa-sparkles" aria-hidden="true"></i>
          AI Feedback
        </h2>
        <div className="examresult-subjects">
          {result.subjects.map((s) => (
            <SubjectFeedback key={s.name} subject={s} />
          ))}
        </div>
      </section>

      {/* Actions */}
      <div className="examresult-actions">
        <button className="examresult-btn examresult-btn--primary" onClick={onScheduleNext}>
          <i className="fa-solid fa-flag-checkered" aria-hidden="true"></i>
          Schedule Next Challenge
        </button>
        <button className="examresult-btn examresult-btn--ghost" onClick={onViewHistory}>
          View History
        </button>
      </div>
    </div>
  );
}
