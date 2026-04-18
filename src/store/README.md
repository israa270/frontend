# Global state (Redux Toolkit)

This app uses **Vite + React** (not Next.js). The same Redux Toolkit patterns apply to Next.js if you later add a `StoreProvider` client component in the App Router.

## What’s included

- **`store.ts`** — `configureStore` with the **`user`** slice. **Thunk** is enabled by default (RTK includes `redux-thunk`).
- **`slices/userSlice.ts`** — User profile (`AuthUserResponse` shape), async **`fetchUserProfile(accessToken)`**, and sync actions for login/logout and small metadata updates.
- **`hooks.ts`** — Typed **`useAppDispatch`** / **`useAppSelector`** (RTK 2 / React-Redux 9 style).
- **`selectors.ts`** — Reusable selectors; add more files (e.g. `selectors/projectsSelectors.ts`) as features grow.

## Usage in components

```tsx
import { useAppDispatch, useAppSelector } from "../store";
import { selectUserProfile } from "../store/selectors";
import { clearUserProfile, fetchUserProfile } from "../store";

const profile = useAppSelector(selectUserProfile);
const dispatch = useAppDispatch();

await dispatch(fetchUserProfile(accessToken));
dispatch(clearUserProfile());
```

## Extending the store

1. Add a slice: `src/store/slices/myFeatureSlice.ts` (`createSlice` + thunks if needed).
2. Register it in **`store.ts`**: `reducer: { user: userReducer, myFeature: myFeatureReducer }`.
3. Export actions/selectors from **`index.ts`** as needed.

## Provider

The Redux **`Provider`** is mounted in **`src/main.tsx`** around the router and auth provider so all routes can read the store.
