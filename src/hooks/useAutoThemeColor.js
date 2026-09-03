// useAutoThemeColor.js
import { useEffect, useRef } from 'react';

export function useAutoThemeColor() {
  const rafId = useRef(null);

  useEffect(() => {
    const meta = document.querySelector('meta[name="theme-color"]');
    if (!meta) return;

    const getClosestBackground = (el) => {
      while (el && el !== document.documentElement) {
        const bg = getComputedStyle(el).backgroundColor;
        if (bg && bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent') {
          return bg;
        }
        el = el.parentElement;
      }
      // fallback to body/html if nothing solid found
      return getComputedStyle(document.body).backgroundColor || '#ffffff';
    };

    const syncColor = () => {
      const topEl = document.elementFromPoint(window.innerWidth / 2, 2);
      if (!topEl) return;

      const bg = getClosestBackground(topEl);
      const hex = rgbToHex(bg);

      /*
      console.log('[theme-color]', {
        sampledElement: topEl,
        className: topEl.className,
        rawBg: bg,
        hex,
      });
      */

      meta.setAttribute('content', hex);
    };

    const scheduleSync = () => {
      if (rafId.current) cancelAnimationFrame(rafId.current);
      rafId.current = requestAnimationFrame(syncColor);
    };

    // initial run
    scheduleSync();

    // re-check on route changes, scroll, resize, and DOM mutations
    const observer = new MutationObserver(scheduleSync);
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: [ 'class', 'style' ],
      childList: true,
      subtree: true,
    });

    window.addEventListener('scroll', scheduleSync, { passive: true });
    window.addEventListener('resize', scheduleSync);

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', scheduleSync);
      window.removeEventListener('resize', scheduleSync);
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, []);
}

function rgbToHex(rgb) {
  const match = rgb.match(/\d+/g);
  if (!match) return '#ffffff';
  const [ r, g, b ] = match.map(Number);
  return '#' + [ r, g, b ].map(x => x.toString(16).padStart(2, '0')).join('');
}