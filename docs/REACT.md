# React — simple guide

This file explains **what React is** in plain language, the **commands** you run in the terminal for *this* project, and a few **words** you will see in code every day.

## What is React?

React is a **JavaScript library** for building user interfaces. You describe the UI with **components** (functions that return something that looks like HTML, called **JSX**). When **state** (data) changes, React **re-renders** the screen so it stays in sync with that data.

You do not manually “erase” and “redraw” the page; you update state, and React updates the parts of the page that need to change.

## Commands in this project (terminal)

Open a terminal, `cd` into the `frontend` folder, then:

| Command | What it does |
|--------|----------------|
| `pnpm install` | Downloads dependencies listed in `package.json` (only needed when dependencies change or on a fresh clone). |
| `pnpm run dev` | Starts the **development server** (Vite). The app is usually at `http://localhost:5173` or a URL printed in the terminal. Use this while coding. |
| `pnpm run build` | **TypeScript check** + **production build** (output in `dist/`). Run before you finish a task or open a pull request. |
| `pnpm run lint` | Runs ESLint to catch common mistakes in code style and React usage. |
| `pnpm run format` | Formats many files with Prettier (rewrites file layout to a standard style). |
| `pnpm run preview` | Serves the **production** build locally so you can test `build` without `dev`. |

This repo uses **pnpm** (not `npm` or `yarn`) as written in `package.json`.

## Core ideas (no jargon overload)

- **Component** — A function like `function MyPage() { return <div>Hello</div>; }`. One file can export one main component, plus small inner components.
- **JSX** — Syntax that looks like HTML inside JavaScript. It compiles to normal JavaScript that creates UI elements.
- **Props** — Inputs you pass to a component: `<Greeting name="Alex" />` so `Greeting` can read `name`.
- **State** — Values that can change over time. When state changes, React re-renders. In this project you often use `useState` for local state.
- **Effect** — Something that runs in response to the component being on the screen or when specific values change (for example, fetch data, subscribe to an event, talk to a browser API). In this project you use `useEffect` for that.
- **Hook** — Functions whose names start with `use` (`useState`, `useEffect`, `useMemo`, `useParams`, etc.). You call them at the **top level** of a component, not inside conditions or loops, so React can keep the rules straight.

## Hooks you see a lot here

- **`useState`** — Keeps a value and gives you a setter. Example: loading flag, form field, current page.
- **`useEffect`** — Runs side effects (fetch, listeners, sync with the URL) and can **clean up** on unmount or before the next run.
- **`useMemo`** — Caches a **computed** value (for example, a filtered list) so you do not redo heavy work on every render unless inputs change.
- **`useCallback`** — Caches a **function** so its reference is stable, useful for dependency lists and passing callbacks to child components.
- **`useParams` / `useNavigate` / `useSearchParams`** (from `react-router-dom`) — Read route segments (`/project/:projectId/...`) and the query string (`?q=...`), and navigate programmatically.

## Where to look in this repo

- `src/main.tsx` — App entry, router shell.
- `src/App.tsx` — Route table (which URL shows which page).
- `src/pages/` — Page components.
- `src/components/` — Shared layout and UI.

For a **guided walk** through one screen, use `LEARN_REACT_WITH_THIS_PROJECT.md` after you skim this file.

If you know **HTML + JavaScript** but **state / effects / hooks** still feel unclear, read **`REACT_STATE_EFFECTS_CONCEPTS.md`** next — it has short explanations and **small copy-paste examples** (counter, tab title effect, fetch list).
