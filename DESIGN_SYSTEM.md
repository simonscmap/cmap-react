# Simons CMAP — Design System

This document describes the design token system introduced to unify the
application's visual design, the rules for using it, and the procedure for
changing the palette. It accompanies the restyle that consolidated two
competing themes and roughly ninety-seven scattered color values onto a single
canonical set.

## Summary of the system

All visual design values — colors, gradients, fonts, radii, spacing, and
elevation shadows — are defined once, in `src/theme/tokens.json`. Four
consumers derive from that file:

1. `src/theme/tokens.js` — the JavaScript layer. Components and style modules
   import colors and other values from here (or from the legacy shims below).
2. `src/theme/index.js` — the single Material-UI v4 theme for the entire
   application. It replaces the two previous themes.
3. `src/theme/cssVariables.js` — injects every token as a CSS custom property
   (`var(--cmap-...)`) on the document root at boot, for use by plain CSS.
4. `src/Stylesheets/_tokens.scss` — a generated SCSS partial for build-time
   Sass consumers, principally the ag-grid material theme in `App.scss`.
   Regenerate it after any token change with
   `node scripts/generate-scss-tokens.js` and commit both files together.

Two legacy modules remain as compatibility shims so that existing imports
continue to work: `src/enums/colors.js` (the old flat color enum) and
`src/Components/Home/theme.js` (the old homepage theme). Both now derive every
value from the tokens, and `homeTheme` is the unified theme. New code imports
from `src/theme` directly.

## Changing the palette

`src/theme/tokens.json` is the configuration file. Edit a value there and
rebuild (or restart the development server); the entire application follows.
The SCSS partial for ag-grid is regenerated automatically by the npm
`pre-build` step, which runs on every `npm start` and `npm run build`, so no
manual step is involved. Since the v0004 refactor no component file holds a
copy of a token value: components reference tokens through the Material-UI
theme, through CSS custom properties (`var(--cmap-...)`), or, for canvas-type
consumers (Plotly charts, esri map symbols), through imports from
`src/theme/tokens`. A checksum comparison confirms that a palette change
touches exactly two files: `tokens.json` and the generated partial.

For switching between the named palettes in the `palettes/` directory, a
convenience script copies a palette's values into `tokens.json` and refreshes
the partial in one command. From the repository root:

```
node scripts/apply-palette.js <palette-name>
```

Running the script with no argument lists the available palettes. The
operation is symmetric: any palette can be applied over any other, and the
previous state is recovered by applying the palette that matches it.

Shipped palettes:

- `atoll-bright` (the current default) — luminous cyan accent with the logo
  lime, close to the long-standing production identity but consistent and a
  step down from full neon.
- `lagoon-teal` — the calmer, desaturated teal and olive palette from the
  first restyle iteration.
- `marine-azure` — a sky-blue interactive accent with the brand green kept
  for highlights; the most conventional option.
- `shoreline-light` — an experimental light palette: white surfaces, deep
  ocean-teal accents, dark navy text. Palettes are self-contained (each
  declares the full surface, text, line, and gradient set), so switching
  between light and dark and back restores the exact previous state. The
  application was designed dark-first, and a small number of components
  hardcode white text or borders outside the token system; under the light
  palette those spots can render with poor contrast. Adopting a light
  palette for production requires a hardening pass that folds those white
  literals into semantic tokens; until then this palette is for evaluation.

To create a new palette, copy one of the JSON files, change the values, and
apply it by name. For ad-hoc edits to values the palettes do not cover
(surfaces, semantics, text), edit `src/theme/tokens.json` directly and
rebuild.

## The palette

Surfaces (deep-ocean navy, always solid):

- `background` `#03172F` — page background and deepest layer.
- `surface` `#0B2E4F` — cards, dialogs, table bodies (Material-UI `paper`).
- `elevated` `#1C4772` — popovers, tooltips, hover surfaces.
- `surfaceDark` `#07274D` — gradient stop and recessed panels.

Accents:

- `primary` — the single interactive accent (buttons, links, focus, icons),
  replacing both the neon `#69FFF2` and the muted `#22A3B9`. `#5BE6DA` in the
  default `atoll-bright` palette.
- `green` — brand green for section headings, highlights, and success states,
  replacing the four previous greens. `#A8DC5A` in the default palette.
- `purple` family — retained for the news feature's identity.

Semantics (conventional, replacing the previous yellow-for-error scheme):

- `error` `#EF6A6A` — blocking errors, in red.
- `warning` `#FFB74D` — cautions, in amber. The legacy `errorYellow` name now
  resolves here; the legacy `blockingError` name resolves to `error`.
- `success` and `info` follow `green` and `primary` respectively.

Text and lines: `textPrimary` white, `textSecondary` white at 72 percent,
`textDisabled` white at 40 percent, `textMuted` `#9FB3C8`, `divider` white at
15 percent.

Reserved: `neonTeal` `#69FFF2` and `neonLime` `#A1F640` remain defined as
tokens for data-visualization highlights only. Nothing in the interface maps
to them by default.

## Typography

- Headings: Montserrat, mixed case. The previous uppercase-with-tracking
  treatment on h1 through h3 is removed; h6 (a small footer label) keeps its
  uppercase style, as does the `overline` variant, which is the correct
  variant for small labels.
- Body: Lato. The body font conflict between the theme (Lato) and the global
  stylesheet (Montserrat) is resolved in favor of Lato.
- Buttons: sentence case (`textTransform: none`), weight 600.
- The accidental `"roboto", Serif` fallback in the catalog pages is replaced
  with the body stack.

## Shape and consistency rules

- Border radius: `6px` (`radius.md`) for controls and cards; `2px` for subtle
  insets; pill shapes remain for deliberately rounded elements. The sweep
  normalized the previous 4px and 5px values to 6px.
- Surfaces are solid. The previous translucent `rgba(0,0,0,.3)` paper override
  is removed, so a card looks the same on every page.
- Do not hardcode hex colors in components. Import from `src/theme` (new code)
  or use the CSS custom properties in stylesheets.

## What changed in the restyle (for reviewers)

- One unified theme in `src/theme/index.js`; the root `MuiThemeProvider` in
  `App.js` and all local `ThemeProvider` wrappers now resolve to the same
  theme through the shims.
- The two local `WarningTheme` definitions in the download dialog now map
  red to blocking errors and amber to warnings, from the semantic tokens.
- A repository-wide sweep (107 files, roughly 335 replacements) consolidated
  legacy colors onto the canonical values: neon teal and legacy cyan to
  `primary`; the four greens to `green`; the six-plus navies and the stock
  gray backgrounds to the surface ramp; scattered yellows and oranges to
  `warning`; scattered reds to `error`; assorted neutral grays to the muted
  text colors. Legacy `rgb()`/`rgba()` spellings of the neon accents were
  retargeted with alpha preserved.
- The page background gradient in `index.css` is the token `page` gradient;
  scrollbar accents use the token palette.
- The ag-grid theme variables in `App.scss` derive from the generated token
  partial.
- Duplicate Google Fonts imports were merged into one; leftover Create React
  App boilerplate styles were removed.

## Fourth iteration (v0008) changes

- The h6 typography variant is restored as a readable content heading. The
  historical home theme styled h6 as a faint uppercase footer label, and the
  unified theme had adopted that globally, dimming the 39 places that use
  h6 for real content (for example program descriptions). Footer components
  wanting a muted label can restyle locally or use the overline variant.
- Palettes are now self-contained and support explicit gradient overrides,
  and the palette switcher no longer retargets values it assigns directly,
  which removes a collision when a color (such as white) is both an old
  value of one key and the new value of another. Light-dark palette
  round-trips restore byte-identical state.

## Third iteration (v0004) changes

- Consolidated color literals in component files were eliminated: DOM-styled
  code now references CSS custom properties (`var(--cmap-...)`, including
  `--cmap-<name>-rgb` triplets for rgba usage), and canvas-type consumers
  (the Plotly anomaly chart, chart base configuration, and the esri map
  symbols) import their colors from `src/theme/tokens`, which exports `color`,
  `rgb` (triplet strings), and `rgbArray` (numeric arrays).
- SCSS token generation was hooked into the npm `pre-build` script, so the
  generated partial can never go stale. Note that this modifies the build
  script of the validated pipeline; the next deployment should be validated
  on the development environment with normal care.
- `scripts/apply-palette.js` no longer rewrites component files; it only
  updates `tokens.json` and refreshes the partial, and remains as a
  convenience for switching named palettes.

## Second iteration (v0002) changes

- Sort and toggle controls: the selected state of toggle buttons is a
  translucent accent tint with an accent border instead of a solid green
  block, which read as oversized green squares on the catalog page.
- The palette switcher (`scripts/apply-palette.js`) and the `palettes/`
  directory were added, and the default palette changed from `lagoon-teal`
  to `atoll-bright`.

## Validation notes for the development deployment

The restyle is repository-wide, so validation on `simonscmap.dev` should walk
every major page: home, catalog and dataset detail, visualization (charts and
cruise trajectories), data submission portal and dashboard, gallery, news, and
the login and user pages. Specific points to check:

- Tables (ag-grid) on the catalog and data submission pages: header, hover,
  filter popups, and inline editors should read as the navy palette.
- The download dialog's validation states: red for blocked, amber for
  warnings.
- The homepage between 600 and 900 pixels wide: the unified theme uses the
  600-pixel small breakpoint application-wide, where the former home theme
  used 900. Layout at tablet widths deserves a look.
- Any chart or globe visualization, to confirm trace colors render correctly.
