# Admin module layout

Same grammar on every module page. Sidebar order below is the page order.

## Pages

1. Dashboard
2. Release Notes
3. Access Blacklist
4. Knowledge Center — Manual Files, Data Feeds, Activity Log
5. Content — Featured Parts, Content File Manager, Lead Time
6. Companies
7. Users — list, Invite admins
8. Roles
9. Admin Roles
10. Feature Access Limit

Source: `apps/on-hydra-admin-frontend/src/modules/app/router/constants/navigation.tsx` in `ooden-tech/on-hydra-app`. Re-read that file each run. This list is the last known order, not a frozen API.

## Sections, top to bottom

Use these names, in this order, on every page. Omit a section the module does not have. Never reorder for one module.

1. List
2. Detail
3. Create
4. Edit
5. Dialogs
6. Empty
7. Loading
8. Error
9. Success

Inside a section, frames sit on one row: default first, then the other states of that same screen.

The gap between sections and the gap between frames in a row must be an existing Hydra spacing variable. If none fits, ask. Do not type a pixel value.

## What “important screens” means

For the module in this run, include:

- the default screen
- create and edit, when the module has them
- the dialog that confirms a destructive action
- empty, loading, and error, when the product has them

Skip settings buried three clicks deep unless the user adds them. When a screen is borderline, ask before drawing it.
