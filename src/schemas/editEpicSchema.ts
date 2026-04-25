import { z } from "zod";

function isTodayOrFuture(dateString: string): boolean {
  if (!dateString) return true;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const selected = new Date(`${dateString}T00:00:00`);
  if (Number.isNaN(selected.getTime())) return false;
  return selected.getTime() >= today.getTime();
}

/**
 * When editing, allow keeping an existing past deadline, but new picks must be today or later.
 * `initialDeadlineInput` is the `<input type="date">` value (yyyy-mm-dd) for the current epic, or "".
 */
export function createEditEpicFormSchema(opts: { initialDeadlineInput: string }) {
  return z.object({
    title: z
      .string()
      .trim()
      .min(1, "Title is required.")
      .min(3, "Title must be at least 3 characters.")
      .max(120, "Title must be at most 120 characters."),
    description: z.string().max(500, "Description must be at most 500 characters."),
    assigneeId: z.string(),
    deadline: z.string().refine(
      (s) => {
        if (!s) return true;
        if (opts.initialDeadlineInput && s === opts.initialDeadlineInput) return true;
        return isTodayOrFuture(s);
      },
      {
        message:
          "Deadline must be today or a future date (or keep the current deadline, including a past one).",
      },
    ),
  });
}

export type EditEpicFormValues = {
  title: string;
  description: string;
  assigneeId: string;
  deadline: string;
};
