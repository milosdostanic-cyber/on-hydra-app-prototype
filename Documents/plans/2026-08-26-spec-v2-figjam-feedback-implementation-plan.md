# SPEC V2 — FigJam feedback implementation plan

**Date:** 2026-08-26
**Source board:** [SPEC — Kickoff V2](https://www.figma.com/board/OvxMEc7zwbtW7q2Vx0EVeW/SPEC---Kickoff-V2)
**Feedback authors:** Matt Pettit (product), Lucas Saeed (design)
**Comments read:** 35 threads (33 active, 2 resolved) via Figma Console MCP `figma_get_comments`
**Wireframes reviewed:** 13 nodes, screenshots cached in `.spec-audit/figma-review/`
**Status:** plan only — no code changed. Implementation requires sign-off on the open questions in §9.

---

## 1. Why this plan exists

The V2 wireframes on the board are already implemented in the repo — in several places 1:1 (`SpecProcessingPage`, `SpecReanalysisPage`, the analysis dashboard two-column layout, the editor right pane). Matt's review landed **after** that implementation (2026-08-26, 02:38–03:20 UTC), so this is not a build-from-design task. It is a **revision pass**: the wireframes are now partly superseded by the comments, and the repo has to follow the comments, not the frames.

One theme runs through almost every comment Matt left:

> Fewer intermediate full-page screens. Keep BOM's look and feel. Don't bury the actual spec revise/review tool behind clicks. Don't ship v1 bloat (version history, confidence scores).

Everything below derives from that.

---

## 2. Wireframe → repo map

| Figma node | Wireframe | Repo implementation |
|---|---|---|
| `2278:599` | Project SPECs listing | `src/spec/pages/SpecHomePage.tsx` |
| `2257:232` | Add SPEC wizard — Confirm Master SPEC | `src/spec/components/SpecAddDocumentWizardModal.tsx` |
| `2282:764` | Processing / "Analyzing …" | `src/spec/pages/SpecProcessingPage.tsx` |
| `2227:421` | Analysis failed (full page) | failed branch of `SpecProcessingPage` + `SpecProcessingStages` |
| `2200:585` | Analysis dashboard | `src/spec/pages/SpecAnalyzePage.tsx` |
| `2311:2770` | Review & Edit — recommendation list variant | `src/spec/pages/SpecEditPage.tsx` |
| `2200:745` | Review & Edit — single recommendation pane | `SpecEditPage` + `SpecRecommendationDetailPanel` |
| `2227:558` | Review & Edit — locked by another editor | `SpecEditPage` (`lockedByAnotherEditor`) |
| `2227:647` | Review & Edit — re-analysis required | `SpecEditPage` stale banner (L453–464) |
| `2200:905` | Re-analysis in progress | `src/spec/pages/SpecReanalysisPage.tsx` + `SpecReanalysisProgress` |
| `2227:736` | Re-analysis complete | `SpecReanalysisPage` + `SpecReanalysisCompletion` |
| `2200:1065` | Export and create outputs | `src/spec/pages/SpecExportPage.tsx` |
| `2227:796` | Export ready | `SpecExportPage` ready state |

---

## 3. Comment ledger — every active thread and its verdict

`#` is the Figma thread order id. "Verdict" is what this plan commits to.

| # | Node | Author | Comment (gist) | Verdict | Phase |
|---|---|---|---|---|---|
| 1 | `2278:599` | Lucas → Matt | Educate the user on what this is for; Matt: engineers know "ASC Master Specs"; clicking it should open a modal listing the 3 master specs with download one **or all** | Keep the label; modal already lists all three. Download-all deferred (§9a) | 9a |
| 2 | `2282:764` | Lucas → Matt | Setup vs Steps — merge? Matt: **kill the box**; only the model-chosen category is worth keeping, move it left | Remove `SpecAnalysisSetupCard` | 2 |
| 5 | `2200:1065` | Lucas | Rename "Project outputs" → "Alternative Project output"? | Superseded by #21 | 1 |
| 6 | `2278:599` | Matt | Subtitle should read "Validate your specification against ASC's master specs and product catalog." | Copy change | 1 |
| 7 | `2278:599` | Matt | Version history is v1 bloat | Remove the entry point; modal stays in repo unmounted | 1 |
| 8 | `2278:599` | Matt | Must look/feel identical to the BOM sub-project listing; name clickable | Parity audit + small fixes | 1 |
| 9 | `2278:599` | Matt | "Love this column" (Review progress) | Keep as is | — |
| 10 | `2282:764` | Matt | Don't diverge from BOM; reuse the BOM progress bar. Reply: details shouldn't consume a whole page; one page with summary **and** action items; don't bury the review tool; "maybe we just kill this wireframe altogether" | Reuse BOM progress chrome; drop the full-page processing destination | 2 |
| 11 | `2311:2770` | Matt | TOC scrollable; clicking a section jumps to that part of the editor. Reply: sections with recommended changes must be flagged in the TOC | Editor TOC upgrade | 4 |
| 12 | `2200:585` | Matt | TOC does **not** belong on the analysis dashboard — too many CTAs | Remove TOC column from dashboard | 3 |
| 13 | `2200:585` | Matt | 3–40 recommendations; user must get through all of them with the filters; paginate? | Add pagination (BOM pattern) | 3 |
| 14 | `2200:585` | Matt | Group filters/chips by: Add Manufacturer, Rewrite Language, Swap Part, Add Product, Update Reference, Blocked | New action-type facet | 3 |
| 15 | `2311:2770` | Matt | "Back to dashboard" — needed? breadcrumbs exist | Remove redundant page-level back nav | 4 |
| 16 | `2311:2770` | Matt | If those tags are confidence scores, don't expose them yet; threshold on the backend | De-expose confidence; disambiguate priority labels | 6 |
| 17 | `2200:745` | Matt | "I love the why. Always show the why!!" | Guarantee the reason is always rendered | 4 |
| 18 | `2200:745` | Matt | "Exact source" box unnecessary if the text is visible in the doc | Remove box; keep scroll-to-source | 4 |
| 19 | `2200:745` | Matt | Editing must exist, but why in this pane instead of in the document? | Move editing into the document | 4 |
| 20 | `2200:905` | Matt | Re-analysis page adds bloat; the dashboard can carry post-reanalysis output | Delete the reanalysis page | 2 |
| 21 | `2200:1065` | Matt | Call it "ConnectED Actions" | Rename section | 1 |
| 22 | `2257:232` | Matt | Division auto-determined at upload, user can override | Already implemented — verify only | 1 |
| 23 | `2257:232` | Matt | One version per ASC master spec; no version history | Data layer only; modal selectors deferred (§9a) | 1 / 9a |
| 24 | `2257:232` | Matt | Future: engineer/contractor uploads **their** master/project spec to compare against | Document as future scope only | — |
| 25 | `2227:421` | Matt | Ditch the failed page; a modal or error message is enough | Failure becomes modal + row state | 2 |
| 26 | `2227:558` | Matt | The "someone else is editing" banner "ought to be there" | Keep as is | — |
| 27 | `2227:647` | Matt | Any manual edit must force a re-analyze | Already implemented — harden the gate | 2 |
| 28 | `2227:736` | Matt | Put the re-analysis-complete output on the analysis dashboard | Move summary to dashboard | 2/3 |
| 29 | `2227:796` | Matt | Limit clicks to what the part detail page has — "Add to BOM", "Add to Submittal Manager" — and reuse the same existing-project-or-create modal | Four CTAs collapse to two on the page; existing modal reused as is | 5 |

**Resolved threads (no action):** #3 (Lucas, "let's chat about proposed text"), #4 (Lucas, "Export Document" wording — repo already says `Export document`).

**Open, unanswered by Matt:** Miloš's thread reply (2026-08-26 13:39) asking whether "sub-projects" means the BOM project listing and whether SPEC should copy that layout minus the Get started cards. See §9 Q4.

---

## 4. Design principles this plan commits to

1. **In-progress work is a strip on a working page, never its own destination.** BOM has no processing route: `BomRoutes.tsx` goes straight to working pages, and in-flight state is carried by `BomUploadProgressBar` inside `BomUploadFlowStepChrome` (upload flow) or `BomImportProgressStrip` inside `BomPendingUploadsRegion` (listing). SPEC follows the same rule.
2. **Failures are inline or modal, never a page.** BOM surfaces every failure as an antd `Alert`, a `message.error`, or a `modal.confirm` (see `BomMappingSummaryPage` L227–238, `BomWorkspacePage` L720–743, `BomSiteProjectsPage` L158–187).
3. **One dashboard carries both the summary and the action items.** Nothing that a user needs post-analysis or post-reanalysis gets its own route.
4. **Nothing new is invented.** Every change below reuses existing Ant Design components, existing BOM/shell components, and existing theme tokens. No new shared components, no new tokens, no raw hex/px.
5. **v1 scope discipline.** Version history and confidence exposure come out.

### Hard constraint — the existing modals are frozen

The SPEC modals already built in this repo are **out of scope for this plan**. Do not restructure, rebuild, redesign, or delete them:

- `SpecAddDocumentWizardModal.tsx` (W01 upload wizard)
- `SpecUploadNewVersionModal.tsx` (W02 new version)
- `SpecConfirmReanalysisModal.tsx`
- `SpecDenyRecommendationModal.tsx`
- `SpecDownloadMasterModal.tsx`
- `SpecProjectOutputModal.tsx`
- `SpecVersionHistoryModal.tsx`

What is still allowed:

- **Unmounting** a modal and removing its entry point from a page (the component file stays in place, untouched).
- **Wiring** an existing modal to a new trigger.
- **Adding a new modal** for a case that has none today, built in the same pattern as the existing ones and without editing any of them.

Everything in Matt's feedback that would require editing the *inside* of one of these modals is collected in §9a and deferred until it is explicitly approved. This keeps the modal work already invested intact and keeps this plan's diff on pages, routes, and lists.

---

## 5. Phase plan

Phases are ordered so each one is independently reviewable and shippable. Phases 1 and 6 are safe copy/scope changes; phase 2 is the structural one.

### Phase 1 — Copy, scope, and listing parity (low risk)

**1a. Listing subtitle** (#6)
`src/spec/pages/SpecHomePage.tsx` L350 — replace `description` with `Validate your specification against ASC's master specs and product catalog.` Title `Project SPECs` stays.

**1b. Remove the version-history entry point** (#7)
- `SpecHomePage.tsx` L333 — drop the `Version history` entry from the `BomTableRowActions` list; keep `Upload new version` and `Delete SPEC`.
- `SpecHomePage.tsx` L519–531 — remove the `SpecVersionHistoryModal` mount and its `historyDocId` state.
- **Do not delete or edit `SpecVersionHistoryModal.tsx`.** The component stays in the repo, unmounted, so the decision can be reversed without rebuilding it. Same for the `Version history` wording inside `SpecUploadNewVersionModal.tsx` L224 — that is modal-internal copy, deferred to §9a.
- The per-document `versionLabel` / `versionNumber` **stay** — Matt objects to browsable history, not to versioning. The `Version` column and the header version tag remain.

**1c. Master SPEC has one version — data layer only** (#23)
- `src/spec/data/specDocumentsSeed.ts` L63–88 — collapse `availableVersions: string[]` to a single `currentVersion: string` on `SPEC_MASTER_CATALOG`.
- The modal-side consequences of that change (`SpecDownloadMasterModal.tsx` version `Select` at L84–90, `SpecUploadNewVersionModal.tsx` "Master SPEC version" block at L317–333) are **deferred to §9a** under the modal freeze. If the seed change alone would break those modals' types, keep `availableVersions` as a one-element array instead and defer the whole item — do not edit the modals to make the seed change fit.
- `SpecAddDocumentWizardModal.tsx` already documents "show current only (no version history)" (L68) — read-only verification, no edit.

**1d. Master SPEC modal: download one or all** (#1) — **deferred**
Adding a `Download all` action means editing `SpecDownloadMasterModal.tsx`. Under the modal freeze this moves to §9a. The modal already lists all three master specs and already carries the explanatory line at L58 ("creates no analysis and no SPEC document"), so the substance of Lucas's education request and Matt's "inform the user of the 3 master specs" is already satisfied — only the download-all convenience is outstanding.

**1e. Rename Export outputs section** (#21, supersedes #5)
`src/spec/pages/SpecExportPage.tsx` L388–389 — `Project outputs` → `ConnectED Actions`. Keep the description line but reword to match: creating a ConnectED action from approved recommendations. Also update the closing note at L440-ish ("Outputs remain inside …") to speak about actions.

**1f. BOM listing parity audit** (#8, #9)
Compare `SpecHomePage` against `src/bom/pages/BomSiteProjectsPage.tsx` and align only where SPEC drifts:
- Name cell: both already use `Button type="link"` with `{ padding: 0, height: 'auto' }` (SPEC L216, L227–234; BOM L218, L228–237). **No change.**
- Status: BOM uses `BomProjectStatusTag` → `BomStatusBadge` (antd `Badge` dot); SPEC uses antd `Badge status text` directly (L263–271). Same primitive, different label set because SPEC has 11 workflow statuses. **No change**, but verify tone mapping in `specWorkflowBadgeStatus` matches BOM's success/warning conventions.
- Search + filters: both use `AppSearchInput` plus antd `Select`s. Align `Select` widths with BOM's (`164` / `200` equivalents expressed through tokens) if they differ.
- Pagination: SPEC uses `BomTablePaginationBar`, BOM's site page uses a raw `Pagination` in a bordered footer. `BomTablePaginationBar` is the newer shared abstraction — keep SPEC on it.
- **Do not** add BOM's "Get started" cards. Miloš already stated this in the thread and it is the correct call: SPEC's entry point is the header `Upload SPEC` CTA.
- Keep the `Review progress` column exactly as is (#9).

**1g. Division auto-detection** (#22)
Verify only: `SpecAddDocumentWizardModal` step 2 renders "Automatically selected category" with an overridable radio group. No change expected.

**Acceptance:** listing subtitle matches Matt's wording; no version-history entry point anywhere (component still present but unmounted); the master spec catalog carries one version in data; export section reads "ConnectED Actions"; listing visually indistinguishable from the BOM sub-project table apart from SPEC-specific columns; no existing modal file modified.

---

### Phase 2 — Remove the interstitial pages (structural, highest value)

This phase implements #2, #10, #20, #25, #27, #28.

**2a. Processing page loses the setup card and adopts BOM chrome** (#2, #10)
- `src/spec/pages/SpecProcessingPage.tsx` — delete `SpecAnalysisSetupCard` (L38–69) and its right-hand column (L145–147). Move only the model-chosen division into the progress card as a single secondary line, per Matt ("the category the model chose" can live in the left box).
- `src/spec/components/SpecProcessingStages.tsx` — replace the bespoke `Progress` + heading composition (L50–59) with the BOM chrome. Two options, both reuse existing components:
  - **Preferred:** `BomImportProgressStrip`-shaped strip (title + step detail + `Progress` line) so the same chrome can later be portalled onto the listing. It already supports `placement="shell-flush"` (defined but unused, `BomImportProgressStrip.tsx` L23–26) and `variant="active"` (default, currently no call sites) — SPEC becomes the first consumer of both, with **no change to the component**.
  - Alternative: `BomUploadProgressBar` with SPEC's own step titles. Rejected because its `BOM_UPLOAD_FLOW_STEPS` are hard-coded to the BOM upload flow, and adding a prop would modify a shared component.
- Keep the vertical `Steps` list of analysis stages inside the card — that is the "action items" half Matt wants, and it is not BOM divergence, it is detail under the shared progress chrome.

**2b. Analysis progress moves onto the listing** (#10)
- Add a SPEC pending-analysis region on `SpecHomePage`, modelled on `src/bom/components/BomPendingUploadsRegion.tsx`: one strip per document in `processing` / `reanalyzing`, collapsed into an antd `Collapse` when there are two or more, portalled into the same shell slot BOM uses (`BOM_SHELL_FLUSH_BELOW_BREADCRUMB_ID`).
- Strip copy: `Analysis in progress for "{title}"` / `Current step: {step} · {n} of 4 steps complete`, with `View progress` as the action.
- This is a **new local composition** for the SPEC listing built entirely from `BomImportProgressStrip` + antd `Collapse` — allowed under the creative-exception rule, and it must not be promoted to a shared component.

**2c. Upload no longer lands on a processing page** (#10)
- `SpecHomePage.tsx` L167, L513, L543 and `SpecAnalyzePage.tsx` L107 currently navigate to `specProcessingPath`. After upload, navigate to the **analysis dashboard** instead, which renders in a processing state: the progress strip at the top, the assessment cards as skeletons, and the recommendation list empty with a "Analysis is still running" `Empty`.
- Keep the `:specId/processing` route (`SpecRoutes.tsx` L56) as a **deep-link fallback only** so existing links and the `View progress` action still resolve. Do not delete it in this pass — see Q1.
- `specDocumentPrimaryPath` (`specNavigation.ts` L71–94) — `processing` and `uploading` now resolve to the analyze path, not the processing path.

**2d. Failure becomes a modal** (#25)
- Delete the failed **page** branch: `SpecProcessingPage.tsx` L104–108 title/description switching and the failure-only actions.
- New local modal `SpecAnalysisFailedModal` in `src/spec/components/`, modelled on `SpecConfirmReanalysisModal.tsx` (antd `Modal` + `Alert` + two actions): title `Analysis could not finish`, body = `document.failureReason` plus the saved-input recap (file name, division, master spec) that the wireframe showed, actions `Replace file` (secondary) and `Retry analysis` (primary), plus `Cancel`. This is a **new** modal for a case that has none today — permitted under the freeze, and `SpecConfirmReanalysisModal` is read as a pattern reference only, not edited.
- Opened from the listing row primary action when status is `analysis-failed` (`SpecHomePage.tsx` L170-ish `runPrimaryAction`), and from the dashboard if a user deep-links into a failed document.
- Keep the inline error `Alert` inside `SpecProcessingStages` (L61–73) for the deep-link fallback page — that is the BOM inline-alert pattern and costs nothing.

**2e. Delete the re-analysis page** (#20, #28)
- Remove route `:specId/reanalysis` (`SpecRoutes.tsx` L57) and delete `src/spec/pages/SpecReanalysisPage.tsx`.
- Remove `specReanalysisPath` from `specNavigation.ts` and its use in `specDocumentPrimaryPath` (L71–94): `reanalysis-required` and `reanalyzing` now resolve to the editor and the dashboard respectively.
- Remove the reanalysis breadcrumb rule from `src/shell/buildAppBreadcrumbItems.tsx`.
- **In-progress re-analysis** renders as the same progress strip, in the editor header region (where the wireframe `2227:647` already puts a banner) and in the listing pending region from 2b. `SpecReanalysisProgress` is reused as the strip body; the editor stays visible and read-only while it runs — `SpecEditPage` already has `reanalysisInProgress` → `workspaceReadOnly` (L100–103), so this is a rendering change, not a state-machine change.
- **Completed re-analysis** renders `SpecReanalysisCompletion` (New / Resolved / Changed / Decisions kept) as a dismissible card at the top of the **analysis dashboard** (#28), above the overall assessment. The component already exists and needs only a `Return to review` action instead of `Return to editor`.
- Update `src/spec/data/specReanalysisWorkflow.test.ts` for the new navigation contract.

**2f. Harden the forced re-analysis gate** (#27)
`specMockStore.ts` L1126–1134 already sets `reanalysisRequired: true` on any manual block edit, and `SpecExportPage` L203–208 already blocks with a `Re-analysis required` alert. Two hardening items:
- `applyRecommendationTextInStore` (L1141–1164) does **not** set the flag. Confirm with product whether accepting a generated recommendation counts as a "manual edit" — Matt's wording is "any time the user manually edits the document". Recommended reading: accepting a proposal is not a manual edit, so leave as is, and document the distinction. See Q5.
- Make the export CTA `disabled` (not just alerted) while `reanalysisRequired` is true, so the gate is genuinely forced.

**Acceptance:** no route in the SPEC module renders a full page whose only job is "wait" or "something failed"; a user who uploads a file lands in the dashboard and can watch progress there or leave and see it on the listing; the post-reanalysis delta is visible on the dashboard.

---

### Phase 3 — Analysis dashboard consolidation

Implements #12, #13, #14, and consumes 2e's completion card.

**3a. Remove the Table of contents column** (#12)
`src/spec/pages/SpecAnalyzePage.tsx` L441–527 — delete the TOC `Card`. The recommendations card becomes full width (drop the `flex: '3 1 0%'` split at L541).

Section filtering must survive the column's removal, because it is genuinely useful: move it into the filter row as an antd `Select` labelled `All sections`, driven by the same `sections` array and the same `setSelectedSectionId` / deep-link writes that the buttons used (L477–524). Net effect: same capability, one less CTA cluster, which is exactly Matt's objection.

**3b. Regroup filters by action type** (#14)
Matt's six groups are: **Add Manufacturer, Rewrite Language, Swap Part, Add Product, Update Reference, Blocked.** The current facets are `All / Language / Product` plus a `High priority` checkbox plus a review-status `Select` (L578–598).

Data work required — the current model cannot express six groups:
- `src/spec/data/types.ts` L379 — add `export type SpecRecommendationAction = 'add-manufacturer' | 'rewrite-language' | 'swap-part' | 'add-product' | 'update-reference' | 'blocked';` and an `action: SpecRecommendationAction` field on `SpecRecommendation` (L407–435).
- Derive `action` deterministically in the analysis repository (`src/spec/data/repositories/specRepositories.ts`) from the existing `type` (`'language' | 'product' | 'coordination' | 'compliance'`), `category`, and `productEvidence`, so no seed rewriting is needed in this slice:
  - `language` → `rewrite-language`
  - `product` with existing-part evidence → `swap-part`
  - `product` with no existing part → `add-product`
  - `product`/`compliance` whose change is a manufacturer requirement → `add-manufacturer`
  - `coordination` / `compliance` referencing a standard or another section → `update-reference`
  - anything with no ASC fit or an unresolvable dependency → `blocked`
- Verify the derived distribution against the seeds and adjust seed `category` strings only where the mapping is genuinely ambiguous.

UI: replace the `Radio.Group` with an antd `Segmented` or a `Radio.Group` of seven options (`All {n}` + the six groups with counts), keeping the existing `Checkbox` for high priority and the existing review-status `Select`. `Blocked` gets the error tone already used elsewhere in the module.

**3c. Paginate the recommendation list** (#13)
- Remove the inner fixed-height scroll container (L601–609 `overflowY: 'auto'`) so the page scrolls naturally — Matt wants to scroll *through all of them*, not inside a box.
- Add `BomTablePaginationBar` at the bottom of the card, page size `shellLayout.tablePageSizeDefault`, `summary` = `{filtered} of {total} recommendations`. This matches how `BomParsingReviewPage` and `BomMatchingPage` handle their long review lists (client-side pagination, no virtualization).
- Reset to page 1 whenever a filter changes; keep the existing `Empty` + `Clear filters` state (L611–627).

**3d. Post-reanalysis "what changed" card** (#28)
Render `SpecReanalysisCompletion` at the top of the dashboard when the document has a completed reanalysis summary that the user has not dismissed. Reuse the existing metric cards; no new component.

**Acceptance:** the dashboard is a single scannable page — summary, then a filterable and paginated list grouped by Matt's six action types — with no TOC and no competing CTA cluster.

---

### Phase 4 — Review & Edit pane

Implements #11, #15, #17, #18, #19; keeps #26 untouched.

**4a. TOC becomes the navigation instrument it was meant to be** (#11)
`src/spec/components/SpecSectionNavigator.tsx` (used only by `SpecEditPage` L405):
- Ensure the list scrolls independently (`overflowY: 'auto'` on the list container, tokens for padding) — the editor TOC is where Matt wants scrolling, not the dashboard.
- Clicking a section scrolls the document viewer to that section instead of only filtering. `SpecDocumentViewer` already receives block ids; add a scroll-into-view on section change.
- Flag sections that still need review: per-section count of undecided recommendations rendered as an antd `Badge` count or a `Tag` on the row (thread reply on #11). Data is already available from the recommendation list grouped by `sectionId`.

**4b. Always show the reason** (#17)
`SpecRecommendationDetailPanel` — confirm `Why this is recommended` renders unconditionally, with a fallback line when `reason` is empty rather than hiding the block. Cheap, and it protects the thing Matt explicitly praised.

**4c. Remove the "Exact source" box** (#18)
Remove the source `Section … · Paragraph …` box from the detail panel. Selecting a recommendation already highlights and scrolls to the block in the document, which is Matt's stated condition ("if they see the text within the doc"). Verify that highlight-and-scroll actually happens before removing the box — if it does not, 4a's scroll work lands first.

**4d. Move editing into the document** (#19)
Remove the `Edit proposal` button from the right pane. Editing stays available where Matt expects it — inline in the document, which `SpecEditPage` already supports through `updateWorkingCopyBlock`. Accepting a recommendation writes the proposed text into the block, and the user edits it in place; the existing forced re-analysis gate (#27) already covers the consequence. This is the answer to "convince me why it should live here": it should not.

**4e. Drop redundant page-level back navigation** (#15)
- Remove `Back to dashboard` from `SpecEditPage` (L642–652) and `SpecExportPage` (L191–193) — breadcrumbs already carry those paths (`buildAppBreadcrumbItems.tsx` L76–137).
- Add breadcrumb rules for the routes that lack them but survive this plan (`baseline-comparison`, `products`, `substitution`, `deliver-back`, `ask`, `guide-specs`) so their `PageBackButton` instances can be dropped in a later pass. **Do not** remove those back buttons in this pass — the breadcrumbs must exist first, or users lose their way out.

**4f. Keep the concurrent-edit banner** (#26)
No change. Verify the read-only state still renders `Refresh`.

**Acceptance:** the editor is the place where you navigate the document and edit it; the right pane explains *why* and offers a decision, nothing else; there is exactly one way back up the hierarchy.

---

### Phase 5 — Export outputs reuse the shared destination modals

Implements #29.

`src/spec/pages/SpecExportPage.tsx` L388–438 currently renders four buttons: `Create new` / `Add to existing` for BOM, the same pair for Submittal Package. Matt wants the part-detail-page pattern: one button per destination, and the existing project-or-create modal behind it.

- Replace the BOM pair with a single `Add to BOM` button and the Submittal pair with a single `Add to Submittal Package` button. This is a **page-level** change in `SpecExportPage.tsx` only — the button grid collapses from four CTAs to two.
- Each button opens the modal that already exists, unchanged:
  - **Default path:** keep `SpecProjectOutputModal` as the destination step. It already carries the SPEC-specific payload (the approved-recommendation set) that the generic BOM modals cannot express, and under the modal freeze it is not rebuilt. The `create new` vs `add to existing` choice moves *inside* the flow the modal already runs, instead of being two separate page buttons.
  - **Reference only:** `src/shell/ProjectRequiredModal.tsx` (L127–128, L280–281), `src/bom/components/AddToBomModal.tsx`, `AddToPackageModal`, and the wiring in `usePartActionFlows.tsx` L298–325 show the continuity Matt is asking for. Adopting them wholesale would mean reworking `SpecProjectOutputModal`, so it is deferred to §9a.
- Retain the closing note that outputs stay inside the active project.

**Label discrepancy:** Matt wrote "Add to Submittal Manager", but the part detail page he pointed at actually says `Add to Submittal Package` (`usePartActionFlows.tsx` L47, L56, L322), and "Submittal Manager" is the sidebar destination name. This plan uses the existing repo label for genuine continuity. See Q3.

**Acceptance:** the export screen offers one CTA per destination instead of four, and no modal component is edited.

---

### Phase 6 — Stop exposing confidence

Implements #16.

Matt's comment was pinned on the `High` / `Medium` priority tags of the recommendation cards, and he read them as possible confidence scores. Two separate fixes follow:

**6a. Disambiguate priority.** `SpecRecommendationCard` and `SpecRecommendationDetailPanel` render priority as a bare `High` / `Medium` / `Low`. Render `High priority` / `Medium priority` / `Low priority` (the vocabulary already exists in `specStatusVocabulary.ts` L105–115 as the non-compact labels) so no one can mistake them for model confidence.

**6b. Remove real confidence from the UI.** `SpecConfidenceTag` (`src/spec/components/SpecConfidenceTag.tsx` L23–40) appends ` · {percent}%` and is rendered by four cards. Only one of those is reachable today — `SpecProductSuggestionCard` on the Products page (`SpecProductsPage` L168–197).
- Stop passing `percent` at all four call sites (`SpecRequirementCard` L38, `SpecRedFlagCard` L46, `SpecProposalCard` L53, `SpecProductSuggestionCard` L69).
- On the reachable page, drop the tag entirely and instead surface the threshold outcome: suggestions below the threshold are simply not presented as ASC fits, which the page already models through its "No ASC catalog fit" section. This is exactly Matt's "set a threshold on the backend on what to expose".
- Keep `confidence` / `confidencePercent` in the data model and seeds so the threshold can be tuned, and keep `SpecConfidenceTag` in the codebase unused-but-intact for when confidence is cleared for exposure. Note it in `SpecDemoControls` if a demo toggle is warranted.

**Acceptance:** no percentage or confidence band is visible anywhere in the SPEC UI; priority labels read unambiguously as priority.

---

### Phase 7 — Verification

- `npx tsc --noEmit` — zero errors.
- `ReadLints` on every touched file — zero new findings.
- Existing SPEC tests updated and green: `src/spec/data/specReanalysisWorkflow.test.ts` (navigation contract changes in 2e), `specReviewWorkflow.test.ts`, `specExportWorkflow.test.ts`, `specAnalysisSeed.test.ts` (recommendation `action` derivation from 3b).
- Manual sweep of the affected routes with the existing scripts in `scripts/spec-audit/` (`sweep.mjs`, `analyze.mjs`, `home.mjs`) and a fresh screenshot set for before/after comparison.
- Token discipline pass: no raw hex, no raw px for design intent, no new tokens, no modified shared components. `BomImportProgressStrip` and `BomTablePaginationBar` are consumed through their existing props only.

---

## 6. Files touched, by phase

| Phase | Files |
|---|---|
| 1 | `SpecHomePage.tsx`, `SpecExportPage.tsx`, `specDocumentsSeed.ts` |
| 2 | `SpecProcessingPage.tsx`, `SpecProcessingStages.tsx`, `SpecHomePage.tsx`, `SpecAnalyzePage.tsx`, `SpecRoutes.tsx`, `specNavigation.ts`, `buildAppBreadcrumbItems.tsx`, `SpecEditPage.tsx`, `SpecExportPage.tsx`, `specMockStore.ts` (gate only), new `SpecAnalysisFailedModal.tsx`, new SPEC pending-analysis region, delete `SpecReanalysisPage.tsx`, update `specReanalysisWorkflow.test.ts` |
| 3 | `SpecAnalyzePage.tsx`, `types.ts`, `specRepositories.ts`, recommendation seeds (only if mapping is ambiguous), `SpecReanalysisCompletion.tsx` (action label) |
| 4 | `SpecSectionNavigator.tsx`, `SpecRecommendationDetailPanel.tsx`, `SpecDocumentViewer.tsx` (scroll-to-section), `SpecEditPage.tsx`, `SpecExportPage.tsx`, `buildAppBreadcrumbItems.tsx` |
| 5 | `SpecExportPage.tsx` |
| 6 | `SpecRecommendationCard.tsx`, `SpecRecommendationDetailPanel.tsx`, `SpecProductSuggestionCard.tsx`, `SpecRequirementCard.tsx`, `SpecRedFlagCard.tsx`, `SpecProductsPage.tsx` |

No files outside `src/spec/`, `src/shell/buildAppBreadcrumbItems.tsx`, and read-only reuse of `src/bom/components/*` are modified. **No BOM or shell component is changed** — they are only consumed. **No existing SPEC modal is changed** — see the freeze in §4; the only modal file added is `SpecAnalysisFailedModal.tsx`.

---

## 7. What this plan explicitly does not do

- Does not modify, rebuild, or delete any existing SPEC modal (§4 freeze). The feedback items that would require it are parked in §9a.
- Does not delete the `:specId/processing` route (kept as a deep-link fallback pending Q1).
- Does not remove the `PageBackButton` from the legacy workspace pages (products, substitution, submittals, deliver-back, ask, guide-specs) — breadcrumb rules must land first.
- Does not touch `SpecReviewPage` / baseline comparison, `SpecGuideSpecsPage`, `SpecSubmittalsPage`, `SpecSubstitutionPage`, `SpecAskPage`, or `SpecDeliverBackPage` beyond breadcrumb additions. No comments on the board target them.
- Does not implement #24 (engineer/contractor uploads their own master spec). Recorded as future scope: it turns the master spec from an ASC-published constant into a per-project document, which changes the wizard, the comparison model, and the seeds. Worth a separate PRD.
- Does not remove versioning of customer SPEC documents — only the browsable history UI.
- Does not touch design tokens, the theme, or the Figma file.

---

## 8. Risks

| Risk | Mitigation |
|---|---|
| Removing the processing destination could leave a user with no feedback after upload | The dashboard renders in a processing state with the strip and skeletons; the listing carries the pending region; the fallback route still resolves |
| The six-way action grouping needs a data field that does not exist | Derived deterministically from existing fields in the repository layer; no seed rewrite in the first slice; validated by `specAnalysisSeed.test.ts` |
| Deleting the reanalysis route breaks deep links and tests | Route removal plus test update in the same slice; `specDocumentPrimaryPath` redirects the affected statuses |
| Removing "Exact source" before scroll-to-source works would lose information | 4a lands before 4c; verified manually |
| Matt's "kill this wireframe altogether" may have referred to the next frame | Flagged as Q1; the phase is structured so 2a/2b are safe regardless and only 2c changes the destination |

---

## 9. Open questions — confirm before implementing Phase 2 and Phase 5

**Q1 (blocking for 2c).** On the processing screen thread, Matt wrote "maybe we just kill this wireframe altogether", but the sentence before it references "the next wireframe". Confirm: should upload land the user in the analysis dashboard with an in-progress strip (this plan's reading), or keep a dedicated processing page with BOM chrome and only remove the setup card?

**Q2 (non-blocking).** Removing `Edit proposal` from the right pane assumes inline document editing is enough. Confirm that accepting a recommendation then editing the inserted text in the document is the intended interaction.

**Q3 (non-blocking).** Label: `Add to Submittal Package` (existing repo and part-detail label) or `Add to Submittal Manager` (Matt's wording)?

**Q4 (blocking for 1f).** Miloš's thread question is still unanswered: does "sub-projects" mean the BOM project listing, and is the SPEC listing meant to mirror it minus the Get started cards? This plan assumes yes.

**Q5 (non-blocking).** Does accepting a generated recommendation count as a "manual edit" that forces re-analysis, or only free-text edits by the user? This plan assumes only free-text edits.

**Q6 (blocking for §9a only).** The modal freeze parks four of Matt's items. Should any of them be unfrozen now, or do they wait for a dedicated modal pass?

---

## 9a. Deferred by the modal freeze

These are real requests from the board that this plan does **not** implement, because each one requires editing the inside of an existing modal. They are listed so nothing is lost.

| # | Request | Modal that would change | Cost if deferred |
|---|---|---|---|
| 1 | `Download all` alongside `Download` | `SpecDownloadMasterModal.tsx` | Low — the modal already lists all three master specs; only the bulk convenience is missing |
| 23 | Drop the master-spec version `Select` | `SpecDownloadMasterModal.tsx` | Medium — the UI still implies multiple published versions, which contradicts Matt |
| 23 | Drop the "Master SPEC version" block | `SpecUploadNewVersionModal.tsx` L317–333 | Medium — same contradiction inside the W02 flow |
| 7 | Remove the `Version history` mention from the alert copy | `SpecUploadNewVersionModal.tsx` L224 | Low — copy points at an entry point that no longer exists after 1b |
| 29 | Adopt the shared `ProjectRequiredModal` / `AddToBomModal` flow wholesale | `SpecProjectOutputModal.tsx` | Medium — the page-level CTA reduction still lands in Phase 5, but the modal itself stays SPEC-specific rather than identical to part search |

Each is a small, isolated edit whenever the freeze lifts. None of them blocks any other phase.

---

## 10. Suggested delivery order

1. Phase 1 — copy, version-history removal, master-spec single version, listing parity. Small, no structural risk, immediately visible to Matt.
2. Phase 6 — confidence de-exposure. Small and independent.
3. Phase 2 — interstitial page removal. The big one; needs Q1 answered.
4. Phase 3 — dashboard consolidation. Depends on 2e for the completion card.
5. Phase 4 — editor pane.
6. Phase 5 — export destinations. Needs Q3.

Each phase is a separate reviewable slice; do not batch them.
