# Part Cross-Reference mapping levels

## Scope

Implement the accepted card proposal in the prototype's Part Cross-Reference route. The current grid only represents SKU-level results and displays a category sample photo for every tile. Use explicit mapping levels, real available imagery and representative edge cases in both directions. This plan applies only to this prototype repository.

## Implementation

Use @plan-orchestrator and @prd-ux-implementation-planner with the BOM PRD's figure and SKU requirements. Apply @hydra-ui-tokens-and-components, @hydra-ux-audit, @token-discipline, @scope-guardrails, @product-ux-rules, @ux-guardrails, @hydra-ui-tokens, @hydra-ux-composition and @figma-repo-parity.

1. Model figure mappings independently from exact and substitute SKU mappings. Use the verified Victaulic 717 to Gruvlok 78FP and Victaulic 712 to Gruvlok 90G, 7811 and 7821 examples. The figure mappings come from the main Hydra repository’s `valve_figure_level_matches.csv` on commit `58e547e`. Keep the fixtures local to the prototype and use only attributes the fixture provides.
2. Reuse the existing grid and card composition. Keep the mapping status in the upper left and a neutral count in the upper right. Present the RSFC and competitor identifiers in two lines. Use the RSFC catalog photos verified against the demo SKU or figure and keep the media area the same height and reuse the catalog placeholder when the image is unavailable. Verified image references come from the catalog seed `1765751921837_seed_content_with_metadata.sql` on the same commit.
3. Show a range of examples in browse mode by surfacing the first result per source figure before repeated SKU variants. Prioritize an explicit figure lookup when that figure has a mapping. Keep results, facet counts and pagination consistent.
4. Preserve the SKU comparison, using the clicked filtered result and matching count. Add a figure details state with a choice of candidate figures and the RSFC SKU variants available in this prototype for the selected figure. Copy SKU remains available in SKU details.
5. Verify both directions, direct figure and SKU searches, multiple options, substitute caveats, unavailable photos, filtered results, no matches, keyboard activation and the normal build.

## Guardrails

Use existing Hydra Card, Tag, Flex, Typography, Modal, Segmented, Alert and Table components and their tokens. Keep the existing navigation and filter controls. The scope is the cross-reference page, its demo data, its modal and card components, and the necessary local catalog photos.

## Equal-height tiles and a recognized SKU with no verified match

Keep every card's media area and two identity rows the same size. Reuse CatalogThumbnailPlaceholder for absent or failed images. Demonstrate the no-match state with the known Victaulic L020441XE0 source row, which has no target in the committed cheat-sheet sample. Show it as the first card for an empty competitor query without RSFC filters so it is visible in a narrow viewport, and on an exact competitor SKU lookup when no matched results exist. Respect the selected category in both cases and keep the example separate from the matched facet counts. Keep the unknown query and filtered-empty states separate. The card opens the source details and clearly states what is available in the prototype.

Give the RSFC and match-status tags a full-width row in SKU details. Place the photo and identifiers on the row below. Stack the comparison panels at the narrow Hydra breakpoint so the tags fit side by side.
## Catalog photography coverage for exact SKU cards

Check all 22 exact SKU fixtures against the Hydra catalog seed and official ASC product pages. Keep the known variant-level photo and reuse the manufacturer photo of the displayed model where the fixture identifies that product. Use the existing 7811 and 78FP photos and add the official 7401 painted coupling photo. Keep the placeholder for the four 7800 Venturi/flow-kit fixtures because the manufacturer photo shows a standard assembly, and for 0390006048 because the demo material and catalog model do not agree.

Sources: [7811 Check Valve](https://www.asc-es.com/products/7811-check-valve), [78FP Check Valve](https://www.asc-es.com/products/78fp-check-valve) and [7401 RigidLOK Coupling](https://www.asc-es.com/products/7401-rigidlok-coupling). Restrict changes to the prototype photo lookup and its local assets. Verify image loading, placeholder cases and equal card height in both directions.

## Verified SKU examples and photo ownership

Add three Equal mappings from the cheat sheet on commit `58e547e` whose target SKU is linked to the matching ASC catalog figure and a product photo. Use Victaulic L020007PT0 to Gruvlok 0390013662 (7401), L030489XE0 to 0390065308 (7401SS), and V050717PE0 to 7005010181 (78FP). Reuse the official 7401 and 78FP assets and add a thumbnail of the ASC 7401SS photo. Use the catalog placeholder for RSFC cards without a photo.

Put the source part first in both directions. Use a compact text card in Competitor → RSFC, with the competitor identifier above a full-contrast RSFC suggestion, and show the photo of the suggestion in the modal. In RSFC → Competitor, keep the photo and RSFC identifier together above the competitor footer. Maintain equal height within each result grid using Hydra spacing and typography. Verify both tab directions, the three new SKU lookups, the shared SKU modal photos and the height of cards with photos and placeholders. Link the three new SKU modals to the verified ASC figure pages because these SKUs are outside the prototype search catalog.

Sources include [ASC 7401](https://www.asc-es.com/products/7401-rigidlok-coupling), [ASC 7401SS](https://www.asc-es.com/products/7401ss-stainless-steel-rigid-coupling) and [ASC 78FP](https://www.asc-es.com/products/78fp-check-valve).

## Reverse comparison, figure status and page size

Set the Cross-Reference page size to 20 in both directions. Use Hydra's bordered geekblue preset for Figure match on the card, applied filter and figure details. Use the standard checkbox label in the Match type filter.

Keep the search source first in both the SKU and figure details. In RSFC → Competitor, give the competitor identifier primary text contrast on the card, label the specs by side and make the primary action copy the selected competitor SKU. Identify the RSFC product links as source references. Reuse the verified Gruvlok 7811 catalog photo on its figure result and explain how an RSFC SKU lookup can verify a competitor SKU match from figure details.

Verify the result ranges and filter reset, figure tags and images, both comparison orders, clipboard values and narrower modal layouts. Use the existing Hydra components and tokens with @hydra-ux-audit.

## Substitute pressure alert

Show the selected option's pressure caveat immediately below the option controls and above the part comparison. Use the Hydra warning Alert with an icon, a short title and the pressure limit and verification instruction in the description. Verify the warning appears for the pressure-limited substitute in both search directions.

## Photo-first reverse preview and substitute warning

In the unfiltered RSFC-to-competitor preview, show verified photo results and up to one placeholder per result kind. Keep all records available to explicit searches, categories and facet filters. Reuse the current photo lookup, placeholder and grid.

Display one Hydra warning immediately after the option controls whenever the selected SKU is a substitute. Keep a specific caveat when present and place any exact-match suggestion and its action in the same alert. Keep ordinary exact matches clear of a substitute warning.

Verify the photo and placeholder count across pages, retrieval of a photo-less SKU by search, and the alert order for each search direction, including the pressure caveat and switches between match types.

## RSFC option labels

Label the RSFC option selector with the brand and figure. Include the SKU in the label only when multiple selectable options share the brand and figure. Use the existing Hydra Segmented control with vertical options on narrow screens. Verify the selected panel and Copy SKU action for Victaulic V040716PE0 and the fit of longer labels.

## Search page headline

Set the main Cross-Reference page headline to Search RSFC Parts. Verify the heading and the current supporting description.
