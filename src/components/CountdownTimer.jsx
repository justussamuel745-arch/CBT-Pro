import { useState, useEffect, useRef, useContext } from 'react';
import { useNavigate } from 'react-router';
import UserContext from '../context/UserContext';
import { fetchWithAuth } from '../scripts/utilis/fetch';
import { calculateScore } from '../scripts/utilis/calculateScore';

export function CountdownTimer({ onFinish, hours, minutes, skipAutoSubmit }) {
  const { token, setToken, answers, setExamResults, examQuestions, userInfo, setHistoryData } = useContext(UserContext)
  const navigate = useNavigate()
  const countdownTime = (60 * 60 * hours) + (60 * minutes)
  const [timeLeft, setTimeLeft] = useState(countdownTime); // 2 hours in seconds

  useEffect(() => {
    if (timeLeft <= 0) {
      onFinish?.(); // optional callback when timer hits 0
      return;
    }

    const interval = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timeLeft, onFinish]);

  async function submitHistory({ subjects, score, timeTaken, performance }, question) {
    const newHistory = {
      userId: userInfo._id,
      testId: crypto.randomUUID(),
      subjects,
      score,
      timeSpent: timeTaken,
      question,
      performance
    }
    if (!navigator.onLine){
      const unsavedHistory = JSON.parse(localStorage.getItem('unsavedHistory')) || []
      unsavedHistory.push(newHistory)
      localStorage.setItem('unsavedHistory', JSON.stringify(unsavedHistory));
      return
    }
    try {
      const response = await fetchWithAuth(token, setToken, '/api/history/submit', {
        method: 'POST',
        body: JSON.stringify(newHistory)
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) {
        throw { status: response.status, error: newHistory }
      }
      console.log(data);
      setHistoryData(data)
    } catch (err) {
      if (typeof err?.error === 'object' || err.status !== 404){
        const unsavedHistory = JSON.parse(localStorage.getItem('unsavedHistory')) || []
        unsavedHistory.push(err.error)
        localStorage.setItem('unsavedHistory', JSON.stringify(unsavedHistory));
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
        navigate('/score')
      }
    }
  }, [])

  const formatTime = (secs) => {
    const hrs = Math.floor(secs / 3600);
    const mins = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return `${hrs}:${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <span style={{
      color: timeLeft < 300 ? 'var(--danger)' : 'var(--text)' // turn red under 5 min
    }}>
      ⏱ {formatTime(timeLeft)}
    </span>
  );
}