# Featured Parts — implementation brief (cross-repo + prototype)

**Purpose:** Single handoff for **backend-driven** Featured Parts: admin manages a **global** ordered list (3–10 `ContentPart` rows); **Product Catalog landing** shows that list; **cards navigate to the correct Part Detail** route. Use with **[featured-parts.md](./featured-parts.md)** (PRD), **[hydra-app-capabilities.md](../hydra-app-capabilities.md)** (map), **AGENTS.md** (prototype guardrails).

**Language:** English (repo standard).

---

## Executive summary

Replace the current **mocked** Featured Parts row with a **real global** system:

1. **Backend** stores and validates the list (including **displayOrder**); exposes **admin** and **public** APIs.
2. **Admin frontend** (`on-hydra-admin-frontend`) — **Content → Featured Parts** — search, add, remove, **drag-and-drop** reorder, **Save**; validation errors surfaced in UI; **server** is source of truth for 3–10.
3. **Content MFE** (`on-hydra-frontend-content`) — **FeaturedParts** fetches the **public GET**, renders real `ContentPart` fields, links to **correct Part Detail** routing (replace or wire `goToProductFamilyFeaturedPart` / stubs — **highest UX risk** if wrong).
4. **Prototype** (`on-hydra-app-prototype`) — remains Matt/umbrella **placement reference** and optional **localStorage** shim until APIs exist; does **not** replace production backend.

**Primary UX success (admin):** find a part, add, reorder, publish in **under a minute**.  
**Primary technical/design check (user):** featured **card click → correct Part Detail**, no broken routes.

---

## Product rules (non-negotiable)

| Rule | Detail |
|------|--------|
| List scope | **Global** — not tenant-specific, not company-specific. |
| Count | **Minimum 3**, **maximum 10** featured parts. |
| Order | Persisted as **displayOrder** (user-visible order = saved order). |
| Live after save | After successful **admin save**, all users see the new list on next **public GET** (no draft/campaign/scheduling in scope). |
| Images | **No** custom “featured-only” image; use **`ContentPart.imageUrl`** (or equivalent field already on part). |
| Validation | **3–10 enforced in backend service layer**, not UI-only. UI explains errors; API rejects invalid payloads. |

---

## 1. Backend (`on-hydra-backend`)

### Data model

- **New entity:** `ContentFeaturedPart` (name per team conventions).
- **Relation:** to existing **`ContentPart`** (FK `contentPartId` → part).
- **Fields (minimum):** `displayOrder` (int), `createdAt`, `updatedAt`, `createdByUserId`.
- **Migration** for the new table.
- **Unique constraint** on `contentPartId` — same part cannot appear twice in the global list.

### Service validation (required)

On **replace full list** (recommended admin contract) or equivalent:

- Reject save if count **&lt; 3** — e.g. message: **`At least 3 featured parts are required.`**
- Reject save if count **&gt; 10** — e.g. **`You can feature up to 10 parts only.`**
- Reject duplicate `contentPartId` in payload (defense in depth vs DB).
- Persist **order** exactly as sent (recompute `displayOrder` 0..n-1 or 1..n consistently).

**Canonical validation messages (align admin UI + OpenAPI examples):**

| Case | HTTP | Message body (example) |
|------|------|-------------------------|
| Count &lt; 3 | **400** | `At least 3 featured parts are required.` |
| Count &gt; 10 | **400** | `You can feature up to 10 parts only.` |
| Duplicate `contentPartId` in payload | **400** | (implementation-specific; must not 500) |
| Unknown / invalid part id | **400** | (implementation-specific) |

### APIs

**Admin (authenticated)**

| Method | Purpose |
|--------|--------|
| **GET** | Current featured list **with order** (and whatever fields admin UI needs: figure number, name, image URL, ids). |
| **PUT** | **Replace entire** ordered list (body: ordered array of `contentPartId` or part identifiers). Validates 3–10 and uniqueness server-side. |

**Public (catalog consumer)**

| Method | Purpose |
|--------|--------|
| **GET** | **Ordered** list of featured parts for Product Catalog landing (minimal fields for cards + id for navigation: e.g. `imageUrl`, name/title, figure number, part id / slug for route). |

Document OpenAPI or internal contract in the backend repo; link from this brief when stable.

**Suggested route paths (adjust to backend router conventions):** admin `GET`/`PUT` e.g. `/api/admin/content/featured-parts`; public `GET` e.g. `/api/public/content/featured-parts` or `/api/content/featured-parts` (unauthenticated, read-only). `POST /api/content/search` remains the existing content search contract.

---

## 2. Admin frontend (`on-hydra-admin-frontend`)

### Navigation

**Left nav → Content → Featured parts** (page title: **Featured Parts**).

### Page contents

- Short explanation: this list controls the **global** row on **Product Catalog landing**.
- **Search** input; results from **`POST /api/content/search`** (existing content search).
- Search must support **figure number** and **part name** (per backend contract).
- **Selected** featured list: drag handle, **remove** per row, count **“n of 10”** and **3–10 required** messaging.
- **Save** — calls admin **PUT**; show **loading** / **API error** on failure.
- **Cancel / discard** — follow **existing admin repo pattern** if one exists; otherwise explicit “Revert to last saved” is acceptable.
- **Add** — disabled or visually blocked when part **already** in list; block add when list **already 10** items.

### Reorder

- **Drag-and-drop** (e.g. `@dnd-kit` + Ant Design list/table patterns already in admin).
- Order on screen = order sent in **PUT** = `displayOrder` on backend.

### Validation UX

- Prefer **Save remains enabled** with clear **error on submit** (and/or inline **Alert**) when count invalid — matches AC-1 style messaging.
- Mirror backend error strings where possible for consistency.

### Current scaffold note

A Vite admin app exists under Hydra with **Content → Featured parts** and dual mode:

- **`VITE_API_BASE_URL` unset:** mock catalog + **`localStorage`** (`hydra.featuredPartKeys.v1`) for local demos aligned with the umbrella prototype.
- **`VITE_API_BASE_URL` set:** **GET** load + **PUT** save via `src/api/adminFeaturedParts.ts`, and **POST** search via `src/api/contentSearch.ts` — adjust `API_ROUTES` and JSON mapping to match OpenAPI when backend lands.

Replace mappings only if contract differs; keep **canonical 400 messages** in sync with backend.

---

## 3. Content search (admin)

- **Endpoint:** `POST /api/content/search` (existing).
- Use for admin only; parameters and response shape follow backend contract.
- Edge states: **search loading**, **no results**, **API error**.

---

## 4. Content MFE (`on-hydra-frontend-content`)

### FeaturedParts component

- **Remove** mock/static source of truth.
- **Fetch** public **GET** ordered featured list on catalog landing.
- Map fields to cards: **`ContentPart.imageUrl`**, name/title, **figure number**; short description only if already in existing card pattern — **no new visual system**.
- **Loading**, **error**, **empty** (“no featured parts”) states.
- **Missing image** — fallback per existing DS (placeholder), not a new arbitrary asset.
- **Long names** — ellipsis / existing typography tokens.
- **Responsive** horizontal row for 3, 5, 10 items — reuse existing catalog layout patterns.

### Routing (critical)

- **Click card → correct Part Detail page** for that part.
- Find and replace or correctly wire **`goToProductFamilyFeaturedPart`** (or any stub) so it uses **real route builder** from Content app router (params, family vs part slug, etc.).
- **Acceptance:** no 404 / wrong family route when clicking any featured card.

---

## 5. User flow (catalog)

**Content MFE Product Catalog home → Featured parts row → click card → Part Detail.**

User never edits the list.

---

## 6. Edge cases checklist

### Admin

- [ ] Empty featured list (initial).
- [ ] Loading current list.
- [ ] Search loading / no results / API error.
- [ ] Part already in list (Add disabled / clear state).
- [ ] Cannot add 11th part.
- [ ] Save with **&lt; 3** parts → clear error (**AC-1**).
- [ ] Save API failure (message + optional retry).
- [ ] Unsaved changes (navigate away) per repo pattern.

### Catalog (user)

- [ ] Loading featured row.
- [ ] Public GET error.
- [ ] No featured parts (hide row or empty state per product).
- [ ] Part without image.
- [ ] Long part name.
- [ ] Card click navigation (**AC-3**).
- [ ] Responsive row.

---

## 7. Acceptance criteria (product language)

| ID | Criterion |
|----|-----------|
| **AC-1** | Admin saves **only 2** parts → sees a **clear** error that **at least 3** featured parts are required (backend + UI aligned). |
| **AC-2** | After admin saves an updated list, a user **refreshing** Product Catalog landing sees the **new list in the same order** as saved. |
| **AC-3** | User clicks a featured card → lands on the **correct Part Detail** page for that part (no broken route). |

---

## 7b. Pre-ship verification (product / design)

### Admin — Featured Parts page

- [ ] Flow is obvious: **left nav → Content → Featured Parts → search/add → reorder → Save** (and **Cancel / revert** if the repo has that pattern).
- [ ] Copy states this list controls the **global** Product Catalog landing row (not tenant/company).
- [ ] Search is discoverable for **figure number** and **part name** (labels / placeholder).
- [ ] **Already featured** parts are obvious (`Add` disabled, or “Added” / row hint).
- [ ] **3–10** limit is obvious (count **n of 10**, helper text **minimum 3 required**).
- [ ] Reorder is obvious (**drag handle**); on-screen order matches **saved** / **public** order after refresh (**AC-2**).
- [ ] **Save** outcome is clear (success feedback + list live); errors explain **why** save failed (mirror backend strings where possible).

### Product catalog — Featured row

- [ ] Cards feel consistent with existing catalog / DS.
- [ ] **Image** (`ContentPart.imageUrl`), **name/title**, **figure number** hierarchy is scannable.
- [ ] Row behaves with **3, 5, and 10** items (scroll / wrap per existing pattern).
- [ ] **AC-3:** every card navigates to the **correct Part Detail** route for that part.
- [ ] Responsive behaviour is acceptable on narrow viewports.

---

## 8. Design system / repo rules

- Reuse **Ant Design** and **existing admin / content MFE** patterns: search field, table/list, buttons, alerts, spacing/typography **tokens** — no ad-hoc design.
- **Do not** add campaign/scheduling/draft scope.
- **Do not** change Product Catalog layout beyond what’s needed to wire data and routing.

---

## 9. Current state — `on-hydra-app-prototype` (this repo)

Facts for **Matt / umbrella prototype** only:

| Item | Location / behavior |
|------|---------------------|
| Placement | **`FeaturedParts`** only in **`src/shell/CatalogHome.tsx`** (between search and “Quick browse by category”). **Not** on **`/catalog/results`**, **not** on project `content` hub (per PM Appendix B). |
| Consumer data (until APIs) | **`src/catalog/featuredPartsConfig.ts`** + **`useSyncExternalStore`** in **`FeaturedParts.tsx`**; optional **`localStorage`** key `hydra.featuredPartKeys.v1` for local demos. |
| Limits | **`FEATURED_PARTS_MIN` / `FEATURED_PARTS_MAX`** in **`src/catalog/catalogDemoData.ts`**. |
| Navigation (prototype) | Cards → **`/catalog/parts/:partId`**. Production Content MFE must use **its own** part detail route builder. |
| Admin UI | **Not** in this repo — use **`on-hydra-admin-frontend`** (`/content/featured-parts`). |

### Allowed next steps *in this prototype*

- Polish **loading / error / empty** UI for **public fetch** once URL/auth/contract exist — keep a **single hook or fetch module** so mock ↔ API swap is one place.
- Update **[hydra-app-capabilities.md](../hydra-app-capabilities.md)** and **[featured-parts.md](./featured-parts.md)** Appendix B if placement or route meaning changes.

**Do not** (without explicit approval): change shared/core components or tokens; add production admin here.

---

## 10. Repositories summary

| Repo | Responsibility |
|------|------------------|
| **on-hydra-backend** | Entity, migration, unique on `contentPartId`, validation, admin GET/PUT, public GET. |
| **on-hydra-admin-frontend** | Content → Featured Parts page; search via `POST /api/content/search`; DnD reorder; Save → PUT. |
| **on-hydra-frontend-content** | FeaturedParts → public GET; real part fields; **correct Part Detail** navigation. |
| **on-hydra-app-prototype** | Reference UX + placement; mock/localStorage until wired. |

---

## 11. Definition of done — prototype PR (this repo only)

- [ ] Placement unchanged: **`/catalog` only**; order = search → featured → categories.
- [ ] No `FeaturedParts` on **`/catalog/results`** or project content (unless Appendix B re-opened).
- [ ] If still mock: **FR-2** empty/min messaging preserved; if API added: loading/error/empty covered.
- [ ] **`npm run build`** passes.
- [ ] **hydra-app-capabilities.md** updated if routes or behavior change.
- [ ] PR references PRD + this brief.

---

## 12. Agent prompt template (copy into Cursor)

Replace bracketed text; `@`-mention the right repo’s paths when working outside this prototype.

```text
@hydra-prd-ux-playbook @Documentation/hydra-app-capabilities.md @Documentation/prd/featured-parts.md @Documentation/prd/featured-parts-implementation-brief.md

Repo: [on-hydra-backend | on-hydra-admin-frontend | on-hydra-frontend-content | on-hydra-app-prototype]

Task: [e.g. Implement ContentFeaturedPart + migrations | Wire admin Featured page to GET/PUT + POST search | Replace FeaturedParts mock with public GET + fix Part Detail routing]

Constraints:
- Global list only; 3–10 validated on backend.
- Featured card uses ContentPart.imageUrl; no custom featured image field.
- Routing: featured card must hit correct Part Detail (verify goToProductFamilyFeaturedPart / router).
- Prototype: follow Appendix B placement if touching on-hydra-app-prototype; AGENTS.md — no token/core edits.

Deliver: [code + tests + API notes / link to OpenAPI]
```

---

## Quick links

| Artifact | Path |
|----------|------|
| App map | [Documentation/hydra-app-capabilities.md](../hydra-app-capabilities.md) |
| PRD | [Documentation/prd/featured-parts.md](./featured-parts.md) |
| Featured UI (prototype) | `src/catalog/FeaturedParts.tsx`, `src/shell/CatalogHome.tsx` |
| Admin API shim (Vite) | Sibling repo `on-hydra-admin-frontend/src/api/` + `src/api/README.md` |
| Prototype storage / limits | `src/catalog/featuredPartsConfig.ts`, `src/catalog/catalogDemoData.ts` |

---

## Note for Serbian speakers / napomena

Za rad u Cursoru na **ovom** repou: nalepi **`@featured-parts-implementation-brief`** zajedno sa playbook-om i mapom. Za backend/admin/content MFE otvori odgovarajući repo i priloži **isti** brief (kopija ili link) da agent ne meša prototipske putanje sa produkcijskim rutama.
