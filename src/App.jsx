import { useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { OfflineNotifier } from './components/OfflineNotifier';
import { Loading } from './components/Loading';
import { submitLocalHistory } from './scripts/utils/submitHistory';
import { deleteUser } from './hooks/services/indexedDB/users';
import { authStore } from './stores/authStore';
import { userStore } from './stores/userStore';
import { scheduledExamStore } from './stores/scheduledExamStore';
import { useExamDataSync } from './hooks/useExamDataSync';
import { useAutoThemeColor } from './hooks/useAutoThemeColor';
import PWAUpdateToast from './components/PWAUpdateToast';
import AppRouter from './routes/AppRouter';
import './App.css';

function App() {
  // listen for when upcomings exams changes and update the changes in indexedDB
  useExamDataSync()
  useAutoThemeColor()
  
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
      <AppRouter />
      <Toaster position="top-center" reverseOrder={false} />
      <PWAUpdateToast />
      <OfflineNotifier />
    </>
  );
}

export default App;