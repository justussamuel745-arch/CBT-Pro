import { useEffect, lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router';
import { ProtectRoutes } from './ProtectRoutes';
import { ProtectExamRoutes } from './ProtectExamRoutes';
import { Loading } from '../components/Loading';
import { Invalid } from '../components/Invalid';
import HomePage from '../pages/HomePage';
import  Study from '../pages/study/Study';
import Practice from '../pages/practice/Practice';
import About  from '../pages/About';
import HelpCenter  from '../pages/HelpCenter';
import Feedback from '../pages/Feedback';
import Legal from '../pages/Legal';
import Payment from '../pages/Payment';
import Settings from '../pages/Settings';
import Bookmark  from '../pages/Bookmark';
import History from '../pages/History';
import Syllabus from '../pages/Syllabus';
import Dashboard from '../pages/Dashboard';
import Auth  from '../pages/auth/Auth';
import Notifications  from '../pages/Notifications';
import ExamPlanners from '../pages/examPlanner/ExamPlanners';
import ExamSimulator from '../pages/ExamSimulator';
import StudySimulator from '../pages/StudySimulator';

const Delete = lazy(() => import('../pages/Delete.jsx'));
const Admin = lazy(() => import('../pages/admin/Admin.jsx'));


import { authStore } from '../stores/authStore';

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
        <Route
          path="/admin/*"
          element={
            <Suspense fallback={<Loading />}>
              <Admin />
            </Suspense>
          }
        />
      </Route>
      <Route path="*" element={<Invalid />} />
    </Routes>
  )
}

export default AppRouter