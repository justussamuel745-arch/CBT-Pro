import { useState, useMemo, useEffect, useContext } from 'react';
import UserContext from '../../context/UserContext';
import AdminContext from './context/AdminContext';
import { fetchWithAuth } from '../../scripts/utilis/fetch';
import { Nav } from './components/Nav';
import './Feedback.css';

const TYPE_META = {
  'General':      { color: '#dc2626', bg: '#fef2f2', label: 'General' },
  'Pricing': { color: '#7c3aed', bg: '#f5f3ff', label: 'Pricing' },
  'Business':       { color: '#d97706', bg: '#fffbeb', label: 'Business' },
  'Technical Issues':         { color: '#0891b2', bg: '#ecfeff', label: 'Technical Issues' },
};

const FILTERS = ['All', 'Unread', 'General', 'Pricing', 'Business', 'Technical Issues'];


// ==================== ICONS ====================
const IC = {
  Menu: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 12h18M3 6h18M3 18h18"/></svg>,
  Close: () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>,
  Search: () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>,
  Trash: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6m5 0V4h4v2"/></svg>,
  Eye: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
  EyeOff: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>,
  Shield: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  Dashboard: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>,
  Users: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  Card: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>,
  Chat: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
  Settings: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06-.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
  Feedback: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z"/><path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/></svg>,
  Warn: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
  Inbox: () => <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/></svg>,
};

// ==================== HELPERS ====================
const AVATAR_COLORS = ['#2563eb','#7c3aed','#db2777','#ea580c','#16a34a','#0891b2'];
const avatarColor = (name) => AVATAR_COLORS[(name?.charCodeAt(0) || 0) % AVATAR_COLORS.length];
const initials = (name) => name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2) || '?';

const fmtDate = (d) => {
  if (!d) return '—';
  const date = new Date(d);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHrs = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHrs / 24);
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHrs < 24) return `${diffHrs}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString('en-NG', { month: 'short', day: 'numeric', year: 'numeric' });
};

const fmtFull = (d) => d ? new Date(d).toLocaleString('en-NG', { dateStyle: 'medium', timeStyle: 'short' }) : '—';

// ==================== COMPONENT ====================
export function Feedback() {
  const { token, setToken } = useContext(UserContext)
  const { items, setItems, stats } = useContext(AdminContext)
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [drawer, setDrawer] = useState(null);
  const [deleteModal, setDeleteModal] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [toast, setToast] = useState(null);

  // Auto-dismiss toast
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2800);
    return () => clearTimeout(t);
  }, [toast]);

  const showToast = (msg) => setToast(msg);


  // Filtered list
  const filtered = useMemo(() => {
    let list = items;
    if (filter === 'Unread') list = list.filter(i => !i.read);
    else if (filter !== 'All') list = list.filter(i => i.type === filter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(i =>
        i.message.toLowerCase().includes(q) ||
        i.user.fullName.toLowerCase().includes(q) ||
        i.type.toLowerCase().includes(q)
      );
    }
    return list;
  }, [items, filter, search]);

  // Actions
  const openDrawer = (item) => {
    setDrawer(item);
    if (!item.read) markRead(item._id);
  };
  const closeDrawer = () => setDrawer(null);
  
  async function changeStatus(id, status){
    try {
      const response = await fetchWithAuth(token, setToken, '/api/feedback/status', {
        method: 'PUT',
        body: JSON.stringify({
          id,
          status
        })
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok){
        throw { status: response.status, error: data?.message || 'Failed'}
      }
      
      setItems(prev => prev.map(i => i._id === id ? {...i, read: status } : i))
      if (drawer?._id === id) setDrawer(d => d ? { ...d, read: status } : d);
      if (!status){
        showToast('Marked as unread');
      }
    } catch (err) {
      console.error('Error:', err);
      alert(`error ${err.status}`)
    }
  }
  
  const markRead = (id) => {
    changeStatus(id, true)
  };

  const markUnread = (id) => {
    changeStatus(id, false)
  };

  const confirmDelete = (item) => setDeleteModal(item);
  const doDelete = async () => {
    if (drawer?._id === deleteModal._id) closeDrawer();
    setDeleteModal(null);
    try {
      const response = await fetchWithAuth(token, setToken, `/api/feedback/${deleteModal._id}`, {
        method: 'DELETE'
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok){
        throw { status: response.status, error: data?.message || 'Failed'}
      }
      
      showToast('Feedback deleted')
      setItems(prev => prev.filter(i => i._id !== deleteModal._id));
    } catch (err) {
      console.error('Error:', err);
      if (!err.status){
        showToast('No network connection');
      } else {
        showToast(err.error)
      }
    }
  };

  const markAllRead = () => {
    //setItems(prev => prev.map(i => ({ ...i, read: true })));
    showToast('under production');
  };
  


  return (
    <div className="fb-shell">
    
      {/* Sidebar */}
      <Nav 
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      {/* Main */}
      <div className="fb-main">
        {/* Topbar */}
        <header className="fb-topbar">
          <button className="fb-menu-toggle" onClick={() => setSidebarOpen(!sidebarOpen)} aria-label="Toggle menu">
            <IC.Menu />
          </button>
          <span className="fb-topbar-title">Feedback</span>
          <div className="fb-search-wrap" style={{ marginLeft: '1rem' }}>
            <IC.Search />
            <input className="fb-search-input" placeholder="Search feedback…" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div className="fb-topbar-right">
            {stats.unread > 0 && (
              <button className="fb-btn fb-btn-ghost fb-btn-sm" onClick={markAllRead}>
                Mark all read
              </button>
            )}
          </div>
        </header>

        {/* Content */}
        <div className="fb-content">
          {/* Stats */}
          <div className="fb-stats">
            <div className="fb-stat">
              <div className="fb-stat-label">Total</div>
              <div className="fb-stat-value">{stats.total}</div>
              <div className="fb-stat-sub">All feedback</div>
            </div>
            <div className="fb-stat">
              <div className="fb-stat-label">Unread</div>
              <div className="fb-stat-value" style={{ color: stats.unread > 0 ? 'var(--c-primary)' : 'inherit' }}>{stats.unread}</div>
              <div className="fb-stat-sub">Need attention</div>
            </div>
            <div className="fb-stat">
              <div className="fb-stat-label">Technical Issues</div>
              <div className="fb-stat-value" style={{ color: '#dc2626' }}>{stats.bugs}</div>
              <div className="fb-stat-sub">Open issues</div>
            </div>
            <div className="fb-stat">
              <div className="fb-stat-label">Business</div>
              <div className="fb-stat-value" style={{ color: '#7c3aed' }}>{stats.requests}</div>
              <div className="fb-stat-sub">Feature asks</div>
            </div>
          </div>

          {/* Filter chips */}
          <div className="fb-filter-bar">
            {FILTERS.map(f => (
              <button key={f} className={`fb-filter-chip ${filter === f ? 'is-active' : ''}`} onClick={() => setFilter(f)}>
                {f}
              </button>
            ))}
          </div>

          {/* Feedback list */}
          <div className="fb-card">
            {filtered.length === 0 ? (
              <div className="fb-empty">
                <IC.Inbox />
                <p>No feedback matches this filter.</p>
              </div>
            ) : (
              <div className="fb-list">
                {filtered.map(item => {
                  const meta = TYPE_META[item.type] || { color: '#6b7280', bg: '#f3f4f6' };
                  return (
                    <div key={item._id} className={`fb-item ${!item.read ? 'is-unread' : ''}`} onClick={() => openDrawer(item)}>
                      {/* Left accent bar */}
                      <div className="fb-item-accent" style={{ background: meta.color }} />

                      {/* Body */}
                      <div className="fb-item-body">
                        <div className="fb-item-meta">
                          {!item.read && <span className="fb-unread-indicator" />}
                          <span className="fb-type-badge" style={{ background: meta.bg, color: meta.color }}>
                            <span className="fb-type-dot" style={{ background: meta.color }} />
                            {item.type}
                          </span>
                          <span className="fb-item-user">{item.user.fullName}</span>
                          <span className="fb-item-email">{item.user.email}</span>
                          <span className="fb-item-time">{fmtDate(item.createdAt)}</span>
                        </div>
                        <div className="fb-item-preview">{item.message}</div>
                      </div>

                      {/* Actions */}
                      <div className="fb-item-actions" onClick={e => e.stopPropagation()}>
                        <button className="fb-btn fb-btn-ghost fb-btn-sm fb-btn-icon" title="View" onClick={() => openDrawer(item)}><IC.Eye /></button>
                        {item.read
                          ? <button className="fb-btn fb-btn-ghost fb-btn-sm fb-btn-icon" title="Mark unread" onClick={() => markUnread(item._id)}><IC.EyeOff /></button>
                          : <button className="fb-btn fb-btn-ghost fb-btn-sm fb-btn-icon" title="Mark read" onClick={() => markRead(item._id)}><IC.Eye /></button>
                        }
                        <button className="fb-btn fb-btn-danger fb-btn-sm fb-btn-icon" title="Delete" onClick={() => confirmDelete(item)}><IC.Trash /></button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ==================== DRAWER ==================== */}
      {drawer && (
        <div className="fb-drawer-mask" onClick={closeDrawer}>
          <div className="fb-drawer" onClick={e => e.stopPropagation()}>
            <div className="fb-drawer-head">
              <h2>Feedback Detail</h2>
              <button className="fb-btn fb-btn-ghost fb-btn-icon fb-btn-sm" onClick={closeDrawer}><IC.Close /></button>
            </div>
            <div className="fb-drawer-body">
              {/* Type badge */}
              <div className="fb-drawer-type">
                {(() => {
                  const meta = TYPE_META[drawer.type] || { color: '#6b7280', bg: '#f3f4f6' };
                  return (
                    <span className="fb-type-badge" style={{ background: meta.bg, color: meta.color, fontSize: '.8rem', padding: '.3rem .75rem' }}>
                      <span className="fb-type-dot" style={{ background: meta.color }} />
                      {drawer.type}
                    </span>
                  );
                })()}
              </div>

              {/* User card */}
              <div className="fb-drawer-user-card">
                <span className="fb-drawer-avatar" style={{ background: avatarColor(drawer.user.fullName) }}>
                  {initials(drawer.user.fullName)}
                </span>
                <div>
                  <div className="fb-drawer-uname">{drawer.user.fullName}</div>
                  <div className="fb-drawer-uemail">{drawer.user.email}</div>
                </div>
              </div>

              {/* Message */}
              <div className="fb-drawer-msg-label">Message</div>
              <div className="fb-drawer-msg">{drawer.message}</div>

              {/* Meta */}
              <div className="fb-drawer-meta">
                <span className="fb-drawer-meta-key">Received</span>
                <span>{fmtFull(drawer.createdAt)}</span>
                <span className="fb-drawer-meta-key">Status</span>
                <span style={{ fontWeight: 600, color: drawer.read ? 'var(--c-success)' : 'var(--c-primary)' }}>
                  {drawer.read ? 'Read' : 'Unread'}
                </span>
              </div>

              {/* Actions */}
              <div className="fb-drawer-actions">
                {drawer.read
                  ? <button className="fb-btn fb-btn-ghost" onClick={() => markUnread(drawer._id)}><IC.EyeOff /> Mark as unread</button>
                  : <button className="fb-btn fb-btn-primary" onClick={() => markRead(drawer._id)}><IC.Eye /> Mark as read</button>
                }
                <button className="fb-btn fb-btn-danger" onClick={() => confirmDelete(drawer)}><IC.Trash /> Delete</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================== DELETE MODAL ==================== */}
      {deleteModal && (
        <div className="fb-modal-mask" onClick={() => setDeleteModal(null)}>
          <div className="fb-modal" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '.625rem', marginBottom: '.75rem', color: 'var(--c-danger)' }}>
              <IC.Warn />
              <div className="fb-modal-title" style={{ margin: 0 }}>Delete Feedback</div>
            </div>
            <div className="fb-modal-sub">
              Permanently delete this feedback from <strong>{deleteModal.user.fullName}</strong>? This cannot be undone.
            </div>
            <div className="fb-modal-footer">
              <button className="fb-btn fb-btn-ghost" onClick={() => setDeleteModal(null)}>Cancel</button>
              <button className="fb-btn fb-btn-danger" onClick={doDelete}><IC.Trash /> Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && <div className="fb-toast">{toast}</div>}
    </div>
  );
}
