# Task 07b — No "Confirm match" after changing a part in the matching table

**Source:** Matt feedback (item 7 follow-up) — highlighted comment in screenshot  
**Branch:** `bom-upload-match-review-plan`

---

## Problem

On **Matching results** (`/bom/projects/new/matching/table`), when a user changes a part (**Change match** → picks a new ASC part), the row stayed in **Ready to confirm** with a **Confirm match** button. That was redundant — the user had already made the choice.

---

## What was done

- `src/bom/hooks/useBomChoosePartDrawer.tsx` — added optional `autoAcceptOnSelect`. When `true`, after picking a part the row is set to `lineStatus: 'accepted'` instead of `'pending'`.
- `src/bom/pages/BomMatchingPage.tsx` — hook called with `autoAcceptOnSelect: true`. Updated `handleApplySkuVariant` to auto-accept the row when SKU is selected and the match is ready.
- Guided review (`BomProgressiveMatchingPage.tsx`) still uses default `autoAcceptOnSelect: false` — confirm flow there is unchanged.

---

## Test plan

1. Complete guided review → **Continue to import summary** → `/matching/table`
2. On an accepted row: `…` menu → **Change match** → pick another part
3. **Expected:** row immediately shows **Chosen** status, action becomes **Change match** (in menu), no **Confirm match**
4. **Save and import to BOM** remains the only global confirmation
5. On guided review (`/matching/review`): **Choose different part** → pick → still requires **Confirm and continue** (unchanged)
6. Figure-only row on table: **Pick exact product** → select SKU → row auto-accepted
