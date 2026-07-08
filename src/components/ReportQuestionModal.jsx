import { useState, useEffect, useCallback, useContext } from 'react';
import UserContext from '../context/UserContext';
import { fetchWithAuth } from '../scripts/utilis/fetch';
import './ReportQuestionModal.css';

// ─────────────────────────────────────────────────────────────
// SVG ICONS
// ─────────────────────────────────────────────────────────────
const Ic = {
  Flag:     () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>,
  X:        () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>,
  Send:     () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>,
  Check:    () => <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>,
  BigCheck: () => <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>,
  Error:    () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>,
  Hash:     () => <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="4" y1="9" x2="20" y2="9"/><line x1="4" y1="15" x2="20" y2="15"/><line x1="10" y1="3" x2="8" y2="21"/><line x1="16" y1="3" x2="14" y2="21"/></svg>,
};

// ─────────────────────────────────────────────────────────────
// COMPLAINT CATEGORIES
// ─────────────────────────────────────────────────────────────
const CATEGORIES = [
  { id: 'wrong_answer',    label: 'Wrong answer key'       },
  { id: 'typo',            label: 'Typo / spelling error'  },
  { id: 'unclear',         label: 'Unclear question'       },
  { id: 'missing_option',  label: 'Missing option'         },
  { id: 'wrong_image',     label: 'Wrong image'            },
  { id: 'other',           label: 'Other issue'            },
];

const MAX_CHARS = 400;

export function ReportQuestionModal({ questionId, subject, questionNo, onClose }) {
  const { token, setToken } = useContext(UserContext)
  const [selectedCats, setSelectedCats] = useState([]);
  const [message, setMessage]           = useState('');
  const [error, setError]               = useState('');
  const [loading, setLoading]           = useState(false);
  const [done, setDone]                 = useState(false);

  // Close on Escape
  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') onClose(); }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  function toggleCat(id) {
    setSelectedCats(prev =>
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
    if (error) setError('');
  }

  function handleMessageChange(e) {
    const val = e.target.value;
    if (val.length <= MAX_CHARS) {
      setMessage(val);
      if (error) setError('');
    }
  }
  
  const onSubmit = useCallback(async (payload) => {
    const response = await fetchWithAuth(token, setToken, '/api/reports', {
      method: 'POST',
      body: JSON.stringify(payload)
    })
    const data = await response.json().catch(() => ({}))
    if (!response.ok){
      throw { status: response.status, error: data?.error || data?.message || 'Report Failed'}
    }
  },[token, setToken])

  async function handleSubmit() {
    // Validation
    if (selectedCats.length === 0 && !message.trim()) {
      setError('Select at least one category or describe the issue.');
      return;
    }
    if (message.trim().length > 0 && message.trim().length < 8) {
      setError('Description is too short — add a bit more detail.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await onSubmit({
        questionId,
        subject,
        categories: selectedCats,
        message: message.trim(),
      });
      setDone(true);
    } catch (err) {
      setError(err?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  const charPct = message.length / MAX_CHARS;
  const charCls  = charPct >= 1 ? 'rq-max' : charPct >= 0.8 ? 'rq-near' : '';

  const canSubmit = (selectedCats.length > 0 || message.trim().length >= 8) && !loading;

  return (
    <div className="rq-overlay" onClick={onClose}>
      <div className="rq-modal" onClick={e => e.stopPropagation()}>

        {/* ── SUCCESS STATE ── */}
        {done ? (
          <>
            <div className="rq-success">
              <div className="rq-success-ring">
                <Ic.BigCheck />
              </div>
              <div className="rq-success-title">Report submitted</div>
              <div className="rq-success-body">
                Thank you for helping improve the question bank. Our team will review your report shortly.
              </div>
              <div className="rq-success-ref">
                <Ic.Hash />
                Question {questionNo}
              </div>
            </div>
            <div className="rq-footer" style={{ justifyContent: 'center' }}>
              <button className="rq-submit" onClick={onClose}>
                <Ic.Check /> Done
              </button>
            </div>
          </>
        ) : (
          <>
            {/* ── HEADER ── */}
            <div className="rq-header">
              <div className="rq-header-top">
                <div className="rq-header-left">
                  <div className="rq-icon-wrap">
                    <Ic.Flag />
                  </div>
                  <div>
                    <div className="rq-header-title">Report a problem</div>
                    <div className="rq-header-subtitle">Help us improve this question</div>
                  </div>
                </div>
                <button className="rq-close" onClick={onClose} aria-label="Close">
                  <Ic.X />
                </button>
              </div>

              {/* Question ID chip */}
              <div className="rq-question-chip">
                <span className="rq-question-chip-dot" />
                Question {questionNo}
              </div>
            </div>

            {/* ── BODY ── */}
            <div className="rq-body">

              {/* Category chips */}
              <div className="rq-section-label">What&apos;s the issue?</div>
              <div className="rq-cats">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat.id}
                    className={`rq-cat${selectedCats.includes(cat.id) ? ' selected' : ''}`}
                    onClick={() => toggleCat(cat.id)}
                    type="button"
                  >
                    {selectedCats.includes(cat.id) && <Ic.Check />}
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Textarea */}
              <div className="rq-section-label">Add details (optional)</div>
              <div className="rq-textarea-wrap">
                <textarea
                  className={`rq-textarea${error ? ' rq-has-error' : ''}`}
                  placeholder="Describe the problem in detail. For example: the correct answer should be option B, not C, because…"
                  value={message}
                  onChange={handleMessageChange}
                  rows={4}
                />
              </div>

              <div className="rq-char-row">
                {error ? (
                  <div className="rq-field-err">
                    <Ic.Error />{error}
                  </div>
                ) : (
                  <span />
                )}
                <div className={`rq-char-count ${charCls}`}>
                  {message.length} / {MAX_CHARS}
                </div>
              </div>

            </div>

            {/* ── FOOTER ── */}
            <div className="rq-footer">
              <div className="rq-footer-note">
                Reports are reviewed within 24 hours. Thank you.
              </div>
              <button className="rq-cancel" onClick={onClose} type="button">
                Cancel
              </button>
              <button
                className="rq-submit"
                onClick={handleSubmit}
                disabled={!canSubmit}
                type="button"
              >
                {loading
                  ? <><span className="rq-spinner" /> Sending…</>
                  : <><Ic.Send /> Send report</>
                }
              </button>
            </div>
          </>
        )}

      </div>
    </div>
  );
}
