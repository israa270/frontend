# React concepts: state, effects, and hooks (with simple examples)

This page is for you if you already know **HTML** and **JavaScript** and want a clear map of what **state**, **effects**, and **hooks** mean in React, plus **tiny** examples you can type yourself.

## The big idea

**React = UI is a function of data.** You store data that can change in **state**. When state changes, React **re-runs** your component and updates the real page (the DOM) for you. You do **not** do `querySelector` + `textContent` for every small change; you **set state** and re-render.

---

## 1. State — `useState`

**State** = values that **belong to this screen** and should **update the UI** when they change (a number, text in an input, “modal open or closed,” a list of users).

- **`useState(initialValue)`** returns **two** things in an array:
  1. the **current** value  
  2. a **setter** function (e.g. `setCount`) to change it and trigger a re-render

### Example: counter

```tsx
import { useState } from "react";

export function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>Count: {count}</p>
      <button type="button" onClick={() => setCount(count + 1)}>
        +1
      </button>
    </div>
  );
}
```

**What happens:** Click → `setCount` → React re-runs `Counter` → `count` is 1, 2, 3, … and the paragraph updates.

**Mental line:** *If you would have used a `let` and then changed the DOM by hand, in React you often use `useState` and change state instead.*

---

## 2. Hooks — what the word means

**Hooks** are special functions whose names start with **`use`**: `useState`, `useEffect`, `useMemo`, …

- They work **only** at the **top level** of a **function component** (not inside a random `if` / loop at first — there are stricter “rules of hooks” so React can line up your component with its internal list).
- They are how you **ask React** for: local state, effects, memoized values, context, and more.

**Not a separate language** — it is still JavaScript, with a few **rules** so React can work reliably.

### Rules of hooks (short)

- Call hooks only in **function components** (or in **custom** hooks: functions whose name starts with `use`).
- Do **not** call hooks inside conditions, loops, or nested functions **unless** that structure is the same on every render (beginners: keep hooks at the top of the component).

```tsx
// Good: hooks at the top, same order every time
function Good() {
  const [a, setA] = useState(0);
  const [b, setB] = useState(0);
  // ...
}
```

```tsx
// Bad: hook inside "if" — do not do this
function Bad({ show }) {
  if (show) {
    const [x, setX] = useState(0); // wrong
  }
}
```

---

## 3. Effects — `useEffect`

An **effect** = something you do **after** a render, usually to talk to the **outside world** or **sync** with something that is not just “recompute the UI from state.”

- **`useEffect(() => { ... }, [deps])`**
  - Runs **after** React has put your JSX on the screen.
  - **`deps`** = dependency array. When any listed value **changes** between renders, the effect **runs again**.
  - **`[]` (empty array)** = run **once** when the component is first shown (and optionally clean up on unmount — see below).

**Use for:** `fetch` from an API, `addEventListener` on `window`, timers, writing to `localStorage`.

**Do not use for** the default button behavior — use `onClick` with `setState` for “user clicked, increment counter.”

### Example: log when `count` changes

```tsx
import { useState, useEffect } from "react";

export function CounterWithEffect() {
  const [count, setCount] = useState(0);

  // Runs when `count` changes
  useEffect(() => {
    document.title = `Count is ${count}`;
  }, [count]);

  return (
    <div>
      <p>Count: {count}</p>
      <button type="button" onClick={() => setCount(count + 1)}>
        +1
      </button>
    </div>
  );
}
```

**What happens:** Every time `count` changes, the effect runs and updates the **tab title** (`document.title`).

### Example: fetch once on mount (empty `[]`)

`[]` means: run the effect when the component **first appears** (mount), not on every render.

The **`return () => { ... }`** at the end is a **cleanup** function: it runs when the component is removed (unmount) or right before the effect re-runs. With `async` fetch, a small `cancelled` flag helps avoid **setting state** after the user has already left the page (good habit on real apps).

```tsx
import { useState, useEffect } from "react";

export function TodoList() {
  const [todos, setTodos] = useState(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const res = await fetch("https://jsonplaceholder.typicode.com/todos?_limit=3");
      const data = await res.json();
      if (!cancelled) setTodos(data);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (todos === null) return <p>Loading…</p>;

  return (
    <ul>
      {todos.map((t) => (
        <li key={t.id}>{t.title}</li>
      ))}
    </ul>
  );
}
```

**What happens:** On first show, `todos` is `null` → you show “Loading…”. When the request finishes, `setTodos` runs → the list appears.

**Try it yourself:** In a new Vite + React app, paste this as a page component and run `pnpm run dev` (or add a route in this project that renders only this component for practice).

---

## 4. Quick reference table

| You know (plain JS) | In React you often use |
|---------------------|-------------------------|
| `let` + `querySelector` to update the DOM | **`useState`** + describe UI in JSX |
| `addEventListener("click", …)` | **`onClick={() => setState(…)}`** (or a named function) |
| `fetch` in a script | **`useEffect` + `fetch`**, or **`fetch` inside `onClick`**, and **`useState` for the result** |

| Hook / term | One-line meaning |
|-------------|------------------|
| **State** | Data that, when it changes, should refresh the screen. |
| **Hook** | A `use…` function that only runs in components (or custom hooks) at the top level. |
| **Effect** | “After I rendered, do this extra work” (side effects) — and maybe clean up. |

---

## 5. Where to go next in this repo

- `REACT.md` — how this project is structured and the dev commands.  
- `LEARN_REACT_WITH_THIS_PROJECT.md` — real pages that combine state, effects, routing, and modals.  
- `STACK_REACT_AND_TYPESCRIPT.md` — how TypeScript and React fit together here.

The official **React** docs: `https://react.dev/learn` — the “state” and “escaping the cycle” (effects) topics match what you just read.