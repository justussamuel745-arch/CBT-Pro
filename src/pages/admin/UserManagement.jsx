import { useState, useEffect, useMemo, useContext } from 'react';
import UserContext from '../../context/UserContext';
import AdminContext from './context/AdminContext';
import { fetchWithAuth } from '../../scripts/utilis/fetch';
import { url } from '../../scripts/utilis/url';
import { ModalStripe, ToastProvider, useToast, CSS } from '../../components/NotificationSystem';
import { Nav } from './components/Nav';
import './UserManagement.css';

// ==================== HELPERS ====================
const ROLE_COLORS = {
  User: { bg: '#f3f4f6', text: '#374151' },
  Verified: { bg: '#dcfce7', text: '#15803d' },
  Admin: { bg: '#ede9fe', text: '#6d28d9' },
  Editor: { bg: '#dbeafe', text: '#1d4ed8' },
};

const AVATAR_COLORS = ['#2563eb', '#7c3aed', '#db2777', '#ea580c', '#16a34a', '#0891b2'];
const avatarColor = (name) => AVATAR_COLORS[(name.charCodeAt(0) || 0) % AVATAR_COLORS.length];
const initials = (name) => name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
const fmt = (d) => d ? new Date(d).toLocaleDateString('en-NG', { year: 'numeric', month: 'short', day: 'numeric' }) : '—';

// Icons
const IconSearch = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>;
const IconMenu = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 12h18M3 6h18M3 18h18" /></svg>;
const IconClose = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12" /></svg>;
const IconPlus = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>;
const IconEye = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>;
const IconShield = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>;
const IconPause = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" /></svg>;
const IconPlay = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polygon points="5 3 19 12 5 21 5 3" /></svg>;
const IconTrash = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6m5 0V4h4v2" /></svg>;
const IconEdit = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>;
const IconWarn = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>;

// ==================== COMPONENT ====================
function UserManagementInner() {
  const { token, setToken } = useContext(UserContext)
  const { users, setUsers, payments } = useContext(AdminContext)
  const [search, setSearch] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [drawer, setDrawer] = useState(null);
  const [drawerTab, setDrawerTab] = useState('profile');

  const [roleModal, setRoleModal] = useState(null);
  const [tempRoles, setTempRoles] = useState({});
  const [deleteModal, setDeleteModal] = useState(null);
  const [targetModal, setTargetModal] = useState(null);
  const [tempTarget, setTempTarget] = useState('');
  const [creditModal, setCreditModal] = useState(null);
  const [tempCredits, setTempCredits] = useState(0);
  
  const [deleteBtn, setDeleteBtn] = useState(null)

  const toast = useToast()
  
  /* Notification modal */
  const [modal, setModal] = useState(null);
  const closeModal = () => setModal(null);

  /*===== Render Notification Style ======*/
  useEffect(() => {
    const el = document.createElement("style");
    el.id = "__ns_styles";
    el.textContent = CSS[0];
    document.head.appendChild(el);
    return () => document.getElementById("__ns_styles")?.remove();
  }, []);


  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return users;
    return users.filter(u => u.fullName.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.phoneNumber.includes(q));
  }, [users, search]);

  const userPayments = (id) => payments.filter(p => p.user === id);

  const openDrawer = (user) => { setDrawer(user); setDrawerTab('profile'); };
  const closeDrawer = () => setDrawer(null);

  const openRoleModal = (user) => { setRoleModal(user); setTempRoles({ ...user.roles }); };
  const toggleRole = (key) => {
    if (key === 'User' || key === 'Verified') return;
    setTempRoles(prev => {
      const next = { ...prev };
      if (next[key]) delete next[key];
      else next[key] = key === 'Admin' ? 5150 : 2008;
      return next;
    });
  };

  const saveRoles = async () => {
    const fixedRoles = ['Verified', 'User']
    const filterRoles = Object.keys(tempRoles).filter(role => !fixedRoles.includes(role))
    const newRoles = filterRoles.length === 0
      ? [""]
      : filterRoles
      
    if (drawer?._id === roleModal._id) setDrawer(u => ({ ...u, roles: tempRoles }));
    setRoleModal(null);
    try {
      const response = await fetchWithAuth(token, setToken, `/api/users/${roleModal._id}`, {
        method: 'PUT',
        body: JSON.stringify({
          roles: newRoles
        })
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) {
        throw { status: response.status, error: data.message || data.error || 'Failed to update User role' }
      }
      setUsers(prev => prev.map(u => u._id === roleModal._id ? data : u));
      toast.push({
        variant: 'pill',
        type: 'success',
        message: 'User role has been successfully updated.',
      });

    } catch (err) {
      console.error('Error:', err);
      toast.push({
        variant: 'pill',
        type: 'error',
        message: 'Failed to update role.',
      });
    }
  };

  const toggleActive = async (user) => {
    const flipStatus = !user.isActivated
    try {
      const response = await fetchWithAuth(token, setToken, `/api/users/subscription/${user._id}`, {
        method: 'PUT',
        body: JSON.stringify({
          subscription: flipStatus
        })
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) {
        throw {
          status: response.status,
          error: data.message || data.error || 'Failed to update user subscription'
        }
      }
      toast.push({
        variant: 'pill',
        type: 'success',
        message: 'Account status has been changed.',
      });
      
      setUsers(prev => prev.map(u => u._id === user._id ? data.result : u))
    } catch (err) {
      if (!err.status){
        toast.push({
          variant: 'pill',
          type: 'error',
          message: 'No internet connection.',
        });
      } else if (err.status >= 500){
        toast.push({
          variant: 'pill',
          type: 'error',
          message: 'Server Error',
        });
      } else {
        toast.push({
          variant: 'pill',
          type: 'error',
          message: err.error,
        });
      }
      
    }

    if (drawer?._id === user._id) setDrawer(u => ({ ...u, isActivated: !u.isActivated }));
  };

  const confirmDelete = (user) => setDeleteModal(user);
  
  const doDelete = async () => {
    if (!navigator.onLine){
      toast.push({
        variant: 'pill',
        type: 'error',
        message: 'No internet connection.',
      });
      return
    }
    setDeleteBtn('disabled')
    try {
      const response = await fetchWithAuth(token, setToken, `/api/users/${deleteModal._id}`, {
        method: 'DELETE'
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) {
        throw { status: response.status, error: data?.message || data?.error || 'Failed to delete user' }
      }
      setUsers(prev => prev.filter(u => u._id !== deleteModal._id))
      if (drawer?._id === deleteModal._id) closeDrawer();
      setDeleteModal(null);
      setDeleteBtn(null)
      toast.push({
        variant: 'pill',
        type: 'success',
        message: 'User Account has been deleted'
      });
    } catch (err) {
      console.error('Error:', err);
      toast.push({
        variant: 'pill',
        type: 'error',
        message: 'Couldn\'t delete user. Something went wrong.',
      });
    }

  };

  const openTargetModal = (user) => { setTargetModal(user); setTempTarget(user.targetScore || ''); };
  const saveTarget = () => {
    toast.push({
      variant: 'pill',
      type: 'info',
      message: 'Can\'t edit user target score.',
    });
    setTargetModal(null)
    /*
    setUsers(prev => prev.map(u => u._id === targetModal._id ? { ...u, targetScore: tempTarget } : u));
    if (drawer?._id === targetModal._id) setDrawer(u => ({ ...u, targetScore: tempTarget }));
    setTargetModal(null);
    */
  };

  const openCreditModal = (user) => { setCreditModal(user); setTempCredits(user.aiCredits ?? 0); };
  const saveCredits = async () => {
    const val = Number(tempCredits) || 0;
    setCreditModal(null);
    if (drawer?._id === creditModal._id) setDrawer(u => ({ ...u, aiCredits: val }));
    try {
      const response = await fetchWithAuth(token, setToken, `/api/users/credits/${creditModal._id}`, {
        method: 'PUT',
        body: JSON.stringify({
          value: val
        })
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) {
        throw { status: response.status, error: data?.message || data?.error || 'Failed to Update' }
      }
      toast.push({
        variant: 'pill',
        type: 'success',
        message: 'Update successful.',
      });
      setUsers(prev => prev.map(u => u._id === creditModal._id ? { ...u, aiCredits: val } : u));
    } catch (err) {
      if (!err.status){
        toast.push({
          variant: 'pill',
          type: 'error',
          message: 'No internet connection.',
        });
      } else if (err.status >= 500){
        toast.push({
          variant: 'pill',
          type: 'error',
          message: 'Server Error',
        });
      } else {
        toast.push({
          variant: 'pill',
          type: 'error',
          message: err.error,
        });
      }
    }
    
  };

  const Avatar = ({ user, size = 34, className = 'a-avatar' }) => (
    user.profilePic
      ? <img className={className} src={`${url}${user.profilePic}`} alt={user.fullName} style={{ width: size, height: size }} />
      : <span className={className} style={{ width: size, height: size, background: avatarColor(user.fullName), fontSize: size * .35 }}>{initials(user.fullName)}</span>
  );


  return (
    <div className="a-shell">

      {/* Side bar */}
      <Nav 
        sidebarOpen={sidebarOpen} 
        setSidebarOpen={setSidebarOpen}
      />

      <div className="a-main">
        <header className="a-topbar">
          <button className="a-menu-toggle" onClick={() => setSidebarOpen(!sidebarOpen)} aria-label="Toggle menu"><IconMenu /></button>
          <div className="a-search-wrap">
            <IconSearch />
            <input className="a-search-input" placeholder="Search users…" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div className="a-topbar-right">
            <button className="a-btn a-btn-primary" onClick={() => alert('Add user — coming soon')}><IconPlus /> <span>Add User</span></button>
          </div>
        </header>

        <div className="a-content">
          <div className="a-section-header">
            <div>
              <div className="a-section-title">Users</div>
              <div className="a-section-meta">{filtered.length} of {users.length} users</div>
            </div>
          </div>

          <div className="a-card">
            <div className="a-table-wrap">
              <table className="a-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Phone</th>
                    <th>Roles</th>
                    <th>Status</th>
                    <th>Credits</th>
                    <th>Joined</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr><td colSpan="7">
                      <div className="a-empty"><svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg><p>No users match your search.</p></div>
                    </td></tr>
                  ) : filtered.map(user => (
                    <tr key={user._id} onClick={() => openDrawer(user)}>
                      <td data-label="User">
                        <div className="a-user-cell">
                          <Avatar user={user} />
                          <div>
                            <div className="a-user-name">{user.fullName}</div>
                            <div className="a-user-email">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td data-label="Phone" style={{ color: 'var(--c-muted)', fontSize: '.85rem' }}>{user.phoneNumber}</td>
                      <td data-label="Roles">
                        {Object.keys(user.roles).map(r => (
                          <span key={r} className="badge" style={{ background: ROLE_COLORS[r]?.bg, color: ROLE_COLORS[r]?.text }}>{r}</span>
                        ))}
                      </td>
                      <td data-label="Status">
                        <span className={`status-pill ${user.isActivated ? 'status-active' : 'status-inactive'}`}>
                          <span className={`status-dot ${user.isActivated ? 'active' : 'inactive'}`} />
                          {user.isActivated ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td data-label="Credits" style={{ fontWeight: 600 }}>{user.aiCredits ?? 0}</td>
                      <td data-label="Joined" style={{ color: 'var(--c-muted)', fontSize: '.82rem', whiteSpace: 'nowrap' }}>{fmt(user.createdAt)}</td>
                      <td data-label="Actions" onClick={e => e.stopPropagation()}>
                        <div className="a-actions">
                          <button className="a-btn a-btn-ghost a-btn-sm a-btn-icon" title="View" onClick={() => openDrawer(user)}><IconEye /></button>
                          <button className="a-btn a-btn-ghost a-btn-sm a-btn-icon" title="Edit Roles" onClick={() => openRoleModal(user)}><IconShield /></button>
                          <button className="a-btn a-btn-ghost a-btn-sm a-btn-icon" title={user.isActivated ? 'Deactivate' : 'Activate'} onClick={() => setModal([user, 'activate_user'])}>
                            {user.isActivated ? <IconPause /> : <IconPlay />}
                          </button>
                          <button className="a-btn a-btn-danger a-btn-sm a-btn-icon" title="Delete" onClick={() => confirmDelete(user)}><IconTrash /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {drawer && (
        <div className="a-drawer-mask" onClick={closeDrawer}>
          <div className="a-drawer" onClick={e => e.stopPropagation()}>
            <div className="a-drawer-top">
              <div className="a-drawer-head">
                <h2>User Details</h2>
                <button className="a-btn a-btn-ghost a-btn-icon a-btn-sm" onClick={closeDrawer}><IconClose /></button>
              </div>
              <div className="a-drawer-avatar-wrap">
                <span className="a-drawer-avatar-lg" style={{ background: avatarColor(drawer.fullName) }}>{initials(drawer.fullName)}</span>
                <div>
                  <div className="a-drawer-name">{drawer.fullName}</div>
                  <div className="a-drawer-sub">{drawer.email}</div>
                </div>
              </div>
              <div className="a-tabs">
                {['profile', 'payments', 'exams', 'chat'].map(t => (
                  <div key={t} className={`a-tab ${drawerTab === t ? 'is-active' : ''}`} onClick={() => setDrawerTab(t)}>{t.charAt(0).toUpperCase() + t.slice(1)}</div>
                ))}
              </div>
            </div>

            <div className="a-drawer-body">
              {drawerTab === 'profile' && (
                <>
                  <div className="a-info-grid">
                    <span className="a-info-key">Phone</span>
                    <span className="a-info-val">{drawer.phoneNumber}</span>
                    <span className="a-info-key">Status</span>
                    <span className="a-info-val">
                      <span className={`status-pill ${drawer.isActivated ? 'status-active' : 'status-inactive'}`}>
                        <span className={`status-dot ${drawer.isActivated ? 'active' : 'inactive'}`} />
                        {drawer.isActivated ? 'Active' : 'Inactive'}
                      </span>
                    </span>
                    <span className="a-info-key">Activated</span>
                    <span className="a-info-val">{fmt(drawer.activatedAt)}</span>
                    <span className="a-info-key">Expires</span>
                    <span className="a-info-val">{fmt(drawer.expiresAt)}</span>
                    <span className="a-info-key">Target Score</span>
                    <span className="a-info-val">
                      {drawer.targetScore || '—'}
                      <button className="a-btn a-btn-ghost a-btn-sm" onClick={() => openTargetModal(drawer)}><IconEdit /> Edit</button>
                    </span>
                    <span className="a-info-key">AI Credits</span>
                    <span className="a-info-val">
                      <strong>{drawer.aiCredits ?? 0}</strong>
                      <button className="a-btn a-btn-ghost a-btn-sm" onClick={() => openCreditModal(drawer)}><IconEdit /> Edit</button>
                    </span>
                    <span className="a-info-key">Roles</span>
                    <span className="a-info-val">
                      {Object.keys(drawer.roles).map(r => (
                        <span key={r} className="badge" style={{ background: ROLE_COLORS[r]?.bg, color: ROLE_COLORS[r]?.text }}>{r}</span>
                      ))}
                      <button className="a-btn a-btn-ghost a-btn-sm" onClick={() => openRoleModal(drawer)}><IconEdit /> Edit</button>
                    </span>
                    <span className="a-info-key">Member Since</span>
                    <span className="a-info-val">{fmt(drawer.createdAt)}</span>
                  </div>
                  <div className="a-divider" />
                  <div className="a-drawer-actions">
                    <button className="a-btn a-btn-ghost" onClick={() => setModal([drawer, 'activate_user'])}>
                      {drawer.isActivated ? <><IconPause /> Deactivate</> : <><IconPlay /> Activate</>}
                    </button>
                    <button className="a-btn a-btn-danger" onClick={() => confirmDelete(drawer)}><IconTrash /> Delete User</button>
                  </div>
                </>
              )}

              {drawerTab === 'payments' && (
                <>
                  {userPayments(drawer._id).length === 0
                    ? <div className="a-empty"><p>No payment records found.</p></div>
                    : (
                      <div className="a-mini-table-wrap">
                        <table className="a-mini-table">
                          <thead><tr><th>Amount</th><th>Status</th><th>Date</th></tr></thead>
                          <tbody>
                            {userPayments(drawer._id).map(p => (
                              <tr key={p._id}>
                                <td data-label="Reference"><strong>{p.reference.length > 25 ? `${p.reference.slice(0, 25)}...` : p.reference}</strong></td>
                                <td data-label="Amount"><strong>₦{p.amount.toLocaleString()}</strong></td>
                                <td data-label="Status"><span style={{ color: p.status === 'success' ? 'var(--c-success)' : 'var(--c-warning)', fontWeight: 600, textTransform: 'capitalize' }}>{p.status}</span></td>
                                <td data-label="Date" style={{ color: 'var(--c-muted)' }}>{fmt(p.createdAt)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                </>
              )}

              {drawerTab === 'exams' && (
                <>
                  {!drawer.examHistory?.length
                    ? <div className="a-empty"><p>No exam history yet.</p></div>
                    : (
                      <div className="a-mini-table-wrap">
                        <table className="a-mini-table">
                          <thead><tr><th>Subject(s)</th><th>Score</th><th>Time</th><th>Date</th></tr></thead>
                          <tbody>
                            {drawer.examHistory.map((e, i) => (
                              <tr key={e._id || i}>
                                <td data-label="Subject(s)">{e.subjects?.join(', ')}</td>
                                <td data-label="Score"><strong>{e.score}/{e.total}</strong> <span style={{ color: 'var(--c-muted)', fontSize: '.75rem' }}>({Math.round((e.score / e.total) * 100)}%)</span></td>
                                <td data-label="Time" style={{ color: 'var(--c-muted)' }}>{e.timeSpent}m</td>
                                <td data-label="Date" style={{ color: 'var(--c-muted)', whiteSpace: 'nowrap' }}>{fmt(e.createdAt)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                </>
              )}

              {drawerTab === 'chat' && (
                <>
                  <p style={{ fontSize: '.8rem', color: 'var(--c-muted)', marginBottom: '.75rem' }}>{drawer.aiChatHistory?.length || 0} messages</p>
                  {!drawer.aiChatHistory?.length
                    ? <div className="a-empty"><p>No chat history.</p></div>
                    : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '.625rem' }}>
                        {drawer.aiChatHistory.map((msg, i) => (
                          <div key={i} style={{ borderLeft: `3px solid ${msg.role === 'user' ? 'var(--c-primary)' : 'var(--c-success)'}`, padding: '.5rem .625rem', borderRadius: '0 6px 6px 0', background: 'var(--c-bg)' }}>
                            <div style={{ fontSize: '.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: '.25rem', color: 'var(--c-muted)' }}>{msg.role}</div>
                            <div style={{ fontSize: '.825rem', lineHeight: 1.5 }}>{msg.parts?.[0]?.text?.slice(0, 200)}{msg.parts?.[0]?.text?.length > 200 ? '…' : ''}</div>
                          </div>
                        ))}
                      </div>
                    )}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ==================== MODALS ==================== */}
      {roleModal && (
        <div className="a-modal-mask" onClick={() => setRoleModal(null)}>
          <div className="a-modal" onClick={e => e.stopPropagation()}>
            <div className="a-modal-title">Edit Roles</div>
            <div className="a-modal-sub">{roleModal.fullName} · User and Verified roles are permanent.</div>
            <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '.5rem', fontSize: '.875rem', fontWeight: 500, cursor: 'pointer' }}>
                <input type="checkbox" checked={!!tempRoles.Admin} onChange={() => toggleRole('Admin')} style={{ width: 16, height: 16, accentColor: 'var(--c-primary)' }} />
                Admin
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '.5rem', fontSize: '.875rem', fontWeight: 500, cursor: 'pointer' }}>
                <input type="checkbox" checked={!!tempRoles.Editor} onChange={() => toggleRole('Editor')} style={{ width: 16, height: 16, accentColor: 'var(--c-primary)' }} />
                Editor
              </label>
            </div>
            <div className="a-modal-footer">
              <button className="a-btn a-btn-ghost" onClick={() => setRoleModal(null)}>Cancel</button>
              <button className="a-btn a-btn-primary" onClick={saveRoles}>Save Roles</button>
            </div>
          </div>
        </div>
      )}

      {deleteModal && (
        <div className="a-modal-mask" onClick={() => setDeleteModal(null)}>
          <div className="a-modal" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '.625rem', marginBottom: '.75rem', color: 'var(--c-danger)' }}>
              <IconWarn />
              <div className="a-modal-title" style={{ margin: 0 }}>Delete User</div>
            </div>
            <div className="a-modal-sub">Permanently delete <strong>{deleteModal.fullName}</strong>? This action cannot be undone.</div>
            <div className="a-modal-footer">
              <button className="a-btn a-btn-ghost" onClick={() => setDeleteModal(null)}>Cancel</button>
              <button className="a-btn a-btn-danger" disabled={deleteBtn} onClick={doDelete}><IconTrash /> Delete</button>
            </div>
          </div>
        </div>
      )}

      {targetModal && (
        <div className="a-modal-mask" onClick={() => setTargetModal(null)}>
          <div className="a-modal" onClick={e => e.stopPropagation()}>
            <div className="a-modal-title">Edit Target Score</div>
            <div className="a-modal-sub">{targetModal.fullName}</div>
            <div className="a-form-field">
              <label className="a-form-label">Target Score</label>
              <input className="a-form-input" type="text" value={tempTarget} onChange={e => setTempTarget(e.target.value)} placeholder="e.g. 400" />
            </div>
            <div className="a-modal-footer">
              <button className="a-btn a-btn-ghost" onClick={() => setTargetModal(null)}>Cancel</button>
              <button className="a-btn a-btn-primary" onClick={saveTarget}>Save</button>
            </div>
          </div>
        </div>
      )}

      {creditModal && (
        <div className="a-modal-mask" onClick={() => setCreditModal(null)}>
          <div className="a-modal" onClick={e => e.stopPropagation()}>
            <div className="a-modal-title">Edit AI Credits</div>
            <div className="a-modal-sub">{creditModal.fullName}</div>
            <div className="a-form-field">
              <label className="a-form-label">Credits</label>
              <input className="a-form-input" type="number" min="0" value={tempCredits} onChange={e => setTempCredits(e.target.value)} />
            </div>
            <div className="a-modal-footer">
              <button className="a-btn a-btn-ghost" onClick={() => setCreditModal(null)}>Cancel</button>
              <button className="a-btn a-btn-primary" onClick={saveCredits}>Save</button>
            </div>
          </div>
        </div>
      )}
      
      {Array.isArray(modal) && modal[1] === 'activate_user' && (
        <div className="ns-overlay" onClick={closeModal}>
          <div onClick={e => e.stopPropagation()} style={{ width: '100%', display: 'flex', justifyContent: 'center', padding: '0 1rem' }}>
            <ModalStripe
              type="info"
              title="Change account status"
              body="Changing this account’s status will toggle access to premium features. This action can be reversed later. Continue?"
              primaryLabel="Confirm change"
              onPrimary={() => {closeModal(); toggleActive(modal[0])}}
              onClose={closeModal}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export function UserManagement() {
  return (
    <ToastProvider position="top-right">
      <UserManagementInner />
    </ToastProvider>
  )
}
