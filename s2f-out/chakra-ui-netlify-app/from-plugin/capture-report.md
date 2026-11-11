# s2f capture report

- **Project:** chakra-ui-netlify-app
- **Storybook:** https://chakra-ui.netlify.app
- **Captured:** 2026-10-15T15:02:14.053Z in 7.2 s
- **Browser:** chromium 155.0.8059.80 (Playwright Chromium not installed, used installed Google Chrome)
- **Modes:** none (no theme global configured)
- **Output:** `s2f-out/chakra-ui-netlify-app/from-plugin/model.json` (schema v1.0.0)

## Summary

All good: **11 components**, **11 variants** captured, file is valid.

| Component | Story | Varied props | Variants | Matrix | Left out (cap) | Failed | Layers / variant | Warnings |
|---|---|---|---:|---:|---:|---:|---:|---:|
| Alert/Default | `alert--default` | — | 1 | 1 | 0 | 0 | 8 | 0 |
| Alert/Solid | `alert--solid` | — | 1 | 1 | 0 | 0 | 9 | 0 |
| Alert/Subtle | `alert--subtle` | — | 1 | 1 | 0 | 0 | 7 | 0 |
| Badge/Default | `badge--default` | — | 1 | 1 | 0 | 0 | 2 | 0 |
| Badge/Outline Badges | `badge--outline-badges` | — | 1 | 1 | 0 | 0 | 13 | 0 |
| Badge/Solid Badges | `badge--solid-badges` | — | 1 | 1 | 0 | 0 | 13 | 0 |
| Badge/Subtle Badges | `badge--subtle-badges` | — | 1 | 1 | 0 | 0 | 13 | 0 |
| Button/sizes | `button--sizes` | — | 1 | 1 | 0 | 0 | 10 | 0 |
| Button/variants | `button--variants` | — | 1 | 1 | 0 | 0 | 10 | 0 |
| Button/with custom icon | `button--with-custom-icon` | — | 1 | 1 | 0 | 0 | 4 | 0 |
| Button/with left icon | `button--with-left-icon` | — | 1 | 1 | 0 | 0 | 4 | 0 |

## Fonts

Designers need these fonts installed before importing into Figma.

| Family | Weight | Italic | Source in browser | Text layers |
|---|---:|---|---|---:|
| -apple-system | 400 | no | ⚠️ generic system font — pick a named font in the plugin | 3 |
| -apple-system | 600 | no | ⚠️ generic system font — pick a named font in the plugin | 10 |
| -apple-system | 700 | no | ⚠️ generic system font — pick a named font in the plugin | 22 |

## Design tokens (Figma variables)

No CSS custom properties were found around the components, so no variables will be created.

## Notes

- Layout is absolute (every layer keeps its exact position). Auto-layout comes in a later phase.
- Hover / focus / pressed states are not captured yet.
- A layer is linked to a token only when the token gives exactly the value the browser drew; anything else keeps its plain value.
- `previews/` has one PNG per variant: the reference picture to compare the Figma result against.
