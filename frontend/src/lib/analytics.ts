// [VERIFY] consent banner needed for India's data protection law (DPDP Act)
// before enabling analytics in production.

declare global {
  interface Window {
    dataLayer?: unknown[];
  }
}

export const GA_ID = process.env.NEXT_PUBLIC_GA_ID;
export const analyticsEnabled = Boolean(GA_ID) && process.env.NODE_ENV === "production";

const UTM_STORAGE_KEY = "af_utm";
const UTM_PARAMS = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"] as const;

// Captures UTM params from the current URL into sessionStorage on first
// landing, so later pages/events can still attribute back to the campaign
// that brought the visitor in.
export function captureUtmParams(): void {
  if (typeof window === "undefined") return;
  // First-touch: once a UTM set is saved for this session, later visits
  // (even with different UTM params) must not overwrite it.
  if (window.sessionStorage.getItem(UTM_STORAGE_KEY)) return;
  const params = new URLSearchParams(window.location.search);
  const found: Record<string, string> = {};
  for (const key of UTM_PARAMS) {
    const value = params.get(key);
    if (value) found[key] = value;
  }
  if (Object.keys(found).length > 0) {
    window.sessionStorage.setItem(UTM_STORAGE_KEY, JSON.stringify(found));
  }
}

export function getSavedUtmParams(): Record<string, string> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.sessionStorage.getItem(UTM_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

// Attribution for a lead/order should stick to whichever campaign first
// brought the visitor in, so the saved first-touch UTM always wins for a
// key it already has; only a UTM param present on the current URL but
// missing from the saved set gets added.
export function getMergedUtmParams(currentParams: Record<string, string>): Record<string, string> {
  const saved = getSavedUtmParams();
  const merged: Record<string, string> = {};
  for (const key of UTM_PARAMS) {
    const value = saved[key] || currentParams[key];
    if (value) merged[key] = value;
  }
  return merged;
}

export function track(eventName: string, params?: Record<string, unknown>): void {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer ?? [];
  window.dataLayer.push({ event: eventName, ...params });
}
