# Plan: Connect UI text to existing hydra font styles

## Meta
- **Date:** 2026-09-17
- **Request type:** ui-change / ds-parity (typography usage only)
- **User request summary:** Every product UI string must use an already defined hydra text style. No `<strong>` / antd `strong` (or equivalent ad-hoc weight). Do not invent new styles; pick the closest existing role.
- **Status:** implementing
- **Plan file:** Documents/plans/2026-09-17-hydra-text-style-strong-cleanup-plan.md

## Closest-role mapping (no new styles)

| Current pattern | Closest existing role |
|---|---|
| `<strong>` or `Typography.Text strong` at default 14px | `hydraBaseStrong` |
| `strong` + `fontSize` / `fontSizeLG` (emphasized 16px) | `hydraSubtitleLarge` |
| `strong` + `hydraLargeStrong` (16px trying to be heavy) | `hydraSubtitleLarge` |
| `strong` + `fontSizeSM` / `hydraSmallStrong` | `hydraSmallStrong` |
| `strong` + already `hydraBaseStrong` | drop `strong`, keep style |
| `strong` + `hydraBaseNormal` | `hydraBaseStrong` |
| `strong={cond}` | `cond ? hydraBaseStrong : hydraBaseNormal` |
| Document body bold / italic / underline | `hydraBaseStrong` / `hydraBaseItalic` / `hydraBaseUnderline` (one role; bold wins) |
| Table header `fontWeightStrong` | `hydraBaseStrong` |
| Spec editor `strong={formatting.bold}` | same body roles, not antd `strong` |

## Out of scope
- Documentation HTML, seed data using the word “strong”, Button `fontWeight` (antd Button tokens)
- New typography roles or token files
