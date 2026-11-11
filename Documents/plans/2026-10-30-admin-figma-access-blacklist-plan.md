# Admin module plan — Access Blacklist

Status: **built on 2026-10-30**. The coordinator relayed the go-ahead ("If needed, copy some screen, and do changes there where it needs") and resolved the open questions with defaults (listed under Decisions). The user then asked for a live check in Chrome, which was done before finishing the build.

## Target

- **File:** Admin - RSFC (`rONB8aMPanOjS3GC1uN16d`)
- **Page:** `Access Blacklist` (`2958:63285`): https://www.figma.com/design/rONB8aMPanOjS3GC1uN16d/Admin---RSFC?node-id=2958-63285. **Pending LAYOUT approval.**
- **Sections used:** `01 · List` (`3001:42`), `02 · Create` (`3001:43`), `03 · Dialogs` (`3001:44`), `04 · Empty` (`3001:45`), `05 · Loading` (`3001:46`), `06 · Error` (`3001:47`), `07 · Success` (`3001:48`). The module has no Detail or Edit screen.
- **Frame size:** 1750 × 970, same as Knowledge Center.
- **Base (copy-and-adapt):** every screen started as a copy of KC `01.01 · Manual Files · Default` (`2803:18583`). Dialogs also copied the KC `Modal__Overlay` from `02.09 · Edit Recipients` (`2885:7599`). Originals were not edited.
- **Placeholder section** `Access Blacklist · To design` (`2958:63294`) was left in place.

## Screens

Live status uses the 30 Oct Chrome walk (signed-in session; nothing saved or removed).

| # | Screen | Route | Section | State | Action | Live | Outcome | Figma link |
|---|---|---|---|---|---|---|---|---|
| L-01 | List | /access-blacklist | List | 3 entries | New | Seen live | Built | https://www.figma.com/design/rONB8aMPanOjS3GC1uN16d/Admin---RSFC?node-id=3001-49 |
| L-02 | List · Type filter open | /access-blacklist | List | — | — | — | Skipped (coordinator default 8) | — |
| C-01 | Add blacklist entry | modal | Create | Default (Domain, Undisclosed) | New | Seen live | Built | https://www.figma.com/design/rONB8aMPanOjS3GC1uN16d/Admin---RSFC?node-id=3006-4428 |
| C-02 | Add blacklist entry · Invalid value | modal | Create | Domain, "not a domain", field error | New | Seen live | Built | https://www.figma.com/design/rONB8aMPanOjS3GC1uN16d/Admin---RSFC?node-id=3005-2662 |
| C-03 | Add blacklist entry · Save failed | modal | Create | Error alert | New | Not seen live (state not reachable without changing data) | Built | https://www.figma.com/design/rONB8aMPanOjS3GC1uN16d/Admin---RSFC?node-id=3005-3120 |
| D-01 | Remove blacklist entry · Confirm | modal | Dialogs | Default | New | Seen live | Built | https://www.figma.com/design/rONB8aMPanOjS3GC1uN16d/Admin---RSFC?node-id=3005-3188 |
| D-02 | Remove blacklist entry · Remove failed | modal | Dialogs | Error alert | New | Not seen live (state not reachable without changing data) | Built | https://www.figma.com/design/rONB8aMPanOjS3GC1uN16d/Admin---RSFC?node-id=3005-3256 |
| E-01 | Empty · No entries yet | /access-blacklist | Empty | 0 entries, no filters | New | Not seen live (state not reachable without changing data) | Built | https://www.figma.com/design/rONB8aMPanOjS3GC1uN16d/Admin---RSFC?node-id=3005-3324 |
| E-02 | Empty · No matching entries | /access-blacklist | Empty | Search active, 0 results | New | Seen live | Built | https://www.figma.com/design/rONB8aMPanOjS3GC1uN16d/Admin---RSFC?node-id=3005-3377 |
| LO-01 | Loading · First load | /access-blacklist | Loading | Card skeleton | New | Seen live (briefly, on page load) | Built | https://www.figma.com/design/rONB8aMPanOjS3GC1uN16d/Admin---RSFC?node-id=3005-3430 |
| ER-01 | Error · List failed to load | /access-blacklist | Error | Message + Try again | New | Not seen live (state not reachable without changing data) | Built | https://www.figma.com/design/rONB8aMPanOjS3GC1uN16d/Admin---RSFC?node-id=3005-3483 |
| S-01 | Success · Entry added | /access-blacklist | Success | 4 entries + success message | New | Not seen live (state not reachable without changing data) | Built | https://www.figma.com/design/rONB8aMPanOjS3GC1uN16d/Admin---RSFC?node-id=3005-3536 |
| S-02 | Success · Entry removed | /access-blacklist | Success | 2 entries + success message | New | Not seen live (state not reachable without changing data) | Built | https://www.figma.com/design/rONB8aMPanOjS3GC1uN16d/Admin---RSFC?node-id=3005-3589 |

**Count:** 12 built, 1 skipped, 0 moved, 0 blocked.

## Live comparison (30 Oct, Chrome)

Matches live: count title in the card header, search with a search button, "All types" select, primary add button with a plus icon, six columns (Type, Value, Reason, Notes, Added on, Actions), Domain tag blue and Email tag gold, bold Value, red "Remove" link, pagination "1" with "20 / page", the Add dialog fields and defaults, the domain validation message, the Remove dialog copy with Cancel and a red Remove, and the filtered empty state "No entries match your filters".

Intentional differences:
- UX improvements (below): page title, search placeholder, required markers, "(optional)" on Notes, entry name in the Remove title, and buttons in the empty states.
- "Add entry" casing everywhere (live list button says "Add Entry").
- The live list contains a personal Gmail address; Figma uses `user@competitor.com` instead. The other two sample rows (`yahoo.mail`, `blobapps.com`) match live.
- Loading and Error frames hide the count title, because live shows a misleading "0 blacklist entries" while loading.

Known visual gaps (Hydra limits, not fixed with raw values):
- The sidebar has no Feature Access Limit item, and no chevrons on Companies / Company Roles / Admin Roles (DS gap).
- The type filter Select keeps the Hydra default width (320); live is 140.
- Header labels for Type, Added on and Actions are left-aligned in the Hydra header cell; live centers them.
- The Hydra Modal is 538 wide; live is 520.
- Live shows the first item of the breadcrumb as a home icon and the current page in link blue; the Hydra Breadcrumb `items=2` renders the current page in default text colour.

## Hydra components used

Sidebar, Topbar, Breadcrumb (`items=2`), Input__Search (`type=icon`, mic icon hidden), Select, Button (primary / default / link-style action text, danger primary in Remove), Table / Table Item / Header Item, Table / Table cell (`type=text`, `type=tag` with Tag__Colorful blue / gold, `type=action`), Pagination (`type=changer`), Modal__Overlay + Modal (slot), Input__Label, Input, Input__TextArea, Input__Caption (`status=error`), Alert (`type=error`), Empty (`type=basic`), Skeleton (`type=basic`), Message (`type=success`), PlusOutlined.

Variables bound on new or rebound containers: `Size/Padding/paddingSM`, `paddingLG`, `paddingMD`, `paddingXS`, `paddingXXL`, `Style/lineWidth`, `Color/Neutral/Borders/colorBorderSecondary`, `Color/Neutral/Text/colorText`, `colorTextHeading`, `colorTextPlaceholder`, `Color/Error/colorErrorText`. Text styles: `Title/Heading 5`, `Base/Normal`, `Base/Medium`, and the inherited KC `Title/Heading 4` page title.

## UX improvements

| # | Improvement | Status | Hydra component |
|---|---|---|---|
| UX-1 | "Add entry" (primary) in the first-use empty state | Built (E-01) | Empty + Button |
| UX-2 | "Clear filters" in the no-results state | Built (E-02) | Empty + Button (default) |
| UX-3 | Search placeholder "Search domain or email" | Built (all list frames) | Input__Search |
| UX-4 | Required markers; "Notes (optional)" | Built (C-01..C-03) | Input__Label (`required`) |
| UX-5 | Type as visible options | Skipped (Type stays a Select) | — |
| UX-6 | Page title "Access Blacklist" above the card | Built (all frames) | Inherited KC page-title text, `Title/Heading 4` |
| UX-7 | Remove dialog title names the entry: Remove "yahoo.mail"? | Built (D-01, D-02) | Modal title |

## Not seen live

C-03, D-02, E-01, ER-01, S-01 and S-02 could not be reached without saving, removing or breaking data. They were designed from the source code copy and Hydra Alert, Empty and Message.

## Blocked

None. DS gaps logged, not blocking:
- Sidebar has no Feature Access Limit slot (master has 9 slots and no component properties).
- No plain titled Card component. The card is the KC hand-built `Table card` frame, with a new `Card header` and `Card body` bound to Hydra variables.

## Raw geometry kept (no Hydra variable exists)

- Table column widths taken from the product source: Type 120, Reason 180, Added on 140, Actions 110 (Value and Notes fill).
- Type tag cells fixed at 54 high to match the other Hydra table cells (the Hydra `type=tag` cell is 56), as KC already does.
- Success message overlay position inside the frame (centred, 16 from the top).
- Frame and section canvas positions.

## Protected, left as is

No Ready for Dev or Completed node was touched. `devStatus` could not be read (Plugin API: not supported; figma-console REST: 403 invalid token). KC source frames `2803:18583` and `2885:7487` were cloned only.

## Live app issues

| # | Issue | Seen live? |
|---|---|---|
| I-1 | Top bar reads "Hi Admin, Welcome to ." (no product name). While the page loads it reads "Hi User, Welcome to .". | Yes, 30 Oct |
| I-2 | Card title shows "0 blacklist entries" during first load (and on load error), before the real count arrives. The source also gives "1 blacklist entries" for a single entry. | Loading: yes. Singular: source only |
| I-3 | Reason label "System Abusage" is not a word; "Not Showing Up" and "Undisclosed" are unclear. Kept exactly as live in Figma (coordinator default 5). | Yes |
| I-4 | Casing differs: list button "Add Entry", dialog button "Add entry". | Yes |
| I-5 | The Remove confirmation opens without the dimmed backdrop that the Add dialog has. | Yes |
| I-6 | The dev data contains a real-looking personal Gmail address as a blacklist entry. Not copied into Figma. | Yes |
| I-7 | Type tag colours and the red Remove link are hard-coded hex values in SCSS. | Source only |

## Decisions (coordinator defaults, not confirmed by the user one by one)

1. Build from source plus live check (the user later allowed Chrome; walk done).
2. Access Blacklist page only; no LAYOUT run.
3. Canvas gaps between frames match KC; no spacing variable.
4. UX-1, 2, 3, 4, 6, 7 built; UX-5 skipped; "Add entry" casing everywhere.
5. Reason labels kept as live, including "System Abusage".
6. List count "3 blacklist entries".
7. Top bar kept as the KC copy shows ("Hi Admin, Welcome to ."), no invented product name.
8. L-02 skipped; both success frames built (12 frames).
9. Placeholder section left in place; new sections created next to it.
10. Ready for Dev status unknown; copying only, so not blocking.
