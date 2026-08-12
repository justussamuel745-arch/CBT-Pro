import { useState, useEffect, useRef, memo } from 'react';
import { useNavigate } from 'react-router';
import { simulatorStore } from '../stores/simulatorStore';
import './CountdownTimer.css';

export const CountdownTimer = memo(function CountdownTimer({ onFinish, hours, minutes, skipAutoSubmit }) {
  const examQuestions = simulatorStore((state) => state.examQuestions);
  const calculateScore = simulatorStore((state) => state.calculateScore);
  const navigate = useNavigate();

  // Computed ONCE via lazy ref init — survives re-renders, never resets
  const countdownTimeRef = useRef((60 * 60 * hours) + (60 * minutes));
  const endTimeRef = useRef(Date.now() + countdownTimeRef.current * 1000);
  const countdownTime = countdownTimeRef.current;

  const getRemaining = () => Math.max(0, Math.round((endTimeRef.current - Date.now()) / 1000));

  const [timeLeft, setTimeLeft] = useState(getRemaining);

  const onFinishRef = useRef(onFinish);
  useEffect(() => { onFinishRef.current = onFinish; }, [onFinish]);

  const finishedRef = useRef(false);

  // Interval created ONCE — ticks just re-derive remaining time from the clock
  useEffect(() => {
    const interval = setInterval(() => {
      const remaining = getRemaining();
      setTimeLeft(remaining);
      if (remaining <= 0 && !finishedRef.current) {
        finishedRef.current = true;
        clearInterval(interval);
        onFinishRef.current?.();
      }
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const examQuestionsRef = useRef(examQuestions);
  useEffect(() => { examQuestionsRef.current = examQuestions; }, [examQuestions]);

  useEffect(() => {
    return () => {
      if (skipAutoSubmit.current) return;
      const timeTaken = countdownTime - getRemaining();
      const timeAllocated = countdownTime;
      if (examQuestionsRef.current.length !== 0) {
        calculateScore(examQuestionsRef.current, timeTaken, timeAllocated);
        navigate('/simulator/score');
      }
    };
  }, []);

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
});