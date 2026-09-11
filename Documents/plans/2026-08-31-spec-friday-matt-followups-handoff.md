# Handoff: SPEC Friday Matt follow-ups

**Date:** 2026-08-31  
**Request type:** `ui-change`  
**Status:** ready to implement — do not expand scope  
**Branch (already created, local only):** `spec-friday-matt-followups`  
**Base:** `spec` @ `9ddc8cf` (`feat(spec): ship Spec V2 workspace with analyze, edit, and review flows`)  
**Do not branch from `main`.**

## Source of truth (this work only)

Friday Gemini notes — **Product/Design Weekly, 28 Aug 2026, 09:26 EDT**:

`~/.cursor/projects/Users-milosdostanic-Documents-Work-SpaceInch-Hydra-on-hydra-app-prototype/attachments/058128d8-958e-4858-a151-48333cf5166a/Product_Design_-_Weekly_-_2026_08_28_09_26_EDT_-_Notes_by_Gemini.pdf`

Use **only** that transcript for product decisions. Ignore Kickoff (24 Aug), FigJam comments, and older SPEC plans unless a file path below is missing.

## New-chat start prompt (paste this)

```
Implement Documents/plans/2026-08-31-spec-friday-matt-followups-handoff.md
on branch spec-friday-matt-followups.

@scope-guardrails
@token-discipline
@ux-guardrails
@hydra-ui-tokens-and-components
@product-ux-rules
@hydra-ux-audit
```

Stay on `spec-friday-matt-followups`. Do not commit `.spec-audit/`, `figma-console-mcp/`, or `scripts/spec-audit/`. Do not push unless asked.

---

## Already done — do not redo

Verified in repo against Friday decisions:

| Friday decision | Current code |
|---|---|
| Upload wizard step 3 removed | `SpecAddDocumentWizardModal` — two steps only |
| No AI confidence % on upload | Wizard has no certainty tag |
| Export blocked after **manual** edits until re-analysis | `SpecExportPage` / `SpecEditPage` / `SpecAnalyzePage` disable export when `reanalysisRequired` |
| Export **not** hard-blocked for unfinished recommendations | Export allowed with undecided; assessment copy explains it |
| Concurrent edit: secondary user read-only + Refresh | `SpecEditPage` lock banner |
| Request-to-edit deferred past V1 | Do not add |
| Accept / Decline auto-advance to next item | `saveDecision` in `SpecEditPage` uses `nextToReviewRecommendationIndex` |
| Dashboard category chips (not High/Low grouping) | `SpecAnalyzePage` action filters |
| Search on listing | `AppSearchInput` on `SpecHomePage` |
| Delete SPEC | Row overflow + confirm |

---

## Implement — remaining Friday items

Work in the slices below. Each slice is reviewable. Do not batch listing + editor + export + shell into one commit unless the user asks.

### Slice 1 — Listing (`SpecHomePage`)

Matt: listing is not a BOM upload subprocess. Status column is enough. V1 has few specs → search only. No versioning.

| # | Change | How |
|---|---|---|
| 1a | Remove listing progress strip | Unmount `SpecPendingAnalysisRegion` from `SpecHomePage`. Do **not** delete `SpecAnalysisProgressStrip` — dashboard/processing still uses it while analysis runs. |
| 1b | Remove **Upload new version** from V1 | Drop the `new-version` row action and unmount `SpecUploadNewVersionModal` from `SpecHomePage`. **Do not delete** `SpecUploadNewVersionModal.tsx` / `SpecVersionHistoryModal.tsx`. |
| 1c | Remove listing filters | Remove **All Divisions** and **All Statuses** `Select`s and related state. Keep search only. Empty copy should not say “filters”. |
| 1d | Left-align Status + Review progress | Columns already sit to the right of SPEC name. Left-justify cell content (`align: 'left'` / no centered badge cluster). Keep order: **Name → Status → Review progress → …** |
| 1e | Delete confirm copy | Stop saying “version history” in the delete modal if versioning is out of V1. |

**Files:** `src/spec/pages/SpecHomePage.tsx` only for this slice (plus any listing-only helpers in that file).

### Slice 2 — Download master specs

Matt: checkbox to select **all three** templates at once. Multi-select already exists; **Select all** does not.

| # | Change | How |
|---|---|---|
| 2a | Add **Select all** | `Checkbox` (or `Checkbox.Group` header) in `SpecDownloadMasterModal` that selects/deselects all `SPEC_MASTER_CATALOG` entries. Keep existing per-item checkboxes and Download CTA. |

**Files:** `src/spec/components/SpecDownloadMasterModal.tsx`

### Slice 3 — Recommendation chrome (dashboard + editor)

Matt: no criticality tags; category filters; same chips in the editor; Accept / Decline / **Skip**; auto-advance (already works).

| # | Change | How |
|---|---|---|
| 3a | Remove priority / criticality tags | Stop rendering High / Medium / Low on cards and detail. Keep `priority` on the data model. |
| 3b | Gray out resolved items | Keep visual “resolved” treatment (already partially there on list cards). Do not replace it with a priority tag. |
| 3c | Category filters in the **editor** right rail | Reuse dashboard action-type chips (`recommendationActionLabel` / `RECOMMENDATION_ACTION_ORDER`) on the editor recommendation list so the same filter context persists. Default list order remains **document order**, not status sort. Status tabs (All / To review / Resolved) may stay as filters, not as default sort. |
| 3d | Relabel **Review later** → **Skip** | Same decision value may stay `later` in the store so auto-advance and “to review” logic keep working. Visible label + any tag text = Skip. |

**Files:**

- `src/spec/components/SpecRecommendationTags.tsx`
- `src/spec/components/SpecRecommendationListCard.tsx`
- `src/spec/components/SpecRecommendationDetailPanel.tsx`
- `src/spec/components/SpecRecommendationsListPanel.tsx`
- `src/spec/pages/SpecEditPage.tsx` (wire filters if the list panel cannot own them alone)
- `src/spec/pages/SpecAnalyzePage.tsx` only if dashboard cards still show priority

### Slice 4 — Export warning (unfinished recommendations)

Two different rules from Friday — do not mix them:

1. **Unfinished recommendations** → user **can** export; show a **warning modal** (critical / still-ASC-unfriendly language still open). Not a hard block.
2. **Manual edits outside recommendations** → **hard block** until re-analysis. Already implemented. Leave it.

| # | Change | How |
|---|---|---|
| 4a | Warning modal before export when undecided remain | Local antd `Modal` on `SpecExportPage` (and the Analyze/Edit Export CTA if they skip the page). Copy can follow Matt’s gist: remaining recommended changes / ASC-unfriendly language still unaddressed; user can still continue. Exact wording was assigned to Matt — use short, non-technical English; do not invent a severity engine. Treat any still-open recommendation (`not-reviewed` or `later`/`skip`) as the trigger. |
| 4b | Do not disable Export for undecided | Only `reanalysisRequired` / failed analysis disables Export. |

**Files:** `src/spec/pages/SpecExportPage.tsx`; Export buttons on `SpecAnalyzePage.tsx` / `SpecEditPage.tsx` only if they currently jump straight into generate without this warning.

### Slice 5 — Screen width (confirm before coding)

Matt: engineers use large desktops; don’t cap like a laptop. Lucas: the **1440px** rail is **app-wide** (`shellLayout.contentRailMaxWidthPx` via `shellContentRailStyle` in `AppShell`).

**Do not change** `src/theme/hydraAlias.ts` or `src/shell/shellContentRail.ts` in this branch unless the user explicitly says to widen the whole app.

If the user later says SPEC-only: lift the rail on SPEC routes only, without editing the token used by BOM.

---

## Out of scope

- Figma / FigJam / Kickoff (24 Aug) items not in Friday notes
- Real-time collab, request-to-edit, Word Track Changes (keep Coming soon)
- New tokens, new shared/core components, BOM/shell edits
- Deleting frozen modal **files** (`SpecUploadNewVersionModal`, `SpecVersionHistoryModal`)
- Deleting `SpecAnalysisProgressStrip` (still used during analysis)
- Ask / products / substitution / guide-specs / baseline-comparison leftover screens
- `.spec-audit/`, `scripts/spec-audit/`, `figma-console-mcp/`
- Push / PR unless asked

---

## Guardrails

- Existing Ant Design + `src/ui/antd.ts` only
- Tokens via `theme.useToken()` / `shellLayout` — no raw hex/px for design intent
- No new shared components; local composition on SPEC pages is OK
- Modal freeze: unmount entry points; do not rebuild W02 / version history internals

## Verification

- `npx tsc --noEmit`
- `ReadLints` on every touched file
- Browser: listing (no strip, no filters, no new-version, search + delete); download Select all; dashboard chips without priority; editor Skip + category filters + auto-advance; export warning when items remain; export still blocked after a manual document edit

## Suggested commit message (when asked to commit)

```
Align SPEC V1 listing and review with Friday Matt follow-ups.

```
