import { useMemo } from "react";
import { useLocation, Link } from 'react-router';
import { formatTime } from '../../scripts/utilis/formatTime.js';
import { DateTime } from '../../components/common/DateTime';
import "./ExamResult.css";

const STATUS_META = {
  excellent: { label: "Excellent", icon: "fa-star", tone: "great" },
  good: { label: "Good", icon: "fa-thumbs-up", tone: "good" },
  "needs-work": { label: "Needs more work", icon: "fa-triangle-exclamation", tone: "warn" },
};

/* Speed = average time spent per question. Framed as time-per-question
   rather than questions-per-minute since that's the number that
   actually maps to "was I fast enough" for a timed exam. */
function formatSpeed(seconds, numQuestions) {
  if (!Number.isFinite(seconds) || !Number.isFinite(numQuestions) || numQuestions <= 0) {
    return "—";
  }
  const avgSecondsPerQuestion = seconds / numQuestions;

  if (avgSecondsPerQuestion < 60) {
    return `${Math.round(avgSecondsPerQuestion)}s / question`;
  }
  return `${(avgSecondsPerQuestion / 60).toFixed(1)}m / question`;
}

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
          <span className="examresult-subject__name">{subject.subject}</span>
          <span className="examresult-subject__score">
            {subject.score}
            <span className="examresult-subject__score-max"> / {subject.maxScore}</span>
          </span>
        </div>
        <span className="examresult-subject__status">{meta.label}</span>
        {subject.note && <p className="examresult-subject__note">{subject.note}</p>}
        {subject.focusTopics && (
          <div className="examresult-subject__focus">
            <span>Recommended focus:</span>
            {subject.focusTopics.map((topic) => (
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

export default function ExamResult() {
  const { state: { result }  } = useLocation()

  const diff = result.score - result.targetScore;
  const targetMet = diff >= 0;

  return (
    <div className="examresult-page no-select">
      <header className="examresult-header">
        <span className="examresult-header__eyebrow">Exam Completed</span>
        <h1 className="examresult-header__title">{result.name}</h1>
        {result.examDate && (
          <p className="examresult-header__date">
            <DateTime iso={result.examDate} />
          </p>
        )}
      </header>

      {/* Score */}
      <section className="examresult-scorecard">
        <ScoreRing score={result.score} />

        <div className="examresult-summary">
          <div className="examresult-summary__row">
            <span className="examresult-summary__label">Target</span>
            <span className="examresult-summary__value">{result.targetScore}</span>
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
          <div className="examresult-summary__row">
            <span className="examresult-summary__label">Time Spent</span>
            <span className="examresult-summary__value">
              {formatTime(result.timeSpentSeconds)}
            </span>
          </div>
          <div className="examresult-summary__row">
            <span className="examresult-summary__label">Average Speed</span>
            <span className="examresult-summary__value">
              {formatSpeed(result.timeSpentSeconds, result.numQuestions)}
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
          {result.subjectBreakdown.map((s) => (
            <SubjectFeedback key={s.subject} subject={s} />
          ))}
        </div>
      </section>

      {/* Actions */}
      <div className="examresult-actions">
        <Link to="/exam-planner/schedule" className="examresult-btn examresult-btn--primary">
          <i className="fa-solid fa-flag-checkered" aria-hidden="true"></i>
          Schedule Next Challenge
        </Link>
        <Link to="/exam-planner/history" className="examresult-btn examresult-btn--ghost">
          View History
        </Link>
      </div>
    </div>
  );
}
