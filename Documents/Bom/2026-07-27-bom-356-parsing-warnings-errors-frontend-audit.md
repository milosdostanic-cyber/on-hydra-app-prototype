# BOM-356 — Parsing warnings & errors: frontend audit

**Date:** 2026-07-27
**Ticket:** [BOM-356 — Design for BOM warning/errors](https://ooden.atlassian.net/browse/BOM-356) · Task · Low · To Do · assignee Miloš Dostanić · reporter João Pedro Vieira Leão
**Scope of this document:** **Frontend only.** No backend parser, API contract, or data-pipeline recommendations. Everything below concerns what the user sees in the BOM import flow and which existing Hydra / Ant Design surfaces carry it.
**Repo baseline:** `on-hydra-app-prototype`, `src/bom/**`, state as of 2026-07-27.
**Upstream reference:** `ooden-tech/on-hydra-app` PR #545 (temporary frontend decisions for the same problem, per João's comment 2026-07-22). Not accessible from this repo — treat its choices as *candidate*, not settled.

---

## 1. What the ticket actually asks

João's framing, restated:

1. Excel gives us **UPC values in scientific notation** (`7.65E+11`). The parser recovers *some* digits but not all.
2. A recovered-but-incomplete UPC is **not the same as a missing UPC**. The product promise "UPC is deterministic" is void for that row, and the user must understand why.
3. Current backend split:
   - **Warning** — row has a partial UPC **but** something else usable (e.g. description) → matching still runs, quality degraded.
   - **Error** — row has *only* the partial UPC → matching has nothing to work with, the row is **effectively treated as blank** and ignored.
4. The ask: **generalise** this. UPC is just the first field where we caught it. Any field can be corrupted, and the information belongs **at the parsing step**, presented "in a similar manner that it already conveys blank field data."

**The design problem in one sentence:** the parsing review screen today can say *"this is missing"*, but it cannot say *"this is present and wrong"* or *"this row cannot be used at all"*.

---

## 2. Current state — how parsing quality is conveyed today

### 2.1 Surfaces that exist

| Surface | File | What it shows |
|---|---|---|
| Step chrome status tag | `src/bom/components/BomUploadProgressBar.tsx` via `parsingReviewProgressStatusLabel` | `"8 items ready"` or `"8 items · 4 to review (optional)"`, tone `success` / `warning` |
| Page banner | `src/bom/components/BomParsingReviewQualityAlert.tsx` + `parsingReviewQualityAlert` | `Alert` `success`: *"Ready for matching"* / `warning`: *"Some lines are missing detail — you can still continue without updating"* |
| Table toolbar counter | `src/bom/pages/BomParsingReviewPage.tsx` | `"N parts we found in your file"` / `"Showing N parts that may not match well"` |
| Filter | same | `Button` **Show parts that may not match well** ↔ **Show all rows** |
| Row quality column | `qualityColumn()` in `src/bom/bomParsingReviewColumns.tsx` → `BomConfidenceTag` | High / Medium / Low + icon, `HydraTag` tone success/warning/error |
| Cell attention | `readOnlyAttentionText()` / `readOnlyQty()` | `Typography.Text type="warning" strong`, glyph **`?`**, tooltip *"Missing — we could not read this"* |
| Row action | `actionsColumn()` | Primary **Add info** when the row needs attention, otherwise default **Edit** |
| Row edit modal | `src/bom/components/BomParsingReviewRowDrawer.tsx` | `HydraTag tone="warning"` → *"Missing: Description and SKU"*; `Alert type="warning"` → *"We may not match this line well"*; editable `Input status="warning"` per field |
| Commit CTA | `BomParsingReviewPage` | **Continue with current data** (primary), **Cancel upload** (default). Disabled only when `rows.length === 0`. |

### 2.2 The severity model behind them

All of it derives from two inputs, in `src/bom/bomParsingReviewAlert.ts`:

- `BomItem.confidence: 'high' | 'medium' | 'low'` — a single opaque band on the row.
- **Blankness** of seven fields, via `parsingReviewFieldNeedsAttention(row, field, profile)`, where every check is `isBlank(...)` (plus `quantity <= 0` and `size` must contain a digit).

```ts
type IssueKey =
  | 'low confidence'
  | 'missing parsed description'
  | 'missing SKU'
  | 'missing UPC'
  | 'missing figure number'
  | 'missing manufacturer'
  | 'missing size'
  | 'quantity is zero';
```

Everything else — banner, counts, filter, tag, cell chrome, modal alert — is computed from those. There is **no persisted per-row or per-field status**, and no severity dimension beyond "needs attention / doesn't".

### 2.3 Profile awareness (the one good bone already in place)

`parsingReviewColumnProfile(fieldMapping)` yields `'description' | 'sku-only' | 'upc'`, and `parsingReviewFieldNeedsAttention` already varies by profile — e.g. a blank UPC only matters in `description` and `upc` profiles. **This is the correct hook for BOM-356**: whether a corrupted UPC is a warning or an error depends entirely on whether anything else on the row is usable, which the profile already approximates.

---

## 3. Gap analysis

| # | Gap | Severity for BOM-356 |
|---|---|---|
| G1 | **No "present but unreliable" state.** The model is binary: blank vs filled. A recovered partial UPC renders as an ordinary black value in an ordinary cell — visually indistinguishable from a clean one. | **Blocker** |
| G2 | **No row-level "error / unusable" state.** `warning` is the ceiling. `Alert` type never goes to `error` on this screen, and there is no tag, badge, or row treatment for "this line will be ignored during matching". | **Blocker** |
| G3 | **The raw cell value is not visible per field.** `originalInput` is the whole source line, shown in the *"From your file"* column. There is nowhere to show `7.65E+11 → 765000000000` for the UPC field specifically. Without the before/after, "partial" is unexplainable. | **Blocker** |
| G4 | **Severity is not attributable to a cause.** `IssueKey` only encodes *which field*, never *why* (blank vs truncated vs invalid check digit vs wrong type). The ticket explicitly asks to generalise across fields, which requires a cause dimension. | High |
| G5 | **The one filter conflates everything.** *"Show parts that may not match well"* returns medium/low confidence **and** any blank-field row **and** (future) any error row, ordered by original row number. With errors mixed in, the most urgent lines can sit on page 3. | High |
| G6 | **Continue is never gated or acknowledged.** `handleCommitParsingReview` only guards `rows.length === 0`. If 6 of 8 rows are unusable, the user proceeds with no confirmation. Compare `useBomFinishImport.tsx`, which *does* run a `modal.confirm` for skipped lines at the import step. | High |
| G7 | **Downstream handoff is silent.** `createInitialMatchResults(rows)` maps **every** row. An "error" row would enter guided review as a normal pending line with no suggestions, and `useBomFinishImport` counts it in `reviewSummary.pending` — so the user can never drive "needs attention" to zero, and has no legitimate way to dispose of it. | High |
| G8 | **`?` is overloaded.** `readOnlyAttentionText` renders `?` for missing. A corrupted value must not reuse the same glyph — it has content, it is just untrustworthy. | Medium |
| G9 | **Row truncation is silent.** `normalizeParsedItemsForUpload` hard-slices to `PARSING_REVIEW_MAX_ROWS = 10` with no notice. Prototype-only artefact, but it is exactly the class of "we changed your data without telling you" that this ticket is about. | Medium (prototype-only) |
| G10 | **No column-level aggregation.** If an entire column arrived in scientific notation, the user sees N identical row warnings instead of one "your UPC column came through as scientific notation" message. | Medium |
| G11 | **Colour-only encoding.** Warning state = `Typography.Text type="warning"` + `?`. No text alternative, no `aria`, no announcement when counts change. | Medium |
| G12 | **No `Empty` state on the filtered table.** Filter on → fix the last bad row → the table renders zero `<tr>` inside a `Card` with a pagination footer. | Low |
| G13 | **Pagination not reset on shrink.** `page` resets when the filter toggles, but not when edits shrink `visibleRows`; the user can land on a blank page N. | Low |

---

## 4. Proposed frontend model (design contract)

> This is a *frontend presentation* contract. It describes what the UI needs in order to say the right thing — not how the parser produces it.

### 4.1 Three row severities, not two

| Severity | Definition | User promise | Blocking? |
|---|---|---|---|
| **OK** | Every mapped field either parsed cleanly or is legitimately empty and not needed. | "We'll match this." | — |
| **Warning — degraded** | At least one value is missing or unreliable, **but** at least one trustworthy identifier remains (description, clean SKU, or clean UPC). | "We'll still try to match this, but the result may be weaker." | **No** |
| **Error — unusable** | No trustworthy identifier remains. Every identifier is blank or unreliable. | "We can't match this line. It will come through unmatched — you can fix it here, or import it and resolve it later." | **No for the file. Yes for the row.** |

Deliberately: **error is row-scoped, never file-scoped.** The PRD (`docs/prd/bom-prd.md` §2) already warns that *"yellow or warning-style indicators can be misread as blockers"* — the fix is not to escalate the blocking, it is to make the *consequence* concrete and per-row.

### 4.2 Field-level cause, so it generalises past UPC

The ticket asks for generalisation. The minimum the UI needs per field:

| Field state | Meaning | Example |
|---|---|---|
| `ok` | Parsed as given. | `812345678901` |
| `empty` | Nothing in the source cell. | `` |
| `recovered` | Source cell had a value; we salvaged part of it and the result is **not** trustworthy. Carries the raw source text. | `7.65E+11` → `765000000000` |
| `invalid` | Source cell had a value we could read but it fails the field's own rules. | UPC `1234567` (7 digits), check digit fails, letters in a numeric field |

`recovered` and `invalid` are the two new ones and they are what BOM-356 is about. `empty` is what the screen already handles. Row severity is then derivable:

- any identifier field `recovered`/`invalid`/`empty` **and** ≥1 identifier `ok` → **warning**
- **all** identifier fields `recovered`/`invalid`/`empty` → **error**
- non-identifier fields (size, manufacturer, figure, qty) can only ever produce **warning**

"Identifier" = the existing `PARSING_IDENTIFIER_FIELD_KEYS = ['DESCRIPTION', 'SKU', 'UPC']` in `bomFieldMappingUtils.ts` — already the rule that gates the mapping step. Reusing it keeps mapping and parsing telling the same story.

### 4.3 Profile dependency (important, easy to get wrong)

The *same* corrupted UPC is a different severity depending on the mapping profile:

| Profile | Corrupted UPC alone | With clean description | With clean SKU |
|---|---|---|---|
| `description` | error | warning | warning |
| `sku-only` | n/a (UPC not shown) | — | warning |
| `upc` | **error** | n/a | warning |

In the `upc` profile the UPC *is* the only identifier, so a `recovered` UPC is fatal to the row. `parsingReviewFieldNeedsAttention` already branches on profile — extend that branching rather than adding a parallel system.

---

## 5. Surface map — where each state should appear

Every surface below already exists. The recommendation is to add a severity dimension to each, not to add screens.

| Surface | OK | Warning | Error |
|---|---|---|---|
| Step chrome tag (`BomUploadProgressBar`) | `success` · *"8 items ready"* | `warning` · *"8 items · 3 to review"* | `error` · *"8 items · 2 can't be matched"* (error count wins the tone) |
| Page banner (`Alert`) | `success` · *"Ready for matching"* | `warning`, existing copy | **`error`** · new state, see copy deck §7 |
| Toolbar counter | *"8 parts we found in your file"* | unchanged | append *· 2 can't be matched* |
| Filter | disabled | *"Show parts that may not match well"* | **split into two**: *"Can't be matched (2)"* + *"May match poorly (3)"* — errors first |
| Quality column | `BomConfidenceTag` High | Medium | **Low + row-level error is not the same thing.** Add a distinct **Status** treatment, see §6.1 |
| Cell | plain text | `Typography.Text type="warning"`, `?` if empty | `type="danger"`, value shown **struck or annotated**, never bare |
| Cell tooltip | value | *"Missing — we could not read this"* | *"Your file had `7.65E+11`. Excel shortened this number, so we can only read part of it: `765000…`"* |
| Row action | **Edit** | **Add info** (primary) | **Fix to match** (primary, `danger` styling avoided — see §6.3) |
| Row modal | no alert | `Alert warning`, existing copy | `Alert error` + `HydraTag tone="error"` + per-field original value |
| Continue CTA | enabled, no confirm | enabled, no confirm | enabled + **`modal.confirm`** naming the consequence |
| Matching step | normal | normal | explicit **"Can't be matched"** line status, excluded from the *needs attention* count |

---

## 6. Component and token reuse

Per `ux-system-reuse-guardrails.mdc` / `hydra-ui-tokens.mdc` — no new shared components, no new tokens, no raw values.

### 6.1 Row severity indicator

The **Quality** column shows parse confidence (High/Medium/Low). Error is orthogonal — a row can be "High confidence that we read `7.65E+11`" and still be unusable. Two options, both built from existing parts:

| Option | Build | Trade-off |
|---|---|---|
| **A — reuse Quality column, add error tone** *(recommended)* | `BomConfidenceTag` already maps low → `HydraTag tone="error"`. Extend the local BOM helper so an unusable row renders `tone="error"` with `CloseCircleOutlined` and the label **"Can't match"** instead of "Low". | Zero new columns; one column answers "how will this row do?". Slight semantic stretch of "Quality". |
| **B — separate Status column** | New column rendering `BomStatusBadge` (existing `Badge status="error" text="Can't be matched"`), mirroring `bomMatchingColumns.tsx`. | Cleaner semantics, consistent with the matching table. Costs horizontal space in an already-wide table (`scroll={{ x: 'max-content' }}`). |

Recommend **A** for the prototype, **B** if design wants parity with the matching table's Status column.

### 6.2 Existing pieces to reuse verbatim

| Need | Reuse |
|---|---|
| Page banner | `Alert` with `showIcon` + `description` — established convention, every BOM `Alert` uses it |
| Row / field tag | `HydraTag tone="warning" \| "error"` (`src/ui/HydraTag.tsx`) — **not** raw `Tag color=` |
| Severity icon | `@ant-design/icons`, already mapped in `BomTags.tsx`: `CheckCircleOutlined` / `ExclamationCircleOutlined` / `CloseCircleOutlined`. No new icon source. |
| Cell emphasis | `Typography.Text type="warning" \| "danger"` + `ellipsis={{ tooltip }}` — the `readOnlyAttentionText` pattern |
| Editable field state | `Input status="warning" \| "error"` via `editableTableText` in `bomImportTableCells.tsx` |
| Before/after value | `BomImportedValueCell` + `bomImportedColumnHeaderStyle` (`bomImportedDataEmphasis.tsx`) — the existing *"From your file"* visual language, applied at field level inside the row modal |
| Continue confirmation | `modal.confirm` + `ExclamationCircleOutlined` styled `token.colorWarning` — copy the exact pattern from `useBomFinishImport.tsx` |
| Filtered-empty | `Empty` — already used in `BomMatchingReviewPartPanel`, choose-part modal, site hub |
| Colours | `token.colorWarning*` / `token.colorError*` via `theme.useToken()`. `HydraTag` already resolves these. **No new tokens.** |

### 6.3 CTA hierarchy

One primary per context. On the parsing screen the primary is **Continue with current data**. Row-level **Add info** / **Fix to match** are `type="primary" size="small"` inside the table — that is the existing `actionsColumn` treatment and it does not compete with the page CTA. **Do not** use `danger` styling on the row fix button: nothing destructive is happening, and `danger` is reserved for deletes (`BomSiteProjectsPage`, `ConstructionProjectSwitcherModal`).

---

## 7. Copy deck

Non-technical audience. No "scientific notation" in primary copy — put it in the tooltip / secondary line where it explains the *cause*.

### Page banner — error present

> **2 lines can't be matched**
> 6 of 8 lines are ready. 2 lines don't have any information we can match against — the values we could read aren't complete enough to identify a part. Add a description, SKU, or UPC for those lines, or continue and they'll come through unmatched.

### Page banner — warning only (existing, keep)

> **Some lines are missing detail — you can still continue without updating**
> 5 of 8 lines have enough detail for accurate matching. 3 lines are missing information (highlighted below) — we may not suggest a strong ASC match for those. Use Add info if you have more details, or continue and expect weaker matches on those lines.

### Cell tooltip — recovered value

> Your file shows **7.65E+11**. Spreadsheets shorten long numbers like this, so we could only recover **765000000000** — some digits are lost. This UPC may not identify the right part.

### Cell tooltip — invalid value

> **1234567** isn't a valid UPC — a UPC has 12 to 14 digits. We can't use it to identify a part.

### Row modal — error

> **We can't match this line**
> Everything we'd normally use to identify a part is missing or unreadable on this line. Add a description, SKU, or UPC and we'll try to match it. If you continue without changes, this line is imported as unmatched and you can resolve it in the workspace.

### Continue confirmation (`modal.confirm`)

> **2 lines can't be matched**
> They'll be imported as unmatched lines — nothing is lost, but you'll need to pick parts for them yourself later.
> **Buttons:** *Go back and fix* (cancel) · *Continue anyway* (ok)

### Column-level notice (when ≥60% of one column is `recovered`)

> **Your UPC column may be incomplete**
> Most UPCs in this file arrived in a shortened format that spreadsheets use for long numbers, so we can't read them in full. If you can re-export the file with UPC formatted as text, matching will be much more accurate.

### Row-count truncation (prototype)

> Showing the first 10 lines of this file in the prototype.

---

## 8. Edge case matrix

Legend: **W** = warning · **E** = error (row unusable) · **—** = no severity change.

### 8.1 UPC-specific (the reported case)

| # | Case | Severity | Frontend requirement |
|---|---|---|---|
| 1 | `7.65E+11` → partial digits recovered, row has description | W | Cell shows recovered value in warning tone + tooltip with the raw source value |
| 2 | `7.65E+11` → partial digits, row has **only** UPC (`upc` profile) | **E** | Row marked unusable; banner escalates; Continue confirms |
| 3 | `7.65E+11` → nothing recoverable | Treat as `empty` | Existing missing-UPC path, `?` glyph, existing copy |
| 4 | Leading zeros stripped (`012345678905` → `12345678905`, 11 digits) | W or E per profile | Must **not** silently zero-pad. Flag as `recovered`, show both forms |
| 5 | Check digit fails on an otherwise well-formed 12-digit UPC | W | `invalid` cause; copy must not claim the number is "incomplete" — it's wrong, not short |
| 6 | Wrong length (7, 15, 20 digits) | W or E per profile | `invalid`; tooltip states the expected length |
| 7 | Non-numeric characters (`812-345-678901`, `UPC: 812345678901`) | — if normalisable, else W | If we strip and normalise, that is still a change to the user's data — surface it as `recovered`, not silently |
| 8 | Multiple UPCs in one cell (`812345678901 / 812345678902`) | W | Show the first, flag ambiguity; do not guess silently |
| 9 | Same UPC on many rows | — (or W) | Duplicate detection is a separate concern; do **not** fold into parse severity without a product decision |
| 10 | UPC column mapped to what is actually the SKU column | — at parse time | Mapping-step concern (`BomMappingSummaryPage` duplicate detection). Out of scope here; note the boundary |
| 11 | Whole UPC column arrives `recovered` | W/E per row **+ column notice** | One aggregated message, not N identical row tooltips (see G10) |

### 8.2 Same corruption class in other fields (the generalisation ask)

| # | Case | Severity | Note |
|---|---|---|---|
| 12 | SKU truncated by scientific notation | W or **E** if the only identifier | Identical logic to UPC — the model must be field-agnostic |
| 13 | Size `3/4"` auto-converted by Excel to a date (`Mar-04`, `44259`) | W | Non-identifier → never error. Very common real-world failure |
| 14 | Figure number read as a date or a float (`1.0`) | W | Non-identifier |
| 15 | Quantity as float noise (`2.0000000001`) or with a unit (`2 EA`) | W | Existing `quantity <= 0` check covers zero only; `invalid` covers the rest |
| 16 | Quantity negative | W | Existing check treats `<= 0` as attention — reuse |
| 17 | Description truncated at the spreadsheet cell character limit | W | `recovered`; the *"From your file"* column already shows the raw line, which helps here |
| 18 | Encoding mojibake (`Ø3/4â€³`) | W | `invalid`; the raw value in the tooltip is the only honest thing we can show |
| 19 | Manufacturer field contains a whole address block | — | Not detectable at parse; out of scope |

### 8.3 Row and file composition

| # | Case | Expected behaviour |
|---|---|---|
| 20 | 0 warnings, 0 errors | `Alert success`, filter button disabled (already correct) |
| 21 | Warnings only | Existing warning banner unchanged |
| 22 | Errors only | Error banner; the warning banner must not also render — one banner, highest severity wins |
| 23 | Both | Error banner, with the warning count in the description. Never stack two `Alert`s |
| 24 | **All** rows are errors | Banner states the file can't be matched at all; **Continue stays enabled** (rows still import as unmatched) but the confirm modal should recommend re-checking the column mapping and link to it (`bomAdvancedFieldMappingRoute`) |
| 25 | Exactly 1 warning / 1 error | Singular copy. `parsingReviewQualityAlert` already handles `1 line is` — extend to error copy |
| 26 | Empty file / 0 rows | Existing empty-state branch in `BomParsingReviewPage` (lines 202–241) already handles this |
| 27 | File exceeds `PARSING_REVIEW_MAX_ROWS` | Silently truncated today (G9). Add a visible notice |
| 28 | Blank / subtotal / repeated-header junk rows | Would present as all-blank → **E** under this model. Acceptable, but note the copy is misleading ("can't be matched" vs "this doesn't look like a part"). Flag for product |

### 8.4 User interaction and state transitions

| # | Case | Expected behaviour |
|---|---|---|
| 29 | User fixes a UPC in the row modal | Severity recomputes **live inside the modal** (`showIncompleteAlert` / `missingFieldsTag` already do this via `useMemo` on `draft` — extend, don't rebuild) |
| 30 | User saves the fix | Banner, chrome tag, counts, quality tag, and filter membership all recompute. All are derived from `rows`, so this works today — **verify** it still does after adding severity |
| 31 | Fixed row while the filter is active | The row leaves `visibleRows` and disappears under the user. Give feedback: the existing `message.success('Row updated.')` should name what changed, e.g. *"Row 4 updated — it can be matched now."* |
| 32 | Last filtered row is fixed | Filtered table is empty → show `Empty` with a **Show all rows** action (G12) |
| 33 | Edit shrinks `visibleRows` below the current page | Clamp `page` (G13) |
| 34 | User **clears** a previously good value | Severity escalates OK → W → E. Must be symmetric; the model can't be one-way |
| 35 | User pastes another invalid UPC into the fix field | `Input status="error"` inline; do not accept it as a fix. Save must not claim success |
| 36 | User navigates back from matching to parsing review | Row edits and severities must survive — they persist through `updateProgress(...)` into the session; **verify** severity is recomputed from values, not cached |
| 37 | Resumed interrupted upload (`BomPendingUploadsRegion`) | Severity is derived, not stored → recomputes from `localStorage` rows. Keep it derived; do not persist a severity field that can go stale |
| 38 | User changes the column mapping and returns | Profile changes → severity changes (§4.3). Recompute; never cache severity across a mapping change |
| 39 | Append-to-existing-BOM flow | Errors in the appended rows must be scoped to the append batch, not confused with existing workspace rows |
| 40 | Continue with errors present | `modal.confirm` (G6) |
| 41 | Cancel upload with errors present | Existing `useBomCancelUpload` confirm — unchanged |

### 8.5 Downstream consequences (in-scope because they are frontend states)

| # | Case | Expected behaviour |
|---|---|---|
| 42 | Error rows entering guided matching | Must appear as an explicit **"Can't be matched"** line, not as a normal pending line with an empty suggestion list. Reuse `BomReviewDisplayStatus` — add a distinct value rather than overloading `unresolved` or `skipped`, both of which mean *user chose not to act* |
| 43 | Import gating (`useBomFinishImport`) | Error rows must be excluded from `reviewSummary.pending`, or the user can never reach zero *needs attention* (G7) |
| 44 | Final import with error rows | They import as unmatched workspace rows. **Never drop them silently** — the user's line count must survive the round trip |
| 45 | Workspace display of imported error rows | Existing `BomMatchStatusTag` `pending` / `needs-review` covers this; confirm the originating parse problem is still legible there (or accept that it isn't, and say so) |
| 46 | Export of a BOM containing unmatched error rows | Out of scope; flag as an open question |

### 8.6 Accessibility, i18n, presentation

| # | Case | Expected behaviour |
|---|---|---|
| 47 | Colour-only severity | Every warning/error cell needs a text or `aria-label` equivalent. The `ellipsis={{ tooltip }}` pattern is mouse-only — tooltips are not a substitute for accessible text |
| 48 | Count changes after an edit | Announce via `aria-live` (precedent exists — Action Trail uses `aria-live`) |
| 49 | Keyboard access to the explanation | Tooltip trigger must be focusable, or move the explanation into the row modal where it is reachable |
| 50 | Long recovered values + `ellipsis` | The status tooltip and the ellipsis tooltip compete for the same slot; combine into one tooltip string rather than nesting |
| 51 | Dark mode | `HydraTag` and `Typography.Text type` resolve from theme tokens — no action, but verify contrast of `colorErrorText` on `colorErrorBg` |
| 52 | Non-US number formats (comma decimal separator) | Same `recovered` / `invalid` treatment; no locale-specific copy branch in the prototype |
| 53 | `?` glyph reuse | Must **not** be used for a corrupted value (G8) — reserve it for genuinely empty |

---

## 9. Open questions for product / design

1. **Row vs cell severity ownership.** If a row is unusable because of one field, does the error live on the row (Quality/Status column) or on the field (cell)? Recommendation: **both** — cell explains the cause, row states the consequence.
2. **Naming.** "Error" is developer vocabulary and reads as *the system broke*. Candidates: *"Can't be matched"*, *"Not enough information"*, *"Needs your input"*. Recommendation: **"Can't be matched"** — it names the consequence, not the blame.
3. **Should errors block Continue?** This audit says no, per the PRD's non-blocking stance. Needs an explicit product sign-off, since it contradicts a natural reading of "error".
4. **Duplicate UPCs** — parse severity, matching concern, or neither? (Edge case 9.)
5. **Junk rows** (blank/subtotal/header) currently land in the same bucket as genuine unusable parts. Separate treatment, or accept? (Edge case 28.)
6. **Column-level notice threshold** — is 60% the right trigger, and should it link back to the mapping step? (Edge case 11.)
7. **PR #545** — which of its frontend decisions are already agreed with the backend? This audit was written without access to it, so §4 may duplicate or contradict choices already shipped there.

---

## 10. Acceptance checklist

- [ ] A row whose only identifier is a recovered/invalid value is visibly marked as unusable at the parsing step, before matching.
- [ ] A recovered value is never rendered as an ordinary clean value.
- [ ] The raw source value is retrievable for any recovered/invalid field.
- [ ] The severity model is field-agnostic — adding a new corrupted field requires no new UI.
- [ ] Severity is profile-aware (`description` / `sku-only` / `upc`).
- [ ] Exactly one banner renders, at the highest present severity.
- [ ] Errors are reachable without paging — dedicated filter, errors ordered first.
- [ ] Continuing with errors requires an explicit confirmation that names the consequence.
- [ ] Error rows are excluded from the matching step's *needs attention* count and cannot block reaching zero.
- [ ] No error row is dropped between parsing and workspace.
- [ ] Severity recomputes on edit, on mapping change, and on session resume — never cached.
- [ ] Filtered-empty renders `Empty`; pagination clamps.
- [ ] No colour-only severity; counts announced.
- [ ] `npx tsc --noEmit` clean; `ReadLints` clean on touched files.

---

## 11. File map for implementation

| Concern | File |
|---|---|
| Severity model, counts, banner copy | `src/bom/bomParsingReviewAlert.ts` |
| Row/field types | `src/bom/data/types.ts` (`BomItem`, `BomParsingReviewColumnProfile`) |
| Columns, cell rendering, edit fields | `src/bom/bomParsingReviewColumns.tsx` |
| Cell inputs | `src/bom/bomImportTableCells.tsx`, `src/bom/components/EditableSizeInchesInput.tsx` |
| Raw-value visual language | `src/bom/bomImportedDataEmphasis.tsx` |
| Page, filter, pagination, Continue | `src/bom/pages/BomParsingReviewPage.tsx` |
| Banner component | `src/bom/components/BomParsingReviewQualityAlert.tsx` |
| Row modal | `src/bom/components/BomParsingReviewRowDrawer.tsx` |
| Tags / badges | `src/bom/components/BomTags.tsx`, `src/ui/HydraTag.tsx` |
| Step chrome tag | `src/bom/components/BomUploadProgressBar.tsx`, `src/bom/bomUploadFlowStatus.ts` |
| Identifier rule, profile resolution | `src/bom/bomFieldMappingUtils.ts` |
| Demo fixtures (needs recovered/invalid samples) | `src/bom/data/bomImportFlowSeed.ts` |
| Matching handoff | `createInitialMatchResults` in `bomImportFlowSeed.ts`, `src/bom/bomMatchingReviewStatus.ts` |
| Import gating | `src/bom/hooks/useBomFinishImport.tsx` |

---

## 12. System-reuse report

- **Existing patterns reused:** the parsing-review screen's own banner / quality-tag / cell-attention / row-modal stack; the `modal.confirm` consequence pattern from `useBomFinishImport.tsx`; the *"From your file"* raw-value language from `bomImportedDataEmphasis.tsx`; the `Badge`-based status column from `bomMatchingColumns.tsx`.
- **Components:** Ant Design `Alert`, `Table`, `Tooltip`, `Input`, `Button`, `Modal`, `Empty`, `Badge`, `Typography` via `src/ui/antd.ts`; `HydraTag` from `src/ui/HydraTag.tsx`. Icons from `@ant-design/icons` only.
- **Tokens:** existing `colorWarning*` / `colorError*` / `colorSuccess*` and spacing tokens via `theme.useToken()`. **No new tokens, no new colours, no raw values.**
- **Shared/core components:** unchanged. All proposed changes are local to `src/bom/**`.
- **Gaps found with no existing pattern:** (a) a per-field "present but unreliable" cell treatment — closest precedent is `Input status="warning"`, which is an *edit* affordance rather than a *read* one; (b) a row-level "unusable" status on the parsing table — closest precedent is the matching table's Status column, which is proposed for reuse in §6.1 option B. Both are local screen-level compositions of existing atoms, not new shared components.
- **Impact:** local to the BOM import flow. Edge cases 42–45 touch the matching and import steps, which is unavoidable — an error state that has no downstream consequence is not an error state. Those changes should be a separate reviewable slice.

---

*Frontend audit only. No backend parser behaviour, API shape, or data-model persistence is recommended here.*
