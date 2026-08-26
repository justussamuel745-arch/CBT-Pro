import { useState, useMemo } from "react";
import { Link, Navigate, useNavigate, useSearchParams } from "react-router";
import { scheduledExamStore } from '../../stores/scheduledExamStore';
import { examStore } from '../../stores/examStore';
import "./ExamInstructions.css";

const PREP_STEPS = [
  {
    icon: "fa-wifi",
    title: "Check your connection",
    text: "Internet connection is required when starting and submitting your exam, you can turn off your internet connection after exam has been loaded completely.",
  },
  {
    icon: "fa-battery-full",
    title: "Charge your device",
    text: "Plug in or make sure you've got enough battery to comfortably last the full session.",
  },
  {
    icon: "fa-volume-xmark",
    title: "Find a quiet space",
    text: "Sit somewhere free of distractions. Treat this like the real exam hall.",
  },
  {
    icon: "fa-mug-hot",
    title: "Use the bathroom first",
    text: "The timer won't pause once you start, so handle anything you need to beforehand.",
  },
];

const RULES = [
  {
    icon: "fa-clock",
    title: "The timer runs continuously",
    text: "Once you start, the countdown does not pause — not for tab switches, app backgrounding, or lost connection.",
  },
  {
    icon: "fa-bolt",
    title: "Auto-submit is always on",
    text: "When time runs out, your exam is submitted automatically with whatever answers you've selected.",
  },
  {
    icon: "fa-shuffle",
    title: "Questions may be shuffled",
    text: "If shuffle is enabled for this exam, question order will differ from a standard run-through.",
  },
  {
    icon: "fa-bookmark",
    title: "You can flag questions",
    text: "Mark any question for review and jump back to it from the question navigator before submitting.",
  },
  {
    icon: "fa-arrow-right-arrow-left",
    title: "Move freely between questions",
    text: "Answer in any order. Nothing is locked until you submit or the timer ends.",
  },
  {
    icon: "fa-rotate-left",
    title: "Answers can be changed anytime",
    text: "Revisit and update any question as many times as you like before submitting.",
  },
];

function StatChip({ icon, value, label }) {
  return (
    <div className="examinstructions-stat">
      <i className={`fa-solid ${icon}`} aria-hidden="true"></i>
      <div>
        <span className="examinstructions-stat__value">{value}</span>
        <span className="examinstructions-stat__label">{label}</span>
      </div>
    </div>
  );
}

export default function ExamInstructions() {
  const [searchParams] = useSearchParams()
  const examId = searchParams.get('examId')
  if (!examId) return <Navigate to="/exam-planner" replace />
  const upcomingExams = scheduledExamStore(state => state.upcomingExams)
  
  const exam = useMemo(() => {
    return upcomingExams.find(e => e._id === examId)
  },[upcomingExams])
  
  if (!exam) <Navigate to="/exam-planner" replace />
  const totalScore = exam.subjects.length * 100
  const setExamConfig = examStore(state => state.setExamConfig)
  
  const navigate = useNavigate()
  
  const [acknowledged, setAcknowledged] = useState(false);
  
  function onStart(){
    const examQuestions = examStore.getState().examQuestions
    if (examQuestions?.length > 0){
      examStore.setState({
        examQuestions: []
      })
    }
    const { subjects, shuffle } = exam
    const hours = Math.floor(Number(exam.duration) / 60)
    const minutes = exam.duration % 60
    setExamConfig({
      subjects: subjects.map(sub => {
        const qsNo = sub === 'English' ? 60 : 40
        return ({
          name: sub,
          qsNo
        })
      }),
      hours,
      minutes,
      examType: 'scheduled',
      shuffle,
      examId
    })
    navigate('/simulator')
  }
  
  return (
    <div className="examinstructions-page no-select">
      {/* Header */}
      <header className="examinstructions-header">
        <Link to="/exam-planner"
          className="examinstructions-back"
          aria-label="Go back"
        >
          <i className="fa-solid fa-arrow-left" aria-hidden="true"></i>
        </Link>
        <div>
          <span className="examinstructions-header__eyebrow">Before you begin</span>
          <h1 className="examinstructions-header__title">{exam.name}</h1>
        </div>
      </header>

      {/* Quick stats */}
      <section className="examinstructions-statbar">
        <StatChip icon="fa-book-open" value={exam.subjects.length} label="Subjects" />
        <StatChip icon="fa-list-ol" value={exam.numQuestions} label="Questions" />
        <StatChip icon="fa-clock" value={`${exam.duration} min`} label="Duration" />
        <StatChip icon="fa-bullseye" value={`${exam.targetScore}/${totalScore}`} label="Target" />
      </section>

      {/* Subjects */}
      <section className="examinstructions-section">
        <h2 className="examinstructions-section__title">Subjects Covered</h2>
        <div className="examinstructions-chips">
          {exam.subjects.map((s) => (
            <span key={s} className="examinstructions-chip">
              {s}
            </span>
          ))}
        </div>
      </section>

      {/* Prep checklist */}
      <section className="examinstructions-section">
        <h2 className="examinstructions-section__title">Get Ready</h2>
        <div className="examinstructions-prep">
          {PREP_STEPS.map((step, i) => (
            <div className="examinstructions-prep__item" key={step.title}>
              <div className="examinstructions-prep__icon">
                <i className={`fa-solid ${step.icon}`} aria-hidden="true"></i>
              </div>
              <div>
                <div className="examinstructions-prep__title">{step.title}</div>
                <p className="examinstructions-prep__text">{step.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Exam rules */}
      <section className="examinstructions-section">
        <h2 className="examinstructions-section__title">How This Exam Works</h2>
        <div className="examinstructions-rules">
          {RULES.map((rule) => (
            <div className="examinstructions-rule" key={rule.title}>
              <div className="examinstructions-rule__icon">
                <i className={`fa-solid ${rule.icon}`} aria-hidden="true"></i>
              </div>
              <div>
                <div className="examinstructions-rule__title">{rule.title}</div>
                <p className="examinstructions-rule__text">{rule.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Integrity note */}
      <section className="examinstructions-integrity">
        <i className="fa-solid fa-shield-heart" aria-hidden="true"></i>
        <p>
          This is a personal practice exam meant to reflect your real ability. For results and
          feedback that actually help you improve, complete it under real exam conditions —
          no notes, no pausing, no outside help.
        </p>
      </section>

      {/* Acknowledgment + start */}
      <div className="examinstructions-footer">
        <div className="examinstructions-footer__inner">
          <label className="examinstructions-ack">
            <input
              type="checkbox"
              checked={acknowledged}
              onChange={(e) => setAcknowledged(e.target.checked)}
            />
            <span className="examinstructions-ack__box">
              <i className="fa-solid fa-check" aria-hidden="true"></i>
            </span>
            <span>I've read the instructions and I'm ready to begin.</span>
          </label>

          <button
            className="examinstructions-start"
            disabled={!acknowledged}
            onClick={onStart}
          >
            <i className="fa-solid fa-play" aria-hidden="true"></i>
            Start Exam
          </button>
        </div>
      </div>
    </div>
  );
}
