import { useCallback, useEffect, useRef, useState } from 'react';

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const CODE_LENGTH = 4;
export const PENDING_VERIFICATION_KEY = 'pending_email_verification';

const VERIFIED_EMAIL_KEY= 'verify_email_key'

const emptyDigits = () => Array(CODE_LENGTH).fill('');
const normalize = (value) => value.trim().toLowerCase();

/**
 * Email verification flow: send code -> enter 4-digit code -> verified.
 *
 * sendCode(email)         -> Promise<{ message?: string }>   (throws Error on failure)
 * verifyCode(email, code) -> Promise<{ message?: string }>   (throws Error on failure)
 * onVerifiedChange(email|null) is called with the verified email, or null
 * when the user edits the email after verifying.
 */
export function useEmailVerification({ email, sendCode, verifyCode, onVerifiedChange }) {
  const normalized = normalize(email);
  const isValidEmail = EMAIL_RE.test(email.trim());

  const cachedCodeSent = JSON.parse(localStorage.getItem(PENDING_VERIFICATION_KEY))?.codeSent

  // 'idle' | 'sending' | 'verifying' | 'verified'
  const [status, setStatus] = useState('idle');
  const [codeSent, setCodeSent] = useState(!!cachedCodeSent);
  const [digits, setDigits] = useState(emptyDigits);
  const [message, setMessage] = useState(null); // { kind: 'success' | 'error', text }
  const [codeError, setCodeError] = useState(null);
  const [verifiedEmails, setVerifiedEmails] = useState([])

  // The email the current flow belongs to. Used to ignore stale responses.
  const targetRef = useRef(normalized);
  const statusRef = useRef(status);
  const onVerifiedRef = useRef(onVerifiedChange);
  statusRef.current = status;
  onVerifiedRef.current = onVerifiedChange;

  // Reset everything when the user switches to a different email.
  useEffect(() => {
    if (verifiedEmails.includes(normalized)){
      targetRef.current = normalized
      setStatus('verified');
      setCodeSent(false);
      setDigits(emptyDigits());
      setMessage(null);
      onVerifiedRef.current?.(normalized);
      return
    }
    
    if (targetRef.current === null || targetRef.current === normalized) return;
    const wasVerified = statusRef.current === 'verified';
    targetRef.current = null;
    setStatus('idle');
    setCodeSent(false);
    setDigits(emptyDigits());
    setMessage(null);
    setCodeError(null);
    if (wasVerified) onVerifiedRef.current?.(null);
  }, [normalized]);

  const requestCode = useCallback(async () => {
    if (!isValidEmail || statusRef.current === 'sending' || statusRef.current === 'verifying') return;
    const target = normalized;
    targetRef.current = target;
    setStatus('sending');
    setMessage(null);
    setCodeError(null);
    setDigits(emptyDigits());
    try {
      const { expiresIn, message } = await sendCode(email.trim());
      if (targetRef.current !== target) return;
      setCodeSent(true);
      setStatus('idle');
      localStorage.setItem(
        PENDING_VERIFICATION_KEY,
        JSON.stringify({
          email: target,
          codeSent: true,
          requestedTimeInMilliSec: Date.now() + 1000 * expiresIn
        })
      )
      setMessage({ kind: 'success', text: message || 'Verification code sent.' });
    } catch (err) {
      if (targetRef.current !== target) return;
      setStatus('idle');
      setMessage({ kind: 'error', text: err?.message || 'Could not send the code. Please try again.' });
    }
  }, [email, normalized, isValidEmail, sendCode]);

  const submitCode = useCallback(async () => {
    const code = digits.join('');
    const target = targetRef.current;
    if (!target || code.length !== CODE_LENGTH || statusRef.current === 'verifying') return;
    setStatus('verifying');
    setCodeError(null);
    try {
      await verifyCode(email.trim(), code);
      if (targetRef.current !== target) return;
      setStatus('verified');
      setCodeSent(false);
      setDigits(emptyDigits());
      setMessage(null);
      onVerifiedRef.current?.(target);
      setVerifiedEmails(prev => ([...prev, target]))

      // clear the pending verification
      localStorage.removeItem(PENDING_VERIFICATION_KEY)
    } catch (err) {
      if (targetRef.current !== target) return;
      setStatus('idle');
      setCodeError(err?.message || 'Invalid code. Please try again.');
    }
  }, [digits, email, verifyCode]);

  return {
    status,
    isValidEmail,
    isVerified: status === 'verified',
    showCodeInput: codeSent && status !== 'verified',
    codeSent,
    digits,
    setDigits,
    message,
    codeError,
    requestCode,
    submitCode,
  };
}
