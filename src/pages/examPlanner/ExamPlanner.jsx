import { useState, useCallback, useEffect, useRef, memo } from "react";
import { Link, useNavigate } from 'react-router'
import Countdown, { useLiveCountdown } from "./Countdown";
import { ExamDetail } from './ExamDetail';
import { Loading } from '../../components/Loading';
import { Offline } from '../../components/Offline';
import { LoadError } from '../../components/LoadError';
import { DateTime } from '../../components/common/DateTime';
import { sortByClosestDate } from '../../scripts/utilis/dateTimeOp';
import { scheduledExamStore } from '../../stores/scheduledExamStore';
import { deleteUpcomingExam } from '../../hooks/services/indexedDB/upcomingExams';
import { showNotification } from '../../services/offlineNotificationService';
import { hasEditExpires } from './utils/hasEditExpires';
import { graceEndsAt } from './utils/graceEndsAt.js';
import MissedExam from './MissedExam';
import "./ExamPlanner.css";

/* ============================================================
   Calendar export — Google Calendar only.
   ============================================================ */
function toUtcStamp(date) {
  return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
}

function getExamWindow(exam) {
  const start = new Date(exam.examDate);
  const end = new Date(start.getTime() + (exam.duration || 120) * 60000);
  return { start, end };
}

function getGoogleCalendarUrl(exam) {
  const { start, end } = getExamWindow(exam);
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: exam.name,
    dates: `${toUtcStamp(start)}/${toUtcStamp(end)}`,
    details: `Personal mock exam scheduled via CBT Pro. Target score: ${exam.targetScore}.`,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

function AddToCalendarButton({ exam }) {
  return (
    <a
      className="planner-exam-card__calendar-btn"
      href={getGoogleCalendarUrl(exam)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Add to Google Calendar"
    >
      <i className="fa-regular fa-calendar-plus" aria-hidden="true"></i>
    </a>
  );
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

const UpcomingExamCard = memo(function UpcomingExamCard({ exam, onView, onEdit, onStart, onCancel }) {
  const setUpcomingExams = scheduledExamStore(state => state.setUpcomingExams)
  const countdown = useLiveCountdown(exam.examDate);
  
  
  const onGraceExpired = useCallback(async () => {
    await deleteUpcomingExam(exam._id)
    setUpcomingExams(prev => prev.filter(e => e._id !== exam._id))
    await showNotification({
      title: 'Scheduled Exam Missed',
      body: `Your scheduled exam "${exam.name}" has been marked as missed because it was not completed within 40 minutes of its scheduled time. No performance score was recorded for this attempt. Staying consistent with your scheduled exams helps you measure your progress, identify weak areas, and see how close you are to your target score. Keep your next exam on schedule and use each completed attempt as an opportunity to improve your performance.`,
    })
  },[setUpcomingExams])
  
  const onReady = useCallback(async () => {
    await showNotification({
      title: 'Your Exam Is Ready to Start',
      body: `"${exam.name}" is now ready. You have 20 minutes to start the exam before it is marked as missed.`,
    });
  },[])
  
  return (
    <article className="planner-exam-card">
      <AddToCalendarButton exam={exam} />

      <h3 className="planner-exam-card__name">{exam.name}</h3>

      {countdown.urgent && !countdown.ready && (
        <span className="planner-exam-card__soon">
          <span className="planner-exam-card__dot"></span>
          Starting soon
        </span>
      )}

      <DateTime iso={exam.examDate} />

      <div className="planner-exam-card__target">
        <span className="planner-exam-card__target-label">Target Score</span>
        <span className="planner-exam-card__target-value">{exam.targetScore}</span>
      </div>

      <div className="planner-exam-card__countdown">
        <Countdown 
          targetDate={exam.examDate} 
          graceEndsAt={graceEndsAt(exam.examDate)} 
          variant={countdown.urgent ? "full" : "compact"} 
          readyLabel="Ready to start"
          onGraceExpired={onGraceExpired}
        />
      </div>

      <div className="planner-exam-card__actions">
        <button className="planner-btn planner-btn--ghost" onClick={() => onView(exam)}>
          View
        </button>
        {
          (!hasEditExpires(countdown) || countdown.ready) && 
            (
              <button className="planner-btn planner-btn--ghost" onClick={() => {
                countdown.ready ? onStart(exam?._id) : onEdit(exam._id)}
              }>
                { countdown.ready ? 'Start Exam' : 'Edit' }
              </button>
            )
        }
        
        <button
          className="planner-btn planner-btn--ghost planner-btn--danger"
          onClick={() => onCancel(exam)}
        >
          Cancel
        </button>
      </div>
    </article>
  );
})

function EmptyState() {
  return (
    <div className="planner-empty">
      <div className="planner-empty__icon">
        <i className="fa-regular fa-calendar-plus" aria-hidden="true"></i>
      </div>
      <h3 className="planner-empty__title">No upcoming exams</h3>
      <p className="planner-empty__text">
        Create your first personal mock exam and start working toward your target score.
      </p>
      <Link className="planner-btn planner-btn--primary" to="/exam-planners/schedule">
        <i className="fa-solid fa-plus" aria-hidden="true"></i>
        Create Exam
      </Link>
    </div>
  );
}

export default function ExamPlanner() {
  const stats = scheduledExamStore(state => state.stats)
  const exams = sortByClosestDate(scheduledExamStore(state => state.upcomingExams), 'examDate')
  const setInitialValues = scheduledExamStore(state => state.setInitialValues)
  const getDashboardInfo = scheduledExamStore(state => state.getDashboardInfo)
  const onChangeStatus = scheduledExamStore(state => state.onChangeStatus)
  const [viewExam, setViewExam] = useState(false)
  const [viewDetails, setViewDetails] = useState(null)
  const [loading, setLoading] = useState(true)
  const [offline, setOffline] = useState(false)
  const [loadError, setLoadError] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    if (!stats || !exams) {
      (async () => {
        try {
          await getDashboardInfo()
        } catch (err) {
          console.log(err);
          if (!err.status && !navigator.onLine) {
            setOffline(true)
          } else {
            setLoadError(true)
          }
        } finally {
          setLoading(false)
        }
      })()
      return
    }
    setLoading(false)
  }, [setLoading, setLoadError, setOffline])
  
  async function onCancelExam(exam){
    try {
      await onChangeStatus(exam._id, 'cancelled')
    } catch (err) {
      console.error('Error:', err);
      if (!err.status && !navigator.onLine){
        setOffline(true)
      } else {
        setLoadError(true)
      }
    }
  }

  function onEditExam(examId) {
    navigate(`/exam-planner/schedule?examId=${examId}`)
  }
  
  const onStartExam = useCallback((examId) => {
    navigate(`/exam-planner/instructions?examId=${examId}`)
  },[navigate])
  
  const onViewExam = useCallback((exam) => {
    setViewDetails(exam)
    setViewExam(true)
  }, [setViewExam])
  const onClose = useCallback(() => {
    setViewExam(false)
    setViewDetails(null)
  }, [setViewExam])
  
  if (offline) return <Offline />
  if (loadError) return <LoadError onRetry={() => navigate('/exam-planner')} />
  if (loading) return <Loading />

  return (
    <div className="planner-page no-select">
      {/* Page header */}
      <header className="planner-header">
        <button
          className="planner-header__back"
          onClick={() => navigate('/')}
          aria-label="Go back"
        >
          <i className="fa-solid fa-arrow-left" aria-hidden="true"></i>
        </button>
        <h1 className="planner-header__title">Exam Planner</h1>
        <Link
          className="planner-header__history"
          to="/exam-planner/history"
          aria-label="View exam history"
        >
          <i className="fa-solid fa-clock-rotate-left" aria-hidden="true"></i>
        </Link>
      </header>

      {/* Summary */}
      <MissedExam />
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
            <Link className="planner-btn planner-btn--primary planner-btn--sm" to="/exam-planner/schedule?">
              <i className="fa-solid fa-plus" aria-hidden="true"></i>
              Schedule New Exam
            </Link>
          )}
        </div>

        {exams.length === 0 ? (
          <EmptyState/>
        ) : (
          <div className="planner-exam-grid">
            {exams.map((exam) => (
              <UpcomingExamCard
                key={exam._id}
                exam={exam}
                onView={onViewExam}
                onEdit={onEditExam}
                onStart={onStartExam}
                onCancel={onCancelExam}
              />
            ))}
          </div>
        )}
      </section>

      {/* Floating action button (mobile) */}
      <Link className="planner-fab" to="/exam-planner/schedule" aria-label="Schedule new exam">
        <i className="fa-solid fa-plus" aria-hidden="true"></i>
      </Link>

      {viewExam && <ExamDetail exam={viewDetails} onEdit={onEditExam} onStart={onStartExam} onClose={onClose} onCancel={onCancelExam}/>}
    </div>
  );
}
