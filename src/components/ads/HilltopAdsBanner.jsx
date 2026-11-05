import { useEffect, useRef } from "react";

export default function HilltopAdsBanner({ src, height = 250 }) {
  const ref = useRef(null);
  const loadedRef = useRef(false);

  useEffect(() => {
    const container = ref.current;
    if (!container || !src) return;

    const loadAd = () => {
      if (loadedRef.current) return; // request only once
      loadedRef.current = true;

      const script = document.createElement("script");
      script.textContent = `
        (function(yoam){
          var d = document,
              s = d.createElement('script'),
              l = d.currentScript || d.scripts[d.scripts.length - 1];

          s.settings = yoam || {};
          s.src = "${src}";
          s.async = true;
          s.referrerPolicy = 'no-referrer-when-downgrade';

          l.parentNode.insertBefore(s, l);
        })({})
      `;
      container.appendChild(script);
    };

    if (navigator.onLine) {
      loadAd();
      return;
    }

    // Offline: wait until the user comes online, then load once
    const handleOnline = () => {
      loadAd();
      window.removeEventListener("online", handleOnline);
    };
    window.addEventListener("online", handleOnline);

    return () => window.removeEventListener("online", handleOnline);
  }, [src]);

  return (
    <div style={{ textAlign: "center", margin: "20px 0" }}>
      <small
        style={{
          color: "#888",
          fontSize: "11px",
          letterSpacing: "1px",
        }}
      >
        ADVERTISEMENT
      </small>

      <div
        ref={ref}
        style={{
          maxWidth: "728px",
          width: "97%",
          margin: "5px auto",
          borderRadius: "12px",
          padding: 0,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          color: "#000",
          fontFamily: "sans-serif",
          textAlign: "left",
          minHeight: height,
          overflow: "hidden",
          background: "#f5f5f5",
        }}
      />
    </div>
  );
}