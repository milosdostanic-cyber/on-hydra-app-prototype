# Figure match filter

## Scope and implementation

Add Figure match to the existing Match type facet on both search tabs. Keep SKU match values compatible with the existing state. Treat the facet as a union of selected match types. Count matching result cards using the current query, category and other facets. Figure records continue to honor the attributes available at figure level.

Use the existing Hydra checkbox group, count and zero-result behavior. Group Origin and the existing attributes under RSFC part. Keep the same match labels in the panel and applied chips.

Apply @hydra-ui-tokens-and-components, @scope-guardrails, @token-discipline, @ux-guardrails, @product-ux-rules, and @hydra-ux-audit.

## Acceptance

Verify the displayed count matches filtered results in both directions. Verify combining Figure match with a SKU match, removal and reset, and a zero-result filter value. Verify the panel on the normal route and run TypeScript.

Use the standard checkbox label for Figure match in the filter panel, with the existing count.
