import { useState, useEffect, useRef, useContext, useCallback } from 'react';
import { useNavigate } from 'react-router';
import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import rehypeRaw from 'rehype-raw'
import 'katex/dist/katex.min.css' // don't forget CSS or formulas won't style
import UserContext from '../context/UserContext';
import { Loading } from '../components/Loading';
import { Calculator } from '../components/Calculator';
import { AstraAIModal } from '../components/AstraAIModal';
import { formatName } from '../scripts/utilis/formatName';
import { Image } from '../components/Image'
import { ModalDialog, CSS } from '../components/NotificationSystem';
import { ReportQuestionModal } from "../components/ReportQuestionModal";

export function Review() {
  const {  isActivated, examConfig, answers, examQuestions } = useContext(UserContext);
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(true)
  const [toggleCalc, setToggleCalc] = useState(false);
  const [toggleNav, setToggleNav] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0)
  const [currentSubject, setCurrentSubject] = useState('')
  const [currentQuestion, setCurrentQuestion] = useState([])
  const [reviewData, setReviewData] = useState(null)
  const [isDisable, setIsDisable] = useState(true)
  const [progressList, setProgressList] = useState([])
  const [progressBadge, setProgressDadge] = useState(null)
  const [chatWithAI, setChatWithAI] = useState(false)
  
  const [modal, setModal] = useState(null);
  const closeModal = () => setModal(null);
  
  /*========== Report Question modal =======*/
  const [open, setOpen] = useState(false)
  
  /*============ AI Modal =============*/
  const [chatMessages, setChatMessages] = useState([{
    id: crypto.randomUUID(),
    sender: 'AI',
    message: "Hi there! I'm Astra 👋 I can explain CBT questions, break down topics, or quiz you. What should we study today?",
  }]);
  
  const navModalRef = useRef(null);
  const calcModalRef = useRef(null);
  
  const updateProgressList = useCallback((data, currentSub) => {
    const subjectCountArr = []
    const subjectCount = Number(data[currentSub].count)
    
    for (let i = 1; i <= subjectCount; i++){
      subjectCountArr.push(i)
    }
    setProgressList(subjectCountArr);
    
    const progressListBage = {
      correct: [],
      wrong: [],
      unanswered: []
    }
    
    data[currentSub].questions.forEach((d, index) => {
      const correctOpt = d.correctAnswers.join('')
      const userOpt = d.userAnswers.join('')
      if (!userOpt){
        progressListBage.unanswered.push(index + 1)
      } else if (correctOpt.includes(userOpt)){
        progressListBage.correct.push(index + 1)
      } else {
        progressListBage.wrong.push(index + 1)
      }
    });
    
    setProgressDadge(progressListBage)
  },[currentSubject, setProgressList])

  useEffect(() => {
    const { subjects } = examConfig;
    const currentSubjectVar = examConfig.subjects[0].name
    setCurrentSubject(currentSubjectVar)
    const subjectsObject = {}
    subjects.forEach((sub) => {
      subjectsObject[sub.name] = { name: sub.name, count: sub.qsNo, questions: [] }
    });
    getReviewQuestions(subjectsObject, currentSubjectVar)
    
    /*===== Render Notification Style ======*/
    const el = document.createElement("style");
    el.id = "__ns_styles";
    el.textContent = CSS[0];
    document.head.appendChild(el);
    return () => document.getElementById("__ns_styles")?.remove();
  }, [])

  const getReviewQuestions = useCallback(async (subjectsObject, currentSubjectVar) => {
    try {
      const data = []
      examQuestions.forEach((qs) => {
        const userExamInfo = answers.find(ans => ans.id ===  qs.id)
        data.push({
          ...qs,
          userAnswers: userExamInfo?.userAnswers,
          isBookmarked: userExamInfo?.isBookmarked
        })
      });

      data.forEach((d) => {
        subjectsObject[d.subject].questions.push(d)
      })
      
      setReviewData(subjectsObject)
      let currentQuesVar;
      currentQuesVar = [subjectsObject[currentSubjectVar].questions[currentIndex]]
      setCurrentQuestion(currentQuesVar)
      updateProgressList(subjectsObject, currentSubjectVar)

    } catch (err) {
      console.error('Error:', err);
    } finally {
      setIsLoading(false)
    }
  }, [])


  useEffect(() => {
    
    if (reviewData && currentSubject) {
      updateProgressList(reviewData, currentSubject)
      const subjects = Object.keys(reviewData)
      if (currentSubject === subjects[0] && currentIndex <= 0) {
        setIsDisable(true)
      } else {
        setIsDisable(false)
      }

      const changeQues = [reviewData[currentSubject].questions[currentIndex]]
      setCurrentQuestion(changeQues)
    }
  }, [currentIndex, currentSubject])

  function prevQuestion() {
    const decreasedCurrentIdx = currentIndex - 1
    if (decreasedCurrentIdx < 0) {
      const subjects = Object.keys(reviewData)
      if (currentSubject !== subjects[0]) {
        let currentSubjectIdx = 0;
        subjects.forEach((sub, index) => {
          if (sub === currentSubject) {
            currentSubjectIdx = index
          }
        });
        const prevSubject = subjects[currentSubjectIdx - 1]
        const prevSubjectCount = Number(reviewData[prevSubject].count)
        setCurrentSubject(prevSubject)
        setCurrentIndex(prevSubjectCount - 1)
        return
      }
    }
    setCurrentIndex(decreasedCurrentIdx)
  }

  function nextQuestion() {
    const subjects = Object.keys(reviewData);
    let currentSubjectIdx = 0
    subjects.forEach((sub, index) => {
      if (sub === currentSubject) {
        currentSubjectIdx = index === (subjects.length - 1)
          ? -1
          : index
      }
    });

    const lastQuesIndex = reviewData[currentSubject].count - 1
    const increasedCurrentIdx = currentIndex + 1
    if (increasedCurrentIdx > lastQuesIndex) {
      const nextSubject = subjects[currentSubjectIdx + 1]
      setCurrentSubject(nextSubject)
      const resetCurrentIndex = 0
      setCurrentIndex(resetCurrentIndex)
      return
    }
    setCurrentIndex(increasedCurrentIdx)
  }

  function switchSubject(event) {
    const { subName } = event.currentTarget.dataset
    setCurrentIndex(0)
    setCurrentSubject(subName)
  }
  
  function navigateQs(event){
    const { num } = event.target.dataset
    setCurrentIndex(Number(num) - 1)
    setToggleNav(false)
  }
  
  function toggleNavigator(){
    setToggleNav(prev =>!prev)
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
  
  function openAiModal(){
    if (!isActivated){
      setModal('app_activation')
      return
    }
    setChatWithAI(true)
  }
  
  
  function goBack(){
    navigate('/simulator')
  }
  
  /*=== report question modal ===*/
  const onClose = useCallback(() => {
    setOpen(false) 
  },[setOpen])

  if (isLoading) {
    return <Loading />
  }

  return (
    <>
      <title>Review | CBT Pro</title>
      
      
      {chatWithAI && <AstraAIModal setChatWithAI={setChatWithAI} chatMessages={chatMessages} setChatMessages={setChatMessages}/>}

      <div className="mode-page">

        <header className="mode-header">
          <div className="mode-header-inner">
            <button className="mode-back-btn" onClick={goBack}>
              ← Back
            </button>
            <div className="mode-header-actions">
              <button className="mode-icon-btn" title="Questions" onClick={() => setOpen(true)}>
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
              <button className="mode-icon-btn" title="Questions" onClick={openAiModal}>
                🤖
              </button>
              <button className="mode-icon-btn" title="Questions" onClick={toggleNavigator}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="7" height="7"></rect>
                  <rect x="14" y="3" width="7" height="7"></rect>
                  <rect x="14" y="14" width="7" height="7"></rect>
                  <rect x="3" y="14" width="7" height="7"></rect>
                </svg>
              </button>
              <button className={`mode-icon-btn ${currentQuestion[0]?.isBookmarked && 'active'}`}>
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
                examConfig.subjects.map((sub, index) =>
                (
                  <div className={`mode-subject-item ${sub.name === currentSubject && 'active'}`} key={index} onClick={switchSubject} data-sub-name={sub.name}>
                    <span>{formatName(sub.name)}</span>
                    <span className="mode-subject-count">{sub.qsNo}</span>
                  </div>
                )
                )
              }
            </div>
          </aside>

          <main className="mode-main">
            <div className="mode-nav">
              <button className="mode-nav-btn" disabled={isDisable} onClick={prevQuestion}>
                ← Prev
              </button>
              <div className="mode-question-info">Question {currentIndex + 1} of {reviewData[currentSubject].count}</div>
              <button className="mode-nav-btn" onClick={nextQuestion}>
                Next →
              </button>
            </div>
            {
              currentQuestion.map(ques =>
              (
                <div key={ques.id}>
                  <div className="mode-question-tags">
                    <span className="mode-tag">JAMB {ques.year}</span>
                    <span className="mode-tag">{ques.topic}</span>
                  </div>
                  <div className="mode-question-text">
                    <Image id={ques.id} />
                    {typeof ques.question === 'object' && ques.question?.instruction && <><strong>{ques.question.instruction}</strong><br /></>}
                    {typeof ques.question === 'object' && ques.question?.comprehension && <><strong dangerouslySetInnerHTML={{ __html: ques.question.comprehension }} /><br /></>}
                    {
                      ques.question?.qs 
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
                      const correctAns = ques.correctAnswers
                      const userAns = ques.userAnswers
                      let classBadge = '';
                      if (correctAns.includes(opt.id)) {
                        classBadge = 'correct'
                      } else if (userAns.includes(opt.id)) {
                        classBadge = 'wrong'
                      }

                      return (
                        <div className="mode-options" key={opt.id}>
                          <div className={`mode-option ${classBadge}`}>
                            <div className="mode-option-key">{opt.id.toUpperCase()}</div>
                            <div className="mode-option-content">
                              <div className="mode-option-text">{opt.option}</div>
                            </div>
                          </div>
                        </div>
                      )
                    })
                  }
                  <div className="mode-answer-section show">
                    <div className="mode-answer-header">Correct Answer</div>
                    <div className="mode-answer-correct">Option {ques.correctAnswers.join('').toUpperCase()}</div>
                    <div className="mode-answer-explanation">
                      {/* Work on image */}
                      {ques.explanation.text}
                    </div>
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
                    <button className={`mode-progress-btn ${progressBadge?.correct.includes(list) && 'viewed'} ${progressBadge?.wrong.includes(list) && 'wrong'}`} key={index} onClick={navigateQs} data-num={list}>{list}</button>
                  )
                )
              }
            </div>
          </aside>
        </div>

        <button className="mode-fab" onClick={toggleNavigator}>≡</button>

        <div className={`exam-overlay ${toggleNav? 'show' : ''}`}>
          <div className="mode-modal" ref={navModalRef}>
            <div className="mode-modal-header">
              <div className="mode-modal-title">Question Navigator</div>
              <button className="mode-modal-close" onClick={() => setToggleNav(false)}>×</button>
            </div>
            <div className="mode-progress-grid">
              {
                progressList.map((list, index) => 
                  (
                    <button className={`mode-progress-btn ${progressBadge?.correct.includes(list) && 'correct'} ${progressBadge?.wrong.includes(list) && 'wrong'}`} key={index} onClick={navigateQs} data-num={list}>{list}</button>
                  )
                )
              }
            </div>
          </div>
        </div>
          {modal === 'app_activation' && (
            <div className="ns-overlay" onClick={closeModal}>
              <div onClick={e => e.stopPropagation()} style={{ width: '100%', display: 'flex', justifyContent: 'center', padding: '0 1rem' }}>
                <ModalDialog
                  type="info"
                  title="Activation Required"
                  subtitle="Access Restricted • CBT Pro Policy"
                  body="Activate app to access AI-powered explanations and practice"
                  primaryLabel="Activate App"
                  onPrimary={() => navigate('/payment')}
                  onClose={closeModal}
                  closeLabel="Continue"
                />
              </div>
            </div>
          )}
          
          {open && (
          <ReportQuestionModal
            questionId={currentQuestion[0].id}
            subject={currentSubject}
            questionNo={currentIndex + 1}
            onClose={onClose}
          />
        )}
         <Calculator toggleCalc={toggleCalc} setToggleCalc={setToggleCalc} calcModalRef={calcModalRef} />
      </div>
    </>
  )
}