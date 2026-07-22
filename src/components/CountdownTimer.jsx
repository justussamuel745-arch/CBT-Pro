import { useState, useEffect, useRef, useContext } from 'react';
import { useNavigate } from 'react-router';
import UserContext from '../context/UserContext';
import { fetchWithAuth } from '../scripts/utilis/fetch';
import { calculateScore } from '../scripts/utilis/calculateScore';
import { saveHistory } from '../hooks/services/indexedDB/history';
import { encrypt, decrypt } from '../scripts/utilis/crypto';
import './CountdownTimer.css';

export function CountdownTimer({ onFinish, hours, minutes, skipAutoSubmit }) {
  const { token, setToken, answers, setExamResults, examQuestions, userInfo, setHistoryData } = useContext(UserContext)
  const navigate = useNavigate()
  const countdownTime = (60 * 60 * hours) + (60 * minutes)
  const [timeLeft, setTimeLeft] = useState(countdownTime);

  useEffect(() => {
    if (timeLeft <= 0) {
      onFinish?.();
      return;
    }
    const interval = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearInterval(interval);
  }, [timeLeft, onFinish]);

  async function submitHistory({ subjects, score, timeTaken, performance }, question) {
    const newHistory = {
      userId: userInfo._id,
      testId: crypto.randomUUID(),
      subjects, score, timeSpent: timeTaken, question, performance
    }
    if (!navigator.onLine){
      const unsavedHistory = decrypt(JSON.parse(localStorage.getItem('unsavedHistory'))) || []
      unsavedHistory.push(newHistory)
      localStorage.setItem('unsavedHistory', JSON.stringify(encrypt(unsavedHistory)));
      return
    }
    try {
      const response = await fetchWithAuth(token, setToken, '/api/history/submit', {
        method: 'POST',
        body: JSON.stringify(newHistory)
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw { status: response.status, error: newHistory }
      setHistoryData(data)
      saveHistory(data)
    } catch (err) {
      if (typeof err?.error === 'object' || err.status !== 404){
        const unsavedHistory = decrypt(JSON.parse(localStorage.getItem('unsavedHistory'))) || []
        unsavedHistory.push(err.error)
        localStorage.setItem('unsavedHistory', JSON.stringify(encrypt(unsavedHistory)));
      }
    }
  }

  const timeTakenRef = useRef(timeLeft)
  useEffect(() => { timeTakenRef.current = timeLeft }, [timeLeft]);

  const answersRef = useRef(answers);
  useEffect(() => { answersRef.current = answers }, [answers]);

  const examQuestionsRef = useRef(examQuestions)
  useEffect(() => { examQuestionsRef.current = examQuestions }, [examQuestions])

  useEffect(() => {
    return () => {
      if (skipAutoSubmit.current) return
      const timeTaken = countdownTime - timeTakenRef.current
      const timeAllocated = countdownTime
      const currentAnswers = answersRef.current
      if (examQuestionsRef.current.length !== 0) {
        const result = calculateScore(userInfo._id, examQuestionsRef.current, currentAnswers, timeTaken, timeAllocated)
        setExamResults(result)
        submitHistory(result, currentAnswers.length)
        navigate('/simulator/score')
      }
    }
  }, [])

  const formatTime = (secs) => {
    const hrs = Math.floor(secs / 3600);
    const mins = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return `${hrs}:${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const RADIUS = 13;
  const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
  const fraction = timeLeft / countdownTime;
  const dashOffset = CIRCUMFERENCE * (1 - fraction);
  const status = timeLeft < 300 ? 'danger' : fraction < 0.2 ? 'warning' : 'normal';

  return (
    <div className="countdown-timer" data-status={status}>
      <svg className="countdown-timer__ring" viewBox="0 0 32 32">
        <circle className="countdown-timer__ring-bg" cx="16" cy="16" r={RADIUS} />
        <circle
          className="countdown-timer__ring-fill"
          cx="16" cy="16" r={RADIUS}
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={dashOffset}
        />
      </svg>
      <span className="countdown-timer__digits">{formatTime(timeLeft)}</span>
    </div>
  );
}