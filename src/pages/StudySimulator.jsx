import { useState, useEffect, useRef, memo, useCallback, useMemo } from 'react'
import { useNavigate, useSearchParams, Navigate } from 'react-router';
import { MarkdownContent } from '../components/MarkdownContent';
import { Calculator } from '../components/Calculator.jsx'
import { AstraAIModal } from '../components/AstraAIModal'
import { request } from '../scripts/utils/request';
import { subjectsData } from '../scripts/data/subjectsData.js'
import { Image } from '../components/common/Image'
import { formatName } from '../scripts/utils/formatName.js';
import { ModalStripe, CSS } from '../components/NotificationSystem';
import { ReportQuestionModal } from "../components/ReportQuestionModal";
import { AnswerCard } from '../components/AnswerCard';
import { Loading } from '../components/Loading';
import { saveQuestions, getQuestions } from '../hooks/services/indexedDB/questions';
import { saveAllImages } from '../hooks/services/indexedDB/images';
import { addBookmark, deleteBookmark} from '../hooks/services/indexedDB/bookmarks.js';
import { decrypt } from '../scripts/utils/crypto';
import { studyStore } from '../stores/studyStore';
import { userStore } from '../stores/userStore';
import { examStore } from '../stores/examStore';
//import './Mode.css';

function updateProgress(questions, qsId, status, progress){
  let index = questions.findIndex(item => item.id === qsId)

  const newProgress = {
    ...progress,
    unansweredIndices: progress.unansweredIndices.filter(i => i !== index)
  }

  if (status === 'selected'){
    newProgress.viewedIndices.push(index)
  } else if (status === 'correct'){
    newProgress.correctIndices.push(index)
  } else if (status === 'wrong'){
    newProgress.wrongIndices.push(index)
  }

  
  return newProgress
}


const Modal = memo(function Modal({type, title, body, primaryLabel, onPrimary, onClose, closeLabel }){
  return (
    <div className="ns-overlay" onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ width: '100%', display: 'flex', justifyContent: 'center', padding: '0 1rem' }}>
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

export default function StudySimulator() {
  const studyConfig = studyStore(state => state.studyConfig)
  const userId = userStore(state => state.userId)
  const navigate = useNavigate()
  const [toggleCalc, setToggleCalc] = useState(false);
  const [toggleNav, setToggleNav] = useState(false);
  //const [questions, setQuestions] = useState([])
  const [ currentSubject, setCurrentSubject ] = useState(null)
  const [subjectsDetail, setSubjectsDetail] = useState([
    {
      subject: 'English',
      count: 60,
      questions: [],
      progress: {
        viewedIndices: [],
        correctIndices: [],
        wrongIndices: []
      },
      currentQsIdx: 0,
      active: true
    }
  ])
  
  const [questionsState, setQuestionsState] = useState([])
  const [chatWithAI, setChatWithAI] = useState(false)
  const [refresh, setRefresh] = useState(false)
  //const [toggleBmk, setToggleBmk] = useState(false)
  const [currentBmkCheck, setCurrentBmkCheck] = useState(null)
  const [loading, setLoading] = useState(true)
  
  const [modal, setModal] = useState(null);
  const closeModal = () => setModal(null);
  
  /*========== Report Question modal =======*/
  const [open, setOpen] = useState(false)
  
  const navModalRef = useRef(null);
  const calcModalRef = useRef(null);

  const [searchParams] = useSearchParams()
  const mode = searchParams.get('mode')

  const activeSubjectDetail = useMemo(() => subjectsDetail.length ? subjectsDetail.find(d => d?.subject === currentSubject) : null, [subjectsDetail, currentSubject])

  const currentQs = useMemo(() => {
    if (!activeSubjectDetail) return ({})
    const subQsIdx = activeSubjectDetail?.currentQsIdx
    const { questions } = activeSubjectDetail
    return questions[subQsIdx] || {}
  }, [activeSubjectDetail])

  
  const activeState = useMemo(() => {
    if (!questionsState.length || !currentQs?.id) return null
    return questionsState.find(q => q.qsId === currentQs.id)
  }, [currentQs, questionsState])

  const progressBadge = useCallback((num) => {
    const qsId = activeSubjectDetail?.questions[num]?.id
    const status = questionsState.find(s => s.qsId == qsId)?.status ?? ''
    return `${activeState?.qsId === qsId ? 'active' : ''} ${status}`
  },[activeState])
  
  //============ Future Update ==========//
  // user uses keyboard to navigate questions
  

  // preventing user from copying anything on the page
  useEffect(() => {
    const prevent = (e) => e.preventDefault();
    const preventKeys = (e) => {
      if (
        (e.ctrlKey || e.metaKey) && 
        ['c', 'x', 'u', 's', 'p'].includes(e.key.toLowerCase())
      ) {
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

    return () => {
      document.removeEventListener('contextmenu', prevent);
      document.removeEventListener('copy', prevent);
      document.removeEventListener('cut', prevent);
      document.removeEventListener('keydown', preventKeys);
    };
  },[]);
  
  /*===== Render Modal Style ======*/
  useEffect(() => {
    const el = document.createElement("style");
    el.id = "__ns_styles";
    el.textContent = CSS[0];
    document.head.appendChild(el);
    return () => document.getElementById("__ns_styles")?.remove();
  }, []);
  
  useEffect(() => {
    let cancelled;
    
    if (mode === 'review'){
      const questions = examStore.getState().examQuestions
      const { subjects } = examStore.getState().examConfig
      const answers = examStore.getState().answers
      const subjectsDetailVar = []
      subjects.forEach(({ name, qsNo }, index) => {
        if (cancelled) return
        const subjectSpecificQs = questions.filter(qs => qs.subject === name)
        const subjectSpecificAns = answers.filter(ans => ans.subject === name)
        const viewedIndices = []
        const wrongIndices = []
        const correctIndices = []
        const unansweredIndices = []
        
        for (let i = 0; i < subjectSpecificAns.length; i++){
          const ans = subjectSpecificAns[i]
          if (!ans?.userAnswers.length){
            unansweredIndices.push(i)
            continue
          }

          const userAns = ans.userAnswers[0]
          const correctAns = subjectSpecificQs.find(qs => qs.id === ans.id)?.correctAnswers
          if (correctAns && correctAns.includes(userAns)){
            correctIndices.push(i)
          } else {
            wrongIndices.push(i)
          }
          
        }
        
        const subjectDetail = {
          subject: name,
          count: qsNo,
          questions: subjectSpecificQs,
          progress: {
            viewedIndices,
            wrongIndices,
            correctIndices,
            unansweredIndices
          },
          currentQsIdx: 0,
          active: index === 0 ? true : false
        }

        subjectsDetailVar.push(subjectDetail)
      })

      setSubjectsDetail(subjectsDetailVar)
      setQuestionsState(
        answers.map(a => {
          const userAns = a.userAnswers[0]
          const status = a.correctAnswers.includes(userAns) ? 'correct' : 'wrong'
          return ({...a, userAnswer: userAns, status })
        })
      )
      setCurrentSubject(subjects[0]?.name)
      setLoading(false)
      
    } else if (mode === 'study'){
      (async () => {
        let data;
        const subject = studyConfig.subject
        const years = studyConfig.years
        const topics = studyConfig.topics
        try {
          if (cancelled) return
          if (navigator.onLine){
            const res = await request.auth('/api/study', { method: 'POST', body: JSON.stringify(studyConfig)})
            data = decrypt(res.body)
            await saveQuestions(data).catch((err) => console.log(err))
            await saveAllImages(data)
          } else {
              
            const qs = await getQuestions({
              subject,
              years,
              topics,
            });
            if (qs.length === 0) {
              throw { status: 404, error: 'no_questions_found_offline' }
            } else {
              data = qs.splice(0, 100)
              setModal(data.length < 100 ? 'available_questions' : null) 
            }
          }
          
          setSubjectsDetail([{
            subject,
            count: data.length,
            questions: data,
            progress: {
              viewedIndices: [],
              wrongIndices: [],
              correctIndices: [],
              unansweredIndices: data.map((d, index) => index)
            },
            currentQsIdx: 0,
            active: true
          }])
          
          setQuestionsState(
            data.map(d => ({
              qsId: d.id,
              userAnswer: '',
              isBookmarked: false,
              correctAnswers: d.correctAnswers,
              status: ''
            }))
          )

          setCurrentSubject(subject)
        } catch (err) {
          if (!err.status && !navigator.onLine){
            setModal('connection_lost')
          } else if (err.status >= 500){
            setModal('server_error')
          } else {
            setModal(
              err.error && !navigator.onLine
                ? err.error
                : err.error === 'no_questions_found' ? 'no_questions_found' : 'failed_to_load'
            )
          }
        } finally {
          setLoading(false)
        }
      })()
    }
    return () => { cancelled = true }
     // eslint-disable-next-line react-hooks/exhaustive-deps
  },[refresh])
  
  function getSelectedOption(qsId, optId = ''){
    let status;
    setQuestionsState(prev => 
      prev.map(q => {
        if (q.qsId === qsId ){
          const { userAnswer, correctAnswers } = q
          status = !optId 
            ? 'selected' 
            : correctAnswers.includes(optId)
              ? 'correct'
              : 'wrong'
          return {...q, userAnswer: optId, status }
        } else {
          return q
        }
      }
    ))
    setSubjectsDetail(prev => 
      (
        prev.map(s => s.subject === currentSubject ? { ...s, progress: updateProgress(s.questions, qsId, status, s.progress)} : s )
      )
    )
  }

  function prevQuestion() {
    const { currentQsIdx, subject } = activeSubjectDetail;
    const currentSubjectIndex = subjectsDetail.findIndex(
      item => item.subject === subject
    );
  
    // Already at the first question of the first subject
    if (currentSubjectIndex === 0 && currentQsIdx === 0) return;
  
    // Move to the previous subject
    if (currentQsIdx === 0) {
      const prevSubject = subjectsDetail[currentSubjectIndex - 1].subject
      setSubjectsDetail(prev => 
        prev.map(item =>
          item.subject ===  prevSubject
            ? { ...item, currentQsIdx: item.count - 1 }
            : item
        )
      )
      setCurrentSubject(
        prevSubject
      );
      return;
    }
  
    // Move to the previous question
    setSubjectsDetail(prev =>
      prev.map(item =>
        item.subject === subject
          ? { ...item, currentQsIdx: currentQsIdx - 1 }
          : item
      )
    );
  }

  function nextQuestion() {
    const { currentQsIdx, subject, count } = activeSubjectDetail;
  
    const currentSubjectIndex = subjectsDetail.findIndex(
      item => item.subject === subject
    );
  
    const isLastQuestion = currentQsIdx === count - 1;
    const isLastSubject = currentSubjectIndex === subjectsDetail.length - 1;
  
    // Move to next question in the same subject
    if (!isLastQuestion) {
      setSubjectsDetail(prev =>
        prev.map(item =>
          item.subject === subject
            ? { ...item, currentQsIdx: currentQsIdx + 1 }
            : item
        )
      );
      return;
    }
  
    // Move to the next subject, or wrap back to the first subject
    const nextSubjectIndex = isLastSubject
      ? 0
      : currentSubjectIndex + 1;
  
    const nextSubject = subjectsDetail[nextSubjectIndex].subject;
  
    setSubjectsDetail(prev =>
      prev.map(item =>
        item.subject === nextSubject
          ? { ...item, currentQsIdx: 0 }
          : item
      )
    );
  
    setCurrentSubject(nextSubject);
  }

  const switchSubject = useCallback((event ) => {
    const { subject } = event.currentTarget.dataset
    setCurrentSubject(subject)
  },[])
  
  
  
  useEffect(() => {
    function handleClickOutside(event) {
      if (toggleNav && navModalRef.current &&!navModalRef.current.contains(event.target)) {
        setToggleNav(false);
      }
      if (toggleCalc && calcModalRef.current && !calcModalRef.current.contains(event.target)) {
        setToggleCalc(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [toggleCalc, toggleNav]);
  
  
  const subjectId = useMemo(() => subjectsData.find(subject => subject.name === studyConfig.subject)?.id, [])
  
  /*=== report question modal ===*/
  const onClose = useCallback(() => {
   setOpen(false) 
  },[setOpen])

  if (!mode) return <Navigate to="/" />
  if (loading) return <Loading />
  
  
  return (
    <>
      <title>Review | CBT Pro</title>
      
      {chatWithAI && <AstraAIModal setChatWithAI={setChatWithAI} />}
      
      <div className="mode-page no-select" aria-live="polite">

        <header className="mode-header">
          <div className="mode-header-inner">
            <button className="mode-back-btn" onClick={() => navigate(`/study/config?id=${subjectId}`)}>
              ← Back
            </button>
            <div className="mode-header-actions">
              <button className="mode-icon-btn" title="Report Question" onClick={() => setOpen(true)}>
                <svg xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round">
                  <path d="M4 2v20"/>
                  <path d="M4 4c2-1 4-1 6 0s4 1 6 0 4-1 4-1v11s-2 1-4 1-4-1-6-1-4 1-6 1V4z"/>
                </svg>
              </button>
              <button className="mode-icon-btn" title="Chat with AI" onClick={() => setChatWithAI(true)}>
                🤖
              </button>
              <button className="mode-icon-btn" title="Questions" onClick={() => setToggleNav(true)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="7" height="7"></rect>
                  <rect x="14" y="3" width="7" height="7"></rect>
                  <rect x="14" y="14" width="7" height="7"></rect>
                  <rect x="3" y="14" width="7" height="7"></rect>
                </svg>
              </button>
              <button className={`mode-icon-btn ${activeState?.isBookmarked ? 'active' : ''}`} onClick={async () => {
                const toggle = !activeState?.isBookmarked
                const { id: qsId, ...qs } = currentQs
                const id = 'bmk' + qsId + userId
                if (toggle){
                  const localBookmark = {
                    id,
                    userId,
                    ...qs
                  }
                  await addBookmark(localBookmark)
                } else {
                  await deleteBookmark(id)
                }
                setQuestionsState(prev =>
                  prev.map(item =>
                    item.qsId === qsId
                      ? {...item, isBookmarked: toggle }
                      : item
                  )
                )
              }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"></path>
                </svg>
              </button>
              <button className="mode-icon-btn" onClick={() => setToggleCalc(prev => !prev)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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

        <div className="mode-container">
          <aside className="mode-sidebar">
            <div className="mode-sidebar-title">Subjects</div>
            <div className="mode-subject-list">
              {
                subjectsDetail.map(({ subject, count }, index) => (
                  <div className={`mode-subject-item ${subject === currentSubject ? 'active' : ''}`} key={index} data-subject={subject} onClick={switchSubject}>
                    <span>{formatName(subject)}</span>
                    <span className="mode-subject-count">{count}</span>
                  </div>
                ))
              }
            </div>
          </aside>

          <main className="mode-main">
            <div className="mode-nav">
              <button className="mode-nav-btn" onClick={prevQuestion}>
                ← Prev
              </button>
              <div className="mode-question-info">Question {activeSubjectDetail.currentQsIdx + 1} of {activeSubjectDetail.count}</div>
              <button className="mode-nav-btn" onClick={nextQuestion}>
                Next →
              </button>
            </div>
            
            <div>
              <div>
                <div className="mode-question-tags">
                  <span className="mode-tag">JAMB {currentQs.year}</span>
                  <span className="mode-tag">{currentQs.topic}</span>
                </div>
                <div className="mode-question-text">
                
                  {currentQs.image?.url && <Image imageUrl={currentQs.image.url} />}
                  
                  {typeof currentQs.question === 'object' && currentQs.question?.instruction && <><strong><MarkdownContent>{currentQs.question.instruction}</MarkdownContent></strong><br /></>}
                  {typeof currentQs.question === 'object' && currentQs.question?.comprehension && <><strong dangerouslySetInnerHTML={{ __html: currentQs.question.comprehension }} /><br /></>}
                  {typeof currentQs.question === 'object'
                    ? (
                        <MarkdownContent>
                          {currentQs.question.qs ?? ""}
                        </MarkdownContent>
                      )
                    : (
                        <MarkdownContent >
                          {currentQs.question ?? ""}
                        </MarkdownContent>
                      )
                  }
                </div>
                {
                  currentQs?.options?.map(opt => {
                    return (
                      <div className="mode-options" key={opt.id} onClick={() => getSelectedOption(currentQs.id, opt.id)} disabled={activeState?.status ? true : false}>
                        <div className={`mode-option ${activeState?.status}`}>
                          <div className="mode-option-key">{opt.id.toUpperCase()}</div>
                          <div className="mode-option-content">
                            <div className="mode-option-text">
                              <MarkdownContent>
                                { opt.option }
                              </MarkdownContent>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })
                }
                {activeState?.status && 
                  (
                    <AnswerCard 
                      explanation={currentQs.explanation.text} 
                      correctAnswers={currentQs.correctAnswers.join(' ').toUpperCase()} 
                      ques={currentQs} 
                      setChatWithAI={setChatWithAI}
                    />
                  )
                }
              </div>
              
              <div className="mode-actions">
                <button className="mode-btn-show" disabled={activeState?.status ? true : false} onClick={() => getSelectedOption(currentQs.id)} >Show Answer</button>
              </div>
              </div>
          </main>

          <aside className="mode-panel">
            <div className="mode-panel-header">
              <div className="mode-panel-title">Question Navigator</div>
            </div>
            <div className="mode-progress-grid">
              {
                Array.from({ length: activeSubjectDetail.count }, (_, index) => index).map((index) => 
                  (
                    <button className={`mode-progress-btn ${progressBadge(index)}`} key={index} onClick={() => 
                      {
                        const { currentQsIdx } = activeSubjectDetail
                        if (index === currentQsIdx) return
                        setSubjectsDetail(prev =>
                          prev.map(item =>
                            item.subject === currentSubject
                              ? {...item, currentQsIdx: index }
                              : item
                          )
                        )
                      }
                    }>
                      {index + 1}
                    </button>
                  )
                )
              }
            </div>
            <div className="exam-progress-legend">
              <div className="exam-legend-item">
                <div className="exam-legend-box current"></div>
                <span>Current Question</span>
              </div>
              <div className="exam-legend-item">
                <div className="exam-legend-box answered"></div>
                <span>Correct</span>
              </div>
              <div className="exam-legend-item">
                <div className="exam-legend-box failed"></div>
                <span>Wrong</span>
              </div>
              <div className="exam-legend-item">
                <div className="exam-legend-box unanswered"></div>
                <span>Unanswered</span>
              </div>
              <div className="exam-legend-item">
                <div className="exam-legend-box viewed"></div>
                <span>Viewed</span>
              </div>
            </div>
          </aside>
        </div>

        <button className="mode-fab" onClick={() => setToggleNav(prev => !prev)}>≡</button>

        <div className={`mode-overlay ${toggleNav ? 'show' : ''}`}>
          <div className="mode-modal" ref={navModalRef}>
            <div className="mode-modal-header">
              <div className="mode-modal-title">Question Navigator</div>
              <button className="mode-modal-close" onClick={() => setToggleNav(prev => !prev)}>×</button>
            </div>
            <div className="mode-progress-grid">
              {
                Array.from({ length: activeSubjectDetail.count }, (_, index) => index).map(index => 
                  (
                    <button className={`mode-progress-btn ${progressBadge(index)}`} key={index} onClick={() => 
                      {
                        const { currentQsIdx } = activeSubjectDetail
                        if (index === currentQsIdx) {
                          setToggleNav(false)
                          return
                        }
                        setSubjectsDetail(prev =>
                          prev.map(item =>
                            item.subject === currentSubject
                              ? {...item, currentQsIdx: index }
                              : item
                          )
                        )
                        setToggleNav(false)
                      }
                    }>
                      {index + 1}
                    </button>
                  )
                )
              }
            </div>
            <div className="exam-progress-legend">
              <div className="exam-legend-item">
                <div className="exam-legend-box current"></div>
                <span>Current Question</span>
              </div>
              <div className="exam-legend-item">
                <div className="exam-legend-box answered"></div>
                <span>Correct</span>
              </div>
              <div className="exam-legend-item">
                <div className="exam-legend-box failed"></div>
                <span>Wrong</span>
              </div>
              <div className="exam-legend-item">
                <div className="exam-legend-box unanswered"></div>
                <span>Unanswered</span>
              </div>
              <div className="exam-legend-item">
                <div className="exam-legend-box viewed"></div>
                <span>Viewed</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Modal System */}
        {
          modal === 'server_error' && 
            (
              <Modal
                type="error"
                title="Server Error"
                body="We couldn’t complete your request due to a server error. This is usually temporary. Please try again in a few moments. If the problem persists, refresh the page or contact support."
                primaryLabel="Retry"
                onPrimary={() => { closeModal(); setRefresh(prev => !prev)} }
                onClose={() => {closeModal(); navigate(-1)}}
              />
            )
        }
        {
          modal === 'connection_lost' && 
          (
            <Modal
              type="error"
              title="Connection Lost"
              body="Your internet connection was interrupted. Reconnect to the internet and try again."
              primaryLabel="Retry"
              onPrimary={() => { closeModal(); setRefresh(prev => !prev)} }
              onClose={() => {closeModal(); navigate(-1)}}
            />
          )
        }
        {
          modal === 'subject_not_found' && 
          (
            <Modal
              type="info"
              title="Subject Not Found"
              body="The subject you selected could not be found or may have been removed. Please return to the subject configuration page and select a valid subject from the list to continue."
              primaryLabel="Change Subject"
              onPrimary={() => navigate('/study')}
              onClose={() => navigate('/study')}
              closeLabel="Leave anyway"
            />
          )
        }
        {
          modal === 'available_questions' && 
          (
            <Modal
              type="info"
              title="Available Offline Questions"
              body="Some questions matching your selected filters aren't available in offline mode. The available questions have been displayed."
              primaryLabel="Continue"
              onPrimary={closeModal}
              onClose={closeModal}
            />
          )
        }
        {
          modal === 'no_questions_found_offline' && 
          (
            <Modal
              type="info"
              title="Questions Not Found"
              body="No questions were found for your selected subject, year, and topic. This may be because the questions aren't available in offline mode. Connect to the internet to access the latest questions or try a different selection."
              primaryLabel="Adjust Filters"
              onPrimary={() => navigate(`/study/config?id=${subjectId}`)}
              onClose={() => navigate('/study')}
              closeLabel="Leave anyway"
            />
          )
        }
        {
          modal === 'no_questions_found' && 
          (
            <Modal
              type="info"
              title="No Questions Found"
              body="No questions are available for the selected subject, year, and topic combination. Please adjust your filters and try a different selection. If you believe this is an error, contact support."
              primaryLabel="Adjust Filters"
              onPrimary={() => navigate(`/study/config?id=${subjectId}`)}
              onClose={() => navigate('/study')}
              closeLabel="Leave anyway"
            />
          )
        }
        {
          modal === 'failed_to_load' && 
          (
            <Modal
              type="error"
              title="Failed to Load Questions"
              body="We were unable to load the exam questions due to a data loading error. Your session is safe. Click Reload to fetch questions again. If this continues, check your connection and try again."
              primaryLabel="Reload"
              onPrimary={() => { closeModal(); setRefresh(prev => !prev)}}
              onClose={() => navigate(`/study/config?id=${subjectId}`)}
            />
          )
        }
        
        {open && (
          <ReportQuestionModal
            questionId={currentQs?.id}
            subject={currentQs.subject}
            questionNo={activeSubjectDetail.currentQsIdx + 1}
            onClose={onClose}
          />
        )}
        
        <Calculator toggleCalc={toggleCalc} setToggleCalc={setToggleCalc} calcModalRef={calcModalRef}/>
      </div>
    </>
  )
}