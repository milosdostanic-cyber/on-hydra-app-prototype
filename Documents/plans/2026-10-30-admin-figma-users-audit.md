# Admin Figma audit — Users (all 20 frames)

Date: 30 Oct 2026. First pass at 14:25 (sections 01–02), full pass at about 14:35 (sections 01–07, after the build finished). **Read-only.** Nothing in Figma, the ledger or the plan was changed. Official Figma MCP (`plugin-figma-figma`), session `6d033de0…`. Only read-only `use_figma` scripts, `get_screenshot` and node reads were used.

- **File:** Admin - RSFC (`rONB8aMPanOjS3GC1uN16d`), page Users (`2958:63287`)
- **Spec:** `Documents/plans/2026-10-30-admin-figma-users-plan.md` (UX-1…10, UX-12, UX-13; UX-11 off)
- **Ledger:** `Documentation/admin-figma-ledger.json` → `modules.Users`
- **Reference:** Companies page `2958:63286`: `3020:3683` list, `3022:5211` filter open, `3021:4415` settings form, `3022:990` Feature Access, `3022:6104` list error, `3022:8953` / `3022:6341` loading, `3022:9353` / `3022:9385` / `3022:9414` messages
> **Fix pass 30 Oct 2026 (15:20):** every finding is marked below in "Fix pass outcome". Fixed on the Users page only; Companies was read, not edited.

- **Quality gate:** `hydra-ux-audit` (layers 1, 3, 4, 5, 6, 7, 8)

## Frames found live (re-discovered)

| Section | Frame | Node | Size |
|---|---|---|---|
| `01 · List` (`3032:42`) | 01.01 Users list · Default | `3043:15814` | 1750 x 970 |
| | 01.02 Users list · Roles filter open | `3043:17188` | 1750 x 970 |
| | 01.03 Users list · Roles overflow tooltip | `3045:8564` | 1750 x 970 |
| `02 · Create` (`3032:43`) | 02.01 Invite admins · Default | `3043:17848` | 1750 x 970 |
| | 02.02 Invite admins · Invalid email | `3043:18181` | 1750 x 970 |
| `03 · Edit` (`3032:44`) | 03.01 Edit user · Basic information · Default | `3044:1728` | 1750 x 970 |
| | 03.02 Edit user · Basic information · First name required | `3044:2555` | 1750 x 970 |
| | 03.03 Edit user · Permissions · Default | `3044:4365` | 1750 x **1020** |
| | 03.04 Edit user · Admin permissions · Default | `3045:2508` | 1750 x 970 |
| | 03.05 Edit user · Feature access · Default | `3045:4308` | 1750 x 970 |
| `04 · Empty` (`3032:45`) | 04.01 Users list · No matching users | `3045:5492` | 1750 x 970 |
| | 04.02 Edit user · Admin permissions · No admin role | `3045:5825` | 1750 x 970 |
| `05 · Loading` (`3032:46`) | 05.01 Users list · Loading | `3045:6141` | 1750 x 970 |
| | 05.02 Edit user · Loading | `3045:6425` | 1750 x 970 |
| `06 · Error` (`3032:47`) | 06.01 Users list · Failed to load | `3045:6643` | 1750 x 970 |
| | 06.02 Edit user · Save failed | `3045:6933` | 1750 x 970 |
| | 06.03 Invite admins · Send failed | `3045:6970` | 1750 x 970 |
| `07 · Success` (`3032:48`) | 07.01 Edit user · Saved | `3045:7445` | 1750 x 970 |
| | 07.02 Edit user · Permissions saved | `3045:7482` | 1750 x **1020** |
| | 07.03 Invite admins · Results | `3045:7584` | 1750 x 970 |

All 20 expected IDs are present, and there are no extra frames. Sections moved down by 50 from 04 onward because `03 · Edit` (2420 high) and `07 · Success` (1240 high) grew to fit the two 1020-high frames. The spacing still follows the plan: 210 below the tallest frame in a row and 140 at the bottom. Sections 01 and 02 haven't changed since the first pass (same geometry, bindings and overrides).

## What passed (all 20 frames)

- **Typography:** every visible TEXT node has a Hydra text style, and no node overrides font size, weight or line height. The roles are consistent: page title `Title/Heading 2`, section headings ("Current permissions", "Feature Access Control", "Results") `Title/Heading 5`, card title `Title/Heading 5` + `colorTextHeading`, table header and first column `Base/Medium`, body text `Base/Normal`, empty-state titles `Title/Heading 3` (from `Empty State Block`).
- **Colour:** no raw hex on any frame, container or text node outside instances.
- **Spacing:** every auto-layout container outside instances is bound to spacing variables. No unbound padding or gap was found in any of the 20 frames.
- **Components:** every instance comes from the Hydra Ant Design - DS library, and no frame or child has `detachedInfo`, so nothing is detached. The overlays are DS components: `Table Dropdown type=filter`, `Tooltip placement=top`, `Message`, `Alert`, `Spin`, `Empty State Block`.
- **Frame height (check 6):** each frame is vertical auto-layout with hug height and `minHeight 970`. Nothing is clipped at the bottom: no visible node goes past the frame edge on any frame. The Sidebar is `FILL` and reaches the bottom edge on all 20, including the 970 and 1020 high frames. `Main` bottom padding is bound to `paddingLG` (24) on all 20. Every overlay (popover, tooltip, the 5 messages) stays inside its frame.
- **Tables:** every visible row in every table is 54 high. That covers the users list (10 rows), the permission matrix (6 rows), feature access (8 rows) and invite results (3 rows). In the users list, header and cell text share the same 16 px inset and centre line, tags are vertically centred, and the Actions column aligns right. UX-13 reads well.
- **Cross-screen, consistent across all frames:** page title at x 280, y 134 on all 20. Breadcrumb at 280, 76 on all 20. Page description (edit screens) at 280, 176. Tabs at 304, 242, 1398 x 56 on every edit screen that shows them. Card at x 280, width 1446 everywhere. "Save changes" at 304, 780 on Basic information (03.01, 06.02, 07.01), at 304, 812 when the error caption adds height (03.02), at 304, 490 on Permissions (03.03, 07.02), and at 304, 404 on Admin permissions (03.04, 04.02). Basic information labels and inputs: x 304, width 1398, same spacing (86 between items, 118 for Email with its helper) on 03.01, 06.02 and 07.01. Invite admins Email and Admin role are 635 + 635 wide on 02.01, 02.02, 06.03 and 07.03 (but see U-A-44 / U-A-52 for the inner Select width).

---

## 01.01 · Users list · Default — `3043:15814`

| ID | Node ID | Element | Issue | Expected (style / variable) | Severity | Proposed fix |
|---|---|---|---|---|---|---|
| U-A-01 [Not fixed (DS gap)] | `3043:15883` (Pagination), `3043:15828` (card title) | Pagination vs count | The card header says "47 users", but the pagination shows only page "1" and an active next arrow. There is no "Total 47 items", even though the plan says there is. The count and the pagination disagree. This is a known DS gap in the ledger (Pagination has no page buttons). | `Pagination` with pages 1–5, or a visible total | major | **Decision**, see the decision list. |
| U-A-02 [Fixed] | `I3043:15849;766:52031` … (10 Last-name cells) | Last name column | Last name uses `colorTextSecondary`, while First name uses `colorText`. The grey was copied from Companies, where it marks secondary columns. Here it splits one name into two tones. | `colorText` | minor | Change the Last-name cell text to `colorText`. |
| U-A-03 [Fixed] | `3043:15870`–`3043:15874` | Column Feature access | 5 hidden leftover `Table / Table cell` instances (16 children for 11 rows). | 11 children | minor | Delete them. |
| U-A-04 [Fixed] | Type, Roles and Feature access cells (e.g. `3043:15856`, `3043:15863`) | Hidden cell labels | Hidden `✏️ label` values still hold Companies data ("US", "USD", "-"). They show up in Dev Mode. | Empty or relevant text | minor | Clear the hidden label values. |
| U-A-05 [Fixed] | `3043:15820` | Breadcrumb | "Users / List" with no `HomeOutlined`. Companies uses `HomeOutlined / Companies`. Applies to all 20 frames. | Same breadcrumb pattern as Companies | minor | **Decision**: add Home first, or keep the live wording. |
| U-A-06 [Fixed] | `I3043:16614` | Super administrator row | The Actions cell is empty. The tag hints at the reason, but the row can look broken. | Short explanation, `Base/Normal` + `colorTextDescription` | minor | **Decision** (changes UX-4): "No actions" text or a tooltip on the tag. |
| U-A-07 [Fixed] | `3043:15823` | List page CTA | No primary action on the page (same as Companies). Invite admins can only be reached from the sidebar. | — | minor | **Decision**: add a primary `size=large` "Invite admins" button in the page header, or keep it as is. |

**Counts:** blocker 0 · major 1 · minor 6

## 01.02 · Users list · Roles filter open — `3043:17188`

Inherits U-A-01 to U-A-07 (hidden cells `3043:17269`–`3043:17273`).

| ID | Node ID | Element | Issue | Expected (style / variable) | Severity | Proposed fix |
|---|---|---|---|---|---|---|
| U-A-08 [Fixed] | `3043:17298` | Popover position | The popover is at x 1000–1248, y 290. It starts inside the header row (273–327), and its right edge is 32 px left of the Roles trigger (1260–1280). On Companies `3022:5211`, the popover top sits at the bottom of the header row (y 327). | Top at header bottom (y 327), right edge aligned to the trigger | major | Move it to x 1032, y 327 (allowed raw geometry). |
| U-A-09 [Not fixed (accepted DS gap)] | `3043:17298` | Filter options | Only 2 options (DS gap in the ledger). The search shows "Company", so the list reads as filtered results. | — | minor (accepted gap) | None needed. Optionally tick one checkbox. |

**Counts:** blocker 0 · major 1 · minor 1 (+1 major, +6 minor inherited)

## 01.03 · Users list · Roles overflow tooltip — `3045:8564`

Inherits U-A-01 to U-A-07 (hidden cells `3045:8645`–`3045:8649`).

| ID | Node ID | Element | Issue | Expected (style / variable) | Severity | Proposed fix |
|---|---|---|---|---|---|---|
| U-A-10 [Fixed] | Lena Novak row (row 4, all 7 cells) | Hover context | The tooltip is open, but the row doesn't show a hover state, so it's less clear which user the tooltip belongs to. | `Table / Table cell` `state=hover` (the variant exists) | minor | Set `state=hover` on Lena's 7 cells. |
| U-A-11 [No issue] | `3045:8674` | Tooltip | Centred over "+3" (4 px gap) and lists all four roles, as UX-13 asks. No issue. | — | — | — |

**Counts:** blocker 0 · major 0 · minor 1 (+1 major, +6 minor inherited)

## 02.01 · Invite admins · Default — `3043:17848`

| ID | Node ID | Element | Issue | Expected (style / variable) | Severity | Proposed fix |
|---|---|---|---|---|---|---|
| U-A-12 [Fixed] | `I3043:17865;182:10120`, `I3043:17871;170:26363;170:24185` | Placeholders | Local fill override to `colorText`. The DS default is `colorTextPlaceholder` (Input) and the Select's own placeholder colour. "name@example.com" and "Select role" look like entered values. | Component default | major | Reset the `fills` override on both. |
| U-A-13 [Fixed] | `3043:18153` (Remove) | Remove alignment | The row aligns to the top, so Remove sits at y 262 (label line) instead of level with the input (y 292–324). | Centred with the 32-high input | major | Wrap Remove in a form-item frame (`itemSpacing` `paddingXS`) with an empty `Input__Label` above it, so the offset comes from DS geometry (22 + 8). |
| U-A-14 [Fixed] | `3043:17866` | Leftover | Hidden "Form item · Website" from Companies. | Not present | minor | Delete it. |
| U-A-15 [Fixed] | `3043:18180` (Intro) | Intro placement | The intro line sits inside the card. The Companies / Users-edit pattern puts the description in the `Title block` (`Page description`, gap `marginXXS`). | `Page description` in `Title block` | minor | Move it to `3043:17858` and rename it. |
| U-A-16 [Superseded] | `3043:17862` | Form rhythm | Superseded by **U-A-58** (cross-screen). Users forms use 24 throughout, so this is a module-level choice. | — | — | — |
| U-A-17 [Fixed] | `3043:18153` | Disabled Remove | Remove is shown disabled when there's one row, with no reason given (live behaviour, plan Q12). | — | minor | **Decision**: hide it until there are two rows, or keep it. |
| U-A-18 [Fixed] | `3043:17854` | Breadcrumb | See U-A-05. | — | minor | Follow U-A-05. |

**Counts:** blocker 0 · major 2 · minor 4

## 02.02 · Invite admins · Invalid email — `3043:18181`

| ID | Node ID | Element | Issue | Expected (style / variable) | Severity | Proposed fix |
|---|---|---|---|---|---|---|
| U-A-19 [Fixed] | `I3043:18381;182:10120`, `I3043:18203;170:26363;170:24185`, `I3043:18384;170:26363;170:24185` | Placeholders | Same as U-A-12. Row 2 looks pre-filled. "not-an-email" correctly uses `colorText`. | Component default | major | Reset the three overrides. |
| U-A-20 [Fixed] | `3043:18204`, `3043:18385` | Remove alignment | Same as U-A-13 (y 262 and 380, inputs at 292 and 410). | Centred with the input | major | Same wrapper fix (it holds even with the error caption). |
| U-A-21 [Fixed] | `3043:18206` | Leftover | Hidden Website form item. | Not present | minor | Delete it. |
| U-A-22 [Fixed] | `3043:18196` | Intro placement | Same as U-A-15 (the rhythm part moved to U-A-58). | As U-A-15 | minor | Same fix. |
| U-A-23 [Fixed] | `3043:18187` | Breadcrumb | See U-A-05. | — | minor | Follow U-A-05. |

The error state itself works: `Input status=error`, caption `colorErrorText`, both Remove buttons enabled, one primary action.

**Counts:** blocker 0 · major 2 · minor 3

---

## 03.01 · Edit user · Basic information · Default — `3044:1728`

The required markers on First name, Last name and Country, the disabled Email with its helper, the prefilled Company select (UX-7) and the title, email and breadcrumb header (UX-6) are all present.

| ID | Node ID | Element | Issue | Expected (style / variable) | Severity | Proposed fix |
|---|---|---|---|---|---|---|
| U-A-24 [Fixed] | `I3045:8523;182:9193` | Email helper "Email can't be changed here." | The helper uses `colorText`, so it reads like body copy and is as loud as the field values. Ant Form helper (`extra`) text is description colour. | `colorTextDescription` (or the `Input__Caption status=default` component default) | minor | Reset the fill override if there is one, or bind it to `colorTextDescription`. Apply the same in 03.02, 06.02 and 07.01. |

**Counts:** blocker 0 · major 0 · minor 1

## 03.02 · Edit user · Basic information · First name required — `3044:2555`

Inherits U-A-24 (same helper in this copy). The error state is correct: First name `status=error`, empty value, caption "First name is required" in `colorErrorText`. The fields below shift down by the caption height (32), and Save moves to y 812, as expected.

**Counts:** blocker 0 · major 0 · minor 0 (+1 minor inherited)

## 03.03 · Edit user · Permissions · Default — `3044:4365`

The 1020 height is correct: the card ends at 996 and the bottom padding is 24 (`paddingLG`). The "Allowed" / "Not allowed" badge matrix (UX-8) reads clearly.

| ID | Node ID | Element | Issue | Expected (style / variable) | Severity | Proposed fix |
|---|---|---|---|---|---|---|
| U-A-25 [Fixed] | Hidden cells `3044:4604`–`4607`, `3044:4759`–`4762`, `3044:4859`–`4862`, `3044:4957`–`4960`, `3044:5055`–`5058`. Hidden form items `3044:4385`, `3044:4388`, `3044:4391`, `3044:4394` | Leftovers | 24 hidden nodes: 4 extra matrix rows per column, and the Basic-information fields from the copy. | Not present | minor | Delete them. |

**Counts:** blocker 0 · major 0 · minor 1

## 03.04 · Edit user · Admin permissions · Default — `3045:2508`

| ID | Node ID | Element | Issue | Expected (style / variable) | Severity | Proposed fix |
|---|---|---|---|---|---|---|
| U-A-26 [Fixed] | Hidden cells `3045:2541`–`2544`, `3045:2553`–`2556`, `3045:2565`–`2568`, `3045:2577`–`2580`, `3045:2589`–`2592`. Hidden form items `3045:2525`, `3045:2593`, `3045:2596`, `3045:2599`, `3045:2602` | Leftovers | 25 hidden nodes, same pattern as 03.03. | Not present | minor | Delete them. |

**Counts:** blocker 0 · major 0 · minor 1

## 03.05 · Edit user · Feature access · Default — `3045:4308`

| ID | Node ID | Element | Issue | Expected (style / variable) | Severity | Proposed fix |
|---|---|---|---|---|---|---|
| U-A-27 [Fixed] | `3045:4325`, `3045:4328`, `3045:4331`, `3045:4334`, `3045:4337`, `3045:4340` (hidden Save changes) | Leftovers | 6 hidden Basic-information nodes from the copy. | Not present | minor | Delete them. |
| U-A-28 [Fixed] | `3045:4523` (Section heading), `3045:4524` (Section description) | Heading vs description | Both sit in `Profile form` with a `paddingLG` (24) gap, so the description floats away from its heading and reads as a separate line. Companies `3022:990` keeps title and description together (`marginXXS`). | Heading + description grouped, gap `marginXXS` | minor | Wrap both in a vertical frame with `itemSpacing` = `marginXXS`. |
| U-A-29 [Fixed (already matched)] | `3045:4561` (Revit Plugin select), `3045:4562` (Reset to default) | Disabled row | In the Disabled row the Select shifts 32 px left (x 1534, other rows 1566) to make room for the reset button. The reset icon is a trash can, which suggests "delete" rather than "reset to default". Companies `3022:9414` does the same, so this is pattern parity. | Fixed Select position; reset icon that reads as "undo" | minor | **Decision** (affects Companies too): reserve the reset slot on every row and/or swap to an undo-style Hydra icon with a tooltip. |

**Counts:** blocker 0 · major 0 · minor 3

---

## 04.01 · Users list · No matching users — `3045:5492`

The Empty State Block reads "No users found" / "Try another name or email, or clear the filters." with "Clear filters" (`size=large`, default). The card header says "0 users". UX-10 is met.

| ID | Node ID | Element | Issue | Expected (style / variable) | Severity | Proposed fix |
|---|---|---|---|---|---|---|
| U-A-30 [Fixed] | `I3045:5508;183:28912` (search text "zzzz") | Search term | The typed term uses `colorTextPlaceholder`, so it looks like a hint, not what the user searched for. That weakens the "No users found" context. `Input__Search` has no filled variant. | `colorText` for an entered value | minor | Override the text fill to `colorText`. Also note it as a DS gap (no filled state on `Input__Search`). |
| U-A-31 [Fixed] | `3045:5510` (hidden Columns), `3045:5600` (hidden Pagination row), incl. `3045:5573`–`5577` | Stale hidden table | The hidden table (ledger: "table hidden (empty state)") is the pre-UX-13 version: Type and Roles cells are 56 high, and it has the 5 stray Feature-access cells. Anyone who un-hides it gets the wrong table. | Removed, or the same as 01.01 | minor | Delete the hidden table and pagination. An empty state doesn't need them. |

**Counts:** blocker 0 · major 0 · minor 2

## 04.02 · Edit user · Admin permissions · No admin role — `3045:5825`

The empty state reads "No admin role yet" / "Choose an admin role above and save to give this user admin permissions." with no button (plan Q8). That works, because the select and "Save changes" are right above it.

| ID | Node ID | Element | Issue | Expected (style / variable) | Severity | Proposed fix |
|---|---|---|---|---|---|---|
| U-A-32 [Fixed] | `I3045:5847;170:26363;170:24308` | Admin roles placeholder | "Select admin role" has a fill override to `colorText`, so it looks like a selected role. That directly contradicts the empty state below. | Component placeholder colour | major | Reset the `fills` override. |
| U-A-33 [Fixed] | `3045:5842`, `3045:5910`, `3045:5913`, `3045:5916`, `3045:5919`, plus 20 matrix cells `3045:5858`–`5909` | Leftovers | 25 hidden copy leftovers. The hidden `Section heading` `3045:5848` and `Permissions table` `3045:5849` are justified for the empty state. | Not present | minor | Delete the leftovers. Keep or delete the state-hidden heading and table as you prefer. |

**Counts:** blocker 0 · major 1 · minor 1

## 05.01 · Users list · Loading — `3045:6141`

| ID | Node ID | Element | Issue | Expected (style / variable) | Severity | Proposed fix |
|---|---|---|---|---|---|---|
| U-A-34 [Fixed] | `3045:6159`, `3045:6249`, incl. `3045:6222`–`6226` | Stale hidden table | Same as U-A-31. | Removed | minor | Delete them. |

The card header text and card height are covered in the cross-screen section (U-A-57, U-A-62).

**Counts:** blocker 0 · major 0 · minor 1

## 05.02 · Edit user · Loading — `3045:6425`

| ID | Node ID | Element | Issue | Expected (style / variable) | Severity | Proposed fix |
|---|---|---|---|---|---|---|
| U-A-35 [Fixed] | `3045:6437` (Page description), `3045:6440` (Tabs), plus hidden form items `3045:6442`–`6457` | Loading layout | The tabs and description are hidden while loading, so the card starts at y 192 instead of 218 and the tab bar disappears. When the data arrives, the page jumps down 26 px and the tabs pop in. Companies (`3022:8953`) has no tabs, so there's no direct precedent. | Stable chrome while loading | minor | **Decision**: keep the tabs visible (and a placeholder description) during loading, or keep it as built. |

**Counts:** blocker 0 · major 0 · minor 1

---

## 06.01 · Users list · Failed to load — `3045:6643`

The copy is clear: "Unable to load users." / "Try again to reload the list." with Retry (UX-9).

| ID | Node ID | Element | Issue | Expected (style / variable) | Severity | Proposed fix |
|---|---|---|---|---|---|---|
| U-A-36 [Fixed] | `3045:6930` (Retry) | Button size | The instance is `size=medium`, but `height`, `width`, `counterAxisSizingMode` and `boundVariables` are overridden, so it renders 30 high instead of 32. `hydra-ux-audit` treats a custom button height as a control-size violation. | `Button size=medium` with no size overrides (32 high) | major | Reset the size overrides on `3045:6930`. |
| U-A-37 [Fixed] | `3045:6930`, `3045:6921` (Alert) | Retry placement | Retry sits left-aligned under the full-width Alert. Companies `3022:6104` centres Retry in the card (x 971). | Same layout as Companies | minor | **Decision**: match Companies, or keep this layout (it's arguably clearer) and update Companies later. |
| U-A-38 [Fixed] | `3045:6661`, `3045:6751`, incl. `3045:6724`–`6728` | Stale hidden table | Same as U-A-31. | Removed | minor | Delete them. |

**Counts:** blocker 0 · major 1 · minor 2

## 06.02 · Edit user · Save failed — `3045:6933`

Inherits U-A-24.

| ID | Node ID | Element | Issue | Expected (style / variable) | Severity | Proposed fix |
|---|---|---|---|---|---|---|
| U-A-39 [Fixed] | `3045:6966` (Message · error) | Message position | It's at x 907, y 13 (centre 995). Companies centres messages on the frame (centre 875) at y 16. | Centre x 875, y 16 | major | Move it to x 788, y 16. |
| U-A-40 [Fixed] | `3045:6966` | Error copy | "Failed to update user" says what happened, but not what to do next. Nothing is lost, the form keeps its values, so a hint helps. | "What happened + next step" (product-ux-rules) | minor | **Decision** (this is the product source string): e.g. "Failed to update user. Check your connection and try again." |

**Counts:** blocker 0 · major 1 · minor 1 (+1 minor inherited)

## 06.03 · Invite admins · Send failed — `3045:6970`

Inherits U-A-15, U-A-17 and U-A-05.

| ID | Node ID | Element | Issue | Expected (style / variable) | Severity | Proposed fix |
|---|---|---|---|---|---|---|
| U-A-41 [Fixed] | `3045:6999` (Message · error) | Message position | It's at x 785, y 13 (centre 987). | Centre x 875, y 16 | major | Move it to x 673, y 16. |
| U-A-42 [Fixed] | `I3045:6989;182:10120`, `I3045:6992;170:26363;170:24185` | Placeholders | Same as U-A-12. | Component default | major | Reset the overrides. |
| U-A-43 [Fixed] | `3045:6993` (Remove) | Remove alignment | Same as U-A-13. | Centred with the input | major | Same wrapper fix. |
| U-A-44 [Fixed] | `3045:6992` (Admin role select) | Select width | The instance is 635 wide, but its inner `🧬 input` is 623, so the visible box ends 12 px short of 02.01's (1586 vs 1598). This is the one form-width drift between sibling screens. | Inner box 635 (fill), as 02.01 | minor | Reset the inner input width so it fills the instance. |
| U-A-45 [Fixed] | `3045:6995` | Leftover | Hidden Website form item. | Not present | minor | Delete it. |

**Counts:** blocker 0 · major 3 · minor 2

---

## 07.01 · Edit user · Saved — `3045:7445`

Inherits U-A-24.

| ID | Node ID | Element | Issue | Expected (style / variable) | Severity | Proposed fix |
|---|---|---|---|---|---|---|
| U-A-46 [Fixed] | `3045:7478` (Message · success) | Message position | It's at x 620, y 88. That's left-anchored, and it overlaps the bottom of the breadcrumb bar (64–110) and the page title area. It's also in a different spot from the error messages (y 13). | Centre x 875, y 16 | major | Move it to x 772, y 16. |

**Counts:** blocker 0 · major 1 · minor 0 (+1 minor inherited)

## 07.02 · Edit user · Permissions saved — `3045:7482`

The 1020 height is correct, as in 03.03.

| ID | Node ID | Element | Issue | Expected (style / variable) | Severity | Proposed fix |
|---|---|---|---|---|---|---|
| U-A-47 [Fixed] | `3045:7580` (Message · success) | Message position | It's at x 620, y 88, as U-A-46. | Centre x 875, y 16 | major | Move it to x 733, y 16. |
| U-A-48 [Fixed] | Hidden cells `3045:7515`–`7518`, `3045:7527`–`7530`, `3045:7539`–`7542`, `3045:7551`–`7554`, `3045:7563`–`7566`. Hidden form items `3045:7567`, `3045:7570`, `3045:7573`, `3045:7576` | Leftovers | 24 hidden nodes, as 03.03. | Not present | minor | Delete them. |

**Counts:** blocker 0 · major 1 · minor 1

## 07.03 · Invite admins · Results — `3045:7584`

The Results table (Email, Status, Reason; `Tag__Status` success "Assigned", processing "Invited", default `Tag` "Skipped") is clear. Every row is 54 high, and the "Results" heading is `Title/Heading 5`. Inherits U-A-15, U-A-17 and U-A-05.

| ID | Node ID | Element | Issue | Expected (style / variable) | Severity | Proposed fix |
|---|---|---|---|---|---|---|
| U-A-49 [Fixed] | `3045:7613` (Message · success) | Message position | It's at x 620, y 88, as U-A-46. | Centre x 875, y 16 | major | Move it to x 743, y 16. |
| U-A-50 [Fixed] | `I3045:7603;182:10120`, `I3045:7606;170:26363;170:24185` | Placeholders | Same as U-A-12. | Component default | major | Reset the overrides. |
| U-A-51 [Fixed] | `3045:7607` (Remove) | Remove alignment | Same as U-A-13. | Centred with the input | major | Same wrapper fix. |
| U-A-52 [Fixed] | `3045:7606` (Admin role select) | Select width | Inner box 623 vs 635, as U-A-44. | Fill | minor | Same fix. |
| U-A-53 [Fixed] | `3045:7609`, `3045:7899`, `3045:7903`, `3047:5826` | Leftovers | The hidden Website item plus 3 hidden Status cells. | Not present | minor | Delete them. |
| U-A-54 [Fixed] | Results rows (Email column `3045:7808`) | Sample data logic | "anna.kovac@example.com — Assigned — The admin role was added", but 03.04 shows Anna is already a Global Administrator (she should be Skipped). "lena.novak@example.com — Skipped — An invitation is already pending", but Lena is an existing Admin user in the list, and the intro says existing users get the role right away. A reviewer who compares screens will notice. | Sample rows that match the other frames | minor | Assigned: an existing user with no admin role (e.g. mark.ellison@example.com, a "User" in 01.01 with no admin role in 04.02). Invited: a new address. Skipped "already pending": another new address, or use a Skipped reason that fits Anna ("Already a Global Administrator"). |

**Counts:** blocker 0 · major 3 · minor 3

---

## Cross-screen consistency (check 7)

| ID | Frames / nodes | Element | Drift | Expected | Severity | Proposed fix |
|---|---|---|---|---|---|---|
| U-A-55 [Fixed] | All 20 frames | Frame width | All 20 frames have `layoutSizingHorizontal = HUG` (`counterAxisSizingMode AUTO`). Width is 1750 only because `Body` is 1750, so a change inside could resize the screen. | Fixed width 1750, hug height, min 970 | minor | Set the width to fixed 1750 on all 20 frames. |
| U-A-56 [Fixed] | 06.02 `3045:6966`, 06.03 `3045:6999`, 07.01 `3045:7478`, 07.02 `3045:7580`, 07.03 `3045:7613` | Message toasts | The five messages use three different positions: error at y 13 with centres 987–995, success left-anchored at x 620, y 88. Companies uses one position for all (centred on the frame, y 16). | Centre x 875, y 16 on every frame | major (counted per frame: U-A-39, 41, 46, 47, 49) | Apply the per-frame x values above. |
| U-A-57 [Kept (decision)] | 01.01–01.03 "47 users", 04.01 "0 users", 05.01 / 06.01 "Users list" | List card header | The title changes between states. Companies shows the count in every state, even loading and error ("5 companies"). | One rule for all list states | minor | **Decision**: count where it's known and "Users list" while loading or failed (current Users approach, more honest), or always the count (Companies). |
| U-A-58 [Fixed (already matched)] | Profile form (03.x, 06.02, 07.01/02), Invite form (02.x, 06.03, 07.03) | Form vertical rhythm | Every Users form uses `paddingLG` (24) between items. The Companies settings form uses `paddingMD` (20). Users is consistent within itself. | One rhythm across Admin | minor | **Decision**: keep 24 (Ant `Form.Item` margin) and align Companies later, or switch Users to 20. Replaces U-A-16. |
| U-A-59 [Fixed] | `3044:2136`, `3044:4384`, `3044:4584`, `3045:2527`, `3045:2530`, `3045:5847`, `3045:6992`, `3045:7606`, `3045:6952`, `3045:7464`, `3045:7501`, `3045:7504` (and similar) | Layer names | Company, Company roles, Admin roles and Admin role selects are all named "Country select" (copy leftovers). On 02.x the Admin role select is correctly named "Admin role select". Confusing in Dev Mode. | Names that match the field | minor | Rename them (Company select, Company roles select, Admin roles select, Admin role select). |
| U-A-60 [Fixed] | 02.02 `I3043:18424;182:9206` vs 03.02 caption | Error caption punctuation | "Enter a valid email address." ends with a full stop. "First name is required" doesn't. The plan copy has no full stop on either. | Same punctuation | minor | Remove the full stop on 02.02 (plan copy). |
| U-A-61 [Kept (decision)] | "Save changes" (edit frames, with save icon) vs "Send invitations" (02.x, 06.03, 07.03, no icon) | Primary button | The page-level primary buttons differ: one has an icon, one doesn't. | One rule | minor | **Decision**: add a left icon to "Send invitations" (an existing Hydra icon such as SendOutlined, if the library has it), or drop the icon rule. |
| U-A-62 [Fixed] | 05.01 card 754 high, 05.02 card 754 | Loading card height | Users loading cards stretch to the bottom of the frame. Companies loading cards hug (297 / 240). | One rule | minor | **Decision**: keep the stretch (looks like a full page loading) or hug like Companies. |
| (U-A-05) | All 20 | Breadcrumb | No Home icon anywhere in Users, while Companies has one. | See U-A-05 | minor | Decision under U-A-05. |

**Consistent and passing:** page title position and style, breadcrumb position, page description position, tab bar position and size, card x and width, Save button positions within each tab, Basic information label and input widths, Invite admins field widths (apart from U-A-44 / U-A-52), section heading style, empty-state style, and table row height.

---

## Severity totals

| Frame | Node | Blocker | Major | Minor |
|---|---|---|---|---|
| 01.01 Users list | `3043:15814` | 0 | 1 | 6 |
| 01.02 Roles filter open | `3043:17188` | 0 | 1 | 1 |
| 01.03 Roles overflow tooltip | `3045:8564` | 0 | 0 | 1 |
| 02.01 Invite admins | `3043:17848` | 0 | 2 | 4 |
| 02.02 Invite admins · Invalid email | `3043:18181` | 0 | 2 | 3 |
| 03.01 Basic information | `3044:1728` | 0 | 0 | 1 |
| 03.02 First name required | `3044:2555` | 0 | 0 | 0 |
| 03.03 Permissions | `3044:4365` | 0 | 0 | 1 |
| 03.04 Admin permissions | `3045:2508` | 0 | 0 | 1 |
| 03.05 Feature access | `3045:4308` | 0 | 0 | 3 |
| 04.01 No matching users | `3045:5492` | 0 | 0 | 2 |
| 04.02 No admin role | `3045:5825` | 0 | 1 | 1 |
| 05.01 List loading | `3045:6141` | 0 | 0 | 1 |
| 05.02 Edit loading | `3045:6425` | 0 | 0 | 1 |
| 06.01 List failed | `3045:6643` | 0 | 1 | 2 |
| 06.02 Save failed | `3045:6933` | 0 | 1 | 1 |
| 06.03 Send failed | `3045:6970` | 0 | 3 | 2 |
| 07.01 Saved | `3045:7445` | 0 | 1 | 0 |
| 07.02 Permissions saved | `3045:7482` | 0 | 1 | 1 |
| 07.03 Results | `3045:7584` | 0 | 3 | 3 |
| Cross-screen | — | 0 | 0 (U-A-56 is counted per frame) | 7 |
| **Total (unique)** | | **0** | **17** | **42** |

Inherited repeats (same issue in a copied frame) are named in each frame's section but counted once.

## Summary

The system side is solid on all 20 frames. Every text has a Hydra style with no local overrides, there are no raw colours, every container is bound to spacing variables, every instance comes from the DS library, and nothing is detached. Every frame hugs its content with a 970 minimum, the Sidebar reaches the bottom, bottom padding is `paddingLG`, and nothing is clipped or sticks out. Shared chrome (title, breadcrumb, description, tabs, card, Save positions) sits in the same place on every sibling screen.

There are no blockers. The 17 major findings come from five causes:

1. **Placeholders that look like typed values** (02.01, 02.02, 04.02, 06.03, 07.03). Local `colorText` overrides were carried over from the Companies form.
2. **"Remove" on the label line** instead of level with the input (02.01, 02.02, 06.03, 07.03).
3. **Toast messages in three different places** (06.02, 06.03, 07.01, 07.02, 07.03). Companies uses one centred position.
4. **The Roles filter popover covers the header row** (01.02).
5. **A resized Retry button** (06.01) and **the "47 users" vs one-page pagination** (01.x, DS gap).

The minor findings are mostly cleanup: about 150 hidden copy leftovers across 14 frames, stale hidden tables in the state frames, and layer names. The rest are small consistency and UX polish items.

## Straightforward fixes (no decision needed)

U-A-02, U-A-03, U-A-04, U-A-08, U-A-10, U-A-12, U-A-13, U-A-14, U-A-15, U-A-19, U-A-20, U-A-21, U-A-22, U-A-24, U-A-25, U-A-26, U-A-27, U-A-28, U-A-30, U-A-31, U-A-32, U-A-33, U-A-34, U-A-36, U-A-38, U-A-39, U-A-41, U-A-42, U-A-43, U-A-44, U-A-45, U-A-46, U-A-47, U-A-48, U-A-49, U-A-50, U-A-51, U-A-52, U-A-53, U-A-54, U-A-55, U-A-59, U-A-60.

## Findings that need a user decision

- **U-A-01:** Pagination vs "47 users". (a) Add "Showing 1–10 of 47 users" next to the pagination, (b) ask the DS owner for page buttons, or (c) just log it. Recommended: (a) now, (b) later.
- **U-A-05 (also U-A-18, U-A-23, all 20 frames):** Add a Home icon to the breadcrumb (as Companies), or keep the live wording.
- **U-A-06:** Super administrator row: "No actions" or a tooltip (changes UX-4), or keep the cell empty.
- **U-A-07:** Add a primary "Invite admins" button to the list page header (not in the live app), or keep it as is.
- **U-A-17:** Hide "Remove" when there is only one invite row, or keep it disabled (live behaviour).
- **U-A-29:** Feature access Disabled row: reserve the reset slot so selects line up, and use an undo-style icon instead of the trash can. Affects Companies too.
- **U-A-35:** Edit-user loading: keep the tabs and description visible to avoid the jump, or keep them hidden.
- **U-A-37:** Retry placement: left under the Alert (Users) or centred (Companies).
- **U-A-40:** Add a next step to "Failed to update user" (this changes a product string).
- **U-A-57:** List card header in loading and error states: "Users list" or always the count.
- **U-A-58:** Form rhythm: 24 (Users) or 20 (Companies) across Admin.
- **U-A-61:** Icon on "Send invitations" to match "Save changes", or no icon rule.
- **U-A-62:** Loading cards: stretch (Users) or hug (Companies).

## Fix pass outcome (2026-10-30)

Build approved: Users, fix pass. All 20 frames were re-read by ID afterwards: width fixed 1750, hug height with min 970, nothing clipped, overlays inside, every table row 54, one primary per screen, no raw values.

| Finding | Outcome | What was done |
|---|---|---|
| U-A-01 | Not fixed (DS gap) | Pagination has no page buttons. User decision: log as a DS gap only. |
| U-A-02 | Fixed | Last name cells bound to colorText on 01.01–01.03 (30 cells). |
| U-A-03 | Fixed | 5 hidden Feature access cells deleted per list frame (15). |
| U-A-04 | Fixed | Stale hidden label values (US, HR, USD, -) cleared on 87 Type, Roles and Feature access cells; visible text unchanged. |
| U-A-05 | Fixed | All 20 breadcrumbs now HomeOutlined (icon only) / Users / page, as Companies. Dropdown chevron off. |
| U-A-06 | Fixed | Super administrator Actions cell shows “—” in colorTextDescription, right-aligned, renamed `Table / Table cell · no actions` (3043:16614, 3043:17293, 3045:8669). |
| U-A-07 | Fixed | Primary `Button size=large` “Invite admins”, no icon (Companies has no page CTA to copy), right of the title on 01.01, 01.02, 01.03, 04.01, 05.01, 06.01. Only primary on each frame. |
| U-A-08 | Fixed | Popover at x 1032, y 329: right edge on the trigger (1280), top on the header bottom (the header moved 2 px with the CTA). |
| U-A-09 | Not fixed (accepted DS gap) | Filter dropdown has two option slots. |
| U-A-10 | Fixed | Lena Novak row: all 7 cells state=hover on 01.03; rows stay 54. |
| U-A-11 | No issue | Tooltip re-anchored to a 4 px gap above “+3” after the 2 px shift. |
| U-A-12 | Fixed | Placeholder overrides reset on 02.01 (Input colorTextPlaceholder, Select placeholder colour). |
| U-A-13 | Fixed | Remove wrapped in `Form item · Remove` (gap paddingXS, Input__Label title “ ”); Remove y = input y. |
| U-A-14 | Fixed | Hidden Website item deleted. |
| U-A-15 | Fixed | Intro moved to Title block as `Page description` (Base/Normal, colorTextDescription, gap marginXXS); also 06.03 and 07.03. |
| U-A-16 | Superseded | See U-A-58. |
| U-A-17 | Fixed | Remove hidden on single-row frames (02.01, 06.03, 07.03); shown on 02.02 (2 rows). |
| U-A-18 | Fixed | Via U-A-05. |
| U-A-19 | Fixed | Three placeholder overrides reset on 02.02; “not-an-email” kept as a value. |
| U-A-20 | Fixed | Both Remove buttons level with their inputs (y 292, y 410). |
| U-A-21 | Fixed | Hidden Website item deleted. |
| U-A-22 | Fixed | Intro moved to Title block. |
| U-A-23 | Fixed | Via U-A-05. |
| U-A-24 | Fixed | Email helper text bound to colorTextDescription on 03.01, 03.02, 06.02, 07.01 (reset alone gives colorText, the DS caption default). |
| U-A-25 | Fixed | 24 hidden leftovers deleted. |
| U-A-26 | Fixed | 25 hidden leftovers deleted. |
| U-A-27 | Fixed | 6 hidden leftovers deleted. |
| U-A-28 | Fixed | Heading + description grouped in `Section title block`, gap marginXXS. |
| U-A-29 | Fixed (already matched) | Decision: match Companies. Users reset already uses the same trash icon (3027:3559), small icon-only default button and row layout as Companies 3022:5164. No change. |
| U-A-30 | Fixed | “zzzz” bound to colorText. DS gap logged: Input__Search has no filled state. |
| U-A-31 | Fixed | Hidden table and pagination row deleted. |
| U-A-32 | Fixed | Admin roles placeholder override reset (colorTextDescription, the Select placeholder colour). |
| U-A-33 | Fixed | 7 hidden top-level leftovers deleted, including the hidden heading and stale matrix. |
| U-A-34 | Fixed | Hidden table and pagination row deleted. |
| U-A-35 | Fixed | Tabs visible on 05.02, Spin only in the content area below them (Companies loading pattern; no Skeleton used). Page description stays hidden. |
| U-A-36 | Fixed | Retry overrides reset, Companies Retry props applied: 65 x 32. |
| U-A-37 | Fixed | Matches Companies: `Error state` (padding 48, gap paddingMD, centred), Alert 640 wide, Retry centred (x 971). |
| U-A-38 | Fixed | Hidden table and pagination row deleted. |
| U-A-39 | Fixed | Message centred (x 755, centre 875), y 16. |
| U-A-40 | Fixed | Copy: “Failed to update user. Try again.” (DS Message error). |
| U-A-41 | Fixed | Message centred (x 673), y 16. |
| U-A-42 | Fixed | Placeholder overrides reset. |
| U-A-43 | Fixed | Remove wrapper applied (hidden: single row). |
| U-A-44 | Fixed | Inner select input fills the instance (634.5). |
| U-A-45 | Fixed | Hidden Website item deleted. |
| U-A-46 | Fixed | Message centred (x 772), y 16. |
| U-A-47 | Fixed | Message centred (x 733), y 16. |
| U-A-48 | Fixed | 24 hidden leftovers deleted. |
| U-A-49 | Fixed | Message centred (x 743), y 16. |
| U-A-50 | Fixed | Placeholder overrides reset. |
| U-A-51 | Fixed | Remove wrapper applied (hidden: single row). |
| U-A-52 | Fixed | Inner select input fills the instance. |
| U-A-53 | Fixed | Hidden Website item and 3 hidden Status cells deleted. |
| U-A-54 | Fixed | Results: mark.ellison Assigned / mira.horvat Invited / anna.kovac Skipped “Already a Global Administrator.” |
| U-A-55 | Fixed | All 20 frames fixed width 1750, hug height, min 970. |
| U-A-56 | Fixed | All five messages centred at y 16 (U-A-39/41/46/47/49). |
| U-A-57 | Kept (decision) | “Users list” while loading or failed; count when known. |
| U-A-58 | Fixed (already matched) | Decision: match Companies. Companies settings form gap is paddingLG (24), the same as all Users forms (the 20 in the audit is the card body gap). No change. |
| U-A-59 | Fixed | 13 select layers renamed (Company select, Company roles select, Admin roles select, Admin role select). |
| U-A-60 | Fixed | Caption: “Enter a valid email address”. |
| U-A-61 | Kept (decision) | “Send invitations” keeps no icon. |
| U-A-62 | Fixed | Loading cards hug as Companies: 05.01 card 297 (Companies 297), 05.02 card 316 (tabs + Spin). |
