# s2f capture report

- **Project:** react-carbondesignsystem-com
- **Storybook:** https://react.carbondesignsystem.com
- **Captured:** 2026-10-15T14:03:53.706Z in 30.2 s
- **Browser:** chromium 155.0.8059.80 (Playwright Chromium not installed, used installed Google Chrome)
- **Modes:** none (no theme global configured)
- **Output:** `s2f-out/react-carbondesignsystem-com/from-plugin/model.json` (schema v1.0.0)

## Summary

All good: **3 components**, **65 variants** captured, file is valid.

| Component | Story | Varied props | Variants | Matrix | Left out (cap) | Failed | Layers / variant | Warnings |
|---|---|---|---:|---:|---:|---:|---:|---:|
| Toggle/Default | `components-toggle--default` | `disabled`, `hideLabel`, `readOnly`, `size`, `toggled` | 32 | 32 | 0 | 0 | 8 | 0 |
| Toggle/Skeleton | `components-toggle--skeleton` | — | 1 | 1 | 0 | 0 | 5 | 0 |
| Toggle/With Accessible Labels | `components-toggle--with-accessible-labels` | `defaultToggled`, `disabled`, `hideLabel`, `readOnly`, `toggled` | 32 | 32 | 0 | 0 | 37 | 0 |

## Fonts

Designers need these fonts installed before importing into Figma.

| Family | Weight | Italic | Source in browser | Text layers |
|---|---:|---|---|---:|
| IBM Plex Sans | 400 | no | web font | 272 |

## Notes

- Layout is absolute (every layer keeps its exact position). Auto-layout comes in a later phase.
- Hover / focus / pressed states and design tokens (Figma variables) are not captured yet.
- `previews/` has one PNG per variant: the reference picture to compare the Figma result against.
