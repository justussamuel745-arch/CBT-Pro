import { useEffect, lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router';
import { Toaster } from 'react-hot-toast';
import { ProtectRoutes } from './routes/ProtectRoutes';
import { ProtectExamRoutes } from './routes/ProtectExamRoutes';
import { Loading } from './components/Loading';
import { Invalid } from './components/Invalid';
import { OfflineNotifier } from './components/OfflineNotifier';
import HomePage from './pages/HomePage';
import  Study from './pages/study/Study';
import Practice from './pages/practice/Practice';
import About  from './pages/About';
import Feedback from './pages/Feedback';
import Legal from './pages/Legal';
import Payment from './pages/Payment';
import Settings from './pages/Settings';
import Bookmark  from './pages/Bookmark';
import History from './pages/History';
import Syllabus from './pages/Syllabus';
import Dashboard from './pages/Dashboard';
import PWAUpdateToast from './components/PWAUpdateToast';
import Auth  from './pages/auth/Auth';
import Notifications  from './pages/Notifications';
import ExamPlanners from './pages/examPlanner/ExamPlanners';
import ExamSimulator from './pages/ExamSimulator';
import { submitLocalHistory } from './scripts/utils/submitHistory';
import { deleteUser } from './hooks/services/indexedDB/users';
import { authStore } from './stores/authStore';
import { userStore } from './stores/userStore';
import { scheduledExamStore } from './stores/scheduledExamStore';
import { useExamDataSync } from './hooks/useExamDataSync';
import { useAutoThemeColor } from './hooks/useAutoThemeColor';
import './App.css';

const Delete = lazy(() => import('./pages/Delete.jsx'));
const Admin = lazy(() => import('./pages/admin/Admin.jsx'));

function App() {
  // listen for when upcomings exams changes and update the changes in indexedDB
  useExamDataSync()
  useAutoThemeColor()
  
  const token = authStore((state) => state.token);
  const isLoading = authStore((state) => state.isLoading);
  const setIsLoading = authStore((state) => state.setIsLoading);
  const refresh = authStore((state) => state.refresh);
  
  const loadCachedUser = userStore((state) => state.loadCachedUser);
  const fetchUserInfo = userStore((state) => state.fetchUserInfo);
  const fetchUserHistory = userStore((state) => state.fetchUserHistory);
  const getDashboardInfo = scheduledExamStore(state => state.getDashboardInfo)
    
  
  useEffect(() => {
    (async () => {
      if (!navigator.onLine) {
        await loadCachedUser();
        return
      }
      try {
        await refresh();
        await Promise.all([
          fetchUserInfo(),
          fetchUserHistory(),
        ])
        await getDashboardInfo().catch(() => {})
      } catch (err) {
        console.error('Error refreshing session:', err.error || err.message);
        if (err.status === 401){
          deleteUser()
        }
      } finally {
        setIsLoading(false);
      }
    })();
    
    window.addEventListener('online', submitLocalHistory);
    return () => window.removeEventListener('online', submitLocalHistory);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (isLoading) return <Loading />;

  return (
    <>
      
      <Routes>
        <Route index element={token ? <Dashboard /> : <HomePage />} />
        <Route path="/auth/*" element={<Auth />} />
        <Route path="/about" element={<About />} />
        <Route path="/legal" element={<Legal />} />

        <Route element={<ProtectRoutes />}>
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/study/*" element={<Study />} />
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
      <Toaster position="top-center" reverseOrder={false} />
      <PWAUpdateToast />
      <OfflineNotifier />
    </>
  );
}

export default App;