import { z } from "zod";

function isTodayOrFuture(dateString: string): boolean {
  if (!dateString) return true;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const selected = new Date(`${dateString}T00:00:00`);
  if (Number.isNaN(selected.getTime())) return false;
  return selected.getTime() >= today.getTime();
}

export const addEpicFormSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Title is required.")
    .min(3, "Title must be at least 3 characters.")
    .max(120, "Title must be at most 120 characters."),
  description: z.string().max(500, "Description must be at most 500 characters."),
  assigneeId: z.string(),
  deadline: z
    .string()
    .refine(isTodayOrFuture, "Deadline must be today or a future date."),
});

export type AddEpicFormValues = z.infer<typeof addEpicFormSchema>;
