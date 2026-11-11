# Admin module plan — Users

Status: **built on 2026-10-30** (BUILD mode). 19 lean screens are on the Users page. Optional extras L-03, ED-06, LO-03, ER-04 and D-01 were not built. UX-11 stays off.

Live walk: 30 Oct, user's signed-in Chrome, `https://admin.hydra-dev.spaceinch.tech`, the tab the Companies run left open. Looked only. Opened every filter, select and tab and closed them with Escape. Typed `zzzz` in the list search and `not-an-email` in the Invite admins email field (not sent, page reloaded). Never clicked Save changes, Send invitations, Add another invite or Remove, and never changed a select value. Product source read with `gh api` (`ooden-tech/on-hydra-app`): `core/user/pages/admin/UsersList`, `AdminSingleUser`, `core/company/components/BasicInformationTabAdmin` and `PermissionsTabAdmin`, `core/roles/components/UserPermissionRoleEditAdmin` and `FeatureAccessLimitEditTab`, admin `AdminInviteAdminsPage`, both `en/translation.json` files, and the backend `user-admin.service.ts` search.

Rules read before planning: agent file (30 Oct version), `Documentation/hydra-ux-patterns.md` (all, incl. §2 Sidebar icon, §7 Table row actions, §8 Form modals, §8.4 overlay, §9 canvas), the ledger, the Companies plan and its built frames, `module-layout.md`, `hydra-ux-audit`, the screen-recreator skill and its Hydra contract.

## Target

- **File:** Admin - RSFC (`rONB8aMPanOjS3GC1uN16d`)
- **Page:** `Users` (`2958:63287`): https://www.figma.com/design/rONB8aMPanOjS3GC1uN16d/Admin---RSFC?node-id=2958-63287. Canvas already `#787A7E`.
- **Existing node (not touched):** section `Users · To design` (`2958:63298`), x 0, y 0, 1750 x 619, white 10%, holds one text note (`2958:63299`). Left exactly where it is.
- **New sections** (plain Sections, white 10% fill, x 0, 290 apart, first one 290 below the placeholder). Numbering is sequential and skips section kinds the module does not have (no Detail, no Dialogs), as Companies did:

| Section | y | Rows | Height | Width | Holds |
|---|---|---|---|---|---|
| `01 · List` | 909 | 1 | 1190 | 3692 | L-01, L-02 |
| `02 · Create` | 2389 | 1 | 1190 | 3692 | CR-01, CR-02 |
| `03 · Edit` | 3869 | 2 | 2370 | 5538 | ED-01, ED-02, ED-03 / ED-04, ED-05 |
| `04 · Empty` | 6529 | 1 | 1190 | 3692 | E-01, E-02 |
| `05 · Loading` | 8009 | 1 | 1190 | 3692 | LO-01, LO-02 |
| `06 · Error` | 9489 | 1 | 1190 | 5538 | ER-01, ER-02, ER-03 |
| `07 · Success` | 10969 | 1 | 1190 | 5538 | S-01, S-02, S-03 |

  Inside a section: 48 left/right, 80 top, 140 bottom, screens 96 apart, at most 3 per row, next row 210 below the tallest screen (03 · Edit: 80 + 970 + 210 + 970 + 140 = 2370, so the next section is at 3869 + 2370 + 290 = 6529). Widths 1846 / 3692 / 5538 for 1 / 2 / 3 screens per row.
- **Frame size:** 1750 x 970. **Frame names:** `NN.MM · Users · <Screen> · <State>`.
- **Copy sources (copy and adapt, originals never edited):**
  - List-type screens: Companies `01.01 · Companies · List · Default` (`3020:3683`); filter popover from `01.02 … Country filter open` (`3022:5211`).
  - Form screens (Basic information, Invite admins): Companies `03.01 · Company Settings · Default` (`3021:4415`), error caption from `03.02` (`3021:4764`).
  - Feature Access tab: Companies `02.01 · Feature Access Control · Default` (`3022:990`).
  - Empty: Companies `05.01` (`3022:5824`). Loading: `06.01` (`3022:6341`), `06.02` (`3022:8953`). Error: `07.01` (`3022:6104`), `07.02` (`3022:9353`). Success: `08.01` (`3022:9385`).
- **Ready for Dev:** still unreadable (`devStatus is not a supported API` in `use_figma`; same as earlier runs). The Users page holds only the placeholder. Nothing to move. Copies only.

## Screens

Live status: **Seen** = opened in Chrome. **Source** = read from product source, not reachable without changing data. **Proposed** = not in the live app. Every screen is **New** (copy and adapt). Nothing to Move, Keep or Rebuild.

| # | Screen | Route | Section | State | Action | Live status |
|---|---|---|---|---|---|---|
| L-01 | Users list | `/users-list` | 01 List | Default, 10 rows, page 1 of 5 | New (copy of `3020:3683`) | Seen |
| L-02 | Users list · Roles filter open | `/users-list` | 01 List | Filter popover: search, Company Member, Company Owner, Global Administrator, RSFC Employee, Reset, OK | New (copy of L-01 + popover from `3022:5211`) | Seen |
| CR-01 | Invite admins | `/users-list/invite-admins` | 02 Create | One empty invite row | New (copy of `3021:4415`) | Seen |
| CR-02 | Invite admins · Invalid email | `/users-list/invite-admins` | 02 Create | Two rows, first email shows "Enter a valid email address." | New (copy of CR-01 + caption from `3021:4764`) | Seen (one row); second row from source (`Form.List`) |
| ED-01 | Edit user · Basic information | `/users-list/:userId` | 03 Edit | Default (company user) | New (copy of `3021:4415`) | Seen |
| ED-02 | Edit user · Basic information · First name required | `/users-list/:userId` | 03 Edit | Field error "First name is required" | New (copy of ED-01) | Source (`FirstNameRules`) |
| ED-03 | Edit user · Permissions | `/users-list/:userId` (tab) | 03 Edit | Company, Company roles (Company Owner), Save changes, Current permissions matrix | New (copy of ED-01) | Seen |
| ED-04 | Edit user · Admin permissions | `/users-list/:userId` (tab) | 03 Edit | Admin user: Admin roles (Global Administrator), Current permissions matrix | New (copy of ED-03) | Seen |
| ED-05 | Edit user · Feature access | `/users-list/:userId?tab=feature-access-limit` | 03 Edit | 29 modules, first 8 shown, one Disabled | New (copy of `3022:990`, put inside the tab card) | Seen |
| E-01 | Users · No matching users | `/users-list?s_query=…` | 04 Empty | Search with 0 results, "Clear filters" | New (copy of `3022:5824`) | Seen (live shows plain "No data") |
| E-02 | Edit user · Admin permissions · No admin role | `/users-list/:userId` (tab) | 04 Empty | Non-admin user, empty Admin roles, empty matrix | New (copy of ED-04) | Seen (live shows "No data" table) |
| LO-01 | Users list · Loading | `/users-list` | 05 Loading | Spin centred in the card | New (copy of `3022:6341`) | Seen (Spin over the empty table) |
| LO-02 | Edit user · Loading | `/users-list/:userId` | 05 Loading | Spin centred in the card, breadcrumb "Loading…" | New (copy of `3022:8953`) | Source (`<Spin />`, `single-user.loading`) |
| ER-01 | Users list · Failed to load | `/users-list` | 06 Error | Error Alert + Retry in the card | New (copy of `3022:6104`) | Not seen. Source: a failed request leaves the table silent (UX-9) |
| ER-02 | Edit user · Save failed | `/users-list/:userId` | 06 Error | Message error "Failed to update user" | New (copy of `3022:9353`) | Source (`single-user.failed-user-update`, string exists, unused) |
| ER-03 | Invite admins · Send failed | `/users-list/invite-admins` | 06 Error | Message error "Unable to process invitations. Try again or contact support." | New (copy of CR-01 + Message from `3022:9353`) | Source (`invite-admins.notifications.failed`) |
| S-01 | Edit user · Saved | `/users-list/:userId` | 07 Success | Message "User updated successfully" | New (copy of `3022:9385`) | Source (`single-user.user-update`) |
| S-02 | Edit user · Permissions saved | `/users-list/:userId` (tab) | 07 Success | Message "User permissions updated successfully" | New (copy of ED-03) | Source (`user-permission-role-edit.notifications.success`) |
| S-03 | Invite admins · Results | `/users-list/invite-admins` | 07 Success | Message "Invitation requests were processed." + Results table (Email, Status, Reason) with Assigned / Invited / Skipped | New (copy of CR-01) | Source (`results`, `status.*`, `reasons.*`) |

**Count (lean set, my default): 19 New, 0 Move, 0 Keep, 0 Rebuild, 0 Blocked.**

Optional extras, off by default (Question 9): L-03 Type filter open (Admin / User, fixed copy), ED-06 Company roles select open (Company Owner checked, Company Member), LO-03 Invite admins first load (the live Card `loading` shows an Ant skeleton, Hydra `Skeleton` basic), ER-04 Permissions save failed, D-01 "Remove admin role?" confirmation (UX-11). With all five the module is 24 frames.

Skipped on purpose: Company select open on Basic information (one option, no new information), Country select open (same as Companies), Admin role select open in Invite admins (two options, same Select pattern as ED-06), info toasts "already a Global Administrator" and "The application will refresh to apply changes" (listed under Live app issues), the `already_has_role` / `pending_invite_exists` reasons beyond one Skipped row in S-03.

### Not in the product (so not drawn)

- **Delete user.** The strings `users-list.actions.delete` and `company-users.delete-confirm` exist, but the Admin list has no delete action. No destructive row action, so no `Modal__Confirmation` is needed for Users. Nothing to draw.
- **Create user.** Users enter through Invite admins (admins) or through company invitations outside this module.
- **Bulk actions.** None in this module.

## Hydra components per screen

Searched live in Hydra Ant Design - DS only (`includeLibraryKeys` = `lk-0d30b3c5…19ed`, the only library added to the file). Everything below exists. Keys are for reference; re-discover at BUILD.

| Need | Hydra component (variants / properties) | Used on |
|---|---|---|
| Shell | `Sidebar` (`88c193bc…`), `Topbar`, `Breadcrumb` (`items=2` list and invite, `items=3` user page) | all |
| Sidebar Users group open | `.menu__submenu` `mode=inline, theme=dark, open=true` (set `92fb308e…`) holding `.menu__submenu_list` `items=2, theme=dark` (set `3610ba7a…`); child items are `.menu__item` (`selected`, `child selected`, `state=default`, `↳ ✏️ title`, `↳ 🎰 icon`); icon `UnorderedListOutlined` (`a8f0c25c…`) for List and Invite admins, as live | all |
| Page title + description | Inherited Companies page-title text (same style as Companies) + `Base/Normal` description | all |
| Card | Hand-built `Table card` / `Settings card` frames inherited from Companies, bound to Hydra variables (no Card component, known gap) | all |
| Search | `Input__Search` (as Companies) | L-01, L-02, E-01, LO-01, ER-01 |
| Table header | `Table / Table Item / Header Item` (`sort` on Email, First name, Last name; filter on Type, Roles, Feature access) | list screens |
| Table cells | `Table / Table cell` `type=text` (email, names), `type=tag` with `show tag` / `show tag 2` (Type, Roles, Custom rules applied), `type=action` (text actions), `type=badge` (permission matrix, Access status) | L-01, ED-03, ED-04, ED-05 |
| Type tag | `Tag` `type=default` ("Admin", "User") | L-01 |
| Role tags | `Tag__Colorful` `color=gold` (live gold) | L-01, L-02 |
| "Custom rules applied" | `Tag__Status` `status=warning`, `show icon` off (as Companies) | L-01 |
| Column filter popover | `Table / Table Item / Table Dropdown`, `Dropdown Checkbox`, `Dropdown Item` (footer Reset / OK) | L-02 |
| Pagination | `Pagination` (`type=changer`, "10 / page") | list screens |
| Tabs | `Tabs` `placement=top, size=large` with `.tabs__header` `items=4` (Basic information, Permissions, Admin permissions, Feature access) | ED-*, E-02, LO-02, ER-02, S-01, S-02 |
| Form | `Input__Label` (`orientation=vertical, size=medium`, `required`), `Input` (`state=disabled` for Email), `Select` (`open=false, size=medium`) with `.select_input` `type=basic` or `type=multiple` (Company roles, Admin roles), `Input__Caption` (`status=error` and `status=default` helper), `Button` `type=primary` "Save changes" | ED-01–ED-04, CR-* |
| Invite rows | `Input`, `Select`, `Button` `type=text, danger=true` "Remove" (`state=disabled` when only one row), `Button` `type=dashed` + `PlusOutlined` "Add another invite", `Button` `type=primary` "Send invitations" | CR-01, CR-02, ER-03, S-03 |
| Results table | `Table / Table cell` `type=text` + `type=tag` holding `Tag__Status` `success` (Assigned), `processing` (Invited), `Tag` `default` (Skipped) | S-03 |
| Feature access | Copied Companies DT-01 cell wrapper (bound) with `Select` (Enabled / Disabled) | ED-05 |
| Empty | `Empty State Block` (title, description, `show action` off, `show secondary action` on "Clear filters") | E-01, E-02 |
| Loading | `Spin` (`size=large`, description off) | LO-01, LO-02 |
| Error | `Alert` `type=error` + `show description` + `Button` default "Retry" | ER-01 |
| Toasts | `Message` `type=success`, `type=error` | ER-02, ER-03, S-01–S-03 |
| Transfer | **Not needed.** Users assigns roles with a multiple `Select` (live and source). Hydra still has no `Transfer` (only `SwapOutlined`); gap stays logged for Company Roles and Admin Roles. | - |
| Confirmation (optional D-01 only) | `Modal__Overlay` + `Modal__Confirmation` (`ff12f0bc…`), overlay x 0, y 0, 1750 x 970, STRETCH / STRETCH | D-01 |

Text styles and variables: the same set Companies used (`Title/Heading 5`, `Base/Normal`, `Base/Medium`; `Size/Padding/*`, `colorBorderSecondary`, `colorText`, `colorTextDescription`, `colorErrorText`). Re-verify at BUILD; nothing is created.

Copy (live or source, exact; people data replaced by fictional sample data, see Question 1):
- List: title "Users" (live card title "Users list"), columns Email, First name, Last name, Type, Roles, Feature access, Actions. Type values Admin / User. Role values Company Owner, Company Member (with company First Test Company or ASC-ES), Global Administrator, RSFC Employee. Pagination 1–5, "10 / page".
- User page: tabs Basic information, Permissions, Admin permissions, Feature access. Basic information: "User profile", Company ("Select company"), First name, Last name, Email, Country (🇺🇸 United States), Save changes. Permissions: "Edit permissions", Company, Company roles, Save changes, "Current permissions", columns Permission, Create, Read, Update, Delete; 17 modules (BOM … Users; Cheat Sheets, Content, Revit Plugin read-only for Company Owner). Admin permissions: Admin roles (RSFC Employee, Global Administrator), 25 modules (Access Blacklist … Users; Admin Invites create only for Global Administrator). Feature access: "Feature Access Control", "Manage feature access limits for this user.", columns Feature Module, Access Status, Actions.
- Invite admins: "Invite admins", Email ("name@example.com"), Admin role ("Select role"), Remove, Add another invite, Send invitations. Errors "Email is required", "Enter a valid email address", "Select an admin role". Results: "Results", Email, Status, Reason; Assigned, Invited, Skipped; reasons e.g. "Already a Global Administrator".

## UX improvements

Run with `hydra-ux-audit` (effortless x PRD x functional, 5-second test, one primary action, plain copy, every state covered, progressive disclosure). Each stays inside Hydra components and removes nothing the live app has.

Findings first:
- 5-second test, list: mostly passes (find a user, open them). Fails on the row actions: two unlabeled icons (shield, pencil) and an Actions column with no header. The Feature Access shield sits in the Feature Access column, the pencil in a nameless column.
- 5-second test, user page: fails. No page title and the breadcrumb shows only the name, so "whose page is this?" needs a second look. Basic information opens with an empty "Company" select although the user belongs to a company. Three tabs each have their own "Save changes", and nothing says which tab saves what.
- Filters: Type filter offers a blank option and "true" (bug); Feature Access filter opens to "No filters".
- Roles column: tags truncate company names and admin roles end with a colon ("Global Administrator :"). Four roles make a row four lines high.
- Invite admins: works, but there is no sentence saying what happens after "Send invitations", and required fields have no marker.
- States: no-results is a generic "No data"; a failed list load is silent; the empty Admin permissions tab shows an empty table.

| # | Improvement | Hydra component that carries it | Screens |
|---|---|---|---|
| UX-1 | Page title "Users" above the card, card header shows the count ("47 users", sample consistent with 5 pages), same as Companies | Inherited page title, card header text | L-01, L-02, E-01, LO-01, ER-01 |
| UX-2 | Search placeholder "Search by name or email" (backend searches email, first and last name) | `Input__Search` | list screens |
| UX-3 | Row actions as labelled text actions "Manage feature access" and "Edit" in a last column headed "Actions", right-aligned (§7.2). Feature access column then shows only the "Custom rules applied" tag. Same treatment as Companies | `Table cell type=action`, `type=tag` + `Tag__Status warning` | L-01, L-02 |
| UX-4 | Super administrator row: Roles shows a "Super administrator" tag (source string `reasons.super_admin`) and the Actions cell stays empty, so the missing actions are explained | `Table cell type=tag` + `Tag` | L-01 |
| UX-5 | Role tags read "Company Owner · First Test Company" and "Global Administrator" (no trailing colon); show at most two tags and a "+2 more" tag for the rest (progressive disclosure, rows stay one line) | `Table cell type=tag` (`show tag`, `show tag 2`), `Tag__Colorful gold`, `Tag` | L-01, L-02 |
| UX-6 | User page header: title = full name, description = email, breadcrumb `Users / <Full name>`; tabs inside one card. Tab labels in sentence case ("Admin permissions", "Feature access") | Page title text, `Breadcrumb items=3`, `Tabs` | ED-*, E-02, LO-02, ER-02, S-01, S-02 |
| UX-7 | Basic information form per §8.3: First name and Last name required (`*`), Country required (`*`, `CountryRules`), Email disabled with helper "Email can't be changed here."; Company select prefilled with the company display name (not the slug) | `Input__Label required`, `Input state=disabled`, `Input__Caption default`, `Select` | ED-01, ED-02 |
| UX-8 | Permissions tabs: section headings "Company roles" / "Admin roles" and "Current permissions"; matrix cells show "Allowed" / "Not allowed" as a badge instead of a bare green tick or red cross (readable without colour, calmer than red for a normal state) | `Table cell type=badge` | ED-03, ED-04, S-02 |
| UX-9 | Failed list load gets the standard error Alert + Retry | `Alert error` + `Button default` | ER-01 |
| UX-10 | No-results and no-admin-role states use the Empty State Block: "No users found" / "Try another name or email, or clear the filters." + "Clear filters"; "No admin role yet" / "Choose an admin role above and save to give this user admin permissions." (no button, the form is right above, see Question 8) | `Empty State Block` | E-01, E-02 |
| UX-12 | Invite admins: page title above the card, one intro line "Existing users get the admin role right away. Everyone else gets an email invitation." (from the `assigned` / `invited` results), required markers on Email and Admin role, results shown under the form after sending | Page title text, `Input__Label required`, results table | CR-*, ER-03, S-03 |
| UX-13 (added at build, user request) | Roles cell = first role tag + one "+N" tag (antd `maxTagCount` pattern), "—" when no role, every row 54 high; hovering "+N" shows a Tooltip with all roles (frame 01.03). Rationale: no hidden or clipped roles, uniform row height, full list on hover. Replaces the "+N more" part of UX-5 | `Table cell type=tag` (tag 1 `Tag__Colorful gold`, tag 2 swapped to `Tag default`), `Table cell type=text`, `Tooltip placement=top` | L-01, L-02, L-03 |
| UX-11 (optional, off) | Ask before removing an admin role from a user ("Remove admin role?", danger "Remove"), because it cuts admin access at once | `Modal__Overlay` + `Modal__Confirmation`, primary `danger=true` | D-01 |

## Not seen live

LO-02 (user page loads too fast to catch), ER-01 (a failed list request cannot be forced), ER-02, ER-03, S-01, S-02, S-03 (need a real save or a sent invitation), ED-02 (would need clearing a saved field; error copy from `FirstNameRules`), the second invite row in CR-02 (needs "Add another invite"), D-01 (proposed). Designed from source strings and Hydra Spin, Alert, Message and Empty State Block. Not forced.

## Blocked (missing component, variant or variable)

**Nothing blocks the module.** Gaps (no token, component or variant will be created; each is handled by copy and adapt with bound containers, as in Companies). They need your OK where marked:

1. **Sidebar has no Feature Access Limit item** (known). Users can now be shown open with its two children, because Hydra `.menu__submenu` has `open=true` and `.menu__submenu_list` has `items=2` (found this run). Question 2.
2. **No table cell with icon-only buttons** (known). Text actions instead (UX-3).
3. **No table cell with an icon only** (check / cross). Default `type=badge` "Allowed" / "Not allowed" (UX-8). Question 5.
4. **Table cell `type=tag` holds two tags at most.** Covered by the "+N more" tag (UX-5). Question 6.
5. **No Select cell** (known from Companies). ED-05 reuses the Companies bound wrapper.
6. **No Card, page header or Form item component** (known). Inherited bound frames.
7. **No Transfer** (known). Not needed for Users.
8. Raw geometry kept as in Companies: table column widths and the 54-high tag cell (proposed widths Email 300, First name 170, Last name 170, Type 120, Roles fill, Feature access 190, Actions 260), frame and section canvas positions, Message and popover absolute positions.

## Protected, left as is

None known. `devStatus` cannot be read. The Users page holds only the placeholder section `2958:63298`, which is not touched. Companies frames are only cloned.

## Live app issues

| # | Issue | How seen |
|---|---|---|
| I-1 | Top bar reads "Hi Admin, Welcome to ." on every page. Kept as the copied frame shows. | Live |
| I-2 | Breadcrumbs: list `Users / List`, invite `Users / Invite admins`, user page shows only the user name (no way back to Users). Browser tab title on the user page is empty. | Live |
| I-3 | Opening a Users URL directly (list or user page) leaves the Users group collapsed with nothing selected. | Live |
| I-4 | Type filter options are a blank row and "true" instead of Admin and User (built from the raw `isAdmin` value). | Live and source |
| I-5 | Feature Access filter opens to "No filters" when no user has a custom rule (the filter is always shown). | Live |
| I-6 | Actions column has no header; actions are icon-only buttons (shield = Manage Feature Access, pencil = Edit); the Edit tooltip sits inside the button. The super administrator row shows no roles and no actions, with no explanation. | Live and source |
| I-7 | Role tags: admin roles end with " :" ("Global Administrator :") because the company is empty; company names are cut off ("First Test Compan"); a user with four roles gets a four-line row. | Live |
| I-8 | Basic information shows an empty "Company" select ("Select Company") for a user who belongs to First Test Company; on Permissions the same field shows the slug `first-test-company`, and the options list slugs. What the Company select changes on Basic information is not explained. | Live and source |
| I-9 | Permissions tab of an admin without a company showed an empty Company select and then a full permission matrix with admin modules, with no roles field; it is unclear which permissions it shows. | Live (once) |
| I-10 | Saving Company roles with every role removed does nothing and shows no message (`values.roleIds?.length` check). | Source only |
| I-11 | Form has no required markers; Email is disabled with no reason; the admin user's Country field showed as disabled. | Live |
| I-12 | A failed users list request leaves the table empty with no message. `failed-user-update` exists in the strings but is never shown. | Source only |
| I-13 | No-results shows a generic Ant "No data" with no Clear filters action; the search term is stored in the URL with quotes (`?s_query="zzzz"`). Live loading shows the Spin on top of "No data". | Live |
| I-14 | Changing your own roles reloads the whole app after one second ("The application will refresh to apply changes"). | Source only |
| I-15 | Feature module names are raw slugs (same as Companies I-5); the Actions header is left-aligned while the select sits right. | Live |
| I-16 | Invite admins: no sentence on what happens after sending; "Remove" is shown greyed out when there is only one row; required fields have no marker. | Live |
| I-17 | Row action wording differs from Companies once both are built: Users uses "Edit" (live tooltip and §7.2 verb), Companies uses "Manage company". See Question 3. | Standard |
| I-18 | The list shows real staff e-mail addresses in the dev environment; Figma uses fictional sample data instead (Question 1). | Live |

## Questions (with the default I would pick)

1. **Sample data.** The live list holds real staff names and e-mails. **Default: fictional people on `example.com`** (e.g. "Anna Kovac, anna.kovac@example.com"), keeping the real role and company names (First Test Company, ASC-ES). Alternative: copy the live rows.
2. **Sidebar.** **Default: Users group open (`.menu__submenu open=true` + `.menu__submenu_list items=2`), child "List" selected on list and user-page screens, "Invite admins" selected on Invite admins screens, parent `child selected=true`; icon recipe on every item including the two children.** This differs from the Companies frames, where Users is collapsed. Alternative: collapsed Users with Users selected (simpler, less live-like).
3. **Row actions.** **Default: text actions "Manage feature access" and "Edit", header "Actions", right-aligned (UX-3).** Companies uses "Manage company" for the same kind of action; default leaves Companies as built and logs it (I-17). Alternative: rename Companies to "Edit" in a later fix pass.
4. **Where the user-page tabs go.** **Default: all four tabs in `03 · Edit`** (they are one page with one URL). Alternative: Feature access in a `Detail` section, as Companies did for its separate Feature Access page.
5. **Permission matrix cells.** **Default: `Table cell type=badge` "Allowed" / "Not allowed" (UX-8).** Alternative: a bound wrapper cell with Hydra `CheckCircleOutlined` / `CloseOutlined` icons coloured `colorSuccess` / `colorError` (live look, one more hand-built wrapper).
6. **Roles with more than two tags.** **Default: first two tags + "+N more" (UX-5).** Alternative: all tags stacked (taller rows, needs stacked cell wrappers).
7. **Company select on Basic information.** **Default: keep it, prefilled with the company display name, no helper text** (its purpose is unclear in the source; I-8 asks dev). Alternative: hide it in Figma (not allowed without your OK, it is a live field).
8. **E-02 empty Admin permissions.** The pattern says one action, but the action (Admin roles select + Save changes) is right above. **Default: Empty State Block with both actions off.** Alternative: primary action "Choose admin role" that only focuses the select.
9. **How many frames?** **Default: lean set of 19.** Add L-03, ED-06, LO-03, ER-04 and D-01 for 24.
10. **Invite admins intro line (UX-12).** The sentence is inferred from the result statuses. **Default: include it.** Alternative: no intro line.
11. **Long tables in a 970-high frame.** Current permissions has 17 (company) and 25 (admin) rows, Feature access 29. **Default: 1750 x 970 showing the first rows**, as Companies did; the plan notes that the list continues.
12. **"Remove" in invite rows.** §7.2 asks for small default danger buttons in table rows, but these are form rows next to medium inputs. **Default: keep the live `Button type=text, danger=true`, medium, disabled when only one row.** Alternative: `type=default, danger=true`, medium.

## Ledger

`Documentation/admin-figma-ledger.json`: `modules.Users.status = "built"` on 2026-10-30, with the 19 frame IDs.

## Audit decisions (2026-10-30)

Decisions on `2026-10-30-admin-figma-users-audit.md`, applied in the fix pass:

- **U-A-01:** pagination stays a DS gap (ledger `dsGaps` only).
- **U-A-05, 29, 37, 58, 62:** match Companies. Breadcrumb starts with the HomeOutlined icon; loading and error cards hug, with a centred state frame (Alert 640, Retry centred). The trash-icon reset and the 24 form rhythm already matched.
- **U-A-06:** Super administrator Actions cell shows "—" in colorTextDescription.
- **U-A-07:** one primary "Invite admins" (`Button size=large`, no icon) in the page header of every list frame.
- **U-A-17:** Remove shows only when there are two or more invite rows.
- **U-A-35:** edit loading keeps the tabs; the Spin sits only in the content area.
- **U-A-40:** "Failed to update user. Try again."
- **U-A-57:** "Users list" as the card title while loading or failed.
- **U-A-61:** "Send invitations" has no icon.

## Build outcome (2026-10-30)

All 19 lean screens are built, plus L-03 (`3045:8564`), the UX-13 Tooltip reveal state. ED-06, LO-03, ER-04, D-01 and UX-11 were not built. The placeholder `2958:63298` was not moved, and no existing screen was edited.

Every frame is 1750 wide and hugs its content height, with a minimum of 970. The Sidebar and the content background stretch to the full height. ED-03 and S-02 grew to 1020 because the permissions matrix had clipped the bottom of the card.

Long tables show the first rows only: company permissions (6 of 17 modules), admin permissions (6 of 25) and feature access (8 of 29).

| Screen | Node | Outcome |
|---|---|---|
| L-01 | `3043:15814` | Built. UX-13 Roles cell (first role + "+N", "—" for no role), every row 54. |
| L-02 | `3043:17188` | Built. Roles filter lists Company Member and Company Owner (the filter has two slots). |
| L-03 | `3045:8564` | Built. Tooltip over "+N" lists every role. |
| CR-01 | `3043:17848` | Built. One invite row, Remove disabled. |
| CR-02 | `3043:18181` | Built. Invalid email on the first row. |
| ED-01 | `3044:1728` | Built. Email helper "Email can't be changed here." |
| ED-02 | `3044:2555` | Built. First name required. |
| ED-03 | `3044:4365` | Built. Save sits under Company roles, before the read-only matrix. Roles select uses the multiple type. |
| ED-04 | `3045:2508` | Built. Same Save order. Admin roles select uses the multiple type. |
| ED-05 | `3045:4308` | Built. Revit Plugin is Disabled and carries the reset (trash) button. |
| E-01 | `3045:5492` | Built. Search `zzzz`, Clear filters. |
| E-02 | `3045:5825` | Built. Mark Ellison, no admin role. |
| LO-01 | `3045:6141` | Built. Card title "Users list" while the count is unknown. |
| LO-02 | `3045:6425` | Built. Breadcrumb "Loading…". |
| ER-01 | `3045:6643` | Built. Card title "Users list", Alert plus Retry. |
| ER-02 | `3045:6933` | Built. Message "Failed to update user", Email helper. |
| ER-03 | `3045:6970` | Built. Message "Unable to process invitations. Try again or contact support." |
| S-01 | `3045:7445` | Built. Message "User updated successfully", Email helper. |
| S-02 | `3045:7482` | Built. Message "User permissions updated successfully". |
| S-03 | `3045:7584` | Built. Results: Assigned, Invited, Skipped. |

DS gaps kept in the build: the multiple type of `.select_input` shows the value as plain text with no tag chips. The pagination shows one page item with "10 / page" and "Total 47 items".
