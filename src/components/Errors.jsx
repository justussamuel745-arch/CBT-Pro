import { useEffect, memo } from 'react';
import './Errors.css';

export function ValidationError({ error }) {
  return (
    <div className="error-box">
      <svg fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
      </svg>
      <div>{error}</div>
    </div>
  )
}

export function ValidationErrors({ error }) {
  return (
    <div className="error-box">
      <svg fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
      </svg>
      <div>
        <ul>
          {
            error.map((err, index) => (
              <li key={index}>{err.message}</li>
            ))
          }
        </ul>
      </div>
    </div>
  )
}

 export const Toast = memo(function Toast({ msg, onClose }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(); // tell parent to unmount it
    }, 3000);
    return () => clearTimeout(timer); // cleanup
  }, [onClose]);

  return (
    <div id="toast-container">
      {(msg === 'Profile updated successfully') ? <div className="toast" style={{
        backgroundColor: 'var(--success)'
      }}>{msg}</div> : <div className="toast">{msg}</div>}
    </div>
  );
})