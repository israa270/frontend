# Taskly Frontend Architecture

This document explains how this frontend is structured and how data flows through it.

## 1) Tech Stack

Each line below is explained in a **dedicated, detailed** doc file (in the same `docs/` folder). Start here for the one-line summary, open the `STACK_*.md` file when you want depth (config, how it appears in the repo, and links to the next read).

| Technology | Doc |
|------------|-----|
| React + TypeScript | `STACK_REACT_AND_TYPESCRIPT.md` |
| Vite | `STACK_VITE.md` |
| React Router (routing) | `STACK_REACT_ROUTER.md` |
| Redux Toolkit (small global state, currently user profile) | `STACK_REDUX_TOOLKIT.md` |
| React Hook Form + Zod (forms + validation) | `STACK_REACT_HOOK_FORM_AND_ZOD.md` |
| Tailwind-style utility classes in `index.css` | `STACK_TAILWIND_INDEX_CSS.md` |
| Supabase REST API (custom `fetch` wrappers in `src/api`) | `STACK_SUPABASE_REST.md` |

## 2) High-Level Folder Map

- `src/main.tsx`: app bootstrap (providers + router)
- `src/App.tsx`: all routes
- `src/components/`: reusable UI and layout pieces
- `src/pages/`: page-level components (route targets)
- `src/api/`: one file per backend operation
- `src/schemas/`: Zod validation schemas for forms
- `src/context/`: auth session context provider
- `src/hooks/`: custom hooks (`useAuthSession`)
- `src/store/`: Redux store + user slice
- `src/lib/`: utilities (env, JWT helpers, date formatting, logout helper, etc.)

## 3) App Bootstrap

In `src/main.tsx`, the app is wrapped by:

1. Redux `<Provider>`
2. `<BrowserRouter>`
3. `<AuthSessionProvider>`

Then `App` is rendered.  
This means all pages can access routing, auth session, and Redux.

## 4) Routing Strategy

Routes are defined in `src/App.tsx`.

- Public routes: `/`, `/login`, `/signup`, etc.
- Protected routes are wrapped by:
  - `RequireAuth` -> checks session
  - `AppShell` -> shared layout (sidebar + navbar + content outlet)

Nested project routes follow this pattern:

- `/project` -> list projects
- `/project/:projectId/epics`
- `/project/:projectId/epics/new`
- `/project/:projectId/epics/:epicId/edit`
- `/project/:projectId/members`
- `/project/:projectId/edit`

## 5) Data Layer Pattern

Every endpoint is wrapped in a dedicated API function in `src/api`.

Example pattern:

1. Build URL
2. Set headers (`Content-Type`, auth headers, optional `Prefer`)
3. Perform `fetch`
4. Handle auth errors (`401`) with `HttpError`
5. Parse and normalize response data

Why normalize?  
UI components then rely on stable frontend types regardless of backend field differences.

## 6) Auth Model

Auth is managed by `AuthSessionProvider`:

- Reads access/refresh tokens from cookies
- Auto-refreshes expired tokens
- Exposes `getAccessToken()` for API calls
- Exposes `signOut()` and hydration state

Pages do not manually parse cookies; they call `useAuthSession()`.

## 7) State Management Rules

Use local component state for page-level UI:

- loading, error, modal open/close, page number, search input, etc.

Use Redux only for truly app-wide state:

- currently user profile data used in navbar/sidebar contexts

## 8) Form Pattern (used in Add/Edit pages)

Form pages use:

- `react-hook-form` for form state and submission
- `zodResolver(schema)` for validation
- `useWatch` for live counters or reactive UI (example: description chars)

Submission flow:

1. Validate inputs
2. Get token via `getAccessToken()`
3. Call API function
4. Show success or error UI

## 9) Pagination Pattern (Projects/Epics)

Current pagination implementation:

- Request with `limit` and `offset`
- Include `Prefer: count=exact`
- Read `Content-Range` header (e.g. `0-9/50`)
  - `totalCount = 50`
  - current range = `0..9`
- Desktop: previous/next/page buttons
- Mobile: infinite scroll (load next page near bottom)

## 9.1) URL query sync and epic deep link (epics list)

`ProjectEpicsPage` uses `useSearchParams` so list behavior and the epic modal play nicely with the address bar and browser history.

- **List filters:** `q` (search), `status` (`todo` | `done` or omitted for all), `page` (desktop only; page 1 omits the param), `deadline` (`asc` = soonest first, `desc` = latest first, omitted = default API order for that page). Updating these merges into the current query with `setSearchParams(prev => next)` so other keys are not dropped. Deadline sort reorders **only the epics on the current page** (client-side); changing pages still uses server pagination as before.
- **Modal:** `epic=<row id>` opens the same epic details modal; closing removes `epic`. Switching `projectId` clears `epic` so a stale id is not kept when navigating to another project.
- **Modal + desktop page:** using the page-number controls while an epic is open drops `epic` so the modal does not stay open across paginator-driven page changes.
- **Mobile:** infinite scroll does not use `page` in the URL (internal `currentPage` only).

## 10) UI State Conventions

Each data page should implement:

- Loading state (skeleton/shimmer)
- Error state (message + retry)
- Empty state (clear copy + CTA)
- Success state (content view)

This keeps UX predictable across the app.

## 11) How to Add a New Feature

Use this order:

1. Add or update API function in `src/api`
2. Add validation schema in `src/schemas` (if form)
3. Build page in `src/pages/...`
4. Add route in `src/App.tsx`
5. Connect sidebar/navigation if needed
6. Add loading/error/empty states
7. Run lint + build

## 12) Common Pitfalls

- Forgetting auth headers on REST calls
- Forgetting `Prefer: count=exact` for paginated endpoints
- Not resetting page when route param changes (`projectId`)
- Not handling 401 uniformly
- Mixing API shape directly in UI without normalization

