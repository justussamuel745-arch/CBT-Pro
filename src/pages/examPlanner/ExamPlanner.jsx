import { useState } from "react";
import Countdown, { useLiveCountdown } from "./Countdown";
import "./ExamPlanner.css";

/* ============================================================
   Mock data — swap for real API data (GET /api/exam-planner) 
   once the ScheduledExam schema/controller exists.
   ============================================================ */
const MOCK_STATS = {
  upcoming: 2,
  completed: 14,
  average: 264,
  highest: 291,
  streak: 4,
};

const MOCK_UPCOMING = [
  {
    id: "1",
    name: "JAMB Mock 1",
    date: "2026-08-20T10:00:00",
    targetScore: 280,
  },
  {
    id: "2",
    name: "JAMB Mock 2",
    date: "2026-08-25T09:00:00",
    targetScore: 300,
  },
];

function formatExamDate(iso) {
  const d = new Date(iso);
  const date = d.toLocaleDateString("en-GB", {
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

function PlannerStat({ icon, value, label }) {
  return (
    <div className="planner-stat">
      <i className={`fa-solid ${icon} planner-stat__icon`} aria-hidden="true"></i>
      <div className="planner-stat__value">{value}</div>
      <div className="planner-stat__label">{label}</div>
    </div>
  );
}

function UpcomingExamCard({ exam, onView, onEdit, onCancel }) {
  const { date, time } = formatExamDate(exam.date);
  const countdown = useLiveCountdown(exam.date);

  return (
    <article className="planner-exam-card">
      <h3 className="planner-exam-card__name">{exam.name}</h3>

      {countdown.urgent && !countdown.ready && (
        <span className="planner-exam-card__soon">
          <span className="planner-exam-card__dot"></span>
          Starting soon
        </span>
      )}

      <div className="planner-exam-card__datetime">
        <i className="fa-regular fa-calendar" aria-hidden="true"></i>
        <span>{date}</span>
        <span className="planner-exam-card__sep">•</span>
        <i className="fa-regular fa-clock" aria-hidden="true"></i>
        <span>{time}</span>
      </div>

      <div className="planner-exam-card__target">
        <span className="planner-exam-card__target-label">Target Score</span>
        <span className="planner-exam-card__target-value">{exam.targetScore}</span>
      </div>

      <div className="planner-exam-card__countdown">
        <Countdown targetDate={exam.date} variant="compact" readyLabel="Ready to start" />
      </div>

      <div className="planner-exam-card__actions">
        <button className="planner-btn planner-btn--ghost" onClick={() => onView(exam)}>
          View
        </button>
        <button className="planner-btn planner-btn--ghost" onClick={() => onEdit(exam)}>
          Edit
        </button>
        <button
          className="planner-btn planner-btn--ghost planner-btn--danger"
          onClick={() => onCancel(exam)}
        >
          Cancel
        </button>
      </div>
    </article>
  );
}

function EmptyState({ onCreate }) {
  return (
    <div className="planner-empty">
      <div className="planner-empty__icon">
        <i className="fa-regular fa-calendar-plus" aria-hidden="true"></i>
      </div>
      <h3 className="planner-empty__title">No upcoming exams</h3>
      <p className="planner-empty__text">
        Create your first personal mock exam and start working toward your target score.
      </p>
      <button className="planner-btn planner-btn--primary" onClick={onCreate}>
        <i className="fa-solid fa-plus" aria-hidden="true"></i>
        Create Exam
      </button>
    </div>
  );
}

export default function ExamPlanner({
  stats = MOCK_STATS,
  upcomingExams = MOCK_UPCOMING,
  onCreateExam = () => {},
  onViewExam = () => {},
  onEditExam = () => {},
  onCancelExam = () => {},
}) {
  const [exams] = useState(upcomingExams);

  return (
    <div className="planner-page no-select">
      {/* Summary */}
      <section className="planner-summary">
        <div className="planner-summary__heading">
          <i className="fa-solid fa-bullseye" aria-hidden="true"></i>
          <span>Exam Planner</span>
        </div>
        <div className="planner-summary__stats">
          <PlannerStat icon="fa-calendar-days" value={stats.upcoming} label="Upcoming" />
          <PlannerStat icon="fa-circle-check" value={stats.completed} label="Completed" />
          <PlannerStat icon="fa-chart-line" value={stats.average} label="Average Score" />
          <PlannerStat icon="fa-trophy" value={stats.highest} label="Highest Score" />
          <PlannerStat icon="fa-fire" value={stats.streak} label="Current Streak" />
        </div>
      </section>

      {/* Upcoming exams */}
      <section className="planner-section">
        <div className="planner-section__header">
          <h2 className="planner-section__title">Upcoming Exams</h2>
          {exams.length > 0 && (
            <button className="planner-btn planner-btn--primary planner-btn--sm" onClick={onCreateExam}>
              <i className="fa-solid fa-plus" aria-hidden="true"></i>
              Schedule New Exam
            </button>
          )}
        </div>

        {exams.length === 0 ? (
          <EmptyState onCreate={onCreateExam} />
        ) : (
          <div className="planner-exam-grid">
            {exams.map((exam) => (
              <UpcomingExamCard
                key={exam.id}
                exam={exam}
                onView={onViewExam}
                onEdit={onEditExam}
                onCancel={onCancelExam}
              />
            ))}
          </div>
        )}
      </section>

      {/* Floating action button (mobile) */}
      <button className="planner-fab" onClick={onCreateExam} aria-label="Schedule new exam">
        <i className="fa-solid fa-plus" aria-hidden="true"></i>
      </button>
    </div>
  );
}
