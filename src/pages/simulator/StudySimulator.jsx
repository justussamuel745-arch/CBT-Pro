import { useState, useEffect, useRef, memo, useCallback, useMemo } from 'react'
import { useNavigate, useSearchParams, Navigate } from 'react-router';
import { MarkdownContent } from '../../components/MarkdownContent';
import { Calculator } from '../../components/Calculator.jsx'
import { AstraAIModal } from '../../components/AstraAIModal'
import { request } from '../../scripts/utils/request';
import { subjectsData } from '../../scripts/data/subjectsData.js'
import { Image } from '../../components/common/Image'
import { formatName } from '../../scripts/utils/formatName.js';
import { ModalStripe, CSS } from '../../components/NotificationSystem';
import { ReportQuestionModal } from '../../components/ReportQuestionModal';
import { AnswerCard } from '../../components/AnswerCard';
import { saveQuestions, loadQuestionsInBackground } from '../../hooks/services/indexedDB/questions';
import { saveAllImages } from '../../hooks/services/indexedDB/images';
import { addBookmark, deleteBookmark } from '../../hooks/services/indexedDB/bookmarks.js';
import { decrypt } from '../../scripts/utils/crypto';
import { studyStore } from '../../stores/studyStore';
import { userStore } from '../../stores/userStore';
import { examStore } from '../../stores/examStore';
import { SimulatorSkeleton } from './components/SimulatorSkeleton';
import './StudySimulator.css';

// Max number of questions a study session shows (same cap as before).
const STUDY_LIMIT = 100

// Thrown from inside the loader callbacks to stop loading when the effect is cleaned up.
const CANCELLED = Symbol('study-load-cancelled')

// Lets the browser paint between questions, otherwise the loader's tight
// loop would finish before React ever gets a chance to render question #1.
const yieldToBrowser = () => new Promise((resolve) => setTimeout(resolve, 0))

/* ============================================================
   Small, stable, memoized pieces.
   Each one only re-renders when the specific props it needs
   change — none of them read state directly, so a state update
   elsewhere in the page can't force them to re-render.
   ============================================================ */

const Modal = memo(function Modal({ type, title, body, primaryLabel, onPrimary, onClose, closeLabel }) {
  return (
    <div className="ns-overlay" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} style={{ width: '100%', display: 'flex', justifyContent: 'center', padding: '0 1rem' }}>
        <ModalStripe
          type={type}
          title={title}
          body={body}
          primaryLabel={primaryLabel}
          onPrimary={onPrimary}
          onClose={onClose}
          closeLabel={closeLabel || null}
        />
      </div>
    </div>
  )
})

const HeaderActions = memo(function HeaderActions({ openReport, openAiChat, openNavigator, openCalculator }) {
  return (
    <>
      <button className="mode-icon-btn" title="Report Question" onClick={openReport}>
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 2v20" />
          <path d="M4 4c2-1 4-1 6 0s4 1 6 0 4-1 4-1v11s-2 1-4 1-4-1-6-1-4 1-6 1V4z" />
        </svg>
      </button>
      <button className="mode-icon-btn" title="Chat with AI" onClick={openAiChat}>🤖</button>
      <button className="mode-icon-btn" title="Questions" onClick={openNavigator}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="7" height="7"></rect>
          <rect x="14" y="3" width="7" height="7"></rect>
          <rect x="14" y="14" width="7" height="7"></rect>
          <rect x="3" y="14" width="7" height="7"></rect>
        </svg>
      </button>
      <button className="mode-icon-btn" title="Calculator" onClick={openCalculator}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="7" y="21" width="10" height="2"></rect>
          <rect x="7" y="17" width="10" height="2"></rect>
          <rect x="7" y="13" width="10" height="2"></rect>
          <rect x="7" y="9" width="10" height="2"></rect>
          <rect x="7" y="5" width="10" height="2"></rect>
        </svg>
      </button>
    </>
  )
})

const Header = memo(function Header({ goBack, openReport, openAiChat, openNavigator, openCalculator, toggleBookmark, isBookmarked }) {
  return (
    <header className="mode-header">
      <div className="mode-header-inner">
        <button className="mode-back-btn" onClick={goBack}>← Back</button>
        <div className="mode-header-actions">
          <HeaderActions openReport={openReport} openAiChat={openAiChat} openNavigator={openNavigator} openCalculator={openCalculator} />
          <button className={`mode-icon-btn ${isBookmarked ? 'active' : ''}`} title="Bookmark" onClick={toggleBookmark}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"></path>
            </svg>
          </button>
        </div>
      </div>
    </header>
  )
})

// Only depends on the (stable, load-once) subject list + which one is active.
// Never re-renders when the current question / answers change.
const Sidebar = memo(function Sidebar({ subjects, currentSubject, onSwitch }) {
  return (
    <aside className="mode-sidebar">
      <div className="mode-sidebar-title">Subjects</div>
      <div className="mode-subject-list">
        {subjects?.map(s => (
          <div
            key={s?.subject}
            className={`mode-subject-item ${s?.subject === currentSubject ? 'active' : ''}`}
            data-subject={s?.subject}
            onClick={onSwitch}
          >
            <span>{formatName(s?.subject)}</span>
            <span className="mode-subject-count">{s?.count}</span>
          </div>
        ))}
      </div>
    </aside>
  )
})

const QuestionView = memo(function QuestionView({ currentQs }) {
  const q = currentQs.question
  const isStructured = typeof q === 'object' && q !== null
  return (
    <>
      <div className="mode-question-tags">
        <span className="mode-tag">JAMB {currentQs.year}</span>
        <span className="mode-tag">{currentQs.topic}</span>
      </div>
      <div className="mode-question-text">
        {currentQs.image?.url && <Image imageUrl={currentQs.image.url} />}
        {isStructured && q.instruction && (
          <>
            <strong><MarkdownContent>{q.instruction}</MarkdownContent></strong>
            <br />
          </>
        )}
        {isStructured && q.comprehension && (
          <>
            <strong dangerouslySetInnerHTML={{ __html: q.comprehension }} />
            <br />
          </>
        )}
        <MarkdownContent>{isStructured ? q.qs ?? '' : q ?? ''}</MarkdownContent>
      </div>
    </>
  )
})

const OptionsList = memo(function OptionsList({ options, activeState, mode, onSelect }) {
  if (!options) return null
  return options.map((opt) => (
    <div className="mode-options" key={opt.id} onClick={() => !activeState?.status && mode !== 'review' && onSelect(opt.id)}>
      <div className={`mode-option ${activeState?.userAnswer === opt.id ? activeState?.status  : activeState?.correctAnswers.includes(opt.id) && activeState?.userAnswer ? 'correct' : ''}`}>
        <div className="mode-option-key">{opt.id.toUpperCase()}</div>
        <div className="mode-option-content">
          <div className="mode-option-text">
            <MarkdownContent>{opt.option}</MarkdownContent>
          </div>
        </div>
      </div>
    </div>
  ))
})

// Progress badge lookups are O(1) object reads (answers is keyed by question id),
// so this whole grid is a single O(n) pass instead of the old O(n^2) "find per button".
//
// `total` is how many questions the subject will have once loading finishes.
// Any slot past the loaded `questions` is rendered as a disabled spinner
// until its question arrives.
const NavigatorGrid = memo(function NavigatorGrid({ questions, total, currentQsIdx, answers, onSelect }) {
  const slots = Math.max(total ?? 0, questions?.length ?? 0)
  const buttons = []

  for (let index = 0; index < slots; index++) {
    const q = questions[index]

    if (!q) {
      buttons.push(
        <button
          key={`pending-${index}`}
          className="mode-progress-btn pending"
          disabled
          aria-label={`Question ${index + 1} is loading`}
          title="Loading..."
        >
          <span className="mode-spinner small" aria-hidden="true" />
        </button>
      )
      continue
    }

    const status = answers[q.id]?.status ?? ''
    const isActive = index === currentQsIdx
    buttons.push(
      <button
        key={q.id}
        className={`mode-progress-btn ${isActive ? 'active' : ''} ${status}`}
        onClick={() => onSelect(index)}
      >
        {index + 1}
      </button>
    )
  }

  return (
    <>
      <div className="mode-progress-grid">{buttons}</div>
      <div className="exam-progress-legend">
        <div className="exam-legend-item"><div className="exam-legend-box current"></div><span>Current Question</span></div>
        <div className="exam-legend-item"><div className="exam-legend-box answered"></div><span>Correct</span></div>
        <div className="exam-legend-item"><div className="exam-legend-box failed"></div><span>Wrong</span></div>
        <div className="exam-legend-item"><div className="exam-legend-box unanswered"></div><span>Unanswered</span></div>
        <div className="exam-legend-item"><div className="exam-legend-box viewed"></div><span>Viewed</span></div>
      </div>
    </>
  )
})

/* ============================================================
   Static modal copy — kept as data instead of seven near-identical
   JSX blocks, so there's one place that renders a Modal.
   ============================================================ */
const MODAL_COPY = {
  server_error: {
    type: 'error',
    title: 'Server Error',
    body: "We couldn't complete your request due to a server error. This is usually temporary. Please try again in a few moments. If the problem persists, refresh the page or contact support.",
    primaryLabel: 'Retry',
  },
  connection_lost: {
    type: 'error',
    title: 'Connection Lost',
    body: 'Your internet connection was interrupted. Reconnect to the internet and try again.',
    primaryLabel: 'Retry',
  },
  subject_not_found: {
    type: 'info',
    title: 'Subject Not Found',
    body: 'The subject you selected could not be found or may have been removed. Please return to the subject configuration page and select a valid subject from the list to continue.',
    primaryLabel: 'Change Subject',
    closeLabel: 'Leave anyway',
  },
  available_questions: {
    type: 'info',
    title: 'Available Offline Questions',
    body: "Some questions matching your selected filters aren't available in offline mode. The available questions have been displayed.",
    primaryLabel: 'Continue',
  },
  no_questions_found_offline: {
    type: 'info',
    title: 'Questions Not Found',
    body: "No questions were found for your selected subject, year, and topic. This may be because the questions aren't available in offline mode. Connect to the internet to access the latest questions or try a different selection.",
    primaryLabel: 'Adjust Filters',
    closeLabel: 'Leave anyway',
  },
  no_questions_found: {
    type: 'info',
    title: 'No Questions Found',
    body: 'No questions are available for the selected subject, year, and topic combination. Please adjust your filters and try a different selection. If you believe this is an error, contact support.',
    primaryLabel: 'Adjust Filters',
    closeLabel: 'Leave anyway',
  },
  failed_to_load: {
    type: 'error',
    title: 'Failed to Load Questions',
    body: 'We were unable to load the exam questions due to a data loading error. Your session is safe. Click Reload to fetch questions again. If this continues, check your connection and try again.',
    primaryLabel: 'Reload',
  },
}

/* ============================================================
   Main component
   ============================================================ */

export default function StudySimulator() {
  const studyConfig = studyStore((state) => state.studyConfig)
  const userId = userStore((state) => state.userId)
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const mode = searchParams.get('mode')

  // Loaded once per session and left alone afterwards — navigating between
  // questions never touches this, so the Sidebar never re-renders for it.
  // In study mode, `questions` grows and `count` is the expected total while streaming.
  const [subjects, setSubjects] = useState([])
  const [currentSubject, setCurrentSubject] = useState(null)

  // Which question index each subject is currently on. Keyed by subject
  // name so moving forward/back is an O(1) object update, not a scan
  // over an array of subject objects.
  const [idxBySubject, setIdxBySubject] = useState({})

  // All answer state, keyed by question id. Every lookup below is a
  // direct object read — no .find()/.findIndex() over question lists.
  const [answers, setAnswers] = useState({})

  const [loading, setLoading] = useState(true)
  // True while the remaining study questions are still being loaded in the background.
  const [isStreaming, setIsStreaming] = useState(false)
  const [refresh, setRefresh] = useState(false)
  const [modal, setModal] = useState(null)
  const [chatWithAI, setChatWithAI] = useState(false)
  const [toggleCalc, setToggleCalc] = useState(false)
  const [toggleNav, setToggleNav] = useState(false)
  const [reportOpen, setReportOpen] = useState(false)

  const navModalRef = useRef(null)
  const calcModalRef = useRef(null)

  const closeModal = useCallback(() => setModal(null), [])

  // --- Derived lookups (all O(1) once `subjects` is set) ---
  const subjectsByName = useMemo(
    () => Object.fromEntries(subjects.map((s) => [s.subject, s])),
    [subjects]
  )
  const activeSubject = subjectsByName[currentSubject]
  const currentSubjectIndex = useMemo(
    () => subjects.findIndex((s) => s.subject === currentSubject),
    [subjects, currentSubject]
  )
  const currentQsIdx = idxBySubject[currentSubject] ?? 0
  const currentQs = activeSubject?.questions?.[currentQsIdx] || {}
  const activeState = Object.keys(currentQs).length > 0 ? answers[currentQs.id] : undefined
  const isBookmarked = !!activeState?.isBookmarked
  const isDisablePrevious = currentSubjectIndex === 0 && currentQsIdx === 0

  // The next question exists in the sequence but hasn't finished loading yet.
  // (Only ever true in study mode while streaming.)
  const isNextPending =
    isStreaming &&
    !!activeSubject &&
    currentQsIdx + 1 < activeSubject.count &&
    !activeSubject.questions?.[currentQsIdx + 1]

  // --- Global no-copy protection (unchanged) ---
  useEffect(() => {
    const prevent = (e) => e.preventDefault()
    const preventKeys = (e) => {
      if ((e.ctrlKey || e.metaKey) && ['c', 'x', 'u', 's', 'p'].includes(e.key.toLowerCase())) {
        e.preventDefault()
      }
      if (e.key === 'PrintScreen') {
        navigator.clipboard.writeText('')
      }
    }
    document.addEventListener('contextmenu', prevent)
    document.addEventListener('copy', prevent)
    document.addEventListener('cut', prevent)
    document.addEventListener('keydown', preventKeys)
    return () => {
      document.removeEventListener('contextmenu', prevent)
      document.removeEventListener('copy', prevent)
      document.removeEventListener('cut', prevent)
      document.removeEventListener('keydown', preventKeys)
    }
  }, [])

  // --- Inject notification-system styles once ---
  useEffect(() => {
    const el = document.createElement('style')
    el.id = '__ns_styles'
    el.textContent = CSS[0]
    document.head.appendChild(el)
    return () => document.getElementById('__ns_styles')?.remove()
  }, [])

  // --- Load data for the current mode ---
  useEffect(() => {
    let cancelled = false
    const controller = new AbortController()

    if (mode === 'review') {
      const { examQuestions, examConfig, answers: globalAnswers } = examStore.getState()
      if (!examQuestions?.length || !examConfig || !globalAnswers?.length) return navigate('/')

      // Build a question-id -> question map once, so scoring every answer
      // below is an O(1) lookup instead of a per-answer .find() scan.
      const questionsById = Object.fromEntries(examQuestions.map((q) => [q.id, q]))

      const builtSubjects = examConfig.subjects.map(({ name, qsNo }) => ({
        subject: name,
        count: qsNo,
        questions: examQuestions.filter((q) => q.subject === name),
      }))

      const answersMap = {}
      globalAnswers.forEach((a) => {
        const userAnswer = a.userAnswers?.[0] ?? ''
        const correctAnswers = questionsById[a.id]?.correctAnswers
        const status = userAnswer ? (correctAnswers?.includes(userAnswer) ? 'correct' : 'wrong') : ''
        answersMap[a.id] = { userAnswer, status, correctAnswers, isBookmarked: a.isBookmarked }
      })

      setSubjects(builtSubjects)
      setAnswers(answersMap)
      setIdxBySubject({})
      setCurrentSubject(builtSubjects[0]?.subject ?? null)
      setIsStreaming(false)
      setLoading(false)
      return
    }

    if (mode === 'study') {
      // Questions that have been handed to the UI so far (used by the streaming path).
      const loaded = []

      const newAnswerEntry = (q) => [
        q.id,
        { userAnswer: '', status: '', isBookmarked: false, correctAnswers: q.correctAnswers },
      ]

      // Everything already arrived in one go (online response) — nothing to stream.
      const showAll = (subject, data) => {
        setSubjects([{ subject, count: data.length, questions: data }])
        setAnswers(Object.fromEntries(data.map(newAnswerEntry)))
        setIdxBySubject({})
        setCurrentSubject(subject)
        setIsStreaming(false)
      }

      // Stop showing spinners: whatever has loaded is the final list.
      const finishStreaming = (subject) => {
        setSubjects([{ subject, count: loaded.length, questions: [...loaded] }])
        setIsStreaming(false)
      }

      ;(async () => {
        if (!studyConfig) return navigate('/')
        setLoading(true)
        setIsStreaming(false)
        try {
          const { subject, years, topics, shuffle } = studyConfig

          if (navigator.onLine) {
            const res = await request.auth('/api/study', { method: 'POST', body: JSON.stringify(studyConfig) })
            const data = decrypt(res.body)
            Promise.all([saveQuestions(data), saveAllImages(data)]).catch((err) => console.error(err))

            if (cancelled) return
            showAll(subject, data)
          } else {
            // Offline: stream questions out of IndexedDB one by one.
            // The page opens as soon as the first question is ready.
            await loadQuestionsInBackground(
              { subject, years, topics, shuffle },
              {
                limit: STUDY_LIMIT,
                signal: controller.signal,

                onQuestion: async (question) => {
                  if (cancelled || controller.signal.aborted) throw CANCELLED
                  loaded.push(question)

                  // Expected total is the limit until we know better; the
                  // navigator shows a spinner for every slot not loaded yet.
                  setSubjects([{ subject, count: STUDY_LIMIT, questions: [...loaded] }])
                  setAnswers((prev) => ({ ...prev, ...Object.fromEntries([newAnswerEntry(question)]) }))

                  if (loaded.length === 1) {
                    // First question is ready → show the page right away.
                    setIdxBySubject({})
                    setCurrentSubject(subject)
                    setIsStreaming(true)
                    setLoading(false)
                  }

                  // Let React paint before the next question is pulled in.
                  await yieldToBrowser()
                },

                onComplete: () => {
                  if (cancelled || controller.signal.aborted) return
                  if (loaded.length === 0) return
                  finishStreaming(subject)
                  const subTopicsCount = subjectsData.find(s => s.name === subject)?.topics?.length
                  const selectedTopicsCount = topics?.length
                  const selectedDiff = subTopicsCount - selectedTopicsCount
                  if (loaded.length < STUDY_LIMIT && selectedDiff > (subTopicsCount / 2) && years.length >= 5) setModal('available_questions')
                },

                onError: (error) => {
                  if (controller.signal.aborted) return
                  console.log(error)
                }
              }
            )

            if (cancelled) return
            if (loaded.length === 0) throw { status: 404, error: 'no_questions_found_offline' }
          }
        } catch (err) {
          if (cancelled || err === CANCELLED) return

          // Already showing some questions? Keep them, just stop the spinners.
          if (loaded.length > 0) {
            finishStreaming(studyConfig.subject)
            return
          }

          setIsStreaming(false)
          if (!err.status && !navigator.onLine) setModal('connection_lost')
          else if (err.status >= 500) setModal('server_error')
          else setModal(err.error && !navigator.onLine ? err.error : err.error === 'no_questions_found' ? 'no_questions_found' : 'failed_to_load')
        } finally {
          if (!cancelled) setLoading(false)
        }
      })()
    }

    return () => { 
      cancelled = true
      controller.abort()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, refresh])

  // --- Close nav / calculator overlays on outside click ---
  useEffect(() => {
    function handleClickOutside(event) {
      if (toggleNav && navModalRef.current && !navModalRef.current.contains(event.target)) {
        setToggleNav(false)
      }
      if (toggleCalc && calcModalRef.current && !calcModalRef.current.contains(event.target)) {
        setToggleCalc(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [toggleCalc, toggleNav])

  const subjectId = useMemo(
    () => subjectsData.find((s) => s.name === studyConfig.subject)?.id,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )

  // --- Navigation ---
  const goToIndex = useCallback((subject, index) => {
    setIdxBySubject((prev) => ({ ...prev, [subject]: index }))
  }, [])

  const prevQuestion = useCallback(() => {
    if (isDisablePrevious) return
    if (currentQsIdx === 0) {
      const prevSubject = subjects[currentSubjectIndex - 1]
      setCurrentSubject(prevSubject.subject)
      goToIndex(prevSubject.subject, prevSubject.count - 1)
      return
    }
    goToIndex(currentSubject, currentQsIdx - 1)
  }, [isDisablePrevious, currentQsIdx, currentSubjectIndex, subjects, currentSubject, goToIndex])

  const nextQuestion = useCallback(() => {
    // Next question is still loading — the button is disabled, this is just a safety net.
    if (isNextPending) return

    const isLastQuestion = currentQsIdx === activeSubject.count - 1
    const isLastSubject = currentSubjectIndex === subjects.length - 1

    if (!isLastQuestion) {
      goToIndex(currentSubject, currentQsIdx + 1)
      return
    }
    const nextSubject = subjects[isLastSubject ? 0 : currentSubjectIndex + 1]
    setCurrentSubject(nextSubject.subject)
    goToIndex(nextSubject.subject, 0)
  }, [isNextPending, currentQsIdx, activeSubject, currentSubjectIndex, subjects, currentSubject, goToIndex])

  const switchSubject = useCallback((event) => {
    setCurrentSubject(event.currentTarget.dataset.subject)
  }, [])

  // --- Answers ---
  const selectOption = useCallback((optId = '') => {
    if (!currentQs) return
    const status = !optId ? 'selected' : currentQs.correctAnswers.includes(optId) ? 'correct' : 'wrong'
    setAnswers((prev) => ({
      ...prev,
      [currentQs.id]: { ...prev[currentQs.id], userAnswer: optId, status, correctAnswers: currentQs.correctAnswers },
    }))
  }, [currentQs])

  const toggleBookmark = useCallback(async () => {
    if (!currentQs) return
    const toggle = !isBookmarked
    const { id: qsId, ...qs } = currentQs
    const id = 'bmk' + qsId + userId
    if (toggle) {
      await addBookmark({ id, userId, ...qs })
    } else {
      await deleteBookmark(id)
    }
    setAnswers((prev) => ({ ...prev, [qsId]: { ...prev[qsId], isBookmarked: toggle } }))
  }, [currentQs, isBookmarked, userId])

  // --- Header actions (stable references — HeaderActions never re-renders for these) ---
  const goBack = useCallback(() => {
    if (mode === 'review') navigate('/practice')
    else if (mode === 'study') navigate(`/study/config?id=${subjectId}`)
  }, [mode, navigate, subjectId])
  const openReport = useCallback(() => setReportOpen(true), [])
  const openAiChat = useCallback(() => setChatWithAI(true), [])
  const openNavigator = useCallback(() => setToggleNav(true), [])
  const openCalculator = useCallback(() => setToggleCalc(true), [])
  const closeReport = useCallback(() => setReportOpen(false), [])
  const retry = useCallback(() => { closeModal(); setRefresh((r) => !r) }, [closeModal])

  if (!mode) return <Navigate to="/" />
  if (loading) return <SimulatorSkeleton />

  const modalCopy = modal ? MODAL_COPY[modal] : null

  return (
    <>
      <title>Review | CBT Pro</title>

      {chatWithAI && <AstraAIModal setChatWithAI={setChatWithAI} />}

      {
        !modalCopy || modal === 'available_questions'
          ? 
            (
              <div className="mode-page no-select" aria-live="polite">
                <Header
                  goBack={goBack}
                  openReport={openReport}
                  openAiChat={openAiChat}
                  openNavigator={openNavigator}
                  openCalculator={openCalculator}
                  toggleBookmark={toggleBookmark}
                  isBookmarked={isBookmarked}
                />
        
                <div className="mode-container">
                  <Sidebar subjects={subjects} currentSubject={currentSubject} onSwitch={switchSubject} />
        
                  <main className="mode-main">
                    <div className="mode-nav">
                      <button className="mode-nav-btn" onClick={prevQuestion} disabled={isDisablePrevious}>← Prev</button>
                      <div className="mode-question-info">Question {currentQsIdx + 1} of {activeSubject?.count}</div>
                      <button
                        className={`mode-nav-btn ${isNextPending ? 'is-loading' : ''}`}
                        onClick={nextQuestion}
                        disabled={isNextPending}
                        aria-busy={isNextPending}
                      >
                        {isNextPending ? (
                          <>
                            <span className="mode-spinner small" aria-hidden="true" />
                            Loading
                          </>
                        ) : (
                          'Next →'
                        )}
                      </button>
                    </div>
        
                    <div>
                      <QuestionView currentQs={currentQs} />
                      <OptionsList options={currentQs?.options} activeState={activeState} mode={mode} onSelect={selectOption} />
                      {activeState?.status && (
                        <AnswerCard
                          explanation={currentQs.explanation.text}
                          correctAnswers={currentQs.correctAnswers.join(' ').toUpperCase()}
                          ques={currentQs}
                          setChatWithAI={setChatWithAI}
                        />
                      )}
                      <div className="mode-actions">
                        <button className="mode-btn-show" disabled={!!activeState?.status} onClick={() => selectOption()}>
                          Show Answer
                        </button>
                      </div>
                    </div>
                  </main>
        
                  <aside className="mode-panel">
                    <div className="mode-panel-header">
                      <div className="mode-panel-title">Question Navigator</div>
                    </div>
                    <NavigatorGrid
                      questions={activeSubject?.questions}
                      total={activeSubject?.count}
                      currentQsIdx={currentQsIdx}
                      answers={answers}
                      onSelect={(index) => goToIndex(currentSubject, index)}
                    />
                  </aside>
                </div>
        
                <button className="mode-fab" onClick={() => setToggleNav((v) => !v)}>≡</button>
        
                <div className={`mode-overlay ${toggleNav ? 'show' : ''}`}>
                  <div className="mode-modal" ref={navModalRef}>
                    <div className="mode-modal-header">
                      <div className="mode-modal-title">Question Navigator</div>
                      <button className="mode-modal-close" onClick={() => setToggleNav(false)}>×</button>
                    </div>
                    <NavigatorGrid
                      questions={activeSubject?.questions}
                      total={activeSubject?.count}
                      currentQsIdx={currentQsIdx}
                      answers={answers}
                      onSelect={(index) => { goToIndex(currentSubject, index); setToggleNav(false) }}
                    />
                  </div>
                </div>
        
              </div>
            )
          :
            <SimulatorSkeleton />
      }
      
      {modalCopy && (
        <Modal
          {...modalCopy}
          onPrimary={() => {
            switch (modal) {
              case 'server_error':
              case 'connection_lost':
              case 'failed_to_load':
                retry()
                break
              case 'subject_not_found':
              case 'no_questions_found_offline':
              case 'no_questions_found':
                navigate(modal === 'subject_not_found' ? '/study' : `/study/config?id=${subjectId}`)
                break
              default:
                closeModal()
            }
          }}
          onClose={() => {
            switch (modal) {
              case 'server_error':
              case 'connection_lost':
                closeModal(); navigate(-1)
                break
              case 'subject_not_found':
                navigate('/study')
                break
              case 'no_questions_found_offline':
                navigate('/study')
                break
              case 'no_questions_found':
                navigate('/study')
                break
              case 'failed_to_load':
                navigate(`/study/config?id=${subjectId}`)
                break
              default:
                closeModal()
            }
          }}
        />
      )}

      {reportOpen && (
        <ReportQuestionModal
          questionId={currentQs?.id}
          subject={currentQs?.subject}
          questionNo={currentQsIdx + 1}
          onClose={closeReport}
        />
      )}

      <Calculator toggleCalc={toggleCalc} setToggleCalc={setToggleCalc} calcModalRef={calcModalRef} />
    </>
  )
}
