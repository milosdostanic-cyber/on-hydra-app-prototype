# Hydra App Prototype

React + Vite prototype for BOM workflows in ASC Connected (Ant Design + Hydra theme).

## Branch: `Bom-V1-Update`

GitHub: [ooden-tech/on-hydra-app-prototype @ `Bom-V1-Update`](https://github.com/ooden-tech/on-hydra-app-prototype/tree/Bom-V1-Update)

### UX / UI / user flow — what changed

#### BOM import (guided 3-step flow)

End-to-end path: **upload → field mapping → parsing review → match verification → save to workspace**.

- **Resume interrupted imports** — If the user leaves mid-flow, the project workspace shows an incomplete-import banner (file name, current step, progress). **Continue** returns them to the right step. Progress survives a **page refresh** (client-side persistence).
- **Step orientation** — A **3-step progress strip** (Map → Parse → Match) appears on field mapping, parsing review, and matching so users always know where they are in the pipeline.
- **Field mapping** — Map BOM columns to ASC fields. User must map at least one of **Description**, **Figure Number**, **Part Number / SKU**, or **UPC** before continuing. **Mapping status** side panel shows how many fields are mapped and offers reset.
- **Parsing review** — Table layout **adapts to the identifier mapped** in step 1 (Description-led, UPC-led, or SKU-only columns). Rows are editable. Summary **alert** calls out how many lines were parsed and which may need attention. **Continue to matching** only when the session is valid; **missing-session** state if the user lands without data.
- **Match verification (table)** — Review all lines in one table: original input vs suggested ASC match. **Summary cards** (total, accepted, pending, skipped, match confidence). **Confidence filter** and **accept all high matches / skip rest** for faster review. Per row: **accept**, **refine** (manual pick), **skip**; **status** and **match score** columns (including “added manually”). **Save and import** stays **disabled until every line is accepted or skipped**.
- **Match verification (one-by-one)** — **Review one by one** from the table opens a guided single-line flow: approve, skip, or open manual pick. Same decisions as the table, optimized for line-by-line review.
- **Manual replacement** — **Refine** opens the **replacement picker**: context alert for the line being swapped, selectable ASC catalog table, then approve the chosen part (row shows as manually added).
- **After import** — Accepted and manually picked lines are **added to the workspace table**, not only a summary banner. Completed matching shows a **confirmed** state on the progress strip before returning to the workspace.
- **Cancel upload** — Clears the in-progress session so the workspace does not keep stale “continue” alerts.

#### BOM workspace & project

- **Workspace** — BOM lines table, warnings, post-import summary, and resume banners for active uploads.
- **Landing** — Start upload, open projects, **edit project name** (modal).
- **Upload** — File type and size validation with clear errors at upload time.

#### Product catalog (prototype)

- **Catalog home** — Entry into browse/search; **featured parts** cards linking into part routes.
- **Browse hierarchy** — Category “all parts”, subcategory hub, product line parts, part variants list, and variant detail — wired through shell navigation, breadcrumbs, and back patterns.

---

### Run locally

```bash
git fetch origin
git checkout Bom-V1-Update
git pull origin Bom-V1-Update
npm install
npm run dev
```

Open the URL Vite prints (often `http://localhost:5173/`).
