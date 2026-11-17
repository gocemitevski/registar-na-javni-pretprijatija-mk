const DEFAULT_MATOMO_URL = "https://analytics.gocemitevski.com/";
const DEFAULT_MATOMO_SITE_ID = "6";
const SCRIPT_ID = "matomo-tracker";

const MATOMO_URL = (import.meta.env.VITE_APP_MATOMO_URL || DEFAULT_MATOMO_URL).replace(/\/?$/, "/");
const MATOMO_SITE_ID = import.meta.env.VITE_APP_MATOMO_SITE_ID || DEFAULT_MATOMO_SITE_ID;

let initialized = false;
let lastTrackedKey = null;
let lastTrackedPath = null;
let previousPageUrl = null;

function splitPath(path) {
  const [pathname, search = ""] = path.split("?");
  return { pathname, search };
}

// Pages that normalise their URL once their data has loaded (e.g. /mk ->
// /mk?year=2026) perform a replace navigation that only fills in the default
// query params of the page that was just tracked. That is the same page view,
// not a second one.
function isSamePage(previousPath, path) {
  if (!previousPath) return false;

  return splitPath(previousPath).pathname === splitPath(path).pathname;
}

export function initMatomo() {
  if (initialized) return;
  initialized = true;

  window._paq = window._paq || [];
  // Cookieless tracking: nothing is stored on the visitor's device, so no
  // cookie consent is required. Must be queued before any page view.
  window._paq.push(["disableCookies"]);
  window._paq.push(["setDoNotTrack", true]);
  window._paq.push(["setTrackerUrl", `${MATOMO_URL}matomo.php`]);
  window._paq.push(["setSiteId", MATOMO_SITE_ID]);
  window._paq.push(["enableLinkTracking"]);

  if (document.getElementById(SCRIPT_ID)) return;

  const script = document.createElement("script");
  script.id = SCRIPT_ID;
  script.async = true;
  script.src = `${MATOMO_URL}matomo.js`;
  document.head.appendChild(script);
}

// Single Page App tracking: Matomo cannot detect route changes on its own, so
// every navigation has to report the new URL and title explicitly.
export function trackPageView({ path, title, isUrlNormalization = false }) {
  if (!initialized) return;

  if (isUrlNormalization && isSamePage(lastTrackedPath, path)) return;

  // Consecutive identical reports (e.g. repeated title updates for the same
  // route) must not inflate page views.
  const key = `${path}|${title}`;
  if (key === lastTrackedKey) return;
  lastTrackedKey = key;
  lastTrackedPath = path;

  window._paq.push(["setCustomUrl", path]);
  if (previousPageUrl) {
    window._paq.push(["setReferrerUrl", previousPageUrl]);
  }
  window._paq.push(["setDocumentTitle", title]);
  window._paq.push(["trackPageView"]);

  previousPageUrl = new URL(path, window.location.origin).href;
}

export function getCurrentPath() {
  return `${window.location.pathname}${window.location.search}`;
}
