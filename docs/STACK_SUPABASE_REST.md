# Supabase REST API (stack deep dive)

The frontend does not ship a custom Node backend in this repo. It talks to **Supabase** over **HTTP**: **PostgREST**-style endpoints under the project’s REST base URL, plus **GoTrue**-style auth where applicable. The **browser** only uses **safe** credentials: the **anon** key and the user’s **access token** after login.

## URL and environment

- **`.env`**: at minimum **`VITE_SUPABASE_URL`** and **`VITE_SUPABASE_ANON_KEY`**. Copy from `.env.example` and fill in your project (Supabase dashboard → **Settings → API**).  
- In **development**, `getSupabaseUrl()` in `src/lib/env.ts` returns **`/supabase`** and **Vite’s dev server proxies** to the real host (see `STACK_VITE.md`). In **production**, it is the full **https** project URL.  
- **Never** put **service role** or other **secret** keys in `VITE_*` variables: they are **public** in the client bundle.

## How requests are made

- Each operation has a small wrapper in **`src/api/*.ts`**: build URL, set headers, `fetch`, throw **`HttpError`** on failure, **normalize** JSON to TypeScript types.  
- **Headers** are centralized: **`supabaseAnonHeaders()`** and **`supabaseUserHeaders(accessToken)`** in `src/lib/supabaseHeaders.ts` — they set **`apikey`** and, for user calls, **`Authorization: Bearer <access token>`** (and legacy **JWT** anon key behavior when the key looks like a JWT).  
- **List endpoints** may send **`Prefer: count=exact`** and read **`Content-Range`** to get **total** row counts (pagination in projects and epics).

## Examples of “resources” in this app

- **`/rest/v1/projects`** — Projects CRUD (see `updateProject`, list fetch, etc.).  
- **`/rest/v1/epics`** — Create and update **epics**; filters use query params.  
- **`/rest/v1/project_epics`** — Often a **view** that joins or shapes epics for the UI list/details.  
- **RPC-style** or **view** endpoints like **`get_project_members`** for member lists.  

Exact paths live next to the **`fetch`** call in each API file; read those files as the **source of truth** for a given screen.

## Errors and 401

- If **`response.status === 401`**, the usual pattern is **`signOut()`** and **`navigate("/login", { replace: true })`**. This keeps **auth behavior** consistent across pages.  
- **Other** errors are parsed (see `parsePostgrestError`) and often shown in UI state as a string the user can read, or a generic “Something went wrong” with retry.

## “Supabase” vs “our API”

- You can think of the **API layer in `src/api/`** as your **app’s** contract to the backend, even if Supabase is the host. The UI **should not** scatter raw `fetch` URLs; use the wrappers so **headers, errors, and types** stay consistent.

## Related

- `PROJECT_ARCHITECTURE.md` — data layer and auth model.  
- `STACK_REACT_AND_TYPESCRIPT.md` — typing normalized responses.  
- `getSupabaseUrl` / `getSupabaseAnonKey` in `src/lib/env.ts`.
