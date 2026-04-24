# Learning roadmap: front-end with React and Next.js

A practical order to study **HTML/CSS/JS/TS** first, then **React**, then **Next.js** on top. Each topic has a **brief** “why it matters” so you know what you are building toward.

---

## Phase 1 — Web foundations (before or alongside React)

| Topic | What it is (brief) |
|--------|---------------------|
| **HTML** | Structure of a page: headings, links, forms, buttons. Semantics (when to use `nav`, `main`, `button` vs `div`) help accessibility and SEO. |
| **CSS** | Layout, spacing, color, typography. Learn **box model**, **flexbox**, **grid**; responsive design with **media queries**. This transfers to any framework. |
| **JavaScript (ES6+)** | The language: variables, functions, `async`/`await`, `fetch`, arrays (`map`/`filter`), modules (`import`/`export`). **React is JavaScript** with extra rules (JSX). |
| **TypeScript (optional but recommended)** | Adds **types** to JavaScript. Catches many bugs in the editor, improves autocomplete, scales better in teams. Learn basic `interface`, unions, and typing function arguments first. |
| **Browser devtools** | **Elements** (DOM/CSS), **Network** (requests), **Console** (errors, `console.log`). You will live here when debugging. |
| **Git + GitHub (basics)** | `commit`, `branch`, `push`, `pull request`. Needed for any real project and first job. |

**Checkpoint:** you can build a small static page with a form, style it, and fetch public JSON from an API in plain JS.

---

## Phase 2 — React (client UI library)

| Topic | What it is (brief) |
|--------|---------------------|
| **Components & JSX** | Reusable **functions** (or classes) that return **UI**. JSX looks like HTML but is really JavaScript. |
| **Props** | **Inputs** from parent to child. Read-only in the child; keeps data flow predictable. |
| **State (`useState`)** | **Mutable** data owned by a component. When it changes, React re-renders. |
| **Effects (`useEffect`)** | Run **side effects** after render: talk to the network, subscribe to events, sync with the browser. **Not** the default place for “on click” — use event handlers for that. |
| **Lists & keys** | Render arrays with `map`. **`key`** helps React match items across updates (stability, not index when possible if order changes). |
| **Forms in React** | **Controlled** inputs: value + `onChange` in state, or a library like **React Hook Form** for larger forms. |
| **Lifting state up** | When two children need the same data, **move state to the nearest common parent** and pass props down. |
| **React Router (SPA)** | In a **single-page app**, the **URL** still changes; **client-side routing** picks which component tree to show (`Link`, `useParams`, etc.). *This workshop repo uses Vite + React Router, not Next yet.* |
| **Styling in React** | **Tailwind** (utility classes), **CSS Modules**, or **styled-components** — pick one style; Tailwind is very common. |
| **Data fetching (client)** | `fetch` in `useEffect` or a library like **TanStack Query (React Query)** for caching, loading/error, refetch. |
| **Global state (when needed)** | **Context** for medium scope; **Redux** / **Zustand** for app-wide, predictable state. Don’t add global state until you feel the pain. |

**Checkpoint:** you can build a multi-screen SPA with a list, detail view, and form, with client routing and at least one real API.

---

## Phase 3 — Next.js (React framework for full-stack web apps)

Next.js is **React + conventions** for **routing, rendering, and deployment**. The **App Router** (`app/` directory) is the current default to learn.

| Topic | What it is (brief) |
|--------|---------------------|
| **File-based routing** | Folders and `page.tsx` under `app/` **become URLs**. `layout.tsx` wraps nested segments (shared header/shell). |
| **Server vs client components** | **Server Components** (default in `app/`) run on the **server** — good for data near the database, no bundle cost for that logic. **Client Components** (`"use client"`) for hooks, `useState`, and browser-only APIs. |
| **Data fetching in App Router** | **Server** can `fetch` in async components, **cache** and **revalidate** (ISR-style). **Client** fetches as in plain React. Learn **when to fetch on server** vs **client**. |
| **Metadata & SEO** | `metadata` export for titles and descriptions. Important for public pages. |
| **API Routes / Route Handlers** | `app/api/.../route.ts` to write **HTTP handlers** in the same project (BFF, webhooks, form actions’ backend). |
| **Loading & error UI** | `loading.tsx` and `error.tsx` in the `app` tree for **suspense-like** and **error boundaries** per route. |
| **Middleware** | `middleware.ts` for auth redirects, A/B, geo — runs at the **edge** before your page. |
| **Deployment (Vercel or similar)** | Next.js is built to deploy as **serverless** or **edge** functions; you learn “build output” and **environment variables** for prod. |

**Checkpoint:** a small app with a public home page, a protected dashboard, data loaded on the server, and one route handler. Deploy it once (even a free tier).

---

## Phase 4 — Professional habits (keep growing)

| Topic | What it is (brief) |
|--------|---------------------|
| **Accessibility (a11y)** | Keyboard navigation, `aria-` when needed, focus, contrast. Makes apps usable and is often part of code review. |
| **Testing** | **Vitest + React Testing Library** (unit/integration of components), **Playwright** (E2E). Start with one critical user flow. |
| **Security basics** | **XSS** (never trust `dangerouslySetInnerHTML` with user HTML), **CSRF** for cookies, don’t put secrets in client env. |
| **Performance** | **Code splitting** (`dynamic` import in Next), image optimization (`next/image`), **Core Web Vitals** awareness. |
| **Design systems** | Reusable **components**, tokens, Storybook (optional) — how products stay visually consistent. |

---

## Suggested order (summary)

1. **Web:** HTML + CSS + JS → add **TypeScript** → **DevTools** + **Git**  
2. **React:** components → state/effects → forms → **router (SPA)** → **fetching** / optional **React Query**  
3. **Next.js:** `app` router → **server vs client** → **fetching** on server + **caching** → **route handlers** → **metadata** → **deploy**  
4. **Level up:** a11y, tests, performance, security  

---

## How this repo fits in

- This **workshop** is **Vite + React + React Router + TypeScript** — it covers **Phase 2** in depth (without Next.js).  
- When you are solid on **components, state, effects, routing, forms, and API calls**, add **Next.js** as a **new** project: same React skills, new **routing and server** rules.

## Official starting points (when you are ready for Next)

- **React:** `https://react.dev` (Learn)  
- **Next.js:** `https://nextjs.org/docs` (App Router)  

This roadmap is a **path**, not a checklist to finish in a week. Deepen each phase with small projects (todo app, blog, dashboard) before piling on tools.
