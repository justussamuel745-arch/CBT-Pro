import { Routes, Route } from 'react-router';
import ExamPlanner from './ExamPlanner';
import ScheduleExam from './ScheduleExam';
import ExamHistory from './ExamHistory';
import ExamResult from './ExamResult';
import MissedExam from './MissedExam';
import ExamInstructions from './ExamInstructions';

export default function ExamPlanners(){
  return (
    <Routes>
      <Route path="/" element={<ExamPlanner />} />
      <Route path="/schedule" element={<ScheduleExam />} />
      <Route path="/history" element={<ExamHistory />} />
      <Route path="/result" element={<ExamResult />} />
      <Route path="/missed" element={<MissedExam />} />
      <Route path="/instructions" element={<ExamInstructions />} />
    </Routes>
  )
}