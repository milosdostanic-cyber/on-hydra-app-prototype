# Hydra AI pack — rules + skills (manual pull)

This folder is a **stable place to @-mention or copy** Hydra constraints for agents. **Authoritative enforcement** for Cursor in this repo still comes from `.cursor/rules/*.mdc` (many are `alwaysApply: true`).

## Layout

| Path | Purpose |
|------|---------|
| [`rules/`](./rules/) | Markdown summaries / checklists aligned with token + component guardrails |
| [`skills/hydra-ui-tokens-and-components/`](./skills/hydra-ui-tokens-and-components/) | Cursor-style `SKILL.md` for the same constraints (attach in chat or register as a project skill) |

## How to use

1. **In Cursor chat:** type `@` and pick `Documentation/hydra-ai-pack/rules/hydra-tokens-and-components.md` or the skill folder / `SKILL.md` so the model loads them for that turn.
2. **As a Cursor Skill:** add the skill path (see [`skills/README.md`](./skills/README.md)) so it appears in the Skills picker.
3. **Other tools (Claude Code, etc.):** copy `skills/hydra-ui-tokens-and-components/` into that tool’s skills directory, or symlink this repo path.

## Source of truth (do not drift)

- `.cursor/rules/hydra-ui-tokens.mdc`
- `.cursor/rules/ux-guardrails.mdc`
- `.cursor/rules/hydra-ux-composition.mdc`
- `.cursor/rules/figma-repo-parity.mdc` (when changing primitives / theme)
- `AGENTS.md` (repo-wide agent contract)

If this pack disagrees with those files, **the `.cursor/rules` + `AGENTS.md` win** — update this pack to match.
