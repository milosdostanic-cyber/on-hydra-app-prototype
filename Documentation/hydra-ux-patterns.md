# Hydra UX patterns across the RSFC modules

**What this is:** the layout, spacing, type, colour and interaction patterns that repeat across the 7 RSFC module files, measured from Figma node data (not from screenshots alone).
**DS source:** [Hydra Ant Design - DS](https://www.figma.com/design/3ghYBXR6XVUEaeBo3D5E4q/Hydra-Ant-Design---DS?node-id=202-43203). Token and style names below come from the cached inventory at [`ds-inventory.json`](./ds-inventory.json).
**Measured:** 2026-10-29, Light mode, 48 UI screens from 7 files. **Updated 2026-10-30:** table row actions (§7), form modals and drawers incl. the modal overlay (§8), Figma canvas organisation (§9), empty / error states and sidebar icons (§2), 70 more frames measured (see [Coverage](#coverage)).
**How to read the values:** `24 · paddingLG` means the value is 24 px and is bound to that variable. `24 (raw)` means 24 px with no variable bound.
**Status labels:** **User rule, 30 Oct** = decided by the user, apply as written. **Needs designer sign-off** = a recommendation derived from what the modules mostly do; not yet agreed.
**Admin · Access Blacklist** (built 30 Oct by another agent) is listed as *new 30 Oct, not reviewed* and is never used as the reference for a standard.

Module shorthand: **ADM** Admin · **CON** Content · **RN** Release Notes · **PS** Part Search · **US** Unified Search · **BOM** · **SPEC**.

---

## 1. Spacing map

| Context | Token | px | Where used | How common | Outliers |
|---|---|---|---|---|---|
| Page padding (the `Content` frame) | `paddingLG` | 24 all sides | All 7 modules | Every measured screen with a `Content` frame | PS Category 48/24 (`paddingXXL`/`paddingLG`) [PS-cat]; BOM Workspace 24 but unbound [BOM-ws]; RN What's New has no `Content` frame (hand-built shell) [RN-modal] |
| Page header → first content block | `paddingLG` | 24 | CON, BOM, SPEC, PS, US, RN, ADM Dashboard and Lead Time | Most screens | ADM CFM 32 `paddingXL` [ADM-cfm]; ADM Knowledge Center 20 `marginMD` [ADM-kc]; BOM Export 20 `paddingMD` [BOM-exp]; PS Category 48 [PS-cat] |
| Page title → page description | `paddingXXS` / `marginXXS` | 4 | CON, RN, ADM Knowledge Center | About 1 in 3 pages | 8 `paddingXS` (BOM wizard steps, SPEC Dashboard and Export); 0 (SPEC list, BOM Hub, which rely on line height); 24 (ADM CFM) |
| Back button → page title | `paddingLG` | 24 | BOM wizard, PS, US, RN | Common | CON 16 `padding` (inner container) [CON-hist] |
| Between page sections | `paddingLG` | 24 | All modules | Most screens | CON 16; ADM CFM 32 |
| Section heading → its table or list | `paddingSM` | 12 | BOM Hub, PS and US panels, SPEC panels | Common | BOM Hub heading row → option cards 20 `paddingMD` [BOM-hub] |
| Top-level card padding | `paddingLG` | 24 | PS listing card, US cards, ADM CFM cards, ADM Lead Time summary, SPEC Export | Most cards | 16 (ADM Dashboard sections, SPEC TOC and list panels); 20 (ADM Dashboard Filters, SPEC Overall assessment); 25.26 off-scale on a scaled US image container [US-img] |
| Nested panel padding (panel inside a card) | `padding` | 16 | PS and US spec panels, CON selection bar, SPEC Export | Common | SPEC Overall assessment 20 |
| Card inner gap | `paddingLG` / `paddingMD` / `paddingSM` | 24 / 20 / 12 | 24 PS main card · 20 PS action rail, SPEC Export · 12 nested panels | Varies by card size | ADM CFM cards 32 `paddingXL` |
| Gap between cards in a row | `padding` / `paddingMD` / `paddingLG` | 16 / 20 / 24 | 16 BOM option cards · 20 PS featured grid · 24 PS and US main + action rail | Three values in use | SPEC review 3-column layout 8 `paddingXS` [SPEC-rev] |
| Form: label → input | `paddingXS` | 8 | ADM note modal [ADM-note], ADM Lead Time import [ADM-lead-import], US add to BOM [US-add]; *AB add entry (new 30 Oct)* | Most forms | BOM row edit modal 4 `paddingXXS` [BOM-edit] |
| Form: field → field | `padding` / `paddingLG` | 16 / 24 | 16: ADM note modal, BOM row edit columns · 24: US add to BOM; *AB add entry (new 30 Oct)* | Split, see §8 | 12 KC recipient blocks [ADM-upload]; 20 between blocks in CON / PS add-to modals [CON-submittal] |
| Button group gap | `paddingXS` | 8 | All modules: page actions, modal footers | Nearly universal | 12 `paddingSM` in bulk-selection bars (SPEC, BOM) [SPEC-bulk]; 12 (raw) US link group |
| Table toolbar (search or count row inside the table card) | `padding` / `paddingMD` | 16 top and bottom, 20 sides | SPEC list, US BOM Hub | Common | BOM Hub 11/20 (11 is raw and off-scale) [BOM-hub] |
| Table pagination row | `paddingMD` | 0 / 20 sides; 16 above and below the Pagination | BOM Hub (measured) | Same layout seen in SPEC list and US BOM Hub screenshots | none |
| Modal body (DS `Modal`) | `paddingLG` / `paddingSM` | 0 · 24 · 12 · 24 (gap 10 raw, inside the DS component) | ADM, CON, PS, US, BOM, SPEC | Every DS modal | Hand-built ADM note modal: 24 all, gap 20 [ADM-note] |
| Modal header (DS `Modal`) | `padding` / `paddingLG` / `paddingXS` | 16 · 24 · 8 · 24, gap 8 | Same | Every DS modal | none |
| Modal footer (DS `Modal`) | `paddingLG` + `paddingXS` | 0 · 24 · 24 · 24, buttons gap 8 | Same as above | Every DS modal | none |
| Confirmation and info dialog (`Modal__Confirmation`, `Modal__Information`) | `paddingXL` / `paddingLG` / `padding` | 32 · 32 · 24 · 32, gap 16 | ADM CFM, BOM Hub | Every confirmation | none |
| Drawer | `padding` / `paddingLG` | Head 16/24 gap 16; body 24 | ADM CFM file usage [ADM-drawer] | Only drawer in the sample | none |
| Topbar | `padding` / `paddingLG` / `paddingMD` | 16/24, gap 20 | All modules | Same everywhere | Height differs: 92 (two-line title), 64 (ADM), 72 (PS Category) |
| Breadcrumb bar | `paddingSM` / `paddingLG` | 12/24, gap 12, height 46 | All modules | Same everywhere | Side padding 24 is raw in CON, BOM, SPEC, PS and some US screens; bound in ADM and RN |
| Wizard step bar | none (raw) | 12/24, gap 32 | BOM upload flow [BOM-guided] | Only in BOM | All values raw |
| Empty state inside a card | `paddingXL` (sides) | 80 (raw) top and bottom, 32 sides, gap 24 | BOM Hub empty, ADM KC loading and error states | 2 of 3 modules | CON 64/0, gap 20 [CON-empty] |
| Table row gap in the BOM mapping list | none | 7 (raw, off-scale) | BOM column mapping [BOM-map] | 98 frames on one screen | Should be 8 `paddingXS` |

Rule of thumb in practice: **24 is the page rhythm, 16 is the panel rhythm, 8 is the control rhythm.** No spacing token exists above 48 (`marginXXL`); the 80 px empty-state padding is the only large value that repeats.

---

## 2. Layout patterns

| Pattern | When to use | Structure | Tokens | Examples |
|---|---|---|---|---|
| **Page shell** | Every app screen | `Sidebar` instance (256 wide) + right column (`colorBgLayout`) with `Topbar` instance, Breadcrumb bar, then `Content` (vertical auto layout) | Content padding 24 `paddingLG`, gap 24 | [CON-hist], [BOM-hub], [SPEC-list] |
| **Page header** | Top of every page | Title + description on the left, actions right-aligned on the same row; optional Back button above | Title → description 4; actions gap 8; secondary (default) left of primary | [SPEC-list], [BOM-parse], [ADM-kc] |
| **Wizard header** | Multi-step create or import flows | Back button → tinted step bar (`Steps` inside, warning or success tint) → page header with actions | Step bar 12/24 (raw); then 24 | [BOM-map], [BOM-guided], [BOM-results] |
| **Table in a card** | Lists of records | Card (`colorBgContainer`, radius 8) holding a toolbar row (count, search, bulk actions), DS `Table` cells, Pagination bottom-right | Toolbar 16/20; pagination row 0/20 | [BOM-hub], [SPEC-list], [ADM-kc] |
| **Filter bar** | Lists with search and date or type filters | Search input + filters + "Clear filters" in one row above the table (ADM KC); or search inside the table toolbar (BOM, SPEC); or `Tabs` as the filter (RN, SPEC Dashboard) | Gap 8 | [ADM-kc], [BOM-hub], [RN-all] |
| **Side filter panel + list** | Lists scoped by a parent entity | Left panel (search + entity list with counts) next to the main column | Panel 20/16, gap 12, `colorSplit` border | [ADM-kc] |
| **Detail page with action rail** | One product or record with many actions | Main card (left, wide) + action rail card (right, about 464 wide) | Cards padding 24, gap 24 | [PS-list], [US-detail] |
| **Three-column review** | Document review and editing | TOC column · document editor · recommendations column | Gap 8 `paddingXS` | [SPEC-rev] |
| **Card grid / option cards** | Choosing one of several routes | `OptionCard` or `FeatureCard` instances in rows | Gap 16 (BOM) or 20 (PS) | [BOM-hub], [BOM-exp], [PS-cat] |
| **Grouped table sections** | Records grouped by date or category | One card per group: tinted header (`colorFillQuaternary`) + table | Header 12/16 | [RN-all] |
| **Modal** | Short focused tasks: create, edit, choose | DS `Modal` on `Modal__Overlay` (`colorBgMask`), footer right-aligned: Cancel then primary. Overlay covers the whole screen frame (§8.4, **User rule, 30 Oct**). Form modals: §8 | Body 0/24/12/24; footer gap 8 | [BOM-edit], [SPEC-upload], [US-variation] |
| **Confirmation** | Destructive or publishing steps | DS `Modal__Confirmation` / `Modal__Information`, 538 wide | 32/32/24/32, gap 16 | [BOM-delete], [ADM-publish], [ADM-blocked] |
| **Drawer** | Secondary detail without leaving the page | DS `Drawer` placement right, 378 wide, over a mask | Head 16/24; body 24 | [ADM-drawer] |
| **Empty state** | No data yet | DS `❖ Empty State Block` wherever an empty state is shown (**User rule, 30 Oct**), centred in the card that would hold the data, with one primary action | 80/32 (raw) | [CON-empty], [BOM-empty] |
| **No search results** | Filters or search return nothing | The same `❖ Empty State Block`: primary action hidden (`show action` off), secondary action "Clear filters" (**User rule, 30 Oct**) | as empty state | [ADM-kc-empty] today shows the block with no action ("No manual files found."); "Clear filters" sits only in the filter bar |
| **Loading state** | List or analysis in progress | Same page shell; DS `Spin` centred in the content card (ADM), or `Spin` + one-line message inside the modal with the primary button in a disabled loading state (SPEC) | Card 80/32 (raw) | [ADM-loading], [SPEC-analyzing] |
| **Error state** | Request failed (list or page could not load) | DS `Result` `status=500` (Hydra illustration) centred in the content card: title = what failed, description = what to do, one button "Retry" (`show button secondary` off) (**User rule, 6 Nov**; replaces the earlier Error `Alert` + "Retry" pattern). Keep `Alert` only for inline errors next to content that still loads | Card padding 48 top/bottom, as empty state | [ADM-ab-error], [ADM-error], [ADM-rn-error], [ADM-fal-error] (all swapped 6 Nov) |
| **Stacked modal** | Creating a parent object while inside a modal | Second modal over the first | DS Modal | [US-stack] |

### Sidebar: selected item icon (User rule, 30 Oct)

- The selected menu item's icon takes the selected colour together with its label.
- Known cause of a white icon: a `Sidebar` copied from another frame carries fill overrides on the icons.
- Fix per item: reset overrides on the icon instance → swap the icon property to another icon and back → rename the layer to `🎰 icon`.
- Check: the icon `Vector` fill variable equals the label's fill variable.

---

## 3. Typography hierarchy in practice

DS reference (from how DS components use styles; full table in `ds-inventory.json`): card, modal and drawer title = `Title/Heading 5`; body = `Base/Normal`; table header = `Base/Medium`; caption = `Small/Normal`; KPI value = `Title/Heading 3`. The DS has **no page-header component**, so the page title role is not defined by the DS.

| Role | What modules use | Most common | Example |
|---|---|---|---|
| Page title | `Title/Heading 2` (ADM KC, CFM, Lead Time; BOM Export) · `Title/Heading 3` (ADM Dashboard, CON, BOM wizard, Workspace, Cheat Sheet) · `Title/Heading 4` (SPEC, RN, BOM Hub) | H3 (8 pages) > H4 (6) > H2 (4) | [CON-hist] H3 · [SPEC-list] H4 · [ADM-kc] H2 |
| Product name (detail hero) | `Title/Heading 1` + 24 px subtitle | PS and US only | [PS-list] (subtitle is raw 24/Medium), [US-detail] (subtitle `Title/Heading 3`) |
| Page description | `Base/Normal` + `colorTextDescription` | Yes | [CON-hist], [RN-all] |
| Page description (variants) | `Title/Heading 5` + `colorTextDescription` (SPEC list, BOM Hub); `Base/Normal` + `colorTextLabel` (BOM wizard); raw 16 + `colorTextLabel` (ADM CFM) | – | [SPEC-list], [BOM-parse], [ADM-cfm] |
| Section heading | `Title/Heading 4` | Yes (BOM Hub, PS, ADM CFM) | [BOM-hub] "Your BOM Projects" |
| Section heading (variants) | `Title/Heading 5` (SPEC), `Extra Large/Strong` (PS Category), `Large/Medium` (SPEC column titles) | – | [SPEC-dash], [PS-cat], [SPEC-rev] |
| Card title | `Title/Heading 5` (OptionCard, export cards) | Yes | [BOM-exp] |
| Card title (variants) | `Title/Heading 4` (PS "Actions", US "Available Sizes") | – | [PS-list] |
| Body | `Base/Normal` | Yes | all |
| Form label | `Small/Medium` (ADM note modal) · `Base/Normal` (BOM edit modal) | Split | [ADM-note], [BOM-edit] |
| Key–value label / value | Label raw 14/Regular `colorTextLabel`, value raw 14/Medium (PS); `Small/Medium` + `Large/Strong` (ADM Lead Time) | No standard | [PS-list], [ADM-lead] |
| Table header / cell | DS `Table` header and cell instances (`Base/Medium` / `Base/Normal`) | Yes (all) | [BOM-hub] |
| KPI number | `Stat Tile` (BOM, SPEC) or `Title/Heading 3` (ADM Dashboard); SPEC also raw 24/SemiBold | Mostly H3 | [ADM-dash], [SPEC-dash] |
| Button label | Inside DS `Button` (`Base/Normal` medium, `Large/Normal` large) | Yes | all |

Text style hygiene per module (text layers outside DS instances, sampled screens):

| Module | DS style | Raw (no style) | Note |
|---|---|---|---|
| ADM | 98% | 2% | 194 layers use DS style keys (`Base/Normal`, `Large/Normal`, `Base/Medium`) that do not resolve in the file: library link needs checking |
| BOM | 91% | 9% | Raw 14/SemiBold file name in the step bar |
| US | 94% | 6% | Uses old style names `Base/Strong`, `Small/Strong` (same keys as today's `*/Medium`): library update pending |
| SPEC | 54% | 46% | Raw 12/Regular body in the recommendation detail [SPEC-detail] |
| PS | 44% | 56% | Raw key–value grid; old names `Base/Strong`, `Extra Large/Strong` |
| RN | 33% | 67% | The "What's New" screen [RN-modal] is a hand-built old ASC shell |
| CON | 25% | 75% | Table cell text raw 14/Regular `#000000` [CON-hist] |

---

## 4. Colour usage by role

| Role | Token in practice | Where | Deviations |
|---|---|---|---|
| Primary text | `colorText` | All | RN `#000000` at 88% (raw); CON `#000000` (raw); PS "Actions" heading `#000000` at 88% (raw) |
| Secondary / description text | `colorTextDescription` | All | `colorTextLabel` used for descriptions in PS, US, BOM wizard, ADM CFM; CON `#8C8C8C` (raw); BOM mapping description uses `colorBgMask` as a text colour [BOM-map] |
| Label text | `colorTextLabel` | PS, US key–value labels | – |
| Heading text | `colorText` | All | `colorTextHeading` (same value) only in ADM Dashboard |
| Link / accent text | `colorPrimaryText` | PS featured title, links | – |
| Text on primary | `colorTextLightSolid` | Buttons, Topbar | – |
| Page background | `colorBgLayout` (#F0F2F8) | Right column of the shell | PS Category root raw `#F0F2F8`; screen root frames use `colorPrimaryBg` behind the layout |
| Card / panel surface | `colorBgContainer` | All | `OptionCard` and `FeatureCard` use `colorBgElevated` (popover tier) |
| Nested panel / tinted bar | `colorFillQuaternary` | PS, US, CON, SPEC, RN group headers | – |
| Modal / drawer surface | `colorBgElevated` + `boxShadow` | All DS modals | – |
| Mask | `colorBgMask` | `Modal__Overlay`, `Drawer` | – |
| Card border | `colorBorderSecondary` | ADM Dashboard, RN, SPEC Export, BOM results | Many cards use `boxShadowTertiary` instead of a border (see Inconsistencies) |
| Control border | `colorBorder` | Buttons, inputs, `FeatureCard` | – |
| Divider / split | `colorSplit` | Sidebar, drawer head, ADM KC side panel | – |
| Topbar | `colorPrimary` | All | – |
| Warning / success state bar | `colorWarningBg` + `colorWarningBorder` / `colorSuccessBg` + `colorSuccessBorder` | BOM wizard step bar and `Alert` | – |
| Info highlight | `colorInfoBg` + `colorInfoBorder` | PS featured parts block | – |
| Status in tables | `Badge__Status` (dot + label), left aligned; in tables use DS `Table / Table cell` type=badge (**User rule, 6 Nov**). `Tag__Status` (bordered tag with icon) is not used for record status | BOM, SPEC, ADM | Swapped 6 Nov: ADM RN, KC, Content, Companies, Users; BOM Flows and BOM-356; SPEC Draft; US Cross-module guidance; code `SpecSubmittalsPage`. `Tag__Status` stays only for non-status chips (confidence, counts, "Added manually") |
| Category / type label | `Tag__Colorful` | RN types, CON formats, PS counts | – |
| Primary action | `colorAction` (orange) via `Button` primary | All | US guidance screen button uses `colorPrimary` with a raw shadow [US-hub] |

---

## 5. Interaction patterns

| Pattern | What modules do | Standard in practice | Examples |
|---|---|---|---|
| Primary page action | One orange primary `Button` at the right end of the page header row | Yes, in every module | [SPEC-list], [BOM-hub], [ADM-kc] |
| Secondary actions | Default buttons left of the primary, gap 8 | Yes | [BOM-map], [SPEC-dash] |
| Page action size | Large (40) in SPEC, BOM, CON; Medium (32) in ADM KC and Lead Time | Split | [SPEC-list] vs [ADM-kc] |
| Back navigation | Default `Button` with left arrow above the title: Medium in BOM, PS, US, RN; Large in CON | Mostly Medium | [BOM-parse] vs [CON-hist] |
| Row-level destructive action | Red "Delete" default button in the Actions column | BOM, SPEC (6 renderings across modules, see §7) | [BOM-hub], [SPEC-list] |
| Row menu | Kebab menu (ADM KC) or "Manage" dropdown (ADM CFM) | ADM only, see §7 | [ADM-kc-menu], [ADM-cfm-menu] |
| Destructive confirmation | `Modal__Confirmation` with a danger primary on the right | Mostly; deviations in §7.3 | [BOM-delete], [ADM-kc-del] |
| Bulk actions | Checkbox column; "N Selected" + Bulk Delete + Clear Selection replace the toolbar when rows are checked | SPEC, BOM | [SPEC-bulk], [BOM-delete] |
| Bulk actions (variant) | A tinted bar is always visible with disabled buttons until rows are checked | CON only | [CON-hist], [CON-checked] |
| Inline edit | Quantity `InputNumber` directly in the table | BOM Workspace | [BOM-ws] |
| Edit in a modal | Row "Edit" opens a modal form | BOM parsing review | [BOM-edit] |
| Status display | `Badge__Status` dot + label, left aligned, in every module (**User rule, 6 Nov**); `Tag__Colorful` for types | Yes | [BOM-hub], [RN-all] |
| Progressive disclosure | Expandable table rows (CON, PS variants modal); drawer for usage details (ADM); "Show parts that may not match well" toggle (BOM) | Yes, mixed mechanisms | [CON-hist], [PS-modal], [ADM-drawer] |
| Wizards | BOM: 3 steps in a tinted bar on the page; SPEC upload: 2 steps inside a modal; ADM KC upload: 2-step modal | Split by length of flow | [BOM-guided], [SPEC-upload], [ADM-upload] |
| Disabled actions with a reason | Disabled buttons plus an explanatory sentence above them | US detail, SPEC Export | [US-detail], [SPEC-exp] |

---

## 6. Inconsistencies and recommended standard

#1–12 ranked by how visible they are to users; #13–22 added 30 Oct (row actions, form modals, overlay, canvas). Audit IDs refer to `ds-compliance-audit-2026-10-29.html`.

| # | What differs | Where | Recommended standard |
|---|---|---|---|
| 1 | **Page title level.** Top-level page titles use `Title/Heading 2`, `Title/Heading 3` or `Title/Heading 4`, even inside one module (BOM uses all three). | [ADM-kc] H2, [BOM-exp] H2, [CON-hist] H3, [BOM-parse] H3, [SPEC-list] H4, [BOM-hub] H4, [RN-all] H4 | `Title/Heading 3` + `colorText` for every page title (most common; matches the DS 24 px titles in Result and Empty State Block). Keep `Title/Heading 1` only for the product-name hero. Needs designer sign-off. |
| 2 | **Page description style, colour and gap.** `Base/Normal` vs `Title/Heading 5` vs raw 16; `colorTextDescription` vs `colorTextLabel` vs `colorBgMask`; title → description gap 0, 4, 8 or 24. | [SPEC-list], [BOM-hub], [BOM-map], [ADM-cfm], [CON-hist] | `Base/Normal` + `colorTextDescription`, 4 px (`marginXXS`) under the title. |
| 3 | **Card chrome.** Top-level cards use a shadow (`boxShadowTertiary`), a border (`colorBorderSecondary`), or both; radius 6 or 8; `OptionCard` and `FeatureCard` sit on `colorBgElevated`. | Shadow: [SPEC-list], [PS-list], [BOM-hub] · Border: [ADM-dash], [BOM-results] · Both: [RN-all] · Radius 6: [PS-list], [SPEC-exp] | `colorBgContainer`, radius 8 (`borderRadiusLG`). Top-level card on the page background: `boxShadowTertiary`, no border. Card nested inside a card: `colorBorderSecondary` border, no shadow. Cards use `colorBgContainer`, not `colorBgElevated`. |
| 4 | **Text without DS styles, or with an outdated library.** Raw text: CON 75%, RN 67%, PS 56%, SPEC 46%. PS and US still show `Base/Strong`, `Extra Large/Strong`, `Small/Strong` (renamed to `*/Medium` in the DS; `Small/Strong` still renders SemiBold). ADM has 194 layers whose DS style keys do not resolve. | [CON-hist], [RN-modal], [PS-list], [SPEC-detail], [PS-cat], [ADM-kc] | Accept the pending Hydra library update in PS and US; re-link the Hydra library in ADM; apply DS text styles by role (section 3). |
| 5 | **Action and Back button sizes.** Page-header actions are Large in SPEC, BOM, CON and Medium in ADM; the Back button is Medium in BOM, PS, US, RN and Large in CON. | [SPEC-list] vs [ADM-kc]; [BOM-parse] vs [CON-hist] | Page-header actions Large (40); Back button Medium default with a left arrow. |
| 6 | Shell variants: Topbar 92, 64 or 72 high; RN "What's New" uses a hand-built ASC shell; RN Admin screens have no Sidebar; breadcrumb side padding unbound in 5 modules. | [RN-modal], [ADM-rn], [PS-cat] | Use the `Sidebar` + `Topbar` instances on every screen; bind breadcrumb padding to `paddingLG`. |
| 7 | Form labels: `Small/Medium` with 8 px gap (ADM) vs `Base/Normal` with 4 px gap (BOM). Superseded by #16. | [ADM-note], [BOM-edit] | See §8.3: DS `Input__Label` (`Base/Normal`), 8 px to the input, 24 px between fields. |
| 8 | Bulk-action bar: always visible and disabled (CON) vs appears on selection (SPEC, BOM). | [CON-hist], [SPEC-bulk] | Show the bulk bar only when rows are selected, inside the table card toolbar. |
| 9 | Empty state padding 80/32 vs 64/0. | [BOM-empty], [CON-empty] | 80/32 (raw today); also a DS gap, see Open questions. |
| 10 | Modal widths 520, 538, 560, 576, 580, 648, 681, 720, 1135; hand-built modal frames in ADM Release Notes. | [ADM-note], [PS-modal], [BOM-edit] | See §8.3: DS `Modal`, 538 default, 681 for two-column or upload forms, 1135 only for table pickers. |
| 11 | Off-scale and scaled values: 7 px row gaps (BOM mapping), 11 px toolbar padding (BOM Hub), 25.26 px padding (US image container). | [BOM-map], [BOM-hub], [US-img] | Snap to 8, 12 and 24. |
| 12 | Naming: the BOM "Row edit drawer" screen shows a modal, not a drawer. | [BOM-edit] | Rename the frame to "Row edit modal". |
| 13 | **Same meaning, different verb (row actions).** BOM Workspace "Delete" takes a part out of the BOM (the part still exists); CFM menu says "Remove everywhere (global)" while its receipts log the same change as "DELETE GLOBAL"; CFM global confirmation says "Confirm global removal" with a "Continue" button. *ADM Access Blacklist (new 30 Oct, not reviewed) uses "Remove".* | [BOM-ws], [ADM-cfm-menu], [ADM-receipts], [ADM-cfm-global]; *[ADM-ab]* | One word per meaning (**User rule, 30 Oct**): §7.2. Delete = record destroyed; Remove = leaves a list or relation. BOM Workspace → "Remove"; CFM receipts tag → same verb as the menu. |
| 14 | **Six renderings of row actions.** Small default buttons + `danger` (BOM, SPEC); DS `Link` + grey 12 px "Delete" text with a "·" separator (ADM RN); DS `Table cell` type=action text (*AB, new*); large text `Button` "Rollback" (CFM receipts); inline "Manage ▾" `Dropdown` (CFM); "Download" button + kebab menu (KC). BOM and SPEC cells are detached `Table / Table cell` frames (audit BOM-001, SPEC-002). | [BOM-hub], [SPEC-list], [ADM-rn], [ADM-receipts], [ADM-cfm-menu], [ADM-kc-menu] | One button style everywhere (**User rule, 30 Oct**): §7.2 — `Button` size=small type=default, destructive adds `danger=true`; more than 2 actions → kebab `Dropdown`. |
| 15 | **Modal overlay does not match the screen.** Too tall (KC +60, CFM +82), too short (BOM skipped-rows −72, US variation −22), offset (BOM −68 / −45 / −7, US +11 / −2, SPEC x −1), content-only mask (Lead Time backdrop and CFM drawer leave the sidebar unmasked), raw rectangle in `colorIconHover` (ADM RN). Only *AB (new)* uses STRETCH / STRETCH. | §8.4 table | Overlay = whole screen frame, x 0 y 0, constraints STRETCH / STRETCH (**User rule, 30 Oct**). |
| 16 | **Form labels: six treatments.** DS `Input__Label` with `*` before (ADM Lead Time; *AB*); hand-built `Small/Medium` + `colorTextLabel` with `*` after (ADM RN); `Base/Medium` + `colorTextLabel` (CON); old `Base/Strong` + `colorTextLabel` (PS) or `colorText` (US); `Base/Normal`, no required marker (BOM edit); "Declared Unit :" with a colon (ADM Lead Time). | [ADM-note], [ADM-lead-import], [CON-submittal], [PS-submittal], [US-add], [BOM-edit] | §8.3: DS `Input__Label` vertical, `required` on → `*` before the label, "(optional)" suffix on optional fields, no colon. |
| 17 | **Same flow, different words.** "Add to Submittal Package" + "Add to package" (PS) vs "Create Submittal Package" + "Create package" for the same pick-a-package step (CON); "Create BOM" (CON) vs "Add to BOM" (PS, US); RN title "New release note" in `Title/Heading 4`. | [PS-submittal], [CON-submittal], [CON-bom], [US-add], [ADM-note] | §8.2 wording: "Add {item} to {list}" + "Add to {list}" when picking an existing list; "Create {object}" only when a new record is made. Titles `Title/Heading 5`. |
| 18 | **Destructive confirmations.** CFM global removal uses a non-danger primary labelled "Continue"; ADM RN delete is a hand-built 420 px frame (audit ADMIN-RN-003); *AB uses a plain `Modal`, not `Modal__Confirmation`.* | [ADM-cfm-global], [ADM-rn-del], *[ADM-ab-remove]* | §7.3: `Modal__Confirmation`, primary `danger=true` with the same verb as the row action. |
| 19 | **Actions column header.** "Actions" (most) vs "Action" (CFM receipts, which also has a second "Action" column for the change type); alignment left (SPEC, RN, BOM parsing), right (KC, BOM Hub header, BOM Workspace, matching results), centre (CFM); BOM Hub header right but cells left. | [ADM-receipts], [SPEC-list], [BOM-hub] | §7.2: header "Actions", right-aligned header and cells, last column. |
| 20 | **CFM "Manage" menu text overlaps.** Danger items are 116 px wide; "Remove from this target" wraps over the next item. Fixed in the CON-231 frames (252 px items, clearer labels). | [ADM-cfm-menu], [ADM-cfm-remove] vs [ADM-cfm-everywhere] | Menu items hug their label (no fixed width); reuse the CON-231 labels. |
| 21 | **RN "Delete" looks disabled.** Grey 12 px `colorTextDescription` text, not a button, not red. | [ADM-rn] | §7.2: `Button` small default `danger=true`. |
| 22 | **Figma canvas organisation.** Module pages outside Admin use `#5E9EBA`, `#1E1E1E` or `#E5E5E5` canvases and opaque section fills (`#29444F`, `#444444`, `#416375`, `#CEE7FF`, pastel tints, `#F05A23`); none use the Admin arrangement grid. | §9.2 table | `#787A7E` canvas, sections white 10 %, arrangement grid (**User rule, 30 Oct**). |

---

## 7. Table row actions

**Headline (User rule, 30 Oct): one word per meaning, and one button style, everywhere.** If an action destroys a record it is "Delete" in every module — never "Remove" in one table and "Delete" in another — and it looks the same in every table.

### 7.1 What the modules do today

| Module · table | Labels → what they do | How shown (DS component · variant) | Column: header · width · align | Order · gap · separator | Destructive confirm |
|---|---|---|---|---|---|
| ADM · Release Notes admin [ADM-rn] | Edit → opens the note form · Delete → destroys the note | Edit = DS `Link` (`colorPrimary`, `Base/Normal`); Delete = raw text `Small/Normal` 12 px `colorTextDescription` (grey, no danger); hand-built cells | "Actions" · 120 · left | Edit · Delete, gap 8 `paddingXS`, "·" separator | Hand-built 420 frame "Delete release note?" · Cancel (default) + Delete (primary `danger`) [ADM-rn-del] (audit ADMIN-RN-003) |
| ADM · Knowledge Center Manual Files [ADM-kc-menu] | Download → gets the file · ⋮ menu: Replace File → new version, same record · Edit Recipients → form · Delete → destroys the file | `Button` small default "Download" + icon-only kebab → `Dropdown / Menu` with `Dropdown / Item` (Delete = `danger=true`, last, with icon); cell = DS `Table / Table cell` type=text | "Actions" · 148 · right | Download, ⋮ · gap 12 `marginSM` | `Modal__Confirmation` "Delete file?" · Cancel + Delete (primary `danger`) [ADM-kc-del] |
| ADM · CFM figure / SKU files [ADM-cfm-menu] | "Manage ▾" menu: Replace for this target · Replace everywhere (global) · Remove from this target → detaches the file from one Figure / SKU · Remove everywhere (global) → detaches it from all targets (receipts call this "DELETE GLOBAL") | `Dropdown` type=basic inline (trigger text `colorLinkActive`) → `Dropdown / Item`, remove items `danger=true`; hand-built "Actions cell" frame | "Actions" + help icon · 140 · centre | One trigger | `Modal__Confirmation` "Remove file from this target?" · Cancel + Remove (primary `danger`) [ADM-cfm-remove]; `Modal__Information` warning "Remove file everywhere?" · Cancel + "Remove from 25 places" (primary `danger`) [ADM-cfm-everywhere]; "Confirm global removal" · Cancel + **Continue (primary, no danger)** [ADM-cfm-global] |
| ADM · CFM receipts [ADM-receipts] | Rollback → undoes a replace · "Not available" when it cannot | `Button` type=text size=**large**; disabled state for "Not available" | "**Action**" · 140 · centre (a second "Action" column holds the change-type tag) | One action | `Modal__Confirmation` "Rollback confirmation" · Cancel + Rollback (primary `danger`) [ADM-rollback] |
| *ADM · Access Blacklist [ADM-ab] — new 30 Oct, not reviewed* | *Remove → takes the domain / email off the blacklist (entry record deleted)* | *DS `Table / Table cell` type=action, text `colorErrorText` `Base/Normal`* | *"Actions" · 110 · right* | *One action* | *DS `Modal` (not `Modal__Confirmation`) `Remove "yahoo.mail"?` · Cancel + Remove (primary `danger`); failure = error `Alert` in the body [ADM-ab-remove], [ADM-ab-removefail]* |
| BOM · Hub project list [BOM-hub] | Delete → destroys the BOM project | `Button` small default `danger=true`; detached `Table / Table cell` frames (audit BOM-001) | "Actions" · 140 · header right, cells left | One action | Bulk only: `Modal__Confirmation` "Delete selected BOM projects?" · Cancel + Delete (primary `danger`) [BOM-delete]; single-row confirm not designed |
| BOM · Parsing review [BOM-parse] | Edit → opens the row form · Add info → same form for incomplete rows | Edit = `Button` small default; Add info = `Button` small **primary** | "Actions" · 100 · left | One per row | n/a |
| BOM · Workspace items [BOM-ws] | **Delete → takes the part out of this BOM** (the part still exists) | `Button` small default `danger=true` | "Actions" · 140 · right | One action | None designed |
| BOM · Matching results [BOM-results] | Change match / Resolve → opens matching | `Button` small default | "Actions" · 178 · right | One per row | n/a |
| SPEC · Project SPEC list [SPEC-list] | Status action (Continue review / Start review / View progress / Retry / Export) · Delete → destroys the SPEC | `Button` small default + `Button` small default `danger=true`; detached cells, SPACE_BETWEEN (audit SPEC-002) | "Actions" · 214 · left | Status action, Delete · gap 8 (raw) | Bulk only: "Bulk Delete" + "Clear Selection" [SPEC-bulk]; single-row confirm not designed |
| SPEC · "RSFC - SI Adjusted" (loose frame, outside sections) [SPEC-adjusted] | Edit · Delete | Raw text frames named "Button" (`colorInfoText` / `colorErrorText`, no text style) | "Actions" | Edit, Delete | Not designed |
| CON · Download history [CON-hist] | No row actions (bulk bar only) | – | – | – | – |

Bulk actions (BOM, SPEC): "N Selected" + `Button` medium default `danger` "Bulk Delete" (with `DeleteOutlined`) + "Clear Selection", gap 12 `paddingSM` [SPEC-bulk], [BOM-delete].

### 7.2 Proposed standard

**Verbs — headline is User rule, 30 Oct; the definitions below Need designer sign-off.**

| Verb | Use when | Today | Change |
|---|---|---|---|
| **Delete** | The record is destroyed (cannot be found anywhere afterwards) | BOM project, SPEC, release note, KC file | Keep |
| **Remove** | The item leaves a list or relation but still exists elsewhere | CFM "Remove from this target", *AB entry (new)* | BOM Workspace "Delete" → **Remove** [BOM-ws]; CFM receipts tag "DELETE GLOBAL" → the menu's verb (or the menu says Delete, if the file itself is destroyed — open question) |
| **Edit** | Opens a form for this record | RN, BOM parsing | Keep; "Add info" stays only as the incomplete-row variant of Edit |
| **View** | Opens a read-only detail | CFM "View N files" | Keep |
| **Download** | Saves the file | KC, CFM | Keep |
| **Replace** | Uploads a new version; the record stays | KC, CFM | Keep |
| **Roll back** | Undoes a past change | CFM "Rollback" | Button verb "Roll back"; noun "Rollback" only in titles or logs |

**Style — headline is User rule, 30 Oct; the details Need designer sign-off.**

| Element | Standard | Tokens / DS |
|---|---|---|
| Column | Last column; header "Actions" (plural even with one action); header and cells right-aligned; width fits the buttons | DS `Table / Table Item / Header Item`; cell = DS `Table / Table cell` instance, never a detached frame |
| Button | `Button` size=small, type=default; destructive adds `danger=true`. No links, no plain text, no `primary` in rows | Gap 8 `paddingXS`; no "·" separators |
| Count | Max 2 visible buttons. Third and further → icon-only kebab `Button` opening `Dropdown / Menu` | Menu items hug their label |
| Order | Most-used action first; destructive always last (rightmost, or bottom of the menu with `danger=true`) | – |
| Disabled | Keep the button, `state=disabled`; explain why in a tooltip | – |
| Bulk | Bulk bar appears on selection: "N selected" + same verb as the row action ("Delete selected" / "Remove selected") + "Clear selection" | Gap 12 `paddingSM` (as today) |

### 7.3 Destructive confirmation (Needs designer sign-off)

- Every Delete and Remove asks first, with DS `Modal__Confirmation` (538) on a full-screen `Modal__Overlay`. No `Popconfirm` (no module uses it today).
- Title: "{Verb} {object}?" — "Delete release note?", "Remove file from this target?".
- Description: what happens + whether it can be undone, `Base/Normal`.
- Buttons: Cancel (default) · primary `danger=true` with **the same verb as the row action** ("Delete", "Remove"), optionally with a count ("Remove from 25 places"). Never "Continue" or "OK" for a destructive step.
- Failure: error `Alert` inside the dialog, dialog stays open (*AB pattern, new 30 Oct, not reviewed*).

---

## 8. Form modals and drawers

**Headline (User rule, 30 Oct):** every modal where the user fills in fields follows one structure — same label position and style, same required marker, same spacing, and the same layout for the same purpose. No module uses a **drawer** for a form today; the only drawer (CFM file usage) is read-only [ADM-drawer].

### 8.1 What the modules do today

All DS-based ones use the DS `Modal`: header 16 · 24 · 8 · 24, gap 8; body 0 · 24 · 12 · 24 (gap 10 raw inside the DS component); footer 0 · 24 · 24 · 24, buttons gap 8; title `Title/Heading 5` + `colorText`.

| Purpose · modal | Container · width | Title | Labels (position · style · required · optional) | Helper / placeholder | Field gap · label→input · columns | Footer (left → right) | Validation / save error |
|---|---|---|---|---|---|---|---|
| **Create** · ADM RN New / Edit note [ADM-note], [ADM-rn-edit] | Hand-built frame · 720 (audit ADMIN-RN-002) | "New release note" `Title/Heading 4` + description | Top · `Small/Medium` 12 `colorTextLabel` · `*` **after**, `colorError` · none | Helper between label and input, `Small/Normal` `colorTextDescription`; placeholder "e.g. …" | 16 · 8 · two columns for Date + Type; sections "Content", "Visibility" with dividers | Cancel · Save draft · Publish (primary) | Not designed |
| **Create** · ADM RN Bulk upload [ADM-rn-bulk] | Hand-built frame · 480 | "Quick Bulk Upload" `Title/Heading 5` | No fields (drop zone) | `Small/Normal` | – | Cancel · Upload and Import | Separate screens |
| **Create / import** · ADM Lead Time import [ADM-lead-import] | DS `Modal` inside a hand-built "Modal focus" frame · 580 | "Import Lead Time File" | Top · DS `Input__Label` · `*` **before** · none; label ends with " :" | Helper under the field, raw 12 px; Select placeholder "Select unit" | – | Cancel · Continue | Separate "Upload Error" modal [ADM-lead-error] |
| **Create / upload** · SPEC Upload [SPEC-upload], [SPEC-selected] | DS `Modal` · 681 | "Upload a SPEC" | No fields; `Steps` (2) + drop zone | – | Body gap 20 | Cancel · Continue | "File cannot be processed" modal |
| **Create / upload** · ADM KC Upload & Send [ADM-upload], [ADM-kc-step2] | DS `Modal` · 538 | "Upload & Send File" | Block titles `Base/Medium` `colorText`, no `Input__Label` | Placeholders "Search companies or users...", "Email address" | 12 · – · one column; `Steps` (4) | Cancel · Next | Not designed |
| **Create / upload** · BOM Upload destination [BOM-upload] | DS `Modal` · 538 | "Upload destination" | Question `Large/Medium` + `Radio` group | Success `Alert` with the file | 4 | Cancel · Continue | – |
| **Edit** · BOM Row edit [BOM-edit], [BOM-edit-f] | DS `Modal` · 681 (frame named "drawer") | "Edit information" | Top · `Base/Normal` · **no marker** | Values only, no placeholders | 12 rows · 4 · **two columns**, gap 16; section title `Title/Heading 5` | Cancel · Save Edits | Not designed |
| **Edit** · ADM KC Edit Recipients [ADM-kc-edit] | DS `Modal` · 538 | "Edit Recipients" | Block titles `Base/Medium` | Same as upload | 12 | Cancel · Save Changes (disabled until changed) | – |
| **Edit / replace** · ADM KC Replace File [ADM-kc-replace] | DS `Modal` · 538 | "Replace File with New Version" | No fields; info + warning `Alert` | – | 16 | Cancel · Replace File (disabled until a file) | – |
| **Add to list** · PS Add to Submittal Package [PS-submittal] | DS `Modal` · 576 | "Add to Submittal Package" | Top · old `Base/Strong` + `colorTextLabel` · none | Link "Create a new package instead" at the bottom of the body | 20 between blocks · 8 | Cancel · Add to package | – |
| **Add to list** · CON same step [CON-submittal] | DS `Modal` · 576 | "**Create** Submittal Package" | Top · `Base/Medium` + `colorTextLabel` | Same link | 20 · 8 | Cancel · **Create package** | – |
| **Add to list** · CON Create BOM [CON-bom] | DS `Modal` · 576 | "Create BOM" | Top · `Base/Medium` + `colorTextLabel`; search `Input` "Search BOMs..." | Link "Create a new BOM instead" | 20 · 8 | Cancel · Create BOM | – |
| **Add to list** · US Add variant to BOM [US-add] | DS `Modal` · 576 | "Add Part variant to BOM" | Top · old `Base/Strong` + `colorText` | `Select` "Choose a BOM" | 24 · 8 | Cancel · Add to BOM (disabled until chosen); buttons use the old `size=default` value | – |
| **Add to list** · US Add to BOM + stacked create [US-stack] | DS `Modal` · 576, second modal on top | "Add to BOM" | Old `Base/Strong`; `Radio` list | Large `Input` "Search BOMs…", link "Create a new BOM instead" | 12 | Cancel · Add to BOM | – |
| **Add to list** · PS Select variants (Add to BOM, downloads) [PS-bom], [PS-modal] | DS `Modal` · 1135 | "Select variants to add to BOM" | Table picker, filter `Input` | – | 20 | Cancel · Add to BOM | – |
| **Select & export** · SPEC Download Master SPEC [SPEC-download] | DS `Modal` · 520 | "Download ASC Master SPEC" | `Checkbox` list + info `Alert` | – | 20 | Cancel · Download | – |
| ***Create* · ADM AB Add entry [ADM-ab-add] — new 30 Oct, not reviewed** | *DS `Modal` · 538* | *"Add blacklist entry"* | *Top · DS `Input__Label` vertical medium · `*` before · "(optional)" suffix* | *Placeholder "e.g. competitor.com"* | *24 `paddingLG` · 8 `paddingXS` · one column* | *Cancel · Add entry* | *Field: `Input` status=error + `Input__Caption` error [ADM-ab-invalid]; save: error `Alert` at the bottom of the body [ADM-ab-fail]* |

**Invite people:** only inside ADM Knowledge Center (Upload & Send step 1 and Edit Recipients: "Invite by Email" `Input` + recipient `Tag`s). No standalone invite modal exists.

### 8.2 Structure per purpose (Needs designer sign-off)

| Purpose | Title | Body | Primary button | Secondary path |
|---|---|---|---|---|
| **Create record** | "Create {object}" | Fields, one column | "Create" (or "Create {object}" if short). Records with a draft state: "Save draft" (default) + "Publish" (primary) | – |
| **Edit record** | "Edit {object}" | Same fields as Create, prefilled | "Save changes", disabled until something changes (KC pattern) | – |
| **Add item to a list** | "Add {item} to {list}" | "Adding" summary card on top, then pick the list (`Select` for ≤ 10, searchable list for more) | "Add to {list}" | Link button "Create a new {list} instead" at the bottom-left of the body |
| **Invite people** | "Invite people" (or a step inside upload) | Search `Input` + `Tag`s for chosen people, "Invite by email" `Input` | "Send invite" (last step) | – |
| **Upload / import** | "Upload {thing}" / "Import {thing}" | Drop zone; `Steps` inside the modal when there is more than one step | "Next" on inner steps; "Upload" / "Import" on the last; "Continue" only when the next step opens a page | Template download as a link button |

### 8.3 Shared form-modal standard (Needs designer sign-off)

| Element | Standard | DS / token |
|---|---|---|
| Container | DS `Modal` on `Modal__Overlay` position=center. No hand-built shells or wrapper frames | `Modal`, `Modal__Overlay` |
| Width | 538 default · 681 for two-column or upload forms · 1135 only for table pickers | No width token (DS gap) |
| Title | `Title/Heading 5` + `colorText`, sentence case, verb first (§8.2) | Modal `✏️ title` |
| Intro line (optional) | One sentence under the title in the body, `Base/Normal` + `colorTextDescription` | – |
| Label | On top. DS `Input__Label` orientation=vertical, size=medium (`Base/Normal`). No colon | `Input__Label` |
| Required | `required` on → `*` before the label (DS / Ant default) | `colorError` (inside DS) |
| Optional | "(optional)" after the label text, same style | – |
| Helper text | Below the control: DS `Input__Caption` status=default | `Small/Normal` + `colorTextDescription` |
| Placeholder | An example ("e.g. competitor.com") or "Select {thing}". Never the label itself | `colorTextPlaceholder` |
| Label → control | 8 | `paddingXS` |
| Field → field | 24 (Ant Form item spacing) | `paddingLG` |
| Two columns | Only for short paired fields (date + type, size + unit); column gap 16 | `padding` |
| Sections | Only when there are more than 6 fields: `Divider__Horizontal` with a title, plain | `Divider__Horizontal` |
| Body / header / footer padding | As the DS `Modal` (0·24·12·24 / 16·24·8·24 / 0·24·24·24) | Inside the DS component |
| Footer | Right-aligned: Cancel (default) · optional secondary (default) · primary. Gap 8. Size medium | `paddingXS` |
| Primary state | Create / Add: enabled, validate on click. Edit: disabled until something changes | – |
| Field error | `Input` / `Select` status=error + `Input__Caption` status=error under the field | `colorError` |
| Save failed | Error `Alert` at the top of the body, form values kept, modal stays open | `Alert` type=error |

### 8.4 Modal overlay (User rule, 30 Oct)

- `Modal__Overlay` and every drawer mask cover the **whole screen frame**: x 0, y 0, width and height equal to the frame, on top of all other layers (sidebar and topbar included).
- Sized by constraints **STRETCH / STRETCH**, so it follows the frame when the frame grows. Never a typed height. Applies to form modals, confirmations and drawers.

Measured 30 Oct (screen size → overlay box x, y, w × h · constraints):

| Module · frame | Screen | Overlay | Constraints | OK? |
|---|---|---|---|---|
| *ADM · Access Blacklist, 5 dialogs (new 30 Oct, not reviewed)* [ADM-ab-add] | *1750 × 970* | *0, 0, 1750 × 970 `Modal__Overlay`* | *STRETCH / STRETCH* | *Yes* |
| ADM · RN New / Edit / Delete / Bulk [ADM-note], [ADM-rn-edit], [ADM-rn-del], [ADM-rn-bulk] | 1750 × 980 | 0, 0, 1750 × 980 raw "Rectangle 1" filled with `colorIconHover` | MIN / MIN | No: raw shape, wrong token, typed size |
| ADM · KC 5 dialogs [ADM-upload], [ADM-kc-step2], [ADM-kc-replace], [ADM-kc-del], [ADM-kc-edit] | 1750 × 970 | 0, 0, 1750 × **1030** | MIN / MIN | No: 60 too tall |
| ADM · CFM validation, publish, remove dialogs (9 frames) e.g. [ADM-cfm-valid], [ADM-blocked], [ADM-publish], [ADM-cfm-global] | 1750 × 1358 | 0, 0, 1750 × **1440** | MIN / MIN | No: 82 too tall |
| ADM · CFM remove from target, validation warning [ADM-cfm-remove] | 1750 × 1358 | 0, 0, 1750 × 1360 | MIN / MIN | No: 2 too tall |
| ADM · CFM rollback, remove everywhere [ADM-rollback], [ADM-cfm-everywhere] | 1750 × 980 | 0, 0, 1750 × 980 | MIN / MIN, CENTER / MIN | Size OK, constraints not STRETCH |
| ADM · CFM file usage drawer [ADM-drawer] | 1750 × 980 | 256, 64, 1494 × 916 (`Drawer` mask) | CENTER / MIN | No: sidebar and topbar unmasked |
| ADM · Lead Time 6 dialogs [ADM-lead-import], [ADM-lead-error] | 1750 × 1362 | 256, 0, 1494 × 1362 hand-built "Backdrop" frame in "Right" | STRETCH / STRETCH | No: sidebar unmasked, not `Modal__Overlay` |
| CON · Submittal, BOM [CON-submittal], [CON-bom] | 1750 × 970 | 0, 0, 1750 × 970 | CENTER / CENTER | Size OK, constraints not STRETCH |
| PS · 5 dialogs [PS-submittal], [PS-bom], [PS-modal] | 1750 × 1130 / 1076 | Full frame | CENTER / CENTER | Size OK, constraints not STRETCH |
| US · Add variant to BOM [US-add] | 1750 × 1098 | Full frame | CENTER / CENTER | Size OK, constraints not STRETCH |
| US · Select variation [US-variation] | 1750 × 1156 | 0, **11**, 1750 × **1134** | CENTER / CENTER | No: 22 short, offset |
| US · Create new BOM, 2 stacked overlays [US-stack] | 1750 × 1242 | 0, **−2**, 1750 × 1246 | CENTER / CENTER | No: offset |
| BOM · Delete confirmation [BOM-delete] | 1750 × 900 | Full frame | MIN / CENTER | Size OK, constraints not STRETCH |
| BOM · Upload destination [BOM-upload] | 1750 × 1132 | −1, −7, 1751 × 1150 | CENTER / CENTER | No: offset, too big |
| BOM · Stop editing [BOM-stop] | 1750 × 1204 | −1, −68, 1751 × 1341 | CENTER / CENTER | No: offset, too big |
| BOM · Row edit [BOM-edit] | 1750 × 1196 | −1, −45, 1751 × 1286 | CENTER / CENTER | No: offset, too big |
| BOM · Filtered row edit, edit variant [BOM-edit-f] | 1750 × 980 | 0, 1, 1751 × 979 | MIN / MIN | No: 1 px offset |
| BOM · Skipped rows filter [BOM-skipped] | 1750 × 1462 | 0, −1, 1751 × **1389** | MIN / MIN | No: 72 short |
| SPEC · Upload (5 states), Download Master SPEC [SPEC-upload], [SPEC-selected], [SPEC-download] | 1728 × 1000 | **−1**, 0, 1729 × 1000 | CENTER / CENTER, MIN / MIN | No: 1 px offset |

### 8.5 DS gaps for forms

- No **Form item** molecule (label + control + caption with fixed 8 px gaps); every module builds the stack by hand.
- No **modal width** presets or tokens (538 / 681 / 1135).
- DS `Modal` body uses a raw 10 px gap; `Modal__Overlay` uses raw 100 px padding (inside the DS — report to the DS owner, do not fix in modules).
- No **Table cell** variant that holds small buttons: type=action renders text links only (§7.2).

---

## 9. Figma canvas organisation

### 9.1 Rules (User rule, 30 Oct)

Applies to every module page in every RSFC file. Raw colours below are allowed **only** for canvas organisation, never inside screen frames.

| Item | Rule |
|---|---|
| Page canvas | `#787A7E` |
| Section fill | White `#FFFFFF` at 10 % |
| Section names | `NN · Name` |
| Top-level sections | x 0, stacked from y 0, 290 apart |
| Inside a section | 48 left and right, 80 top, 140 bottom; the section is sized to fit its content |
| Screens | In reading order, 96 apart in a row, at most three 1750-wide screens per row; the next row sits 210 below the tallest screen of the row |
| Nested section | Gets its own row, 290 below the previous row |
| What may change when arranging | Only x, y, section size and fill. Nothing is deleted, renamed or reparented; screens are never resized or edited |
| Reference pages | Admin - RSFC · Access Blacklist [ADM-page-ab] and Knowledge Center [ADM-page-kc] |

Status: applied to all Admin - RSFC module pages on 30 Oct. **Content, Release Notes, Part Search, Unified Search, BOM and SPEC have not been arranged this way yet.**

### 9.2 Measured 30 Oct (module pages)

| File | Page | Canvas | Section fills | OK? |
|---|---|---|---|---|
| Admin - RSFC | Dashboard, Release Notes, Access Blacklist, Knowledge Center, Content, Companies, Users, Company Roles, Admin Roles, Feature Access Limit | `#787A7E` | `#FFFFFF` 10 % (all) | Yes |
| Admin - RSFC | Cover · Change Log · Archive (not module pages) | `#1E1E1E` · `#F5F5F5` · `#E5E5E5` | – · – · `#29444F`, `#000000` 20 %, `#FFFFFF` | Out of scope |
| Content - RSFC | Content Download History [CON-page] | `#5E9EBA` | `#29444F` 100 % | No |
| Release Notes - RSFC | Release Notes Flow [RN-page] | `#1E1E1E` | `#CEE7FF` 100 % | No |
| Part Search - RSFC | Part Listing Flow [PS-page] | `#5E9EBA` | `#29444F`, `#444444` ("Working") | No |
| Part Search - RSFC | Category Page [PS-cat-page] | `#1E1E1E` | No sections | No |
| Unified Search - RSFC | Part Detail Flow [US-page] | `#E5E5E5` | `#29444F` | No |
| Unified Search - RSFC | Cross-module Guidance · Banners · Global Notifications | `#1E1E1E` · `#E5E5E5` · `#E5E5E5` | `#29444F` · `#C3C4C6`, `#444444` · no sections | No |
| BOM - RSFC | BOM Flows [BOM-page] | `#5E9EBA` | `#29444F` ×6, `#416375` ×4 | No |
| BOM - RSFC | Warnings & Errors · Cheat Sheet · Local Components | `#1E1E1E` | `#29444F` · `#444444` · `#EADAE4` | No |
| SPEC - RSFC | SPEC Flows [SPEC-page] | `#5E9EBA` | 9 fills: `#4B7C91`, pastel tints at 40 %, `#F05A23` | No |
| SPEC - RSFC | Category tags and usage | `#5E9EBA` | `#FFFFFF` 100 % | No |

Placement: non-Admin files keep top-level sections far from the origin (e.g. x 57782 in Content, Part Search and BOM; x −13334 in SPEC).

---

## Open questions

- Page title level (#1): is `Title/Heading 3` the agreed page-title role? The DS has no page-header component to settle it.
- DS gaps seen in practice: page header (title + description + actions), key–value description list (PS spec grid), wizard step bar (BOM), bulk-action toolbar, empty-state card padding (80 px has no token).
- The DS AI contract says `colorIcon` is 45% black; the `colorIcon` variable resolves to 100% black in Light. Which is correct?
- ADM Dashboard breadcrumb reads "Content / Content File Manager" [ADM-dash]. Copy issue for the design owner, not changed.
- CFM "Remove everywhere (global)": does the file stay in storage (→ "Remove") or is it destroyed (→ "Delete")? The receipts log it as "DELETE GLOBAL" [ADM-receipts]. Decides the verb in §7.2.
- Single-row Delete in BOM Hub and SPEC list has no confirmation frame; only bulk delete is designed. Is the same `Modal__Confirmation` intended?
- Field → field spacing: 24 (Ant Form default, proposed) or 16 (ADM RN note modal, the earlier recommendation)?
- Save-failed `Alert`: top of the modal body (proposed) or just above the footer (*AB, new 30 Oct*)?
- Row buttons vs DS `Table cell` type=action (text links): the user rule asks for one style; this doc proposes small default buttons because 5 of 9 tables use them. Confirm.
- DS gaps from §7–§8: Form item molecule, modal width presets, Table cell with buttons; raw 10 px gap in DS `Modal` body and raw 100 px padding in `Modal__Overlay`.

## Coverage

| Module | Pages covered | Screens sampled (all screenshot-checked except where noted) |
|---|---|---|
| ADM | Dashboard, Release Notes, Knowledge Center, Content (CFM, CFM CON-231, Lead Time Uploader) | 15: [ADM-dash], [ADM-rn], [ADM-note], Delete Note, Empty State, [ADM-kc], [ADM-upload], [ADM-loading], [ADM-error], [ADM-cfm], [ADM-blocked], [ADM-publish], [ADM-drawer], [ADM-lead], Result Summary |
| CON | Content Download History | 3: [CON-hist], [CON-empty], [CON-checked] |
| RN | Release Notes Flow | 3: [RN-modal], [RN-all], Profile Menu |
| PS | Part Listing Flow, Category Page | 3: [PS-list], [PS-modal], [PS-cat] |
| US | Part Detail Flow, Cross-module Guidance (no entry node; pages found by scan) | 4 UI screens: [US-detail], [US-variation], [US-stack], [US-hub]; plus the Global Notifications flow diagram, excluded from statistics |
| BOM | BOM Flows, BOM Warnings & Errors, Cheat Sheet | 12: [BOM-hub], [BOM-delete], [BOM-empty], [BOM-map], [BOM-parse], [BOM-edit], [BOM-guided], [BOM-results], [BOM-ws], [BOM-exp], warnings 6705:9, cheat sheet 6497:60325 |
| SPEC | SPEC Flows (Release 1 section) | 8: [SPEC-list], [SPEC-bulk], [SPEC-upload], [SPEC-dash], [SPEC-rev], [SPEC-detail], [SPEC-exp], [SPEC-analyzing] |

- **Skipped:** Cover, Change Log, Archive, Draft, Local Components and "To design" pages and sections (ADM Access Blacklist, Companies, Users, Roles, Feature Access Limit are empty placeholders); SPEC rebranding comparison and brand-guideline boards; US Banners working files.
- **Partial data:** the BOM bridge connection kept dropping, so the deep layout tree covers 6 BOM screens; the other 6 were measured with a lighter query (page header, top-level blocks, text and instance statistics). The DS file version could not be read (REST token invalid); the DS was read live on 2026-10-29.
- **Not measured:** spacing inside DS instances (table cells, buttons), by design.
- **Tools:** figma-console Desktop Bridge (`figma_execute`, `figma_capture_screenshot`), files pinned with `figma_navigate` `lock: true`. No Figma writes.

**30 Oct pass (§7–§9):**

| Module | Frames measured (node data) | Screenshot-checked |
|---|---|---|
| ADM | RN admin list, New / Edit / Delete note, Bulk upload; KC Manual Files, row menu, Upload step 1 and 2, Replace, Edit Recipients, Delete, empty; CFM figure result, Manage menu, remove from target, remove everywhere, 9 validation / publish dialogs, receipts, rollback, file usage drawer; Lead Time 6 import dialogs; *Access Blacklist list + 5 dialogs (new 30 Oct, not reviewed)*; all pages for canvas | RN list, New note, KC row menu, KC empty, CFM Manage menu, receipts, Lead Time import, *AB list, AB add entry* |
| CON | Download history; Submittal and BOM modals | Download history |
| RN | – (no row actions or form modals in the module file) | – |
| PS | Add to Submittal Package, Add to BOM, 3 variant pickers | – (inferred from node data) |
| US | Select variation, Add variant to BOM, Create new BOM (stacked) | Add variant to BOM |
| BOM | Hub, bulk, delete, upload destination, parsing review, row edit (3), stop editing, workspace, matching results, skipped rows | Hub, row edit, workspace |
| SPEC | Project list, bulk, upload (5 states), Download Master SPEC, "RSFC - SI Adjusted" | Project list |

- **Skipped:** Archive, Draft and "To design" sections; SPEC "03 — Upload a new version (NOT FOR RELEASE 1)"; Admin placeholder pages (Companies, Users, Roles, Feature Access Limit are empty "To design" sections).
- **Not reached:** the figma-console Desktop Bridge had no files connected, so this pass used the official Figma MCP (`use_figma` read-only scripts, `get_screenshot`). All 7 files opened. PS and part of SPEC / CON form modals are measured from node data only (Inferred).
- **Canvas data** (§9.2): page backgrounds and section fills read for every page of all 7 files.

<!-- Figma links -->
[ADM-dash]: https://www.figma.com/design/rONB8aMPanOjS3GC1uN16d/Admin-RSFC?node-id=2985-65664
[ADM-rn]: https://www.figma.com/design/rONB8aMPanOjS3GC1uN16d/Admin-RSFC?node-id=2218-10670
[ADM-note]: https://www.figma.com/design/rONB8aMPanOjS3GC1uN16d/Admin-RSFC?node-id=2218-10996
[ADM-kc]: https://www.figma.com/design/rONB8aMPanOjS3GC1uN16d/Admin-RSFC?node-id=2803-18583
[ADM-upload]: https://www.figma.com/design/rONB8aMPanOjS3GC1uN16d/Admin-RSFC?node-id=2885-7184
[ADM-loading]: https://www.figma.com/design/rONB8aMPanOjS3GC1uN16d/Admin-RSFC?node-id=2880-5321
[ADM-error]: https://www.figma.com/design/rONB8aMPanOjS3GC1uN16d/Admin-RSFC?node-id=2880-6034
[ADM-cfm]: https://www.figma.com/design/rONB8aMPanOjS3GC1uN16d/Admin-RSFC?node-id=2009-5440
[ADM-blocked]: https://www.figma.com/design/rONB8aMPanOjS3GC1uN16d/Admin-RSFC?node-id=2016-4901
[ADM-publish]: https://www.figma.com/design/rONB8aMPanOjS3GC1uN16d/Admin-RSFC?node-id=2016-12730
[ADM-drawer]: https://www.figma.com/design/rONB8aMPanOjS3GC1uN16d/Admin-RSFC?node-id=2443-44478
[ADM-lead]: https://www.figma.com/design/rONB8aMPanOjS3GC1uN16d/Admin-RSFC?node-id=2504-21949
[CON-hist]: https://www.figma.com/design/pGzqSs0fMmuQ2BtjbMNVjP/Content-RSFC?node-id=5289-21286
[CON-empty]: https://www.figma.com/design/pGzqSs0fMmuQ2BtjbMNVjP/Content-RSFC?node-id=9018-1520
[CON-checked]: https://www.figma.com/design/pGzqSs0fMmuQ2BtjbMNVjP/Content-RSFC?node-id=9018-1693
[RN-modal]: https://www.figma.com/design/a4gviD5oViRhasSCN6cC8Z/Release-Notes-RSFC?node-id=1-5013
[RN-all]: https://www.figma.com/design/a4gviD5oViRhasSCN6cC8Z/Release-Notes-RSFC?node-id=172-12107
[PS-list]: https://www.figma.com/design/fyhH2NtH20puYbGLDChPwn/Part-Search-RSFC?node-id=11024-17010
[PS-modal]: https://www.figma.com/design/fyhH2NtH20puYbGLDChPwn/Part-Search-RSFC?node-id=11059-23573
[PS-cat]: https://www.figma.com/design/fyhH2NtH20puYbGLDChPwn/Part-Search-RSFC?node-id=11114-5848
[US-detail]: https://www.figma.com/design/usBJj4PPK8naOgJdi31Lgt/Unified-Search-RSFC?node-id=268-2939
[US-variation]: https://www.figma.com/design/usBJj4PPK8naOgJdi31Lgt/Unified-Search-RSFC?node-id=311-3935
[US-stack]: https://www.figma.com/design/usBJj4PPK8naOgJdi31Lgt/Unified-Search-RSFC?node-id=287-2332
[US-hub]: https://www.figma.com/design/usBJj4PPK8naOgJdi31Lgt/Unified-Search-RSFC?node-id=412-9109
[US-img]: https://www.figma.com/design/usBJj4PPK8naOgJdi31Lgt/Unified-Search-RSFC?node-id=311-14039
[BOM-hub]: https://www.figma.com/design/Ht3Up5MlRAKjK7eCuAy05L/BOM-RSFC?node-id=5289-21286
[BOM-delete]: https://www.figma.com/design/Ht3Up5MlRAKjK7eCuAy05L/BOM-RSFC?node-id=5289-22269
[BOM-empty]: https://www.figma.com/design/Ht3Up5MlRAKjK7eCuAy05L/BOM-RSFC?node-id=5758-50189
[BOM-map]: https://www.figma.com/design/Ht3Up5MlRAKjK7eCuAy05L/BOM-RSFC?node-id=5568-198213
[BOM-parse]: https://www.figma.com/design/Ht3Up5MlRAKjK7eCuAy05L/BOM-RSFC?node-id=5495-137734
[BOM-edit]: https://www.figma.com/design/Ht3Up5MlRAKjK7eCuAy05L/BOM-RSFC?node-id=5570-200450
[BOM-guided]: https://www.figma.com/design/Ht3Up5MlRAKjK7eCuAy05L/BOM-RSFC?node-id=5572-204077
[BOM-results]: https://www.figma.com/design/Ht3Up5MlRAKjK7eCuAy05L/BOM-RSFC?node-id=5585-299503
[BOM-ws]: https://www.figma.com/design/Ht3Up5MlRAKjK7eCuAy05L/BOM-RSFC?node-id=5709-49278
[BOM-exp]: https://www.figma.com/design/Ht3Up5MlRAKjK7eCuAy05L/BOM-RSFC?node-id=5604-28119
[SPEC-list]: https://www.figma.com/design/KmU1mTvL7D1fLZvJ8SIGTN/SPEC-RSFC?node-id=8023-33296
[SPEC-bulk]: https://www.figma.com/design/KmU1mTvL7D1fLZvJ8SIGTN/SPEC-RSFC?node-id=8475-8201
[SPEC-upload]: https://www.figma.com/design/KmU1mTvL7D1fLZvJ8SIGTN/SPEC-RSFC?node-id=8028-37307
[SPEC-dash]: https://www.figma.com/design/KmU1mTvL7D1fLZvJ8SIGTN/SPEC-RSFC?node-id=8362-8936
[SPEC-rev]: https://www.figma.com/design/KmU1mTvL7D1fLZvJ8SIGTN/SPEC-RSFC?node-id=8066-124202
[SPEC-detail]: https://www.figma.com/design/KmU1mTvL7D1fLZvJ8SIGTN/SPEC-RSFC?node-id=8066-127371
[SPEC-exp]: https://www.figma.com/design/KmU1mTvL7D1fLZvJ8SIGTN/SPEC-RSFC?node-id=8112-21531
[SPEC-analyzing]: https://www.figma.com/design/KmU1mTvL7D1fLZvJ8SIGTN/SPEC-RSFC?node-id=8482-31140
[ADM-rn-edit]: https://www.figma.com/design/rONB8aMPanOjS3GC1uN16d/Admin-RSFC?node-id=2218-11057
[ADM-rn-del]: https://www.figma.com/design/rONB8aMPanOjS3GC1uN16d/Admin-RSFC?node-id=2218-11282
[ADM-rn-bulk]: https://www.figma.com/design/rONB8aMPanOjS3GC1uN16d/Admin-RSFC?node-id=2218-11484
[ADM-ab]: https://www.figma.com/design/rONB8aMPanOjS3GC1uN16d/Admin-RSFC?node-id=3001-49
[ADM-ab-add]: https://www.figma.com/design/rONB8aMPanOjS3GC1uN16d/Admin-RSFC?node-id=3006-4428
[ADM-ab-invalid]: https://www.figma.com/design/rONB8aMPanOjS3GC1uN16d/Admin-RSFC?node-id=3005-2662
[ADM-ab-fail]: https://www.figma.com/design/rONB8aMPanOjS3GC1uN16d/Admin-RSFC?node-id=3005-3120
[ADM-ab-remove]: https://www.figma.com/design/rONB8aMPanOjS3GC1uN16d/Admin-RSFC?node-id=3005-3188
[ADM-ab-removefail]: https://www.figma.com/design/rONB8aMPanOjS3GC1uN16d/Admin-RSFC?node-id=3005-3256
[ADM-ab-error]: https://www.figma.com/design/rONB8aMPanOjS3GC1uN16d/Admin-RSFC?node-id=3005-3483
[ADM-rn-error]: https://www.figma.com/design/rONB8aMPanOjS3GC1uN16d/Admin-RSFC?node-id=3107-7456
[ADM-fal-error]: https://www.figma.com/design/rONB8aMPanOjS3GC1uN16d/Admin-RSFC?node-id=3083-4729
[ADM-kc-menu]: https://www.figma.com/design/rONB8aMPanOjS3GC1uN16d/Admin-RSFC?node-id=2885-32591
[ADM-kc-del]: https://www.figma.com/design/rONB8aMPanOjS3GC1uN16d/Admin-RSFC?node-id=2881-5833
[ADM-kc-replace]: https://www.figma.com/design/rONB8aMPanOjS3GC1uN16d/Admin-RSFC?node-id=2881-5629
[ADM-kc-edit]: https://www.figma.com/design/rONB8aMPanOjS3GC1uN16d/Admin-RSFC?node-id=2885-7487
[ADM-kc-step2]: https://www.figma.com/design/rONB8aMPanOjS3GC1uN16d/Admin-RSFC?node-id=2881-5362
[ADM-kc-empty]: https://www.figma.com/design/rONB8aMPanOjS3GC1uN16d/Admin-RSFC?node-id=2880-4140
[ADM-cfm-menu]: https://www.figma.com/design/rONB8aMPanOjS3GC1uN16d/Admin-RSFC?node-id=2116-41888
[ADM-cfm-remove]: https://www.figma.com/design/rONB8aMPanOjS3GC1uN16d/Admin-RSFC?node-id=2131-85589
[ADM-cfm-everywhere]: https://www.figma.com/design/rONB8aMPanOjS3GC1uN16d/Admin-RSFC?node-id=2456-65651
[ADM-cfm-global]: https://www.figma.com/design/rONB8aMPanOjS3GC1uN16d/Admin-RSFC?node-id=2016-12499
[ADM-cfm-valid]: https://www.figma.com/design/rONB8aMPanOjS3GC1uN16d/Admin-RSFC?node-id=2016-4692
[ADM-receipts]: https://www.figma.com/design/rONB8aMPanOjS3GC1uN16d/Admin-RSFC?node-id=2016-16352
[ADM-rollback]: https://www.figma.com/design/rONB8aMPanOjS3GC1uN16d/Admin-RSFC?node-id=2016-28234
[ADM-lead-import]: https://www.figma.com/design/rONB8aMPanOjS3GC1uN16d/Admin-RSFC?node-id=2601-29593
[ADM-lead-error]: https://www.figma.com/design/rONB8aMPanOjS3GC1uN16d/Admin-RSFC?node-id=2504-23027
[ADM-page-ab]: https://www.figma.com/design/rONB8aMPanOjS3GC1uN16d/Admin-RSFC?node-id=2958-63285
[ADM-page-kc]: https://www.figma.com/design/rONB8aMPanOjS3GC1uN16d/Admin-RSFC?node-id=2803-16056
[CON-submittal]: https://www.figma.com/design/pGzqSs0fMmuQ2BtjbMNVjP/Content-RSFC?node-id=9030-7076
[CON-bom]: https://www.figma.com/design/pGzqSs0fMmuQ2BtjbMNVjP/Content-RSFC?node-id=9030-8465
[CON-page]: https://www.figma.com/design/pGzqSs0fMmuQ2BtjbMNVjP/Content-RSFC?node-id=673-23362
[RN-page]: https://www.figma.com/design/a4gviD5oViRhasSCN6cC8Z/Release-Notes-RSFC?node-id=0-1
[PS-submittal]: https://www.figma.com/design/fyhH2NtH20puYbGLDChPwn/Part-Search-RSFC?node-id=11059-22758
[PS-bom]: https://www.figma.com/design/fyhH2NtH20puYbGLDChPwn/Part-Search-RSFC?node-id=11059-20915
[PS-page]: https://www.figma.com/design/fyhH2NtH20puYbGLDChPwn/Part-Search-RSFC?node-id=673-23362
[PS-cat-page]: https://www.figma.com/design/fyhH2NtH20puYbGLDChPwn/Part-Search-RSFC?node-id=11255-6796
[US-add]: https://www.figma.com/design/usBJj4PPK8naOgJdi31Lgt/Unified-Search-RSFC?node-id=311-8331
[US-page]: https://www.figma.com/design/usBJj4PPK8naOgJdi31Lgt/Unified-Search-RSFC?node-id=0-1
[BOM-upload]: https://www.figma.com/design/Ht3Up5MlRAKjK7eCuAy05L/BOM-RSFC?node-id=5289-28546
[BOM-stop]: https://www.figma.com/design/Ht3Up5MlRAKjK7eCuAy05L/BOM-RSFC?node-id=5492-135987
[BOM-edit-f]: https://www.figma.com/design/Ht3Up5MlRAKjK7eCuAy05L/BOM-RSFC?node-id=5570-202488
[BOM-skipped]: https://www.figma.com/design/Ht3Up5MlRAKjK7eCuAy05L/BOM-RSFC?node-id=5585-301031
[BOM-page]: https://www.figma.com/design/Ht3Up5MlRAKjK7eCuAy05L/BOM-RSFC?node-id=673-23362
[SPEC-selected]: https://www.figma.com/design/KmU1mTvL7D1fLZvJ8SIGTN/SPEC-RSFC?node-id=8305-89097
[SPEC-download]: https://www.figma.com/design/KmU1mTvL7D1fLZvJ8SIGTN/SPEC-RSFC?node-id=8156-110292
[SPEC-adjusted]: https://www.figma.com/design/KmU1mTvL7D1fLZvJ8SIGTN/SPEC-RSFC?node-id=8512-87365
[SPEC-page]: https://www.figma.com/design/KmU1mTvL7D1fLZvJ8SIGTN/SPEC-RSFC?node-id=8001-45823
