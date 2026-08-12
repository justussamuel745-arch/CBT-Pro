import { request } from "../scripts/utilis/request.js";

const ENDPOINTS = {
  notifications: `/api/notifications`,
  unreadCount: `/api/notifications/unread-count`,
  readAll: `/api/notifications/read-all`,
  settings: `/api/notifications/settings`,
};

const makeRequest = async (endpoint, token, setToken, options = {}) => {
  const response = await request.auth(endpoint, options);
  const data = response.body
  return data;
};

export const getNotifications = (token, setToken) =>
  makeRequest(ENDPOINTS.notifications, token, setToken);

export const getUnreadCount = (token, setToken) =>
  makeRequest(ENDPOINTS.unreadCount, token, setToken);

export const markAsRead = (notificationId, token, setToken) =>
  makeRequest(
    `${ENDPOINTS.notifications}/${notificationId}/read`,
    token,
    setToken,
    { method: "PATCH" }
  );

export const markAllAsRead = (token, setToken) =>
  makeRequest(ENDPOINTS.readAll, token, setToken, {
    method: "PATCH",
  });

export const deleteNotification = (notificationId, token, setToken) =>
  makeRequest(
    `${ENDPOINTS.notifications}/${notificationId}`,
    token,
    setToken,
    { method: "DELETE" }
  );

export const createNotification = (notification, token, setToken) =>
  makeRequest(ENDPOINTS.notifications, token, setToken, {
    method: "POST",
    body: JSON.stringify(notification),
  });

export const getNotificationSettings = (token, setToken) =>
  makeRequest(ENDPOINTS.settings, token, setToken);

export const updateNotificationSettings = (settings, token, setToken) =>
  makeRequest(ENDPOINTS.settings, token, setToken, {
    method: "PATCH",
    body: JSON.stringify(settings),
  });
  
