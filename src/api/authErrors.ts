type GoTrueErrorBody = {
  error?: string;
  error_code?: string;
  error_description?: string;
  msg?: string;
  message?: string;
};

export function parseGoTrueErrorMessage(data: unknown): string {
  if (!data || typeof data !== "object") {
    return "Something went wrong. Please try again.";
  }
  const body = data as GoTrueErrorBody;
  if (body.error === "invalid_grant" || body.error_code === "invalid_grant") {
    return "Invalid email or password.";
  }
  const msg =
    body.msg ??
    body.message ??
    body.error_description ??
    body.error ??
    body.error_code;
  if (typeof msg === "string" && msg.length > 0) {
    return humanizeAuthError(msg);
  }
  return "Something went wrong. Please try again.";
}

function humanizeAuthError(raw: string): string {
  const lower = raw.toLowerCase();
  if (
    lower.includes("invalid_grant") ||
    lower.includes("invalid login") ||
    lower.includes("invalid credentials") ||
    lower === "invalid email or password"
  ) {
    return "Invalid email or password.";
  }
  if (lower.includes("already registered") || lower.includes("user already")) {
    return "An account with this email already exists. Try logging in instead.";
  }
  return raw;
}
