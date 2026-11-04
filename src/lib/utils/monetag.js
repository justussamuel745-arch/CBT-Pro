import { monetagConfig } from "@lib/config/ads.config";

const SCRIPT_ID = `monetag-${monetagConfig.zoneId}`;

export function loadMonetag() {
  if (!monetagConfig.enabled) return;

  if (document.getElementById(SCRIPT_ID)) return;

  const script = document.createElement("script");

  script.id = SCRIPT_ID;
  script.dataset.zone = monetagConfig.zoneId;
  script.src = monetagConfig.scriptUrl;

  (document.body || document.documentElement)
    .appendChild(script);
}
