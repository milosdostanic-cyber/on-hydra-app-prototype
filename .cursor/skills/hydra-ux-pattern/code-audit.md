# Hydra UX Pattern: code mode (prototype repo)

Use this file whenever the task is on the **prototype code** (`src/...`), not on Figma. It exists so
a pass cannot skip a rule row, a screen state or an inner screen. The rule files in `rules/` stay
the only source of the standards; this file only says **how to check and fix them in code**.

## 0. Trigger words = fix approval

In code mode these user phrases count as explicit fix approval for the named screens/modules and
for **all approved rules**: "fix everything", "change everything according to the UX rules",
"apply the rules", "sve rules moramo da primenimo", "run them all and fix", "go ahead".

- Do not turn them into an audit-only turn. Audit silently, then fix.
- Ask once, before editing, only if the scope itself is unclear (which module) or a fix would
  change a shared component. Never ask whether to fix something that is plainly fixable.
- "Needs review" is allowed only for the reasons in `SKILL.md` (uncertain, exception-adjacent,
  DS gap, design decision). Everything else must be fixed in the same turn.
- A pure audit request ("audit", "check", "do you think we need to change anything") stays read-only.

## 1. Read before checking (mandatory)

1. Open **every** file in `rules/UX-001.md` … `UX-009.md` in full, every time, even if you read
   them earlier in the conversation. Rule files change (see each Status log, dated entries).
   Never work from a remembered or summarised version of a rule.
2. From each rule's **Spec table**, make one checklist item **per row** (Size, Gap, Padding,
   Every state, Order, Width, Header, Cell, ...). A row is a check. Do not merge rows.
3. Open the rule's **Applies when / Does not apply** to decide N/A per screen. State the reason.
4. Resolve token values from `src/theme/*` (`hydraAlias.ts`, `antdTheme.ts`,
   `hydraTypography.ts`), never from memory.

## 2. Inventory the scope

List every item before touching code, then check each one:

- **Screens:** every route of the module (for BOM: `src/bom/BomRoutes.tsx`), including redirects
  that land on a screen.
- **States per screen:** start, loading, results, empty, no results, error, with selection,
  with a filter applied. A state that exists in code but is hard to reach still counts.
- **Inner screens:** modals, drawers, detail pages, wizard steps, "view matches" style panels.
  Mark each as applicable or N/A per rule (UX-007 excludes modals/drawers, UX-009 too, but UX-002
  and UX-001 may still apply inside them).
- **Shared pieces the screen imports:** constants, wrapper components, table helpers
  (e.g. `INLINE_SEARCH_CONTROL_SIZE`, `AppSearchInput`, `BomPageHeader`, `BomTablePaginationBar`).
  **Read their actual value or props.** A shared constant is not a pattern: it can disagree with
  a rule (`INLINE_SEARCH_CONTROL_SIZE` is `large`, the rules say `medium` in toolbars).
- Do not change a shared component's behaviour. Add an opt-in prop, or override locally on the
  screen. Say which one you did.

## 3. What to check in code, per rule

Compare to the **rule's number**, never to another control on the page. "All three are 40px" is
not a pass.

| Rule | Check in code | Expected |
|---|---|---|
| UX-001 | Flex/Space `gap` between independent controls (Select, Input, filters) in one row | `token.paddingMD` (20). Not applied to button rows, composite controls, or the 8px inside Input+Button |
| UX-002 | Colour of links in table cells (`Link`, `Typography.Link`, `Button type="link"`) | `colorLink`, never `colorLinkActive`; no hex |
| UX-003 | Entry page only: `BomPageHeader entry` or equivalent | Heading 2, `colorText`; description Large/Normal `colorTextDescription`; gap `paddingXXS`. Detail pages: N/A |
| UX-004 | Actions column | Last column; `align: 'right'` on the column (header and cell); `width` = widest action set + 32, **measured**, link/button not wrapping; ⋯ last; gap `paddingXS`; max 2 visible + ⋯; Delete in ⋯ unless it is the only action |
| UX-005 | Page search | `AppSearchInput` + primary Button "Search"; **same size and `medium` (32px)** in toolbars; `large` only for a stand-alone hero search with no table card; gap `paddingXS`; never `Input.Search` |
| UX-006 | Figma frames only | In code: shell fills the viewport height (see UX-009) |
| UX-007 | Table card | Card body padding 0; table edge to edge; toolbar inside the card (`padding` / `paddingMD`, bottom border `colorBorderSecondary`); **every toolbar control `medium`**; count/summary inside the card as plain text; footer `padding` / `paddingMD`, top border, Pagination right (native antd pager hidden with `position: ['none']`); **toolbar kept on every state** (start, loading, empty, no results, error) |
| UX-008 | Column order | Status directly after the identity column; `#` and checkbox before it |
| UX-009 | State card | Page root and card are flex column with `flex: 1`; gap between card bottom and content bottom = `paddingLG` (24) |

Gotchas already hit in this repo:

- antd `Table` sorting across pages needs the table to see all rows: keep `pagination={{ current,
  pageSize, position: ['none'] }}` and render a custom footer `Pagination`; do not slice the data.
- Columns with `align: 'right'` need a width that leaves slack: link width + 32 + a few px, and
  `whiteSpace: 'nowrap'` on the link. `width = measured` exactly wrapped the link once.
- Reset the page to 1 whenever search, filters, tab or sort source changes.
- `src/bom/components/BomTablePaginationBar.tsx` is shared with SPEC and BOM Export: do not edit
  it for one screen.

## 4. Measure in the browser (mandatory for UI rules)

Reading code is not verification. Measure the live screen at 1440×1000 for every state.

```bash
# run from the repo root (Playwright is in node_modules); needs all permissions in the sandbox
PLAYWRIGHT_BROWSERS_PATH="$HOME/Library/Caches/ms-playwright" node .check.mjs   # delete the file afterwards
```

Measure with `getBoundingClientRect` / `getComputedStyle`:

- control heights (Select, Input, Button) → 32 in toolbars
- gaps between controls → 20 between independent ones, 8 inside Input+Button
- card body padding → 0; toolbar and footer padding → 16 / 20; table left/right = card left/right
- header text align and last-cell link right gap → both 16 from the column edge; link height = one
  line (no wrap)
- card bottom vs `.ant-layout-content` bottom → 24 in every state card
- link colour in table cells → the `colorLink` value, not the active one
- column order (read `th` text)

Also take a screenshot of each state and look at it. Numbers can pass while the layout is wrong.

## 5. Coverage matrix (required in the report)

Build one table: rows = screens/states/inner screens, columns = UX-001 … UX-009. **No empty cell.**
Each cell is one of: `OK`, `Fixed`, `N/A (reason)`, `Needs review (reason)`.

Close the pass only when:

1. every cell is filled;
2. every `Fixed` cell was re-measured after the edit (not before);
3. a second sweep re-read the rule files and re-measured the screens that were edited;
4. `npx tsc -p tsconfig.app.json --noEmit` shows no new errors (the two `src/stories/*` errors are
   pre-existing) and `ReadLints` is clean on edited files;
5. the report lists anything not covered and why. Never imply full coverage you did not check.

## 6. Report (short)

- the matrix (compact);
- what was fixed, per file;
- Needs-review items with the reason;
- which existing pattern was reused, which shared files were left unchanged, and that no new
  tokens or raw values were added.

After code fixes, add a dated line to the affected rule's **Status log** (what was applied in
code, which screens). Do not edit the rule's Standard or Spec without the user's approval.

## 7. Open items in code (as of 2026-11-11)

Not fixed yet, each needs a decision or a measurement. Re-check them whenever BOM is audited.

- `/bom/search` (`BomSearchPage`): search + button use shared `large`; likely a stand-alone hero
  search (allowed). Confirm, then leave or set `medium`.
- Matching table (`BomMatchingPage`): filter `Select`s use the default size; measure that they are
  32px. Stats strip above the card is outside the card (UX-007): needs review.
- BOM Hub: empty project list has no toolbar (UX-007 "every state"): needs review.
- Matching: "Action" column mixes a text action and ⋯ (UX-004 order/width): needs review.
- ASC products table: figure number is plain text, not a link (UX-002): needs review.
- BOM Export preview and ASC part detail "sizes" table: small tables inside another card
  (UX-007 "Needs review per case").
- Non-BOM modules (Content, Home, SPEC, SeisBrace, Submittal): not audited against the rules yet.

## 8. Lessons log

- 2026-11-11: Cross-reference toolbar was left at `large` (40px) in a "fix everything" pass.
  Cause: worked from a short rule summary without the size row, trusted the shared
  `INLINE_SEARCH_CONTROL_SIZE`, and verified that controls were equal to each other instead of
  equal to the rule. Fixed in code and in this procedure (sections 1, 2, 3, 4).
- 2026-11-11: Action column set to the measured link width wrapped the link. Rule of thumb in
  section 3 (slack + nowrap).
