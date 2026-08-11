# Task 09 — Imported parts: hide catalog links

**Status:** Done  
**Related feedback:** Matt, item 9 (highlighted in screenshot)

---

## Problem

In the BOM matching flow, ASC suggestion cards labelled **Import** were showing blue **View product** and **View PDF** links — the same links that appear for domestic ASC parts. Imported/competitor parts do not have ASC catalog pages, so these links were misleading.

Matt's exact words: *"I'm still seeing the view product and other part links for imported products."*

---

## What was changed

| File | Change |
|------|--------|
| `src/bom/bomWorkspaceDashboard.ts` | Added `ascPartShowsCatalogLinks(part)` helper — returns `true` only for Domestic parts |
| `src/bom/components/BomMatchingReviewPartPanel.tsx` | `AscEquivalentCard`: hides **View product** and **View PDF** for Import cards |
| `src/bom/components/BomMatchDetailDrawer.tsx` | Detail drawer: hides **View product page** and **View submittal** for Import matches |
| `src/bom/components/BomSkuVariantPicker.tsx` | SKU variant card: hides **View submittal** when `variant.domesticImport === 'Import'` |

---

## Rule

| Badge | Catalog links |
|-------|--------------|
| **Domestic** | Shown (real ASC product with a catalog page) |
| **Import** | Hidden (no ASC catalog page; links were confusing) |

---

## Test checklist

- [ ] Guided review → **HOW WE MATCHED IT** → Import card → no View product / View PDF
- [ ] Guided review → **HOW WE MATCHED IT** → Domestic card → links visible
- [ ] Matching table → click Import row → drawer shows no product/submittal links
- [ ] Matching table → click Domestic row → drawer shows links
- [ ] Figure-only row → SKU picker → Import variant → no View submittal
- [ ] Figure-only row → SKU picker → Domestic variant → View submittal visible
- [ ] YOUR PART / Original part columns are still plain text (unchanged)
