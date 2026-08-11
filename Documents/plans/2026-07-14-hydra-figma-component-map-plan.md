# Plan: Hydra Figma Component Map

## Meta
- **Date:** 2026-07-14
- **Request type:** ds-parity
- **User request summary:** Export a complete reusable mapping of components from the Hydra Ant Design - DS Figma library and save it in the repository.
- **Status:** approved by direct user request — implementation follows this scoped plan
- **Plan file:** `Documents/plans/2026-07-14-hydra-figma-component-map-plan.md`

## Orchestration for planning (this run)

### Explicit skills and rules used
| Name | Type | Path | Why selected |
|---|---|---|---|
| `@plan-orchestrator` | rule | `.cursor/rules/plan-orchestrator.mdc` | Required repository planning workflow. |
| `@figma-use` | skill | official Figma plugin skill | Required for programmatic read-only inspection of all Figma pages and component metadata. |
| `@figma-frame-ds-cleanup` | skill | `.cursor/skills/figma-frame-ds-cleanup/` | Existing consumer and storage location for the Hydra DS lookup. |
| `@figma-repo-parity` | rule | `.cursor/rules/figma-repo-parity.mdc` | Keeps the generated catalog traceable to the Figma source. |

### Implicit rules (always active)
| Invoke | Path | Why relevant to this task |
|---|---|---|
| `@token-discipline` | `.cursor/rules/token-discipline.mdc` | Preserve canonical DS names and keys. |
| `@scope-guardrails` | `.cursor/rules/scope-guardrails.mdc` | Limit changes to documentation/skill references. |
| `@product-ux-rules` | `.cursor/rules/product-ux-rules.mdc` | Keep the human index understandable. |
| `@ux-guardrails` | `.cursor/rules/ux-guardrails.mdc` | Prevent misleading component usage summaries. |
| `@hydra-ui-tokens` | `.cursor/rules/hydra-ui-tokens.mdc` | Preserve Hydra naming conventions. |
| `@hydra-ux-composition` | `.cursor/rules/hydra-ux-composition.mdc` | Context for component composition metadata. |
| `@figma-repo-parity` | `.cursor/rules/figma-repo-parity.mdc` | Source/version traceability. |

### Not used (and why)
| Name | Why skipped |
|---|---|
| `@figma-generate-design` | No Figma canvas write or screen generation is requested. |
| `@hydra-ux-audit` | No product UI is being built, reviewed, or changed. |

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
@figma-use
@figma-repo-parity
@scope-guardrails
```

### Implicit rules during implementation
| Invoke | Path | Applies when |
|---|---|---|
| `@figma-repo-parity` | `.cursor/rules/figma-repo-parity.mdc` | Recording source IDs, keys, and refresh metadata. |
| `@scope-guardrails` | `.cursor/rules/scope-guardrails.mdc` | Writing only the map and its consumer reference. |

### Optional add-ons
| Invoke | Path | When to add |
|---|---|---|
| `@figma-code-connect` | official Figma plugin skill | Only if a later request maps Figma assets to production source modules. |

## Scope summary
- Read every non-empty component page in Figma file `3ghYBXR6XVUEaeBo3D5E4q`.
- Capture component sets, standalone components, keys, node IDs, descriptions, documentation links, property definitions, and variants.
- Save a deterministic JSON catalog beside the existing `figma-frame-ds-cleanup` lookup and add a concise Markdown index.
- Do not modify Figma, application code, theme files, or existing component implementations.

## Current flow audit
- The repository already contains a curated manual lookup at `.cursor/skills/figma-frame-ds-cleanup/design-system-mapping.md`.
- The manual lookup covers common components but is not a complete machine-readable export and can drift from Figma.
- The supplied node `137:4507` is the `Modal__Overlay` component set; the requested complete mapping is interpreted as the full Hydra DS file, using that link as the source entry point.

## Requirements / gap table
| Requirement | Current | Gap | UX risk | Area |
|---|---|---|---|---|
| Complete component inventory | Curated subset | Missing full set/variant/property coverage | Agents may rebuild an existing component | Skill reference |
| Stable import identifiers | Some keys recorded | Not comprehensive | Wrong or stale imports | Figma mapping |
| Refresh provenance | Manual notes | No generated timestamp/source summary | Drift is hard to detect | Documentation |
| Human lookup | Long curated file | No generated compact index | Slow discovery | Documentation |

## Proposed UX flow
Agent loads the concise index to find a component family, then reads the JSON record for exact keys, property definitions, and variants; the existing curated guide remains the semantic usage layer.

## Implementation plan by phase

### Phase 1 — Export and integrate the component catalog
- **Goal:** Produce and validate the complete Figma component map.
- **Files:** `.cursor/skills/figma-frame-ds-cleanup/hydra-component-map.json`, `.cursor/skills/figma-frame-ds-cleanup/hydra-component-map.md`, `.cursor/skills/figma-frame-ds-cleanup/SKILL.md`.
- **UI changes:** None.
- **Data/state:** Read-only Figma traversal; repository documentation only.
- **Acceptance criteria:** Every component/component set in the file appears once; all available keys, IDs, properties, descriptions, documentation links, and variant names are preserved; JSON parses; counts reconcile with the Figma export.
- **Must not change:** Figma canvas, `src/`, theme/token sources, existing curated semantic mapping.

#### Phase 1 — invoke for implementation
```
@figma-use
@figma-repo-parity
@scope-guardrails
@token-discipline
```

**Copy-paste prompt:**
```
Implement Phase 1 only from this plan: Documents/plans/2026-07-14-hydra-figma-component-map-plan.md

@figma-use
@figma-repo-parity
@scope-guardrails
@token-discipline

Allowed files:
- .cursor/skills/figma-frame-ds-cleanup/hydra-component-map.json
- .cursor/skills/figma-frame-ds-cleanup/hydra-component-map.md
- .cursor/skills/figma-frame-ds-cleanup/SKILL.md

Forbidden:
- Figma canvas writes
- src/**
- theme/token source edits

Source: https://www.figma.com/design/3ghYBXR6XVUEaeBo3D5E4q/Hydra-Ant-Design---DS?node-id=137-4507
```

## File change plan
| File | Action | Reason |
|---|---|---|
| `.cursor/skills/figma-frame-ds-cleanup/hydra-component-map.json` | Create | Complete machine-readable catalog. |
| `.cursor/skills/figma-frame-ds-cleanup/hydra-component-map.md` | Create | Compact human index and refresh instructions. |
| `.cursor/skills/figma-frame-ds-cleanup/SKILL.md` | Update | Route agents to the generated catalog for exact metadata. |

## Guardrails
- **Allowed (after approval):** Read Figma; create/update the three scoped reference files.
- **Forbidden:** Figma writes, source/UI code changes, token changes, broad refactors.
- **Assumptions:** “Complete mapping” means the full Figma library, not only node `137:4507`; mapping is design metadata, not Code Connect to source modules.
- **Open questions:** None blocking; Code Connect can be a separate follow-up if desired.

## Risks
- Large pages may require parallel page-scoped reads and pagination/chunking of returned data.
- Some nested helper components may be intentionally unpublished; they will still be recorded and marked by publish status/key availability.

## Acceptance checklist
- [ ] All non-empty Figma pages inspected.
- [ ] Component set and standalone component counts reconcile.
- [ ] JSON is valid and deterministically sorted.
- [ ] Markdown index links every family to its JSON records.
- [ ] Existing curated semantic mapping remains unchanged.
- [ ] No Figma or application-code mutation occurred.

## Full implementation prompt (all approved phases)
```
Implement approved phase(s) from: Documents/plans/2026-07-14-hydra-figma-component-map-plan.md

@figma-use
@figma-repo-parity
@scope-guardrails
@token-discipline

Follow allowed files and guardrails in the plan. Do not expand scope.
```
