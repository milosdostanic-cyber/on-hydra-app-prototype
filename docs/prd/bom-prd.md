# PRD — Bill of Materials Upload & Match Review Workflow

## 1. Overview

The Bill of Materials workflow needs to be redesigned to make the import, mapping, review, and final selection process easier for non-technical users.

The current flow exposes too much technical complexity too early, especially around column mapping, parsed data, matching confidence, and SKU-level selection. The new V1 experience should guide the user through a clearer left-to-right process: upload BOM data, intelligently map columns, review match quality, confirm or correct matched parts, select SKU-level variants when needed, and finalize the imported BOM.

The goal is not to turn the user into a technical data-mapping expert. The system should do as much work as possible automatically, then ask the user for confirmation only when needed.

---

## 2. Problem Statement

The existing BOM workflow is too technical and potentially overwhelming for the target user.

Key issues:

- Users may not understand manual column mapping.
- The interface currently exposes technical mapping logic instead of guiding users through a simple review process.
- Yellow or warning-style indicators can be misread as blockers, even when they are only warnings about incomplete or low-quality parsed data.
- Rows appear too much like an editable spreadsheet, which can make users feel they are responsible for manually completing all missing technical fields.
- When no match is suggested, the current “Refine” action is misleading.
- Users need more information about matched ASC parts before they can confidently accept a match.
- Matching at the figure number level is not always enough; the workflow must guide users to a SKU-level selection where required.
- The final BOM result must clearly show the selected figure number and SKU/variant relationship.

---

## 3. Goals

### Primary Goals

- Make the BOM upload process easier for non-technical users.
- Automatically derive column mapping whenever possible.
- Reduce manual mapping and editing as much as possible.
- Introduce a guided review step between parsing and final import.
- Clearly communicate match quality and low-confidence rows.
- Allow users to confirm matched parts one by one.
- Support missing-match scenarios with a clear “Choose” action.
- Guide users from figure-level matches to SKU-level selection when needed.
- Ensure the final BOM output displays selected figure numbers and SKU-level variants clearly.

### Secondary Goals

- Keep the experience aligned with existing app patterns.
- Avoid overwhelming users with spreadsheet-like editing.
- Use progressive disclosure for advanced metadata.
- Preserve context between original imported data and selected ASC parts.
- Use Figma as the main way to communicate design intent to the client and internal teams.

---

## 4. Non-Goals

- This PRD does not cover Content File Manager functionality.
- This PRD does not define backend matching algorithm logic in detail.
- This PRD does not define final industry terminology for all parent-child labels; terminology should be validated with James.
- This PRD does not require a fully functional prototype for client review.
- This PRD does not require users to manually map every BOM column unless the system cannot confidently derive the mapping.

---

## 5. Users

The primary users are people who upload competitor BOM files and need to translate them into ASC-equivalent parts.

They may understand the industry and parts, but they should not be expected to understand technical column mapping, parsing logic, match confidence calculations, or backend data requirements.

The workflow should assume the user needs guidance, clear CTAs, and contextual help.

---

## 6. Current V1 Context

The BOM V1 flow already includes:

- Project list
- BOM list
- BOM upload
- Mapping screen
- Parsed/matching results
- Final import/save action

However, the existing experience needs to be redesigned so that the system handles intelligent mapping and guides the user through match review before finalizing the BOM.

---

## 7. Proposed User Flow

### Step 1 — Upload BOM

The user uploads a BOM file containing competitor parts.

The system parses the uploaded file and attempts to identify relevant columns and values automatically.

Expected detected data may include:

- Description
- Part number
- Figure number
- Manufacturer
- SKU-level attributes
- Quantity
- Other imported metadata

---

### Step 2 — Smart Mapping Summary

After upload, the user should not immediately land in a technical mapping table.

Instead, the system should show a simplified smart mapping summary.

The system should:

- Automatically map known or likely columns.
- Show what was mapped from the uploaded BOM.
- Show which ASC fields the uploaded columns were mapped to.
- Clearly state whether the user needs to take action.
- Allow the user to continue if the mapping looks acceptable.
- Allow the user to refine mapping only if needed.

Recommended behavior:

- If mapping confidence is high, show a simple confirmation screen.
- If some columns are uncertain, show a warning and allow refinement.
- If mapping cannot proceed, require refinement before continuing.
- If the uploaded file contains one concatenated column, place it into the description field by default.

The interface should follow a left-to-right mental model:

- Left side: user-uploaded BOM data
- Right side: mapped ASC field

The ASC field should not appear as the starting point. The user’s uploaded data should lead the flow.

---

### Step 3 — Advanced Mapping / Refinement

This step should be one layer deeper, not the default experience.

Users should only enter this view when:

- The system cannot confidently map the uploaded columns.
- The user manually chooses to review or refine the mapping.
- A required mapping is missing and blocks the workflow.

The advanced mapping view should still keep the left-to-right logic:

- Left: uploaded BOM column
- Right: mapped ASC field

The user should be able to adjust mappings, but the UI should avoid making the entire experience feel like a spreadsheet that must be completed manually.

---

### Step 4 — Parsed Data Quality Review

Before matching results are finalized, the system should communicate whether the uploaded rows are likely to produce good matches.

The system should identify rows with insufficient or weak data.

For example:

- High-quality rows: enough data exists to produce accurate matches.
- Medium-quality rows: some data exists, but match accuracy may be limited.
- Low-quality rows: not enough data exists to confidently match.

Low-confidence rows should be visually highlighted with warning cues, such as a yellow/orange row indicator.

The warning should not imply that the user is blocked unless the system truly cannot continue.

The system should explain:

- Which rows may not match well.
- Why they may not match well.
- What the user can do to improve the result.
- Whether the user can continue anyway.

Suggested copy direction:

“Some rows may produce less accurate matches because the uploaded data is incomplete. You can add more information now or continue with the current data.”

Actions:

- Continue with current data
- Edit row details
- Review low-confidence rows

---

### Step 5 — Match Review Step

An intermediate review step should be introduced between parsing and final translation/import.

This should act as a guided progress-based review flow, not just a dense results dashboard.

The user should review matched parts one by one.

The review step should show:

- Current progress
- Original imported part information
- Suggested ASC match
- Match type or match confidence
- Match score as metadata
- CTA to confirm the match
- CTA to skip
- CTA to choose another part
- CTA to view more details

Example structure:

- “Reviewing 1 of 30 parts”
- Original imported part
- Suggested ASC part
- Match confidence: High / Medium / Low
- Match score
- Product image
- Key metadata
- Confirm and continue
- Skip
- Choose different part

When the user confirms a match, the workflow should automatically advance to the next item.

If the user skips an item, the system should track it and show skipped items before final import.

---

## 8. Matched Part Detail View

Users need enough information to confidently decide whether the suggested ASC part is correct.

A matched ASC part should be clickable and open a detailed view.

This can be a modal or a dedicated page, depending on complexity.

The detail view should include:

- ASC part name
- Figure number
- SKU/variant information if available
- Product image
- Product URL
- Relevant PDF/submittal link
- Key part metadata
- Match confidence or match score
- Related parts if applicable
- Original imported data used for matching

Primary actions:

- Confirm match
- Choose different part
- Go to next part
- Back to review

The detail view must support enough context for users to verify the part without losing their place in the BOM flow.

---

## 9. Missing Match Handling

If the system does not suggest a part, the action should not be labeled “Refine.”

Use “Choose” instead.

Reason:

- “Refine” implies the system already has a match that can be improved.
- “Choose” better communicates that the user needs to manually select a part.

When no part is suggested:

- Show “Choose” CTA.
- Take the user to a search experience.
- The search experience should include categorized parts.
- Featured parts should help guide users toward relevant mid-level categories.
- The user should be able to search and select a part.
- After selection, the user returns to the review flow.

Open UX decision:

- Decide whether the search should open as a modal, drawer, or full page.
- The preferred direction is to keep the user inside the BOM review context as much as possible.

---

## 10. SKU-Level Selection Requirement

The workflow must guide users to SKU-level detail.

Figure-level matching is not always enough.

Definitions for this PRD:

- Figure number: the parent part or part family.
- SKU: a specific variant under a figure number.
- Variant: a specific selectable version of a part, such as size, finish, domestic/import, painted/unpainted, or other attributes.

The matching algorithm may return:

1. A direct SKU-level match.
2. A figure-level match only.
3. Multiple possible figure-level matches.
4. No confident match.

If the algorithm returns only a figure-level match, the UI must guide the user one layer deeper to select the correct SKU/variant.

The user flow must not stop at the parent figure number when SKU-level selection is required.

---

## 11. SKU Selection UI

When a match is at figure-number level only, the UI should expose available SKU variants in a controlled way.

Recommended pattern:

- Expand/collapse list under the figure number.
- Show available SKU variants.
- Keep the list compact to avoid overwhelming the user.
- Surface the metadata that differentiates each SKU.

Variant metadata may include:

- Size
- Finish
- Domestic/import
- Painted/unpainted
- Other product-specific attributes
- Image/icon if useful
- Product/submittal link if available

The UI should make it clear:

- The figure number is the parent.
- The SKU is the selectable child/variant.
- The final BOM quantity applies to the selected SKU-level item.

---

## 12. Final BOM Dashboard

After review is complete, the final dashboard should summarize the imported BOM in a concise table.

The dashboard should show:

- Original imported part reference
- Selected ASC figure number
- Selected SKU/variant
- Quantity
- Match confidence or match status
- Review status
- Link to parent figure number
- Link to relevant submittal/PDF
- Option to view original import metadata

The final state should make the parent-child relationship clear without cluttering the table.

Recommended approach:

- Primary table row should focus on the selected SKU/variant.
- Figure number should be shown as a reference/link.
- Submittal/PDF should be accessible from the SKU-level row.
- Original imported metadata should be available through progressive disclosure, such as tooltip, menu, or secondary action.

---

## 13. Original Import Metadata

Even after the match is complete, users should be able to see what original imported data led to the selected ASC match.

This should not dominate the primary UI.

Recommended patterns:

- Tooltip
- “View original data” menu item
- Secondary details panel
- Three-dot row action

Metadata may include:

- Original competitor description
- Original part number
- Original manufacturer
- Original quantity
- Original row data
- Parsed fields used for matching

---

## 14. UX Principles

The redesigned BOM workflow should follow these principles:

- System first, user confirms.
- Do not expose technical mapping unless necessary.
- Keep the flow left-to-right: uploaded BOM → ASC mapping/match.
- Warn users clearly, but do not create false blockers.
- Avoid spreadsheet-like default editing.
- Use clear CTAs instead of passive editable fields.
- Use progressive disclosure for advanced metadata.
- Guide users step by step.
- Always aim for SKU-level final selection.
- Keep users inside the BOM context when searching or choosing replacement parts.

---

## 15. Key Edge Cases

### Edge Case 1 — High Confidence Mapping

The system maps all or most uploaded columns automatically.

Expected behavior:

- Show smart mapping summary.
- Let user continue without entering advanced mapping.
- Provide optional “Review mapping” action.

---

### Edge Case 2 — Partial Mapping Confidence

The system maps some columns but is uncertain about others.

Expected behavior:

- Show warning.
- Explain what is uncertain.
- Allow user to continue if non-blocking.
- Require refinement only if required fields are missing.

---

### Edge Case 3 — Single Concatenated Column

The uploaded BOM contains one column with combined information.

Expected behavior:

- Map the column to description by default.
- Continue parsing from description.
- Warn the user that match accuracy may be lower.

---

### Edge Case 4 — Low-Quality Row Data

Some rows do not contain enough data for confident matching.

Expected behavior:

- Highlight affected rows.
- Explain that the result may be less accurate.
- Allow user to add more information.
- Allow user to continue if the workflow supports it.

---

### Edge Case 5 — No Suggested Part

The system cannot suggest a matching ASC part.

Expected behavior:

- Show “Choose” CTA.
- Open part search or categorized part selection.
- User selects a part manually.
- User returns to review flow.

---

### Edge Case 6 — Figure-Level Match Only

The algorithm identifies the likely figure number but not the final SKU.

Expected behavior:

- Show the figure number match.
- Explain that SKU/variant selection is required.
- Display available variants.
- User selects the correct SKU.
- Final BOM uses selected SKU-level item.

---

### Edge Case 7 — Multiple Possible Figure Matches

The algorithm returns multiple possible figure numbers.

Expected behavior:

- Show candidate figure numbers.
- Allow expand/collapse review.
- Show key metadata for each candidate.
- User selects the correct figure number.
- User then selects the correct SKU if needed.

---

### Edge Case 8 — User Skips Review Item

The user skips a part during guided review.

Expected behavior:

- Track skipped item.
- Show skipped count in progress.
- Bring skipped items back before final import.
- Allow import only if product rules allow incomplete review.
- If incomplete import is allowed, warn the user clearly.

---

### Edge Case 9 — User Tries to Import Without Reviewing All Items

Expected behavior:

- Show warning.
- Explain how many items are unreviewed, skipped, or missing matches.
- Depending on business rules, either block import or allow import with warning.

Open decision:

- Confirm whether final import should be blocked until all rows are reviewed and selected.

---

### Edge Case 10 — User Needs to Verify Parent Figure Later

Expected behavior:

- Provide link from selected SKU back to parent figure number.
- Provide link to relevant submittal/PDF.
- Allow user to confirm the selected SKU belongs to the correct parent family.

---

## 16. Functional Requirements

### Smart Mapping

- The system must automatically derive column mappings where possible.
- The system must show a simplified smart mapping summary.
- The system must allow advanced mapping only when needed.
- The system must maintain left-to-right mapping logic.

### Row Quality Feedback

- The system must identify rows with low match probability before final matching.
- The system must visually indicate low-confidence rows.
- The system must explain whether user action is required.

### Match Review

- The system must include a guided match review step.
- The system must show progress.
- The system must allow confirm, skip, and choose different part actions.
- The system must retain match score visibility at part level.

### Part Detail

- The system must allow users to open a matched part detail view.
- The detail view must include images, metadata, product URL, and PDF/submittal links where available.
- The user must be able to confirm the match from the detail view.

### Missing Match

- The system must use “Choose” when no part is suggested.
- The user must be able to search or browse categorized/featured parts.
- The selected part must be added back into the BOM review flow.

### SKU Selection

- The system must support SKU-level final selection.
- If only a figure number is matched, the system must guide the user to select a SKU.
- The system must show SKU variants in a digestible format.

### Final Dashboard

- The final dashboard must show selected figure number and SKU/variant.
- The dashboard must include links to parent figure number and submittals where available.
- The dashboard must provide access to original imported metadata via progressive disclosure.

---

## 17. Acceptance Criteria

### Smart Mapping

- Given a user uploads a BOM with recognizable columns, when parsing completes, then the system automatically maps columns and shows a smart mapping summary.
- Given the system has high confidence in the mapping, when the summary is shown, then the user can continue without opening advanced mapping.
- Given the system cannot confidently map required fields, when the summary is shown, then the user is prompted to refine the mapping before continuing.
- Given the uploaded data is a single concatenated column, when parsing completes, then the system maps it to description by default.

### Low-Confidence Rows

- Given some rows have insufficient data, when the user reaches the parsed data review, then those rows are visually highlighted.
- Given a row is low confidence, when the user views it, then the UI explains that match accuracy may be lower.
- Given low-confidence rows are non-blocking, when the user chooses to continue, then the system proceeds while preserving the warning state.

### Match Review

- Given matching is complete, when the user enters review, then they see a progress-based flow instead of only a dense results table.
- Given the user confirms a match, when confirmation is complete, then the system advances to the next part.
- Given the user skips a match, when they finish the review flow, then skipped items are shown before final import.
- Given a matched part is displayed, when the user opens details, then image, metadata, URL, PDF/submittal, and match score are available if present.

### Missing Matches

- Given no part is suggested, when the row is displayed, then the CTA says “Choose” instead of “Refine.”
- Given the user clicks “Choose,” when the selection experience opens, then they can search or browse categorized/featured parts.
- Given the user selects a part manually, when selection is complete, then the selected part is returned to the BOM review flow.

### SKU Selection

- Given the algorithm returns a SKU-level match, when the review item is shown, then the SKU/variant is visible and confirmable.
- Given the algorithm returns only a figure-level match, when the review item is shown, then the user is guided to choose a SKU/variant.
- Given multiple SKU variants exist, when the user expands the figure number, then available variants and differentiating metadata are shown.
- Given the user selects a SKU, when the final dashboard is shown, then the selected SKU is displayed as the final BOM item.

### Final Dashboard

- Given all required items are reviewed, when the user reaches the final dashboard, then the table shows selected figure number, selected SKU/variant, quantity, and review status.
- Given the user needs more context, when they interact with the row, then they can access original imported metadata.
- Given the user wants to verify the parent part family, when they click the figure number, then they are taken to or shown the relevant parent figure/part listing.
- Given a submittal/PDF exists, when the user views the SKU row, then the submittal/PDF is accessible.

---

## 18. Open Questions

1. Should final import be blocked until all BOM rows are reviewed?
2. If some rows are skipped, should the user be allowed to import only reviewed rows?
3. Should the “Choose” experience open as a modal, drawer, or full page?
4. What exact terminology should be used for figure number, SKU, variant, parent, and child?
5. Should low-confidence rows be editable inline, or should editing open a focused row detail view?
6. How many SKU variants can appear under one figure number, and do we need pagination or search inside variants?
7. Should match score be shown as a percentage, label, or both?
8. What fields are required before a BOM can be saved/imported?
9. Should featured parts be prioritized only when there is no suggested match, or also during manual replacement?
10. Should the final dashboard show original imported data by default or only through progressive disclosure?

---

## 19. Dependencies

- Matching/parsing algorithm output
- BOM upload parser
- ASC parts database
- Figure number and SKU data model
- Product images
- Product URLs
- PDF/submittal availability
- Featured parts/category structure
- Final terminology confirmation from James
- Engineering decision on import blocking rules

---

## 20. Priority

This BOM workflow is the current priority.

Content File Manager work should remain paused until the BOM upload and match review workflow is stabilized.

Milos should focus on creating the full BOM user flow and covering all major use cases, especially smart mapping, low-confidence rows, match review, missing matches, and SKU-level selection.