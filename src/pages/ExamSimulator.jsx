import { useState, useEffect, useRef, memo, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router';
import { MarkdownContent } from '../components/MarkdownContent';
import { request } from '../scripts/utilis/request';
import { formatName } from '../scripts/utilis/formatName.js';
import { CountdownTimer } from '../components/CountdownTimer'
import { Calculator } from '../components/Calculator'
import { Loading } from '../components/Loading';
import { Offline } from '../components/Offline';
import { LoadError } from '../components/LoadError';
import { Image } from '../components/Image'
import { ModalStripe,  CSS } from '../components/NotificationSystem';
import { encrypt, decrypt } from '../scripts/utilis/crypto';
import { authStore } from '../stores/authStore';
import { practiceStore } from '../stores/practiceStore';
import { scheduledExamStore } from '../stores/scheduledExamStore';
import { examStore } from '../stores/examStore';
import './ExamSimulator.css';

const ExpensiveChild = memo(function ExpensiveChild({submitExam, hours, minutes, skipAutoSubmit}){
  return <CountdownTimer onFinish={submitExam} hours={hours} minutes={minutes} skipAutoSubmit={skipAutoSubmit} />;
});

export default function ExamSimulator() {
  const isActivated = authStore(state => state.isActivated)
  const examConfig = examStore((state) => state.examConfig);
  const setExamQuestions = examStore((state) => state.setExamQuestions);
  const answers = examStore((state) => state.answers);
  const setAnswers = examStore((state) => state.setAnswers);
  const offline = examStore(state => state.offline)
  const setOffline = examStore(state => state.setOffline)
  const loadError = examStore(state => state.loadError)
  const setLoadError = examStore(state => state.setLoadError)
  const navigate = useNavigate();
  const [toggleCalc, setToggleCalc] = useState(false);
  const [toggleNav, setToggleNav] = useState(false);
  const [examData, setExamData] = useState(null);
  const [currentSubject, setCurrentSubject] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentQues, setCurrentQues] = useState([]);
  const [progressGridList, setProgressGridList] = useState([])
  const [isDisable, setIsDisable] = useState(true)
  const [userAnswer, setUserAnswer] = useState('')
  const [savedBookmark, setSavedBookmark] = useState(false)
  const [answeredIdx, setAnsweredIdx] = useState([])
  const [progress, setProgress] = useState(null)
  const [systemUpdate, setSystemUpdate] = useState(0)
  const [isActive, setIsActive] = useState(true)
  const [allUnansweredQsLength, setAllUnansweredQsLength] = useState(0)
  const [loading, setLoading] = useState(true)
  const [refresh, setRefresh] = useState(false)
  // Modals
  const [modal, setModal] = useState(null);
  const closeModal = () => setModal(null);
  
  // refs for click-outside detection
  const navModalRef = useRef(null);
  const calcModalRef = useRef(null);
  
  const getQuestions = {
    practice: {
      questions: practiceStore(state => state.getPracticeQuestions),
      errorLogic: (err) => {
        if (!navigator.onLine){
          setModal({
            type: 'insufficient_question',
            body: err.message || 'No questions found.'
          })
        } else {
          setModal('failed_to_load')
        }
      }
    },
    scheduled: {
      questions: scheduledExamStore(state => state.getExamQuestions),
      errorLogic(err){
        console.error('Error:', err.message);
        setModal('failed_to_load')
      }
    }
  }
  
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
    
    /*===== Render Modal Style ======*/
    const el = document.createElement("style");
    el.id = "__ns_styles";
    el.textContent = CSS[0];
    document.head.appendChild(el);
    
    return () => {
      document.removeEventListener('contextmenu', prevent);
      document.removeEventListener('copy', prevent);
      document.removeEventListener('cut', prevent);
      document.removeEventListener('keydown', preventKeys);
      document.getElementById("__ns_styles")?.remove();
    };
  }, []);
  
  useEffect(() => {
    window.history.pushState({ examGuard: true }, '', window.location.pathname);
  
    const handlePopState = () => {
      // Always immediately re-push — this neutralizes every back press,
      // no matter how fast or how many times it's pressed.
      window.history.pushState({ examGuard: true }, '', window.location.pathname);
      setModal('leave_exam');
    };
  
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);
  
  const updateProgresslist = useCallback((data, currentSub) => {
    const totalQsArr = []
    for (let i = 1; i <= data[currentSub].count; i++){
      totalQsArr.push(i)
    }
    setProgressGridList(totalQsArr)
  },[setProgressGridList])
  // for system view implement the features of using letters to navigate
  
  const init = useCallback(function init(currentSubVar, currentIdxVar,  properties, data){
    Object.keys(properties).forEach((property) => {
      data.forEach((d) => {
        if (property === d.subject) {
          properties[d.subject].questions.push(d);
        }
      });
    });
    
    setExamData(properties);
    setCurrentQues([properties[currentSubVar].questions[currentIdxVar]])
    
    updateProgresslist(properties, currentSubVar)
    
    const answersVariable = []
    data.forEach((d) => {
      answersVariable.push({
        id: d.id,
        subject: d.subject,
        userAnswers: [],
        isBookmarked: false
      })
    });
    
    setAnswers(answersVariable)
  }, [])

  useEffect(() => {
    const { subjects, examType } = examConfig;
    const currentSubVar = subjects[0].name
    const currentIdxVar = 0
    setCurrentSubject(currentSubVar);
    const properties = {};
    const reqData = { subjects };
    if (examType === 'scheduled'){
      reqData.shuffle = examConfig.shuffle
      reqData.examId = examConfig.examId
    }
    subjects.forEach((sub) => {
      const { name: subName, qsNo } = sub
      properties[subName] = { subName, count: qsNo, questions: [] };
    });

    (async () => {
      const { questions, errorLogic } = getQuestions[examType]
      try {
        const data = await questions(reqData)
        init(currentSubVar, currentIdxVar, properties, data)
      } catch (err) {
        errorLogic(err)
      } finally {
        setLoading(false)
      }
    })()
    
    return () => {
      setOffline(null)
      setLoadError(null)
    }
    
  }, [refresh]);
  
  
  
  useEffect(() => {
    examData && setCurrentQues([examData[currentSubject].questions[currentIndex]])
    if (examData){
      let currentSubIdx = 0
      const subjects = Object.keys(examData);
      subjects.forEach((sub, index) => {
        if (currentSubject === sub){
          currentSubIdx = index
        }
      })
      
      if (!currentSubIdx && !currentIndex){
        setIsDisable(true)
      } else {
        setIsDisable(false)
      }
      
      updateProgresslist(examData, currentSubject)
    }
    
    const currentQuesId = examData && examData[currentSubject].questions[currentIndex].id
    
    const found = answers && answers.find(ans => ans.id === currentQuesId)
    if (found){
      const userAns = found.userAnswers.length === 0 ? '' : found.userAnswers[0]
      const savedBmk = found.isBookmarked
      setUserAnswer(userAns)
      setSavedBookmark(savedBmk)
    }
    
  }, [currentIndex, currentSubject])
  
  function addToBookmark(){
    const qsId = currentQues[0].id
    const findAns = answers.find(ans => ans.id === qsId)
    let isBmk = !findAns.isBookmarked
    setAnswers(prev => prev.map(ans => ans.id === qsId ? { ... ans, isBookmarked: isBmk} : ans))
    setSavedBookmark(isBmk)
  }
  
  function previousQuestion(){
      const decreaseQuestion = currentIndex - 1
      let currentSubIdx = 0
      const subjects = Object.keys(examData);
      subjects.forEach((sub, index) => {
        if (currentSubject === sub){
          currentSubIdx = index
        }
      })
      
    if (currentSubIdx && decreaseQuestion < 0){
      setCurrentSubject(subjects[currentSubIdx - 1])
      setCurrentIndex(examData[subjects[currentSubIdx - 1]].count - 1)
    } else {
      setCurrentIndex(currentIndex - 1)
    }
    
    setSystemUpdate(systemUpdate + 1)
  }
  
  function nextQuestion(){
    if (examData){
      const { count } = examData[currentSubject]
      const increaseIdx =  currentIndex + 1
      let currentSubIdx = 0;
      const subjects = Object.keys(examData);
      
      subjects.forEach((sub, index) => {
        if (sub === currentSubject){
          const lastSubIdx = subjects.length - 1
          currentSubIdx = index === lastSubIdx 
          ? -1
          : index
        }
      });
      
      if (currentIndex >= (count - 1)){
        setCurrentSubject(subjects[currentSubIdx + 1])
        setCurrentIndex(0)
      } else {
        setCurrentIndex(increaseIdx)
      }
      
    }
    
    setSystemUpdate(systemUpdate + 1)
  }
  
  const switchSubject = useCallback((event) => {
    const { name } = event.currentTarget.dataset
    setCurrentSubject(name)
    setCurrentIndex(0)
    setSystemUpdate(systemUpdate + 1)
  },[setCurrentIndex, setSystemUpdate, setCurrentSubject])
  
  function selectedOpt(event){
    const { selectedId, id } = event.currentTarget.dataset
    const findExisting = answers.find(ans => ans.id === id)
    let updatedAnswers;
    if (findExisting && findExisting.userAnswers.length > 0 && (findExisting.userAnswers[0] === selectedId)){
      updatedAnswers = answers.map(ans => ans.id === id ? {...ans, userAnswers: []} : ans)
      setAllUnansweredQsLength(updatedAnswers.filter(answer => answer.userAnswers.length <= 0).length)
      setAnswers(updatedAnswers)
      setUserAnswer('')
      setSystemUpdate(systemUpdate + 1)
      return
    }
    
    updatedAnswers = answers.map(ans => ans.id === id ? {...ans, userAnswers: [selectedId]} : ans)
    
    setAllUnansweredQsLength(updatedAnswers.filter(answer => answer.userAnswers.length <= 0).length)
    
    setAnswers(updatedAnswers)
    setUserAnswer(selectedId)
    setSystemUpdate(systemUpdate + 1)
  }
  
  useEffect(() => {
    const answeredQsNo = []
    let totalAnswered = 0
    let totalUnanswered = 0

      
    const improvedAnsStorge = []
    
    answers.forEach((ans) => {
      if (ans.subject === currentSubject){
        improvedAnsStorge.push(ans)
      }
    });
    
    improvedAnsStorge.forEach((ans, index) => {
      if (ans.userAnswers.length > 0){
        totalAnswered ++
        answeredQsNo.push(index + 1)
      } else {
        totalUnanswered++
      }
    })
      
    setProgress({
      totalAnswered,
      totalUnanswered
    })
    
    setAnsweredIdx(answeredQsNo)
  }, [systemUpdate])
  
  const navigateQues = useCallback((event) => {
    const { num } = event.target.dataset
    setCurrentIndex(Number(num) - 1)
    setToggleNav(false)
  },[setCurrentIndex, setToggleNav])
  
  
  function toggleNavigator(){
    setToggleNav(prev =>!prev)
    
    const answeredQsNo = []
    let totalAnswered = 0
    let totalUnanswered = 0

      
    const improvedAnsStorge = []
    
    answers.forEach((ans) => {
      if (ans.subject === currentSubject){
        improvedAnsStorge.push(ans)
      }
    });
    
    // when user is in the second subject the total unanswered still remains the total number of questions
    
    improvedAnsStorge.forEach((ans, index) => {
      if (ans.userAnswers.length > 0){
        totalAnswered ++
        answeredQsNo.push(index + 1)
      } else {
        totalUnanswered++
      }
    })
      
      
      
    setProgress({
      totalAnswered,
      totalUnanswered
    })
    
    setAnsweredIdx(answeredQsNo)
  }
  
  
  // click outside to close modals
  useEffect(() => {
    function handleClickOutside(event) {
      if (toggleNav && navModalRef.current &&!navModalRef.current.contains(event.target)) {
        setToggleNav(false);
      }
      if (toggleCalc && calcModalRef.current &&!calcModalRef.current.contains(event.target)) {
        setToggleCalc(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [toggleNav, toggleCalc]);
  
  const submitExam = useCallback((submitType = 'auto') => {
    if (submitType === 'manual'){
      setModal('submit_exam')
      return
    }
    setIsActive(false)
  },[setIsActive, setModal])
  
  const skipAutoSubmit = useRef(false)
  
  function goBack(){
    skipAutoSubmit.current = true
    const { examType } = examConfig
    const path = examType === '' ? '/exam-planner' : '/practice'
    navigate(path)
  }
  
  if (loadError) return <LoadError onRetry={loadError?.onRetry ?? undefined} message={loadError?.message ?? undefined} homeTo={loadError?.homeTo ?? undefined} homeLabel={loadError?.homeLabel ?? undefined}/>
  if (offline) return <Offline onRetry={offline?.onRetry ?? undefined} text={loadError?.text ?? undefined} />
  if (!isActive) return <Loading />
  if (loading && import.meta.env.VITE_ENV === 'production') return <Loading />

  return (
    <>
      <title>Exam | CBT Pro</title>

      <div className="exam-page no-select" aria-live="polite">
        <header className="exam-header">
          <div className="exam-header-inner">
            <button className="exam-back-btn" onClick={goBack}>← Back</button>
            <div className="exam-timer">
             {isActive  && <ExpensiveChild submitExam={submitExam} hours={examConfig.hours} minutes={examConfig.minutes} skipAutoSubmit={skipAutoSubmit}/> }
            </div>
            <div className="exam-header-actions">
              <button
                className="exam-icon-btn"
                title="Questions"
                onClick={toggleNavigator}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="7" height="7"></rect>
                  <rect x="14" y="3" width="7" height="7"></rect>
                  <rect x="14" y="14" width="7" height="7"></rect>
                  <rect x="3" y="14" width="7" height="7"></rect>
                </svg>
              </button>
              <button className={`exam-icon-btn ${savedBookmark && 'active'}`} onClick={addToBookmark}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"></path>
                </svg>
              </button>
              <button className="exam-icon-btn" onClick={() => setToggleCalc(prev => !prev)}>
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
          <aside className="exam-sidebar">
            <div className="exam-sidebar-title">Subjects</div>
            <div className="exam-subject-list">
              {examConfig.subjects.map((sub, index) => (
                <div className={`exam-subject-item ${sub.name === currentSubject && 'active'}`} key={index} data-name={sub.name} onClick={switchSubject}>
                  <span>{formatName(sub.name)}</span>
                  <span className="exam-subject-count">{String(sub.qsNo)}</span>
                </div>
              ))}
            </div>
          </aside>

          <main className="exam-main">
            <div className="exam-nav">
              <button className="exam-nav-btn" disabled={isDisable} onClick={previousQuestion}>← Prev</button>
              <div className="exam-question-info">Question {currentIndex + 1} of {examData && examData[currentSubject].count}</div>
              <button className="exam-nav-btn" onClick={nextQuestion}>Next →</button>
            </div>
            
            {
              currentQues && currentQues.map(ques => 
                (
                  <div key={ques.id}>
                    <div className="exam-question-text">
                      
                      { ques.image?.url && <Image imageUrl={ques.image.url} /> }
                      
                      {ques.question.instruction && <><strong><MarkdownContent>{ques.question.instruction}</MarkdownContent></strong><br /></>}
                      {ques.question.comprehension && <><strong dangerouslySetInnerHTML={{__html: ques.question.comprehension}}></strong><br/></>}
                      {
                        ques.question?.qs 
                        ? (
                            <MarkdownContent>
                              {ques.question.qs}
                            </MarkdownContent>
                          )
                        : (
                            <MarkdownContent >
                              {ques.question}
                            </MarkdownContent>
                          )
                      }
                    </div>
                    
                    <div className="exam-options">
                      {
                        ques.options.map(opt => 
                          (
                             <div className={`exam-option ${opt.id === userAnswer && 'selected'}`} key={opt.id} onClick={selectedOpt} data-selected-id={opt.id} data-id={ques.id}>
                                <div className="exam-option-key">{opt.id.toUpperCase()}</div>
                                <div className="exam-option-content">
                                  <div className="exam-option-text">
                                    <MarkdownContent>
                                      { opt.option }
                                    </MarkdownContent>
                                  </div>
                                </div>
                              </div>
                          ) 
                        )
                      }
                    </div>
                  </div>
                )
              )
            }

            <div className="exam-actions">
              <button className="exam-btn-submit" onClick={() => submitExam('manual')} disabled={!isActive}>{!isActive ? 'Submitting...' : 'Submit Exam' }</button>
            </div>
          </main>

          <aside className="exam-panel">
            <div className="exam-panel-header">
              <div className="exam-panel-title">Question Navigator</div>
              <div className="exam-panel-stats" >{currentIndex + 1}/{examData && examData[currentSubject].count}</div>
            </div>
            <div className="exam-progress-grid">
              {progressGridList && progressGridList.map((num, index) => 
                (
                  <button className={`exam-progress-btn ${answeredIdx && answeredIdx.includes(Number(num)) && 'answered'} ${(currentIndex + 1) === num && 'active'}`} key={index} onClick={navigateQues} data-num={num}>{num}</button>
                ))
              }
            </div>
            <div className="exam-progress-legend">
              <div className="exam-legend-item">
                <div className="exam-legend-box current"></div>
                <span>Current Question</span>
              </div>
              <div className="exam-legend-item">
                <div className="exam-legend-box answered"></div>
                <span>Answered</span>
              </div>
              <div className="exam-legend-item">
                <div className="exam-legend-box unanswered"></div>
                <span>Unanswered</span>
              </div>
            </div>
            <div className="exam-progress-summary">
              <div className="exam-summary-row">
                <span>Answered</span>
                <strong>{progress && progress?.totalAnswered}</strong>
              </div>
              <div className="exam-summary-row">
                <span>Unanswered</span>
                <strong>{progress && progress?.totalUnanswered}</strong>
              </div>
            </div>
          </aside>
        </div>

        <button className="exam-fab" onClick={toggleNavigator}>≡</button>

        <div className={`exam-overlay ${toggleNav? 'show' : ''}`}>
          <div className="exam-modal" ref={navModalRef}>
            <div className="exam-modal-header">
              <div className="exam-modal-title">Question Navigator</div>
              <button className="exam-modal-close" onClick={() => setToggleNav(false)}>×</button>
            </div>
            <div className="exam-progress-grid">
              {progressGridList && progressGridList.map((num, index) => 
                (
                  <button className={`exam-progress-btn ${answeredIdx && answeredIdx.includes(Number(num)) && 'answered'} ${(currentIndex + 1) === num && 'active'}`} key={index} onClick={navigateQues} data-num={num}>{num}</button>
                ))
              }
            </div>
            <div className="exam-progress-summary">
              <div className="exam-summary-row">
                <span>Answered</span>
                <strong>{progress && progress?.totalAnswered}</strong>
              </div>
              <div className="exam-summary-row">
                <span>Unanswered</span>
                <strong>{progress && progress?.totalUnanswered}</strong>
              </div>
            </div>
          </div>
        </div>
        {modal === 'submit_exam' && (
          <div className="ns-overlay" onClick={closeModal}>
            <div onClick={e => e.stopPropagation()} style={{ width: '100%', display: 'flex', justifyContent: 'center', padding: '0 1rem' }}>
              <ModalStripe
                type="info"
                title="Submit Exam"
                body={allUnansweredQsLength > 0
                  ? `You have ${allUnansweredQsLength} unanswered question${allUnansweredQsLength > 1 ? 's' : ''}. Submit anyway?`
                  : "Submit your exam now. This cannot be undone."
                }
                primaryLabel="Submit Exam"
                onPrimary={() => setIsActive(false)}
                onClose={closeModal}
              />
            </div>
          </div>
        )}
        {modal === 'leave_exam' && (
          <div className="ns-overlay" onClick={closeModal}>
            <div onClick={e => e.stopPropagation()} style={{ width: '100%', display: 'flex', justifyContent: 'center', padding: '0 1rem' }}>
              <ModalStripe
                type="warning"
                title="Leave Exam?"
                body="Your answers will not be submitted if you leave now."
                primaryLabel="Leave Exam"
                secondaryLabel="Stay"
                onPrimary={() => {
                  skipAutoSubmit.current = true;
                  closeModal();
                  navigate('/practice');
                }}
                onClose={closeModal}
              />
            </div>
          </div>
        )}
        {modal === 'failed_to_load' && (
          <div className="ns-overlay" onClick={closeModal}>
            <div onClick={e => e.stopPropagation()} style={{ width: '100%', display: 'flex', justifyContent: 'center', padding: '0 1rem' }}>
              <ModalStripe
                type="error"
                title="Failed to Load Questions"
                body="We were unable to load the exam questions due to a data loading error. Your session is safe. Click Reload to fetch questions again. If this continues, check your connection and try again."
                primaryLabel="Reload"
                onPrimary={() => {
                  setRefresh(prev => !prev)
                }}
                onClose={() => {
                  goBack()
                  closeModal()
                }}
              />
            </div>
          </div>
        )}
        { typeof modal === 'object' && modal?.type === 'insufficient_question' && (
          <div className="ns-overlay" onClick={closeModal}>
            <div onClick={e => e.stopPropagation()} style={{ width: '100%', display: 'flex', justifyContent: 'center', padding: '0 1rem' }}>
              <ModalStripe
                type="warning"
                title="Insufficient Questions"
                body={modal.body}
                primaryLabel="Retry"
                onPrimary={() => {
                  setRefresh(prev => !prev)
                }}
                onClose={() => {
                  skipAutoSubmit.current = true
                  navigate('/practice')
                }}
              />
            </div>
          </div>
        )}
        <Calculator toggleCalc={toggleCalc} setToggleCalc={setToggleCalc} calcModalRef={calcModalRef} />
      </div>
    </>
  );
}