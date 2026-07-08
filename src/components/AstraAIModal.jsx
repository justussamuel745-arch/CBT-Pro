import { useState, useRef, useContext, useEffect, useCallback, memo } from 'react';
import Markdown from 'react-markdown';
import remarkMath from 'remark-math';
import remarkGfm from 'remark-gfm';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import UserContext from '../context/UserContext';
import { fetchWithAuth } from '../scripts/utilis/fetch';
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
  const { token, setToken } = useContext(UserContext);

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

    } catch (err) {
      console.error('Astra error:', err);
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
