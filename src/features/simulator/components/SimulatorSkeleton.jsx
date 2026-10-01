import './SimulatorSkeleton.css'

const SKELETON_SUBJECTS = 8
const SKELETON_OPTIONS = ['A', 'B', 'C', 'D']
const SKELETON_PROGRESS = 20

export function SimulatorSkeleton() {
  return (
    <div className="mode-page" aria-busy="true" aria-live="polite" data-testid="loading-state">
      {/* ---------- HEADER ---------- */}
      <header className="mode-header">
        <div className="mode-header-inner">
          <div className="sk sk-back-btn" />

          <div className="mode-header-actions">
            <div className="sk sk-icon-btn" />
            <div className="sk sk-icon-btn" />
            <div className="sk sk-icon-btn" />
            <div className="sk sk-icon-btn" />
            <div className="sk sk-icon-btn" />
          </div>
        </div>
      </header>

      {/* ---------- LAYOUT ---------- */}
      <div className="mode-container">
        {/* Sidebar */}
        <aside className="mode-sidebar">
          <div className="sk sk-section-title" />
          <div className="mode-subject-list">
            {Array.from({ length: SKELETON_SUBJECTS }).map((_, i) => (
              <div key={i} className="sk sk-subject-item" />
            ))}
          </div>
        </aside>

        {/* Main */}
        <main className="mode-main">
          <div className="mode-nav">
            <div className="sk sk-nav-btn" />
            <div className="sk sk-nav-info" />
            <div className="sk sk-nav-btn" />
          </div>

          <div className="mode-question-tags">
            <div className="sk sk-tag" />
            <div className="sk sk-tag" />
          </div>

          <div className="sk-question-body">
            <div className="sk sk-line" />
            <div className="sk sk-line" />
            <div className="sk sk-line short" />
          </div>

          <div className="sk-options">
            {SKELETON_OPTIONS.map((k) => (
              <div key={k} className="mode-option sk-option">
                <div className="sk sk-option-key" />
                <div className="sk sk-option-text" />
              </div>
            ))}
          </div>

          <div className="mode-actions">
            <div className="sk sk-btn-show" />
          </div>
        </main>

        {/* Right panel */}
        <aside className="mode-panel">
          <div className="mode-panel-header">
            <div className="sk sk-panel-title" />
          </div>
          <div className="mode-progress-grid">
            {Array.from({ length: SKELETON_PROGRESS }).map((_, i) => (
              <div key={i} className="sk sk-progress-btn" />
            ))}
          </div>
        </aside>
      </div>

      {/* FAB (small screens) */}
      <button className="mode-fab sk-fab" disabled aria-hidden="true" />
    </div>
  )
}