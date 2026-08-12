import { request } from '../scripts/utilis/request.js';

export function useNotificationHandlers(){
  const handlers = {
    async markRead(notificationId){
      await request.auth(`/api/notifications/${notificationId}/read`, { method: 'PATCH' })
    },
    async deleteNotification(notificationId){
      await request.auth(`/api/notifications/${notificationId}/`, { method: 'DELETE'})
    }
  }
  
  return handlers
}