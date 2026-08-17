import { useState } from "react";
import { Link } from "react-router";
import "./ExamInstructions.css";

/* ============================================================
   Mock data — swap for the real scheduled exam object.
   ============================================================ */
const MOCK_EXAM = {
  id: "1",
  name: "JAMB Mock 1",
  subjects: ["English", "Mathematics", "Physics", "Chemistry"],
  numQuestions: 180,
  duration: 120,
  targetScore: 280,
  totalScore: 400,
  difficulty: "Mixed",
  shuffle: true,
};

const PREP_STEPS = [
  {
    icon: "fa-wifi",
    title: "Check your connection",
    text: "A stable internet connection prevents lost progress. Switch to Wi-Fi if you're on mobile data.",
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

export default function ExamInstructions({
  exam = MOCK_EXAM,
  onBack = () => {},
  onStart = () => {},
}) {
  const [acknowledged, setAcknowledged] = useState(false);

  return (
    <div className="examinstructions-page no-select">
      {/* Header */}
      <header className="examinstructions-header">
        <button
          className="examinstructions-back"
          onClick={onBack}
          aria-label="Go back"
        >
          <i className="fa-solid fa-arrow-left" aria-hidden="true"></i>
        </button>
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
        <StatChip icon="fa-bullseye" value={`${exam.targetScore}/${exam.totalScore}`} label="Target" />
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
            onClick={() => onStart(exam)}
          >
            <i className="fa-solid fa-play" aria-hidden="true"></i>
            Start Exam
          </button>
        </div>
      </div>
    </div>
  );
}
