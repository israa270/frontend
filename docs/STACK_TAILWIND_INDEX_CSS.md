# Tailwind + `index.css` (stack deep dive)

Styling in this app is **Tailwind CSS v4** with a **project design system** defined in **`src/index.css`**. This file is the **single** place to see **colors, typography, shadows, and icon font** for the “Taskly / Figma” look.

## How Tailwind is loaded

- The entry stylesheet **`src/index.css`** starts with **`@import "tailwindcss";`**.  
- **Vite** loads Tailwind through the plugin **`@tailwindcss/vite`** in `vite.config.ts` (see `STACK_VITE.md`).

## The `@theme { ... }` block

In Tailwind v4, many **design tokens** are defined under **`@theme`**. In this project they include:

- **Colors** — e.g. `--color-primary`, `--color-slate-dark`, **semantic** colors (`success`, `error`, `warning`), form surfaces.  
- **Typography** — `--font-sans` (Inter), and **type scale** custom properties such as `--text-headline-lg` with line-height and weight.  
- **Shadows** — e.g. `shadow-card`, `shadow-soft` as named utilities.  
- **Material Symbols** — `--font-icon` for the `icon-material` class pattern.

These names are then used in components as **utility classes** like **`text-headline-lg`**, **`text-slate-dark`**, **`bg-surface-low`**, **`shadow-card`**, depending on how the theme is wired (Tailwind maps `--color-*` to utilities such as `bg-primary`, `text-slate-dark` when using the new theme pipeline).

**Practical rule:** when you add a new screen, **copy class combinations** from an existing page so spacing and hierarchy stay aligned with the Figma reference linked in the comment at the top of `index.css`.

## Layout and responsiveness

- **Flex / grid** — `flex`, `grid`, `gap-*`, `sm:`, `md:` for breakpoints.  
- **Width** — `max-w-4xl`, `max-w-6xl`, `w-full` for content columns.  
- The **epics** and **add epic** pages use consistent **max width** and **padding**; follow that for new routes.

## Icons (`icon-material`)

- Many buttons or labels use a **span** with **`icon-material`** and inner text that matches **Material Symbols** names (`search`, `add`, `edit`). The font is loaded so those glyphs appear as icons.  
- Keep **text in `aria-hidden`** for decorative icons, and a proper **`aria-label` on the button** when the icon is the only content.

## What we are *not* using here

- **No CSS-in-JS** (styled-components, Emotion) in the default setup.  
- **No** large hand-written `.page-name { }` per screen; rare exceptions can go in `index.css` or a co-located small block if the team agrees.

## Related

- Shorter intro: `TAILWIND_CSS.md`.  
- `PROJECT_ARCHITECTURE.md` — UI state conventions.  
- `STACK_VITE.md` — how the Tailwind plugin is hooked into the build.
