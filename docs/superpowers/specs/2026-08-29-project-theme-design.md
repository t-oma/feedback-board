# Project Theme Design

## Context

The desktop and mobile design files define one fixed light visual theme. The application does not need dark-mode switching, tenant branding, a theme provider, or client-side theme state. Theme setup should make the established palette and typography available to every feature before the `/sign-in` interface is built, without turning page-specific measurements into global configuration.

## CSS Architecture

Keep the theme CSS-first in `src/app/globals.css`, using Tailwind CSS v4 namespaces directly:

- fixed color values live in `@theme` and generate semantic utilities such as `bg-background`, `bg-surface`, `text-foreground`, and `border-border`;
- font aliases remain in `@theme inline` because Source Serif 4 and JetBrains Mono are supplied through `next/font` CSS variables at runtime;
- the existing `:root` color indirection is removed because no value changes at runtime;
- base styles set the document to the light color scheme and give `body` the project background, foreground, and sans-serif body face.

No raw hexadecimal color should appear in feature markup when an existing theme role describes it. A new token is added only when a design value has a stable reusable role; spacing, radius, shadow, and type-size values stay in component utilities until repetition proves that they belong to the project theme.

## Initial Color Roles

The first theme exposes the stable roles already repeated across the desktop and mobile designs:

| Token                  | Value     | Role                                   |
| ---------------------- | --------- | -------------------------------------- |
| `background`           | `#f7f5f1` | Application canvas                     |
| `surface`              | `#fffefb` | Cards, headers, controls               |
| `surface-muted`        | `#f2efe8` | Segmented controls and quiet insets    |
| `foreground`           | `#1a1917` | Headings and primary values            |
| `foreground-secondary` | `#3d3a35` | Labels and strong supporting text      |
| `foreground-muted`     | `#57544e` | Body supporting copy                   |
| `foreground-subtle`    | `#6f6b62` | Helpers, links, and secondary controls |
| `foreground-faint`     | `#8c877c` | Metadata and low-emphasis utility text |
| `foreground-disabled`  | `#c9c3b6` | Disabled and placeholder-like content  |
| `border`               | `#ddd7cb` | Default control and surface borders    |
| `border-subtle`        | `#e2ddd3` | Dividers and low-emphasis borders      |
| `accent`               | `#7a5f33` | Primary actions and focus treatment    |
| `accent-muted`         | `#9e8659` | Pending primary actions                |
| `danger`               | `#8a3a2e` | Error text, icons, and invalid borders |
| `danger-surface`       | `#fdf8f6` | Error backgrounds                      |
| `danger-border`        | `#d9b4ab` | Error callout borders                  |

This is a semantic interface, not a complete transcription of every color in the design files. Neutral notice surfaces, domain statuses, and vote states are introduced by the first feature that owns and reuses them.

## Typography

The existing font loading in `src/app/layout.tsx` remains unchanged:

- `font-sans` uses Helvetica Neue with Helvetica and Arial fallbacks for body copy, labels, and controls;
- `font-serif` uses Source Serif 4 with Georgia fallback for headings and the product name;
- `font-mono` uses JetBrains Mono with a monospace fallback for URLs, metadata, counts, and compact utility text.

Only the body face is applied globally. Heading families, sizes, weights, and line heights remain explicit at their call sites so route hierarchy and responsive typography stay visible in the markup.

## Scope and Verification

The theme implementation changes `src/app/globals.css` only. It does not modify the user's existing `src/app/sign-in/page.tsx`, add UI, introduce dependencies, or change the lockfile.

Verification consists of Prettier, ESLint, TypeScript checking, and a production build so Tailwind processes every declared namespace and generated utility. Unit tests are not added for CSS token declarations. Visual verification starts with the auth page that consumes the tokens; testing the variable list itself would couple tests to implementation without exercising user-visible behavior.
