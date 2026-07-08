import { useState, useEffect, useCallback, createContext, useContext, useRef } from "react";

// ─────────────────────────────────────────────
// DESIGN TOKENS
// ─────────────────────────────────────────────
export const CSS = [`
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --font: 'Inter', system-ui, sans-serif;
    --c-bg: #f0f2f5;
    --c-surface: #ffffff;
    --c-border: #e5e7eb;
    --c-text: #111827;
    --c-muted: #6b7280;
    --c-subtle: #f9fafb;

    --c-success: #16a34a;
    --c-success-bg: #f0fdf4;
    --c-success-border: #bbf7d0;
    --c-success-light: #dcfce7;

    --c-error: #dc2626;
    --c-error-bg: #fef2f2;
    --c-error-border: #fecaca;
    --c-error-light: #fee2e2;

    --c-warning: #d97706;
    --c-warning-bg: #fffbeb;
    --c-warning-border: #fde68a;
    --c-warning-light: #fef3c7;

    --c-info: #2563eb;
    --c-info-bg: #eff6ff;
    --c-info-border: #bfdbfe;
    --c-info-light: #dbeafe;

    --c-radius-sm: 6px;
    --c-radius: 10px;
    --c-radius-lg: 14px;
    --c-shadow-sm: 0 1px 3px rgba(0,0,0,.08);
    --c-shadow-md: 0 4px 16px rgba(0,0,0,.1);
    --c-shadow-lg: 0 16px 40px rgba(0,0,0,.14);
  }

  /* ── Page shell ── */
  .ns-page { min-height: 100vh; padding: 2rem 1.5rem; }
  .ns-header { margin-bottom: 2.5rem; }
  .ns-header h1 { font-size: 1.5rem; font-weight: 700; letter-spacing: -.02em; margin-bottom: .25rem; }
  .ns-header p { font-size: .9rem; color: var(--c-muted); }

  .ns-section { margin-bottom: 3rem; }
  .ns-section-title {
    font-size: .7rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: .1em;
    color: var(--c-muted);
    margin-bottom: 1rem;
    display: flex;
    align-items: center;
    gap: .625rem;
  }
  .ns-section-title::after { content: ''; flex: 1; height: 1px; background: var(--c-border); }

  .ns-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
    gap: .875rem;
  }
  .ns-grid-2 { grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); }
  .ns-grid-toast { grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); }

  /* ── Trigger button ── */
  .ns-trigger {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: .5rem;
    background: var(--c-surface);
    border: 1px solid var(--c-border);
    border-radius: var(--c-radius);
    padding: 1rem 1.125rem;
    cursor: pointer;
    transition: box-shadow .15s, transform .1s, border-color .15s;
    text-align: left;
    width: 100%;
    font-family: var(--font);
  }
  .ns-trigger:hover { box-shadow: var(--c-shadow-md); transform: translateY(-1px); }
  .ns-trigger:active { transform: scale(.98); }
  .ns-trigger-label { font-size: .875rem; font-weight: 600; color: var(--c-text); }
  .ns-trigger-sub { font-size: .775rem; color: var(--c-muted); line-height: 1.4; }
  .ns-trigger-badge {
    font-size: .65rem;
    font-weight: 700;
    padding: .15rem .5rem;
    border-radius: 20px;
    text-transform: uppercase;
    letter-spacing: .06em;
  }

  /* ── Modal overlay ── */
  .ns-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,.45);
    z-index: 900;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1rem;
    backdrop-filter: blur(2px);
    animation: overlayIn .18s ease;
  }
  @keyframes overlayIn { from { opacity: 0; } to { opacity: 1; } }

  /* ── Modal base ── */
  .ns-modal {
    background: var(--c-surface);
    border-radius: var(--c-radius-lg);
    width: 100%;
    box-shadow: var(--c-shadow-lg);
    overflow: hidden;
    animation: modalIn .2s cubic-bezier(.34,1.56,.64,1);
    position: relative;
  }
  @keyframes modalIn {
    from { opacity: 0; transform: scale(.9) translateY(12px); }
    to   { opacity: 1; transform: scale(1) translateY(0); }
  }
  .ns-modal-close {
    position: absolute;
    top: .875rem; right: .875rem;
    width: 28px; height: 28px;
    border-radius: 50%;
    border: none;
    background: rgba(0,0,0,.06);
    cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    color: var(--c-muted);
    font-size: .8rem;
    transition: background .15s;
    flex-shrink: 0;
  }
  .ns-modal-close:hover { background: rgba(0,0,0,.12); color: var(--c-text); }

  /* ── Modal: Centered (icon + title centered) ── */
  .ns-modal-centered {
    max-width: 400px;
    text-align: center;
    padding: 2rem 1.75rem 1.75rem;
  }
  .ns-modal-centered .ns-icon-wrap {
    width: 60px; height: 60px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    margin: 0 auto 1.125rem;
    font-size: 1.5rem;
  }
  .ns-modal-centered h2 { font-size: 1.1rem; font-weight: 700; margin-bottom: .5rem; }
  .ns-modal-centered p { font-size: .875rem; color: var(--c-muted); line-height: 1.6; margin-bottom: 1.5rem; }
  .ns-modal-centered .ns-modal-actions { display: flex; gap: .625rem; justify-content: center; flex-wrap: wrap; }

  /* ── Modal: Left-aligned (dialog style) ── */
  .ns-modal-dialog { max-width: 440px; }
  .ns-modal-dialog .ns-dialog-header {
    display: flex; align-items: flex-start; gap: .875rem;
    padding: 1.5rem 3rem 1.25rem 1.5rem;
    border-bottom: 1px solid var(--c-border);
  }
  .ns-modal-dialog .ns-dialog-icon {
    width: 40px; height: 40px; border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0; font-size: 1.1rem;
  }
  .ns-modal-dialog .ns-dialog-titles { flex: 1; min-width: 0; }
  .ns-modal-dialog h2 { font-size: .975rem; font-weight: 700; margin-bottom: .2rem; }
  .ns-modal-dialog .ns-dialog-subtitle { font-size: .8rem; color: var(--c-muted); }
  .ns-modal-dialog .ns-dialog-body { padding: 1.25rem 1.5rem; font-size: .875rem; color: var(--c-muted); line-height: 1.65; }
  .ns-modal-dialog .ns-dialog-footer {
    padding: 1rem 1.5rem;
    border-top: 1px solid var(--c-border);
    display: flex; gap: .625rem; justify-content: flex-end;
    flex-wrap: wrap;
  }

  /* ── Modal: Banner-top style ── */
  .ns-modal-banner { max-width: 460px; }
  .ns-modal-banner .ns-banner-top {
    padding: 1.75rem 1.75rem 1.25rem;
    display: flex; flex-direction: column; gap: .5rem;
  }
  .ns-modal-banner .ns-banner-icon-row {
    display: flex; align-items: center; gap: .75rem; margin-bottom: .25rem;
  }
  .ns-modal-banner .ns-banner-icon {
    width: 36px; height: 36px; border-radius: 8px;
    display: flex; align-items: center; justify-content: center;
    font-size: 1rem; flex-shrink: 0;
  }
  .ns-modal-banner h2 { font-size: 1.05rem; font-weight: 700; }
  .ns-modal-banner p { font-size: .875rem; color: var(--c-muted); line-height: 1.6; }
  .ns-modal-banner .ns-banner-footer {
    border-top: 1px solid var(--c-border);
    padding: 1rem 1.75rem;
    display: flex; gap: .625rem; flex-wrap: wrap;
  }

  /* ── Modal: Destructive confirm ── */
  .ns-modal-destruct { max-width: 420px; }
  .ns-modal-destruct .ns-destruct-body { padding: 1.75rem; }
  .ns-modal-destruct .ns-destruct-icon {
    width: 52px; height: 52px; border-radius: 12px;
    display: flex; align-items: center; justify-content: center;
    margin-bottom: 1rem; font-size: 1.25rem;
  }
  .ns-modal-destruct h2 { font-size: 1rem; font-weight: 700; margin-bottom: .5rem; }
  .ns-modal-destruct p { font-size: .875rem; color: var(--c-muted); line-height: 1.6; margin-bottom: 1.25rem; }
  .ns-modal-destruct .ns-destruct-warning {
    background: var(--c-error-bg);
    border: 1px solid var(--c-error-border);
    border-radius: 7px;
    padding: .625rem .875rem;
    font-size: .8rem;
    color: var(--c-error);
    display: flex; gap: .5rem; align-items: flex-start;
    margin-bottom: 1.5rem;
    line-height: 1.5;
  }
  .ns-modal-destruct .ns-destruct-actions { display: flex; gap: .625rem; flex-wrap: wrap; }

  /* ── Modal: Full-width top stripe ── */
  .ns-modal-stripe { max-width: 440px; }
  .ns-modal-stripe .ns-stripe {
    height: 5px; border-radius: var(--c-radius-lg) var(--c-radius-lg) 0 0;
  }
  .ns-modal-stripe .ns-stripe-body { padding: 1.5rem 1.75rem; }
  .ns-modal-stripe .ns-stripe-head { display: flex; align-items: center; gap: .75rem; margin-bottom: .875rem; }
  .ns-modal-stripe .ns-stripe-iconwrap {
    width: 38px; height: 38px; border-radius: 9px;
    display: flex; align-items: center; justify-content: center;
    font-size: 1rem; flex-shrink: 0;
  }
  .ns-modal-stripe h2 { font-size: 1rem; font-weight: 700; }
  .ns-modal-stripe p { font-size: .875rem; color: var(--c-muted); line-height: 1.6; margin-bottom: 1.5rem; }
  .ns-modal-stripe .ns-stripe-actions { display: flex; gap: .625rem; flex-wrap: wrap; justify-content: flex-end; }

  /* ── Buttons ── */
  .ns-btn {
    display: inline-flex; align-items: center; gap: .4rem;
    padding: .55rem 1.1rem;
    border: 1px solid transparent;
    border-radius: var(--c-radius-sm);
    font-size: .875rem; font-weight: 600; font-family: var(--font);
    cursor: pointer; line-height: 1;
    transition: background .15s, transform .1s, box-shadow .15s;
    white-space: nowrap;
  }
  .btn:active { transform: scale(.97); }
  .btn-success { background: var(--c-success); color: #fff; }
  .btn-success:hover { background: #15803d; }
  .btn-error { background: var(--c-error); color: #fff; }
  .btn-error:hover { background: #b91c1c; }
  .btn-warning { background: var(--c-warning); color: #fff; }
  .btn-warning:hover { background: #b45309; }
  .btn-info { background: var(--c-info); color: #fff; }
  .btn-info:hover { background: #1d4ed8; }
  .btn-ghost { background: transparent; border-color: var(--c-border); color: var(--c-muted); }
  .btn-ghost:hover { background: var(--c-subtle); color: var(--c-text); }
  .btn-sm { padding: .4rem .875rem; font-size: .8rem; }

  /* ── TOASTS ── */
  .ns-toast-portal {
    position: fixed;
    z-index: 1000;
    display: flex;
    flex-direction: column;
    gap: .5rem;
    pointer-events: none;
  }
  .ns-toast-portal.pos-top-right    { top: 1.25rem; right: 1.25rem; align-items: flex-end; }
  .ns-toast-portal.pos-top-left     { top: 1.25rem; left: 1.25rem; align-items: flex-start; }
  .ns-toast-portal.pos-top-center   { top: 1.25rem; left: 50%; transform: translateX(-50%); align-items: center; }
  .ns-toast-portal.pos-bottom-right { bottom: 1.25rem; right: 1.25rem; align-items: flex-end; }
  .ns-toast-portal.pos-bottom-left  { bottom: 1.25rem; left: 1.25rem; align-items: flex-start; }
  .ns-toast-portal.pos-bottom-center{ bottom: 1.25rem; left: 50%; transform: translateX(-50%); align-items: center; }

  /* ── Toast: Pill (compact) ── */
  .ns-toast {
    pointer-events: all;
    display: flex; align-items: center; gap: .625rem;
    padding: .65rem 1rem;
    border-radius: 40px;
    font-size: .85rem; font-weight: 500;
    box-shadow: var(--c-shadow-md);
    white-space: nowrap;
    max-width: 360px;
    animation: toastSlideIn .22s cubic-bezier(.34,1.56,.64,1);
    cursor: default;
  }
  .ns-toast.exiting { animation: toastSlideOut .2s ease forwards; }
  @keyframes toastSlideIn { from { opacity: 0; transform: translateY(-10px) scale(.95); } to { opacity: 1; transform: translateY(0) scale(1); } }
  @keyframes toastSlideOut { to { opacity: 0; transform: scale(.9); } }

  .ns-toast.t-success { background: #111827; color: #fff; }
  .ns-toast.t-error   { background: #7f1d1d; color: #fff; }
  .ns-toast.t-warning { background: #78350f; color: #fff; }
  .ns-toast.t-info    { background: #1e3a5f; color: #fff; }

  .ns-toast-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
  .ns-toast-dot.t-success { background: #4ade80; }
  .ns-toast-dot.t-error   { background: #f87171; }
  .ns-toast-dot.t-warning { background: #fbbf24; }
  .ns-toast-dot.t-info    { background: #60a5fa; }

  .ns-toast-x {
    margin-left: .25rem;
    background: none; border: none; cursor: pointer;
    color: rgba(255,255,255,.5); font-size: .85rem; line-height: 1;
    padding: 0 .125rem;
    transition: color .15s;
    flex-shrink: 0;
  }
  .ns-toast-x:hover { color: #fff; }

  /* ── Toast: Card style ── */
  .ns-toast-card {
    pointer-events: all;
    display: flex; align-items: flex-start; gap: .75rem;
    padding: .875rem 1rem;
    border-radius: var(--c-radius);
    font-size: .875rem;
    box-shadow: var(--c-shadow-md);
    max-width: 340px;
    width: 340px;
    animation: toastCardIn .22s cubic-bezier(.34,1.56,.64,1);
    cursor: default;
    border-left: 4px solid transparent;
  }
  .ns-toast-card.exiting { animation: toastSlideOut .2s ease forwards; }
  @keyframes toastCardIn { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }

  .ns-toast-card.t-success { background: #fff; border-left-color: var(--c-success); }
  .ns-toast-card.t-error   { background: #fff; border-left-color: var(--c-error); }
  .ns-toast-card.t-warning { background: #fff; border-left-color: var(--c-warning); }
  .ns-toast-card.t-info    { background: #fff; border-left-color: var(--c-info); }

  .ns-toast-card-icon {
    width: 32px; height: 32px; border-radius: 8px;
    display: flex; align-items: center; justify-content: center;
    font-size: .95rem; flex-shrink: 0;
  }
  .ns-toast-card-icon.t-success { background: var(--c-success-light); color: var(--c-success); }
  .ns-toast-card-icon.t-error   { background: var(--c-error-light);   color: var(--c-error); }
  .ns-toast-card-icon.t-warning { background: var(--c-warning-light);  color: var(--c-warning); }
  .ns-toast-card-icon.t-info    { background: var(--c-info-light);     color: var(--c-info); }

  .ns-toast-card-body { flex: 1; min-width: 0; }
  .ns-toast-card-title { font-weight: 700; color: var(--c-text); margin-bottom: .15rem; font-size: .85rem; }
  .ns-toast-card-msg { font-size: .8rem; color: var(--c-muted); line-height: 1.4; }
  .ns-toast-card-action { font-size: .78rem; font-weight: 600; margin-top: .375rem; cursor: pointer; text-decoration: underline; text-underline-offset: 2px; }
  .ns-toast-card-action.t-success { color: var(--c-success); }
  .ns-toast-card-action.t-error   { color: var(--c-error); }
  .ns-toast-card-action.t-warning { color: var(--c-warning); }
  .ns-toast-card-action.t-info    { color: var(--c-info); }

  .ns-toast-card-x {
    background: none; border: none; cursor: pointer;
    color: var(--c-muted); padding: 0;
    line-height: 1; flex-shrink: 0;
    transition: color .15s;
  }
  .ns-toast-card-x:hover { color: var(--c-text); }

  /* ── Toast: Progress bar ── */
  .ns-toast-prog {
    pointer-events: all;
    border-radius: var(--c-radius);
    overflow: hidden;
    max-width: 340px; width: 340px;
    box-shadow: var(--c-shadow-md);
    animation: toastCardIn .22s cubic-bezier(.34,1.56,.64,1);
  }
  .ns-toast-prog.exiting { animation: toastSlideOut .2s ease forwards; }
  .ns-toast-prog-body {
    display: flex; align-items: center; gap: .75rem;
    padding: .875rem 1rem;
  }
  .ns-toast-prog.t-success .ns-toast-prog-body { background: var(--c-success-bg); }
  .ns-toast-prog.t-error   .ns-toast-prog-body { background: var(--c-error-bg); }
  .ns-toast-prog.t-warning .ns-toast-prog-body { background: var(--c-warning-bg); }
  .ns-toast-prog.t-info    .ns-toast-prog-body { background: var(--c-info-bg); }

  .ns-toast-prog-icon { font-size: 1.1rem; flex-shrink: 0; }
  .ns-toast-prog-text { flex: 1; }
  .ns-toast-prog-title { font-size: .85rem; font-weight: 700; }
  .ns-toast-prog.t-success .ns-toast-prog-title { color: var(--c-success); }
  .ns-toast-prog.t-error   .ns-toast-prog-title { color: var(--c-error); }
  .ns-toast-prog.t-warning .ns-toast-prog-title { color: var(--c-warning); }
  .ns-toast-prog.t-info    .ns-toast-prog-title { color: var(--c-info); }
  .ns-toast-prog-msg { font-size: .78rem; color: var(--c-muted); }

  .ns-toast-prog-bar { height: 3px; }
  .ns-toast-prog.t-success .ns-toast-prog-bar { background: var(--c-success-border); }
  .ns-toast-prog.t-error   .ns-toast-prog-bar { background: var(--c-error-border); }
  .ns-toast-prog.t-warning .ns-toast-prog-bar { background: var(--c-warning-border); }
  .ns-toast-prog.t-info    .ns-toast-prog-bar { background: var(--c-info-border); }
  .ns-toast-prog-fill {
    height: 100%;
    transition: width .1s linear;
  }
  .ns-toast-prog.t-success .ns-toast-prog-fill { background: var(--c-success); }
  .ns-toast-prog.t-error   .ns-toast-prog-fill { background: var(--c-error); }
  .ns-toast-prog.t-warning .ns-toast-prog-fill { background: var(--c-warning); }
  .ns-toast-prog.t-info    .ns-toast-prog-fill { background: var(--c-info); }

  /* ── Inline alert banners ── */
  .ns-alert {
    display: flex; gap: .75rem; align-items: flex-start;
    padding: .875rem 1rem;
    border-radius: var(--c-radius-sm);
    border: 1px solid transparent;
    font-size: .875rem; line-height: 1.55;
  }
  .ns-alert.t-success { background: var(--c-success-bg); border-color: var(--c-success-border); color: #166534; }
  .ns-alert.t-error   { background: var(--c-error-bg);   border-color: var(--c-error-border);   color: #991b1b; }
  .ns-alert.t-warning { background: var(--c-warning-bg); border-color: var(--c-warning-border); color: #92400e; }
  .ns-alert.t-info    { background: var(--c-info-bg);    border-color: var(--c-info-border);    color: #1e40af; }
  .ns-alert-icon { font-size: 1rem; flex-shrink: 0; margin-top: .05rem; }
  .ns-alert-body { flex: 1; }
  .ns-alert-title { font-weight: 700; margin-bottom: .2rem; }
  .ns-alert-dismiss {
    background: none; border: none; cursor: pointer; font-size: 1rem;
    opacity: .5; line-height: 1; transition: opacity .15s; padding: 0; flex-shrink: 0;
  }
  .ns-alert-dismiss:hover { opacity: 1; }

  /* ── Responsive ── */
  @media (max-width: 600px) {
    .ns-page { padding: 1.25rem 1rem; }
    .ns-toast-card, .ns-toast-prog { width: calc(100vw - 2.5rem); max-width: calc(100vw - 2.5rem); }
    .ns-toast-portal.pos-top-right, .ns-toast-portal.pos-bottom-right { right: .75rem; }
    .ns-toast-portal.pos-top-left,  .ns-toast-portal.pos-bottom-left  { left: .75rem; }
  }
`];

// ─────────────────────────────────────────────
// ICONS (inline SVG)
// ─────────────────────────────────────────────
const Ic = {
  Check: () => (
    <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  ),
  X: () => (
    <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <path d="M18 6 6 18M6 6l12 12"/>
    </svg>
  ),
  Warn: () => (
    <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
      <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>
  ),
  Info: () => (
    <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
    </svg>
  ),
  Trash: () => (
    <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6m5 0V4h4v2"/>
    </svg>
  ),
  Lock: () => (
    <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
    </svg>
  ),
  Upload: () => (
    <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/>
      <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/>
    </svg>
  ),
  Send: () => (
    <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
    </svg>
  ),
  Bell: () => (
    <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
    </svg>
  ),
};

const TYPE_ICON = {
  success: <Ic.Check />,
  error:   <Ic.X />,
  warning: <Ic.Warn />,
  info:    <Ic.Info />,
};

// ─────────────────────────────────────────────
// TOAST CONTEXT
// ─────────────────────────────────────────────
const ToastCtx = createContext(null);
export const useToast = () => useContext(ToastCtx);

let _id = 0;
export function ToastProvider({ children, position = "top-right" }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts(p => p.map(t => t.id === id ? { ...t, exiting: true } : t));
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 220);
  }, []);

  const push = useCallback((toast) => {
    const id = ++_id;
    setToasts(p => [...p, { ...toast, id, exiting: false }]);
    if (toast.duration !== 0) {
      setTimeout(() => dismiss(id), toast.duration ?? 3500);
    }
    return id;
  }, [dismiss]);

  return (
    <ToastCtx.Provider value={{ push, dismiss }}>
      {children}
      <div className={`ns-toast-portal pos-${position}`}>
        {toasts.map(t => {
          if (t.variant === "card") return <ToastCard key={t.id} {...t} onDismiss={() => dismiss(t.id)} />;
          if (t.variant === "progress") return <ToastProgress key={t.id} {...t} onDismiss={() => dismiss(t.id)} />;
          return <ToastPill key={t.id} {...t} onDismiss={() => dismiss(t.id)} />;
        })}
      </div>
    </ToastCtx.Provider>
  );
}

// ─────────────────────────────────────────────
// TOAST VARIANTS
// ─────────────────────────────────────────────
function ToastPill({ type = "success", message, exiting, onDismiss }) {
  return (
    <div className={`ns-toast t-${type} ${exiting ? "exiting" : ""}`}>
      <span className={`ns-toast-dot t-${type}`} />
      {message}
      <button className="ns-toast-x" onClick={onDismiss}>✕</button>
    </div>
  );
}

function ToastCard({ type = "success", title, message, action, onAction, exiting, onDismiss }) {
  return (
    <div className={`ns-toast-card t-${type} ${exiting ? "exiting" : ""}`}>
      <div className={`ns-toast-card-icon t-${type}`}>{TYPE_ICON[type]}</div>
      <div className="ns-toast-card-body">
        {title && <div className="ns-toast-card-title">{title}</div>}
        {message && <div className="ns-toast-card-msg">{message}</div>}
        {action && (
          <div className={`ns-toast-card-action t-${type}`} onClick={onAction}>{action}</div>
        )}
      </div>
      <button className="ns-toast-card-x" onClick={onDismiss}><Ic.X /></button>
    </div>
  );
}

function ToastProgress({ type = "success", title, message, duration = 3500, exiting, onDismiss }) {
  const [pct, setPct] = useState(100);
  const start = useRef(Date.now());

  useEffect(() => {
    const tick = () => {
      const elapsed = Date.now() - start.current;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setPct(remaining);
      if (remaining > 0) requestAnimationFrame(tick);
    };
    const raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [duration]);

  return (
    <div className={`ns-toast-prog t-${type} ${exiting ? "exiting" : ""}`}>
      <div className="ns-toast-prog-body">
        <span className="ns-toast-prog-icon">{TYPE_ICON[type]}</span>
        <div className="ns-toast-prog-text">
          {title && <div className="ns-toast-prog-title">{title}</div>}
          {message && <div className="ns-toast-prog-msg">{message}</div>}
        </div>
        <button className="ns-toast-card-x" onClick={onDismiss}><Ic.X /></button>
      </div>
      <div className="ns-toast-prog-bar">
        <div className="ns-toast-prog-fill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// MODAL VARIANTS
// ─────────────────────────────────────────────

// 1. Centered icon modal
export function ModalCentered({ type, title, body, primaryLabel, onPrimary, onClose }) {
  const colors = {
    success: { iconBg: "var(--c-success-light)", iconColor: "var(--c-success)", btnCls: "btn-success" },
    error:   { iconBg: "var(--c-error-light)",   iconColor: "var(--c-error)",   btnCls: "btn-error" },
    warning: { iconBg: "var(--c-warning-light)", iconColor: "var(--c-warning)", btnCls: "btn-warning" },
    info:    { iconBg: "var(--c-info-light)",     iconColor: "var(--c-info)",    btnCls: "btn-info" },
  }[type];
  return (
    <div className="ns-modal ns-modal-centered">
      <button className="ns-modal-close" onClick={onClose}><Ic.X /></button>
      <div className="ns-icon-wrap" style={{ background: colors.iconBg, color: colors.iconColor, fontSize: "1.6rem" }}>
        {TYPE_ICON[type]}
      </div>
      <h2>{title}</h2>
      <p>{body}</p>
      <div className="ns-modal-actions">
        <button className="ns-btn btn-ghost btn-sm" onClick={onClose}>Dismiss</button>
        {primaryLabel && <button className={`btn ${colors.btnCls} btn-sm`} onClick={onPrimary ?? onClose}>{primaryLabel}</button>}
      </div>
    </div>
  );
}

// 2. Dialog (left-aligned header)
export function ModalDialog({ type, title, subtitle, body, primaryLabel, onPrimary, onClose, closeLabel }) {
  const colors = {
    success: { iconBg: "var(--c-success-light)", iconColor: "var(--c-success)", btnCls: "btn-success" },
    error:   { iconBg: "var(--c-error-light)",   iconColor: "var(--c-error)",   btnCls: "btn-error" },
    warning: { iconBg: "var(--c-warning-light)", iconColor: "var(--c-warning)", btnCls: "btn-warning" },
    info:    { iconBg: "var(--c-info-light)",     iconColor: "var(--c-info)",    btnCls: "btn-info" },
  }[type];
  return (
    <div className="ns-modal ns-modal-dialog">
      <button className="ns-modal-close" onClick={onClose}><Ic.X /></button>
      <div className="ns-dialog-header">
        <div className="ns-dialog-icon" style={{ background: colors.iconBg, color: colors.iconColor }}>
          {TYPE_ICON[type]}
        </div>
        <div className="ns-dialog-titles">
          <h2>{title}</h2>
          {subtitle && <div className="ns-dialog-subtitle">{subtitle}</div>}
        </div>
      </div>
      <div className="ns-dialog-body">{body}</div>
      <div className="ns-dialog-footer">
        <button className="ns-btn btn-ghost btn-sm" onClick={onClose}>{closeLabel ? closeLabel : 'Cancel'}</button>
        <button className={`btn ${colors.btnCls} btn-sm`} onClick={onPrimary ?? onClose}>{primaryLabel}</button>
      </div>
    </div>
  );
}

// 3. Banner-top modal
export function ModalBanner({ type, title, body, primaryLabel, secondaryLabel, onPrimary, onClose }) {
  const colors = {
    success: { bg: "var(--c-success-bg)", iconBg: "var(--c-success-light)", iconColor: "var(--c-success)", btnCls: "btn-success" },
    error:   { bg: "var(--c-error-bg)",   iconBg: "var(--c-error-light)",   iconColor: "var(--c-error)",   btnCls: "btn-error" },
    warning: { bg: "var(--c-warning-bg)", iconBg: "var(--c-warning-light)", iconColor: "var(--c-warning)", btnCls: "btn-warning" },
    info:    { bg: "var(--c-info-bg)",    iconBg: "var(--c-info-light)",    iconColor: "var(--c-info)",    btnCls: "btn-info" },
  }[type];
  return (
    <div className="ns-modal ns-modal-banner">
      <button className="ns-modal-close" onClick={onClose}><Ic.X /></button>
      <div className="ns-banner-top" style={{ background: colors.bg }}>
        <div className="ns-banner-icon-row">
          <div className="ns-banner-icon" style={{ background: colors.iconBg, color: colors.iconColor }}>
            {TYPE_ICON[type]}
          </div>
          <h2>{title}</h2>
        </div>
        <p style={{ margin: 0 }}>{body}</p>
      </div>
      <div className="ns-banner-footer">
        <button className="ns-btn btn-ghost btn-sm" onClick={onClose}>{secondaryLabel ?? "Dismiss"}</button>
        <button className={`btn ${colors.btnCls} btn-sm`} onClick={onPrimary ?? onClose}>{primaryLabel}</button>
      </div>
    </div>
  );
}

// 4. Destructive confirm
export function ModalDestruct({ title, body, warningText, primaryLabel, onPrimary, onClose }) {
  return (
    <div className="ns-modal ns-modal-destruct">
      <button className="ns-modal-close" onClick={onClose}><Ic.X /></button>
      <div className="ns-destruct-body">
        <div className="ns-destruct-icon" style={{ background: "var(--c-error-light)", color: "var(--c-error)" }}>
          <Ic.Trash />
        </div>
        <h2>{title}</h2>
        <p>{body}</p>
        {warningText && (
          <div className="ns-destruct-warning">
            <span style={{ flexShrink: 0 }}>⚠</span>
            {warningText}
          </div>
        )}
        <div className="ns-destruct-actions">
          <button className="ns-btn btn-ghost btn-sm" style={{ flex: 1 }} onClick={onClose}>Cancel</button>
          <button className="ns-btn btn-error btn-sm" style={{ flex: 2 }} onClick={onPrimary ?? onClose}>{primaryLabel}</button>
        </div>
      </div>
    </div>
  );
}

// 5. Stripe-top modal
export function ModalStripe({ type, title, body, primaryLabel, onPrimary, onClose }) {
  const colors = {
    success: { stripe: "var(--c-success)", iconBg: "var(--c-success-light)", iconColor: "var(--c-success)", btnCls: "btn-success" },
    error:   { stripe: "var(--c-error)",   iconBg: "var(--c-error-light)",   iconColor: "var(--c-error)",   btnCls: "btn-error" },
    warning: { stripe: "var(--c-warning)", iconBg: "var(--c-warning-light)", iconColor: "var(--c-warning)", btnCls: "btn-warning" },
    info:    { stripe: "var(--c-info)",    iconBg: "var(--c-info-light)",    iconColor: "var(--c-info)",    btnCls: "btn-info" },
  }[type];
  return (
    <div className="ns-modal ns-modal-stripe">
      <button className="ns-modal-close" onClick={onClose}><Ic.X /></button>
      <div className="ns-stripe" style={{ background: colors.stripe }} />
      <div className="ns-stripe-body">
        <div className="ns-stripe-head">
          <div className="ns-stripe-iconwrap" style={{ background: colors.iconBg, color: colors.iconColor }}>
            {TYPE_ICON[type]}
          </div>
          <h2>{title}</h2>
        </div>
        <p>{body}</p>
        <div className="ns-stripe-actions">
          <button className="ns-btn btn-ghost btn-sm" onClick={onClose}>Dismiss</button>
          <button className={`btn ${colors.btnCls} btn-sm`} onClick={onPrimary ?? onClose}>{primaryLabel}</button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// INLINE ALERT
// ─────────────────────────────────────────────
export function InlineAlert({ type, title, message, dismissible = true }) {
  const [visible, setVisible] = useState(true);
  if (!visible) return null;
  return (
    <div className={`ns-alert t-${type}`}>
      <span className="ns-alert-icon">{TYPE_ICON[type]}</span>
      <div className="ns-alert-body">
        {title && <div className="ns-alert-title">{title}</div>}
        {message}
      </div>
      {dismissible && (
        <button className="ns-alert-dismiss" onClick={() => setVisible(false)}>✕</button>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// TRIGGER CARD
// ─────────────────────────────────────────────
export function TriggerCard({ type, label, sub, badgeLabel, onClick }) {
  const BADGE_STYLES = {
    success: { background: "var(--c-success-light)", color: "var(--c-success)" },
    error:   { background: "var(--c-error-light)",   color: "var(--c-error)" },
    warning: { background: "var(--c-warning-light)", color: "var(--c-warning)" },
    info:    { background: "var(--c-info-light)",     color: "var(--c-info)" },
    neutral: { background: "#f3f4f6", color: "#374151" },
  };
  const ACCENT = {
    success: "var(--c-success)", error: "var(--c-error)", warning: "var(--c-warning)", info: "var(--c-info)", neutral: "#9ca3af",
  };
  return (
    <button className="ns-trigger" onClick={onClick} style={{ borderLeft: `3px solid ${ACCENT[type] ?? ACCENT.neutral}` }}>
      <span className="ns-trigger-badge" style={BADGE_STYLES[type] ?? BADGE_STYLES.neutral}>
        {badgeLabel ?? type}
      </span>
      <span className="ns-trigger-label">{label}</span>
      {sub && <span className="ns-trigger-sub">{sub}</span>}
    </button>
  );
}
