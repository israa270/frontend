# TypeScript — simple guide (for this project)

**TypeScript** is **JavaScript with types added**. The browser does not run TypeScript directly. The **TypeScript compiler** (`tsc`) checks your project and, with this setup, the **build step** turns TS into JavaScript (Vite does this as part of `pnpm run build` and during `dev`).

## Why use types?

Types document **what shape** data has (string, number, object with certain fields, etc.). The editor can **autocomplete** and **warn you** before you run the app: wrong property name, wrong argument type, missing field, and so on.

## Basic syntax

- **Annotate a variable**  
  `const name: string = "Aya";`  
  `const count: number = 0;`  
  `const ok: boolean = true;`

- **Function arguments and return**  
  `function add(a: number, b: number): number { return a + b; }`

- **Arrays**  
  `const ids: string[] = ["a", "b"];`  
  or `const ids: Array<string> = [...];`

## `interface` and `type`

Both describe the shape of an object. This project often uses `type` or `interface` for API models:

```ts
type User = { id: string; name: string; email: string | null };
```

- **`string | null`** — Either a string or the special value `null` (a **union** type).

## Optional properties

A field with `?` may be missing:

`description?: string`  
Means: either absent or a string (often you still treat it as `string | undefined` when read).

## `as` (assertion) — use sparingly

`value as string` tells the compiler “trust me, this is a string.” If you are wrong, you only find out at **runtime**. Prefer proper checks, normalization in API code, and types that match the real data.

## `unknown` and narrowing

`unknown` is a safe “I do not know yet” type. Before use, you **narrow** with `typeof`, `instanceof`, or custom checks. This project’s API layer often validates **unknown** JSON from `fetch` before using it as typed data.

## `enum`

Sometimes used, but this project more often uses **string literal unions** for fixed sets of values, for example:

`type Status = "draft" | "published";`

## Generics (just the idea)

A **generic** is a “type parameter” so one definition works for many concrete types, for example `Promise<T>`: a promise that eventually yields type `T`. You will see generics in library types; you rarely need to write complex ones in app code to start.

## `import type`

You can import only types, erased at compile time:

`import type { ProjectEpicItem } from "../api/fetchProjectEpics";`

This keeps the intent clear: used only for typing, not a runtime value.

## Where to look in this project

- `src/api/*.ts` — Types for API request/response shapes and normalized rows.
- `src/schemas/*.ts` — Types inferred from Zod (see `ZOD.md`).
- Component **props** — Often an inline type or small `type Props = { ... }` above the component.

If the editor shows a red squiggle, read the error: it is usually a mismatch between what you have and what the type expects.
