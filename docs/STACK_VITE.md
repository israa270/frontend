# Vite (stack deep dive)

**Vite** is the **build tool and dev server** for this project. In development you run `pnpm run dev` (Vite’s CLI); for production, `pnpm run build` first runs the TypeScript compiler, then `vite build` to emit optimized static assets in `dist/`.

## What Vite does in one picture

- **Dev:** Starts a local server, serves your source with **extremely fast** updates when you save (Hot Module Replacement, **HMR**), so the UI can refresh without a full page reload in many cases.  
- **Build:** **Rolls up** (bundles) your code and dependencies into a small number of **chunks** the browser can load, plus hashed filenames for **caching** in production.

## This project’s config (`vite.config.ts`)

- **`@vitejs/plugin-react`** — Enables React support (JSX, Fast Refresh for React).  
- **`@tailwindcss/vite`** — Integrates **Tailwind CSS v4** so utility classes in `index.css` are part of the pipeline.  
- **Environment-based dev proxy** — If `VITE_SUPABASE_URL` is set (loaded from `.env` via `loadEnv`), the dev server proxies **`/supabase` →** your real Supabase host. That way the **browser** calls **same-origin** `/supabase/rest/v1/...`, and Vite forwards to the real API. This **reduces CORS pain** in local dev and matches how `getSupabaseUrl()` returns `"/supabase"` in `import.meta.env.DEV` (see `src/lib/env.ts`).

In production, `getSupabaseUrl()` returns the full HTTPS project URL (no path prefix) because there is no Vite dev server.

## `import.meta.env` (Vite’s env model)

- Only variables **prefixed with `VITE_`** are exposed to **client** code.  
- Example: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` in `.env` (use `.env.example` as a template).  
- **`import.meta.env.DEV` / `import.meta.env.PROD`** are booleans Vite sets for you.

Do **not** put secrets (private keys, service roles) in `VITE_*` variables: they are **embedded in the client bundle** and visible to anyone who uses the app.

## Commands (see also `REACT.md`)

| Command | What happens |
|---------|----------------|
| `pnpm run dev` | Vite **dev** server (default port often **5173**; check the terminal). |
| `pnpm run build` | `tsc -b` (typecheck) + **`vite build`** (output in `dist/`). |
| `pnpm run preview` | Serves **`dist/`** locally so you can test the **production** build. |

## Why not Create React App (CRA) or a custom Webpack only?

- Vite uses **esbuild** (and Rollup for production) for **fast** cold starts and transforms.  
- **Less** boilerplate in config for a **single-page** React app.  
- First-class **TypeScript** and **ESM** story.

## Where to look in the repo

- `vite.config.ts` — plugins, `server.proxy`, env loading.  
- `index.html` — entry point in the project root; Vite uses it to inject the **script** to `src/main.tsx`.  
- `src/main.tsx` — React root mount.

## Common issues (short)

- **“Failed to fetch” to Supabase in dev** — Check `.env`, proxy, and that `getSupabaseUrl()` matches the environment (dev = `/supabase` prefix with proxy).  
- **Env variable undefined** — Name must be `VITE_...` and the dev server **restarted** after changes.

## Related

- `STACK_SUPABASE_REST.md` — what those proxied calls are for.  
- `TAILWIND_CSS.md` / `STACK_TAILWIND_INDEX_CSS.md` — how Tailwind plugs into Vite here.
