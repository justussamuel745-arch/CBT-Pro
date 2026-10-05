// ─────────────────────────────────────────────────────────────
// PLATFORM / BROWSER DETECTION
// ─────────────────────────────────────────────────────────────
export function detectEnvironment() {
  const ua = navigator.userAgent;

  const isIOS = /iPad|iPhone|iPod/.test(ua) && !window.MSStream;
  const isAndroid = /Android/i.test(ua);
  const isDesktop = !isIOS && !isAndroid;

  let browser = "other";
  if (/EdgiOS/i.test(ua)) browser = "edge-ios";
  else if (/CriOS/i.test(ua)) browser = "chrome-ios";
  else if (/FxiOS/i.test(ua)) browser = "firefox-ios";
  else if (/SamsungBrowser/i.test(ua)) browser = "samsung";
  else if (/OPR\//i.test(ua) || /Opera/i.test(ua)) browser = "opera";
  else if (/Edg\//i.test(ua)) browser = "edge";
  else if (/Firefox\//i.test(ua)) browser = "firefox";
  else if (/Chrome\//i.test(ua)) browser = "chrome";
  else if (/Safari\//i.test(ua)) browser = "safari";

  return { isIOS, isAndroid, isDesktop, browser };
}
