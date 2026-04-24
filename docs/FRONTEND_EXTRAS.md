# More front-end topics (used here or worth learning)

Short overview of other tools and ideas that show up in **this repo** or in **typical** React jobs. For stack basics, see `REACT.md`, `OTHER_TOOLS.md`, and the new guides **Redux** / **React Query** / **Tailwind**.

## Used in this project

| Topic | Where / what |
|--------|----------------|
| **React Context** | `src/context/AuthSessionProvider.tsx` — auth session, `getAccessToken`, `signOut`. Not the same as Redux: **Context** = pass values without prop-drilling; this app uses it for **session**, Redux for **user profile** in the store. |
| **react-hook-form** | Add / edit project and epic pages — register fields, handle submit, show errors. See also **`ZOD.md`**. |
| **Zod** | `src/schemas/` — see **`ZOD.md`**. |
| **Fetch + REST** | `src/api/*.ts` — `fetch`, headers, JSON, error types. The backend is PostgREST-style, not GraphQL. |
| **ESLint + TypeScript-ESLint** | `eslint.config.js` and `typescript-eslint` — type-aware lint rules. |
| **Vite** | Dev server and build. See **`OTHER_TOOLS.md`**. |
| **React Router** | URLs, `Link`, `useParams`, `useSearchParams`. See **`OTHER_TOOLS.md`**. |
| **Cookies / auth** | Session tokens — see `AuthSessionProvider`, `api` headers. |

## Common in the industry; not in this `package.json`

| Topic | Why learn it |
|--------|----------------|
| **TanStack React Query** | Server data caching, less `useEffect` fetch code. See **`REACT_QUERY.md`**. |
| **GraphQL (Apollo, urql, …)** | One API style for many products; this project uses **REST** only. |
| **CSS Modules / styled-components** | Alternative to Tailwind for component-scoped styles. |
| **Testing (Vitest, React Testing Library, Playwright)** | Vitest pairs well with Vite; RTL tests components; Playwright e2e tests the real browser. This repo has no test script yet — a good add-on exercise. |
| **Storybook** | Build and document UI components in isolation. |
| **i18n (react-i18next, …)** | Multiple languages, strings outside JSX. |
| **Accessibility (a11y)** | Semantic HTML, `aria-*`, focus, contrast — the React docs and MDN a11y guides are a start. |
| **Web performance** | Code splitting (`React.lazy`), image lazy loading, bundle analysis — Vite + React support these patterns. |
| **PWA / service workers** | Offline and install; optional and not in this app. |

## Suggested order to explore “extras”

1. Finish **`REACT.md`** + one real page in the codebase (e.g. epics).  
2. Read **`TAILWIND_CSS.md`** while changing a `className` and watching the result.  
3. Skim **`REDUX.md`** and open `userSlice.ts`.  
4. When you are tired of copy-paste fetch in `useEffect`, read **`REACT_QUERY.md`** and try it on a **new** feature branch.

## Official resources (one link each)

- React: `https://react.dev`  
- TypeScript: `https://www.typescriptlang.org/docs/`  
- MDN (HTML/CSS/JS): `https://developer.mozilla.org`  
- React Router: `https://reactrouter.com`  
- TanStack Query: `https://tanstack.com/query`  
- Tailwind: `https://tailwindcss.com/docs`  
- Zod: `https://zod.dev`

Your **project-specific** map stays **`PROJECT_ARCHITECTURE.md`**.
