# Part Cross-Reference: match details modal in the M9 / M10 format

Date: 23 Nov 2026 · Route: `/bom/cross-reference` · Ticket: BOM-431

## Goal

Milos chose to keep the modal for now (Matt asked for it to stay) and use the distilled compare layout from the design canvas (https://claude.ai/artifact/3d4qyqdw2guQxR4YEpeASz, artboards M9 and M10). Build it from Hydra DS parts with as little custom styling as possible.

## What the modal shows

- Title: "RSFC replacement for {competitor SKU}" (competitor part → RSFC) or "Competitor part for {brand} {RSFC SKU}" (RSFC part → competitor).
- Count text and a `Segmented` switch (only with more than one): "Option 1 / Option 2" over the RSFC equivalents, or the competitor parts on the RSFC tab.
- Two blocks with an arrow between them. Competitor on the left (grey, label "Competitor": SKU, brand and figure, description). RSFC on the right (blue tint, label "RSFC", photo, status tag, SKU, brand and figure, material and origin). On the RSFC tab the opened part says "RSFC, you opened this".
- One verdict line and a small table of specs both sides have: product type, size, end connection. A check when they match, a warning when they differ. Competitor values come from its description. Rows with no competitor value are hidden (no "Not in data" rows).
- Alert for the equivalent's note. On the RSFC tab, for a substitute, an Alert that names the exact match with a "Compare it" link.
- Footer: "View product" and "Submittal PDF" links (new tab) on the left, "Close" and primary "Copy SKU" on the right.

## DS parts

`Modal`, `Segmented`, `Table` (no header, no pagination, small), `Alert`, `Button`, `Typography`, `Flex`, `HydraTag` (status tag, UX-011/013), `PartPhoto`, antd icons. Colours, spacing and radius from tokens, text from Hydra text styles. No new components or tokens.

## Files

- `src/bom/components/PartCrossReferenceMatchModal.tsx`: rebuilt.
- `src/bom/pages/BomPartCrossReferencePage.tsx`: the modal now gets the opened RSFC SKU on the RSFC tab.
- `src/bom/data/partCrossReferenceData.ts`: one small helper that reads product type and end connection from a competitor description (same patterns as `rsfcPimAttributes`).

## Unchanged

Cards, filters, search, pagination, data. Modal width stays 760.

## Open (from the Confluence story, not decided)

Footer "OK" only versus "Close" + "Copy SKU"; a dash for empty competitor values versus hiding them. This build follows the canvas (Close + Copy SKU, hide).

## Checks

Type check. In the browser: both tabs, an exact match, a substitute with a note, the switch, "Compare it", Copy SKU, links, Escape and Close. Then the `hydra-ux-audit` pass.
