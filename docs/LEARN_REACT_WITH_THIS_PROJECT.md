# Learn React Through This Project

If you are new to React, use this file as a practical study guide based on code you already have.

## 1) Core React Concepts Used Here

## Components

- A component is a function that returns UI.
- Example: page components in `src/pages/...` and shared components in `src/components/...`.

## Props

- Props are inputs passed from parent to child.
- Example: layout and modal components receive callbacks and data through props.

## State (`useState`)

- State stores values that change over time (loading, error, page number, modal open).
- When state changes, React re-renders the component.

## Effects (`useEffect`)

- Effects run side effects like data fetching or event listeners.
- Example:
  - Fetch data on first render
  - Refetch when `projectId` changes
  - Add/remove scroll listeners for infinite scroll

## Memoization (`useMemo`, `useCallback`)

- `useMemo`: cache computed values (like filtered lists, page arrays).
- `useCallback`: stable function references (important for dependencies and child props).

## Controlled Inputs

- Input value is driven by React state/form library.
- Search and form fields are controlled values.

## Conditional Rendering

- Show different UI based on state:
  - loading
  - error
  - empty
  - success

## 2) Data Fetching Concepts

## Separation of Concerns

- API logic is in `src/api/*.ts`
- UI logic is in pages/components

This keeps pages readable and makes testing/refactoring easier.

## Normalization

- API responses are normalized before they reach UI.
- UI receives predictable types and fallback values.

## 401 Handling

- If unauthorized, pages call `signOut()` and redirect to `/login`.

## 3) Routing Concepts

- Router chooses which page to render based on URL.
- Dynamic route segments (params):
  - `/project/:projectId/epics`
- `useParams()` reads `projectId`.
- `Navigate` handles redirects.
- `useSearchParams` reads and updates the query string (`?q=...&status=...`) for shareable list filters and for `?epic=...` to deep-link the epic details modal.

## 4) Forms + Validation Concepts

- `react-hook-form` manages inputs and submit lifecycle.
- Zod schema defines rules:
  - required fields
  - min/max length
  - custom date rules
- Validation errors are shown near fields.

## 5) Pagination Concepts Used

- `limit`: records per page
- `offset`: `(currentPage - 1) * limit`
- `Content-Range`: source of total count
- `totalPages = ceil(totalCount / limit)`
- Desktop pagination controls + mobile infinite scroll

## 5.1) Sorting vs pagination (epics)

- **Server:** each request returns one **page** of epics in the API’s order.
- **Client:** you can **reorder the rows on that page only** (e.g. by deadline) using `useMemo` and `.sort` on the filtered list.
- If you need **global** sort by deadline across all projects, the backend would need an `order=` query (or a view) — the UI pattern here is a learning step, not a full re-sort of the whole dataset.

## 6) Modal Concepts Used

- The epics list keeps **which epic is open** in the URL as `?epic=<id>` so the modal can be **shared and bookmarked**; the list filter params (`q`, `status`, `page`) are updated in a way that **preserves** `epic` when filters change.
- On open (or on load with `epic` in the URL):
  - show loading in the modal
  - fetch details for that id
  - render modal content
- Close on backdrop or close button by removing `epic` from the query string.
- Keep modal-specific loading/error state independent from page list state.

## 7) How to Build One New Page (Step-by-Step)

Use this template every time:

1. Define route in `src/App.tsx`
2. Create API function in `src/api`
3. Create page component in `src/pages/...`
4. Add local state:
   - `loading`
   - `error`
   - `data`
5. Fetch in `useEffect`
6. Render states:
   - loading skeleton
   - error + retry
   - empty state
   - real content
7. Add actions (create/edit/delete/modal) if needed
8. Add form schema for validation if there is input
9. Run build/lint and verify behavior

## 8) Your Practice Plan (Recommended)

Try these in order (steps 1–2 are already implemented in the repo; use them as reference and move on):

1. Add a new "Epic Details" read-only page route (not modal) — *optional; the modal + `?epic=` deep link covers a similar use case*
2. Status filter on epics list — **done** (`All` / `To Do` / `Done`)
3. "Sort by deadline" on the epics list — **done** (URL `deadline=asc` | `deadline=desc`, client-side order on the current page)
4. Add "edit epic" form with existing patterns — **done** (`EditEpicPage`, `updateEpic`, `createEditEpicFormSchema` with a past-deadline carve-out)

For each task, follow the 9-step template above.

## 9) How to Read This Codebase Efficiently

When learning a feature:

1. Start from route in `App.tsx`
2. Open the page component
3. Find API functions imported by that page
4. Inspect schema (if form page)
5. Trace user actions (button click -> callback -> API -> state update)

Do this repeatedly and React architecture will become natural quickly.

