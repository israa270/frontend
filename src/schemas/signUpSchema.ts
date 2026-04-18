import { z } from "zod";

/** Letters in any script; words separated by a single space; no double spaces, digits, or symbols. */
const NAME_PATTERN = /^(?!.*\s{2})[\p{L}]+(?: [\p{L}]+)*$/u;

const PASSWORD_SPECIAL_RE = /[!@#$%^&*]/;

export const signUpFormSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, "Enter your full name.")
      .min(3, "Name must be at least 3 characters.")
      .max(50, "Name must be at most 50 characters.")
      .regex(
        NAME_PATTERN,
        "Use letters only (including accented or non‑Latin letters), with single spaces between names. No numbers, symbols, emojis, or double spaces.",
      ),
    email: z.email("Enter a valid email address."),
    jobTitle: z.string().max(100, "Job title must be at most 100 characters."),
    password: z
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
      }),
    confirmPassword: z.string().min(1, "Confirm your password."),
  })
  .superRefine((data, ctx) => {
    if (data.password !== data.confirmPassword) {
      ctx.addIssue({
        code: "custom",
        path: ["confirmPassword"],
        message: "Passwords do not match.",
      });
    }
  });

export type SignUpFormValues = z.infer<typeof signUpFormSchema>;
