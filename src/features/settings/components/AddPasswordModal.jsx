import { useState, memo } from 'react';
import { toast } from 'react-hot-toast';
import { passwordStrength } from '@lib/utils/passwordStrength';
import { request } from '@lib/api/request';
import { Ic } from '@/components/common/Icons';

const PWD_MIN_LENGTH = 6;

export const AddPasswordModal = memo(function AddPasswordModal({ userInfo, setUserInfo, modal, setModal }) {
  // Add-password modal state
  const [ newPwdOnly, setNewPwdOnly ] = useState({ newPwd: '', confirmPwd: '' });
  const [ newPwdOnlyErrors, setNewPwdOnlyErrors ] = useState({});
  const [ newPwdOnlyLoading, setNewPwdOnlyLoading ] = useState(false);
  const [ showNewOnly, setShowNewOnly ] = useState(false);
  const [ showConfirmOnly, setShowConfirmOnly ] = useState(false);

  function validateNewPwdOnly(p) {
    const errs = {};
    if (!p.newPwd) {
      errs.newPwd = 'Enter a password.';
    } else if (p.newPwd.length < PWD_MIN_LENGTH) {
      errs.newPwd = `Must be at least ${PWD_MIN_LENGTH} characters.`;
    }
    if (!p.confirmPwd) {
      errs.confirmPwd = 'Confirm your password.';
    } else if (p.newPwd && p.confirmPwd !== p.newPwd) {
      errs.confirmPwd = 'Passwords do not match.';
    }
    return errs;
  }

  async function addPassword(e) {
    e.preventDefault();
    const errs = validateNewPwdOnly(newPwdOnly);
    if (Object.keys(errs).length) {
      setNewPwdOnlyErrors(errs);
      return;
    }

    setNewPwdOnlyLoading(true);
    try {
      await request.auth('/api/settings/account', {
        method: 'POST',
        body: JSON.stringify({ newPassword: newPwdOnly.newPwd }),
      });

      setUserInfo(prev => ({ ...prev, authProvider: 'local' }));
      setNewPwdOnly({ newPwd: '', confirmPwd: '' });
      setModal('password_added');
    } catch (err) {
      if (!err.status) {
        toast.error('Check your internet connection and try again.');
      } else if (err.status >= 500) {
        toast.error('Something went wrong. Try again later.');
      } else {
        toast.error('Failed to set password');
      }
    } finally {
      setNewPwdOnlyLoading(false);
    }
  }

  return (
    <>
      <div className="ns-overlay" onClick={() => setModal(null)}>
        <div onClick={e => e.stopPropagation()} style={{ width: '100%', display: 'flex', justifyContent: 'center', padding: '0 1rem' }}>
          <form onSubmit={addPassword} className="settings-modal-card" noValidate>
            <button type="button" className="settings-modal-close" onClick={() => setModal(null)}>
              <Ic.X />
            </button>

            <div className="settings-modal-icon-ring">
              <Ic.Lock />
            </div>

            <h3 className="settings-modal-title">Add a password</h3>
            <p className="settings-modal-desc">
              Create a password for <strong>{userInfo.email}</strong> so you can sign in without Google too.
            </p>

            <div className="settings-form-group">
              <label className="settings-form-label">New password</label>
              <div className="settings-pwd-wrap">
                <input
                  type={showNewOnly ? 'text' : 'password'}
                  className={`settings-form-input ${newPwdOnlyErrors.newPwd ? 'settings-input-error' : ''}`}
                  placeholder="Enter a password"
                  value={newPwdOnly.newPwd}
                  onChange={e => {
                    setNewPwdOnly(p => ({ ...p, newPwd: e.target.value }));
                    if (newPwdOnlyErrors.newPwd) setNewPwdOnlyErrors(p => { const n = { ...p }; delete n.newPwd; return n; });
                  }}
                  autoComplete="new-password"
                  autoFocus
                />
                <button type="button" className="settings-pwd-toggle" onClick={() => setShowNewOnly(p => !p)}>
                  {showNewOnly ? <Ic.EyeOff /> : <Ic.Eye />}
                </button>
              </div>
              {newPwdOnlyErrors.newPwd && <p className="settings-form-error"><Ic.X />{newPwdOnlyErrors.newPwd}</p>}

              {newPwdOnly.newPwd && (
                <div className="settings-pwd-strength">
                  <div className="settings-pwd-strength-bar">
                    <div
                      className="settings-pwd-strength-fill"
                      style={{ width: `${passwordStrength(newPwdOnly.newPwd).pct}%`, background: passwordStrength(newPwdOnly.newPwd).color }}
                    />
                  </div>
                  <div className="settings-pwd-strength-label" style={{ color: passwordStrength(newPwdOnly.newPwd).color }}>
                    {passwordStrength(newPwdOnly.newPwd).label}
                  </div>
                </div>
              )}
            </div>

            <div className="settings-form-group">
              <label className="settings-form-label">Confirm password</label>
              <div className="settings-pwd-wrap">
                <input
                  type={showConfirmOnly ? 'text' : 'password'}
                  className={`settings-form-input ${newPwdOnlyErrors.confirmPwd ? 'settings-input-error' : ''}`}
                  placeholder="Confirm your password"
                  value={newPwdOnly.confirmPwd}
                  onChange={e => {
                    setNewPwdOnly(p => ({ ...p, confirmPwd: e.target.value }));
                    if (newPwdOnlyErrors.confirmPwd) setNewPwdOnlyErrors(p => { const n = { ...p }; delete n.confirmPwd; return n; });
                  }}
                  autoComplete="new-password"
                />
                <button type="button" className="settings-pwd-toggle" onClick={() => setShowConfirmOnly(p => !p)}>
                  {showConfirmOnly ? <Ic.EyeOff /> : <Ic.Eye />}
                </button>
              </div>
              {newPwdOnlyErrors.confirmPwd
                ? <p className="settings-form-error"><Ic.X />{newPwdOnlyErrors.confirmPwd}</p>
                : newPwdOnly.confirmPwd && newPwdOnly.newPwd && newPwdOnly.confirmPwd === newPwdOnly.newPwd && (
                  <p className="settings-form-hint-success"><Ic.Check />Passwords match</p>
                )
              }
            </div>

            <div className="settings-modal-actions">
              <button type="submit" className="btn btn-primary" disabled={newPwdOnlyLoading} style={{
                width: '100%',
                pointerEvents: 'auto',
                opacity: newPwdOnlyLoading ? '0.5' : '1'
              }}>
                {newPwdOnlyLoading
                  ? <span className="settings-btn-loading"><span className="settings-spinner" />Setting password…</span>
                  : 'Set password'
                }
              </button>
              <button type="button" className="btn btn-outline" style={{ width: '100%' }} onClick={() => setModal(null)}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>

      {modal === 'password_added' && (
        <div className="ns-overlay" onClick={() => setModal(null)}>
          <div onClick={e => e.stopPropagation()} style={{ width: '100%', display: 'flex', justifyContent: 'center', padding: '0 1rem' }}>
            <ModalCentered
              type="success"
              title="Password added"
              body="You can now sign in with your email and password, or continue using Google — whichever is easiest."
              primaryLabel="Done"
              onClose={() => setModal(null)}
            />
          </div>
        </div>
      )}
    </>
  )
})
