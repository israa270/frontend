# Other tools — simple guide (this stack)

This file briefly explains **the rest of the tool chain** you touch when working in `frontend/`. Each section is one technology.

## Vite

**Vite** is a **dev server and build tool**. In development it serves your app very fast and **hot-reloads** when you save files. For production, `vite build` bundles and optimizes assets.

- You rarely configure it day to day; `vite.config` is the place when you do.

## pnpm (package manager)

**pnpm** installs **dependencies** from the npm registry and stores them in a way that **saves disk space** across projects. You use it like npm: `pnpm install`, `pnpm run dev`, etc.

- The project pins a preferred pnpm version in `package.json` under `"packageManager"` in some repos; use that version or compatible when possible.

For **Tailwind** in depth, see `TAILWIND_CSS.md`. For **Redux** in this repo, see `REDUX.md`. For **TanStack React Query** (not in the project), see `REACT_QUERY.md`. For more topics, see `FRONTEND_EXTRAS.md`.

## React Router (react-router-dom)

**React Router** matches the **URL** to a **component** so `App.tsx` can say “this path renders this page,” including **dynamic** segments like `:projectId`.

- **`useParams()`** — Read `:projectId` and similar.  
- **`useNavigate()`** — Go to a route in code.  
- **`useSearchParams()`** — Read and update `?key=value` in the URL.  
- **`Link`** — Client-side navigation without a full page reload.  
- **`Navigate`** — Redirect, for example to send logged-out users to `/login`.

## Tailwind (utility classes)

**Tailwind** is used via `@tailwindcss/vite` and the `className` prop. Project tokens and the type scale are in `src/index.css` (`@theme`).

- Longer walkthrough: **`TAILWIND_CSS.md`**.

## ESLint + Prettier

- **ESLint** — Static **analysis** for code quality, React rules, and common mistakes. `pnpm run lint` runs it.  
- **Prettier** — **Format** (indent, quotes, line breaks). `pnpm run format` applies it.  
- Together they help the whole project look and behave the same.

## Supabase (REST from the browser)

This app talks to a **PostgREST**-style **REST** API (URLs under `getSupabaseUrl()`), not a custom Node server in this repo. Custom **`fetch` wrappers** in `src/api/` set headers, handle errors, and **normalize** JSON into TypeScript types.

- **401** — Usually “not signed in”; pages call `signOut()` and redirect to login, following the same pattern everywhere.

## Redux Toolkit (used lightly)

**Redux** holds **global** state (here: **user profile** in `src/store/`). **Most** page state uses `useState` or the URL.

- Details and file map: **`REDUX.md`**.

## React Hook Form

**React Hook Form** manages form state, focus, and submission with **less re-rendering** than storing every field in `useState` by hand, and it pairs with **Zod** via a resolver. See any “Add / Edit” page in this project for the pattern.

---

**Suggested order to read the docs in this folder:** `REACT.md` → `JAVASCRIPT.md` → `TYPESCRIPT.md` → `ZOD.md` → `TAILWIND_CSS.md` → `REDUX.md` → this file → `REACT_QUERY.md` (optional) → `FRONTEND_EXTRAS.md` → `PROJECT_ARCHITECTURE.md` → `LEARN_REACT_WITH_THIS_PROJECT.md`.
