import { useState, useEffect, useRef, memo, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { MarkdownContent } from '../components/MarkdownContent';
import { formatName } from '../scripts/utils/formatName.js';
import { CountdownTimer } from '../components/CountdownTimer'
import { Calculator } from '../components/Calculator'
import { Loading } from '../components/Loading';
import { Offline } from '../components/Offline';
import { LoadError } from '../components/LoadError';
import { Image } from '../components/common/Image'
import { ModalStripe, CSS } from '../components/NotificationSystem';
import { practiceStore } from '../stores/practiceStore';
import { scheduledExamStore } from '../stores/scheduledExamStore';
import { examStore } from '../stores/examStore';
import { userStore } from '../stores/userStore';
import { addBookmark, deleteBookmark } from '../hooks/services/indexedDB/bookmarks.js';
import './ExamSimulator.css';

/* ============================================================
   Small, stable, memoized pieces — each one only re-renders
   when the specific props it needs actually change.
   ============================================================ */

const ExamTimer = memo(function ExamTimer({ submitExam, hours, minutes, skipAutoSubmit }) {
  return <CountdownTimer onFinish={submitExam} hours={hours} minutes={minutes} skipAutoSubmit={skipAutoSubmit} />;
});

// Never re-renders on question navigation — only cares about the
// (stable) subject list and which one is active.
const Sidebar = memo(function Sidebar({ subjects, currentSubject, onSwitch }) {
  return (
    <aside className="exam-sidebar">
      <div className="exam-sidebar-title">Subjects</div>
      <div className="exam-subject-list">
        {subjects.map((sub) => (
          <div
            key={sub.name}
            className={`exam-subject-item ${sub.name === currentSubject ? 'active' : ''}`}
            data-name={sub.name}
            onClick={onSwitch}
            data-testid={`subject-item-${sub.name.toLowerCase()}`}
          >
            <span>{formatName(sub.name)}</span>
            <span className="exam-subject-count">{String(sub.qsNo)}</span>
          </div>
        ))}
      </div>
    </aside>
  )
})

const QuestionView = memo(function QuestionView({ ques }) {
  const q = ques.question
  const isStructured = typeof q === 'object' && q !== null
  return (
    <div className="exam-question-text">
      {ques.image?.url && <Image imageUrl={ques.image.url} />}
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
  )
})

const OptionsList = memo(function OptionsList({ qsId, options, userAnswer, onSelect }) {
  return (
    <div className="exam-options">
      {options.map((opt) => (
        <div
          key={opt.id}
          className={`exam-option ${opt.id === userAnswer ? 'selected' : ''}`}
          onClick={() => onSelect(qsId, opt.id)}
          data-testid={`selected-option-${opt.id}`}
        >
          <div className="exam-option-key">{opt.id.toUpperCase()}</div>
          <div className="exam-option-content">
            <div className="exam-option-text">
              <MarkdownContent>{opt.option}</MarkdownContent>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
})

// The buttons only — reused by both the side panel and the mobile overlay
// instead of two copies of the same grid.
const ProgressGrid = memo(function ProgressGrid({ list, answeredIdx, currentIndex, onSelect, testIdPrefix }) {
  return (
    <div className="exam-progress-grid">
      {list.map((num) => (
        <button
          key={num}
          className={`exam-progress-btn ${answeredIdx.includes(num) ? 'answered' : ''} ${currentIndex + 1 === num ? 'active' : ''}`}
          onClick={() => onSelect(num)}
          data-testid={testIdPrefix ? `${testIdPrefix}-${num}` : undefined}
        >
          {num}
        </button>
      ))}
    </div>
  )
})

const ProgressSummary = memo(function ProgressSummary({ totalAnswered, totalUnanswered }) {
  return (
    <div className="exam-progress-summary">
      <div className="exam-summary-row"><span>Answered</span><strong>{totalAnswered}</strong></div>
      <div className="exam-summary-row"><span>Unanswered</span><strong>{totalUnanswered}</strong></div>
    </div>
  )
})

const ModalOverlay = memo(function ModalOverlay({ onClose, children }) {
  return (
    <div className="ns-overlay" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} style={{ width: '100%', display: 'flex', justifyContent: 'center', padding: '0 1rem' }}>
        {children}
      </div>
    </div>
  )
})

/* ============================================================
   Main component
   ============================================================ */

export default function ExamSimulator() {
  const examConfig = examStore((state) => state.examConfig);
  const answers = examStore((state) => state.answers);
  const setAnswers = examStore((state) => state.setAnswers);
  const offline = examStore((state) => state.offline)
  const setOffline = examStore((state) => state.setOffline)
  const loadError = examStore((state) => state.loadError)
  const setLoadError = examStore((state) => state.setLoadError)
  const userId = userStore((state) => state.userId)
  const navigate = useNavigate();

  const [toggleCalc, setToggleCalc] = useState(false);
  const [toggleNav, setToggleNav] = useState(false);
  const [examData, setExamData] = useState(null);
  const [currentSubject, setCurrentSubject] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isActive, setIsActive] = useState(true)
  const [loading, setLoading] = useState(true)
  const [refresh, setRefresh] = useState(false)
  const [modal, setModal] = useState(null);
  const closeModal = useCallback(() => setModal(null), [])

  const navModalRef = useRef(null);
  const calcModalRef = useRef(null);
  const skipAutoSubmit = useRef(false)

  // --- Derived data (all recomputed only when their real inputs change) ---
  const subjectNames = useMemo(() => examConfig.subjects.map((s) => s.name), [examConfig])
  const currentSubjectIndex = subjectNames.indexOf(currentSubject)
  const currentQs = examData ? examData[currentSubject]?.questions[currentIndex] : null

  // id -> answer lookup, built once per answers change instead of
  // re-scanning the array with .find() on every click.
  const answersById = useMemo(() => Object.fromEntries(answers.map((a) => [a.id, a])), [answers])
  const activeAnswer = currentQs ? answersById[currentQs.id] : undefined
  const userAnswer = activeAnswer?.userAnswers[0] ?? ''
  const savedBookmark = !!activeAnswer?.isBookmarked

  const isDisablePrev = currentSubjectIndex === 0 && currentIndex === 0
  const progressGridList = useMemo(
    () => Array.from({ length: examData?.[currentSubject]?.count ?? 0 }, (_, i) => i + 1),
    [examData, currentSubject]
  )

  // Answered/unanswered counts for the current subject, derived straight
  // from `answers` — no manual "please recompute now" counter needed.
  const { answeredIdx, totalAnswered, totalUnanswered } = useMemo(() => {
    const subjectAnswers = answers.filter((a) => a.subject === currentSubject)
    const idxs = []
    subjectAnswers.forEach((a, i) => { if (a.userAnswers.length > 0) idxs.push(i + 1) })
    return { answeredIdx: idxs, totalAnswered: idxs.length, totalUnanswered: subjectAnswers.length - idxs.length }
  }, [answers, currentSubject])

  const totalUnansweredOverall = useMemo(
    () => answers.filter((a) => a.userAnswers.length === 0).length,
    [answers]
  )

  // --- Global no-copy protection + notification styles ---
  useEffect(() => {
    const prevent = (e) => e.preventDefault();
    const preventKeys = (e) => {
      if ((e.ctrlKey || e.metaKey) && ['c', 'x', 'u', 's', 'p'].includes(e.key.toLowerCase())) {
        e.preventDefault();
      }
      if (e.key === 'PrintScreen') {
        navigator.clipboard.writeText('');
      }
    };
    document.addEventListener('contextmenu', prevent);
    document.addEventListener('copy', prevent);
    document.addEventListener('cut', prevent);
    document.addEventListener('keydown', preventKeys);

    const el = document.createElement('style');
    el.id = '__ns_styles';
    el.textContent = CSS[0];
    document.head.appendChild(el);

    return () => {
      document.removeEventListener('contextmenu', prevent);
      document.removeEventListener('copy', prevent);
      document.removeEventListener('cut', prevent);
      document.removeEventListener('keydown', preventKeys);
      document.getElementById('__ns_styles')?.remove();
    };
  }, []);

  // --- Block browser back button during the exam ---
  useEffect(() => {
    window.history.pushState({ examGuard: true }, '', window.location.pathname);
    const handlePopState = () => {
      window.history.pushState({ examGuard: true }, '', window.location.pathname);
      setModal('leave_exam');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // --- Load exam data ---
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true)
      const { subjects, examType } = examConfig;
      const shape = Object.fromEntries(subjects.map((s) => [s.name, { subName: s.name, count: s.qsNo, questions: [] }]))
      try {
        let data
        if (examType === 'scheduled') {
          data = await scheduledExamStore.getState().getExamQuestions({ subjects, shuffle: examConfig.shuffle, examId: examConfig.examId })
        } else {
          data = await practiceStore.getState().getPracticeQuestions({ subjects })
        }
        if (cancelled) return

        data.forEach((d) => shape[d.subject].questions.push(d))
        setExamData(shape)
        setAnswers(data.map((d) => ({ id: d.id, subject: d.subject, userAnswers: [], isBookmarked: false })))
        setCurrentSubject(subjects[0].name)
        setCurrentIndex(0)
      } catch (err) {
        if (cancelled) return
        if (examType === 'scheduled') {
          console.error('Error:', err.message)
          setModal('failed_to_load')
        } else if (!navigator.onLine) {
          setModal({ type: 'insufficient_question', body: err.message || 'No questions found.' })
        } else {
          setModal('failed_to_load')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()

    return () => {
      cancelled = true
      setOffline(null)
      setLoadError(null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refresh]);

  // --- Close nav / calculator overlays on outside click ---
  useEffect(() => {
    function handleClickOutside(event) {
      if (toggleNav && navModalRef.current && !navModalRef.current.contains(event.target)) {
        setToggleNav(false);
      }
      if (toggleCalc && calcModalRef.current && !calcModalRef.current.contains(event.target)) {
        setToggleCalc(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [toggleNav, toggleCalc]);

  // --- Navigation ---
  const previousQuestion = useCallback(() => {
    if (currentIndex === 0) {
      if (currentSubjectIndex === 0) return
      const prevSubject = subjectNames[currentSubjectIndex - 1]
      setCurrentSubject(prevSubject)
      setCurrentIndex(examData[prevSubject].count - 1)
    } else {
      setCurrentIndex((i) => i - 1)
    }
  }, [currentIndex, currentSubjectIndex, subjectNames, examData])

  const nextQuestion = useCallback(() => {
    const { count } = examData[currentSubject]
    if (currentIndex < count - 1) {
      setCurrentIndex((i) => i + 1)
      return
    }
    const nextSubject = subjectNames[(currentSubjectIndex + 1) % subjectNames.length]
    setCurrentSubject(nextSubject)
    setCurrentIndex(0)
  }, [currentIndex, currentSubject, currentSubjectIndex, subjectNames, examData])

  const switchSubject = useCallback((event) => {
    setCurrentSubject(event.currentTarget.dataset.name)
    setCurrentIndex(0)
  }, [])

  const goToQuestion = useCallback((num) => {
    setCurrentIndex(num - 1)
    setToggleNav(false)
  }, [])

  // --- Answers ---
  const selectOption = useCallback((qsId, optId) => {
    setAnswers((prev) => prev.map((ans) => {
      if (ans.id !== qsId) return ans
      const alreadySelected = ans.userAnswers[0] === optId
      return { ...ans, userAnswers: alreadySelected ? [] : [optId] }
    }))
  }, [setAnswers])

  const toggleBookmark = useCallback(async () => {
    if (!currentQs) return
    const { id: qsId, ...qs } = currentQs
    const toggle = !answersById[qsId]?.isBookmarked
    const id = 'bmk' + qsId + userId
    if (toggle) {
      await addBookmark({ id, userId, ...qs })
    } else {
      await deleteBookmark(id)
    }
    setAnswers((prev) => prev.map((ans) => ans.id === qsId ? { ...ans, isBookmarked: toggle } : ans))
  }, [currentQs, answersById, userId, setAnswers])

  // --- Submit / navigation chrome ---
  const submitExam = useCallback((submitType = 'auto') => {
    if (submitType === 'manual') {
      setModal('submit_exam')
      return
    }
    setIsActive(false)
  }, [])

  const toggleNavigator = useCallback(() => setToggleNav((v) => !v), [])
  const toggleCalculator = useCallback(() => setToggleCalc((v) => !v), [])

  const goBack = useCallback(() => {
    skipAutoSubmit.current = true
    const path = examConfig.examType === '' ? '/exam-planner' : '/practice'
    navigate(path)
  }, [examConfig, navigate])

  const retryLoad = useCallback(() => {
    closeModal()
    setLoading(true)
    setRefresh((r) => !r)
  }, [closeModal])

  if (loadError) return <LoadError onRetry={loadError?.onRetry ?? undefined} message={loadError?.message ?? undefined} homeTo={loadError?.homeTo ?? undefined} homeLabel={loadError?.homeLabel ?? undefined} />
  if (offline) return <Offline onRetry={offline?.onRetry ?? undefined} text={loadError?.text ?? undefined} />
  if (!isActive) return <Loading />
  if (loading && import.meta.env.VITE_ENV !== 'development') return <Loading />

  return (
    <>
      <title>Exam | CBT Pro</title>

      <div className="exam-page no-select" aria-live="polite" data-testid="simulator">
        <header className="exam-header">
          <div className="exam-header-inner">
            <button className="exam-back-btn" onClick={goBack}>← Back</button>
            <div className="exam-timer">
              {isActive && <ExamTimer submitExam={submitExam} hours={examConfig.hours} minutes={examConfig.minutes} skipAutoSubmit={skipAutoSubmit} />}
            </div>
            <div className="exam-header-actions">
              <button className="exam-icon-btn" title="Questions" onClick={toggleNavigator}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="7" height="7"></rect>
                  <rect x="14" y="3" width="7" height="7"></rect>
                  <rect x="14" y="14" width="7" height="7"></rect>
                  <rect x="3" y="14" width="7" height="7"></rect>
                </svg>
              </button>
              <button className={`exam-icon-btn ${savedBookmark ? 'active' : ''}`} onClick={toggleBookmark}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"></path>
                </svg>
              </button>
              <button className="exam-icon-btn" onClick={toggleCalculator}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="7" y="21" width="10" height="2"></rect>
                  <rect x="7" y="17" width="10" height="2"></rect>
                  <rect x="7" y="13" width="10" height="2"></rect>
                  <rect x="7" y="9" width="10" height="2"></rect>
                  <rect x="7" y="5" width="10" height="2"></rect>
                </svg>
              </button>
            </div>
          </div>
        </header>

        <div className="exam-container">
          <Sidebar subjects={examConfig.subjects} currentSubject={currentSubject} onSwitch={switchSubject} />

          <main className="exam-main">
            <div className="exam-nav">
              <button className="exam-nav-btn" disabled={isDisablePrev} onClick={previousQuestion}>← Prev</button>
              <div className="exam-question-info">Question {currentIndex + 1} of {examData?.[currentSubject]?.count}</div>
              <button className="exam-nav-btn" onClick={nextQuestion}>Next →</button>
            </div>

            {currentQs && (
              <div key={currentQs.id}>
                <QuestionView ques={currentQs} />
                <OptionsList qsId={currentQs.id} options={currentQs.options} userAnswer={userAnswer} onSelect={selectOption} />
              </div>
            )}

            <div className="exam-actions">
              <button className="exam-btn-submit" onClick={() => submitExam('manual')} disabled={!isActive}>
                {!isActive ? 'Submitting...' : 'Submit Exam'}
              </button>
            </div>
          </main>

          <aside className="exam-panel">
            <div className="exam-panel-header">
              <div className="exam-panel-title">Question Navigator</div>
              <div className="exam-panel-stats">{currentIndex + 1}/{examData?.[currentSubject]?.count}</div>
            </div>
            <ProgressGrid list={progressGridList} answeredIdx={answeredIdx} currentIndex={currentIndex} onSelect={goToQuestion} />
            <div className="exam-progress-legend">
              <div className="exam-legend-item"><div className="exam-legend-box current"></div><span>Current Question</span></div>
              <div className="exam-legend-item"><div className="exam-legend-box answered"></div><span>Answered</span></div>
              <div className="exam-legend-item"><div className="exam-legend-box unanswered"></div><span>Unanswered</span></div>
            </div>
            <ProgressSummary totalAnswered={totalAnswered} totalUnanswered={totalUnanswered} />
          </aside>
        </div>

        <button className="exam-fab" onClick={toggleNavigator}>≡</button>

        <div className={`exam-overlay ${toggleNav ? 'show' : ''}`}>
          <div className="exam-modal" ref={navModalRef}>
            <div className="exam-modal-header">
              <div className="exam-modal-title">Question Navigator</div>
              <button className="exam-modal-close" onClick={() => setToggleNav(false)}>×</button>
            </div>
            <ProgressGrid list={progressGridList} answeredIdx={answeredIdx} currentIndex={currentIndex} onSelect={goToQuestion} testIdPrefix="navigator" />
            <ProgressSummary totalAnswered={totalAnswered} totalUnanswered={totalUnanswered} />
          </div>
        </div>

        {modal === 'submit_exam' && (
          <ModalOverlay onClose={closeModal}>
            <ModalStripe
              type="info"
              title="Submit Exam"
              body={totalUnansweredOverall > 0
                ? `You have ${totalUnansweredOverall} unanswered question${totalUnansweredOverall > 1 ? 's' : ''}. Submit anyway?`
                : 'Submit your exam now. This cannot be undone.'}
              primaryLabel="Yes, Submit Exam"
              onPrimary={() => setIsActive(false)}
              onClose={closeModal}
            />
          </ModalOverlay>
        )}
        {modal === 'leave_exam' && (
          <ModalOverlay onClose={closeModal}>
            <ModalStripe
              type="warning"
              title="Leave Exam?"
              body="Your answers will not be submitted if you leave now."
              primaryLabel="Leave Exam"
              secondaryLabel="Stay"
              onPrimary={() => { closeModal(); goBack() }}
              onClose={closeModal}
            />
          </ModalOverlay>
        )}
        {modal === 'failed_to_load' && (
          <ModalOverlay onClose={() => { closeModal(); goBack() }}>
            <ModalStripe
              type="error"
              title="Failed to Load Questions"
              body="We were unable to load the exam questions due to a data loading error. Your session is safe. Click Reload to fetch questions again. If this continues, check your connection and try again."
              primaryLabel="Reload"
              onPrimary={retryLoad}
              onClose={() => { closeModal(); goBack() }}
            />
          </ModalOverlay>
        )}
        {typeof modal === 'object' && modal?.type === 'insufficient_question' && (
          <ModalOverlay onClose={goBack}>
            <ModalStripe
              type="warning"
              title="Insufficient Questions"
              body={modal.body}
              primaryLabel="Retry"
              onPrimary={retryLoad}
              onClose={goBack}
            />
          </ModalOverlay>
        )}

        <Calculator toggleCalc={toggleCalc} setToggleCalc={setToggleCalc} calcModalRef={calcModalRef} />
      </div>
    </>
  );
}
