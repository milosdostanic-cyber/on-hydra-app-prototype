# Admin module plan — Release Notes

Status: **built on 2026-10-30** ("Build approved: Release Notes"). See "Decisions" and "Build outcome" at the end.

Live walk: **not done** (Screen Recording is off). Every new screen is marked **Source** and listed under "Not seen live".

Product source read with `gh api` (`ooden-tech/on-hydra-app`, HEAD on 30 Oct): admin `business/release-notes/pages/ReleaseNotesAdminPage/index.tsx`, components `ReleaseNoteFormModal`, `ReleaseNoteBodyEditor`, `ReleaseNoteBulkUploadModal`, `ReleaseNoteDeleteModal`, `hooks/useReleaseNotesAdmin.ts`, `utils/validateReleaseNotesBulkUploadFile.ts`, admin `en/translation.json` (`release-notes.*`).

Read before planning: the agent file, the ledger, the Dashboard plan and its Build outcome (protected frame moved with fingerprints, new frames only for gaps, DS gaps), the Feature Access Limit shell, the arrange-pages plan, the 28 Oct audit (`Documents/plans/2026-10-28-jira-admin-figma-audit-task.md`), `Documentation/hydra-ux-patterns.md` §7, §8, §9, `module-layout.md`, `hydra-ux-audit` Layer 1. Figma read this run (read-only, Official MCP): Release Notes page `2218:7642` (metadata), screenshots of `2218:10670`, `2218:11455`, `2218:12859`, `2218:14091`, Knowledge Center Replace File `2881:5629`; Hydra library search (Hydra key only); page list of Release Notes - RSFC (`a4gviD5oViRhasSCN6cC8Z`).

## What the product does (source)

- One page, `/release-notes`, sidebar item **Release Notes** (second in the sidebar). Browser title "Release Notes". Breadcrumb: home icon / Release Notes.
- **List card**: title "{total} release notes"; header actions: default "Bulk Upload" (upload icon) and primary "New Release Note" (plus icon). Table: Title (strong; "Untitled release note" if empty) · **Published Date** (sortable, "June 29, 2026" or "-") · Type tag (Feature / Improvement / Fix) · Status tag (Draft / Published) · New ("New" tag or "-") · Last edited ("Jun 29") · Actions (link buttons "Edit" · "Delete" with a "·" separator, centred). Pagination 20 per page with size changer.
- **Loading**: `Card loading` (skeleton) on first load; the table spins on refetch. **Error**: not handled; a failed load shows the empty state.
- **Empty**: antd `Empty` "No release notes yet" (no action).
- **New / Edit release note** modal (760): sections "Content" (Title *, Type * Select "Select type", "Summary for Modal *" TextArea with help "Shown in the What's New login modal. Keep it brief - one sentence.", "Full Release Note Content" rich-text editor with Bold, Italic, Underline, H1, H2, bulleted and numbered list, help "Shown on the Release Notes page. Can be more detailed.") and "Visibility" (Switches "Show in login modal", "Mark as new release notes"). Footer Cancel · Save draft · Publish (primary, disabled until Title, Type and Summary are filled). Save failure: error `Alert` at the top "Unable to save this release note. Try again."; field errors under fields. Closing with changes asks "Discard unsaved changes?" / "You have unsaved changes in this release note." Cancel · "Discard changes".
- **Delete** modal (520): "Delete release note?" / `You are about to permanently delete "{title}". This cannot be undone.` Cancel · danger "Delete"; failure: error `Alert` in the modal.
- **Quick Bulk Upload** modal (480): subtitle "Valid notes are imported automatically. Rows with errors are skipped."; drop zone "Drag and drop a file here" / "CSV or XLSX accepted" / "Choose file"; link "Download template CSV"; Cancel · "Upload and Import" (disabled until a file). Selected file: name, size, "Remove file". Uploading: Progress + "Uploading". File errors (Alert): "Unsupported file type. Only CSV and XLSX are allowed.", "Uploaded file exceeds size limit."; upload failure: "Unable to process bulk upload. Try again." **Result**: "Import complete", "Total: N | Imported: N | Skipped: N", stats "Imported as draft" / "Rows skipped", link "Download error report"; footer Close · dashed "Publish all" · primary "View Release Notes". Publish all asks "Publish {count} imported release notes?" / "This will publish all release notes that were imported in this upload." Cancel · Publish.
- **Messages**: Release note created / updated / deleted; Imported release notes were published; failure toasts for template download, bulk upload, bulk publish.

## Target

- **File:** Admin - RSFC (`rONB8aMPanOjS3GC1uN16d`). **Page:** `Release Notes` (`2218:7642`): https://www.figma.com/design/rONB8aMPanOjS3GC1uN16d/Admin---RSFC?node-id=2218-7642
- **Context only (not written):** Release Notes - RSFC (`a4gviD5oViRhasSCN6cC8Z`) has pages Cover, `--`, Release Notes Flow (`0:1`) — the customer-facing flow, not the admin module. Nothing reused from it.
- **Existing nodes (all protected by user decision; move only, never edited, resized or rebuilt):**

| # | Node | Type, size, position | What it shows |
|---|---|---|---|
| X-0 | `Release Notes · Admin` `2218:10669` | Section 5538 x 4180 at (0, 0) | Holds everything below |
| E-01 | `Release Notes Admin` `2218:10670` | Frame 1750 x 980 at (48, 80) | List, 8 notes, old shell; no Published Date column (date under the title) |
| E-02 | `Release Notes Admin - Empty State` `2218:11455` | Frame 1750 x 980 at (1894, 80) | "0 release notes", antd Empty "No release notes yet"; sidebar shows a Content submenu twice |
| E-03 | `Release Notes Admin - Delete Note` `2218:11282` | Frame 1750 x 980 at (3740, 80) | Hand-built 420 confirm `Container` `2218:11446` |
| F-1 | `MANUAL NOTE CREATION FLOW` `2218:12859` | Nested section 3692 x 1200 at (48, 1350) | `- New Note` `2218:10832`, `- Edit Note` `2218:11057` (hand-built 720 modal, black overlay) |
| F-2 | `BULK NOTE CREATION FLOW` `2218:14091` | Nested section 3574 x 1200 at (48, 2840) | `- Bulk upload 1` `2218:11484` (1750 screen), loose 480 modal frames `Loading` `2218:11533`, `confirm` `2218:11560`, `Success` `2218:11581` |

- **Ready for Dev:** not read this run (read-only; earlier runs: Plugin API refuses `devStatus`, REST token invalid). No name says Ready for Dev. Everything above is treated as protected anyway (Question 11).
- **Flows stay whole:** F-1 and F-2 are moved as one unit each (frames inside are never pulled out, so the flow order and grouping stay). The Edit Note screen therefore lives inside F-1 in `02 · Create`; there is no `03 · Edit` section.
- **Sections** (plain Sections at x 0, stacked from y 0, 290 apart; inside 48 left/right, 80 top, 140 bottom; screens 96 apart, max 3 per row, next row 210 below the tallest; a nested section gets its own row 290 below; sizes computed at BUILD; fill white 10 %, canvas `#787A7E` re-checked):

| Section | Row by row (reading order) |
|---|---|
| `01 · List` | E-01 (moved), L-01 |
| `02 · Create` | F-1 (moved, nested) · C-01, C-02 · F-2 (moved, nested) · C-03, C-04 |
| `03 · Dialogs` | E-03 (moved), DI-01, DI-02 · DI-03 |
| `04 · Empty` | E-02 (moved), *EM-01 opt.* |
| `05 · Loading` | LO-01 |
| `06 · Error` | ER-01, *ER-02 opt.* |
| `07 · Success` | S-01, S-02, S-03 · *S-04 opt.* |

- **Page targeting (Dashboard lesson: sections were first created on Cover):** every BUILD script starts with `const page = await figma.getNodeByIdAsync('2218:7642'); await page.loadAsync(); await figma.setCurrentPageAsync(page);`, creates each section with `page.appendChild(section)`, and throws if `section.parent.id !== '2218:7642'`. Each script also counts the children of Cover `260:653` before and after and throws if the count changed. Never rely on the default `figma.currentPage`.
- **Move guard:** for each moved unit (E-01, E-02, E-03, F-1, F-2), fingerprint the unit and every descendant (id, type, name, w, h, x/y relative to the unit, visible, fills, strokes, bound variables, characters, text style id, main component key, variant and component properties) before and after the reparent in the **same** script; throw on any difference so Figma rolls back. X-0 is moved to `🗄 Archive` `2109:27298` only once empty (Question 1). Nothing is deleted or renamed.
- **Frame size:** 1750 fixed width, hug height, minimum 970. **Names:** `NN.MM · Release Notes · <Screen> · <State>` (moved frames keep their names).
- **Copy sources (copy and adapt; originals never edited):**

| New | Cloned from | Main change on the copy |
|---|---|---|
| L-01 | Shell: Feature Access Limit L-01 `3083:3582`. Table card: Access Blacklist L-01 `3001:49`; tag cells as Dashboard DI-01 `3095:8355` | Release Notes `selected=true` via the `.menu__item` variant (icon recipe, on/off proof), extra Feature Access Limit item unselected, Users collapsed (DownOutlined); breadcrumb `items=2` HomeOutlined / Release Notes; card title "8 release notes", header actions, 7 columns, `Pagination` |
| C-01, C-02 | L-01 + Dashboard C-01 `3093:586` (`Input__Label`, `Input`, `Input__Caption`) + Dashboard DI-01 method for a wider linked `Modal` on `Modal__Overlay` | Note form (UX-4, UX-5) |
| C-03, C-04, DI-03 | L-01 + Knowledge Center Replace File `2881:5629` (DS `Modal` 538, drop zone, `Alert`) | Bulk upload modal; overlay fixed to full frame (the source overlay is 60 too tall) |
| DI-01, DI-02 | L-01 / C-01 + Dashboard DI-02 `3097:1398` / Access Blacklist `3005:3188` (`Modal__Confirmation` in `Modal__Overlay` via `🎰 modal`) | Confirmations |
| LO-01 | L-01 | `Skeleton type=basic` replaces the table rows (product uses `Card loading`) |
| ER-01 | L-01 + Companies Error `3022:6104` (`Alert` + Retry) | State block in the card |
| S-*, ER-02, DI-01 toast | L-01 + Companies Message `3022:9469` | `Message` centred at y 16 |

## Screens

Sample data: the 8 notes already in E-01 (Project Tags Draft, SeisBrace PDF Export Alignment, …), published dates June 29 / June 12 / May 20, 2026; drafts show "-".

| # | Screen | Section | State | Action | Live status |
|---|---|---|---|---|---|
| E-01 | Release Notes Admin `2218:10670` | 01 List | Default (old shell) | **Move only** | Figma |
| L-01 | 01.02 · List · Current shell | 01 List | 8 notes, Published Date column (sorted descending), text actions | New (Question 2) | Source |
| F-1 | MANUAL NOTE CREATION FLOW `2218:12859` (New Note, Edit Note) | 02 Create | Default create / edit | **Move only** (as one unit) | Figma |
| C-01 | 02.01 · New release note · Not ready to publish | 02 Create | Title filled, Type and Summary empty, Publish disabled with reason, editor toolbar | New | Source |
| C-02 | 02.02 · New release note · Save failed | 02 Create | Error `Alert` at the top of the body, values kept | New | Source |
| F-2 | BULK NOTE CREATION FLOW `2218:14091` (Bulk upload 1, Loading, confirm, Success) | 02 Create | Initial, uploading, selected, result | **Move only** (as one unit) | Figma |
| C-03 | 02.03 · Bulk upload · File not supported | 02 Create | `Alert` error, no file, Upload disabled | New | Source |
| C-04 | 02.04 · Bulk upload · Upload failed | 02 Create | File selected, `Alert` error, Upload enabled to retry | New | Source |
| E-03 | Release Notes Admin - Delete Note `2218:11282` | 03 Dialogs | Delete confirm (old shell) | **Move only** | Figma |
| DI-01 | 03.01 · Delete release note · Delete failed | 03 Dialogs | `Modal__Confirmation` stays open, error `Message` above the overlay | New | Source |
| DI-02 | 03.02 · Discard unsaved changes · Confirm | 03 Dialogs | `Modal__Confirmation` stacked over the note form | New | Source |
| DI-03 | 03.03 · Publish imported notes · Confirm | 03 Dialogs | `Modal__Confirmation` over the import result | New | Source |
| E-02 | Release Notes Admin - Empty State `2218:11455` | 04 Empty | No notes (old shell) | **Move only** | Figma |
| EM-01 *(opt.)* | 04.02 · No release notes · Current shell | 04 Empty | `❖ Empty State Block` with "New release note" | New | Source |
| LO-01 | 05.01 · Release notes · Loading | 05 Loading | Card title without count, `Skeleton` in the card | New | Source |
| ER-01 | 06.01 · Release notes · Failed to load | 06 Error | `Alert` error + "Retry" centred in the card | New | Not in product (UX-9) |
| ER-02 *(opt.)* | 06.02 · Template download failed | 06 Error | Bulk modal + error `Message` | New | Source |
| S-01 | 07.01 · Release note published | 07 Success | New row on top, `Message` success | New | Source |
| S-02 | 07.02 · Release note deleted | 07 Success | 7 notes, `Message` success | New | Source |
| S-03 | 07.03 · Imported notes published | 07 Success | Imported rows now Published, `Message` success | New | Source |
| S-04 *(opt.)* | 07.04 · Draft saved | 07 Success | Draft row, `Message` success | New | Source |

**Count (lean set, my default): 5 Move units (9 existing screens, plus X-0 to Archive once empty), 13 New, 0 Keep, 0 Rebuild, 0 Blocked.** With all three optional screens: 16 New.

Not drawn (borderline, ask if wanted): Edit form while the note loads; Type Select open; file too large (same pattern as C-03); import with every row skipped.

## Hydra components per screen

Searched live in Hydra Ant Design - DS only (`includeLibraryKeys` = `lk-0d30b3c5…19ed`) on 30 Oct. Found: `Tag` (`7e6f3259…`), `Tag__Colorful` (`9f805db0…`, magenta, lime, blue, …), `Table` (`87fe6b6c…`), `Table / Table cell` (`e5780965…`), `Table / Table Item / Header Item` (`71df4b80…`, sort), `Pagination` (`4a0d40c0…`), `Skeleton` (`cd1f4666…`), `Progress__Line` (`206a1d58…`), `Spin` (`36bf6103…`), `Switch` (`e1474c41…`), `Input` (`20cab57b…`), `Input__TextArea` (`466cd8e2…`), `Divider__Horizontal` (`7f56618e…`), `Empty State Block` (`ca63fa15…`), `Modal__Confirmation` (`ff12f0bc…`), icons `UploadOutlined` (`6cf8b842…`), `CloudUploadOutlined` (`6f2b0aa4…`), `PlusOutlined` (`c3130c21…`), `BoldOutlined` (`a32c9c8d…`), `ItalicOutlined` (`1cdafbea…`), `UnderlineOutlined` (`daa1bef5…`), `OrderedListOutlined` (`eb62e3a8…`), `UnorderedListOutlined` (`a8f0c25c…`). From the Dashboard run (re-check at BUILD): `Modal`, `Modal__Overlay`, `Input__Label`, `Input__Caption`, `Select`, `Alert`, `Message`, `Button`. **Not found: an Upload / Dragger component** (drop zone copied from `2881:5629`) and no Card (known). Re-discover keys at BUILD.

| Need | Hydra component (variants / properties) | Used on |
|---|---|---|
| Shell | `Sidebar` (Release Notes selected), `Topbar`, `Breadcrumb items=2`, extra linked Feature Access Limit item, from the copy | all new |
| Card header | Title `Title/Heading 5` "8 release notes"; `Button` default "Bulk upload" + `UploadOutlined`, `Button` primary "New release note" + `PlusOutlined` | all page frames |
| Table | `Header Item` (Published Date with sort), `Table cell type=text` (Title `Base/Strong` role from the copy), `type=tag` with `Tag__Colorful` (Feature blue, Improvement lime, Fix magenta, Published blue, New magenta) and `Tag` (Draft); Actions `Table cell type=action` "Edit", "Delete" (`colorErrorText`, last), right-aligned; `Pagination` | L-01, S-*, page layers under dialogs |
| Note form | Wider linked `Modal` on `Modal__Overlay`; `Divider__Horizontal` titled "Content" / "Visibility"; `Input__Label` vertical medium (`required` for Title, Type, Summary; no "*" in the text); `Input`, `Select`, `Input__TextArea`, `Input__Caption` help; editor toolbar = small text `Button`s with the five icons + "H1" / "H2" over `Input__TextArea`; `Switch` x2; footer Cancel · Save draft · Publish | C-01, C-02, DI-02 |
| Bulk modal | DS `Modal` 538 from `2881:5629`, drop zone (copied, rebound), `CloudUploadOutlined`, `Button` small "Choose file", link `Button` "Download template CSV", `Alert type=error` | C-03, C-04, DI-03, ER-02 |
| Confirmations | `Modal__Confirmation` in a `Modal__Overlay`, full frame, STRETCH / STRETCH | DI-01..03 |
| Loading / Error / Empty | `Skeleton type=basic`; `Alert error` + `show description` + `Button` "Retry"; `❖ Empty State Block` | LO-01, ER-01, EM-01 |
| Toasts | `Message type=success / error`, centred at y 16 | DI-01, ER-02, S-* |

Text styles and variables: the set on the Feature Access Limit copy and the Dashboard modals. Nothing is created.

## UX improvements

Run with `hydra-ux-audit` Layer 1 on the source screens (effortless x PRD x functional, 5-second test, one primary, plain copy, every state, progressive disclosure). New frames only.

- 5-second test: passes for "add one note" (one primary, New release note). Fails on the form: Publish is disabled with no reason, and "Summary for Modal" does not say which modal. Fails on a failed list load: it reads as "no release notes yet".
- One primary per screen: "New release note" on page frames; "Publish" / "Upload and import" / "Delete" / "Discard changes" / "Publish" on dialog frames (page primary under the overlay).

| # | Improvement | Hydra component that carries it | Screens |
|---|---|---|---|
| UX-1 | Shared shell: 10 sidebar items, Release Notes selected, HomeOutlined / Release Notes, current top bar | `Sidebar`, `Breadcrumb items=2` | all new |
| UX-2 | Published Date as its own sortable column (audit gap); dates no longer under the title | `Header Item` sort, `Table cell type=text` | L-01, S-* |
| UX-3 | Row actions on the standard: "Edit", "Delete" (danger, last), right-aligned "Actions", no "·" | `Table cell type=action` | L-01, S-* |
| UX-4 | Publish disabled with its reason as a caption at the end of the form: "Add a title, type and summary to publish."; required markers from the label, not the text; Summary help kept | `Input__Label required`, `Input__Caption` | C-01 |
| UX-5 | Save failure keeps the form: `Alert` "Couldn't save the release note" / "Your changes are still here. Try again." at the top of the body | `Alert error` | C-02 |
| UX-6 | File errors say what to do: "This file type isn't supported" / "Upload a CSV or XLSX file. Use the template if you are not sure."; upload failure "Couldn't import this file" / "Check that it matches the template, then try again." | `Alert error` + `show description` | C-03, C-04 |
| UX-7 | Delete on §7.3: "Delete release note?" / "“Project Tags” will be deleted. This can't be undone." Cancel · danger "Delete"; failure toast "Couldn't delete the release note. Try again." | `Modal__Confirmation`, `Message` | DI-01 |
| UX-8 | Discard as a destructive confirm: "Discard unsaved changes?" Cancel "Keep editing" · danger "Discard changes" | `Modal__Confirmation` | DI-02 |
| UX-9 | A real error state instead of the empty state: "Release notes couldn't load" / "Check your connection and try again." + "Retry" | `Alert`, `Button` | ER-01 |
| UX-10 | Loading without a false "0 release notes": title "Release notes", skeleton rows | `Skeleton` | LO-01 |
| UX-11 | Toasts with the result: "Release note published." / "Release note deleted." / "5 release notes published." (live says "created" for draft and publish) | `Message` | S-01..03 |
| UX-12 | Sentence-case buttons: "Bulk upload", "New release note", "Upload and import", "View release notes" (Question 9) | `Button` | all new |
| UX-13 *(opt.)* | Empty state with a next step: "No release notes yet" / "Write one, or import several from a CSV." primary "New release note", secondary "Bulk upload" | `❖ Empty State Block` | EM-01 |

## Not seen live

All 13 (and 3 optional) new screens. In particular: the live top bar, real dev data, the table loading look, the editor toolbar, the drop zone styling, the import result layout. Designed from source strings and Hydra components.

## Blocked (missing component, variant or variable)

**Nothing blocks the lean set.** Known gaps, nothing will be created:

1. **No Upload / Dragger component**: the drop zone is copied from Knowledge Center `2881:5629`; BUILD scans it and rebinds any raw value, or stops and asks.
2. **No rich-text editor component**: toolbar composed of Hydra `Button`s and icons over `Input__TextArea` (Question 7). No H1 / H2 icon in Ant icons, so those two are text buttons.
3. **`Modal` inside `Modal__Overlay` is locked at 538** (Dashboard finding): the note form uses the overlay as the scrim with its own modal hidden and a separate linked `Modal` resized on top, as Dashboard DI-01.
4. Sidebar has no Feature Access Limit slot (DS request open); no modal width tokens; `Table cell type=tag` height 54 as Company Roles.
5. Verify at BUILD (stop if missing): `Header Item` sort state, `Button` disabled and link types, `Switch checked=false`, `Select` placeholder state.

## Protected, left as is

All of E-01, E-02, E-03, F-1 (with `2218:10832`, `2218:11057`) and F-2 (with `2218:11484`, `2218:11533`, `2218:11560`, `2218:11581`). Their drift stays:
- Hand-built `Sidebar_new` with 9 items in an old order (Knowledge center second, Release Notes fourth); E-02 shows Content twice.
- Old top bar "Hi Admin, welcome to RSFC." with "Project:"; breadcrumb "Admin / Release Notes" (no HomeOutlined).
- List without the Published Date column; row actions "Edit · Delete" with grey Delete.
- Hand-built modals (720 note form, 420 delete, 480 bulk) on a raw "Rectangle 1" overlay (MIN / MIN, renders black); bulk upload hard-coded colours.
- Note form shows a "Published Date *" field and a required "Full Release Note Content *" that the product does not have, and no editor toolbar.
- F-2 order is Bulk upload, Loading, confirm, Success (the product order is initial, selected, uploading, result); three of its frames are modal-only, not full screens.

**Question 2** asks whether a current-shell list (L-01) should be added; it is in the lean set by default because it is the only way to show the Published Date column and it is the copy base for every new frame.

## Live app issues

| # | Issue | How seen |
|---|---|---|
| I-1 | A failed list load shows "No release notes yet" and "0 release notes"; the count also says 0 while loading. | Source |
| I-2 | Row actions are centred link buttons with a "·" separator (standard §7.2: right-aligned, no separators). | Source |
| I-3 | Labels carry "*" in the text ("Title *"), but the fields are only required to Publish; Publish is disabled with no reason. | Source |
| I-4 | "Release note created." shows for both Save draft and Publish. | Source |
| I-5 | "Discard changes" is a plain primary, not danger (§7.3). | Source |
| I-6 | Bulk result: Close and "View Release Notes" both just close the modal; "Publish all" is a dashed button. | Source |
| I-7 | Title-case buttons and titles ("Bulk Upload", "New Release Note", "Upload and Import", "Quick Bulk Upload"). | Source |
| I-8 | Modal widths 760 / 520 / 480 differ from §8.3 (538 / 681). | Source |
| I-9 | Top bar "Hi Admin, Welcome to ." (known, all modules). | Ledger |

## Questions (with the default I would pick)

1. **Where the existing nodes go.** **Default A:** create sections `01 · List` … `07 · Success` on `2218:7642`; move E-01, E-02, E-03 and the flow sections F-1, F-2 into them with same-script fingerprints; move the then-empty `2218:10669` to `🗄 Archive`. B: leave `2218:10669` untouched at the top and start the new sections 290 below it (no protected node moves).
2. **Current-shell list L-01.** **Default: yes** (shows Published Date, base for all copies). No: copies start from the Feature Access Limit shell and only state frames show the column.
3. **Edit inside the manual flow.** **Default: yes**, Edit Note stays in F-1 under `02 · Create`, no `03 · Edit` section.
4. **How many frames.** **Default: lean 13.** Optional: EM-01, ER-02, S-04 (and C-03's "file too large" twin).
5. **Top bar text.** **Default: keep the Feature Access Limit copy** ("Hi Admin, Welcome to .").
6. **Published Date field in the form.** **Default: follow the product** (no field; the date is set on Publish). Alternative: copy the field from F-1.
7. **Editor toolbar.** **Default: show it** (Hydra small text `Button`s with Bold, Italic, Underline, bulleted and numbered list icons, "H1", "H2" over `Input__TextArea`). Alternative: plain `Input__TextArea` as F-1.
8. **Delete failure.** **Default: error `Message` above the overlay, confirmation stays open** (agent rule). Alternative: error `Alert` inside the dialog (product and §7.3).
9. **Sentence case on buttons and titles (UX-12).** **Default: yes.** Alternative: live copy.
10. **Modal widths.** **Default: note form 681, bulk upload 538, confirmations 538.** Alternative: live 760 / 480 / 520.
11. **Ready for Dev.** **Default: none of the `2218:*` nodes is Ready for Dev** (unreadable; no name says so). If any is, I move its whole section or stop.

## Ledger

Not edited in this run (another agent is finishing a Dashboard fix). Entry to add as `modules["Release Notes"]`, status `planned`, is returned in the reply. No Figma node was created, moved or edited.

## Decisions (Build approved, 30 Oct)

- Scope: the 5 Move units (9 screens) plus the 13 New screens. No optional screens (EM-01, ER-02, S-04 not drawn).
- UX: all improvements kept except UX-13 (optional empty state).
- Q1: sections created, everything moved in, empty `2218:10669` moved to `🗄 Archive` (not deleted).
- Q11: no node is Ready for Dev, but all stay protected: move only, fingerprints of node and every descendant before and after in the same script, each flow section moved as one unit.
- Q6: no Published Date field in the form. Other questions: defaults (L-01 built, Edit stays in F-1, top bar copy kept, editor toolbar shown, delete failure = error Message with the confirmation open, sentence-case buttons, widths 681 / 538 / 538).

## Build outcome

| Key | Node | Section | Built from | Check |
|---|---|---|---|---|
| E-01 (moved) | `2218:10670` | 01 · List | — | fingerprint identical, 333 nodes |
| L-01 | `3104:1592` | 01 · List | shell `3083:3582` + table card `3001:86` | screenshot OK |
| F-1 (moved) | `2218:12859` | 02 · Create | — | identical within 0.05 px, 843 nodes |
| C-01 | `3105:3583` | 02 · Create | L-01 + emptied overlay + fresh DS `Modal` 681 + form `3093:706` | screenshot OK |
| C-02 | `3106:4410` | 02 · Create | C-01 + `Alert` `3022:6331` | gates OK |
| F-2 (moved) | `2218:14091` | 02 · Create | — | fingerprint identical, 280 nodes |
| C-03 | `3107:3383` | 02 · Create | L-01 + overlay `2881:5745` (resized to frame) | screenshot OK |
| C-04 | `3107:4157` | 02 · Create | C-03 | gates OK |
| E-03 (moved) | `2218:11282` | 03 · Dialogs | — | fingerprint identical, 351 nodes |
| DI-01 | `3107:4822` | 03 · Dialogs | L-01 + confirmation `3097:1570` + `Message` `3097:5196` | screenshot OK |
| DI-02 | `3107:5415` | 03 · Dialogs | C-01 + confirmation `3097:1570` | screenshot OK |
| DI-03 | `3107:6461` | 03 · Dialogs | C-03 + `Result` + `Stat Tile` x2 + confirmation | screenshot OK |
| E-02 (moved) | `2218:11455` | 04 · Empty | — | fingerprint identical, 175 nodes |
| LO-01 | `3107:7182` | 05 · Loading | L-01 + `Skeleton basic` x3 | gates OK |
| ER-01 | `3107:7456` | 06 · Error | L-01 + Companies Error state | gates OK |
| S-01 | `3107:7728` | 07 · Success | L-01 + `Message success` | screenshot OK |
| S-02 | `3107:8333` | 07 · Success | L-01 + `Message success` | screenshot OK |
| S-03 | `3107:8913` | 07 · Success | L-01 + `Message success` | screenshot OK |

Sections: `3104:1585` to `3104:1591`, stacked at x 0, 290 apart. `2218:10669` is in Archive at (0, 8929).

Final gates (13 new frames): 1750 wide, hug, minimum 970; 10 sidebar items with only Release Notes selected (label and icon on one colour variable); no colons; no unbound solid fill or stroke outside instances; no text without a style; overlays at (0,0), full frame, STRETCH/STRETCH; toasts centred at y 16; Cover page child count unchanged.

Build gaps and notes:
- Wide note form: emptied `Modal__Overlay` + separate DS `Modal` at 681 (the overlay modal is locked at 538). The Dashboard wide Modal copy had no Footer, so a fresh instance of the same DS Modal was used.
- Editor: no rich-text component; toolbar = small text `Button`s (5 icons + H1/H2) over `Input__TextArea`.
- `Select` has no value property: nested text overridden; the value colour is copied from the Input value text (variable-bound).
- Action cells: instance children cannot be deleted, so the unused "Action 2" is hidden.
- Dialog screens: the page primary sits under the scrim; the active dialog has one primary.
- Product shows "Choose file" as primary; kept default so "Upload and import" is the only primary.
- Fingerprint tolerance: relative positions compared within 0.05 px (0.01 px float noise on nested vectors after the move); every other field compared exactly.

## Fix pass (review)

Run on 31 Oct (third attempt; idempotent: each step checked first and skipped when already done). Only the 13 new frames were edited; the 5 moved protected units were not touched. Cover page child count stayed 1.

| Key | Page header (clone of L-01 `3110:7994`) | Card actions removed | Sentence case | Helper colour |
|---|---|---|---|---|
| L-01 `3104:1592` | already there | none | already done | none |
| C-01 `3105:3583` | `3113:7820` | `3105:3595` | Published date, Summary for modal, Full release note content | 3 captions |
| C-02 `3106:4410` | `3114:7820` | `3106:4422` | same 3 | 2 captions |
| C-03 `3107:3383` | `3114:7849` | `3107:3395` | Published date | modal subtitle |
| C-04 `3107:4157` | `3114:7869` | `3107:4169` | Published date | modal subtitle |
| DI-01 `3107:4822` | `3114:7889` | `3107:4834` | Published date | none |
| DI-02 `3107:5415` | `3114:7909` | `3107:5427` | same 3 | 3 captions |
| DI-03 `3107:6461` | `3114:7931` | `3107:6473` | Published date | modal subtitle |
| LO-01 `3107:7182` | `3114:7951` | `3107:7194` | none | none |
| ER-01 `3107:7456` | `3114:7966` | `3107:7468` | none | none |
| S-01 `3107:7728` | `3114:7981` | `3107:7740` | Published date | none |
| S-02 `3107:8333` | `3114:8001` | `3107:8345` | Published date | none |
| S-03 `3107:8913` | `3114:8021` | `3107:8925` | Published date | none |

- Page header: the clone was inserted as the first child of each frame's `Main` (fill width). The card header "Card extra" (Bulk upload + New release note) was deleted, so the card header keeps only its title, as on L-01. Overlays, modals and toasts were left in place.
- Helper colour: `Input__Caption` status=default renders colorText, so the caption text fill was bound to `colorTextDescription` (same variable as the L-01 page description). The bulk upload "Valid notes are imported automatically…" subtitle got the same binding. Alert and Result descriptions were not changed (DS defaults).
- Sentence case: label and column texts changed through their component text properties. Release note titles in the table ("Project Tags" etc.) are sample data and stay as they are.
- Gates: all 13 frames 1750 wide, hug, min 970, height 970; one Page header per frame; no Card extra left; overlays at (0,0), 1750 × 970, STRETCH/STRETCH. Primary buttons: 1 on non-dialog frames; on dialog frames the header primary sits under the scrim, plus the dialog's own primary (DI-02 and DI-03 stack two dialogs, so 3 in total).
- Screenshots after the fix: L-01, C-01, DI-02 OK.
- Open: LO-01 and ER-01 card title still says "Release notes" (count unknown while loading or on error), which repeats the page title. DI-03 Result description "Total: 6 | Imported: 5 | Skipped: 1" still uses colons.
