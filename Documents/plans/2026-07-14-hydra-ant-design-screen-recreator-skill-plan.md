# Plan: Hydra Ant Design Screen Recreator Skill

## Meta
- **Date:** 2026-07-14
- **Request type:** figma-delta (author a reusable skill for future reference-screen-to-Figma work)
- **User request summary:** Create a project-local skill that recreates a supplied reference screen in Figma using only the Hydra Ant Design - DS library, with Auto Layout, live component instances, exact variable bindings, published text styles, tokenized spacing, and no raw or foreign design-system values.
- **Status:** approved by direct user request; implementation follows this scoped plan
- **Plan file:** `/Users/milosdostanic/Documents/💼 Work/SpaceInch/Hydra/on-hydra-app-prototype/Documents/plans/2026-07-14-hydra-ant-design-screen-recreator-skill-plan.md`

## Orchestration for planning (this run)

### Explicit skills and rules used
| Name | Type | Path | Why selected |
|------|------|------|--------------|
| `@plan-orchestrator` | rule | `.cursor/rules/plan-orchestrator.mdc` | Required plan-first workflow and exact file scope. |
| `@skill-creator` | skill | `/Users/milosdostanic/.codex/skills/.system/skill-creator/SKILL.md` | Required structure, initialization, metadata, and validation for a new skill. |
| `@figma-use` | skill | `.cursor/skills/figma-use/SKILL.md` | Defines safe Official Figma Plugin API use, Auto Layout, variable binding, and incremental validation. |
| `@figma-generate-design` | skill | bundled Figma plugin skill | Defines the design-system-first workflow for composing a full screen in Figma. |
| `@hydra-ux-audit` | skill | `.cursor/skills/hydra-ux-audit/SKILL.md` | Required Hydra quality gate for every future screen created by the skill. |
| `@hydra-ui-tokens-and-components` | skill | `Documentation/hydra-ai-pack/skills/hydra-ui-tokens-and-components/SKILL.md` | Reinforces Ant Design component and token-only composition. |

### Implicit rules (always active)
| Invoke | Path | Why relevant to this task |
|--------|------|---------------------------|
| `@token-discipline` | `.cursor/rules/token-discipline.mdc` | Keep discovery and writes limited to the source screen, Hydra DS, and target frame. |
| `@scope-guardrails` | `.cursor/rules/scope-guardrails.mdc` | Prevent unrelated repository and Figma edits. |
| `@product-ux-rules` | `.cursor/rules/product-ux-rules.mdc` | Preserve user-friendly hierarchy while matching the reference. |
| `@ux-guardrails` | `.cursor/rules/ux-guardrails.mdc` | Forbid invented patterns, raw styling, and shared DS changes. |
| `@hydra-ui-tokens` | `.cursor/rules/hydra-ui-tokens.mdc` | Require token and typography bindings. |
| `@hydra-ux-composition` | `.cursor/rules/hydra-ux-composition.mdc` | Permit only tokenized Auto Layout composition around approved instances. |
| `@figma-repo-parity` | `.cursor/rules/figma-repo-parity.mdc` | Keep the skill anchored to the live Figma source without changing DS definitions. |

### Not used (and why)
| Name | Why skipped |
|------|-------------|
| `@figma-console-mcp` | The user did not request Console; Official Figma MCP is mandatory. |
| `@ds-parity-auditor` | No DS sync or token mutation is requested. |
| `@figma-frame-ds-cleanup` | Its local Ant Design fallback and static mappings are intentionally too permissive for this DS-only requirement. |
| BOM rules/PRD | No BOM screen is being implemented in this task. |

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
@skill-creator
@figma-use
@figma-generate-design
@hydra-ux-audit
@hydra-ui-tokens-and-components
@scope-guardrails
@token-discipline
```

### Implicit rules during implementation
| Invoke | Path | Applies when |
|--------|------|--------------|
| `@figma-mcp-routing` | `.cursor/rules/figma-mcp-routing.mdc` | All Figma reads and writes; Official MCP only. |
| `@hydra-ui-tokens` | `.cursor/rules/hydra-ui-tokens.mdc` | Defining the skill's binding and raw-value gates. |
| `@figma-repo-parity` | `.cursor/rules/figma-repo-parity.mdc` | Recording the canonical DS source and preventing silent drift. |

### Optional add-ons
| Invoke | Path | When to add |
|--------|------|-------------|
| `@figma-create-new-file` | bundled Figma plugin skill | Only when a future user explicitly requests a new target Figma file. |

## Scope summary
- Create one reusable project-local Codex skill under `.agents/skills/hydra-ant-design-screen-recreator/`.
- Lock its only design-system source to Figma file `3ghYBXR6XVUEaeBo3D5E4q`, library `Hydra Ant Design - DS`, library key `lk-0d30b3c585621778932fa331ee41bae63d4de909f26f80911a7a4b3db61a93641afadfdebd413c3fee615b87b1b49ed17cf9574625892ba8af7162787da919ed`, with node `137:4507` retained as the provided source entry point.
- Treat any later reference screen as visual/content/layout context only; never import, clone, sample, or reuse its components, variables, styles, icons, or effects.
- Require live, library-scoped discovery for every screen rather than trusting cached component/token values.
- Do not create a Figma screen in this task because the reference screen has not been supplied yet.

## Current flow audit
- The repo has a broader `figma-frame-ds-cleanup` skill, but it permits local Ant Design fallback components and static mappings, which conflicts with the user's strict DS-only contract.
- Official Figma reads confirm the supplied node is `Modal__Overlay`, with Auto Layout-driven variants and Hydra variables/text styles such as Cairo typography, semantic colors, padding tokens, radii, control heights, and effects.
- Official library discovery confirms the exact Hydra library key and also exposes many unrelated libraries; the new skill must scope every search to the Hydra key and reject all other results.
- No dedicated project-local skill currently enforces zero foreign assets, zero detached instances, zero local fallback components, and zero raw styling as a hard stop.

## Requirements / gap table
| Requirement | Current | Gap | UX risk | Area |
|-------------|---------|-----|---------|------|
| Hydra DS is the only source | Broader skill can use local fallbacks | Need a hard library allowlist | High | Provenance |
| Reference is context only | No strict separation contract | Need explicit allowed/forbidden reference usage | High | Discovery |
| All controls are linked instances | Existing workflows can manually build missing controls | Need stop-on-missing behavior | High | Components |
| All text uses published styles | General workflows permit styled free text | Need mandatory `textStyleId` audit | High | Typography |
| Colors and effects are bound | General workflows may use raw fallback paints | Need zero-unbound-paint gate | High | Styling |
| Spacing and radii use variables | General workflows allow closest/raw structural values | Need bound padding/gap/radius audit | High | Layout |
| Screen uses Auto Layout | Existing guidance is strong but not DS-specific | Need descendant-level Auto Layout audit | High | Structure |
| Exact visual match | General visual comparison is qualitative | Need explicit reference-size screenshots and parity iterations | High | Validation |
| Missing DS coverage | Existing skill can improvise | Need fail-closed gap report and user decision | Medium | Error handling |

## Proposed UX flow
1. User invokes the skill with a reference screen and an existing target Figma file/frame.
2. Skill inspects the reference only for dimensions, regions, content, hierarchy, and visible state.
3. Skill discovers required assets live from the Hydra library only and records exact keys/properties/styles/variables.
4. If any required asset or token is missing, skill stops before writing and reports the exact gap.
5. Skill builds the target incrementally from Hydra instances and token-bound Auto Layout wrappers.
6. Skill runs structural, provenance, token, typography, Auto Layout, and visual parity audits.
7. Skill fixes target-only defects and closes only when all hard gates pass or reports the remaining DS blocker without improvising.

## Implementation plan by phase

### Phase 1 — Author and validate the strict DS-only skill
- **Goal:** Create a discoverable skill with a fail-closed Hydra DS contract and reusable validation workflow.
- **Files:** `.agents/skills/hydra-ant-design-screen-recreator/SKILL.md`, `.agents/skills/hydra-ant-design-screen-recreator/agents/openai.yaml`, `.agents/skills/hydra-ant-design-screen-recreator/references/hydra-ds-contract.md`, `Documentation/agent-rules-and-skills.md`.
- **UI changes:** None in this phase; the skill will govern future Figma screen creation.
- **Data/state:** Store only stable source identifiers and process rules; do not cache mutable component/variable/style inventories as authority.
- **Acceptance criteria:** Skill validates with `quick_validate.py`; metadata is discoverable; the workflow explicitly requires Official Figma MCP, Hydra-library-only search, Auto Layout, linked instances, exact styles/variables, zero raw style values, target-only writes, visual parity iteration, and stop-on-gap behavior.
- **Must not change:** Existing skills, application code, theme/token files, Figma canvas, Hydra DS definitions, unrelated documentation.

#### Phase 1 — invoke for implementation
```
@skill-creator
@figma-use
@figma-generate-design
@hydra-ux-audit
@hydra-ui-tokens-and-components
@scope-guardrails
@token-discipline
```

**Copy-paste prompt:**
```
Implement Phase 1 only from this plan: /Users/milosdostanic/Documents/💼 Work/SpaceInch/Hydra/on-hydra-app-prototype/Documents/plans/2026-07-14-hydra-ant-design-screen-recreator-skill-plan.md

@skill-creator
@figma-use
@figma-generate-design
@hydra-ux-audit
@hydra-ui-tokens-and-components
@scope-guardrails
@token-discipline

Allowed files:
- .agents/skills/hydra-ant-design-screen-recreator/SKILL.md
- .agents/skills/hydra-ant-design-screen-recreator/agents/openai.yaml
- .agents/skills/hydra-ant-design-screen-recreator/references/hydra-ds-contract.md
- Documentation/agent-rules-and-skills.md

Forbidden:
- Figma canvas writes
- src/**
- theme/token changes
- edits to existing skills

Source: https://www.figma.com/design/3ghYBXR6XVUEaeBo3D5E4q/Hydra-Ant-Design---DS?node-id=137-4507
```

## File change plan
| File | Action | Reason |
|------|--------|--------|
| `.agents/skills/hydra-ant-design-screen-recreator/SKILL.md` | Create | Core strict screen-recreation workflow and hard gates. |
| `.agents/skills/hydra-ant-design-screen-recreator/agents/openai.yaml` | Create | Discoverable skill UI metadata. |
| `.agents/skills/hydra-ant-design-screen-recreator/references/hydra-ds-contract.md` | Create | Canonical source IDs, provenance rules, and audit contract. |
| `Documentation/agent-rules-and-skills.md` | Update | Register the new project skill in the repository catalog. |

## Guardrails
- **Allowed (after approval):** Create the three skill files and add one catalog entry; read Figma and repo context.
- **Forbidden:** Any Figma write, application/source/theme change, existing-skill rewrite, cached raw token values as authority, non-Hydra library use, or local fallback component creation.
- **Assumptions:** The skill is project-local so repository collaborators receive the same behavior; exact outer screen dimensions may follow the reference geometry, while all design-intent styling and internal spacing must be DS-bound.
- **Open questions:** The future reference screen and target Figma node are intentionally runtime inputs and are not required to author the skill.

## Risks
- The Hydra library can change; live discovery and key-scoped searches are mandatory on every run.
- Some reference-screen elements may not exist in Hydra DS; the skill must stop and request a DS decision rather than approximate.
- Pixel-perfect matching can conflict with available discrete DS variants/tokens; the skill must report the exact conflict and never silently break the DS contract.

## Acceptance checklist
- [ ] Skill initialized with the official skill scaffolder.
- [ ] Only `name` and `description` appear in SKILL.md frontmatter.
- [ ] Hydra file key, library name/key, and provided entry node are recorded.
- [ ] All Figma searches are explicitly restricted to the Hydra library key.
- [ ] Reference screen is explicitly context-only and excluded as an asset/style source.
- [ ] Missing component/token/style/icon/effect causes a pre-write stop.
- [ ] No local fallback, raw SVG, detached instance, foreign DS, new token, or new style is permitted.
- [ ] Auto Layout and bound-variable audits are mandatory.
- [ ] Every text node must use a published Hydra text style and tokenized text color.
- [ ] Visual parity validation is required before claiming completion.
- [ ] `quick_validate.py` passes.
- [ ] Existing dirty worktree files remain untouched.

## Full implementation prompt (all approved phases)
```
Implement approved phase(s) from: /Users/milosdostanic/Documents/💼 Work/SpaceInch/Hydra/on-hydra-app-prototype/Documents/plans/2026-07-14-hydra-ant-design-screen-recreator-skill-plan.md

@skill-creator
@figma-use
@figma-generate-design
@hydra-ux-audit
@hydra-ui-tokens-and-components
@scope-guardrails
@token-discipline

Follow allowed files and guardrails in the plan. Do not expand scope.
```
