# TanStack Query (React Query) — simple guide

**TanStack Query** (package name is often still `@tanstack/react-query` from when it was “React Query”) is a **server state** library. It **fetches, caches, refetches, and deduplicates** data from APIs so you do not write the same `useEffect` + `useState` + `fetch` boilerplate in every page.

## Is it in *this* project?

**No.** This workshop app uses **`fetch` inside `useEffect` (or callbacks)** and **local state** for loading, error, and data. That is a good way to **learn the basics** and see the full data flow by hand.

You can add TanStack Query later with: `pnpm add @tanstack/react-query`, wrap the app in `QueryClientProvider`, and move API calls to `useQuery` / `useMutation`.

## What problem does it solve?

| Without (manual pattern) | With TanStack Query |
|--------------------------|----------------------|
| You remember loading / error / data state yourself | Per-query `isPending`, `isError`, `data`, `error` |
| Refetch on window focus, retry, or cache key — you add all of that | **Built-in** options: `staleTime`, `refetchOnWindowFocus`, `retry` |
| Same request from two components = two fetches (unless you lift state) | **Single cache** keyed by query key — shared automatically |
| Invalidating data after a mutation is manual | **`queryClient.invalidateQueries({ queryKey: [...] })** after `useMutation` success |

## Core ideas (when you use it)

- **`useQuery({ queryKey, queryFn })`** — `queryKey` is a **array** (e.g. `['epics', projectId, page]`) that identifies the cache; `queryFn` returns a Promise of data.
- **`useMutation`** — For `POST` / `PATCH` / `DELETE`. On success, invalidate related queries so lists refetch.
- **Stale time** — How long data is “fresh” before a background refetch is allowed.

## How it relates to this codebase

- Today: **`src/api/*.ts`** + **`useEffect`** in pages. Same REST endpoints; only the *caller* would change.  
- **Zod** can still **parse** the JSON before it enters the cache; React Query does not replace validation.  
- **Redux** in this app is for **user profile**; TanStack Query is for **server data** (lists, details). They complement each other and are often used together in larger apps.

## When to learn it

After you are comfortable with **async**, **keys** (to know when to refetch), and this project’s **API wrappers**, add TanStack Query to a *small* feature (e.g. one list page) and compare the amount of code you remove.

## Official docs

Search for **“TanStack Query”** and read **Overview** and **Query Basics**; the project does not need you to follow them to understand the current code.
