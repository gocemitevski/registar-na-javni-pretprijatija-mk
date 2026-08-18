export function getCanonicalUrl(location) {
  return `${window.location.origin}${location.pathname.replace(/\/$/, "")}/`;
}
