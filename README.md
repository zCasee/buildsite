# Buildsite

> Your website. An AI assistant. One monthly fee.

Marketing site for **Buildsite** — productized website + AI assistant service for small businesses. From $299/mo. Ships in 14 days.

## Live

**[https://buildsite.carlo-abdelnour.workers.dev/](https://buildsite.carlo-abdelnour.workers.dev/)** — public, auto-deploys from `main` via Cloudflare Workers (Static Assets).

## Stack

- **Astro 6** + **Tailwind v4** via `@tailwindcss/vite`
- **Geist** + **Geist Mono** (Google Fonts)
- **Cloudflare Workers** for hosting (`wrangler.jsonc` → static assets in `dist/`)
- **Light + dark theme** via `data-theme` attribute on `<html>` + `localStorage` persistence; default respects `prefers-color-scheme`

## Design

The visual system is the **Buildsite Design System** mocked up at [claude.ai/design](https://claude.ai/design) and committed to the parent pack at [`github.com/zCasee/website-builder-pack/buildsite-design-system`](https://github.com/zCasee/website-builder-pack/tree/main/buildsite-design-system). The canonical tokens are mirrored in `src/styles/global.css`.

Dark mode is the brand default (per design system §1: "Dark only"). The live site adds a light-mode override at user request — implemented as a `[data-theme="light"]` token override; the brand still ships dark-first.

## Commands

```sh
bun install              # install deps
bun run dev              # http://localhost:4321
bun run build            # static build into ./dist
node scripts/gen-og.mjs  # regenerate public/og.png from inline SVG
```

## Open placeholders

| Placeholder | Where | Replace with |
|---|---|---|
| `FORMSPREE_ID` | `src/pages/index.astro` (form `action`) | A real Formspree form ID after registering at [formspree.io](https://formspree.io/) |
| `https://cal.com/zcasee/discovery` | hero + final CTA | A real Cal.com booking URL once the calendar is set up |
| `buildsite.dev` | `astro.config.mjs` `site:` + OG meta | The real custom domain once acquired (currently using the workers.dev URL) |

## Structure

```
.
├── astro.config.mjs                 ← site + sitemap + Tailwind v4
├── wrangler.jsonc                    ← Cloudflare Workers (Static Assets) config
├── src/
│   ├── pages/index.astro             ← the landing page (single page for now)
│   ├── layouts/BaseLayout.astro      ← <head>, theme detection, ToolCursor, slot
│   ├── components/ToolCursor.astro   ← trowel cursor + brick particles
│   └── styles/global.css             ← design tokens, theme overrides, motion
├── public/
│   ├── favicon.svg                   ← B-mark with accent dot
│   ├── og.png                        ← 1200×630 social card (resvg-generated)
│   └── robots.txt
└── scripts/
    └── gen-og.mjs                    ← regenerate og.png from SVG
```
