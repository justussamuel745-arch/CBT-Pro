import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
  useRef
} from "react";

import * as notificationServiceHandlers from "../services/notificationService";
import socketService from "../services/socketService";

import {
  saveNotification,
  saveNotifications,
  getLocalNotifications,
  clearLocalNotifications,
} from "../hooks/services/indexedDB/notifications";

import {
  getOfflineNotifications
} from "../hooks/services/indexedDB/offlineNotifications"

import {
  getPendingQueueActions,
  processQueue
} from "../hooks/services/indexedDB/notificationQueue";


import { authStore } from '../stores/authStore';
import { userStore } from '../stores/userStore';

import usePWAInstall from "../hooks/usePWAInstall";

/**
 * Notification Context
 * Provides notifications state, unread count, and sync handlers to the app
 */
const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  // =======================
  // 1. CONTEXT & HOOKS
  // =======================
  const token = authStore(state => state.token)
  const userId = userStore(state => state.userId)

  // =======================
  // 2. LOCAL STATE
  // =======================
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const pwa = usePWAInstall()

  const handlers = useMemo(() => {
    return notificationServiceHandlers
  },[])

  const hasLoadNotifications = useRef(false)

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
    const offline = await getOfflineNotifications(userId)
    updateFromList(local.concat(offline));
  }, [updateFromList]);

  /**
   * Sync notifications from backend to IndexedDB and state.
   * Should run when online and after login.
   * @param {string} token
   */
  const syncNotifications = useCallback(async () => {
    try {
      const data = await handlers.getNotifications();
      const serverNotifications = data.notifications || [];
      const offline = await getOfflineNotifications(userId)

      await clearLocalNotifications(userId).catch(() => {})
      // Cache server data locally
      await saveNotifications(serverNotifications);
      updateFromList(serverNotifications.concat(offline));
    } catch (error) {
      console.error("Notification sync failed:", error);
    }
  }, [updateFromList, userId, handlers]);

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
    if (!token || !userId) return;

    const syncNotificationQueue = async () => {
      const pending = await getPendingQueueActions(userId);
      if (!pending || pending.length === 0) return;
      await processQueue(userId, handlers);
    };

    
   /**
   * Initialize notifications on login
   * 1. Load from IndexedDB first for speed/offline
   * 2. Then sync with server if online
   **/

    const initialize = async () => {
      setLoading(true);
      // Step 1: Load cached data
      await loadLocalNotifications(userId);
      // Step 2: Sync with server if online
      if (navigator.onLine) {
        // sync offline queue before getting the notifications
        await syncNotificationQueue().catch(() => {})
        await syncNotifications();
        hasLoadNotifications.current = true
      }
      setLoading(false);
    };

    if (!hasLoadNotifications.current){
      initialize()
    }


    // Also run when browser goes back online
    window.addEventListener("online", syncNotificationQueue);
    return () => {
      window.removeEventListener("online", syncNotificationQueue);
    };
  }, [token, userId, handlers,  loadLocalNotifications, syncNotifications]);

  
  /**
   * Effect 2: Connect to Socket.IO for real-time notifications
   * Listens for "notification" events and cleans up on unmount/logout
   */
  useEffect(() => {
    if (!token ||!userId) return;

    const socket = socketService.connect(token);
    socket.on("notification", handleNewNotification);

    return () => {
      socket.off("notification", handleNewNotification);
      socketService.disconnect();
    };
  }, [token, userId, handleNewNotification]);

  /**
   * Effect 3: Clear state on logout
   * Resets everything when token is removed
   */
  useEffect(() => {
    if (token) return;
    setNotifications([]);
    setUnreadCount(0);
    setSettings(null);
    setLoading(false);
    hasLoadNotifications.current = false
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
    userId,
    handlers,
    pwa
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