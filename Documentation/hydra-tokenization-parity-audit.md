# Hydra DS Tokenization Parity Audit

Date: 2026-04-07  
Figma source: `Hydra Ant Design - DS` (`3ghYBXR6XVUEaeBo3D5E4q`)  
Node context requested: `204:47936` (file-level token audit executed via Figma MCP Console)

## 1) How DS tokenization is organized

### Figma side (source model)

- **Collection: `Colors`**  
  - Primitive ramps and neutrals (including `Primary/primary-*`, `Volcano/volcano-*`, `Neutral/gray-*`).  
  - Two modes: `Light` (`5:0`) and `Dark` (`5:4`).
- **Collection: `Customize Theme`**  
  - Semantic and component-facing aliases (`Color/Primary/*`, `Color/ButtonPrimary/*`, `Color/Sidebar/*`, sizing/style vars).  
  - One mode in this file: `Mode 1` (`11:1`).
- **Collection: `Typography`**  
  - Font family, sizes, heading sizes, line heights, and weights.  
  - Two modes: `Default` (`772:0`) and `Compact` (`772:1`).

### Repository side (mirror model)

- **Primitive ramps**
  - Blue primary: `src/theme/primaryPrimitiveBlue.ts`
  - Orange volcano: `src/theme/primaryPrimitiveOrange.ts`
- **Semantic mapping + component palettes**
  - Primary semantics: `bluePrimarySemantics` in `src/theme/primaryPrimitiveBlue.ts`
  - Button primary palette: `src/theme/buttonPrimaryPalette.ts`
  - Sidebar semantics: `src/theme/sidebarSemantics.ts`
- **Theme binding layer**
  - Global and component tokens: `src/theme/antdTheme.ts`
  - Typography bridge into antd token system: `src/theme/hydraAntdTypography.ts`
- **Runtime bridge**
  - CSS vars for ghost primary and font family: `src/theme/brandColors.ts`
  - Applied in `src/main.tsx` and consumed in `src/index.css`

## 2) Parity check (Figma vs repo)

## A. Blue primary primitives and semantics

- **Primitive parity: MATCH**
  - Figma `Colors/Primary/primary-1..10` Light/Dark values match `bluePrimaryPrimitiveLight` and `bluePrimaryPrimitiveDark`.
  - Example:
    - `Primary/primary-6`: Figma Light `#0073A5`, Dark `#03658F` == repo arrays.
- **Semantic alias parity: MATCH**
  - Figma `Customize Theme/Color/Primary/*` aliases map to the same steps as `bluePrimarySemantics` and are wired in `hydraAntdTheme.token`.
  - Verified mappings:
    - `colorPrimaryBG -> primary-1`
    - `colorPrimary -> primary-6`
    - `colorPrimaryActive -> primary-7`
    - `colorPrimaryTextHover -> primary-4`
    - `colorLinkHover -> primary-4`
    - `colorLinkActive -> primary-7`

## B. Orange button-primary (Volcano) semantics

- **Primitive parity: MATCH**
  - Figma `Colors/Volcano/volcano-1..10` Light/Dark match `volcanoPrimitiveLight` and `volcanoPrimitiveDark`.
  - Example:
    - `Volcano/volcano-6`: Figma Light `#F05A23`, Dark `#CF5021` == repo arrays.
- **Button semantic parity: MATCH**
  - Figma `Customize Theme/Color/ButtonPrimary/*` aliases match `buttonPrimaryPalette` mapping and `antdTheme.components.Button`.
  - Verified mappings:
    - `colorPrimary -> volcano-6`
    - `colorPrimaryHover -> volcano-5`
    - `colorPrimaryActive -> volcano-8`
    - `colorPrimaryBG -> volcano-1`
    - `colorPrimaryBGHover -> volcano-2`
    - `colorPrimaryBorder -> volcano-3`
    - `colorPrimaryBorderHover -> volcano-4`

## C. Sidebar semantics

- **Alias parity: MATCH**
  - Figma `Customize Theme/Color/Sidebar/*` aliases:
    - `colorSidebar -> Primary/primary-7`
    - `colorSidebarHeader -> Neutral/gray-12`
    - `colorSidebarItemSelectedBg -> Primary/primary-1`
    - `colorSidebarItemSelectedText -> Primary/primary-8`
    - `colorSidebarSubmenuBg -> Primary/primary-10`
  - Repo `sidebarSemanticsLight` uses the same mapping in `src/theme/sidebarSemantics.ts`.

## D. Typography tokenization

- **Default mode parity: MATCH**
  - Figma `Typography` `Default` values align with repo definitions in `src/theme/hydraTypography.ts`, then mapped through `src/theme/hydraAntdTypography.ts`.
  - Verified:
    - `fontFamily = Cairo`
    - Base size/line-height `14/22`
    - Heading scales (`38/46`, `30/38`, `24/32`, `20/28`, `16/24`)
    - Weights `400` and `600`

## 3) Flagged gaps

## Gap 1: Typography compact mode not mirrored in runtime theme switching

- **Figma evidence:** `Typography` collection has `Default` and `Compact` modes.
- **Repo evidence:** `src/theme/hydraTypography.ts` and `src/theme/hydraAntdTypography.ts` expose one active token map; no compact mode selector path in theme runtime.
- **Impact:** Compact typography cannot be toggled from code with 1:1 Figma mode parity.
- **Suggested action:** Add optional density/typography mode switch and a compact token map binding.

## Gap 2: Button shadow model differs in representation depth

- **Figma evidence:** `Color/ButtonPrimary/primaryShadow` exists as color token (`#F05A231A`) in `Customize Theme`.
- **Repo evidence:** `src/theme/buttonPrimaryPalette.ts` defines full CSS shadow string (`buttonPrimaryShadow`) and a separate dark variant (`buttonPrimaryShadowDark`) used in `src/theme/antdTheme.ts`.
- **Impact:** Figma captures shadow color token, but not full shadow recipe/multi-mode behavior equivalent to repo implementation.
- **Suggested action:** Decide canonical representation:
  - either keep code-side full shadow as intentional extension, or
  - add documented Figma convention for shadow blur/offset + dark variant.

## Gap 3: `controlOutline` appears code-only

- **Figma evidence:** No `Color/ButtonPrimary/controlOutline` variable found in fetched sets.
- **Repo evidence:** `buttonPrimaryControlOutline` (`src/theme/buttonPrimaryPalette.ts`) wired to `components.Button.controlOutline` in `src/theme/antdTheme.ts`.
- **Impact:** Focus outline token behavior has no explicit Figma variable parity artifact.
- **Suggested action:** Add corresponding Figma variable path (or document as intentional code-only a11y token).

## Gap 4: Sidebar dark chrome RGBA tokens are repo-local literals

- **Figma evidence:** Sidebar semantic aliases are present (`Color/Sidebar/*`), but no direct variable evidence found for:
  - `rgba(255,255,255,0.65)` item text
  - `rgba(255,255,255,0.08)` hover background
- **Repo evidence:** `hydraMenuDarkChrome` in `src/theme/hydraSemanticColors.ts`.
- **Impact:** Potential traceability gap for neutral menu-chrome states.
- **Suggested action:** Either promote these to explicit Figma variables or keep as documented repo-side semantic exceptions.

## Gap 5: Documentation baseline missing in current branch

- **Repo evidence:** Prior Hydra token parity docs referenced by workspace rules are currently absent in this branch.
- **Impact:** Knowledge centralization and audit traceability are reduced.
- **Suggested action:** Restore canonical docs or treat this file as interim canonical parity audit.

## 4) Current status summary

- **Tokenization organization:** clear and layered on both Figma and repo sides.
- **Core parity (Primary, Volcano/ButtonPrimary, Sidebar, Typography Default):** strong match.
- **Main gaps:** mode-depth parity (Typography compact), shadow/control-outline representation parity, and documentation continuity.

## 5) Strict 1:1 closure checklist

To reach strict 1:1 parity (design tokens + implementation behavior), complete all items:

1. Add Figma variable for Button focus outline (or approve permanent code-only exception) and map it to `components.Button.controlOutline`.
2. Define full shadow parity contract for Button primary:
   - Figma token(s) for shadow recipe (not color only), or
   - explicit rule that shadow geometry remains code-owned while color is tokenized.
3. Implement runtime typography mode switching path (`Default`/`Compact`) end-to-end in app settings/state and pass mode to `createHydraAntdTheme(...)`.
4. Decide if sidebar dark chrome RGBA values become Figma variables; if not, keep them as documented approved exception.
5. Restore or consolidate missing Hydra parity docs so this audit is linked from canonical documentation entry points.
