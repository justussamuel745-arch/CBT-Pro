import { useState, useRef, useContext, useEffect, useCallback, memo } from 'react';
import { useNavigate } from 'react-router';
import Markdown from 'react-markdown';
import remarkMath from 'remark-math';
import remarkGfm from 'remark-gfm';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import UserContext from '../context/UserContext';
import { fetchWithAuth } from '../scripts/utilis/fetch';
import { saveUser } from '../hooks/services/indexedDB/users.js';
import './AstraAIModal.css'


// ─────────────────────────────────────────────────────────────
// INTERNET STATUS  (isolated memo — no re-render leak upward)
// ─────────────────────────────────────────────────────────────
const UseInternetStatus = memo(function UseInternetStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const on  = () => setIsOnline(true);
    const off = () => setIsOnline(false);
    window.addEventListener('online',  on);
    window.addEventListener('offline', off);
    return () => {
      window.removeEventListener('online',  on);
      window.removeEventListener('offline', off);
    };
  }, []);

  return (
    <div className="astra-status">
      <span className={`astra-status-dot${isOnline ? '' : ' offline'}`} />
      <span className={`astra-status-text${isOnline ? '' : ' offline'}`}>
        {isOnline ? 'Online' : 'Offline'}
      </span>
    </div>
  );
});

// ─────────────────────────────────────────────────────────────
// CREDITS ICONS
// ─────────────────────────────────────────────────────────────
function CreditsIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────
// CREDITS BADGE + POPOVER
// (click to view remaining AI credits — self-contained, isolated memo)
// ─────────────────────────────────────────────────────────────
const CreditsDisplay = memo(function CreditsDisplay({ credits, creditLimit, onTopUp }) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  const safeLimit = creditLimit || 1000;
  const pct = Math.max(0, Math.min(100, (credits / safeLimit) * 100));
  const isLow = credits <= safeLimit * 0.15;

  // Close popover on outside click
  useEffect(() => {
    if (!open) return;
    function onClick(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    function onKey(e) { if (e.key === 'Escape') setOpen(false); }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <div ref={wrapRef} style={{ position: 'relative' }}>
      <button
        type="button"
        className={`astra-credits${isLow ? ' low' : ''}`}
        onClick={() => setOpen(p => !p)}
        aria-label="View AI credits"
        aria-expanded={open}
      >
        <CreditsIcon />
        {credits}
      </button>

      {open && (
        <div className="astra-credits-popover">
          <div className="astra-credits-popover-body">
            <div className="astra-credits-popover-label">AI credits remaining</div>
            <div className="astra-credits-popover-value">
              {credits} <span>/ {safeLimit}</span>
            </div>
            <div className="astra-credits-popover-sub">
              {isLow
                ? "You're running low. Top up to keep chatting with Astra without interruption."
                : "1 credit is deducted only after a response is successfully generated. Failed requests do not consume credits."
              }
            </div>
            <div className="astra-credits-popover-bar-track">
              <div
                className={`astra-credits-popover-bar-fill${isLow ? ' low' : ''}`}
                style={{ width: `${pct}%` }}
              />
            </div>
            <button
              type="button"
              className="astra-credits-popover-btn"
              onClick={() => { setOpen(false); onTopUp?.(); }}
            >
              <PlusIcon /> Buy more credits
            </button>
          </div>
        </div>
      )}
    </div>
  );
});

// ─────────────────────────────────────────────────────────────
// MARKDOWN OPTIONS  (stable reference — avoids rehype re-init)
// ─────────────────────────────────────────────────────────────
const REMARK_PLUGINS = [remarkGfm, remarkMath];
const REHYPE_PLUGINS = [rehypeKatex];

// ─────────────────────────────────────────────────────────────
// MESSAGE BUBBLE  (memo — skips re-render if props unchanged)
// ─────────────────────────────────────────────────────────────
const MessageBubble = memo(function MessageBubble({ msg }) {
  const isTyping = msg.description === 'typing';
  const isError  = msg.description === 'error';
  const isUser   = msg.sender === 'user';

  return (
    <div className={`astra-msg ${isUser ? 'user' : 'ai'}`}>
      <div className="astra-msg-avatar">
        {isUser ? 'U' : '🤖'}
      </div>

      {isTyping ? (
        <div className="astra-bubble">
          <div className="astra-typing">
            <span /><span /><span />
          </div>
        </div>
      ) : (
        <div className={`astra-bubble${isError ? ' error' : ''}`}>
          {isUser ? (
            msg.message
          ) : (
            <Markdown remarkPlugins={REMARK_PLUGINS} rehypePlugins={REHYPE_PLUGINS}>
              {msg.message}
            </Markdown>
          )}
        </div>
      )}
    </div>
  );
});

// ─────────────────────────────────────────────────────────────
// MAIN MODAL
// ─────────────────────────────────────────────────────────────
export const AstraAIModal = memo(function AstraAIModal({ setChatWithAI, chatMessages, setChatMessages}) {
  const { token, setToken, userInfo, setUserInfo } = useContext(UserContext);
  const navigate = useNavigate()
  const [userMsg,  setUserMsg]  = useState('');
  const [disabled, setDisabled] = useState(false);

  const textareaRef             = useRef(null);
  const messagesEndRef          = useRef(null);

  // ── Auto-scroll to bottom when messages change ──
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // ── Auto-resize textarea ──
  const handleInput = useCallback((e) => {
    const el = e.target;
    setUserMsg(el.value);
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 120) + 'px';
  }, [setUserMsg]);

  // ── Send message ──
  const sendMessage = useCallback(async () => {
    const message = userMsg.trim();
    if (!message || disabled) return;

    const typingId = crypto.randomUUID();

    setChatMessages(prev => [
      ...prev,
      { id: crypto.randomUUID(), sender: 'user', message },
      { id: typingId,            sender: 'AI',   message: '', description: 'typing' },
    ]);

    setUserMsg('');
    setDisabled(true);

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    try {
      const response = await fetchWithAuth(token, setToken, '/api/ai/explain', {
        method: 'POST',
        body: JSON.stringify({ question: message }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw { status: response.status, error: data.error || 'Failed to generate response' };
      }

      // Replace typing indicator with the real response
      setChatMessages(prev => prev.map(msg =>
        msg.id === typingId
          ? { ...msg, message: data.answer, description: undefined }
          : msg
      ));
      
      setUserInfo(prev => ({...prev, aiCredits: data.creditsLeft}))
      const newInfo = await saveUser({...userInfo, aiCredits: data.creditsLeft, id: 'current-user'})

    } catch (err) {
      let errorText;
      if (!err.status){
        errorText = "Can't reach the server. Check your connection and try again."
      } else if (err.status >= 500){
        errorText = 'Something went wrong. Please try again.'
      } else if (err.status === 402) {
        errorText = 'You\'ve reached your AI credit limit. Please upgrade your plan or purchase additional credits to continue.'
      } else {
        errorText = err.error
      }
      setChatMessages(prev => prev.map(msg =>
        msg.id === typingId
          ? { ...msg, message: errorText, description: 'error' }
          : msg
      ));
    } finally {
      setDisabled(false);
      textareaRef.current?.focus();
    }
  }, [userMsg, disabled, token, setToken, setChatMessages]);

  // ── Enter to send (Shift+Enter = newline) ──
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }, [sendMessage]);

  const canSend = userMsg.trim().length > 0 && !disabled;

  return (
    <div className="astra-overlay">
      <div className="astra-modal" role="dialog" aria-label="Astra AI chat">

        {/* ── Header ── */}
        <div className="astra-header">
          <div className="astra-avatar">🤖</div>
          <div className="astra-header-info">
            <div className="astra-header-name">Astra AI</div>
            <UseInternetStatus />
          </div>

          {/* Clickable credits badge — opens popover with remaining balance */}
          <CreditsDisplay
            credits={userInfo?.aiCredits ?? 0}
            creditLimit={userInfo?.aiCreditLimit ?? 1000}
            onTopUp={() => { setChatWithAI(false); navigate('/payment') }}
          />

          <button
            className="astra-close"
            onClick={() => setChatWithAI(false)}
            aria-label="Close chat"
          >
            ×
          </button>
        </div>

        {/* ── Messages ── */}
        <div className="astra-messages" role="log" aria-live="polite">
          {chatMessages.map(msg => (
            <MessageBubble key={msg.id} msg={msg} />
          ))}
          {/* Invisible anchor — scroll target */}
          <div ref={messagesEndRef} style={{ height: 0, flexShrink: 0 }} />
        </div>

        {/* ── Input ── */}
        <div className="astra-input-area">
          <div className="astra-input-row">
            <textarea
              ref={textareaRef}
              className="astra-textarea"
              placeholder="Ask anything…"
              rows={1}
              value={userMsg}
              onChange={handleInput}
              onKeyDown={handleKeyDown}
              disabled={disabled}
              aria-label="Message Astra"
            />
            <button
              className="astra-send"
              onClick={sendMessage}
              disabled={!canSend}
              aria-label="Send message"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
              </svg>
            </button>
          </div>
          <p className="astra-footer-note">Astra can make mistakes · Verify important answers</p>
        </div>

      </div>
    </div>
  );
});
