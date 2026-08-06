import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";

import UserContext from "./UserContext";
import * as notificationService from "../services/notificationService";
import socketService from "../services/socketService";

import {
  saveNotification,
  saveNotifications,
  getLocalNotifications,
  getLocalUnreadCount,
} from "../hooks/services/indexedDB/notifications";

import {
  getPendingQueueActions,
  processQueue
} from "../hooks/services/indexedDB/notificationQueue";

import { useNotificationHandlers } from '../services/useNotificationHandlers';

/**
 * Notification Context
 * Provides notifications state, unread count, and sync handlers to the app
 */
const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  // =======================
  // 1. CONTEXT & HOOKS
  // =======================
  const { token, setToken, userInfo } = useContext(UserContext);
  const handlers = useNotificationHandlers();

  // =======================
  // 2. LOCAL STATE
  // =======================
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  // =======================
  // 3. HELPER: UPDATE STATE FROM LIST
  // DRY: Used by both local load and server sync to avoid duplicate code
  // =======================
  const updateFromList = useCallback((list) => {
    setNotifications(list);
    setUnreadCount(list.filter((n) =>!n.isRead).length);
  }, []);

  // =======================
  // 4. CORE FUNCTIONS
  // =======================

  /**
   * Load notifications from IndexedDB for offline support.
   * Runs first on app load to show cached data immediately.
   * @param {string} userId
   */
  const loadLocalNotifications = useCallback(async (userId) => {
    const local = await getLocalNotifications(userId);
    updateFromList(local);
  }, [updateFromList]);

  /**
   * Sync notifications from backend to IndexedDB and state.
   * Should run when online and after login.
   * @param {string} token
   */
  const syncNotifications = useCallback(async (token) => {
    try {
      const data = await notificationService.getNotifications(token, setToken);
      const serverNotifications = data.notifications || [];

      // Cache server data locally
      await saveNotifications(serverNotifications);
      updateFromList(serverNotifications);
    } catch (error) {
      console.error("Notification sync failed:", error);
    }
  }, [setToken, updateFromList]);

  /**
   * Handle real-time notification from Socket.IO
   * Saves to IndexedDB and updates UI immediately
   * @param {object} notification
   */
  const handleNewNotification = useCallback(async (notification) => {
    await saveNotification(notification);
    // Add to top of list
    setNotifications((prev) => [notification,...prev]);
    // Increment unread
    setUnreadCount((count) => count + 1);
  }, []);

  // =======================
  // 5. EFFECTS
  // =======================

  /**
   * Effect 1: Sync offline notification queue when coming back online
   * Runs once on mount and also listens to 'online' event
   */
  useEffect(() => {
    if (!token ||!userInfo?._id) return;

    const syncNotificationQueue = async () => {
      const pending = await getPendingQueueActions(userInfo._id);
      if (!pending || pending.length === 0) return;
      await processQueue(userInfo._id, handlers);
    };

    // Run immediately if already online
    if (navigator.onLine) {
      syncNotificationQueue();
    }

    // Also run when browser goes back online
    window.addEventListener("online", syncNotificationQueue);
    return () => {
      window.removeEventListener("online", syncNotificationQueue);
    };
  }, [token, userInfo, handlers]);

  /**
   * Effect 2: Initialize notifications on login
   * 1. Load from IndexedDB first for speed/offline
   * 2. Then sync with server if online
   */
  useEffect(() => {
    if (!token ||!userInfo?._id) return;

    const initialize = async () => {
      setLoading(true);
      // Step 1: Load cached data
      await loadLocalNotifications(userInfo._id);
      // Step 2: Sync with server if online
      if (navigator.onLine) {
        await syncNotifications(token);
      }
      setLoading(false);
    };

    initialize();
  }, [token, userInfo, loadLocalNotifications, syncNotifications]);

  /**
   * Effect 3: Connect to Socket.IO for real-time notifications
   * Listens for "notification" events and cleans up on unmount/logout
   */
  useEffect(() => {
    if (!token ||!userInfo?._id) return;

    const socket = socketService.connect(token);
    socket.on("notification", handleNewNotification);

    return () => {
      socket.off("notification", handleNewNotification);
      socketService.disconnect();
    };
  }, [token, userInfo, handleNewNotification]);

  /**
   * Effect 4: Clear state on logout
   * Resets everything when token is removed
   */
  useEffect(() => {
    if (token) return;
    setNotifications([]);
    setUnreadCount(0);
    setSettings(null);
    setLoading(false);
  }, [token]);

  // =======================
  // 6. CONTEXT PROVIDER
  // =======================
  const contextValue = {
    // State
    notifications,
    unreadCount,
    settings,
    loading,

    // Setters
    setNotifications,
    setUnreadCount,
    setSettings,

    // Actions
    syncNotifications,

    // Meta
    userId: userInfo?._id,
    handlers,
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  );
};

/**
 * Custom hook to consume NotificationContext
 * Throws error if used outside NotificationProvider
 */
export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotifications must be used within a NotificationProvider");
  }
  return context;
};