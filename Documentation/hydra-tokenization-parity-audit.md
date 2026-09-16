# Hydra DS Tokenization Parity Audit

Date: 2026-04-07 · Revised 2026-09-16 (RSFC brand pass — see section 6)  
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
    - `Primary/primary-6`: Figma Light `#2576BB`, Dark `#2267A2` == repo arrays (reseeded 2026-09-16, see section 6).
  - Figma `Colors/Daybreak Blue/blue-1..10` Light/Dark match `daybreakBluePrimitiveLight` / `daybreakBluePrimitiveDark` (**Info only**).
  - Example:
    - `Daybreak Blue/blue-6`: Figma Light `#1677FF`, Dark `#1668DC` == repo arrays.
- **Semantic alias parity: MATCH**
  - Figma `Customize Theme/Color/Primary/*` aliases → `Primary/primary-*` (same steps as `bluePrimarySemantics` in `hydraAntdTheme.token` — top bar / links / ghost primary).
  - Verified mappings:
    - `colorPrimaryBG -> Primary/primary-1`
    - `colorPrimaryHover -> Primary/primary-5` (repo also step 5 — the earlier step 4 / step 5 drift is closed)
    - `colorPrimary -> Primary/primary-6`
    - `colorPrimaryActive -> Primary/primary-7`
    - `colorPrimaryTextHover -> Primary/primary-7`
    - `colorLinkHover -> Primary/primary-7`
    - `colorLinkActive -> Primary/primary-8`
    - `colorPrimaryTextActive -> Primary/primary-8`
    - `colorPrimaryBgSubtle -> Primary/primary-bg-subtle`
    - `colorPrimaryBorderSubtle -> Primary/primary-1`

## A2. Info / Alert (Daybreak via `colorInfo*` in code)

- **Figma Customize Theme:** `Color/Info/*` aliases remain on **`Primary/primary-*`** (original tokenization).
- **Figma Alert component (info variants):** fill / border / icon bind directly to **`Daybreak Blue/blue-*`** primitives (`blue-1`, `blue-3`, `blue-6`).
- **Repo:** `blueInfoSemantics` maps **`colorInfo*`** → `daybreakBluePrimitive*` in `antdTheme` (Alert `type="info"` only).
- Verified repo mappings:
  - `colorInfoBg -> Daybreak Blue/blue-1`
  - `colorInfoBorder -> Daybreak Blue/blue-3`
  - `colorInfoHover / colorInfoTextHover -> Daybreak Blue/blue-5`
  - `colorInfo / colorInfoText -> Daybreak Blue/blue-6`
  - `colorInfoActive / colorInfoTextActive -> Daybreak Blue/blue-7`

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

## 6) RSFC brand pass — 2026-09-16

Applied to Figma (`3ghYBXR6XVUEaeBo3D5E4q`, Desktop Bridge) and the repo mirrors in the same pass.

### Legacy mode

The `Colors` collection gained a third mode, **`Legacy (pre-RSFC)`** (`1384:0`), holding a snapshot of all 153 variables as they were in `Light` before this pass. Switch the collection to that mode to see the pre-rebrand system. Every variable changed here carries a `description` recording its old and new hex.

### Primary ramp reseeded

Steps 1–6 come from `generate('#2576BB')` (brand Light Blue). Steps 7–10 are pinned to the brand Navy end so all `Color/Sidebar/*` aliases keep resolving to Navy — plain reseeding would have moved Navy off step 7.

| Step | Light before | Light after | Dark before | Dark after |
|---|---|---|---|---|
| `primary-1` | `#B8EAFF` | `#EBF5FA` | `#111A1E` | `#131A22` |
| `primary-2` | `#8BCCD9` | `#C7E1ED` | `#0F242F` | `#152434` |
| `primary-3` | `#62B7CC` | `#99C6E0` | `#0E3140` | `#193146` |
| `primary-4` | `#00B9F0` | `#6EABD4` | `#0B3F55` | `#1C405F` |
| `primary-5` | `#1D8BB3` | `#4890C7` | `#075272` | `#1F5481` |
| `primary-6` | `#0073A5` | `#2576BB` | `#03658F` | `#2267A2` |
| `primary-7` | `#004173` | unchanged (pinned) | `#1C7FA3` | `#4384B5` |
| `primary-8` | `#00365F` | unchanged | `#3B9AB6` | `#6AA3CA` |
| `primary-9` | `#002A4A` | unchanged (see below) | `#60B2C6` | `#95C1DA` |
| `primary-10` | `#001D35` | unchanged | `#89C8D5` | `#C3DDE9` |
| `primary-bg-subtle` | `#E6F4F8` | `#F6FAFC` | `#0F242F` | `#152434` |

The dark ramp inverts by antd convention, so Navy is not pinned there.

### Why the text and link tokens moved

`#00B9F0` measured **2.28:1** on white while driving `colorLinkHover` and `colorPrimaryTextHover`, so link hover failed WCAG AA. Fills still lighten on hover (antd convention), but text and links now darken into the Navy end:

- `colorPrimary` / `colorLink` — `#2576BB`, 4.79:1
- `colorPrimaryTextHover` / `colorLinkHover` — `#004173`, 10.48:1
- `colorPrimaryTextActive` / `colorLinkActive` — `#00365F`, 12.40:1

### Left unchanged on purpose

- **Volcano ramp and `Color/ButtonPrimary/*`** — `volcano-6` is already the brand Orange `#F05A23`.
- **Status ramps and `colorError` / `colorWarning` / `colorSuccess`** — the brand sheet scopes `#EB1E23`, `#FFCD05`, `#FA961E` to graphs and illustrations, "never used alone". They are data-viz accents, not UI state colors.
- **Neutral ramp** — brand Gray `#A7A9AC` has no UI role; it falls between `gray-6` and `gray-7`.
- **Near-black `#231F20`** — `gray-12` stays `#141414`.
- **Typography** — already on Barlow / Barlow Condensed / Courier Prime; this brand sheet is colors only.

### Open items

- `primary-9` was left at `#002A4A`. The brand guide prints Shade `#002A49` next to RGB 0/65/115, which is Navy, so the guide contradicts itself. One unit of blue; needs client confirmation.
- `Color/Info/*` still aliases `Primary/primary-*`, so `colorInfo` resolves to the same hex as `colorPrimary` while the repo maps `colorInfo*` to Daybreak Blue (section A2). Pre-existing, not caused by this pass, but worth closing.
- `primary-bg-subtle` is now close to `primary-1`; review for retirement.
- Brand Gray scope, the Tint 1 / Tint 2 levels (55% / 15%), and a possible `Chart/*` group for the accents are all still undecided.
