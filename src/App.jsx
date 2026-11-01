import { useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { useOfflineNotifier } from './hooks/useOfflineNotifier';
import { Loading } from './components/feedback/Loading';
import { submitLocalHistory } from '@/services/historyService';
import { init } from '@/services/appInit';
import { authStore } from './stores/authStore';
import { useExamDataSync } from './hooks/useExamDataSync';
import { useAutoThemeColor } from './hooks/useAutoThemeColor';
import PWAUpdateToast from './components/feedback/PWAUpdateToast';
import AppRouter from './routes/AppRouter';
import '@/styles/layout.css';

function App() {
  // listen for when upcomings exams changes and update the changes in indexedDB
  useExamDataSync()
  useAutoThemeColor()
  // listener for exam reminder and trigger notifications
  useOfflineNotifier()
  
  const isLoading = authStore((state) => state.isLoading);
  
  useEffect(() => {
    init()
    
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
    </>
  );
}

export default App;