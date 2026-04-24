# Redux & Redux Toolkit — simple guide (this project)

**Redux** is a **predictable global state** container. You keep important app-wide data in a **store**, update it with **actions**, and use **reducers** to say how the state should change. **Redux Toolkit (RTK)** is the official, simpler way to write Redux (`createSlice`, `createAsyncThunk`, `configureStore`).

## How this app uses it

- The store is in `src/store/store.ts`.
- The **user slice** (`src/store/slices/userSlice.ts`) holds the **logged-in user profile** and loading/error state.
- `main.tsx` wraps the app in `<Provider store={store}>` so any component can read the store.
- Typed hooks: `useAppSelector` and `useAppDispatch` in `src/store/hooks.ts` (better TypeScript for `state.user`, etc.).

## Words you will see

| Term | Meaning |
|------|--------|
| **Store** | One JavaScript object tree for the whole app (here: `{ user: ... }`). |
| **Slice** | A piece of the store: state + reducers + often async thunks, created with `createSlice`. |
| **Action** | A small object describing *what* happened, e.g. `setUserProfile({ ... })`. |
| **Reducer** | A pure function: `(state, action) => newState` (RTK + Immer lets you write “mutating” style in reducers). |
| **`createAsyncThunk`** | A helper to dispatch **pending / fulfilled / rejected** actions for an async function (e.g. `fetchUserProfile`). |
| **Dispatch** | `dispatch(someAction())` to send an action to the store. |
| **Selector** | A function that reads a piece of state: `useAppSelector((s) => s.user.profile)`. |

## When to use Redux here vs `useState`

- **Redux (this repo):** user profile, session-related flags that the **header / sidebar** need without passing props through many layers.
- **Local `useState` / URL:** a single page’s list, modal, filters, form draft — not global.

If only two nested components need the same value, **lift state** or use **Context** first; if many distant parts of the app need the same data and updates, Redux (or another global store) is a fit.

## Related files to open

- `src/store/slices/userSlice.ts` — `fetchUserProfile`, `setUserFromSessionUser`, `clearUserProfile`, etc.  
- `src/main.tsx` — `<Provider store={store}>`.  
- Layout/nav components that read `s.user` for the avatar or name (search for `useAppSelector`).

Read **`FRONTEND_EXTRAS.md`** for **React Context** (auth session, different from Redux but also “shared state”).
