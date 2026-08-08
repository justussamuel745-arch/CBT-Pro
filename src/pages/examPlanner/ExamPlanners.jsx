import { Routes, Route } from 'react-router';
import ExamPlanner from './ExamPlanner';
import ScheduleExam from './ScheduleExam';
import ExamHistory from './ExamHistory';
import ExamResult from './ExamResult';
import ExamDetail from './ExamDetail';
import Countdown from './Countdown';

export default function ExamPlanners(){
  return (
    <Routes>
      <Route path="/" element={<ExamPlanner />} />
      <Route path="/schedule" element={<ScheduleExam />} />
      <Route path="/history" element={<ExamHistory />} />
      <Route path="/result" element={<ExamResult />} />
      <Route path="/result" element={<ExamResult />} />
      <Route path="/result" element={<ExamResult />} />
      <Route path="/countdown" element={<Countdown />} />
    </Routes>
  )
}