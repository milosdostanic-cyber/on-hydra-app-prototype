# Plan: CON-296 review — parent/child hierarchy and file-format pills

## Meta
- **Date:** 2026-09-30
- **Request type:** `ui-change`
- **User request summary:** Read the latest Jira updates for the content module and write the changes that belong in this prototype. Do not implement.
- **Status:** approved 2026-09-30 — both phases; implementation not started
- **Plan file:** `Documents/plans/2026-09-30-con-296-review-hierarchy-and-format-pills-plan.md`
- **Jira source:** [CON-296](https://ooden.atlassian.net/browse/CON-296) comment by Matt Pettit, 2026-09-29 22:17 (comment id 59150), in reply to the prototype review comment of 2026-09-23
- **Prior plan (already built):** `Documents/plans/2026-09-15-con-296-content-download-history-plan.md`

## Orchestration for planning (this run)

### Explicit skills and rules used
| Name | Type | Path | Why selected |
|------|------|------|--------------|
| `@plan-orchestrator` | rule | `.cursor/rules/plan-orchestrator.mdc` | User asked to write the changes and not implement |
| `@prd-ux-implementation-planner` | skill | `.cursor/skills/prd-ux-implementation-planner/SKILL.md` | Map the review comments onto the existing Content history screen, files, and gaps |

### Implicit rules (always active)
| Invoke | Path | Why relevant to this task |
|--------|------|---------------------------|
| `@token-discipline` | `.cursor/rules/token-discipline.mdc` | Targeted reads of the history page and file-format UI only |
| `@scope-guardrails` | `.cursor/rules/scope-guardrails.mdc` | History table visuals only; create actions and other modules stay frozen |
| `@product-ux-rules` | `.cursor/rules/product-ux-rules.mdc` | Hierarchy and format chips must stay readable for a non-technical user |
| `@ux-guardrails` | `.cursor/rules/ux-guardrails.mdc` | Reuse existing tags, type, and table patterns |
| `@ux-system-reuse-guardrails` | `.cursor/rules/ux-system-reuse-guardrails.mdc` | No new components, tokens, or icon sources |
| `@hydra-ui-tokens` | `.cursor/rules/hydra-ui-tokens.mdc` | Indent, fill, and type must come from existing tokens |
| `@hydra-ux-composition` | `.cursor/rules/hydra-ux-composition.mdc` | Compose Table, Flex, Typography, and HydraTag |
| `@figma-repo-parity` | `.cursor/rules/figma-repo-parity.mdc` | Listed because it is always active; this plan does not change theme files |

### Not used (and why)
| Name | Why skipped |
|------|-------------|
| `@figma-use` / Official Figma MCP | No Figma URL. The review is two written comments on the existing prototype. |
| `@hydra-design-to-code` | No design file or screenshot was attached to the comment. |
| `@ds-parity-auditor` | No token or theme change. |
| `@figma-console-mcp` | Not requested. |
| Granola | The change request is the Jira comment itself, not a meeting. |

## Implementation invocation (use in a new chat after approval)

### Baseline — attach every UI implementation phase
```
@scope-guardrails
@token-discipline
@ux-guardrails
@hydra-ui-tokens-and-components
```

Path for the skill: `Documentation/hydra-ai-pack/skills/hydra-ui-tokens-and-components`

### Default attach set for this request type
```
@hydra-ui-tokens-and-components
@scope-guardrails
@token-discipline
@product-ux-rules
```

### Implicit rules during implementation
| Invoke | Path | Applies when |
|--------|------|--------------|
| `@ux-system-reuse-guardrails` | `.cursor/rules/ux-system-reuse-guardrails.mdc` | Any visual change on the history table |
| `@hydra-ui-tokens` | `.cursor/rules/hydra-ui-tokens.mdc` | Spacing, type, fill, border |
| `@hydra-ux-composition` | `.cursor/rules/hydra-ux-composition.mdc` | Composing the row and format chips |
| `@product-ux-rules` | `.cursor/rules/product-ux-rules.mdc` | Copy for Figure vs Variation |

### Optional add-ons
| Invoke | Path | When to add |
|--------|------|-------------|
| `@hydra-ux-audit` | `.cursor/skills/hydra-ux-audit/SKILL.md` | After Phase 2, before closing |
| `@figma-repo-parity` | `.cursor/rules/figma-repo-parity.mdc` | Only if a phase starts changing `src/theme/*`. This plan does not. |

## Scope summary

Matt reviewed the Content Download History prototype and asked for two changes:

1. A clearer way to tell a parent row (figure / part) from a child row (variation).
2. File formats that match the format pills already used elsewhere in the app, so modules look continuous.

Both changes live on the project Content history page (`/projects/:id/content`), in `src/shell/content/DownloadCenterPage.tsx`.

Selection, Create Submittal Package, Create BOM, ZIP removal, empty state, attribution, and sample data stay as they are.

### Latest content tickets reviewed and left out

| Ticket | Updated | Why it is not in this plan |
|--------|---------|----------------------------|
| [CON-319](https://ooden.atlassian.net/browse/CON-319) Revit Download Options | 2026-09-28 | Customer ask for two Revit buttons (download now, and the old add-to-downloads). It is the part-listing download action, not the history table Matt reviewed. |
| [CON-311](https://ooden.atlassian.net/browse/CON-311) Product Image Issues | 2026-09-30 | PIM image source. Status is Pending Prod Deploy. Not a history-screen change. |
| [CON-318](https://ooden.atlassian.net/browse/CON-318) Figure 3190 wrong sizes | 2026-09-28 | File-to-SKU mapping. Not a prototype layout change. |
| CON-313, CON-314, CON-315, CON-316, CON-317, CON-279, CON-295 | 2026-09-28 | Engineering stories for the production remake. The prototype already covers the history surface from the 2026-09-15 plan. No new comment asks for a further prototype change. |

## Current flow audit

Screen: **Content Download History** — `src/shell/content/DownloadCenterPage.tsx`.

| Item | Current |
|------|---------|
| Purpose | Show what the project already downloaded, grouped as figure → variations, then create a Submittal Package or a BOM. |
| User action | Check rows. Parent check also checks its variations. Then use one of the two equal-weight create buttons. |
| Data shown | Part name, thumbnail on the figure only, figure number, formats, latest date, downloader. |
| Parent vs child today | Children are nested, but `indentSize` is `0`, so they sit on the same left edge as the parent. An empty thumbnail slot keeps names aligned. Child rows get `colorFillAlter` and a `colorBorderSecondary` left inset. Some parents show “Figure-level file” or “Variants only”. Children show `SKU {code}` in secondary text. There is no role label that says Variation. |
| Formats today | Every format is the same `HydraTag` with `tone="processing"` (one blue chip, text only: RFA, PDF, DWG, TXT). |
| Format treatment elsewhere | `src/search/components/VariantFileActions.tsx` shows each format as an icon plus the format code (PDF uses `FilePdfOutlined`; DWG and RFA use `FileUnknownOutlined`; STEP uses `FileZipOutlined`). Those controls download a file. The history page must not turn into download buttons. `ActionsPanel.tsx` uses text buttons (“Add Revit File to Downloads”, “Add PDF File to Downloads”), order RFA, PDF, DWG, STEP. There is no shared file-format pill component. |
| UX issue | Matt cannot tell parent from child at a glance, and the format chips do not look like the file-type treatment used on the part surface. |
| Related files | `DownloadCenterPage.tsx` (render). `downloadHistoryRows.ts` and `downloadHistorySeed.ts` already supply `formats` and parent/child rows. No data change is required for these two comments. |

## Requirements / gap table
| Requirement | Current | Gap | UX risk | Area |
|-------------|---------|-----|---------|------|
| Distinguish parent from child (CON-296 comment) | Nested rows with indent 0, faint fill, and a coverage tag on some parents only | Hierarchy reads as one flat list | A user can treat a variation as a separate part, or miss which row is the figure | `DownloadCenterPage.tsx` row cell and table indent |
| File formats match existing pills (CON-296 comment) | Identical blue text tags | Format chips do not reuse the icon-plus-label treatment from the part variant file row | Formats look like status tags, and they look different from Part Search | Formats column in `DownloadCenterPage.tsx` |
| Keep history behavior from the 2026-09-15 plan | Cart removed; grouped history; two create actions | None for this review | Changing selection or create rules would undo the signed flow | Do not touch selection, modals, or queue behavior |

## Proposed UX flow

The page flow does not change. What the user sees in the table changes.

**Parent row (figure)**

- Name stays primary and uses the existing strong text style (`hydraBaseStrong`).
- Thumbnail stays on the parent only.
- A borderless `HydraTag` reads **Figure**. This is a role label. It does not replace “Figure-level file” or “Variants only”, which still describe what was downloaded.
- Expand and collapse stay. Rows stay expanded by default.

**Child row (variation)**

- The row is indented with antd `indentSize` set from an existing spacing token (`token.marginLG`), so the child sits under the parent instead of on the same edge.
- Drop the empty thumbnail slot on the child. That slot currently forces the child name onto the parent’s text edge and hides the indent.
- Name uses secondary text.
- A borderless `HydraTag` reads **Variation**, plus the existing `SKU {code}` secondary text.
- Keep the child-row fill (`colorFillAlter`). Keep a left accent, using `colorBorder` so it is visible. Do not add a new color.

**Formats column**

- Each downloaded format is a static chip: the same Ant Design file icon used in `VariantFileActions`, plus the format code, inside the existing `HydraTag`.
- Chips are not buttons. History does not download again from this column.
- Order matches the part actions panel: RFA, PDF, DWG, STEP, then any other code already in the row (for example TXT) with the unknown-file icon.
- “Variants only” stays the coverage tag. It is not a format pill.

## Implementation plan by phase

### Phase 1 — Parent and child rows
- **Goal:** A person can tell a figure row from a variation row without reading the SKU line.
- **Files:** `src/shell/content/DownloadCenterPage.tsx`
- **UI changes:**
  - Set table `indentSize` from `token.marginLG`.
  - Parent name: `hydraBaseStrong`. Child name: `Typography.Text` `type="secondary"`.
  - Parent tag: **Figure**. Child tag: **Variation**. Both `HydraTag`, `bordered={false}`.
  - Remove the empty thumbnail slot on child rows.
  - Keep “Figure-level file”, “Variants only”, thumbnail, expand icon, and child-row fill.
  - Left accent on child rows: `token.colorBorder` instead of `token.colorBorderSecondary`.
- **Data/state:** None. `isHistoryFigureRow` already splits the two row types.
- **Acceptance criteria:**
  - On Downtown (`/projects/1/content`), Needle Valve reads as the figure and Config A / Config B read as variations under it.
  - Ball valve still shows **Variants only** on the parent, and Size 1 still shows as a variation under that parent.
  - Poppet, which has no children, still reads as a figure.
  - Checking a figure still checks its variations. Clear Selection, Create Submittal Package, and Create BOM behave as they do now.
- **Must not change:** Selection rules, modals, copy of the create bar, routes, seed data, ZIP behavior, other modules.

#### Phase 1 — invoke for implementation
```
@hydra-ui-tokens-and-components
@scope-guardrails
@token-discipline
@product-ux-rules
@ux-guardrails
```

**Copy-paste prompt:**
```
Implement Phase 1 only from this plan: Documents/plans/2026-09-30-con-296-review-hierarchy-and-format-pills-plan.md

@hydra-ui-tokens-and-components
@scope-guardrails
@token-discipline
@product-ux-rules
@ux-guardrails

Allowed files:
- src/shell/content/DownloadCenterPage.tsx

Forbidden:
- src/theme/**
- src/ui/HydraTag.tsx
- src/search/**
- src/shell/content/downloadHistoryRows.ts
- src/shell/content/downloadHistorySeed.ts
- src/shell/content/downloadHistorySelection.ts
- Create modals, routes, and any file outside the allowed list

Jira: https://ooden.atlassian.net/browse/CON-296
Comment: distinguish parent from child (Matt Pettit, 2026-09-29).
```

### Phase 2 — File-format pills
- **Goal:** Formats on the history table use the same icon-plus-label treatment as the part variant file row.
- **Files:** `src/shell/content/DownloadCenterPage.tsx`
- **UI changes:**
  - In this file only, map format codes to the icons already used in `VariantFileActions.tsx`: `FilePdfOutlined` for PDF, `FileZipOutlined` for STEP, `FileUnknownOutlined` for DWG, RFA, and anything else.
  - Render each format as a non-clickable `HydraTag` with that icon and the format code.
  - Do not use `tone="processing"` for every format. Default `HydraTag` is enough, so the chip is a file label and not a status.
  - Sort known formats in the ActionsPanel order: RFA, PDF, DWG, STEP. Append unknown codes after those, in their existing order.
  - Leave **Variants only** as it is.
- **Data/state:** None. `row.formats` already lists the codes.
- **Acceptance criteria:**
  - Needle Valve parent shows an RFA chip with an icon, not a plain blue text tag.
  - Config A / Config B show their own format chips with the same icon treatment.
  - Chips do not start a download, open a modal, or change selection.
  - A format that is not in the icon map still shows its code with the unknown-file icon.
- **Must not change:** `VariantFileActions.tsx`, `ActionsPanel.tsx`, download queue behavior, tag component API, theme tokens.

#### Phase 2 — invoke for implementation
```
@hydra-ui-tokens-and-components
@scope-guardrails
@token-discipline
@product-ux-rules
@ux-guardrails
@hydra-ux-audit
```

**Copy-paste prompt:**
```
Implement Phase 2 only from this plan: Documents/plans/2026-09-30-con-296-review-hierarchy-and-format-pills-plan.md

@hydra-ui-tokens-and-components
@scope-guardrails
@token-discipline
@product-ux-rules
@ux-guardrails
@hydra-ux-audit

Allowed files:
- src/shell/content/DownloadCenterPage.tsx

Forbidden:
- src/search/components/VariantFileActions.tsx
- src/search/components/ActionsPanel.tsx
- src/ui/HydraTag.tsx
- src/theme/**
- Selection, modals, seed data, and any file outside the allowed list

Jira: https://ooden.atlassian.net/browse/CON-296
Comment: file formats should match the pills already used elsewhere (Matt Pettit, 2026-09-29).
Reuse the Ant Design file icons from VariantFileActions. Do not extract a new shared component.
```

## File change plan
| File | Action | Reason |
|------|--------|--------|
| `src/shell/content/DownloadCenterPage.tsx` | Modify | Parent/child labels, indent, and format chips |
| `src/search/components/VariantFileActions.tsx` | Do not modify | Icon source to copy, not a shared component to extend |
| `src/shell/content/downloadHistoryRows.ts` | Do not modify | Row shape already has parent/child and formats |
| `src/ui/HydraTag.tsx` | Do not modify | Existing tag is enough |

## Guardrails
- **Allowed (after approval):** `src/shell/content/DownloadCenterPage.tsx` only.
- **Forbidden:** Theme and token files, `HydraTag` API, search download actions, history seed and selection, create modals, routes, sidebar, other modules, new components, new colors, new icons.
- **Assumptions:**
  - “Pill images” means the icon-plus-format-code treatment on the part variant file row. This repo has no separate file-format image asset.
  - Role labels **Figure** and **Variation** are the distinction. Coverage tags stay.
  - TXT and any other non-standard code keep a text chip with the unknown-file icon.
- **Open questions:**
  - If Matt meant a production screen whose pills are not in this prototype, Phase 2 should stop and ask which screen to match before drawing new chips.
  - CON-319 (two Revit buttons) is out of this plan. Pull it in only with a separate approval.

## Risks
- Indent plus removing the empty thumbnail slot can make parent and child names start at different x positions. That is the point of the hierarchy. Verify the expand icon still lines up with the name.
- A stronger child fill or border can look like a selection state. Keep using fill and border tokens that are already used for nested rows, and do not reuse the selected-row color.
- Copying the icon map into the history page duplicates four lines. Extracting a shared map would touch the search module, which this review does not ask for.

## Acceptance checklist
- [ ] Figure rows and variation rows are distinguishable without reading the SKU
- [ ] Variations are indented under their figure
- [ ] “Figure-level file” and “Variants only” still describe download coverage
- [ ] Format chips use the same file icons as the part variant file row
- [ ] Format chips do not download or navigate
- [ ] Selection, Clear Selection, Create Submittal Package, and Create BOM are unchanged
- [ ] Empty history on `/projects/2/content` is unchanged
- [ ] No new tokens, colors, components, or icon libraries
- [ ] `npx tsc --noEmit` is clean for the edited file

## Full implementation prompt (all approved phases)
```
Implement approved phase(s) from: Documents/plans/2026-09-30-con-296-review-hierarchy-and-format-pills-plan.md

@hydra-ui-tokens-and-components
@scope-guardrails
@token-discipline
@product-ux-rules
@ux-guardrails
@hydra-ux-audit

Follow allowed files and guardrails in the plan. Do not expand scope.
Allowed file: src/shell/content/DownloadCenterPage.tsx
```
