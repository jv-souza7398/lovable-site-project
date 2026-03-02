/**
 * Client-side analytics tracking for Vincci Bar.
 * Generates a device fingerprint and sends events to the analytics edge function.
 */

let cachedFingerprint = null;

/** Generate a SHA-256 based device fingerprint */
async function generateFingerprint() {
  if (cachedFingerprint) return cachedFingerprint;

  const data = {
    userAgent: navigator.userAgent,
    language: navigator.language,
    screenResolution: `${screen.width}x${screen.height}`,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    platform: navigator.platform,
    colorDepth: screen.colorDepth,
    hardwareConcurrency: navigator.hardwareConcurrency || 0,
  };

  const encoder = new TextEncoder();
  const hashBuffer = await crypto.subtle.digest("SHA-256", encoder.encode(JSON.stringify(data)));
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  cachedFingerprint = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  return cachedFingerprint;
}

/** Detect device type from user agent */
function getDeviceType() {
  const ua = navigator.userAgent;
  if (/tablet|ipad|playbook|silk/i.test(ua)) return "tablet";
  if (/mobile|iphone|ipod|android|blackberry|opera mini|iemobile/i.test(ua)) return "mobile";
  return "desktop";
}

/** Check if we should track (production only) */
function shouldTrack() {
  const hostname = window.location.hostname;
  return hostname.includes("vinccibar.com") || hostname.includes("lovable.app");
}

/** Send tracking data to the analytics edge function */
async function sendToAnalytics(payload) {
  if (!shouldTrack()) return;

  try {
    const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analytics`;
    await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
      },
      body: JSON.stringify(payload),
    });
  } catch (err) {
    // Silent fail - analytics should never break the app
    console.warn("[Analytics] Failed to send:", err);
  }
}

/** Track a page view */
export async function trackPageView(pageUrl) {
  const fingerprint = await generateFingerprint();
  await sendToAnalytics({
    type: "pageview",
    device_fingerprint: fingerprint,
    user_agent: navigator.userAgent,
    page_url: pageUrl || window.location.pathname,
    referrer: document.referrer || "",
    device_type: getDeviceType(),
  });
}

/** Track a custom event */
export async function trackEvent(eventType, eventData = {}) {
  const fingerprint = await generateFingerprint();
  await sendToAnalytics({
    type: "event",
    device_fingerprint: fingerprint,
    event_type: eventType,
    event_data: eventData,
    page_url: window.location.pathname,
  });
}
