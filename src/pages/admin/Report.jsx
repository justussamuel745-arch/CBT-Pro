import { useState, useEffect, memo } from 'react';
import './Report.css';
import { MarkdownContent } from '../../components/MarkdownContent';
import { Nav } from './Nav';
import { Loading } from '../../components/Loading';
import { decrypt } from '../../scripts/utilis/crypto';
import { request } from '../../scripts/utilis/request';
import { adminStore } from '../../stores/AdminStore';

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
  Mathematics: { from: '#06b6d4', to: '#0891b2' },
  English:     { from: '#4f46e5', to: '#7c3aed' },
  Physics:     { from: '#0ea5e9', to: '#0284c7' },
  Economics:   { from: '#3b82f6', to: '#2563eb' },
  Biology:     { from: '#14b8a6', to: '#0d9488' },
  Chemistry:   { from: '#10b981', to: '#059669' },
  Government:  { from: '#8b5cf6', to: '#6d28d9' },
  default:     { from: '#4f46e5', to: '#06b6d4' },
};

function getQuestionText(q) { return q?.text || ''; }
function getComprehension(q) { return q?.comprehension || null; }
function getInstruction(q) { return q?.instruction || null; }
function getExplanationText(q) { return q?.explanation?.text || ''; }
function isCorrectOption(optionId, correctAnswers) {
  return Array.isArray(correctAnswers) && correctAnswers.includes(optionId);
}
function deepClone(obj) { return JSON.parse(JSON.stringify(obj)); }

/* const SAMPLE_REPORTS = [
  {
    _id: 'r1',
    questionId: 'q_1983_econ_001',
    subject: 'Economics',
    examType: 'JAMB UTME 1983',
    status: 'open',
    categories: ['wrong_answer'],
    message: "I'm sure the answer key is wrong. Rent, wages, and profit are all factor incomes — the odd one out should be option D (self-employed income), not B.",
    createdAt: new Date(Date.now() - 1000 * 60 * 42).toISOString(),
    user: { name: 'Amaka Obi', email: 'amaka.obi@example.com' },
    question: {
      comprehension: null,
      instruction: null,
      text: 'Which of the following items is NOT included in measuring national income by the income approach?',
      options: [
        { id: 'a', option: 'Wages and salaries of public servants' },
        { id: 'b', option: 'Student grants and scholarships' },
        { id: 'c', option: 'Profits of companies' },
        { id: 'd', option: 'Income earned by self employed persons such as lawyers' },
        { id: 'e', option: 'Rents on property' },
      ],
      correctAnswers: ['b'],
      explanation: {
        text: 'The income approach sums up all factor incomes (wages, rent, interest, profit). Student grants and scholarships are transfer payments, not payments for productive services, so they are excluded to avoid double-counting.',
        image: null,
      },
      topic: 'National Income',
      year: '1983',
      difficulty: 'medium',
    },
    aiSuggestions: [],
  },
  {
    _id: 'r3',
    questionId: 'q_1992_eng_094',
    subject: 'English',
    examType: 'JAMB UTME 1992',
    status: 'reviewing',
    categories: ['typo'],
    message: "Option D says 'have being' — that doesn't even make grammatical sense as an option, looks like a typo for 'have been'.",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString(),
    user: { name: 'Chiamaka Eze', email: 'chiamaka.eze@example.com' },
    question: {
      comprehension: null,
      instruction: 'Fill each gap with the appropriate option from the list following the gap.',
      text: 'It has been confirmed that the election... [A. will be B. is being C. has been D. have being] held in July.',
      options: [
        { id: 'a', option: 'will be' },
        { id: 'b', option: 'is being' },
        { id: 'c', option: 'has been' },
        { id: 'd', option: 'have being' },
      ],
      correctAnswers: ['a'],
      explanation: { text: "'July' is a future time. The future tense 'will be held' is correct.", image: null },
      topic: 'Clause and Sentence Patterns',
      year: '1992',
      difficulty: 'medium',
    },
    aiSuggestions: [
      {
        attempt: 1,
        messageUsed: "Option D says 'have being' — typo for 'have been'.",
        messageSource: 'reporter',
        confidence: 'high',
        comprehension: null,
        instruction: 'Fill each gap with the appropriate option from the list following the gap.',
        questionText: 'It has been confirmed that the election ___ held in July.',
        options: [
          { id: 'a', option: 'will be' },
          { id: 'b', option: 'is being' },
          { id: 'c', option: 'has been' },
          { id: 'd', option: 'have been' },
        ],
        correctAnswers: ['a'],
        explanationText: "'July' refers to a future time, so the future tense 'will be held' is correct.",
        note: 'Fixed the typo "have being" → "have been" in option D. Answer unchanged: option A.',
        model: 'gemini-2.5-flash-lite',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 19).toISOString(),
      },
      {
        attempt: 2,
        messageUsed: 'Also simplify the gap format, remove the [A. B. C. D.] bracket clutter.',
        messageSource: 'custom',
        confidence: 'high',
        comprehension: null,
        instruction: 'Fill each gap with the appropriate option from the list following the gap.',
        questionText: 'It has been confirmed that the election ___ held in July.',
        options: [
          { id: 'a', option: 'will be' },
          { id: 'b', option: 'is being' },
          { id: 'c', option: 'has been' },
          { id: 'd', option: 'have been' },
        ],
        correctAnswers: ['a'],
        explanationText: "'July' refers to a future time, so the future tense 'will be held' is correct.",
        note: 'Removed the inline bracketed option list from the question stem since options are already shown separately.',
        model: 'gemini-2.5-flash-lite',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(),
      },
    ],
  },
]; */

const Ic = {
  Flag:    () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>,
  Search:  () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>,
  X:       () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>,
  Check:   () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>,
  Eye:     () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
  Trash:   () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6m5 0V4h4v2"/></svg>,
  User:    () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  Hash:    () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="4" y1="9" x2="20" y2="9"/><line x1="4" y1="15" x2="20" y2="15"/><line x1="10" y1="3" x2="8" y2="21"/><line x1="16" y1="3" x2="14" y2="21"/></svg>,
  Clock:   () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  Warn:    () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
  Inbox:   () => <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/></svg>,
  Open:    () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>,
  Menu:    () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 12h18M3 6h18M3 18h18" /></svg>,
  Sparkle: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M18.4 5.6l-2.8 2.8M8.4 15.6l-2.8 2.8"/></svg>,
  Edit:    () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>,
  Refresh: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>,
  Wrench:  () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>,
};

function fmtDate(d) {
  if (!d) return '—';
  const date = new Date(d);
  const diff = Math.floor((new Date() - date) / 60000);
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
function subjectColor(subject) { return SUBJECT_COLORS[subject] || SUBJECT_COLORS.default; }
function canFix(status) { return status === 'open' || status === 'reviewing'; }

const FILTERS = ['all', 'open', 'reviewing', 'resolved', 'dismissed'];

// ─────────────────────────────────────────────────────────────
// TOASTS
// ─────────────────────────────────────────────────────────────
function useToasts() {
  const [toasts, setToasts] = useState([]);
  function showToast(type, message) {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, type, message }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  }
  function dismissToast(id) {
    setToasts(prev => prev.filter(t => t.id !== id));
  }
  return { toasts, showToast, dismissToast };
}

function ToastContainer({ toasts, dismissToast }) {
  if (toasts.length === 0) return null;
  return (
    <div className="arq-toast-container">
      {toasts.map(t => (
        <div key={t.id} className={`arq-toast arq-toast-${t.type}`}>
          <span className="arq-toast-icon">{t.type === 'success' ? <Ic.Check /> : <Ic.Warn />}</span>
          <span className="arq-toast-message">{t.message}</span>
          <button className="arq-toast-close" onClick={() => dismissToast(t.id)}><Ic.X /></button>
        </div>
      ))}
    </div>
  );
}

const QuestionBlock = memo(function QuestionBlock({ comprehension, instruction, text, options, correctAnswers, explanationText, emptyLabel }) {
  return (
    <>
      {comprehension && (
        <div className="arq-ai-comprehension" dangerouslySetInnerHTML={{ __html: comprehension }} />
      )}
      <div className="arq-ai-q-text">
        {instruction ? <strong>{instruction} </strong> : null}
        <div>
          <MarkdownContent>{text}</MarkdownContent>
        </div>
      </div>
      <div className="arq-ai-options">
        {options.map((opt) => {
          const correct = isCorrectOption(opt.id, correctAnswers);
          return (
            <div key={opt.id} className={`arq-ai-option ${correct ? 'is-correct' : ''}`}>
              <span className="arq-ai-option-marker">{correct ? <Ic.Check /> : null}</span>
                <MarkdownContent>
                  {opt.option}
                </MarkdownContent>
            </div>
          );
        })}
      </div>
      {explanationText && (
        <div className="arq-ai-explanation">
          <div className="arq-ai-explanation-label">Explanation</div>
          <div className="arq-ai-explanation-text">
            <MarkdownContent>
              { explanationText }
            </MarkdownContent>
          </div>
        </div>
      )}
    </>
  );
})

// ─────────────────────────────────────────────────────────────
// Editable question form — shared shape used both for editing an AI
// attempt in place, and for the manual "fix it myself" modal.
// `data` has: comprehension, instruction, questionText (or text),
// options, correctAnswers, explanationText (or explanation.text)
// ─────────────────────────────────────────────────────────────
const EditableQuestionForm = memo(function EditableQuestionForm({
  comprehension, instruction, questionText, options, correctAnswers, explanationText,
  onChangeComprehension, onChangeInstruction, onChangeQuestionText,
  onChangeOptionText, onToggleCorrect, onChangeExplanation,
  onRemoveComprehension, onRemoveInstruction, onRemoveExplanation,
}) {
  return (
    <div className="arq-ai-edit-fields">
      {comprehension !== null && comprehension !== undefined ? (
        <div className="arq-ai-edit-field">
          <div className="arq-ai-edit-field-head">
            <label>Passage</label>
            <button type="button" className="arq-ai-remove-field-btn" onClick={onRemoveComprehension}>
              <Ic.X /> Remove
            </button>
          </div>
          <textarea
            className="arq-ai-textarea"
            rows={4}
            value={comprehension}
            onChange={e => onChangeComprehension(e.target.value)}
          />
        </div>
      ) : (
        <button type="button" className="arq-ai-add-field-btn" onClick={() => onChangeComprehension('')}>
          + Add passage
        </button>
      )}

      {instruction !== null && instruction !== undefined ? (
        <div className="arq-ai-edit-field">
          <div className="arq-ai-edit-field-head">
            <label>Instruction</label>
            <button type="button" className="arq-ai-remove-field-btn" onClick={onRemoveInstruction}>
              <Ic.X /> Remove
            </button>
          </div>
          <input
            type="text"
            className="arq-ai-input"
            value={instruction}
            onChange={e => onChangeInstruction(e.target.value)}
          />
        </div>
      ) : (
        <button type="button" className="arq-ai-add-field-btn" onClick={() => onChangeInstruction('')}>
          + Add instruction
        </button>
      )}

      <div className="arq-ai-edit-field">
        <label>Question text</label>
        <textarea
          className="arq-ai-textarea"
          rows={3}
          value={questionText || ''}
          onChange={e => onChangeQuestionText(e.target.value)}
        />
      </div>

      <div className="arq-ai-edit-field">
        <label>Options — tick the correct one(s)</label>
        {options.map(opt => (
          <div key={opt.id} className="arq-ai-option-edit-row">
            <input
              type="checkbox"
              checked={isCorrectOption(opt.id, correctAnswers)}
              onChange={() => onToggleCorrect(opt.id)}
            />
            <span className="arq-ai-option-edit-label">{opt.id.toUpperCase()}</span>
            <input
              type="text"
              className="arq-ai-input"
              value={opt.option}
              onChange={e => onChangeOptionText(opt.id, e.target.value)}
            />
          </div>
        ))}
      </div>

      {explanationText !== null && explanationText !== undefined ? (
        <div className="arq-ai-edit-field">
          <div className="arq-ai-edit-field-head">
            <label>Explanation</label>
            <button type="button" className="arq-ai-remove-field-btn" onClick={onRemoveExplanation}>
              <Ic.X /> Remove
            </button>
          </div>
          <textarea
            className="arq-ai-textarea"
            rows={4}
            value={explanationText}
            onChange={e => onChangeExplanation(e.target.value)}
          />
        </div>
      ) : (
        <button type="button" className="arq-ai-add-field-btn" onClick={() => onChangeExplanation('')}>
          + Add explanation
        </button>
      )}
    </div>
  );
})

// ─────────────────────────────────────────────────────────────
// AI FIX MODAL — shows existing attempts immediately on open;
// each attempt is individually editable and individually acceptable
// ─────────────────────────────────────────────────────────────
const AIFixModal = memo(function AIFixModal({ report, onClose, onResolve, showToast, onNewAttempt }) {
  const attempts = report.aiSuggestions || []
  const hasExistingAttempts = (report.aiSuggestions || []).length > 0;

  const [stage, setStage] = useState(hasExistingAttempts ? 'review' : 'idle');

  const [messageSource, setMessageSource] = useState('reporter');
  const [customMessage, setCustomMessage] = useState('');

  // Which attempt (by attempt number) is currently in edit mode, and the
  // working copies of any attempts that have been edited so far.
  const [editingAttempt, setEditingAttempt] = useState(null);
  const [editedAttempts, setEditedAttempts] = useState({}); // { [attemptNum]: editedSuggestionObj }

  const q = report.question;
  const qText = getQuestionText(q);
  const qComprehension = getComprehension(q);
  const qInstruction = getInstruction(q);
  const qExplanation = getExplanationText(q);
  
  function activeMessage() {
    return messageSource === 'custom' ? customMessage.trim() : (report.message || '');
  }

  // POST /api/reports/fix — body: { reportId, customMessage? }
  // Response (decrypted): { suggestion, reportStatus }
  async function runAI(messageUsed) {
    setStage('loading');
    try {
      const res = await request.auth('/api/reports/fix', {
        method: 'POST',
        body: JSON.stringify({
          reportId: report._id,
          customMessage: messageSource === 'custom' ? messageUsed : undefined,
        }),
      });
      const { body } = res
      const { suggestion } = decrypt(body.data);
      onNewAttempt(report._id, suggestion)
      setStage('review');
      showToast('success', `Attempt ${suggestion.attempt} ready for review.`);
    } catch (err) {
      console.error(err);
      showToast('error', err.message || 'AI fix failed. Please try again.');
      setStage(attempts.length > 0 ? 'review' : 'idle');
    }
  }

  function startNewAttempt() {
    setCustomMessage('');
    setMessageSource('reporter');
    setStage('newAttempt');
  }

  function send() {
    runAI(activeMessage());
  }

  // ── Editing an existing attempt in place ──
  function startEditAttempt(att) {
    setEditedAttempts(prev => ({
      ...prev,
      [att.attempt]: prev[att.attempt] || deepClone(att),
    }));
    setEditingAttempt(att.attempt);
  }
  function cancelEditAttempt() {
    setEditingAttempt(null);
  }
  function saveEditAttempt() {
    setEditingAttempt(null);
    showToast('success', 'Edits saved for this attempt.');
  }
  function updateEditedField(attemptNum, field, value) {
    setEditedAttempts(prev => ({
      ...prev,
      [attemptNum]: { ...prev[attemptNum], [field]: value },
    }));
  }
  function updateEditedOptionText(attemptNum, optId, text) {
    setEditedAttempts(prev => ({
      ...prev,
      [attemptNum]: {
        ...prev[attemptNum],
        options: prev[attemptNum].options.map(o => o.id === optId ? { ...o, option: text } : o),
      },
    }));
  }
  function toggleEditedCorrect(attemptNum, optId) {
    setEditedAttempts(prev => {
      const current = prev[attemptNum].correctAnswers || [];
      const next = current.includes(optId) ? current.filter(id => id !== optId) : [...current, optId];
      return { ...prev, [attemptNum]: { ...prev[attemptNum], correctAnswers: next } };
    });
  }

  // POST /api/reports/fix/accept — body: { reportId, attempt, overrides? }
  // Backend applies the fix to the Question AND deletes the Report.
  // `overrides`, when present, should be used INSTEAD of the stored
  // attempt data — this is how admin edits to a suggestion get applied.
  // >>> Backend note: acceptAIFix needs a small update to check for
  // `overrides` in the body and prefer it over report.aiSuggestions
  // when building the question update. <<<
  async function accept(attemptObj) {
    const edited = editedAttempts[attemptObj.attempt];
    setStage('accepting');
    try {
      await request.auth('/api/reports/fix/accept', {
        method: 'POST',
        body: JSON.stringify({
          reportId: report._id,
          attempt: attemptObj.attempt,
          overrides: edited || undefined,
        }),
      });
      
      setStage('done');
      showToast('success', 'Question updated and report resolved.');
      setTimeout(() => onResolve(report._id), 900);
    } catch (err) {
      console.error(err);
      showToast('error', err.message || 'Failed to accept fix. Please try again.');
      setStage('review');
    }
  }

  return (
    <div className="arq-ai-overlay" onClick={onClose}>
      <div className="arq-ai-modal" onClick={e => e.stopPropagation()}>

        <div className="arq-ai-head">
          <div className="arq-ai-head-title">
            <div className="arq-ai-head-icon"><Ic.Sparkle /></div>
            Fix question with AI
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            {attempts.length > 0 && <span className="arq-ai-attempt">{attempts.length} attempt{attempts.length > 1 ? 's' : ''}</span>}
            <button className="arq-drawer-close" onClick={onClose}><Ic.X /></button>
          </div>
        </div>

        <div className="arq-ai-body">

          {stage === 'idle' && (
            <div className="arq-ai-idle">
              <div className="arq-ai-question-preview-label">Question to review</div>
              <div className="arq-ai-card" style={{ textAlign: 'left', marginBottom: '1.5rem' }}>
                <QuestionBlock comprehension={qComprehension} instruction={qInstruction} text={qText} options={q.options} correctAnswers={q.correctAnswers} explanationText={qExplanation} />
              </div>

              <div className="arq-ai-question-preview-label">Message to send AI</div>
              <div className="arq-ai-source-toggle">
                <button className={`arq-ai-source-btn ${messageSource === 'reporter' ? 'active' : ''}`} onClick={() => setMessageSource('reporter')}>
                  <Ic.User /> Reporter&apos;s message
                </button>
                <button className={`arq-ai-source-btn ${messageSource === 'custom' ? 'active' : ''}`} onClick={() => setMessageSource('custom')}>
                  <Ic.Edit /> Write my own
                </button>
              </div>

              {messageSource === 'reporter' ? (
                report.message
                  ? <div className="arq-drawer-message" style={{ marginBottom: '1.5rem' }}>{report.message}</div>
                  : <div className="arq-drawer-no-message" style={{ marginBottom: '1.5rem' }}>No description provided</div>
              ) : (
                <textarea
                  className="arq-ai-textarea"
                  rows={5}
                  style={{ marginBottom: '1.5rem' }}
                  placeholder="Describe exactly what's wrong and how it should be fixed…"
                  value={customMessage}
                  onChange={e => setCustomMessage(e.target.value)}
                  autoFocus
                />
              )}

              <button
                className="arq-btn arq-btn-primary"
                onClick={send}
                disabled={messageSource === 'custom' && !customMessage.trim()}
                style={messageSource === 'custom' && !customMessage.trim() ? { opacity: 0.5, cursor: 'not-allowed' } : undefined}
              >
                <Ic.Sparkle /> Send to AI
              </button>
            </div>
          )}

          {stage === 'loading' && (
            <div className="arq-ai-loading">
              <div className="arq-spinner" />
              <div className="arq-ai-loading-text">
                {attempts.length > 0 ? 'Generating a new attempt…' : 'Reading the report and rewriting the question…'}
              </div>
            </div>
          )}

          {(stage === 'review' || stage === 'accepting') && (
            <>
              <div className="arq-ai-question-preview-label">Original question</div>
              <div className="arq-ai-card" style={{ marginBottom: '1.5rem' }}>
                <QuestionBlock comprehension={qComprehension} instruction={qInstruction} text={qText} options={q.options} correctAnswers={q.correctAnswers} explanationText={qExplanation || 'No explanation on file.'} />
              </div>

              {attempts.length > 0 ? (
                <>
                  <div className="arq-ai-question-preview-label">
                    AI suggestions ({attempts.length}) — edit if needed, then pick one to accept
                  </div>
                  <div className="arq-ai-attempts-list">
                    {[...attempts].reverse().map(att => {
                      const isEditing = editingAttempt === att.attempt;
                      const edited = editedAttempts[att.attempt];
                      const display = edited || att;
                      const hasEdits = !!edited;

                      return (
                        <div key={att.attempt} className="arq-ai-attempt-card">
                          <div className="arq-ai-attempt-card-head">
                            <span className="arq-ai-attempt-badge">Attempt {att.attempt}</span>
                            <span className={`arq-ai-confidence-badge ${att.confidence}`}>
                              {att.confidence === 'high' ? 'High confidence' : 'Low confidence'}
                            </span>
                            <span className="arq-ai-attempt-source">
                              {att.messageSource === 'custom' ? <><Ic.Edit /> Custom message</> : <><Ic.User /> Reporter message</>}
                            </span>
                            {hasEdits && !isEditing && (
                              <span className="arq-ai-edited-badge">Edited</span>
                            )}
                          </div>

                          {isEditing ? (
                            <EditableQuestionForm
                              comprehension={display.comprehension}
                              instruction={display.instruction}
                              questionText={display.questionText}
                              options={display.options}
                              correctAnswers={display.correctAnswers}
                              explanationText={display.explanationText}
                              onChangeComprehension={v => updateEditedField(att.attempt, 'comprehension', v)}
                              onChangeInstruction={v => updateEditedField(att.attempt, 'instruction', v)}
                              onChangeQuestionText={v => updateEditedField(att.attempt, 'questionText', v)}
                              onChangeOptionText={(id, v) => updateEditedOptionText(att.attempt, id, v)}
                              onToggleCorrect={id => toggleEditedCorrect(att.attempt, id)}
                              onChangeExplanation={v => updateEditedField(att.attempt, 'explanationText', v)}
                              onRemoveComprehension={() => updateEditedField(att.attempt, 'comprehension', '')}
                              onRemoveInstruction={() => updateEditedField(att.attempt, 'instruction', '')}
                              onRemoveExplanation={() => updateEditedField(att.attempt, 'explanationText', '')}
                            />
                          ) : (
                            <div className="arq-ai-card suggested">
                              <QuestionBlock
                                comprehension={display.comprehension}
                                instruction={display.instruction}
                                text={display.questionText}
                                options={display.options}
                                correctAnswers={display.correctAnswers}
                                explanationText={display.explanationText}
                                emptyLabel="No confident rewrite to show — see note below."
                              />
                            </div>
                          )}

                          {!isEditing && (
                            <div className={`arq-ai-note ${att.confidence === 'low' ? 'low-confidence' : ''}`}>
                              <span className="arq-ai-note-icon">{att.confidence === 'low' ? <Ic.Warn /> : <Ic.Sparkle />}</span>
                              <span>{att.note}</span>
                            </div>
                          )}

                          <div className="arq-ai-attempt-actions">
                            {isEditing ? (
                              <>
                                <button className="arq-btn arq-btn-ghost" onClick={cancelEditAttempt}>Cancel</button>
                                <button className="arq-btn arq-btn-primary" onClick={saveEditAttempt}>
                                  <Ic.Check /> Save edits
                                </button>
                              </>
                            ) : (
                              <>
                                <button className="arq-btn arq-btn-ghost" onClick={() => startEditAttempt(att)}>
                                  <Ic.Edit /> Edit
                                </button>
                                <button
                                  className="arq-btn arq-btn-success"
                                  onClick={() => accept(att)}
                                  disabled={stage === 'accepting'}
                                  style={stage === 'accepting' ? { opacity: 0.6, cursor: 'not-allowed' } : undefined}
                                >
                                  <Ic.Check /> Accept &amp; resolve
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              ) : (
                <div style={{ fontSize: '0.82rem', color: '#94a3b8', fontStyle: 'italic', padding: '0.5rem 0' }}>
                  No attempts yet.
                </div>
              )}
            </>
          )}

          {stage === 'newAttempt' && (
            <div className="arq-ai-edit-block">
              <div className="arq-ai-question-preview-label">Message to send AI</div>
              <div className="arq-ai-source-toggle">
                <button className={`arq-ai-source-btn ${messageSource === 'reporter' ? 'active' : ''}`} onClick={() => setMessageSource('reporter')}>
                  <Ic.User /> Reporter&apos;s message
                </button>
                <button className={`arq-ai-source-btn ${messageSource === 'custom' ? 'active' : ''}`} onClick={() => setMessageSource('custom')}>
                  <Ic.Edit /> Write my own
                </button>
              </div>

              {messageSource === 'reporter' ? (
                report.message
                  ? <div className="arq-drawer-message" style={{ marginBottom: '0.875rem' }}>{report.message}</div>
                  : <div className="arq-drawer-no-message" style={{ marginBottom: '0.875rem' }}>No description provided</div>
              ) : (
                <div className="arq-ai-edit-field">
                  <label>Your message to AI</label>
                  <textarea
                    className="arq-ai-textarea"
                    rows={5}
                    placeholder="Tell the AI exactly what's still wrong and how to fix it…"
                    value={customMessage}
                    onChange={e => setCustomMessage(e.target.value)}
                    autoFocus
                  />
                </div>
              )}
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted, #64748b)', lineHeight: 1.5 }}>
                This generates a new attempt — previous attempts stay available.
              </p>
            </div>
          )}

          {stage === 'done' && (
            <div className="arq-ai-done">
              <div className="arq-ai-done-icon"><Ic.Check /></div>
              <div className="arq-ai-done-text">Question updated</div>
              <div className="arq-ai-done-sub">Removing this report from your queue…</div>
            </div>
          )}
        </div>

        {(stage === 'review' || stage === 'accepting') && (
          <div className="arq-ai-footer">
            <button className="arq-btn arq-btn-ghost" onClick={onClose}>Cancel</button>
            <button className="arq-btn arq-btn-ghost" onClick={startNewAttempt} disabled={stage === 'accepting'}>
              <Ic.Refresh /> Get another suggestion
            </button>
          </div>
        )}

        {stage === 'newAttempt' && (
          <div className="arq-ai-footer">
            <button className="arq-btn arq-btn-ghost" onClick={() => setStage(attempts.length > 0 ? 'review' : 'idle')}>
              Cancel
            </button>
            <button
              className="arq-btn arq-btn-primary"
              onClick={send}
              disabled={messageSource === 'custom' && !customMessage.trim()}
              style={messageSource === 'custom' && !customMessage.trim() ? { opacity: 0.5, cursor: 'not-allowed' } : undefined}
            >
              <Ic.Sparkle /> Send to AI
            </button>
          </div>
        )}
      </div>
    </div>
  );
})

// ─────────────────────────────────────────────────────────────
// MANUAL FIX MODAL — edit the reported question directly, no AI
// ─────────────────────────────────────────────────────────────
const ManualFixModal = memo(function ManualFixModal({ report, onClose, onResolve, showToast }) {
  const q = report.question;

  const [stage, setStage] = useState('editing'); // editing | saving | done

  const [data, setData] = useState(() => ({
    comprehension: q.comprehension ?? null,
    instruction: q.instruction ?? null,
    questionText: q.text,
    options: deepClone(q.options),
    correctAnswers: [...q.correctAnswers],
    explanationText: q.explanation?.text ?? null,
  }));

  function updateField(field, value) {
    setData(prev => ({ ...prev, [field]: value }));
  }
  function updateOptionText(optId, text) {
    setData(prev => ({
      ...prev,
      options: prev.options.map(o => o.id === optId ? { ...o, option: text } : o),
    }));
  }
  function toggleCorrect(optId) {
    setData(prev => {
      const current = prev.correctAnswers || [];
      const next = current.includes(optId) ? current.filter(id => id !== optId) : [...current, optId];
      return { ...prev, correctAnswers: next };
    });
  }

  // POST /api/reports/fix/manual — body: { reportId, question: {...} }
  // >>> Backend note: this is a NEW endpoint, structurally similar to
  // acceptAIFix — it should apply `question` directly to the Question
  // document matching report.questionId, then delete the Report, same
  // as accept does for AI suggestions. <<<
  async function save() {
    if (!data.questionText.trim()) {
      showToast('error', 'Question text cannot be empty.');
      return;
    }
    if (data.correctAnswers.length === 0) {
      showToast('error', 'Select at least one correct answer.');
      return;
    }

    setStage('saving');
    try {
      await request.auth('/api/reports/fix/manual', {
        method: 'POST',
        body: JSON.stringify({
          reportId: report._id,
          question: {
            comprehension: data.comprehension,
            instruction: data.instruction,
            text: data.questionText,
            options: data.options,
            correctAnswers: data.correctAnswers,
            explanation: { text: data.explanationText, image: q.explanation?.image || null },
          },
        }),
      });
      
      setStage('done');
      showToast('success', 'Question updated and report resolved.');
      setTimeout(() => onResolve(report._id), 900);
    } catch (err) {
      console.error(err);
      showToast('error', err.message || 'Failed to save manual fix. Please try again.');
      setStage('editing');
    }
  }

  return (
    <div className="arq-ai-overlay" onClick={onClose}>
      <div className="arq-ai-modal" onClick={e => e.stopPropagation()}>

        <div className="arq-ai-head">
          <div className="arq-ai-head-title">
            <div className="arq-ai-head-icon"><Ic.Wrench /></div>
            Fix question manually
          </div>
          <button className="arq-drawer-close" onClick={onClose}><Ic.X /></button>
        </div>

        <div className="arq-ai-body">
          {stage === 'editing' && (
            <EditableQuestionForm
              comprehension={data.comprehension}
              instruction={data.instruction}
              questionText={data.questionText}
              options={data.options}
              correctAnswers={data.correctAnswers}
              explanationText={data.explanationText}
              onChangeComprehension={v => updateField('comprehension', v)}
              onChangeInstruction={v => updateField('instruction', v)}
              onChangeQuestionText={v => updateField('questionText', v)}
              onChangeOptionText={updateOptionText}
              onToggleCorrect={toggleCorrect}
              onChangeExplanation={v => updateField('explanationText', v)}
              onRemoveComprehension={() => updateField('comprehension', null)}
              onRemoveInstruction={() => updateField('instruction', null)}
              onRemoveExplanation={() => updateField('explanationText', null)}
            />
          )}

          {stage === 'saving' && (
            <div className="arq-ai-loading">
              <div className="arq-spinner" />
              <div className="arq-ai-loading-text">Saving your changes…</div>
            </div>
          )}

          {stage === 'done' && (
            <div className="arq-ai-done">
              <div className="arq-ai-done-icon"><Ic.Check /></div>
              <div className="arq-ai-done-text">Question updated</div>
              <div className="arq-ai-done-sub">Removing this report from your queue…</div>
            </div>
          )}
        </div>

        {stage === 'editing' && (
          <div className="arq-ai-footer">
            <button className="arq-btn arq-btn-ghost" onClick={onClose}>Cancel</button>
            <button className="arq-btn arq-btn-success" onClick={save}>
              <Ic.Check /> Save &amp; resolve
            </button>
          </div>
        )}
      </div>
    </div>
  );
})

// ─────────────────────────────────────────────────────────────
// DETAIL DRAWER
// ─────────────────────────────────────────────────────────────
const ReportDrawer = memo(function ReportDrawer({ report, onClose, onStatusChange, onDelete, onFixAI, onManualFix }) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const statusMeta = STATUS_META[report.status];
  const q = report.question;

  function handleStatusChange(newStatus) {
    onStatusChange(report._id, newStatus);
  }

  return (
    <>
      <div className="arq-drawer-mask" onClick={onClose}>
        <div className="arq-drawer" onClick={e => e.stopPropagation()}>

          <div className="arq-drawer-head">
            <div className="arq-drawer-head-top">
              <div>
                <div className="arq-drawer-head-title">Report details</div>
                <div className="arq-drawer-head-sub">ID: {report._id}</div>
              </div>
              <button className="arq-drawer-close" onClick={onClose}><Ic.X /></button>
            </div>
            <div className="arq-drawer-meta">
              <span className="arq-status" style={{ background: statusMeta.bg, color: statusMeta.color }}>
                <span className="arq-status-dot" style={{ background: statusMeta.dot }} />
                {statusMeta.label}
              </span>
              <span className="arq-drawer-chip primary"><Ic.Hash /> {report.questionId}</span>
              <span className="arq-drawer-chip">{report.subject}</span>
              <span className="arq-drawer-chip">Year: {q.year}</span>
              <span className="arq-drawer-chip"><Ic.Clock /> {fmtDate(report.createdAt)}</span>
            </div>
          </div>

          <div className="arq-drawer-body">

            <div className="arq-drawer-section-label">Reporter</div>
            <div className="arq-drawer-user-card">
              <div className="arq-drawer-user-avatar">{initials(report.user.name)}</div>
              <div>
                <div className="arq-drawer-user-name">{report.user.name}</div>
                <div className="arq-drawer-user-email">{report.user.email}</div>
              </div>
            </div>

            <div className="arq-drawer-section-label">Issue types</div>
            <div className="arq-drawer-cats">
              {report.categories.length > 0
                ? report.categories.map(c => (
                    <span key={c} className="arq-drawer-cat"><Ic.Check /> {CATEGORY_LABELS[c] || c}</span>
                  ))
                : <span style={{ fontSize: '0.82rem', color: '#94a3b8' }}>No category selected</span>
              }
            </div>

            <div className="arq-drawer-section-label">User&apos;s description</div>
            {report.message
              ? <div className="arq-drawer-message">{report.message}</div>
              : <div className="arq-drawer-no-message">No description provided</div>
            }

            <div className="arq-drawer-section-label">Current question</div>
            <div className="arq-ai-card" style={{ marginBottom: '1.25rem' }}>
              <QuestionBlock
                comprehension={getComprehension(q)}
                instruction={getInstruction(q)}
                text={getQuestionText(q)}
                options={q.options}
                correctAnswers={q.correctAnswers}
                explanationText={getExplanationText(q)}
              />
            </div>

            {report.aiSuggestions?.length > 0 && (
              <>
                <div className="arq-drawer-section-label">
                  AI attempt history ({report.aiSuggestions.length})
                </div>
                <div style={{ marginBottom: '1.25rem' }}>
                  {report.aiSuggestions.map(s => (
                    <div key={s.attempt} className="arq-drawer-message" style={{ marginBottom: '0.5rem' }}>
                      <strong>Attempt {s.attempt}</strong> ({s.messageSource}) — {s.note}
                    </div>
                  ))}
                </div>
              </>
            )}

            <div className="arq-drawer-section-label">Question details</div>
            <div className="arq-drawer-info-grid">
              <span className="arq-drawer-info-key">Question ID</span>
              <span className="arq-drawer-info-val" style={{ fontFamily: 'monospace', fontSize: '0.82rem' }}>{report.questionId}</span>
              <span className="arq-drawer-info-key">Subject</span>
              <span className="arq-drawer-info-val">{report.subject}</span>
              <span className="arq-drawer-info-key">Topic</span>
              <span className="arq-drawer-info-val">{q.topic || '—'}</span>
              <span className="arq-drawer-info-key">Year</span>
              <span className="arq-drawer-info-val">{q.year}</span>
              <span className="arq-drawer-info-key">Exam</span>
              <span className="arq-drawer-info-val">{report.examType}</span>
              <span className="arq-drawer-info-key">Submitted</span>
              <span className="arq-drawer-info-val">{fmtDateFull(report.createdAt)}</span>
            </div>

          </div>

          <div className="arq-drawer-footer">
            {canFix(report.status) && (
              <button className="arq-btn arq-btn-primary" onClick={() => onFixAI(report)}>
                <Ic.Sparkle /> Fix with AI
              </button>
            )}
            {canFix(report.status) && (
              <button className="arq-btn arq-btn-ghost" onClick={() => onManualFix(report)}>
                <Ic.Wrench /> Fix it myself
              </button>
            )}
            {report.status !== 'reviewing' && report.status !== 'resolved' && (
              <button className="arq-btn arq-btn-warning" onClick={() => handleStatusChange('reviewing')}>
                <Ic.Eye /> Mark reviewing
              </button>
            )}
            {report.status !== 'dismissed' && report.status !== 'resolved' && (
              <button className="arq-btn arq-btn-ghost" onClick={() => handleStatusChange('dismissed')}>
                Dismiss
              </button>
            )}
            {report.status === 'dismissed' && (
              <button className="arq-btn arq-btn-ghost" onClick={() => handleStatusChange('open')}>
                Reopen
              </button>
            )}
            <button className="arq-btn arq-btn-danger" style={{ marginLeft: 'auto' }} onClick={() => setConfirmDelete(true)}>
              <Ic.Trash /> Delete
            </button>
          </div>
        </div>
      </div>

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
})

// ─────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────
export default function Report() {
  const { setPage } = adminStore()
  const [reports, setReports]         = useState([]);
  const [filter, setFilter]           = useState('all');
  const [search, setSearch]           = useState('');
  const [sort, setSort]               = useState('newest');
  const [selected, setSelected]       = useState(null);
  const [aiTarget, setAiTarget]       = useState(null);
  const [manualTarget, setManualTarget] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [attempts, setAttempts] = useState([]);
  const { toasts, showToast, dismissToast } = useToasts();
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setPage('reports');

    // GET /api/reports — loads the report queue
    async function loadReports() {
      try {
        const res = await request.auth('/api/reports/', { method: 'GET' });
        const data = res.body
        setReports(data);
      } catch (err) {
        console.error('Error:', err);
        showToast('error', err.message || 'Failed to load reports.');
      } finally{
        setLoading(false)
      }
    }
    loadReports();

    function onKey(e) {
      if (e.key !== 'Escape') return;
      if (aiTarget) { setAiTarget(null); return; }
      if (manualTarget) { setManualTarget(null); return; }
      setSelected(null);
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setPage]);

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
          (r.message || '').toLowerCase().includes(q)
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
    
    function handleNewAttempt(reportId, suggestion) {
      setReports(prev => prev.map(r =>
        r._id === reportId
          ? { ...r, aiSuggestions: [...(r.aiSuggestions || []), suggestion] }
          : r
      ));
      if (selected?._id === reportId) {
        setSelected(r => ({ ...r, aiSuggestions: [...(r.aiSuggestions || []), suggestion] }));
      }
      if (aiTarget?._id === reportId) {
        setAiTarget(r => ({ ...r, aiSuggestions: [...(r.aiSuggestions || []), suggestion] }));
      }
    }

  // PUT /api/reports/:id/:status
  async function handleStatusChange(id, newStatus) {
    try {
      await request.auth(`/api/reports/${id}/${newStatus}`, { method: 'PUT' });
      setReports(prev => prev.map(r => r._id === id ? { ...r, status: newStatus } : r));
      if (selected?._id === id) setSelected(r => ({ ...r, status: newStatus }));
      showToast('success', `Report marked as ${newStatus}.`);
    } catch (err) {
      console.error('Error:', err);
      showToast('error', err.message || 'Failed to update report status.');
    }
  }

  // DELETE /api/reports/:id
  async function handleDelete(id) {
    try {
      await request.auth(`/api/reports/${id}`, { method: 'DELETE' });
      
      setReports(prev => prev.filter(r => r._id !== id));
      if (selected?._id === id) setSelected(null);
      showToast('success', 'Report deleted.');
    } catch (err) {
      console.error('Error:', err);
      showToast('error', err.message || 'Failed to delete report.');
    }
  }

  // Called by AIFixModal / ManualFixModal after their accept/save succeeds —
  // backend already updated the Question and deleted the Report, so this
  // just syncs local state.
  function handleResolve(id) {
    setReports(prev => prev.filter(r => r._id !== id));
    if (selected?._id === id) setSelected(null);
    setAiTarget(null);
    setManualTarget(null);
  }
  
  if (loading){
    return <Loading />
  }

  return (
    <div className="arq-page">
      <title>Reports | CBT Pro Admin</title>

      <Nav sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <nav>
        <div className="nav-container">
          <div className="nav-content">
            <span className="arq-menu" onClick={() => setSidebarOpen(prev => !prev)}>
              <Ic.Menu />
            </span>
          </div>
        </div>
      </nav>

      <div className="page-header">
        <div className="nav-container">
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', margin: 0 }}>
            Question Reports
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.375rem' }}>
            Review complaints, fix questions with AI assistance, and resolve them
          </p>
        </div>
      </div>

      <div className="arq-container">

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
                    <tr key={r._id} className={isActive ? 'arq-row-selected' : ''} onClick={() => setSelected(r)}>
                      <td>
                        <div className="arq-subject-cell">
                          <div className="arq-subject-dot" style={{ background: `linear-gradient(135deg, ${col.from}, ${col.to})` }}>
                            {r.subject.slice(0, 2).toUpperCase()}
                          </div>
                          <div><div className="arq-subject-name">{r.subject}</div></div>
                        </div>
                      </td>
                      <td>
                        <div className="arq-user-cell">
                          <div className="arq-user-avatar">{initials(r.user.name)}</div>
                          <div className="arq-user-name">{r.user.name}</div>
                        </div>
                      </td>
                      <td>
                        <div className="arq-cats-cell">
                          {r.categories.length > 0
                            ? r.categories.map(c => <span key={c} className="arq-cat-chip">{CATEGORY_LABELS[c]}</span>)
                            : <span className="arq-cat-chip" style={{ color: '#cbd5e1' }}>—</span>
                          }
                        </div>
                      </td>
                      <td>
                        {r.message
                          ? <div className="arq-preview">{r.message}</div>
                          : <div className="arq-preview-empty">No description</div>
                        }
                      </td>
                      <td>
                        <span className="arq-status" style={{ background: sMeta.bg, color: sMeta.color }}>
                          <span className="arq-status-dot" style={{ background: sMeta.dot }} />
                          {sMeta.label}
                        </span>
                      </td>
                      <td><div className="arq-date">{fmtDate(r.createdAt)}</div></td>
                      <td onClick={e => e.stopPropagation()}>
                        <div className="arq-actions-cell">
                          <button className="arq-icon-btn" title="View details" onClick={() => setSelected(r)}>
                            <Ic.Eye />
                          </button>
                          {canFix(r.status) && (
                            <button className="arq-icon-btn ai" title="Fix with AI" onClick={() => setAiTarget(r)}>
                              <Ic.Sparkle />
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

      {selected && (
        <ReportDrawer
          report={selected}
          onClose={() => setSelected(null)}
          onStatusChange={handleStatusChange}
          onDelete={handleDelete}
          onFixAI={(r) => setAiTarget(r)}
          onManualFix={(r) => setManualTarget(r)}
        />
      )}

      {aiTarget && (
        <AIFixModal
          report={aiTarget}
          onClose={() => setAiTarget(null)}
          onResolve={handleResolve}
          showToast={showToast}
          onNewAttempt={handleNewAttempt}
        />
      )}

      {manualTarget && (
        <ManualFixModal
          report={manualTarget}
          onClose={() => setManualTarget(null)}
          onResolve={handleResolve}
          showToast={showToast}
        />
      )}

      <ToastContainer toasts={toasts} dismissToast={dismissToast} />
    </div>
  );
}
