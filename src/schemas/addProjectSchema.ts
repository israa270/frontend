import { z } from "zod";

export const addProjectFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Project title is required.")
    .min(3, "Project name must be at least 3 characters.")
    .max(100, "Project name must be at most 100 characters."),
  description: z
    .string()
    .max(500, "Description must be at most 500 characters."),
});

export type AddProjectFormValues = z.infer<typeof addProjectFormSchema>;
