import { useMemo, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { request } from "../../scripts/utilis/request";
import { Loading } from "../../components/Loading";
import { scheduledExamStore } from "../../stores/scheduledExamStore";
import "./ExamHistory.css";

/* ============================================================
   Achievement definitions
   Backend sends achievement codes only.
   ============================================================ */
const ACHIEVEMENT_DEFINITIONS = [
  {
    id: "first-scheduled",
    icon: "fa-medal",
    label: "First Scheduled Exam",
  },
  {
    id: "first-target",
    icon: "fa-bullseye",
    label: "First Target Achieved",
  },
  {
    id: "five-targets",
    icon: "fa-fire",
    label: "Five Targets Achieved",
  },
  {
    id: "personal-best",
    icon: "fa-trophy",
    label: "Personal Best",
  },
  {
    id: "300-score",
    icon: "fa-star",
    label: "300+ Score",
  },
];

const FILTERS = [
  { key: "default", label: "All" },
  { key: "passed", label: "Passed" },
  { key: "failed", label: "Failed" },
  { key: "missed", label: "Missed" },
  { key: "cancelled", label: "Cancelled" },
];

function matchesFilter(exam, filterKey) {
  if (filterKey === "default") {
    return exam.status !== "cancelled";
  }

  return exam.status === filterKey;
}

/* ============================================================
   Stat Card
   ============================================================ */
function StatCard({ icon, value, label }) {
  return (
    <div className="examhistory-statcard">
      <div className="examhistory-statcard__icon">
        <i
          className={`fa-solid ${icon}`}
          aria-hidden="true"
        ></i>
      </div>

      <div>
        <div className="examhistory-statcard__value">
          {value ?? "—"}
        </div>

        <div className="examhistory-statcard__label">
          {label}
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   Progress Chart
   ============================================================ */
function ProgressChart({ data = [] }) {
  const width = 760;
  const height = 280;

  const padding = {
    top: 24,
    right: 24,
    bottom: 42,
    left: 42,
  };

  const chartData = useMemo(() => {
    return data
      .filter(
        (item) =>
          Number.isFinite(Number(item.score))
      )
      .map((item) => ({
        ...item,
        score: Number(item.score),
      }));
  }, [data]);

  const {
    points,
    highest,
    lowest,
    average,
  } = useMemo(() => {
    if (!chartData.length) {
      return {
        points: [],
        highest: 0,
        lowest: 0,
        average: 0,
      };
    }

    const scores = chartData.map(
      (item) => item.score
    );

    const highest = Math.max(...scores);
    const lowest = Math.min(...scores);

    const average =
      scores.reduce(
        (total, score) => total + score,
        0
      ) / scores.length;

    const innerWidth =
      width -
      padding.left -
      padding.right;

    const innerHeight =
      height -
      padding.top -
      padding.bottom;

    /*
     * Scores are displayed on a 0–300 scale.
     * This makes the chart easier to interpret
     * than dynamically changing the Y-axis.
     */
    const points = chartData.map(
      (item, index) => {
        const x =
          padding.left +
          (index /
            (chartData.length - 1 || 1)) *
            innerWidth;

        const y =
          padding.top +
          innerHeight -
          (item.score / 300) *
            innerHeight;

        return {
          ...item,
          x,
          y,
        };
      }
    );

    return {
      points,
      highest,
      lowest,
      average,
    };
  }, [chartData]);

  if (!points.length) {
    return (
      <div className="examhistory-progress-empty">
        <div className="examhistory-progress-empty__icon">
          <i
            className="fa-solid fa-chart-line"
            aria-hidden="true"
          ></i>
        </div>

        <div>
          <h3 className="examhistory-progress-empty__title">
            No progress data yet
          </h3>

          <p className="examhistory-progress-empty__text">
            Complete exams to start tracking
            your score progress.
          </p>
        </div>
      </div>
    );
  }

  const linePath = points
    .map(
      (point, index) =>
        `${index === 0 ? "M" : "L"} ${
          point.x
        } ${point.y}`
    )
    .join(" ");

  const areaPath = `${linePath}
    L ${points[points.length - 1].x} ${
      height - padding.bottom
    }
    L ${points[0].x} ${
      height - padding.bottom
    }
    Z`;

  const gridScores = [300, 225, 150, 75, 0];

  const firstScore = points[0].score;
  const latestScore =
    points[points.length - 1].score;

  const change =
    latestScore - firstScore;

  const changePercentage =
    firstScore > 0
      ? Math.round(
          (change / firstScore) * 100
        )
      : 0;

  return (
    <div className="examhistory-progress">
      {/* ==================================================
          Analytics summary
         ================================================== */}
      <div className="examhistory-progress__summary">
        <div className="examhistory-progress__summary-main">
          <span className="examhistory-progress__eyebrow">
            SCORE TREND
          </span>

          <div className="examhistory-progress__current">
            {latestScore}
            <span>/300</span>
          </div>

          <div
            className={`examhistory-progress__trend ${
              change > 0
                ? "examhistory-progress__trend--up"
                : change < 0
                ? "examhistory-progress__trend--down"
                : "examhistory-progress__trend--neutral"
            }`}
          >
            <i
              className={`fa-solid ${
                change > 0
                  ? "fa-arrow-trend-up"
                  : change < 0
                  ? "fa-arrow-trend-down"
                  : "fa-minus"
              }`}
              aria-hidden="true"
            ></i>

            <span>
              {change > 0
                ? `+${change}`
                : change}{" "}
              points
              {changePercentage !== 0 &&
                ` (${changePercentage > 0 ? "+" : ""}${changePercentage}%)`}
            </span>
          </div>
        </div>

        <div className="examhistory-progress__metrics">
          <div className="examhistory-progress__metric">
            <span>Average</span>
            <strong>
              {Math.round(average)}
            </strong>
          </div>

          <div className="examhistory-progress__metric">
            <span>Highest</span>
            <strong>
              {highest}
            </strong>
          </div>

          <div className="examhistory-progress__metric">
            <span>Lowest</span>
            <strong>
              {lowest}
            </strong>
          </div>

          <div className="examhistory-progress__metric">
            <span>Exams</span>
            <strong>
              {points.length}
            </strong>
          </div>
        </div>
      </div>

      {/* ==================================================
          Chart
         ================================================== */}
      <div className="examhistory-progress__chart">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="examhistory-chart__svg"
          preserveAspectRatio="none"
          role="img"
          aria-label="Exam score progress chart"
        >
          <defs>
            <linearGradient
              id="examhistory-progress-area"
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop
                offset="0%"
                stopColor="var(--primary)"
                stopOpacity="0.20"
              />

              <stop
                offset="100%"
                stopColor="var(--primary)"
                stopOpacity="0"
              />
            </linearGradient>
          </defs>

          {/* ---------- Grid ---------- */}
          {gridScores.map((score) => {
            const innerHeight =
              height -
              padding.top -
              padding.bottom;

            const y =
              padding.top +
              innerHeight -
              (score / 300) *
                innerHeight;

            return (
              <g key={score}>
                <line
                  x1={padding.left}
                  x2={
                    width -
                    padding.right
                  }
                  y1={y}
                  y2={y}
                  className="examhistory-chart__grid"
                />

                <text
                  x={padding.left - 10}
                  y={y + 4}
                  textAnchor="end"
                  className="examhistory-chart__y-label"
                >
                  {score}
                </text>
              </g>
            );
          })}

          {/* ---------- Area ---------- */}
          <path
            d={areaPath}
            fill="url(#examhistory-progress-area)"
            stroke="none"
          />

          {/* ---------- Line ---------- */}
          <path
            d={linePath}
            className="examhistory-chart__line"
          />

          {/* ---------- Points ---------- */}
          {points.map((point, index) => (
            <g key={`${point.label}-${index}`}>
              <circle
                cx={point.x}
                cy={point.y}
                r="7"
                className="examhistory-chart__point-ring"
              />

              <circle
                cx={point.x}
                cy={point.y}
                r="3.5"
                className="examhistory-chart__point"
              />
            </g>
          ))}
        </svg>

        {/* ---------- X-axis labels ---------- */}
        <div className="examhistory-chart__labels">
          {points.map(
            (point, index) => (
              <span
                key={`${point.label}-${index}`}
                className="examhistory-chart__label"
              >
                {point.label}
              </span>
            )
          )}
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   History Row
   ============================================================ */
function HistoryRow({
  exam,
  onReschedule,
  rescheduling,
}) {
  const date = new Date(
    exam.examDate
  ).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  /* ---------- Missed ---------- */
  if (exam.status === "missed") {
    return (
      <div className="examhistory-row examhistory-row--missed">
        <div className="examhistory-row__badge examhistory-row__badge--missed">
          <i
            className="fa-solid fa-calendar-xmark"
            aria-hidden="true"
          ></i>
        </div>

        <div className="examhistory-row__main">
          <div className="examhistory-row__name">
            {exam.name}
          </div>

          <div className="examhistory-row__date">
            Missed · {date}
          </div>
        </div>

        <button
          type="button"
          className="examhistory-row__reschedule"
          onClick={() =>
            onReschedule(exam.examId)
          }
          disabled={rescheduling}
          aria-busy={rescheduling}
        >
          {rescheduling ? (
            <>
              <i
                className="fa-solid fa-spinner examhistory-spinner"
                aria-hidden="true"
              ></i>

              Rescheduling...
            </>
          ) : (
            "Reschedule"
          )}
        </button>
      </div>
    );
  }

  /* ---------- Cancelled ---------- */
  if (exam.status === "cancelled") {
    return (
      <div className="examhistory-row examhistory-row--cancelled">
        <div className="examhistory-row__badge examhistory-row__badge--cancelled">
          <i
            className="fa-solid fa-ban"
            aria-hidden="true"
          ></i>
        </div>

        <div className="examhistory-row__main">
          <div className="examhistory-row__name">
            {exam.name}
          </div>

          <div className="examhistory-row__date">
            Cancelled · {date}
          </div>
        </div>
      </div>
    );
  }

  /* ---------- Completed ---------- */
  const passed =
    exam.status === "passed";

  return (
    <div className="examhistory-row">
      <div className="examhistory-row__main">
        <div className="examhistory-row__name">
          {exam.name}
        </div>

        <div className="examhistory-row__date">
          {date}
        </div>
      </div>

      <div className="examhistory-row__scores">
        <div className="examhistory-row__score-block">
          <span className="examhistory-row__score-label">
            Target
          </span>

          <span className="examhistory-row__score-value">
            {exam.targetScore ?? "—"}
          </span>
        </div>

        <div className="examhistory-row__score-block">
          <span className="examhistory-row__score-label">
            Score
          </span>

          <span className="examhistory-row__score-value examhistory-row__score-value--main">
            {exam.score
              ? exam.score
              : "—"}
          </span>
        </div>
      </div>

      <div
        className={`examhistory-row__badge ${
          passed
            ? "examhistory-row__badge--pass"
            : "examhistory-row__badge--fail"
        }`}
      >
        <i
          className={`fa-solid ${
            passed
              ? "fa-check"
              : "fa-xmark"
          }`}
          aria-hidden="true"
        ></i>
      </div>
    </div>
  );
}

/* ============================================================
   Achievement Badge
   ============================================================ */
function AchievementBadge({
  achievement,
}) {
  return (
    <div
      className={`examhistory-badge${
        achievement.unlocked
          ? ""
          : " examhistory-badge--locked"
      }`}
    >
      <div className="examhistory-badge__icon">
        <i
          className={`fa-solid ${achievement.icon}`}
          aria-hidden="true"
        ></i>
      </div>

      <span className="examhistory-badge__label">
        {achievement.label}
      </span>
    </div>
  );
}

/* ============================================================
   Empty State
   ============================================================ */
function EmptyState({
  filterLabel,
}) {
  return (
    <div className="examhistory-empty">
      <div className="examhistory-empty__icon">
        <i
          className="fa-regular fa-chart-bar"
          aria-hidden="true"
        ></i>
      </div>

      <h3 className="examhistory-empty__title">
        {filterLabel
          ? `No ${filterLabel.toLowerCase()} exams`
          : "No completed exams yet"}
      </h3>

      <p className="examhistory-empty__text">
        Complete a scheduled mock exam to start
        tracking your progress here.
      </p>
    </div>
  );
}

/* ============================================================
   Exam History
   ============================================================ */
export default function ExamHistory() {
  const navigate = useNavigate();

  const [filter, setFilter] =
    useState("default");

  const {
    historyStats: statsData,
    setHistoryStats: setStatsData,
    history,
    setHistory,
    achievements,
    setAchievements,
  } = scheduledExamStore(
    (state) => state
  );

  const [loading, setLoading] =
    useState(true);

  const [
    reschedulingExamId,
    setReschedulingExamId,
  ] = useState(null);

  /* ==========================================================
     Load history
     ========================================================== */
  useEffect(() => {
    const hasStoredData =
      statsData !== null &&
      statsData !== undefined &&
      Array.isArray(history) &&
      Array.isArray(achievements);

    if (hasStoredData) {
      setLoading(false);
      return;
    }

    let mounted = true;

    const getHistory = async () => {
      try {
        const res =
          await request.auth(
            "/api/exam-planner/history",
            {
              method: "GET",
            }
          );

        const {
          historyStats,
          history: historyData,
          achievements:
            achievementsData,
        } = res.body;

        if (!mounted) return;

        setStatsData(historyStats);

        setHistory(
          Array.isArray(
            historyData
          )
            ? historyData
            : []
        );

        setAchievements(
          Array.isArray(
            achievementsData
          )
            ? achievementsData
            : []
        );
      } catch (err) {
        console.error(
          "Failed to load exam history:",
          err
        );
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    getHistory();

    return () => {
      mounted = false;
    };
  }, [
    statsData,
    history,
    achievements,
    setStatsData,
    setHistory,
    setAchievements,
  ]);

  /* ==========================================================
     Reschedule
     ========================================================== */
  const onReschedule = async (
    examId
  ) => {
    if (
      !examId ||
      reschedulingExamId
    ) {
      return;
    }

    setReschedulingExamId(
      examId
    );

    try {
      const res =
        await request.auth(
          `/api/exam-planner/exam/${examId}`,
          {
            method: "GET",
          }
        );

      const data = res.body;

      navigate(
        "/exam-planner/schedule",
        {
          state: {
            initialValues: data,
          },
        }
      );
    } catch (error) {
      console.error(
        "Failed to load exam for rescheduling:",
        error
      );
    } finally {
      setReschedulingExamId(
        null
      );
    }
  };

  /* ==========================================================
     History
     ========================================================== */
  const hasHistory =
    Array.isArray(history) &&
    history.length > 0;

  const filteredHistory =
    useMemo(() => {
      if (!history?.length) {
        return [];
      }

      return history.filter(
        (exam) =>
          matchesFilter(
            exam,
            filter
          )
      );
    }, [history, filter]);

  const activeFilterLabel =
    FILTERS.find(
      (f) => f.key === filter
    )?.label;

  /* ==========================================================
     Progress data
     ========================================================== */
  const progress = useMemo(() => {
    if (
      !Array.isArray(history) ||
      history.length === 0
    ) {
      return [];
    }

    return history
      .filter((exam) =>
        Number.isFinite(
          Number(exam.score)
        )
      )
      .map((exam) => ({
        label: exam.name,
        score: Number(
          exam.score
        ),
      }));
  }, [history]);

  /* ==========================================================
     Achievements
     ========================================================== */
  const achievementBadges =
    useMemo(() => {
      return ACHIEVEMENT_DEFINITIONS.map(
        (achievement) => ({
          ...achievement,
          unlocked:
            Array.isArray(
              achievements
            ) &&
            achievements.includes(
              achievement.id
            ),
        })
      );
    }, [achievements]);

  /* ==========================================================
     Loading
     ========================================================== */
  if (loading) {
    return <Loading />;
  }

  /* ==========================================================
     Render
     ========================================================== */
  return (
    <div className="examhistory-page no-select">
      {/* ---------- Header ---------- */}
      <header className="examhistory-header">
        <Link
          className="examhistory-back"
          to="/exam-planner"
          aria-label="Back to dashboard"
        >
          <i
            className="fa-solid fa-arrow-left"
            aria-hidden="true"
          ></i>
        </Link>

        <div>
          <h1 className="examhistory-header__title">
            Exam History
          </h1>

          <p className="examhistory-header__subtitle">
            Track how your mock scores have
            improved over time.
          </p>
        </div>
      </header>

      {!hasHistory ? (
        <EmptyState />
      ) : (
        <>
          {/* ==================================================
              Statistics
             ================================================== */}
          <section className="examhistory-section">
            <div className="examhistory-stats-grid">
              <StatCard
                icon="fa-calendar-days"
                value={
                  statsData?.scheduled
                }
                label="Scheduled"
              />

              <StatCard
                icon="fa-circle-check"
                value={
                  statsData?.completed
                }
                label="Completed"
              />

              <StatCard
                icon="fa-chart-line"
                value={
                  statsData?.average
                }
                label="Average Score"
              />

              <StatCard
                icon="fa-trophy"
                value={
                  statsData?.highest
                }
                label="Highest Score"
              />

              <StatCard
                icon="fa-bullseye"
                value={
                  statsData?.targetSuccessRate !==
                  undefined
                    ? `${statsData.targetSuccessRate}%`
                    : "—"
                }
                label="Target Success Rate"
              />

              <StatCard
                icon="fa-clock"
                value={
                  statsData?.totalStudyTime
                }
                label="Total Study Time"
              />

              <StatCard
                icon="fa-thumbs-up"
                value={
                  statsData?.bestSubject
                }
                label="Best Subject"
              />

              <StatCard
                icon="fa-triangle-exclamation"
                value={
                  statsData?.weakestSubject
                }
                label="Weakest Subject"
              />
            </div>
          </section>

          {/* ==================================================
              Progress
             ================================================== */}
          <section className="examhistory-section">
            <h2 className="examhistory-section__title">
              Progress
            </h2>

            <div className="examhistory-chart-card">
              <ProgressChart
                data={progress}
              />
            </div>
          </section>

          {/* ==================================================
              Achievements
             ================================================== */}
          <section className="examhistory-section">
            <h2 className="examhistory-section__title">
              Achievements
            </h2>

            <div className="examhistory-badges">
              {achievementBadges.map(
                (achievement) => (
                  <AchievementBadge
                    key={
                      achievement.id
                    }
                    achievement={
                      achievement
                    }
                  />
                )
              )}
            </div>
          </section>

          {/* ==================================================
              Exam History
             ================================================== */}
          <section className="examhistory-section">
            <div className="examhistory-section__header">
              <h2 className="examhistory-section__title">
                Exam History
              </h2>
            </div>

            <div
              className="examhistory-filters"
              role="tablist"
            >
              {FILTERS.map((f) => (
                <button
                  key={f.key}
                  type="button"
                  role="tab"
                  aria-selected={
                    filter === f.key
                  }
                  className={`examhistory-filter${
                    filter === f.key
                      ? " examhistory-filter--active"
                      : ""
                  }`}
                  onClick={() =>
                    setFilter(
                      f.key
                    )
                  }
                >
                  {f.label}
                </button>
              ))}
            </div>

            {filteredHistory.length ===
            0 ? (
              <EmptyState
                filterLabel={
                  activeFilterLabel
                }
              />
            ) : (
              <div className="examhistory-list">
                {filteredHistory.map(
                  (exam) => (
                    <HistoryRow
                      key={
                        exam.examId
                      }
                      exam={exam}
                      onReschedule={
                        onReschedule
                      }
                      rescheduling={
                        reschedulingExamId ===
                        exam.examId
                      }
                    />
                  )
                )}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}