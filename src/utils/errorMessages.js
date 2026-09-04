import i18n from "../i18n/index.js";

// Valid error keys - messages are defined in i18n resources under error.*
export const ERROR_MESSAGES = {
  cors_error: "cors_error",
  file_not_found: "file_not_found",
  network_error: "network_error",
  corrupted_data: "corrupted_data",
  unknown: "unknown",
};

export function getErrorMessageKey(err) {
  const msg = String(err?.message ?? err ?? "");
  const lowerMsg = msg.toLowerCase();
  const { code, status } = err || {};
  if (status === 404 || msg.includes("Failed to fetch data: 404")) return "file_not_found";
  if (lowerMsg.includes("cors") || code === "ERR_NETWORK_CROSS_ORIGIN") return "cors_error";
  if (
    msg.includes("not a valid ODS") ||
    msg.includes("invalid data") ||
    msg.includes("Unsupported file") ||
    (code && ["ODS_FORMAT_ERROR", "INVALID_ODS"].includes(code))
  ) {
    return "corrupted_data";
  }
  if (typeof status === "number" && status >= 400) return "network_error";
  if (msg.includes("Failed to fetch data:")) return "network_error";
  // Browser fetch network failures are TypeError: Failed to fetch (often no CORS substring)
  if (msg.includes("Failed to fetch") || msg.includes("NetworkError") || msg.includes("Load failed")) {
    return "network_error";
  }
  if (
    msg.includes("ECONNREFUSED") ||
    msg.includes("network is not accessible") ||
    (code && ["ENOTFOUND", "ECONNRESET"].includes(code))
  ) {
    return "network_error";
  }
  return "unknown";
}

// Get localized message text via i18n (synchronous, with fallback)
export const getErrorMessageText = (messageKey, lang) => {
  const key = ERROR_MESSAGES[messageKey] ? messageKey : "unknown";
  try {
    if (i18n?.t) return i18n.t(`error.${key}`, { lng: lang });
  } catch {
    // ignore
  }
  return key;
};
