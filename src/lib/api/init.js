import { authStore } from '@/stores/authStore';
import { userStore } from '@/stores/userStore';
import { scheduledExamStore } from '@/stores/scheduledExamStore';

export const init = async () => {
  const isLoading = authStore.getState().isLoading;
  const refresh = authStore.getState().refresh;
  
  const loadCachedUser = userStore.getState().loadCachedUser;
  const fetchUserInfo = userStore.getState().fetchUserInfo;
  const fetchUserHistory = userStore.getState().fetchUserHistory;
  const getDashboardInfo = scheduledExamStore.getState().getDashboardInfo
    
  if (!navigator.onLine) {
    await loadCachedUser();
    return
  }
  try {
    try{
      await refresh()
    } catch (err){
      if (!err.status && !err.message.includes('No existing session')){
        await loadCachedUser()
        return
      }
      throw new Error('Error refreshing session: ' + 'Using cached session')
    }
    await Promise.all([
      fetchUserInfo(),
      fetchUserHistory()
    ])
    await getDashboardInfo().catch(() => {})
  } catch (err) {
    console.error(err.error || err.message);
  } finally {
    authStore.setState({
      isLoading: false
    });
  }
}