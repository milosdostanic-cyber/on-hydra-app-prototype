# Progressive Project Commitment — Page Documentation

> Source of truth for redesigning the `/exploration` page.
> Documents only what is currently visible on the page; nothing is invented.
> Source markup: `src/shell/exploration/progressive-project-commitment-body.html`
> Container: `src/shell/ExplorationPage.tsx` (rendered inside the standard Hydra app shell).

---

## 1. Page Summary

- **What this page is** — A long-form, scrollable proposal/exploration document titled **"Progressive Project Commitment — proposed flow"**. It lives inside the Hydra app shell at `/exploration` and is a single-page wireframe + narrative artifact.
- **What the proposed flow seems to solve** — How users in **ASC ConnectED** should move from open exploration (no project) to working inside a project, without being forced to commit to a project up front. It defines when a project becomes required, how that requirement is presented, and how selections carry into the project.
- **Likely audience** — Internal: product, design, and engineering. The page itself states "Product and engineering can adopt, adapt, or challenge any step independently."
- **User/business goal of the page** — Align the team on a single, coherent flow for project commitment so that:
  1. First-time users are not forced into project creation before they get value.
  2. The "hard gate" for projects is consistent and well-framed.
  3. Selections made before a project exists are preserved into the chosen project.
  4. Users can move between projects (and back to "no project") without losing their place.
- **Type of page** — UX flow documentation / internal design artifact (a static, narrated wireframe doc), embedded inside the live app shell. It is **not** a product page and **not** an interactive prototype — the wireframes are SVG illustrations, not real UI.

---

## 2. Current Page Purpose

- **Why the flow exists** — To prevent the friction of "create a project first" before users have any working set, while still requiring a project at the moment a workflow truly needs a container (e.g. BOM, Submittals, Approvals).
- **Problem it is trying to solve** — Forcing project creation up front blocks first-time users, makes the empty state feel like an error, and breaks trust before the user has had a chance to explore. The doc explicitly states: "Forcing a project here is the fastest way to lose first-time users."
- **How it guides users from exploration to commitment** — Through four named phases that progress along the legend (Explore → Soft → Trigger → Project):
  1. **Free exploration** — no project, full Catalog access, optional comparison.
  2. **Commit & attach** — a hard gate, then a modal with three actions, then a minimal create form, then a context-transfer beat.
  3. **Inside the project** — selections carry over; the project context unifies modules.
  4. **Mobility** — switch projects or return to no-project mode.
- **How project selection / attachment / inside-project behavior work**
  - **No project selected** — Top bar shows a **dashed** project picker labeled "No project selected"; this is treated as a first-class state, not an error.
  - **Project required** — Triggered by a project-bound action (e.g. opening **BOM** or **Add to BOM**). A modal offers **Select a project**, **Create new project**, or **Cancel**.
  - **Project attached** — Top bar switches to a solid, primary-colored chip with the project name; sidebar items become project-scoped (BOM shows item count); a success banner confirms "3 items from your selection moved into this project".
  - **Project switching** — From the project name chip, a dropdown shows recent projects (with a `CURRENT` mono tag), search, and "+ Create new project".
  - **Returning to explore** — Clearing the project from the switcher returns the user to "No project selected"; project-gated modules will re-trigger the commit flow if opened.

---

## 3. High-Level Page Structure

Top to bottom, on the page itself (inside the app's main content area):

1. **App shell — left sidebar navigation** (Hydra app chrome, outside the artifact).
2. **App shell — top bar** (Hydra app chrome, outside the artifact).
3. **Page back button** — `< Back to home` (Ant Design default button with a left-chevron icon, top-left of the content rail). It is part of the surrounding page, not the artifact body.
4. **Artifact card** — a single wide Ant Design `Card` that contains the entire scrollable doc. Body padding is 0 because the artifact controls its own internal padding.
5. **Hero block** (inside the card)
   - Eyebrow: `PROPOSAL · PROGRESSIVE PROJECT COMMITMENT` (uppercase mono, letter-spaced)
   - Title: `Progressive Project Commitment — proposed flow` (italic em on "— proposed flow")
   - Lede paragraph (intro)
   - Legend / status indicators (4 dotted entries)
6. **Phase 01 — Free exploration** (phase header + 3 step cards)
   - Step 01 — Entry — no project selected
   - Step 02 — Explore catalog freely
   - Step 03 — Build a working set — soft engagement
7. **Phase 02 — Commit & attach** (phase header + 5 step cards)
   - Step 04 — Commit action — hard gate (e.g. BOM)
   - Step 05 — Project required (modal)
   - Step 06 — Select or create a project
   - Step 07 — Minimal project creation
   - Step 08 — Context transfer
8. **Phase 03 — Inside the project** (phase header + 2 step cards)
   - Step 09 — Project active — selections in context
   - Step 10 — Cross-module persistence
9. **Phase 04 — Mobility** (phase header + 2 step cards)
   - Step 11 — Project switcher
   - Step 12 — Back to explore
10. **Closing principles** — section titled "Principles for this proposal", numbered list of 8 items.

For each phase, the structure is uniform:

- **Phase header** — small mono "PHASE 0X" label, italic phase title, right-aligned description.
- **Step cards** — bordered cards (radius 14px) with three stacked regions:
  - Header row: mono step number, step title, right-aligned status badge.
  - Wireframe stage: an SVG mockup on a soft surface background.
  - Notes grid: two-column block with a mono uppercase label (e.g. `WHAT'S HAPPENING`, `WHY IT MATTERS`) and a paragraph each.

---

## 4. App Shell / Layout Documentation

Documented from what is visibly rendered around the artifact (Hydra app shell):

- **Left sidebar navigation** — Standard Hydra sidebar (rendered by the app shell, not part of the artifact). Specific items are not visually inventoried here because they are not the subject of the artifact; the artifact instead **draws its own representation of a sidebar inside the SVG wireframes** (see step 01 for the labels it uses inside the mocks).
- **Top bar** — Standard Hydra top bar (rendered by the app shell). The artifact draws its own top bar inside its SVGs to communicate the "no project" vs "project active" state.
- **Page back button** — A single Ant Design `Button` labeled **"Back to home"** with a left chevron icon, placed at the top-left of the content rail (above the artifact card).
- **Main content container** — The artifact is wrapped in an Ant Design `Card`:
  - Width: `100%`, capped by the shell's content rail max width (`shellLayout.contentRailMaxWidthPx`).
  - Centered horizontally (`marginInline: auto`).
  - Border: `colorBorderSecondary`; radius: `borderRadiusLG`; subtle tertiary box-shadow.
  - Background: `colorBgContainer`.
  - Body padding is `0` so the artifact's internal `.container` controls spacing.
- **Inner artifact container**
  - Class: `.exploration-artifact-root .container`.
  - Max width: `880px`, centered.
  - Vertical padding: `64px` top, `96px` bottom.
  - Horizontal padding: `24px` on the artifact root (so content has breathing room on narrow screens).
  - Background: `var(--paper)` (= `colorBgLayout`), text color `colorText`.
- **Background treatment** — The artifact root uses `colorBgLayout` as its surface, so the wireframe stages (which use `colorFillAlter`) appear softer than the page background. Step cards themselves use `colorBgContainer`.
- **Card-based documentation structure** — One outer `Card` (the page container), with internal "step cards" (CSS-only divs styled as cards) for each step. Step cards have:
  - Background: `var(--surface)` (= `colorBgContainer`).
  - Border: `1px solid var(--line)`.
  - Radius: `14px`.
  - Margin-bottom: `20px`.
  - Overflow: hidden.
- **Spacing and hierarchy**
  - Hero bottom margin: `72px`, with a 1px solid divider.
  - Phase header: `64px` top margin, `24px` bottom margin, 1px solid bottom divider.
  - Step header: `18px 24px 14px` padding, 1px **dashed** bottom divider.
  - Wire stage: `24px` padding, soft surface background, 1px **dashed** bottom divider.
  - Step notes: `18px 24px 22px` padding, 2-column grid, `24px` gap (single column under 640px).
  - Principles: `56px` top margin, 1px solid top divider, 2-column list (single column under 640px).
- **Branding / navigation labels readable in the artifact's SVGs** — Inside the SVG-drawn shell, the brand label is **"ASC ConnectED"** and the drawn sidebar items are: `⌂ Home`, `▦ Catalog`, `≡ BOM`, `📋 Submittals`, `⏚ SeisBrace`, `✓ Approvals`, `⚙ Tools`, `▤ Templates`, then a `Projects` group with `▸ All projects`.

> Note: the actual Hydra sidebar/top-bar items rendered around this artifact are not enumerated here because they are app shell, not page content. If a redesign needs to capture them, do it from the live shell, not from this page.

---

## 5. Section-by-Section Breakdown

### Section: Hero

#### Purpose
Set the frame for the document: name the proposal, restate the problem in one paragraph, and define the color/state legend used throughout.

#### Visible content
- Eyebrow: `Proposal · Progressive project commitment`
- Title: `Progressive Project Commitment — proposed flow` (the em-tagged `— proposed flow` is italic)
- Lede paragraph:
  > "This page stands alone as a **proposal** for ASC ConnectED: start with no project, build a temporary working set, require a project only when the workflow needs a container, hand selections into that project, then work across modules—or step back to open exploration. Product and engineering can adopt, adapt, or challenge any step independently."
- Legend (four entries, each with a small colored square):
  - `Explore — no project` (success/green dot)
  - `Soft engagement` (warning/orange dot)
  - `Commit trigger` (error/red dot)
  - `Project context` (primary/blue dot)

#### Visual/UI elements
- Large italic display title.
- Mono uppercase eyebrow.
- Single paragraph lede, capped at ~620px width.
- Legend row with dashed top border separating it from the lede.

#### UX meaning
Establishes "this is a proposal", introduces the four states the rest of the page maps to via badges and color, and defines the central thesis: project is required only when the workflow needs a container.

#### Redesign requirements
- Must keep a clear proposal label (eyebrow).
- Must keep the one-paragraph executive summary.
- Must keep a visible legend / status key, since later sections reference it via badge colors.

---

### Section: Phase 01 — Free exploration

Phase header content:
- Number: `PHASE 01`
- Title: `Free exploration` (italic)
- Description: `Browse and compare without a project; optional save to project only when the user chooses.`

Contains three step cards.

#### Step 01 — Entry — no project selected
- **Badge**: `EXPLORE` (green/success)
- **Wireframe shows**:
  - Drawn sidebar with brand `ASC ConnectED` and the items listed in Section 4.
  - Top bar with a **dashed** project picker labeled `No project selected` and a `▾` caret. Right side icons: `🔍 ◌ ◐`.
  - Greeting: `Good morning, Alex` (italic, large).
  - Subline: `What would you like to work on today?`
  - Mono section label: `QUICK START`.
  - Two side-by-side cards:
    - **Catalog** (highlighted with green/success background) — sub: `Search, filters, compare — no project`.
    - **BOM** (neutral surface) — sub: `Opens commit flow when no project`.
  - Mono section label: `RECENT PROJECTS · 3`, then a row representing "Hospital Renovation A · 12 items · updated 2d ago · Commercial" with `Open →`.
- **Notes**:
  - `WHAT'S HAPPENING` — "The user lands without a project selected. This flow treats that as a **first-class state**: greeting, **Catalog** and **BOM** as quick entry, and recent projects—not an empty or 'broken' shell."
  - `WHY IT MATTERS` — "The dashed project picker signals **optional context**, not an error. Modules that are safe to open without a project should stay visible so exploration does not feel blocked."

#### Step 02 — Explore catalog freely
- **Badge**: `EXPLORE` (green)
- **Wireframe shows**:
  - Same dashed `No project selected` top bar.
  - Breadcrumb / page label: `Catalog`.
  - Search input placeholder: `🔍  Search products, categories…`
  - Buttons: `Filters`, `Sort: Relevance ▾`.
  - 3×2 product grid. Three products are labeled:
    - `ABU66Z` — `Adjustable Base` — `$8.25 · EA` — `+ Compare`
    - `ABR902` — `Adjustable Brace` — `$16.40 · EA` — `+ Compare`
    - `HDU26` — `Heavy Duty U` — `$6.75 · EA` — `+ Compare`
  - Three additional empty product card outlines fill row 2.
- **Notes**:
  - `WHAT'S HAPPENING` — "Full catalog access without a project. Search, filters, and '+ Compare' are all available. No upsells, no project-creation prompts."
  - `WHY IT MATTERS` — "This is where **trust gets earned**. A user who can browse without commitment will commit later when it's actually useful. Forcing a project here is the fastest way to lose first-time users."

#### Step 03 — Build a working set — soft engagement
- **Badge**: `SOFT` (orange/warning)
- The h3 also includes inline secondary text: `— soft engagement`.
- **Wireframe shows**:
  - Dashed `No project selected` top bar.
  - Catalog page label.
  - Main grid placeholder: `Product grid · filters · + Compare…` and below it a dashed-bordered box `More results…`.
  - Right rail: a comparison panel outlined with the soft/warning color.
    - Title: `Comparison`, sub: `3 items`.
    - Three rows: `ABU66Z $8.25`, `ABR902 $16.40`, `HDU26 $6.75`.
    - `Est. total $31.40`.
    - Outlined primary button: `Save to project` (primary color outline only — ghost/secondary CTA).
    - Footnote: `Optional — no gate yet`.
- **Notes**:
  - `WHAT'S HAPPENING` — "The user keeps a **temporary comparison** while still in explore mode. **Save to project** is visible but not required—soft engagement only."
  - `WHY IT MATTERS` — "Letting people assemble a set before naming a container **earns intent**. The hard gate comes only when a module needs a project (e.g. BOM), not here."

#### Phase 01 — Purpose / UX meaning
Demonstrates that exploration, comparison, and "soft" save intent all happen with no project, so the user accumulates value before being asked to commit.

#### Phase 01 — Redesign requirements
- Preserve "no project selected" as a **first-class** entry state with a dashed indicator.
- Preserve the distinction between **safe-without-project** modules (Catalog) and **project-bound** modules (BOM).
- Preserve a soft-engagement step where the user can build a working set; `Save to project` must remain optional and clearly labeled as such.
- Keep the visual color cue (green = explore, orange = soft) for parity with the legend.

---

### Section: Phase 02 — Commit & attach

Phase header content:
- Number: `PHASE 02`
- Title: `Commit & attach` (italic)
- Description: `Hard gate → project-required modal (select / create / cancel) → pick or create → brief handoff while context transfers.`

Contains five step cards.

#### Step 04 — Commit action — hard gate (e.g. BOM)
- **Badge**: `TRIGGER` (red/error)
- **Wireframe shows**:
  - Dashed `No project selected` top bar.
  - Sidebar `BOM` item highlighted with the error/red background and a small red dot to its right.
  - In-page banner (red): `This action requires a project to continue.`
  - Empty-state panel (dashed red border):
    - Circular icon with `↗`.
    - Heading: `Add to BOM`.
    - Body: `BOMs, submittals, and approvals live inside a project.`
    - Two buttons:
      - **Continue** (filled "ink" / black solid — the primary action).
      - **Go back** (outlined neutral).
- **Notes**:
  - `WHAT'S HAPPENING` — "The user clicked into BOM (or tried to 'Add to BOM' from a product card). The empty state explains *why* a project is needed before introducing the prompt."
  - `WHY IT MATTERS` — "The framing is **'a BOM needs a home'** — not 'you need to create a project to continue.' Constraints feel helpful when they explain the underlying logic instead of stating a rule."

#### Step 05 — Project required (modal)
- **Badge**: `TRIGGER` (red/error)
- **Wireframe shows**:
  - A faint scrim over the shell (overlay).
  - Centered modal:
    - 📁 icon at the top.
    - Heading: `This needs a project`.
    - Body: `BOMs, Submittals, and other workflows live inside a project.`
    - Three stacked actions (top to bottom):
      1. **Select a project** — filled "ink" / solid (the dominant CTA).
      2. **Create new project** — filled with primary-tinted background and primary-color outline + label.
      3. **Cancel** — outlined neutral.
    - Top-right close `✕`.
- **Notes**:
  - `MODAL PATTERN` — "Three actions: **Select a project**, **Create new project**, or **Cancel**. Copy centers the work ('this needs a project'), not the user as the problem."
  - `IMPLEMENTATION NOTE` — "If engineering adds alternate escape paths (e.g. drafts), document them as **extensions** to this proposal—not silent behavior changes."

#### Step 06 — Select or create a project
- **Badge**: `PROJECT` (blue/primary)
- **Wireframe shows**:
  - Still `No project selected` in the top bar (project not yet attached).
  - Italic page heading: `Choose a project`.
  - Search input: `🔍  Search recent projects…`.
  - Right-aligned primary-tinted button: `+ Create new project`.
  - Mono label: `RECENT`.
  - Three stacked project rows:
    - `Hospital Renovation A` (with `Commercial` chip on the right).
    - `School Expansion`.
    - `Office Building Annex`.
- **Notes**:
  - `WHAT'S HAPPENING` — "After **Select a project** from the modal, this flow shows a searchable **recent projects** list plus a clear path to create new."
  - `WHY IT MATTERS` — "Separating this from the empty BOM keeps the **commit moment** legible: first acknowledge the rule, then pick the container."

#### Step 07 — Minimal project creation
- **Badge**: `PROJECT` (blue/primary)
- **Wireframe shows**:
  - Scrim overlay.
  - Modal:
    - Title: `New project`, close `✕`.
    - Field label (mono): `PROJECT NAME` — input filled with `Downtown Office Tower` (focused with primary-color border).
    - Field label (mono): `TYPE · optional` — dropdown `Commercial ▾`.
    - Footnote: `Members, settings, templates → after creation`.
    - Primary CTA (right-aligned, solid "ink"): `Create & continue`.
- **Notes**:
  - `WHAT'S HAPPENING` — "One required field. Type is optional with a sensible default. **Members, permissions, and settings are deferred** to after creation."
  - `WHY IT MATTERS` — "The friction has to be proportional to the moment. The user just clicked 'create' — they haven't earned a configuration form. Configuration belongs *inside* the project, not in the doorway."

#### Step 08 — Context transfer
- **Badge**: `PROJECT` (blue/primary)
- **Wireframe shows**:
  - Soft full-card surface (no chrome — implies a focused/transition view).
  - Centered green check circle (success).
  - Italic heading: `Setting things up…`.
  - Sub: `Your selected items and context are being added to`.
  - Project name (primary-colored, bold): `Downtown Office Tower`.
  - Progress bar (~70% filled with primary color).
- **Notes**:
  - `HANDOFF MOMENT` — "An explicit **loading beat** makes the handoff feel intentional, not like a silent jump."
  - `PRODUCT TIE-IN` — "Use the same screen for real async work (API attach) or a short timed state in prototypes—keep the **project name** visible."

#### Phase 02 — Purpose / UX meaning
Defines the exact moment and modality of the project requirement: an in-page warning, a three-action modal, a separate selection list, a minimal creation form, and a deliberate handoff/loading state that confirms continuity.

#### Phase 02 — Redesign requirements
- Keep the "framing constraint" copy pattern: explain the need first, then ask.
- Keep the **three-option** modal (Select / Create / Cancel).
- Keep "minimal creation" with name (required) + type (optional) only.
- Preserve a visible handoff state that names the destination project.
- Preserve clear primary CTA hierarchy on each screen (one dominant action per modal/step).

---

### Section: Phase 03 — Inside the project

Phase header content:
- Number: `PHASE 03`
- Title: `Inside the project` (italic)
- Description: `Active project chrome, then how work carries across modules (steps 9–10).`

Contains two step cards.

#### Step 09 — Project active — selections in context
- **Badge**: `PROJECT` (blue/primary)
- **Wireframe shows**:
  - Top bar: solid primary-tinted chip with `Downtown Office Tower` and a `▾` caret.
  - Sidebar: `BOM` highlighted in primary-tinted background with a count `3` on the right.
  - Success banner across the content area: `✓ 3 items from your selection moved into this project` (with a `×` dismiss).
  - Page heading: `BOM` + sub `3 items · auto-saved`.
  - Filled primary CTA: `+ Add items` (solid "ink").
  - Table with columns: `Item`, `Qty`, `Unit`, `Code`, `Status`. Rows:
    - `ABU66Z` — Adjustable Base — `2 EA` — `IBC ✓` — `Draft`.
    - `ABR902` — Adjustable Brace — `4 EA` — `IBC ✓` — `Draft`.
    - `HDU26` — Heavy Duty U — `6 EA` — `IBC ✓` — `Draft`.
- **Notes**:
  - `WHAT'S HAPPENING` — "The 3 items the user had selected pre-project now live in the BOM. The success banner makes the transfer **visible and dismissible**."
  - `WHY IT MATTERS` — "If the selection didn't carry over, the whole gate would feel like punishment for committing. **Continuity of work is the contract** the prompt makes with the user."

#### Step 10 — Cross-module persistence
- **Badge**: `PROJECT` (blue/primary)
- **Wireframe shows**:
  - Headline (centered): `Same project context — selections and relationships carry across modules`.
  - Three stacked module cards in a row, with `→` arrows between them:
    - `BOM` (filled primary-tinted) — sub `Line items`.
    - `Submittals` — sub `Packages`.
    - `Approvals` — sub `Workflow`.
  - Caption: `Data persists as users move between modules once a project is active`.
- **Notes**:
  - `WHAT'S HAPPENING` — "A simple **BOM → Submittals → Approvals** read shows why the project container matters beyond a single screen."
  - `BUILD IMPLICATION` — "Engineering should keep one **project scope** in client and API so these modules read/write the same ids—not three disconnected silos."

#### Phase 03 — Purpose / UX meaning
Demonstrates the value the user just received in exchange for committing: their selections moved over and the project context is honored across modules.

#### Phase 03 — Redesign requirements
- Preserve a visible "items moved into this project" success state right after attach.
- Preserve a clear active-project indicator in the top bar (chip with project name).
- Preserve sidebar-level project scoping cues (e.g. count badge on BOM).
- Keep a diagram of cross-module continuity (BOM → Submittals → Approvals).

---

### Section: Phase 04 — Mobility

Phase header content:
- Number: `PHASE 04`
- Title: `Mobility` (italic)
- Description: `Switch projects or step back to explore without losing your place in the app (steps 11–12).`

Contains two step cards.

#### Step 11 — Project switcher
- **Badge**: `PROJECT` (blue/primary)
- **Wireframe shows**:
  - Top bar: project chip `Downtown Office Tower` open (caret `▴`).
  - Dropdown panel:
    - Search input: `🔍  Search…`.
    - Mono section label: `RECENT`.
    - First row highlighted (primary-tinted background): `Downtown Office Tower` with a right-aligned mono tag `CURRENT`.
    - `Hospital Renovation A`.
    - `School Expansion`.
    - Divider.
    - Primary-color action: `+ Create new project`.
  - Side annotation: `User can switch projects anytime without losing place in the app.`
- **Notes**:
  - `WHAT'S HAPPENING` — "From the project name in the top bar, the user opens **recent projects** and **create new**—mobility without leaving the shell."
  - `WHY IT MATTERS` — "Switching has to feel safe; otherwise users avoid committing. Keep context and route stable when only `projectId` changes."

#### Step 12 — Back to explore
- **Badge**: `EXPLORE` (green/success)
- **Wireframe shows**:
  - Top bar back to dashed `No project selected`.
  - Italic heading: `Explore mode`.
  - Body across two lines: `User cleared the project from the switcher. Catalog and other global modules stay available; project-gated modules show the commit flow again if opened without a project.`
  - Success banner (green): `✓ Explore-first loop closed — user can re-enter the flow whenever they add a new working set.`
- **Notes**:
  - `CLOSURE` — "Step 12 makes **no-project** an explicit return state, not a dead end—aligned with steps 1–2."
  - `PRODUCT NOTE` — "Preserve any in-memory working set policy in spec (clear vs keep) when exiting project context; this proposal assumes users can **browse freely again**."

#### Phase 04 — Purpose / UX meaning
Closes the loop: project commitment is reversible. Users can switch projects or return to no-project mode without breaking the app.

#### Phase 04 — Redesign requirements
- Preserve a project switcher anchored on the project chip.
- Preserve the ability to return to "No project selected" and re-enter the loop.
- Preserve the explicit framing that the no-project state is a destination, not an error.

---

### Section: Closing — Principles for this proposal

#### Purpose
Distill the proposal into eight numbered principles that summarize the design intent across phases.

#### Visible content
- Title: `Principles for this proposal` (italic, large).
- Numbered list (mono-styled "01"–"08"):
  1. **No-project is a first-class state.** Entry and return (steps 1 and 12) use the same dashed picker and explore affordances—not an error or empty void.
  2. **Commit only when the workflow requires it.** Catalog-style exploration stays open; the hard gate appears at project-bound actions (e.g. BOM) with an explicit in-page cue.
  3. **Commit modal pattern:** *Select a project*, *Create new project*, or *Cancel*—then list/create flows as shown. Extensions (e.g. drafts) should be documented as deliberate add-ons.
  4. **Continuity of selection is the contract.** Pre-project selections must land in the chosen project; the handoff step (8) makes that promise visible.
  5. **One project context across modules.** BOM, Submittals, and Approvals read the same active project so work does not fragment.
  6. **Mobility without trap doors.** The switcher supports changing projects or creating new ones; users can step back to explore when they choose.
  7. **Minimal creation at the door.** Name (and light metadata such as type) only; members, settings, and templates come after the project exists.
  8. **Language carries the constraint.** Prefer "this needs a project" and explain where BOMs live—avoid blaming the user.

#### Visual/UI elements
Two-column numbered list (collapses to one column under 640px). No images.

#### UX meaning
Acts as the page's takeaway. Anyone scanning the doc can read just this section and understand the position.

#### Redesign requirements
Keep all eight principles; they are the contract the rest of the doc supports.

---

## 6. Detailed Flow Extraction

The product flow visible on the page, extracted as steps:

### Flow Step 1: Exploration / Pre-commitment
- **What the user sees** — Standard shell with a **dashed `No project selected`** indicator in the top bar; a personalized greeting; a `QUICK START` row featuring `Catalog` and `BOM` cards; a `RECENT PROJECTS · 3` row.
- **What project context exists** — None. The dashed picker explicitly signals optional context.
- **What actions are available** — Open Catalog (works without a project), open BOM (will trigger commit flow), open a recent project from the list.
- **Commitment level** — `Explore` (the page's lowest commitment band, green).

### Flow Step 2: Saving or attaching work (soft and hard)

**Soft (no commitment yet)**
- Building a comparison set in Catalog reveals a **comparison rail** with line items and an `Est. total`.
- An optional `Save to project` button is present, framed as `Optional — no gate yet`.
- The flow does **not** force project creation here.

**Hard gate (commit triggered)**
- **What triggers stronger commitment** — Opening a project-bound module (here: `BOM`) or trying to `Add to BOM` from a product card.
- **What the user is asked to do** — A modal titled `This needs a project` offers three actions:
  1. **Select a project** (primary, dominant).
  2. **Create new project** (primary-tinted, second option).
  3. **Cancel**.
- **What happens if no project is selected** — The user is held at the gate (the empty BOM panel + modal). The action cannot proceed without choosing or creating a project, or cancelling.
- **What happens if a project is selected (next steps)** —
  - From `Select a project`: a search + recent projects list (Step 06) is shown; picking a project proceeds to context transfer.
  - From `Create new project`: the **minimal creation modal** (Step 07) — `PROJECT NAME` (required) + `TYPE` (optional) + `Create & continue`.
  - Either path leads to the **context transfer** loading state (Step 08), where the project name is shown and the user's selected items are attached.

### Flow Step 3: Inside a project
- **How project context is shown** — Top bar chip switches to a solid primary-tinted pill with the project name (`Downtown Office Tower`) and a caret. Sidebar items become project-scoped (BOM shows count `3`).
- **How project selection affects the UI** — A success banner explicitly confirms `3 items from your selection moved into this project`. The BOM page now shows the items as rows in a table with `Status: Draft` and a primary CTA `+ Add items`.
- **What actions are available inside the project** — Add items, view rows in BOM (with code `IBC ✓`), and traverse to other project-scoped modules (`Submittals`, `Approvals`) via the cross-module continuity diagram in Step 10.

### Flow Step 4: Mobility (cross-context, not necessarily cross-device)
- **How the flow behaves across contexts** — From the project chip, a dropdown lets the user switch projects (search + recent + `+ Create new project`), or step back to no-project mode by clearing the selection.
- **What is preserved** — The user's place in the app (route/context); only the active `projectId` changes. The proposal explicitly says "Keep context and route stable when only `projectId` changes."
- **What may change** — The current project context; the visibility of project-bound modules' content. Returning to no-project re-shows the dashed picker and the commit gate fires again on project-bound modules.
- **Cross-device behavior** — *Inferred from visible UI: not explicitly addressed. The page shows only desktop-shaped wireframes and no mobile-specific frames.*

> The flow loops back to Step 1: clearing the project returns the user to the same explore state, and adding a new working set re-enters the loop.

---

## 7. Content Inventory

| Section | Content Type | Text / Description | Notes |
|---|---|---|---|
| App shell | Button | `< Back to home` | Ant Design default button with a left chevron icon |
| Hero | Page eyebrow | `Proposal · Progressive project commitment` | Mono uppercase, letter-spaced |
| Hero | Page title | `Progressive Project Commitment — proposed flow` | Italic em on `— proposed flow` |
| Hero | Intro text | Lede paragraph (see Section 5) | ~620px max width |
| Hero | Legend item | `Explore — no project` | Green dot |
| Hero | Legend item | `Soft engagement` | Orange dot |
| Hero | Legend item | `Commit trigger` | Red dot |
| Hero | Legend item | `Project context` | Blue dot |
| Phase 01 | Phase number | `PHASE 01` | Mono uppercase |
| Phase 01 | Phase title | `Free exploration` | Italic |
| Phase 01 | Phase description | `Browse and compare without a project; optional save to project only when the user chooses.` | Right-aligned |
| Step 01 | Step number | `01` | Mono |
| Step 01 | Step heading | `Entry — no project selected` | |
| Step 01 | Badge | `EXPLORE` | Green/success |
| Step 01 | UI label (in SVG) | `ASC ConnectED` | Brand label inside drawn sidebar |
| Step 01 | UI label (in SVG) | `⌂ Home`, `▦ Catalog`, `≡ BOM`, `📋 Submittals`, `⏚ SeisBrace`, `✓ Approvals`, `⚙ Tools`, `▤ Templates` | Drawn sidebar items |
| Step 01 | UI label (in SVG) | `Projects`, `▸ All projects` | Drawn sidebar grouping |
| Step 01 | UI label (in SVG) | `No project selected` | Dashed top-bar picker |
| Step 01 | Page greeting | `Good morning, Alex` | Italic display |
| Step 01 | Subline | `What would you like to work on today?` | |
| Step 01 | Section label | `QUICK START` | Mono uppercase |
| Step 01 | Card heading | `Catalog` | |
| Step 01 | Card sub | `Search, filters, compare — no project` | |
| Step 01 | Card heading | `BOM` | |
| Step 01 | Card sub | `Opens commit flow when no project` | |
| Step 01 | Section label | `RECENT PROJECTS · 3` | Mono uppercase |
| Step 01 | Recent project name | `Hospital Renovation A` | |
| Step 01 | Recent project meta | `12 items · updated 2d ago · Commercial` | |
| Step 01 | Inline action | `Open →` | |
| Step 01 | Note label | `WHAT'S HAPPENING` | Mono uppercase |
| Step 01 | Note paragraph | See Section 5 | |
| Step 01 | Note label | `WHY IT MATTERS` | Mono uppercase |
| Step 01 | Note paragraph | See Section 5 | |
| Step 02 | Step number | `02` | |
| Step 02 | Step heading | `Explore catalog freely` | |
| Step 02 | Badge | `EXPLORE` | |
| Step 02 | Breadcrumb / page label | `Catalog` | |
| Step 02 | Search placeholder | `🔍  Search products, categories…` | |
| Step 02 | Button | `Filters` | |
| Step 02 | Button | `Sort: Relevance ▾` | |
| Step 02 | Product card | `ABU66Z`, `Adjustable Base`, `$8.25 · EA`, `+ Compare` | |
| Step 02 | Product card | `ABR902`, `Adjustable Brace`, `$16.40 · EA`, `+ Compare` | |
| Step 02 | Product card | `HDU26`, `Heavy Duty U`, `$6.75 · EA`, `+ Compare` | |
| Step 02 | Notes | `WHAT'S HAPPENING`, `WHY IT MATTERS` | See Section 5 |
| Step 03 | Step number | `03` | |
| Step 03 | Step heading | `Build a working set — soft engagement` | |
| Step 03 | Badge | `SOFT` | |
| Step 03 | Placeholder | `Product grid · filters · + Compare…` | |
| Step 03 | Placeholder | `More results…` | Dashed-bordered |
| Step 03 | Comparison heading | `Comparison` | |
| Step 03 | Comparison sub | `3 items` | |
| Step 03 | Comparison row | `ABU66Z $8.25` | |
| Step 03 | Comparison row | `ABR902 $16.40` | |
| Step 03 | Comparison row | `HDU26 $6.75` | |
| Step 03 | Comparison total | `Est. total $31.40` | |
| Step 03 | Button | `Save to project` | Outlined primary (ghost) |
| Step 03 | Footnote | `Optional — no gate yet` | |
| Step 03 | Notes | `WHAT'S HAPPENING`, `WHY IT MATTERS` | See Section 5 |
| Phase 02 | Phase number | `PHASE 02` | |
| Phase 02 | Phase title | `Commit & attach` | |
| Phase 02 | Phase description | `Hard gate → project-required modal (select / create / cancel) → pick or create → brief handoff while context transfers.` | |
| Step 04 | Step heading | `Commit action — hard gate (e.g. BOM)` | |
| Step 04 | Badge | `TRIGGER` | |
| Step 04 | Banner | `This action requires a project to continue.` | Red |
| Step 04 | Empty-state heading | `Add to BOM` | |
| Step 04 | Empty-state body | `BOMs, submittals, and approvals live inside a project.` | |
| Step 04 | Button | `Continue` | Filled "ink" / black solid |
| Step 04 | Button | `Go back` | Outlined neutral |
| Step 04 | Notes | `WHAT'S HAPPENING`, `WHY IT MATTERS` | See Section 5 |
| Step 05 | Step heading | `Project required` | |
| Step 05 | Badge | `TRIGGER` | |
| Step 05 | Modal heading | `This needs a project` | |
| Step 05 | Modal body | `BOMs, Submittals, and other workflows live inside a project.` | |
| Step 05 | Modal button | `Select a project` | Filled "ink" |
| Step 05 | Modal button | `Create new project` | Primary-tinted |
| Step 05 | Modal button | `Cancel` | Outlined neutral |
| Step 05 | Modal control | `✕` | Close |
| Step 05 | Notes | `MODAL PATTERN`, `IMPLEMENTATION NOTE` | See Section 5 |
| Step 06 | Step heading | `Select or create a project` | |
| Step 06 | Badge | `PROJECT` | |
| Step 06 | Page heading | `Choose a project` | Italic |
| Step 06 | Search placeholder | `🔍  Search recent projects…` | |
| Step 06 | Button | `+ Create new project` | Primary-tinted |
| Step 06 | Section label | `RECENT` | Mono uppercase |
| Step 06 | Project row | `Hospital Renovation A` (with `Commercial` chip) | |
| Step 06 | Project row | `School Expansion` | |
| Step 06 | Project row | `Office Building Annex` | |
| Step 06 | Notes | `WHAT'S HAPPENING`, `WHY IT MATTERS` | See Section 5 |
| Step 07 | Step heading | `Minimal project creation` | |
| Step 07 | Badge | `PROJECT` | |
| Step 07 | Modal title | `New project` | |
| Step 07 | Field label | `PROJECT NAME` | Mono uppercase |
| Step 07 | Field value | `Downtown Office Tower` | Focused (primary border) |
| Step 07 | Field label | `TYPE · optional` | Mono uppercase |
| Step 07 | Field value | `Commercial ▾` | Dropdown |
| Step 07 | Footnote | `Members, settings, templates → after creation` | |
| Step 07 | Button | `Create & continue` | Filled "ink" |
| Step 07 | Notes | `WHAT'S HAPPENING`, `WHY IT MATTERS` | See Section 5 |
| Step 08 | Step heading | `Context transfer` | |
| Step 08 | Badge | `PROJECT` | |
| Step 08 | Heading | `Setting things up…` | Italic |
| Step 08 | Body | `Your selected items and context are being added to` | |
| Step 08 | Project name | `Downtown Office Tower` | Primary-colored, bold |
| Step 08 | Visual | Progress bar (~70%) | |
| Step 08 | Notes | `HANDOFF MOMENT`, `PRODUCT TIE-IN` | See Section 5 |
| Phase 03 | Phase number | `PHASE 03` | |
| Phase 03 | Phase title | `Inside the project` | |
| Phase 03 | Phase description | `Active project chrome, then how work carries across modules (steps 9–10).` | |
| Step 09 | Step heading | `Project active — selections in context` | |
| Step 09 | Badge | `PROJECT` | |
| Step 09 | Top bar | `Downtown Office Tower ▾` | Primary-tinted chip |
| Step 09 | Sidebar | `BOM 3` | Primary-tinted, with count |
| Step 09 | Success banner | `✓ 3 items from your selection moved into this project` | Dismissible (`×`) |
| Step 09 | Page heading | `BOM` | |
| Step 09 | Sub | `3 items · auto-saved` | |
| Step 09 | Button | `+ Add items` | Filled "ink" |
| Step 09 | Table headers | `Item`, `Qty`, `Unit`, `Code`, `Status` | |
| Step 09 | Table row | `ABU66Z` / `Adjustable Base` / `2` / `EA` / `IBC ✓` / `Draft` | |
| Step 09 | Table row | `ABR902` / `Adjustable Brace` / `4` / `EA` / `IBC ✓` / `Draft` | |
| Step 09 | Table row | `HDU26` / `Heavy Duty U` / `6` / `EA` / `IBC ✓` / `Draft` | |
| Step 09 | Notes | `WHAT'S HAPPENING`, `WHY IT MATTERS` | See Section 5 |
| Step 10 | Step heading | `Cross-module persistence` | |
| Step 10 | Badge | `PROJECT` | |
| Step 10 | Headline | `Same project context — selections and relationships carry across modules` | |
| Step 10 | Module card | `BOM` / `Line items` | Primary-tinted (active) |
| Step 10 | Module card | `Submittals` / `Packages` | Neutral |
| Step 10 | Module card | `Approvals` / `Workflow` | Neutral |
| Step 10 | Caption | `Data persists as users move between modules once a project is active` | |
| Step 10 | Notes | `WHAT'S HAPPENING`, `BUILD IMPLICATION` | See Section 5 |
| Phase 04 | Phase number | `PHASE 04` | |
| Phase 04 | Phase title | `Mobility` | |
| Phase 04 | Phase description | `Switch projects or step back to explore without losing your place in the app (steps 11–12).` | |
| Step 11 | Step heading | `Project switcher` | |
| Step 11 | Badge | `PROJECT` | |
| Step 11 | Top bar | `Downtown Office Tower ▴` | Primary-tinted chip, open state |
| Step 11 | Search placeholder | `🔍  Search…` | |
| Step 11 | Section label | `RECENT` | |
| Step 11 | Project row | `Downtown Office Tower` + `CURRENT` | Primary-tinted, current |
| Step 11 | Project row | `Hospital Renovation A` | |
| Step 11 | Project row | `School Expansion` | |
| Step 11 | Action | `+ Create new project` | Primary-color label |
| Step 11 | Annotation | `User can switch projects anytime without losing place in the app.` | Side note |
| Step 11 | Notes | `WHAT'S HAPPENING`, `WHY IT MATTERS` | See Section 5 |
| Step 12 | Step heading | `Back to explore` | |
| Step 12 | Badge | `EXPLORE` | |
| Step 12 | Top bar | `No project selected ▾` | Dashed |
| Step 12 | Page heading | `Explore mode` | Italic |
| Step 12 | Body | `User cleared the project from the switcher. Catalog and other global modules stay available; project-gated modules show the commit flow again if opened without a project.` | |
| Step 12 | Success banner | `✓ Explore-first loop closed — user can re-enter the flow whenever they add a new working set.` | Green |
| Step 12 | Notes | `CLOSURE`, `PRODUCT NOTE` | See Section 5 |
| Closing | Section heading | `Principles for this proposal` | Italic, large |
| Closing | List item 1 | "No-project is a first-class state." | See Section 5 for full text |
| Closing | List item 2 | "Commit only when the workflow requires it." | |
| Closing | List item 3 | "Commit modal pattern." | |
| Closing | List item 4 | "Continuity of selection is the contract." | |
| Closing | List item 5 | "One project context across modules." | |
| Closing | List item 6 | "Mobility without trap doors." | |
| Closing | List item 7 | "Minimal creation at the door." | |
| Closing | List item 8 | "Language carries the constraint." | |

> All SVG-rendered text is intentionally small. None of it was unreadable on a normal-resolution display, but if the screenshot the redesign is based on is heavily downscaled, treat any single-line label inside a wireframe as `[unreadable — visible but too small in screenshot]` and rely on this inventory.

---

## 8. UI Component Inventory

Components visible on the page, separated by whether they are **app shell** (Hydra chrome around the artifact), **artifact UI** (real components used to render the doc), or **drawn product UI** (illustrations of product UI inside SVG wireframes).

| Component | Where it appears | What it does | Real or drawn |
|---|---|---|---|
| Hydra left sidebar | App shell, left edge | App-wide navigation | Real (app shell) |
| Hydra top header | App shell, top edge | App-wide header | Real (app shell) |
| Page back button | Above artifact card | `< Back to home`, returns to umbrella dashboard | Real (Ant Design `Button`) |
| Artifact card | Centered on page, content rail | Wraps the entire proposal in one shell card | Real (Ant Design `Card`) |
| Hero block | Top of artifact | Eyebrow + title + lede + legend | Documentation-only (HTML/CSS) |
| Status legend | Inside hero | 4 colored dots + labels — defines color band semantics | Documentation-only |
| Phase header | Above each phase | Mono number + italic title + right-aligned description | Documentation-only |
| Step card | Each numbered step | Documentation card with header, wireframe, and notes | Documentation-only |
| Step badge | Step header right side | Mono uppercase tag (`EXPLORE`, `SOFT`, `TRIGGER`, `PROJECT`) | Documentation-only |
| Wireframe stage | Inside each step card | Soft-surface area containing an SVG mock | Documentation-only |
| SVG wireframe | Inside wire stage | Hand-drawn-style mock of the product UI | Documentation-only (illustration of real product) |
| Note block | Under each wireframe | Mono uppercase label + paragraph; 2 per step | Documentation-only |
| Principles list | Bottom of artifact | Numbered (decimal-leading-zero) two-column list | Documentation-only |
| (Drawn) Sidebar items | Inside SVGs | Visual reference for `Home`, `Catalog`, `BOM`, `Submittals`, `SeisBrace`, `Approvals`, `Tools`, `Templates`, `Projects` group | Drawn product UI |
| (Drawn) Top-bar project picker | Inside SVGs | Dashed (`No project selected`) or solid primary chip (project name) | Drawn product UI |
| (Drawn) Quick start cards | Step 01 | `Catalog` and `BOM` entry tiles | Drawn product UI |
| (Drawn) Recent projects row | Step 01 | One row showing project name, meta, and `Open →` | Drawn product UI |
| (Drawn) Search input | Steps 02, 06, 11 | Placeholder text patterns | Drawn product UI |
| (Drawn) Filter / sort buttons | Step 02 | `Filters`, `Sort: Relevance ▾` | Drawn product UI |
| (Drawn) Product grid | Step 02 | 3×2 grid; 3 named items + 3 placeholders | Drawn product UI |
| (Drawn) Comparison rail | Step 03 | Right-side panel with line items, total, `Save to project` | Drawn product UI |
| (Drawn) Inline warning banner | Step 04 | Red banner above empty state | Drawn product UI |
| (Drawn) Empty-state panel | Step 04 | Dashed red border + icon + heading + body + 2 buttons | Drawn product UI |
| (Drawn) Modal | Steps 05, 07 | Centered card on a scrim | Drawn product UI |
| (Drawn) Project list | Step 06, 11 | Row-stacked recent projects (clickable rows) | Drawn product UI |
| (Drawn) Form input (focused) | Step 07 | `PROJECT NAME` field with primary-color border | Drawn product UI |
| (Drawn) Dropdown | Step 07 | `Commercial ▾` type selector | Drawn product UI |
| (Drawn) Loading state | Step 08 | Check icon + heading + project name + progress bar | Drawn product UI |
| (Drawn) Success banner | Steps 09, 12 | Green banner with check + dismissible × (Step 09) | Drawn product UI |
| (Drawn) Data table | Step 09 | BOM table with 5 columns and 3 rows | Drawn product UI |
| (Drawn) Module flow diagram | Step 10 | 3 module cards with `→` arrows | Drawn product UI |
| (Drawn) Project switcher dropdown | Step 11 | Search + `RECENT` + rows + divider + create action | Drawn product UI |
| (Drawn) `CURRENT` mono tag | Step 11 | Marks the active project in the list | Drawn product UI |
| Buttons (drawn): primary ("ink") | Steps 04, 05, 07, 09 | `Continue`, `Select a project`, `Create & continue`, `+ Add items` | Drawn product UI |
| Buttons (drawn): primary-tinted | Steps 03, 05, 06, 09, 10, 11 | `Save to project`, `Create new project`, `+ Create new project`, project chip | Drawn product UI |
| Buttons (drawn): outlined neutral | Steps 04, 05 | `Go back`, `Cancel` | Drawn product UI |

---

## 9. State Inventory

States visible in the artifact. Each is the *target* the redesign must continue to communicate.

| State | Where it appears | Message it communicates | User action it supports | Must be preserved in redesign |
|---|---|---|---|---|
| **No project selected (entry)** | Step 01, top-bar dashed picker, dashboard layout | The app is usable without a project; this is a real, supported state. | Browse Catalog, open recent project, open a project-gated module (which will trigger the commit flow). | Yes — first-class state |
| **Soft engagement / temporary working set** | Step 03, comparison rail | The user has built a comparison; saving is optional. | Continue browsing, save to project (optional). | Yes — must remain optional |
| **Project required (in-page)** | Step 04, red banner + empty BOM panel + dashed red border | This action needs a project; here is *why*. | Continue (open modal) or go back. | Yes — explanation comes before the prompt |
| **Project required (modal)** | Step 05 | Three explicit options to satisfy the gate. | Select / Create / Cancel. | Yes — three-action pattern |
| **Selection list (no project yet)** | Step 06, top bar still dashed | User must pick or create. | Search, select recent, or create new. | Yes |
| **Project creation (minimal)** | Step 07, modal with focused name input | Lowest possible friction at the door. | Type a name + optional type + create. | Yes — minimal fields only |
| **Context transfer (loading/handoff)** | Step 08 | Selections are being attached to the named project; this is intentional. | Wait briefly. | Yes — explicit beat with project name visible |
| **Items moved into project (success)** | Step 09, green banner with `×` | Continuity of selection is honored. | Dismiss banner, continue work. | Yes — visible, dismissible |
| **Project active** | Steps 09, 10, 11, top-bar chip + sidebar count | The user is now operating within a named container. | All project-scoped work. | Yes |
| **Cross-module persistence** | Step 10 | Project context follows the user across modules. | Move between BOM, Submittals, Approvals. | Yes |
| **Project switcher open** | Step 11 | The user can change projects without leaving the app. | Search, switch, or create new. | Yes |
| **Back to explore (return)** | Step 12, top bar dashed again, green confirmation banner | No-project is also an end state, not just an entry state. | Browse globally; re-enter the loop later. | Yes |
| **Disabled / unavailable** | *Inferred from visible UI*: not explicitly drawn. The hard gate (Step 04) is the closest concept, where a project-gated action is functionally unavailable until a project exists. | — | — | Should be defined in redesign |
| **Mobile / responsive** | *Inferred from CSS only*: the artifact has a `@media (max-width: 640px)` rule that collapses 2-column step notes to 1 column, scales the hero title down to 38px, and stacks phase headers. The wireframe SVGs themselves do **not** show a mobile product view. | — | — | Mobile of the *product* flow is not documented |

---

## 10. UX Observations

What is clear:

- The four-band color system (Explore / Soft / Trigger / Project) is consistent and easy to follow.
- The narrative is linear and numbered (01–12), which makes scanning easy.
- The "framing constraint" copy pattern is consistent: each commit-related screen explains *why* before asking.
- Step 09 (success banner with item count) and Step 08 (named handoff) are strong because they explicitly honor "continuity of selection".
- The closing Principles section is a clean takeaway.

What is potentially confusing or weak:

- **Two CTA visual languages compete.** Some primary CTAs are filled "ink" (black solid: `Continue`, `Select a project`, `Create & continue`, `+ Add items`). Others are filled with primary-tinted blue (`Create new project`, `Save to project`, the project chip). When both appear in the same modal (Step 05 stacks `Select a project` filled-ink above `Create new project` primary-tinted), the relative weights can read as two competing primaries. The doc itself doesn't reconcile this.
- **Step 04 vs Step 05 overlap.** The in-page banner + empty state in Step 04 already explains the constraint, and then Step 05's modal repeats the explanation. The redesign could either fold Step 04 into the modal trigger or sharpen the difference (e.g. Step 04 = navigation shortcut, Step 05 = direct action).
- **Phase 04 and Step 12 underspecify "what happens to the working set"** when leaving project context. The notes say "this proposal assumes users can browse freely again" and explicitly defer the "clear vs keep" policy to spec.
- **Mobile is not addressed in the wireframes.** Only the doc layout is responsive (CSS media query). The product flow's mobile behavior is missing.
- **Visually dense.** Each step crams a wireframe + 2 explanatory notes. On a long scroll this is heavy, especially since several wireframes are conceptually similar (e.g. dashed top bar repeats across many steps).
- **Hierarchy weakness.** Phases share visual weight with steps because both are h2/h3-ish. Phase headers are visually subtle (small mono number + italic title + right-aligned desc); they can get lost between large step cards.
- **Some explanatory text under screenshots is long.** The two-block "What's happening" / "Why it matters" pattern is solid, but several blocks repeat ideas already implied by the wireframe.

Important screenshots (do not lose in redesign):

- **Step 01** — "no project" entry dashboard.
- **Step 04** — the in-page hard-gate framing.
- **Step 05** — the three-action modal.
- **Step 08** — the handoff/loading beat with named project.
- **Step 09** — the success banner + populated BOM table (most concrete proof of continuity).
- **Step 11** — the switcher open state.

Annotations that should become clearer:

- The implementation/build-side notes (Steps 05, 10, 11) should likely be split out so they don't compete with UX rationale.

Format judgment:

- The page works **as documentation**. It is not a presentation deck (too dense per slide), and not an interactive prototype (the wireframes are SVG illustrations, not real components). A redesign should likely keep the documentation-first format but improve hierarchy and reduce repetition.

---

## 11. Content Problems

Issues that are visible or strongly suggested by the current page:

- **Text inside SVG wireframes is small** by necessity (12px and below). Anything subtler than a heading is hard to read on a high-DPI display zoomed out.
- **Repeated explanation under near-identical wireframes.** Steps 01, 02, 03 all reuse a dashed top-bar visual; the "no project selected" point is restated multiple times.
- **Note pattern is rigid.** Every step has exactly two notes (`WHAT'S HAPPENING` + `WHY IT MATTERS` or variants). Some steps don't need both; others would benefit from a third (e.g. "EDGE CASE" or "OPEN QUESTION").
- **Weak CTA hierarchy in Step 05's modal.** Two visually heavy primary-flavored buttons stacked together (`Select a project` filled, `Create new project` primary-tinted), then a neutral `Cancel`. It is clear in context but reads as two co-equal primaries rather than primary + secondary.
- **Missing transition explanation between Step 03 (Save to project) and Step 04 (BOM gate).** What happens if the user clicks `Save to project` in Step 03 instead of opening BOM? Does it open the same modal as Step 05? The page doesn't say.
- **Missing "why this matters" framing for some inside-project steps.** Steps 09–10 read as descriptive ("here's what happens"). The "build implication" note is there, but a unified rationale ties weakly to the rest of the document's argument.
- **Missing clear before/after for selection continuity.** The promise is implied by the success banner in Step 09 (`3 items moved`), but the reader has to remember the 3 items from Step 03 to verify.
- **Missing decision points.** The doc presents a single happy-path proposal; alternative branches (cancel from modal, drafts, multi-project users, permissions) are referenced as "extensions" but not enumerated.
- **Eyebrow vs page title relationship is tight.** The label `Proposal · Progressive project commitment` and the title `Progressive Project Commitment — proposed flow` say the same thing twice. This is intentional framing but a content problem in a tighter redesign.

---

## 12. Missing Information

Mark each item as **Required**, **Optional**, or **Nice to have** for a credible redesign.

- **User roles** — Required. The doc never names roles (designer, estimator, project manager, admin). Roles likely affect who can create a project and who can attach selections.
- **Project commitment levels (formal definition)** — Required. The page implies four bands (Explore / Soft / Trigger / Project) via the legend, but never enumerates them as a model with crisp definitions and entry/exit conditions.
- **Exact triggers for "commit & attach"** — Required. The text mentions BOM and "Add to BOM"; it implies Submittals and Approvals also trigger. A definitive list of project-bound modules and actions is missing.
- **What happens if the user cancels the modal** — Required. Step 05 lists `Cancel` but the doc does not say where the user lands (back to the previous module empty state? back to dashboard? selections preserved?).
- **What happens if the user changes project mid-flow** — Required. Step 11 documents the switcher exists but does not specify whether unsaved working sets, drafts, or filters survive a project switch.
- **What happens if the user has multiple projects open across tabs** — Optional. Not addressed at all.
- **Permissions / access behavior** — Required. The proposal does not address: who can create a project, who can attach to which project, what happens if the user does not have access to a project they recently visited.
- **Save behavior (drafts)** — Required. Step 05 says "If engineering adds alternate escape paths (e.g. drafts), document them as extensions"—drafts are explicitly out of scope here, but a real flow likely needs them.
- **Mobile-specific rules** — Required. Only the doc layout is responsive; there are no mobile mocks of the product flow.
- **Error recovery** — Required. What happens if `Create & continue` fails, or context transfer (Step 08) errors? Both are happy-path only.
- **Final CTA / next step for the page itself** — Optional. The page ends with principles. There is no "approve / discuss / open in Linear / share" affordance, which is fine for a documentation page but worth defining.
- **Differentiation between "soft engagement save" and "hard gate"** — Required. The doc shows `Save to project` in Step 03 while in explore mode, but does not specify the resulting flow if there is no project.
- **Cross-device / hand-off persistence** — Nice to have. Phase 04 is named "Mobility" but is really about cross-context, not cross-device.
- **Onboarding / first-time experience** — Nice to have. The greeting in Step 01 says "Good morning, Alex"—this is a returning user. A first-time user state is not shown.
- **Accessibility considerations** — Required. Color is the primary cue for state across the legend; an A11y note is missing.

---

## 13. Recommended Redesigned Page Structure

Content order recommendation for the redesigned documentation page (no visual redesign yet):

1. **Hero / Executive summary** — *Why it should exist:* readers should understand the proposal in 30 seconds. *What it should contain:* one-sentence problem, one-sentence solution, one-line legend. *Maps from:* current Hero (eyebrow, title, lede, legend).
2. **Problem statement** — *Why:* current page implies the problem in the lede but never separates it. *What:* "Today users are forced to create a project before they can do anything; this loses first-time users and creates friction every time someone wants to browse." *Maps from:* current "Why it matters" notes in Steps 01 and 02.
3. **Core principle: progressive commitment** — *Why:* central thesis deserves its own section. *What:* the four-band model (Explore / Soft / Trigger / Project) with crisp definitions, including entry/exit conditions for each band. *Maps from:* current legend + Phase headers + Principles 1, 2, and 8.
4. **Current flow overview** — *Why:* readers benefit from a one-page diagram before diving into 12 steps. *What:* a single horizontal flow diagram (Explore → Soft → Trigger → Attach → Inside project → Switch → Explore again). *Maps from:* implied by the four phases.
5. **Step-by-step flow** — *Why:* the existing 12-step narrative is the strongest part. *What:* the steps, but with each step constrained to one wireframe + at most two short notes + an explicit transition arrow to the next step. *Maps from:* current Steps 01–12.
6. **Key UI states** — *Why:* the redesign should be able to ship a state inventory independent of the linear flow. *What:* a labeled grid of every named state (no project, soft engagement, project required, attached, switching, back to explore, plus disabled/error/loading states). *Maps from:* Section 9 of this doc + the success banners + the dashed picker.
7. **Project context behavior** — *Why:* this is the contract the proposal makes. *What:* what gets attached at attach time; what carries across modules; what stays the same when only `projectId` changes. *Maps from:* current Steps 08, 09, 10.
8. **Edge cases** — *Why:* missing today; required for engineering. *What:* cancel from modal, switching mid-flow, permissions, multiple projects, drafts. *Maps from:* current "Implementation note" in Step 05 and the gap identified in Section 12.
9. **Mobile behavior** — *Why:* missing today. *What:* mobile-specific rules for top-bar chip, modal, switcher, and project list. *Maps from:* nothing in the current page; new content.
10. **Design principles** — *Why:* keep the strong existing list. *What:* the eight principles, possibly trimmed if any are absorbed into other sections. *Maps from:* current Principles section.
11. **Open questions** — *Why:* the doc currently buries TBDs as "this proposal assumes…". *What:* a bullet list of questions to resolve before build (drafts policy, working-set policy on exit, permissions, multi-project behavior). *Maps from:* current "Product note" in Step 12 + "Implementation note" in Step 05.
12. **Implementation notes** — *Why:* engineering-facing notes are scattered. *What:* `projectId` scope, single project context across modules, success banner contracts, async vs prototype handoff. *Maps from:* current "Build implication" in Step 10 and similar notes.

---

## 14. Required Markdown Content Blocks for Redesign

Reusable Markdown blocks for the redesigned documentation page. These are intentionally empty so they can be filled with the final, redesigned copy.

```md
## Problem

<!--
One paragraph naming the user pain (forced project creation up front)
and the business cost (lost first-time users, broken trust).
-->

## Proposed Solution

<!--
One paragraph on progressive commitment:
- start with no project,
- support a soft working set,
- require a project only when the workflow needs a container,
- preserve continuity of selection,
- support mobility back to explore.
-->

## Flow Overview

<!--
A single high-level diagram or numbered list showing
Explore → Soft → Trigger → Attach → Inside project → Switch → Explore.
Include the four bands from the legend.
-->

## Step 1: Explore Without Commitment

<!--
- Entry state with no project (dashed picker).
- Catalog and other safe-without-project modules are visible.
- Recent projects shown as an option, not an obligation.
-->

## Step 2: Commit and Attach

<!--
- Hard gate at project-bound actions (e.g. BOM).
- In-page framing first ("BOMs live inside a project").
- Modal with three actions: Select / Create / Cancel.
- Minimal creation: name (required) + type (optional).
- Context transfer: explicit handoff naming the destination project.
-->

## Step 3: Work Inside a Project

<!--
- Top bar shows project chip; sidebar items are project-scoped.
- Success banner confirms continuity of selection.
- Project context is shared across BOM, Submittals, Approvals.
-->

## Step 4: Continue Across Contexts

<!--
- Project switcher opens from the project chip.
- Recent projects + search + create new.
- Returning to "no project selected" is a supported state.
- Define what happens to working sets on exit (open question).
-->

## Key States

<!--
Inventory of named states:
- No project (entry / return)
- Soft engagement (working set, optional save)
- Project required (in-page + modal)
- Selecting / creating
- Context transfer (loading)
- Project active (top bar + sidebar + success banner)
- Switching projects
- Disabled / unavailable (project-gated modules)
- Error states (creation failure, attach failure)
- Mobile variants (TBD)
-->

## Design Principles

<!--
1. No-project is a first-class state.
2. Commit only when the workflow requires it.
3. Commit modal pattern: Select / Create / Cancel.
4. Continuity of selection is the contract.
5. One project context across modules.
6. Mobility without trap doors.
7. Minimal creation at the door.
8. Language carries the constraint.
-->

## Open Questions

<!--
- What happens to the working set when the user leaves project context?
- What is the cancel-from-modal landing point?
- How are drafts handled (extension)?
- Permissions: who can create a project? who can attach to which project?
- Multi-project / multi-tab behavior?
- Mobile-specific behavior for the chip, modal, and switcher?
- Error recovery for creation and context transfer?
-->
```
