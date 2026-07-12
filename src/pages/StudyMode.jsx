import { useState, useEffect, useContext, useRef, memo, useCallback} from 'react'
import { useNavigate } from 'react-router';
import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import rehypeRaw from 'rehype-raw'
import 'katex/dist/katex.min.css' // don't forget CSS or formulas won't style
import UserContext from '../context/UserContext.jsx';
import { Calculator } from '../components/Calculator.jsx'
import { AstraAIModal } from '../components/AstraAIModal'
import { fetchWithAuth } from '../scripts/utilis/fetch.js';
import { subjectsData } from '../scripts/data/subjectsData.js'
import { Image } from '../components/Image'
import { formatName } from '../scripts/utilis/formatName.js';
import { ModalStripe, CSS } from '../components/NotificationSystem';
import { ReportQuestionModal } from "../components/ReportQuestionModal";
import { saveQuestions, getQuestions } from '../hooks/services/indexedDB/questions';
import { saveAllImages } from '../hooks/services/indexedDB/images';
import './StudyMode.css'

const Notification = memo(({type, title, body, primaryLabel, onPrimary, onClose, closeLabel }) => {
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

const AnswerCard = memo(({ explanation, correctAnswers }) => {
  return (
    <>
      <div className="mode-answer-section">
        <div className="mode-answer-header">Correct Answer</div>
        <div className="mode-answer-correct">Option {correctAnswers}</div>
        <div className="mode-answer-explanation">
          {/* Work on image */}
          <Markdown 
            remarkPlugins={[remarkGfm, remarkMath]} // 1. Markdown extensions first
            rehypePlugins={[rehypeRaw, rehypeKatex]} // 2. HTML parser, then formula renderer
          >
            {explanation}
          </Markdown>
        </div>
      </div>
    </>
  )
})

export function StudyMode() {
  const { token, setToken, studyConfig, userInfo } = useContext(UserContext)
  const navigate = useNavigate()
  const [toggleCalc, setToggleCalc] = useState(false);
  const [toggleNav, setToggleNav] = useState(false);
  const [questions, setQuestions] = useState([])
  const [currentQuestion, setCurrentQuestion] = useState([])
  const [currentIdx, setCurrentIdx] = useState(0)
  const [displayAnswer, setDisplayAnswer] = useState(false)
  const [optionsCheck, setOptionsCheck] = useState(null)
  const [records, setRecords] = useState([])
  const [progressList, setProgressList] = useState([])
  const [progressBadge, setProgressBadge] = useState(null)
  const [chatWithAI, setChatWithAI] = useState(false)
  const [refresh, setRefresh] = useState(false)
  const [toggleBmk, setToggleBmk] = useState(false)
  const [currentBmkCheck, setCurrentBmkCheck] = useState(null)
  
  /*============= AI Modal ===========*/
  const [chatMessages, setChatMessages] = useState([{
    id: crypto.randomUUID(),
    sender: 'AI',
    message: "Hi there! I'm Astra 👋 I can explain CBT questions, break down topics, or quiz you. What should we study today?",
  }]);
  
  const [modal, setModal] = useState(null);
  const closeModal = () => setModal(null);
  
  /*========== Report Question modal =======*/
  const [open, setOpen] = useState(false)
  
  const navModalRef = useRef(null);
  const calcModalRef = useRef(null);
  
  
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
  
  /*===== Render Notification Style ======*/
  useEffect(() => {
    const el = document.createElement("style");
    el.id = "__ns_styles";
    el.textContent = CSS[0];
    document.head.appendChild(el);
    return () => document.getElementById("__ns_styles")?.remove();
  }, []);
  
  useEffect(() => {
    let cancelled = false
    async function fetchStudyQuestions(){
      let data;
      try {
        if (cancelled) return
        if (navigator.onLine){
          const response = await fetchWithAuth(token, setToken, '/api/study', { method: 'POST', body: JSON.stringify(studyConfig)})
          data = await response.json().catch(() => ({}))
          if (!response.ok){
            throw { status: response.status, error: data.message || data.error || 'failed_to_load' }
          }
          await saveQuestions(data)
        } else {
          const subject = studyConfig.subject
          const years = studyConfig.years
          const topics = studyConfig.topics
          
          const qs = await getQuestions({
            subject,
            years,
            topics,
          });
          if (qs.length === 0) {
            throw { status: 404, error: 'no_questions_found_offline' }
          } else {
            data = qs.splice(0, 100)
            setModal('available_questions') 
          }
        }
        setQuestions(data)
        const currentQuestionVar = data[currentIdx]
        setCurrentQuestion([currentQuestionVar])
        
        setRecords(data.map(d => d.id ? {id: d.id, isBookmarked: false} : null))
        setProgressList(data.map((d, index) => index + 1))
        saveAllImages(data)
      } catch (err) {
        if (!err.status){
          setModal('connection_lost')
        } else if (err.status >= 500){
          setModal('server_error')
        } else {
          setModal(err.error)
        }
      }
    }
    fetchStudyQuestions()
    return () => { cancelled = true }
  },[token, setToken, studyConfig, setQuestions, setCurrentQuestion, refresh])
  
  
  function getSelectedOption(qsId, id = 'invalid'){
    const currentQsObj = currentQuestion[0]
    const correct = currentQsObj.correctAnswers
    const userAns = id
    const optionsCheckVar = correct.includes(userAns) 
    ? { correct: userAns }
    : { correct, wrong: userAns }
    setRecords(prev => prev.map(record => record.id === qsId ? {...record, ...optionsCheckVar} : record))
    setOptionsCheck(optionsCheckVar)
    setDisplayAnswer(true)
  }
  
  
  useEffect(() => {
    if (records.length !== 0){
      const progressBadgeVar = {
        correct: [],
        wrong: [],
        viewed: []
      }
      records.forEach((record, index) => {
        if (record?.correct && !record?.wrong){
          progressBadgeVar.correct.push(index + 1)
        } else if (record?.correct && record?.wrong !== 'invalid'){
          progressBadgeVar.wrong.push(index + 1)
        } else if (record?.wrong && record.wrong === 'invalid') {
          progressBadgeVar.viewed.push(index + 1)
        }
      });
      
      setProgressBadge(progressBadgeVar)
      
    }
  },[records])
  
  useEffect(() => {
    if (!(questions.length <= 0)){
      const currentQsObj = questions[currentIdx]
      setCurrentQuestion([currentQsObj])
      const currentQsId = currentQsObj.id
      const findRecord = records.find(record => record.id === currentQsId)
      if (findRecord?.correct){
        setOptionsCheck(findRecord)
        setDisplayAnswer(true)
      }
      setToggleBmk(findRecord.isBookmarked)
      setCurrentBmkCheck(findRecord.isBookmarked)
    }
  },[currentIdx, toggleNav])
  
  function prevQuestions(){
    if (currentIdx > 0){
      const decreaseCurrentIdx = currentIdx - 1
      setCurrentIdx(decreaseCurrentIdx)
      setOptionsCheck(null)
      setDisplayAnswer(false)
    } else {
      setCurrentIdx(questions.length - 1)
    }
  }
  
  function nextQuestion(){
    const increaseCurrentIdx = currentIdx + 1
    if (increaseCurrentIdx >= questions.length){
      setCurrentIdx(0)
      setOptionsCheck(null)
      setDisplayAnswer(false)
      return
    }
    setCurrentIdx(increaseCurrentIdx)
    setOptionsCheck(null)
    setDisplayAnswer(false)
  }
  
  
  
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
  
  
  const subjectId = useCallback(() => {
    return subjectsData.find(subject => subject.name === studyConfig.subject).id
  },[])
  
  /*=== report question modal ===*/
  const onClose = useCallback(() => {
   setOpen(false) 
  },[setOpen])
  
  if (!questions){
    return <div>Loading...</div>
  }
  
  return (
    <>
      <title>Review | CBT Pro</title>
      
      {chatWithAI && <AstraAIModal setChatWithAI={setChatWithAI} chatMessages={chatMessages} setChatMessages={setChatMessages}/>}
      
      <div className="mode-page no-select" aria-live="polite">

        <header className="mode-header">
          <div className="mode-header-inner">
            <button className="mode-back-btn" onClick={() => navigate(`/studytwo?id=${subjectId()}`)}>
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
              <button className={`mode-icon-btn ${currentBmkCheck && 'active'}`} onClick={() => {
                const toggle = !toggleBmk
                setToggleBmk(toggle)
                setCurrentBmkCheck(toggle)
                setRecords(prev => prev.map(r => r.id === currentQuestion[0].id ? {...r, isBookmarked: toggle} : r))
                const questionsStorage = JSON.parse(localStorage.getItem('bookmarks')) || []
                const currentQ = currentQuestion[0]

                const updatedStorage = toggle
                ? [...questionsStorage.filter(qs => qs.id !== currentQ.id), { userId: userInfo._id, ...currentQ}]
                : questionsStorage.filter(qs => qs.id !== currentQ.id)

                localStorage.setItem('bookmarks', JSON.stringify(updatedStorage))
                
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
              <div className="mode-subject-item active">
                  <span>{formatName(studyConfig.subject)}</span>
                  <span className="mode-subject-count">{questions.length}</span>
                </div>
            </div>
          </aside>

          <main className="mode-main">
            <div className="mode-nav">
              <button className="mode-nav-btn" onClick={prevQuestions}>
                ← Prev
              </button>
              <div className="mode-question-info">Question {currentIdx + 1} of {questions.length}</div>
              <button className="mode-nav-btn" onClick={nextQuestion}>
                Next →
              </button>
            </div>
            
            {
              currentQuestion && currentQuestion.map(ques =>
                (
                  <div key={ques.id}>
                  <div>
                    <div className="mode-question-tags">
                      <span className="mode-tag">JAMB {ques.year}</span>
                      <span className="mode-tag">{ques.topic}</span>
                    </div>
                    <div className="mode-question-text">
                    
                      <Image id={ques.id} ext={ques.image?.url} />
                      
                      {typeof ques.question === 'object' && ques.question?.instruction && <><strong>{ques.question.instruction}</strong><br /></>}
                      {typeof ques.question === 'object' && ques.question?.comprehension && <><strong dangerouslySetInnerHTML={{ __html: ques.question.comprehension }} /><br /></>}
                      {ques.question?.qs 
                        ? (
                            <Markdown 
                              remarkPlugins={[remarkGfm, remarkMath]} // 1. Markdown extensions first
                              rehypePlugins={[rehypeRaw, rehypeKatex]} // 2. HTML parser, then formula renderer
                            >
                              {ques.question.qs}
                            </Markdown>
                          )
                        : (
                            <Markdown 
                              remarkPlugins={[remarkGfm, remarkMath]} // 1. Markdown extensions first
                              rehypePlugins={[rehypeRaw, rehypeKatex]} // 2. HTML parser, then formula renderer
                            >
                              {ques.question}
                            </Markdown>
                          )
                      }
                    </div>
                    {
                      ques.options.map(opt => {
                        const classBadge = () => {
                          let badge = '';
                          if (optionsCheck){
                            if (optionsCheck?.correct){
                              
                              if (optionsCheck?.wrong && optionsCheck.correct.includes(opt.id) && optionsCheck.wrong === 'invalid' ){
                                badge = 'selected'
                              } else if (optionsCheck.correct.includes(opt.id)){
                                badge = 'correct';
                              } else if (optionsCheck?.wrong){
                                if (optionsCheck.wrong === opt.id){
                                  badge = 'wrong'
                                }
                              }
                            } 
                          }
                          return badge
                        }
                        return (
                          <div className="mode-options" key={opt.id} onClick={() => !displayAnswer && getSelectedOption(ques.id, opt.id)}>
                            <div className={`mode-option ${classBadge()}`}>
                              <div className="mode-option-key">{opt.id.toUpperCase()}</div>
                              <div className="mode-option-content">
                                <div className="mode-option-text" dangerouslySetInnerHTML={{__html: opt.option}} />
                              </div>
                            </div>
                          </div>
                        )
                      })
                    }
                    {displayAnswer && <AnswerCard explanation={ques.explanation.text} correctAnswers={ques.correctAnswers.join(' ').toUpperCase()}/>}
                  </div>
                  
                  <div className="mode-actions">
                    <button className="mode-btn-show" disabled={displayAnswer} onClick={() => getSelectedOption(ques.id)} >Show Answer</button>
                  </div>
                  </div>
                )
              )
            }
          </main>

          <aside className="mode-panel">
            <div className="mode-panel-header">
              <div className="mode-panel-title">Question Navigator</div>
            </div>
            <div className="mode-progress-grid">
              {
                progressList.map((list, index) => 
                  (
                    <button className={`mode-progress-btn ${index === currentIdx && 'active'} ${progressBadge && (progressBadge.correct.includes(list) && 'correct')} ${progressBadge && (progressBadge.wrong.includes(list) && 'wrong')} ${progressBadge && (progressBadge.viewed.includes(list) && 'selected')}`} key={index} onClick={() => 
                      { 
                        setCurrentIdx(index); 
                        setToggleNav(false)
                        setDisplayAnswer(false)
                        setOptionsCheck(null)
                      }
                    }>{list}</button>
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
                progressList.map((list, index) => 
                  (
                    <button className={`mode-progress-btn ${index === currentIdx && 'active'} ${progressBadge && (progressBadge.correct.includes(list) && 'correct')} ${progressBadge && (progressBadge.wrong.includes(list) && 'wrong')} ${progressBadge && (progressBadge.viewed.includes(list) && 'selected')}`} key={index} onClick={() => 
                      { 
                        setCurrentIdx(index); 
                        setToggleNav(false)
                        setDisplayAnswer(false)
                        setOptionsCheck(null)
                      }
                    }>{list}</button>
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
        
        {/* Notification System */}
        {
          modal === 'server_error' && 
            (
              <Notification
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
            <Notification
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
            <Notification
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
            <Notification
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
            <Notification
              type="info"
              title="Questions Not Found"
              body="No questions were found for your selected subject, year, and topic. This may be because the questions aren't available in offline mode. Connect to the internet to access the latest questions or try a different selection."
              primaryLabel="Adjust Filters"
              onPrimary={() => navigate(`/studytwo?id=${subjectId()}`)}
              onClose={() => navigate('/study')}
              closeLabel="Leave anyway"
            />
          )
        }
        {
          modal === 'no_questions_found' && 
          (
            <Notification
              type="info"
              title="No Questions Found"
              body="No questions are available for the selected subject, year, and topic combination. Please adjust your filters and try a different selection. If you believe this is an error, contact support."
              primaryLabel="Adjust Filters"
              onPrimary={() => navigate(`/studytwo?id=${subjectId()}`)}
              onClose={() => navigate('/study')}
              closeLabel="Leave anyway"
            />
          )
        }
        {
          modal === 'failed_to_load' && 
          (
            <Notification
              type="error"
              title="Failed to Load Questions"
              body="We were unable to load the exam questions due to a data loading error. Your session is safe. Click Reload to fetch questions again. If this continues, check your connection and try again."
              primaryLabel="Reload"
              onPrimary={() => { closeModal(); setRefresh(prev => !prev)}}
              onClose={() => navigate(`/studytwo?id=${subjectId()}`)}
            />
          )
        }
        
        {open && (
          <ReportQuestionModal
            questionId={currentQuestion[0].id}
            subject={currentQuestion[0].subject}
            questionNo={currentIdx + 1}
            onClose={onClose}
          />
        )}
        
        <Calculator toggleCalc={toggleCalc} setToggleCalc={setToggleCalc} calcModalRef={calcModalRef}/>
      </div>
    </>
  )
}