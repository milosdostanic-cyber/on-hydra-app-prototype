# Plan — `hydra-admin-to-figma` agent

**Date:** 2026-10-30
**Scope:** add one Claude Code subagent. No app code, no Figma writes in this task.

## Goal

An agent that walks the live Hydra Admin (`admin.hydra-dev.spaceinch.tech`) with computer use, one module at a time, and puts the important screens of each module into **Admin - RSFC** (`rONB8aMPanOjS3GC1uN16d`), built only from **Hydra Ant Design - DS** (`3ghYBXR6XVUEaeBo3D5E4q`) instances, variables and text styles.

## Files

| File | Change |
|---|---|
| `.claude/agents/hydra-admin-to-figma.md` | New agent |
| `Documentation/agent-rules-and-skills.md` | Add the agent to the AGENTS section and the folder table |

Reused, not changed: `.cursor/skills/hydra-admin-module-to-figma/` (module order, section grammar), `.agents/skills/hydra-ant-design-screen-recreator/` (Hydra-only build contract), `.cursor/skills/hydra-ux-audit/` (UX gate), `Documentation/hidra-admin-figma-audit.html` (28 Oct coverage audit).

## Agent shape

Three modes, each ends with a stop and a question. Matches `hydra-ds-compliance` and `hydra-molecule-builder`.

1. **LAYOUT** (read-only, then apply on "Layout approved"): one page per sidebar module, shared section order, Ready for Dev frames marked move-only, Archive page. Apply = create/rename pages and move frames only.
2. **PLAN `<module>`** (read-only, default): walk the module in the live app, screenshot each important screen and state, read the module's Figma page, write a module plan with the screen list, actions (Move only / Rebuild / New), Hydra components per screen, small UX changes and blockers.
3. **BUILD `<module>`** (only on "Build approved: `<module>`"): build the approved screens, run the gates, report, ask before the next module.

## UX skill choice

| Candidate | Verdict |
|---|---|
| `hydra-ux-audit` | **Use.** Repo-mandated gate for all UI work. Works inside existing components and tokens. Targets non-technical users: one obvious next step, plain copy, all states. |
| `impeccable` | Reject. Code-first (runs a CLI against the repo) and pushes a new visual direction; conflicts with "no new components or tokens". |
| `audit-design-system` / `apply-design-system` | Not a UX skill. DS-integration drift only; the screen-recreator gates already cover binding. |

## Risks and guards

- **Login:** the agent never types a password. If a sign-in page shows, it stops and asks the user to sign in.
- **Live data:** dev environment, but the agent opens dialogs only to look. It never clicks Save, Create, Delete, Publish, Import, Invite or Export.
- **Ready for Dev:** move only, with a before/after fingerprint of every descendant. If status sits on a section, move the whole section or ask.
- **Raw values:** everything bound. Only exceptions: canvas x/y of top-level frames and sections, and the outer screen size taken from the live app.
- **Missing DS coverage:** stop and ask; never draw a substitute.
