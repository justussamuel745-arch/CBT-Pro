import { useState, useEffect, useContext, useCallback, memo } from 'react';
import { Link } from 'react-router';
import UserContext from '../context/UserContext'
import { fetchWithAuth } from '../scripts/utilis/fetch'
import { formatTime } from '../scripts/utilis/formatTime';
import { formatDate } from '../scripts/utilis/formatDate';
import { ToastProvider, useToast, CSS } from '../components/NotificationSystem';
import './History.css';

const ExpensiveHistoryModal = memo(({modalInfo, setModalInfo, getScoreClass, formatDate, formatTime}) => {
  return (
    <>
      <div className="history-modal">
        <div className="history-modal-backdrop"></div>
        <div className="history-modal-content">
          <button className="history-modal-close" onClick={() => setModalInfo(null)}>×</button>
          <div>
            {
              modalInfo.map(item => {
                const percent = (item.score / item.total) * 100
                const subjectRows = Object.entries(item.performance).map(([subName, score], index) =>
                (
                  <div className="history-subject-row" key={index}>
                    <div>
                      <div className="history-subject-name">{subName}</div>
                      <div className="history-subject-bar">
                        <div className={`history-subject-bar-fill ${getScoreClass(score)}`} style={{ width: `${score}%` }}></div>
                      </div>
                    </div>
                    <div className="history-subject-score">{score}/100</div>
                  </div>
                )
                )


                return (
                  <div key={item._id}>
                    <div className="history-modal-header">
                      <h2>{item.title}</h2>
                      <div className="history-modal-date">{formatDate(item.createdAt)}</div>
                      <div className={`history-score-badge ${getScoreClass(percent)}`}>{Math.round(percent)}%</div>
                    </div>

                    <div className="history-modal-stats">
                      <div className="history-modal-stat">
                        <span className="history-modal-stat-value">{item.score}/{item.total}</span>
                        <span className="history-modal-stat-label">Overall</span>
                      </div>
                      <div className="history-modal-stat">
                        <span className="history-modal-stat-value">{formatTime(item.timeSpent)}</span>
                        <span className="history-modal-stat-label">Time</span>
                      </div>
                      <div className="history-modal-stat">
                        <span className="history-modal-stat-value">{item.question}</span>
                        <span className="history-modal-stat-label">Questions</span>
                      </div>
                    </div>

                    <div className="history-subject-breakdown">
                      <h4>Subject Performance</h4>
                      {subjectRows}
                    </div>
                  </div>
                )
              })
            }
          </div>
        </div>
      </div>
    </>
  )
})

function HistoryInner() {
  const { token, setToken, historyData, setHistoryData } = useContext(UserContext)
  const [modalInfo, setModalInfo] = useState(null)
  const [disable, setDisable] = useState(null)
  const toast = useToast()
  
  useEffect(() => {
    async function fetchHistory(){
      try {
        const response = await fetchWithAuth(token, setToken, '/api/history', { method: 'GET'})
        const data = await response.json().catch(() => ({}))
        if (!response.ok){
          throw { status: response.status, error: data.message || data.error || 'Unexpected Error' }
        }
        if (response.status === 204){
          setHistoryData([])
          return
        }
      } catch (err) {
        console.error('Error:', err);
      }
    }
    if (!historyData){
      fetchHistory()
    }
    
    const unsavedHistory = JSON.parse(localStorage.getItem('unsavedHistory'))
    if (unsavedHistory && Array.isArray(unsavedHistory)){
      toast.push({
        variant: 'pill',
        type: 'info',
        message: 'Connect to sync current results',
      });
    }
    
    /*========== Inject Notification styles =========*/
    const el = document.createElement("style");
    el.id = "__ns_styles";
    el.textContent = CSS[0];
    document.head.appendChild(el);
    return () => document.getElementById("__ns_styles")?.remove();
  },[])

  const getScoreClass = useCallback((percent) => {
    if (percent >= 70) return 'high';
    if (percent >= 50) return 'med';
    return 'low';
  }, [])

  function viewDetails(id) {
    setModalInfo([historyData.find(h => h._id === id)])
  }
  
  async function deleteHistory(id){
    if (!navigator.onLine){
      toast.push({
        variant: 'pill',
        type: 'error',
        message: 'No internet connection.',
      });
      return
    }
    setDisable(id)
    try {
      const response = await fetchWithAuth(token, setToken, `/api/history/${id}`, { method: 'DELETE' })
      const data = await response.json().catch(() => ({}))
      if (!response.ok){
        throw { status: response.status }
      }
      const filteredHistory = data?.historyData
      ? data.historyData
      : []
      setHistoryData(filteredHistory)
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setDisable(null)
    }
  }
  
  function getBestScore(){
    let bestScore = historyData && historyData.length > 0 ? historyData[0].score : 0
    historyData && historyData.forEach((item) => {
      if (item.score > bestScore){
        bestScore = item.score
      }
    });
    return bestScore
  }


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
          <h1>Test History</h1>
          <p>Review your past JAMB mock exams and track your progress</p>
          <div className="history-hero-meta" id="heroMeta">
            <span><strong id="metaTotal">{historyData && historyData.length}</strong> Tests Taken</span>
            <span>Best Score <strong id="metaBest">{getBestScore()}</strong></span>
          </div>
        </div>
      </div>

      <div className="history-timeline" id="historyTimeline">
        {
          historyData && historyData.map(item => {
            const percent = (item.score / item.total) * 100
            const subjects = [...item.subjects]
            const subjectsPreview = subjects.splice(0, 3).join(', ') + (subjects.length > 3 ? '...' : '')
            return (
              <div className="history-card" key={item._id}>
                <div className="history-card-top">
                  <div>
                    <div className="history-card-title">{item.title}</div>
                    <div className="history-card-date">{formatDate(item.createdAt)}</div>
                  </div>
                  <div className={`history-score-badge ${getScoreClass(percent)}`}>{Math.round(percent)}%</div>
                </div>

                <div className="history-card-summary">
                  <span>{item.score}/{item.total}</span>
                  <span>•</span>
                  <span>{formatTime(item.timeSpent)}</span>
                  <span>•</span>
                  <span>{item.question} questions</span>
                </div>

                <div className="history-subjects-preview">{subjectsPreview}</div>

                <div className="history-card-actions">
                  <button className="btn btn-outline history-btn-sm" onClick={() => viewDetails(item._id)}>View Details</button>
                  <button className="btn btn-danger history-btn-sm" onClick={() => deleteHistory(item._id)} disabled={disable && item._id === disable ? true : false} style={{
                    opacity: `${disable && item._id === disable ? '0.5' : '1'}`
                  }}>{disable && item._id === disable ? 'Deleting...' : 'Delete'}</button>
                </div>
              </div>
            )
          })
        }
      </div>

      {
        historyData && historyData.length <= 0 && 
          (
            <div className="history-empty" id="historyEmpty">
              <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📊</div>
              <h3>No tests yet</h3>
              <p>Complete your first JAMB mock test to see results here</p>
              <Link to="/simulator" className="btn btn-primary">Start a Test</Link>
            </div>
          )
      }
      {modalInfo && <ExpensiveHistoryModal modalInfo={modalInfo} setModalInfo={setModalInfo} getScoreClass={getScoreClass} formatDate={formatDate} formatTime={formatTime}/>}
    </div>
  );
}

export function History() {
  return (
    <ToastProvider position="top-right">
      <HistoryInner />
    </ToastProvider>
  );
}