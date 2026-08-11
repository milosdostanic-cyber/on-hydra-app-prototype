# Plan: Recreate Unified Search target with Hydra Ant Design DS

## Meta
- **Date:** 2026-07-14
- **Request type:** figma-delta
- **User request summary:** Replace Figma frame `549:2682` with a pixel-matched recreation of reference frame `549:2429`, using only published Hydra Ant Design - DS components, styles, and variables.
- **Status:** approved by direct implementation request; implementation follows this scoped plan
- **Plan file:** `Documents/plans/2026-07-14-unified-search-hydra-recreation-plan.md`

## Orchestration for planning (this run)

### Explicit skills and rules used
| Name | Type | Path | Why selected |
|------|------|------|--------------|
| `@hydra-ant-design-screen-recreator` | skill | `.agents/skills/hydra-ant-design-screen-recreator/SKILL.md` | Enforces Hydra-only provenance, token binding, Auto Layout, and parity gates. |
| `@figma-use` | skill | `.cursor/skills/figma-use/SKILL.md` | Required for safe Official Figma MCP reads and writes. |
| `@figma-generate-design` | skill | installed Figma skill | Governs DS discovery and incremental screen assembly. |
| `@hydra-ux-audit` | skill | `.cursor/skills/hydra-ux-audit/SKILL.md` | Required final UI quality and parity audit. |
| `@plan-orchestrator` | rule | `.cursor/rules/plan-orchestrator.mdc` | Produces the scoped pre-write plan required by repository instructions. |

### Implicit rules (always active)
| Invoke | Path | Why relevant to this task |
|--------|------|---------------------------|
| `@token-discipline` | `.cursor/rules/token-discipline.mdc` | Prevents raw design values. |
| `@scope-guardrails` | `.cursor/rules/scope-guardrails.mdc` | Limits writes to the requested target frame. |
| `@product-ux-rules` | `.cursor/rules/product-ux-rules.mdc` | Preserves clear hierarchy and action priority. |
| `@ux-guardrails` | `.cursor/rules/ux-guardrails.mdc` | Enforces accessible, understandable composition. |
| `@hydra-ui-tokens` | `.cursor/rules/hydra-ui-tokens.mdc` | Requires Hydra token use. |
| `@hydra-ux-composition` | `.cursor/rules/hydra-ux-composition.mdc` | Keeps screen composition aligned to Hydra patterns. |
| `@figma-repo-parity` | `.cursor/rules/figma-repo-parity.mdc` | Keeps design-system provenance explicit. |

### Not used (and why)
| Name | Why skipped |
|------|-------------|
| `@figma-console-mcp` | User did not request Console MCP; Official Figma MCP is required. |
| `@frontend-design` | This is a strict recreation, not a new visual direction. |

## Implementation invocation (current approved implementation)

### Baseline — attach every UI implementation phase
```
@scope-guardrails
@token-discipline
@ux-guardrails
@hydra-ui-tokens-and-components
```

### Default attach set for this request type
```
@hydra-ant-design-screen-recreator
@figma-use
@figma-generate-design
@hydra-ux-audit
@scope-guardrails
@token-discipline
```

### Implicit rules during implementation
| Invoke | Path | Applies when |
|--------|------|--------------|
| `@figma-repo-parity` | `.cursor/rules/figma-repo-parity.mdc` | Auditing DS provenance and bindings. |
| `@hydra-ux-composition` | `.cursor/rules/hydra-ux-composition.mdc` | Composing the screen hierarchy. |

### Optional add-ons
| Invoke | Path | When to add |
|--------|------|-------------|
| None | — | No additional scope is required. |

## Scope summary
Replace only the contents and dimensions of target frame `549:2682` in Figma file `usBJj4PPK8naOgJdi31Lgt`. Use reference frame `549:2429` only for visible content, hierarchy, state, and geometry. Source every reusable UI element and every internal style/value from the published Hydra Ant Design - DS library.

## Current flow audit
- The reference is a 1728×889 Content File Manager admin search entry screen.
- The target is currently a 1750×1134 Connected product-detail state and does not match the requested reference.
- The target file already links the exact approved Hydra Ant Design - DS library.
- Existing target content must be fully replaced; the reference frame, DS file, sibling nodes, and repository source code remain untouched.

## Requirements / gap table
| Requirement | Current | Gap | UX risk | Area |
|-------------|---------|-----|---------|------|
| Match reference content and geometry | Product-detail screen | Complete replacement required | High | Target frame |
| Hydra-only linked components | Mixed existing target composition | Rebuild with approved library instances | High | Provenance |
| Exact text/color/spacing bindings | Unknown current bindings | Bind every manual property to Hydra styles/variables | High | Tokens |
| Auto Layout structure | Existing hierarchy differs | Rebuild root, columns, sections, rows, and stacks in Auto Layout | Medium | Layout |
| Clear search-first UX | Not present | Restore reference title, instructions, search controls, and info state | High | UX |

## Proposed UX flow
Admin navigation → Content File Manager context → read concise operating instructions → choose Figure or SKU → enter an exact value → run Search → review the informational empty state below.

## Implementation plan by phase

### Phase 1 — Hydra asset lock and target rebuild
- **Goal:** Recreate the reference in the target frame with exact Hydra DS instances, styles, variables, and Auto Layout.
- **Files:** Figma file `usBJj4PPK8naOgJdi31Lgt`, node `549:2682`; this plan file only in the repository.
- **UI changes:** Replace target contents; resize target to reference dimensions; assemble sidebar, topbar, breadcrumb, content instructions, receipt action, search controls, and informational alert.
- **Data/state:** Static Figma visual state only.
- **Acceptance criteria:** 100% visible-content parity; no detached components; no non-Hydra library assets; no raw internal values; all structural containers use Auto Layout.
- **Must not change:** Reference node `549:2429`, DS file, siblings, source code, tokens, or reusable components.

#### Phase 1 — invoke for implementation
```
@hydra-ant-design-screen-recreator
@figma-use
@figma-generate-design
@hydra-ux-audit
@scope-guardrails
@token-discipline
```

**Copy-paste prompt:**
```
Implement Phase 1 only from this plan: Documents/plans/2026-07-14-unified-search-hydra-recreation-plan.md

Use @hydra-ant-design-screen-recreator, @figma-use, @figma-generate-design, @hydra-ux-audit, @scope-guardrails, and @token-discipline.

Allowed: Figma node usBJj4PPK8naOgJdi31Lgt / 549:2682 and the plan file.
Forbidden: reference node 549:2429, DS source, siblings, repository source code, non-Hydra assets, raw values, detached instances.
```

### Phase 2 — Binding, provenance, layout, and visual audit
- **Goal:** Verify the completed target against the reference and strict Hydra recreation contract.
- **Files:** Read-only audit of the same Figma target and reference.
- **UI changes:** Only in-scope corrections found by the audit.
- **Data/state:** None.
- **Acceptance criteria:** Every checklist item passes or the task stops with an explicit blocker.
- **Must not change:** Anything outside target node `549:2682`.

#### Phase 2 — invoke for implementation
```
@hydra-ant-design-screen-recreator
@figma-use
@hydra-ux-audit
@scope-guardrails
@token-discipline
```

**Copy-paste prompt:**
```
Implement Phase 2 only from this plan: Documents/plans/2026-07-14-unified-search-hydra-recreation-plan.md

Audit and correct only Figma node usBJj4PPK8naOgJdi31Lgt / 549:2682. Do not expand scope.
```

## File change plan
| File | Action | Reason |
|------|--------|--------|
| `Documents/plans/2026-07-14-unified-search-hydra-recreation-plan.md` | Add | Required scoped implementation plan. |
| Figma `usBJj4PPK8naOgJdi31Lgt`, node `549:2682` | Replace contents and resize | Requested recreation target. |

## Guardrails
- **Allowed:** Read reference/target/DS; write only inside target frame; use linked Hydra DS instances and exact published bindings.
- **Forbidden:** Editing reference or DS; drawing substitute icons/components; detached instances; non-Hydra libraries; raw internal color, typography, spacing, radius, or stroke values.
- **Assumptions:** The white search surface is a structural Auto Layout section rather than a reusable Card; it may be built manually only when every visual property is bound to exact Hydra variables.
- **Open questions:** None. A missing exact DS asset or binding is a blocking pre-write gate, not permission to approximate.

## Risks
- Some reference copy may be implemented through nested component text properties and requires exact property discovery.
- If Hydra DS lacks an exact component or token for any visible element, strict recreation must stop instead of substituting.
- Visual parity depends on preserving the reference hierarchy while using current published Hydra variants.

## Acceptance checklist
- [ ] Target frame dimensions match reference.
- [ ] Visible copy, control state, hierarchy, and geometry match reference.
- [ ] Every component and icon instance traces to the approved Hydra library key.
- [ ] Every manual text node uses a published Hydra text style.
- [ ] Every manual color, gap, padding, radius, and stroke is bound to an exact Hydra variable.
- [ ] Every manual structural container uses Auto Layout.
- [ ] No detached instance, raw SVG, flattened substitute, or non-Hydra asset exists.
- [ ] Final target screenshot passes Hydra UX and parity review.

## Full implementation prompt (all approved phases)
```
Implement the approved phases from: Documents/plans/2026-07-14-unified-search-hydra-recreation-plan.md

@hydra-ant-design-screen-recreator
@figma-use
@figma-generate-design
@hydra-ux-audit
@scope-guardrails
@token-discipline

Follow the allowed node and guardrails in the plan. Do not expand scope.
```
