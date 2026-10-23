import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router';
import { ProtectRoutes } from './ProtectRoutes';
import { ProtectExamRoutes } from './ProtectExamRoutes';
import { Loading } from '@/components/Loading';
import { Invalid } from '@/components/Invalid';
import HomePage from '@pages/HomePage';
import About  from '@pages/About';
import HelpCenter  from '@pages/HelpCenter';
import Feedback from '@pages/Feedback';
import Legal from '@pages/Legal';
import Payment from '@pages/Payment';
import Bookmark  from '@pages/Bookmark';
import History from '@pages/History';
import Syllabus from '@pages/Syllabus';
import Dashboard from '@pages/Dashboard';
import Notifications  from '@pages/Notifications';

import Auth  from '@/features/auth/Auth';
import ExamPlanners from '@/features/examPlanner/ExamPlanners';
import Practice from '@/features/practice/Practice';
import  Study from '@/features/study/Study';
import Settings from '@/features/settings/Settings';
import ExamSimulator from '@/features/simulator/ExamSimulator';
import StudySimulator from '@/features/simulator/StudySimulator';

const Delete = lazy(() => import('@/features/settings/Delete.jsx'));
import { authStore } from '@/stores/authStore';

function AppRouter() {
  const token = authStore(state => state.token)
  return (
    <Routes>
      <Route index element={token ? <Dashboard /> : <HomePage />} />
      <Route path="/auth/*" element={<Auth />} />
      <Route path="/about" element={<About />} />
      <Route path="/legal" element={<Legal />} />
      <Route path="/help" element={<HelpCenter />} />

      <Route element={<ProtectRoutes />}>
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/study/*" element={<Study />} />
        <Route path="/study-simulator" element={<StudySimulator />} />
        <Route path="/practice/*" element={<Practice />} />
        <Route path="/feedback" element={<Feedback />} />
        <Route path="/payment" element={<Payment />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/bookmark" element={<Bookmark />} />
        <Route path="/history" element={<History />} />
        <Route path="/exam-planner/*" element={<ExamPlanners />} />
        <Route element={<ProtectExamRoutes />}>
          <Route path="/simulator" element={<ExamSimulator />} />
        </Route>
        <Route path="/syllabus" element={<Syllabus />} />
        <Route
          path="/delete"
          element={
            <Suspense fallback={<Loading />}>
              <Delete />
            </Suspense>
          }
        />
      </Route>
      <Route path="*" element={<Invalid />} />
    </Routes>
  )
}

export default AppRouter