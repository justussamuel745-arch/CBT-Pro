import { useState, useMemo, useEffect } from "react";
import { Link, useNavigate } from 'react-router';
import { useNotifications } from '../context/NotificationContext';
import { updateLocalNotificationRead, deleteLocalNotification } from '../hooks/services/indexedDB/notifications';
import { deleteOfflineNotification, updateOfflineNotification } from '../hooks/services/indexedDB/offlineNotifications';
import { addQueueAction } from '../hooks/services/indexedDB/notificationQueue';
import './Notifications.css';

/* =====================================
TYPE CONFIG — maps NotificationSchema.type enum
Colors reference the shared global tokens (--primary, --success, --danger, --c-info...)
wherever one fits; a couple of local additions cover gaps (premium violet, cyan tint)
without touching the shared :root.
======================================*/
const TYPE_CONFIG = {
  system: { label: "System", icon: "fa-solid fa-gear", color: "var(--text-muted)", bg: "var(--c-subtle)" },
  payment: { label: "Payment", icon: "fa-solid fa-credit-card", color: "var(--success)", bg: "var(--c-success-light)" },
  subscription: { label: "Subscription", icon: "fa-solid fa-crown", color: "var(--ntf-premium)", bg: "var(--ntf-premium-bg)" },
  exam: { label: "Exam", icon: "fa-solid fa-graduation-cap", color: "var(--primary)", bg: "var(--primary-light)" },
  question: { label: "Question", icon: "fa-solid fa-circle-question", color: "var(--accent)", bg: "var(--ntf-cyan-bg)" },
  announcement: { label: "Announcement", icon: "fa-solid fa-bullhorn", color: "var(--danger)", bg: "var(--c-error-light)" },
  reminder: { label: "Reminder", icon: "fa-solid fa-clock", color: "var(--c-info)", bg: "var(--c-info-light)" },
};

const MIN = 60 * 1000, HR = 60 * MIN, DAY = 24 * HR;

/* =====================================
DATE HELPERS — MongoDB sends createdAt as an ISO 8601 string
======================================*/
function toMs(value) {
  if (value == null) return NaN;
  if (typeof value === "number") return value;
  if (value instanceof Date) return value.getTime();
  return new Date(value).getTime();
}

function timeAgo(createdAt, now) {
  const ts = toMs(createdAt);
  if (Number.isNaN(ts)) return "";
  const diff = now - ts;
  if (diff < MIN) return "just now";
  if (diff < HR) return Math.floor(diff / MIN) + "m ago";
  if (diff < DAY) return Math.floor(diff / HR) + "h ago";
  if (diff < 2 * DAY) return "Yesterday";
  if (diff < 7 * DAY) return Math.floor(diff / DAY) + "d ago";
  return new Date(ts).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function groupLabel(createdAt, now) {
  const ts = toMs(createdAt);
  if (Number.isNaN(ts)) return "Earlier";
  const diff = now - ts;
  const sameCalendarDay = new Date(ts).toDateString() === new Date(now).toDateString();
  if (sameCalendarDay) return "Today";
  if (diff < 2 * DAY) return "Yesterday";
  if (diff < 7 * DAY) return "This week";
  return "Earlier";
}

const GROUP_ORDER = ["Today", "Yesterday", "This week", "Earlier"];

export default function Notifications() {
  const { notifications, setNotifications, unreadCount, setUnreadCount, userId, handlers } = useNotifications();
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState("all");
  const [toastMsg, setToastMsg] = useState(null);
  const [expandedIds, setExpandedIds] = useState(() => new Set());
  
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const toastTimer = useState(() => ({ current: null }))[0];

  const goBack = () => {
    if (window.history.state && window.history.state.idx > 0) {
      navigate(-1);
    } else {
      navigate("/");
    }
  };

  // Expand/collapse — unchanged from before
  const toggleExpand = (id, e) => {
    e.stopPropagation();
    setExpandedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const showToast = (msg) => {
    setToastMsg(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastMsg(null), 1800);
  };

  useEffect(() => () => clearTimeout(toastTimer.current), [toastTimer]);

  useEffect(
    () => setUnreadCount(notifications.filter((n) => !n.isRead).length),
    [notifications, setUnreadCount]
  );

  const counts = useMemo(() => {
    const c = { all: notifications.length };
    Object.keys(TYPE_CONFIG).forEach((t) => {
      c[t] = notifications.filter((n) => n.type === t).length;
    });
    return c;
  }, [notifications]);

  const filterTabs = useMemo(() => {
    const base = [{ key: "all", label: "All", icon: "fa-solid fa-layer-group" }];
    const rest = Object.entries(TYPE_CONFIG).map(([key, cfg]) => ({
      key,
      label: cfg.label,
      icon: cfg.icon,
    }));
    return [...base, ...rest].filter((c) => c.key === "all" || counts[c.key] > 0);
  }, [counts]);

  const groupedNotifications = useMemo(() => {
    const filtered =
      activeFilter === "all"
        ? notifications
        : notifications.filter((n) => n.type === activeFilter);
    const sorted = [...filtered].sort((a, b) => toMs(b.createdAt) - toMs(a.createdAt));
    const groups = {};
    sorted.forEach((n) => {
      const g = groupLabel(n.createdAt, now);
      if (!groups[g]) groups[g] = [];
      groups[g].push(n);
    });
    return GROUP_ORDER.filter((g) => groups[g]).map((g) => ({ label: g, items: groups[g] }));
  }, [notifications, activeFilter, now]);

  // Delete — unchanged from before (indexedDB + queue action + online handler)
  const markRead = async (id) => {
    if (notifications.find((n) => n._id === id)?.isRead) return;
    setNotifications((prev) =>
      prev.map((n) =>
        n._id === id && !n.isRead ? { ...n, isRead: true, readAt: new Date().toISOString() } : n
      )
    );
    
    const isOfflineNot = notifications.find(n => n._id === id)?.offline
    if (isOfflineNot){
      await updateOfflineNotification(id, {
        isRead: true
      })
      return
    }
    
    await updateLocalNotificationRead(id, userId);
    
    if (navigator.onLine) {
      try {
        await handlers.markAsRead(id);
      } catch {
        await addQueueAction({ userId, notificationId: id, action: "MARK_READ" });
      }
    } else {
      await addQueueAction({ userId, notificationId: id, action: "MARK_READ" });
    }
  };

  const deleteNotif = async (id, e) => {
    e.stopPropagation();
    let isOfflineNot;
    setNotifications((prev) => prev.filter((n) => {
      if (n._id === id){
        isOfflineNot = n.offline
        return false
      }
      return n._id !== id 
    }));
    if (isOfflineNot){
      await deleteOfflineNotification(id)
      return
    }
    await deleteLocalNotification(id, userId);
    if (navigator.onLine) {
      try {
        await handlers.deleteNotification(id);
      } catch {
        await addQueueAction({ userId, notificationId: id, action: "DELETE" });
      }
    } else {
      addQueueAction({ userId, notificationId: id, action: "DELETE" });
    }
    showToast("Notification deleted");
  };

  const markAllRead = async () => {
    let hadUnread = false;
    const offlineNotIds = [];
    setNotifications((prev) =>
      prev.map((n) => {
        if (!n.isRead) hadUnread = true;
        if (n?.offline) offlineNotIds.push(n._id)
        return n.isRead ? n : { ...n, isRead: true, readAt: new Date().toISOString() };
      })
    );

    const unreadOps = async (n) => {
      await updateLocalNotificationRead(n._id, userId);
      if (navigator.onLine) {
        try {
          await handlers.markRead(n._id);
        } catch {
          await addQueueAction({ userId, notificationId: n._id, action: "MARK_READ" });
        }
      } else {
        await addQueueAction({ userId, notificationId: n._id, action: "MARK_READ" });
      }
    };
    const onlineNots = notifications.filter(n => !offlineNotIds.includes(n._id))
    
    for (const id of offlineNotIds){
     const { isRead } =  notifications.find(n => n._id === id)
     if (isRead) continue
      await updateOfflineNotification(id, {
        isRead: true
      })
    }

    for (const n of onlineNots) {
      await unreadOps(n);
    }
    if (hadUnread) showToast("All notifications marked as read");
  };

  return (
    <div className="ntf-page">
      <div className="ntf-topbar">
        <header className="ntf-header">
          <div className="ntf-header-row">
            <div className="ntf-header-left">
              <button className="ntf-back-btn" onClick={goBack} title="Go back">
                <i className="fa-solid fa-arrow-left" />
              </button>

              <div className={`ntf-bell-wrap ${unreadCount > 0 ? "has-unread" : ""}`}>
                <i className="fa-solid fa-bell ntf-bell-icon" />
                {unreadCount > 0 && <span className="ntf-bell-ping" />}
                {unreadCount > 0 && <span className="ntf-bell-badge">{unreadCount > 9 ? "9+" : unreadCount}</span>}
              </div>

              <div>
                <h1>Notifications</h1>
                <p className="ntf-header-sub">
                  {unreadCount === 0 ? (
                    "You're all caught up"
                  ) : (
                    <>
                      <strong>{unreadCount}</strong> unread update{unreadCount === 1 ? "" : "s"}
                    </>
                  )}
                </p>
              </div>
            </div>

            <button className="ntf-icon-btn" onClick={markAllRead} title="Mark all as read">
              <i className="fa-solid fa-check-double" />
            </button>
          </div>
        </header>

        <nav className="ntf-tabs">
          {filterTabs.map((c) => (
            <button
              key={c.key}
              className={`ntf-tab ${activeFilter === c.key ? "active" : ""}`}
              onClick={() => setActiveFilter(c.key)}
            >
              <i className={c.icon} />
              {c.label}
              <span className="ntf-tab-count">{counts[c.key]}</span>
            </button>
          ))}
        </nav>
      </div>

      <main className="ntf-body">
        {groupedNotifications.length === 0 ? (
          <div className="ntf-empty">
            <i className="fa-regular fa-bell-slash" />
            <h3>Nothing here</h3>
            <p>You&apos;re all caught up{activeFilter !== "all" ? " in this category" : ""}.</p>
          </div>
        ) : (
          groupedNotifications.map((group) => (
            <div key={group.label}>
              <div className="ntf-group-label">{group.label}</div>
              <div className="ntf-list">
                {group.items.map((n) => {
                  const cfg = TYPE_CONFIG[n.type] || TYPE_CONFIG.system;
                  const isExpanded = expandedIds.has(n._id);
                  const isLong = n.message.length > 100;

                  return (
                    <div
                      key={n._id}
                      className={`ntf-card ${n.isRead ? "" : "unread"}`}
                      onClick={() => markRead(n._id)}
                    >
                      <button
                        className="ntf-card-delete"
                        title="Delete"
                        onClick={(e) => deleteNotif(n._id, e)}
                      >
                        <i className="fa-solid fa-xmark" />
                      </button>

                      <div className="ntf-card-icon" style={{ background: cfg.color }}>
                        <i className={cfg.icon} />
                      </div>

                      <div className="ntf-card-main">
                        <div className="ntf-card-eyebrow">
                          <span className="ntf-eyebrow-type" style={{ color: cfg.color }}>
                            <i className={cfg.icon} />
                            {cfg.label}
                          </span>
                          <span className="ntf-eyebrow-sep">•</span>
                          <span className="ntf-eyebrow-time">{timeAgo(n.createdAt, now)}</span>
                          {!n.isRead && <span className="ntf-eyebrow-new">New</span>}
                        </div>

                        <div className="ntf-card-title">{n.title}</div>

                        {/* Message expand/collapse — unchanged from before */}
                        <div className={`ntf-message-wrap ${isExpanded ? "expanded" : ""}`}>
                          <div className="ntf-card-message">{n.message}</div>
                          {!isExpanded && isLong && <div className="ntf-message-fade" />}
                          {/* Just a nicely displayed link */}
                          {n.link && n?.action && (
                            <Link
                              to={n.link}
                              className="ntf-card-link"
                              onClick={(e) => {
                                e.stopPropagation();
                                markRead(n._id);
                              }}
                            >
                              <i className="fa-solid fa-link" />
                              {n?.action}
                              <i className="fa-solid fa-arrow-right" />
                            </Link>
                          )}
                        </div>

                        <div className="ntf-card-controls">
                          {isLong && (
                            <button
                              className="ntf-expand-toggle"
                              onClick={(e) => {
                                toggleExpand(n._id, e);
                                markRead(n._id);
                              }}
                            >
                              {isExpanded ? "Show less" : "Show more"}
                              <i className={`fa-solid fa-chevron-down ${isExpanded ? "flipped" : ""}`} />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </main>

      <div className={`ntf-toast ${toastMsg ? "show" : ""}`}>
        <i className="fa-solid fa-circle-check" />
        <span>{toastMsg}</span>
      </div>
    </div>
  );
}
