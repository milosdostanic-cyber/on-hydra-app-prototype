# Hydra elevation (shadow) parity audit — Phase 1

**Date:** 2026-04-14  
**Rule:** Design System Parity Auditor ([`.cursor/rules/ds-parity-auditor.mdc`](../.cursor/rules/ds-parity-auditor.mdc))  
**Figma DS:** [Hydra Ant Design — DS](https://www.figma.com/design/3ghYBXR6XVUEaeBo3D5E4q/Hydra-Ant-Design---DS?node-id=204-47936) (`3ghYBXR6XVUEaeBo3D5E4q`)  
**Effect styles:** Figma REST `GET /v1/files/{key}/nodes?ids=132:687,132:688,132:689` (style swatches `boxShadow`, `boxShadowSecondary`, `boxShadowTertiary`)

**Repo canonical map:** `theme.getDesignToken` via [`src/theme/hydraAlias.ts`](../src/theme/hydraAlias.ts) (`hydraLightAlias`, `hydraDarkAlias`)

### Resolution (DS → repo)

**ELV-001 addressed:** `boxShadowSecondary` is defined as `hydraBoxShadowSecondary` in [`src/theme/hydraSemanticColors.ts`](../src/theme/hydraSemanticColors.ts), wired into [`src/theme/antdTheme.ts`](../src/theme/antdTheme.ts) (`token.boxShadowSecondary`) and into `hydraLightAlias` / `hydraDarkAlias` seed tokens in [`src/theme/hydraAlias.ts`](../src/theme/hydraAlias.ts). Sidebar and `ExportCard` hover use the secondary stack, not the Ant Design default duplicate of `boxShadow`.

---

## 1. Audit Summary

Global elevation is **aligned** with the Hydra DS Effect Styles for **`boxShadow`**, **`boxShadowSecondary`**, and **`boxShadowTertiary`** when expressed as CSS `box-shadow` stacks. **`boxShadowSecondary`** was previously identical to **`boxShadow`** (Ant Design `getDesignToken` default); it is now set from **`hydraBoxShadowSecondary`** in [`hydraSemanticColors.ts`](../src/theme/hydraSemanticColors.ts) (see **Resolution** above).

**`boxShadowTertiary`** is present on the resolved token object but **has no direct usage** in application TSX (grep); Ant Design components may still consume it internally.

**Component-level orange primary button shadow** is defined as explicit literals in [`src/theme/buttonPrimaryPalette.ts`](../src/theme/buttonPrimaryPalette.ts) and is **out of scope** for the three global Effect Styles, but is noted under Ant Design alignment.

Light and dark `hydra*` aliases currently expose **identical** `boxShadow` / `boxShadowSecondary` / `boxShadowTertiary` strings; Figma Effect Styles are single definitions (no separate dark effect variants were audited on the style nodes).

---

## 2. Findings by Category

### Token Coverage

| Token (Ant Design global) | Figma Effect Style | Repo (`hydraLightAlias` / `hydraDarkAlias`) |
|---------------------------|--------------------|---------------------------------------------|
| `boxShadow` | Yes (`132:687`) | Yes — **matches Figma** |
| `boxShadowSecondary` | Yes (`132:688`) | Yes — **matches** (`hydraBoxShadowSecondary`) |
| `boxShadowTertiary` | Yes (`132:689`) | Resolved value **matches Figma** — **no app-level TSX usage** |

### Token Architecture Match

- Naming: DS Effect Style names map 1:1 to Ant Design global token names. **Match.**
- Repo does **not** mirror shadow stacks in a dedicated `src/theme/*` module; shadows come from the **Ant Design algorithm** via `getDesignToken`. **Architecture:** DS treats shadows as published Effect Styles; repo treats them as **derived** antd tokens unless overridden.

### Alias / Reference Integrity

- No Figma variable alias chain was evaluated for shadows (Effect Styles, not variables). N/A for this slice.

### Theme / Mode Parity

- **Light vs dark:** Resolved shadow strings are **identical** for `hydraLightAlias` and `hydraDarkAlias` in this audit run. If product intent is different elevation in dark mode, neither DS Effect Styles (as fetched) nor repo overrides document that split.

### Raw Value Violations (elevation-only)

- **`boxShadow: 'none'`** in [`src/shell/AppShell.tsx`](../src/shell/AppShell.tsx) and [`src/bom/pages/BomLandingPage.tsx`](../src/bom/pages/BomLandingPage.tsx): structural suppression of shadow (layout/chrome), not a substitute for a missing token. **Low severity** — document as intentional override unless DS forbids flat regions.

### Repo usage inventory (`boxShadow` / `boxShadowSecondary`)

| File | Usage |
|------|--------|
| [`src/shell/AppShell.tsx`](../src/shell/AppShell.tsx) | `token.boxShadow`; `'none'` on nested shell |
| [`src/shell/AppShellSidebar.tsx`](../src/shell/AppShellSidebar.tsx) | `token.boxShadowSecondary` |
| [`src/ui/ExportCard.tsx`](../src/ui/ExportCard.tsx) | rest/active: `token.boxShadow`; hover: `token.boxShadowSecondary` |
| [`src/bom/pages/BomAscProductsPage.tsx`](../src/bom/pages/BomAscProductsPage.tsx) | `token.boxShadow` |
| [`src/bom/pages/BomWorkspacePage.tsx`](../src/bom/pages/BomWorkspacePage.tsx) | `token.boxShadow` (two places) |
| [`src/bom/pages/BomLandingPage.tsx`](../src/bom/pages/BomLandingPage.tsx) | `'none'` then `token.boxShadow` |

**`boxShadowTertiary`:** no matches under `src/` (application code).

### Component-level (Button `primaryShadow`)

- [`src/theme/buttonPrimaryPalette.ts`](../src/theme/buttonPrimaryPalette.ts): `buttonPrimaryShadow`, `buttonPrimaryShadowDark` — literals wired in [`src/theme/antdTheme.ts`](../src/theme/antdTheme.ts). Parity with Figma `Customize Theme` / Button path is **not** part of the three Effect Styles; track under a separate Button audit if needed.

---

## 3. Critical Inconsistencies

### ~~Mismatch ID: ELV-001~~ (resolved)

Previously: `boxShadowSecondary` matched Ant default (duplicate of `boxShadow`) instead of the design effect at node `132:688`. **Fixed** by `hydraBoxShadowSecondary` in theme + alias seeds (see Resolution).

---

### Mismatch ID: ELV-002

**Category:** Token consumption / coverage

**Severity:** **Low**

**Design System:** Effect style `boxShadowTertiary` exists.

**CL/Repo:** No direct `token.boxShadowTertiary` usage in `src/**/*.tsx`; value still resolves and **matches** Figma.

**Problem:** Unused in hand-written UI; may still be used by antd internals.

**Impact:** Low unless designers expect tertiary elevation on specific components.

**Ant Design logic violated?** **No**

**Can fix without changing visible UI?** **N/A** — optional adoption only.

---

## 4. Ant Design Alignment Notes

- **`boxShadow` / `boxShadowTertiary`:** Ant Design `theme.getDesignToken` defaults **match** the Hydra DS Effect Styles for this file/version.
- **`boxShadowSecondary`:** Ant Design default did not match the Hydra design system effect; **Hydra overrides** via `hydraBoxShadowSecondary` so resolved values match that stack.
- **Button `primaryShadow`:** Valid `components.Button` token; separate from global Effect Styles; keep documented in [`buttonPrimaryCustomizeTheme.ts`](../src/theme/buttonPrimaryCustomizeTheme.ts) parity path.

---

## 5. Recommended Sync Direction

**ELV-001:** **Pull DS → repo** — completed for `boxShadowSecondary`.

---

## 6. Questions / Decisions Needed

1. **Dark mode:** Should the design system add **separate** effect styles for dark elevation? If yes, add mode-specific exports in `hydraSemanticColors.ts` (or sibling mirror) and wire `hydraDarkAlias` / `createHydraAntdThemeDark` accordingly.
2. **`boxShadowTertiary`:** Optionally adopt in specific surfaces if design wants subtler elevation than secondary.

---

## 7. Proposed Next Phase

- Visual QA: sidebar edge + `ExportCard` hover in light and dark.  
- If dark-specific shadows are defined, mirror them in the same semantic / theme layer (`hydraSemanticColors.ts` + theme seeds).  
- Run **`npm run build`** after theme edits; fix any unrelated TS errors blocking CI (e.g. `BomLandingPage` `Select` styles) separately.

---

## Parity score (elevation slice — updated)

| Category | Score (1–5, 5 = full parity) | Notes |
|----------|----------------------------|--------|
| `boxShadow` vs DS | 5 | Exact match |
| `boxShadowSecondary` vs DS | 5 | Mirrored via `hydraBoxShadowSecondary` |
| `boxShadowTertiary` vs DS | 4 | Value match; no app TSX usage |
| Dark / light elevation | 3 | Same secondary stack both modes until DS splits |
| Button `primaryShadow` | Not scored | Separate from global Effect Styles |
