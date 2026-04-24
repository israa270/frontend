# React Hook Form + Zod (stack deep dive)

This project uses **React Hook Form (RHF)** to manage **form state** and **React Hook Form + Zod** as the **validation** layer, connected by **`@hookform/resolvers/zod`** (`zodResolver`).

## Why a form library at all?

- **Controlled** inputs with `useState` for every field are fine for tiny forms, but for many fields and validation rules you get **a lot of wiring** and **re-renders**.  
- **RHF** keeps references to DOM inputs (`register`) and **validates on demand** (on blur, on submit, etc., depending on `mode` / `reValidateMode`).

## Why Zod on top?

- **TypeScript** does not validate at **runtime** when the user pastes a string.  
- **Zod** describes **the same rules** you care about in product copy (“Title is required”, “at most 500 characters”): you get **one schema** to feed both **TS inference** and **RHF** via the **resolver**.

## How they connect

1. You define a **Zod** schema, for example `addEpicFormSchema` in `src/schemas/addEpicSchema.ts`, or a **factory** for edit, e.g. `createEditEpicFormSchema`, in `editEpicSchema.ts`.  
2. You pass it to the resolver:  
   `useForm<FormValues>({ resolver: zodResolver(yourSchema), defaultValues, mode: "onTouched" })`  
3. You **`register("fieldName")`** on inputs and **`handleSubmit(onValid)`** on the form. RHF will run the schema; errors land in `formState.errors`.  
4. You show `errors.title?.message` (and `role="alert"`) for accessibility.

## Patterns used in this codebase

- **`mode: "onTouched"`** — Validate after a field is touched, then `reValidateMode: "onChange"` for quicker feedback.  
- **`useWatch`** — For the description character count without manually syncing state.  
- **Optional fields** — Empty `assigneeId` is often an empty `""` in the `select` and is turned into `null` for the API.  
- **Cross-field** or **date** rules use **`.refine()`** in Zod (add epic deadline must be **today or future**; edit epic can **keep a past** deadline if unchanged — see the edit schema).

## Example files to read in order

1. `AddEpicPage.tsx` — Full form, members `select`, date input, character counter, submit, navigate on success.  
2. `addEpicSchema.ts` — Zod rules.  
3. `EditEpicPage.tsx` — Inner form `key={epic.id}` so the schema matches **one** loaded epic.  
4. `EditProjectPage` or `AddProjectPage` if you want a second style of form.

## What RHF does *not* do

- It does not **call your REST API**; submit handlers still **`await createEpic(token, { ... })`**.  
- It does not replace **server-side** validation; the API may still return **400/403**; you show those in `apiError` state.

## Related

- `ZOD.md` — Zod-only basics.  
- `FRONTEND_EXTRAS.md` — other form approaches in the wild.
