# Zod — simple guide (for this project)

**Zod** is a small library for **describing and validating** data. In this app it is used together with **react-hook-form** to validate form fields and show errors before (or as) the user submits.

## Why not only TypeScript types?

- **TypeScript types disappear** when the code is compiled. They do not exist at **runtime** when a user types in a form.
- **Zod** runs at **runtime** and checks real strings from inputs (empty title, too long, wrong date, and so on).

You often use both: TypeScript in your components, Zod in your submit path and error messages.

## A minimal schema

```ts
import { z } from "zod";

const nameSchema = z.string().min(1, "Name is required.");
```

- **`z.string()`** — Expects a string.
- **`.min(1, "message")`** — If shorter than 1 character, fail with that message.

## Chaining rules

```ts
z
  .string()
  .trim()
  .min(3, "At least 3 characters.")
  .max(120, "At most 120 characters.");
```

- **`.trim()`** — In recent Zod, often used on the schema; the exact API matches the version in `package.json` (this project already uses a pattern you can copy from `src/schemas/`).

## Objects (forms)

```ts
const formSchema = z.object({
  title: z.string().min(1, "Title is required."),
  email: z.string().email("Invalid email."),
});
```

- **`z.infer<typeof formSchema>`** — TypeScript type of the **values** the schema accepts when validation passes.

## Optional and nullish

- **`z.string().optional()`** — Field may be `undefined`.
- **`z.union([z.string(), z.null()])`** — Field may be a string or `null`, depending on need.

## Custom checks with `refine`

Use **`.refine((value) => boolean, { message: "…" })`** for rules that are not a single built-in check, for example “deadline must be today or later” (see `addEpicSchema.ts` and `editEpicSchema.ts` in this project).

**Edit epic** can use a function that **returns a new schema** with the **initial deadline** baked in, so the user is allowed to keep an old past deadline as long as they do not change it to another invalid value.

## React Hook Form integration

- **`@hookform/resolvers/zod`** provides `zodResolver(formSchema)`.
- Pass **resolver** into `useForm` so on submit, React Hook Form runs Zod, maps errors to field names, and you read them from `formState.errors`.

In this project, see **`AddEpicPage`** for a full example: `useForm` + `register` + error messages in JSX.

## When validation runs

- Mode like **`onTouched`** (used here) can validate after the user has touched a field, then revalidate on change. That balances feedback and noise.

## Summary

- **Zod** = runtime validation and clear error messages.  
- **TypeScript** = compile-time help in the editor.  
- Together, they make forms **safer** and **easier to maintain**.
