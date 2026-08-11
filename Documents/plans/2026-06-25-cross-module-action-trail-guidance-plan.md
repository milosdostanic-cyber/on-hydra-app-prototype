# Cross-Module Action Guidance ("Action Trail") — Implementation Plan

**Date:** 2026-06-25
**Source PRDs:** `Hydra-PRD - Cross-Module Guidance` + `Hydra-Intake - X-Module Guidance` (ConnectED Phase 2 — UATL-348)
**Also incorporates:** `Connected — Global Notifications` (user & task flow diagram — one catalog route, one part page, four destinations, deferred notification system)
**Status:** **Implemented in prototype (~85%)** — 2026-06-25 audit. Phases 1–4 largely done; Spec destination and polish items remain.

> **Important context before reading.** The two PRDs were written against the **production microfrontend (MFE) codebase** (`packages/on-hydra-frontend-core`, `apps/on-hydra-frontend-bom`, `apps/on-hydra-frontend-content`, Redux slices, iframe MFE boundaries, `companyName` multi-tenancy, RBAC). **This repository is the single-app prototype** (`on-hydra-app-prototype`): one Vite + React + Ant Design app, React Context + `useSyncExternalStore` + **`localStorage`** (Action Trail store) for cross-tab guidance state, React Router for navigation, **no Redux, no MFE iframes, no permission model, no company tenancy.**
>
> This plan **translates** the PRD requirements onto the prototype's real patterns. Wherever a PRD requirement depends on something that does not exist in the prototype (RBAC, multi-tenancy, real persisted BOM rows), it is called out explicitly in **Open Questions** rather than invented.

---

## 1. Short summary

When a user is on the unified part search/detail page and adds a part to **another module** — BOM, a Submittal package, **Spec**, or the Download Center — the only feedback today is a quick success message (toast/notification). If the user adds several parts and keeps searching, they later forget **where the parts went** and **how to get back to them**.

**Action Trail** adds a calm, non-blocking "breadcrumb of attention" that survives navigation:

1. A **number badge** appears on the destination module in the left sidebar (e.g. BOM shows `3`).
2. When the user opens that module, the **target sub-project** (BOM project / submittal package's project / download grouping) is **highlighted**.
3. When they open the sub-project, the **newly added rows** are **highlighted**.
4. The badge **clears when the user opens that module** (or clicks the existing "Go to packages"-style toast CTA); the **"New" tag** on the rows is gone on the next visit.

It never forces navigation and **persists until the module is opened** (the Global Notifications flow says it even survives logout — production concern; in this prototype it survives reloads via `localStorage`). Whether it can be **turned off in settings** (default ON) and whether a **1-week TTL** still applies are open questions, because the two PRDs disagree (see §5). Note: direct file downloads to the device show a **toast only — no badge**; only sending to a module/queue creates one.

---

## 1b. What the "Global Notifications" flow diagram adds / changes

The flow diagram refines the same feature into an explicit **3-level notification model** and clarifies several rules. Key points and how they affect this plan:

- **Four destinations, not three.** Actions on the part page are: **Add to BOM**, **Add to Submittal**, **Add to Spec**, **Send to Download Center** (plus direct **Download Revit/STEP/PDF**). → **Spec is now in scope** for guidance. ⚠️ In this prototype **Add to Spec does not exist yet** (no action in `ActionsPanel`/`useVariantActionFlows`; only the `spec` / `sales-brace` stub `SalesBraceModule`). See Open Question 9.
- **Direct file download ≠ badge.** "Download Revit / STEP / PDF" downloads to the device → **toast only, no module badge**. Only **Send to Download Center** (the queue) creates a badge. → This changes §2.2: register a `content` entry **only** for the *queue* action, **not** for the quick/direct download path (`execute('revit-quick')` and any direct download must stay toast-only).
- **The badge is an "unseen log", write-only.** Each add appends `{module, part, variant, seen=false}`; it **never reads existing module contents**. → Confirms the store design: we record what was added, we do **not** diff against module data. Badge count = number of unseen log rows for that module.
- **Three signal levels:**
  1. **Toast (immediate, auto-dismiss)** — the existing prototype toasts/messages (FR-8, keep).
  2. **Nav badge + pulse (pulses once)** — sidebar badge; should **pulse once** on arrival, then stay static.
  3. **Stay on the part page (no forced redirect)** — user keeps adding in one pass.
- **"Already in the module" edge case.** If the part is already in that module: toast says **"Already in BOM"**, the action pill shows **"In BOM ✓"**, and **no new badge** is added. → New behaviour to add to the add-flows (`usePartActionFlows` / `useVariantActionFlows` + `ActionsPanel` pill state).
- **Dismissal is now concrete (resolves prior open question).** **Opening the module clears the badge** (marks its log rows `seen`). Item-level: a **"New" tag** appears on the newly arrived rows on first visit and is **gone next visit**. → Simpler than the earlier "viewport/dwell" question: dismissal = **on module open** for the badge; item "New" tag clears after that first visit.
- **Persistence — CONFLICT to resolve.** This diagram says the badge **persists across sessions, survives logout, and is server-side** ("only opening the module clears it"). The earlier PRD says **frontend session state with a 1-week TTL** and a user on/off toggle. These disagree. → See Open Question 10. For the **prototype** (no auth, no backend): use `localStorage` so it survives reloads/tabs; "survives logout / server-side" is **not applicable** to the prototype and is a production concern.
- **Launch migration.** The log starts **empty**; only post-launch additions count. → Trivial for the prototype (store starts empty); note only.
- **No default variant / pre-select exception.** Variant dropdown stays on "Select a variant" unless arriving via a module link with a matched SKU. This is part-page behaviour, largely already reflected in the prototype's variant gating; **not a guidance concern**, noted for completeness.

---

## 2. What needs to be done (concrete tasks, mapped to this repo)

### 2.1 New shared guidance store (the "brain")
Create a session-backed store that records guidance entries and exposes read/update helpers. Model it **exactly** on the existing prototype stores:
- Template files: `src/context/SubmittalDraftContext.tsx` and `src/search/revitDownloadQueue.ts` (both use `useSyncExternalStore` + `sessionStorage` + a module-level listener `Set`).
- **New file:** `src/context/ActionTrailContext.tsx` (provider + `useActionTrail()` hook).
- **New file (optional helper):** `src/context/actionTrailStore.ts` if the external-store plumbing is large enough to separate from the provider (mirrors how `revitDownloadQueue.ts` keeps the store standalone).

A **guidance entry / unseen-log row** holds (FR-1 + the "Global Notifications" `{module, part, variant, seen=false}` shape): `id`, `module` (`'bom' | 'submittal' | 'spec' | 'content'`), `subProjectId` (BOM project id / submittal package id / spec section / download grouping id), `subProjectLabel`, `partKey`, `variantKey?`, `itemIds: string[]`, `partCount`, `createdAt`, `seen: boolean`. The store is **write-on-action / never reads module contents** — count = unseen rows per module.

Helpers the store must expose:
- `registerEntry(entry)` — FR-1.
- `countForModule(module)` — aggregated part count for the badge — FR-2 / FR-6.
- `entriesForModule(module)` and `pendingSubProjectIds(module)` — FR-3.
- `pendingItemIds(module, subProjectId)` — FR-4.
- `markSubProjectViewed(module, subProjectId)` / `markEntryViewed(entryId)` / `consumeForModule(module, subProjectId?)` — FR-5 / FR-9.
- `pruneExpired()` — FR-11 (drop entries older than 7 days, called on app init + on tab focus).
- Internal multi-tab sync — FR-12 (see 2.6).

Wire the provider into `src/main.tsx` alongside the other providers (`ActiveProjectProvider`, `BomWorkspaceProvider`, `SubmittalPackagesProvider`).

### 2.2 Register entries at the real add-success points (FR-1, FR-8)
Hook registration into the **existing** add flows — **without** removing the current toasts/messages (FR-8, additive). **Only commit-to-module actions create a badge; direct device downloads stay toast-only** (per the flow diagram):
- `src/search/usePartActionFlows.tsx`
  - `finishBomAdd()` → register `module: 'bom'`.
  - `finishSubmittalAdd()` → register `module: 'submittal'` (sub-project = `packageId`).
  - `execute('revit-queue')` (**Send to Download Center / queue**) → register `module: 'content'`.
  - `execute('revit-quick')` (**direct download to device**) → **do NOT register** — toast only.
- `src/search/useVariantActionFlows.tsx`
  - `finishBomAdd()` → register `module: 'bom'`.
  - `queueDrawingFiles()` (**queued for Download Center**) → register `module: 'content'`. (A truly direct "download now" drawing path, if added, stays toast-only.)
- **Add to Spec** (`module: 'spec'`) → register **once Add to Spec exists** as an action; not yet present (Open Question 9).
- **"Already in module" edge case:** before registering, check the relevant store (`useBomWorkspaceRows`, `useSubmittalPackages`) for the part. If already present → show **"Already in …"** toast, set the action pill to **"In … ✓"**, and **skip registration** (no new badge).
- These flows already receive the identifiers needed (`bomProjectId`, `packageId`, `projectId`, `sku`, `partKey`), so registration is a single call inside each existing `finish*`/`execute` function.

> The unified part surface that triggers these is already in the prototype: `src/search/UnifiedSearchResultsPage.tsx`, `src/search/UnifiedPartDetailPage.tsx`, and `src/search/components/ActionsPanel.tsx`. No new trigger surface is needed.

### 2.3 Left-nav module badge (FR-2, FR-6)
- File: `src/shell/AppShellSidebar.tsx`.
- `Badge` is already exported from the UI barrel (`src/ui/antd.ts`).
- Wrap the affected module labels (`bom`, `submittal`, `spec`, `content` in `primaryMenuItems`) with `<Badge count={countForModule(key)} />`. Badge must render in both expanded and collapsed states (PRD §UX "Collapsed nav") — verify it shows on the icon when collapsed.
- Badge count = **total unseen parts added** (PRD Q-1 resolution + "unseen log"), not number of destinations.
- **Pulse once on arrival** (flow diagram Level 2): play a single pulse on the badge when its count increases, then keep it static. Use a token-driven, `prefers-reduced-motion`-aware animation (no raw values).

### 2.4 Sub-project highlight (FR-3, AC-2/AC-5)
Highlight every pending sub-project when the user opens a module. Multiple simultaneous highlights must be supported (FR-6, Q-8 = YES).
- **BOM:** project list table in `src/bom/pages/BomSiteProjectsPage.tsx` — highlight rows whose BOM project id is in `pendingSubProjectIds('bom')` (use AntD Table `rowClassName`).
- **Submittal:** package list in `src/submittal/SubmittalPackagesPage.tsx` — highlight `PackageCard`s (`src/submittal/components/PackageCard.tsx`) whose `pkg.id` is pending.
- **Download Center:** `ContentModule` in `src/shell/ProjectModuleStubs.tsx` — highlight the latest undownloaded grouping in the download-history `List` (PRD Q-6).

### 2.5 Item-level "New" tag + highlight, dismiss-on-open (FR-4, FR-5, AC-3/AC-4/AC-9)
Show a **"New" tag** (AntD `Tag` — reuse `src/bom/components/BomTags.tsx` patterns / barrel `Tag`) on newly arrived rows, alongside the highlight treatment:
- **BOM workspace:** `src/bom/pages/BomWorkspacePage.tsx` — tag/highlight newly added rows.
- **Submittal package:** part rows inside `PackageCard` (`src/submittal/components/PackageCard.tsx`).
- **Download Center:** file rows in the history `List` (`ContentModule`).
- **Dismissal (resolved by the flow diagram):** **opening the module marks its log rows `seen` → badge clears.** The **"New" tag shows on the first visit and is gone on the next visit** (clear after the view unmounts / on next entry). This replaces the earlier viewport/dwell open question — call the relevant `consume`/`markViewed` helper on module open.

### 2.6 Cross-cutting requirements
- **Highlight visual (NFR-1, NFR-6):** create **one local, reusable highlight treatment** built only from existing tokens (e.g. `token.colorPrimaryBg` / `colorInfoBg` background flash, `token.colorPrimaryBorder` outline, `token.motionDurationSlow`). Must honour `prefers-reduced-motion` (swap the pulse for a static outline). No raw hex / px. This is a **new local prototype composition** (see Guardrails) — there is currently **no** pulse/highlight pattern anywhere in this repo.
- **Multi-tab sync (FR-12):** add a `storage` event listener (or `BroadcastChannel`) in the store so other tabs re-read `sessionStorage`/`localStorage` and re-emit. Note: the prototype currently uses `sessionStorage`, which is **per-tab** — to sync across tabs/windows this entry store likely needs `localStorage` + the `storage` event. Confirm in Open Questions.
- **TTL prune (FR-11):** `pruneExpired()` on provider mount and on `window` focus.
- **User preference toggle (FR-10):** no settings/preferences store exists yet. Add a minimal `actionTrailEnabled` boolean (default `true`) in the same store, plus a toggle control. **Where the toggle lives is an open question** (no settings page exists in the prototype).
- **Toast CTA consumes guidance (FR-9, AC-6):** the submittal success notification already renders a **"Go to packages"** button in `usePartActionFlows.finishSubmittalAdd`. Extend that button's `onClick` to call `consumeForModule('submittal', packageId)` before navigating.

---

## 3. Recommended implementation approach

**Reuse first, invent only the highlight treatment.**

| PRD concept (MFE) | Prototype equivalent to reuse |
|---|---|
| Redux guidance slice in `frontend-core` | New `ActionTrailContext` using the **existing** `useSyncExternalStore` + `sessionStorage` pattern from `SubmittalDraftContext.tsx` / `revitDownloadQueue.ts` |
| Shell `renderMenuItem` + `mfeNavConfig` badge | AntD `Badge` (already in `src/ui/antd.ts`) on `primaryMenuItems` in `AppShellSidebar.tsx` |
| BOM `highlightItemId` row pulse | **Net-new** local highlight composition (no such pattern exists here) applied via Table `rowClassName` / card class |
| Submittal `useSuccessfulAddToPackageToast` CTA | Existing `notification.success(... btn: "Go to packages")` in `usePartActionFlows.tsx` |
| Download Center slice + Floating button badge | Existing `useDownloadHistory` + `ContentModule` history `List` (queue adds only — **not** direct device downloads) |
| Add to Spec destination | `spec` sidebar key + `SalesBraceModule` (`/projects/:projectId/sales-brace`) — **blocked until Add to Spec action exists** (Open Question 9) |
| "Already in module" pill / toast | Add `In … ✓` pill state in `ActionsPanel.tsx`; reuse existing `message`/`notification` toasts |
| MFE iframe read API / context bridge | Not needed — single app; one React context is shared by shell + all pages |

**Phasing (each phase independently reviewable, per scope guardrails):**
1. **Store + registration** (2.1, 2.2) — entries are recorded; verify via console/devtools. No visible UI yet.
2. **Badge** (2.3) — visible count on sidebar.
3. **Highlights + dismiss** (2.4, 2.5, 2.6 highlight treatment) — sub-project + item highlight, clear on view.
4. **Cross-cutting** (2.6 TTL, preference toggle, multi-tab, toast CTA consume).

**Things that must be created new (and why):**
- `ActionTrailContext` store — there is no cross-module guidance state today.
- One local highlight CSS/style composition — no pulse/highlight pattern exists in the repo; built strictly from tokens, kept local to these screens, not promoted to a shared component.
- A preference toggle entry — no user-preferences store exists.

**Things that must NOT change:** shared/core components, design tokens, the existing success toasts/messages, unrelated screens, and the BOM/Submittal/Content data models beyond adding read-only highlight props.

---

## 4. User-friendly explanation (for product / non-technical stakeholders)

Right now, when you find a part and add it to your BOM, a submittal package, or your downloads, you get a quick pop-up that says "Added." If you're adding lots of parts in a row, those pop-ups come and go, and it's easy to lose track of **where everything ended up**.

After this work, the app gently keeps track for you:

- The sidebar will show a small **number** next to BOM, Submittal, or Download Center so you can see at a glance "I added 3 things over there."
- When you click into that area, the **right project/package will light up** so you don't have to hunt for it.
- When you open it, the **new parts you added will be highlighted** until you've seen them — then everything quietly goes back to normal.

It never interrupts you or drags you somewhere — you can keep searching and follow the trail whenever you want. You'll be able to **turn it off** if you prefer, and the reminders **clear themselves after a week** so nothing piles up. This matters because the whole point of the new connected experience is doing everything from one place — and people should always be able to find what they just did.

---

## 5. Open questions / unclear parts

1. **BOM add currently auto-navigates and does not persist a row.** → **RESOLVED in prototype.** `finishBomAdd` stays on search page, inserts row via `setWorkspaceRows`, registers Action Trail entry with `itemIds`.
2. **Multi-tab sync vs sessionStorage (FR-12).** → **RESOLVED.** Action Trail store uses `localStorage` + `storage` event listener in `actionTrailStore.ts`.
3. **Where does the on/off toggle live (FR-10)?** → **RESOLVED.** User menu in `AppTopBar.tsx` — "Action guidance" `Switch` (default ON).
4. **Dismissal trigger — RESOLVED by the Global Notifications flow.** The badge clears when the user **opens the module** (rows marked `seen`); the item "New" tag clears on the next visit. Plan now uses this; no longer an open question. (Earlier viewport/dwell ambiguity is dropped.)
5. **Download Center grouping target (PRD Q-6).** Resolution says "latest undownloaded grouping." The prototype's `ContentModule` shows a flat `useDownloadHistory` list, not grouped batches. Confirm whether to introduce a lightweight "latest batch" grouping for the highlight, or just highlight the newest rows.
6. **RBAC / permissions (FR-7) and multi-tenancy (NFR-4).** Neither exists in the prototype. Recommend marking FR-7 and NFR-4 **N/A for the prototype** and noting they are handled in production. Confirm.
7. **Submittal "sub-project" granularity.** PRD models Submittal as project → package → part. In the prototype, the sidebar `submittal` key is **project-scoped** (`/projects/:projectId/submittal`) and packages are the sub-projects. Confirm the badge counts parts across all packages of the active/last-scoped project and the highlight targets packages.
8. **Visual spec (PRD Q-5 / NFR-6).** No ConnectED Figma for guidance states yet. The highlight treatment will be built from existing tokens as a placeholder and should be revisited when Design delivers specs.
9. **Add to Spec is not implemented (new, from the flow diagram).** → **Decision: (a) wire only when Add to Spec ships.** Sidebar **no longer** shows a guidance tag on Spec until `registerEntry({ module: 'spec' })` exists. Store type still includes `'spec'` for future wiring.
10. **Persistence conflict — two PRDs disagree.** → **Prototype resolution:** `localStorage` (reload + multi-tab). **Both** persist-until-module-open **and** 7-day TTL (`pruneExpired` on mount + focus). Toggle default ON. Server-side / survives logout = production-only.
11. **Direct-download vs queue split.** → **CONFIRMED implemented.** Only `revit-queue` / `queueDrawingFiles` register `content`; `revit-quick` stays toast-only.

---

## 6. Implementation checklist

### Phase 1 — Guidance store + registration
- [x] Create `src/context/ActionTrailContext.tsx` (+ `actionTrailStore.ts`) using the `useSyncExternalStore` + storage pattern.
- [x] Define the `GuidanceEntry` type and all helpers listed in §2.1 (+ `newTagActive`, `enabled`).
- [x] Wire `ActionTrailProvider` into `src/main.tsx`.
- [x] Call `registerEntry` in `usePartActionFlows.tsx` (`finishBomAdd`, `finishSubmittalAdd`, `execute('revit-queue')` only).
- [x] Call `registerEntry` in `useVariantActionFlows.tsx` (`finishBomAdd`, `queueDrawingFiles`).
- [x] **Do NOT** register for `execute('revit-quick')` / direct device downloads (toast only).
- [x] Add **"Already in module"** check before register → toast "Already in …" + pill "In … ✓", skip registration.
- [ ] **Verify:** manual smoke from `/search/parts/:partId` (see §7).

### Phase 2 — Left-nav badge
- [x] In `AppShellSidebar.tsx`, render guidance tag with unseen count on `bom` / `submittal` / `content` (`ActionTrailMenuGuidanceTag`; Volcano `Tag`, not Ant `Badge`).
- [x] Pulse the tag **once** when count increases (`action-trail-badge-pulse` + `prefers-reduced-motion`).
- [x] Collapsed + expanded sidebar variants.
- [ ] **Verify (AC-1):** manual smoke.

### Phase 3 — "New" tag + highlights + dismiss-on-open
- [x] Local token-only highlight in `src/search/actionTrailStyles.ts` (static outline/bg; badge pulse only).
- [x] BOM project list highlight in `BomSiteProjectsPage.tsx` (`onRow` style).
- [x] Submittal package highlight in `SubmittalPackagesPage.tsx` / `PackageCard.tsx`.
- [~] Download Center: **item-level** highlight in `ContentModule` — no batch/grouping highlight (PRD Q-6 still open).
- [x] Item-level **"New" tag** + highlight: BOM workspace, submittal parts, download rows.
- [x] Dismiss = module open → `consumeForModule`; unmount → `clearNewTagsForModule`.
- [ ] **Verify (AC-2–AC-5, AC-9):** manual smoke.

### Phase 4 — Cross-cutting
- [x] `localStorage` persistence (`hydra-action-trail`).
- [x] `pruneExpired()` on mount + window focus (7-day TTL).
- [x] Preference toggle in `AppTopBar.tsx` user menu.
- [x] Multi-tab sync via `storage` event (no `BroadcastChannel`).
- [x] Submittal "Go to packages" toast CTA calls `consumeForModule('submittal', packageId)`.
- [ ] **Verify (AC-6, AC-7a/b, FR-12):** manual smoke.

### Final verification
- [ ] `npx tsc --noEmit` passes.
- [ ] Manual E2E smoke (see §7).
- [x] No design tokens or shared/core components modified.
- [x] Existing success toasts/messages preserved (additive).
- [x] Highlight uses tokens only; badge pulse honours reduced motion.

---

## Affected files (reference)

**New:**
- `src/context/ActionTrailContext.tsx`
- `src/context/actionTrailStore.ts`
- `src/search/actionTrailStyles.ts`
- `src/search/components/ActionTrailMenuGuidanceTag.tsx`
- `src/search/components/ActionTrailNewTag.tsx`

**Edited:**
- `src/main.tsx` — `ActionTrailProvider`
- `src/search/usePartActionFlows.tsx`, `src/search/useVariantActionFlows.tsx` — register + CTA consume + duplicate checks
- `src/search/components/ActionsPanel.tsx` — "In BOM" / "In Submittal" pill state
- `src/shell/AppShellSidebar.tsx` — guidance tag on `bom` / `submittal` / `content` only (Spec deferred)
- `src/shell/AppTopBar.tsx` — action guidance toggle
- `src/bom/layout/BomLayout.tsx` — `useActionTrailModuleLifecycle('bom')`
- `src/bom/pages/BomSiteProjectsPage.tsx`, `src/bom/pages/BomWorkspacePage.tsx`
- `src/submittal/SubmittalPackagesPage.tsx`, `src/submittal/components/PackageCard.tsx`
- `src/shell/ProjectModuleStubs.tsx` (`ContentModule`)
- `src/index.css` — `action-trail-badge-pulse` keyframes
- *Spec destination — deferred until Add to Spec action exists*

## 7. Implementation status (2026-06-25 audit)

| FR | Status | Notes |
|----|--------|-------|
| FR-1 Registration | 🟡 | BOM, Submittal, Content done; Spec not |
| FR-2 Nav badge | ✅ | Volcano `Tag`, collapsed + expanded |
| FR-3 Sub-project highlight | 🟡 | BOM + Submittal; Content item-only |
| FR-4 Item highlight + New | ✅ | Static outline, not pulse |
| FR-5 Dismiss on view | ✅ | Module mount/unmount lifecycle |
| FR-6 Multiple entries | ✅ | Array store, aggregated counts |
| FR-7 Permissions | ❌ N/A | No RBAC in prototype |
| FR-9 Toast CTA | ✅ | Submittal "Go to packages" only |
| FR-10 Toggle | ✅ | `AppTopBar` user menu |
| FR-11 TTL | ✅ | 7 days, prune on mount/focus |
| FR-12 Multi-tab | ✅ | `localStorage` + `storage` event |
| NFR-1 a11y | ✅ | `aria-live` via `ActionTrailLiveRegion`; reduced motion on badge + highlight |

**Deviations from original plan:**
- Nav uses `ActionTrailMenuGuidanceTag` (Volcano `Tag`) instead of Ant `Badge`.
- Row/card highlights are **static** primary bg + outline; only the nav tag **pulses once**.
- `GuidanceEntry` adds `newTagActive` for two-phase dismiss (badge → highlight → clear on next visit).
- Spec removed from sidebar trail keys until Add to Spec ships.

**Remaining polish (optional):**
1. ~~`aria-live` for badge count changes.~~ Done (`ActionTrailLiveRegion`).
2. ~~Row/sub-project one-shot pulse animation.~~ Done (`action-trail-highlight-pulse`).
3. ~~Download Center batch/group highlight.~~ Card-level highlight when new queue items pending.
4. Wire Spec when Add to Spec action exists.
5. ~~Remove or use dead export `useActionTrailHighlightActive`.~~ Wired in `PackageCard`.
6. Manual E2E smoke + `tsc --noEmit`.

**Smoke test checklist:**
1. Part detail → Add to BOM → sidebar BOM tag shows count; stay on search.
2. Open BOM → tag clears; project row highlights; open workspace → row + "New".
3. Leave BOM → re-enter → no "New" tags.
4. Repeat for Submittal + Download queue; confirm `revit-quick` creates no tag.
5. Toggle off in user menu → no tag/highlight; toasts still fire.
6. Second browser tab → add in tab A → tag updates in tab B.

## Guardrails (per workspace rules)
- Reuses existing pattern: `useSyncExternalStore` stores, AntD `Badge`, existing add-success flows and toasts.
- One **local** new composition (the highlight treatment) built from existing tokens; **not** a new shared component, **not** a new token.
- No shared/core component or token is modified. Changes stay local to the listed screens/flows.
- All spacing/color/motion via `theme.useToken()` — no raw literals.
