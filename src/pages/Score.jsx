import { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router';
import UserContext from '../context/UserContext.jsx';
import { subjectsData } from '../scripts/data/subjectsData.js';
import { formatName } from '../scripts/utilis/formatName.js';
import { formatTime } from '../scripts/utilis/formatTime.js';
import './Score.css';

// ─────────────────────────────────────────────────────────────
// SVG ICONS
// ─────────────────────────────────────────────────────────────
const Ic = {
  Score:  () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  Chart:  () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
  Time:   () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  Star:   () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  Sub:    () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>,
  Info:   () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>,
  Trophy: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="8 17 8 21 16 21 16 17"/><line x1="12" y1="17" x2="12" y2="21"/><path d="M17 3H7v8a5 5 0 0 0 10 0V3z"/><path d="M7 5H4a1 1 0 0 0-1 1v2a4 4 0 0 0 4 4h0"/><path d="M17 5h3a1 1 0 0 1 1 1v2a4 4 0 0 1-4 4h0"/></svg>,
  Down:   () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 5v14M5 12l7 7 7-7"/></svg>,
  Avg:    () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>,
  Check:  () => <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>,
  X:      () => <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>,
};

// Default subject icon fallback
function SubjectIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────
// ANIMATED RING
// ─────────────────────────────────────────────────────────────
function ScoreRing({ percentage, ringColor = 'url(#ring-grad)' }) {
  const R = 52;
  const CIRC = 2 * Math.PI * R;
  const [offset, setOffset] = useState(CIRC);

  useEffect(() => {
    const t = setTimeout(() => {
      setOffset(CIRC - (percentage / 100) * CIRC);
    }, 200);
    return () => clearTimeout(t);
  }, [percentage, CIRC]);

  return (
    <div className="score-ring-wrap">
      <svg className="score-ring-svg" width="120" height="120" viewBox="0 0 120 120">
        <defs>
          <linearGradient id="ring-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#4f46e5" />
            <stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>
        </defs>
        <circle className="score-ring-track" cx="60" cy="60" r={R} />
        <circle
          className="score-ring-fill"
          cx="60" cy="60" r={R}
          stroke={ringColor}
          strokeDasharray={CIRC}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="score-ring-label">
        <span className="score-ring-pct">{percentage}%</span>
        <span className="score-ring-pct-label">Score</span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// ANIMATED BAR
// ─────────────────────────────────────────────────────────────
function AnimatedBar({ pct, cls }) {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setWidth(pct), 300);
    return () => clearTimeout(t);
  }, [pct]);
  return (
    <div className="score-bar-track">
      <div className={`score-bar-fill ${cls}`} style={{ width: `${width}%` }} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────
function getGrade(pct) {
  if (pct >= 70) return { cls: 'success', label: 'Excellent', short: 'Pass' };
  if (pct >= 50) return { cls: 'warning', label: 'Average',   short: 'Pass' };
  return                { cls: 'danger',  label: 'Below avg', short: 'Fail' };
}

function timeInsight(efficiency) {
  if (efficiency <= 60) return "You finished well ahead of time — consider spending more time reviewing answers before submitting.";
  if (efficiency <= 85) return "Good pacing. You used the time efficiently without rushing.";
  if (efficiency <= 100) return "You used almost all the time available — strong focus throughout.";
  return "You ran over the allocated time. Work on speed strategies for exam day.";
}

// ─────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────
export function Score() {
  const { examResults } = useContext(UserContext);

  // Build subject array ranked by score
  const subjects = Object.entries(examResults.performance)
    .map(([name, score]) => {
      const found = subjectsData.find(s => s.name === name);
      return { name, score, total: 100, icon: found?.icon || null };
    })
    .sort((a, b) => b.score - a.score);

  const bestSubject  = subjects[0];
  const worstSubject = subjects[subjects.length - 1];
  const avgScore     = Math.round(subjects.reduce((a, s) => a + s.score, 0) / subjects.length);
  const passing      = subjects.filter(s => s.score >= 50).length;
  const failing      = subjects.length - passing;
  const excellent    = subjects.filter(s => s.score >= 70).length;
  const avgTier      = subjects.filter(s => s.score >= 50 && s.score < 70).length;

  const efficiency    = Math.round((examResults.timeTaken / examResults.timeAllocated) * 100);
  const overallGrade  = getGrade(examResults.percentage);

  return (
    <div className="score-page">
      <title>{examResults.examType} Results | CBT Pro</title>

      {/* Nav */}
      <nav>
        <div className="nav-container">
          <div className="nav-content">
            <Link to="/" className="logo">CBT Pro</Link>
          </div>
        </div>
      </nav>

      {/* Page header */}
      <div className="page-header">
        <div className="nav-container">
          <div className="breadcrumb">
            <Link to="/">Home</Link> / <Link to="/simulator">Subjects</Link> / Results
          </div>
          <h1>{examResults.examType} Examination Results</h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.375rem', fontSize: '0.95rem' }}>
            {examResults.message}
          </p>
        </div>
      </div>

      <div className="score-container">

        {/* ── HERO CARD ── */}
        <div className="score-hero">
          <div className="score-hero-stripe" />
          <div className="score-hero-body">
            <div>
              <div className="score-hero-label">Total aggregate score</div>
              <div className="score-hero-number">{examResults.score.obtained}</div>
              <div className="score-hero-denom">
                out of {examResults.score.over} &nbsp;·&nbsp; {examResults.percentage}%
              </div>
              <div className="score-hero-badges">
                <span className={`score-badge ${overallGrade.cls}`}>
                  {overallGrade.label}
                </span>
                <span className="score-badge info">
                  {subjects.length} subject{subjects.length !== 1 ? 's' : ''}
                </span>
                <span className="score-badge info">
                  {formatTime(examResults.timeTaken)} used
                </span>
              </div>
            </div>
            <ScoreRing percentage={examResults.percentage} />
          </div>
        </div>

        {/* ── STAT CARDS ── */}
        <div className="score-stats">
          <div className="score-stat">
            <div className="score-stat-icon"><Ic.Score /></div>
            <div className="score-stat-value">{examResults.percentage}%</div>
            <div className="score-stat-label">Overall</div>
            <div className="score-stat-sub">{examResults.score.obtained} / {examResults.score.over}</div>
          </div>
          <div className="score-stat">
            <div className="score-stat-icon"><Ic.Avg /></div>
            <div className="score-stat-value">{avgScore}%</div>
            <div className="score-stat-label">Average</div>
            <div className="score-stat-sub">Per subject</div>
          </div>
          <div className="score-stat">
            <div className="score-stat-icon"><Ic.Time /></div>
            <div className="score-stat-value">{formatTime(examResults.timeTaken)}</div>
            <div className="score-stat-label">Time used</div>
            <div className="score-stat-sub">{efficiency}% of {formatTime(examResults.timeAllocated)}</div>
          </div>
          <div className="score-stat">
            <div className="score-stat-icon"><Ic.Chart /></div>
            <div className="score-stat-value">{passing}/{subjects.length}</div>
            <div className="score-stat-label">Passed</div>
            <div className="score-stat-sub">{failing > 0 ? `${failing} need work` : 'All subjects passed'}</div>
          </div>
        </div>

        {/* ── BEST / WORST SPOTLIGHT ── */}
        <div className="score-card">
          <div className="score-card-head">
            <div className="score-card-title">
              <span className="score-card-title-icon"><Ic.Trophy /></span>
              Subject spotlight
            </div>
          </div>
          <div className="score-spotlight-grid">
            <div className="score-spotlight best">
              <div className="score-spotlight-icon">
                <Ic.Trophy />
              </div>
              <div className="score-spotlight-info">
                <div className="score-spotlight-eyebrow">Highest scored</div>
                <div className="score-spotlight-name">{formatName(bestSubject.name)}</div>
                <div className="score-spotlight-score">{bestSubject.score} / 100 &nbsp;·&nbsp; {bestSubject.score}%</div>
              </div>
              <span className="score-badge success">{bestSubject.score}%</span>
            </div>
            <div className="score-spotlight worst">
              <div className="score-spotlight-icon">
                <Ic.Down />
              </div>
              <div className="score-spotlight-info">
                <div className="score-spotlight-eyebrow">Needs most work</div>
                <div className="score-spotlight-name">{formatName(worstSubject.name)}</div>
                <div className="score-spotlight-score">{worstSubject.score} / 100 &nbsp;·&nbsp; {worstSubject.score}%</div>
              </div>
              <span className={`score-badge ${getGrade(worstSubject.score).cls}`}>{worstSubject.score}%</span>
            </div>
          </div>
        </div>

        {/* ── SUBJECT SCORES ── */}
        <div className="score-card">
          <div className="score-card-head">
            <div className="score-card-title">
              <span className="score-card-title-icon"><Ic.Sub /></span>
              Subject breakdown
            </div>
            <span className="score-badge info">{subjects.length} subjects</span>
          </div>
          <div className="score-subject-list">
            {subjects.map((subject, i) => {
              const grade = getGrade(subject.score);
              const isFirst = i === 0;
              const isLast  = i === subjects.length - 1;
              return (
                <div
                  key={subject.name}
                  className={`score-subject-row${isFirst ? ' score-rank-1' : isLast ? ' score-rank-last' : ''}`}
                >
                  {/* Icon */}
                  <div className="score-subject-icon">
                    {subject.icon
                      ? <span dangerouslySetInnerHTML={{ __html: subject.icon }} />
                      : <SubjectIcon />
                    }
                  </div>

                  {/* Name + meta */}
                  <div>
                    <div className="score-subject-info-name">{formatName(subject.name)}</div>
                    <div className="score-subject-info-meta">
                      {subject.score} / {subject.total} &nbsp;
                      {isFirst && <span style={{ color: '#10b981', fontWeight: 700 }}>· Best</span>}
                      {isLast  && <span style={{ color: '#ef4444', fontWeight: 700 }}>· Lowest</span>}
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="score-bar-wrap">
                    <AnimatedBar pct={subject.score} cls={grade.cls} />
                    <div className="score-bar-label">
                      <span>0</span>
                      <span>100</span>
                    </div>
                  </div>

                  {/* Score + badge */}
                  <div className="score-pct-col">
                    <div className={`score-pct-number`} style={{
                      color: grade.cls === 'success' ? '#16a34a' : grade.cls === 'warning' ? '#d97706' : '#dc2626'
                    }}>
                      {subject.score}%
                    </div>
                    <span className={`score-badge ${grade.cls}`}>
                      {grade.short === 'Pass' ? <Ic.Check /> : <Ic.X />}
                      {grade.short}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── PERFORMANCE TIERS ── */}
        <div className="score-card">
          <div className="score-card-head">
            <div className="score-card-title">
              <span className="score-card-title-icon"><Ic.Star /></span>
              Performance tiers
            </div>
          </div>
          <div className="score-tier-grid">
            <div className="score-tier excellent">
              <div className="score-tier-num">{excellent}</div>
              <div className="score-tier-label">Excellent</div>
              <div className="score-tier-range">70 – 100%</div>
            </div>
            <div className="score-tier passing">
              <div className="score-tier-num">{avgTier}</div>
              <div className="score-tier-label">Average</div>
              <div className="score-tier-range">50 – 69%</div>
            </div>
            <div className="score-tier failing">
              <div className="score-tier-num">{failing}</div>
              <div className="score-tier-label">Below pass</div>
              <div className="score-tier-range">0 – 49%</div>
            </div>
          </div>
        </div>

        {/* ── TIME ANALYSIS ── */}
        <div className="score-card">
          <div className="score-card-head">
            <div className="score-card-title">
              <span className="score-card-title-icon"><Ic.Time /></span>
              Time analysis
            </div>
          </div>
          <div className="score-time-body">
            <div className="score-time-row">
              <div className="score-time-label">Time used</div>
              <div className="score-time-bar-outer">
                <div className="score-time-bar-inner" style={{ width: `${Math.min(efficiency, 100)}%` }} />
              </div>
              <div className="score-time-val">{formatTime(examResults.timeTaken)}</div>
            </div>
            <div className="score-time-row">
              <div className="score-time-label">Allocated</div>
              <div className="score-time-bar-outer">
                <div className="score-time-bar-inner" style={{ width: '100%', background: 'var(--border)' }} />
              </div>
              <div className="score-time-val">{formatTime(examResults.timeAllocated)}</div>
            </div>
            <div className="score-time-insight">
              <Ic.Info />
              {timeInsight(efficiency)}
            </div>
          </div>
        </div>

        {/* ── ACTIONS ── */}
        <div className="score-actions">
          <Link to="/review" className="btn btn-primary">Review answers</Link>
          <Link to="/simulator" className="btn btn-outline">Try again</Link>
          <Link to="/" className="btn btn-outline">Back to home</Link>
        </div>

      </div>
    </div>
  );
}
