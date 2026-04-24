# Frontend Docs Index

This folder contains the practical documentation for understanding and building features in this project.

## Simple guides (basics, one topic per file)

Read these in order if you are new to the stack:

| File | Topic |
|------|--------|
| `REACT.md` | What React is, **pnpm commands** for this app, hooks, and where files live |
| `REACT_STATE_EFFECTS_CONCEPTS.md` | **State, effects, hooks** explained for HTML/JS devs + **small copy-paste examples** (counter, `document.title`, fetch list) |
| `JAVASCRIPT.md` | Language features used every day (modules, `async`, arrays, errors) |
| `TYPESCRIPT.md` | Types, interfaces, unions, and how they help in the editor |
| `ZOD.md` | Runtime form validation with Zod + react-hook-form |
| `TAILWIND_CSS.md` | Utility CSS, this app’s `index.css` **tokens** (`@theme`), responsive classes |
| `REDUX.md` | Redux Toolkit in *this* repo: user slice, store, `useAppSelector` (global user state) |
| `REACT_QUERY.md` | TanStack Query overview — **not installed** here; when to add it vs manual `useEffect` + `fetch` |
| `FRONTEND_EXTRAS.md` | Context, testing, a11y, GraphQL, and other topics (used or “good to know”) |
| `OTHER_TOOLS.md` | Vite, pnpm, React Router, ESLint, API layer, React Hook Form — **short** overview |

## Start Here (this project)

1. `PROJECT_ARCHITECTURE.md`  
   Understand folder structure, routing, data flow, auth flow, API layer, and feature implementation sequence.

2. `LEARN_REACT_WITH_THIS_PROJECT.md`  
   Learn the React concepts used in this codebase (state, effects, routing, forms, pagination, modals) with a practical approach.

3. **Stack deep dives (same list as `PROJECT_ARCHITECTURE.md` §1 — one file per line)**  
   `STACK_REACT_AND_TYPESCRIPT.md` · `STACK_VITE.md` · `STACK_REACT_ROUTER.md` · `STACK_REDUX_TOOLKIT.md` · `STACK_REACT_HOOK_FORM_AND_ZOD.md` · `STACK_TAILWIND_INDEX_CSS.md` · `STACK_SUPABASE_REST.md`

4. **`LEARNING_ROADMAP_REACT_NEXT.md`**  
   A **learning roadmap** from web foundations → React → **Next.js** (App Router), with a short description of each topic and how this workshop project fits in.

## Live Walkthrough Summary (Project Epics Page)

Use `ProjectEpicsPage` as your reference page for architecture and React patterns:

- Inputs: `projectId` from the route, plus **URL query** (`q`, `status`, `page` on desktop) and `epic` for the details modal (shareable deep link)
- State: loading/error/data; modal body loaded by ID from the query string
- Effects: fetch list, refetch on param changes, infinite scroll (mobile), merge-safe URL updates, modal details fetch when `epic` is set
- Rendering: loading -> error -> empty -> no filter matches -> content
- Data layer: endpoint wrappers in `src/api` with normalization

## Build-One-Page Checklist

When creating any new page, follow this order:

1. Add route in `src/App.tsx`
2. Add API wrapper in `src/api`
3. Add schema in `src/schemas` (if form)
4. Build page in `src/pages/...`
5. Add loading/error/empty/content states
6. Handle auth (`401`) consistently
7. Add interactions (pagination/search/modal/actions)
8. Run lint/build and test manually

## Guided Practice

Status filter chips on the epics list are already implemented. Suggested next practice tasks (pick one):

- **Edit epic** — implemented at `/project/:projectId/epics/:epicId/edit` (`PATCH` on `epics`, same form patterns as create). Stretch: add **server-ordered** deadline sort (PostgREST `order=`) so pagination and sort stay consistent end-to-end.

Implemented detail: when the user **changes page** with the **desktop** paginator, **`epic` is removed** (modal closes) so the open epic does not refer to a different page of the server-side list. Back/forward can still restore a URL that includes both `page` and `epic`.

**Deadline sort** (`deadline=asc` / `deadline=desc` in the query string) reorders epics on the **current page** only; try it next to the status chips, then read `5.1` in `LEARN_REACT_WITH_THIS_PROJECT.md` for how that differs from server-side ordering.

Concepts you will practice:

- `useMemo` / derived lists, or URL sync with `useSearchParams`
- form + validation patterns from `AddEpic` / project edit pages
- intentional trade-offs: bookmarkable state vs. simpler UI state
