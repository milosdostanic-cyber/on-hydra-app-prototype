# Plan: Hydra Module Builder Skill

## Meta
- **Date:** 2026-07-20
- **Request type:** reusable project skill
- **User request summary:** Create a project-local skill that analyzes a new-module PRD, studies the existing application's real screen and workflow compositions, maps requirements to current reusable UX and implementation patterns, plans the work, implements only within approved scope, and validates native product fit.
- **Status:** approved by direct user request; implementation follows this scoped plan
- **Plan file:** `Documents/plans/2026-07-20-hydra-module-builder-skill-plan.md`

## Existing conventions reviewed
- `@hydra-skill-authoring` defines project skill structure, discoverable frontmatter, explicit non-goals, and final verification.
- `@prd-ux-implementation-planner` provides PRD-to-current-flow gap analysis and plan structure.
- `@hydra-ux-audit` provides the mandatory post-implementation UX, functionality, pattern, token, component, state, and parity gates.
- `@hydra-prd-ux-playbook` requires the validated app capabilities map and existing product patterns before new-screen work.

## Scope

### Files to create
- `.cursor/skills/hydra-module-builder/SKILL.md`

### Files to update
- `Documentation/agent-rules-and-skills.md`
- `Documentation/skills-and-rules-catalog.md`

### Must not change
- Application code under `src/`
- Shared components, design tokens, theme files, routes, tests, or configuration
- Existing skills and rules
- Current user-authored plans and product specifications

## Skill design
1. Trigger on a PRD/spec plus a request to add or build a module in the existing Hydra application.
2. Separate targeted repository discovery from PRD application.
3. Inspect real screens and workflows, not component files in isolation.
4. Build an evidence-based pattern map covering shell, navigation, page composition, common surfaces, states, responsiveness, data/state conventions, and design-system usage.
5. Rank candidate references by semantic fit and currency; identify legacy or inconsistent examples without treating file age alone as authority.
6. Emit a concise PRD summary, required screen/state inventory, closest-reference map, reuse decisions, new-work boundaries, conflicts, and critical questions.
7. Create a small file-scoped implementation plan before code.
8. Implement only when the user explicitly requested implementation and no critical decision is unresolved.
9. Validate PRD coverage, product fit, functionality, state coverage, token/component reuse, regressions, and scope.

## Acceptance criteria
- [ ] Skill frontmatter contains a valid lowercase name and specific WHAT+WHEN description.
- [ ] Skill is project-local and auto-discoverable.
- [ ] Repository discovery is targeted and evidence-based.
- [ ] Real screen composition and workflows are analyzed, not only isolated components.
- [ ] Current versus legacy pattern selection has explicit criteria.
- [ ] PRD analysis includes all six requested summary areas.
- [ ] Routes, headers, breadcrumbs, common UI surfaces, states, responsive behavior, and component necessity are addressed.
- [ ] Minor details are inferred from established patterns; only material ambiguity blocks implementation.
- [ ] Plan-before-code and explicit implementation authorization are enforced.
- [ ] Shared/global changes require explicit approval.
- [ ] `@hydra-ux-audit` is required before completion.
- [ ] Catalog entries explain purpose and invocation.
- [ ] Finished skill is read back and remains under 500 lines.
