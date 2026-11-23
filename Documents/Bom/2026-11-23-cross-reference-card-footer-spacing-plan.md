# Plan: Cross-reference card footer spacing

## Meta
- **Date:** 2026-11-23
- **Request type:** ui-change (BOM)
- **User request summary:** Make the white content section’s top and bottom spacing equal, using the larger token-based spacing shown around the title and competitor/SKU text.
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
Align the top and bottom padding of the cross-reference card’s upper content block. Do not alter its horizontal padding or the gap between its description and competitor/SKU lines.

## Current flow audit
`PartCrossReferenceCard` uses a white upper content block followed by a bordered gray status footer. Its top padding still comes from `token.paddingSM`, while its bottom padding is `token.paddingLG`, so the two highlighted spaces do not match.

## Requirements / gap table
| Requirement | Current | Gap | UX risk | Area |
|-------------|---------|-----|---------|------|
| Equal top and bottom space in the white content section | Top uses `token.paddingSM`; bottom uses `token.paddingLG` | Vertical padding is asymmetric | Content appears vertically unbalanced | Cross-reference result card |
| Preserve spacing between the two text lines | `token.marginXXS` | None | Changing it would put space in the wrong place | Upper content block |

## Proposed UX flow
No flow or interaction changes. The card remains fully clickable and retains the same content hierarchy.

## Implementation plan by phase

### Phase 1 — Balance vertical content padding
- **Goal:** Make the white section’s top and bottom spacing equal.
- **Files:** `src/bom/components/PartCrossReferenceCard.tsx`
- **UI changes:** Use `paddingBlock: token.paddingLG` for equal vertical spacing and retain `paddingInline: token.paddingSM`.
- **Data/state:** None.
- **Acceptance criteria:** The title’s top spacing matches the competitor/SKU line’s bottom spacing; horizontal and internal text spacing remain unchanged.
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
| `src/bom/components/PartCrossReferenceCard.tsx` | Normalize local vertical padding | Give the white content section equal top and bottom spacing |

## Guardrails
- **Allowed:** One local style normalization using existing spacing tokens.
- **Forbidden:** Raw pixel values, token changes, shared component edits, unrelated BOM changes.
- **Assumptions:** The screenshot’s two callouts indicate that the existing larger bottom spacing should also be applied above the title.
- **Open questions:** None.

## Risks
Minimal; card height increases by one existing token step without changing behavior.

## Acceptance checklist
- [ ] Top and bottom spacing in the white section both use `token.paddingLG`.
- [ ] Horizontal padding and the gap between text lines remain unchanged.
- [ ] Gray footer and card interactions are unchanged.
- [ ] Hydra UX self-audit finds no P0/P1 issues.

## Full implementation prompt
```text
Implement the approved phase from Documents/Bom/2026-11-23-cross-reference-card-footer-spacing-plan.md.
Follow the allowed files and guardrails in the plan. Do not expand scope.
```
