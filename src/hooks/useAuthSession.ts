import { useContext } from "react";
import {
  AuthSessionContext,
  type AuthSessionContextValue,
} from "../context/authSessionContext";

export function useAuthSession(): AuthSessionContextValue {
  const ctx = useContext(AuthSessionContext);
  if (!ctx) {
    throw new Error("useAuthSession must be used within AuthSessionProvider");
  }
  return ctx;
}
