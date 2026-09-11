# SPEC V2 User Flow and Screen Audit

**Date:** 2026-08-25
**Status:** Source-backed UX audit and screen-content specification. No application code changed in this pass.
**Figma source:** [SPEC — Kickoff V2](https://www.figma.com/board/OvxMEc7zwbtW7q2Vx0EVeW/SPEC---Kickoff-V2?node-id=2035-1468)
**Implementation plan:** `Documents/plans/2026-08-25-spec-v2-userflow-implementation-plan.md`

## 1. Executive summary

SPEC V2 is a project-owned rewrite workflow, not an organization-wide document library in Release 1.

The confirmed Release 1 journey is:

> Selected Project → Project SPEC list → upload and confirm Master SPEC → process → review recommendations → edit and decide → re-analyze after manual edits → export → optionally create or update a BOM or Submittal Package.

The current prototype is broad and technically substantial, but its information architecture reflects an earlier product model. It currently exposes an organization-wide `/spec` library, eight document-workspace tabs, extraction-oriented analysis, baseline comparison, collaboration, substitution, and guide-spec flows. Several of those surfaces are outside the confirmed V2 Release 1 journey, while some core V2 behavior is missing or fragmented:

- no complete ASC Master confirmation journey;
- two inconsistent upload entry points;
- no canonical recommendation-centered Analysis Dashboard;
- Review means baseline comparison rather than recommendation review;
- no explicit re-analysis route and completion loop;
- no canonical Export and Outputs screen;
- Ready to Export currently routes to Deliver-Back;
- no complete version-history and new-version journey;
- role restrictions and a separate low-confidence queue conflict with confirmed Release 1 answers.

The recommendation is to reshape and reuse the existing SPEC module rather than rebuild it. Existing data repositories, processing simulation, editor foundations, tables, document viewer, citations, and local components remain useful. Shared Hydra components and tokens must remain unchanged.

## 2. Sources and authority

### 2.1 Authority order for this audit

1. **SPEC PRD v2** — feature-set authority (`Confluence 2162851843`, as documented in the prior audit).
2. **Confirmed V2 meeting answers** — current Release 1 and UX decisions, FigJam nodes `2035:3423`–`2035:3430`.
3. **Published V2 User Flow** — current journey and decision logic, page `2035:1468`.
4. **Published V2 Wireframes** — directional screen/modal organization, page `2144:3602`.
5. **Existing Hydra UX patterns** — behavioral and visual implementation baseline.
6. **Current `src/spec/**` implementation** — evidence of what exists, not product authority.
7. **V2 Draft page and older Kickoff boards** — historical context only where not superseded.

The PRD remains the broader product authority. The V2 confirmed answers define what belongs in Release 1 and resolve earlier open questions.

### 2.2 Every FigJam page reviewed

| Page | Node | Audit use |
|---|---:|---|
| COVER | `31:2284` | Cover only; no requirements |
| Separator | `33:6225` | Empty |
| Spec Rewrite Engine — User Flow | `2035:1468` | Canonical V2 flow and confirmed answers |
| Wireframes | `2144:3602` | Six screens, two wizards, six modals, eight states |
| Separator | `2035:3579` | Empty |
| Draft | `33:5138` | Historical alternatives; not authority when conflicting |

### 2.3 Published user-flow sections

| Section | Node | Content |
|---|---:|---|
| Core Journey — High-Level Overview | `2052:277` | Start/analyze → review/improve → export/create |
| SPEC Module — Detailed Screen Flow | `2072:456` | Screen, action, system, decision, failure, and output paths |
| SPEC — Meeting Questions | `2035:3414` | Eight assumed answers followed by eight confirmed answers |

### 2.4 Wireframe inventory

| Surface | Node |
|---|---:|
| Screen 01 — Project SPEC List | `2278:599` |
| Screen 02 — Processing | `2282:764` |
| Screen 03 — Analysis Dashboard | `2200:585` |
| Screen 04 — Review and Edit | `2200:745` |
| Screen 05 — Re-analysis | `2200:905` |
| Screen 06 — Export and Outputs | `2200:1065` |
| W01 — Add SPEC, step 1 | `2257:204` |
| W01 — Add SPEC, step 2 | `2257:232` |
| W01 — Add SPEC, step 3 | `2257:272` |
| W01A — Add SPEC validation error | `2257:306` |
| W02 — New version, step 1 | `2257:334` |
| W02 — New version, step 2 | `2257:359` |
| W02A — New version validation error | `2262:202` |
| M01 — Version history | `2241:300` |
| M02 — Download ASC Master SPEC | `2211:105` |
| M03 — Deny recommendation | `2213:105` |
| M04 — Confirm re-analysis | `2214:105` |
| M05 — Create/update BOM | `2215:105` |
| M06 — Create/update Submittal Package | `2215:122` |

## 3. Confirmed Release 1 decisions

| Topic | Confirmed decision | Product consequence |
|---|---|---|
| Scope | Core SPEC rewrite, BOM, Submittal, Word export | Keep one coherent path through outputs |
| Exclusions | Request Service and advanced Library/Search | Do not expose them as Release 1 primary navigation |
| Track Changes | Matt still needs to confirm native Track Changes | Keep pending; do not promise it |
| User model | One user type; engineer or general contractor | No Release 1 role matrix |
| Permissions | Every user can upload, review, edit, export | Remove role-gated primary-flow behavior |
| Entry | SPEC opens inside the selected Project | Project context is mandatory |
| List pattern | Similar to BOM; Upload is primary | Project SPEC list is the module landing surface |
| Ownership | Every SPEC belongs to selected Project | No organization-library destination in Release 1 |
| Editing | Whole document; basic text editing/formatting | Editor is broader than finding correction |
| Re-analysis | Manual edits require analysis before final export | Export must show a blocking stale-analysis state |
| Versions | New upload creates a version in the same SPEC | Never overwrite history |
| Master trace | Analysis/export references exact ASC Master version | Version trace is visible and durable |
| Collaboration | One editor at a time | Show lock owner and refresh/timeout behavior |
| Low confidence | No separate low-confidence workflow | Show all recommendations in the same review list |
| No recommendations | Clear successful empty result | Zero recommendations is not an error |
| Invalid input | Stop if file is not a valid SPEC | Explain, then Retry or Replace file |

## 4. Canonical user flow

### 4.1 Entry choices

From the selected Project, the user has two distinct entry paths:

1. **Upload SPEC** — creates a project-owned SPEC and starts analysis.
2. **Download ASC Master SPEC** — downloads an editable Division 21, 22, or 23 Master SPEC and creates no SPEC record.

These actions must remain visibly distinct. Downloading a Master SPEC must never redirect into analysis.

### 4.2 Primary happy path

1. Open SPEC inside the selected Project.
2. Scan Project SPECs and continue work from the row’s next action.
3. Choose **Upload SPEC**.
4. Upload PDF or DOCX.
5. System validates that it is a readable specification.
6. System automatically selects Division 21, 22, or 23 and the current Master SPEC version.
7. User confirms or overrides the selection.
8. User reviews the setup and starts analysis.
9. Processing continues in the background; user may leave and return.
10. System compares the customer SPEC with the selected Master SPEC and product data.
11. Analysis Dashboard summarizes recommendations and priorities.
12. User starts or continues review.
13. User reviews one recommendation in document context.
14. User accepts, defers, denies, or edits.
15. Denial may include an optional reason.
16. Manual document edits mark analysis out of date.
17. User confirms re-analysis; valid decisions are preserved where source text is unchanged.
18. Re-analysis returns the user to the editor with new, changed, resolved, and preserved counts.
19. User opens Export.
20. User generates a revised document or creates/updates a project BOM or Submittal Package.

### 4.3 Failure and recovery

- Invalid or unreadable upload → explain the general failure → Retry or Replace file.
- Failed processing → show file/setup context → Retry analysis, Replace file, or return to list.
- Locked editor → show who is editing → refresh lock or return later.
- No recommendations → show successful zero result → Open document or Export.
- Stale analysis after editing → block final export → Re-run analysis.
- Export failure → retain export choices → Retry export.

### 4.4 Version flow

1. Open the row overflow or Version History.
2. Review versions with uploader, date, review state, and exact Master SPEC version.
3. Open an historical version read-only, or choose **Upload new version**.
4. Upload replacement PDF/DOCX.
5. Validate.
6. Review version increment, category, and Master SPEC.
7. Start a new analysis.
8. Preserve previous version, decisions, analysis, and export history.

## 5. Screen specifications

Every screen must answer:

- Where am I?
- What happened?
- What should I review?
- What is the next action?
- What happens after that action?

### 5.1 Screen 01 — Project SPEC List

**Purpose:** Manage specifications for the selected Project and continue each SPEC from its current workflow state.

**Organization**

1. Existing Hydra shell and selected-Project context.
2. Breadcrumb: Projects / Project / SPEC.
3. Page header:
   - title: Project SPECs;
   - one-sentence purpose;
   - secondary: Download ASC Master SPEC;
   - primary: Upload SPEC.
4. Table card:
   - title: SPEC documents;
   - search;
   - Status filter;
   - Division/System Type filter;
   - Last edited sort;
   - table;
   - result count and pagination.

**Required columns**

- SPEC name
- Division/System Type
- Version
- Last updated
- Status
- Review progress
- Next action
- Overflow

**Status-driven next actions**

| Status | Action |
|---|---|
| Processing | View progress |
| Ready to review | Start review |
| In review | Continue review |
| Re-analysis required | Re-run analysis |
| Analysis failed | Retry |
| Ready to export / Review complete | Export |
| Exported | View export |

**Overflow**

- Upload new version
- Version history
- Delete SPEC, visually separated and destructive

**Empty state**

- Clear title: no SPECs in this Project.
- Guidance: upload a customer specification or download an editable ASC Master.
- One primary Upload action; Master download remains secondary.

**UX proposal**

- Reuse BOM table chrome, link-style row actions, external pagination, and single-line scan patterns.
- Do not add organization-library tabs, saved searches, or bulk delete to Release 1.
- The entire row may be navigable only if keyboard behavior and nested actions are unambiguous; the SPEC name link plus explicit next action is safer.

### 5.2 Screen 02 — Processing

**Purpose:** Show trustworthy progress without trapping the user.

**Organization**

1. Back to SPEC list.
2. Title: Analyzing [SPEC].
3. Copy: analysis continues in the background.
4. Main progress panel:
   - overall percent;
   - progress bar;
   - current step;
   - ordered stages with complete/current/waiting states.
5. Setup summary:
   - selected Project;
   - customer SPEC and version;
   - Division/System Type;
   - Master SPEC and exact version.

**Canonical stages**

1. File validated
2. Document structure created
3. Compare against Master SPEC and product data
4. Generate item-by-item recommendations

**Actions**

- Back to SPEC list is always available.
- Do not show Cancel as a dominant action.
- If partial results become a supported requirement, show them only with an explicit partial label.

**Failure state**

- Title and plain-language description.
- File and analysis setup context.
- Secondary: Back.
- Secondary recovery: Replace file.
- Primary recovery: Retry analysis.

### 5.3 Screen 03 — Analysis Dashboard

**Purpose:** Orient the user before item-by-item review.

**Organization**

1. Document header:
   - document name;
   - analysis complete;
   - Division/System Type;
   - Master SPEC version;
   - secondary Export;
   - primary Start/Continue review.
2. Overall assessment:
   - concise summary;
   - recommendation count;
   - high-priority count;
   - reviewed count.
3. Two-column work area:
   - left Table of Contents;
   - right Recommended changes.
4. Recommendation filters:
   - All;
   - High priority;
   - Language;
   - Product;
   - review status.
5. Recommendation rows:
   - priority;
   - category/type;
   - review state;
   - outcome-focused title;
   - exact section/paragraph;
   - Review action.

**Recommendation data**

- Existing text
- Proposed text
- Reason
- Exact source
- Priority
- Type: language rewrite, product substitution, or another approved category
- Decision: not reviewed, accepted, denied, later
- Product evidence when relevant

**No-recommendations state**

- Confirm analysis completed successfully.
- State “0 recommendations” without warning styling.
- Explain that the customer SPEC already aligns with the selected Master and checks.
- Primary Export; secondary Open document.

**UX proposal**

- Preserve exact-source evidence from the existing analyzer.
- Do not retain a separate low-confidence queue in Release 1.
- Requirements and red flags from the existing model should be transformed into user-facing recommendations or supporting evidence, not remain competing top-level modes.

### 5.4 Screen 04 — Review and Edit

**Purpose:** Review recommendations in full-document context and edit the working document.

**Organization**

1. Header:
   - document name;
   - “Recommendation N of M” and saved state;
   - secondary Back to dashboard;
   - Export only when analysis is current.
2. Left: Table of Contents.
3. Center: document editor:
   - basic formatting toolbar;
   - full-document scope;
   - document page/content;
   - focused recommendation overlay;
   - manual-edit guidance.
4. Right: recommendation detail:
   - previous/next;
   - priority and type;
   - existing text;
   - proposed text;
   - reason;
   - exact source;
   - Edit proposal;
   - Deny, Later, Accept.

**Decision hierarchy**

- Accept is the primary decision.
- Later is neutral and non-destructive.
- Deny opens M03; it must not look like the primary positive action.
- Edit proposal remains secondary and full-width above the decision row.

**Saving**

- Decisions and text changes save automatically.
- Show a quiet “All changes saved” status.
- Manual edits immediately mark the analysis stale.

**Lock state**

- Banner above the editor.
- Show editor name and lock explanation.
- Disable editing and review mutation controls.
- Provide Refresh.
- Lock ends when editing finishes or after inactivity/session timeout.

### 5.5 Screen 05 — Re-analysis

**Purpose:** Refresh recommendations after manual document changes.

**Organization**

1. Title and explanation that unchanged decisions are kept.
2. Progress panel:
   - percent;
   - current step;
   - stages.
3. Re-analysis setup:
   - Project;
   - edited customer SPEC version;
   - category;
   - Master SPEC version.
4. Return behavior card:
   - explains editor destination;
   - provides Back to editor only when safe.

**Canonical stages**

1. Manual edits captured
2. Refresh findings and recommendations
3. Keep valid previous decisions
4. Prepare updated review

**Completion state**

- New recommendations count
- Resolved recommendations count
- Changed recommendations count
- Decisions kept count
- Short result summary
- Primary Return to editor

### 5.6 Screen 06 — Export and Outputs

**Purpose:** Generate the revised document or create project outputs from approved recommendations.

**Organization**

1. Header: Export and create outputs.
2. Summary strip:
   - customer SPEC and version;
   - exact Master SPEC version;
   - accepted, denied, undecided counts;
   - explicit undecided-export rule.
3. Revised document panel:
   - output choices;
   - Generate document primary action.
4. Project outputs panel:
   - BOM;
   - Submittal Package;
   - Create new;
   - Add to existing;
   - selected Project reminder.

**Document choices**

1. Clean final document — accepted edits only, no history.
2. Revised document with revision-history appendix.
3. Original document with comparison appendix.
4. Microsoft Word Track Changes — Coming soon until confirmed.

**Export states**

- Ready: generated filename, Close, primary Download.
- Failed: retained context, Close, primary Retry export.

**Guardrails**

- Export remains blocked while re-analysis is required.
- Undecided recommendations may remain, but the output rule must be explicit.
- Output creation uses only approved product recommendations.

## 6. Wizard specifications

### 6.1 W01 — Add SPEC

Use one modal wizard from the Project SPEC list. Remove competing upload experiences.

#### Step 1 — Upload file

- Eyebrow: Add SPEC.
- Title: Upload a SPEC.
- Description names the selected Project.
- Three-step progress header.
- Read-only selected Project.
- PDF/DOCX drop zone and Choose file.
- Support scanned documents with text-recognition note.
- Validation occurs before a SPEC is created.
- Cancel and disabled Continue until valid file.

#### Step 2 — Confirm Master SPEC

- Selected file summary.
- Automatically selected Division 21, 22, or 23.
- Plain guidance: change only if the document belongs to another supported division.
- Master SPEC version selector.
- Back and Continue.

This step fulfills the currently missing “Confirm ASC Master” action.

#### Step 3 — Review and start

- Read-only setup summary: Project, customer file, category, Master SPEC.
- Background-processing note.
- Back and primary Start analysis.
- Start closes the wizard and opens Processing.

#### W01A — Validation error

- Keep the wizard at step 1.
- Show rejected filename and status.
- Explain the general problem without exposing implementation details.
- Cancel, Choose another file, Retry.
- Continue remains unavailable.

### 6.2 W02 — Upload new version

#### Step 1 — Upload file

- SPEC identity, current version, and Project.
- Replacement PDF/DOCX drop zone.
- Explain that current decisions and export history remain available.
- Explicitly state the next version number and that the current version is not overwritten.

#### Step 2 — Review and start

- Version change summary.
- Replacement filename.
- Category.
- Master SPEC and version.
- Change selection action.
- Preservation note.
- Back and primary Upload and analyze.

#### W02A — Validation error

Use the same recovery pattern as W01A, while preserving the current SPEC and version context.

## 7. Modal specifications

All modal footers use same-size controls and a single primary action.

### 7.1 M01 — SPEC version history

**Trigger:** Row overflow → Version history.

**Body**

- SPEC name.
- Explanation that every analysis/export remains tied to customer and Master versions.
- Reverse-chronological version cards.
- Each card: version/current marker, upload date, uploader, review state, Master SPEC version, Open.

**Footer**

- Primary Upload new version.
- Close through standard modal close.

### 7.2 M02 — Download ASC Master SPEC

**Trigger:** Project SPEC list header or empty state.

**Body**

- Explain this downloads an editable Master and creates no analysis.
- Radio-card choice: Division 21 Fire Suppression, Division 22 Plumbing, Division 23 HVAC.
- Available version selector.
- Clear standalone-download note.

**Footer**

- Cancel.
- Primary Download.

### 7.3 M03 — Deny recommendation

**Trigger:** Deny in Review and Edit.

**Body**

- Explain that denial remains in history and counts as reviewed.
- Optional reason text area.

**Footer**

- Cancel.
- Destructive/negative Deny recommendation, without using the positive primary-orange treatment if the established modal pattern supports danger semantics.

### 7.4 M04 — Confirm re-analysis

**Trigger:** Re-run analysis from stale-analysis banner.

**Body**

- Name the exact Master SPEC version.
- Explain preservation: accepted and denied decisions remain when related customer text is unchanged.
- State that export is unavailable until completion.

**Footer**

- Cancel.
- Primary Re-run analysis.

### 7.5 M05 — Create or update BOM

**Trigger:** BOM output on Export.

**Body**

- Project and source SPEC/version.
- Create new vs Add to existing.
- New BOM name or existing BOM selector, conditionally shown.

**Footer**

- Cancel.
- Primary label follows mode: Create BOM or Update BOM.

### 7.6 M06 — Create or update Submittal Package

**Trigger:** Submittal Package output on Export.

**Body**

- Project and source SPEC/version.
- Create new vs Add to existing.
- New package name or existing package selector.

**Footer**

- Cancel.
- Primary label follows mode: Create package or Update package.

## 8. State matrix

| State | Surface | Required message | Primary recovery/action |
|---|---|---|---|
| Empty Project list | Screen 01 | No SPECs in this Project | Upload SPEC |
| File invalid | W01A/W02A | File could not be validated as a supported SPEC | Choose another file or Retry |
| Analysis failed | Screen 02 | Analysis could not finish | Retry analysis |
| No recommendations | Screen 03 | Analysis succeeded with zero recommendations | Export |
| Editor locked | Screen 04 | [User] is editing this SPEC | Refresh |
| Re-analysis required | Screen 04 | Manual edits made analysis out of date | Re-run analysis |
| Re-analysis complete | Screen 05 | New/resolved/changed/preserved summary | Return to editor |
| Export ready | Screen 06 | Generated file is ready | Download |
| Export failed | Screen 06 | Document could not be generated | Retry export |

## 9. Current implementation audit

### 9.1 What currently exists

- `/spec/*` is wired in `src/App.tsx`.
- Sidebar SPEC opens `/spec`.
- Fifteen SPEC routes are registered.
- Eight document-workspace tabs are implemented.
- Ask, Deliver-Back, and Guide Specs are real pages; they are not Coming Soon.
- Processing simulation, extraction analysis, citation deep links, correction drawer, editor working copies, baseline comparison, products, submittals, substitution, Ask, Deliver-Back, and Guide Specs exist.

### 9.2 Priority findings

#### P0 — “Confirm ASC Master” has no confirming interaction

The home workflow can derive `master-confirmation-required` and label its primary action “Confirm ASC Master,” but `specDocumentPrimaryPath()` sends it to Analyze. The promise and destination do not match.

**Required:** W01 step 2 or an equivalent confirmation surface must persist the selected Master before analysis.

#### P0 — Export action routes to Deliver-Back

Ready-to-export and exported documents resolve to `specDeliverBackPath()`.

**Required:** Add a canonical Export destination matching Screen 06 and route workflow actions there.

#### P1 — Current entry is global/library-first

`SpecHomePage` is an organization-wide table with project filters. V2 confirms Project-owned SPECs and a selected-Project list.

**Required:** Resolve URL strategy, then make project context mandatory. The URL may remain `/spec` only if selected-Project context is explicit, durable, and never ambiguous.

#### P1 — Upload is duplicated

Home has a one-modal upload. `/spec/new` and `/spec/projects/:projectId/new` provide a different full-page form, including organization library and document role.

**Required:** Consolidate on W01. Remove organization-library destination from Release 1.

#### P1 — Analyzer solves a different primary task

Current Analyze centers on extracted summaries, requirements, red flags, confidence, and correction. V2 centers on customer-vs-Master/PIM recommendations and review status.

**Required:** Preserve citations and evidence, but reorganize into recommendation rollup, filters, and item-by-item review.

#### P1 — “Review” currently means baseline comparison

`SpecReviewPage` is G1.3 baseline comparison. V2 Screen 04 uses Review for recommendation decisions and full-document editing.

**Required:** Rename, relocate, or defer baseline comparison; do not overload “Review.”

#### P1 — No explicit re-analysis loop

The current status can say re-analysis required, but it routes back to Analyze and lacks M04, Screen 05, and completion summary.

**Required:** Add explicit confirmation, progress, preservation logic, completion state, and return-to-editor destination.

#### P1 — Workspace navigation exceeds confirmed Release 1

Analyze, Edit, Review, Products, Submittals, Substitution, Ask, and Deliver-Back are all visible.

**Required:** Release 1 navigation should focus on Dashboard/Review/Edit/Export. BOM and Submittal are outputs. Request Service equivalents and advanced flows are hidden or clearly deferred, not deleted unless separately approved.

#### P1 — Permission behavior conflicts with confirmed one-user-type scope

Current demo roles and permission boundaries can block editing/approval.

**Required:** Do not gate the Release 1 happy path by role. Keep future permission architecture dormant if it does not confuse the user.

#### P2 — Guide Specs and `/spec/new` are orphaned

These are current discoverability defects, but both are outside the confirmed V2 primary path. Do not add navigation before scope alignment.

#### P2 — Project detail uses older status vocabulary

`SpecProjectDetailPage` uses processing/review state directly rather than the unified workflow language.

**Required:** Use one V2 status model after the IA decision.

### 9.3 Stale documentation

`Documents/SPEC/SPEC_UX_UI_AUDIT_AND_IMPLEMENTATION.md` is historical and must not drive V2 implementation without this audit:

- it points primarily to the older `beZue…` board;
- it says Ask, Deliver-Back, and Guide Specs route to Coming Soon, which is no longer true;
- it centers the older G1 extraction/library/project-review framing;
- its open questions are partly resolved by V2 confirmed answers.

`Documents/SPEC/SPEC_OVERVIEW_IMPLEMENTATION_PROMPT.md` is also historical:

- it says `src/spec` is not on the branch;
- it defines `/spec` as global;
- Phase 0 porting is already complete.

`Documents/SPEC/SPEC_OVERVIEW_TABLE_AUDIT_AND_IMPLEMENTATION.md` remains a useful visual/table-pattern supplement, but V2 owns the Project context, columns, statuses, row actions, and destination behavior. Its BOM-parity recommendations apply only where they do not conflict with this audit.

`Documentation/hydra-app-capabilities.md` remains stale:

- it documents SPEC as `/projects/:projectId/sales-brace` stub;
- it has no real SPEC route inventory.

Update the capabilities map only in the implementation phase that adopts the V2 route/IA.

## 10. Existing Hydra pattern mapping

| SPEC surface | Reuse pattern | Reason |
|---|---|---|
| Project SPEC list | `BomSiteProjectsPage`, `shellTablePatterns` | Project context, filter toolbar, table, external pagination |
| Page headers | `BomPageHeader` | Existing title/action hierarchy |
| Add/new-version wizard | `BomUploadDestinationModal`, `BomUploadFlowStepChrome` concepts | File context, validation, Back/Continue hierarchy |
| Background progress | `BomImportProgressStrip`, `BomPendingUploadsRegion` | Leave-and-return behavior |
| Processing/recovery | `BomParsingReviewPage` alert conventions | Blocking vs informational clarity |
| Analysis Dashboard | `BomMatchingPage` | Stats, filters, table/list, drill-in |
| Guided recommendation review | `BomProgressiveMatchingPage` | One item at a time, clear progress, one primary decision |
| Review workspace regions | `BomMatchingReviewPartPanel` composition | Fixed context + flexible review area |
| Decision drawer/footer | `BomMatchDetailDrawer` | Defer/secondary/primary hierarchy |
| Simple modals | Existing BOM modal footers | Cancel + one commit action |
| Empty/no-results | `HomeHubPage`, `BomSiteProjectsPage` | Distinguish no data from no matches |

Use existing Ant Design components through `src/ui/antd.ts`: `Table`, `Modal`, `Drawer`, `Steps`, `Progress`, `Alert`, `Empty`, `Card`, `Form`, `Radio`, `Select`, `Input`, `Typography`, `Button`, `Badge`, `Flex`, and `Tooltip`.

No new shared/core component is required. Local SPEC compositions are allowed. Existing tokens, typography, icons, and shell components remain unchanged.

## 11. Accessibility and interaction requirements

- One meaningful `h1` per page.
- Breadcrumbs and visible document/Project identity.
- All inputs have visible labels.
- Wizard step state is announced and not communicated by underline/color alone.
- Processing and re-analysis updates use a polite live region.
- Status always includes text.
- Recommendation rows and TOC items are keyboard operable.
- Focus moves predictably when opening a recommendation, modal, or error.
- Modal focus returns to its trigger.
- Editor lock and stale-analysis banners are announced.
- Accept, Later, and Deny have distinct labels and keyboard focus.
- Destructive delete and denial semantics are not represented only by color.
- Reduced-motion preferences are honored.

## 12. Scope boundaries

### Release 1

- Selected-Project SPEC list
- Master download
- Add SPEC and new-version upload
- Processing and recovery
- Analysis Dashboard
- Recommendation review and full-document basic editing
- Re-analysis
- Version history
- Document export
- BOM output
- Submittal Package output

### Explicitly not Release 1 primary scope

- Request Service / Ask / Deliver-Back
- Advanced organization Library/Search
- Saved searches and alerts
- Separate low-confidence queue
- Real-time multi-user editing
- Role-based restrictions
- Native Word Track Changes until confirmed
- Substitution workflow unless separately approved
- Get Specified / Guide Specs

Existing prototype pages outside Release 1 should be hidden or deferred, not deleted as part of screen-alignment work.

## 13. Acceptance checklist for this UX specification

- [x] All six FigJam pages inspected.
- [x] Published User Flow, Wireframes, confirmed answers, and Draft differentiated.
- [x] Six primary screens specified.
- [x] W01/W02 and validation states specified.
- [x] M01–M06 specified.
- [x] Eight wireframe state variants covered.
- [x] Current routes and pages reconciled.
- [x] Existing Hydra patterns identified.
- [x] Stale docs identified.
- [x] Release 1 inclusions and exclusions explicit.
- [x] No application code, shared component, token, or Figma change made.

## 14. Product and engineering checkpoints before code

1. **URL strategy:** `/spec` with mandatory selected-Project state or `/projects/:projectId/spec`.
2. **Navigation labels:** Dashboard, Review/Edit, Export, and whether a visible separate Edit step is needed.
3. **Recommendation model:** how existing requirements/red flags/product suggestions map into one recommendation entity.
4. **Track Changes:** pending confirmation; implementation must not imply support.
5. **Baseline comparison:** defer, rename, or keep outside the Release 1 primary navigation.
6. **Existing out-of-scope pages:** hide behind demo controls, retain by direct route, or feature-flag in a later implementation decision.

No other product ambiguity blocks the documentation plan.
