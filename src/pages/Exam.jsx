import { useState, useEffect, useContext, useRef, memo, useCallback } from 'react';
import { useNavigate } from 'react-router';
import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import rehypeRaw from 'rehype-raw'
import 'katex/dist/katex.min.css' // don't forget CSS or formulas won't style
import UserContext from '../context/UserContext.jsx';
import { fetchWithAuth } from '../scripts/utilis/fetch.js';
import { formatName } from '../scripts/utilis/formatName.js';
import { CountdownTimer } from '../components/CountdownTimer.jsx'
import { Calculator } from '../components/Calculator.jsx'
import { Loading } from '../components/Loading.jsx'
import { Image } from '../components/Image'
import { ModalStripe,  CSS } from '../components/NotificationSystem';
import { getRandomQuestions } from '../hooks/services/examQuestions';
import { saveQuestions } from '../hooks/services/indexedDB/questions';
import './Exam.css';

const ExpensiveChild = memo(({submitExam, hours, minutes, skipAutoSubmit}) => {
  return <CountdownTimer onFinish={submitExam} hours={hours} minutes={minutes} skipAutoSubmit={skipAutoSubmit} />;
});

export function Exam() {
  const { token, setToken, isActivated, examConfig, answers, setAnswers, setExamQuestions} = useContext(UserContext);
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
  
  // Modals
  const [modal, setModal] = useState(null);
  const closeModal = () => setModal(null);
  
  // refs for click-outside detection
  const navModalRef = useRef(null);
  const calcModalRef = useRef(null);
  
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
  }, []);
  
  useEffect(() => {
  let isBlocked = false
  window.history.pushState(null, '', window.location.pathname)

  const handlePopState = () => {
    if (isBlocked) {
      // ignore rapid double back
      window.history.pushState(null, '', window.location.pathname)
      return
    }

    isBlocked = true
    const leave = window.confirm('Leave exam? Your answers will not be submitted.')

    if (leave) {
      skipAutoSubmit.current = true
      navigate('/simulator')
    } else {
      // replace instead of push to avoid stacking states
      window.history.replaceState(null, '', window.location.pathname)
      setTimeout(() => { isBlocked = false }, 100) // unlock after stack settles
    }
  }

  window.addEventListener('popstate', handlePopState)
  return () => window.removeEventListener('popstate', handlePopState)
}, [navigate])
  
  const updateProgresslist = useCallback((data, currentSub) => {
    const totalQsArr = []
    for (let i = 1; i <= data[currentSub].count; i++){
      totalQsArr.push(i)
    }
    setProgressGridList(totalQsArr)
  },[setProgressGridList])
  // for system view implement the features of using letters to navigate

  useEffect(() => {
    const { subjects } = examConfig;
    const currentSubVar = subjects[0].name
    const currentIdxVar = 0
    setCurrentSubject(currentSubVar);
    const properties = {};
    const reqData = { subjects: [] };

    subjects.forEach((sub) => {
      const subName = sub.name
      reqData.subjects.push({ name: subName, qsNo: sub.qsNo });
      properties[subName] = { subName, count: sub.qsNo, questions: [] };
    });

    async function fetchQuestions(){
      try {
        let data;
        if (navigator.onLine){
          let response;
          if (!isActivated){
            const newReqData = { subjects: reqData.subjects.map(data => data.name) }
            response = await fetchWithAuth(token, setToken, '/api/exam/fixedExam', {
              method: 'POST',
              body: JSON.stringify(newReqData)
            });
          } else {
            response = await fetchWithAuth(token, setToken, '/api/exam', {
              method: 'POST',
              body: JSON.stringify(reqData)
            });
          }
          data = await response.json().catch(() => ({}));
          console.log(data.map(d => d.id))
          if (!response.ok){
            throw { status: response.status, error: data.message || 'Something went wrong. Try again' };
          }
          
          // Saving question to indexDB
          await saveQuestions(data)
          
        } else {
          const offlineInfo = reqData.subjects.map(sub => {
            return ({
              subject: sub.name,
              amount: sub.qsNo
            })
          })
          const indexDbData = await getRandomQuestions(offlineInfo)
          if (indexDbData.insufficientSubjects.length) {
            const details = indexDbData.insufficientSubjects
              .map(({ subject, available, requested }) => {
                return available === 0
                  ? `• ${subject}: Not available`
                  : `• ${subject}: ${available} of ${requested} questions available`;
              })
              .join("\n");
              
            throw new Error(
              `Some selected subjects are not fully available in offline mode.\n\n${details}\n\nConnect to the internet to stay updated with the latest questions, or start the exam online.`
            );
          } else {
            data = indexDbData.questions
          }
        }
        setExamQuestions(data)

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
        
        
      } catch (err) {
        console.error('Error:', err.message);
        navigate('/simulator');
      }
    }
    fetchQuestions();
    
    /*===== Render Notification Style ======*/
    const el = document.createElement("style");
    el.id = "__ns_styles";
    el.textContent = CSS[0];
    document.head.appendChild(el);
    
    return () => document.getElementById("__ns_styles")?.remove();
  }, []);
  
  
  
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
    let isBmk = !findAns.isBookmarked ? true : false
    setAnswers(answers.map(ans => ans.id === qsId ? { ... ans, isBookmarked: isBmk} : ans))
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
  
  function switchSubject(event){
    const { name } = event.currentTarget.dataset
    setCurrentSubject(name)
    setCurrentIndex(0)
    setSystemUpdate(systemUpdate + 1)
  }
  
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
  
  function navigateQues(event){
    const { num } = event.target.dataset
    setCurrentIndex(Number(num) - 1)
    setToggleNav(false)
  }
  
  
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
    setIsActive(prev => !prev)
  },[setIsActive])
  
  const skipAutoSubmit = useRef(false)
  function goBack(){
    skipAutoSubmit.current = true
    navigate('/simulator')
  }
  
  if (!isActive) return <Loading />

  return (
    <>
      <title>Exam | CBT Pro</title>

      <div className="exam-page no-select" aria-live="polite">
        <header className="exam-header">
          <div className="exam-header-inner">
            <button className="exam-back-btn" onClick={goBack}>← Back</button>
            <div className="exam-timer">
             {isActive && <ExpensiveChild submitExam={submitExam} hours={examConfig.hours} minutes={examConfig.minutes} skipAutoSubmit={skipAutoSubmit}/> }
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
                      
                      <Image id={ques.id} />
                      
                      {ques.question.instruction && <><strong>{ques.question.instruction}</strong><br /></>}
                      {ques.question.comprehension && <><strong dangerouslySetInnerHTML={{__html: ques.question.comprehension}}></strong><br/></>}
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
                    
                    <div className="exam-options">
                      {
                        ques.options.map(opt => 
                          (
                             <div className={`exam-option ${opt.id === userAnswer && 'selected'}`} key={opt.id} onClick={selectedOpt} data-selected-id={opt.id} data-id={ques.id}>
                                <div className="exam-option-key">{opt.id.toUpperCase()}</div>
                                <div className="exam-option-content">
                                  <div className="exam-option-text" dangerouslySetInnerHTML={{__html: opt.option}} />
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
                onPrimary={() => setIsActive(prev => !prev)}
                onClose={closeModal}
              />
            </div>
          </div>
        )}
        <Calculator toggleCalc={toggleCalc} setToggleCalc={setToggleCalc} calcModalRef={calcModalRef} />
      </div>
    </>
  );
}