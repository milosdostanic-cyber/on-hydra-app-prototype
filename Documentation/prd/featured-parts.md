# Featured Parts — PRD (in-repo mirror)

**Source:** PDF export *Hydra-Featured Parts — PRD-130526-094705* (intake). This Markdown copy exists for **diffs in PRs** and agent search; treat PDF as legal attachment if they diverge.

**Implementation kickoff (AI + human):** [featured-parts-implementation-brief.md](./featured-parts-implementation-brief.md)

---

## 1. Summary

The “Featured Parts” feature enables administrators to highlight a curated set of **3 to 10** products on the **Product Catalog** landing page. A dedicated management interface in the **Admin Panel** and wiring the existing frontend stubs to a real **backend API** let ASC promote key items, new products, or high-demand parts to **all users globally**.

## 2. Problem statement

- **What:** Administrators have no way to highlight specific parts on the Product Catalog; the landing page lacks a dynamic way to showcase priority items.
- **Who:** ASC Content Managers and Administrators.
- **Why now:** Promoting key products drives engagement and visibility of new catalog additions.

## 3. Purpose / scope

**Goal:** Implement a global “Featured Parts” system: backend entity, admin management APIs, public API for the catalog, and admin UI for reordering/selecting parts.

### In scope

- Backend entity and migration for global featured parts.
- Admin APIs for managing the list (GET/PUT).
- Public API for fetching the list (GET).
- Admin Panel UI for searching and reordering parts.
- Wiring the existing **FeaturedParts** component in the **Content MFE**.

### Out of scope

- Multi-tenant customization (global only).
- Scheduled expiry or automated rotation.
- Click analytics.

## 4. How this is solved for today

The **FeaturedParts** component in the frontend uses **static mock data**; admins cannot change it without code.

## 5. Expected outcome

Admins curate and reorder featured parts via the Admin Panel; changes reflect immediately for all users on the Product Catalog.

## 6. Proposed solution

- **Backend:** `ContentFeaturedPart` entity linked to `ContentPart`; service logic enforces **3–10** part limit.
- **Admin frontend:** New “Featured Parts” page in **on-hydra-admin-frontend**; reuse existing content search for selecting parts.
- **Content frontend:** Replace mock data in **FeaturedParts** with the new **public GET** endpoint; wire navigation to part detail.

## 7. Success metrics

- **KPI persistence:** 100% successful persistence of featured lists with **3–10** items.
- **Performance:** &lt; 200 ms for the public featured parts API.
- **Efficiency:** Admin update time from “requires code change” to **&lt; 1 minute**.

## 8. Users and personas

- **Admin:** Manages the curated list.
- **Company user:** Sees featured parts on the catalog landing page.

## 9. User scenarios

1. **Curating:** Admin searches for a part (e.g. “Figure 101”), adds it, drags to first position, saves.
2. **Browsing:** Company user lands on Product Catalog, sees “Figure 101” first, clicks through to part details.

## 10. Requirements

### Functional

| ID | Requirement |
|----|-------------|
| **FR-1** | Global featured list shared across all tenants. |
| **FR-2** | **Minimum 3** and **maximum 10** featured parts enforced at **service layer**. |
| **FR-3** | Admins add, remove, and reorder parts via Admin Panel. |
| **FR-4** | Public, unauthenticated (beyond standard **CONTENT:READ**) **GET** for the ordered list. |
| **FR-5** | Admin UI reuses existing part search (**POST /api/content/search**) by figure number or name. |
| **FR-6** | Clicking a featured part card navigates to the part **detail page** via real routing. |

### Non-functional

| ID | Requirement |
|----|-------------|
| **NFR-1** | Public GET is lightweight and cacheable (sub-second). |
| **NFR-2** | Admin endpoints gated by **PermissionModuleName.CONTENT_FEATURED** and **UseAdminJWTGuard**. |
| **NFR-3** | Migration transitions from mock to DB-driven data without breaking UI stubs. |

## 11. UX / flows

1. **Admin:** Left nav → Content → Featured Parts → search/add → drag reorder → save.
2. **User:** Content MFE home → Featured row → click card → part details.

## 12. Data model (sketch)

**Entity: `ContentFeaturedPart`**

- `id` (UUID, PK)
- `contentPartId` (FK → `ContentPart.id`, unique)
- `displayOrder` (integer, 1–10)
- `createdAt`, `updatedAt`, `createdByUserId` (FK admin user)

## 13. Dependencies and affected applications

- **on-hydra-backend**, **on-hydra-admin-frontend**, **on-hydra-frontend-content**

**MFE placement (PRD):** Display remains in **on-hydra-frontend-content**; management UI in **on-hydra-admin-frontend**. `ContentPart.figureNumber` is the target level for featuring.

## 14. Risks

- **Navigation:** Ensure any `goToProductFamilyFeaturedPart` stub maps to real Content MFE routing to avoid 404s.

## 15. Open questions (resolved in PDF)

- **Q-1 Images:** Use **ContentPart** image URL from DB for cards (not separate custom image asset).
- **Q-2 Draft vs live:** **Save is immediately live** (no draft state).

## 16. Acceptance criteria (examples)

- **AC-1:** Admin adds only 2 parts and saves → error that **at least 3** parts are required.
- **AC-2:** After admin updates list, company user refreshes Product Catalog → sees updated order.
- **AC-3:** Clicking a featured card → correct part detail page.

---

## Appendix A — Prototype repo decisions (**on-hydra-app-prototype**)

These answers implement the review plan’s open questions so agents and PRs stay aligned without blocking on chat.

### A.1 Scope in this repository (plan Q1)

- **Default:** This repo ships **consumer UI + mock catalog data** for Featured Parts (see `src/catalog/FeaturedParts.tsx`, `catalogDemoData.ts`).
- **Backend, admin APIs, admin UI, and public GET wiring** follow PRD §13–14 in **on-hydra-backend**, **on-hydra-admin-frontend**, and **on-hydra-frontend-content**.
- Adding a **live API client** inside this prototype is an **explicit product/engineering decision** (env, auth, CORS, contract) — not implied by this PRD mirror.

### A.2 Where the row appears in this prototype (plan Q2) — **superseded by Appendix B (PM)**

- ~~Dual surface~~ **Withdrawn:** Featured row is **not** duplicated on the project **Content** hub.
- **Current rule:** see **Appendix B**.

### A.3 PR review baseline (plan Q3)

- **Feature code review:** use committed changes on the branch vs base (e.g. `main...HEAD`) for **tracked** files under `src/`.
- **Docs / rules:** include them in the same review once **committed**; untracked files are invisible to that diff until staged.

---

## Appendix B — PM follow-up (Matt, umbrella / Content search)

**Placement:** Featured parts sit in the **catalog / content-search** block **between the search bar and the quick category** section (`CatalogHome`).

**Visibility:**

- **Show** only on the **top-level catalog search page** (`/catalog`).
- **Hide** after the user navigates into search results or a category browse — i.e. **`/catalog/results?...`** must **not** render the row (category chips and “Search catalog” / “Browse all” route there today).

**Navigation:** Featured cards should take the user to the correct **part experience**; this prototype uses **part detail** at `/catalog/parts/:partId` (aligns with PRD FR-6 / AC-3). If “part listing” must mean a dedicated results/PLP URL, capture that as a product delta.

**Admin portal (out of this repo):** New admin area to pick **3–10** parts from **Content app** inventory, save **live** immediately, backed by public featured API — remains **on-hydra-admin-frontend** / **on-hydra-backend** per PRD §6–14; not implemented in **on-hydra-app-prototype**.
