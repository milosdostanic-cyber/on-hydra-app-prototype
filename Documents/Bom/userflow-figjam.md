# BOM App — User Flow (FigJAM-ready)

> Use this document to generate a FigJAM user flow diagram.
> Each section is a **screen** (rectangle node). Indented bullets are **actions** (arrows with labels). Modals are **overlay nodes** connected with dashed arrows.

---

## CONVENTIONS

- **Screen** → rectangle
- **Modal / Drawer** → rounded rectangle with dashed border
- **Decision** → diamond
- **Action / Arrow label** → text on arrow
- **Dead spot / not yet designed** → red fill on node
- **Stub / placeholder** → yellow fill on node

---

## FLOW 1 — App Entry

```
[App Opens]
  → (redirect) → [Project List]

[Project List]
  → click project row → [Project Hub]
  → click "Create Project" → ⚠️ DEAD — no action defined

[Project Hub]  (tabs in sidebar)
  → "BOM" sidebar item → [BOM Landing]
  → "Submittal" sidebar item → [Submittal] 🟡 partial
  → "SeisBrace" sidebar item → [SeisBrace] 🟡 stub
  → "Content" sidebar item → [Content] 🟡 stub
  → "Dashboard" sidebar item → [Dashboard] 🟡 stub
```

---

## FLOW 2 — BOM Landing

```
[BOM Landing]
  → click "Upload a File" → (file picker) → [Parsing Review]
  → click "Search Catalogue Parts" → [BOM Search]
  → click "New BOM Project" → [Modal: Create BOM Project]
      → confirm → [Workspace]
      → cancel → [BOM Landing]
  → click project row → [Workspace]
  → click delete on row → (removes row, stays on page)
```

---

## FLOW 3 — BOM Search → Catalog

```
[BOM Search]
  → type query + submit → [Catalog Results]
  → back → [BOM Flow Overview]

[Catalog Results]  🟡 filtering not functional
  → click part row → [Catalog Part Detail]
  → back → [Catalog Home]

[Catalog Part Detail]
  → click "Add to Submittal" → [Modal: Select Project]
      → confirm → [Submittal]
  → "Quick Download" → 🟡 stub, no download
```

---

## FLOW 4 — BOM Core Flow (Upload Path)

```
[Parsing Review]  🟡 same mock data for every project
  → "Continue to Matching" → [Matching]
  → "BOM Home" → [BOM Landing]

[Matching]
  → "Skip to Workspace" → [Workspace]
  → click "Refine" on a row → [Narrow — per item]
  → "BOM Home" → [BOM Landing]

[Narrow — per item]
  → answer guided questions step by step
  → last step "Confirm" → [Recommend — per item]
  → "Previous" → back one step (stays on Narrow)
  → unknown item ID → [Error: Line not found]

[Recommend — per item]
  → "Confirm and go to Workspace" → [Workspace]
  → "Adjust Answers" → [Narrow — per item]
  → missing data → [Error: Recommendation unavailable]
```

---

## FLOW 5 — Workspace (Hub)

```
[Workspace]
  ↓ receives: added product OR swapped product from other pages

  → click "Add Item" or "ASC Products" → [ASC Products]
  → click "Upload" → [Modal: Confirm re-upload]
      → confirm → [Parsing Review]
      → cancel → [Workspace]

  → click part number / "Resolve" on row → [Modal: Resolve Item]
      → "Approve" → item marked confirmed (stays on Workspace)
      → "Manual Swap" → [ASC Products — Swap Mode]
      → "Approve with Feedback" → 🟡 stub, logs to console only
  → click delete on row → row removed (stays on Workspace)

  → click "Request Service" →
      (if unresolved rows) → [Modal: Confirm with unresolved items]
          → confirm → [Service Request]
          → cancel → [Workspace]
      (if all resolved) → [Service Request]

  → click "Export" (enabled only when all items confirmed) → [Export]

  → 🔴 DEAD: Translate flow — code exists but no button to trigger it
  → empty workspace → hero with "Upload" and "ASC Products" CTAs
```

---

## FLOW 6 — ASC Products (Browse & Swap)

```
[ASC Products]
  → "Pre-Products" tab / "Quantity Part" tab → 🔴 DEAD — tabs show same content
  → open filter drawer → filter by category/rating → table updates
  → click "Add to BOM" on row → [Workspace]  (with added product)
  → "Back" → [Workspace]

[ASC Products — Swap Mode]  (entered from Workspace "Manual Swap")
  → info alert: swap mode active
  → click "Swap" on row → [Workspace]  (with swapped product replacing row)
  → "Cancel" → [Workspace]
```

---

## FLOW 7 — Export

```
[Export]
  → select mode: Download CSV / Download Excel / Send Service Request / Email Summary
  → toggle column checkboxes
  → preview table  🟡 shows hardcoded mock, not actual workspace rows

  → "Export / Submit" →
      (mode = Service Request) → [Service Request]
      (mode = CSV / Excel / Email) → 🟡 toast only, no real file download
  → "BOM Home" → [BOM Landing]
```

---

## FLOW 8 — Service Request

```
[Service Request]
  → fill in form (contact info, project details, notes)
  → "Submit" → 🟡 toast only, no real submission → [Workspace]
  → "Back to Workspace" → [Workspace]
  → "BOM Home" → [BOM Landing]
```

---

## FLOW 9 — Orphaned Routes (exist but unreachable from UI)

These screens exist as coded routes but no button, link, or navigation leads to them.
They need to be connected to the flow or removed.

```
[Translate]  🔴 ORPHANED
  → per-item wizard: original vs ASC part
  → "Confirm" → advance to next item
  → "Skip" → advance to next item
  → completion screen → [Workspace]
  → "Exit" (any time) → [Workspace]
  NOTE: data is NOT connected to workspace state — uses independent mock data

[Field Mapping]  🔴 ORPHANED
  → map BOM columns to ASC fields
  → "Save" → [Workspace]
  → "Reset" → revert to defaults
  → "Cancel" → [Workspace]

[BOM Catalog]  🔴 ORPHANED  (overlaps with ASC Products page)
  → same table as ASC Products
  → "Add" on row → [Workspace]
  → "Back to Workspace" → [Workspace]
```

---

## FLOW 10 — BOM Flow Overview (Demo Page)

```
[BOM Flow Overview]
  → step card "Open (demo)" links:
      → [Parsing Review]  (hardcoded project "new")
      → [Matching]
      → [Narrow]
      → [Recommend]
      → [Workspace]
      → [Export]
  NOTE: Field Mapping, Translate, BOM Catalog are NOT listed here
```

---

## SUMMARY — All Screens

| Screen | Status | Connects to |
|---|---|---|
| Project List | 🟡 "Create Project" broken | Project Hub, BOM Landing |
| Project Hub | ✅ | BOM Landing, Submittal, stubs |
| Dashboard | 🟡 stub | — |
| Submittal | 🟡 partial | — |
| BOM Landing | ✅ | Parsing Review, BOM Search, Workspace, Create modal |
| BOM Flow Overview | ✅ demo only | Parsing Review, Matching, Narrow, Workspace, Export |
| BOM Search | ✅ | Catalog Results |
| Catalog Results | 🟡 no filtering | Catalog Part Detail |
| Catalog Part Detail | 🟡 stub download | Submittal (via modal) |
| Parsing Review | 🟡 mock data, no editing | Matching |
| Matching | ✅ | Workspace, Narrow |
| Narrow | ✅ | Recommend |
| Recommend | ✅ | Workspace, Narrow |
| Workspace | ✅ hub | ASC Products, Parsing Review, Export, Service Request |
| ASC Products | 🔴 tabs broken | Workspace |
| Export | 🟡 no real download | Service Request, BOM Landing |
| Service Request | 🟡 no real submit | Workspace, BOM Landing |
| Translate | 🔴 orphaned | Workspace |
| Field Mapping | 🔴 orphaned | Workspace |
| BOM Catalog | 🔴 orphaned | Workspace |

---

## OPEN QUESTIONS FOR FIGJAM

Before placing orphaned screens in the flow, these decisions are needed:

1. **Field Mapping** — does it happen before upload (step 0), after upload (step 1.5), or is it optional?
2. **Translate** — is it a mandatory step before workspace confirmation, or an optional pass after matching?
3. **BOM Catalog vs ASC Products** — are these two different surfaces or should one be removed?
4. **Tabs (Pre-Products / Quantity Part)** — what content belongs in each tab?
5. **Workspace Translate trigger** — should a "Translate All" button appear when items are in "Needs Review" state?
6. **Approve with Feedback** — does this open a comment form, a rating, or something else?
7. **Export** — what file formats are actually supported? Should export preview show real workspace data?
8. **Catalog in Sidebar** — should Catalog be a first-class navigation item?
9. **Service Request** — internal ASC team request or external customer form?
10. **Create Project (shell)** — what is the project creation wizard? Separate from BOM project creation?
