# Admin module plan — Company Roles

Status: **planned on 2026-10-30** (PLAN mode, read-only). Nothing was written to Figma. Waiting for "Build approved: Company Roles".

Live walk: **not done.** Cursor Computer Use found the user's Chrome, but every screenshot and accessibility read was refused ("Computer Use requires Screen Recording"). This plan is built from the product source and the existing Figma file only. Every screen is marked **Source** below. Turn on Screen Recording for Cursor Computer Use (System Settings > Privacy & Security) if you want a live check before BUILD.

Product source read with `gh api` (`ooden-tech/on-hydra-app`, HEAD on 30 Oct): admin `router.tsx`, `router/constants/index.ts`, `navigation.tsx`, both `en/translation.json` files; core `roles/pages/admin/RolesList` (the Company Roles list, despite its name), `company/pages/admin/CompanyRoleCreate`, `company/pages/admin/SingleCompanyRole`, `company/components/PermissionsSelect` (the Transfer), `company/components/CompanySelector`, `generic/utils/modal.tsx`, `roles/services/role.ts`; backend `role/constants/permissions.ts`, `searching.ts`, `role-admin.service.ts`.

Rules read before planning: agent file (30 Oct version), the ledger, the Users plan and the Users audit (with its fix pass and decisions), the Companies and Access Blacklist entries in the ledger, `Documentation/hydra-ux-patterns.md` §7 (row actions) and §8 (form modals, §8.4 overlay), `module-layout.md`.

## Target

- **File:** Admin - RSFC (`rONB8aMPanOjS3GC1uN16d`)
- **Page:** `Company Roles` (`2958:63288`): https://www.figma.com/design/rONB8aMPanOjS3GC1uN16d/Admin---RSFC?node-id=2958-63288
- **Existing node (protected, left in place):** section `Company Roles · To design` (`2958:63300`), x 0, y 0, 1750 x 619, with one text note (`2958:63301`). It is the only content on the page. It is not moved or edited.
- **Canvas look:** set the page background to `#787A7E` at BUILD if it is not already. Every new Section is white at 10%.
- **New sections** (plain Sections, x 0, 290 apart; the first sits 290 below the placeholder, at y 909). This module has a Detail section (the read-only system role), so the numbering uses all nine kinds:

| Section | Rows | Screens per row | Width | Holds |
|---|---|---|---|---|
| `01 · List` | 1 | 2 | 3692 | L-01, L-02 |
| `02 · Detail` | 1 | 1 | 1846 | DT-01 |
| `03 · Create` | 1 | 2 | 3692 | CR-01, CR-02 |
| `04 · Edit` | 1 | 2 | 3692 | ED-01, ED-02 |
| `05 · Dialogs` | 1 | 2 | 3692 | D-01, D-02 |
| `06 · Empty` | 1 | 1 | 1846 | E-01 |
| `07 · Loading` | 1 | 2 | 3692 | LO-01, LO-02 |
| `08 · Error` | 1 | 3 | 5538 | ER-01, ER-02, ER-03 |
| `09 · Success` | 1 | 3 | 5538 | S-01, S-02, S-03 |

  Inside a section: 48 left and right, 80 top, 140 bottom, screens 96 apart, at most 3 per row. Section height = 80 + tallest screen + 140. The section y values are computed at BUILD from the hugged screen heights (form frames with the permission matrix will be taller than 970, as Users ED-03 grew to 1020), so they are not fixed here.
- **Frame size:** 1750 fixed width, hug height, minimum 970. Sidebar and content background stretch to the full height. **Frame names:** `NN.MM · Company Roles · <Screen> · <State>`.
- **Copy sources (copy and adapt; originals never edited):**
  - List screens: Users `01.01 · Users list · Default` (`3043:15814`). It already has the page-header primary button, the count in the card title, labelled text row actions with an "Actions" header, the HomeOutlined breadcrumb, and all audit fixes.
  - Form screens (Create, Edit, Detail): Companies `03.01 · Company Settings · Default` (`3021:4415`) for the page title, card and form items (no tabs), plus the permission table cloned from Users `03.03 · Edit user · Permissions` (`3044:4365`). Error caption from Users `03.02` (`3044:2555`).
  - Select open: the open `Select` state used for the Company select (Hydra `Select open=true`).
  - Empty: Users `04.01` (`3045:5492`). Loading: Users `05.01` (`3045:6141`) for the list and Companies `06.02` (`3022:8953`) for the form (no tabs). Error: Users `06.01` (`3045:6643`) for the list; the centred error Message from Users `06.02` (`3045:6933`). Success Message from Users `07.01` (`3045:7445`).
  - Destructive confirmation: Access Blacklist `03.01 · Remove entry · Confirm` (`3005:3188`) and `03.02 · Remove failed` (`3005:3256`). At BUILD, check that the dialog in them is `Modal__Confirmation` in the `Modal__Overlay` slot; if it is the plain DS `Modal`, take the confirmation from Companies `04.01 · Reset to default · Confirm` (`3022:9473`) instead.
- **Ready for Dev:** not read (per your instruction). Every existing frame in the file is treated as protected. Copies are checked for a Ready for Dev status at BUILD and reported if one carries it.

## Screens

Live status: **Source** = read from product source (no live walk this run). **Proposed** = not in the product, added as a UX improvement. Every screen is **New** (copy and adapt). Nothing to Move, Keep or Rebuild.

| # | Screen | Route | Section | State | Action | Live status |
|---|---|---|---|---|---|---|
| L-01 | Company roles list | `/company-roles` | 01 List | Company "First Test Company" chosen, 5 roles (2 system, 3 custom), page 1 | New (copy of `3043:15814`) | Source |
| L-02 | Company roles list · Company select open | `/company-roles` | 01 List | Company select open: First Test Company (selected), ASC-ES | New (copy of L-01) | Source |
| DT-01 | View system role | `/company-roles/:companyId/company-owner` | 02 Detail | "Company Owner", read-only: info Alert, name and description as text, permissions as Allowed / Not allowed | New (copy of `3021:4415` + table from `3044:4365`) | Source (live shows the edit form with every field disabled and no Save) |
| CR-01 | Create role | `/create-company-role/:companyId` | 03 Create | Empty form, no permission ticked | New (copy of `3021:4415` + table from `3044:4365`) | Source |
| CR-02 | Create role · Missing fields | `/create-company-role/:companyId` | 03 Create | "Role name is required" under Name and "Permissions are required" under the matrix | New (copy of CR-01 + caption from `3044:2555`) | Source |
| ED-01 | Edit role | `/company-roles/:companyId/:roleName` | 04 Edit | Custom role "Estimator", prefilled, some permissions ticked (one module partly ticked), Save changes disabled until something changes | New (copy of CR-01) | Source |
| ED-02 | Edit role · Name required | `/company-roles/:companyId/:roleName` | 04 Edit | Name cleared, "Role name is required" | New (copy of ED-01) | Source |
| D-01 | Delete role · Confirm | `/company-roles` | 05 Dialogs | "Delete role?" over L-01 | New (copy of `3005:3188`, background swapped to an L-01 copy) | Source (live uses a generic `Modal.confirm`) |
| D-02 | Delete role · Delete failed | `/company-roles` | 05 Dialogs | Confirmation stays open, error Message centred at y 16 | New (copy of `3005:3256`, adapted as D-01) | Source (string `failed-role-delete` exists, the page never shows it) |
| E-01 | No matching roles | `/company-roles?s_query=…` | 06 Empty | Search "zzzz", 0 results, "Clear filters" | New (copy of `3045:5492`) | Source |
| LO-01 | Company roles list · Loading | `/company-roles` | 07 Loading | Company select shown, Spin centred in the card, card title "Company roles" | New (copy of `3045:6141`) | Source (`Table loading`) |
| LO-02 | Edit role · Loading | `/company-roles/:companyId/:roleName` | 07 Loading | Spin centred in the card, breadcrumb "Loading…" | New (copy of `3022:8953`) | Source |
| ER-01 | Company roles list · Failed to load | `/company-roles` | 08 Error | Error Alert + Retry in the card | New (copy of `3045:6643`) | Source (a failed list request leaves the table silent) |
| ER-02 | Create role · Create failed | `/create-company-role/:companyId` | 08 Error | Filled form kept, error Message "Failed to create role. Try again." | New (copy of CR-01 + Message from `3045:6933`) | Source (string exists, unused) |
| ER-03 | Edit role · Save failed | `/company-roles/:companyId/:roleName` | 08 Error | Changed form kept, error Message "Failed to update role. Try again." | New (copy of ED-01 + Message from `3045:6933`) | Source (string exists, unused) |
| S-01 | Role created | `/company-roles` | 09 Success | Back on the list, new role row, Message "Role created successfully" | New (copy of L-01 + Message from `3045:7445`) | Source (`notifications.role-created`, then navigates to the list) |
| S-02 | Role updated | `/company-roles/:companyId/:roleName` | 09 Success | Message "Role updated successfully" | New (copy of ED-01) | Source (`notifications.role-update-success`) |
| S-03 | Role deleted | `/company-roles` | 09 Success | Row gone, Message "Role deleted successfully" | New (copy of L-01) | Source (`notifications.role-deleted`) |

**Count (lean set, my default): 18 New, 0 Move, 0 Keep, 0 Rebuild, 0 Blocked.**

Optional extras, off by default (Question 9): L-03 System role filter open (Yes / No), L-04 disabled Delete with the tooltip "System roles can't be deleted.", CR-03 permission description tooltip (hovering a module shows its description, as the live Transfer does per permission), E-02 no company chosen (no companies exist). With all four the module is 22 frames.

Skipped on purpose: the info toast "No role to update" (UX-7 makes it unreachable), the bulk delete strings (`bulk-menu.delete` exists, the list has no row selection), the company-side Company Roles page (`/companies/:companyName/roles`, not part of this sidebar module).

### Not in the product (so not drawn)

- **"No roles yet" empty state.** Every company always has its two system roles (Company Owner, Company Member), so the list is never empty for a chosen company. Only the no-results state is drawn.
- **Assigning roles to users.** That happens on the Users page (Users ED-03). The Users column only links to the filtered Users list.

## Hydra components per screen

Searched live in Hydra Ant Design - DS only (`includeLibraryKeys` = `lk-0d30b3c5…19ed`). Keys are for reference; re-discover at BUILD.

| Need | Hydra component (variants / properties) | Used on |
|---|---|---|
| Shell | `Sidebar` (`88c193bc…`), `Topbar`, `Breadcrumb` (`items=3`: HomeOutlined / Company roles / page), all from the copy | all |
| Sidebar Company Roles group open | `.menu__submenu` `open=true` with `.menu__submenu_list` (one child "List", selected; parent `child selected=true`); Users `.menu__submenu` set to `open=false`. `items=1` could not be confirmed by search (internal helper); check at BUILD, see Question 2. Icon recipe on every item. | all |
| Page title + description, primary CTA | Inherited page-title text (same text style as Users) + `Base/Normal` description; `Button type=primary size=large` "Create role" (no icon, as Users U-A-07) | list screens |
| Card | Inherited bound `Table card` / `Settings card` frames (no Card component, known gap) | all |
| Company scope | `Input__Label` "Company" + `Select` (`size=medium`, `open=false` / `open=true` with the dropdown options) | list screens, CR/ED header line |
| Search | `Input__Search` "Search by role name" (backend searches `name` and `displayName`) | list screens, E-01 |
| Table header | `Table / Table Item / Header Item` (sort on Name and Type, filter on Type) | list screens |
| Table cells | `Table / Table cell` `type=text` (Name, Description, Permissions count), `type=tag` (Type), `type=action` (Users link "3 users"; row actions) | list screens |
| Type tag | `Tag` `type=default` "System" and "Custom" | list screens |
| Row actions | `Table cell type=action`: "Edit" + "Delete" (danger text, `colorErrorText`, as Access Blacklist); system rows: "View" + Delete disabled (`colorTextDisabled`) | list screens |
| Form | `Input__Label` (`orientation=vertical, size=medium`, `required` on Name and Permissions), `Input`, `Input__TextArea` (Description, new instance), `Input__Caption` (`status=error`), `Button type=primary` "Create role" / "Save changes", `Button type=default` "Cancel" | CR-*, ED-*, ER-02, ER-03, S-02 |
| Permission matrix (replaces Transfer) | Table cloned from Users ED-03: `Table / Table Item / Header Item` (Permission, All, Create, Read, Update, Delete) + `Table / Table cell type=text` (module name) + bound wrapper cells holding Hydra `Checkbox` (`show title` off; `checked=true`, `false` or `indeterminate`; `state=disabled` not used) + `type=text` "—" in `colorTextDescription` where a module has no such action | CR-*, ED-*, ER-02, ER-03, S-02 |
| Read-only matrix | Same table with `Table cell type=badge` "Allowed" / "Not allowed" (exactly as Users ED-03) | DT-01 |
| Read-only notice | `Alert type=info` (+ `show description`) | DT-01 |
| Pagination | `Pagination` (`type=changer`, "10 / page"), copied | list screens |
| Empty | `Empty State Block` (`show action` off, `show secondary action` on "Clear filters") | E-01 |
| Loading | `Spin` (`size=large`, description off) | LO-01, LO-02 |
| Error | `Alert type=error` + `show description` + `Button` default "Retry", centred state frame (Alert 640) as Users | ER-01 |
| Toasts | `Message` `type=success`, `type=error`, centred on the frame at y 16 | ER-02, ER-03, S-01–S-03, D-02 |
| Confirmation | `Modal__Overlay` + `Modal__Confirmation` (`ff12f0bc…`) via the `🎰 modal` swap; Cancel default + "Delete" primary `danger=true`; overlay x 0, y 0, full frame, STRETCH / STRETCH | D-01, D-02 |
| Transfer, Tree | **Not in Hydra** (search for "Transfer" returns only `SwapOutlined`; "Tree" returns `Cascader` and icons). Replaced by the matrix above, see Question 1. | - |

Text styles and variables: the same set Users and Companies used (the inherited page-title style, `Title/Heading 5`, `Base/Normal`, `Base/Medium`; `Size/Padding/*`; `colorText`, `colorTextDescription`, `colorTextDisabled`, `colorErrorText`, `colorBorderSecondary`). Re-verify at BUILD; nothing is created.

Copy (from source; role names and descriptions beyond the two system roles are fictional sample data, see Question 4):
- List: title "Company roles", description "Roles decide what people in a company can see and do.", card title "5 roles", Company select "First Test Company". Columns Name, Description, Type, Users, Permissions, Actions. Rows: Company Owner (System, 2 users), Company Member (System, 14 users), Estimator (Custom, 3 users), Project Manager (Custom, 4 users), Viewer (Custom, 0 users). Permissions column reads "12 permissions".
- Create / Edit: title "Create role" / role name; Company line "Company: First Test Company"; fields Name ("e.g. Estimator"), Description (optional, "What this role is for"), Permissions. Buttons Cancel · Create role / Cancel · Save changes.
- Permission rows shown (6 of 17 company modules, with the actions the source defines for them): Users (Create, Read, Update, Delete), Company (Create, Read, Update; no Delete), Company Invites (Create, Read, Delete; no Update), Roles (Create, Read, Update, Delete), Files (Create, Read, Delete; no Update), Tags (Create, Read, Update, Delete). Module names from `PermissionModuleDisplayNames`.
- Errors: "Role name is required", "Permissions are required" (no full stop, as U-A-60).
- Delete: title "Delete role?", description "“Estimator” will be deleted. The 3 people who have it will lose its permissions. This can't be undone.", Cancel · Delete.
- Messages: "Role created successfully", "Role updated successfully", "Role deleted successfully", "Failed to create role. Try again.", "Failed to update role. Try again.", "Failed to delete role. Try again." (next step added, as Users U-A-40).
- DT-01: Alert "System role" / "System roles can't be changed or deleted. To give different permissions, create a custom role."

## UX improvements

Run with `hydra-ux-audit` (effortless x PRD x functional, 5-second test, one primary action, plain copy, every state covered, progressive disclosure). Each stays inside Hydra components and removes nothing the product has.

Findings first:
- 5-second test, list: mostly passes once a company is chosen. Fails on the row actions (three icon-only round buttons: eye, pencil, trash, with tooltips inside the buttons and no column header), on "System Role: Yes / No", on "(12)" for permissions and on a round button with a bare number for users.
- The Company select sits inside the card with no explanation, and the page silently picks the first company. "Which company am I looking at?" needs a second look.
- Create and edit: the permissions Transfer moves items between two 300-px scrolling trees ("Available Permissions" / "Enabled Permissions"). Labels repeat the module ("Users - Create"). It is hard to see at a glance what a role can do. Create does not say which company the role is for. No Cancel.
- System roles open the same edit form with every field disabled and no Save, with no reason given. The title still says "Update Company Role".
- Saving without changes shows "No role to update"; removing every permission is ignored without a message.
- Delete asks "Are you sure you want to delete the role?" with OK / Cancel; it does not name the role or say who is affected.
- States: no-results is a generic "No data"; failed load, create, update and delete are silent.

| # | Improvement | Hydra component that carries it | Screens |
|---|---|---|---|
| UX-1 | Page header like Users: title "Company roles" + one-line description, one primary "Create role" (`size=large`, no icon) on the right; card title shows the count ("5 roles") | Inherited page title, `Button primary large`, card header text | list screens |
| UX-2 | Company scope made explicit: labelled "Company" select at the top of the card, left of the search; Create and Edit show "Company: First Test Company" under the title | `Input__Label` + `Select`, `Base/Normal` description | list screens, CR-*, ED-* |
| UX-3 | Row actions as labelled text actions in a right-aligned "Actions" column (§7.2): custom roles "Edit" · "Delete"; system roles "View" · Delete disabled (tooltip in optional L-04) | `Table cell type=action` | list screens |
| UX-4 | Plain values: "Type" column with `Tag` "System" / "Custom" instead of Yes / No; Users as a link "3 users" (opens the Users list filtered by this role, as live); Permissions "12 permissions" | `Table cell type=tag` + `Tag`, `type=action`, `type=text` | list screens |
| UX-5 | **Permission matrix instead of Transfer:** one row per module, columns All · Create · Read · Update · Delete, a Checkbox per action and an "All" checkbox per module (indeterminate when partly ticked, like the live tree parent); "—" where a module has no such action. Same grid as the user's "Current permissions" on Users ED-03, so admins read roles and users the same way | Cloned Users table + `Checkbox` in bound wrapper cells, `Table cell type=text` | CR-*, ED-*, ER-02, ER-03, S-02 |
| UX-6 | System role opens a read-only view: title = role name, info Alert explains why it can't be changed, permissions as Allowed / Not allowed (Users ED-03 badges), no Save | `Alert info`, `Table cell type=badge` | DT-01 |
| UX-7 | Form per §8.3: required `*` on Name and Permissions, "(optional)" on Description, placeholder examples, Cancel (default) left of the primary; on Edit, "Save changes" is disabled until something changes (replaces the "No role to update" toast) | `Input__Label required`, `Input`, `Input__TextArea`, `Button default` + `Button primary` | CR-*, ED-* |
| UX-8 | Delete per §7.3: "Delete role?" names the role and the number of people affected, says it can't be undone; Cancel + "Delete" (`danger=true`); failure keeps the dialog open with an error Message | `Modal__Overlay` + `Modal__Confirmation`, `Message error` | D-01, D-02 |
| UX-9 | Every failure gets a state: list load → error Alert + Retry; create, update, delete → error Message with a next step | `Alert error` + `Button default`, `Message error` | ER-01–ER-03, D-02 |
| UX-10 | No-results uses the Empty State Block: "No roles found" / "Try another role name, or clear the search." + "Clear filters" | `Empty State Block` | E-01 |
| UX-11 | Sentence case for all labels and buttons ("Create role", "Save changes", "Company roles") | Text overrides | all |

## Not seen live

All 18 screens (no live walk this run; Screen Recording is off for Cursor Computer Use). In particular: the real company list and roles in dev, the live breadcrumb wording for Create and Edit, whether a failed request shows a generic error toast from the request layer, and whether deleting a role that people still have is allowed (the source shows no check). Designed from source strings and Hydra Spin, Alert, Message, Modal__Confirmation and Empty State Block. Not forced.

## Blocked (missing component, variant or variable)

**Nothing blocks the module if you accept the matrix (Question 1).** Gaps (no token, component or variant will be created):

1. **No Transfer and no Tree in Hydra** (known). The live permissions picker cannot be drawn as is. Default: permission matrix (UX-5). If you want the live two-panel Transfer, this screen family (CR-*, ED-*, ER-02, ER-03, S-02) is **Blocked** until the DS adds Transfer and Tree.
2. **No checkbox Table cell** (`Table / Table cell` types are text, badge, tag, action, dropdown, rate, switch, progress). Default: bound wrapper cell with a Hydra `Checkbox`, the same approach as the Companies select cell. `Table / Table Item / Row Control` has a checkbox, but the DS marks it "do not use on its own".
3. **Sidebar has no Feature Access Limit item** (known, unchanged).
4. **Submenu with one child** (`.menu__submenu_list items=1`) not confirmed. Question 2.
5. **Table cell type=action renders text links only** (known, §8.5). Row actions stay text actions, as Users and Access Blacklist.
6. **No Card, page header or Form item component** (known). Inherited bound frames.
7. **Pagination has no page buttons** (known, U-A-01). Kept as in Users.
8. Raw geometry kept as in Users and Companies: table column widths, frame and section canvas positions, Message and dropdown absolute positions.

## Protected, left as is

- `Company Roles · To design` (`2958:63300`) and its note (`2958:63301`): not moved, not edited.
- Every source frame listed under Copy sources is only cloned.

## Live app issues

| # | Issue | How seen |
|---|---|---|
| I-1 | Top bar reads "Hi Admin, Welcome to ." (known). Kept as the copied frame shows. | Ledger, earlier runs |
| I-2 | Row actions are icon-only round buttons (eye or pencil, trash); the Actions column has no header; tooltips sit inside the buttons. | Source |
| I-3 | "System Role" shows Yes / No; Permissions shows "(12)"; Users is a round button with a bare number. | Source |
| I-4 | The page picks the first company silently; the Company select has no context, and the create page does not show which company the role is for. | Source |
| I-5 | Permissions use a Transfer with two 300-px scrolling trees; labels repeat the module ("Users - Create"); descriptions are hover-only, and only 21 permissions have a description string (others will show a missing key). | Source |
| I-6 | System roles open the edit form fully disabled with no reason and no Save; the title says "Update Company Role". | Source |
| I-7 | Saving with no change shows "No role to update"; removing every permission is ignored without a message (`permissionIds?.length` check). | Source |
| I-8 | Delete confirmation is generic ("Are you sure you want to delete the role?"), uses OK / Cancel, and OK is not a danger button. | Source |
| I-9 | `failed-role-create`, `failed-role-update`, `failed-role-delete` exist but the pages never show them; a failed list load leaves the table silent. | Source |
| I-10 | While a role loads, the breadcrumb uses `t('loading')`, but `single-company-role.loading` does not exist, so the raw key may show. | Source |
| I-11 | Title case everywhere ("Create New Role", "Save Changes", "Create Role", "Update Company Role"). | Source |
| I-12 | Create and edit have no Cancel or back action; both forms are named `company-invitations-send` (copy-paste, affects test IDs). | Source |
| I-13 | Row action wording: live tooltips say View / Edit / Delete, which match §7.2; Users and Companies differ ("Manage company", Users I-17). | Standard |

## Questions (with the default I would pick)

1. **Permissions picker.** Hydra has no Transfer or Tree. **Default: permission matrix (UX-5)** — rows = modules, columns All / Create / Read / Update / Delete with Hydra Checkboxes in bound wrapper cells, same grid as Users ED-03. Alternatives: (b) one `Collapse` panel per module with a Checkbox group inside (closer to the live tree, much longer screens); (c) mark the create and edit screens Blocked until the DS gets Transfer and Tree.
2. **Sidebar.** **Default: Users collapsed, Company Roles open with its one child "List" selected** (as Users did for its group), if `.menu__submenu_list` has `items=1`. If it does not, Company Roles is a single selected item (as Companies) and I report the gap. Icon recipe and the selected on/off proof on every frame.
3. **Matrix rows in a 970-high frame.** There are 17 company modules. **Default: show the first 6 (Users, Company, Company Invites, Roles, Files, Tags)**, frame hugs its height, as Users did (6 of 17). Alternative: all 17 rows (a frame about 1500 high).
4. **Sample data.** **Default: real system roles (Company Owner, Company Member), fictional custom roles (Estimator, Project Manager, Viewer) with short descriptions, company First Test Company and ASC-ES**, consistent with the Users frames. Alternative: wait for a live walk and copy the dev data.
5. **System roles in the list.** **Default: "View" plus a disabled "Delete"** (§7.2 "keep the button, explain in a tooltip"). Alternative: "View" only, no Delete.
6. **Delete confirmation copy.** It says people "will lose its permissions"; the source shows no block on deleting a role in use. **Default: keep that sentence.** Alternative: a generic "This can't be undone." only, until dev confirms.
7. **Save changes disabled until something changes (UX-7).** **Default: yes** (§8.2 Edit). Alternative: keep it enabled and draw the "No role to update" info toast.
8. **Read-only system role (DT-01) in a Detail section.** **Default: yes, its own `02 · Detail` section.** Alternative: put it in `04 · Edit` as a state of the edit screen.
9. **How many frames?** **Default: lean set of 18.** Add L-03, L-04, CR-03 and E-02 for 22.
10. **No live walk.** **Default: build from source now and list the screens as "Not seen live"**. Alternative: turn on Screen Recording for Cursor Computer Use and let me re-check copy and breadcrumbs before BUILD.

## Build outcome (2026-10-30)

Approved: lean set of 18, UX-1 to UX-11, every question on its default (Q1 Checkbox matrix confirmed by the user, Q10 built from source with no live walk).

| Screen | Frame | Node | Section | Copied from |
|---|---|---|---|---|
| L-01 | 01.01 Company roles list · Default | `3067:4236` | 01 · List `3067:2088` | `3043:15814` |
| L-02 | 01.02 Company roles list · Company select open | `3069:771` | 01 · List | L-01 |
| DT-01 | 02.01 View system role · Company Owner | `3070:3688` | 02 · Detail `3067:2089` | `3044:4365` |
| CR-01 | 03.01 Create role · Default | `3070:984` | 03 · Create `3067:2090` | `3044:4365` |
| CR-02 | 03.02 Create role · Missing fields | `3070:2059` | 03 · Create | CR-01 + caption `3044:2792` |
| ED-01 | 04.01 Edit role · Default | `3070:2493` | 04 · Edit `3067:2091` | CR-01 |
| ED-02 | 04.02 Edit role · Name required | `3070:2988` | 04 · Edit | ED-01 |
| D-01 | 05.01 Delete role · Confirm | `3070:4644` | 05 · Dialogs `3067:2092` | L-01 + overlay `3005:3241` |
| D-02 | 05.02 Delete role · Delete failed | `3070:5102` | 05 · Dialogs | D-01 + message `3045:6966` |
| E-01 | 06.01 No matching roles | `3070:6364` | 06 · Empty `3067:2093` | L-01 + `3045:5769` |
| LO-01 | 07.01 Company roles list · Loading | `3070:6655` | 07 · Loading `3067:2094` | L-01 + `3065:7185` |
| LO-02 | 07.02 Edit role · Loading | `3070:6904` | 07 · Loading | ED-01 + `3022:9133` |
| ER-01 | 08.01 Company roles list · Failed to load | `3070:7174` | 08 · Error `3067:2095` | L-01 + `3045:6920` |
| ER-02 | 08.02 Create role · Create failed | `3070:7428` | 08 · Error | CR-01 + `3045:6966` |
| ER-03 | 08.03 Edit role · Save failed | `3070:7887` | 08 · Error | ED-01 + `3045:6966` |
| S-01 | 09.01 Role created | `3070:8337` | 09 · Success `3067:2096` | L-01 + `3045:7478` |
| S-02 | 09.02 Role updated | `3070:8858` | 09 · Success | ED-01 + `3045:7478` |
| S-03 | 09.03 Role deleted | `3070:9305` | 09 · Success | L-01 + `3045:7478` |

Deviations from the plan:
- Create, edit and detail screens were copied from Users ED-03 (`3044:4365`), not Companies `3021:4415`. ED-03 already has the bound header, settings card and permissions table.
- `.menu__submenu_list` only has `items=2`–`6`, so Company Roles is drawn as a single selected item (as Companies), not as an open group with "List" (Question 2 fallback).
- hydra-ux-audit Phase 1 found one problem: a disabled primary with no explanation. Fixed by adding a hint next to the disabled Save changes ("Change a field or a permission to save." on 04.01, "All changes are saved." on 09.02).

Gates (all 18 frames pass):
- Every instance is a remote Hydra component. None is detached.
- No hidden nodes remain in the frames themselves.
- Every fill, stroke, padding, gap and radius on those nodes is bound, and every text is styled.
- In the sidebar, only Company Roles is selected. Every breadcrumb starts with HomeOutlined.
- Frames are 1750 wide, hug their height, and are at least 970 tall.
- The "To design" section (`2958:63300`) was left untouched.

## Fix pass (review)

Date: 2026-10-30, on all 18 frames.

1. **Label colons.**
   - What I found:
     - The colon is a separate ":" text layer, not a component property.
     - The Users and Companies labels come from the same main component (`3005:1144`), but their instances have no ":" layer.
     - My new instances did have it.
   - What I changed:
     - I replaced each of the 30 Company Roles `Input__Label` instances with a clone of a colon-free Users label, keeping the same title, required and tooltip values.
     - Form labels use Invite admins `3043:17864`.
     - The "Company" filter label uses Users ED-03 `3044:4383`. No horizontal label without a colon exists in the file, so this one is a vertical label placed in the horizontal filter row, centred on the Select.
   - Result: no visible label text contains ":".
2. **Users chevron.** The Users `.menu__item` `↳ 🎰 action` swap was UpOutlined (`2798:24177`). I set it to DownOutlined (`2798:23926`), the same value Knowledge Center and Content use. The submenu was already `open=false`.

Re-checks:
- The sidebar icon colour check passed on all 18 frames, and the selected on/off proof passed.
- The gates re-ran clean on all 18: linked remote instances only, no hidden leftovers, every fill, stroke, padding and gap bound, every text styled.
- I checked the screenshots of `3067:4236` and `3070:984`.
- Nothing else changed. I did not edit the ledger in this pass.

## Ledger

`Documentation/admin-figma-ledger.json`: `modules["Company Roles"].status = "built"` on 2026-10-30, with sections and built frame IDs.
