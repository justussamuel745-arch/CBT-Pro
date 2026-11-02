import { useEffect, useRef } from 'react';
import { useEmailVerification, CODE_LENGTH } from '@/hooks/useEmailVerification';
import './EmailVerifyField.css';

const DEFAULT_ICONS = { error: '✕', success: '✓' };

// ─────────────────────────────────────────────────────────────
// 4-DIGIT CODE INPUT
// ─────────────────────────────────────────────────────────────
function CodeInput({ digits, onChange, onEnter, invalid, disabled, classes }) {
  const refs = useRef([]);

  useEffect(() => { refs.current[0]?.focus(); }, []);

  const focusAt = (i) => refs.current[Math.max(0, Math.min(i, CODE_LENGTH - 1))]?.focus();

  function fill(start, chars) {
    const next = [...digits];
    let idx = start;
    for (const c of chars) {
      if (idx >= CODE_LENGTH) break;
      next[idx++] = c;
    }
    onChange(next);
    focusAt(idx);
  }

  function handleChange(i, e) {
    const chars = e.target.value.replace(/\D/g, '').split('');
    if (!chars.length) {
      const next = [...digits];
      next[i] = '';
      onChange(next);
      return;
    }
    fill(i, chars);
  }

  function handleKeyDown(i, e) {
    if (e.key === 'Backspace' && !digits[i] && i > 0) {
      e.preventDefault();
      const next = [...digits];
      next[i - 1] = '';
      onChange(next);
      focusAt(i - 1);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      focusAt(i - 1);
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      focusAt(i + 1);
    } else if (e.key === 'Enter') {
      e.preventDefault(); // never submit the surrounding form
      onEnter?.();
    }
  }

  function handlePaste(e) {
    const chars = e.clipboardData.getData('text').replace(/\D/g, '').split('');
    if (!chars.length) return;
    e.preventDefault();
    fill(0, chars);
  }

  return (
    <div className="email-verify-code-row" role="group" aria-label={`${CODE_LENGTH}-digit verification code`}>
      {digits.map((d, i) => (
        <input
          key={i}
          ref={(el) => (refs.current[i] = el)}
          className={`${classes.input} email-verify-code-input${invalid ? ` ${classes.inputError}` : ''}`}
          type="text"
          inputMode="numeric"
          autoComplete={i === 0 ? 'one-time-code' : 'off'}
          aria-label={`Digit ${i + 1}`}
          value={d}
          disabled={disabled}
          onChange={(e) => handleChange(i, e)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          onFocus={(e) => e.target.select()}
        />
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// EMAIL FIELD WITH VERIFICATION
//
// `classes` maps this component onto the host page's own styles:
//   { group, label, input, inputError, fieldError, fieldSuccess, spinner, submit }
// ─────────────────────────────────────────────────────────────
export function EmailVerifyField({
  id = 'email',
  label = 'Email Address',
  placeholder = 'Enter your email',
  email,
  onEmailChange,    // (value: string) => void
  error,            // validation error for this field (from the page)
  onSendCode,       // (email) => Promise<{ message }>
  onVerifyCode,     // (email, code) => Promise<{ message }>
  onVerifiedChange, // (verifiedEmail | null) => void
  classes,
  icons = DEFAULT_ICONS,
}) {
  const v = useEmailVerification({
    email,
    sendCode: onSendCode,
    verifyCode: onVerifyCode,
    onVerifiedChange,
  });

  const sending = v.status === 'sending';
  const verifying = v.status === 'verifying';
  const codeComplete = v.digits.every(Boolean);
  const inputClass = `${classes.input}${error ? ` ${classes.inputError}` : ''}`;

  return (
    <div className={classes.group}>
      <label className={classes.label} htmlFor={id}>{label}</label>

      <div className="email-verify-row">
        <input
          id={id}
          type="email"
          className={inputClass}
          placeholder={placeholder}
          value={email}
          onChange={(e) => onEmailChange(e.target.value)}
        />

        {v.isVerified ? (
          <button type="button" className="email-verify-btn is-verified" disabled>
            {icons.success} Verified
          </button>
        ) : v.isValidEmail && (
          <button
            type="button"
            className="email-verify-btn"
            disabled={sending || verifying}
            onClick={v.requestCode}
          >
            {sending
              ? <><span className={classes.spinner} /> Sending…</>
              : v.codeSent ? 'Resend code' : 'Verify'}
          </button>
        )}
      </div>

      {error && <div className={classes.fieldError}>{icons.error}{error}</div>}

      {v.message && (
        <div
          className={v.message.kind === 'error' ? classes.fieldError : classes.fieldSuccess}
          role="status"
        >
          {v.message.kind === 'error' ? icons.error : icons.success}{v.message.text}
        </div>
      )}

      {v.showCodeInput && (
        <div className="email-verify-panel">
          <span className={classes.label}>Enter the {CODE_LENGTH}-digit code</span>
          <CodeInput
            digits={v.digits}
            onChange={v.setDigits}
            onEnter={v.submitCode}
            invalid={!!v.codeError}
            disabled={verifying}
            classes={classes}
          />
          {v.codeError && <div className={classes.fieldError}>{icons.error}{v.codeError}</div>}
          <button
            type="button"
            className={`${classes.submit} email-verify-submit`}
            disabled={!codeComplete || verifying}
            onClick={v.submitCode}
          >
            {verifying ? <><span className={classes.spinner} /> Verifying…</> : 'Verify code'}
          </button>
        </div>
      )}
    </div>
  );
}
