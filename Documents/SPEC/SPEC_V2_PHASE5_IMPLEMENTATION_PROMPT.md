# SPEC V2 — Implementation continuation (Phase 5: Re-analysis)

Copy everything below the line into a new agent session.

---

SPEC V2 — Implementation continuation (Phase 5: Re-analysis)

Source of truth (read fully before doing anything else):
1. Documents/SPEC/SPEC_V2_PHASE4_HANDOFF.md — Phase 4 completion summary, Screen 04 / M03 wireframe-parity notes, recommendation review records layered over `listRecommendations()`, stable IDs `rec:{documentId}:{citationId}`, Dashboard query params (`recommendation`, `section`, `citation`, `version`), stale-analysis invariant (`reanalysisRequired` set by manual text/formatting edits, not by Accept), editor lock, three Release 1 tabs (Dashboard / Review & Edit / disabled Export), baseline comparison at `/spec/:specId/baseline-comparison`, Screen 04 breadcrumb `Projects / [Project] / SPEC / [document] / Review`, and Phase 5 starting point.
2. Documents/SPEC/SPEC_V2_PHASE3_HANDOFF.md — Screen 03 Dashboard, recommendation contract/selector, Dashboard→editor deep links. Do not change recommendation identity.
3. Documents/SPEC/SPEC_V2_PHASE2_HANDOFF.md — Screen 02 processing still lands on SpecAnalyzePage via specAnalyzePath; processing stages are a relabel of the first four legacy IDs.
4. Documents/SPEC/SPEC_V2_PHASE1_HANDOFF.md — Screen 01 wireframe-parity correction (section 1.1) and the standing wireframe-first process for every later phase.
5. Documents/SPEC/SPEC_V2_USER_FLOW_AND_SCREEN_AUDIT.md — confirmed Release 1 UX audit (section 2.4 Wireframe inventory, section 5.5 Screen 05 — Re-analysis, section 7.4 M04 — Confirm re-analysis, plus preservation / leave-return / completion-summary rules in that section).
6. Documents/plans/2026-08-25-spec-v2-userflow-implementation-plan.md — phased implementation plan (section 5.5 Stale-analysis invariant, section 12, Phase 5).
7. Documents/SPEC/SPEC_V2_PHASE0_DECISION_RECORD.md — confirmed Phase 0 decisions. Re-analysis is a workflow state, not a permanent tab. Do not expand into Phase 6 Export, M05/M06, or hiding Ask/Deliver-Back/Products unless the Screen 05 wireframe cannot be implemented without it; if so, stop and ask.

Attach and follow:
- @hydra-ux-audit for every UI change in this task
- AGENTS.md general rules and scope-guardrails.mdc / token-discipline.mdc

Mandatory new first step (wireframe-first, per Phase 1 correction):
- Before writing any code, pull the actual Figma Wireframes for this phase via the official Figma MCP: get_figjam with fileKey OvxMEc7zwbtW7q2Vx0EVeW.
  - Screen 05 — Re-analysis: nodeId 2200:905 (audit §2.4)
  - M04 — Confirm re-analysis: nodeId 2214:105 (this phase; do not skip)
- Decompose the actual returned layout (regions, copy, control types — e.g. is Re-run analysis a primary Button; is progress a Progress + stages list; is Back to editor a bordered Button or a link; is completion a summary of new/changed/resolved/preserved; where does Return to editor sit) before mapping onto existing src/ui/antd.ts components and Hydra/SPEC patterns (SpecProcessingPage, SpecProcessingStages, SpecEditPage stale banner, BomMatchingReviewQualityAlert). Do not implement from the audit’s prose description alone.
- If get_figjam fails or the node isn’t a FigJam type, fall back to get_design_context/get_screenshot and note the fallback in your summary.

Task:
1. Confirm the wireframe pull above and summarize what it shows (regions, exact copy, control types) before touching code.
2. Implement Phase 5 (plan section 12) — Re-analysis and decision preservation — using only the file allowlist listed in plan section 12:
   - src/spec/SpecRoutes.tsx
   - src/spec/specNavigation.ts
   - src/spec/constants/specWorkflowStatus.ts
   - New src/spec/pages/SpecReanalysisPage.tsx
   - New local M04/progress/completion components under src/spec/components/ (allowed)
   - src/spec/components/SpecProcessingStages.tsx only if safely parameterized without changing existing first-analysis behavior
   - src/spec/pages/SpecEditPage.tsx only for the M04 trigger and return state
   - src/spec/data/types.ts
   - src/spec/data/specMockStore.ts
   - src/spec/data/repositories/specRepositories.ts
   - src/spec/hooks/useSpecProcessingSimulation.ts only if safely extended
   - src/spec/context/SpecWorkspaceContext.tsx
   - Focused tests under src/spec/
3. Specifically address the concrete starting points already identified in the Phase 4 handoff and current SpecEditPage:
   - Manual document text or formatting mutations already set `reanalysisRequired`. Wire the existing disabled “Re-run analysis” control on the stale banner to open M04; do not invent a second stale flag.
   - M04 must name the exact Master SPEC version, explain that accepted and denied decisions remain when related customer text is unchanged, and state that export stays unavailable until completion. Footer: Cancel + primary Re-run analysis.
   - Add an explicit re-analysis screen/route distinct from first-upload processing. Canonical stages from the audit: Manual edits captured → Refresh findings and recommendations → Keep valid previous decisions → Prepare updated review. Leave/return must be safe while work continues.
   - Compare previous recommendation source ranges with the edited document. Preserve valid accepted/denied decisions only when related source is unchanged. Mark recommendations as new, changed, resolved, or preserved. Do not silently attach a previous decision to changed text.
   - Completion summary must show new / resolved / changed / decisions-kept counts, plus a short result summary and primary Return to editor.
   - Return to Review and Edit at the next relevant recommendation (prefer next not-reviewed, then first changed/new). Keep stable IDs `rec:{documentId}:{citationId}` so Dashboard deep links still work.
   - Analysis becomes current (`reanalysisRequired = false`) only after success. Failure restores a safe retry state without losing working-copy edits or old decisions. Do not mutate historical customer versions.
   - Export remains Phase 6: keep it disabled with truthful copy; do not send to Deliver-Back.
4. Do not touch BOM, shared tables, src/ui/**, or theme files. Do not implement Screen 06 Export, M05, or M06. Do not start hiding Ask/Deliver-Back/Products from navigation. Do not silently “fix” the Screen 02 five-level Processing breadcrumb unless this phase’s wireframe also requires it — then stop and ask. Screen 03 breadcrumb (`Projects / [Project] / SPEC / [document]`) and Screen 04 breadcrumb (`… / Review`) were already authorized; if Screen 05 requires a new shell breadcrumb branch, stop and ask rather than silently editing `buildAppBreadcrumbItems.tsx`.
5. Do not edit the plan, audit, or prior handoff documents themselves except to append your own Phase 5 completion/handoff notes following the same pattern as SPEC_V2_PHASE4_HANDOFF.md.
6. Run npx tsc --noEmit, npm run build, and ReadLints on changed files before calling the phase done. Test M04 copy and confirm; leave/return during re-analysis; success completion counts; return lands on the updated editor; preservation for unchanged / changed / deleted / new source; failure + retry without losing edits or decisions; stale banner gone only after success; Export still blocked until analysis is current — via the Spec demo scenario switcher (use a document with `reanalysisRequired` after a manual edit, e.g. Proprietary Division 23 after editing a block).
7. Report against Phase 5’s acceptance criteria (plan section 12) and stop — do not start Phase 6 without my approval.

Phase 5 acceptance criteria (plan §12):
- [ ] M04 explains exact Master version, preservation, and export blocking.
- [ ] Re-analysis progress is distinct from first analysis.
- [ ] User can leave and return.
- [ ] Working edits survive success and failure.
- [ ] Only unchanged-source decisions are preserved.
- [ ] Completion shows new, changed, resolved, and preserved counts.
- [ ] Return opens the updated editor.
- [ ] Analysis becomes current only after success.

Carry-forward from Phase 4 (do not silently “fix” outside the allowlist):
- Export remains disabled with truthful copy until Phase 6; do not route to Deliver-Back.
- Recommendation IDs must stay stable so Phase 3 Dashboard and Phase 4 editor deep links keep working.
- Accept does not mark analysis stale; only manual text/formatting edits do.
- Editor lock, Deny modal, and Screen 04 three-pane layout are Phase 4 work — do not reopen them unless the re-analysis return path cannot restore the editor without a small, documented SpecEditPage change.
- Screen 02 breadcrumb still does not match `Projects / Project / SPEC / [name] / Processing` unless you stop and ask.
- Stage IDs for first analysis remain a relabel of the first four legacy IDs; parameterize SpecProcessingStages only if you can do so without changing Screen 02 behavior.

If you find a conflict between the wireframe, the audit/plan, and current code that isn’t already covered in the Phase 4 handoff, stop and ask rather than guessing.
