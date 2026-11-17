# Table cell patterns audit, 13 November 2026

Read-only audit of how table cells show values across the Hydra module files: plain text, status badge, tone tag, colorful tag or neutral tag. Nothing was changed in Figma.

Rules checked:

- `.cursor/rules/table-tags-badges.mdc` (which value gets which treatment, Type colors)
- `.cursor/rules/content-file-type-tags.mdc` (file type colors, now in Hydra DS, Tag page, Patterns)
- UX-008 Status column placement
- UX-011 Counts and match quality in tables

## Scope

| Module | File key | Pages covered | Tables found |
|---|---|---|---|
| Admin - RSFC | `rONB8aMPanOjS3GC1uN16d` | Dashboard, Release Notes, Access Blacklist, Knowledge Center, Content, Companies, Users, Company Roles, Admin Roles, Feature Access Limit | Yes |
| Content - RSFC | `pGzqSs0fMmuQ2BtjbMNVjP` | Content Download History | Yes |
| Part Search - RSFC | `fyhH2NtH20puYbGLDChPwn` | Part Listing Flow, Category Page | Yes (variant modal) |
| Unified Search - RSFC | `usBJj4PPK8naOgJdi31Lgt` | Part Detail Flow, Cross-module Guidance, Banners, Global Notifications | Yes (guidance screens) |
| SPEC - RSFC | `KmU1mTvL7D1fLZvJ8SIGTN` | SPEC Flows, Category tags and usage | Yes |
| BOM - RSFC | `Ht3Up5MlRAKjK7eCuAy05L` | BOM Flows, BOM Warnings & Errors (BOM-356) | Yes |
| Release Notes - RSFC | `a4gviD5oViRhasSCN6cC8Z` | Release Notes Flow | No real tables (the modal "Details" only) |

Skipped pages: Cover, Change Log, Archive, Draft, Local Components, Cheat Sheet, separators.

Method: node data read with the official Figma MCP (Desktop Bridge was not connected). Each table column was read for its header and the component in each cell. No screenshots were taken, so a visual check is still useful before fixing.

## Summary

| Module | To fix | Needs decision | Already correct |
|---|---|---|---|
| Admin | 1 | 4 | Type columns, Roles, Categories, statuses, status placement |
| Content | 2 | 0 | |
| Part Search | 0 | 1 | Drawings column colors |
| Unified Search | 1 | 0 | Status badges |
| SPEC | 1 | 1 | Status placement |
| BOM | 0 | 5 | Match quality tags, Hub status placement |
| Release Notes | 0 | 0 | No tables |
| **Total** | **5** | **11** | |

## To fix

### ADM-TAGS-001 File type colors in CFM

- File: Admin - RSFC, page Content
- Screens: "CFM — Admin · Figure result" [2009:5440](https://www.figma.com/design/rONB8aMPanOjS3GC1uN16d/?node-id=2009-5440), [2116:40536](https://www.figma.com/design/rONB8aMPanOjS3GC1uN16d/?node-id=2116-40536), "Figure number expanded row" [2009:5608](https://www.figma.com/design/rONB8aMPanOjS3GC1uN16d/?node-id=2009-5608), "Figure Manage menu" [2116:41888](https://www.figma.com/design/rONB8aMPanOjS3GC1uN16d/?node-id=2116-41888), "SKU Manage menu" [2126:43358](https://www.figma.com/design/rONB8aMPanOjS3GC1uN16d/?node-id=2126-43358), "Edge case — 86 SKU files" [2239:7714](https://www.figma.com/design/rONB8aMPanOjS3GC1uN16d/?node-id=2239-7714) and about 14 more "File table" screens
- Column: "Format" in "File table", and file rows inside "SKU table"
- Now: RFA purple, DWG green, IGES gold, STEP blue, PDF cyan
- Should be: RFA blue, DWG orange, IGES magenta, STEP geekblue, PDF cyan
- The newer screens "01 · CFM — Admin · Figure result · Manage menu" [2435:8159](https://www.figma.com/design/rONB8aMPanOjS3GC1uN16d/?node-id=2435-8159), 2443:44478 and 2456:65651 already use RFA blue.

### CON-TAGS-001 File type colors in Download History

- File: Content - RSFC, page Content Download History
- Screens: "Content · History" [5289:21286](https://www.figma.com/design/pGzqSs0fMmuQ2BtjbMNVjP/?node-id=5289-21286), "Content · Checked rows" [9018:1693](https://www.figma.com/design/pGzqSs0fMmuQ2BtjbMNVjP/?node-id=9018-1693), "Content · Submittal" [9030:7076](https://www.figma.com/design/pGzqSs0fMmuQ2BtjbMNVjP/?node-id=9030-7076), 1 more
- Column: "Formats"
- Now: every format is blue (RFA, TXT, DWG, PDF)
- Should be: RFA blue, TXT gold, DWG orange, PDF cyan

### CON-UX011-001 Count shown as a tag

- Same screens as CON-TAGS-001
- Column: "Downloaded"
- Now: neutral `Tag` "x3" (border off) next to the date
- Should be: plain text, for example "3 times"

### US-TAGS-001 "New" marker uses an old colorful tag

- File: Unified Search - RSFC, page Cross-module Guidance
- Screens: "1.2 — BOM hub · L2 project guidance" [412:9109](https://www.figma.com/design/usBJj4PPK8naOgJdi31Lgt/?node-id=412-9109), "1.3 — BOM workspace · New item guidance" [427:18520](https://www.figma.com/design/usBJj4PPK8naOgJdi31Lgt/?node-id=427-18520)
- Now: `Tag__Colorful` "New", color "daybreak blue", border off. That variant does not exist in Hydra DS.
- Should be: DS `Tag`, type=new

### SPEC-STAT-001 "Processing" has a different color than in Admin

- File: SPEC - RSFC, page SPEC Flows
- Screens: "01 — Project SPEC list" [8023:33296](https://www.figma.com/design/KmU1mTvL7D1fLZvJ8SIGTN/?node-id=8023-33296), "Bulk actions" [8475:8201](https://www.figma.com/design/KmU1mTvL7D1fLZvJ8SIGTN/?node-id=8475-8201), "02 — Upload SPEC" screens [8028:37307](https://www.figma.com/design/KmU1mTvL7D1fLZvJ8SIGTN/?node-id=8028-37307) and 7 more
- Column: "Status"
- Now: "Processing" = warning
- Should be: processing, like "Processing" in Admin "1 · Lead Time Uploader" [2504:21949](https://www.figma.com/design/rONB8aMPanOjS3GC1uN16d/?node-id=2504-21949)

## Needs decision

| ID | Where | What we found | Question |
|---|---|---|---|
| ADM-TAGS-002 | Admin, "CFM — Admin · Receipts populated" [2016:16352](https://www.figma.com/design/rONB8aMPanOjS3GC1uN16d/?node-id=2016-16352), "Rollback confirmation" [2016:28234](https://www.figma.com/design/rONB8aMPanOjS3GC1uN16d/?node-id=2016-28234), column "Format" | Plain text "DWG" | Should log tables also use file type tags? |
| ADM-TAGS-003 | Same screens, column "Action" | `Tag__Colorful` "REPLACE GLOBAL" blue, "DELETE GLOBAL" volcano, in capitals | Is this a Type column (colorful tags allowed) or plain text? |
| ADM-TAGS-004 | Admin CFM "SKU table", for example [2009:5440](https://www.figma.com/design/rONB8aMPanOjS3GC1uN16d/?node-id=2009-5440), [2435:8159](https://www.figma.com/design/rONB8aMPanOjS3GC1uN16d/?node-id=2435-8159), column "Download" / "Files" | Neutral `Tag` "No file" | Empty value as a tag, or plain text? |
| ADM-STAT-001 | Admin, "01.01 · Companies · List · Default" [3020:3683](https://www.figma.com/design/rONB8aMPanOjS3GC1uN16d/?node-id=3020-3683), column "Feature Access" | `Badge__Status` "Custom rules applied" (warning) on 2 rows, plain text on the rest; column is 6th | Is this a status column? If yes, every row needs a badge and the column moves next to "Name" (UX-008). |
| PS-TAGS-001 | Part Search, "01 — Part listing · Select variants for DWG download" [11059:24699](https://www.figma.com/design/fyhH2NtH20puYbGLDChPwn/?node-id=11059-24699), "... for STEP download" [11024:17271](https://www.figma.com/design/fyhH2NtH20puYbGLDChPwn/?node-id=11024-17271), column "Drawings" | `Tag__Status` "DWG unavailable" / "STEP unavailable", error | How does an unavailable file type look? Red tone tag, or the file type tag plus plain text? |
| BOM-UX011-001 | BOM-356, "01 · Aggregate warnings · Can continue" [6705:9](https://www.figma.com/design/Ht3Up5MlRAKjK7eCuAy05L/?node-id=6705-9), [6705:165](https://www.figma.com/design/Ht3Up5MlRAKjK7eCuAy05L/?node-id=6705-165), [6730:28357](https://www.figma.com/design/Ht3Up5MlRAKjK7eCuAy05L/?node-id=6730-28357), [6760:28608](https://www.figma.com/design/Ht3Up5MlRAKjK7eCuAy05L/?node-id=6760-28608), column "Qty" | Neutral `Tag` "Assumed 1" | A count with a warning. Plain text plus a warning tone tag, or keep the tag? |
| BOM-STAT-001 | BOM-356, "02 · Mixed issues · Review or continue" [6705:165](https://www.figma.com/design/Ht3Up5MlRAKjK7eCuAy05L/?node-id=6705-165), "06 · Issue filter active" [6760:28608](https://www.figma.com/design/Ht3Up5MlRAKjK7eCuAy05L/?node-id=6760-28608), column "UPC" | "Partial UPC" is warning on one row and error on another in the same column | Two different meanings need two labels, or one color. Also: is UPC a status (`Badge__Status`) or data quality (`Tag__Status`, UX-011)? |
| BOM-STAT-002 | BOM-356 screens, for example "05 · Optional · Explicit skip confirmation" [6574:25980](https://www.figma.com/design/Ht3Up5MlRAKjK7eCuAy05L/?node-id=6574-25980), "01 · Warning · Partial UPC" [6574:22492](https://www.figma.com/design/Ht3Up5MlRAKjK7eCuAy05L/?node-id=6574-22492), BOM Hub [5289:21286](https://www.figma.com/design/Ht3Up5MlRAKjK7eCuAy05L/?node-id=5289-21286) | Same meaning, different labels: "Cannot match" and "Won't match"; "Partial", "Partial UPC" and "Incomplete"; "Needs Review" and "Needs review" | Pick one label for each. |
| BOM-STAT-003 | BOM Flows, "1.1 — Hub · Project List" [5289:21286](https://www.figma.com/design/Ht3Up5MlRAKjK7eCuAy05L/?node-id=5289-21286) vs "1.3 — Hub · Bulk selection" [5289:21783](https://www.figma.com/design/Ht3Up5MlRAKjK7eCuAy05L/?node-id=5289-21783) and "1.4 — Hub · Delete confirmation" [5289:22269](https://www.figma.com/design/Ht3Up5MlRAKjK7eCuAy05L/?node-id=5289-22269), column "Status" | 1.1 has Needs Review / Ready. 1.3 and 1.4 add Confirmed, Pending, Matched, which are row statuses, not project statuses. | Which statuses can a BOM project have? |
| BOM-UX008-001 | BOM Flows, "2.15 — Matching results · Table" [5585:299503](https://www.figma.com/design/Ht3Up5MlRAKjK7eCuAy05L/?node-id=5585-299503), "2.15.1 — Bulk" [5818:48665](https://www.figma.com/design/Ht3Up5MlRAKjK7eCuAy05L/?node-id=5818-48665), "2.16", "2.17" | Order: # / Original part / Our Part / Status | Do "Original part" and "Our Part" together count as the name? If not, Status moves after "Original part". |
| SPEC-STAT-002 | SPEC, "01 — Project SPEC list" [8023:33296](https://www.figma.com/design/KmU1mTvL7D1fLZvJ8SIGTN/?node-id=8023-33296), column "Status" | "Ready to review" and "Review complete" are both success | "Ready to review" is not finished yet. Should it be processing or default? |

## Already correct

- **Type columns**, one fixed color per value, border on:
  - Users "Type": Admin volcano, User blue ([3043:15814](https://www.figma.com/design/rONB8aMPanOjS3GC1uN16d/?node-id=3043-15814))
  - Company Roles "Type": System geekblue, Custom gold
  - Admin Roles "System Role": System geekblue
  - Access Blacklist "Type": Domain purple, Email cyan
  - Release Notes "Type": Feature green, Improvement blue, Fix orange
- **Neutral tags:** Users "Roles" (with "+1", "+2" overflow), Knowledge Center "Categories".
- **Record statuses use `Badge__Status`:** Release Notes, Data Feeds, Lead Time Uploader, Feature access (Users, Companies, Feature Access Limit), Permissions (Allowed / Not allowed), SPEC list, BOM Hub, BOM-356, Matching results, CFM Receipts.
- **Status right after the name (UX-008):** Release Notes, Data Feeds, Feature access tables, SPEC list, BOM Hub, BOM-356 parsing and aggregate tables, Unified Search guidance.
- **Allowed exceptions (UX-008):** Lead Time Uploader and CFM Receipts are logs where time is the identity.
- **Match quality uses `Tag__Status` (UX-011):** BOM "Quality" (High success, Medium warning, Low error), "Match score" (High · 94% success, Medium · 78% warning, Added manually processing).
- **Plain text:** counts ("2 users", "142", "24 permissions"), dates, Data Feeds "Format" (CSV / JSON / XML), Release Notes "New" (Yes / No).
- **Part Search "Drawings" column:** PDF cyan.

## Status labels found today

| `Badge__Status` state | Labels |
|---|---|
| success | Published, Active, Enabled, Allowed, Success, Ready, Confirmed, Chosen, Review complete, Ready to review (see SPEC-STAT-002) |
| processing | In review, Processing (Admin), Matched |
| warning | Needs review, Skipped, Can match, Warning, Custom rules applied, Partial, Partial UPC (see BOM-STAT-001), Processing (SPEC, see SPEC-STAT-001) |
| error | Error, Analysis failed, Cannot match, Won't match, Incomplete, Partial UPC (see BOM-STAT-001) |
| default | Draft, Paused, Disabled, Not allowed, Pending |

## Outside these rules (for the DS compliance check)

- Part Search variant modal: "MPN / SKU" and "Drawings" cells are local frames named "Table / Table cell" instead of DS instances. "Drawings cell" as a local frame is allowed by `content-file-type-tags.mdc`. "MPN / SKU" is not.
- Admin "Users · Edit user · Feature access" [3045:4308](https://www.figma.com/design/rONB8aMPanOjS3GC1uN16d/?node-id=3045-4308), Companies "Feature Access Control" [3022:990](https://www.figma.com/design/rONB8aMPanOjS3GC1uN16d/?node-id=3022-990) and "Feature Access Limit" [3083:3582](https://www.figma.com/design/rONB8aMPanOjS3GC1uN16d/?node-id=3083-3582): the "Actions" column shows plain text "Enabled" / "Disabled" instead of an action.
- BOM "1.4 — Hub · Delete confirmation" [5289:22269](https://www.figma.com/design/Ht3Up5MlRAKjK7eCuAy05L/?node-id=5289-22269): the first column header says "Part number" but the cells are project names.
