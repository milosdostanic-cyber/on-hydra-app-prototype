---
name: hydra-skill-authoring
description: >-
  Creates and hardens Cursor Agent Skills for this repo's `.cursor/skills/`
  layout — read-only-by-default, hard-stop-after-plan, explicit
  implementation-handoff pattern. Use when the user asks to create a new
  skill, review/fix an existing SKILL.md, or turn a plan/workflow/transcript
  into a reusable skill.
---

# Hydra Skill Authoring

Generalizes the process used to create `hydra-work-planner` and harden it on
review: inspect repo conventions first, write/update `SKILL.md`, then enforce
the plan-first / read-only / hard-stop pattern that this repo expects from
any "decide what to do" or "produce a plan" skill.

## When to use

- "Create a skill that does X"
- "Review/fix this SKILL.md"
- "Turn this transcript/workflow into a skill"

Not for one-off tasks that don't recur — only build a skill when the
workflow will be reused.

## Workflow

```text
Hydra Skill Authoring:
- [ ] 1. Inspect existing skill conventions in this repo
- [ ] 2. Decide location + name
- [ ] 3. Draft frontmatter (name, description, WHAT+WHEN)
- [ ] 4. Write body (workflow, sources, output template)
- [ ] 5. Apply plan-first hardening (if the skill "decides what to do")
- [ ] 6. Add Explicit non-goals
- [ ] 7. Verify against checklist
```

### Step 1 — Inspect conventions

Glob `.cursor/skills/**/SKILL.md` and `.agents/skills/**/SKILL.md` before
writing anything. Read 1–2 similar existing skills (closest task match) for:

- frontmatter shape (`name`, `description` — this repo generally omits
  `disable-model-invocation` so skills auto-trigger from natural language;
  only set it when the skill is a mandatory pre-tool-call gate, e.g. `figma-use`)
- heading structure (`## Purpose`, `## Workflow`, `## Output format`, etc.)
- how MCP sources / repo inspection steps are documented
- how "Explicit non-goals" / scope guardrails are phrased

Reuse the closest match's structure. Do not invent a new shape.

### Step 2 — Location + name

- Project-shared workflow → `.cursor/skills/<name>/SKILL.md`
- Name: lowercase, hyphens, descriptive of the task (not `helper`/`utils`)

### Step 3 — Frontmatter

```yaml
---
name: skill-name
description: >-
  WHAT it does (specific capabilities), in third person. WHEN to use it
  (trigger phrases the user would actually say).
---
```

### Step 4 — Body

Match the closest existing skill's section order. For a "decide/plan" skill
(like `hydra-work-planner`), typical sections: `Purpose`, `Default mode`,
`Required sources`, `Conflict rules` (if multiple sources can disagree),
`Workflow` checklist, `Output format` template, `Failure / sparse-data
behavior`, `Explicit non-goals`.

### Step 5 — Plan-first hardening

Apply this whenever the skill's job is to **decide, prioritize, or plan**
rather than directly execute (i.e. the user reviews the plan before
implementation happens). This was the exact fix requested when hardening
`hydra-work-planner`:

1. **Default mode: read-only** — state plainly what the skill must not edit
   (repo files, Jira/Confluence/Drive/Figma, etc.) and that it only writes
   when the user **explicitly** asks to implement/update.
2. **Hard stop** — add a line stating the skill's job ends the moment the
   output template is printed; it must never continue into editing,
   scaffolding, or calling implement-oriented skills in the *same turn*,
   even if the plan looks simple or obvious.
3. **Workflow checklist's last step** — phrase it `Emit output template,
   then STOP` (not just "emit output").
4. **End of Output format section** — after the template, the skill must
   end its turn with one short line asking whether to proceed (e.g. "Say
   the word if you want me to start on X."), and must not start
   implementing in that same response.
5. **Implementation handoff section** — a short section stating: only
   triggers on later explicit confirmation ("implement this", "go ahead",
   "start X" — accept the user's own language/wording too); scope strictly
   to what was already presented unless the user names a different item;
   at that point follow the repo's standard implementation rules
   (`AGENTS.md`, scope guardrails, token discipline, `@hydra-ux-audit` for
   UI work); don't silently expand scope — re-surface changes first.
6. **Explicit non-goals** — reiterate: no implementation of even a "quick"
   or "obvious" first step in the same turn as the plan.

Skip steps 1–6 entirely for skills that are meant to execute directly
(e.g. a formatter or a component-mapper) — only "decide what to do next"
style skills need this.

### Step 6 — Explicit non-goals

Every skill ends with a short bullet list of things it must never do
unasked (edit tickets/PRs, broaden scope, invent tokens/components, promote
local UI to shared/core, etc.) — mirror the closest existing skill's list
and add task-specific items only.

### Step 7 — Verification checklist

- [ ] Frontmatter has WHAT + WHEN in `description`
- [ ] Body structure matches the closest existing repo skill
- [ ] If plan-first: hard stop + STOP-labeled workflow step + handoff
      section + non-goals all present and consistent with each other
- [ ] No new tokens/components/patterns invented — only documents workflow
- [ ] Under ~500 lines; link out to a reference file if it grows past that
- [ ] `Read` the finished file back once to confirm it renders/edits cleanly

## Reviewing/fixing an existing SKILL.md

When asked to "check"/"fix" a skill instead of create one:

1. `Read` the current file in full.
2. Diff its structure against Steps 3–6 above and the closest sibling skill.
3. Make surgical `StrReplace` edits only for the gaps found — don't rewrite
   working sections.
4. Summarize exactly what changed and why, referencing the specific
   section/rule added (as done for `hydra-work-planner`'s hard-stop pass).

## Explicit non-goals

- Do not invent a new skill-file shape when an existing sibling skill
  already covers the pattern — copy its structure.
- Do not add `disable-model-invocation: true` unless the skill is a
  mandatory pre-tool-call gate.
- Do not implement the skill's *subject task* while authoring the skill —
  authoring only produces the `SKILL.md` (and reference files, if any).
- Do not create skills for one-off, non-recurring tasks.
