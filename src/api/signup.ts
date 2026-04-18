import { getSupabaseAnonKey, getSupabaseUrl } from "../lib/env";
import { persistSession } from "../lib/session";

export type SignUpRequestBody = {
  email: string;
  password: string;
  data: {
    name: string;
    job_title?: string;
  };
};

export type SignUpSuccess = {
  access_token?: string;
  refresh_token?: string;
  user?: { id: string; email?: string };
  session?: {
    access_token?: string;
    refresh_token?: string;
  };
};

type GoTrueErrorBody = {
  error?: string;
  error_code?: string;
  error_description?: string;
  msg?: string;
  message?: string;
};

function parseErrorMessage(data: unknown): string {
  if (!data || typeof data !== "object") {
    return "Something went wrong. Please try again.";
  }
  const body = data as GoTrueErrorBody;
  const msg =
    body.msg ??
    body.message ??
    body.error_description ??
    body.error ??
    body.error_code;
  if (typeof msg === "string" && msg.length > 0) {
    return humanizeApiError(msg);
  }
  return "Something went wrong. Please try again.";
}

function humanizeApiError(raw: string): string {
  const lower = raw.toLowerCase();
  if (lower.includes("already registered") || lower.includes("user already")) {
    return "An account with this email already exists. Try logging in instead.";
  }
  if (lower.includes("password")) {
    return raw;
  }
  return raw;
}

export async function signUpWithPassword(
  body: SignUpRequestBody,
): Promise<SignUpSuccess> {
  const url = `${getSupabaseUrl()}/auth/v1/signup`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: getSupabaseAnonKey(),
    },
    body: JSON.stringify(body),
  });

  const data: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(parseErrorMessage(data));
  }

  const success = data as SignUpSuccess & Record<string, unknown>;
  const access = success.access_token ?? success.session?.access_token;
  const refresh = success.refresh_token ?? success.session?.refresh_token;
  if (typeof access === "string" && typeof refresh === "string") {
    persistSession({ access_token: access, refresh_token: refresh });
  }

  return success;
}
