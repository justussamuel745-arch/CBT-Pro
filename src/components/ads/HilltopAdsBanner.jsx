import { useEffect, useRef, useState } from "react";

// Reusable hook: share it with any other component that needs connectivity state
export function useOnlineStatus() {
  const [online, setOnline] = useState(
    typeof navigator === "undefined" ? true : navigator.onLine
  );

  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, []);

  return online;
}

const buildSrcDoc = (src) => `<!doctype html>
<html>
<head>
<meta name="color-scheme" content="light dark">
<style>
  html, body { margin: 0; padding: 0; background: transparent; height: 100%; }
  body { display: flex; justify-content: center; align-items: center; overflow: hidden; }
</style>
</head>
<body>
<script>
(function(yoam){
  var d=document, s=d.createElement('script'),
      l=d.currentScript||d.scripts[d.scripts.length-1];
  s.settings=yoam||{};
  s.src=${JSON.stringify(src)};
  s.async=true;
  s.referrerPolicy='no-referrer-when-downgrade';
  l.parentNode.insertBefore(s,l);
})({})
</script>
</body>
</html>`;

const AD_SELECTOR = "iframe, ins, img, video, a, canvas, div";

export default function HilltopAdsBanner({ src, height = 250 }) {
  const online = useOnlineStatus();
  const [filled, setFilled] = useState(false);
  const observerRef = useRef(null);

  // Start fresh whenever the ad source changes or the connection comes back
  useEffect(() => {
    setFilled(false);
    return () => observerRef.current?.disconnect();
  }, [src, online]);

  // Wait as long as the ad needs: no timeout. Watches the iframe until the ad renders.
  const handleLoad = (e) => {
    observerRef.current?.disconnect();

    try {
      const body = e.currentTarget.contentDocument?.body;
      if (!body) return setFilled(true);

      const check = () => {
        if (body.querySelector(AD_SELECTOR)) {
          setFilled(true);
          observerRef.current?.disconnect();
          return true;
        }
        return false;
      };

      if (check()) return;

      observerRef.current = new MutationObserver(check);
      observerRef.current.observe(body, { childList: true, subtree: true });
    } catch {
      // Cross-origin access blocked: assume the ad is showing
      setFilled(true);
    }
  };

  // Offline: remove the whole container
  if (!online) return null;

  return (
    <aside
      aria-label="Advertisement"
      style={{
        width: "100%",
        maxWidth: 760,
        margin: "20px auto",
        padding: "0 8px",
        boxSizing: "border-box",
      }}
    >
      <style>{`
        @keyframes ad-shimmer {
          0% { background-position: -400px 0; }
          100% { background-position: 400px 0; }
        }
        .ad-skeleton {
          background: linear-gradient(90deg,
            var(--card, #f3f4f6) 25%,
            var(--border, rgba(128,128,128,.18)) 50%,
            var(--card, #f3f4f6) 75%);
          background-size: 800px 100%;
          animation: ad-shimmer 1.6s infinite linear;
        }
        @media (prefers-reduced-motion: reduce) {
          .ad-skeleton { animation: none; }
        }
      `}</style>

      <div
        style={{
          border: "1px solid var(--border, rgba(128,128,128,.25))",
          borderRadius: "var(--radius-md, 12px)",
          background: "var(--card, transparent)",
          boxShadow: "0 1px 3px rgba(0,0,0,.08)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "6px 12px",
            borderBottom: "1px solid var(--border, rgba(128,128,128,.2))",
            fontSize: 10,
            letterSpacing: "1.2px",
            textTransform: "uppercase",
            color: "var(--text-muted, #888)",
          }}
        >
          <span>Advertisement</span>
          <span aria-hidden="true">Ad</span>
        </div>

        <div
          style={{
            position: "relative",
            width: "100%",
            minHeight: height,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {/* Loading state: stays until the ad appears, however long it takes */}
          {!filled && (
            <div
              className="ad-skeleton"
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--text-muted, #888)",
                fontSize: 13,
              }}
            >
              Loading advertisement…
            </div>
          )}

          <iframe
            key={src}
            title="Advertisement"
            srcDoc={buildSrcDoc(src)}
            onLoad={handleLoad}
            width="100%"
            height={height}
            scrolling="no"
            style={{
              border: 0,
              display: "block",
              width: "100%",
              height,
              background: "transparent",
              position: "relative",
              opacity: filled ? 1 : 0,
              pointerEvents: filled ? "auto" : "none",
            }}
          />
        </div>
      </div>
    </aside>
  );
}