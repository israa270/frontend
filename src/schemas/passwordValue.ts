import { z } from "zod";

const PASSWORD_SPECIAL_RE = /[!@#$%^&*]/;

/** Same rules as sign-up password (without confirm). */
export const passwordValueSchema = z
  .string()
  .min(1, "Enter a password.")
  .min(8, "Password must be at least 8 characters.")
  .max(64, "Password must be at most 64 characters.")
  .refine((value) => !/\s/.test(value), {
    message: "Password cannot contain spaces.",
  })
  .refine((value) => /[A-Z]/.test(value), {
    message: "Include at least one uppercase letter (A–Z).",
  })
  .refine((value) => /[a-z]/.test(value), {
    message: "Include at least one lowercase letter (a–z).",
  })
  .refine((value) => /[0-9]/.test(value), {
    message: "Include at least one digit (0–9).",
  })
  .refine((value) => PASSWORD_SPECIAL_RE.test(value), {
    message: "Include at least one special character (!@#$%^&*).",
  });
