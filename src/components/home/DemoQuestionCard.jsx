import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { DemoSimulator } from './DemoSimulator'
import { balanceSimulator } from './demoSimulators/balance'
import { freeFallSimulator } from './demoSimulators/freeFall'
import { spreadSimulator } from './demoSimulators/spread'

const QUESTION_TIME = 20

const STATUS_VIEW = {
  correct: { icon: 'fa-circle-check', title: 'Correct!' },
  incorrect: { icon: 'fa-circle-xmark', title: 'Not quite.' },
  timeout: { icon: 'fa-clock', title: "Time's up!" },
}

const DEMO_QUESTIONS = [
  {
    subject: 'Physics',
    text: 'A body of mass 2 kg falls freely from rest. What is its velocity after 3 seconds? (g = 10 m/s²)',
    options: ['6 m/s', '15 m/s', '30 m/s', '60 m/s'],
    correctIndex: 2,
    explanation: 'v = u + gt = 0 + (10 × 3) = 30 m/s.',
    simulator: freeFallSimulator,
  },
  {
    subject: 'Mathematics',
    text: 'If 3x − 7 = 11, find the value of x.',
    options: ['4', '5', '6', '7'],
    correctIndex: 2,
    explanation: '3x = 18, so x = 6.',
    simulator: balanceSimulator,
  },
  {
    subject: 'English',
    text: "Choose the option nearest in meaning to 'ubiquitous'.",
    options: ['Rare', 'Everywhere', 'Hidden', 'Ancient'],
    correctIndex: 1,
    explanation: "'Ubiquitous' means present or found everywhere.",
    simulator: spreadSimulator,
  },
]

export function DemoQuestionCard() {
  const [qIndex, setQIndex] = useState(0)
  const [selected, setSelected] = useState(null)
  const [timeLeft, setTimeLeft] = useState(QUESTION_TIME)

  const question = DEMO_QUESTIONS[qIndex]
  const answered = selected !== null
  const timedOut = !answered && timeLeft <= 0
  const revealed = answered || timedOut
  const status = timedOut ? 'timeout' : selected === question.correctIndex ? 'correct' : 'incorrect'

  useEffect(() => {
    if (revealed || timeLeft <= 0) return
    const id = setTimeout(() => setTimeLeft((t) => t - 1), 1000)
    return () => clearTimeout(id)
  }, [timeLeft, revealed])

  const handleSelect = (index) => {
    if (!revealed) setSelected(index)
  }

  const handleNext = () => {
    setQIndex((qIndex + 1) % DEMO_QUESTIONS.length)
    setSelected(null)
    setTimeLeft(QUESTION_TIME)
  }

  return (
    <div className="demo-card">
      <div className="demo-card-head">
        <span className="demo-tag">{question.subject} · Live demo</span>
        <span className={`demo-timer ${timeLeft <= 7 && !revealed ? 'urgent' : ''}`}>
          <i className="fa-solid fa-clock"></i> 00:{String(Math.max(timeLeft, 0)).padStart(2, '0')}
        </span>
      </div>

      <div className="demo-progress">
        {DEMO_QUESTIONS.map((_, i) => (
          <span
            key={i}
            className={`demo-dot ${i === qIndex ? 'active' : ''} ${i < qIndex ? 'done' : ''}`}
          ></span>
        ))}
      </div>

      {revealed ? (
        // The explanation replaces the question and options; the simulator sits below it.
        // The key remounts this block so the simulator starts fresh for each question.
        <div className="demo-question-wrap" key={`${qIndex}-explanation`}>
          <div className={`demo-result ${status}`}>
            <i className={`fa-solid ${STATUS_VIEW[status].icon}`}></i>
            <div>
              {STATUS_VIEW[status].title}
              <small>
                Correct answer: {String.fromCharCode(65 + question.correctIndex)}. {question.options[question.correctIndex]}
              </small>
            </div>
          </div>

          <div className="demo-feedback">
            <i className="fa-solid fa-lightbulb"></i>
            <span>{question.explanation}</span>
          </div>

          <DemoSimulator config={question.simulator} />
        </div>
      ) : (
        // key={qIndex} remounts this block per question to replay the entrance animation
        <div className="demo-question-wrap" key={qIndex}>
          <p className="demo-question">{question.text}</p>

          <div className="demo-options">
            {question.options.map((option, index) => (
              <button
                key={option}
                className="demo-option"
                onClick={() => handleSelect(index)}
              >
                <span className="demo-option-letter">{String.fromCharCode(65 + index)}</span>
                {option}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="demo-footer">
        {revealed ? (
          <button type="button" className="demo-cta" onClick={handleNext}>
            Next question <i className="fa-solid fa-arrow-right"></i>
          </button>
        ) : (
          <Link to="/simulator" className="demo-cta demo-cta-ghost">
            Skip to full simulator <i className="fa-solid fa-arrow-right"></i>
          </Link>
        )}
      </div>
    </div>
  )
}
