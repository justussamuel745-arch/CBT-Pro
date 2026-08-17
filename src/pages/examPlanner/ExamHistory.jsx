import { useMemo, useState } from "react";
import "./ExamHistory.css";

/* ============================================================
   Mock data — swap for real API data once the ScheduledExam /
   ExamResult schema exists.
   ============================================================ */
const MOCK_STATS = {
  scheduled: 16,
  completed: 14,
  average: 264,
  highest: 291,
  targetSuccessRate: 71,
  totalStudyTime: "18h 40m",
  bestSubject: "English",
  weakestSubject: "Physics",
};

const MOCK_PROGRESS = [
  { label: "Mock 1", score: 220 },
  { label: "Mock 2", score: 236 },
  { label: "Mock 3", score: 252 },
  { label: "Mock 4", score: 268 },
  { label: "Mock 5", score: 296 },
];

const MOCK_HISTORY = [
  { id: "1", name: "JAMB Mock 5", date: "2026-08-02", target: 280, score: 296, status: "passed" },
  { id: "2", name: "JAMB Mock 4", date: "2026-07-26", target: 260, score: 268, status: "passed" },
  { id: "3", name: "JAMB Mock 3", date: "2026-07-19", target: 260, score: 252, status: "failed" },
  { id: "4", name: "JAMB Mock 2b", date: "2026-07-15", target: 250, score: null, status: "missed" },
  { id: "5", name: "JAMB Mock 2", date: "2026-07-12", target: 250, score: 244, status: "failed" },
  { id: "6", name: "JAMB Mock 1", date: "2026-07-05", target: 220, score: 220, status: "passed" },
  { id: "7", name: "JAMB Mock 6", date: "2026-08-09", target: 270, score: null, status: "cancelled" },
];

const MOCK_ACHIEVEMENTS = [
  { id: "first-scheduled", icon: "fa-medal", label: "First Scheduled Exam", unlocked: true },
  { id: "first-target", icon: "fa-bullseye", label: "First Target Achieved", unlocked: true },
  { id: "five-targets", icon: "fa-fire", label: "Five Targets Achieved", unlocked: false },
  { id: "personal-best", icon: "fa-trophy", label: "Personal Best", unlocked: true },
  { id: "300-score", icon: "fa-star", label: "300+ Score", unlocked: false },
];

/* Default view intentionally excludes cancelled exams — they were a
   deliberate choice, not performance signal, and clutter a page whose
   purpose is tracking improvement. Still reachable via its own tab. */
const FILTERS = [
  { key: "default", label: "All" },
  { key: "passed", label: "Passed" },
  { key: "failed", label: "Failed" },
  { key: "missed", label: "Missed" },
  { key: "cancelled", label: "Cancelled" },
];

function matchesFilter(exam, filterKey) {
  if (filterKey === "default") return exam.status !== "cancelled";
  return exam.status === filterKey;
}

function StatCard({ icon, value, label }) {
  return (
    <div className="examhistory-statcard">
      <div className="examhistory-statcard__icon">
        <i className={`fa-solid ${icon}`} aria-hidden="true"></i>
      </div>
      <div>
        <div className="examhistory-statcard__value">{value}</div>
        <div className="examhistory-statcard__label">{label}</div>
      </div>
    </div>
  );
}

/* Lightweight inline SVG line chart — no external chart library. */
function ProgressChart({ data }) {
  const width = 600;
  const height = 220;
  const padding = { top: 20, right: 16, bottom: 32, left: 16 };

  const { points } = useMemo(() => {
    const scores = data.map((d) => d.score);
    const max = Math.max(...scores);
    const min = Math.min(...scores);
    const range = max - min || 1;
    const innerW = width - padding.left - padding.right;
    const innerH = height - padding.top - padding.bottom;

    const points = data.map((d, i) => {
      const x = padding.left + (i / (data.length - 1 || 1)) * innerW;
      const y = padding.top + innerH - ((d.score - min) / range) * innerH;
      return { x, y, ...d };
    });

    return { points, max, min };
  }, [data]);

  const linePath = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
    .join(" ");

  const areaPath = `${linePath} L ${points[points.length - 1].x.toFixed(1)} ${
    height - padding.bottom
  } L ${points[0].x.toFixed(1)} ${height - padding.bottom} Z`;

  return (
    <div className="examhistory-chart">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="examhistory-chart__svg"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="examhistory-area" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.22" />
            <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
          </linearGradient>
        </defs>

        <path d={areaPath} fill="url(#examhistory-area)" stroke="none" />
        <path d={linePath} fill="none" stroke="var(--primary)" strokeWidth="2.5" />

        {points.map((p, i) => (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r={i === points.length - 1 ? 5.5 : 4}
            fill={i === points.length - 1 ? "var(--primary)" : "#fff"}
            stroke="var(--primary)"
            strokeWidth="2"
          />
        ))}
      </svg>

      <div className="examhistory-chart__labels">
        {points.map((p) => (
          <span key={p.label} className="examhistory-chart__label">
            {p.label}
          </span>
        ))}
      </div>
    </div>
  );
}

function HistoryRow({ exam, onReschedule }) {
  const date = new Date(exam.date).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  if (exam.status === "missed") {
    return (
      <div className="examhistory-row examhistory-row--missed">
        <div className="examhistory-row__badge examhistory-row__badge--missed">
          <i className="fa-solid fa-calendar-xmark" aria-hidden="true"></i>
        </div>

        <div className="examhistory-row__main">
          <div className="examhistory-row__name">{exam.name}</div>
          <div className="examhistory-row__date">Missed · {date}</div>
        </div>

        <button className="examhistory-row__reschedule" onClick={() => onReschedule(exam)}>
          Reschedule
        </button>
      </div>
    );
  }

  if (exam.status === "cancelled") {
    return (
      <div className="examhistory-row examhistory-row--cancelled">
        <div className="examhistory-row__badge examhistory-row__badge--cancelled">
          <i className="fa-solid fa-ban" aria-hidden="true"></i>
        </div>

        <div className="examhistory-row__main">
          <div className="examhistory-row__name">{exam.name}</div>
          <div className="examhistory-row__date">Cancelled · {date}</div>
        </div>
      </div>
    );
  }

  const passed = exam.status === "passed";

  return (
    <div className="examhistory-row">
      <div className="examhistory-row__main">
        <div className="examhistory-row__name">{exam.name}</div>
        <div className="examhistory-row__date">{date}</div>
      </div>

      <div className="examhistory-row__scores">
        <div className="examhistory-row__score-block">
          <span className="examhistory-row__score-label">Target</span>
          <span className="examhistory-row__score-value">{exam.target}</span>
        </div>
        <div className="examhistory-row__score-block">
          <span className="examhistory-row__score-label">Score</span>
          <span className="examhistory-row__score-value examhistory-row__score-value--main">
            {exam.score}
          </span>
        </div>
      </div>

      <div
        className={`examhistory-row__badge ${
          passed ? "examhistory-row__badge--pass" : "examhistory-row__badge--fail"
        }`}
      >
        <i className={`fa-solid ${passed ? "fa-check" : "fa-xmark"}`} aria-hidden="true"></i>
      </div>
    </div>
  );
}

function AchievementBadge({ achievement }) {
  return (
    <div
      className={`examhistory-badge${
        achievement.unlocked ? "" : " examhistory-badge--locked"
      }`}
    >
      <div className="examhistory-badge__icon">
        <i className={`fa-solid ${achievement.icon}`} aria-hidden="true"></i>
      </div>
      <span className="examhistory-badge__label">{achievement.label}</span>
    </div>
  );
}

function EmptyState({ filterLabel }) {
  return (
    <div className="examhistory-empty">
      <div className="examhistory-empty__icon">
        <i className="fa-regular fa-chart-bar" aria-hidden="true"></i>
      </div>
      <h3 className="examhistory-empty__title">
        {filterLabel ? `No ${filterLabel.toLowerCase()} exams` : "No completed exams yet"}
      </h3>
      <p className="examhistory-empty__text">
        Complete a scheduled mock exam to start tracking your progress here.
      </p>
    </div>
  );
}

export default function ExamHistory({
  stats = MOCK_STATS,
  progress = MOCK_PROGRESS,
  history = MOCK_HISTORY,
  achievements = MOCK_ACHIEVEMENTS,
  onBack = () => {},
  onReschedule = () => {},
}) {
  const [filter, setFilter] = useState("default");
  const hasHistory = history.length > 0;
  const filteredHistory = history.filter((exam) => matchesFilter(exam, filter));
  const activeFilterLabel = FILTERS.find((f) => f.key === filter)?.label;

  return (
    <div className="examhistory-page no-select">
      <header className="examhistory-header">
        <button className="examhistory-back" onClick={onBack} aria-label="Back to dashboard">
          <i className="fa-solid fa-arrow-left" aria-hidden="true"></i>
        </button>
        <div>
          <h1 className="examhistory-header__title">Exam History</h1>
          <p className="examhistory-header__subtitle">
            Track how your mock scores have improved over time.
          </p>
        </div>
      </header>

      {!hasHistory ? (
        <EmptyState />
      ) : (
        <>
          {/* Statistics */}
          <section className="examhistory-section">
            <div className="examhistory-stats-grid">
              <StatCard icon="fa-calendar-days" value={stats.scheduled} label="Scheduled" />
              <StatCard icon="fa-circle-check" value={stats.completed} label="Completed" />
              <StatCard icon="fa-chart-line" value={stats.average} label="Average Score" />
              <StatCard icon="fa-trophy" value={stats.highest} label="Highest Score" />
              <StatCard
                icon="fa-bullseye"
                value={`${stats.targetSuccessRate}%`}
                label="Target Success Rate"
              />
              <StatCard icon="fa-clock" value={stats.totalStudyTime} label="Total Study Time" />
              <StatCard icon="fa-thumbs-up" value={stats.bestSubject} label="Best Subject" />
              <StatCard icon="fa-triangle-exclamation" value={stats.weakestSubject} label="Weakest Subject" />
            </div>
          </section>

          {/* Progress chart */}
          <section className="examhistory-section">
            <h2 className="examhistory-section__title">Progress</h2>
            <div className="examhistory-chart-card">
              <ProgressChart data={progress} />
            </div>
          </section>

          {/* Achievements */}
          <section className="examhistory-section">
            <h2 className="examhistory-section__title">Achievements</h2>
            <div className="examhistory-badges">
              {achievements.map((a) => (
                <AchievementBadge key={a.id} achievement={a} />
              ))}
            </div>
          </section>

          {/* Exam history list */}
          <section className="examhistory-section">
            <div className="examhistory-section__header">
              <h2 className="examhistory-section__title">Exam History</h2>
            </div>

            <div className="examhistory-filters" role="tablist">
              {FILTERS.map((f) => (
                <button
                  key={f.key}
                  role="tab"
                  aria-selected={filter === f.key}
                  className={`examhistory-filter${
                    filter === f.key ? " examhistory-filter--active" : ""
                  }`}
                  onClick={() => setFilter(f.key)}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {filteredHistory.length === 0 ? (
              <EmptyState filterLabel={activeFilterLabel} />
            ) : (
              <div className="examhistory-list">
                {filteredHistory.map((exam) => (
                  <HistoryRow key={exam.id} exam={exam} onReschedule={onReschedule} />
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
