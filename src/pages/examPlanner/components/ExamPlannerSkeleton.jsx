// ExamPlannerSkeleton.jsx
import './ExamPlannerSkeleton.css'

const SKELETON_STATS = 5
const SKELETON_CARDS = 2

export function ExamPlannerSkeleton() {
  return (
    <div className="planner-page no-select" aria-busy="true" aria-live="polite">
      {/* ---------- Header ---------- */}
      <header className="planner-header">
        <div className="sk-planner sk-planner__back" />
        <div className="sk-planner sk-planner__title" />
        <div className="sk-planner sk-planner__history" />
      </header>

      {/* ---------- Summary card ---------- */}
      <section className="planner-summary sk-planner__summary">
        <div className="planner-summary__heading">
          <div className="sk-planner sk-planner__summary-icon" />
          <div className="sk-planner sk-planner__summary-heading" />
        </div>

        <div className="planner-summary__stats">
          {Array.from({ length: SKELETON_STATS }).map((_, i) => (
            <div key={i} className="planner-stat sk-planner__stat">
              <div className="sk-planner sk-planner__stat-icon" />
              <div className="sk-planner sk-planner__stat-value" />
              <div className="sk-planner sk-planner__stat-label" />
            </div>
          ))}
        </div>
      </section>

      {/* ---------- Section header ---------- */}
      <section className="planner-section">
        <div className="planner-section__header">
          <div className="sk-planner sk-planner__section-title" />
          <div className="sk-planner sk-planner__section-btn" />
        </div>

        {/* ---------- Exam grid ---------- */}
        <div className="planner-exam-grid">
          {Array.from({ length: SKELETON_CARDS }).map((_, i) => (
            <article key={i} className="planner-exam-card sk-planner__card">
              <div className="sk-planner sk-planner__card-calendar" />

              <div className="sk-planner sk-planner__card-name" />

              <div className="sk-planner sk-planner__card-date" />

              <div className="planner-exam-card__target sk-planner__card-target">
                <div className="sk-planner sk-planner__card-target-label" />
                <div className="sk-planner sk-planner__card-target-value" />
              </div>

              <div className="planner-exam-card__countdown sk-planner__card-countdown">
                <div className="sk-planner sk-planner__countdown-num" />
                <div className="sk-planner sk-planner__countdown-unit" />
                <div className="sk-planner sk-planner__countdown-num" />
                <div className="sk-planner sk-planner__countdown-unit" />
              </div>

              <div className="planner-exam-card__actions">
                <div className="sk-planner sk-planner__card-btn" />
                <div className="sk-planner sk-planner__card-btn" />
                <div className="sk-planner sk-planner__card-btn" />
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}