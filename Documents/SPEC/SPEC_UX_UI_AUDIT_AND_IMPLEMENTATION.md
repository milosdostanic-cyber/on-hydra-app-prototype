# Hydra SPEC UX/UI Audit and Implementation

**Date:** 2026-08-14  
**Status:** Historical audit. Its old-board Release 1, route, and implementation assumptions are superseded where they conflict with `SPEC_V2_USER_FLOW_AND_SCREEN_AUDIT.md`.  
**Platform scope:** Desktop-first with mobile adaptation (`Required — UX/UI Guardian Skill`)  
**Target file:** this document — living audit, implementation spec, execution checklist, and verification log

> **V2 authority notice (2026-08-25):** Use [`SPEC_V2_USER_FLOW_AND_SCREEN_AUDIT.md`](./SPEC_V2_USER_FLOW_AND_SCREEN_AUDIT.md) for the current confirmed user flow, Release 1 boundary, and screen/modal content. This document remains useful for historical PRD traceability and detailed extraction/evidence requirements. In particular, its old G1-first recommendation, unresolved Release 1 questions, Coming Soon route inventory, role assumptions, global/library framing, and separate low-confidence concepts are not current V2 authority.

---

## 1. Executive Summary

SPEC is an AI-assisted review and authoring workspace for construction specifications. It turns a PDF or Word document into structured, cited findings a human can verify, then optionally converts trusted requirements into ASC product, submittal, substitution, and engineering-collaboration work.

**One sentence:** Upload → understand → verify evidence → decide → act or deliver.

**Central trust mechanism (`Confirmed — PRD` FR-6 / NFR-1):** every extraction and red flag must deep-link to the exact page and paragraph. If the system cannot show evidence, the result must not look like a confirmed fact.

### Primary current-state problems

| Severity | Problem | Evidence |
|---|---|---|
| High | Three FigJam diagrams disagree on what “Release 1” contains | `Supported — FigJam` + `Confirmed — Gap Analysis` |
| High | Q-1 (release sequencing) is still unanswered, yet the granular MVP flow already defaults to G1-only | PRD Q-1; FigJam sticky blank; Gap Analysis |
| High | Meeting said a Word-like editor is required; the Kickoff wireframe is a structured correction table plus a static viewer | FigJam meeting sticky vs `spec-review-wireframe` |
| High | Meeting said Suggested Products are in the first release; Proposed Release 1 MVP omits all of G2 | FigJam stickies vs MVP flow |
| Medium | Prototype I4/I5 screens exist as files but Ask, Deliver-Back, and Guide Specs still route to Coming Soon | `Observed — Current Implementation` |
| Medium | Requirement detail in the Kickoff wireframe does not show FR-4 extraction-schema fields | Gap Analysis wireframe notes |
| Medium | External / cross-org collaborator persona is missing from FigJam | PRD §8 vs FigJam personas |

### Recommended UX direction

Treat **G1 Analyzer + evidence + HITL correction** as the first *useful* slice, but do **not** present G1-only as an approved product cut. Document it as a delivery recommendation until Client/PO answers Q-1.

For the first testable prototype experience:

1. Project → upload PDF/Word → processing as a first-class state.
2. Analyzer: sections, summaries, requirements, issues, confidence, exact citations.
3. Human confirms or corrects. Original file stays immutable.
4. Optional, visually separated G2 convert surfaces (products / submittals / substitution) only after trusted analysis.
5. G3 Ask and Deliver-Back when the user needs engineering help.

### Core flow (design hypothesis, not a confirmed release)

**Proposed Release 1 MVP (`Supported — FigJam`):**  
Project → Upload & Verification → Analysis & Editing → SPEC Library → Project Review.

**Complete PRD flow (`Supported — FigJam` End-to-End):**  
Start/Context → G1 Analyze & Verify → G1.2–G1.3 Reuse & Compare → G2 Convert (if relevant) → G3 Build Relationships (if help needed) → Understand / Verify / Compare / Act / Collaborate / Trace.

### Implementation priorities for this prototype

1. Align screens to the Kickoff Analyzer wireframe and G1 MVP flow without inventing a client-approved G1-only product.
2. Keep G1 analysis neutral; G2 is optional and separated (`Confirmed — PRD` NFR-4).
3. Wire Ask, Deliver-Back, and Get Specified as real prototype surfaces or keep them explicitly deferred — do not leave Coming Soon if the frontend PRD already specified them.
4. Cover upload, processing, citation, correction, empty, error, and permission states before visual polish.

---

## 2. Sources Reviewed

| Source | Role | Authority | Key information used | Conflicts or gaps |
|---|---|---|---|---|
| [PRD – Spec Rewrite](https://ooden.atlassian.net/wiki/spaces/Hydra/pages/2162851843/PRD+-+Spec+Rewrite) (Confluence `2162851843`, **version 2**, 2026-07-29; re-fetched 2026-08-14) | Primary product authority | 1 | Full client feature set FR-1–FR-18, NFR-1/2/3/4/6, personas, Q-1–Q-10 | Still Draft. Does not define Release 1. Matt intake explicitly disregarded. |
| Client PDF *Spec Platform – Feature Dives* (via Intake page) | Sole client feature source behind PRD v2 | 1 (through PRD) | G1/G2/G3 + Substitution + Get Specified; “MORE STUFF LATER” divider | Divider is the only sequencing signal; circular Deliver-Back ↔ Substitution dependency |
| [Gap Analysis – PRD vs. Figma SPEC Kickoff Flow](https://ooden.atlassian.net/wiki/spaces/Hydra/pages/2185560065) (Confluence `2185560065`, **version 2**, 2026-08-10) | Companion analysis of Kickoff vs PRD | 2 (Product analysis, not a replacement PRD) | Alignment table, 51 use cases, three contradictory Release 1 diagrams, meeting sticky vs wireframe gaps | Newer than PRD; does not change PRD authority |
| [SPEC — Kickoff FigJam](https://www.figma.com/board/beZueOv6ckJiCCoHW3ZHEh/SPEC---Kickoff?node-id=33-6228) (`beZueOv6ckJiCCoHW3ZHEh`, node `33:6228`) | Recommended flow + Analyzer wireframe | 3 | Goals G1–G3, complete E2E flow, Proposed Release 1 MVP, meeting Q&A, `spec-review-wireframe` | Three internal Release 1 definitions; Get Specified missing |
| Frontend Implementation PRD v1.1 (2026-08-04, local `hydra-spec-rewrite-frontend-implementation-prd (2).md`) | Prototype implementation contract | 3 (frontend only) | Routes, AC-001–AC-046, I0–I6, mock-data rules | Written as greenfield; this repo now has `src/spec` |
| SPEC Product Experience Canvas (2026-08-07) | Design synthesis | 4 | Evidence-before-assertion framing; open vs confirmed labels | Working synthesis, not approved scope |
| Hydra SPEC Recommended Core User Flow (older FigJam `6IfFArLZBU2djlsHk8FjWn`) | Superseded flow hypothesis | 4 (historical) | Upload → analyze → evidence → working copy → export | Replaced for this pass by Kickoff board |
| Kickoff / edge-case PDF (2026-08-05) | Trust principles and edge cases | 4 | Upload/processing/citation/edit/export risks | Target flow is a recommendation |
| Current repository `src/spec/**` | Evidence of existing prototype | 6 | Routes, pages, mocks, Coming Soon gaps | Implementation is not source of truth |
| Granola meetings 10–13 Aug 2026 | Decision context | Supporting | MVP flows aligned internally; design blocked on Matt stories; Brad LaFleur named SPEC PoC | No captured Q-1 client answer |
| Gemini / Drive transcripts | Intended meeting-note source | — | **Not retrieved** — Google Drive OAuth still required for `milos.dostanic@spaceinch.com` | Gap: Gemini notes not in this file |
| Universal UX/UI Guardian skill | Audit methodology | Skill | Desktop-first + mobile adaptation; semantics, a11y, states | Must not override explicit PRD requirements |
| Content File Manager docs | Excluded | — | Not used | Do not import CFM lifecycle into SPEC |

### Source hierarchy (conflicts)

1. Explicit SPEC PRD requirements and acceptance criteria  
2. Confirmed Product decisions in the PRD / captured meeting answers  
3. SPEC Kickoff FigJam  
4. Gap Analysis, decision brief, experience canvas  
5. Existing Hydra design-system and product patterns  
6. Current implementation  
7. UX/UI or technical inference  

Labels used below: `Confirmed — PRD`, `Confirmed — Acceptance Criteria`, `Confirmed — Meeting`, `Supported — FigJam`, `Supported — Gap Analysis`, `Supported — Frontend PRD`, `Observed — Current Implementation`, `Required — UX/UI Guardian Skill`, `UX Recommendation`, `Open Product Decision`, `Open Engineering Decision`, `Assumption`.

---

## 3. Current Implementation Inventory

`Observed — Current Implementation` in `on-hydra-app-prototype`. Frontend-only, deterministic mocks, no backend.

### Routes (`src/spec/SpecRoutes.tsx`)

| Route | Page | Status |
|---|---|---|
| `/spec` | `SpecHomePage` | Implemented |
| `/spec/new` | `SpecAddDocumentPage` | Implemented |
| `/spec/projects/new` | Redirect to `/dashboard` | Project create not local |
| `/spec/projects/:projectId` | `SpecProjectDetailPage` | Implemented |
| `/spec/projects/:projectId/new` | `SpecAddDocumentPage` | Implemented |
| `/spec/:specId/processing` | `SpecProcessingPage` | Implemented |
| `/spec/:specId/analyze` | `SpecAnalyzePage` | Implemented |
| `/spec/:specId/edit` | `SpecEditPage` | Implemented |
| `/spec/:specId/review` | `SpecReviewPage` | Implemented |
| `/spec/:specId/products` | `SpecProductsPage` | Implemented |
| `/spec/:specId/submittals` | `SpecSubmittalsPage` | Implemented |
| `/spec/:specId/substitution` | `SpecSubstitutionPage` | Implemented |
| `/spec/:specId/ask` | `SpecComingSoonPage` (I4) | Page file `SpecAskPage.tsx` exists; **route not wired** |
| `/spec/:specId/deliver-back` | `SpecComingSoonPage` (I4) | Page file `SpecDeliverBackPage.tsx` exists; **route not wired** |
| `/spec/guide-specs` | `SpecComingSoonPage` (I5) | Page file `SpecGuideSpecsPage.tsx` exists; **route not wired** |

Helpers: `src/spec/specNavigation.ts`, workspace tabs in `src/spec/specWorkspaceTabs.ts`.

### Layout and workspace

- `SpecLayout.tsx`, `SpecWorkspaceLayout.tsx`, `SpecWorkspaceRegions.tsx`
- `SpecWorkspaceHeader.tsx`, `SpecWorkspaceContext.tsx`, `SpecDemoContext.tsx`

### Key components

`SpecDocumentViewer`, `SpecSectionNavigator`, `SpecRequirementCard`, `SpecRedFlagCard`, `SpecCitationLink`, `SpecConfidenceTag`, `SpecSeverityBadge`, `SpecCorrectionDrawer`, `SpecChangeReviewPanel`, `SpecCompareRegions`, `SpecProductSuggestionCard`, `SpecEquivalenceMatrix`, `SpecProcessingStages`, `SpecPermissionBoundary`, `SpecCommentThreads`, `SpecActivityTimeline`, `SpecProposalCard`, `SpecEngineerThread`, `SpecDemoControls`.

### Data / state

- Mock store: `specMockStore.ts`
- Repositories: `data/repositories/specRepositories.ts`
- Seeds: documents, analysis, review, editor, products, artifacts, collaboration, guide specs, scenarios
- Types: `data/types.ts`
- Constants: `specUploadLimits.ts`, `specStatusVocabulary.ts`
- Hooks: `useSpecDocument`, `useSpecCorrection`, `useSpecProcessingSimulation`, `useSpecDeepLink`
- Analytics contract: `specAnalytics.ts`

### Tests

No dedicated SPEC test suite found in this pass. `Open Engineering Decision`: add interaction tests for upload validation, citation open, correction persist, and keyboard path (Frontend PRD AC-039).

---

## 4. Confirmed Requirements and Open Decisions

### Confirmed — PRD (full client feature set)

G1.1 Analyzer, G1.2 Library, G1.3 Project Review, G2.1 Suggested Products, G2.2 Submittals, G3.1 Ask, G3.2 Deliver-Back, Substitution Request Generator, Get Specified.

Must hold in any honest UX:

- Neutral G1 analysis (`NFR-4`)
- Citation trust (`FR-6`, `NFR-1`)
- HITL corrections persist (`FR-7`)
- Immutable original (`Supported — Frontend PRD` AC-016; Kickoff “working copy” language)
- Org/company isolation (`FR-18`)
- Honest fit / never hide a non-meet (`FR-15`, substitution guardrail)

### Confirmed — Meeting (FigJam green stickies)

| Topic | Answer | Still conflicting with |
|---|---|---|
| Word-like editor | Yes — users need a Word-like editor, similar to current SPEC | Kickoff wireframe is a correction table |
| AI role | Analyze **and** help edit/rewrite | PRD G1 text only requires extraction correction |
| Suggested Products in first release | Yes | Proposed Release 1 MVP is G1-only |
| Legacy UX | Can fully rethink; do not copy old SPEC | — |

### Still open (`Open Product Decision`)

| ID | Question | Current silent default |
|---|---|---|
| Q-1 | Release sequencing across G1/G2/G3/Substitution/Get Specified | MVP diagram = G1 only; SPEC GOALS = G1+G2; E2E = all |
| — | Primary persona for first release | Not chosen |
| — | Entry: Project first vs SPEC first | Flow uses Project → Upload |
| — | First Analyzer emphasis: Summary vs Requirements vs Issues | Wireframe emphasizes Requirements |
| Q-2 | Numeric “in minutes” SLA | Unspecified |
| Q-3 | Submittal templates / Spec vs Submittal Manager | Ownership TBD in FigJam |
| Q-4 | Savings model | Prototype must not invent calculated savings |
| Q-5 | Guide-spec content owner | — |
| Q-6 | Real-time vs async Deliver-Back | Frontend PRD assumes async mock |
| Q-7 | Spec vs Submittal Manager package ownership | — |
| Q-8 | Production document viewer | Prototype viewer is replaceable |
| Q-9 | External-user invitation / tenancy | Persona missing in FigJam |
| Q-10 | How office master is created/maintained | — |

### FigJam-supported complete outcome

Understand → Verify → Compare → Act → Collaborate → Trace.

### Skill requirements (do not override PRD)

One primary purpose per screen, visible system status, empty/error/recovery, keyboard, labels, live regions, color not the only status channel, desktop-first with mobile adaptation.

---

## 5. End-to-End Flow Audit

Kickoff **Proposed Release 1 MVP** vs current prototype.

| Step | User goal | Current behavior | Expected behavior | Issue | Severity | Source | Recommendation | Affected files |
|---|---|---|---|---|---|---|---|---|
| 1. Project list / create | Start from a project | Home lists projects/docs; `/spec/projects/new` redirects to dashboard | Existing project or create, then open | Create-project is not Spec-local | Medium | FigJam MVP 1; Frontend PRD AC-041 | Keep project-first; reuse Hydra project create or a Spec mock adapter | `SpecHomePage.tsx`, `SpecRoutes.tsx` |
| 2. SPEC already in project? | Resume or upload | Project detail lists specs | Open analyzed SPEC if present; else empty list → upload | Align empty copy to Kickoff | Low | FigJam MVP 2 | Match empty SPEC list + Upload SPEC file | `SpecProjectDetailPage.tsx` |
| 3. Upload PDF or Word | Add a readable spec | Add-document validates type/size | Pre-flight, then start analysis | Password/corrupt/duplicate not first-class | High | FR-1; FigJam “File readable?” | Explicit upload-error and unreadable-file recovery | `SpecAddDocumentPage.tsx`, `specUploadLimits.ts` |
| 4. Processing | Continue work while AI reads | Processing page + simulated stages | Queued / processing / partial / failed / retry / leave and return | Spinner-only must not be the whole story | High | NFR-3; FigJam G1.1 | Keep stages, last-updated, Open partial analysis | `SpecProcessingPage.tsx`, `SpecProcessingStages.tsx` |
| 5. AI sections / summaries / requirements / issues | Understand the spec | Analyzer workspace | MasterFormat + 3-part; summary; structured requirements; ranked issues; confidence | FR-4 schema fields may be flattened | High | FR-2–FR-5; Gap Analysis | Surface extraction-schema fields in detail, not only a discipline category | `SpecAnalyzePage.tsx`, `SpecRequirementCard.tsx` |
| 6. Choose section + open citation | Verify evidence | Section nav + citation + viewer | Exact page + paragraph highlight; approximate OCR labeled | Must remain the primary trust action | High | FR-6; wireframe | Keep citation as the default verify path | `SpecCitationLink.tsx`, `SpecDocumentViewer.tsx` |
| 7. Needs review? | Know what to check | Needs Review tab | Queue of low-confidence / conflicted items | Confirm queue is the default work list | Medium | FigJam MVP 3 | Make Needs Review the recovery path, not a buried tab | `SpecAnalyzePage.tsx` |
| 8. Confirm or correct | HITL | Correction drawer | Persist correction; analysis updates | Editor vs correction-table conflict | High | FR-7; Meeting vs wireframe | Ship correction now; Word-like editor as working copy, not silent overwrite | `SpecCorrectionDrawer.tsx`, `SpecEditPage.tsx` |
| 9. Save to library | Reuse | Home/library search | Index under project; versions/addenda | Saved searches/alerts completeness TBD | Medium | FR-8/FR-9 | Keep library on Home; do not invent org-wide search backend | `SpecHomePage.tsx` |
| 10. Project Review | What changed vs baseline | Review page | Baseline picker; added/removed/modified/outliers; optional redline export | Missing baseline fallback must be explicit | Medium | FR-10; FigJam MVP 5 | “Choose a different baseline” when none available | `SpecReviewPage.tsx` |
| 11. Suggested Products | Optional convert | Products page | Separated from analysis; Direct Equal / Requires Approval / Not a Fit | In complete PRD and meeting; **out of MVP diagram** | High | FR-11; Meeting YES | Keep as optional workspace tab; never mix into Analyzer | `SpecProductsPage.tsx` |
| 12. Submittals / Substitution | Act | Pages exist | Honest matrix; no hidden non-meets | Substitution is post-divider in client PDF | Medium | FR-12/FR-15; Gap Analysis | Keep prototype paths; label Substitution as later unless Q-1 pulls it forward | `SpecSubmittalsPage.tsx`, `SpecSubstitutionPage.tsx` |
| 13. Ask / Deliver-Back | Collaborate | Coming Soon routes | Context-attached Ask; Requested → In progress → Delivered → Accepted | Files exist, routes stubbed | High | FR-13/FR-14 | Wire existing pages or delete stubs — do not ship fake completion | `SpecRoutes.tsx`, `SpecAskPage.tsx`, `SpecDeliverBackPage.tsx` |
| 14. Get Specified | Insert guide language | Coming Soon | Ready-to-paste 3-part language | Missing from Kickoff flows | Medium | FR-16 | Keep I5 deferred until Q-1; do not imply it is in MVP | `SpecGuideSpecsPage.tsx` |

---

## 6. Screen-by-Screen UX/UI Audit

### 6.1 Spec Home / Library

- **Purpose:** Find a project or spec, or start upload.  
- **Primary action:** Open project / Add specification.  
- **Kickoff:** SPEC Library browse + search (keyword/meaning/filters) + no-match adjust.  
- **Required states:** empty org, empty filters, processing rows, failed rows.  
- **Heading:** one page `h1` (Home), `h2` for library vs projects.

### 6.2 Project detail

- **Purpose:** See this project’s specifications.  
- **Primary action:** Upload SPEC file, or open analyzed SPEC.  
- **Decision:** SPEC already in project? (`Supported — FigJam`)

### 6.3 Add / upload

- **Purpose:** Choose PDF or Word, bind to project.  
- **Primary action:** Upload.  
- **Recovery:** Show upload error → choose another file; explain unreadable file → choose another file.  
- **Do not** invent CFM replace/publish/rollback.

### 6.4 Processing

- **Purpose:** Understand progress without blocking the rest of Hydra.  
- **Primary action:** Stay, leave and return, open partial analysis, or retry.  
- **Copy:** named stages, not only “Processing”.

### 6.5 Analyzer (Kickoff `spec-review-wireframe`)

Wireframe structure (`Supported — FigJam`):

| Region | Content |
|---|---|
| Shell | Hydra sidebar; Spec selected |
| Header | Title “SPEC” / “Analyze Specifications with Confidence”; project chip |
| Title bar | Document name; search in analysis; Upload New; Reanalyze |
| Left | Document overview (pages, sections, requirements, potential issues, needs review) + section list (MasterFormat) |
| Center | Summary heading; tabs Requirements / Potential Issues / Needs Review with counts; table Requirement · Source · Confidence |
| Right | Finding detail + source viewer with highlighted paragraph; Looks Correct / Correct Result |

**UX Recommendation:** Requirements as the main work area; Issues and Needs Review always visible; Summary secondary. This matches the author’s Kickoff suggestion, **not** a confirmed Product decision.

**Accessibility:** table headers, row open via keyboard, citation is a real control, confidence not color-only.

**Gap:** FR-4 fields (manufacturers, BOD, material/standard, joining, listings, testing, submittals, substitution policy) must appear in detail, not a generic “Category = Electrical”.

### 6.6 Editor

- **Purpose:** Change a working copy; never the original.  
- **Primary action:** Edit / request AI proposal / review tracked change.  
- **Conflict:** Meeting requires Word-like editor; PRD G1 only requires extraction correction.  
- **UX Recommendation:** Correction of findings on Analyzer; full editor on a separate Edit tab as working copy with Accept/Reject.

### 6.7 Project Review

- **Purpose:** Compare to office master, prior project, or corpus norm.  
- **Primary action:** Review a change; optional export redline.  
- **States:** baseline missing, low alignment, renumbered sections.

### 6.8 Products / Submittals / Substitution

- Optional, after trusted G1.  
- Fit taxonomy: Direct Equal / Requires Approval / Not a Fit.  
- Guardrail: Unknown stays Unknown; never hide a non-meet.

### 6.9 Ask / Deliver-Back / Guide Specs

- Ask: auto-attached context, no paste.  
- Deliver-Back: Requested → In Progress → Delivered → Accepted.  
- Guide Specs: missing from Kickoff; PRD forbids treating “MORE STUFF LATER” as an approved cut without client confirmation.

---

## 7. SPEC Workspace Information Architecture

Persistent workspace chrome (`Supported — Frontend PRD` + Kickoff wireframe):

| Region | Always shows |
|---|---|
| Shell nav | Spec module inside Hydra |
| Document identity | Project + spec title + version |
| Processing / readiness | Processing, partial, ready, failed |
| Section navigation | MasterFormat list + search |
| Analyzer overview | Counts: pages, sections, requirements, issues, needs review |
| Findings | Requirements / Potential Issues / Needs Review |
| Evidence | Source page + paragraph |
| Review actions | Confirm, correct, comment |
| Working copy | Edit tab; original locked |
| Convert (optional) | Products, Submittals, Substitution |
| Collaborate (optional) | Ask, Deliver-Back |
| Output | Save version, export, redline — with unresolved-work warning |

G2 must not appear as Analyzer findings.

---

## 8. Semantic HTML and Accessibility Audit

`Required — UX/UI Guardian Skill` + Frontend PRD AC-039 / AC-040.

| Area | Current risk | Required |
|---|---|---|
| Headings | Shared headers may render visual titles as `h3` | One relevant `h1` per page; no skipped levels |
| Landmarks | Custom splits | `banner` / `navigation` / `main` / `complementary` for viewer |
| Labels | Search placeholders | Visible label or `aria-label` on every input |
| Tables | Requirements list | Column headers; row open with Enter/Space |
| Citations | Must be buttons or links | Announce target page |
| Live regions | Processing / result counts | `aria-live` for stage and queue changes |
| Focus | Viewer highlight | Move focus to finding/citation target without trap |
| Color | Confidence High/Medium/Low | Text + tag, not color alone |
| Keyboard | Full analyze path | Open spec → section → finding → citation → correct → return |
| Reduced motion | Viewer animation | Honor `prefers-reduced-motion` |

---

## 9. Design-System and Component Audit

Reuse Hydra Ant Design via `src/ui/antd.ts` and tokens. Do not create new core components. Do not copy legacy Connected Spec.

| Item | Action | Notes |
|---|---|---|
| App shell / sidebar | Reuse | Spec is a module, not a new chrome |
| `Typography`, `Button`, `Tabs`, `Table`, `Tag`, `Alert`, `Empty`, `Drawer`, `Modal` | Reuse | Kickoff tabs + table map to antd |
| `SpecConfidenceTag`, `SpecSeverityBadge` | Keep / update | Color-independent labels |
| `SpecCitationLink` + `SpecDocumentViewer` | Keep as local composition | Viewer tech is Q-8; keep interface replaceable |
| `SpecCorrectionDrawer` | Keep | Primary HITL for G1 |
| `SpecChangeReviewPanel` | Keep | Editor / AI proposals |
| `SpecProductSuggestionCard` | Keep | G2 only |
| `SpecComingSoonPage` for Ask / Deliver-Back / Guide Specs | Retire or justify | Page implementations already exist |
| New shared DS components | Do not add | Local composition only |
| Tokens | Unchanged | No raw hex/px in screens |

---

## 10. Required States and Edge Cases

Implement highest-priority states. Document the rest as deferred.

### Upload

| Trigger | User-facing behavior | Actions | Status |
|---|---|---|---|
| Unsupported type/size | Field error; form values kept | Choose another file | Prototype partial |
| Corrupt / password / unreadable | Explain file problem | Choose another file | Needed (FigJam) |
| Duplicate | Warn; do not silently replace | Open existing or upload as new version | Needed |
| Revision / addendum | Keep previous version and reanalyze | Confirm version vs new doc | FigJam Library |
| Scanned / poor OCR | Process with low confidence; approximate citations labeled | Continue + HITL | FR-1 |

### Processing

Queued, processing, long-running, background, leave/return, partial success, complete failure, retry, replace source, last-updated. A spinner plus the word “Processing” is insufficient.

### Analyzer and evidence

No sections; low confidence; missing/wrong/multiple citations; contradictory clauses; PDF index ≠ printed page; human correction persisted.

### Editing

Manual edit on working copy; AI proposal with before/after, rationale, source, Accept/Reject/Edit; conflict; unsaved protection; new source version.

### Convert / export

No ASC fit; Not a Fit; no-substitution language; missing package docs; export fidelity warning; version-save failure.

### Permissions

No access, read-only, role-restricted, cross-org preview of “what will be shared”, inaccessible citation, audit history. External-user flow is still `Open Product Decision` (Q-9).

---

## 11. Implementation Plan

Frontend-only, mocks only. Do not implement open Product decisions as facts.

### Phase A — Source alignment (docs, no product invention)

- **Objective:** This Markdown stays the working spec.  
- **Done when:** PRD v2, Kickoff FigJam, Gap Analysis, and repo inventory are recorded with labels.  
- **Status:** This document.

### Phase B — G1 Analyzer parity with Kickoff wireframe

- **User value:** Trustworthy review of one spec.  
- **Files:** `SpecAnalyzePage.tsx`, overview/section/requirement/citation/viewer/correction components.  
- **Tasks:** Match regions; FR-4 fields in detail; Needs Review queue; color-independent confidence; keyboard path.  
- **Risk:** Over-building Word editor before Q-1/editor decision is reconciled.  
- **Done when:** AC-009–AC-015 and AC-039–AC-040 can be demonstrated on mock fixtures.

### Phase C — Upload, processing, library, project review

- **Files:** Home, project detail, add document, processing, review.  
- **Tasks:** Readable/unreadable file paths; non-blocking processing; baseline missing state.  
- **Done when:** AC-001–AC-008, AC-021, AC-041–AC-045.

### Phase D — Optional convert (G2) without biasing G1

- **Files:** Products, submittals, substitution.  
- **Tasks:** Separation notice; honest fit; no-fit → Ask.  
- **Constraint:** Meeting says G2.1 is in first release; MVP diagram disagrees. Keep screens; do not mix into Analyzer.  
- **Done when:** AC-023–AC-029.

### Phase E — Collaborate and Get Specified

- **Files:** `SpecRoutes.tsx` plus existing Ask / Deliver-Back / Guide Specs pages.  
- **Tasks:** Stop Coming Soon if pages are ready; otherwise mark deferred in §14.  
- **Risk:** Circular Deliver-Back ↔ Substitution dependency (`Supported — Gap Analysis`).  
- **Done when:** Either wired mocks (AC-030–AC-036) or explicit deferred list.

### Phase F — Hardening

- Semantics, live regions, reduced motion, analytics events, scenario reset (AC-037–AC-038).

---

## 12. Acceptance Criteria

Use Frontend PRD AC-001–AC-046 as the prototype test list. Map to product FRs:

| Product | Prototype AC (examples) |
|---|---|
| FR-1/2/3 Analyzer ingest + summary | AC-003, AC-006, AC-009 |
| FR-5/6 Red flags + citations | AC-011, AC-012, AC-013 |
| FR-7 HITL | AC-014 |
| FR-8/9 Library | AC-001, AC-002 |
| FR-10 Project Review | AC-021, AC-022 |
| FR-11 Neutrality | AC-015, AC-023, AC-024 |
| FR-13 Ask context | AC-030 |
| FR-14 Deliver-Back | AC-032–AC-034 |
| FR-15 Honest substitution | AC-028 |
| FR-16 Get Specified | AC-035, AC-036 |
| NFR-4 / keyboard / color | AC-015, AC-039, AC-040 |

Do not mark an AC complete unless implemented and verified in this repo.

---

## 13. Implementation Log

| Date | File | Change | Reason | Source | Tests | Result |
|---|---|---|---|---|---|---|
| 2026-08-14 | `Documents/SPEC/SPEC_UX_UI_AUDIT_AND_IMPLEMENTATION.md` | Created source-backed audit | Rebuild empty SPEC audit from latest PRD + Kickoff FigJam | PRD v2 live; FigJam `33:6228`; Gap Analysis v2 | Source fetch only | Written; no code |

---

## 14. Deviations and Deferred Work

| Item | Why deferred | Blocking decision | Experience impact | Next step |
|---|---|---|---|---|
| Gemini / Drive transcripts | Drive OAuth not completed | User Google login | Possible missing meeting nuance | Retry Drive after auth |
| Client-confirmed Release 1 | Q-1 unanswered | Client + PO | Risk of building G1-only as if approved | Get Q-1 in writing |
| Word-like editor vs correction table | Meeting vs wireframe vs PRD G1 | Product | Users may expect full doc editing | Reconcile before Edit-tab expansion |
| Get Specified in Kickoff | Not on board | Q-1 + FR-16 | Specifiers have no Kickoff screen | Keep I5 explicit |
| External-user Deliver-Back | Persona missing | Q-9 | Cross-org risk under-designed | Add persona + permission preview |
| Production viewer (Apryse etc.) | Q-8 | Eng | Prototype viewer is a stand-in | Keep abstraction |
| Real backend / OCR / LLM | Frontend PRD out of scope | — | All intelligence is mocked | Do not fake live APIs |
| Content File Manager behavior | Explicitly excluded | — | — | Do not import |
| Additional user text | Not provided in this request | User | — | Append when sent |

---

## 15. Final Verification

Check when implementation proceeds. Nothing below is complete for a code pass.

### UX

- [ ] User always knows where they are, what to review, next action, and what happens after  
- [ ] One primary CTA per context  
- [ ] G1 is useful without ASC products  

### UI

- [ ] Kickoff Analyzer regions recognizable  
- [ ] Tokens only; no new core components  
- [ ] Convert surfaces visually separated  

### Accessibility / semantics

- [ ] Heading hierarchy  
- [ ] Keyboard path AC-039  
- [ ] Color independence AC-040  
- [ ] Labels, focus, live regions  

### Design system

- [ ] antd + Hydra tokens  
- [ ] Shared/core unchanged  

### Responsiveness / loading / errors / recovery

- [ ] Desktop-first; usable narrower desktop widths  
- [ ] Processing, partial, failed, retry  
- [ ] Unreadable file and missing baseline  

### Tests / source compliance

- [ ] `npx tsc --noEmit`  
- [ ] Lint on edited files  
- [ ] No PRD requirement presented as implemented unless it is  
- [ ] Open questions still labeled open  
- [ ] Live Confluence PRD still v2 unless a newer version is fetched  

---

## Appendix A — Kickoff FigJam map

File: [SPEC — Kickoff](https://www.figma.com/board/beZueOv6ckJiCCoHW3ZHEh/SPEC---Kickoff?node-id=33-6228)  
Node: `All together` (`33:6228`)

| Section | Node | Contents |
|---|---|---|
| SPEC GOALS | `33:6904` | G1 Upload & Understand; G1.2 Library; G1.3 Project Review; G2 Product Matching; G3 Ask & Deliver-Back. Visual Release 1 box around G1+G2 |
| End to End – Complete Flow | `33:6750` | Full PRD: Context → G1.1 → G1.2/G1.3 → G2 if relevant → G3 if help needed |
| Proposed Release 1 MVP | `123:1667` | 1 Project, 2 Upload & Verification, 3 Analysis & Editing, 4 SPEC Library, 5 Project Review |
| Meeting questions | `33:6733` | 8 questions + 8 meeting answers |
| User Personas | `35:2282` | Screenshot cards (external user not represented) |
| Analyzer wireframe | `33:6377` `spec-review-wireframe` | 1440×960 review UI |

### Proposed Release 1 MVP steps (literal)

1. **Project:** Project list → Existing project? → Create or Open project  
2. **Upload & Verification:** SPEC already in project? → Open analyzed SPEC **or** Empty list → Upload → PDF or Word → Upload successful? → File readable? → Start analysis  
3. **Analysis & Editing:** AI reads → sections → summaries → requirements → issues → Word-like editor → choose section → show summary/requirements/issues/confidence → open citation → highlight page/paragraph → needs review? → confirm or correct → save analyzed SPEC to library  
4. **SPEC Library:** Browse or search → choose SPEC → new revision/addendum? → keep previous version and reanalyze → Start Project Review  
5. **Project Review:** Choose baseline → AI aligns/compares/flags → review change → export redline? → Finish review  

### Meeting sticky answers (literal)

| Question | Meeting answer |
|---|---|
| Who is first-release user? | Not decided |
| Project first or SPEC first? | Not decided |
| What is in first release? | Not decided |
| Word-like editor? | **Yes** |
| What to show first after analysis? | Not decided |
| AI analyze only or also rewrite? | **Analyze and help edit/rewrite** |
| ASC product suggestions in R1? | **Yes** |
| May we rethink old SPEC UX? | **Yes, completely** |

---

## Appendix B — PRD version check (2026-08-14)

| Document | ID | Version | Last updated | Still latest? |
|---|---|---|---|---|
| PRD – Spec Rewrite | `2162851843` | **2** | 2026-07-29 20:46 UTC | **Yes** — live Confluence fetch. Changelog: Matt intake removed; FR-1–FR-16 retained; FR-17/18 revised; FR-19/NFR-5/NFR-7 removed |
| Gap Analysis vs Kickoff | `2185560065` | **2** | 2026-08-10 21:46 UTC | Companion page; **not** a PRD replacement |
| Frontend Implementation PRD | local file `(2).md` | **1.1** | 2026-08-04 | Latest local frontend PRD (v1.0 copies are older/smaller) |

Intake still disregarded: [Intake – Spec Application Rewrite](https://ooden.atlassian.net/wiki/spaces/Hydra/pages/2080604168).

---

## Appendix C — Gap Analysis snapshot

From [Gap Analysis](https://ooden.atlassian.net/wiki/spaces/Hydra/pages/2185560065) (`Supported — Gap Analysis`):

- 3 features aligned: G1.1, G1.2, G1.3  
- 5 partial: G2.1, G2.2, Substitution, G3.1, G3.2  
- 1 missing: Get Specified  
- 3 contradictory “Release 1” statements in one FigJam file  
- 39 v1 use cases (pre “MORE STUFF LATER”) + 12 later = 51  
- Deliver-Back and Substitution Generator depend on each other across the divider  

---

## Appendix D — Prototype vs Kickoff (short)

The repo already contains a broad SPEC prototype (Home through Substitution). Kickoff now treats **Analyzer evidence + HITL** as the screen to design against, and **G1 MVP** as the flow to validate first. Ask, Deliver-Back, and Guide Specs are specified in the frontend PRD and exist as page files, but are currently Coming Soon at the router. Do not treat Coming Soon as Product deferral unless Q-1 says so.
