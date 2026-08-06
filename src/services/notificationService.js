import { fetchWithAuth } from "../scripts/utilis/fetch";

const ENDPOINTS = {
  notifications: `/api/notifications`,
  unreadCount: `/api/notifications/unread-count`,
  readAll: `/api/notifications/read-all`,
  settings: `/api/notifications/settings`,
};

const request = async (endpoint, token, setToken, options = {}) => {
  const response = await fetchWithAuth(token, setToken, endpoint, options);

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Request failed.");
  }

  return data;
};

export const getNotifications = (token, setToken) =>
  request(ENDPOINTS.notifications, token, setToken);

export const getUnreadCount = (token, setToken) =>
  request(ENDPOINTS.unreadCount, token, setToken);

export const markAsRead = (notificationId, token, setToken) =>
  request(
    `${ENDPOINTS.notifications}/${notificationId}/read`,
    token,
    setToken,
    { method: "PATCH" }
  );

export const markAllAsRead = (token, setToken) =>
  request(ENDPOINTS.readAll, token, setToken, {
    method: "PATCH",
  });

export const deleteNotification = (notificationId, token, setToken) =>
  request(
    `${ENDPOINTS.notifications}/${notificationId}`,
    token,
    setToken,
    { method: "DELETE" }
  );

export const createNotification = (notification, token, setToken) =>
  request(ENDPOINTS.notifications, token, setToken, {
    method: "POST",
    body: JSON.stringify(notification),
  });

export const getNotificationSettings = (token, setToken) =>
  request(ENDPOINTS.settings, token, setToken);

export const updateNotificationSettings = (settings, token, setToken) =>
  request(ENDPOINTS.settings, token, setToken, {
    method: "PATCH",
    body: JSON.stringify(settings),
  });
  
