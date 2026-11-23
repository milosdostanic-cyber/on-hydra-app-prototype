# Cross-reference card part labels

## Scope

Update the existing result tile on both search tabs. The photo and title represent the RSFC part in both directions. The card currently leaves that relationship implicit.

## Implementation

Use the existing Hydra Card, Flex, Typography, status tag, and spacing tokens. Keep two lines below the photo and label the brand and SKU Competitor. Use the same neutral, borderless Hydra Tag for every compact count at the top right of the photo. Keep the directional count in the title. Preserve the existing keyboard and click behavior and the status tag.

Apply @hydra-ui-tokens-and-components, @scope-guardrails, @token-discipline, @ux-guardrails, @product-ux-rules, @hydra-ui-tokens, @hydra-ux-composition, @figma-repo-parity, and @hydra-ux-audit.

## Acceptance

Both tabs show the photo, part name and competitor SKU in the same positions. Counts identify what they count and keep singular and plural wording. Check the grid and match details at desktop and narrow viewport widths. Verify TypeScript and audit the touched file.

## Match details icon

Use the same outlined success check for matching specification rows as the BOM field mapping table. Verify the comparison modal in both directions.

Remove the redundant success icon next to the comparison summary. Keep each row result between the two values and retain the warning icon when specifications differ.
