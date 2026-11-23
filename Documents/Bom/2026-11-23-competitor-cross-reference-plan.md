# Competitor to RSFC cross-reference

## Scope

Implement the Nov 23 product weekly decisions on the prototype branch. Reuse Hydra UI components and the BOM guidance for figure and SKU matching.

## Implementation

1. Browse all mapped competitor parts by default. Keep text search, category, and 20 results per page. Remove reverse view and the unmatched demo record. Show competitor description, brand, and SKU or figure first, with match status and count below.
2. Derive facets from the current search and category. Count unique result cards bidirectionally across facets. Apply all selected RSFC filters to the same replacement. Use Brand for the competitor manufacturer, Match type for the mapping, and structured RSFC demo fields for Origin, Product type, and Size. Confirm additional PIM attributes and brand semantics with Ivan before expanding the production contract.
3. Use the Hydra dev Competitor Part Match layout, with the source details, RSFC equivalents list, origin selector, per-SKU copy, and verified catalog submittal links. Retain notes for exact matches and substitutes. List mapped figure families and available catalog variants in figure details.
4. Verify initial browse, legacy URLs, search, filters and empty states, pagination, figure and SKU details, copy, PDF destinations, and the build.

Apply @prd-ux-implementation-planner, @hydra-ui-tokens-and-components, @scope-guardrails, @token-discipline, @ux-guardrails, @product-ux-rules, @hydra-ui-tokens, @hydra-ux-composition, @figma-repo-parity, and @hydra-ux-audit.

## Card typography and tags

Lead with the description in Hydra Large/Medium and render the part identifier and facet counts in Base/Normal. Use the borderless variants for colored tags in this flow. Ant Design's default Tag uses the small type token. The existing Hydra Tag components apply the project’s Base/Normal typography.

## Modal layout and result views

Show the source part in a compact summary. Lead each replacement with its description and place copy, product and submittal actions with that replacement. Keep notes above the actions. Offer an origin selector when the displayed matches include more than one origin. Keep long lists scrollable within the dialog.

Add Cards and Table views over the same paginated results. Show identical identifiers, mapping status and counts. Preserve search, filters and the current page when switching views. Verify opening both types of match details from the table and cards.

Use Hydra segmented view icons with tooltips and accessible names. Set the identifier value in Base/Medium within the Base/Normal metadata row.
