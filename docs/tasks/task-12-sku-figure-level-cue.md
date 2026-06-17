# Task 12 — SKU vs figure-level UI cue

**Status:** Done  
**Related feedback:** Matt / James, item 12

---

## Problem

When the matcher finds a **product family (figure)** but not an exact SKU, users need a light UI cue and plain-language text explaining why they must go one level deeper to pick a sellable variant.

James suggested: *"a text based detail for that part that basically explains why they have to 'go one level deeper' to select."*

---

## What was changed

| File | Change |
|------|--------|
| `src/bom/bomMatchSkuUtils.ts` | Shared copy helpers: `figureLevelMatchCardTitle`, `figureLevelMatchExplanation`, `figureLevelMatchTableHint` |
| `src/bom/components/BomMatchingReviewPartPanel.tsx` | Figure cards: title suffix "— select SKU variant" + inline explanation; **Select SKU** panel header cue |
| `src/bom/bomMatchingColumns.tsx` | **Product family** badge + hint in **Our Part** for rows awaiting SKU |
| `src/bom/components/BomMatchDetailDrawer.tsx` | Info alert with full explanation when SKU still needed |
| `src/bom/bomMatchingReviewAlert.ts` | Guided review banner uses same explanation copy |
| `src/bom/components/BomTags.tsx` | Clearer tooltip on **Product family** badge |

---

## Rule

| Match level | UI cue |
|-------------|--------|
| **Product family (figure)** | Badge + text: pick exact SKU on the right / via action before confirm |
| **Exact product (SKU)** | **Exact product** badge — no extra depth required |

---

## Test checklist

- [ ] [Guided review](http://localhost:5173/bom/projects/new/matching/review) → figure-level row (e.g. sprinkler) → card title ends with "— select SKU variant"
- [ ] Same row → inline gray text explains product family + SKU panel on the right
- [ ] **Select SKU** column visible with variant cards
- [ ] [Matching table](http://localhost:5173/bom/projects/new/matching/table) → unresolved figure row → **Product family** badge + hint text
- [ ] Detail drawer on figure row → info alert with explanation
- [ ] SKU-confirmed / exact-product rows → no figure-only cue
