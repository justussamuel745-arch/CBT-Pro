import { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { Link } from 'react-router';
import { formatTime } from '../scripts/utilis/formatTime';
import { formatDate } from '../scripts/utilis/formatDate';
import { Loading } from '../components/Loading';
import { ToastProvider, useToast, CSS } from '../components/NotificationSystem';
import { removeHistory } from '../hooks/services/indexedDB/history';
import { request } from '../scripts/utilis/request';
import { userStore } from '../stores/userStore';
import './History.css';

/* ---------- Small presentational helpers ---------- */

// Circular score ring — echoes the ring used on the results page so the
// "graded" visual language stays consistent across the app.
const ScoreRing = memo(({ percent, cls, size = 56, stroke = 5, showLabel = true }) => {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (Math.min(Math.max(percent, 0), 100) / 100) * c;

  return (
    <svg
      className={`history-ring ${cls}`}
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      role="img"
      aria-label={`Score ${Math.round(percent)} percent`}
    >
      <circle
        className="track"
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        strokeWidth={stroke}
      />
      <circle
        className="progress"
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={offset}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
      {showLabel && (
        <text
          className="history-ring-text"
          x="50%"
          y="50%"
          dominantBaseline="middle"
          textAnchor="middle"
        >
          {Math.round(percent)}%
        </text>
      )}
    </svg>
  );
});

// Tiny trend sparkline for the hero — shows the shape of recent performance.
const Sparkline = ({ values }) => {
  if (!values || values.length < 2) return null;

  const w = 320;
  const h = 36;
  const pad = 4;
  const max = 100;
  const min = 0;
  const step = (w - pad * 2) / (values.length - 1);

  const points = values.map((v, i) => {
    const x = pad + i * step;
    const y = pad + (1 - (v - min) / (max - min)) * (h - pad * 2);
    return [x, y];
  });

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p[0]} ${p[1]}`).join(' ');
  const fillPath = `${linePath} L ${points[points.length - 1][0]} ${h} L ${points[0][0]} ${h} Z`;
  const last = points[points.length - 1];

  return (
    <svg className="history-sparkline" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
      <path className="history-sparkline-fill" d={fillPath} />
      <path className="history-sparkline-line" d={linePath} />
      <circle className="history-sparkline-dot" cx={last[0]} cy={last[1]} r="3" />
    </svg>
  );
};

const ExpensiveHistoryModal = memo(({ modalInfo, onClose, getScoreClass, formatDate, formatTime }) => {
  useEffect(() => {
    function onKeyDown(e) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  return (
    <div className="history-modal" role="dialog" aria-modal="true" aria-label="Test details">
      <div className="history-modal-backdrop" onClick={onClose}></div>
      <div className="history-modal-content">
        <button className="history-modal-close" onClick={onClose} aria-label="Close">
          <i className="fa-solid fa-xmark"></i>
        </button>
        <div>
          {modalInfo.map(item => {
            const percent = (item.score / item.total) * 100;
            const scoreClass = getScoreClass(percent);
            const subjectRows = Object.entries(item.performance).map(([subName, score], index) => (
              <div className="history-subject-row" key={index}>
                <div>
                  <div className="history-subject-name">{subName}</div>
                  <div className="history-subject-bar">
                    <div
                      className={`history-subject-bar-fill ${getScoreClass(score)}`}
                      style={{ width: `${score}%` }}
                    ></div>
                  </div>
                </div>
                <div className="history-subject-score">{score}/100</div>
              </div>
            ));

            return (
              <div key={item.testId}>
                <div className="history-modal-header">
                  <ScoreRing percent={percent} cls={scoreClass} size={64} stroke={6} />
                  <div className="history-modal-header-text">
                    <h2>{item.title}</h2>
                    <div className="history-modal-date">{formatDate(item.createdAt)}</div>
                  </div>
                </div>

                <div className="history-modal-stats">
                  <div className="history-modal-stat">
                    <i className="fa-solid fa-check-double"></i>
                    <span className="history-modal-stat-value">{item.score}/{item.total}</span>
                    <span className="history-modal-stat-label">Overall</span>
                  </div>
                  <div className="history-modal-stat">
                    <i className="fa-solid fa-clock"></i>
                    <span className="history-modal-stat-value">{formatTime(item.timeSpent)}</span>
                    <span className="history-modal-stat-label">Time</span>
                  </div>
                  <div className="history-modal-stat">
                    <i className="fa-solid fa-list-ol"></i>
                    <span className="history-modal-stat-value">{item.question}</span>
                    <span className="history-modal-stat-label">Questions</span>
                  </div>
                </div>

                <div className="history-subject-breakdown">
                  <h4>Subject performance</h4>
                  {subjectRows}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
});

function HistoryInner() {
  const historyData = userStore(state => state.historyData)
  const fetchUserHistory = userStore(state => state.fetchUserHistory)
  const [modalInfo, setModalInfo] = useState(null)
  const [disable, setDisable] = useState(null)
  const [loading, setLoading] = useState(true)
  const toast = useToast()

  useEffect(() => {
    if (!historyData) {
      (async () => {
        try {
          await fetchUserHistory()
        } catch (err) {
          console.error('Error:', err);
          toast.push({
            variant: 'pill',
            type: 'error',
            message: 'Unable to fetch your history.',
          });
        } finally {
          setLoading(false)
        }
      })()
    } else {
      setLoading(false)
    }

    /*========== Inject Notification styles =========*/
    const el = document.createElement("style");
    el.id = "__ns_styles";
    el.textContent = CSS[0];
    document.head.appendChild(el);
    return () => document.getElementById("__ns_styles")?.remove();
  }, [])

  const getScoreClass = useCallback((percent) => {
    if (percent >= 70) return 'high';
    if (percent >= 50) return 'med';
    return 'low';
  }, [])

  function viewDetails(id) {
    setModalInfo([historyData.find(h => h.testId === id)])
  }

  async function deleteHistory(id) {
    if (!navigator.onLine) {
      toast.push({
        variant: 'pill',
        type: 'error',
        message: 'No internet connection.',
      });
      return
    }
    setDisable(id)
    try {
      await request.auth(`/api/history/${id}`, { method: 'DELETE' })
      userStore.setState((state) => ({
        historyData: state.historyData.filter(h => h.testId !== id)
      }))
      await removeHistory(id)
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setDisable(null)
    }
  }

  const bestScore = useMemo(() => {
    if (!historyData || historyData.length === 0) return 0
    return historyData.reduce((best, item) => Math.max(best, item.score), historyData[0].score)
  }, [historyData])

  const averagePercent = useMemo(() => {
    if (!historyData || historyData.length === 0) return 0
    const total = historyData.reduce((sum, item) => sum + (item.score / item.total) * 100, 0)
    return Math.round(total / historyData.length)
  }, [historyData])

  // Oldest → newest, for a left-to-right trend line
  const trendValues = useMemo(() => {
    if (!historyData || historyData.length < 2) return []
    return [...historyData]
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
      .map(item => (item.score / item.total) * 100)
  }, [historyData])
  
  if (loading) return <Loading />

  return (
    <div className="history-page">
      <nav className="nav">
        <div className="nav-container">
          <div className="nav-content">
            <Link className="logo" to="/">CBT Pro</Link>
          </div>
        </div>
      </nav>

      <div className="history-hero">
        <div className="history-hero-content">
          <span className="history-hero-eyebrow">
            <i className="fa-solid fa-chart-line"></i> Your progress
          </span>
          <h1>Test History</h1>
          <p>Review your past JAMB mock exams and track your progress</p>

          <div className="history-hero-stats">
            <div className="history-stat">
              <span className="history-stat-value">{historyData ? historyData.length : '—'}</span>
              <span className="history-stat-label">Tests taken</span>
            </div>
            <div className="history-stat">
              <span className="history-stat-value">{bestScore}</span>
              <span className="history-stat-label">Best score</span>
            </div>
            <div className="history-stat">
              <span className="history-stat-value">{averagePercent}%</span>
              <span className="history-stat-label">Average</span>
            </div>
          </div>

          {trendValues.length > 1 && (
            <div className="history-hero-trend">
              <div className="history-hero-trend-label">
                <span>Score trend</span>
                <span>Last {trendValues.length} tests</span>
              </div>
              <Sparkline values={trendValues} />
            </div>
          )}
        </div>
      </div>

      <div className="history-timeline" id="historyTimeline">
        {loading && (
          <>
            <div className="history-skeleton-card"></div>
            <div className="history-skeleton-card"></div>
            <div className="history-skeleton-card"></div>
          </>
        )}

        {!loading && historyData && historyData.map(item => {
          const percent = (item.score / item.total) * 100
          const scoreClass = getScoreClass(percent)
          const subjects = [...item.subjects]
          const visibleSubjects = subjects.slice(0, 3)
          const extraCount = subjects.length - visibleSubjects.length

          return (
            <div className="history-card" key={item.testId}>
              <div className="history-card-ring">
                <ScoreRing percent={percent} cls={scoreClass} />
              </div>

              <div className="history-card-body">
                <div className="history-card-top">
                  <div>
                    <div className="history-card-title">{item.title}</div>
                    <div className="history-card-date">{formatDate(item.createdAt)}</div>
                  </div>
                </div>

                <div className="history-card-summary">
                  <span><i className="fa-solid fa-check-double"></i>{item.score}/{item.total}</span>
                  <span className="dot"></span>
                  <span><i className="fa-regular fa-clock"></i>{formatTime(item.timeSpent)}</span>
                  <span className="dot"></span>
                  <span><i className="fa-solid fa-list-ol"></i>{item.question} questions</span>
                </div>

                <div className="history-chip-row">
                  {visibleSubjects.map(sub => (
                    <span className="history-chip" key={sub}>{sub}</span>
                  ))}
                  {extraCount > 0 && <span className="history-chip more">+{extraCount} more</span>}
                </div>

                <div className="history-card-actions">
                  <button
                    className="history-btn-icon view"
                    onClick={() => viewDetails(item.testId)}
                  >
                    <i className="fa-solid fa-eye"></i> View details
                  </button>
                  <button
                    className="history-btn-icon delete"
                    onClick={() => deleteHistory(item.testId)}
                    disabled={disable === item.testId}
                  >
                    <i className="fa-solid fa-trash"></i> {disable === item.testId ? 'Deleting…' : 'Delete'}
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {!loading && historyData && historyData.length <= 0 && (
        <div className="history-empty" id="historyEmpty">
          <div className="history-empty-icon">
            <i className="fa-solid fa-chart-simple"></i>
          </div>
          <h3>No tests yet</h3>
          <p>Complete your first JAMB mock test to see your results and progress here.</p>
          <Link to="/simulator" className="btn btn-primary history-hero-cta">Start a test</Link>
        </div>
      )}

      {modalInfo && (
        <ExpensiveHistoryModal
          modalInfo={modalInfo}
          onClose={() => setModalInfo(null)}
          getScoreClass={getScoreClass}
          formatDate={formatDate}
          formatTime={formatTime}
        />
      )}
    </div>
  );
}

export default function History() {
  return (
    <ToastProvider position="top-right">
      <HistoryInner />
    </ToastProvider>
  );
}
