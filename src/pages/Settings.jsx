import { useState, useEffect, useRef, useContext } from 'react';
import { Link, useNavigate } from 'react-router';
import UserContext from '../context/UserContext.jsx';
import { fetchDataGet, fetchWithAuth } from '../scripts/utilis/fetch.js';
import { url } from '../scripts/utilis/url.js';
import { ToastProvider, useToast, ModalCentered, ModalDestruct, CSS } from '../components/NotificationSystem';
import { Ic } from '../scripts/utilis/Ic'
import defaultAvatar from '../assets/images/avatar.jpg';
import { saveUser, deleteUser } from '../hooks/services/indexedDB/users';
import { deleteAllQuestions } from '../hooks/services/indexedDB/questions';
import './Settings.css';


const PWD_MIN_LENGTH = 6;

// ─────────────────────────────────────────────────────────────
// PASSWORD STRENGTH HELPER
// ─────────────────────────────────────────────────────────────
function passwordStrength(pw) {
  if (!pw) return { pct: 0, color: 'transparent', label: '' };
  let score = 0;
  if (pw.length >= 6)  score++;
  if (pw.length >= 10) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  const levels = [
    { label: 'Too short',   color: '#ef4444', pct: 15 },
    { label: 'Weak',        color: '#ef4444', pct: 30 },
    { label: 'Fair',        color: '#f59e0b', pct: 50 },
    { label: 'Good',        color: '#4f46e5', pct: 72 },
    { label: 'Strong',      color: '#10b981', pct: 90 },
    { label: 'Very strong', color: '#10b981', pct: 100 },
  ];
  return levels[Math.min(score, 5)];
}

// ─────────────────────────────────────────────────────────────
// SKELETON LOADER
// ─────────────────────────────────────────────────────────────
function SettingsSkeleton() {
  return (
    <div className="settings-skeleton-page">
      <div className="settings-skeleton-block">
        <div className="settings-skeleton-line" style={{ width: '40%', height: '20px' }} />
        <div className="settings-skeleton-line" style={{ width: '60%' }} />
        <div className="settings-skeleton-line" style={{ width: '100%', marginTop: '1.5rem' }} />
        <div className="settings-skeleton-line" style={{ width: '100%' }} />
        <div className="settings-skeleton-line" style={{ width: '70%' }} />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// MAIN COMPONENT (inner — uses useToast)
// ─────────────────────────────────────────────────────────────
function SettingsInner() {
  const navigate = useNavigate()
  const { token, setToken, userInfo, setUserInfo, profileFields, setProfileFields } = useContext(UserContext);
  const toast = useToast();

  const [loadError, setLoadError] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [activeTab, setActiveTab] = useState('profile'); // profile | account | notifications | danger

  const [profileErrors, setProfileErrors] = useState({});
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileDirty, setProfileDirty] = useState(false);

  // Password field state + errors
  const [pwd, setPwd] = useState({ current: '', newPwd: '', confirmPwd: '' });
  const [pwdErrors, setPwdErrors] = useState({});
  const [pwdLoading, setPwdLoading] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Notification preferences (local-only until backend wired)
  const [prefs, setPrefs] = useState({
    examReminders: true,
    creditAlerts: true,
    productUpdates: false,
    marketingEmails: false,
  });

  // Modals
  const [modal, setModal] = useState(null);

  const fileInputRef = useRef(null);
  const profileFormRef = useRef(null);
  const isMounted = useRef(false)

  // ── Fetch user info ──
  useEffect(() => {
    let cancelled = false;
    async function fetchUserInfo() {
      try {
        const response = await fetchWithAuth(token, setToken, '/api/settings', { method: 'GET' });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
          throw { status: response.status, error: data.error || data.message || 'Something went wrong. Try again later.' };
        }
        if (cancelled) return;
        setUserInfo(data);
        setProfileFields({
          fullName:    data.fullName    || '',
          phoneNumber: data.phoneNumber || '',
          targetExam:  data.targetExam  || 'JAMB UTME 2027',
          targetScore: data.targetScore || '',
        });
      } catch (err) {
        if (cancelled) return;
        setLoadError(true);
        if (!err.status) {
          toast.push({ type: 'error', title: 'No connection', message: 'Check your internet and try again.' });
        } else if (err.status >= 500) {
          toast.push({ type: 'error', title: 'Server error', message: 'Something went wrong. Please try again later.' });
        } else {
          toast.push({ type: 'error', title: 'Could not load settings', message: err.error });
        }
        console.error('Error:', err);
      }
    }
    if (!userInfo){
      fetchUserInfo();
    }
    return () => { cancelled = true; };
  }, [token, setToken, setProfileFields, setUserInfo]);

  // ── Cleanup object URLs ──
  useEffect(() => {
    return () => { if (avatarPreview) URL.revokeObjectURL(avatarPreview); };
  }, [avatarPreview]);

  // ── Avatar change with validation ──
  function handleAvatarChange(e) {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.push({ type: 'error', title: 'Invalid file', message: 'Please select an image file (JPG or PNG).' });
      e.target.value = '';
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.push({ type: 'error', title: 'File too large', message: 'Avatar must be under 2MB.' });
      e.target.value = '';
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setAvatarPreview(previewUrl);
    setProfileDirty(true);
  }

  // ── Profile field setter ──
  function setProfileField(key, value) {
    setProfileFields(p => ({ ...p, [key]: value }));
    setProfileDirty(true);
    if (profileErrors[key]) {
      setProfileErrors(p => { const n = { ...p }; delete n[key]; return n; });
    }
  }

  // ── Profile validation ──
  function validateProfile(fields) {
    const errs = {};
    if (!fields.fullName.trim()) {
      errs.fullName = 'Full name is required.';
    } else if (fields.fullName.trim().length < 2) {
      errs.fullName = 'Full name must be at least 2 characters.';
    } else if (fields.fullName.trim().length > 60) {
      errs.fullName = 'Full name must be under 60 characters.';
    }

    if (!fields.phoneNumber.trim()) {
      errs.phoneNumber = 'Phone number is required.';
    } else if (!/^0[789][01]\d{8}$/.test(fields.phoneNumber.replace(/\s/g, ''))) {
      errs.phoneNumber = 'Enter a valid Nigerian number (e.g. 08012345678).';
    }

    if (fields.targetScore !== '' && fields.targetScore !== null) {
      const score = Number(fields.targetScore);
      if (Number.isNaN(score)) {
        errs.targetScore = 'Target score must be a number.';
      } else if (score < 0 || score > 400) {
        errs.targetScore = 'Target score must be between 0 and 400.';
      }
    }

    return errs;
  }
  
  // check whenever userInfo changes
  useEffect(() => {
    async function indexDbSave(userInfo){
      await saveUser(userInfo)
    }
    
    if (!isMounted){
      isMounted.current = true
    } else {
      indexDbSave({
        ...userInfo,
        id: 'current-user'
      })
    }
  },[userInfo])

  // ── Update profile ──
  async function updateProfile(e) {
    e.preventDefault();

    const errs = validateProfile(profileFields);
    if (Object.keys(errs).length) {
      setProfileErrors(errs);
      toast.push({
        type: 'error',
        title: 'Fix the errors below',
        message: `${Object.keys(errs).length} field${Object.keys(errs).length > 1 ? 's need' : ' needs'} your attention.`,
      });
      return;
    }

    setProfileLoading(true);
    try {
      const form = profileFormRef.current;
      const formData = new FormData(form);
      // Email is intentionally excluded — read-only field, never submitted

      const res = await fetchWithAuth(token, setToken, '/api/settings/profile', {
        method: 'POST',
        headers: { authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw { status: res.status, error: data.error || data.message || 'Failed to update profile.' };
      }
      setUserInfo(data)
      setProfileDirty(false);
      setModal('profile_saved');
    } catch (err) {
      if (!err.status) {
        toast.push({ type: 'error', title: 'No connection', message: 'Check your internet and try again.' });
      } else if (err.status >= 500) {
        toast.push({ type: 'error', title: 'Server error', message: 'Something went wrong. Please try again later.' });
      } else {
        toast.push({ type: 'error', title: 'Update failed', message: err.error });
      }
    } finally {
      setProfileLoading(false);
    }
  }

  function discardProfileChanges() {
    if (!userInfo) return;
    setProfileFields({
      fullName:    userInfo.fullName    || '',
      phoneNumber: userInfo.phoneNumber || '',
      targetExam:  userInfo.targetExam  || 'JAMB UTME 2027',
      targetScore: userInfo.targetScore || '',
    });
    setAvatarPreview(null);
    setProfileErrors({});
    setProfileDirty(false);
    toast.push({ type: 'info', title: 'Changes discarded', message: 'Your profile has been reset.' });
  }

  // ── Password field setter ──
  function setPwdField(key, value) {
    setPwd(p => ({ ...p, [key]: value }));
    if (pwdErrors[key]) {
      setPwdErrors(p => { const n = { ...p }; delete n[key]; return n; });
    }
  }

  // ── Password validation ──
  function validatePwd(p) {
    const errs = {};
    if (!p.current) {
      errs.current = 'Enter your current password.';
    }
    if (!p.newPwd) {
      errs.newPwd = 'Enter a new password.';
    } else if (p.newPwd.length < PWD_MIN_LENGTH) {
      errs.newPwd = `Must be at least ${PWD_MIN_LENGTH} characters.`;
    } else if (p.current && p.newPwd === p.current) {
      errs.newPwd = 'New password must be different from current password.';
    }
    if (!p.confirmPwd) {
      errs.confirmPwd = 'Confirm your new password.';
    } else if (p.newPwd && p.confirmPwd !== p.newPwd) {
      errs.confirmPwd = 'Passwords do not match.';
    }
    return errs;
  }

  // ── Update password ──
  async function updatePwd(e) {
    e.preventDefault();

    const errs = validatePwd(pwd);
    if (Object.keys(errs).length) {
      setPwdErrors(errs);
      return;
    }

    setPwdLoading(true);
    try {
      const response = await fetchWithAuth(token, setToken, '/api/settings/account', {
        method: 'POST',
        body: JSON.stringify({ currentPassword: pwd.current, newPassword: pwd.newPwd }),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw { status: response.status, error: data.error || data.message };
      }

      setPwd({ current: '', newPwd: '', confirmPwd: '' });
      setModal('password_updated');
    } catch (err) {
      if (err.status === 401) {
        setPwdErrors({ current: 'Incorrect current password.' });
        toast.push({ type: 'error', title: 'Incorrect password', message: 'Your current password is wrong.' });
      } else if (!err.status) {
        toast.push({ type: 'error', title: 'No connection', message: 'Check your internet and try again.' });
      } else if (err.status >= 500) {
        toast.push({ type: 'error', title: 'Server error', message: 'Something went wrong. Please try again later.' });
      } else {
        toast.push({ type: 'error', title: 'Update failed', message: err.error || 'Failed to update password.' });
      }
      console.error('Error:', err);
    } finally {
      setPwdLoading(false);
    }
  }

  // ── Notification preference toggle ──
  function togglePref(key) {
    setPrefs(p => {
      const next = { ...p, [key]: !p[key] };
      // Wire this to your backend, e.g.:
      // fetchWithAuth(token, setToken, '/api/settings/preferences', { method: 'POST', body: JSON.stringify(next) });
      toast.push({ type: 'success', title: 'Preference saved', message: 'Your notification settings have been updated.', duration: 2500 });
      return next;
    });
  }

  // ── Logout ──
  async function logoutUser() {
    try {
      await fetchDataGet('/api/logout');
      await deleteUser(userInfo.id)
      setToken(null);
    } catch (err) {
      console.error('Fetch error:', err);
      toast.push({ type: 'error', title: 'Logout failed', message: 'Please try again.' });
    }
  }

  const newPwdStrength = passwordStrength(pwd.newPwd);
  const pwdReqs = [
    { met: pwd.newPwd.length >= PWD_MIN_LENGTH, label: `At least ${PWD_MIN_LENGTH} characters` },
    { met: /[A-Z]/.test(pwd.newPwd),             label: 'One uppercase letter' },
    { met: /[0-9]/.test(pwd.newPwd),             label: 'One number' },
  ];

  // ── Loading state ──
  if (!userInfo && !loadError) {
    return <SettingsSkeleton />;
  }

  // ── Load error state ──
  if (!userInfo && loadError) {
    return (
      <div className="settings-skeleton-page">
        <div className="settings-skeleton-block" style={{ textAlign: 'center' }}>
          <Ic.Warn />
          <h2 style={{ marginTop: '1rem', marginBottom: '0.5rem' }}>Couldn&apos;t load your settings</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Check your connection and try refreshing the page.</p>
          <button className="btn btn-primary" onClick={() => window.location.reload()}>Try again</button>
        </div>
      </div>
    );
  }

  return (
    <>
      <title>Settings | CBT Pro</title>

      <div className="settings-page">
        <nav>
          <div className="nav-container">
            <div className="nav-content">
              <Link to="/" className="logo">CBT Pro</Link>
            </div>
          </div>
        </nav>

        <div className="page-header">
          <div className="nav-container">
            <div className="breadcrumb">
              <Link to="/">Home</Link> / Settings
            </div>
            <div className="settings-header-title">
              <div className="settings-header-icon"><Ic.Settings /></div>
              <h1>Settings</h1>
            </div>
            <p className="settings-page-subtitle">Manage your profile, security, and account preferences</p>
          </div>
        </div>

        <main className="settings-container">
          <div className="settings-grid">

            {/* ── Sidebar nav ── */}
            <div className="settings-nav">
              <div className={`settings-nav-item ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')}>
                <span className="settings-nav-icon"><Ic.User /></span> Profile
              </div>
              <div className={`settings-nav-item ${activeTab === 'account' ? 'active' : ''}`} onClick={() => setActiveTab('account')}>
                <span className="settings-nav-icon"><Ic.Lock /></span> Security
              </div>
              <div className={`settings-nav-item ${activeTab === 'notifications' ? 'active' : ''}`} onClick={() => setActiveTab('notifications')}>
                <span className="settings-nav-icon"><Ic.Bell /></span> Notifications
              </div>
              <div className={`settings-nav-item ${activeTab === 'danger' ? 'active' : ''}`} onClick={() => setActiveTab('danger')}>
                <span className="settings-nav-icon"><Ic.Shield /></span> Account actions
              </div>
            </div>

            <div>

              {/* ════════════ PROFILE TAB ════════════ */}
              <div className={`settings-content ${activeTab === 'profile' ? 'active' : ''}`}>
                <form onSubmit={updateProfile} className="settings-card" ref={profileFormRef} noValidate>
                  <h3 className="settings-card-title">
                    <span className="settings-card-title-icon"><Ic.User /></span>
                    Profile information
                  </h3>
                  <p className="settings-card-desc">Update your personal details and exam target</p>

                  {/* Avatar */}
                  <div className="settings-avatar-upload">
                    <div className="settings-avatar-wrap">
                      <div className="settings-avatar">
                        <img
                          src={avatarPreview || `${url}${userInfo.profilePic}`}
                          alt="Profile avatar"
                          onError={(e) => { e.target.src = defaultAvatar; }}
                          style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
                        />
                      </div>
                      <div className="settings-avatar-edit-badge" onClick={() => fileInputRef.current.click()}>
                        <Ic.Camera />
                      </div>
                    </div>
                    <div className="settings-avatar-meta">
                      <div className="settings-avatar-name">{userInfo.fullName}</div>
                      <div className="settings-avatar-email">{userInfo.email}</div>
                      <div className="settings-avatar-actions">
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/jpg"
                          name="image"
                          ref={fileInputRef}
                          onChange={handleAvatarChange}
                          style={{ display: 'none' }}
                        />
                        <button type="button" className="btn btn-outline settings-btn-sm" onClick={() => fileInputRef.current.click()}>
                          Change avatar
                        </button>
                        {avatarPreview && (
                          <button type="button" className="btn btn-outline settings-btn-sm" onClick={() => { setAvatarPreview(null); fileInputRef.current.value = ''; }}>
                            Remove
                          </button>
                        )}
                      </div>
                      <p className="settings-form-hint" style={{ marginTop: '0.5rem' }}>JPG or PNG, up to 2MB</p>
                    </div>
                  </div>

                  <div className="settings-section-divider">
                    <span className="settings-section-divider-label">Personal details</span>
                  </div>

                  {/* Full name */}
                  <div className="settings-form-group">
                    <label className="settings-form-label">Full name</label>
                    <input
                      type="text"
                      name="fullName"
                      className={`settings-form-input ${profileErrors.fullName ? 'settings-input-error' : ''}`}
                      value={profileFields.fullName}
                      onChange={e => setProfileField('fullName', e.target.value)}
                      placeholder="Enter your full name"
                      maxLength={60}
                    />
                    {profileErrors.fullName && (
                      <p className="settings-form-error"><Ic.X />{profileErrors.fullName}</p>
                    )}
                  </div>

                  {/* Email — locked */}
                  <div className="settings-form-group">
                    <label className="settings-form-label">Email address</label>
                    <div className="settings-field-locked">
                      <input
                        type="email"
                        className="settings-form-input settings-input-locked"
                        value={userInfo.email}
                        disabled
                        readOnly
                      />
                      <span className="settings-lock-icon"><Ic.Lock /></span>
                    </div>
                    <p className="settings-field-locked-hint">
                      <Ic.Mail />
                      Your email address cannot be changed here. Contact support if you need to update it.
                    </p>
                  </div>

                  {/* Phone */}
                  <div className="settings-form-group">
                    <label className="settings-form-label">Phone number</label>
                    <input
                      type="tel"
                      name="phoneNumber"
                      className={`settings-form-input ${profileErrors.phoneNumber ? 'settings-input-error' : ''}`}
                      value={profileFields.phoneNumber}
                      onChange={e => setProfileField('phoneNumber', e.target.value)}
                      placeholder="08012345678"
                    />
                    {profileErrors.phoneNumber && (
                      <p className="settings-form-error"><Ic.X />{profileErrors.phoneNumber}</p>
                    )}
                  </div>

                  <div className="settings-section-divider">
                    <span className="settings-section-divider-label">Exam target</span>
                  </div>

                  {/* Target exam */}
                  <div className="settings-form-group">
                    <label className="settings-form-label">Target exam</label>
                    <select
                      name="targetExam"
                      className="settings-form-select"
                      value={profileFields.targetExam}
                      onChange={e => setProfileField('targetExam', e.target.value)}
                    >
                      <option>JAMB UTME 2027</option>
                    </select>
                  </div>

                  {/* Target score */}
                  <div className="settings-form-group">
                    <label className="settings-form-label">Target score</label>
                    <input
                      type="number"
                      name="targetScore"
                      className={`settings-form-input ${profileErrors.targetScore ? 'settings-input-error' : ''}`}
                      value={profileFields.targetScore}
                      onChange={e => setProfileField('targetScore', e.target.value)}
                      min="0"
                      max="400"
                      placeholder="e.g. 320"
                    />
                    {profileErrors.targetScore
                      ? <p className="settings-form-error"><Ic.X />{profileErrors.targetScore}</p>
                      : <p className="settings-form-hint">Your JAMB score goal — between 0 and 400</p>
                    }
                  </div>

                  <div className="settings-button-group">
                    <button type="submit" className="btn btn-primary" disabled={profileLoading || !profileDirty} style={{pointerEvents: 'auto', opacity: !(profileLoading || !profileDirty) ? '1' : ''}}>
                      {profileLoading
                        ? <span className="settings-btn-loading"><span className="settings-spinner" />Saving…</span>
                        : 'Save changes'
                      }
                    </button>
                    <button type="button" className="btn btn-outline" onClick={discardProfileChanges} disabled={!profileDirty || profileLoading}>
                      Cancel
                    </button>
                  </div>
                </form>
              </div>

              {/* ════════════ SECURITY TAB ════════════ */}
              <div className={`settings-content ${activeTab === 'account' ? 'active' : ''}`}>

                {/* Account overview */}
                <div className="settings-card">
                  <h3 className="settings-card-title">
                    <span className="settings-card-title-icon"><Ic.Shield /></span>
                    Account overview
                  </h3>
                  <p className="settings-card-desc">A summary of your account status</p>

                  <div className="settings-info-row">
                    <span className="settings-info-row-label"><Ic.Mail />Email</span>
                    <span className="settings-info-row-value">{userInfo.email}</span>
                  </div>
                  <div className="settings-info-row">
                    <span className="settings-info-row-label"><Ic.Phone />Phone</span>
                    <span className="settings-info-row-value">{userInfo.phoneNumber || '—'}</span>
                  </div>
                  <div className="settings-info-row">
                    <span className="settings-info-row-label"><Ic.Calendar />Member since</span>
                    <span className="settings-info-row-value">
                      {userInfo.createdAt ? new Date(userInfo.createdAt).toLocaleDateString('en-NG', { year: 'numeric', month: 'short', day: 'numeric' }) : '—'}
                    </span>
                  </div>
                  <div className="settings-info-row">
                    <span className="settings-info-row-label"><Ic.Shield />Activation status</span>
                    <span className={`settings-status-badge ${userInfo.isActivated ? 'active' : 'inactive'}`}>
                      <span className="settings-status-dot" />
                      {userInfo.isActivated ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>

                {/* Change password */}
                <form onSubmit={updatePwd} className="settings-card" noValidate>
                  <h3 className="settings-card-title">
                    <span className="settings-card-title-icon"><Ic.Lock /></span>
                    Change password
                  </h3>
                  <p className="settings-card-desc">Use a strong, unique password to keep your account secure</p>

                  {/* Current password */}
                  <div className="settings-form-group">
                    <label className="settings-form-label">Current password</label>
                    <div className="settings-pwd-wrap">
                      <input
                        type={showCurrent ? 'text' : 'password'}
                        className={`settings-form-input ${pwdErrors.current ? 'settings-input-error' : ''}`}
                        placeholder="Enter current password"
                        value={pwd.current}
                        onChange={e => setPwdField('current', e.target.value)}
                        autoComplete="current-password"
                      />
                      <button type="button" className="settings-pwd-toggle" onClick={() => setShowCurrent(p => !p)}>
                        {showCurrent ? <Ic.EyeOff /> : <Ic.Eye />}
                      </button>
                    </div>
                    {pwdErrors.current && <p className="settings-form-error"><Ic.X />{pwdErrors.current}</p>}
                  </div>

                  {/* New password */}
                  <div className="settings-form-group">
                    <label className="settings-form-label">New password</label>
                    <div className="settings-pwd-wrap">
                      <input
                        type={showNew ? 'text' : 'password'}
                        className={`settings-form-input ${pwdErrors.newPwd ? 'settings-input-error' : ''}`}
                        placeholder="Enter new password"
                        value={pwd.newPwd}
                        onChange={e => setPwdField('newPwd', e.target.value)}
                        autoComplete="new-password"
                      />
                      <button type="button" className="settings-pwd-toggle" onClick={() => setShowNew(p => !p)}>
                        {showNew ? <Ic.EyeOff /> : <Ic.Eye />}
                      </button>
                    </div>
                    {pwdErrors.newPwd && <p className="settings-form-error"><Ic.X />{pwdErrors.newPwd}</p>}

                    {pwd.newPwd && (
                      <div className="settings-pwd-strength">
                        <div className="settings-pwd-strength-bar">
                          <div className="settings-pwd-strength-fill" style={{ width: `${newPwdStrength.pct}%`, background: newPwdStrength.color }} />
                        </div>
                        <div className="settings-pwd-strength-label" style={{ color: newPwdStrength.color }}>{newPwdStrength.label}</div>
                      </div>
                    )}

                    <div className="settings-pwd-reqs">
                      {pwdReqs.map(r => (
                        <div key={r.label} className={`settings-pwd-req ${r.met ? 'met' : ''}`}>
                          <span className="settings-pwd-req-icon">{r.met && <Ic.Check />}</span>
                          {r.label}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Confirm password */}
                  <div className="settings-form-group">
                    <label className="settings-form-label">Confirm new password</label>
                    <div className="settings-pwd-wrap">
                      <input
                        type={showConfirm ? 'text' : 'password'}
                        className={`settings-form-input ${pwdErrors.confirmPwd ? 'settings-input-error' : ''}`}
                        placeholder="Confirm new password"
                        value={pwd.confirmPwd}
                        onChange={e => setPwdField('confirmPwd', e.target.value)}
                        autoComplete="new-password"
                      />
                      <button type="button" className="settings-pwd-toggle" onClick={() => setShowConfirm(p => !p)}>
                        {showConfirm ? <Ic.EyeOff /> : <Ic.Eye />}
                      </button>
                    </div>
                    {pwdErrors.confirmPwd
                      ? <p className="settings-form-error"><Ic.X />{pwdErrors.confirmPwd}</p>
                      : pwd.confirmPwd && pwd.newPwd && pwd.confirmPwd === pwd.newPwd && (
                        <p className="settings-form-hint-success"><Ic.Check />Passwords match</p>
                      )
                    }
                  </div>

                  <div className="settings-button-group">
                    <button type="submit" className="btn btn-primary" disabled={pwdLoading} style={{pointerEvents: 'auto', opacity: !pwdLoading ? '1' : ''}}>
                      {pwdLoading
                        ? <span className="settings-btn-loading"><span className="settings-spinner" />Updating…</span>
                        : 'Update password'
                      }
                    </button>
                  </div>
                </form>
              </div>

              {/* ════════════ NOTIFICATIONS TAB ════════════ */}
              <div className={`settings-content ${activeTab === 'notifications' ? 'active' : ''}`}>
                <div className="settings-card">
                  <h3 className="settings-card-title">
                    <span className="settings-card-title-icon"><Ic.Bell /></span>
                    Notification preferences
                  </h3>
                  <p className="settings-card-desc">Choose what you want to be notified about</p>

                  <div className="settings-toggle-row">
                    <div className="settings-toggle-info">
                      <div className="settings-toggle-title">Exam reminders</div>
                      <div className="settings-toggle-desc">Get notified before scheduled mock tests and exam deadlines</div>
                    </div>
                    <label className="settings-switch">
                      <input type="checkbox" checked={prefs.examReminders} onChange={() => togglePref('examReminders')} />
                      <span className="settings-switch-track" />
                    </label>
                  </div>

                  <div className="settings-toggle-row">
                    <div className="settings-toggle-info">
                      <div className="settings-toggle-title">AI credit alerts</div>
                      <div className="settings-toggle-desc">Get notified when your AI credits are running low</div>
                    </div>
                    <label className="settings-switch">
                      <input type="checkbox" checked={prefs.creditAlerts} onChange={() => togglePref('creditAlerts')} />
                      <span className="settings-switch-track" />
                    </label>
                  </div>

                  <div className="settings-toggle-row">
                    <div className="settings-toggle-info">
                      <div className="settings-toggle-title">Product updates</div>
                      <div className="settings-toggle-desc">News about new features and improvements to CBT Pro</div>
                    </div>
                    <label className="settings-switch">
                      <input type="checkbox" checked={prefs.productUpdates} onChange={() => togglePref('productUpdates')} />
                      <span className="settings-switch-track" />
                    </label>
                  </div>

                  <div className="settings-toggle-row">
                    <div className="settings-toggle-info">
                      <div className="settings-toggle-title">Marketing emails</div>
                      <div className="settings-toggle-desc">Promotions, discounts, and study tips sent to your inbox</div>
                    </div>
                    <label className="settings-switch">
                      <input type="checkbox" checked={prefs.marketingEmails} onChange={() => togglePref('marketingEmails')} />
                      <span className="settings-switch-track" />
                    </label>
                  </div>
                </div>
              </div>

              {/* ════════════ ACCOUNT ACTIONS TAB ════════════ */}
              <div className={`settings-content ${activeTab === 'danger' ? 'active' : ''}`}>
              
                <div className="settings-card settings-danger-zone">
                  <h3 className="settings-card-title">
                    <span className="settings-card-title-icon"><Ic.Warn /></span>
                    Account actions
                  </h3>
                  <p className="settings-card-desc">Manage your account access</p>

                  <div className="settings-danger-item">
                    <div className="settings-danger-item-title">Clear Offline Data</div>
                    <div className="settings-danger-item-desc">This will remove all saved questions and offline data from this device.</div>
                    <button className="btn btn-outline" style={{ width: '100%' }} onClick={() => setModal('clear_data')}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Ic.Trash /> Clear Data
                      </span>
                    </button>
                  </div>
                  
                  <div className="settings-danger-item">
                    <div className="settings-danger-item-title">Logout of account</div>
                    <div className="settings-danger-item-desc">Sign out of your account on this device. You&apos;ll need to log in again to access your data.</div>
                    <button className="btn btn-outline" style={{ width: '100%' }} onClick={logoutUser}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Ic.LogOut /> Logout
                      </span>
                    </button>
                  </div>

                  <div className="settings-danger-item">
                    <div className="settings-danger-item-title">Delete account</div>
                    <div className="settings-danger-item-desc">Permanently delete your account and all associated data. This action cannot be undone.</div>
                    <button className="settings-btn-danger" style={{ width: '100%' }} onClick={() => navigate('/delete')}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Ic.Trash /> Delete account
                      </span>
                    </button>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* ── Modals ── */}
          {modal === 'profile_saved' && (
            <div className="ns-overlay" onClick={() => setModal(null)}>
              <div onClick={e => e.stopPropagation()} style={{ width: '100%', display: 'flex', justifyContent: 'center', padding: '0 1rem' }}>
                <ModalCentered
                  type="success"
                  title="Changes saved"
                  body="Your profile has been updated successfully. The changes are now live."
                  primaryLabel="Done"
                  onClose={() => setModal(null)}
                />
              </div>
            </div>
          )}

          {modal === 'password_updated' && (
            <div className="ns-overlay" onClick={() => setModal(null)}>
              <div onClick={e => e.stopPropagation()} style={{ width: '100%', display: 'flex', justifyContent: 'center', padding: '0 1rem' }}>
                <ModalCentered
                  type="success"
                  title="Password updated"
                  body="Your password has been changed successfully. Use your new password next time you sign in."
                  primaryLabel="Done"
                  onClose={() => setModal(null)}
                />
              </div>
            </div>
          )}
          {modal === 'clear_data' && (
          <div className="ns-overlay" onClick={() => setModal(null)}>
            <div onClick={e => e.stopPropagation()} style={{ width: '100%', display: 'flex', justifyContent: 'center', padding: '0 1rem' }}>
              <ModalDestruct
                title="Clear offline data?"
                body="This will remove all offline questions and locally stored data from this device. Your account and online data will remain unchanged."
                warningText="You'll need an internet connection to access or restore offline content again."
                primaryLabel="Clear offline data"
                onPrimary={async () => { 
                  setModal(null)
                  await deleteAllQuestions()
                  toast.push({ type: 'success', title: 'Data Cleared', message: 'Offline data cleared' });
                }}
                onClose={() => setModal(null)}
              />
            </div>
          </div>
        )}
        </main>
      </div>
    </>
  );
}

// ─────────────────────────────────────────────────────────────
// EXPORT — wraps in ToastProvider + injects NotificationSystem CSS
// ─────────────────────────────────────────────────────────────
export function Settings() {
  useEffect(() => {
    const existing = document.getElementById('__ns_styles');
    if (existing) return;
    const el = document.createElement('style');
    el.id = '__ns_styles';
    el.textContent = CSS[0];
    document.head.appendChild(el);
    return () => document.getElementById('__ns_styles')?.remove();
  }, []);

  return (
    <ToastProvider position="top-right">
      <SettingsInner />
    </ToastProvider>
  );
}
