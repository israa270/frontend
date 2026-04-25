import type { StoredAuthUser } from "../lib/authCookies";
import { persistAuthCookies } from "../lib/authCookies";
import { getAuthEmailRedirectTo, getSupabaseUrl } from "../lib/env";
import { supabaseAnonHeaders } from "../lib/supabaseHeaders";
import { mapSupabaseNetworkError } from "./mapSupabaseNetworkError";
import { getJwtSubject } from "../lib/jwt";

export type SignUpRequestBody = {
  email: string;
  password: string;
  data: {
    name: string;
    job_title?: string;
  };
  options?: {
    emailRedirectTo?: string;
  };
};

export type SignUpSuccess = {
  access_token?: string;
  refresh_token?: string;
  user?: StoredAuthUser;
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

function userFromSignUpResponse(
  success: SignUpSuccess,
  accessToken: string,
): StoredAuthUser {
  const u = success.user;
  if (u && typeof u.id === "string" && u.id.length > 0) {
    return u;
  }
  const sub = getJwtSubject(accessToken);
  return {
    id: sub ?? "",
    email: u && typeof u.email === "string" ? u.email : undefined,
  };
}

export async function signUpWithPassword(
  body: SignUpRequestBody,
): Promise<SignUpSuccess> {
  const redirectTo = body.options?.emailRedirectTo ?? getAuthEmailRedirectTo();
  const url = `${getSupabaseUrl()}/auth/v1/signup?redirect_to=${encodeURIComponent(redirectTo)}`;
  const payload: SignUpRequestBody = {
    ...body,
    options: {
      ...(body.options ?? {}),
      emailRedirectTo: redirectTo,
    },
  };
  let response: Response;
  try {
    response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...supabaseAnonHeaders(),
      },
      body: JSON.stringify(payload),
    });
  } catch (e) {
    mapSupabaseNetworkError(e);
  }

  const data: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(parseErrorMessage(data));
  }

  const success = data as SignUpSuccess & Record<string, unknown>;
  const access = success.access_token ?? success.session?.access_token;
  const refresh = success.refresh_token ?? success.session?.refresh_token;
  if (typeof access === "string" && typeof refresh === "string") {
    const user = userFromSignUpResponse(success, access);
    if (user.id) {
      persistAuthCookies(
        { access_token: access, refresh_token: refresh, user },
        false,
      );
    }
  }

  return success;
}
