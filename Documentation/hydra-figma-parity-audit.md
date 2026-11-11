# Hydra Figma DS ↔ repo parity audit

**Run:** 2026-11-05 · **Tool:** Figma Console MCP (Desktop Bridge) · **Mode:** audit + Light pull applied (see §5)
**DS file:** [Hydra Ant Design - DS](https://www.figma.com/design/3ghYBXR6XVUEaeBo3D5E4q/Hydra-Ant-Design---DS) (`3ghYBXR6XVUEaeBo3D5E4q`)
**Repo baseline:** `theme.getDesignToken(hydraAntdTheme)` / `theme.getDesignToken(hydraAntdThemeDark)` (antd 6.3.x), compared programmatically against every resolved Figma **Customize Theme** variable (alias chains + alias-with-opacity resolved to final colors).
**Agreed sync direction:** Figma DS → repo (pull). Each finding below still needs a decision before code changes.

## 1. Audit summary

| Area | Result |
|---|---|
| Spacing, size, padding, margin, control height, radius, screen breakpoints, lineWidth | **Match** (all values) |
| Light neutrals (text, fill, border, background except mask) | **Match** |
| Light primary ramp steps 1–7 + `colorPrimaryBgSubtle` / `colorPrimaryBorderSubtle` | **Match** |
| Elevation (`boxShadow`, `boxShadowSecondary`, `boxShadowTertiary`), Button primary/default shadow (Light) | **Match** |
| Typography Default mode (sizes, line heights, weights per style) | **Match** (naming drift only) |
| Light status palettes (Success / Warning / Error / Info text) | **Mismatch** — repo uses antd defaults |
| Primitive ramps steps 8–10 (Primary, Daybreak, Hydra orange) | **Mismatch** |
| Dark mode | **Structural divergence** |
| Figma DS structure vs repo docs/rules | **Divergence** — DS was restructured; repo docs describe the old structure |
| Hydra molecules (OptionCard, FeatureCard, RecommendationCard, Stat Tile, Empty State Block) | **Missing in CL** |

Token compare: **194 token×mode pairs match**, ~100 differ (≈ 25 Light, ≈ 75 Dark).

## 2. Figma DS structure (current)

| Collection | Modes | Count | Notes |
|---|---|---|---|
| `Colors` | `Value` (single) | 197 | **No Light / Dark / Legacy modes any more.** Ramps: Primary (`primary-0`…`10`), Neutral (`gray-1`…`13`), Dust Red, **Hydra Action Orange** (`hydra-1`…`10`), Sunset Orange, Calendula Gold, Sunrise Yellow, Lime, Polar Green, Cyan, Daybreak Blue, Geek Blue, Golden Purple, Magenta, **Volcano (stock antd)**, Opacity (black + white), Scale (numbers). |
| `Customize Theme` | `Light`, `Dark` | 218 | Dark is expressed by re-aliasing steps + alias-with-opacity — not by a separate dark ramp. New groups: `Color/Action/*` (replaces `Color/ButtonPrimary/*`), `Color/Preset/*`, `Color/Effects/*`, `Color/Control/controlOutline`. |
| `Typography` | `Default`, `Compact` | 24 | `fontFamily` Barlow, `fontFamilyCode` **Roboto Mono**. |

Text styles: 29 (all bound to Typography variables). Effect styles: 6. Paint styles: 0.

Preset ramps steps **8–10** (Dust Red, Gold, Daybreak Blue, Hydra Action Orange, etc.) hold the **antd dark-palette** values (e.g. `red-8 #58181C`, `blue-8 #15325B`), not stock light steps 8–10. Dark semantics alias them for Bg/Border; some Light **text-active** tokens also alias them.

## 3. Findings

Severity: **C** critical · **H** high · **M** medium · **L** low. "UI change" = whether pulling Figma changes the rendered app.

### 3.1 Primitives

| ID | Severity | Figma | Repo | UI change |
|---|---|---|---|---|
| P-01 | H | `primary-8/9/10` = `#0C3559` / `#0C2B47` / `#0A2238` | `bluePrimaryPrimitiveLight[7..9]` = `#00365F` / `#002A4A` / `#001D35` | Yes — link active, primary text active, sidebar selected text + submenu bg |
| P-02 | L | `primary-0 #F6FAFC` is a ramp step | `bluePrimaryBgSubtleLight` literal (same hex) | No — naming only |
| P-03 | M | `Daybreak Blue/blue-8/9/10` = `#15325B` / `#112545` / `#111A2C` (dark steps) | `daybreakBluePrimitiveLight[7..9]` = stock `#003EB3` / `#002C8C` / `#001D66` | Yes — `colorInfoTextActive` |
| P-04 | H | Hydra orange lives in **`Hydra Action Orange/hydra-*`**; `Volcano/volcano-*` is stock antd (`#FA541C`) | `volcanoPrimitiveLight` holds the Hydra orange under the Volcano name | Naming — repo name now collides with a different Figma ramp |
| P-05 | M | `hydra-9/10` = `#411F14` / `#291712` | `volcanoPrimitiveLight[8..9]` = `#9E3010` / `#6B200B` | Yes — Button `colorPrimaryTextActive` |
| P-06 | H | `Colors` has one mode; no dark ramps | `bluePrimaryPrimitiveDark`, `daybreakBluePrimitiveDark`, `volcanoPrimitiveDark` (generated) | See D-01 |

### 3.2 Light semantics

| ID | Severity | Token(s) | Figma (Light) | Repo (Light) |
|---|---|---|---|---|
| L-01 | H | `colorSuccess` / `Hover` / `Active` | green-7 `#389E0D` / green-6 `#52C41A` / green-8 `#237804` | antd default `#52C41A` / `#95DE64` / `#389E0D` |
| L-02 | H | `colorSuccessText` / `TextHover` / `TextActive` | `#237804` / `#52C41A` / `#1D3712` | `#52C41A` / `#73D13D` / `#389E0D` |
| L-03 | H | `colorError*` (whole set) | built on Dust Red `red-6 #F5222D`: Bg Hover `#FFCCC7`, Border `#FFA39E`, BorderHover `#FF7875`, Hover `#FF4D4F`, Active `#CF1322`, Text `#CF1322`, TextHover `#FF7875`, TextActive `#58181C` | antd default seed `#FF4D4F` (`colorError #FF4D4F`, Text `#FF4D4F`, Active `#D9363E`, …) |
| L-04 | M | `colorHighlight` | → `colorError` `#F5222D` | `#FF4D4F` |
| L-05 | H | `colorWarningHover` / `Text` / `TextActive` | `#FFC53D` / `#594214` / `#443111` | `#FFD666` / `#FAAD14` / `#D48806` |
| L-06 | M | `colorInfoText` / `TextActive` | blue-7 `#0958D9` / blue-8 `#15325B` | `#1677FF` / `#0958D9` (`infoSemanticsFromRamp` uses step 6 / 7) |
| L-07 | M | `colorPrimaryTextActive`, `colorLinkActive` | `#0C3559` | `#00365F` (P-01) |
| L-08 | M | `colorBgMask` | `opacity-65` → `rgba(0,0,0,0.65)` | antd default `rgba(0,0,0,0.45)` |
| L-09 | M | `controlOutline` | `colorPrimaryBorder` → solid `#99C6E0` | antd derived `rgba(5,130,192,0.08)` |
| L-10 | M | `colorErrorOutline` / `colorWarningOutline` | → `colorErrorBg` `#FFF1F0` / `colorWarningBg` `#FFFBE6` (solid) | antd derived alpha |
| L-11 | M | `lineWidthFocus` | 4 | 3 |
| L-12 | L | `colorSplit` | `rgba(0,0,0,0.06)` | `rgba(5,5,5,0.06)` (antd derivation) — not visible |

Ant Design note: antd derives `colorSuccess*` / `colorError*` / `colorWarning*` / `colorInfo*` via `generate(seed)` with fixed step indices. Figma intentionally shifts text steps darker (WCAG contrast on light Bg). Pulling Figma means **explicit token overrides** in `antdTheme.ts` (same pattern already used for `colorInfo*`), not a seed change — a seed change cannot reproduce the shifted indices.

### 3.3 Button (Action) and danger

| ID | Severity | Token | Figma | Repo |
|---|---|---|---|---|
| B-01 | M | Button `colorPrimaryText` | `colorActionText` → hydra-8 `#C93E14` | volcano-6 `#F05A23` |
| B-02 | M | Button `colorPrimaryTextActive` | `colorActionTextActive` → hydra-9 `#411F14` | volcano-8 `#C93E14` |
| B-03 | L | Button `controlOutline` | no Action outline variable; global `controlOutline` = primary-3 | `buttonPrimaryControlOutline` orange `rgba(240,90,35,0.12)` (code-only, documented gap) |
| B-04 | L | Button `dangerShadow` | `dangerShadowColor` → red-6 @ 6% = `rgba(245,34,45,0.06)` | `rgba(255,38,5,0.06)` |
| B-05 | L | Figma group rename | `Color/ButtonPrimary/*` no longer exists → `Color/Action/*` | `buttonPrimaryCustomizeTheme.ts`, docs, rules reference `Color/ButtonPrimary/*` |

Light rest / hover / active / bg / border / shadow: **match**.

### 3.4 Sidebar

| ID | Severity | Token | Figma Light | Repo Light |
|---|---|---|---|---|
| S-01 | H | `colorSidebarItemSelectedBg` | **Daybreak** `blue-2 #BAE0FF` | `primary-1 #EBF5FA` |
| S-02 | M | `colorSidebarItemSelectedText` | primary-8 `#0C3559` | `#00365F` (P-01) |
| S-03 | M | `colorSidebarSubmenuBg` | primary-10 `#0A2238` | `#001D35` (P-01) |
| S-04 | L | `colorSidebarMenuItemText` / `HoverBg` | white-88 / gray-1 @ 8% — variables now exist | literals in `hydraMenuDarkChrome` (values match) |

S-01 conflicts with the repo rule that sidebar semantics alias only `Primary/*` / `Neutral/gray-12`. Confirm with design whether `blue-2` is intended.

### 3.5 Dark mode (D-01, critical divergence)

Figma Dark = **navy surfaces + same brand hues**: `colorBgContainer` primary-8 `#0C3559`, `colorBgElevated` primary-7 `#004173`, `colorBgLayout` / `colorBgBase` primary-10 `#0A2238`, `colorPrimary` stays `#2576BB`, primary Bg/Border = primary-6 at 25 / 35 / 50 % opacity, borders = white at 20 / 12 %, `colorText` white 88 %, status colors keep their Light hue (`colorSuccess #389E0D`, `colorError #F5222D`, `colorInfo #1677FF`), Button Action rest `#F05A23` unchanged, sidebar selected = primary-8 + white text, shadow layers transparent.

Repo Dark = `theme.darkAlgorithm` on neutral gray (`#141414` / `#1F1F1F`) + generated dark ramps for primary / info / orange; antd dark derivation for status colors.

Fixing this is not a token tweak: Dark would move from "algorithm + dark ramps" to "explicit Figma Dark overrides on top of darkAlgorithm" and drop the generated dark ramps. Visible change across every dark screen.

### 3.6 Typography

| ID | Severity | Figma | Repo |
|---|---|---|---|
| T-01 | M | Text styles named `Base/Medium`, `Small/Medium`, `Large/Medium`, `Extra Large/Medium` | `designPath: 'Base/Strong'` etc. (`hydraBaseStrong`, …) — values match (500), names drift |
| T-02 | M | `Base/Semibold` 14/22/600 | missing |
| T-03 | M | `Subtitle/Extra Large` 20/28/500 | missing (`Subtitle/Large` exists) |
| T-04 | M | `Base/Code` Roboto Mono 12/20; `fontFamilyCode` = Roboto Mono | missing; `fontFamilyCode` = Barlow; Roboto Mono not loaded in `index.html` |
| T-05 | M | `fontWeightStrong` variable = 600 | antd `fontWeightStrong` = 500 (`hydraBaseStrong.fontWeight`) — affects Table headers, `Typography.Text strong`, Descriptions labels |
| T-06 | L | Compact `fontSizeSM` 11 / `lineHeightSM` 18 | Compact `fontSizeSM` 10 |

### 3.7 Components / molecules

**Resolved 2026-11-05** — see §5.1. Original finding: DS molecule components with **no CL equivalent**: `OptionCard` (type action/option, layout vertical/horizontal, state default/hover/disabled/selected), `FeatureCard` (default/hover), `RecommendationCard` (Rest/Hover/Resolved), `Stat Tile` (tone neutral/success/warning/error/info), `Empty State Block`. `Sidebar` / `Topbar` map to the app shell (`AppShell`, `AppTopBar`). Repo guardrails forbid creating new shared components without explicit instruction → report only.

Barrel `src/ui/antd.ts` vs DS pages: DS documents Anchor, AutoComplete, Cascader, ColorPicker, Mentions, Carousel, Image, Segmented, Statistic, QR Code, Watermark that the barrel does not export (no current usage); barrel exports Tree, Upload, List, Descriptions that have no DS page. Low severity — barrel is curated by usage.

### 3.8 Documentation / rules drift

`figma-repo-parity.mdc`, `primaryPrimitiveBlue.ts` / `primaryPrimitiveOrange.ts` / `buttonPrimaryPalette.ts` comments describe Colors modes `Light 5:0` / `Dark 5:4` / `Legacy (pre-RSFC) 1384:0`, `Color/ButtonPrimary/*` → `Volcano/*`, and file names `figmaTypography.ts` / `figmaSemanticColors.ts` / `figmaMenuMetrics.ts` (repo uses `hydraTypography.ts` / `hydraSemanticColors.ts` / `hydraMenuMetrics.ts`). None of that matches the current DS file.

## 4. Proposed resolution order (pending approval)

1. Primitives: P-01, P-03, P-05; add `primary-0` step; add `hydraActionOrange*` ramp (keep `volcano*` as deprecated aliases to avoid a broad rename).
2. Light semantics: L-01 … L-11 as explicit overrides in `antdTheme.ts` / `hydraAlias.ts`.
3. Button: B-01, B-02, B-04; B-03 stays a documented code-only gap unless removed.
4. Sidebar: S-01 … S-04 (S-01 after design confirmation).
5. Dark mode: D-01 (separate slice).
6. Typography: T-01 … T-06.
7. Docs + rules update (§3.8) and re-run this compare.

## 5. Status

**2026-11-05 — Light pull applied (repo only; Figma unchanged).** Re-run compare: **222 Light token pairs match**; the only Light residual is `colorSplit` (`rgba(5,5,5,0.06)` Figma vs `rgba(0,0,0,0.06)` antd — visually identical, left as is). Dark is unchanged except `lineWidthFocus`.

### 5.1 Resolved

| ID(s) | Change |
|---|---|
| P-01 … P-05, B-05 | Primary / Daybreak / Hydra Action Orange steps 8–10 = Figma `Colors` (`primaryPrimitiveBlue.ts`, `primaryPrimitiveOrange.ts`). `hydraActionOrange*` is the canonical name; `volcano*` exports are deprecated aliases. Polar Green / Calendula Gold / Dust Red Light ramps mirrored in `hydraSemanticColors.ts`. |
| L-01 … L-11 | Explicit Light overrides for Success / Warning / Error / Info semantics, `colorBgMask`, `controlOutline`, `colorIcon*`, `lineWidthFocus` (`antdTheme.ts` → `hydraLightOnlyToken`, `hydraAlias.ts`). Dark strips the Light-only keys and keeps `darkAlgorithm` derivation. |
| B-01, B-02, B-04 | `Color/Action/*` mapping (`buttonPrimaryCustomizeTheme.ts`), Action text steps 8/9, danger shadow color = Figma. New alias tokens `colorActionBg` / `colorActionBorder` (`hydraAntdTokenExtensions.d.ts`) so screens stop importing primitives. |
| S-01 … S-03 | Sidebar selected bg = Daybreak `blue-2` (`sidebarSemantics.ts`); selected text / submenu bg follow P-01. S-04 values already matched — literals in `hydraMenuDarkChrome` kept. |
| T-01 … T-03 | `*/Strong` → `*/Medium` design paths (`hydraBaseMedium`, …; `*Strong` kept as deprecated aliases); added `Base/Semibold`, `Subtitle/Extra Large`. |
| §3.7 | CL molecules added in `src/ui/` and exported from `src/ui/antd.ts`: `StatTile`, `OptionCard`, `FeatureCard`, `RecommendationCard`, `EmptyStateBlock`. `ExportCard` kept; `OptionCard` (`type=action`) supersedes it. No module usages were swapped. |
| Components | `actionTrailStyles.ts`, `VariantActionSelectionModal.tsx` → `colorActionBg` / `colorActionBorder`; `BomMatchingPage.tsx` → `colorPrimaryActive`; `SpecRecommendationCard.tsx` now renders the CL `RecommendationCard` (hover `colorPrimary`, reason `Base/Normal`). |
| Featured Parts | Panel surface `#E5F0FF` (no DS variable) → `token.colorPrimaryBg` (`FeaturedParts.tsx`, `ProductCatalogContent.tsx`); literal removed from `hydraSemanticColors.ts`. |
| `*Strong` names | Kept as deprecated aliases of `*Medium`; no mass rename (decision 2026-11-05). |

### 5.2 Open / intentional gaps

| ID | Gap |
|---|---|
| B-03 | `buttonPrimaryControlOutline` (orange focus ring) stays code-only — no Figma variable. |
| D-01 | Dark mode alignment — separate slice. |
| T-04 / T-05 / T-06 | Roboto Mono `Base/Code`, `fontWeightStrong` 600, Compact `fontSizeSM` 11 — not adopted (decision 2026-11-05). |
| Figma OptionCard | Icon vector bound to `colorLimeText`; `type=action, state=hover` has `strokeWeight 2` with no stroke paint. Treated as Figma defects — code leaves icon color to the consumer and uses no stroke. |
| Figma Stat Tile | Inconsistent alignment (`success`/`warning` SPACE_BETWEEN, others MIN). Code uses space-between for all tones. |
| letterSpacing | Literal values in typography have no DS variable. |
