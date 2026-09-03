import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router'
import { Footer } from '../components/layouts/Footer';
import { InstallAppBanner } from '../components/InstallAppBanner';
import { authStore } from '../stores/authStore';
import './HomePage.css'

// TODO: update to the real confirmed JAMB UTME date each year
const NEXT_UTME_DATE = new Date('2027-04-01')

const FEATURES = [
  {
    icon: 'fa-laptop-code',
    title: 'Real CBT Simulator',
    desc: 'The exact JAMB layout, on-screen calculator, countdown timer and auto-submit — so nothing feels new on exam day.',
  },
  {
    icon: 'fa-robot',
    title: 'Astra AI Study Assistant',
    desc: 'Stuck on a question? Ask Astra for a clear, step-by-step explanation any time, day or night.',
  },
  {
    icon: 'fa-chart-line',
    title: 'Progress Analytics',
    desc: 'See your score trend, timing and weakest topics at a glance, so every session sharpens the next.',
  },
  {
    icon: 'fa-book-open',
    title: 'Full JAMB Syllabus',
    desc: 'Every topic JAMB can test you on, organized by subject and mapped to the official 2027 syllabus.',
  },
  {
    icon: 'fa-database',
    title: '50,000+ Past Questions',
    desc: 'A constantly refreshed bank of syllabus-matched questions across all 17 UTME subjects.',
  },
  {
    icon: 'fa-wifi',
    title: 'Works Offline',
    desc: 'Install CBT Pro as an app and keep practicing on the go, even with little or no data.',
  },
]

const STEPS = [
  {
    icon: 'fa-user-plus',
    title: 'Create your free account',
    desc: 'Sign up in seconds. No card required to start practicing.',
  },
  {
    icon: 'fa-pen-to-square',
    title: 'Practice or simulate the full exam',
    desc: 'Drill a single subject, or run a full timed CBT simulation.',
  },
  {
    icon: 'fa-trophy',
    title: 'Track your growth, hit your target',
    desc: 'Review your analytics after every session and close your gaps before exam day.',
  },
]

const FAQS = [
  {
    q: 'How accurate is this compared to real JAMB?',
    a: '98% match. We reverse-engineered the 2026 JAMB CBT software. Timer, layout, and scoring work identically. The only difference is our questions have explanations.',
  },
  {
    q: 'Do I need to create an account before using the platform?',
    a: 'Yes. A free account unlocks practice tests, syllabus materials, and progress tracking, and saves your performance so you can pick up right where you left off.',
  },
  {
    q: 'Are the questions based on the official JAMB syllabus?',
    a: 'Yes. Every question is structured to follow the official JAMB syllabus and exam pattern, so you are always practicing exactly what is required.',
  },
  {
    q: 'Can I improve my score using this platform alone?',
    a: 'Consistent use gives you real CBT practice, syllabus-based questions, and performance feedback. Best results come from pairing it with regular review of your textbooks and notes.',
  },
  {
    q: 'Do I need to pay to access full questions or subjects?',
    a: 'Full access requires a ₦1,500 yearly subscription, covering unlimited practice across every question, subject, and CBT feature for a full year.',
  },
  {
    q: 'Does CBT Pro include an AI-powered tutor for explanations?',
    a: 'Yes. The built-in Astra AI Tutor helps you understand concepts, not just memorize answers, so you can walk into the exam confident.',
  },
  {
    q: 'Can I use it on Android devices?',
    a: 'Yes. CBT Pro works smoothly on Android, iPhone, tablets, and desktop, so you can practice anytime, anywhere.',
  },
]

const DEMO_QUESTIONS = [
  {
    subject: 'Physics',
    text: 'A body of mass 2 kg falls freely from rest. What is its velocity after 3 seconds? (g = 10 m/s²)',
    options: ['6 m/s', '15 m/s', '30 m/s', '60 m/s'],
    correctIndex: 2,
    explanation: 'v = u + gt = 0 + (10 × 3) = 30 m/s.',
  },
  {
    subject: 'Mathematics',
    text: 'If 3x − 7 = 11, find the value of x.',
    options: ['4', '5', '6', '7'],
    correctIndex: 2,
    explanation: '3x = 18, so x = 6.',
  },
  {
    subject: 'English',
    text: "Choose the option nearest in meaning to 'ubiquitous'.",
    options: ['Rare', 'Everywhere', 'Hidden', 'Ancient'],
    correctIndex: 1,
    explanation: "'Ubiquitous' means present or found everywhere.",
  },
]

const QUESTION_TIME = 20

function daysUntil(date) {
  const diff = date.getTime() - Date.now()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

/* Splits a heading into individually-animated words. Each word gets a
   staggered entrance delay via an inline CSS var, so the markup stays
   generic and the timing lives entirely in CSS (.home-hero-content h1 .word). */
function AnimatedWords({ text, startDelay = 0, className = '' }) {
  const words = text.split(' ')
  return words.map((word, i) => (
    <span
      className={`word ${className}`}
      key={`${word}-${i}`}
      style={{ animationDelay: `${startDelay + i * 70}ms` }}
    >
      {word}
      {i < words.length - 1 ? '\u00A0' : ''}
    </span>
  ))
}

/* Lightweight scroll-reveal hook: flips `inView` true the first time the
   element crosses into the viewport, then stops observing. */
function useInView(threshold = 0.15) {
  const ref = useRef(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (typeof IntersectionObserver === 'undefined') {
      setInView(true)
      return
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true)
          observer.unobserve(el)
        }
      },
      { threshold }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [threshold])

  return [ref, inView]
}

/* Wraps a block of content so it fades/slides in once scrolled into view.
   `index` staggers siblings (grid cards, FAQ rows, etc.) via --reveal-i. */
function Reveal({ children, index = 0, as: Tag = 'div', className = '', ...rest }) {
  const [ref, inView] = useInView()
  return (
    <Tag
      ref={ref}
      className={`reveal ${inView ? 'is-visible' : ''} ${className}`.trim()}
      style={{ '--reveal-i': index }}
      {...rest}
    >
      {children}
    </Tag>
  )
}

function DemoQuestionCard() {
  const [qIndex, setQIndex] = useState(0)
  const [selected, setSelected] = useState(null)
  const [timeLeft, setTimeLeft] = useState(QUESTION_TIME)

  const question = DEMO_QUESTIONS[qIndex]
  const answered = selected !== null
  const timedOut = !answered && timeLeft <= 0
  const revealed = answered || timedOut

  useEffect(() => {
    if (revealed) return
    if (timeLeft <= 0) return
    const id = setTimeout(() => setTimeLeft(t => t - 1), 1000)
    return () => clearTimeout(id)
  }, [timeLeft, revealed])

  const handleSelect = (index) => {
    if (revealed) return
    setSelected(index)
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

      {/* key={qIndex} forces this block to remount on every question change,
          which replays the CSS entrance animation for a smooth transition */}
      <div className="demo-question-wrap" key={qIndex}>
        <p className="demo-question">{question.text}</p>

        <div className="demo-options">
          {question.options.map((option, index) => {
            const isCorrect = index === question.correctIndex
            const isSelected = index === selected
            let state = ''
            if (revealed && isCorrect) state = 'correct'
            else if (isSelected && !isCorrect) state = 'incorrect'

            return (
              <button
                key={option}
                className={`demo-option ${state}`}
                onClick={() => handleSelect(index)}
                disabled={revealed}
              >
                <span className="demo-option-letter">{String.fromCharCode(65 + index)}</span>
                {option}
                {state === 'correct' && <i className="fa-solid fa-circle-check"></i>}
                {state === 'incorrect' && <i className="fa-solid fa-circle-xmark"></i>}
              </button>
            )
          })}
        </div>

        {revealed && (
          <div className="demo-feedback">
            <i className="fa-solid fa-lightbulb"></i>
            <span>{timedOut ? "Time's up! " : ''}{question.explanation}</span>
          </div>
        )}
      </div>

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

export default function HomePage() {
  const token = authStore(state => state.token)
  const isActivated = authStore(state => state.isActivated)
  const daysLeft = daysUntil(NEXT_UTME_DATE)

  const [scrolled, setScrolled] = useState(false)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const onScroll = () => {
      const doc = document.documentElement
      setScrolled(doc.scrollTop > 8)
      const scrollable = doc.scrollHeight - doc.clientHeight
      setProgress(scrollable > 0 ? (doc.scrollTop / scrollable) * 100 : 0)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <>
      <div className="scroll-progress" style={{ width: `${progress}%` }} aria-hidden="true"></div>

      <nav className={scrolled ? 'is-scrolled' : ''}>
        <div className="nav-container">
          <div className="nav-content">
            <div className="logo">CBT Pro</div>
            <div className="nav-right">
            {token ? 
              (
                <>
                  {!isActivated && <Link to="/payment" className="btn btn-outline">Activate now</Link>
                  }
                </>
              ): 
              ( <>
                  <Link to="/auth" className="btn btn-outline">Sign In</Link>
                  <Link to="/auth/signup" className="btn btn-primary">Sign Up</Link>
                </>
              ) 
            }
            </div>
          </div>
        </div>
      </nav>

      <header className="home-hero" id="home">
        <div className="home-hero-blob home-hero-blob-1"></div>
        <div className="home-hero-blob home-hero-blob-2"></div>

        <div className="container home-hero-inner">
          <div className="home-hero-content">
            {daysLeft > 0 && (
              <span className="home-eyebrow">
                <i className="fa-solid fa-bolt"></i> {daysLeft} days until the next UTME
              </span>
            )}

            <h1>
              <AnimatedWords text="Turn practice into" />
              <AnimatedWords text="top scores" startDelay={140} className="text-gradient" />
            </h1>
            <p>Train with thousands of real questions, track your progress, and simulate the actual
              JAMB CBT experience — all in one platform.</p>

            <div className="home-hero-actions">
              <Link to="/study" className="btn btn-primary btn-hero">Start Free Practice</Link>
              <Link to="/simulator" className="btn btn-outline btn-hero-outline">Launch Simulator</Link>
            </div>

            <div className="home-hero-stats">
              <div className="stat">
                <span className="stat-num">50k+</span>
                <span className="stat-label">Practice questions</span>
              </div>
              <div className="stat">
                <span className="stat-num">17</span>
                <span className="stat-label">JAMB subjects</span>
              </div>
              <div className="stat">
                <span className="stat-num">98%</span>
                <span className="stat-label">CBT match accuracy</span>
              </div>
            </div>
          </div>

          <div className="home-hero-demo">
            <DemoQuestionCard />
          </div>
        </div>
      </header>

      <main>
        <section className="home-section container">
          <Reveal as="h2" className="home-section-title">Everything you need to hit 300+</Reveal>
          <Reveal as="p" index={1} className="home-section-sub">One platform, built around how JAMB actually works.</Reveal>

          <div className="features-grid">
            {FEATURES.map((feature, i) => (
              <Reveal key={feature.title} index={i} className="feature-card">
                <div className="feature-icon">
                  <i className={`fa-solid ${feature.icon}`}></i>
                </div>
                <h3>{feature.title}</h3>
                <p>{feature.desc}</p>
              </Reveal>
            ))}
          </div>
        </section>

        <section className="home-section home-steps-section">
          <div className="container">
            <Reveal as="h2" className="home-section-title">How it works</Reveal>
            <Reveal as="p" index={1} className="home-section-sub">Three steps between you and exam-day confidence.</Reveal>

            <div className="steps-grid">
              {STEPS.map((step, index) => (
                <Reveal key={step.title} index={index} className="step-card">
                  <span className="step-number">{String(index + 1).padStart(2, '0')}</span>
                  <div className="step-icon"><i className={`fa-solid ${step.icon}`}></i></div>
                  <h3>{step.title}</h3>
                  <p>{step.desc}</p>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section className="home-section container" id="about">
          <div className="trust-grid">
            <div className="trust-copy">
              <Reveal as="h2" className="home-section-title home-section-title-left">Why students trust CBT Pro</Reveal>

              <Reveal index={1} className="trust-item">
                <i className="fa-solid fa-crosshairs"></i>
                <div>
                  <h3>Real exam experience</h3>
                  <p>A CBT system that mirrors the actual JAMB interface — same layout, timing, and question flow.</p>
                </div>
              </Reveal>

              <Reveal index={2} className="trust-item">
                <i className="fa-solid fa-magnifying-glass-chart"></i>
                <div>
                  <h3>Smart performance tracking</h3>
                  <p>Clear insight into your weak areas and time management, so you know exactly what to improve.</p>
                </div>
              </Reveal>

              <Reveal index={3} className="trust-item">
                <i className="fa-solid fa-rotate"></i>
                <div>
                  <h3>Always-updated questions</h3>
                  <p>Fresh JAMB-style and past questions, updated regularly to match the latest syllabus.</p>
                </div>
              </Reveal>
            </div>

            <Reveal index={2} className="trust-highlight">
              <span className="trust-highlight-num">300+</span>
              <span className="trust-highlight-label">average score improvement reported by consistent users</span>
            </Reveal>
          </div>
        </section>

        <section className="home-section container" id="faq">
          <Reveal as="h2" className="home-section-title">Common questions</Reveal>

          {FAQS.map((faq, i) => (
            <Reveal key={faq.q} index={i} as="details" className="accordion-item">
              <summary>
                {faq.q}
                <i className="fa-solid fa-plus accordion-icon"></i>
              </summary>
              <div className="accordion-content">{faq.a}</div>
            </Reveal>
          ))}
        </section>

        <section className="home-section container">
          <Reveal className="cta">
            <h2>Your 300+ score starts today</h2>
            <p>Stop guessing. Start practicing. Everything you need to prepare like a top JAMB candidate.</p>
            <Link to="/auth/signup" className="btn btn-hero">Create Free Account</Link>
          </Reveal>
        </section>
      </main>

      <InstallAppBanner />
      <Footer />
    </>
  )
}
