# Design system

Why the site looks the way it does. Every value below lives in
`src/styles/global.css`; nothing here is decoration applied by hand in a page.

---

## 1. Positioning

The studio sells custom work to people who already know what a template is. So
the site has to look **built**, not **themed**: one clear idea, executed
consistently, with no borrowed visual language and no stock imagery.

Three consequences drove every decision:

1. **No stock photography.** There is no real office, no real team, no real
   client. A photo of a smiling developer would be a lie. Instead the site
   uses geometry: blurred meshes, hairline rules, skeleton mockups drawn in
   CSS, and a code-like monospace accent.
2. **Motion as evidence of craft, never as decoration.** Interactions follow
   the pointer with short, eased transitions (magnetic buttons, underline
   draws, scroll reveals). They are all disabled under
   `prefers-reduced-motion`.
3. **Warm dark, not cold dark.** The default theme is a warm near-black
   (`#0a0b0d`) with an ember accent. Technical sites default to blue-black and
   a blue accent; that reads as template. Ember plus mint keeps the "developer"
   signal while avoiding the generic look.

## 2. Colour

| Token | Dark (default) | Light | Role |
|---|---|---|---|
| `--bg` | `#0a0b0d` | `#f7f5f0` | page background |
| `--bg-elev` | `#0e1013` | `#fffdf9` | alternating sections |
| `--surface` | `#131619` | `#ffffff` | cards |
| `--surface-2` | `#191d21` | `#f1ede5` | nested surfaces, skeletons |
| `--line` | `white / 10%` | `black / 12%` | hairline borders |
| `--fg` | `#edeef0` | `#14161a` | primary text |
| `--fg-muted` | `#a8afb9` | `#4c535d` | body text |
| `--fg-subtle` | `#8b939e` | `#5c6470` | meta, labels |
| `--accent` | `#ff6a3c` | `#c2410c` | action |
| `--accent-2` | `#5fe3c0` | `#0f7a63` | secondary highlight |

Rules that keep it coherent:

- Exactly one accent is used for actions. `--accent-2` appears only in
  decorative geometry and in the logo mark.
- Light mode is a real theme, not an inversion: contrast ratios were
  re-checked, the accent darkened to `#c2410c` to keep text legible.
- Theme choice is stored in `localStorage`, applied by an inline script before
  first paint. No cookie, no flash.

## 3. Typography

- **Display — Bricolage Grotesque.** Its slightly mechanical grotesque shapes
  read as "engineering" without the cliché of a monospace-everything layout.
- **Text — Inter.** Chosen for legibility at 13–18 px on both themes.
- **Mono** is the system monospace, used only for eyebrows, indices and code.
- **Mono** is the system monospace, used only for eyebrows, indices and code.

The scale is fluid (`clamp()`) from `--text-2xs` to `--text-6xl`; every step
carries an explicit line height, so no level can drift.
Metric-override `@font-face` fallbacks (`size-adjust`, `ascent-override`) keep
the swap shift close to zero, and the two critical subsets are preloaded per
locale.

## 4. Layout

- One container (`--container-site`, 1320 px max) and one prose width
  (704 px). Long text never runs full width.
- Sections are spaced with a 3-step rhythm (`sm` / `md` / `lg`) plus a
  hairline top border instead of a hard colour change.
- **CSS logical properties everywhere** (`padding-inline`, `inset-inline-start`,
  `border-start`, `ms/me`). Nothing is positioned with `left`/`right`, so a
  right-to-left language can be added later without touching a component.
- Grid on the desktop (12 columns), single column on mobile, with no
  horizontal scroll at 320 px.

## 5. Signature elements

| Element | Why |
|---|---|
| Gradient mesh (`.mesh`) | Depth without images. Two blurred radials, `--mesh-1/2/3`, themed per mode. |
| Film grain (`.grain`) | A 160×160 `feTurbulence` data URI with `mix-blend-mode: overlay`. Kills the flatness of large dark areas. Zero requests. |
| Code-ish panel | The hero shows a fictional `studio.config.ts`. It is the brand argument in one glance: `proprietaireDuCode: vous`. |
| Demo mockups | Three hand-drawn CSS skeletons (business / booking / automation) with a `demo` watermark burnt into the frame. |
| Mono eyebrows | `///`, `01`, `SIGNATURE` in 11 px with wide tracking: the only "developer" costume, used sparingly. |
| Hairline + dot bullets | Prose bullets are 8 px lines in accent, not round dots. |

## 6. Motion

| Interaction | Timing |
|---|---|
| Hover colour / border | 300 ms `cubic-bezier(.16,1,.3,1)` |
| Magnetic button | 350 ms with a 0.18/0.28 follow factor, disabled on touch |
| Scroll reveal | 700 ms, 20 px rise, 70 ms stagger per child |
| Underline draw | 400 ms, `background-size` 0 → 100% |
| View transition | 220 ms out / 300 ms in, cross-document |

`@media (prefers-reduced-motion: reduce)` sets every duration to 0.001 ms,
disables the magnetic effect and neutralises the reveals.

## 7. Components

21 components, no framework, no icon library:

`Icon` (16 hand-drawn glyphs) · `Button` · `Section` · `SectionHeading` ·
`Card` · `ServiceCard` · `DemoCard` · `DemoMockup` · `Accordion` · `Tabs` ·
`Timeline` · `ComparisonTable` · `CheckList` · `Notice` · `Breadcrumbs` ·
`CtaBand` · `PageHero` · `ContactBrief` · `LegalBody` · `ThemeToggle` ·
`Header` · `Footer` · `StickyCta`

`Accordion` uses native `<details>` so the FAQs are readable without
JavaScript. `Tabs` is progressively enhanced: the first panel is in the HTML,
the keyboard pattern is added by `src/scripts/site.ts`.

## 8. What was deliberately rejected

- **A JS framework** (React/Vue islands): the site has no interactive state
  worth the bytes. The one dynamic behaviour is a 8 KB vanilla module.
- **An icon package**: 16 glyphs drawn inline cost less than the SVG sprite
  they would replace and inherit `currentColor` for free.
- **A cookie banner**: nothing is stored, nothing is measured, so there is
  nothing to consent to. The privacy page says exactly that.
- **Google Fonts**: replaced by self-hosted `latin` subsets, preloaded. The
  other subsets upstream ships are never built — an English-only site has no
  character outside `latin`.
- **Decorative imagery**: replaced by the code panel, meshes and mockups.