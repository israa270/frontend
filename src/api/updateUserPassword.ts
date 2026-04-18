import { getSupabaseAnonKey, getSupabaseUrl } from "../lib/env";
import { parseGoTrueErrorMessage } from "./authErrors";

export async function updateUserPassword(
  accessToken: string,
  newPassword: string,
): Promise<void> {
  const url = `${getSupabaseUrl()}/auth/v1/user`;
  const response = await fetch(url, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      apikey: getSupabaseAnonKey(),
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ password: newPassword }),
  });

  const data: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(parseGoTrueErrorMessage(data));
  }
}
