const DEFAULT_MESSAGES = {
  400: "Please check your input and try again.",
  401: "Your session has expired. Please log in again.",
  403: "You do not have permission to perform this action.",
  404: "Requested data was not found.",
  409: "A record with this information already exists.",
  422: "Some fields are invalid. Please review and try again.",
  429: "Too many requests. Please wait a moment and try again.",
  500: "Something went wrong on the server. Please try again shortly.",
};

const SENSITIVE_PATTERNS = [
  /traceback/i,
  /sql/i,
  /database error/i,
  /internal error/i,
  /exception/i,
  /stack/i,
];

function readMessageFromPayload(payload) {
  if (!payload) return "";

  if (typeof payload === "string") {
    return payload.trim();
  }

  const detail = payload.detail;
  if (Array.isArray(detail) && detail.length > 0) {
    const first = detail[0];
    if (typeof first === "string") return first.trim();
    if (first && typeof first.msg === "string") return first.msg.trim();
  }

  if (typeof detail === "string") return detail.trim();
  if (detail && typeof detail.msg === "string") return detail.msg.trim();

  if (typeof payload.message === "string") return payload.message.trim();
  if (typeof payload.error === "string") return payload.error.trim();

  return "";
}

function toStatusNumber(status) {
  const n = Number(status);
  return Number.isFinite(n) ? n : 0;
}

function normalizeMessageByRules(message, status) {
  const msg = String(message || "").trim();
  const safeStatus = toStatusNumber(status);

  if (!msg) {
    return (
      DEFAULT_MESSAGES[safeStatus] || "Something went wrong. Please try again."
    );
  }

  if (
    safeStatus >= 500 ||
    SENSITIVE_PATTERNS.some((pattern) => pattern.test(msg))
  ) {
    return DEFAULT_MESSAGES[500];
  }

  if (
    /token has expired|session expired|login again|invalid token/i.test(msg)
  ) {
    return DEFAULT_MESSAGES[401];
  }

  if (
    /invalid credentials|incorrect password|invalid email or password/i.test(
      msg,
    )
  ) {
    return "Invalid credentials. Please check your details and try again.";
  }

  if (/security check/i.test(msg)) {
    return "Security verification failed. Please refresh and try again.";
  }

  return msg;
}

export function sanitizeRawErrorMessage(rawMessage, status, fallback) {
  const normalized = normalizeMessageByRules(rawMessage, status);
  if (normalized) return normalized;
  if (fallback) return fallback;
  return (
    DEFAULT_MESSAGES[toStatusNumber(status)] ||
    "Something went wrong. Please try again."
  );
}

export function getUserFriendlyMessageFromPayload(payload, status, fallback) {
  const rawMessage = readMessageFromPayload(payload);
  const normalized = sanitizeRawErrorMessage(rawMessage, status, "");

  if (normalized) return normalized;
  if (fallback) return fallback;

  return (
    DEFAULT_MESSAGES[toStatusNumber(status)] ||
    "Something went wrong. Please try again."
  );
}

export function getUserFriendlyError(
  error,
  fallback = "Something went wrong. Please try again.",
) {
  if (!error) return fallback;

  const status = error?.response?.status || error?.status || 0;
  const payload = error?.response?.data || error?.data;

  const fromPayload = getUserFriendlyMessageFromPayload(payload, status, "");
  if (fromPayload) return fromPayload;

  const msg = typeof error.message === "string" ? error.message : "";
  if (msg) {
    if (/network|failed to fetch|load failed|timeout/i.test(msg)) {
      return "Unable to connect right now. Please check your internet and try again.";
    }
    return normalizeMessageByRules(msg, status);
  }

  return fallback;
}
