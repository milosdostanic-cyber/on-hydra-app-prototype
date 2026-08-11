# Plan: Transfer Content File Manager to Figma

## Meta
- **Date:** 2026-07-14
- **Request type:** figma-delta (authenticated local web screen to an existing blank Figma node)
- **User request summary:** Recreate `http://localhost:3003/content/file-manager` inside Figma node `542:2725`, using only published Hydra Ant Design - DS component instances, variables, text styles, and Auto Layout.
- **Status:** approved by the direct implementation request; implementation not started
- **Plan file:** `/Users/milosdostanic/Documents/💼 Work/SpaceInch/Hydra/on-hydra-app-prototype/Documents/plans/2026-07-14-content-file-manager-to-figma-plan.md`

## Orchestration for planning (this run)

### Explicit skills and rules used
| Name | Type | Path | Why selected |
|------|------|------|--------------|
| `@plan-orchestrator` | rule | `.cursor/rules/plan-orchestrator.mdc` | Required plan-first workflow and scope lock. |
| `@figma-use` | skill | Figma plugin skill | Required before Figma Plugin API reads/writes. |
| `@figma-generate-design` | skill | Figma plugin skill | Required for translating a full web screen into a DS-backed Figma view. |
| `@hydra-ux-audit` | skill | `.cursor/skills/hydra-ux-audit/SKILL.md` | Required quality gate for UI work. |
| `@hydra-design-to-code` | rule | `.cursor/rules/hydra-design-to-code.mdc` | Used in reverse to map the running Hydra screen to existing Figma tokens/components without invention. |
| Browser control | skill | bundled browser skill | Authenticated inspection of the local source screen. |

### Implicit rules (always active)
| Invoke | Path | Why relevant to this task |
|--------|------|---------------------------|
| `@token-discipline` | `.cursor/rules/token-discipline.mdc` | Limits inspection to the source route and target Figma nodes. |
| `@scope-guardrails` | `.cursor/rules/scope-guardrails.mdc` | Prevents changes outside node `542:2725`. |
| `@product-ux-rules` | `.cursor/rules/product-ux-rules.mdc` | Preserves the clear search-first admin flow. |
| `@ux-guardrails` | `.cursor/rules/ux-guardrails.mdc` | Requires adopted Ant Design patterns and existing DS assets. |
| `@hydra-ui-tokens` | `.cursor/rules/hydra-ui-tokens.mdc` | Forbids raw design values. |
| `@hydra-ux-composition` | `.cursor/rules/hydra-ux-composition.mdc` | Allows only local composition from approved assets. |
| `@figma-repo-parity` | `.cursor/rules/figma-repo-parity.mdc` | Confirms no token or component definitions will be changed. |

### Not used (and why)
| Name | Why skipped |
|------|-------------|
| `@figma-console-mcp` | User did not request Console; Official Figma MCP is the default. |
| `@ds-parity-auditor` | This is one product screen, not a DS-wide sync. |
| BOM rules/PRD | Content File Manager is explicitly outside BOM scope. |

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
@figma-generate-design
@hydra-design-to-code
@hydra-ui-tokens-and-components
@hydra-ux-audit
@scope-guardrails
@token-discipline
```

### Implicit rules during implementation
| Invoke | Path | Applies when |
|--------|------|--------------|
| `@product-ux-rules` | `.cursor/rules/product-ux-rules.mdc` | Verifying wayfinding and the single search action. |
| `@hydra-ui-tokens` | `.cursor/rules/hydra-ui-tokens.mdc` | Binding fills, strokes, spacing, radius, and typography. |
| `@figma-repo-parity` | `.cursor/rules/figma-repo-parity.mdc` | Guard only; no DS definitions may change. |

### Optional add-ons
| Invoke | Path | When to add |
|--------|------|-------------|
| None | — | Existing Hydra DS coverage is sufficient. |

## Scope summary
- **Source of truth:** authenticated default state of `http://localhost:3003/content/file-manager`.
- **Target:** Figma file `usBJj4PPK8naOgJdi31Lgt`, node `542:2725`.
- **Reference only:** existing Figma frame `529:2328` (`Content File Manager — Admin`).
- **Allowed write:** descendants, name, size, layout, and token bindings of `542:2725` only.
- **Forbidden:** application code, Hydra DS library definitions, other Figma frames/pages, Content File Manager behavior, and all BOM areas.

## Current flow audit
- Authenticated admin shell with sidebar, top bar, breadcrumb, page title, instructions, receipts action, catalog search controls, and informational alert.
- Default path is clear: choose Figure/SKU mode, enter a value, and Search.
- Existing Figma reference matches the current route structure and already uses 39 published DS instances and Auto Layout, but free text and a few container paints require stricter style/token cleanup before reuse.
- The target node is a blank `2947 × 1671` frame.

## Requirements / gap table
| Requirement | Current | Gap | UX risk | Area |
|-------------|---------|-----|---------|------|
| Match authenticated route | Source and prior Figma reference inspected | Target is blank | High if omitted or stale | Whole screen |
| Hydra DS instances only | Reference contains published Hydra components | Preserve instance links; no reconstructed controls/icons | High | Shell and controls |
| Figma text styles only | Heading styles exist; several free text nodes use direct Cairo values | Apply published Hydra styles to all free text | Medium | Typography |
| Variables only | Most semantic colors and component tokens are bound | Bind remaining free-frame paint/spacing/radius fields | Medium | Styling/layout |
| Auto Layout everywhere | Reference has no manual frames | Preserve and validate Auto Layout after transfer | High | Structure |
| Do not alter DS/source frame | Both exist | Isolate all edits to target | High | Scope |

## Proposed UX flow
1. Admin identifies the page from shell and breadcrumb.
2. Admin reads the concise three-step guidance.
3. Admin chooses Figure/Part number or SKU/Variant.
4. Admin enters a catalog identifier and uses Search.
5. Empty/default state explains that results will appear below; receipts remain secondary.

## Implementation plan by phase

### Phase 1 — Assemble the DS-backed screen
- **Goal:** Populate the blank target node with the authenticated default File Manager state.
- **Files:** Figma node `542:2725` only; no repository files.
- **UI changes:** Reuse the existing screen composition, published component instances, variables, and text styles; resize/rename the blank target to the actual desktop screen size.
- **Data/state:** Static default UI state only; no application data mutations.
- **Acceptance criteria:** Screen matches the local route, all structural containers use Auto Layout, controls/icons remain DS instances, free text uses Hydra styles, and free container styles use Hydra variables.
- **Must not change:** Node `529:2328`, Hydra Ant Design - DS, any other Figma node, repository code.

#### Phase 1 — invoke for implementation
```
@figma-use
@figma-generate-design
@hydra-design-to-code
@hydra-ui-tokens-and-components
@hydra-ux-audit
@scope-guardrails
@token-discipline
```

**Copy-paste prompt:**
```
Implement Phase 1 only from this plan: /Users/milosdostanic/Documents/💼 Work/SpaceInch/Hydra/on-hydra-app-prototype/Documents/plans/2026-07-14-content-file-manager-to-figma-plan.md

@figma-use
@figma-generate-design
@hydra-design-to-code
@hydra-ui-tokens-and-components
@hydra-ux-audit
@scope-guardrails
@token-discipline

Allowed target: Figma node 542:2725 in file usBJj4PPK8naOgJdi31Lgt.
Reference only: node 529:2328 and authenticated localhost route.
Forbidden: repository changes, DS definition changes, and edits to any other Figma node.
```

### Phase 2 — Visual and structural quality gate
- **Goal:** Verify 1:1 layout, DS provenance, token/style binding, and Auto Layout integrity.
- **Files:** Read-only audit plus targeted fixes inside `542:2725` only.
- **UI changes:** Fix only defects found in the target.
- **Data/state:** None.
- **Acceptance criteria:** No clipped/overlapping text, correct Cairo font via published styles/components, no detached controls/icons, no manual structural frames, and no unbound free-design paint/spacing/radius values.
- **Must not change:** Same exclusions as Phase 1.

#### Phase 2 — invoke for implementation
```
@figma-use
@figma-generate-design
@hydra-ux-audit
@scope-guardrails
@token-discipline
```

**Copy-paste prompt:**
```
Implement Phase 2 only from this plan: /Users/milosdostanic/Documents/💼 Work/SpaceInch/Hydra/on-hydra-app-prototype/Documents/plans/2026-07-14-content-file-manager-to-figma-plan.md

@figma-use
@figma-generate-design
@hydra-ux-audit
@scope-guardrails
@token-discipline

Audit and fix only Figma node 542:2725. Do not edit the DS or any sibling/reference node.
```

## File change plan
| File | Action | Reason |
|------|--------|--------|
| `Documents/plans/2026-07-14-content-file-manager-to-figma-plan.md` | Add | Required scoped implementation plan. |
| Figma node `542:2725` | Populate and audit | Requested deliverable. |

## Guardrails
- **Allowed (after approval):** Clone/reuse DS-backed composition into the target, import published Hydra variables/styles/components by key, bind target properties, and visually validate.
- **Forbidden:** New variables, new text/effect styles, new reusable core components, detached DS instances, raw design-intent colors/type/spacing/radii, changes outside the target.
- **Assumptions:** The authenticated default route state is the requested state; the prior Figma frame is a structural reference, not an authority over the running screen.
- **Open questions:** None; the user supplied authenticated access and a node-specific Figma URL.

## Risks
- Instance internals can report raw values even when governed by the published DS; audit must distinguish DS-owned instance internals from free target nodes.
- Cloning can preserve source bindings but free text needs explicit published style assignment.
- The blank target dimensions differ from the actual desktop screen and must be normalized intentionally.

## Acceptance checklist
- [ ] Target node contains the complete default File Manager screen.
- [ ] Running route and final Figma screenshot visually match.
- [ ] Every control/icon is a Hydra Ant Design - DS instance.
- [ ] Every free text node uses a published Hydra text style.
- [ ] Every free design-intent fill, stroke, spacing, and radius uses a published Hydra variable/style.
- [ ] Every structural container uses Auto Layout.
- [ ] Target has no clipped, overlapping, or placeholder content.
- [ ] Reference node, DS library, repository code, and unrelated Figma content are unchanged.

## Full implementation prompt (all approved phases)
```
Implement approved phases from: /Users/milosdostanic/Documents/💼 Work/SpaceInch/Hydra/on-hydra-app-prototype/Documents/plans/2026-07-14-content-file-manager-to-figma-plan.md

@figma-use
@figma-generate-design
@hydra-design-to-code
@hydra-ui-tokens-and-components
@hydra-ux-audit
@scope-guardrails
@token-discipline

Follow the exact target and guardrails. Do not expand scope.
```
