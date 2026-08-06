import { useContext } from 'react';
import UserContext from '../context/UserContext';
import { fetchWithAuth } from '../scripts/utilis/fetch.js';

export function useNotificationHandlers(){
  const { token, setToken } =  useContext(UserContext);
  const handlers = {
    async markRead(notificationId){
      const response = await fetchWithAuth(token, setToken, `/api/notifications/${notificationId}/read`, { method: 'PATCH' })
      if (!response.ok){
        throw new Error('Error: Failed');
      }
    },
    async deleteNotification(notificationId){
      const response = await fetchWithAuth(token, setToken, `/api/notifications/${notificationId}/`, { method: 'DELETE'})
      if (!response.ok){
        throw new Error('Error: Failed');
      }
    }
  }
  
  return handlers
}