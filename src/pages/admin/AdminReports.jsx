import { useState, useEffect, useContext } from 'react';
import './AdminReports.css';
import UserContext from '../../context/UserContext';
import { Nav } from './components/Nav';
import { fetchReports } from './utils/scripts/adminFetch';
import { fetchWithAuth } from '../../scripts/utilis/fetch';

const CATEGORY_LABELS = {
  wrong_answer:   'Wrong answer key',
  typo:           'Typo / spelling',
  unclear:        'Unclear question',
  missing_option: 'Missing option',
  wrong_image:    'Wrong image',
  other:          'Other issue',
};

const STATUS_META = {
  open:      { label: 'Open',      color: '#4f46e5', bg: '#eef2ff', dot: '#4f46e5' },
  reviewing: { label: 'Reviewing', color: '#d97706', bg: '#fffbeb', dot: '#f59e0b' },
  resolved:  { label: 'Resolved',  color: '#16a34a', bg: '#f0fdf4', dot: '#10b981' },
  dismissed: { label: 'Dismissed', color: '#64748b', bg: '#f8fafc', dot: '#94a3b8' },
};

const SUBJECT_COLORS = {
  Mathematics:      { from: '#06b6d4', to: '#0891b2' },
  'English Language': { from: '#4f46e5', to: '#7c3aed' },
  Physics:          { from: '#0ea5e9', to: '#0284c7' },
  Economics:        { from: '#3b82f6', to: '#2563eb' },
  Biology:          { from: '#14b8a6', to: '#0d9488' },
  Chemistry:        { from: '#10b981', to: '#059669' },
  Government:       { from: '#8b5cf6', to: '#6d28d9' },
  default:          { from: '#4f46e5', to: '#06b6d4' },
};

// ─────────────────────────────────────────────────────────────
// ICONS
// ─────────────────────────────────────────────────────────────
const Ic = {
  Flag:    () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>,
  Search:  () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>,
  X:       () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>,
  Check:   () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>,
  Eye:     () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
  Trash:   () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6m5 0V4h4v2"/></svg>,
  User:    () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  Hash:    () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="4" y1="9" x2="20" y2="9"/><line x1="4" y1="15" x2="20" y2="15"/><line x1="10" y1="3" x2="8" y2="21"/><line x1="16" y1="3" x2="14" y2="21"/></svg>,
  Image:   () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>,
  Clock:   () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  Note:    () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>,
  Warn:    () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
  Inbox:   () => <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/></svg>,
  Open:    () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>,
  Menu:    () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 12h18M3 6h18M3 18h18" /></svg>
};

// ─────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────
function fmtDate(d) {
  if (!d) return '—';
  const date = new Date(d);
  const now  = new Date();
  const diff = Math.floor((now - date) / 60000);
  if (diff < 60)   return `${diff}m ago`;
  if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
  return date.toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' });
}

function fmtDateFull(d) {
  if (!d) return '—';
  return new Date(d).toLocaleString('en-NG', { dateStyle: 'medium', timeStyle: 'short' });
}

function initials(name) {
  return name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';
}

function subjectColor(subject) {
  return SUBJECT_COLORS[subject] || SUBJECT_COLORS.default;
}

const FILTERS = ['all', 'open', 'reviewing', 'resolved', 'dismissed'];

// ─────────────────────────────────────────────────────────────
// DETAIL DRAWER
// ─────────────────────────────────────────────────────────────
function ReportDrawer({ report, onClose, onStatusChange, onDelete }) {
  const [adminNote, setAdminNote] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const col = subjectColor(report.subject);
  const statusMeta = STATUS_META[report.status];


  function handleStatusChange(newStatus) {
    console.log(report._id, newStatus);
    
    onStatusChange(report._id, newStatus);
  }

  return (
    <>
      <div className="arq-drawer-mask" onClick={onClose}>
        <div className="arq-drawer" onClick={e => e.stopPropagation()}>

          {/* Header */}
          <div className="arq-drawer-head">
            <div className="arq-drawer-head-top">
              <div>
                <div className="arq-drawer-head-title">Report details</div>
                <div className="arq-drawer-head-sub">ID: {report._id}</div>
              </div>
              <button className="arq-drawer-close" onClick={onClose}><Ic.X /></button>
            </div>
            <div className="arq-drawer-meta">
              <span
                className="arq-status"
                style={{ background: statusMeta.bg, color: statusMeta.color }}
              >
                <span className="arq-status-dot" style={{ background: statusMeta.dot }} />
                {statusMeta.label}
              </span>
              <span className="arq-drawer-chip primary">
                <Ic.Hash /> {report.questionId}
              </span>
              <span className="arq-drawer-chip">
                {report.subject}
              </span>
              <span className="arq-drawer-chip">
                <Ic.Clock /> {fmtDate(report.createdAt)}
              </span>
            </div>
          </div>

          {/* Body */}
          <div className="arq-drawer-body">

            {/* Reporter */}
            <div className="arq-drawer-section-label">Reporter</div>
            <div className="arq-drawer-user-card">
              <div className="arq-drawer-user-avatar">{initials(report.user.name)}</div>
              <div>
                <div className="arq-drawer-user-name">{report.user.name}</div>
                <div className="arq-drawer-user-email">{report.user.email}</div>
              </div>
            </div>

            {/* Categories */}
            <div className="arq-drawer-section-label">Issue types</div>
            <div className="arq-drawer-cats">
              {report.categories.length > 0
                ? report.categories.map(c => (
                    <span key={c} className="arq-drawer-cat">
                      <Ic.Check /> {CATEGORY_LABELS[c] || c}
                    </span>
                  ))
                : <span style={{ fontSize: '0.82rem', color: '#94a3b8' }}>No category selected</span>
              }
            </div>

            {/* Message */}
            <div className="arq-drawer-section-label">User&apos;s description</div>
            {report.message
              ? <div className="arq-drawer-message">{report.message}</div>
              : <div className="arq-drawer-no-message">No description provided</div>
            }

            {/* Info grid */}
            <div className="arq-drawer-section-label">Question details</div>
            <div className="arq-drawer-info-grid">
              <span className="arq-drawer-info-key">Question ID</span>
              <span className="arq-drawer-info-val" style={{ fontFamily: 'monospace', fontSize: '0.82rem' }}>{report.questionId}</span>
              <span className="arq-drawer-info-key">Subject</span>
              <span className="arq-drawer-info-val">{report.subject}</span>
              <span className="arq-drawer-info-key">Exam</span>
              <span className="arq-drawer-info-val">{report.examType}</span>
              <span className="arq-drawer-info-key">Submitted</span>
              <span className="arq-drawer-info-val">{fmtDateFull(report.createdAt)}</span>
            </div>

            {/* Admin note */}
            <div className="arq-drawer-section-label">Admin note</div>
            <div className="arq-drawer-note-wrap">
              <textarea
                className="arq-drawer-note"
                placeholder="Add an internal note about this report — visible only to admins…"
                value={adminNote}
                onChange={e => setAdminNote(e.target.value)}
                rows={3}
              />
            </div>

          </div>

          {/* Footer actions */}
          <div className="arq-drawer-footer">
            {report.status !== 'resolved' && (
              <button className="arq-btn arq-btn-success" onClick={() => handleStatusChange('resolved')}>
                <Ic.Check /> Mark resolved
              </button>
            )}
            {report.status !== 'reviewing' && report.status !== 'resolved' && (
              <button className="arq-btn arq-btn-warning" onClick={() => handleStatusChange('reviewing')}>
                <Ic.Eye /> Mark reviewing
              </button>
            )}
            {report.status !== 'dismissed' && (
              <button className="arq-btn arq-btn-ghost" onClick={() => handleStatusChange('dismissed')}>
                Dismiss
              </button>
            )}
            {report.status === 'dismissed' && (
              <button className="arq-btn arq-btn-ghost" onClick={() => handleStatusChange('open')}>
                Reopen
              </button>
            )}
            <button
              className="arq-btn arq-btn-danger"
              style={{ marginLeft: 'auto' }}
              onClick={() => setConfirmDelete(true)}
            >
              <Ic.Trash /> Delete
            </button>
          </div>
        </div>
      </div>

      {/* Delete confirm modal */}
      {confirmDelete && (
        <div className="arq-confirm-overlay" onClick={() => setConfirmDelete(false)}>
          <div className="arq-confirm-modal" onClick={e => e.stopPropagation()}>
            <div className="arq-confirm-stripe" />
            <div className="arq-confirm-body">
              <div className="arq-confirm-icon"><Ic.Warn /></div>
              <div className="arq-confirm-title">Delete this report?</div>
              <div className="arq-confirm-desc">
                This will permanently remove the report from <strong>{report.user.name}</strong>. This action cannot be undone.
              </div>
              <div className="arq-confirm-actions">
                <button className="arq-btn arq-btn-ghost" style={{ flex: 1 }} onClick={() => setConfirmDelete(false)}>
                  Cancel
                </button>
                <button className="arq-btn arq-btn-danger" style={{ flex: 2 }} onClick={() => { onDelete(report._id); setConfirmDelete(false); }}>
                  <Ic.Trash /> Yes, delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ─────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────
export function AdminReports() {
  const { token, setToken } = useContext(UserContext);
  const [reports, setReports]     = useState([]);
  const [filter, setFilter]       = useState('all');
  const [search, setSearch]       = useState('');
  const [sort, setSort]           = useState('newest');
  const [selected, setSelected]   = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Close drawer on Escape
  useEffect(() => {
    fetchReports(token, setToken, setReports)
    
    function onKey(e) { if (e.key === 'Escape') setSelected(null); }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [token, setToken]);

  // ── Derived data ──
  const counts = {
    all:       reports.length,
    open:      reports.filter(r => r.status === 'open').length,
    reviewing: reports.filter(r => r.status === 'reviewing').length,
    resolved:  reports.filter(r => r.status === 'resolved').length,
    dismissed: reports.filter(r => r.status === 'dismissed').length,
  };

  const filtered = reports
    .filter(r => {
      if (filter !== 'all' && r.status !== filter) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        return (
          r.subject.toLowerCase().includes(q) ||
          r.user.name.toLowerCase().includes(q) ||
          r.user.email.toLowerCase().includes(q) ||
          r.questionId.toLowerCase().includes(q) ||
          r.message.toLowerCase().includes(q)
        );
      }
      return true;
    })
    .sort((a, b) => {
      if (sort === 'newest') return new Date(b.createdAt) - new Date(a.createdAt);
      if (sort === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt);
      if (sort === 'subject') return a.subject.localeCompare(b.subject);
      return 0;
    });

  async function handleStatusChange(id, newStatus) {
    try {
      const response = await fetchWithAuth(token, setToken, `/api/reports/${id}/${newStatus}`, {
        method: 'PUT'
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok){
        throw { status: response.status, error: data?.error || data?.message || 'Failed to change status'}
      }
      setReports(prev => prev.map(r => r._id === id ? { ...r, status: newStatus } : r));
      if (selected?._id === id) setSelected(r => ({ ...r, status: newStatus }));
    } catch (err) {
      console.log(err);
    }
  }

  async function handleDelete(id) {
    try {
      const response = await fetchWithAuth(token, setToken, `/api/reports/${id}`, {
        method: 'DELETE'
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok){
        throw { status: response.status, error: data?.error || data?.message || 'Failed to delete report'}
      }
      setReports(prev => prev.filter(r => r._id !== id));
      if (selected?._id === id) setSelected(null);
    } catch (err) {
      console.log(err);
    }
  }

  return (
    <div className="arq-page">
      <title>Reports | CBT Pro Admin</title>
      
       {/* Side bar */}
      <Nav 
        sidebarOpen={sidebarOpen} 
        setSidebarOpen={setSidebarOpen}
      />

      {/* Nav */}
      <nav>
        <div className="nav-container">
          <div className="nav-content">
            <span className="arq-menu" onClick={() => setSidebarOpen(prev => !prev)}>
              <Ic.Menu />
            </span>
          </div>
        </div>
      </nav>

      {/* Page header */}
      <div className="page-header">
        <div className="nav-container">
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', margin: 0 }}>
            Question Reports
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.375rem' }}>
            Review and manage complaints submitted by students during exams
          </p>
        </div>
      </div>

      <div className="arq-container">

        {/* ── STAT CARDS ── */}
        <div className="arq-stats">
          <div className="arq-stat">
            <div className="arq-stat-icon" style={{ background: '#eef2ff', color: '#4f46e5' }}><Ic.Flag /></div>
            <div className="arq-stat-body">
              <div className="arq-stat-value">{counts.all}</div>
              <div className="arq-stat-label">Total reports</div>
            </div>
          </div>
          <div className="arq-stat">
            <div className="arq-stat-icon" style={{ background: '#eef2ff', color: '#4f46e5' }}><Ic.Open /></div>
            <div className="arq-stat-body">
              <div className="arq-stat-value" style={{ color: '#4f46e5' }}>{counts.open}</div>
              <div className="arq-stat-label">Open</div>
            </div>
          </div>
          <div className="arq-stat">
            <div className="arq-stat-icon" style={{ background: '#fffbeb', color: '#d97706' }}><Ic.Eye /></div>
            <div className="arq-stat-body">
              <div className="arq-stat-value" style={{ color: '#d97706' }}>{counts.reviewing}</div>
              <div className="arq-stat-label">Reviewing</div>
            </div>
          </div>
          <div className="arq-stat">
            <div className="arq-stat-icon" style={{ background: '#f0fdf4', color: '#16a34a' }}><Ic.Check /></div>
            <div className="arq-stat-body">
              <div className="arq-stat-value" style={{ color: '#16a34a' }}>{counts.resolved}</div>
              <div className="arq-stat-label">Resolved</div>
            </div>
          </div>
        </div>

        {/* ── CONTROLS ── */}
        <div className="arq-controls">
          <div className="arq-search-wrap">
            <Ic.Search />
            <input
              className="arq-search"
              placeholder="Search by subject, user, question ID…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <div className="arq-filter-tabs">
            {FILTERS.map(f => (
              <button
                key={f}
                className={`arq-filter-tab ${filter === f ? 'active' : ''}`}
                onClick={() => setFilter(f)}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
                <span className="arq-filter-count">{counts[f]}</span>
              </button>
            ))}
          </div>

          <select className="arq-sort" value={sort} onChange={e => setSort(e.target.value)}>
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="subject">By subject</option>
          </select>
        </div>

        {/* ── TABLE ── */}
        <div className="arq-table-card">
          <div className="arq-table-wrap">
            <table className="arq-table">
              <thead>
                <tr>
                  <th>Subject · Question</th>
                  <th>Reporter</th>
                  <th>Issue type(s)</th>
                  <th>Description</th>
                  <th>Status</th>
                  <th>Submitted</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7}>
                      <div className="arq-empty">
                        <div className="arq-empty-icon"><Ic.Inbox /></div>
                        <h3>No reports found</h3>
                        <p>{search ? 'Try a different search term.' : 'No reports match this filter.'}</p>
                      </div>
                    </td>
                  </tr>
                ) : filtered.map(r => {
                  const col      = subjectColor(r.subject);
                  const sMeta    = STATUS_META[r.status];
                  const isActive = selected?._id === r._id;
                  return (
                    <tr
                      key={r._id}
                      className={isActive ? 'arq-row-selected' : ''}
                      onClick={() => setSelected(r)}
                    >
                      {/* Subject */}
                      <td>
                        <div className="arq-subject-cell">
                          <div
                            className="arq-subject-dot"
                            style={{ background: `linear-gradient(135deg, ${col.from}, ${col.to})` }}
                          >
                            {r.subject.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="arq-subject-name">{r.subject}</div>
                          </div>
                        </div>
                      </td>

                      {/* Reporter */}
                      <td>
                        <div className="arq-user-cell">
                          <div className="arq-user-avatar">{initials(r.user.name)}</div>
                          <div className="arq-user-name">{r.user.name}</div>
                        </div>
                      </td>

                      {/* Categories */}
                      <td>
                        <div className="arq-cats-cell">
                          {r.categories.length > 0
                            ? r.categories.map(c => (
                                <span key={c} className="arq-cat-chip">{CATEGORY_LABELS[c]}</span>
                              ))
                            : <span className="arq-cat-chip" style={{ color: '#cbd5e1' }}>—</span>
                          }
                        </div>
                      </td>

                      {/* Preview */}
                      <td>
                        {r.message
                          ? <div className="arq-preview">{r.message}</div>
                          : <div className="arq-preview-empty">No description</div>
                        }
                      </td>

                      {/* Status */}
                      <td>
                        <span className="arq-status" style={{ background: sMeta.bg, color: sMeta.color }}>
                          <span className="arq-status-dot" style={{ background: sMeta.dot }} />
                          {sMeta.label}
                        </span>
                      </td>

                      {/* Date */}
                      <td>
                        <div className="arq-date">{fmtDate(r.createdAt)}</div>
                      </td>

                      {/* Actions */}
                      <td onClick={e => e.stopPropagation()}>
                        <div className="arq-actions-cell">
                          <button className="arq-icon-btn" title="View details" onClick={() => setSelected(r)}>
                            <Ic.Eye />
                          </button>
                          {r.status !== 'resolved' && (
                            <button className="arq-icon-btn success" title="Mark resolved" onClick={() => handleStatusChange(r._id, 'resolved')}>
                              <Ic.Check />
                            </button>
                          )}
                          <button className="arq-icon-btn danger" title="Delete" onClick={() => handleDelete(r._id)}>
                            <Ic.Trash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* ── DETAIL DRAWER ── */}
      {selected && (
        <ReportDrawer
          report={selected}
          onClose={() => setSelected(null)}
          onStatusChange={handleStatusChange}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}
