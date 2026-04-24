# React Router (stack deep dive)

**React Router** (package `react-router-dom` in v6/v7) connects **URLs** in the browser to **which React tree** you render. Without it, you would have one HTML page and no way to have `/project/123/epics` as a first-class, shareable address for a “screen”.

## Core concepts

| Concept | Meaning |
|--------|--------|
| **Router** | A component (here: **`BrowserRouter`**) that listens to `history` and gives child routes a **routing context**. |
| **Routes / Route** | A **declarative** table: *when the path looks like this, render this `element`*. |
| **Nested routes** | Parents + children. This app nests **project** routes under `/project/:projectId`. |
| **URL params** | Path segments with names, e.g. `:projectId`, `:epicId`, read with **`useParams()`**. |
| **Query string** | After `?`, e.g. `?q=foo&epic=uuid`, read/updated with **`useSearchParams()`** on the epics list page. |
| **Navigation** | **`<Link to="...">`** (declarative) or **`useNavigate()`** (imperative). |
| **Redirects** | **`<Navigate to="..." replace />`** to send the user to another path (e.g. `/project` index → `epics`). |

## How this app wires it (high level)

- **`main.tsx`** wraps the app in **`<BrowserRouter>`** (see architecture doc). So every descendant can use route hooks.  
- **`App.tsx`** defines a **tree of `Route`s** under protected layout (`RequireAuth` + `AppShell`).  
- **Public** routes: `/`, `/login`, etc. **Protected** routes: `project`, `project/add`, `project/:projectId/...`.

## Notable path patterns in `App.tsx`

- **`/project`** — `ProjectsListPage` (index).  
- **`/project/:projectId`** — index redirects to **`/project/:projectId/epics`**.  
- **`/project/:projectId/epics`** — `ProjectEpicsPage`.  
- **`/project/:projectId/epics/new`** — add epic.  
- **`/project/:projectId/epics/:epicId/edit`** — edit epic (more specific than the bare `epics` list).  
- **`/project/:projectId/members`**, **`/project/:projectId/edit`**, etc.

Order matters: **static** path segments (like `new` or `edit` under a known pattern) are registered so they are not caught by a **broad** dynamic segment by mistake. If you add routes, follow the same “specific before generic” idea.

## Hooks you will use in pages

- **`useParams()`** — `{ projectId, epicId }` depending on the route. Always handle **optional** (TypeScript may say `string | undefined` if the param is missing on a parent route you did not expect).  
- **`useNavigate()`** — `navigate("/login", { replace: true })` after sign-out; `navigate(-1)` for back, etc.  
- **`useSearchParams()`** — Returns `[searchParams, setSearchParams]`. Merging: **functional updates** `setSearchParams((prev) => { const n = new URLSearchParams(prev); n.set("q", v); return n; })` so you do not drop `epic` or other keys when one filter changes.  
- **`Link`** — Prefer for **user-visible** navigation (accessible, works with “open in new tab”).

## Data loading: not loader-first here

- Some codebases use **data routers** and **route loaders** (fetch before paint). This project mostly **fetches in components** with `useEffect` + `useAuthSession().getAccessToken()`. The URL still drives *what* to fetch (`projectId`, `epic` query). That is a valid and teachable style; **TanStack Router** or **Remix** would be different patterns. See `REACT_QUERY.md` for another way to model server data.

## Related

- `PROJECT_ARCHITECTURE.md` — full route list and `AppShell`.  
- `STACK_REACT_AND_TYPESCRIPT.md` — `useParams` types.  
- `REACT.md` — hook rules at a glance.
