import { useState, useEffect, useContext, lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router';
import UserContext from './context/UserContext.jsx';
import { ProtectedRoutes } from './routes/ProtectedRoutes'
import { HomePage } from './pages/HomePage';
import { Study } from './pages/Study';
import { ProtectStudyRoute } from './routes/ProtectStudyRoute'
import { StudyTwo } from './pages/StudyTwo';
import { StudyMode } from './pages/StudyMode';
import { Simulator } from './pages/Simulator';
import { SimulatorTwo } from './pages/SimulatorTwo';
import { Exam } from './pages/Exam';
import { ProtectedExamRoutes } from './routes/ProtectedExamRoutes.jsx'
import { Review } from './pages/Review';
import { Score } from './pages/Score';
import { About } from './pages/About';
import { SignUp } from './pages/SignUp';
import { SignIn } from './pages/SignIn';
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
import { Game } from './pages/Game';
import { ProctectedAdminRoute } from './routes/ProtectedAdminRoute';
const Delete = lazy(() => import('./pages/Delete.jsx'));
const ResetPassword = lazy(() => import('./pages/auth/ResetPassword.jsx'));
const ForgotPassword = lazy(() => import('./pages/auth/ForgotPassword.jsx'));
const Pages = lazy(() => import('./pages/admin/Pages.jsx'));
import { fetchDataGet, fetchUserInfo, fetchHistory } from './scripts/utilis/fetch';
import { on } from './scripts/utilis/submitHistory';
import { getUser } from './hooks/services/indexedDB/users';
import { getHistory } from './hooks/services/indexedDB/history';
import PWAUpdateToast from './components/PWAUpdateToast';
import './App.css';

function App() {
  const { token, setToken, setIsActivated, setIsAdmin, setUserInfo, setProfileFields, setHistoryData } = useContext(UserContext)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const refresh = async () => {
      try {
        const response = await fetchDataGet('/api/refresh')
        setToken(response.accessToken)
        setIsActivated(response.isActivated)
        setIsAdmin(response.isAdmin)
        /*========= Fetching Data for Settings Page ===========*/
        await fetchUserInfo(response.accessToken, setUserInfo, setProfileFields)
        /*========= Fetching User History ===========*/
        await fetchHistory(response.accessToken, setHistoryData)

      } catch (err) {
        console.error('Error:', err);
      } finally {
        setIsLoading(false)
      }
    }
    
    const userExists = async () => {
      const user = await getUser()
      if (!user || Object.keys(user).length === 0){
        setIsLoading(false)
        return
      }
      setToken(crypto.randomUUID()) 
      // since user if offline when the page first open
      // the token passed in that state is not a valid token
      // just put it there to make the ui behave as if the user is signed in
      setUserInfo(user)
      setProfileFields({
        fullName: user?.fullName || '',
        phoneNumber: user?.phoneNumber || '',
        targetExam: user?.targetExam || 'JAMB UTME 2027',
        targetScore: user?.targetScore || '',
      });
      setIsActivated(user.isActivated)
      setIsLoading(false)
      const userHistory = await getHistory(user?._id)
      setHistoryData(userHistory)
    }
    
    

    if (navigator.onLine) {
      on(token, setToken, setHistoryData)
      refresh()
    } else {
      userExists()
    }
    
    const onlineListener = async () => {
      on(token, setToken, setHistoryData)
    }

    window.addEventListener('online', onlineListener)
    return () => window.removeEventListener('online', onlineListener)
  }, [setHistoryData, setIsActivated, setIsAdmin, setProfileFields, setToken, setUserInfo])

  return (
    <>
      {isLoading ? <Loading /> :
        (
          <Routes>
            <Route index element={token ? <Dashboard /> : <HomePage />} />
            <Route path="/about" element={<About />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/signin" element={<SignIn />} />
            <Route path="/forgot-password" element={
              <Suspense fallback={<Loading />}>
                <ForgotPassword />
              </Suspense>
            } />
            <Route path="/reset-password" element={
              <Suspense fallback={<Loading />}>
                <ResetPassword />
              </Suspense>
            } />
            
            <Route path="/legal" element={<Legal />} />
            <Route element={<ProtectedRoutes />}>
              <Route path="/study" element={<Study />} />
              <Route path="/studytwo" element={<StudyTwo />} />
              <Route path="/studymode" element={<ProtectStudyRoute><StudyMode /></ProtectStudyRoute>} />
              <Route path="/simulator" element={<Simulator />} />
              <Route element={<ProtectedExamRoutes />}>
                <Route path="/exam" element={<Exam />} />
                <Route path="/simulatortwo" element={<SimulatorTwo />} />
              </Route>
              <Route path="/review" element={<Review />} />
              <Route path="/score" element={<Score />} />
              <Route path="/feedback" element={<Feedback />} />
              <Route path="/payment" element={<Payment />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/bookmark" element={<Bookmark />} />
              <Route path="/history" element={<History />} />
              <Route path="/syllabus" element={<Syllabus />} />
              <Route path="/delete" element={
                <Suspense fallback={<Loading />}>
                  <Delete />
                </Suspense>
              } />
              <Route path="/admin/users" element={
                <ProctectedAdminRoute>
                  <Suspense fallback={<Loading />}>
                    <Pages />
                  </Suspense>
                </ProctectedAdminRoute>
              } />
            </Route>
            <Route path="*" element={<Invalid />} />
          </Routes>
        )
      }
      <PWAUpdateToast />
    </>
  )
}

export default App
