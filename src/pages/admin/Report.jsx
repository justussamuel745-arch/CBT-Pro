import { useState, useEffect, useContext } from 'react';
import './Report.css';
import UserContext from '../../context/UserContext';
import { useAdminContext } from '../../context/AdminContext';
import { Nav } from './Nav';
// NOTE: fetchReports / fetchWithAuth are no longer called directly in this file —
// this page currently runs on SAMPLE_REPORTS below so the AI-fix flow can be
// reviewed end to end. Swap SAMPLE_REPORTS for a real fetchReports() call and
// re-wire handleStatusChange / handleDelete / handleAIResolve to fetchWithAuth
// when the backend endpoints are ready.
// import { fetchReports } from './utils/adminFetch';
// import { fetchWithAuth } from '../../scripts/utilis/fetch';

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
// SAMPLE DATA — replace with your real reports (and each report's
// linked question: { text, options, answerIndex }) once wired to the API.
// ─────────────────────────────────────────────────────────────
const SAMPLE_REPORTS = [
  {
    _id: 'r1',
    subject: 'Mathematics',
    questionId: 'MTH-2019-014',
    examType: 'JAMB',
    status: 'open',
    categories: ['wrong_answer', 'typo'],
    message: "The marked answer is wrong, it should be x = 6. Also there's a typo in the question — 'vaule' should be 'value'.",
    createdAt: new Date(Date.now() - 1000 * 60 * 42).toISOString(),
    user: { name: 'Amaka Obi', email: 'amaka.obi@example.com' },
    question: {
      text: 'If 2x + 5 = 17, find the vaule of x.',
      options: ['x = 5', 'x = 6', 'x = 7', 'x = 8'],
      answerIndex: 0,
      explanation: 'Divide both sides by 2 to get x = 5.',
    },
  },
  {
    _id: 'r2',
    subject: 'English Language',
    questionId: 'ENG-2021-102',
    examType: 'JAMB',
    status: 'open',
    categories: ['unclear'],
    message: "It says 'the underlined word' but nothing in the sentence is underlined — students don't know what to pick.",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    user: { name: 'Tunde Bakare', email: 'tunde.bakare@example.com' },
    question: {
      text: "Choose the word that is nearest in meaning to the underlined word: The politician's speech was full of vitriol.",
      options: ['Kindness', 'Bitterness', 'Humor', 'Silence'],
      answerIndex: 1,
      explanation: 'Vitriol means bitterness or hostility.',
    },
  },
  {
    _id: 'r3',
    subject: 'Physics',
    questionId: 'PHY-2020-045',
    examType: 'JAMB',
    status: 'open',
    categories: ['missing_option'],
    message: 'This question only has 3 options, every other question in this set has 4.',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString(),
    user: { name: 'Chiamaka Eze', email: 'chiamaka.eze@example.com' },
    question: {
      text: 'A body of mass 5 kg accelerates at 2 m/s². Calculate the force acting on it.',
      options: ['5 N', '10 N', '15 N'],
      answerIndex: 1,
      explanation: 'Force = mass × acceleration = 5 × 2 = 10N.',
    },
  },
  {
    _id: 'r4',
    subject: 'Chemistry',
    questionId: 'CHM-2018-077',
    examType: 'JAMB',
    status: 'reviewing',
    categories: ['wrong_image'],
    message: "The question refers to 'the diagram above' but no diagram is shown — I can't answer it.",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString(),
    user: { name: 'Bello Yusuf', email: 'bello.yusuf@example.com' },
    question: {
      text: 'Identify the compound represented in the diagram above.',
      options: ['Ethanol', 'Ethanoic acid', 'Ethane', 'Ethene'],
      answerIndex: 0,
      explanation: 'See the diagram for the functional group that identifies this compound.',
    },
  },
  {
    _id: 'r5',
    subject: 'Economics',
    questionId: 'ECN-2020-033',
    examType: 'JAMB',
    status: 'resolved',
    categories: ['wrong_answer'],
    message: 'Answer key had option B, but it should be option D.',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    user: { name: 'Grace Adamu', email: 'grace.adamu@example.com' },
    question: {
      text: 'Which of the following is NOT a factor of production?',
      options: ['Land', 'Labour', 'Capital', 'Money'],
      answerIndex: 3,
      explanation: 'The 4 factors of production are land, labour, capital, and entrepreneurship — money is a medium of exchange, not a factor itself.',
    },
  },
  {
    _id: 'r6',
    subject: 'Government',
    questionId: 'GOV-2019-061',
    examType: 'JAMB',
    status: 'dismissed',
    categories: ['other'],
    message: 'I just find this topic confusing in general, not sure if the question itself is wrong.',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
    user: { name: 'Ifeanyi Nwosu', email: 'ifeanyi.nwosu@example.com' },
    question: {
      text: 'Which arm of government is responsible for interpreting the law?',
      options: ['Legislature', 'Executive', 'Judiciary', 'Civil Service'],
      answerIndex: 2,
      explanation: 'The judiciary interprets and applies the law; the legislature makes it and the executive enforces it.',
    },
  },
];

// ─────────────────────────────────────────────────────────────
// MOCK AI — replace with a real call to your AI question-fix endpoint.
// Keyed by report id so the demo is deterministic; a real endpoint would
// take (question, report.message, report.categories) and return the same shape.
// ─────────────────────────────────────────────────────────────
const AI_PRESETS = {
  r1: {
    confidence: 'high',
    text: 'If 2x + 5 = 17, find the value of x.',
    options: ['x = 5', 'x = 6', 'x = 7', 'x = 8'],
    answerIndex: 1,
    explanation: 'Subtract 5 from both sides: 2x = 12. Divide both sides by 2 to get x = 6.',
    note: 'Fixed the typo "vaule" → "value" and corrected the marked answer to x = 6, the only option that satisfies 2x + 5 = 17. The explanation was also rewritten to match.',
  },
  r2: {
    confidence: 'high',
    text: "Choose the word nearest in meaning to \"vitriol\" as used in: \"The politician's speech was full of vitriol.\"",
    options: ['Kindness', 'Bitterness', 'Humor', 'Silence'],
    answerIndex: 1,
    explanation: 'Vitriol means bitter criticism or hostility, so "bitterness" is the closest match in meaning.',
    note: 'Removed the ambiguous "underlined word" phrasing and named the target word directly, since the sentence had no visible underline. Explanation expanded slightly for clarity.',
  },
  r3: {
    confidence: 'high',
    text: 'A body of mass 5 kg accelerates at 2 m/s². Calculate the force acting on it.',
    options: ['5 N', '10 N', '15 N', '20 N'],
    answerIndex: 1,
    explanation: 'Using Newton\'s second law: F = ma = 5 kg × 2 m/s² = 10 N.',
    note: 'Added a fourth distractor ("20 N") so the question follows the standard 4-option format. Answer unchanged: F = ma = 5 × 2 = 10 N.',
  },
  r4: {
    confidence: 'low',
    text: null,
    options: null,
    answerIndex: null,
    explanation: null,
    note: "This question refers to a diagram that isn't attached to the report, so I can't verify or rewrite it confidently. Add more context in your own message and resend, or attach the source image.",
  },
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
  Menu:    () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 12h18M3 6h18M3 18h18" /></svg>,
  Sparkle: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M18.4 5.6l-2.8 2.8M8.4 15.6l-2.8 2.8"/></svg>,
  Edit:    () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>,
  Refresh: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>,
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

function canFix(status) {
  return status === 'open' || status === 'reviewing';
}

const FILTERS = ['all', 'open', 'reviewing', 'resolved', 'dismissed'];

// ─────────────────────────────────────────────────────────────
// AI FIX MODAL
// ─────────────────────────────────────────────────────────────
function AIFixModal({ report, onClose, onResolve }) {
  const [stage, setStage]             = useState('idle'); // idle | loading | review | editing | done
  const [suggestion, setSuggestion]   = useState(null);
  const [attempt, setAttempt]         = useState(1);
  const [customMessage, setCustomMessage] = useState('');

  const q = report.question;

  // `instruction` is an optional admin-written message used instead of (or in
  // addition to) the reporter's own description — for when that description
  // wasn't clear enough for the AI to land on the right fix the first time.
  function runAI(instruction) {
    setStage('loading');
    setTimeout(() => {
      let result;
      const preset = AI_PRESETS[report._id];

      if (instruction) {
        // Mock: swap this branch for a real "resend with instruction" API call
        // that passes { question, report, instruction } to the AI endpoint.
        if (preset && preset.text) {
          result = {
            ...preset,
            confidence: 'high',
            note: `Refined using your message: "${instruction}"`,
          };
        } else {
          // Previously low-confidence / no rewrite — the admin's own message
          // gives the AI enough to work with now.
          result = {
            confidence: 'high',
            text: q.text,
            options: q.options,
            answerIndex: q.answerIndex,
            explanation: q.explanation,
            note: `Used your message to resolve this: "${instruction}"`,
          };
        }
      } else {
        result = preset || {
          confidence: 'low',
          text: null,
          options: null,
          answerIndex: null,
          explanation: null,
          note: "I couldn't confidently determine a fix from this report. Try sending your own message with more context.",
        };
      }
      setSuggestion(result);
      setStage('review');
    }, 1400);
  }

  function startEdit() {
    setCustomMessage(report.message || '');
    setStage('editing');
  }

  function resend() {
    setAttempt(a => a + 1);
    runAI(customMessage.trim());
  }

  function accept() {
    setStage('done');
    setTimeout(() => {
      onResolve(report._id, {
        text: suggestion.text,
        options: suggestion.options,
        answerIndex: suggestion.answerIndex,
        explanation: suggestion.explanation,
      });
    }, 1000);
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
            {attempt > 1 && <span className="arq-ai-attempt">Attempt {attempt}</span>}
            <button className="arq-drawer-close" onClick={onClose}><Ic.X /></button>
          </div>
        </div>

        <div className="arq-ai-body">

          {stage === 'idle' && (
            <div className="arq-ai-idle">
              <div className="arq-ai-question-preview-label">Question to review</div>
              <div className="arq-ai-card" style={{ textAlign: 'left', marginBottom: '1.5rem' }}>
                <div className="arq-ai-q-text">{q.text}</div>
                <div className="arq-ai-options">
                  {q.options.map((opt, i) => (
                    <div key={i} className={`arq-ai-option ${i === q.answerIndex ? 'is-correct' : ''}`}>
                      <span className="arq-ai-option-marker">{i === q.answerIndex ? <Ic.Check /> : null}</span>
                      {opt}
                    </div>
                  ))}
                </div>
                {q.explanation && (
                  <div className="arq-ai-explanation">
                    <div className="arq-ai-explanation-label">Explanation</div>
                    <div className="arq-ai-explanation-text">{q.explanation}</div>
                  </div>
                )}
              </div>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted, #64748b)', marginBottom: '1.25rem', lineHeight: 1.55 }}>
                AI will read the reporter&apos;s description below and suggest a corrected version of this question for you to review.
              </p>
              <div className="arq-drawer-message" style={{ marginBottom: '1.5rem' }}>
                &quot;{report.message}&quot;
              </div>
              <button className="arq-btn arq-btn-primary" onClick={() => runAI()}>
                <Ic.Sparkle /> Send to AI
              </button>
            </div>
          )}

          {stage === 'loading' && (
            <div className="arq-ai-loading">
              <div className="arq-spinner" />
              <div className="arq-ai-loading-text">
                {attempt > 1 ? 'Re-checking your edits…' : 'Reading the report and rewriting the question…'}
              </div>
            </div>
          )}

          {stage === 'review' && suggestion && (
            <>
              <div className="arq-ai-compare">
                <div className="arq-ai-card">
                  <div className="arq-ai-card-label original"><Ic.Hash /> Original</div>
                  <div className="arq-ai-q-text">{q.text}</div>
                  <div className="arq-ai-options">
                    {q.options.map((opt, i) => (
                      <div key={i} className={`arq-ai-option ${i === q.answerIndex ? 'is-correct' : ''}`}>
                        <span className="arq-ai-option-marker">{i === q.answerIndex ? <Ic.Check /> : null}</span>
                        {opt}
                      </div>
                    ))}
                  </div>
                  <div className="arq-ai-explanation">
                    <div className="arq-ai-explanation-label">Explanation</div>
                    <div className="arq-ai-explanation-text">{q.explanation || 'No explanation on file.'}</div>
                  </div>
                </div>

                <div className="arq-ai-card suggested">
                  <div className="arq-ai-card-label suggested"><Ic.Sparkle /> AI suggested update</div>
                  {suggestion.text ? (
                    <>
                      <div className="arq-ai-q-text">{suggestion.text}</div>
                      <div className="arq-ai-options">
                        {suggestion.options.map((opt, i) => (
                          <div key={i} className={`arq-ai-option ${i === suggestion.answerIndex ? 'is-correct' : ''}`}>
                            <span className="arq-ai-option-marker">{i === suggestion.answerIndex ? <Ic.Check /> : null}</span>
                            {opt}
                          </div>
                        ))}
                      </div>
                      <div className="arq-ai-explanation">
                        <div className="arq-ai-explanation-label">Explanation</div>
                        <div className="arq-ai-explanation-text">{suggestion.explanation || 'No explanation change proposed.'}</div>
                      </div>
                    </>
                  ) : (
                    <div style={{ fontSize: '0.82rem', color: '#94a3b8', fontStyle: 'italic', padding: '0.5rem 0' }}>
                      No confident rewrite to show — see note below.
                    </div>
                  )}
                </div>
              </div>

              <div className={`arq-ai-note ${suggestion.confidence === 'low' ? 'low-confidence' : ''}`}>
                <span className="arq-ai-note-icon">{suggestion.confidence === 'low' ? <Ic.Warn /> : <Ic.Sparkle />}</span>
                <span>{suggestion.note}</span>
              </div>
            </>
          )}

          {stage === 'editing' && (
            <div className="arq-ai-edit-block">
              <div className="arq-ai-edit-field">
                <label>Your message to AI</label>
                <textarea
                  className="arq-ai-textarea"
                  rows={5}
                  placeholder="The reporter's description wasn't accurate enough — tell the AI what's actually wrong and what it should fix…"
                  value={customMessage}
                  onChange={e => setCustomMessage(e.target.value)}
                  autoFocus
                />
              </div>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted, #64748b)', lineHeight: 1.5 }}>
                This replaces the reporter's description for this attempt — write exactly what's wrong and how to fix it.
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

        {stage === 'review' && (
          <div className="arq-ai-footer">
            <button className="arq-btn arq-btn-ghost" onClick={onClose}>Cancel</button>
            <button className="arq-btn arq-btn-ghost" onClick={startEdit}>
              <Ic.Edit /> Not accurate — send my own message
            </button>
            {suggestion.confidence !== 'low' && (
              <button className="arq-btn arq-btn-success" onClick={accept}>
                <Ic.Check /> Accept &amp; resolve
              </button>
            )}
          </div>
        )}

        {stage === 'editing' && (
          <div className="arq-ai-footer">
            <button className="arq-btn arq-btn-ghost" onClick={() => setStage('review')}>Cancel edit</button>
            <button
              className="arq-btn arq-btn-primary"
              onClick={resend}
              disabled={!customMessage.trim()}
              style={!customMessage.trim() ? { opacity: 0.5, cursor: 'not-allowed' } : undefined}
            >
              <Ic.Refresh /> Resend to AI
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// DETAIL DRAWER
// ─────────────────────────────────────────────────────────────
function ReportDrawer({ report, onClose, onStatusChange, onDelete, onFixAI }) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const statusMeta = STATUS_META[report.status];

  function handleStatusChange(newStatus) {
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

            {/* Current question */}
            <div className="arq-drawer-section-label">Current question</div>
            <div className="arq-ai-card" style={{ marginBottom: '1.25rem' }}>
              <div className="arq-ai-q-text">{report.question.text}</div>
              <div className="arq-ai-options">
                {report.question.options.map((opt, i) => (
                  <div key={i} className={`arq-ai-option ${i === report.question.answerIndex ? 'is-correct' : ''}`}>
                    <span className="arq-ai-option-marker">{i === report.question.answerIndex ? <Ic.Check /> : null}</span>
                    {opt}
                  </div>
                ))}
              </div>
              {report.question.explanation && (
                <div className="arq-ai-explanation">
                  <div className="arq-ai-explanation-label">Explanation</div>
                  <div className="arq-ai-explanation-text">{report.question.explanation}</div>
                </div>
              )}
            </div>

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

          </div>

          {/* Footer actions */}
          <div className="arq-drawer-footer">
            {canFix(report.status) && (
              <button className="arq-btn arq-btn-primary" onClick={() => onFixAI(report)}>
                <Ic.Sparkle /> Fix with AI
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
export function Report() {
  const { token, setToken } = useContext(UserContext);
  const { setPage } = useAdminContext();
  const [reports, setReports]         = useState(SAMPLE_REPORTS);
  const [filter, setFilter]           = useState('all');
  const [search, setSearch]           = useState('');
  const [sort, setSort]               = useState('newest');
  const [selected, setSelected]       = useState(null);
  const [aiTarget, setAiTarget]       = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Close drawer / AI modal on Escape
  useEffect(() => {
    setPage('reports');
    function onKey(e) {
      if (e.key !== 'Escape') return;
      if (aiTarget) { setAiTarget(null); return; }
      setSelected(null);
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [setPage, aiTarget]);

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

  // TODO: replace with a real PUT /api/reports/${id}/${newStatus} call via fetchWithAuth
  function handleStatusChange(id, newStatus) {
    setReports(prev => prev.map(r => r._id === id ? { ...r, status: newStatus } : r));
    if (selected?._id === id) setSelected(r => ({ ...r, status: newStatus }));
  }

  // TODO: replace with a real DELETE /api/reports/${id} call via fetchWithAuth
  function handleDelete(id) {
    setReports(prev => prev.filter(r => r._id !== id));
    if (selected?._id === id) setSelected(null);
  }

  // Called once the admin accepts an AI-suggested fix. In production this should:
  //  1. PATCH the actual question in the question bank with `updatedQuestion`
  //  2. PUT the report status to 'resolved' (or DELETE it) on the backend
  // Here we just drop it from the local list since it's resolved.
  function handleAIResolve(id, updatedQuestion) {
    console.log('Resolved with AI update:', id, updatedQuestion);
    setReports(prev => prev.filter(r => r._id !== id));
    if (selected?._id === id) setSelected(null);
    setAiTarget(null);
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
            Review complaints, fix questions with AI assistance, and resolve them
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

      {/* ── DETAIL DRAWER ── */}
      {selected && (
        <ReportDrawer
          report={selected}
          onClose={() => setSelected(null)}
          onStatusChange={handleStatusChange}
          onDelete={handleDelete}
          onFixAI={(r) => setAiTarget(r)}
        />
      )}

      {/* ── AI FIX MODAL ── */}
      {aiTarget && (
        <AIFixModal
          report={aiTarget}
          onClose={() => setAiTarget(null)}
          onResolve={handleAIResolve}
        />
      )}
    </div>
  );
}
