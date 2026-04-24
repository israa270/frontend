# JavaScript — simple guide (for this project)

This file is a **short** refresher. Modern JavaScript (ES6+) is the language the browser and Node run. The React app is written in **TypeScript** (see `TYPESCRIPT.md`), but you still use normal JavaScript patterns every day.

## Variables

- `let` — Value can be reassigned.
- `const` — Binding cannot be reassigned (object properties can still change).
- `var` — Older style; avoid in new code.

## Functions

```text
// Regular function
function add(a, b) {
  return a + b;
}

// Arrow function (very common in React)
const add = (a, b) => a + b;
```

## Template strings

Use backticks and `${}` to insert values into text:

`Hello, ${name}!`

## Destructuring

Pull fields out of objects or arrays in one line:

`const { projectId } = useParams();`  
`const [count, setCount] = useState(0);`

## Modules

- `import X from "..."` — Default export.
- `import { a, b } from "..."` — Named exports.

Each file in `src/` is a module; you connect them with `import` / `export`.

## Array methods (very common)

- `map` — Build a new array by transforming each item (often to list JSX: `items.map((item) => <li key={...}>...`)).
- `filter` — Keep only items that pass a test.
- `find` — First item that matches, or `undefined`.
- `some` / `every` — Test whether any or all items match.

## `async` / `await`

`async` functions can use `await` to wait for a **Promise** (for example, `fetch`):

A function that returns a Promise is **asynchronous**; the UI does not “freeze” while the request runs, as long as you do not block the main thread in a long loop.

## `try` / `catch` / `throw`

Use them to **handle errors** from `await` and from libraries:

- `try` { ... code that might fail ... }  
- `catch (e)` { ... what to do with the error ... }  

This project’s API helpers often `throw` an `HttpError` on bad responses.

## Objects and `null` / `undefined`

- **`undefined`** — Variable not set, or property missing.
- **`null`** — “No value on purpose” (for example, optional API field).
- **Optional chaining** — `user?.name` is safe if `user` is `null` or `undefined`.
- **Nullish coalescing** — `value ?? "default"` uses `"default"` only when `value` is `null` or `undefined`.

## `===` and truthiness

Prefer **`===`** (strict equality) instead of `==` to avoid type coercion surprises.

**Truthy / falsy** — In conditions, values like `0`, `""`, `null`, `undefined`, and `false` are treated as “falsy”; be careful with `0` in UI (use explicit checks if needed).

## `JSON`

- `JSON.stringify(obj)` — Turn a JavaScript object into a string to send in HTTP bodies.
- `JSON.parse(text)` — Turn JSON text into a value (this project also checks types carefully when data comes from the network).

This is enough to read most files in `src/`. For **types** on top of JavaScript, read `TYPESCRIPT.md`.
