# Part Cross-Reference: simpler result cards (T2 format)

Date: 23 Nov 2026 · Route: `/bom/cross-reference` · Ticket: BOM-431

## Goal

Milos picked the "T2 · Status on photo" tile on the design canvas (https://claude.ai/artifact/3d4qyqdw2guQxR4YEpeASz). The result cards must carry less information and read faster. The photo is always there.

## T2 format

- Photo area on top, full card width, white, with a bottom border.
- Top-left on the photo: the match status as `Badge__Status` (antd `Badge status`: dot + label) on a small white label. Exact match = success, Substitute = warning.
- Top-right on the photo: the match count ("2 options" / "1 option"), grey, only when there is more than one.
- Below the photo, two lines: the part name (one line, ellipsis + tooltip) and one secondary line.
  - Competitor part → RSFC: the name is the best RSFC match. The secondary line is "For {brand} {competitor SKU}", because the list is grouped by competitor part.
  - RSFC part → competitor: the name is the RSFC part. The secondary line is "Matches {brand} {competitor SKU}" of the first match.
  - Substitute with a note: the status label reads "Substitute · check" and shows the note in a tooltip. The secondary line stays, because in a list the user must always see which competitor part a card belongs to. (Changed during the build: the T2 mock replaced the secondary line with the note.)

## Removed from the card (kept in the match details modal)

The competitor description, the "Brand · Fig. · Size" and "Brand · Fig. · SKU" meta lines, the Domestic/Import tag, the coloured match-type tag and the grey "Best of N matches" block.

## Files

- `src/bom/components/PartCrossReferenceCard.tsx`: rebuild `CompetitorPartCard` and `RsfcPartCard` on one shared tile. Keep the `MatchTypeTag`, `OriginTag` and `PartPhoto` exports, because the match modal uses them.
- `src/bom/pages/BomPartCrossReferencePage.tsx`: the grid minimum column goes from `controlHeight * 9` to `controlHeight * 8`, so the narrower tiles fit 4 per row. Page size stays 12.

## Unchanged

Filters, toolbar, the match modal, pagination, data and search. The whole card stays the one action (click, Enter or Space opens the modal), with the same hover/focus border.

## Checks

Type check. In the browser at `/bom/cross-reference`: both tabs, a substitute card, the column count, hover/focus, and the modal still opens. Then the `hydra-ux-audit` pass on the cards.
