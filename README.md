# Hydra App Prototype

React + Vite prototype for ASC Connected (Ant Design + Hydra theme): BOM workflows, unified part search/detail, catalog browse, submittal, and cross-module **Action Trail** guidance.

## Branch: `merge/bom-unified`

GitHub: [ooden-tech/on-hydra-app-prototype @ `merge/bom-unified`](https://github.com/ooden-tech/on-hydra-app-prototype/tree/merge/bom-unified)

### Run locally

```bash
git fetch origin
git checkout merge/bom-unified
git pull origin merge/bom-unified
npm install
npm run dev
```

Open the URL Vite prints (often `http://localhost:5173/`).

---

## Cross-Module Action Trail — how to see Level 1, 2, and 3

**Action Trail** helps users remember where parts went after they add them from search or the part detail page. It uses three calm, non-blocking signals. You never get forced away from the part page.

**Before you start**

1. Run the app locally (see above).
2. Open a **part detail** page, for example:
   - `http://localhost:5173/search/results?q=all` → click any SKU row, **or**
   - `http://localhost:5173/catalog` → open a featured card or a preview SKU.
3. In the **top-right user menu**, make sure **Action guidance** is **ON** (default).

---

### Level 1 — Toast (immediate confirmation)

**What it is:** Instant feedback right after you commit a part to a module.

**What to click**

1. On the part detail page, pick a **variant** in the dropdown if the action requires it.
2. In the **Actions** panel on the right, click the **+** button next to **Add to BOM** (or **Add to Submittal** / **Send to Download Center**).
3. Complete the modal if one appears (pick a BOM project or submittal package).

**What you should see**

- A **success toast** at the top of the screen (e.g. “Added to …”).
- You **stay on the part page** — no redirect. You can keep searching and adding more parts.

**What it is for**

- Confirms the action worked in the moment.
- Does not interrupt your workflow.

**Also try (no Level 2 tag)**

- **Download Revit / STEP / PDF** (direct download) → toast only. **No** orange count tag appears in the sidebar.
- Add the same part to the same module again → toast says **Already in …** and the action row shows **In BOM ✓** (or similar). **No** new sidebar tag.

---

### Level 2 — Sidebar guidance tag + pulse

**What it is:** A persistent reminder in the left navigation that something new is waiting in a destination module.

**What to click**

1. After Level 1, **do not** open BOM yet. Look at the **left sidebar**.

**What you should see**

- An **orange filled tag** with a **number** next to the destination module:
  - **BOM** — after Add to BOM
  - **Submittal** — after Add to Submittal
  - **Download Center** — after **Send to Download Center** (queue only)
- When the count **increases**, the tag **pulses once**, then stays static.
- The tag shows in **expanded** sidebar (next to the label) and **collapsed** sidebar (on the icon).
- You can still browse search, catalog, or other modules — the tag stays until you open that destination.

**What it is for**

- Answers: “I added a few parts — where did they go?”
- Points you to the right module without forcing navigation.

**Turn it off**

- Top-right user menu → **Action guidance** → OFF.
- Add a part again → toast still works; **no** orange sidebar tag and **no** highlights in modules.

---

### Level 3 — Stay on the part page + in-module highlights

Level 3 has two parts: **(A) no forced redirect** and **(B) guidance when you eventually open the destination**.

#### (A) Stay on the part page

**What to do**

- Add one or more parts from the same part detail page or from search results.

**What you should see**

- You remain on search / part detail. Only Level 1 (toast) and Level 2 (sidebar tag) update.

**What it is for**

- Supports batch adding during a search session without losing your place.

#### (B) Sub-project highlight + “New” tags (after you open the module)

**What to click — BOM example**

1. Note the orange tag on **BOM** in the sidebar.
2. Click **BOM** in the sidebar.

**What you should see — step by step**

| Step | Where | What it looks like | What it is for |
|------|--------|-------------------|----------------|
| 1 | Left sidebar | Orange tag on **BOM** **disappears** | Opening the module clears the unseen count for that module |
| 2 | BOM **projects list** | Target project row has a **soft blue highlight** and primary border | Shows which sub-project received the part(s) |
| 3 | Open that project **workspace** | New line(s) have a **“New”** tag and row highlight | Shows exactly which rows were just added |
| 4 | Leave BOM and open it again later | **No** “New” tags on the second visit | First visit only — avoids permanent noise |

**Submittal**

1. Add to a package from the part page → orange tag on **Submittal**.
2. Open **Submittal** → tag clears; the **package card** is highlighted.
3. Open the package → new part rows show **“New”**.

**Download Center**

1. Use **Send to Download Center** (not quick download) → orange tag on **Download Center**.
2. Open a project → **Download Center** → tag clears; download history area is highlighted for new queue items.

**What it is for**

- Level 2 gets you to the right **module**.
- Level 3 (B) gets you to the right **project/package** and **row** inside that module.

---

### Quick smoke checklist

1. Part detail → **Add to BOM** → toast (L1) + sidebar tag (L2); stay on page (L3A).
2. Open **BOM** → tag gone; project row highlighted; workspace → **“New”** on row (L3B).
3. Re-enter BOM → no **“New”** tags.
4. Repeat for **Submittal** and **Download Center** queue; confirm quick download creates **no** tag.
5. Disable **Action guidance** in user menu → toasts still work; no tag or highlights.
6. Second browser tab → add in tab A → tag updates in tab B.

More detail: [`Documents/plans/2026-06-25-cross-module-action-trail-guidance-plan.md`](Documents/plans/2026-06-25-cross-module-action-trail-guidance-plan.md).

---

## Other UX on this branch

### Unified search (`/search/results`)

- Single results panel: search bar, filter tabs with neutral count tags, grouped content.
- Parts table: **click the whole row** to open the part (no separate Open column).

### Catalog home (`/catalog`)

- **Featured parts** in a tinted blue panel (hero section).
- Lower sections use the same headline / subtitle pattern as BOM (`BomCardTitle` + `PageDescription`).

### BOM import (guided 3-step flow)

End-to-end path: **upload → field mapping → parsing review → match verification → save to workspace**.

- **Resume interrupted imports** — workspace banner with **Continue**; progress survives refresh.
- **3-step progress strip** (Map → Parse → Match) on mapping, parsing review, and matching.
- **Field mapping** — at least one of Description, Figure Number, Part Number / SKU, or UPC required.
- **Parsing review** — table adapts to mapped identifier; editable rows; summary alert.
- **Match verification** — table or one-by-one review; **Save and import** disabled until every line is accepted or skipped.
- **Manual replacement** — Refine → ASC picker → row marked manually added.
- **After import** — lines land in the workspace table; progress strip shows confirmed state.

### BOM workspace & project

- Workspace table, warnings, post-import summary, resume banners.
- Landing: upload, projects list, edit project name.
- Upload: file type and size validation.

### Product catalog (prototype)

- Catalog home, featured parts, browse hierarchy (category → subcategory → product line → variants → detail).

---

## Older branch note

Previous BOM-focused README targeted branch `Bom-V1-Update`. This branch (`merge/bom-unified`) includes that BOM work plus unified search, Action Trail, and shell typography alignment.
