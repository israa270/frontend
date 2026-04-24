# Redux Toolkit (stack deep dive)

**Redux Toolkit (RTK)** is the **official, recommended** way to use Redux. It **cuts boilerplate** (`createSlice`, `configureStore`, built-in support for “mutable” style reducers through **Immer**) and fits TypeScript with minimal setup.

In this app, **Redux is intentionally small**: one main slice, **`user`**, for **profile and load status** used by the app shell. Most **page-level** state stays in **local React state** or the **URL**.

## Store shape (this repo)

- File: `src/store/store.ts`.  
- **`configureStore({ reducer: { user: userReducer } })`**.  
- **Types:** `RootState` and `AppDispatch` are **exported** so `useAppSelector` / `useAppDispatch` know the real state shape.  
- **`main.tsx`** wraps the app in **`<Provider store={store}>`** from `react-redux`.

Everything under `state.user` is defined in **`userSlice`**.

## The user slice (what it stores)

- **`profile`** — User object from the auth API (or a slim shape from session), `null` when logged out.  
- **`status`** — `"idle" | "loading" | "succeeded" | "failed"` for the async `fetchUserProfile` thunk.  
- **`error`** — String if the last load failed.  

### Sync actions (reducers in the slice)

Examples from `userSlice`: **`setUserProfile`**, **`setUserFromSessionUser`**, **`updateUserMetadata`**, **`clearUserProfile`**.  
These run when login completes, when you hydrate from cookies, when the user updates metadata, or on logout.

### Async: `createAsyncThunk`

- **`fetchUserProfile(accessToken)`** — Dispatches `pending` / `fulfilled` / `rejected` and updates `status` + `profile` / `error` in **`extraReducers`**.  
- Pages or layout can **dispatch** this after a token is available.

## Typed hooks (`src/store/hooks.ts`)

- **`useAppDispatch`**, **`useAppSelector`** — Thin wrappers with **`withTypes<...>`** so selectors get **`RootState`** and dispatch gets **`AppDispatch`**. You avoid typing mistakes when reading `state.user`.

## How this differs from **Context** in the same app

- **`AuthSessionProvider`** (React **Context**): access token, `signOut`, `getAccessToken` — **session pipeline**, cookies, “who is signed in for API calls.”  
- **Redux `user`**: **profile data** and status for the **UI** (name in navbar, etc.).  

It is a common pattern to mix **Context for auth session** and **Redux (or another store) for cached user profile**; not everything has to be in one place.

## When to add a second slice

If many unrelated features need **truly global** data (for example, feature flags, org-wide settings), a new **`createSlice`** can be added to `reducer: { }`. If only one subtree of the tree needs the data, **Context** or **URL state** or **lifted `useState`** is often enough.

## Related

- Shorter intro: `REDUX.md`.  
- `userSlice` source: `src/store/slices/userSlice.ts`.  
- `FRONTEND_EXTRAS.md` — when **not** to reach for Redux.
