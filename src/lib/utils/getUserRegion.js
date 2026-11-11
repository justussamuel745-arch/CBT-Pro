const CACHE_KEY = 'user-region';
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 1 day
const TIMEOUT_MS = 4000;

// "Rivers State" -> "Rivers"
const cleanRegion = (name) =>
  typeof name === 'string' ? name.replace(/\s+State$/i, '').trim() || null : null;

const fetchJson = async (url) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } finally {
    clearTimeout(timer);
  }
};

// Tried in order until one returns a region. All are free and HTTPS.
const PROVIDERS = [
  async () => cleanRegion((await fetchJson('https://ipapi.co/json/')).region),
  async () => {
    const data = await fetchJson('https://ipwho.is/');
    return data.success === false ? null : cleanRegion(data.region);
  },
  async () => cleanRegion((await fetchJson('https://get.geojs.io/v1/ip/geo.json')).region),
];

const readCache = () => {
  try {
    const cached = JSON.parse(localStorage.getItem(CACHE_KEY));
    return cached && Date.now() - cached.savedAt < CACHE_TTL_MS ? cached.region : null;
  } catch {
    return null;
  }
};

const writeCache = (region) => {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ region, savedAt: Date.now() }));
  } catch {
    // storage unavailable (private mode); skip caching
  }
};

export async function getUserRegion() {
  const cached = readCache();
  if (cached) return cached;

  for (const lookup of PROVIDERS) {
    try {
      const region = await lookup();
      if (region) {
        writeCache(region);
        return region;
      }
    } catch {
      // timeout, rate limit or network error: try the next provider
    }
  }
  return null; // every provider failed
}