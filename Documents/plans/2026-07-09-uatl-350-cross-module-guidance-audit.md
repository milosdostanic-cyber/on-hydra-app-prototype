# UATL-350 — Cross-Module Guidance Audit

**Date:** 2026-07-09  
**Ticket:** [UATL-350 — Create prototype](https://ooden.atlassian.net/browse/UATL-350) (parent: UATL-349 X-Module Guidance - Design)  
**Figma board:** [Unified Search — ASC Connected · Frame 18](https://www.figma.com/design/usBJj4PPK8naOgJdi31Lgt/Unified-Search---ASC-Connected?node-id=419-18409) (`419:18409`)  
**User flow (PRD):** [Connected — Global Notifications](https://www.figma.com/design/usBJj4PPK8naOgJdi31Lgt/Unified?node-id=55-1102) (`55:1102`)  
**PRD:** [Cross-Module Guidance](https://ooden.atlassian.net/wiki/spaces/Hydra/pages/2078605317/PRD+-+Cross-Module+Guidance)  
**Repo baseline:** `on-hydra-app-prototype` Action Trail implementation + uncommitted WIP on part-detail / destination pickers  

---

## Executive summary

Cross-module guidance (**Action Trail**) is **largely implemented** (~85% per the June plan), but **Matt Pettit’s UATL-350 feedback (2026-07-01) is not fully addressed**. Three product corrections are still open; Figma Frame 18 documents base screens but **does not yet show guidance states** (sidebar count, row highlight, “New” pill).

| Area | Status |
|------|--------|
| Core store + sidebar Volcano count tag | ✅ Done |
| BOM L2 project highlight + L3 row highlight + left “New” column | ✅ Done |
| BOM badge persists until item viewed (L3) | 🟡 Code intent fixed; **needs smoke test** (Jam link in ticket) |
| Part detail — re-add to another subproject | ❌ **Gap** — pickers still block “already contains” destinations |
| Submittal — row-only highlight (no package chrome) | ❌ **Gap** — package card still highlighted + package “New” tag |
| Submittal — “New” pill left-aligned like BOM | ❌ **Gap** — tag is inline after part name |
| Submittal — re-rank packages by last modified | ✅ Done (`updatedAt` sort on add) |
| Add to Spec destination | ❌ Not implemented (deferred in plan) |
| Download Center guidance | 🟡 Item rows OK; module clears badge on open (differs from BOM L3 rule) |

**Bottom line:** Ship blockers for UATL-350 are Matt’s three feedback bullets. Everything else is polish, PRD scope, or design deliverables missing from Figma Frame 18.

---

## Sources compared

| Source | What it defines |
|--------|-----------------|
| **UATL-350 comment (Matt, 2026-07-01)** | Authoritative acceptance criteria for this ticket |
| **Figma `419:18409` (Frame 18)** | Three reference screens: Part detail 3.1, Hub 1.1, Workspace 3.2 — **layout only**, no guidance overlays |
| **Figma `55:1102` (User Flow)** | 3-level notification model; original rule “badge clears on module open” — **superseded by Matt’s BOM refinement** |
| **`Documents/plans/2026-06-25-cross-module-action-trail-guidance-plan.md`** | Implementation plan + file list |
| **Code** | `src/context/actionTrailStore.ts`, flows in `usePartActionFlows` / `useVariantActionFlows`, destination modals, `PackageCard`, `BomWorkspacePage`, etc. |

---

## 1. Matt’s feedback vs prototype

### 1.1 Part detail — user must be able to add the same part again (multiple subprojects)

**Requirement (ticket):** Adding a part to a module once must **not** prevent adding it again. Users have many subprojects (BOM projects, submittal packages). Remove the blocking state; keep the **+** action and subproject picker.

| Check | Status | Evidence |
|-------|--------|----------|
| Action buttons stay enabled after one add | ✅ | `ActionsPanel` — all actions stay `+` buttons; no “In BOM ✓” pill in current code |
| User can open destination picker again | ✅ | `requestAction` always opens modal / gate |
| Picker allows choosing **another** subproject | 🟡 Partial | Other BOMs/packages remain selectable |
| Picker does **not** disable destinations that already contain the part | ❌ | `AddToBomModal`, `ProjectRequiredModal`, `AddToPackageModal` set `disabled: true` + “Already contains item” |
| Add flow does not short-circuit with “Already in …” when targeting a **different** subproject | ✅ | Duplicate check is per `bomProjectId` / `packageId` |
| Add flow allows repeat add across subprojects without friction | ❌ | Disabled radio/options + OK button disabled when selection already contains item |
| Same-SKU guard within **one** BOM project | ✅ (intentional) | `isSkuInBomRows` — product rule, not cross-subproject block |

**Files to change (when implementing):**

- `src/bom/components/AddToBomModal.tsx` — remove `bomAvailability` disable logic (keep duplicate guard only on submit to same BOM if product still wants that)
- `src/shell/ProjectRequiredModal.tsx` — remove `bomAvailability` / `packageAvailability` disable
- `src/submittal/components/AddToPackageModal.tsx` — remove `packageAvailability` disable
- `src/search/usePartActionFlows.tsx` / `useVariantActionFlows.tsx` — align toast copy; never block opening picker

**Note:** Matt’s Jira screenshot (“In Submitted” + checkmark) does **not** match current `ActionsPanel` code — likely an older build or mock. The real blocker today is **destination picker disable**, not the action button itself.

---

### 1.2 Submittal packages — highlight **part row only** (match BOM)

**Requirement (ticket):**

- Highlight only the **part row**, not the whole package card.
- Match BOM: row highlight + **“New”** pill.
- Re-rank packages so most recently modified is on top (so row-only highlight is enough).
- **Left-justify** the “New” pill like BOM.

| Check | Status | Evidence |
|-------|--------|----------|
| Package list sorted by `updatedAt` desc | ✅ | `SubmittalPackagesContext.packagesForProject` |
| `updatedAt` bumped when part added | ✅ | `touch()` in `addPartToPackage` |
| Package **card** highlight | ❌ Should remove | `PackageCard` — `actionTrailHighlightStyle(token, highlighted)` on `<Card>` |
| Package-level **“New”** tag on title | ❌ Should remove | `ActionTrailSubProjectNewTag` in card title |
| Part **row** background highlight | ❌ Missing | Submittal `Table` has no `onRow` → `actionTrailTableRowProps` (BOM workspace has this) |
| Part **“New”** pill | 🟡 Wrong placement | `ActionTrailNewTag` after part name link, not dedicated left column |
| BOM reference: dedicated first column for “New” | ✅ BOM only | `BomWorkspacePage` — `key: 'actionTrail'`, width 56 |

**Files to change:**

- `src/submittal/components/PackageCard.tsx` — remove card-level highlight + `ActionTrailSubProjectNewTag`; add table column or `onRow` highlight mirroring `BomWorkspacePage`

---

### 1.3 BOM — sidebar count persists until user reaches the added part

**Requirement (ticket):** Numerical count on the BOM menu item must persist **until** the user navigates all the way to the **actual part** in the respective BOM subproject.  
**Jam:** [jam.dev/c/2909cda1-d9df-45dd-8f7c-feae005caad6](https://jam.dev/c/2909cda1-d9df-45dd-8f7c-feae005caad6)

| Level | Expected (Matt) | Current code | Status |
|-------|-----------------|--------------|--------|
| L1 — Sidebar count | Stays until L3 | `countForModule` → entries where `!seen` | 🟡 |
| L2 — Open BOM / project list | Count **still visible** | `useActionTrailModuleLifecycle('bom')` calls `activateModuleGuidance` only (does **not** set `seen`) | ✅ |
| L2 — Project row highlight | OK to highlight | `BomSiteProjectsPage` — `unseenSubProjectIds` + row style | ✅ |
| L3 — Open workspace, see part | Count clears when part is “found” | `markItemViewed('bom', …)` only on **Figure** link click (`bomWorkspaceColumns.tsx`), not on merely opening workspace or scrolling to highlighted row | 🟡 |
| Toast “Go to packages” early consume | Should not clear BOM-style | Submittal toast does not call `consumeForModule` | ✅ (submittal) |

**Interpretation gap:** “Navigate to the actual part” could mean (a) open workspace and see highlighted row, or (b) click into the part/figure. Code today implements **(b)** via `markItemViewed` on figure link only. Confirm with product if row visibility / row click should also clear the badge.

**Verification needed:** Run Jam scenario on current branch — comment in `ActionTrailContext` says *“L1 badge clears only on L3 (`markItemViewed`)"* which matches Matt’s ask; ticket may describe **pre-fix** behaviour.

---

## 2. Figma Frame 18 (`419:18409`) vs prototype

Frame 18 is a **3-up comparison board**, not a full guidance spec.

| Frame | Figma name | Prototype route | Parity |
|-------|------------|-----------------|--------|
| `412:1316` | 3.1 — Part detail · No variation selected | `/search/parts/:partId` (`UnifiedPartDetailPage`) | 🟡 Layout largely aligned: left product column + right sticky variations/actions rail. WIP diff improves `VariantSelectSection` / `ActionsPanel`. **No guidance overlay in Figma.** |
| `412:9109` | 1.1 — Hub · Project List | `/bom` hub (`BomSiteProjectsPage`) | 🟡 Table, filters, quick actions match. **Figma does not show sidebar guidance tag** on BOM. |
| `427:18520` | 3.2 — Workspace · Main (In progress) | `/bom/projects/:id/workspace` (`BomWorkspacePage`) | 🟡 Workspace table structure matches. **Figma does not show “New” column or row highlight.** |

### Figma gaps (design deliverables still missing)

These are **not** in Frame 18 but are required for full parity:

1. **Sidebar** — Volcano guidance tag on BOM / Submittal / Download Center (`ActionTrailMenuGuidanceTag` exists in code; Figma `menu__item → show guidance tag` referenced in code comment).
2. **BOM project list** — highlighted row + “New” on project name (code has this; Figma frame does not).
3. **BOM workspace** — left “New” column + row tint (code has this; Figma frame does not).
4. **Submittal packages** — row highlight + “New” pill (Matt specified; neither Figma nor code correct yet).
5. **Part detail after add** — no “completed / In Submittal” lock state in Figma 3.1 (aligns with Matt: keep + picker).

### Figma User Flow (`55:1102`) vs Matt feedback

| User Flow rule | Matt / UATL-350 | Prototype today |
|----------------|-----------------|-----------------|
| Badge clears when user **opens the module** | BOM count persists until **part** in subproject | BOM: `seen` only on `markItemViewed` — **closer to Matt** |
| “Already in module” → pill “In BOM ✓”, no badge | **Remove** re-add blocking; keep + picker | Picker disable + toasts; no pill on actions |
| Four destinations incl. **Spec** | Not in UATL-350 comment | Spec stub only; no `registerEntry({ module: 'spec' })` |

---

## 3. Additional gaps (beyond Matt’s three bullets)

### 3.1 Still open from June implementation plan

| Item | Status | Notes |
|------|--------|-------|
| Add to Spec action + guidance | ❌ | `SalesBraceModule` stub; no part-detail action |
| Download Center badge dismiss | 🟡 | `content` module calls `consumeForModule` on open — badge clears on L1, not L3 |
| Submittal toast CTA `consumeForModule` | ❌ Not wired | Plan listed it; `usePartActionFlows.finishSubmittalAdd` navigates only |
| Manual E2E + `tsc --noEmit` sign-off | ❌ | Plan checklist still open |
| `aria-live` / pulse animations | ✅ | Done per plan |

### 3.2 Behaviour inconsistencies to resolve

| Topic | Issue |
|-------|--------|
| **BOM L2 “New” on project row** | `ActionTrailSubProjectNewTag` uses `shouldShowSubProjectNewTag` (`!seen`). Matt did not ask to remove this for BOM; OK. |
| **Submittal L2 package “New”** | Same component on package title — **conflicts with Matt** (remove for submittal). |
| **Duplicate part in same package** | `addPartToPackage` silently skips if `partKey` exists — OK for data model; picker should still allow **other** packages. |
| **Direct download vs queue** | ✅ `revit-quick` does not register trail; queue does. |
| **Action guidance toggle** | ✅ `AppTopBar` user menu |
| **7-day TTL** | ✅ `pruneExpired` on mount/focus |

### 3.3 Uncommitted WIP (git status)

Local changes touch part-detail and destination flows (`UnifiedPartDetailPage`, `VariantSelectSection`, `AddToBomModal`, `BomDestinationFields`, etc.) but **do not** remove picker disable logic or fix submittal row highlight. Treat WIP as layout/flow polish, **not** UATL-350 acceptance.

---

## 4. Recommended implementation order

1. **Submittal row-only guidance** — highest visual mismatch with Matt’s screenshot; mirror `BomWorkspacePage` table patterns.
2. **Remove destination “Already contains item” disable** — unblocks multi-subproject adds (keep same-BOM SKU guard on submit if required).
3. **Smoke-test BOM badge lifecycle** — Jam scenario; adjust `markItemViewed` trigger if product wants row view vs figure click.
4. **Figma** — add guidance states to Frame 18 (or sibling frames): sidebar tag, BOM workspace row, submittal row-only.
5. **Housekeeping** — Spec deferred; Download Center dismiss rule; E2E checklist; `tsc`.

---

## 5. Acceptance checklist (UATL-350)

Use this for ticket closure:

- [ ] From part detail, add part to BOM project A → add **same part** to BOM project B without blocked picker options.
- [ ] From part detail, add to submittal package A → add **same part** to package B (or new package) without blocked picker.
- [ ] After submittal add, sidebar submittal count increases; opening packages page does **not** highlight whole package card.
- [ ] Modified package floats to top; only the new **part row** is highlighted with left “New” pill.
- [ ] After BOM add, sidebar BOM count stays when opening BOM hub; count decreases only after reaching the added line in the correct workspace (confirm exact interaction with PM).
- [ ] Action guidance toggle off → no tags/highlights; toasts still work.
- [ ] `npx tsc --noEmit` passes.

---

## 6. Key file map

| Concern | Files |
|---------|--------|
| Trail store | `src/context/actionTrailStore.ts`, `ActionTrailContext.tsx` |
| Registration | `src/search/usePartActionFlows.tsx`, `useVariantActionFlows.tsx` |
| Sidebar tag | `src/search/components/ActionTrailMenuGuidanceTag.tsx`, `AppShellSidebar.tsx` |
| BOM L2/L3 | `BomSiteProjectsPage.tsx`, `BomWorkspacePage.tsx`, `bomWorkspaceColumns.tsx` |
| Submittal | `PackageCard.tsx`, `SubmittalPackagesPage.tsx`, `SubmittalPackagesContext.tsx` |
| Re-add blocking | `AddToBomModal.tsx`, `ProjectRequiredModal.tsx`, `AddToPackageModal.tsx` |
| Highlight styles | `src/search/actionTrailStyles.ts`, `ActionTrailNewTag.tsx` |

---

*Audit performed against repo state 2026-07-09. Implementation pass 2026-07-09 — see §7.*

---

## 7. Implementation pass (2026-07-09)

| Matt feedback item | Status | Change |
|--------------------|--------|--------|
| Re-add to another subproject | ✅ | Removed picker disable in `AddToBomModal`, `ProjectRequiredModal`, `AddToPackageModal`; submit-time duplicate guard unchanged |
| Submittal row-only highlight | ✅ | `PackageCard` — no card highlight / package “New”; left column + `onRow` highlight |
| BOM badge until L3 | ✅ | `markSubProjectViewed` on workspace open; `seen` decoupled from `newTagActive` for row tags |
