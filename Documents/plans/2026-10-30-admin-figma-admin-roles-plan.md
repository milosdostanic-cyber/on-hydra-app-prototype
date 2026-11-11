# Admin module plan — Admin Roles

Status: **built on 2026-10-30** (planned the same day; see "Build outcome" at the end).

Live walk: **not done** (the user chose to build from product source; Screen Recording is off for Cursor Computer Use). Every screen is marked **Source** below and listed under "Not seen live".

Product source read with `gh api` (`ooden-tech/on-hydra-app`, HEAD on 30 Oct): admin `router.tsx`, `router/constants/index.ts`, `navigation.tsx`, admin and core `en/translation.json`; core `roles/pages/admin/AdminRolesList`, `roles/pages/admin/CreateAdminRole`, `roles/pages/admin/SingleAdminRole`, `company/components/PermissionsSelect` (the Transfer, `forCompanyOnly=false`); backend `role/constants/admin-roles.ts`, `role/constants/permissions.ts`, `dto/rest/admin/create-admin-role.request.dto.ts`, `list-admin-roles.request.dto.ts`.

Read before planning: the agent file (30 Oct version), the ledger, the Company Roles plan and its Build outcome, the Users plan and the Users audit (fix pass and decisions), `Documentation/hydra-ux-patterns.md` §7 (row actions) and §8 (form modals, §8.4 overlay), `module-layout.md`. Figma read this run: the Admin Roles page `2958:63289` (metadata), and screenshots of Company Roles L-01 `3067:4236`, CR-01 `3070:984`, DT-01 `3070:3688` and Users ED-04 `3045:2508`.

## Target

- **File:** Admin - RSFC (`rONB8aMPanOjS3GC1uN16d`)
- **Page:** `Admin Roles` (`2958:63289`): https://www.figma.com/design/rONB8aMPanOjS3GC1uN16d/Admin---RSFC?node-id=2958-63289
- **Existing node (protected, left in place):** section `Admin Roles · To design` (`2958:63302`), x 0, y 0, 1750 x 547, with one text note (`2958:63303`). It is the only content on the page. Not moved, not edited (colour only if the arrangement rule asks, as on other pages).
- **Canvas look:** page background `#787A7E` at BUILD if not already set; every new Section white at 10%.
- **New sections** (plain Sections at x 0, 290 apart; the first sits 290 below the placeholder, at y 837). Same nine kinds and order as Company Roles:

| Section | Rows | Screens per row | Width | Holds |
|---|---|---|---|---|
| `01 · List` | 1 | 1 | 1846 | L-01 |
| `02 · Detail` | 1 | 1 | 1846 | DT-01 |
| `03 · Create` | 1 | 2 | 3692 | CR-01, CR-02 |
| `04 · Edit` | 1 | 2 | 3692 | ED-01, ED-02 |
| `05 · Dialogs` | 1 | 2 | 3692 | D-01, D-02 |
| `06 · Empty` | 1 | 1 | 1846 | E-01 |
| `07 · Loading` | 1 | 2 | 3692 | LO-01, LO-02 |
| `08 · Error` | 1 | 3 | 5538 | ER-01, ER-02, ER-03 |
| `09 · Success` | 1 | 3 | 5538 | S-01, S-02, S-03 |

  Inside a section: 48 left and right, 80 top, 140 bottom, screens 96 apart, at most 3 per row. Section height = 80 + tallest screen + 140, computed at BUILD from the hugged screen heights.
- **Frame size:** 1750 fixed width, hug height, minimum 970. **Frame names:** `NN.MM · Admin Roles · <Screen> · <State>`.
- **Copy sources (copy and adapt; originals never edited).** Every frame is cloned from its **Company Roles counterpart**, so both role modules stay identical in shell, card, table, matrix, dialog and state layout:

| New | Cloned from (Company Roles) | Main change on the copy |
|---|---|---|
| L-01 | `3067:4236` | Remove the Company label + select; new rows; sidebar item |
| DT-01 | `3070:3688` | Remove the "Company: …" line; matrix rows and badges from Users ED-04 `3045:2508` |
| CR-01 / CR-02 | `3070:984` / `3070:2059` | Remove the "Company: …" line; admin matrix rows, every action cell is a Checkbox |
| ED-01 / ED-02 | `3070:2493` / `3070:2988` | As CR-01, prefilled with the custom role |
| D-01 / D-02 | `3070:4644` / `3070:5102` | Background list = L-01 copy; dialog copy |
| E-01 | `3070:6364` | Remove the Company select |
| LO-01 / LO-02 | `3070:6655` / `3070:6904` | Remove the Company select / "Company: …" line |
| ER-01 / ER-02 / ER-03 | `3070:7174` / `3070:7428` / `3070:7887` | As above |
| S-01 / S-02 / S-03 | `3070:8337` / `3070:8858` / `3070:9305` | As above |

  **BUILD pre-check:** the two Company Roles fixes running now (Input__Label with no trailing colon; Users sidebar group collapsed on non-Users modules) must be on these source frames before cloning. If a source still shows a colon or an open Users group, stop and ask instead of fixing it on the copy.
- **Ready for Dev:** not read (per your instruction). Every existing node is treated as protected. Copies are checked for a Ready for Dev status at BUILD and reported if one carries it.

## Screens

Live status: **Source** = read from product source. Every screen is **New** (copy and adapt). Nothing to Move, Keep or Rebuild.

| # | Screen | Route | Section | State | Action | Live status |
|---|---|---|---|---|---|---|
| L-01 | Admin roles list | `/admin-roles` | 01 List | 5 roles (2 system, 3 custom), page 1 | New (copy of `3067:4236`) | Source |
| DT-01 | View system role | `/admin-roles/global-administrator` | 02 Detail | "Global Administrator", read-only: info Alert, description as text, permissions as Allowed / Not allowed | New (copy of `3070:3688`) | Source (live shows the edit form with every field disabled and no Save) |
| CR-01 | Create admin role | `/create-admin-role` | 03 Create | Empty form, no permission ticked | New (copy of `3070:984`) | Source |
| CR-02 | Create admin role · Missing fields | `/create-admin-role` | 03 Create | "Role name is required" under Name, "Permissions are required" under the matrix | New (copy of `3070:2059`) | Source |
| ED-01 | Edit admin role | `/admin-roles/:roleName` | 04 Edit | Custom role "Content Manager", prefilled, some permissions ticked (one module partly ticked), Save changes disabled with the hint "Change a field or a permission to save." | New (copy of `3070:2493`) | Source |
| ED-02 | Edit admin role · Name required | `/admin-roles/:roleName` | 04 Edit | Name cleared, "Role name is required" | New (copy of `3070:2988`) | Source |
| D-01 | Delete admin role · Confirm | `/admin-roles` | 05 Dialogs | "Delete role?" over L-01 | New (copy of `3070:4644`) | Source (live uses a generic `Modal.confirm`) |
| D-02 | Delete admin role · Delete failed | `/admin-roles` | 05 Dialogs | Confirmation stays open, error Message centred at y 16 | New (copy of `3070:5102`) | Source (string `failed-role-delete` exists, unused) |
| E-01 | No matching roles | `/admin-roles?s_query=…` | 06 Empty | Search "zzzz", 0 results, "Clear filters" | New (copy of `3070:6364`) | Source |
| LO-01 | Admin roles list · Loading | `/admin-roles` | 07 Loading | Spin centred in the card, card title "Admin roles" | New (copy of `3070:6655`) | Source (`Table loading`) |
| LO-02 | Edit admin role · Loading | `/admin-roles/:roleName` | 07 Loading | Spin centred in the card, breadcrumb "Loading…" | New (copy of `3070:6904`) | Source |
| ER-01 | Admin roles list · Failed to load | `/admin-roles` | 08 Error | Error Alert + Retry in the card | New (copy of `3070:7174`) | Source (failed list load is silent) |
| ER-02 | Create admin role · Create failed | `/create-admin-role` | 08 Error | Filled form kept, error Message "Failed to create role. Try again." | New (copy of `3070:7428`) | Source (string exists, unused) |
| ER-03 | Edit admin role · Save failed | `/admin-roles/:roleName` | 08 Error | Changed form kept, error Message "Failed to update role. Try again." | New (copy of `3070:7887`) | Source (string exists, unused) |
| S-01 | Admin role created | `/admin-roles` | 09 Success | Back on the list, new row, Message "Role created successfully" | New (copy of `3070:8337`) | Source (navigates to the list) |
| S-02 | Admin role updated | `/admin-roles/:roleName` | 09 Success | Message "Role updated successfully", hint "All changes are saved." | New (copy of `3070:8858`) | Source |
| S-03 | Admin role deleted | `/admin-roles` | 09 Success | Row gone, Message "Role deleted successfully" | New (copy of `3070:9305`) | Source |

**Count (lean set, my default): 17 New, 0 Move, 0 Keep, 0 Rebuild, 0 Blocked.**

Optional extras, off by default (Question 8), same as Company Roles: L-02 Type filter open (Yes / No), L-03 disabled Delete with the tooltip "System roles can't be deleted.", CR-03 permission description tooltip. With all three the module is 20 frames.

Skipped on purpose: the info toast "No role to update" (UX-7 makes it unreachable), bulk delete (`bulk-menu.delete` exists, no row selection), and a second Detail frame for RSFC Employee (same layout as DT-01).

### Not in the product (so not drawn)

- **"No roles yet" empty state.** The two system admin roles (Global Administrator, RSFC Employee) always exist, so the list is never empty. Only no-results is drawn.
- **Assigning admin roles to people.** That happens on Users ED-04 (Admin permissions tab) and Invite admins. The Users column only links to the Users list filtered by the role (`/users-list/?f_roles=["<role>"]`).

## Hydra components per screen

Searched live in Hydra Ant Design - DS only (`includeLibraryKeys` = `lk-0d30b3c5…19ed`) on 30 Oct: `Modal__Confirmation` (`ff12f0bc…`), `Checkbox` (set `044b4c3a…`), `Empty State Block` (`ca63fa15…`), `Spin` (set `36bf6103…`) found; "Transfer" returns only `SwapOutlined`. Everything else is inherited from the Company Roles copies (built and gated 30 Oct). Re-discover keys at BUILD.

| Need | Hydra component (variants / properties) | Used on |
|---|---|---|
| Shell | `Sidebar`, `Topbar`, `Breadcrumb` (`items=3`: HomeOutlined / Admin Roles / page), from the copy | all |
| Sidebar | Admin Roles as a single selected item (no `.menu__submenu_list items=1`, same fallback as Company Roles); Users group collapsed; Company Roles not selected. Icon recipe on every item, selected on/off proof once | all |
| Page title + description, primary CTA | Inherited page-title text + `Base/Normal` description; `Button type=primary size=large` "Create role" (no icon) | list screens |
| Card | Inherited bound `Table card` / `Settings card` frames (no Card component, known gap) | all |
| Search | `Input__Search` "Search by role name", now the only control in the card header (right) | list screens |
| Table header | `Table / Table Item / Header Item` (sort on Name and Type, filter on Type) | list screens |
| Table cells | `Table / Table cell` `type=text` (Name, Description, Permissions count), `type=tag` (Type), `type=action` (Users link; row actions) | list screens |
| Type tag | `Tag type=default` "System" / "Custom" | list screens |
| Row actions | `Table cell type=action`: custom "Edit" + "Delete" (`colorErrorText`); system "View" + Delete disabled (`colorTextDisabled`) | list screens |
| Form | `Input__Label` (`orientation=vertical, size=medium`, no trailing colon, `required` on Name and Permissions), `Input`, `Input__TextArea`, `Input__Caption status=error`, `Button default` "Cancel" + `Button primary` "Create role" / "Save changes" | CR-*, ED-*, ER-02, ER-03, S-02 |
| Permission matrix | Table from the copy: header Permission · All · Create · Read · Update · Delete; `Table cell type=text` module name; bound wrapper cells with Hydra `Checkbox` (`show title` off; `checked=true / false / indeterminate`). Every admin row has all four actions, so no "—" cells | CR-*, ED-*, ER-02, ER-03, S-02 |
| Read-only matrix | `Table cell type=badge` "Allowed" / "Not allowed" (as Users ED-04 and Company Roles DT-01) | DT-01 |
| Read-only notice | `Alert type=info` + `show description` | DT-01 |
| Pagination | `Pagination type=changer` "10 / page" | list screens |
| Empty | `Empty State Block` (`show action` off, `show secondary action` on "Clear filters") | E-01 |
| Loading | `Spin size=large`, description off | LO-01, LO-02 |
| Error | `Alert type=error` + `show description` + `Button default` "Retry", centred | ER-01 |
| Toasts | `Message type=success / error`, centred at y 16 | ER-02, ER-03, S-01–S-03, D-02 |
| Confirmation | `Modal__Overlay` + `Modal__Confirmation` via `🎰 modal`; Cancel default + "Delete" primary `danger=true`; overlay x 0, y 0, full frame, STRETCH / STRETCH | D-01, D-02 |

Text styles and variables: the set already on the Company Roles copies (page-title style, `Title/Heading 5`, `Base/Normal`, `Base/Medium`; `Size/Padding/*`; `colorText`, `colorTextDescription`, `colorTextDisabled`, `colorErrorText`, `colorBorderSecondary`). Nothing is created.

Copy (from source; custom roles and counts are fictional sample data, see Question 3):
- List: title "Admin roles", description "Roles decide what admins can see and do in Hydra Admin.", card title "5 roles". Columns Name, Description, Type, Users, Permissions, Actions. Rows:
  - Global Administrator · "Global administrator has access to all modules and actions" · System · "3 users" · "92 permissions" (source description; count from `ADMIN_ROLE_PERMISSIONS_TABLE_MAP`)
  - RSFC Employee · "RSFC Employee has platform admin access for CRM-BOM and company operations on the ASC-ES tenant" · System · "12 users" · "28 permissions"
  - Content Manager · "Manages content, files and release notes." · Custom · "4 users" · "16 permissions"
  - Support Agent · "Helps companies and users with access problems." · Custom · "2 users" · "10 permissions"
  - Analytics Viewer · "Read-only access to admin analytics." · Custom · "0 users" · "1 permission"
- Create / Edit: title "Create role" / role name; no company line; fields Name ("e.g. Content Manager"), Description (optional, "What this role is for"), Permissions. Buttons Cancel · Create role / Cancel · Save changes.
- Permission rows shown (6 of about 30 modules, the same rows as Users ED-04, all four actions each): Access Blacklist, Admin Invites, Admin Roles, Companies, Knowledge Center, Users.
- DT-01 values (Global Administrator, as Users ED-04 and the source): every row Allowed for all four actions, except Admin Invites: Create Allowed, Read / Update / Delete Not allowed. Alert "System role" / "System roles can't be changed or deleted. To give different permissions, create a custom role."
- Errors: "Role name is required", "Permissions are required" (no full stop).
- Delete: "Delete role?" / "“Content Manager” will be deleted. The 4 admins who have it will lose its permissions. This can't be undone." Cancel · Delete.
- Messages: "Role created successfully", "Role updated successfully", "Role deleted successfully", "Failed to create role. Try again.", "Failed to update role. Try again.", "Failed to delete role. Try again."

## UX improvements

Run with `hydra-ux-audit` (effortless x PRD x functional, 5-second test, one primary action, plain copy, every state covered, progressive disclosure). The live Admin Roles pages are the same code pattern as Company Roles, so the findings are the same, minus the company scope:
- 5-second test, list: fails on icon-only round row actions with no column header, "System Role: Yes / No", "(92)" for permissions and a round button with a bare number for users.
- Create and edit: two-panel Transfer of about 30 modules × 4 actions; labels repeat the module; no Cancel; title case ("Create Admin Role", "Update Admin Role").
- System roles open a fully disabled form with no reason; saving without changes shows "No role to update"; delete asks "Are you sure you want to delete the role?" with OK / Cancel; failures are silent.

Same improvements as Company Roles (numbering kept so the two plans line up; UX-2 does not apply):

| # | Improvement | Hydra component that carries it | Screens |
|---|---|---|---|
| UX-1 | Page header: title "Admin roles" + one-line description, one primary "Create role" (`size=large`, no icon) on the right; card title shows the count ("5 roles") | Page title text, `Button primary large`, card header text | list screens |
| UX-2 | *Not used.* Admin roles have no company scope | — | — |
| UX-3 | Labelled text row actions in a right-aligned "Actions" column: custom "Edit" · "Delete"; system "View" · Delete disabled | `Table cell type=action` | list screens |
| UX-4 | Plain values: Type `Tag` "System" / "Custom"; Users link "3 users" (opens the filtered Users list, as live); "92 permissions" | `Table cell type=tag` + `Tag`, `type=action`, `type=text` | list screens |
| UX-5 | Permission matrix instead of Transfer (rows = modules, All · Create · Read · Update · Delete, "All" indeterminate when partly ticked); same grid as Users ED-04 and Company Roles | Cloned table + `Checkbox` in bound wrapper cells | CR-*, ED-*, ER-02, ER-03, S-02 |
| UX-6 | System role opens a read-only view with an info Alert and Allowed / Not allowed badges, no Save | `Alert info`, `Table cell type=badge` | DT-01 |
| UX-7 | Form per §8.3: required `*` on Name and Permissions, "(optional)" on Description, placeholder examples, Cancel left of the primary; Save changes disabled until something changes, with the hint text Company Roles added | `Input__Label required`, `Input`, `Input__TextArea`, `Button default` + `Button primary` | CR-*, ED-* |
| UX-8 | Delete per §7.3: names the role and the number of admins affected; Cancel + danger "Delete"; failure keeps the dialog open with an error Message | `Modal__Overlay` + `Modal__Confirmation`, `Message error` | D-01, D-02 |
| UX-9 | Every failure gets a state: list load → error Alert + Retry; create, update, delete → error Message with a next step | `Alert error` + `Button default`, `Message error` | ER-01–ER-03, D-02 |
| UX-10 | No-results: "No roles found" / "Try another role name, or clear the search." + "Clear filters" | `Empty State Block` | E-01 |
| UX-11 | Sentence case for labels and buttons ("Admin roles", "Create role", "Save changes") | Text overrides | all |

## Differences from Company Roles (and why)

1. **No company scope.** Admin roles are global (`listAdminRoles` takes no company; routes have no `:companyId`). So no Company select in the list card, no "Company: …" line under the Create / Edit / Detail titles, and **no L-02 "Company select open"** frame. Total 17 frames instead of 18.
2. **Permission rows.** Admin roles use `forCompanyOnly=false` (all modules, including admin-only ones such as Access Blacklist, Admin Invites, Admin Roles). Rows are the same six as Users ED-04 (seen live), not the company six. Every row has all four actions, so the matrix has no "—" cells.
3. **System roles.** Global Administrator and RSFC Employee (from `AdminRoleDisplayNames`), not Company Owner / Member. DT-01 shows Global Administrator with the same values as Users ED-04, so the two screens agree.
4. **Breadcrumb.** "Admin Roles / List", "Admin Roles / Create role", "Admin Roles / <role name>" (nav labels, as Company Roles uses "Company Roles / …").
5. **Delete copy** says "admins" instead of "people".

Everything else is identical: columns, row action wording and colours, matrix, Detail Alert, form layout and hint, confirmation, states, Messages and section layout.

## Not seen live

All 17 screens (no live walk, by the user's choice). In particular: the real custom admin roles and user counts in dev, the live breadcrumb on Create and Edit (both routes are scoped `roles`, not `admin-roles`, in `router.tsx`, see I-9), whether deleting an admin role that people still have is blocked (not found in source), and the real per-module action set in the permission table (I used the Users ED-04 live rows). Designed from source strings and Hydra Spin, Alert, Message, Modal__Confirmation and Empty State Block.

## Blocked (missing component, variant or variable)

**Nothing blocks the module** (the Checkbox matrix was approved for Company Roles). Known gaps, unchanged, nothing will be created:

1. No Transfer and no Tree in Hydra (re-checked 30 Oct). Replaced by the matrix (UX-5).
2. No checkbox Table cell. Bound wrapper cell with Hydra `Checkbox`, as on Company Roles.
3. `.menu__submenu_list` has no `items=1`, so Admin Roles is a single selected item (live: group with one child "List").
4. Sidebar has no Feature Access Limit item.
5. `Table cell type=action` renders text links only; no Card, page header or Form item component; Pagination has no page buttons (U-A-01).
6. Raw geometry kept as in Company Roles: table column widths, frame and section canvas positions, Message and dropdown absolute positions.

## Protected, left as is

- `Admin Roles · To design` (`2958:63302`) and its note (`2958:63303`): not moved, not edited.
- Every Company Roles and Users frame listed as a copy source is only cloned.

## Live app issues

| # | Issue | How seen |
|---|---|---|
| I-1 | Top bar reads "Hi Admin, Welcome to ." (known). Kept as the copied frame shows. | Ledger |
| I-2 | Row actions are icon-only round buttons (eye or pencil, trash) with tooltips inside the buttons; the Actions column has no header. | Source |
| I-3 | "System Role" shows Yes / No; Permissions shows "(92)"; Users is a round button with a bare number. | Source |
| I-4 | Permissions use a Transfer with two scrolling trees over about 30 modules; labels repeat the module. | Source |
| I-5 | System roles open the edit form fully disabled with no reason and no Save; the title says "Update Admin Role". | Source |
| I-6 | Saving with no change shows "No role to update"; removing every permission is ignored without a message (`permissionIds?.length` check). | Source |
| I-7 | Delete confirmation is generic, uses OK / Cancel, and OK is not a danger button. | Source |
| I-8 | `failed-role-create`, `failed-role-update`, `failed-role-delete` exist but are never shown; a failed list load is silent. | Source |
| I-9 | Create and Edit routes are scoped `roles` (Company Roles' scope) in `router.tsx`, so their breadcrumb may show the wrong parent; while loading the breadcrumb uses `t('loading')` but `single-admin-role.loading` does not exist. | Source |
| I-10 | Title case everywhere ("Admin Roles", "Create New Role", "Create Admin Role", "Save Changes"); the list title is "Admin Roles" while its card is the only header. | Source |
| I-11 | Create and Edit have no Cancel or back action. | Source |
| I-12 | RSFC Employee's description is technical ("platform admin access for CRM-BOM and company operations on the ASC-ES tenant") and still says ASC-ES. Shown as product data; a plain rewrite is for the product team. | Source |
| I-13 | Users ED-04 (live) labels the module "Companies" while `PermissionModuleDisplayNames` says "Company". Figma follows ED-04. | Live (Users run) vs source |

## Questions (with the default I would pick)

1. **Clone from Company Roles, not Users / Companies.** **Default: clone every frame from its Company Roles counterpart** (listed above), after checking the two running fixes are on the sources. Alternative: rebuild from the Users and Companies sources as Company Roles did (slower, more drift).
2. **Removing the Company select and "Company: …" line on the copies.** These nodes belong to copies made in the same run. **Default: remove them from the copies** (scratch-level change to new nodes; hidden nodes would fail the "no hidden nodes" gate). Alternative: hide them (fails the gate) or ask the designer.
3. **Sample data.** **Default: real system roles with their source descriptions and permission counts (92, 28), fictional custom roles (Content Manager, Support Agent, Analytics Viewer) and user counts.** Alternative: wait for a live walk and copy dev data.
4. **Matrix rows.** **Default: the six Users ED-04 rows (Access Blacklist, Admin Invites, Admin Roles, Companies, Knowledge Center, Users), all four actions each**, frame hugs its height. Alternative: all ~30 modules (a frame about 2000 high), or a different six.
5. **"Companies" vs "Company" label (I-13).** **Default: "Companies", as Users ED-04 (seen live).** Alternative: "Company" from source.
6. **RSFC Employee description (I-12).** **Default: show the source text as is** (it is data). Alternative: a plain sample such as "Admin access for CRM-BOM and company operations."
7. **Delete copy.** It says admins "will lose its permissions"; no block on deleting a role in use was found. **Default: keep the sentence, as Company Roles.** Alternative: "This can't be undone." only.
8. **How many frames?** **Default: lean set of 17.** Add L-02, L-03 and CR-03 for 20.

## Ledger entry to add (not written this run)

```json
"Admin Roles": {
  "status": "planned",
  "plannedAt": "2026-10-30",
  "plan": "Documents/plans/2026-10-30-admin-figma-admin-roles-plan.md",
  "routes": ["/admin-roles", "/create-admin-role", "/admin-roles/:roleName"],
  "page": { "id": "2958:63289", "name": "Admin Roles" },
  "existingNodes": [{ "id": "2958:63302", "type": "SECTION", "name": "Admin Roles · To design", "protected": "treated as protected", "action": "Left in place" }],
  "liveWalk": "Skipped by user choice; plan built from product source.",
  "plannedScreens": ["L-01","DT-01","CR-01","CR-02","ED-01","ED-02","D-01","D-02","E-01","LO-01","LO-02","ER-01","ER-02","ER-03","S-01","S-02","S-03"],
  "optionalScreens": ["L-02","L-03","CR-03"],
  "copySourceModule": "Company Roles (2958:63288), one-to-one counterpart per screen",
  "dsGaps": ["No Transfer or Tree; Checkbox matrix", "No checkbox Table cell", ".menu__submenu_list has no items=1", "Sidebar has no Feature Access Limit item"]
}
```

## Build outcome (2026-10-30)

Approved: lean set of 17, UX-1 and UX-3 to UX-11 (UX-2 not used), every question on its default (Q6 confirmed: RSFC Employee's source description shown as is, listed as I-12). Both Company Roles fixes were verified on the source frames before cloning (Input__Label without colon; Users group collapsed with `2798:23926`).

| Screen | Frame | Node | Section | Copied from |
|---|---|---|---|---|
| L-01 | 01.01 Admin roles list · Default | `3076:1241` | 01 · List `3076:1232` | `3067:4236` |
| DT-01 | 02.01 View system role · Global Administrator | `3078:6633` | 02 · Detail `3076:1233` | `3070:3688` |
| CR-01 | 03.01 Create role · Default | `3078:2616` | 03 · Create `3076:1234` | `3070:984` |
| CR-02 | 03.02 Create role · Missing fields | `3078:3150` | 03 · Create | `3070:2059` |
| ED-01 | 04.01 Edit role · Default | `3078:3661` | 04 · Edit `3076:1235` | `3070:2493` |
| ED-02 | 04.02 Edit role · Name required | `3078:4224` | 04 · Edit | `3070:2988` |
| D-01 | 05.01 Delete role · Confirm | `3077:577` | 05 · Dialogs `3076:1236` | `3070:4644` |
| D-02 | 05.02 Delete role · Delete failed | `3077:1260` | 05 · Dialogs | `3070:5102` |
| E-01 | 06.01 Admin roles list · No matching roles | `3077:1904` | 06 · Empty `3076:1237` | `3070:6364` |
| LO-01 | 07.01 Admin roles list · Loading | `3077:2166` | 07 · Loading `3076:1238` | `3070:6655` |
| LO-02 | 07.02 Edit role · Loading | `3078:4782` | 07 · Loading | `3070:6904` |
| ER-01 | 08.01 Admin roles list · Failed to load | `3077:2383` | 08 · Error `3076:1239` | `3070:7174` |
| ER-02 | 08.02 Create role · Create failed | `3078:4972` | 08 · Error | `3070:7428` |
| ER-03 | 08.03 Edit role · Save failed | `3078:5504` | 08 · Error | `3070:7887` |
| S-01 | 09.01 Role created | `3077:2606` | 09 · Success `3076:1240` | `3070:8337` |
| S-02 | 09.02 Role updated | `3078:6068` | 09 · Success | `3070:8858` |
| S-03 | 09.03 Role deleted | `3077:3289` | 09 · Success | `3070:9305` |

All 17 Built. Nothing skipped or blocked. The placeholder `2958:63302` was not moved, edited or deleted.

Deviations from the plan:
- Sidebar icon recipe: `resetOverrides()` and the swap-away step both rebind the icons to `colorIcon` (each attempt failed the check and was rolled back). The copied Company Roles icons already follow the `.menu__item` variant, so Admin Roles is selected through the `selected` variant only, the icon layers are renamed `🎰 icon`, and the icon/label variable check plus the selected on/off proof pass. No icon fill was set by hand.
- DT-01: the three "—" cells were switched to `Table cell type=badge`; the badge text is a `Badge__Status` text override (as on the existing badge cells), with `status=success` for Allowed and `status=default` for Not allowed. Values match Users ED-04.
- The RSFC Employee description is cut off with an ellipsis in the list's Description column (Table cell truncation, rows stay 54 high).

Gates (all 17 frames pass, 0 findings):
- Every instance is a remote Hydra component; none detached; no local components.
- No hidden own nodes; every own fill, stroke, padding, gap and radius is bound; every text has a Hydra text style.
- Only Admin Roles selected in the sidebar; every submenu closed; Users chevron `2798:23926`; breadcrumb starts with HomeOutlined.
- No label ends with a colon; no stale Company Roles copy; at most one primary button outside the overlay (LO-02 and DT-01 have none).
- D-01 and D-02 overlay at x 0, y 0, 1750 × 970, STRETCH / STRETCH; Messages centred at y 16.
- Frames 1750 fixed width, hug height, minimum 970. Sections arranged 290 apart from y 837 (80 top, 140 bottom, 96 between screens); screen fingerprints unchanged by the arrangement.

Ledger: `modules["Admin Roles"].status = "built"`, `builtAt` 2026-10-30, sections and frame IDs recorded.
