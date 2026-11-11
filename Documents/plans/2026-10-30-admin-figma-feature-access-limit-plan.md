# Admin module plan — Feature Access Limit

Status: **built on 2026-10-30** (planned the same day; see "Build outcome" at the end).

Live walk: **not done** (Screen Recording is off). Every screen is marked **Source** and listed under "Not seen live".

Product source read with `gh api` (`ooden-tech/on-hydra-app`, HEAD on 30 Oct): admin `router.tsx`, `router/constants/index.ts`, `navigation.tsx`, admin and core `en/translation.json`; core `roles/pages/admin/FeatureAccessLimit`, `roles/components/FeatureAccessLimitEditTab` (the same component Companies and Users use), `roles/hooks/use-default-feature-access-limits.ts`, `roles/services` and `roles/types/feature-access-limit*`; backend `role/services/feature-access-limit.service.ts` and `role/constants/permissions.ts` (`OptInModuleNames`).

Read before planning: the agent file (30 Oct version), the ledger, the Companies, Users, Company Roles and Admin Roles plans with their Build outcomes and fix passes, the Users audit (U-A-29 reset decision), `Documentation/hydra-ux-patterns.md` §2 (sidebar icon), §7 (row actions), §8.4 (overlay), `module-layout.md`. Figma read this run: the Feature Access Limit page `2958:63290` (metadata), Companies DT-01 `3022:990` (metadata + screenshot), Users ED-05 `3045:4308` (screenshot), Admin Roles L-01 `3076:1241` (metadata), and the Hydra `Sidebar` master `662:10029` (metadata, read only).

## What the product does (source)

- One page, `/feature-access-limit`. Sidebar: group **Feature Access Limit** (`RiLock2Line`) with one child **Default Limits** (`RiGroup2Line`), the last item after Admin Roles.
- It renders the same `FeatureAccessLimitEditTab` as Companies `/companies/:id/feature-access-limit` and the Users "Feature access" tab, in the **default context** (no company, no user). Differences from those two:
  1. Description: "Manage default feature access limits for all platform users."
  2. An extra **Custom Rules** column: "No custom rules" (secondary text), or small buttons with a people icon + user count and a building icon + company count, each linking to the Users / Companies list filtered by that module (tooltips "View {{count}} user(s) with this rule", "View {{count}} company / companies with this rule").
  3. **No reset button.** Reset only exists for a company or user rule (`limitRecord`), so the defaults page has the Select only.
- Changing a Select saves at once (no confirmation) and shows `update-success` "Feature access limit updated successfully" or `update-error` "Failed to update feature access limit". While saving, the table shows its loading state. While the first load runs, a `Spin`. A failed load is silent (the table is just empty).
- Defaults: every module **Enabled**, except opt-in modules (`OptInModuleNames` = `bom-static-matches`), which start **Disabled**. Precedence: user rule > company rule > default.
- Without Feature Access Limit read permission the page redirects to the dashboard; without update permission the Selects are disabled.

## Target

- **File:** Admin - RSFC (`rONB8aMPanOjS3GC1uN16d`)
- **Page:** `Feature Access Limit` (`2958:63290`): https://www.figma.com/design/rONB8aMPanOjS3GC1uN16d/Admin---RSFC?node-id=2958-63290
- **Existing node (treated as protected, left in place):** section `Feature Access Limit · To design` (`2958:63304`), x 0, y 0, 1750 x 547, with one text note (`2958:63305`). Not moved, not edited.
- **Canvas look:** page background `#787A7E` (set on 30 Oct by the arrangement run; re-check at BUILD); every new Section white at 10%.
- **New sections** (plain Sections at x 0, 290 apart; the first sits 290 below the placeholder, at y 837). Only the kinds this module has, in the shared order, numbered consecutively as Companies does:

| Section | Screens per row | Width | Holds |
|---|---|---|---|
| `01 · List` | 1 (2 with L-02, 3 with RO-01) | 1846 | L-01 (+ L-02, RO-01 optional) |
| `02 · Dialogs` | only if D-01 is approved | 1846 | D-01 (optional) |
| `02 · Loading` (`03 ·` if Dialogs exists) | 1 | 1846 | LO-01 |
| `03 · Error` | 2 | 3692 | ER-01, ER-02 |
| `04 · Success` | 1 | 1846 | S-01 |

  Inside a section: 48 left and right, 80 top, 140 bottom, screens 96 apart, at most 3 per row. Section height = 80 + tallest screen + 140, computed at BUILD from the hugged screen heights. No Detail, Create, Edit or Empty section: the product has no such screens (the list of modules is never empty).
- **Frame size:** 1750 fixed width, hug height, minimum 970. **Frame names:** `NN.MM · Feature Access Limit · <Screen> · <State>`.
- **Copy sources (copy and adapt; originals never edited).** Every frame starts from its **Companies Feature Access** counterpart, so the three feature-access screens stay identical in shell, card, columns, status badge, Select cell and Messages:

| New | Cloned from | Main change on the copy |
|---|---|---|
| L-01 | Companies `3022:990` | Sidebar item (see Questions 1), breadcrumb, description; add the Custom Rules column (clone of the Access Status column, cells switched to `type=action` / `type=text`); delete the reset button in the `bom-static-matches` row and put its Select back on the common x; `bom-static-matches` shows Disabled |
| L-02 (optional) | L-01 copy | Status Select open (Enabled / Disabled) on one row |
| RO-01 (optional) | L-01 copy | Every Select `state=disabled`, info Alert "You can view these limits but not change them." |
| D-01 (optional) | L-01 copy + Companies D-01 `3022:9473` overlay | Confirmation before a default changes (UX-5) |
| LO-01 | Companies `3022:9135` | Shell, breadcrumb and description as L-01 |
| ER-01 | L-01 copy + Companies `3022:6104` error block | Error `Alert` + "Retry" `Button` centred in the card instead of the table |
| ER-02 | S-01 copy | `Message type=error` "Failed to update feature access limit. Try again."; the row keeps its old value |
| S-01 | Companies `3022:9414` | `admin-analytics` now Disabled; `Message type=success` "Feature access limit updated successfully" centred at y 16 |

  **BUILD pre-check:** the source frames must still carry the 30 Oct fixes (labels without colons, Users collapsed with DownOutlined `2798:23926`, breadcrumb starting with HomeOutlined, sidebar selection through the `.menu__item` variant). If a source differs, stop and ask instead of fixing it on the copy.
- **Ready for Dev:** not read (per your instruction). Every existing node is treated as protected. Copies are checked at BUILD and reported if one carries a status.

## Screens

Live status: **Source** = read from product source. Every screen is **New** (copy and adapt). Nothing to Move, Keep or Rebuild.

| # | Screen | Route | Section | State | Action | Live status |
|---|---|---|---|---|---|---|
| L-01 | Default limits | `/feature-access-limit` | 01 List | First 8 of 29 modules (alphabetical, as source); `bom-static-matches` Disabled (opt-in default) with "2 companies"; `bom` "1 user"; others "No custom rules" | New (copy of `3022:990`) | Source |
| LO-01 | Default limits · Loading | `/feature-access-limit` | Loading | `Spin` centred in the card, title and description shown | New (copy of `3022:9135`) | Source (`isLoading` shows `Spin`) |
| ER-01 | Default limits · Failed to load | `/feature-access-limit` | Error | Error Alert "Feature access limits couldn't load" + "Retry" | New (copy of L-01 + `3022:6104` block) | Source (live is silent: empty table) |
| ER-02 | Default limits · Update failed | `/feature-access-limit` | Error | Error Message, the changed row keeps its previous value | New (copy of S-01) | Source (`update-error` is shown) |
| S-01 | Default limits · Updated | `/feature-access-limit` | Success | `admin-analytics` Disabled, success Message at y 16 | New (copy of `3022:9414`) | Source (`update-success`) |

**Count (lean set, my default): 5 New, 0 Move, 0 Keep, 0 Rebuild, 0 Blocked.**

Optional extras, off by default (Question 7): L-02 Status Select open, RO-01 Read-only (no update permission), D-01 Confirm before a default changes (UX-5). With all three the module is 8 frames.

### Not in the product (so not drawn)

- **Reset to default** on this page: defaults have no rule to reset (`limitRecord` is undefined). The Companies and Users reset pattern (small icon-only default Button with the trash icon, `3022:5170`, kept by U-A-29) is therefore not used here; L-01 has no reset slot.
- **Empty state:** the module list always has every permission module, so there is no "no data" or "no results" (no search on this page).
- **"Default Limits" as a separate screen:** it is the only child of the group, so the group and the page are the same thing.

## Hydra components per screen

Searched live in Hydra Ant Design - DS only (`includeLibraryKeys` = `lk-0d30b3c5…19ed`) on 30 Oct: `Sidebar` (`88c193bc…`, "no component properties"), `LockOutlined` (`43998828…`), `TeamOutlined` (`7cedf935…`), `Alert` (set `03685410…`), `Message` (set `d8e5b62d…`), `Tooltip` (set `deb6eda6…`), `Menu` (set `512e4285…`, `items` 2–8) found. `.menu__item` and `.menu__submenu` are internal helpers and do not appear in search (already known from the Users build: `.menu__submenu` set `92fb308e…`, `.menu__submenu_list` set `3610ba7a…` with `items=2`–`6`). Everything else is inherited from the Companies copies (built and gated 30 Oct). Re-discover keys at BUILD.

| Need | Hydra component (variants / properties) | Used on |
|---|---|---|
| Shell | `Sidebar`, `Topbar`, `Breadcrumb` (`items=3`: HomeOutlined / Feature Access Limit / Default limits), from the copy | all |
| Sidebar item | See Question 1 (default: one extra linked `.menu__submenu` instance, `↳ ✏️ title` "Feature Access Limit", `↳ 🎰 icon` `LockOutlined`, `selected=true`, no chevron); Companies not selected; Users collapsed | all |
| Page title + description | Inherited `Page title` / `Page description` text (`Base/Normal`, `colorTextDescription`) | all |
| Card | Inherited bound `Table card` frame (no Card component, known gap) | all |
| Table header | `Table / Table Item / Header Item` (Feature Module, Access Status, Custom Rules, Actions; no sort or filter, as live) | L-01, L-02, RO-01, D-01, ER-02, S-01 |
| Module name | `Table / Table cell` `type=text` | same |
| Access status | `Table / Table cell` `type=badge` (`Badge__Status success` Enabled, `default` Disabled), as Companies and Users | same |
| Custom rules | `Table / Table cell` `type=action` text links "2 companies", "1 user" (UX-2); `type=text` "No custom rules" in `colorTextDescription` | same |
| Status select | Copied bound wrapper `Table cell · Status select` with `Select` (Enabled / Disabled), width 120, right-aligned; `state=disabled` on RO-01 | same |
| Select open (L-02) | `Select` open state with its dropdown items Enabled / Disabled, as Companies DT-02 was planned | L-02 |
| Loading | `Spin size=large`, description off | LO-01 |
| Error | `Alert type=error` + `show description` + `Button default` "Retry", centred | ER-01 |
| Read-only notice | `Alert type=info` | RO-01 |
| Toasts | `Message type=success / error`, centred at y 16 | ER-02, S-01 |
| Confirmation | `Modal__Overlay` + `Modal__Confirmation` via `🎰 modal`; Cancel default + primary; overlay x 0, y 0, full frame, STRETCH / STRETCH | D-01 |

Text styles and variables: the set already on the Companies copies (page-title style, `Base/Normal`, `Base/Medium`; `Size/Padding/*`; `colorText`, `colorTextDescription`, `colorBorderSecondary`). Nothing is created.

Copy (from source; counts are fictional sample data, see Question 8):
- Title "Feature Access Control"; description "Default access for all companies and users. A company or user rule overrides it." (UX-1).
- Columns Feature Module, Access Status, Custom Rules, Actions (title case, as on Companies and Users).
- Rows (first 8, alphabetical, the same slugs as Companies DT-01): access-blacklist, admin-analytics, admin-invite, admin-role, bom ("1 user"), bom-crm-integration, bom-static-matches (Disabled, "2 companies"), company. The two companies match the Companies list, where First Test Company and ASC-ES show "Custom rules applied"; First Test Company's DT-01 already shows `bom-static-matches` Enabled with a reset, which is that custom rule over this Disabled default.
- Messages: "Feature access limit updated successfully", "Failed to update feature access limit. Try again.".
- ER-01: "Feature access limits couldn't load" / "Check your connection and try again." + "Retry".

## UX improvements

Run with `hydra-ux-audit` (effortless x PRD x functional, 5-second test, one primary action, plain copy, every state covered, progressive disclosure):
- 5-second test: mostly passes (see each module's default, change it). Fails on the Custom Rules column: bare icon buttons with a number; you need a tooltip to know that "2" means two companies. It also fails on scope: the page never says that company and user rules win over these defaults, so an admin can't tell why a company still has access after a default is Disabled.
- One primary action: there is no page CTA; each row saves on change. Fine, no primary button is added.
- States: a failed load shows an empty table with no message; a failed update is shown.

| # | Improvement | Hydra component that carries it | Screens |
|---|---|---|---|
| UX-1 | Page header above the card, as Companies UX-1 / UX-6: title "Feature Access Control", description that says these are the defaults and that company and user rules override them; breadcrumb `Feature Access Limit / Default limits` | Page title text, `Breadcrumb items=3` | all |
| UX-2 | Custom rules as labelled text links "2 companies", "1 user" (correct plurals) that open the filtered Companies / Users list, as live; "No custom rules" in description colour. Same wording style as the Admin Roles "3 users" link | `Table cell type=action`, `type=text` | L-01, L-02, RO-01, D-01, ER-02, S-01 |
| UX-3 | Failed load gets a state: error Alert + Retry in the card | `Alert error` + `Button default` | ER-01 |
| UX-4 | Update failure Message adds the next step ("Try again."); the row keeps its old value so nothing looks saved | `Message error` | ER-02 |
| UX-5 | *Optional, off by default.* Confirm before a default changes, because it affects every user: "Disable admin-analytics for everyone?" / "Companies and users without their own rule lose access. Company and user rules stay as they are." Cancel + primary "Disable" (orange, not red, as Companies D-01, since nothing is deleted) | `Modal__Overlay` + `Modal__Confirmation` | D-01 |
| UX-6 | *Optional.* Read-only view for admins without update permission: disabled Selects and an info Alert that says why | `Select state=disabled`, `Alert info` | RO-01 |

## How it stays consistent with Companies and Users

Same card, column order and widths for Feature Module / Access Status / Actions, same module slugs and order as Companies DT-01, same `Badge__Status` for Enabled / Disabled, same bound Select cell (width 120, right-aligned), same title "Feature Access Control", same loading Spin, same Messages at y 16 and same shell fixes. Only two differences, both from the product: the extra Custom Rules column (between Access Status and Actions; Feature Module keeps the fill width) and no reset button.

## Not seen live

All 5 screens (and the 3 optional ones). In particular: the real custom rule counts in dev, the live breadcrumb on `/feature-access-limit`, whether the live sidebar opens the group with "Default Limits" selected, the table loading state while a change saves, and the Disabled default of `bom-static-matches` (read from `OptInModuleNames`). Designed from source strings and Hydra Spin, Alert, Message and Modal__Confirmation.

## Blocked (missing component, variant or variable)

**Nothing blocks the module if Question 1 Option A is approved.** Known gaps, unchanged, nothing will be created:

1. **Sidebar has no Feature Access Limit item.** The Hydra `Sidebar` master (`662:10029`) has exactly nine `.menu__submenu` slots in its `Menu` frame and no component properties; an instance cannot get a tenth child. Options in Question 1.
2. `.menu__submenu_list` has no `items=1`, so Feature Access Limit is a single selected item (live: group with one child "Default Limits"), the same fallback as Company Roles and Admin Roles.
3. No table cell with a Select: the bound wrapper cell from Companies is reused.
4. `Table cell type=action` renders text links only; no Card or page header component.
5. Raw geometry kept as in Companies: column widths (proposed Feature Module fill, Access Status 300, Custom Rules 300, Actions 220), frame and section canvas positions, Message and dropdown absolute positions, and, with Option A, the x / y of the extra sidebar item.

## Protected, left as is

- `Feature Access Limit · To design` (`2958:63304`) and its note (`2958:63305`): not moved, not edited.
- Every Companies frame listed as a copy source (`3022:990`, `3022:9135`, `3022:6104`, `3022:9414`, `3022:9473`) is only cloned.

## Live app issues

| # | Issue | How seen |
|---|---|---|
| I-1 | Top bar reads "Hi Admin, Welcome to ." (known). Kept as the copied frame shows. | Ledger |
| I-2 | Three names for one page: sidebar "Feature Access Limit" > "Default Limits", heading "Feature Access Control", browser title "Feature Access Control Management". | Source |
| I-3 | Module names are raw slugs (`bom-crm-integration`); `moduleDisplayName` is set to the slug. Same as Companies I-5. | Source |
| I-4 | Custom Rules uses icon-only buttons with a bare number; the meaning is only in the tooltip, and the user tooltip says "user(s)" (no plural forms, while companies have them). | Source |
| I-5 | A failed load is silent: the table is empty with no message or retry. | Source |
| I-6 | A default changes the moment the Select changes, for every user, with no confirmation and no note that company and user rules still win. | Source |
| I-7 | Status is shown twice per row (status column with a coloured icon, and the Select). | Source |
| I-8 | Title case in headers and buttons ("Feature Module", "Access Status", "Custom Rules", "Reset to Default"). Figma keeps the column titles as on Companies and Users. | Source |
| I-9 | Cross-module drift in Figma (not live): Users ED-05 `3045:4308` lists display names (BOM, Cheat Sheets, Revit Plugin …, not alphabetical) while Companies DT-01 lists slugs. Feature Access Limit follows Companies. | Figma |

## Questions (with the default I would pick)

1. **Sidebar item (DS gap).** Options:
   - **A. Extra linked menu item next to the Sidebar (default).** In each Feature Access Limit frame, add one linked `.menu__submenu` instance, created from the main component of a slot in the same Sidebar (no detach, no new component), absolutely positioned in `Body` directly under Admin Roles (the next 48 px step of the sidebar menu), title "Feature Access Limit", icon `LockOutlined` (Hydra's match for live `RiLock2Line`), `selected=true` through the `.menu__item` variant, no chevron; every other item unselected, Users collapsed. Icon/label colour check and the selected on/off proof as usual. If BUILD cannot create a linked instance this way, it stops and reports. Cost: a layer that sits on top of the Sidebar instead of inside it, and the other nine module pages still show nine items until the DS is fixed.
   - **B. DS fix first.** The Hydra DS owner adds a tenth slot (or a `show item 10` boolean) to the `Sidebar` master; I cannot edit the DS. All ten modules then get the item. The module waits until it is published.
   - **C. Build without the item.** Nine items, nothing selected. Fails the shared-shell rule, so I would not choose it.
   - Not an option: relabelling one of the nine existing slots, because it would hide a live module.
   Recommendation: **A now, and ask for B in parallel**; once B ships, a fix pass swaps A for the native slot on these 5 frames and adds the item to the other modules' frames.
2. **Module names.** **Default: the same 8 slugs, alphabetical, as Companies DT-01** (matches live and source). Alternative: display names on all three feature-access screens in a later fix pass (I-3, I-9).
3. **Section for the main screen.** **Default: `01 · List`** (it is the module's only page and a list of modules). Alternative: `Detail`, as Companies placed its per-company page.
4. **Title.** **Default: "Feature Access Control"** (same as Companies and Users) with the new description. Alternative: "Default limits" to match the sidebar child.
5. **Custom Rules display.** **Default: text links "2 companies", "1 user" (UX-2).** Alternative: live-like small default Buttons with `TeamOutlined` + count in a bound wrapper cell, with Tooltips (a Hydra icon for companies would still have to be found at BUILD).
6. **Confirmation before a default changes (UX-5).** **Default: not included**, to behave like Companies, where the same confirmation (UX-8) was skipped. Alternative: include D-01 with an orange primary "Disable".
7. **How many frames?** **Default: lean set of 5.** Add L-02, RO-01 and D-01 for 8.
8. **Sample data.** **Default: `bom-static-matches` Disabled with "2 companies" (First Test Company, ASC-ES), `bom` "1 user", S-01 changes `admin-analytics` to Disabled.** Alternative: wait for a live walk and copy dev counts.

## Ledger

`modules["Feature Access Limit"]` added with `status: "planned"` on 2026-10-30 (routes, page, existing node, planned and optional screens, copy sources, DS gaps). No Figma node IDs were created.

## Build outcome (2026-10-30)

Approved: lean set of 5; UX-1 to UX-4 (UX-5 and UX-6 off); Q1 option A (confirmed by the user); Q2 slugs as Companies (confirmed); every other question on its default.

| Screen | Frame | Node | Section | Copied from |
|---|---|---|---|---|
| L-01 | 01.01 Default limits · Default | `3083:3582` | 01 · List `3083:3578` | `3022:990` |
| LO-01 | 02.01 Default limits · Loading | `3083:4495` | 02 · Loading `3083:3579` | L-01 + Loading state from `3022:9351` |
| ER-01 | 03.01 Default limits · Failed to load | `3083:4729` | 03 · Error `3083:3580` | L-01 + Error state from `3022:6330` |
| ER-02 | 03.02 Default limits · Update failed | `3083:4969` | 03 · Error | L-01 + Message from `3022:9469` (type=error) |
| S-01 | 04.01 Default limits · Updated | `3083:5362` | 04 · Success `3083:3581` | L-01 + Message from `3022:9469` |

All 5 Built. Nothing skipped or blocked. The placeholder `2958:63304` was not moved, edited or deleted.

Deviations from the plan:
- LO-01, ER-01, ER-02 and S-01 were cloned from the finished L-01 (not from the Companies state frames directly), with the state block or Message taken from the Companies frames listed above. Same result, and every frame carries the same sidebar, breadcrumb, columns and data.
- Custom Rules cells are `Table cell type=text` with the label bound to `colorLinkActive` ("1 user", "2 companies") or `colorTextDescription` ("No custom rules"), the same treatment as the Admin Roles "3 users" cell, not `type=action`.
- The Spin keeps its "Loading..." description, as on Companies LO-03.
- Messages use constraints CENTER / MIN (Companies uses MIN / MIN); position is centred at y 16 either way.

Sidebar (option A): on each frame, one linked instance of the Hydra `.menu__submenu` (`mode=inline, theme=dark, open=false`, set `92fb308e…`, remote) created from the same main component the Sidebar's slots use, absolutely positioned in `Body` at x 0, y 506 (Admin Roles ends at 498, the Menu gap is 8, so it is the next 48 px step). Its nested `🧬 menu item` (set `f1e79422…`, remote) has title "Feature Access Limit", icon swap `LockOutlined` (`43998828…`), `show action`, `show tag` and `show guidance tag` off, `selected=true`. Companies was set to `selected=false`; only Feature Access Limit is selected; Users collapsed with `2798:23926`. The icon colour follows the variant: `colorSidebarMenuItemText` when off and `colorSidebarItemSelectedText` when on (toggle proof on L-01, re-checked on every frame). No icon fill was set by hand. Instance IDs: `3083:3930`, `3083:4559`, `3083:4793`, `3083:5033`, `3083:5426`.

Gates (all 5 frames pass, 0 findings): every own instance is a remote Hydra component, none detached, no local components or manual primitives; no hidden own nodes; every own fill, stroke, padding, gap and radius is bound; every text has a Hydra text style and a bound fill; no label ends with a colon; no primary button on any frame (rows save on change); breadcrumb HomeOutlined / Feature Access Limit / Default limits with the dropdown chevron off; Messages centred at y 16; frames 1750 fixed width, hug height, minimum 970. Sections at x 0 from y 837, 290 apart (80 top, 140 bottom, 96 between screens). Canvas `#787A7E`, section fills white 10%.

DS request: **Sidebar needs a 10th slot for Feature Access Limit.** The Hydra `Sidebar` master (`662:10029`) has nine `.menu__submenu` slots and no properties. Once a tenth slot (or a `show item 10` boolean) is published, a fix pass replaces the five extra instances above with the native slot and adds the item to the other modules' frames.

Ledger: `modules["Feature Access Limit"].status = "built"`, sections and frame IDs recorded.
