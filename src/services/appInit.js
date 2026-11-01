import { authStore } from '@/stores/authStore';
import { userStore } from '@/stores/userStore';
import { scheduledExamStore } from '@/stores/scheduledExamStore';

/** Restores the session and loads the signed in user's data on app start. */
export const init = async () => {
  const { refresh } = authStore.getState();
  const { loadCachedUser, fetchUserInfo, fetchUserHistory } = userStore.getState();
  const { getDashboardInfo } = scheduledExamStore.getState();

  if (!navigator.onLine) {
    await loadCachedUser();
    return
  }
  try {
    try{
      await refresh()
    } catch (err){
      // No connection / no saved session: fall back to the cached user.
      if (!err.status){
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
    console.error(err.message);
  } finally {
    authStore.setState({
      isLoading: false
    });
  }
}
