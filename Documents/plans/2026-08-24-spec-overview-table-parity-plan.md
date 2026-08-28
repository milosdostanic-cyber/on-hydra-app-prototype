# Plan: SPEC Overview table — BOM cell/header parity

## Meta
- **Date:** 2026-08-24
- **Request type:** `ui-change` + `prd-feature` (table chrome vs `/bom/site/1`; actions vs SPEC PRD + FigJam)
- **User request summary:** SPEC Overview table must use the same Table cell/header language as BOM site, existing status components, single-line cells, token/padding parity, and PRD/FigJam-correct actions. Audit only; write implementation MD.
- **Status:** draft — planning only; implementation not started
- **Plan file:** `Documents/plans/2026-08-24-spec-overview-table-parity-plan.md`
- **Implementation spec:** `Documents/SPEC/SPEC_OVERVIEW_TABLE_AUDIT_AND_IMPLEMENTATION.md`

## Orchestration for planning (this run)

### Explicit skills and rules used
| Name | Type | Path | Why selected |
|------|------|------|--------------|
| `@plan-orchestrator` | rule | `.cursor/rules/plan-orchestrator.mdc` | Plan-only; English plan under `Documents/plans/` |
| `@prd-ux-implementation-planner` | skill | `.cursor/skills/prd-ux-implementation-planner/SKILL.md` | Gap table, phases, guardrails |
| `@hydra-prd-ux-playbook` | rule | `.cursor/rules/hydra-prd-ux-playbook.mdc` | Existing `/spec` vs PRD; Path A |
| `@hydra-ux-audit` | skill | `.cursor/skills/hydra-ux-audit/SKILL.md` | Table/action/token layers (report only) |
| `@figma-use-figjam` | MCP | Figma `get_figjam` | Kickoff V2 node `2035:1468` |
| `@product-ux-rules` | rule | `.cursor/rules/product-ux-rules.mdc` | One primary CTA per context; status not colour-only |

### Implicit rules (always active)
| Invoke | Path | Why relevant to this task |
|--------|------|---------------------------|
| `@token-discipline` | `.cursor/rules/token-discipline.mdc` | Targeted reads (`SpecHomePage`, `BomSiteProjectsPage`) |
| `@scope-guardrails` | `.cursor/rules/scope-guardrails.mdc` | SPEC Overview only |
| `@ux-guardrails` | `.cursor/rules/ux-guardrails.mdc` | No new shared components; no BOM file edits |
| `@hydra-ui-tokens` | `.cursor/rules/hydra-ui-tokens.mdc` | Tokens only; no cell `fontSize` literals |
| `@hydra-ux-composition` | `.cursor/rules/hydra-ux-composition.mdc` | Compose antd Table like BOM |
| `@figma-repo-parity` | `.cursor/rules/figma-repo-parity.mdc` | No theme edits this task |

### Not used (and why)
| Name | Why skipped |
|------|-------------|
| `@ds-parity-auditor` | Table composition, not DS token sync |
| `@hydra-design-to-code` / `get_design_context` | Target is FigJam **board**, not a Design table frame |
| `@figma-console-mcp` | Official MCP only |
| BOM PRD / `AGENTS.md` BOM rules | Reference screen only; do not change BOM |

## Implementation invocation (use in a new chat after approval)

### Baseline — attach every UI implementation phase
```
@scope-guardrails
@token-discipline
@ux-guardrails
@hydra-ui-tokens-and-components
```

### Default attach set for this request type
```
@hydra-ui-tokens-and-components
@product-ux-rules
@scope-guardrails
@token-discipline
@hydra-ux-audit
```

### Implicit rules during implementation
| Invoke | Path | Applies when |
|--------|------|--------------|
| `@hydra-ui-tokens` | `.cursor/rules/hydra-ui-tokens.mdc` | Any Table `styles` |
| `@ux-guardrails` | `.cursor/rules/ux-guardrails.mdc` | Do not edit BOM/shared UI |
| `@product-ux-rules` | `.cursor/rules/product-ux-rules.mdc` | Row vs page CTA hierarchy |

### Optional add-ons
| Invoke | Path | When to add |
|--------|------|-------------|
| `@hydra-ux-audit` | `.cursor/skills/hydra-ux-audit/SKILL.md` | Always before close (listed in default set) |

## Scope summary

- **In:** `/spec` Overview table visual language, one-line cells, status Badge, row action control type, pagination chrome.
- **Out:** Upload/download modal behaviour, other SPEC pages, BOM pages, theme, new design tokens, bulk delete.

`Documentation/hydra-app-capabilities.md` has no SPEC module entry; do not expand the map in this table-only pass.

## Current flow audit

| Screen | Purpose | User action | Data | UX issue | File |
|--------|---------|-------------|------|----------|------|
| `/spec` | Operational document list | Filter; upload; download master; continue per status | `SpecDocument` mock list | Two-line cells; `fontSizeLG`; filled row primary; Table pagination pageSize 10 | `src/spec/pages/SpecHomePage.tsx` |
| `/bom/site/1` | Site BOM project list | Search; filter status; open/edit/delete | `BomProject` | Golden table chrome | `src/bom/pages/BomSiteProjectsPage.tsx` |

## Requirements / gap table
| Requirement | Current | Gap | UX risk | Area |
|-------------|-----------|-----|---------|------|
| Same header/body Table styles as BOM site | Extra `fontSizeLG`; `size="middle"` | Remove overrides; default size | Table looks like a different product | `SpecHomePage` Table `styles` |
| One typography role in cells | Strong title + secondary filename | Title link + filename Tooltip | Hard to scan | Document column |
| One-line ASC master | Label + version stacked | `"label version"` + ellipsis | Row height drift | Master column |
| One-line review | Text + `Progress` | `"12 / 18"` + Tooltip | Dense list vs spreadsheet | Review column |
| Status = existing Badge+text | Already `Badge` | Keep; optional wrapper | Colour-only if Badge text dropped | Status column |
| Row primary = BOM link cell | `type="primary" size="small"` | `type="link"` | Two primaries on the page | Actions |
| Overflow = Open / View project | Present | Keep; do not add FigJam export/BOM create | Extra noise | Actions |
| Toolbar paddingBlock `token.padding` | `paddingSM` | 12 vs 16 | Uneven vs BOM | Toolbar |
| Pagination like BOM | In-table, 10 rows | External, `shellLayout.tablePageSizeDefault` (20) | Inconsistent list density | Footer |
| Page Upload + Download master | Present | None | — | Header |
| FigJam retry/replace/export/BOM | Primary covers retry/export; replace/BOM not on list | Defer replace + create BOM | Fake overflow items | Out of scope |

## Proposed UX flow

Unchanged journey: land on `/spec` → scan **one-line** rows → status Badge+label → click **link** primary (or title) → workflow screen. Page primary remains **Upload SPEC**. Master download stays header/empty-state secondary.

## Implementation plan by phase

### Phase 1 — Table chrome and tokens
- **Goal:** Header/body/toolbar/pagination match BOM site tokens.
- **Files:** `src/spec/pages/SpecHomePage.tsx`
- **UI changes:** Drop `size="middle"` and `fontSizeLG`; copy BOM `styles.header.cell` / `styles.body.cell`; toolbar `paddingBlock: token.padding`; external `Pagination` + `shellLayout.tablePageSizeDefault`; optional Card `borderRadiusLG` + `boxShadowTertiary`.
- **Data/state:** Local page index only if lifting pagination.
- **Acceptance criteria:** Side-by-side with `/bom/site/1`, header/body size and cell block padding match; no raw px.
- **Must not change:** Columns, filters, modals.

#### Phase 1 — invoke for implementation
```
@hydra-ui-tokens-and-components
@product-ux-rules
@scope-guardrails
@token-discipline
@hydra-ux-audit
```

**Copy-paste prompt:**
```
Implement Phase 1 only from this plan: Documents/plans/2026-08-24-spec-overview-table-parity-plan.md
Also follow Documents/SPEC/SPEC_OVERVIEW_TABLE_AUDIT_AND_IMPLEMENTATION.md §4 and §6.

@hydra-ui-tokens-and-components
@product-ux-rules
@scope-guardrails
@token-discipline
@hydra-ux-audit

Allowed files:
- src/spec/pages/SpecHomePage.tsx

Forbidden:
- src/bom/** (edits)
- src/ui/**
- src/theme/**
- Other SPEC pages

Reference: src/bom/pages/BomSiteProjectsPage.tsx Table styles and pagination footer only.
```

### Phase 2 — Single-line cells, status, row actions
- **Goal:** One row height; Badge status; link primary; overflow unchanged in content.
- **Files:** `src/spec/pages/SpecHomePage.tsx`; optional `src/spec/components/SpecWorkflowStatusBadge.tsx`
- **UI changes:** Flatten document / master / review; Tooltip for extras; keep `Badge` + `specWorkflowBadgeStatus`; primary `Button type="link"`; optional `BomTableRowActions` import without editing BOM.
- **Data/state:** None.
- **Acceptance criteria:** No two-line cells; eight statuses still labelled; PRD primary labels unchanged.
- **Must not change:** Phase 1 chrome; upload/download modals.

#### Phase 2 — invoke for implementation
```
@hydra-ui-tokens-and-components
@product-ux-rules
@scope-guardrails
@token-discipline
@hydra-ux-audit
```

**Copy-paste prompt:**
```
Implement Phase 2 only from this plan: Documents/plans/2026-08-24-spec-overview-table-parity-plan.md
Also follow Documents/SPEC/SPEC_OVERVIEW_TABLE_AUDIT_AND_IMPLEMENTATION.md §2, §3, §5.

@hydra-ui-tokens-and-components
@product-ux-rules
@scope-guardrails
@token-discipline
@hydra-ux-audit

Allowed files:
- src/spec/pages/SpecHomePage.tsx
- src/spec/components/SpecWorkflowStatusBadge.tsx (optional)

Forbidden:
- src/bom/** edits
- New overflow actions (Export, Create BOM, Replace file)
- Progress in review cell
- HydraTag for workflow status
```

## File change plan
| File | Action | Reason |
|------|--------|--------|
| `src/spec/pages/SpecHomePage.tsx` | Modify | Chrome, cells, actions control type, pagination |
| `src/spec/components/SpecWorkflowStatusBadge.tsx` | Add (optional) | Local Badge wrapper; SPEC-only |
| `Documents/SPEC/SPEC_OVERVIEW_TABLE_AUDIT_AND_IMPLEMENTATION.md` | Added this run | Audit + implementation contract |
| `src/bom/**` | Do not touch | Reference only |

## Guardrails
- **Allowed (after approval):** Files in the file change plan; import `BomTableRowActions` / `shellLayout` without editing those modules.
- **Forbidden:** BOM/theme/ui edits; new tokens; bulk selection; FigJam export/BOM-create on Overview rows.
- **Assumptions:** “Same cell/header components” = same antd Table composition as BOM site (no extracted cell package exists). Table body stays 14px to match BOM, overriding the older Overview “16px content” note.
- **Open questions:** None blocking. Confirm if product later wants `Download original` in overflow.

## Risks
- Wide status labels may ellipsis; Tooltip is required.
- Lifting pagination changes “10 per page” demo density — intentional BOM match.
- Importing `BomTableRowActions` couples SPEC to a BOM helper; local ⋮ is equally valid.

## Acceptance checklist
- [ ] Table type and padding match `/bom/site/1` (see spec §4)
- [ ] Single-line cells; filename/version/percent in Tooltip
- [ ] Status Badge + text for eight PRD statuses
- [ ] Row primary is link; labels still PRD map
- [ ] Overflow Open document / View project only
- [ ] Page Upload + Download master unchanged
- [ ] Empty / no-results / loading / error unchanged in behaviour
- [ ] `npx tsc --noEmit` + `@hydra-ux-audit`

## Full implementation prompt (all approved phases)
```
Implement approved phase(s) from: Documents/plans/2026-08-24-spec-overview-table-parity-plan.md
Contract: Documents/SPEC/SPEC_OVERVIEW_TABLE_AUDIT_AND_IMPLEMENTATION.md

@hydra-ui-tokens-and-components
@product-ux-rules
@scope-guardrails
@token-discipline
@hydra-ux-audit

Follow allowed files and guardrails in the plan. Do not expand scope.
Do not edit src/bom/**, src/ui/**, or src/theme/**.
```
