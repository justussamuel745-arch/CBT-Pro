import { request } from "../scripts/utilis/request.js";

const ENDPOINTS = {
  notifications: `/api/notifications`,
  unreadCount: `/api/notifications/unread-count`,
  readAll: `/api/notifications/read-all`,
  settings: `/api/notifications/settings`,
};

const makeRequest = async (endpoint, options = { method: 'GET' }) => {
  const response = await request.auth(endpoint, options);
  const data = response.body
  return data;
};

export const getNotifications = () =>
  makeRequest(ENDPOINTS.notifications);

export const getUnreadCount = () =>
  makeRequest(ENDPOINTS.unreadCount);

export const markAsRead = (notificationId) =>
  makeRequest(
    `${ENDPOINTS.notifications}/${notificationId}/read`,
    { method: "PATCH" }
  );

export const markAllAsRead = () =>
  makeRequest(ENDPOINTS.readAll, {
    method: "PATCH",
  });

export const deleteNotification = (notificationId) =>
  makeRequest(
    `${ENDPOINTS.notifications}/${notificationId}`,
    { method: "DELETE" }
  );

export const createNotification = (notification) =>
  makeRequest(ENDPOINTS.notifications, {
    method: "POST",
    body: JSON.stringify(notification),
  });

export const getNotificationSettings = () =>
  makeRequest(ENDPOINTS.settings);

export const updateNotificationSettings = (settings) =>
  makeRequest(ENDPOINTS.settings, {
    method: "PATCH",
    body: JSON.stringify(settings),
  });
  
