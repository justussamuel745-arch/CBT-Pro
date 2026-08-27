import { useState, useCallback } from "react";
import { useNavigate } from 'react-router';
import { formatDateTime } from '../../scripts/utilis/dateTimeOp';
import { scheduledExamStore } from '../../stores/scheduledExamStore';
import { request } from '../../scripts/utilis/request';
import { decrypt } from '../../scripts/utilis/crypto';
import "./MissedExam.css";

const VISIBLE_LIMIT = 3;

/* ---------- Single missed exam — full card ----------
   Used when there's exactly one, since the fuller "Reschedule?"
   framing reads better without competing for space against siblings. */
function MissedExamCard({ exam, onReschedule, onDismiss }) {
  return (
    <div className="missedexam-card" role="alert">
      <div className="missedexam-icon">
        <i className="fa-solid fa-calendar-xmark" aria-hidden="true"></i>
      </div>

      <div className="missedexam-body">
        <div className="missedexam-title">You missed this scheduled exam.</div>
        <div className="missedexam-meta">
          <span className="missedexam-name">{exam.name}</span>
          <span className="missedexam-sep">•</span>
          <span>{formatDateTime(exam.examDate)[0]}</span>
        </div>
        <p className="missedexam-question">Reschedule?</p>
      </div>

      <div className="missedexam-actions">
        <button
          className="missedexam-btn missedexam-btn--yes"
          onClick={() => onReschedule(exam._id)}
        >
          Yes
        </button>
        <button
          className="missedexam-btn missedexam-btn--no"
          onClick={() => onDismiss(exam._id)}
          aria-label="Dismiss"
        >
          <i className="fa-solid fa-xmark" aria-hidden="true"></i>
        </button>
      </div>
    </div>
  );
}

/* ---------- One row inside the grouped list (2+ missed exams) ---------- */
function MissedExamRow({ exam, onReschedule, onDismiss }) {
  return (
    <div className="missedexam-row">
      <div className="missedexam-row__body">
        <span className="missedexam-row__name">{exam.name}</span>
        <span className="missedexam-row__date">{formatDateTime(exam.examDate)[0]}</span>
      </div>
      <div className="missedexam-row__actions">
        <button
          className="missedexam-row__reschedule"
          onClick={() => onReschedule(exam._id)}
        >
          Reschedule
        </button>
        <button
          className="missedexam-row__dismiss"
          onClick={() => onDismiss(exam._id)}
          aria-label={`Dismiss ${exam.name}`}
        >
          <i className="fa-solid fa-xmark" aria-hidden="true"></i>
        </button>
      </div>
    </div>
  );
}

/* ---------- Grouped list — used when there are 2+ missed exams ---------- */
function MissedExamGroup({ exams, onReschedule, onDismiss }) {
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? exams : exams.slice(0, VISIBLE_LIMIT);
  const remaining = exams.length - VISIBLE_LIMIT;

  return (
    <div className="missedexam-group" role="alert">
      <div className="missedexam-group__header">
        <div className="missedexam-group__icon">
          <i className="fa-solid fa-triangle-exclamation" aria-hidden="true"></i>
        </div>
        <div>
          <div className="missedexam-group__title">
            You have {exams.length} missed exams
          </div>
          <p className="missedexam-group__subtitle">
            Reschedule them to stay on track toward your targets.
          </p>
        </div>
      </div>

      <div className="missedexam-group__list">
        {visible.map((exam) => (
          <MissedExamRow
            key={exam._id}
            exam={exam}
            onReschedule={onReschedule}
            onDismiss={onDismiss}
          />
        ))}
      </div>

      {remaining > 0 && (
        <button
          className="missedexam-group__toggle"
          onClick={() => setExpanded((prev) => !prev)}
        >
          {expanded ? "Show less" : `Show ${remaining} more`}
          <i
            className={`fa-solid fa-chevron-${expanded ? "up" : "down"}`}
            aria-hidden="true"
          ></i>
        </button>
      )}
    </div>
  );
}

export default function MissedExam() {
  const exams = scheduledExamStore(state => state.missedExams)
  const setUpcomingExams = scheduledExamStore(state => state.setUpcomingExams)
  const setMissedExams = scheduledExamStore(state => state.setMissedExams)

  const navigate = useNavigate()

  const onDismiss = useCallback((examId) => {
    setMissedExams(prev => prev.filter(e => e._id !== examId))
  }, [setMissedExams])

  const onReschedule = useCallback((examId) => {
    const reschedule = exams.find(e => e._id === examId)
    navigate("/exam-planner/schedule", {
      state: {
        initialValues: reschedule
      }
    })

  }, [setUpcomingExams, navigate, exams])
  
  if (!exams || exams.length === 0) return null;

  if (exams.length === 1) {
    return (
      <MissedExamCard exam={exams[0]} onReschedule={onReschedule} onDismiss={onDismiss} />
    );
  }

  return <MissedExamGroup exams={exams} onReschedule={onReschedule} onDismiss={onDismiss} />;
}
