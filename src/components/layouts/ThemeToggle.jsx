import { useEffect, useState } from 'react';

const STORAGE_KEY = 'theme';

function getInitialTheme() {
  if (typeof window === 'undefined') return 'light';
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored === 'light' || stored === 'dark') return stored;
  const prefersDark =
    window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  return prefersDark ? 'dark' : 'light';
}

/**
 * Decorated light/dark switch. Toggles <html data-theme="dark"> and
 * persists the choice. Defaults to the OS preference on first visit.
 */
export function ThemeToggle() {
  const [theme, setTheme] = useState(getInitialTheme);
  const isDark = theme === 'dark';

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = theme;
    root.style.colorScheme = theme;
    window.localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  // Keep in sync if the OS preference changes and the user hasn't chosen.
  useEffect(() => {
    if (!window.matchMedia) return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = (e) => {
      if (!window.localStorage.getItem(STORAGE_KEY)) {
        setTheme(e.matches ? 'dark' : 'light');
      }
    };
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isDark}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className="theme-switch"
      onClick={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
    >
      <span className="theme-switch-track" aria-hidden="true">
        <i className="fa-solid fa-sun theme-switch-icon theme-switch-icon-sun"></i>
        <i className="fa-solid fa-moon theme-switch-icon theme-switch-icon-moon"></i>
      </span>
      <span className="theme-switch-thumb" aria-hidden="true">
        <i className={`fa-solid ${isDark ? 'fa-moon' : 'fa-sun'}`}></i>
      </span>
    </button>
  );
}
