import { z } from "zod";
import { passwordValueSchema } from "./passwordValue";

export const resetPasswordFormSchema = z
  .object({
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

export type ResetPasswordFormValues = z.infer<typeof resetPasswordFormSchema>;
