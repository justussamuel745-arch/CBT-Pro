import { useState, useCallback, useEffect, useRef, memo } from "react";
import { Link, useNavigate } from 'react-router'
import Countdown, { useLiveCountdown } from "./Countdown";
import { ExamDetail } from './ExamDetail';
import { Loading } from '../../components/Loading';
import { Offline } from '../../components/Offline';
import { LoadError } from '../../components/LoadError';
import { examStore } from '../../stores/examStore';
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
    _id: "1",
    name: "JAMB Mock 1",
    examDate: "2026-08-18T07:24:00",
    targetScore: 280,
    subjects: ["English", "Mathematics", "Physics", "Chemistry"],
    numQuestions: 40,
    duration: 120,
    difficulty: "Medium",
    shuffle: true,
    autoSubmit: true,
    reminder: "1d",
    notes: "Focus on speed.",
  },
  {
    _id: "2",
    name: "JAMB Mock 2",
    examDate: "2026-08-28T13:40:00",
    targetScore: 300,
    subjects: ["English", "Mathematics", "Physics", "Chemistry"],
    numQuestions: 40,
    duration: 120,
    difficulty: "Medium",
    shuffle: true,
    autoSubmit: true,
    reminder: "1d",
    notes: "Focus on speed.",
  },
];

const EDIT_LOCK_MINUTES = 40

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

/* ============================================================
   Calendar export helpers — Google Calendar link + downloadable
   .ics file (Apple Calendar, Outlook, everything else).
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

function downloadIcsFile(exam) {
  const { start, end } = getExamWindow(exam);
  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//CBT Pro//Exam Planner//EN",
    "BEGIN:VEVENT",
    `UID:${exam._id}@cbtpro.ng`,
    `DTSTAMP:${toUtcStamp(new Date())}`,
    `DTSTART:${toUtcStamp(start)}`,
    `DTEND:${toUtcStamp(end)}`,
    `SUMMARY:${exam.name}`,
    `DESCRIPTION:Personal mock exam scheduled via CBT Pro. Target score: ${exam.targetScore}.`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");

  const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${exam.name.replace(/\s+/g, "-")}.ics`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

const formatDateTimeForInputs = (mongoDate) => {
  const date = new Date(mongoDate);

  if (Number.isNaN(date.getTime())) {
    return {
      date: '',
      time: '',
    };
  }

  const pad = (value) => String(value).padStart(2, '0');

  return {
    date: `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`,
    time: `${pad(date.getHours())}:${pad(date.getMinutes())}`,
  };
};

function AddToCalendarButton({ exam }) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  return (
    <div className="planner-exam-card__calendar" ref={menuRef}>
      <button
        type="button"
        className="planner-exam-card__calendar-btn"
        onClick={() => setOpen((prev) => !prev)}
        aria-label="Add to calendar"
        aria-expanded={open}
      >
        <i className="fa-regular fa-calendar-plus" aria-hidden="true"></i>
      </button>

      {open && (
        <div className="planner-exam-card__calendar-menu" role="menu">
          <a
            className="planner-exam-card__calendar-menu-item"
            href={getGoogleCalendarUrl(exam)}
            target="_blank"
            rel="noopener noreferrer"
            role="menuitem"
            onClick={() => setOpen(false)}
          >
            <i className="fa-brands fa-google" aria-hidden="true"></i>
            Google Calendar
          </a>
          <button
            type="button"
            className="planner-exam-card__calendar-menu-item"
            role="menuitem"
            onClick={() => {
              downloadIcsFile(exam);
              setOpen(false);
            }}
          >
            <i className="fa-solid fa-download" aria-hidden="true"></i>
            Apple / Outlook (.ics)
          </button>
        </div>
      )}
    </div>
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
  const { date, time } = formatExamDate(exam.examDate);
  const countdown = useLiveCountdown(exam.examDate);
  
  function editExpires(){
    const { days, hours, minutes } = countdown
    if (!days && !hours){
      if (minutes <= EDIT_LOCK_MINUTES) return true
    }
    return false
  }
  
  function graceEndsAt(examDate) {
    const dt = new Date(examDate);
  
    dt.setMinutes(dt.getMinutes() + 30);
  
    const pad = (n) => String(n).padStart(2, '0');
  
    return `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}T${pad(dt.getHours())}:${pad(dt.getMinutes())}`;
  }
  
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
        <Countdown targetDate={exam.examDate} graceEndsAt={graceEndsAt(exam.examDate)} variant={countdown.urgent ? "full" : "compact"} readyLabel="Ready to start" />
      </div>

      <div className="planner-exam-card__actions">
        <button className="planner-btn planner-btn--ghost" onClick={() => onView(exam)}>
          View
        </button>
        {
          (!editExpires() || countdown.ready) && 
            (
              <button className="planner-btn planner-btn--ghost" onClick={() => {
                countdown.ready ? onStart(exam) : onEdit(exam)}
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
      <Link className="planner-btn planner-btn--primary" to="/exam-planners/schedule">
        <i className="fa-solid fa-plus" aria-hidden="true"></i>
        Create Exam
      </Link>
    </div>
  );
}

export default function ExamPlanner() {
  const stats = examStore(state => state.stats)
  const exams = examStore(state => state.upcomingExams)
  const setInitialValues = examStore(state => state.setInitialValues)
  const getDashboardInfo = examStore(state => state.getDashboardInfo)
  const cancelScheduledExam = examStore(state => state.cancelScheduledExam)
  const [viewExam, setViewExam] = useState(false)
  const [viewDetails, setViewDetails] = useState(null)
  const [loading, setLoading] = useState(true)
  const [offline, setOffline] = useState(false)
  const [loadError, setLoadError] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    if (!stats && !exams) {
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
      await cancelScheduledExam(exam._id)
    } catch (err) {
      console.error('Error:', err);
      if (!err.status && !navigator.onLine){
        setOffline(true)
      } else {
        setLoadError(true)
      }
    }
  }

  function onEditExam(exam) {
    const { examDate } = exam;
    const formValues = {
      ...exam,
      ...formatDateTimeForInputs(examDate)
    }
    delete formValues.examDate
    setInitialValues(formValues)
    navigate('/exam-planner/schedule')
  }

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
            <Link className="planner-btn planner-btn--primary planner-btn--sm" to="/exam-planner/schedule">
              <i className="fa-solid fa-plus" aria-hidden="true"></i>
              Schedule New Exam
            </Link>
          )}
        </div>

        {exams.length === 0 ? (
          <EmptyState onCreate={onCreateExam} />
        ) : (
          <div className="planner-exam-grid">
            {exams.map((exam) => (
              <UpcomingExamCard
                key={exam._id}
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
      <Link className="planner-fab" to="/exam-planner/schedule" aria-label="Schedule new exam">
        <i className="fa-solid fa-plus" aria-hidden="true"></i>
      </Link>

      {viewExam && <ExamDetail exam={viewDetails} onEdit={onEditExam} onClose={onClose} onCancel={onCancelExam}/>}
    </div>
  );
}
