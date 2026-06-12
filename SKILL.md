---
name: compound-deck-kit
description: Use when building a full-page, presentable HTML slide deck or pitch deck in Claude Code — a deck the user can edit live in the browser, mark up, present from (speaker notes + presenter window), and export to HTML/PDF. Use when the user wants a "real" deck (not chat slides), a client pitch, a workshop deck, or asks for the Compound / Claude / Neon look.
---

# Compound Deck Kit

Build a single-folder, full-page HTML deck on top of a tiny zero-dependency engine. Each deck gets scroll-snap navigation, entrance animations, count-up numbers, a live in-browser Edit mode, mark-up/annotation, editable speaker notes, a presenter window, tap-to-reveal, and HTML/PDF export — from plain `<section class="slide">` markup plus two include lines.

## Overview

- **Engine:** `assets/deck-kit.css` + `assets/deck-kit.js`. Generic and theme-agnostic. Never edit per deck.
- **Themes:** `themes/compound.css`, `themes/claude.css`, `themes/neon.css`. Pick one (or load all and switch via `data-theme`).
- **You write:** `<section class="slide">` blocks using the shared vocabulary below, plus a `speaker-notes` JSON array.
- **Reference build:** `examples/showcase.html` (every feature, all three themes, live switcher). Read it before building.

## Build steps

1. **Make the deck folder.** Copy this skill's `assets/` folder and the chosen `themes/<theme>.css` next to a new modular `deck.html`. (Or copy `starter.modular.html` as the skeleton — it already wires everything.)
2. **Head:** set `<html data-theme="compound|claude|neon">`, a unique `<meta name="deck-id" content="...">`, `<title>`, then in order: `deck-kit.css`, the one theme css, `<script defer src="assets/deck-kit.js">`.
3. **Slides:** one `<section class="slide">` per slide. Use the vocabulary table. Add `reveal d1..d8` for staggered entrances. Section breaks use `<section class="slide sec">`.
4. **Notes:** fill the `<script type="application/json" id="speaker-notes">` array — **exactly one entry per slide, in order.** Write them as a spoken talk-track (what to SAY), use `<strong>` for emphasis.
5. **Verify:** open in a browser (or screenshot headless). Confirm slide count == note count, nothing overflows 100vh, count-ups fire, no console errors.
6. **Bake to a single file (required for delivery):** `node build-standalone.mjs deck.html deck.standalone.html`. This inlines the engine CSS+JS and the active theme into one self-contained file. **Hand the user the standalone** — a double-clicked modular `deck.html` can't read its sibling `.css`/`.js` over `file://` (browser blocks it), so only the baked file works offline, exports a self-contained HTML, and prints a colored PDF.

## Slide vocabulary (every theme styles these identically)

| Class | Use |
|---|---|
| `.slide` / `.slide.sec` | A slide / a section-divider slide (different background) |
| `.top` `.body` `.bot` | Header row / centered content / footer row |
| `.brand` `.meta` `.pg` `.brand-mark` | Mono labels in the header/footer |
| `.overline` | Small-caps label above a headline |
| `.display` / `.section` | Hero H1 / section H2 |
| `.lead` | Intro sentence under a headline |
| `.stat-number` | Big number — add `data-count` to animate (see below) |
| `.stat-label` `.stat-sub` | Caption lines under a stat |
| `.card-grid` > `.card` ( `.card-t` + `.card-d` ) | Auto-fit card row |
| `.pill` | Small chip / tag |
| `.kbd` | Keyboard-key styling for inline keys |
| `.cta` | Primary button/link |
| `.rule` | Thin accent divider line |

**Count-up number:** `<div class="stat-number" data-count="16500" data-prefix="$" data-suffix="+">$16,500+</div>` — optional `data-decimals`. Animates the first time the slide scrolls into view.

**Tap-to-reveal:** wrap the gated content in `[data-gate]`, put a `<button class="reveal-gate">…</button>` inside, and mark the payload elements `.gate-item`. Click (or Enter on that slide) reveals them. Auto-resolved in PDF export.

## Author keys (built in — never re-implement)

`E` edit text + notes · `M` mark/annotate · `N` speaker notes · `P` presenter window · `↓ HTML` / `↓ PDF` export · `⟲` reset saved edits. Controls appear top-center when the mouse nears the top edge. **`↓ HTML`** bakes a fully self-contained file (CSS+JS+edits+notes inlined). **`↓ PDF`** opens the print dialog with backgrounds/colors forced on and all edit affordances stripped (one slide per page).

## Themes

| Theme | Vibe | Fonts |
|---|---|---|
| `compound` | Deep-teal authority, gold CTAs (Compound brand) | Archivo Black · DM Sans |
| `claude` | Warm cream paper, clay accent, editorial serif (workshop look) | Newsreader · Spline Sans |
| `neon` | Cyber cyan + magenta on navy, grid & glow | Clash Display · Space Grotesk |

To offer a live switcher (like the showcase), load all three theme files and toggle `document.documentElement.dataset.theme`.

## Common mistakes

| Mistake | Fix |
|---|---|
| Speaker notes count ≠ slide count | Keep them 1:1, in order — `N`/`P` drift otherwise |
| Editing `deck-kit.js`/`.css` per deck | Don't. Per-deck design goes in a small `<style>` or the theme. Override the editable set with `window.DECK_KIT_EDIT_SEL` if needed |
| Content overflows the slide | Each `.slide` is 100vh, no scroll — split into more slides; never cram |
| Old browser edits paint over a rewrite | Bump `<meta name="deck-id">` (namespaces localStorage) or press `⟲` |
| Theme not applying | `<html data-theme>` must match the loaded theme file; theme css loads AFTER `deck-kit.css` |
| Handing the user the modular `deck.html` | Bake it first (`build-standalone.mjs`) — the modular file is blank/unstyled when opened from `file://` |
| Fabricated metrics in a stat | Use real numbers from the user; leave a placeholder if unknown |

## Credit

Built by **Compound Systems** · [usecompound.ai](https://usecompound.ai). Keep the footer credit when sharing.
