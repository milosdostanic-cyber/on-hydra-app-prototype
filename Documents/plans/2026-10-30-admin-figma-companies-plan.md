# Admin module plan — Companies

Status: **built on 2026-10-30** (coordinator relayed "Build approved: Companies" with every default accepted; the user did not answer the questions one by one). The plan below is the original read-only plan; the outcome per screen is at the end.

Live walk: 30 Oct, user's signed-in Chrome, `https://admin.hydra-dev.spaceinch.tech`. Looked only. Typed in the search box and in two form fields (not saved, page reloaded). Never clicked Save, Delete/trash, or changed a dropdown value. Product source read with `gh api` (`ooden-tech/on-hydra-app`, `packages/on-hydra-frontend-core/src/core/company/...` and `core/roles/...`) for copy and states that cannot be reached without changing data.

## Target

- **File:** Admin - RSFC (`rONB8aMPanOjS3GC1uN16d`)
- **Page:** `Companies` (`2958:63286`): https://www.figma.com/design/rONB8aMPanOjS3GC1uN16d/Admin---RSFC?node-id=2958-63286. Canvas is already `#787A7E`.
- **Existing node (not touched):** section `Companies · To design` (`2958:63296`), x 0, y 0, 1750 x 583, white 10%, holds one text note. Left exactly where it is.
- **New sections** (plain Sections, white 10% fill, x 0, 1190 tall, 290 apart, first one 290 below the placeholder). Numbering skips sections the module does not have, as Access Blacklist did:

| Section | y | Holds |
|---|---|---|
| `01 · List` | 873 | L-01, L-02 |
| `02 · Detail` | 2353 | DT-01 (Feature access of one company) |
| `03 · Edit` | 3833 | ED-01, ED-02 (Company Settings) |
| `04 · Dialogs` | 5313 | D-01 |
| `05 · Empty` | 6793 | E-01 |
| `06 · Loading` | 8273 | LO-01, LO-02, LO-03 |
| `07 · Error` | 9753 | ER-01, ER-02 |
| `08 · Success` | 11233 | S-01, S-02 |

  Inside a section: 48 left/right, 80 top, 140 bottom, screens 96 apart, at most 3 per row. Widths: 1846 for one screen, 3692 for two, 5538 for three. No Create section (see "Not in the product").
- **Frame size:** 1750 x 970 (same as Access Blacklist and Knowledge Center).
- **Frame names:** `NN.MM · Companies · <Screen> · <State>`.
- **Base (copy-and-adapt, originals never edited):** Access Blacklist list frame `3001:49` (page `2958:63285`) for every page-level screen. Dialog: Access Blacklist `03.01 · Remove entry · Confirm` (`3005:3188`) and its `Modal__Overlay`. Form fields: instances from `02.01 · Add entry · Default` (`3006:4428`). Empty: `04.02 · No matching entries` (`3005:3377`). Error: `06.01` (`3005:3483`). Success: `07.01` (`3005:3536`). Loading: the Spin pattern of Knowledge Center `02.03 · Lists · Initial loading` (`2880:5321`), because Companies shows a Spin overlay, not a skeleton.
- **Ready for Dev:** still unreadable (Plugin API: not supported; REST token invalid). The page holds only the placeholder, nothing to move. Only copies are made, no original frame is edited.

## Screens

Live status: **Seen** = opened in Chrome. **Source** = read from product source, not reachable without changing data. **Proposed** = not in the live app (a UX improvement). All screens are **New** (copy and adapt). Nothing to Move, Keep or Rebuild.

| # | Screen | Route | Section | State | Action | Live status |
|---|---|---|---|---|---|---|
| L-01 | Companies list | `/companies` | 01 List | Default, 5 rows, "Custom rules applied" on 2 | New (copy of `3001:49`) | Seen |
| L-02 | Companies list · Country filter open | `/companies` | 01 List | Filter popover: search, HR, US, Reset, OK | New (copy of L-01) | Seen (Country and Feature Access filters) |
| DT-01 | Feature Access Control (one company) | `/companies/:id/feature-access-limit` | 02 Detail | Default: 8 of 29 modules, one row with a custom rule | New (copy of `3001:49`) | Seen |
| ED-01 | Company Settings | `/companies/:id/data` | 03 Edit | Default: name, website, country, Save Changes | New (copy of `3001:49`, form from `3006:4428`) | Seen |
| ED-02 | Company Settings · Name required | `/companies/:id/data` | 03 Edit | Field error "Company name is required." | New (copy of ED-01) | Seen |
| D-01 | Reset to default · Confirm | dialog on DT-01 | 04 Dialogs | Confirmation (UX-6) | New (copy of `3005:3188`) | Proposed (live resets instantly, no confirmation) |
| E-01 | Companies · No matching companies | `/companies?s_query=...` | 05 Empty | Search or filter with 0 results, "Clear filters" | New (copy of `3005:3377`) | Seen (live shows plain "No data") |
| LO-01 | Companies list · Loading | `/companies` | 06 Loading | Spin centred in the card | New (copy of L-01) | Source (`loading` on Table) |
| LO-02 | Company Settings · Loading | `/companies/:id/data` | 06 Loading | Spin centred in the card | New (copy of ED-01) | Source (`<Spin />` while company loads) |
| LO-03 | Feature Access Control · Loading | `/companies/:id/feature-access-limit` | 06 Loading | Spin centred in the table area | New (copy of DT-01) | Source (`isLoading` shows Spin) |
| ER-01 | Companies list · Failed to load | `/companies` | 07 Error | Error Alert + Retry in the card | New (copy of `3005:3483`) | Not seen. Source: a failed request leaves a silent empty table |
| ER-02 | Company Settings · Save failed | `/companies/:id/data` | 07 Error | Message "Failed to update company" | New (copy of `3005:3536`, Message `error`) | Source (`failed-company-update`) |
| S-01 | Company Settings · Saved | `/companies/:id/data` | 08 Success | Message "Company updated successfully" | New (copy of `3005:3536`) | Source (`company-update`) |
| S-02 | Feature Access Control · Updated | `/companies/:id/feature-access-limit` | 08 Success | Message "Feature access limit updated successfully", a row now carries a custom rule | New (copy of DT-01) | Source (`update-success`) |

**Count (lean set, my default): 14 New, 0 Move, 0 Keep, 0 Rebuild, 0 Blocked.**

Optional extras, off by default (see Question 4): DT-02 Feature Access · Status select open (Enabled / Disabled, seen live), ER-03 Feature Access · Update failed (`update-error`), S-03 Feature Access · Reset done (`reset-success`). With all three the module is 17 frames.

Skipped on purpose: Country select open (long list of countries, a Hydra Select open state, no new information), "No changes made" info toast, Currency filter (same as Country), first-use empty list (not reachable, see below).

### Not in the product (so not drawn)

- **Create company.** The source has an "Add Company" page (`/create-company`, `/:companyName/add-company`) but the Admin list has no button for it, and `/create-company` opens a blank page in the Admin. Nothing to draw. Question 8.
- **Delete company, invite, bulk actions.** None exist in this module.
- **First-use empty list.** The list cannot be empty in practice (no create flow, the platform always has companies). Only the no-results empty (E-01) is drawn.

## Hydra components per screen

Searched live in Hydra Ant Design - DS only (`includeLibraryKeys` = Hydra key). Everything below exists. Component set keys are for reference, re-discover at BUILD.

| Need | Hydra component (variants) | Used on |
|---|---|---|
| Shell | Sidebar (`88c193bc...`), Topbar (`9ce98bc6...`), Breadcrumb (`items=2` or `3`) | all |
| Page title | Inherited KC page-title text (`Title/Heading 4`) | all |
| Card | Hand-built `Table card` / `Card header` / `Card body` frames inherited from `3001:49`, bound to Hydra variables (no Card component, known gap) | all |
| Search | `Input__Search` (`type=icon`, `size=medium`) | L-01, L-02, E-01, LO-01 |
| Table header | `Table / Table Item / Header Item` (`sort=true` on Name, Slug, Website, Country, Currency; `show filter` on Country, Currency, Feature Access) | L-01, L-02, E-01, LO-01 |
| Table cells | `Table / Table cell` `type=text`, `type=tag`, `type=action` (text links); `type=badge` for Access Status | L-01, DT-01 |
| "Custom rules applied" | `Tag__Status` `status=warning`, `show icon` off (closest to the live yellow Ant tag) inside a `type=tag` cell | L-01, L-02 |
| Pagination | `Pagination` (`type=changer`, "10 / page") | L-01, L-02, E-01 |
| Column filter popover | `Table / Table Item / Table Dropdown` (`type=filter`), `Table / Table Item / Dropdown Checkbox` (HR, US), `Table / Table Item / Dropdown Item` (`type=footer` for Reset and OK) | L-02 |
| Form | `Input__Label` (`orientation=vertical`, `required`), `Input`, `Select` (country), `Input__Caption` (`status=error`), `Button` primary with icon left | ED-01, ED-02 |
| Status select in a row | `Select` (`size=small` or `medium`) and `Button` `icon only` or text action | DT-01 (see Blocked / gaps) |
| Page text | `Title/Heading 3` page title, `Base/Normal` description (inherited KC text styles) | DT-01 |
| Empty | `Empty State Block` (title, description, secondary action "Clear filters", primary hidden) | E-01 |
| Loading | `Spin` (`size=large`, description off) centred in the card | LO-01, LO-02, LO-03 |
| Error | `Alert` `type=error` (title + description) + `Button` default "Retry" | ER-01 |
| Toasts | `Message` `type=success`, `type=error` | S-01, S-02, ER-02 |
| Dialog | `Modal__Overlay` + `Modal` (slot), same as Access Blacklist `3005:3188`, overlay x 0, y 0, 1750 x 970, STRETCH / STRETCH | D-01 |
| Transfer | **No Transfer component in Hydra** (only the `SwapOutlined` icon). Not needed for Companies. Logged for Users and Company Roles. | - |

Text styles and variables: the same set Access Blacklist used (`Title/Heading 5`, `Base/Normal`, `Base/Medium`; `Size/Padding/paddingSM|MD|LG|XS|XXL`, `Style/lineWidth`, `colorBorderSecondary`, `colorText`, `colorTextHeading`, `colorTextPlaceholder`, `colorErrorText`). Re-verify at BUILD; nothing is created.

Copy used (all from live or source, exact):
- List: title "Companies list" (live), columns Name, Slug, Website, Country, Currency, Feature Access, Actions. Rows (dev data): First Test Company / first-test-company / https://spaceinch.com/ / US / USD / Custom rules applied; Consultant / consultant / (empty website) / US / USD; NA's Company / nas-company / https://ncircletech.com/ / US / USD; ASC-ES / asc-es / https://asc-es.com/ / US / USD / Custom rules applied; BAN_COMPANY_TEST / bancompanytest / https://blobapps.com/ / HR / USD. No personal data.
- Filters: Country HR, US. Feature Access: module names (live shows `bom-static-matches`).
- Company Settings: Company Name, Website, Country (🇺🇸 United States), Save Changes. Error: "Company name is required."
- Feature access: "Feature Access Control", "Manage feature access limits for this company." Columns Feature Module, Access Status, Actions. Rows access-blacklist, admin-analytics, admin-invite, admin-role, bom, bom-crm-integration, bom-static-matches (custom rule), company. Status Enabled / Disabled.

## UX improvements

Run with `hydra-ux-audit` (effortless x PRD x functional, 5-second test, one primary action, plain copy, every state covered, progressive disclosure). Each improvement stays inside Hydra components and removes nothing the live app has.

Findings first:
- 5-second test, list: passes. One page, one job (find a company, open its settings or its access).
- 5-second test, Feature Access: fails. A bare trash icon sits next to a status select. It looks like "delete the feature" but it resets a custom rule, and it acts instantly with no confirmation (source `handleDeleteOverride`). The module names are raw slugs (`bom-crm-integration`).
- Row actions are two unlabeled icon buttons; the building icon for "Manage Company" is not self-explanatory. Names are inconsistent: "Manage Company" opens "Company Settings", "Manage Feature Access" opens a page titled "Feature Access Control Management" with a heading "Feature Access Control".
- Settings form: no required marker, no sign of what Save will do; no way back except breadcrumb.
- States: no clear no-results action, no visible error state for a failed list.

| # | Improvement | Hydra component that carries it | Screens |
|---|---|---|---|
| UX-1 | Page title above the card ("Companies", "Company Settings", "Feature Access Control") so the user always knows where they are; card header shows the count "5 companies" on the list (same pattern as Access Blacklist) | Inherited KC page title (`Title/Heading 4`), card header text | all |
| UX-2 | Search placeholder "Search by company name". Source: search matches `displayName` only | `Input__Search` | L-01, L-02, E-01, LO-01 |
| UX-3 | Row actions as labelled text actions "Manage feature access" and "Manage company" in the Actions column (same words as the live tooltips). The Feature Access column then shows only the status tag. This is also what the Hydra Table cell supports (`type=action` = text actions) | `Table cell type=action`, `type=tag` + `Tag__Status warning` | L-01, L-02 |
| UX-4 | No-results state with the standard "Clear filters" action instead of plain "No data" | `Empty State Block` (secondary action on, primary off) | E-01 |
| UX-5 | Company Settings: "Company Name" marked required, "Website (optional)", breadcrumb `Companies / Company Settings` (instead of `Companies / List / Data`), card with one primary button (Save Changes) | `Input__Label` (`required`), `Input`, `Select`, `Button` primary | ED-01, ED-02 |
| UX-6 | Feature Access: description names the company ("Manage feature access limits for First Test Company."), the trash icon becomes a labelled text action "Reset to default" (the product already has that string, `reset-to-default`, unused) and asks for confirmation before it removes the custom rule. Breadcrumb `Companies / First Test Company / Feature access` | `Table cell` / `Button` text action, `Modal__Overlay` + `Modal` | DT-01, D-01 |
| UX-7 | Failed list load gets the standard error Alert + Retry (live is silent) | `Alert` `error` + `Button` default | ER-01 |
| UX-8 (optional, off) | Confirm before setting a feature to Disabled (it cuts access for a whole company instantly) | `Modal__Overlay` + `Modal` | one extra dialog frame |

UX-3 and the DS gap in Blocked are linked: if you prefer the live icon buttons, Question 1 decides it.

## Not seen live

LO-01, LO-02, LO-03 (loading flashes too fast to catch, design from source), ER-01 (a failed list request cannot be forced), ER-02, S-01, S-02 (need a real save), D-01 (live has no confirmation, proposed), the Disabled status (would change data), reset result (would delete a rule). Designed from the source strings and Hydra Spin, Alert, Message and Modal. Not forced.

## Blocked (missing component, variant or variable)

**Nothing blocks the whole module.** Gaps found (no token, component or variant will be created; each is handled by copy-and-adapt with bound hand-built containers, as in Access Blacklist). They need your OK (Questions 1, 2, 5):

1. **No table cell with an icon-only Button.** Hydra `Table / Table cell` `type=action` holds up to three text links. Live uses icon-only outlined buttons with a tooltip. Default: text links (UX-3).
2. **No table cell with a Select.** Hydra cell types are text, badge, tag, action, dropdown, rate, switch, progress. The Feature Access "Actions" cell holds a Select (Enabled / Disabled) plus the trash button. The `dropdown` cell is a text Dropdown; the Dropdown description says "to pick a value in a form or table cell use Select, not Dropdown". Default: a hand-built cell wrapper frame (same height, border and padding as the Hydra cell, all bound to Hydra variables) holding a linked Hydra `Select` instance and the "Reset to default" action. The other columns stay Hydra cell instances.
3. **Sidebar has no Feature Access Limit item and no chevrons for Companies / Users / Company Roles / Admin Roles** (the source nav makes Companies a group with one child "Companies list"). Same known gap as Access Blacklist. Default: same treatment (copied Sidebar, Companies selected).
4. No plain titled Card component (known). Hand-built `Table card` inherited from `3001:49`, bound.
5. Table column widths and the 54-high tag cell have no Hydra variable (raw geometry kept, same as Access Blacklist). Proposed widths: Name 260, Slug 220, Website fills, Country 120, Currency 120, Feature Access 200, Actions 300.
6. Country select shows a flag emoji (🇺🇸) in the live app. Hydra Select takes text; I will type the emoji as part of the text. If it does not render in the file font, I drop the flag and keep "United States".

## Protected, left as is

None known. `devStatus` cannot be read. The Companies page holds only the placeholder section `2958:63296`, which is not touched. Access Blacklist frames are only cloned.

## Live app issues

| # | Issue | How seen |
|---|---|---|
| I-1 | Top bar reads "Hi Admin, Welcome to ." (no product name) on every page. Kept as the copied frame shows. | Live |
| I-2 | Breadcrumbs show internal words or a wrong trail: list `Companies / List`; settings `Companies / List / Data`; feature access `Feature Access Limit / Default Limits / Companies / List / Feature Access Limit`. Last item is link-blue. | Live |
| I-3 | Resetting a custom feature rule is a bare trash icon next to the select, no label, no confirmation; it calls the delete at once (`handleDeleteOverride`). | Icon live. Behaviour source only (not clicked) |
| I-4 | Choosing Enabled or Disabled saves immediately with no confirmation and no Save button (`handleStatusChange`). | Select opened live, not changed. Behaviour source |
| I-5 | Feature module names are raw slugs (`bom-crm-integration`); no human label or description. The Feature Access filter on the list also lists slugs. | Live |
| I-6 | Three names for one page: tooltip "Manage Feature Access", browser title "Feature Access Control Management", heading "Feature Access Control". Same for "Manage Company" / "Company Settings". | Live |
| I-7 | No-results shows a generic Ant "No data" with no Clear filters action. The search term is stored in the URL with quotes (`?s_query="zzzz"`). | Live |
| I-8 | A failed list request leaves the table empty with no message (the `apiCompaniesAdminList` result is ignored when null). | Source only |
| I-9 | Company Settings: no required marker; Website accepts any text (typed "not a url", no error on blur, not saved); clearing the name shows "Company name is required." Editing the name can change the company slug and URL (`getNewSlugFromUpdateResponse` + `revalidateAuthAndUrlAfterCompanyUpdate`) without warning the user. Slug and Currency are shown in the list but not on the settings page (the Currency label exists in the strings, unused). | Live and source |
| I-10 | Website text wraps in the middle of the URL ("https://spaceinch.co / m/") because of the fixed table layout. | Live |
| I-11 | `/create-company` renders a blank page in the Admin; the source has an "Add Company" page with no entry point in the Admin. | Live and source |
| I-12 | The Feature Access column and the Feature Access page are hidden or redirect for roles without Feature Access Limit read/update permission. Not drawn (no role switching). | Source only |
| I-13 | Table row copy differs from the standard once it exists: live uses icon-only actions; Figma uses text actions (UX-3). When the "Table row actions" pattern lands, re-check wording. | Standard |

## Questions (with the default I would pick)

`Documentation/hydra-ux-patterns.md` has no "Table row actions", "Form modals" or "Overlay and canvas" sections yet (re-read 30 Oct, last edit 12:53). Until they land I follow the rules in my agent file. If the other agent's sections differ, I re-check before BUILD.

1. **Row actions: text links or icon buttons?** Live has two icon-only buttons; Hydra's action cell supports text links only. **Default: text links "Manage feature access" and "Manage company" in the Actions column** (UX-3). Alternative: icon buttons inside a hand-built cell wrapper (more live-like, less Hydra).
2. **Feature Access status Select inside a table cell.** Hydra has no such cell. **Default: hand-built cell wrapper (bound, same border and height) holding a linked `Select` + "Reset to default" text action.** Alternative: `type=switch` cell (Enabled / Disabled as a toggle, a small behaviour change, so I would not choose it).
3. **Titles.** **Default: page title above the card ("Companies", "Company Settings", "Feature Access Control"); list card header "5 companies" (count, like Access Blacklist)** instead of the live "Companies list".
4. **How many frames?** **Default: lean set of 14.** Add DT-02 (status select open), ER-03 (update failed) and S-03 (reset done) for 17.
5. **Sidebar gap (no Feature Access Limit, no chevrons).** **Default: build on the copied Sidebar as in Access Blacklist**, selected item Companies, icons fixed as in the agent file.
6. **"Reset to default" confirmation (UX-6).** **Default: include D-01; primary (orange) confirm button "Reset to default", not red**, because it removes a rule and does not delete data. Alternative: red, like the Access Blacklist Remove. (Pattern "Needs designer sign-off" once the doc has it.)
7. **UX-8 (confirm before Disable).** **Default: skip.** Add only if you want a second dialog frame.
8. **Create company.** **Default: do not draw** (no Admin entry point, blank page live).
9. **Filter popover frame L-02.** **Default: keep it** (three column filters are a core part of the list; the Hydra filter pieces exist).
10. **Feature Access frame height.** Live page scrolls (29 modules, no pagination). **Default: 1750 x 970 showing the first 8 rows**, a note in the plan that the list continues. The same frame is the base for the Feature Access Limit module later.

## Ledger

`Documentation/admin-figma-ledger.json`: `modules.Companies.status = "planned"`, with screens, section plan and sources. No node IDs created.


## Build outcome (30 Oct)

Page: https://www.figma.com/design/rONB8aMPanOjS3GC1uN16d/Admin---RSFC?node-id=2958-63286. Sections `3020:3675` to `3020:3682`, y 873 then +1480. Placeholder `2958:63296` untouched. 14 frames Built, 0 Moved, 0 Skipped, 0 Blocked. Access Blacklist frames fingerprint-checked after the build (256 descendants in `3001:49`, same section counts).

| # | Frame | Node | Outcome |
|---|---|---|---|
| L-01 | 01.01 List · Default | `3020:3683` | Built |
| L-02 | 01.02 List · Country filter open | `3022:5211` | Built |
| DT-01 | 02.01 Feature Access Control · Default | `3022:990` | Built |
| ED-01 | 03.01 Company Settings · Default | `3021:4415` | Built |
| ED-02 | 03.02 Company Settings · Name required | `3021:4764` | Built |
| D-01 | 04.01 Reset to default · Confirm | `3022:9473` | Built (overlay 0,0 1750x970, STRETCH) |
| E-01 | 05.01 Empty · No matching companies | `3022:5824` | Built |
| LO-01 | 06.01 Loading · List | `3022:6341` | Built |
| LO-02 | 06.02 Loading · Company Settings | `3022:8953` | Built |
| LO-03 | 06.03 Loading · Feature Access Control | `3022:9135` | Built |
| ER-01 | 07.01 Error · List failed to load | `3022:6104` | Built |
| ER-02 | 07.02 Error · Company Settings save failed | `3022:9353` | Built |
| S-01 | 08.01 Success · Company Settings saved | `3022:9385` | Built |
| S-02 | 08.02 Success · Feature Access updated | `3022:9414` | Built |

Changes against the plan after reading patterns doc sections 7 to 9:
- Row actions: sections 7.2 and 8.5 ask for small default Buttons, but the Hydra Table cell holds text links only (logged DS gap). Kept the Hydra `type=action` cell with two text links, as the coordinator's fallback says. In the Feature Access Actions cell (hand-built bound wrapper) the "Reset to default" action is a small default Button.
- Edit button wording follows the doc: "Save changes" (live: "Save Changes").
- Page title level is the inherited Access Blacklist one (Heading 2), not Heading 4 as the plan text said.
- D-01 uses `Modal__Confirmation` (copied from the updated Access Blacklist overlay `3005:3241`), orange primary "Reset to default".
