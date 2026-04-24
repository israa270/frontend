# Tailwind CSS — simple guide (this project)

**Tailwind CSS** is a **utility-first** CSS framework. You style the UI with **small class names** in the `className` prop (`flex`, `gap-4`, `rounded-lg`, `text-slate-dark`) instead of writing many separate CSS files with custom class names for every screen.

## How this app uses it

- **Tailwind v4** is imported in `src/index.css` with `@import "tailwindcss";`.
- **Design tokens** (colors, fonts, type scale) live in the same file under an **`@theme { ... }` block** (project-specific names like `primary`, `slate-dark`, `text-headline-lg`).
- Components use a mix of **Tailwind utilities** and these **token-backed classes** (e.g. `text-headline-lg`, `bg-surface-low`, `text-slate-dark`).

## Why utilities?

- You **see** layout, spacing, and color in the same place as the JSX.  
- **Consistent** spacing scale (`p-2`, `p-4`, `gap-3` …).  
- **Responsive** prefixes: `sm:`, `md:` (example: `flex-col sm:flex-row`).  
- **States**: `hover:`, `focus:`, `disabled:` without writing separate selectors.

## A tiny example

```text
className="flex items-center justify-between gap-2 rounded-lg border border-surface-highest bg-white p-4 shadow-soft"
```

- **Layout:** `flex`, `items-center`, `justify-between`, `gap-2`  
- **Box:** `rounded-lg`, `border`, `p-4`, `bg-white`  
- **Project tokens:** `border-surface-highest`, `shadow-soft`

## Where the “design system” is

- Open **`src/index.css`** to see custom colors, typography, and shadows. That is the **Figma / Taskly** look in code form.  
- Reuse those class names so new pages **match the rest of the app**.

## Icons

Material Symbols are included (see `index.html` / font setup). A span with `className="icon-material"` often wraps icon names (e.g. `search`, `add`) to match the design system.

## When you *don’t* need Tailwind for everything

- Very **dynamic** values (a color from a variable) can use **inline `style`**, a **CSS variable**, or a small **custom class** in `index.css`.  
- Third-party modals or maps sometimes need a **wrapper** with a normal class. That is normal.

## Learning path

1. Skim the **“Layout”** and **“Spacing”** sections on the official Tailwind docs.  
2. In this repo, **copy patterns** from an existing page (`className` strings that already work).  
3. Use the **search** in your editor for `className="` in `src/pages` to see real combinations.

## Other CSS approaches (for later)

- **Plain CSS** or **CSS Modules** (scoped file per component) are common in other projects. This repo chose Tailwind for speed and consistency; the ideas (box model, flex, grid) are the same.
