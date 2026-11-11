# Admin module plan — Dashboard

Status: **planned on 2026-10-30**. Waiting for "Build approved: Dashboard".

Live walk: **not done** (Screen Recording is off). Every screen is marked **Source** and listed under "Not seen live".

Product source read with `gh api` (`ooden-tech/on-hydra-app`, HEAD on 30 Oct): admin `router.tsx` (`AppRoute.DASHBOARD` renders `business/analytics/pages/AnalyticsPage`), `navigation.tsx`, admin `en/translation.json` (`analytics.*`), `AnalyticsPage/index.tsx` and its components `AnalyticsFiltersCard`, `UserExportCSV`, `AnalyticsGlobalMetricsSection`, `AnalyticsSpecificMetricsSection`, `AnalyticsMetricStat`, `SavePresetModal`, `ManagePresetsModal`, `DeletePresetModal`; `hooks/useToolAnalytics.ts`, `utils/analyticsDateRange.ts`; admin `components/Header/index.tsx` and `Header/Breadcrumbs/index.tsx`.

Read before planning: the agent file (30 Oct), the ledger, the Feature Access Limit plan with its Build outcome (shell, extra sidebar item), the Users audit fixes in the ledger, the 28 Oct audit (`Documents/plans/2026-10-28-jira-admin-figma-audit-task.md`, `Documentation/hidra-admin-figma-audit.html`), `Documentation/hydra-ux-patterns.md` §2, §7, §8, `Documentation/molecules/stat-tile.html`, `module-layout.md`, `hydra-ux-audit` Layer 1. Figma read this run (read-only): Dashboard page `2958:63284` (metadata), frame `2483:68240` (screenshot), Filters card `2981:64839` (variables), Feature Access Limit L-01 `3083:3582` (screenshot), Hydra library search (Hydra key only).

## What the product does (source)

- One page, `/dashboard`, sidebar item **Dashboard** (`RiDashboard2Fill`), first in the sidebar. Browser title and page title "Dashboard"; description "Review global KPIs and company-scoped tool analytics for the selected reporting window."
- Breadcrumb: home icon / Dashboard (no parent group).
- **Filters card** (title "Filters"; header actions: primary "Apply filters" (loading while metrics load), default "Reset filters"):
  - **Reporting window**: label "Date range"; five small buttons Past week · Past month · Past year · All time · Custom (the selected one is primary); a date range picker (Start date / End date), disabled unless Custom; hint "The start date is inclusive and the end date is exclusive." Default on open: the last 7 days with **Custom** selected.
  - **Specific analytics scope**: description "Metrics below roll up across all companies by default. …"; checkbox "Include SpaceInch/RSFC usage" (on by default, tooltip "Uncheck to exclude SpaceInch/RSFC internal users and companies from all metrics below.").
  - **Saved preset** Select ("Select a saved preset"), small buttons "Save as preset" (or "Update current preset" when a preset is selected) and "Manage presets". "Save as preset" is disabled until filters are applied and at least one company is chosen (tooltip "Apply your filters before saving or updating the preset."). When the selected preset no longer matches the filters: warning text "Filters have changed since this preset was applied."
  - **Companies** multi-select ("Select companies", helper text) and **Users (optional)** multi-select ("Select users", disabled until a company is chosen).
- **Export Users CSV**: a default button on its own row under the Filters card. Exports the users of the **applied** scope. Messages "Users exported successfully" / "Failed to export users".
- **Global KPIs**: three cards Users · Companies · Projects (antd `Statistic` in a `Card`). They use the **same applied scope** as Specific analytics.
- **Specific analytics**: title follows the applied scope, e.g. "Specific analytics — All companies · 2026-10-24 – 2026-10-30" or "Specific analytics (First Test Company, ASC-ES · All users · …)". Cards: SeisBrace (Seismic designs, Braces), Content (Part downloads, Parts added to cart), Submittal Manager (Submittal packages, Submittal package downloads), and a full-width BOM card with 8 counts.
- **Loading**: a `Spin` ("Loading analytics...") over each metrics section; Apply filters shows its loading state; selects are disabled.
- **Error**: per section, an error `Alert` ("Unable to load global KPIs." / "Unable to load specific analytics.", description "Unable to load analytics."). No retry.
- **Presets**: "Save as preset" modal (420 wide, one name field without a label, placeholder "e.g. Key RSFC accounts", Cancel · Save; errors "Enter a name for this preset.", "Name must be 255 characters or fewer.", "A preset with this name already exists."). "Manage saved presets" modal with a table (Name, Companies, Users, SpaceInch/RSFC usage, Last updated by, Actions: Rename · Update to current filters · Delete, as link buttons with "·" separators) or `Empty` "No saved presets yet.". Rename reuses the save modal ("Rename preset"). "Update to current filters" asks "Update preset?". Delete opens "Delete preset" with a danger "Delete". Messages: Preset saved / renamed / updated / deleted, Failed to save the preset, Failed to delete the preset.

## Target

- **File:** Admin - RSFC (`rONB8aMPanOjS3GC1uN16d`)
- **Page:** `Dashboard` (`2958:63284`): https://www.figma.com/design/rONB8aMPanOjS3GC1uN16d/Admin---RSFC?node-id=2958-63284
- **Existing nodes (all treated as protected, per the user):**
  - Section `Dashboard · Current design · Needs changes` (`2958:63292`), x 0, y 0, 1846 x 1724.
  - Frame `Dashboard` (`2483:68240`), 1750 x 1504, at (48, 80) in that section: https://www.figma.com/design/rONB8aMPanOjS3GC1uN16d/Admin---RSFC?node-id=2483-68240
- **Ready for Dev:** not readable (Plugin API refuses `devStatus`, REST token invalid, as in every earlier run). The section name says "Needs changes", not Ready for Dev. The frame is treated as protected anyway: move only.
- **Canvas look:** page background `#787A7E` and section fill white 10% were set by the 30 Oct arrangement run; re-check at BUILD and apply to every new section.
- **Sections** (plain Sections at x 0, 290 apart; inside: 48 left and right, 80 top, 140 bottom, 96 between screens, max 3 per row; height = 80 + tallest screen + 140, computed at BUILD):

| Section | Holds (lean set) | Optional additions |
|---|---|---|
| `01 · List` (y 0) | **E-00 moved here** (Question 1), L-01 | L-02, L-03 |
| `02 · Create` | C-01, C-02 | ER-03 |
| `03 · Edit` | only if ED-01 is approved | ED-01 |
| `03 · Dialogs` (`04 ·` with Edit) | DI-01, DI-02 | DI-03 |
| `04 · Empty` | EM-01 | |
| `05 · Loading` | LO-01 | |
| `06 · Error` | ER-01, ER-02 | |
| `07 · Success` | S-01, S-02 | S-03 |

  No Detail section: the product has none. Numbering is consecutive, as on Access Blacklist and Users.
- **Frame size:** 1750 fixed width, hug height, minimum 970. **Names:** `NN.MM · Dashboard · <Screen> · <State>`.
- **Copy sources (copy and adapt; originals never edited):**

| New | Cloned from | Main change on the copy |
|---|---|---|
| L-01 | Shell: Feature Access Limit L-01 `3083:3582`. Content: Filters card `2981:64839` and page header `2969:64018` cloned from the protected frame (clones only) | Sidebar: Dashboard `selected=true` through the `.menu__item` variant, the extra linked Feature Access Limit item `selected=false`, Users collapsed (DownOutlined `2798:23926`); breadcrumb `items=2` HomeOutlined / Dashboard (as Access Blacklist); table card replaced by: page header, Filters card, Export row, Global KPIs, Specific analytics |
| L-02, L-03 | L-01 | Filter states only (see Screens) |
| C-01, C-02, ED-01, ER-03 | L-01 + Access Blacklist Add entry `3006:4428` (overlay, `Modal`, `Input__Label`, `Input`) and Invalid value `3005:2662` (`Input__Caption` error) | Form modal per §8.3 |
| DI-01, EM-01 | L-01 + `3006:4428` overlay and `Modal`; table rows from Access Blacklist L-01 `3001:49` | Manage saved presets |
| DI-02, DI-03 | DI-01 + Access Blacklist Remove entry `3005:3188` (`Modal__Confirmation` in `Modal__Overlay` via `🎰 modal`) | Stacked confirmation over the Manage modal |
| LO-01, ER-01 | L-01 + Companies Loading `3022:6341` (Spin) / Error `3022:6104` (Alert + Retry) | State block in each metrics section |
| ER-02, S-01, S-02, S-03 | L-01 + Message from Companies `3022:9469` | `Message` centred at y 16 |

  **BUILD pre-check:** the source frames still carry the 30 Oct fixes (labels without colons, Users collapsed with DownOutlined, HomeOutlined breadcrumb, selection through the `.menu__item` variant, the extra Feature Access Limit item). The cloned Filters card uses Hydra variables and text styles (read 30 Oct: `Title/Heading 3`, `Title/Heading 5`, `Base/Normal`, `Small/Normal`, `Large/Normal`, `padding*` / `margin*`, `colorText*`, `colorBorder*`, `boxShadowTertiary`); BUILD still scans every cloned node and rebinds a raw value, or stops if no variable fits.

## Screens

Live status: **Source** = read from product source. Sample data: 2 companies (First Test Company, ASC-ES, as on Companies), 1 user, window 2026-10-24 – 2026-10-30, preset "Key RSFC accounts".

| # | Screen | Route | Section | State | Action | Live status |
|---|---|---|---|---|---|---|
| E-00 | Dashboard (existing) | `/dashboard` | 01 List | Default, all companies, Custom window | **Move only** (`2483:68240`) | Figma |
| L-01 | Dashboard · Company scope applied | `/dashboard` | 01 List | 2 companies + 1 user applied, Past week primary, Export Users CSV, Global KPIs and Specific analytics for that scope | New | Source |
| L-02 *(opt.)* | Dashboard · Preset changed | `/dashboard` | 01 List | Preset "Key RSFC accounts" selected, one company removed, warning "Filters have changed since this preset was applied.", button "Update current preset" | New | Source |
| L-03 *(opt.)* | Dashboard · All time | `/dashboard` | 01 List | All time primary, range picker disabled, title "… · All time" | New | Source |
| C-01 | Save as preset · Default | `/dashboard` | 02 Create | Modal 538, label "Preset name", value typed, Cancel · Save | New | Source |
| C-02 | Save as preset · Name already used | `/dashboard` | 02 Create | `Input` error + caption "A preset with this name already exists.", Save disabled (as live) | New | Source |
| ER-03 *(opt.)* | Save as preset · Save failed | `/dashboard` | 02 Create | Error `Alert` at the top of the body, modal stays open | New | Source (live shows a toast) |
| ED-01 *(opt.)* | Rename preset | `/dashboard` | 03 Edit | Same modal, prefilled, "Save changes" disabled until changed | New | Source |
| DI-01 | Manage saved presets · List | `/dashboard` | Dialogs | Modal 1135 (table picker width), 3 presets, row actions per §7 | New | Source |
| DI-02 | Delete preset · Confirm | `/dashboard` | Dialogs | `Modal__Confirmation` stacked over DI-01, danger "Delete" | New | Source |
| DI-03 *(opt.)* | Update preset · Confirm | `/dashboard` | Dialogs | `Modal__Confirmation`, primary (orange) "Update preset" | New | Source |
| EM-01 | Manage saved presets · No presets yet | `/dashboard` | Empty | `❖ Empty State Block` in the modal body | New | Source |
| LO-01 | Dashboard · Loading analytics | `/dashboard` | Loading | Apply filters loading, selects disabled, `Spin` "Loading analytics..." centred in each metrics section | New | Source |
| ER-01 | Dashboard · Analytics failed to load | `/dashboard` | Error | Error `Alert` + "Retry" in Global KPIs and in Specific analytics | New | Source |
| ER-02 | Dashboard · Export failed | `/dashboard` | Error | `Message type=error` | New | Source |
| S-01 | Dashboard · Users exported | `/dashboard` | Success | `Message type=success` | New | Source |
| S-02 | Dashboard · Preset saved | `/dashboard` | Success | Preset Select shows "Key RSFC accounts", button "Update current preset", `Message` "Preset saved." | New | Source |
| S-03 *(opt.)* | Dashboard · Preset deleted | `/dashboard` | Success | `Message` "Preset deleted.", Manage modal closed | New | Source |

**Count (lean set, my default): 1 Move, 11 New, 0 Keep, 0 Rebuild, 0 Blocked.** With all six optional screens: 17 New.

### Not in the product (so not drawn)

- An empty dashboard: counts show 0, never an empty state.
- Separate screens for the Users select or preset Select dropdowns (borderline; ask if wanted).

## Hydra components per screen

Searched live in Hydra Ant Design - DS only (`includeLibraryKeys` = `lk-0d30b3c5…19ed`) on 30 Oct. Found: `Stat Tile` (set `86e5eae0…`, tone / ✏️ label / ✏️ value), `Statistic` (`f475fa8e…`), `Segmented` (`a7ebcf58…`), `DatePicker` (`4d1bb40c…`), `Select` (`9ad44658…`), `Checkbox` (`044b4c3a…`), `Tooltip` (`deb6eda6…`), `Spin` (`36bf6103…`), `Alert` (`03685410…`), `Message` (`d8e5b62d…`), `Modal` (`7421b996…`), `Modal__Overlay` (`9cfd8b47…`), `Modal__Confirmation` (`ff12f0bc…`), `Empty State Block` (`ca63fa15…`), `Input` (`20cab57b…`), `Input__Label` (`4fd56a0d…`), `Input__Caption` (`eee798ba…`), `Table` (`87fe6b6c…`), `Table / Table cell` (`e5780965…`), `Table / Table Item / Header Item` (`71df4b80…`), `Dropdown` (`30d6fc1e…`), `DownloadOutlined` (`4e9482e7…`), `DashboardOutlined` (`229f6958…`). **No `Card` component** (known gap). Re-discover keys at BUILD.

| Need | Hydra component (variants / properties) | Used on |
|---|---|---|
| Shell | `Sidebar`, `Topbar`, `Breadcrumb items=2` (HomeOutlined / Dashboard), extra linked Feature Access Limit `.menu__submenu`, all from the copy | all |
| Page header | Inherited `Page title` / `Page description` text, with "Export Users CSV" on the right (UX-2) | all |
| Filters card | Cloned bound card `2981:64839`: `Button` primary "Apply filters" + default "Reset filters", `Segmented` (as the protected frame; see Question 6), `DatePicker` range, `Checkbox`, `Select`, `Tag` "Optional", `Button size=small` | all |
| Export | `Button` default + `DownloadOutlined` | all |
| Global KPIs | 3 x `Stat Tile tone=neutral` at FILL in a row (Question 4) | L-*, ER-02, S-* |
| Specific analytics | Title `Title/Heading 4`; per group a `Title/Heading 5` label + row of `Stat Tile tone=neutral` (SeisBrace 2, Content 2, Submittal Manager 2, BOM 8 in two rows of 4) | same |
| Form modal | `Modal__Overlay` + `Modal`, `Input__Label` vertical medium "Preset name", `Input` (placeholder "e.g. Key RSFC accounts"), `Input__Caption` error, footer Cancel · Save | C-01, C-02, ED-01, ER-03 |
| Manage presets | `Modal` 1135, `Table` header + `Table cell` (`type=text`, `type=tag` for Included / Excluded), Actions: `Table cell type=action` with text actions "Rename", "Update", "Delete" (`colorErrorText`), right-aligned (Q7 decision) | DI-01 |
| Confirmations | `Modal__Confirmation` in a second `Modal__Overlay`; overlays x 0, y 0, full frame, STRETCH / STRETCH | DI-02, DI-03 |
| Empty | `❖ Empty State Block`, `show action` off | EM-01 |
| Loading | `Spin size=large` with description, `Button` primary loading, `Select state=disabled` | LO-01 |
| Error | `Alert type=error` + `show description` + `Button` default "Retry" | ER-01, ER-03 |
| Toasts | `Message type=success / error`, centred at y 16 | ER-02, S-01, S-02, S-03 |

Text styles and variables: the set already on the Feature Access Limit copy and the Filters card. Nothing is created.

## UX improvements

Run with `hydra-ux-audit` Layer 1 on the source screens (effortless x PRD x functional, 5-second test, one primary, plain copy, every state, progressive disclosure). New frames only; E-00 is not touched.

- 5-second test: passes for "set filters, then Apply filters" (the only primary). Fails on Export Users CSV: a lone button between two sections that does not say which users it exports. Fails on "Global KPIs": the heading suggests totals, but the counts follow the applied filters.
- One primary per screen: "Apply filters" on page frames; "Save" / "Delete" / "Update preset" on dialog frames (the page primary sits under the overlay).
- States: load failures have no retry; save failures only show a toast.

| # | Improvement | Hydra component that carries it | Screens |
|---|---|---|---|
| UX-1 | Shared shell: 10 sidebar items with Dashboard selected, HomeOutlined / Dashboard breadcrumb, current top bar | `Sidebar`, `Breadcrumb items=2` | all new |
| UX-2 | "Export Users CSV" moves to the page header, right-aligned, default button with `DownloadOutlined`, tooltip "Exports the users that match the applied filters" | `Button`, `Tooltip` | all new page frames |
| UX-3 | KPI and analytics counts as one pattern: `Stat Tile` (label + value), groups labelled with `Title/Heading 5` instead of hand-built cards | `Stat Tile tone=neutral` | L-*, ER-02, S-* |
| UX-4 | One line under "Global KPIs": "Totals for the applied filters." | Text `Base/Normal`, `colorTextDescription` | L-*, LO-01, ER-01 |
| UX-5 | Load failure: per-section error Alert "Global KPIs couldn't load" / "Specific analytics couldn't load", "Check your connection and try again." + "Retry" | `Alert error`, `Button` | ER-01 |
| UX-6 | Save as preset modal on the §8.3 standard: label "Preset name" on top, width 538, footer Cancel · Save; duplicate name as a field error | `Modal`, `Input__Label`, `Input`, `Input__Caption` | C-01, C-02 (ED-01) |
| UX-7 | Manage presets row actions on the §7.2 standard: right-aligned "Actions" with visible text actions "Rename", "Update" and "Delete" (danger, last); no kebab, no "·" separators (Q7 decision) | `Table cell type=action` | DI-01 |
| UX-8 | Delete confirmation on §7.3: "Delete preset?" / "“Key RSFC accounts” will be deleted. This can't be undone." Cancel · danger "Delete" | `Modal__Confirmation` | DI-02 |
| UX-9 | Empty presets with a next step: "No saved presets yet" / "Apply filters for at least one company, then choose Save as preset." | `❖ Empty State Block` | EM-01 |
| UX-10 | Toast copy with the result: "Users exported. Check your downloads." / "Couldn't export users. Try again." / "Preset saved." | `Message` | ER-02, S-01, S-02 |
| UX-11 *(opt.)* | Correct disabled reason on "Save as preset": "Choose at least one company and apply the filters to save a preset." | `Tooltip` | L-03 or L-01 |

## Not seen live

All 11 (and 6 optional) screens. In particular: the live top bar text, the real counts in dev, whether presets are shared between admins (the "Last updated by" column suggests yes), how the Spin overlays the cards, the date picker popup, and the multi-select tag overflow. Designed from source strings and Hydra components.

## Blocked (missing component, variant or variable)

**Nothing blocks the lean set.** Known gaps, nothing will be created:

1. **Sidebar has no Feature Access Limit slot** (DS request open): the extra linked `.menu__submenu` from the Feature Access Limit build is reused, unselected.
2. **No `Card` component**: the Filters card and the metrics area use bound frames copied from existing frames.
3. **No modal width tokens** (538 / 1135 raw, as on every module) and no Table cell with buttons (the Actions cell is copied from Access Blacklist `3001:49`).
4. To verify at BUILD (stop and ask if missing): `DatePicker` range and `state=disabled`, `Button` loading state, `Select` multiple with tags. The protected frame already shows a range picker and multi-selects, so I expect them to exist.
5. Raw geometry kept as in earlier modules: frame and section canvas positions, overlay and Message absolute positions, the x / y of the extra sidebar item.

## Protected, left as is

`Dashboard` `2483:68240` (move only, every node fingerprinted). Its drift from the shared shell stays:
- Sidebar shows 9 items (no Feature Access Limit).
- Top bar "Hi Admin, welcome to RSFC." with the old "Project:" selector.
- Breadcrumb "Admin / Dashboard" (no HomeOutlined).
- No Export Users CSV.
- Hand-built KPI and analytics cards (plain frames, no Stat Tile or Statistic). The Global KPIs heading layer is named "Specific analytics — …".
- Content column 1200 wide instead of filling 1446.
- Sample data does not match itself: the range picker shows 2023-09-02 → 2023-09-09, the title says 2026-08-14 – 2026-08-20.
- Copy not in the product: "Refine your data to get the insights you need.", the Reporting window, Saved preset and Include usage descriptions, and the icon badges.
- Reporting window uses `Segmented` (live: small buttons).

Section `2958:63292`: left in place or moved to `🗄 Archive` once empty (Question 1). Nothing is deleted.

## Live app issues

| # | Issue | How seen |
|---|---|---|
| I-1 | Top bar "Hi Admin, Welcome to .": the admin `Header` hard-codes `Hi {firstName}, Welcome to {companyName}.`, and the admin app has no company name. Shows "Hi User, …" while loading. | Source + ledger |
| I-2 | Hint says "the end date is exclusive", but the code sends the start of the next day as the end, so the end date is included. | Source |
| I-3 | Default window is the last 7 days with **Custom** selected; "Past week" is a different range (today minus 7 days, 8 calendar days). | Source |
| I-4 | "Global KPIs" use the same company, user and date filters as Specific analytics; the heading suggests totals. | Source |
| I-5 | Export Users CSV does not say which users it exports (the applied filters). Title case label. | Source |
| I-6 | "Save as preset" is also disabled when no company is chosen, but the tooltip only says "Apply your filters…". | Source |
| I-7 | Manage presets: three link buttons with "·" separators, centred column (standard §7.2: right-aligned, small default buttons, max 2 + kebab). | Source |
| I-8 | Delete title "Delete preset" without "?", description starts "Are you sure…" (standard §7.3). | Source |
| I-9 | Save preset modal has no field label, 420 wide, and save failures only show a toast (standard §8.3: label on top, 538, error Alert in the body). | Source |
| I-10 | Load errors have no retry; the description "Unable to load analytics." repeats the title. | Source |

## Questions (with the default I would pick)

1. **Where E-00 goes.** **Default A:** create `01 · List` at x 0, y 0; move `2483:68240` into it as the first screen (48, 80), with fingerprints before and after in the same script; move the then-empty section `2958:63292` to `🗄 Archive`. B: leave the frame where it is and only rename its section to `01 · List` (the frame does not move at all, but the "Needs changes" label is lost). C: leave the section and its name as they are and start the new sections 290 below it (y 2014), as Feature Access Limit did with its placeholder.
2. **L-01 as the complete "fixed" default.** E-00 cannot be changed, so the audit gaps (Export Users CSV, Stat Tile KPIs, breadcrumb, shell) only appear on new frames. **Default: L-01 shows a different state (company scope applied)**, so it is a New state, not a rebuild of E-00. Alternative: also add "01.02 Dashboard · Default · Current shell" with E-00's data.
3. **How many frames?** **Default: the lean set of 11.** Optional: L-02, L-03, ED-01, DI-03, ER-03, S-03 (17 in total).
4. **KPI component.** **Default: `Stat Tile tone=neutral`** for every count (the audit asks for it; one pattern per meaning). Alternative: Hydra `Statistic` atom (stacked and centred, as the live antd `Statistic`) inside bound card frames, which is closer to live and matches the earlier decision that Admin Release Notes keeps the Statistic atom.
5. **Top bar text on new frames.** **Default: keep what the Feature Access Limit copy shows ("Hi Admin, Welcome to ."),** like the six built modules, and keep I-1 in this list. Alternative: "Hi Admin, Welcome to RSFC." on Dashboard frames only (this differs from the other modules).
6. **Reporting window control.** **Default: keep `Segmented`,** as in the cloned Filters card (same page, same look; one selected option is what Segmented is for). Alternative: five small `Button`s with the selected one primary, as live. That would put a second primary on every page frame.
7. **Manage presets row actions (UX-7).** **Default: "Rename" + kebab (Update to current filters, Delete).** Alternative: "Rename" and "Update to current filters" visible, kebab with Delete only.
8. **Modal widths.** **Default: Save / Rename 538, Manage 1135** (§8.3). Alternative: live 420 and auto.
9. **Sample data.** **Default: First Test Company and ASC-ES, 1 user, 2026-10-24 – 2026-10-30, presets "Key RSFC accounts", "Seismic pilot", "BOM early access"**, with fictional counts. Alternative: wait for a live walk and copy the dev values.

## Ledger

`modules["Dashboard"]` added with `status: "planned"` on 2026-10-30 (route, page, existing nodes, planned and optional screens, copy sources, DS gaps, open questions). No Figma node was created, moved or edited.

## Decisions (Build approved, 30 Oct)

Lean 11 New + 1 Move, all UX improvements kept. Q1 = A. Q2 = no new default frame. Q4, Q5, Q6, Q8, Q9 = defaults. **Q7 changed:** no kebab; three visible text actions "Rename", "Update" (updates the preset to the current filters) and "Delete" (danger, last), right-aligned under "Actions" (§7.2, Company Roles style). UX-7 and the Manage presets row above follow this.

## Build outcome

Page: Dashboard `2958:63284`. All new frames are copies of L-01, which is a copy of the Feature Access Limit shell `3083:3582`. Fixed 1750 wide, hug height, minimum 970.

| ID | Frame | Node | Section | Result |
|---|---|---|---|---|
| E-00 | Dashboard (protected) | `2483:68240` | 01 · List `3085:593` | Moved unchanged, fingerprint identical in the move script (324 nodes, 847599935); screenshot matches the planning screenshot |
| L-01 | 01.02 · Company scope applied · Default | `3089:3143` | 01 · List | Built |
| C-01 | 02.01 · Save as preset · Default | `3093:586` | 02 · Create `3093:585` | Built (field help caption added) |
| C-02 | 02.02 · Save as preset · Name already used | `3093:1136` | 02 · Create | Built |
| DI-01 | 03.01 · Manage saved presets · Default | `3095:8355` | 03 · Dialogs `3095:8354` | Built, Rename / Update / Delete text actions |
| DI-02 | 03.02 · Delete preset · Confirm | `3097:1398` | 03 · Dialogs | Built, stacked over DI-01 |
| EM-01 | 04.01 · Manage saved presets · No saved presets | `3097:2099` | 04 · Empty `3097:2098` | Built |
| LO-01 | 05.01 · Loading analytics · Default | `3097:3909` | 05 · Loading `3097:3908` | Built; Companies and Users selects stay filled (see gaps) |
| ER-01 | 06.01 · Analytics failed · Default | `3097:4299` | 06 · Error `3097:4298` | Built |
| ER-02 | 06.02 · Export failed · Default | `3097:4688` | 06 · Error | Built |
| S-01 | 07.01 · Users exported · Default | `3097:5078` | 07 · Success `3097:5077` | Built |
| S-02 | 07.02 · Preset saved · Default | `3097:5471` | 07 · Success | Built |

Old section `2958:63292` moved to 🗄 Archive `2109:27298` at (0, 6915), not deleted.

Gates: every instance is a Hydra library instance, none detached; no raw fills, strokes, gaps, padding or radii on new frames; every new text uses a Hydra text style and a bound colour; no label colons; one primary on the page layer of every frame (dialog primaries sit on their own overlay layer); overlays at (0, 0), full frame, STRETCH/STRETCH; toasts centred at y 16; sidebar has 10 items with only Dashboard selected (icon colour check and on/off proof passed). No tokens, styles or components were created.

DS gaps found in BUILD:

- `Modal` inside `Modal__Overlay` is locked at 538 (Hydra notes width is not in Figma). DI-01, DI-02 and EM-01 use the overlay as the scrim with its own modal hidden and a separate linked `Modal` resized to 1135 on top.
- `.select_input type=multiple` has three fixed tag slots and no count property; unused tags are hidden. It also has no `state=disabled, filled=true` variant, so LO-01 keeps the applied company and user tags in the default state.
- `Table cell type=tag` hugs to 56 with a Tag; tag cells are set to the 54 text-row height, as Company Roles does.
- The fingerprint function returns a different hash in some sessions with no field changes inside a call; visual check used as the final proof.

Skipped: tooltip on Export Users CSV (hover state, not drawn); optional screens L-02, L-03, ED-01, DI-03, ER-03, S-03.

## Fix pass (review)

Finding: the 1135-wide `Modal` on DI-01 was fixed at 364 high and left an empty strip below the table. Cause: the modal was set to a fixed height, its Content Wrapper and slot were set to fill, and the empty Footer (all `show button*` off) still took 56.

| Frame | Modal | Change | Result |
|---|---|---|---|
| DI-01 `3095:8355` | `3096:1648` | Modal, Content Wrapper and slot set to hug; empty Footer hidden; Content Wrapper bottom padding rebound from `paddingSM` to `Size/Padding/padding` (the Head's top padding) | 364 → 280 (48 head + 216 table + 16) |
| DI-02 `3097:1398` | `3097:1517` (background) | Same as DI-01; the Delete confirmation already hugged and was not changed | 364 → 280 |
| EM-01 `3097:2099` | `3097:2218` | Same as DI-01, plus the Empty State Block's empty `Actions` row hidden (`show action` and `show secondary action` are off and the empty row still took 40 + 24 gap) | 364 → 337; the block no longer overflows the slot; 48 above and below its content (`marginXXL`) |

Each modal is re-centred in its frame. Both overlays on each frame are unchanged at (0, 0), 1750 × 1322, STRETCH/STRETCH, checked in the same script. Nothing was detached or deleted; there is no property for the Footer or the empty Actions row, so those two use a layer visibility override. No raw values were added, and no token or component was created.
