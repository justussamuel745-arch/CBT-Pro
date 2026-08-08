import { useState, useEffect, useContext, lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router';
import UserContext from './context/UserContext.jsx';
import { ProtectedRoutes } from './routes/ProtectedRoutes';
import { HomePage } from './pages/HomePage';
import { Study } from './pages/study/Study';
import { Simulator } from './pages/simulator/Simulator';
import { About } from './pages/About';
import { Feedback } from './pages/Feedback';
import { Legal } from './pages/Legal';
import { Payment } from './pages/Payment';
import { Settings } from './pages/Settings';
import { Bookmark } from './pages/Bookmark';
import { History } from './pages/History';
import { Loading } from './components/Loading';
import { Invalid } from './components/Invalid';
import { Syllabus } from './pages/Syllabus';
import { Dashboard } from './pages/Dashboard';
import PWAUpdateToast from './components/PWAUpdateToast';
import Auth  from './pages/auth/Auth';
import Notifications  from './pages/Notifications';
import ExamPlanners from './pages/examPlanner/ExamPlanners.jsx';
import { fetchDataGet, fetchUserInfo, fetchHistory } from './scripts/utilis/fetch';
import { on } from './scripts/utilis/submitHistory';
import { getUser, deleteUser } from './hooks/services/indexedDB/users';
import { getHistory } from './hooks/services/indexedDB/history';
import { deleteAllQuestions } from './hooks/services/indexedDB/questions';
import { decrypt } from './scripts/utilis/crypto';
import './App.css';

const Games = lazy(() => import('./pages/games/Games.jsx'));
const Delete = lazy(() => import('./pages/Delete.jsx'));
const Admin = lazy(() => import('./pages/admin/Admin.jsx'));

function App() {
  const {
    token,
    setToken,
    setIsActivated,
    setIsAdmin,
    setUserInfo,
    setProfileFields,
    setHistoryData,
  } = useContext(UserContext);

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Loads the signed-in user from the server and returns the fresh
    // access token, since state setters don't update synchronously.
    const refresh = async () => {
      const response = await fetchDataGet('/api/refresh');
      const d = decrypt(response.data);
      if (d?.activationExpired){
        await deleteAllQuestions()
      }
      setToken(d.accessToken);
      setIsActivated(d.isActivated);
      setIsAdmin(d.isAdmin);
      await Promise.all([
        fetchUserInfo(d.accessToken, setUserInfo, setProfileFields),
        fetchHistory(d.accessToken, setToken, setHistoryData),
      ]);
      return d.accessToken;
    };

    // Falls back to the locally cached user when offline.
    const loadCachedUser = async () => {
      const encrypted = await getUser();
      if (!encrypted || Object.keys(encrypted).length === 0) {
        setIsLoading(false);
        return;
      }

      const user = {
        ...decrypt(encrypted.info),
        blob: encrypted.blob,
        id: encrypted.id,
      };
      const accessToken = user.accessToken;
      delete user.accessToken;

      setToken(accessToken);
      setUserInfo(user);
      setProfileFields({
        fullName: user?.fullName || '',
        phoneNumber: user?.phoneNumber || '',
        targetExam: user?.targetExam || 'JAMB UTME 2027',
        targetScore: user?.targetScore || '',
      });
      setIsActivated(user.isActivated);
      setIsLoading(false);

      const userHistory = await getHistory(user?._id);
      setHistoryData(userHistory);
    };

    const init = async () => {
      if (!navigator.onLine) {
        await loadCachedUser();
        return;
      }
      try {
        const accessToken = await refresh();
      } catch (err) {
        console.error('Error refreshing session:', err.error);
        if (err.status === 401){
          deleteUser()
        }
      } finally {
        setIsLoading(false);
      }
    };

    init();

    const handleOnline = () => on(token, setToken, setHistoryData);
    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (isLoading) return <Loading />;

  return (
    <>
      <Routes>
        <Route index element={token ? <Dashboard /> : <HomePage />} />
        <Route path="/auth/*" element={<Auth />} />
        <Route path="/examplanner/*" element={<ExamPlanners />} />
        <Route path="/about" element={<About />} />
        <Route path="/legal" element={<Legal />} />

        <Route element={<ProtectedRoutes />}>
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/study/*" element={<Study />} />
          <Route path="/simulator/*" element={<Simulator />} />
          <Route path="/feedback" element={<Feedback />} />
          <Route path="/payment" element={<Payment />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/bookmark" element={<Bookmark />} />
          <Route path="/history" element={<History />} />
          <Route path="/syllabus" element={<Syllabus />} />
          <Route
            path="/game/*"
            element={
              <Suspense fallback={<Loading />}>
                <Games />
              </Suspense>
            }
          />
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
      <PWAUpdateToast />
    </>
  );
}

export default App;