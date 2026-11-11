export function loadMonetag(zoneConfig) {
  const SCRIPT_ID = `monetag-${zoneConfig.zoneId}`;
  
  if (!zoneConfig.enabled) return;

  if (document.getElementById(SCRIPT_ID)) return;

  const script = document.createElement("script");

  script.id = SCRIPT_ID;
  script.dataset.zone = zoneConfig.zoneId;
  script.src = zoneConfig.scriptUrl;

  (document.body || document.documentElement)
    .appendChild(script);
}
