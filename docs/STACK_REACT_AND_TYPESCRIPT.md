# React + TypeScript (stack deep dive)

This document explains how **React** and **TypeScript** work **together** in the Taskly frontend, what each one brings, and how they show up in real files.

## What each part does

| Layer | Role |
|--------|------|
| **React** | A library to build the UI with **components** and **state**. Renders a tree of elements; when state changes, React updates the **minimum** parts of the DOM. |
| **TypeScript (TS)** | A **static type system** on top of JavaScript. It does **not** run in the browser: `tsc` and Vite **erase** types and ship plain JavaScript. |
| **Together** | You write `*.tsx` files: **JSX** (HTML-like UI) + **type annotations** for props, state, API shapes, and event handlers. |

## Why we use both

- **React** answers: *how is the screen structured and how does it react to data?*  
- **TypeScript** answers: *is this `projectId` a string? does this object have a `name`? will this callback break if I pass the wrong thing?*  

Catching mistakes **while you type** in the editor is cheaper than at runtime for many bugs (wrong field names, `undefined` access, bad function arguments).

## How TypeScript is configured here

- `tsconfig.json` is a small **solution-style** file; the app code uses **`tsconfig.app.json`**.  
- **`"jsx": "react-jsx"`** — modern JSX transform: you **do not** need `import React` in every file for JSX.  
- **`"moduleResolution": "bundler"`** — matches how **Vite** resolves imports.  
- **`"noEmit": true`** — the **app** does not output `.js` on disk; **Vite** bundles TypeScript in memory / as part of the build. `pnpm run build` runs `tsc -b` for **type-checking** and then Vite for the browser bundle.  
- **`"strict"`**-related checks are not all listed in the snippet, but the project enforces `noUnusedLocals` / `noUnusedParameters` in `tsconfig.app.json` so dead code and unused args are easier to catch.

## Where you see it in the repo

- **`.tsx` files** — Components: `function Page() { ... return <div>...</div>; }`  
- **`interface` / `type`** — Props, API models (`src/api/`), and objects coming from the server after **normalization**.  
- **`.ts` files** — Pure logic with no JSX: `src/api/`, `src/lib/`, `src/schemas/`, `src/store/`.  
- **Import types** — `import type { X }` when you only need a type at compile time, not a runtime value.

## Typical flow in one screen

1. A **page component** reads route params and maybe session (`useParams`, `useAuthSession`).  
2. **State** holds loading, error, and data from the server.  
3. An **`useEffect`** or event handler calls a **typed** function in `src/api/` (passes a string `projectId`, gets back a `ProjectEpicItem[]` or similar).  
4. The component **returns JSX** that branches: skeleton → error → empty → list.  
5. TypeScript makes sure you do not treat **optional** fields (for example, `deadline: string | null`) as if they were always a string, once you get used to narrowing (`if (deadline) { ... }`).

## Mindset: types vs validation

- **TypeScript** — Rules for **you and the editor**; gone after compile.  
- **Zod** (see `ZOD.md` and `STACK_REACT_HOOK_FORM_AND_ZOD.md`) — Rules that run at **runtime** on form values and can show user-facing errors.  
They are complementary, not the same.

## If you are new to one of the two

- New to **React** only: start with `REACT.md` and a single page in `src/pages/`.  
- New to **TypeScript** only: read `TYPESCRIPT.md`, then read `src/api/fetchProjectById.ts` (small file, clear types).  
- This file is the **bridge** from “what the stack list says” to “how it feels in the codebase.”

## Related

- `JAVASCRIPT.md` — language features the TS compiles to.  
- `PROJECT_ARCHITECTURE.md` — where React components live in the folder map.
