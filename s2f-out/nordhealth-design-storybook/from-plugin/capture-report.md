# s2f capture report

- **Project:** nordhealth-design-storybook
- **Storybook:** https://nordhealth.design/storybook
- **Captured:** 2026-10-15T14:59:50.028Z in 34.0 s
- **Browser:** chromium 155.0.8059.80 (Playwright Chromium not installed, used installed Google Chrome)
- **Modes:** Nord (global `theme`)
- **Output:** `s2f-out/nordhealth-design-storybook/from-plugin/model.json` (schema v1.0.0)

## Summary

All good: **8 components**, **256 variants** captured, file is valid.

| Component | Story | Varied props | Variants | Matrix | Left out (cap) | Failed | Layers / variant | Warnings |
|---|---|---|---:|---:|---:|---:|---:|---:|
| Accordion/Basic | `components-accordion--basic` | `multiple`, `disabled`, `orientation`, `loopFocus`, `justifyContent` | 32 | 32 | 0 | 0 | 15 | 0 |
| Accordion/Custom Gap | `components-accordion--custom-gap` | `multiple`, `disabled`, `orientation`, `loopFocus`, `justifyContent` | 32 | 32 | 0 | 0 | 11 | 0 |
| Accordion/Custom Icon | `components-accordion--custom-icon` | `multiple`, `disabled`, `orientation`, `loopFocus`, `justifyContent` | 32 | 32 | 0 | 0 | 11 | 0 |
| Accordion/Disabled | `components-accordion--disabled` | `multiple`, `disabled`, `orientation`, `loopFocus`, `justifyContent` | 32 | 32 | 0 | 0 | 11 | 0 |
| Accordion/Multiple | `components-accordion--multiple` | `multiple`, `disabled`, `orientation`, `loopFocus`, `justifyContent` | 32 | 32 | 0 | 0 | 15 | 0 |
| Accordion/Overview | `components-accordion--overview` | `multiple`, `disabled`, `orientation`, `loopFocus`, `justifyContent` | 32 | 32 | 0 | 0 | 11 | 0 |
| Accordion/Playground | `components-accordion--playground` | `multiple`, `disabled`, `orientation`, `loopFocus`, `justifyContent` | 32 | 32 | 0 | 0 | 15 | 0 |
| Accordion/Start | `components-accordion--start` | `multiple`, `disabled`, `orientation`, `loopFocus`, `justifyContent` | 32 | 32 | 0 | 0 | 11 | 0 |

## Fonts

Designers need these fonts installed before importing into Figma.

| Family | Weight | Italic | Source in browser | Text layers |
|---|---:|---|---|---:|
| Nordhealth Sans | 400 | no | web font | 256 |
| Nordhealth Sans | 500 | no | web font | 608 |

## Design tokens (Figma variables)

**116 tokens** (62 colors, 54 numbers, 20 pointing to other tokens) in 1 mode(s): Nord.

Layers linked to tokens: 1216 colors, 2432 sizes (radius, border width, font size, spacing, icon color).

Groups: `n` 116.

## Notes

- Layout is absolute (every layer keeps its exact position). Auto-layout comes in a later phase.
- Hover / focus / pressed states are not captured yet.
- A layer is linked to a token only when the token gives exactly the value the browser drew; anything else keeps its plain value.
- `previews/` has one PNG per variant: the reference picture to compare the Figma result against.
