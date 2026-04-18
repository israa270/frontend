import { z } from "zod";
import { passwordValueSchema } from "./passwordValue";

/** Letters in any script; words separated by a single space; no double spaces, digits, or symbols. */
const NAME_PATTERN = /^(?!.*\s{2})[\p{L}]+(?: [\p{L}]+)*$/u;

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
    password: passwordValueSchema,
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
