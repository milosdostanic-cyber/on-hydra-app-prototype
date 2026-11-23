# Plan: Cross-reference card footer spacing

## Meta
- **Date:** 2026-11-23
- **Request type:** ui-change (BOM)
- **User request summary:** Add a little more token-based visual space between the “Victaulic · SKU” line and the top of the gray match-status footer.
- **Status:** approved by direct implementation request
- **Plan file:** `Documents/Bom/2026-11-23-cross-reference-card-footer-spacing-plan.md`

## Orchestration for planning (this run)

### Explicit skills and rules used
| Name | Type | Path | Why selected |
|------|------|------|--------------|
| `@plan-orchestrator` | Rule | `.cursor/rules/plan-orchestrator.mdc` | Required plan-first workflow |
| `@hydra-ux-audit` | Skill | `.cursor/skills/hydra-ux-audit/SKILL.md` | Required UI quality gate |
| `@hydra-ui-tokens-and-components` | Skill | `Documentation/hydra-ai-pack/skills/hydra-ui-tokens-and-components/SKILL.md` | Tokenized Hydra spacing |

### Implicit rules (always active)
| Invoke | Path | Why relevant to this task |
|--------|------|---------------------------|
| `@token-discipline` | `.cursor/rules/token-discipline.mdc` | Keep inspection and edits narrow |
| `@scope-guardrails` | `.cursor/rules/scope-guardrails.mdc` | Limit implementation to the card |
| `@product-ux-rules` | `.cursor/rules/product-ux-rules.mdc` | Preserve user-friendly presentation |
| `@ux-guardrails` | `.cursor/rules/ux-guardrails.mdc` | Reuse existing components and tokens |
| `@hydra-ui-tokens` | `.cursor/rules/hydra-ui-tokens.mdc` | Avoid raw spacing literals |
| `@hydra-ux-composition` | `.cursor/rules/hydra-ux-composition.mdc` | Preserve the existing Card/Flex composition |

### Not used (and why)
| Name | Why skipped |
|------|-------------|
| `@figma-use` | No Figma node or visual reference was supplied |
| `@ds-parity-auditor` | This is a local screen adjustment, not a design-system change |

## Implementation invocation

### Baseline
```text
@scope-guardrails
@token-discipline
@ux-guardrails
@hydra-ui-tokens-and-components
@hydra-ux-audit
```

## Scope summary
Adjust only the bottom padding of the cross-reference card’s upper content block. Do not alter the gap between its description and competitor/SKU lines.

## Current flow audit
`PartCrossReferenceCard` uses a white upper content block followed by a bordered gray status footer. The upper block currently has `token.paddingMD` below the competitor/SKU line; the supplied screenshot asks for a slightly larger gap in that same location.

## Requirements / gap table
| Requirement | Current | Gap | UX risk | Area |
|-------------|---------|-----|---------|------|
| Slightly more space between competitor/SKU text and gray footer | `token.paddingMD` bottom padding | One additional token step requested | Card content still feels close to footer | Cross-reference result card |
| Preserve spacing between the two text lines | `token.marginXXS` | None | Changing it would put space in the wrong place | Upper content block |

## Proposed UX flow
No flow or interaction changes. The card remains fully clickable and retains the same content hierarchy.

## Implementation plan by phase

### Phase 1 — Correct footer separation
- **Goal:** Increase only the space below the competitor/SKU line.
- **Files:** `src/bom/components/PartCrossReferenceCard.tsx`
- **UI changes:** Replace the upper block’s `paddingBottom: token.paddingMD` with the next larger established spacing step, `paddingBottom: token.paddingLG`.
- **Data/state:** None.
- **Acceptance criteria:** The gray footer has visibly more separation from the competitor/SKU line; the two text lines retain their existing gap.
- **Must not change:** Footer padding, typography, colors, card interaction, shared components, or tokens.

#### Phase 1 — invoke for implementation
```text
@scope-guardrails
@token-discipline
@ux-guardrails
@hydra-ui-tokens-and-components
@hydra-ux-audit
```

**Copy-paste prompt:**
```text
Implement Phase 1 only from this plan: Documents/Bom/2026-11-23-cross-reference-card-footer-spacing-plan.md

Allowed files:
- src/bom/components/PartCrossReferenceCard.tsx

Do not change shared components, theme tokens, or the internal text-line gap.
```

## File change plan
| File | Action | Reason |
|------|--------|--------|
| `src/bom/components/PartCrossReferenceCard.tsx` | Edit one spacing token | Put the requested space directly above the gray footer |

## Guardrails
- **Allowed:** One local token substitution.
- **Forbidden:** Raw pixel values, token changes, shared component edits, unrelated BOM changes.
- **Assumptions:** `token.paddingLG` is the next established Hydra/Ant Design padding step and matches the request for a slightly larger gap.
- **Open questions:** None.

## Risks
Minimal; card height increases by one existing token step without changing behavior.

## Acceptance checklist
- [ ] Space is below “Victaulic · SKU,” not between the card’s text lines.
- [ ] Space is increased one established step through `token.paddingLG`.
- [ ] Gray footer and card interactions are unchanged.
- [ ] Hydra UX self-audit finds no P0/P1 issues.

## Full implementation prompt
```text
Implement the approved phase from Documents/Bom/2026-11-23-cross-reference-card-footer-spacing-plan.md.
Follow the allowed files and guardrails in the plan. Do not expand scope.
```
