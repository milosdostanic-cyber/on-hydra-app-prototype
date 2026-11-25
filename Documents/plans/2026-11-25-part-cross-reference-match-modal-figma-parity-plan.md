# Plan: Part Cross-Reference match details modal, Figma parity

## Meta
- **Date:** 2026-11-25
- **Request type:** figma-delta (BOM, Part Cross-Reference)
- **User request summary:** Build the match details modal in the repo the same way as the new Figma modals (05a, 05b, 05c with 1, 3 and 6 options).
- **Status:** approved by Milos in chat ("isti to sa takvim modalima treba i u repo"); Phase 1 and Phase 2 implemented 2026-11-25, type check passes, checked in the browser, not committed
- **Plan file:** Documents/plans/2026-11-25-part-cross-reference-match-modal-figma-parity-plan.md

## Source
- Figma: BOM - RSFC `Ht3Up5MlRAKjK7eCuAy05L`, section "03 · Match details · Modal" (node 7926:22448), screens 05a, 05b, 05c.
- Components: "RSFC Option Card" (7962:130173), "Part match body" (7961:142).

## Rules that apply
- AGENTS.md BOM rules (non-technical user, no spreadsheet feel, progressive disclosure, do not touch Content File Manager).
- `@hydra-ux-pattern` UX-010 (row actions are small default buttons), UX-011 and UX-013 (match quality is a status tag, Type and origin are colourful tags), UX-014 (modal body is its own component).
- `@token-discipline`, `@scope-guardrails`, `@hydra-ui-tokens`.

## Current flow audit
- `src/bom/components/PartCrossReferenceMatchModal.tsx`: modal 1032 wide, title "Competitor Part Match", "Your Part" column, "RSFC Equivalents (N)" with an "All origins" Select, cards with a divider, "SKU …" text plus "Copy SKU" button, "View Submittal PDF". Figure results list all SKU variants inline.
- Data has at most 2 options per competitor part.

## Gap table
| Requirement (Figma) | Current | Gap |
| --- | --- | --- |
| Title "RSFC replacements for <SKU>" | "Competitor Part Match" | Change title |
| Modal 800 wide: Your part 232 + options 496 | 1032 wide, 1fr / 2fr | Fixed columns on desktop, one column on narrow screens |
| Count "N RSFC options" | "RSFC Equivalents (N)" | Change label |
| Groups "Best match" and "Other options" when there is more than 1 option | No groups | Add groups |
| No filter or tabs in the modal | "All origins" Select | Remove Select |
| Card: photo, name, meta, tags, footer with Copy SKU button labelled "SKU <number>" and "Submittal PDF" link, no divider | Divider, separate SKU text, "View Submittal PDF" | Restyle card |
| Figure match: "Show N SKUs" button | Variant list always open | Variant list behind the button |
| Max height: screen minus 200px, only the options list scrolls | Whole body scrolls at 72dvh | Scroll only the list |
| 3 and 6 option examples | Max 2 options | Add illustrative demo options to V030716PE0 (3) and V040716PE0 (6) |

## Phases
### Phase 1 — Modal and card
- **Files:** `src/bom/components/PartCrossReferenceMatchModal.tsx`
- **Keep:** status tag for match quality (UX-013) instead of the colourful match tag used in the Figma draft, origin colourful tag, `note` alert, "View product" link when a product URL exists.
- **Must not change:** results page, filters, `PartCrossReferenceCard.tsx`.

### Phase 2 — Demo data for 3 and 6 options
- **Files:** `src/bom/data/partCrossReferenceData.ts`
- Add illustrative options (marked in a comment as not verified) to V030716PE0 and V040716PE0 only. Result card counts and filter counts change for those two parts.

## Acceptance checklist
- [ ] Modal title, width, count and groups match Figma 05a, 05b, 05c.
- [ ] No Select or tabs in the modal.
- [ ] Copy SKU copies the SKU and shows a message; Submittal PDF opens the PDF.
- [ ] With 6 options the modal stops at screen height minus 200px and only the list scrolls.
- [ ] Narrow screens show one column.
- [ ] `npm run build` passes.

## Open questions
- The Figma draft uses colourful tags for match quality. The code keeps status tags per UX-013 until design decides.
