# Implementation plans

Plans are created by **`@plan-orchestrator`** (`.cursor/rules/plan-orchestrator.mdc`).

The orchestrator **writes plans only** — it never implements code.

## Location and naming

| Location | Pattern | When |
|----------|---------|------|
| `Documents/plans/` | `YYYY-MM-DD-<short-slug>-plan.md` | Default |
| `Documents/Bom/` | `YYYY-MM-DD-<short-slug>-plan.md` | BOM-related work |

Example: `Documents/plans/2026-06-08-bom-landing-figma-sync-plan.md`

## Plan contents

Each plan is **English** and includes:

1. Which skills and rules were orchestrated for planning and why
2. **Implementation invocation** — `@` blocks to attach in a **new chat** when implementing
3. Per-phase copy-paste prompts with the correct skills and rules for that phase
4. Scope, gaps, file list, guardrails, and acceptance criteria

## Workflow

1. `@plan-orchestrator` + describe the task → plan file in `Documents/`
2. Review and approve a phase in the plan
3. New chat → copy **Phase N — copy-paste prompt** from the plan (includes `@` skills and rules)

Catalog: [`Documentation/agent-rules-and-skills.md`](../../Documentation/agent-rules-and-skills.md)
