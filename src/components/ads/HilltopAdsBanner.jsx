import { useEffect, useRef } from "react";
import { useLocation } from "react-router";

export default function HilltopAdsBanner({ src, height = 250 }) {
  const ref = useRef(null);
  const location = useLocation();

  useEffect(() => {
    const container = ref.current;

    if (!container || !src) return;

    container.innerHTML = "";

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

    return () => {
      container.innerHTML = "";
    };
  }, [location.pathname, src]);

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
