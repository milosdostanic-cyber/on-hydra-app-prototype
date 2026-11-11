# Jira task draft — Admin Figma audit follow-up

- **Project:** UATL (to confirm)
- **Type:** Task
- **Assignee:** Milos Dostanic
- **Labels:** `design`, `admin`, `figma-audit`

---

## Summary

Admin Figma: organize by sidebar module and close design gaps from the audit

## Description

### Context

The Admin Figma file was audited against the live Admin (`admin.hydra-dev.spaceinch.tech`) on 28 Oct 2026. It covered 10 sidebar modules and 45 screens or features:

- ✅ Done: 4
- ❌ Missing: 15
- 🟡 Needs changes: 9
- 🔍 Double-check: 17

Full checklist with Figma links: https://claude.ai/artifact/H6myNGmUXjNhociU9i7vPF
Figma file: https://www.figma.com/design/rONB8aMPanOjS3GC1uN16d/Admin---RSFC

### 1. Reorganize the file (one page per sidebar module)

- [ ] Create pages in live sidebar order: Dashboard · Release Notes · Access Blacklist · Knowledge Center · Content · Companies · Users · Company Roles · Admin Roles · Feature Access Limit
- [ ] Move the Dashboard frame off the Content File Manager page onto Dashboard
- [ ] Rename "🚧 Content File Manager" to Content, with sections Featured Parts · Content File Manager (+ CON-231) · Lead Time Uploader
- [ ] Rename "🚧 Release Notes Manager" to Release Notes
- [ ] Move Lead Time step 3 ("3 · Import Lead Time File") from Draft back into the LEAD TIME Import section
- [ ] Create a 🗄 Archive page and move the Draft copy of CFM, the Cover backup section and the empty ADMIN FLOWS page into it (nothing deleted)

### 2. Unify the shell

- [ ] Use one library Sidebar instance on every frame, with the 10 live items, including Feature Access Limit
- [ ] Replace the hand-built `Sidebar_new` in Release Notes
- [ ] Swap the old ASC-ES header and breadcrumb to the Admin | RSFC version (Release Notes, CFM, Lead Time, Dashboard)
- [ ] Report the live bug "Hi Admin, Welcome to ." (missing product name) to dev

### 3. Design the missing modules

- [ ] Access Blacklist: list, Add entry dialog, empty state, Remove confirmation
- [ ] Companies: list, Company Settings, Feature Access
- [ ] Company Roles: list, Create role, Update role (read-only system role), Delete confirmation
- [ ] Admin Roles: list, Create / Update role
- [ ] Users: list, Edit user (4 tabs), Invite admins
- [ ] Feature Access Limit: default limits table, custom rules detail
- [ ] Featured Parts: list, search result, 30/30 limit reached (first look for an existing design in another file)

### 4. Fix existing screens

- [ ] Dashboard: add the Filters card (reporting window, presets, scope) and Export Users CSV; rebuild KPI cards from library components; fix the breadcrumb
- [ ] Release Notes list: add the Published Date column
- [ ] Lead Time Uploader: align summary labels with the live app, or confirm the Figma version is intended
- [ ] CFM Receipts empty / populated / Rollback: apply Hydra text styles and bind colors to tokens
- [ ] Lead Time Uploader and RN Bulk upload: bind hard-coded colors to tokens
- [ ] Remove the duplicate CFM "Figure result" frame
- [ ] Knowledge Center Manual Files: decide whether row actions follow the live app or the Figma proposal

### 5. Verify in the dev app (no saving)

- [ ] Walk through the 17 🔍 items (dialogs, empty / loading / error states, publish and import flows) and compare each with its Figma frame
- [ ] Check the Hydra library for a Transfer component before designing role permissions; log it as a library gap if missing

### Acceptance criteria

- Every live sidebar module has its own Figma page, in sidebar order
- Every live screen has a Figma frame built from Hydra library components and tokens
- All frames use the same sidebar and header as the live app
- Audit checklist updated with final statuses
