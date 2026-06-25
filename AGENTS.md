# Agent Instructions

This repository uses AI-assisted implementation.

**Full catalog (English):** [`Documentation/agent-rules-and-skills.md`](./Documentation/agent-rules-and-skills.md)

## General Rules

- Do not implement before creating a scoped plan. Use **`@plan-orchestrator`** to orchestrate skills/rules and write the plan to `Documents/plans/` (BOM: `Documents/Bom/`). Orchestrator never implements code.
- Always inspect the current implementation before proposing changes.
- Compare requirements against the existing flow.
- Prefer existing architecture, components, and patterns.
- Do not touch unrelated areas.
- Do not perform broad refactors.
- Keep changes small and reviewable.
- Optimize UX for non-technical users.
- Reduce cognitive load.
- Preserve existing behavior outside the requested feature.
- For any UI work (build, review, fix), attach **`@hydra-ux-audit`** — enforces patterns, tokens, typography, user-friendly UX, and functional correctness before closing the task.

## BOM-Specific Rules

For Bill of Materials work:

- The source of truth is `docs/prd/bom-prd.md`.
- The user is not technical.
- Do not expose technical column mapping unless necessary.
- Prefer smart mapping summary before advanced mapping.
- Keep the flow left-to-right: uploaded BOM data → ASC mapping/match.
- Add a guided review step between parsing/matching and final import.
- Low-confidence rows should be warnings, not false blockers.
- If no part is suggested, use “Choose”, not “Refine”.
- The final goal is SKU-level selection, not only figure-level matching.
- Use progressive disclosure for advanced metadata.
- Do not make the default UI feel like a spreadsheet.
- Do not touch Content File Manager while working on BOM.