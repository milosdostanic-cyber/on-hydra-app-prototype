# Admin module plan — Knowledge Center

Status: **planned** (PLAN mode, run on 31 Oct 2026, read-only). Waiting for "Build approved: Knowledge Center".

Live walk: **not done** (Screen Recording is off). Every new screen is marked **Source** and listed under "Not seen live".

Product source read with `gh api` (`ooden-tech/on-hydra-app`, HEAD, checked identical on 31 Oct): `apps/on-hydra-frontend-datahub` (the Knowledge Center micro-frontend mounted by the admin app) — `layouts/DataHubAdminLayout.tsx`, `manual-files/pages/ManualFilesPage.tsx`, `components/ManualFilesTable.tsx`, `ManualFilesActionsMenu.tsx`, `DataHubFileModal` + `steps/Step1Recipients..Step4Summary`, `DataHubFileNewVersionModal`, `DataHubFileEditRecipientsModal`, `DataHubCompanyFilterSidebar`, `DataHubFilters`, `data-feeds/pages/DataFeedsPage.tsx`, `activity-log/pages/ActivityLogPage.tsx`, `src/locales/en/translation.json` (`data-hub.*`); admin `business/data-hub/pages/DataHubAdminHomepage.tsx` and nav.

Read before planning: the agent file, the ledger, the Release Notes plan and its Build outcome (moves with fingerprints, flows as whole units, new frames only for gaps), the Feature Access Limit shell, the arrange-pages run, the 28 Oct audit, `Documentation/hydra-ux-patterns.md` §7 and §8, `module-layout.md`. Figma read this run (read-only, Official MCP): Knowledge Center page `2803:16056` (metadata, parsed in scratch), screenshots of `2803:18583`, `2885:32591` and section `2878:4187`; metadata of sidebars `2926:34668`, `3083:3584` and FAL shell `3083:3582`; Hydra library search (Hydra key only).

## What the product does (source)

- Sidebar group **Knowledge Center** with children **Manual Files** (`/data-hub/files`), **Data Feeds**, **Activity Log**. Breadcrumb: home / Knowledge Center / <child>.
- **Shared layout (all three children):** left **Companies** panel (header + count, "Search companies...", "All Companies" with count, one row per company; empty "No companies with files yet."). Page header: title "Knowledge Center" (or the selected company name), description "Manage file exchanges with external partners" (or "File exchanges with {company}"), primary **"Upload File"** top right. `Tabs` Manual Files (with count `Badge`) · Data Feeds · Activity Log — the same three views as the sidebar children.
- **Manual Files:** search "Search files, companies, or recipients...", date `RangePicker`, "Clear filters". Table: File Name (sortable; "name — v2" for later versions) · Company (sortable) · Recipients · Categories (`Tag`, "+N" with tooltip) · Size · Date (sortable, "MMM DD, YYYY") · Uploaded By (sortable) · Actions (right-aligned). Row actions: small default **"Download"** + icon-only ⋮ (`MoreOutlined`) opening a menu **"Download file" · "Replace file" · "Manage recipients" · "Delete file"** (danger, last). Pagination.
  - Loading: table spinner. Error: `ErrorState` "Unable to load manual files." + "Retry". Empty: "No manual files found."; no results: "No manual files match your filters." + "Clear filters".
  - Download errors (toast): "Download link is not available for this file." / "Failed to download manual file."
  - **Delete:** `ConfirmModal` "Delete file?" / "This file will be removed from the manual files list." Cancel · Delete. Success toast "File deleted."; failure toast "Failed to delete manual file.".
- **Upload & Send File** modal (538), `Steps` Recipients · Upload · Labels · Review; footer Back · Cancel · Next (disabled until step 1 and 2 are done) / "Send File" on the last step.
  1. "Select Recipients": search "Search companies or users…", "Selected Recipients (N)", "Clear All", "Invite by Email" (this email only / entire domain).
  2. Upload: info `Alert` "Drag and drop a file or browse. Maximum size 1 GB.", dragger "Click to upload or drag and drop" / "Single file only. Maximum size 1 GB." / "Choose file"; `Progress` while uploading; error `Alert` "Upload failed."; too-large toast "File exceeds the 1 GB limit.".
  3. "Add Labels" / "Tag this file so recipients can find it more easily." `Tag.CheckableTag` per label (`TagOutlined`), "Or create a new label" + "New label name" + add button.
  4. "Review & Send" / "Confirm the details below before sending the file." `Descriptions` File · Size · Recipients (tags) · Labels (tags), "Note (optional)" TextArea "Add a note for the recipients…".
  - Send confirm "Send this file?" / "The file will be sent to N recipients." Go back · Send File. Discard confirm "Discard this upload?" / "The recipients, file and labels you added will be lost." Keep editing · Discard. Result as corner `notification`: "File sent." / "Failed to send file.".
- **Replace File with New Version** modal (600): "Upload a new version of {file}", Current File (v1 chip), New Version dropzone, warning `Alert` "Replacing File" / "The new file will replace the current version. Recipients will be notified…". Cancel · Replace File (disabled until a file). Confirm "Replace this file?" Go back · Replace File. Notification "New version published." / "Failed to publish new version."; load error with Retry.
- **Edit Recipients** modal (720): file name, "Company:", "Current Recipients (N)" / "Shared with", "Add New Recipients" / "Search and select additional companies, users, or add emails", Invite by Email. Cancel · Save Changes (disabled until changed). Loading `Skeleton`; load error `Alert` "Failed to load file details.". Removing everyone asks "Remove all recipients?" / "This file will no longer be shared with anyone. Continue?" Go back · Continue. Toasts "Recipients updated successfully." / "Failed to update recipients.".
- **Data Feeds:** `EmptyState` "Nothing here yet" / "Data Feeds is coming soon." (no table in the product).
- **Activity Log:** search, date range; entries grouped by day heading ("FRIDAY, FEBRUARY 6"), entry cards (event, file, time, user, company). Error `ErrorState` "Unable to load activity log." + Retry; empty "No activity log entries found."; no results "No activity log entries match your filters." + "Clear filters". **Nothing is shown while loading.** Pagination 20 / 50 / 100.

## Target

- **File:** Admin - RSFC (`rONB8aMPanOjS3GC1uN16d`). **Page:** `Knowledge Center` (`2803:16056`): https://www.figma.com/design/rONB8aMPanOjS3GC1uN16d/Admin---RSFC?node-id=2803-16056
- **Existing nodes (all protected by user decision: move only, never edited, resized or rebuilt):**

| # | Node | Section today | What it shows |
|---|---|---|---|
| X-1 | Section `01 · Current screens · Review` `2878:4186` (5538 x 1190 at 0, 0) | — | Holds E-01..E-03 |
| E-01 | `01.01 · Manual Files · Default` `2803:18583` | X-1 | 7 files, Download + ⋮, Companies panel, tabs, Upload File primary |
| E-02 | `01.02 · Activity Log · Default` `2834:3165` | X-1 | Day-grouped entries (Feb 4–6, 2026); Body 1030 in a 970 frame |
| E-03 | `01.03 · Data Feeds · Coming soon (current app)` `2880:6757` | X-1 | Coming-soon empty state; Body 1030 |
| X-2 | Section `02 · Required states & dialogs · Review` `2878:4187` (5538 x 4730 at 0, 1480) | — | Holds E-04..E-15 |
| E-04 | `02.01 · Manual Files · Empty / no results` `2880:4140` | X-2 | "No manual files found." (empty, no Clear filters) |
| E-05 | `02.02 · Activity Log · Empty / no results` `2880:4887` | X-2 | "No activity log entries found." |
| E-06 | `02.03 · Lists · Initial loading` `2880:5321` | X-2 | Manual Files tab, `Spin` in the card |
| E-07 | `02.04 · Lists · Request failure & retry` `2880:6034` | X-2 | Manual Files tab, error `Alert` + Retry |
| E-08 | `02.05 · Upload & Send File · Step 2 · Choose file` `2881:5362` | X-2 | Upload modal 538, step 2 dropzone |
| E-09 | `02.06 · Replace File · Choose new version` `2881:5629` | X-2 | Replace modal 538 (copy source for Release Notes) |
| E-10 | `02.07 · Delete File · Confirmation` `2881:5833` | X-2 | `Modal__Confirmation` "Delete file?" danger Delete |
| E-11 | `02.08 · Upload & Send File · Step 1 · Recipients selected` `2885:7184` | X-2 | Upload modal, step 1 with selected recipients |
| E-12 | `02.09 · Edit Recipients · Unchanged` `2885:7487` | X-2 | Edit Recipients 538, Save disabled (Access Blacklist modal reference) |
| E-13 | `02.10 · Manual Files · Row actions menu` `2885:32591` | X-2 | ⋮ menu: Replace File · Edit Recipients · Delete (danger) |
| E-14 | `02.11 · Manual Files · Active date range` `2886:9873` | X-2 | Date range filled |
| E-15 | `02.12 · Manual Files · Date range calendar open` `2891:9815` | X-2 | `Hydra Date range calendar` open |
| F-90 | Section `90 · Data Feeds proposals · Scope decision required` `2878:4188` (3692 x 1190 at 0, 6500) with `90.01 · Data Feeds · Populated proposal` `2834:3053`, `90.02 · Data Feeds · Empty proposal` `2851:4374` | — | Data Feeds table proposals (not in the product) |

- **Does the page follow the shared layout?** Partly. The canvas geometry (x 0, 290 apart, 48 / 80 / 140 insets, 96 gaps, 3 per row) and the canvas colours were applied on 30 Oct, but the **section grammar is not followed**: two "Review" sections mix list states, flows, dialogs, empty, loading and error. So moves are planned (Question 2 offers a no-move option).
- **Ready for Dev:** not read this run (read-only; earlier runs: Plugin API refuses `devStatus`, REST token invalid). No name says Ready for Dev; the section names say "Review". Treated as protected anyway (Question 1).
- **Sections** (Option A, my default; plain Sections at x 0, stacked from y 0, 290 apart; inside 48 / 80 / 140; screens 96 apart, max 3 per row, next row 210 below the tallest; one row group per sub-page in sidebar order Manual Files → Data Feeds → Activity Log; sizes computed at BUILD; fill white 10 %, canvas `#787A7E` re-checked):

| Section | Rows (reading order) |
|---|---|
| `01 · List` | E-01, E-13, E-14 · E-15, L-01, L-02 · E-03 · E-02 |
| `02 · Create` (Upload & send file flow) | E-11, E-08, C-01 · C-02, C-03 |
| `03 · Edit` | E-09, E-12, *ED-01 opt.* |
| `04 · Dialogs` | E-10, DI-01, DI-02 · DI-03, DI-04, DI-05 |
| `05 · Empty` | E-04, EM-01 · E-05, EM-02 |
| `06 · Loading` | E-06, LO-01 |
| `07 · Error` | E-07, ER-01, *ER-02 opt.* · *ER-03 opt.* |
| `08 · Success` | S-01, S-02, S-03 · S-04 |
| `90 · Data Feeds proposals · Scope decision required` | F-90 moved as **one unit** (y only, never reparented or renamed), 290 below `08 · Success` |

  X-1 and X-2 move to `🗄 Archive` `2109:27298` only once empty (nothing deleted or renamed). No Detail section (Manual Files has no detail page).
- **Page targeting:** every BUILD script starts with `const page = await figma.getNodeByIdAsync('2803:16056'); await page.loadAsync(); await figma.setCurrentPageAsync(page);`, appends sections with `page.appendChild(section)`, throws if `section.parent.id !== '2803:16056'`, and counts the children of Cover `260:653` before and after and throws if the count changed.
- **Move guard:** for each moved unit (E-01..E-15, F-90), fingerprint the unit and every descendant (id, type, name, w, h, x/y relative to the unit, visible, fills, strokes, bound variables, characters, text style id, main component key, variant and component properties) before and after in the **same** script; throw on any difference (relative positions within 0.05 px, as Release Notes) so Figma rolls back.
- **Frame size:** 1750 fixed width, hug height, minimum 970. **Names:** `NN.MM · Knowledge Center · <Sub-page> · <Screen> · <State>` (moved frames keep their names).
- **Copy sources (copy and adapt; originals never edited):**

| New | Cloned from | Main change on the copy |
|---|---|---|
| Shell (all new) | Feature Access Limit L-01 `3083:3582` (Sidebar `3083:3584`, extra linked item `3083:3930`, Topbar, Breadcrumb) | Knowledge Center `.menu__submenu` switched to its open variant with `.menu__submenu_list` **items=3** (exists: `I2926:34668;1144:24852`, list 144 = 3 x 48); Manual Files or Activity Log child selected via the `.menu__item` variant + icon recipe (on/off proof); extra Feature Access Limit item moved from y 506 to 654 (open group adds 148); Users collapsed (DownOutlined); breadcrumb `items=3` HomeOutlined / Knowledge Center / <child> |
| Manual Files content | `Main` of E-01 `2803:18583` (Companies panel, page header, `Tabs`, filter bar, table, `Pagination`) | Replaces the FAL `Content`; inherited hand-built containers rebound or stop |
| Activity Log content | `Main` of E-02 `2834:3165` | Hug height so nothing is clipped |
| Upload steps | E-08 `2881:5362` / E-11 `2885:7184` (`Modal__Overlay`, `🎰 modal` 538, `Steps`) | Step content; overlay fixed to the full frame, STRETCH / STRETCH (source overlay is 1030, 60 too tall) |
| Confirmations | E-10 `2881:5833` / Access Blacklist `3005:3188` (`Modal__Confirmation` via `🎰 modal`) | Title, description, verbs |
| Empty no results | E-04 content + `❖ Empty State Block` | Primary hidden, secondary "Clear filters" |
| Loading / Error | E-06 (`Spin`), E-07 (`Alert` + Retry) | Activity Log tab selected |
| Toasts | Companies `Message` `3022:9469` / Release Notes `3097:5196` | `Message` centred at y 16 |

## Screens

Sample data: the files and companies already in E-01 (New Reqs (1).pdf, 2.26.26 Full PIM Export.xlsx, First Test Company, …) and the entries in E-02.

| # | Screen | Section | State | Action | Live status |
|---|---|---|---|---|---|
| E-01 | Manual Files · Default `2803:18583` | 01 List | Default | **Move only** | Figma |
| E-13 | Manual Files · Row actions menu `2885:32591` | 01 List | Menu open | **Move only** | Figma |
| E-14 | Manual Files · Active date range `2886:9873` | 01 List | Filtered | **Move only** | Figma |
| E-15 | Manual Files · Date range calendar open `2891:9815` | 01 List | Calendar | **Move only** | Figma |
| L-01 | 01.05 · Manual Files · Current shell | 01 List | 7 files, 10 sidebar items, KC open, Manual Files selected | New (Question 5) | Source |
| L-02 | 01.06 · Manual Files · Company selected | 01 List | Title "First Test Company", "File exchanges with First Test Company", row selected in Companies, 1 file | New | Source |
| E-03 | Data Feeds · Coming soon `2880:6757` | 01 List | Coming soon | **Move only** | Figma |
| E-02 | Activity Log · Default `2834:3165` | 01 List | Default | **Move only** | Figma |
| E-11 | Upload & Send · Step 1 · Recipients selected `2885:7184` | 02 Create | Step 1 | **Move only** | Figma |
| E-08 | Upload & Send · Step 2 · Choose file `2881:5362` | 02 Create | Step 2 | **Move only** | Figma |
| C-01 | 02.03 · Upload & send file · Step 2 · Upload failed | 02 Create | Error `Alert`, Choose file again, Next disabled | New | Source |
| C-02 | 02.04 · Upload & send file · Step 3 · Labels | 02 Create | Two labels checked, "Or create a new label" | New | Source |
| C-03 | 02.05 · Upload & send file · Step 4 · Review and send | 02 Create | Summary rows, note field, "Send file" primary | New (Question 7) | Source |
| E-09 | Replace File · Choose new version `2881:5629` | 03 Edit | Default | **Move only** | Figma |
| E-12 | Edit Recipients · Unchanged `2885:7487` | 03 Edit | Save disabled | **Move only** | Figma |
| ED-01 *(opt.)* | 03.03 · Edit recipients · Changes to save | 03 Edit | One recipient added, Save enabled | New | Source |
| E-10 | Delete File · Confirmation `2881:5833` | 04 Dialogs | Confirm | **Move only** | Figma |
| DI-01 | 04.02 · Delete file · Delete failed | 04 Dialogs | Confirmation open, error `Message` above the overlay | New | Source |
| DI-02 | 04.03 · Discard this upload · Confirm | 04 Dialogs | Over step 3 | New | Source |
| DI-03 | 04.04 · Send this file · Confirm | 04 Dialogs | Over step 4, "3 recipients" | New | Source |
| DI-04 | 04.05 · Replace this file · Confirm | 04 Dialogs | Over the Replace modal | New | Source |
| DI-05 | 04.06 · Remove all recipients · Confirm | 04 Dialogs | Over Edit recipients, danger | New | Source |
| E-04 | Manual Files · Empty `2880:4140` | 05 Empty | No files | **Move only** | Figma |
| EM-01 | 05.02 · Manual Files · No results | 05 Empty | Search + date set, "Clear filters" | New | Source |
| E-05 | Activity Log · Empty `2880:4887` | 05 Empty | No entries | **Move only** | Figma |
| EM-02 | 05.04 · Activity Log · No results | 05 Empty | Filters set, "Clear filters" | New | Source |
| E-06 | Lists · Initial loading `2880:5321` | 06 Loading | Manual Files | **Move only** | Figma |
| LO-01 | 06.02 · Activity Log · Loading | 06 Loading | `Spin` in the content area | New (UX-5) | Not in product |
| E-07 | Lists · Request failure & retry `2880:6034` | 07 Error | Manual Files | **Move only** | Figma |
| ER-01 | 07.02 · Activity Log · Failed to load | 07 Error | `Alert` + "Retry" | New | Source |
| ER-02 *(opt.)* | 07.03 · Manual Files · Download failed | 07 Error | Error `Message` | New | Source |
| ER-03 *(opt.)* | 07.04 · Upload & send file · Send failed | 07 Error | Step 4 stays open, error `Message` | New | Source |
| S-01 | 08.01 · File sent | 08 Success | New row on top, `Message` | New | Source |
| S-02 | 08.02 · New version published | 08 Success | Row "— v2", `Message` | New | Source |
| S-03 | 08.03 · Recipients updated | 08 Success | Recipients cell updated, `Message` | New | Source |
| S-04 | 08.04 · File deleted | 08 Success | 6 files, `Message` | New | Source |
| F-90 | Data Feeds proposals (2 frames) | 90 (kept last) | Proposals | **Move only** (whole unit) | Figma |

**Count (lean set, my default): 16 Move units (17 existing screens; X-1 and X-2 to Archive once empty), 18 New, 0 Keep, 0 Rebuild, 0 Blocked** (C-03 depends on Question 7). With the three optional screens: 21 New.

Not drawn (borderline, ask if wanted): Step 1 "Invite by Email" domain option; Step 2 uploading with `Progress`; Replace / Edit recipients load error and skeleton; Companies panel empty; Activity Log for company users ("coming soon", not an admin view).

## Hydra components per screen

Searched live in Hydra Ant Design - DS only (`includeLibraryKeys` = `lk-0d30b3c5…19ed`) on 31 Oct. Found: `Steps` (`cb87f7d7…`), `Tabs` (`41a30c70…`), `Tag__Checkable` (`f42d2c0c…`), `Message` (`d8e5b62d…`), `Notification` (`b546bb2f…`), `Alert` (`03685410…`), `Modal__Confirmation` (`ff12f0bc…`), `Empty State Block` (`ca63fa15…`), `Spin` (`36bf6103…`), `Skeleton` (`cd1f4666…`), `Progress__Line` (`206a1d58…`), `Checkbox` (`044b4c3a…`), `Input` (`20cab57b…`), `Input__TextArea` (`466cd8e2…`), `Divider__Horizontal` (`7f56618e…`), `Result` (`6efd3042…`). `.menu__submenu_list` is not returned by search (internal) but its 3-item list is in use in `2926:34668`. **Not found: `Descriptions`.** Re-discover keys at BUILD.

| Need | Hydra component (variants / properties) | Used on |
|---|---|---|
| Shell | `Sidebar` (KC open, items=3, child selected), extra Feature Access Limit item, `Topbar`, `Breadcrumb items=3` | all new |
| Page header + tabs | From E-01: title `Title/Heading 3` role from the copy, description `colorTextDescription`, `Button` primary "Upload file" (`UploadOutlined`), `Tabs` with count `Badge` | all page frames |
| Manual Files table | From E-01: `Header Item` (sort), `Table cell type=text`, `Tag` categories, actions = `Button` small default "Download" + icon-only `Button` `MoreOutlined`; `Pagination` | L-01, L-02, S-*, layers under dialogs |
| Upload modal | `Modal__Overlay` + `🎰 modal` 538, `Steps` (current 2 / 3 / 4), `Alert` info / error, dropzone from E-08, `Tag__Checkable` + `TagOutlined`, `Input` + small `Button` `PlusOutlined`, summary rows (Question 7), `Tag` for recipients and labels, `Input__TextArea`; footer Back · Cancel · Next / "Send file" | C-01..C-03, DI-02, DI-03, ER-03 |
| Confirmations | `Modal__Confirmation` in `Modal__Overlay` (`🎰 modal`), full frame, STRETCH / STRETCH | DI-01..DI-05 |
| Empty / Loading / Error | `❖ Empty State Block` (secondary "Clear filters"), `Spin`, `Alert error` + `show description` + `Button` "Retry" | EM-01, EM-02, LO-01, ER-01 |
| Toasts | `Message type=success / error`, centred at y 16 | DI-01, ER-02, ER-03, S-01..S-04 |

Text styles and variables: the set already on E-01 and the Feature Access Limit copy. Nothing is created.

## UX improvements

`hydra-ux-audit` Layer 1 on the source screens (effortless × PRD × functional, 5-second test, one primary, plain copy, every state, progressive disclosure). New frames only.

- 5-second test: passes on Manual Files (one primary "Upload File", clear table). Fails on Activity Log loading (blank page looks like no data), on "Remove all recipients" (the "Continue" button hides what happens), and on Step 2 errors ("Upload failed." with no next step).
- One primary per screen: "Upload file" on page frames; "Next" / "Send file" / "Replace file" / "Save changes" / the danger verb on dialog frames (page primary under the scrim).

| # | Improvement | Hydra component that carries it | Screens |
|---|---|---|---|
| UX-1 | Shared shell: 10 sidebar items, Knowledge Center open with the right child selected, Feature Access Limit item below the group, HomeOutlined / Knowledge Center / <child> | `Sidebar`, `.menu__submenu_list items=3`, `Breadcrumb items=3` | all new |
| UX-2 | Row menu without the duplicate Download: "Replace file", "Edit recipients", "Delete" (danger, last), same verbs as the dialogs (§7.2; Figma E-13 already does this) | `Dropdown / Menu` from E-13 | none drawn open (rule for any menu shown) |
| UX-3 | "No results" separate from "no data": "No files match your filters" / "Try other words or a different date range." + secondary "Clear filters"; same for Activity Log | `❖ Empty State Block` | EM-01, EM-02 |
| UX-4 | Upload failure says what to do: "Couldn't upload this file" / "Check your connection and try again. Files can be up to 1 GB."; the 1 GB hint shown once (dragger hint only) | `Alert error` + `show description` | C-01 |
| UX-5 | Activity Log shows a spinner while loading (product shows nothing) | `Spin` | LO-01 |
| UX-6 | Activity Log error like Manual Files: "Activity log couldn't load" / "Check your connection and try again." + "Retry" | `Alert`, `Button` | ER-01 |
| UX-7 | Review step as a short summary before sending; note marked optional in the label, not in brackets | summary rows, `Input__Label`, `Input__TextArea` | C-03 |
| UX-8 | Send confirm with the count: "Send this file?" / "“Q1 2026 Sales Report.xlsx” will be sent to 3 recipients." Cancel "Go back" · primary "Send file" | `Modal__Confirmation` | DI-03 |
| UX-9 | Discard as a destructive confirm: Cancel "Keep editing" · danger "Discard" | `Modal__Confirmation` | DI-02 |
| UX-10 | Remove-all with an honest verb: "Remove all recipients?" / "“New Reqs (1).pdf” will no longer be shared with anyone." Cancel "Go back" · danger "Remove all" (live: "Continue") | `Modal__Confirmation` | DI-05 |
| UX-11 | Delete failure keeps the dialog open: error toast "Couldn't delete the file. Try again." | `Modal__Confirmation`, `Message` | DI-01 |
| UX-12 | Results as centred toasts with the outcome: "File sent to 3 recipients." / "New version published." / "Recipients updated." / "File deleted." (live uses corner notifications for send and replace) | `Message` | S-01..S-04 |
| UX-13 | Sentence-case buttons and titles on new frames: "Upload file", "Send file", "Replace file", "Edit recipients", "Save changes", "Clear all", "Review and send" | `Button`, text overrides | all new |
| UX-14 | Company focus is obvious: page title becomes the company name, subtitle "File exchanges with First Test Company", selected row in the Companies panel | text overrides, panel row from E-01 | L-02 |

## Not seen live

All 18 (and 3 optional) new screens, plus confirmation that the live app matches the existing Figma frames. In particular: the live Companies panel, the upload steps 3 and 4, toast placement, the Activity Log loading look, real dev data.

## Blocked (missing component, variant or variable)

**Nothing blocks the lean set if Question 7 keeps its default.** Known gaps, nothing will be created:

1. **No `Descriptions` component**: the Step 4 summary is composed from Hydra text styles (label `colorTextDescription`, value `Base/Normal`) in bound Auto Layout rows with `Tag`s (Question 7). If you want a DS component instead, C-03 is Blocked.
2. **No Upload / Dragger component**: dropzone copied from E-08 / E-09; BUILD scans it and rebinds any raw value, or stops and asks.
3. **`Modal` inside `Modal__Overlay` locked at 538** (Dashboard finding): all KC modals stay at 538 like the existing frames (Question 11).
4. Sidebar has no Feature Access Limit slot (DS request open; extra linked item used, as on every built module).
5. Verify at BUILD (stop if missing): `Steps` current 3 / 4, `Tag__Checkable checked`, `.menu__submenu` open variant with `items=3` on the FAL copy's sidebar, `Empty State Block` secondary action.

## Protected, left as is

All of E-01..E-15 and F-90 (`2834:3053`, `2851:4374`). Their drift stays:
- Sidebar with **9 items** (no Feature Access Limit) in all 17 frames; KC group open with the child selected (correct).
- Sidebar instance 1030 tall inside 970 frames in 16 frames, and `Body` 1030 in E-02, E-03 and `2834:3053` (bottom 60 clipped).
- `Modal__Overlay` 1750 x 1030 on E-08, E-09, E-10, E-11, E-12 (60 taller than the frame).
- Title-case labels ("Upload File", "Replace File", "Edit Recipients"); layer names "Row actions menu (proposal)".
- E-04 is the "no data" state only (no Clear filters) although named "Empty / no results"; E-06 and E-07 show the Manual Files tab only.
- **Row actions (28 Oct audit item):** Figma E-13 menu = Replace File · Edit Recipients · Delete; the product menu = Download file · Replace file · Manage recipients · Delete file (Download repeated from the button). Figma stays as is; recommended standard in UX-2, dev difference in I-1.

## Live app issues

| # | Issue | How seen |
|---|---|---|
| I-1 | Row menu repeats Download ("Download" button and "Download file" item); menu says "Manage recipients" but the modal is "Edit Recipients"; "Delete file" vs dialog "Delete". | Source |
| I-2 | Activity Log shows nothing while loading. | Source |
| I-3 | Send and Replace results use corner `notification`; Delete and Edit recipients use `message`. | Source |
| I-4 | "Remove all recipients?" confirms with "Continue" and the text ends with "Continue?". | Source |
| I-5 | Title-case buttons and titles ("Upload File", "Send File", "Save Changes", "Clear All", "Review & Send"). | Source |
| I-6 | The 1 GB limit is stated twice in step 2; a too-large file is only a toast. | Source |
| I-7 | Modal widths 538 / 600 / 720 for upload, replace and edit recipients (Figma uses 538 for all). | Source |
| I-8 | Tabs repeat the sidebar children (two navigations for the same three views). Observation only. | Source |
| I-9 | Top bar "Hi Admin, Welcome to ." (known, all modules). | Ledger |

## Questions (with the default I would pick)

1. **Ready for Dev.** Is any KC section (`2878:4186`, `2878:4187`, `2878:4188`) or frame Ready for Dev? **Default: none** (unreadable; names say "Review"). If one is, I move that whole section instead of pulling frames out, or leave it (Question 2 B).
2. **Section layout.** **Default A:** create `01 · List` … `08 · Success`, move E-01..E-15 into them with same-script fingerprints, keep F-90 whole at the bottom, move the emptied X-1 and X-2 to `🗄 Archive`. B: leave the three existing sections untouched and add the new sections below F-90 with new frames only (no protected node moves).
3. **Three sub-pages in one grammar.** **Default:** one set of sections, a row group per sub-page (Manual Files, Data Feeds, Activity Log). Alternative: a nested section per sub-page inside each section.
4. **Data Feeds proposals (F-90).** **Default:** keep on the page as one unit after `08 · Success`. Alternative: move to `🗄 Archive`.
5. **Current-shell list L-01.** **Default: yes** (10-item shell, copy base for every new frame).
6. **Row actions in new frames.** **Default:** keep the KC pattern (small "Download" + ⋮ menu), which fits §7.2 (max 2 visible, rest in a menu). Alternative: text row actions as in Release Notes and Company Roles.
7. **Step 4 summary without `Descriptions`.** **Default:** compose bound label / value rows from Hydra text styles + `Tag`s. Alternative: Blocked until the DS adds Descriptions.
8. **Toasts.** **Default:** `Message` centred at y 16 (agent standard). Alternative: corner `Notification` as live for send / replace.
9. **Sentence case (UX-13).** **Default: yes** on new frames; moved frames keep title case, so the page will be mixed.
10. **Remove-all verb (UX-10).** **Default:** danger "Remove all". Alternative: live "Continue".
11. **Modal widths.** **Default:** 538 for all, as the existing KC frames. Alternative: live 538 / 600 / 720.
12. **How many frames.** **Default: lean 18.** Optional: ED-01, ER-02, ER-03.
13. **Delete failure.** **Default:** error `Message` above the overlay, confirmation stays open (agent rule, as Release Notes). Alternative: error `Alert` inside the dialog (§7.3).
14. **Top bar text.** **Default:** keep the Feature Access Limit copy ("Hi Admin, Welcome to .").

## Ledger

Not edited in this run. Entry to add as `modules["Knowledge Center"]`, status `planned`, is returned in the reply. No Figma node was created, moved or edited.
