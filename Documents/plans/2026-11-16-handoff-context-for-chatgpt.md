# Hydra design: full context after the 13 Nov 2026 Product/Design meeting

Prepared by Milos Dostanic on 16 Nov 2026. This document is self-contained: background, people, every source with its link, what was said, what was verified in the code and the dev app, the FigJam board, the ready-to-send messages, corrections, working rules and open items.

---

## 0. Reader instructions

- **Shared handoff for Codex and Claude Code.** Read this file before continuing Hydra work. Update it in place with important decisions, completed work, verified results, and blockers that change the next step. Reread it before editing to pick up changes from the other session.
- I am **Milos Dostanic**, product designer at **Space Inch**, on the **Hydra / ConnectED** project for the client **RSFC** (formerly ASC Engineered Solutions).
- Talk to me in **plain Serbian**. Anything for the board, Jira or the team is in **plain, clear English** (short sentences, no jargon, no em dashes). Messages to Loza can be in **Serbian without diacritics** (c, s, z, dj instead of č, ć, š, ž, đ).
- **Never invent scope.** Read section 11 (working rules) before suggesting anything.

---

## 0.1 Where we are now (updated 17 Nov 2026)

Read this first. Details and history are in section 15.

**Valve Configurator / Valve Selection (17 Nov priority update)**
- [Milos and Lucas, 17 Nov](https://notes.granola.ai/d/1a07b14d-8fb3-42fd-9027-6f43076aaaf9): the meeting summary names Valve Configurator as Milos's focus through midweek. It mentions delivery in the next few weeks. The deliverable was not specified in the summary. [Hydra Design Priorities, Workstreams row 9](https://docs.google.com/spreadsheets/d/1RfdKSuG78b8a_uNrHy9Qc9j9cZ6DiIvxm7R5eeMtHSI/edit#gid=138234091) still lists Discovery and says design scope follows Product discovery. Check the immediate deliverable with Lucas and Micaely.
- [INTAKE - Valve Configurator](https://ooden.atlassian.net/wiki/x/BACnjw) records two goals. Help customers find a valid valve assembly from their requirements. Help Customer Care price and quote a valid configuration without creating a new SKU every time. Ed Macy owns the ASC requirements. Micaely is reviewing the intake with Matt. The agreed discovery step in the intake is to review the ThomasNet workbooks, draft the high-level process and debrief Ed. A pilot for Customer Care on one or two series is a proposal.
- The intake lists a current-state Figma flow, annotated PIM examples, a mock UI and a PIM/ConnectED/CPQ/CRM map as discovery visuals. The [current public tool](https://bim-catalog.asc-es.com/configurator/valve-configurator) starts with a required disclaimer. ASC documents component selection and CAD output, and the intake describes quoting as a separate manual path.
- [ROAD-100](https://ooden.atlassian.net/browse/ROAD-100) and [ROAD-109](https://ooden.atlassian.net/browse/ROAD-109) were both in Parking lot on 17 Nov. ROAD-100 covers the guided build and the ASC configuration, PIM and pricing process. ROAD-109 covers live pricing and availability after M3 integration. Jira lists 1 Dec 2026 as the ROAD-100 start and February 2027 as its target. The [Confluence roadmap](https://ooden.atlassian.net/wiki/spaces/Hydra/pages/2413035539/2027+Roadmap) still shows mid-April 2027. The intake records funding as pending.

**Part Cross-Reference v2 (BOM-431)**
- **Figma:** concepts A (table), B (part cards) and C (side by side) plus edge-case and state screens are in BOM - RSFC, frame 7651:4917 (section 15.1). Milos preferred the A1 filter placement (filters in a left column). The Figma filter panels still show the older sample attributes, including "Pressure rating".
- **PIM attributes:** Sofija sent the display mapping by product type (CON-347), saved as `Documents/pim/2026-11-16-pim-column-mapping-by-product-type.md`. Key facts: no pressure or temperature data in PIM; Size is per end (Valve Size on Reliable valves); Material is `Body`; Brand is `Product Brand`; 16 separate certification columns; empty values are hidden (section 15.9).
- **Prototype repo:** concept B is built at `/bom/cross-reference` on branch `feat/variant-modal-sidebar-layout` and committed (`a627a8b` code, `05e36ea` and `a87c041` docs) and pushed on 17 Nov to Milos's fork `milosdostanic-cyber/on-hydra-app-prototype`. For the team repo, a clean branch `feat/part-cross-reference-v2` was cut from team `main` (`ce699c6`) with only the six Part Cross-Reference code files and the PIM mapping doc (commit `ba5f62f`, build passes) and opened as [PR #16](https://github.com/ooden-tech/on-hydra-app-prototype/pull/16) on 17 Nov. The demo shows it after the PR is merged into `main`. What it does:
  - Both directions via the toggle "Competitor part → RSFC | RSFC part → competitor"; 12 cards per page; the existing match details modal opens from a card.
  - Distilled cards: the whole card is the action; the best match sits under a section rule with the count ("Best of 2 RSFC matches"); 72 px product photo aligned with three text lines. Card height 186 px (competitor → RSFC) and 162 px (RSFC → competitor).
  - Filter panel "version 2" (chosen from the artifact below): 238 px wide, every group open, a count per value, 0-count values disabled. Groups: Match type, RSFC origin, then RSFC attributes from the PIM mapping (Product type, Size, End connection, Material, Certifications, Brand). If the panel does not fit the visible height it switches to compact rows that open flyouts, so it never scrolls.
  - Only the card area scrolls; the toolbar and the pagination footer stay in view. The footer carries the count ("Showing 1–12 of 23 competitor parts"). Applied filters show as grey Hydra `Tag / Default` tags above the cards; the whole tag removes the filter.
  - States: loading skeletons, error with retry (`?simulateError=1`), no results for filters, no results for a search term. "Show all parts before a search" is still an open decision (BOM-360); `?start=search` switches to search-first.
- **Artifact with three filter versions** (for discussion): https://claude.ai/artifact/C53RuNMSFTMwarQTaEnrK5 (private until shared). Version 2 is the one in the repo.
- **Decisions by Milos on 17 Nov:** UX-006 (min screen height 970) is not applied in the repo; card hover matches the catalog cards; tags on cards have a border; filter version 2; applied filter tags grey, Hydra DS and Ant Design only.

**Next steps**
1. Get [PR #16](https://github.com/ooden-tech/on-hydra-app-prototype/pull/16) reviewed and merged so the Cloudflare demo shows the new page; run the `hydra-ux-audit` pass on `/bom/cross-reference`.
2. Share the concepts with Matt by Wed 18 Nov, ask which concept to take forward and whether showing all parts before a search is OK (message 10.2); comment on BOM-431 with the links.
3. Update the Figma filter panels to the PIM mapping (remove Pressure rating) and add a removable tag to the Hydra DS Figma file if the pattern is kept.
4. Still open from the meeting: priorities with Lucas and the sheet, Jira tickets on Wednesday, UX rules link in Discord, PR #965, then the CRM iframe version, James's review, e-commerce discovery and the service blueprint.

---

## 1. Summary

At the Product/Design weekly on **13 Nov 2026**, the team agreed that the client wants ConnectED to feel like an online store ("e-commerce"). James (client) is leaning toward shutting down **Connect Portal**, a separate BigCommerce site for part search and quotes, and moving its functionality into ConnectED.

- **First step:** redesign the **Part Cross-Reference** page (BOM module). Show all parts without forcing a search first, let users search from a competitor part or from an ASC part (toggle), and add filters by category and attributes. Matt: "a day or two of design", back-and-forth by midweek (**Wed 18 Nov**), then feedback from James.
- **Right after:** **e-commerce discovery**: define what "e-commerce" means for ConnectED, build a **service blueprint** of today's flow from what we know, review it with James in a 1-hour working session, then draw the future state and prototype 1 to 2 directions.
- **Development starts only** after a clear direction, a design framework and hi-fi screens.
- **Low priority:** Sidebar navigation (Matt expects the left sidebar to go away).
- **Parked:** Valve Configurator design (waits for business rules).

---

## 2. People

| Person | Role, from sources |
|---|---|
| Milos Dostanic | Designer (me). Shared the design priorities sheet and the UX rules/skills in the meeting. Owns BOM-431, UATL-557, UATL-657. |
| Matt Pettit | Led the meeting and talks to James. Gave the Part Cross-Reference requirements. Uses the QA agent for technical questions. |
| Lucas Saeed | Design. Proposed the service blueprint and quick interactive prototypes. Asked Milos to turn his workstreams into a list to share with the team. Did the earlier redesign of the static matches search screen (BOM-425, Done Sep 2026). Authored the User Personas page. Friend of Milos, casual tone is fine. |
| Micaely Krause | Has the Valve Configurator project on her plate; reviewing the intake with Matt. Getting GitHub access from Loza. |
| Ivan Pavao Lozancic ("Loza") | Engineering lead. Built the QA agent (answers technical questions from the source code). Did BOM-422 (merged Cheat Sheets into the shared match tables). Raised the CRM iframe case (BOM-431 comment, 11 Nov). |
| João Pedro Vieira Leão | Engineer. Built the original Cheat Sheets backend (BOM-360, 361, 362, 363, 372, 373, 414, 423). |
| Sofija Zec-Baškarad | Engineer. PIM attribute work (CON-346, CON-347, CON-367). |
| Jurica Ćapin | Engineer. Built the Cheat Sheets frontend and CRM integration (BOM-365 to 368, 389, 391, 394, 395). |
| James Simpson | Main decision maker on the client side. "Hungry" for e-commerce progress (Matt). |
| Ed Macy | Client side. Owns Valve Configurator requirements (2027 themes page). |

---

## 3. All links

### Meeting and planning
- Gemini notes and full transcript, Product/Design weekly, 13 Nov 2026: https://docs.google.com/document/d/1A4ZsH0upqxzh6xl_zH1iBf85tPz9faUxh9N0d_DGu2c/edit
- Hydra Design Priorities sheet (tabs "Workstreams" and "Detailed Tasks (Reviewed)"): https://docs.google.com/spreadsheets/d/1RfdKSuG78b8a_uNrHy9Qc9j9cZ6DiIvxm7R5eeMtHSI/edit
- FigJam board "Hydra Design - Next Steps": https://www.figma.com/board/W0T3Wr7stZaOVarRnxrgci
- FigJam "Your next 3 days" section: https://www.figma.com/board/W0T3Wr7stZaOVarRnxrgci/Hydra-Design---Next-Steps?node-id=8-397

### Jira (ooden.atlassian.net)
| Key | Title / why it matters | Status |
|---|---|---|
| [BOM-431](https://ooden.atlassian.net/browse/BOM-431) | [Design] Redesign Part Cross-Reference (Static matches) for Hydra app and CRM iframe. Milos's ticket. | In Review |
| [BOM-360](https://ooden.atlassian.net/browse/BOM-360) | Search Cheat Sheets Matches. Defines "search only, no list-all, no export". | Done |
| [BOM-361](https://ooden.atlassian.net/browse/BOM-361) | Load ASC Cheat Sheets Dataset. | Done |
| [BOM-362](https://ooden.atlassian.net/browse/BOM-362) | Secure and Audit Cheat Sheets Lookup. 60 requests/min per company; ASC and Ferguson access. | Done |
| [BOM-359](https://ooden.atlassian.net/browse/BOM-359) | Epic: BACKEND, Cheat Sheets Lookup. | In Progress |
| [BOM-363](https://ooden.atlassian.net/browse/BOM-363) | Expand BOM Cheat Sheets to full DB, delivery plan (James asked Matt). | Done |
| [BOM-364](https://ooden.atlassian.net/browse/BOM-364) | Epic: FRONTEND, Cheat Sheets BOM MFE Search Experience. | To Do |
| [BOM-365](https://ooden.atlassian.net/browse/BOM-365) | Cheat Sheets Entry Card on BOM Project Detail. | Done |
| [BOM-366](https://ooden.atlassian.net/browse/BOM-366) | Static Match Search Results Page. | Done |
| [BOM-367](https://ooden.atlassian.net/browse/BOM-367) | Part Match Details Modal. | Done |
| [BOM-368](https://ooden.atlassian.net/browse/BOM-368) | Connect Cheat Sheets Frontend to Backend Contract. | Done |
| [BOM-372](https://ooden.atlassian.net/browse/BOM-372) | Static matches search update + fix data (ticket text says "competitor attributes only"; current code also searches ASC SKU/figure). | Done |
| [BOM-373](https://ooden.atlassian.net/browse/BOM-373) | Enrich static matches tables with images. | Done |
| [BOM-391](https://ooden.atlassian.net/browse/BOM-391) | Backend: Admin-scoped Cheat Sheets search for CRM flow. | Done |
| [BOM-395](https://ooden.atlassian.net/browse/BOM-395) | Frontend: Upload-file and Static-Matches CTAs in Quote-scoped BOM workspace (CRM). | Done |
| [BOM-409](https://ooden.atlassian.net/browse/BOM-409) | BOM Data Auto-Sync and Static Matches in Matching (initiative). | In Progress |
| [BOM-413](https://ooden.atlassian.net/browse/BOM-413) / [BOM-414](https://ooden.atlassian.net/browse/BOM-414) | Include the rest of the dataset for cheatsheet search (search both tables). | Done |
| [BOM-415](https://ooden.atlassian.net/browse/BOM-415) | Remove Snowflake dependencies. | To Do |
| [BOM-417](https://ooden.atlassian.net/browse/BOM-417) | BOM Mirroring Rework. | In Progress |
| [BOM-421](https://ooden.atlassian.net/browse/BOM-421) / [BOM-422](https://ooden.atlassian.net/browse/BOM-422) | Unify the data side of the competitor matchset (Cheat Sheets merged into shared match tables, 8 Oct, Loza). | Epic To Do / Story Done |
| [BOM-423](https://ooden.atlassian.net/browse/BOM-423) | Figure-level matches in Cheat Sheets search. | Done |
| [BOM-425](https://ooden.atlassian.net/browse/BOM-425) | Re-design the static part matches search screen (Lucas). | Done |
| [BOM-430](https://ooden.atlassian.net/browse/BOM-430) | Static part modal is not working correctly (fixed). | Done |
| [CON-320](https://ooden.atlassian.net/browse/CON-320) | R&D Part Listing Page Attributes (PIM data is uneven; prioritise attributes). | Done |
| [CON-346](https://ooden.atlassian.net/browse/CON-346) | Research Reliable brand parts data structure and attributes on PIM. | QA - PROD |
| [CON-347](https://ooden.atlassian.net/browse/CON-347) | Pre-defined part variant attribute display mapping per part type, with fallback (Sofija). | In Review |
| [CON-367](https://ooden.atlassian.net/browse/CON-367) | Persist the Reliable PIM columns. | QA - PROD |
| [UATL-557](https://ooden.atlassian.net/browse/UATL-557) | Document the Hydra design system and support implementation and design QA (Milos). | In Progress |
| [UATL-628](https://ooden.atlassian.net/browse/UATL-628) | Reusable molecules and design system integration (Milos). | In Progress |
| [UATL-642](https://ooden.atlassian.net/browse/UATL-642) | [Design] Hydra Admin, Figma coverage, missing screens, design QA (Milos). | In Progress |
| [UATL-644](https://ooden.atlassian.net/browse/UATL-644) | [Design] Admin, Access Blacklist and Featured Parts (Milos). | In Progress |
| [UATL-648](https://ooden.atlassian.net/browse/UATL-648) | [Design] Admin design validation and handoff QA (Milos). | To Do |
| [UATL-650](https://ooden.atlassian.net/browse/UATL-650) | Standardize file type tag colors across the application (Milos). | To Do |
| [UATL-653](https://ooden.atlassian.net/browse/UATL-653) | UX-003: Standardise module entry page title across RSFC Figma files (Milos). | To Do |
| [UATL-656](https://ooden.atlassian.net/browse/UATL-656) | Hydra DS: one set of table cell patterns and tag colors for all modules. | To Do |
| [UATL-657](https://ooden.atlassian.net/browse/UATL-657) | [Design] Document Hydra UX pattern rules in Confluence (Milos). | To Do |

### Confluence (space "Hydra")
- Hydra UX pattern rules: https://ooden.atlassian.net/wiki/spaces/Hydra/pages/2411331589/Hydra+UX+pattern+rules
- 2027 Roadmap: https://ooden.atlassian.net/wiki/spaces/Hydra/pages/2403041281/2027+Roadmap
- Proposed Themes for 2027 work product: https://ooden.atlassian.net/wiki/spaces/Hydra/pages/2383609860/Proposed+Themes+for+2027+work+product
- Strategic Planning - Q4: https://ooden.atlassian.net/wiki/spaces/Hydra/pages/2336981004/Strategic+Planning+-+Q4
- User Personas: https://ooden.atlassian.net/wiki/spaces/Hydra/pages/2213806083/User+Personas
- PRD - Static Matched Part Search (Cheat Sheets): https://ooden.atlassian.net/wiki/spaces/Hydra/pages/2081193998/PRD+-+Static+Matched+Part+Search+Cheat+Sheets
- DELIVERY - Static Matched Part Search (Cheat Sheets), July 2026 plan, partly outdated: https://ooden.atlassian.net/wiki/spaces/Hydra/pages/2146861058
- STORY - Connect Cheat Sheets Frontend to Backend Contract (misalignment register D-1 to D-14): https://ooden.atlassian.net/wiki/spaces/Hydra/pages/2160525313
- STORY - Backend: Admin-scoped Cheat Sheets search for CRM flow: https://ooden.atlassian.net/wiki/spaces/Hydra/pages/2194014230
- DELIVERY - BOM Data Alignment Tasks (BOM-413, 415, 417, 421): https://ooden.atlassian.net/wiki/x/BADDhQ
- Report on Cheat Sheets rows without a category: https://ooden.atlassian.net/wiki/x/AQCdgQ
- INTAKE - Valve Configurator: https://ooden.atlassian.net/wiki/spaces/Hydra/pages/2410086404/INTAKE+-+Valve+Configurator
- PIM Cleanup: Workstreams and Order of Operations: https://ooden.atlassian.net/wiki/spaces/Hydra/pages/2406875153/PIM+Cleanup+Workstreams+and+Order+of+Operations
- INTAKE - Reliable PIM Cleanup & Integration: https://ooden.atlassian.net/wiki/spaces/Hydra/pages/2404974594

### Figma
- Part Cross-Reference flow (BOM - RSFC file, section 7560:210686): https://www.figma.com/design/Ht3Up5MlRAKjK7eCuAy05L/BOM---RSFC?node-id=7560-210686
- Part Cross-Reference v2 concepts (BOM - RSFC file, page "Cheat Sheet · Part Cross-Reference", frame 7651:4917, see section 15): https://www.figma.com/design/Ht3Up5MlRAKjK7eCuAy05L/BOM---RSFC?node-id=7651-4917
- Artifact "Cross-Reference Filter Options", three interactive filter versions (private until shared): https://claude.ai/artifact/C53RuNMSFTMwarQTaEnrK5
- Hydra Ant Design - DS (design system file key 3ghYBXR6XVUEaeBo3D5E4q): https://www.figma.com/design/3ghYBXR6XVUEaeBo3D5E4q

### Code
- Main app repo: https://github.com/ooden-tech/on-hydra-app (branches `develop` and `azure-production`; production runs `azure-production`)
- UX skill pull request (UATL-657, open, not merged): https://github.com/ooden-tech/on-hydra-app/pull/965
- Cheat Sheets search query: https://github.com/ooden-tech/on-hydra-app/blob/develop/apps/on-hydra-backend/src/modules/bom/database/repositories/competitor-part-variant-asc-content-part-variant.repository.ts
- Cheat Sheets service: https://github.com/ooden-tech/on-hydra-app/blob/develop/apps/on-hydra-backend/src/modules/bom/services/bom-cheat-sheets.service.ts
- Response fields (DTO): https://github.com/ooden-tech/on-hydra-app/blob/develop/apps/on-hydra-backend/src/modules/bom/dto/search-bom-cheat-sheet-matches.response.dto.ts
- Rate limit guard: https://github.com/ooden-tech/on-hydra-app/blob/develop/apps/on-hydra-backend/src/modules/bom/guards/cheat-sheets-company-throttler.guard.ts
- BOM backend README (rate limit note): https://github.com/ooden-tech/on-hydra-app/blob/develop/apps/on-hydra-backend/src/modules/bom/README.md
- Live page component: https://github.com/ooden-tech/on-hydra-app/blob/develop/apps/on-hydra-frontend-bom/src/modules/business/bom/pages/BomStaticMatchesPage/index.tsx
- Match details modal: https://github.com/ooden-tech/on-hydra-app/blob/develop/apps/on-hydra-frontend-bom/src/modules/business/bom/components/StaticMatchesPartMatchModal/index.tsx
- Prototype repo (team): https://github.com/ooden-tech/on-hydra-app-prototype
- Prototype Part Cross-Reference page (Milos's fork, branch `feat/variant-modal-sidebar-layout`, route `/bom/cross-reference`): https://github.com/milosdostanic-cyber/on-hydra-app-prototype/blob/feat/variant-modal-sidebar-layout/src/bom/pages/BomPartCrossReferencePage.tsx
- Prototype Part Cross-Reference v2 files (local branch `feat/variant-modal-sidebar-layout`, commit `a627a8b`, not pushed yet): `src/bom/pages/BomPartCrossReferencePage.tsx`, `src/bom/components/PartCrossReferenceCard.tsx`, `src/bom/components/PartCrossReferenceFilters.tsx`, `src/bom/components/AppliedFilterTag.tsx`, `src/bom/data/partCrossReferenceData.ts`, `src/bom/data/pimDisplayMapping.ts`
- PIM display mapping by product type from Sofija (CON-347): `Documents/pim/2026-11-16-pim-column-mapping-by-product-type.md`
- Concept B implementation plan: `Documents/plans/2026-11-17-part-cross-reference-concept-b-plan.md`
- Prototype demo data (42 categories, sample parts): https://github.com/milosdostanic-cyber/on-hydra-app-prototype/blob/feat/variant-modal-sidebar-layout/src/bom/data/partCrossReferenceData.ts

### Environments
- Prototype demo (Cloudflare Workers): https://on-hydra-app-prototype.iplozancic.workers.dev/. Loza's Discord post from 11 Sep 2026 (forwarded on 12 Nov) says pushes to `main` in `ooden-tech/on-hydra-app-prototype` automatically rebuild the demo and deploy successful builds. The demo requires sign-in (checked on 16 Nov 2026).
- On 16 Nov 2026, the local `feat/variant-modal-sidebar-layout` checkout (`0666865`) had 23 uncommitted app files. Compared with the team's GitHub `main` (`54a4f02`), 21 differed and 2 were missing from `main`. The live demo build was missing the `/bom/cross-reference` route. The deployed commit is unknown.
- Later on 16 Nov 2026, the 23 app edits were committed locally (`a977f94`). The prototype source, assets, and build configuration were merged into the private team repo's `main` through [PR #15](https://github.com/ooden-tech/on-hydra-app-prototype/pull/15) at `ce699c6`. A clean build and the catalog-to-BOM unit test passed. Cloudflare's automatic build from `main` succeeded, but the demo returned HTTP 503 because runtime authentication was not configured. Someone with access to the Cloudflare Worker needs to set `BASIC_AUTH_USER` and `BASIC_AUTH_PASSWORD` under Variables and Secrets. Live Part Cross-Reference still needs verification after access is restored.
- Production ConnectED: https://connected.asc-es.com (Milos's account "Example Company" gets "You do not have permission to view this page" on Part Cross-Reference; the page is gated by the `BOM_STATIC_MATCHES` feature, enabled only for verified companies such as ASC and Ferguson).
- Dev ConnectED: https://hydra-dev.spaceinch.tech
- Dev Part Cross-Reference page (works for "first-test-company"): https://hydra-dev.spaceinch.tech/first-test-company/bom/projects/953b93e4-2635-4e1d-a0ba-982b27ef5328/static-matches
- Dev admin app: https://admin.hydra-dev.spaceinch.tech

### Benchmarks (named in the 2027 roadmap)
- Ferguson category page (store-style listing): https://www.ferguson.com/category/pipe-fittings/
- Ferguson product page: https://www.ferguson.com/product/gruvlok-fig-fp7000-3-in.-lightweight-flexible-coupling-with-a-gasket-g1605006103/1966762.html

---

## 4. What was said in the meeting (13 Nov), with transcript timestamps

- **00:01:44 to 00:05:08, design QA and workstreams.** Milos presented the priorities sheet (main work areas, detailed tasks, priorities, statuses, linked to Jira and Figma). Lucas and Milos will define the top priorities for the next 1 to 2 weeks and create Jira tickets.
- **00:05:08, Part Cross-Reference is the most important.** Matt: "that is our first step into kind of reworking the whole site to be e-commerce-like… what you did by adding the categories is good… but we need to expose all of the data… it's just an internal part search for matches… like I wrote in the chat." Matt's most detailed feedback is in the Discord #-bom channel.
- **00:06:21 to 00:09:53, Sidebar.** Matt expects the left sidebar to go away, replaced by cards or calls to action on a landing page ("do you want to flip a part?"). Make sidebar low priority. Add a new workstream: "e-commerce design discovery" or "e-commerce UI refresh". Milos noted the sidebar has poor UX across all modules.
- **00:09:53 to 00:16:04, why e-commerce.** Micaely: a more fluid experience instead of separate modules. Matt: users don't purchase on the site, but treat it that way. Connect Portal is an off-the-shelf BigCommerce product, linked from the bottom-left of ConnectED; "a part search that essentially goes to a quote". James has an internal representative doing discovery on extending BigCommerce; the expectation is that it's too big, so ConnectED should absorb it. Today there are 3 part searches (public ASC site, ConnectED, BigCommerce); the goal is one. Later the public website could use our search, and users log in to ConnectED to continue. Matt: "that's what's being thrown on us… e-commerce this, e-commerce that… there's a lot of unknowns that we all have to uncover."
- **00:16:04 to 00:23:38, service blueprint.** Lucas proposed a service blueprint (stages, actors, touchpoints; current state then future state) to understand how users use the tool and align with business motivations. Matt: discovery should be an active workstream now; build it "based on what we know today and then have a working session with James… this is what we know today, tell us where it's wrong"; a one-hour meeting; find who can answer the unknowns. Micaely: it helps deliver value iteratively without rebuilding the whole platform.
- **00:23:38 to 00:25:54, before implementation.** Matt wants a whole design framework and hi-fi screens before implementation starts; a working prototype with a clear direction (e.g. "start with cards… a search up here"). Lucas: quick interactive prototypes, even completely different directions, test with users.
- **00:26:55 to 00:28:00, Part Cross-Reference requirements (Matt).** "Let's make it filterable. Expose all the parts… toggling between… am I entering a competitor part… which is like 90% of the case or am I entering an ASC part… how many matches do I actually have… a search bar, a way to toggle… exposing all of the parts on the page and then some kind of filterability of… categories or attributes… I don't know the name of it but I know it's a valve and I know it's a half-inch valve… stainless steel." Same pattern will be on the main search page with heavy filterability. "Probably just a day or two of design… maybe midweek by next week, we should have a good back and forth… and some feedback from James. James is hungry on this right now." Then e-commerce discovery, then service blueprint, then prototypes.
- **00:29:18, Valve Configurator.** No design focus yet; business logic rules still being worked out; it will dovetail with product search and the e-commerce experience because it is also a filter search.
- **00:31:22 to 00:38:55, UX skills.** Milos shared his predefined UX rules/skills (Markdown files) that check consistency across Figma and the repository (e.g. table cells using tags vs plain text vs badges). Action: share the Confluence page in Discord and upload the skills to GitHub so the team can reuse them in any AI coding tool.
- **00:42:34 to 00:43:42, GitHub and QA agent.** Loza to give Micaely access to the GitHub repository with the team's AI skills. Matt uses the QA agent (built by Loza) to answer technical questions against the source code when Loza is not available; useful for the Valve Configurator.

**Next steps (Gemini notes):** Milos + Lucas define the top priorities for the next 1 to 2 weeks; Milos creates Jira tickets for those priorities; Milos shares the Confluence UX rules link in the team Discord; Milos uploads the UX skill files to GitHub; Loza gives Micaely GitHub access.

**Decisions (Gemini notes):** Part Cross-Reference search is the top design priority; Sidebar navigation redesign is low priority; a new E-commerce design discovery / UI refresh workstream is added.

---

## 5. Design priorities sheet (content as of 13 Nov)

### Workstreams tab
| Workstream | Scope | Priority | Status | Notes |
|---|---|---|---|---|
| Design QA across modules | Check key flows in every module against Figma and the component library; record differences and retest fixes. (UATL-557) | High | In Progress | |
| Sidebar navigation UX | Fix collapse/expand behaviour and align the Sidebar with the top bar. | Low | To Do | |
| Part Cross-Reference | Redesign for Hydra and the client's Dynamics 365 CRM. Hydra version designed and approved by Matt. Next: show all matches in both search directions with filters (Matt, 12 Nov; confirm the scope change vs BOM-360), then the CRM version, then James's review. (BOM-431, BOM-360) | High | In Progress | Waiting on: attribute list from Engineering for filters, and Matt / James OK on showing all matches (changes BOM-360). |
| Reusable components | Define and publish reusable components and states in Figma; document where to use them; verify module usage. (UATL-628) | Medium | In Progress | |
| Documentation and handoff | Record proposals, approved changes and what shipped; link Figma screens and behaviour to verify. (UATL-557) | Medium | In Progress | |
| Hydra UX rules | Keep the UX rules (UX-001 to UX-012 at the time) applied; add rules for patterns that still differ. (UATL-657) | Medium | In Progress | |
| Admin design handoff | Finish Featured Parts screens; verify Admin forms, dialogs, permissions and feedback states. (UATL-648) | Medium | In Progress | |
| Valve Configurator rebuild | Scope after Product discovery. Micaely reviewing the intake with Matt; meetings with James and Ed Macy next; 2027 roadmap proposes Valve Selection; Q1 2027 discussed for kickoff; budget and dates pending. | Medium | Discovery | |
| Reusable agent skills | Turn the hydra-ux-pattern skill into an agent that checks and fixes UX rules in Hydra and other projects. | Low | Proposed | |

### Detailed Tasks tab (23 tasks)
| Task | Workstream | Priority | Status |
|---|---|---|---|
| Check core flows in staging against Figma | Design QA | High | In Progress |
| Check buttons, tables and tokens against the Hydra library | Design QA | High | In Progress |
| Check empty, no-match and error screens | Design QA | Medium | Needs Validation |
| Define what the Sidebar does when it collapses | Sidebar | High (now low per meeting) | Needs Decision |
| Align the Sidebar and top bar in the same Figma frame | Sidebar | Medium | To Do |
| Design Part Cross-Reference inside a Dynamics 365 quote | Part Cross-Reference | High | To Do |
| Define what users see when a part search finds nothing (does "ball valve" return matches?) | Part Cross-Reference | Medium | Needs Validation |
| Sketch three ways to browse matching parts in BOM (competitor → ASC and ASC → competitor; keep the details modal; confirm scope with Matt and James) | Part Cross-Reference | High | To Do |
| Choose the filters for the Part Cross-Reference results (get attributes from Engineering) | Part Cross-Reference | High | To Do |
| Set a rule for actions inside BOM and SPEC table rows (BOM "Change match" vs SPEC "Continue review"; Lucas sync 11 Nov) | Reusable components | High | Needs Decision |
| Decide which missing Figma component states to add (search error with retry, delete confirmation) | Reusable components | Medium | In Progress |
| Check three published components on the screens that use them (OptionCard, Stat Tile, Empty State Block) | Reusable components | Medium | Needs Validation |
| Use the same PDF and DWG tag colors across file tables (UATL-650) | Reusable components | Low | To Do |
| Document approved Figma changes for engineering handoff | Documentation | Medium | In Progress |
| Log my work in the Changelog | Documentation | Medium | To Do |
| Check the Hydra UX rules against real screens (UATL-653, Lucas sync 11 Nov) | Hydra UX rules | Medium | In Progress |
| Write rules for new inconsistencies found in QA (compare with Lucas) | Hydra UX rules | Medium | To Do |
| Apply the 20 px rule to separate BOM filters | Hydra UX rules | Medium | Needs Validation |
| Finish UX-003 for Admin and Part Search headings | Hydra UX rules | Medium | To Do |
| Define when search runs on submit or as users type (UX-005 reference) | Hydra UX rules | Medium | Needs Validation |
| Design Admin Featured Parts list, search and reorder states (UATL-644) | Admin | Medium | In Progress |
| Verify Admin Figma screens before handoff (UATL-648) | Admin | Medium | To Do |
| Pilot an agent that checks Hydra UX rules (review with Lucas) | Reusable agent skills | Low | Proposed |

---

## 6. BOM-431 (Milos's ticket), content summary

- **Context:** the Part Cross-Reference page (Static matches) is not aligned with Hydra UX/UI patterns and the design system. It is used in the Hydra app (BOM → Part Cross-Reference) and as an iframe in the client's Dynamics 365 CRM (Quote → ConnectED BOM → Static matches), with no Hydra sidebar or top bar and a narrower width.
- **Old UX issues:** 43 category tabs in one horizontally scrolling row with long and near-duplicate names; tabs suggest browsing but a category only filters a keyword search, so nothing appears; multi-word queries like "ball valve" return 0 results without explanation.
- **v1 redesign:** one searchable Category dropdown grouped into Valves, Fittings & piping, Hangers & supports, Other, presented as a search filter; empty-search guidance ("Enter a figure number, SKU or keyword to search in [category]"); Input + Search button (UX-005); min height 970 (UX-006); results table (Figure No., Competitor SKU, Description, Brand, RSFC matches, Action); match details modal (best match first, Domestic/Import filter, copy SKU, warning notes); loading, empty, no-results and error states; embedded CRM variant.
- **Acceptance criteria:** Hydra DS components and tokens only; all 42 categories grouped and searchable; guidance for category with empty search; shared state patterns; embedded variant works in the CRM iframe; no browse/list-all/export (BOM-360); reviewed with team leads before handoff.
- **Comment 11 Nov:** new screens in Figma; clickable prototype at `/bom/cross-reference`; UX-005 and UX-006 introduced; Loza: the page is also an iframe in Dynamics 365, so an embedded variant is needed.
- **Comment 12 Nov:** main redesign complete in Figma, ready for async review; remaining: CRM iframe variant and review changes; moved to In Review.
- **Comment 13 Nov (Matt's feedback from Discord #-bom, 12 Nov):** "This is a good version". New requirements: product data no longer whitelisted, list all matches, don't force a part number before searching (search stays); e-commerce-like presentation, not just a list view; two use cases (competitor → ASC, most searches; ASC → competitor matches); add data filtering, get the attribute list from engineering; the current match details modal stays; broader part search improvements (category search, James's "systems and specifications" category) need a one-pager and PRD later. Impact: changes BOM-360's search-only rule (confirm with Matt/James); ASC → competitor is new. Next: explore about 3 ways to show the matches; ask engineering for the attribute list; CRM iframe still open; Matt is taking the current flow to James.

---

## 7. Verified facts about Part Cross-Reference (code and dev app, 16 Nov)

The key Cheat Sheets files are **identical on `develop` and `azure-production`** (search query, request/response DTOs, rate limit guard, results table), so production runs the same search.

- **Data source:** Cheat Sheets is no longer a standalone table. BOM-414 joined it with the wider competitor match set; BOM-422 merged it into the shared match tables (`competitor_part_variant_asc_content_part_variant` for variant-level matches and `competitor_part_asc_content_part` for figure-level matches), linked to the content (PIM-backed) parts.
- **Fields returned per match (about 20):**
  - Competitor part: manufacturer/brand, SKU, UPC, figure number, description, size; category is empty; **material is always empty**.
  - ASC part: SKU, UPC, figure number, description, **size, material, brand**, category (ASC product category), image, product URL, submittal PDF URL, part ID, variant ID.
  - Match: Domestic or Import (origin), match type (Exact match / Substitute), notes.
- **Engineering clarification.** In the Discord reply shared on 16 Nov 2026, Loza confirmed that PIM data applies to the matched ASC/RSFC parts. Competitor part data is maintained outside PIM. He referred Milos to Sofija for the attribute list.
- **Search fields:** competitor order SKU, figure number and several description fields, **plus ASC SKU and ASC figure number**. Figure-level matches search only the competitor figure.
- **Grouping:** results are always grouped by competitor part; the total counts unique competitor parts. A view of one ASC part with all its competitor matches does not exist.
- **Filtering:** the backend filters only by category (ASC product categories). The modal has a client-side "All Types" match-type filter.
- **Search rule:** a search term is required (min 1 character, max 256); page size max 50. In practice one letter returns almost everything: **searching "a" on dev returned 4,853 parts (486 pages)**. Not measured on production.
- **Rate limit:** 60 requests per 60 seconds per company, shared by all its users, also on the CRM route. Each search or category change is a new request.
- **Access:** `BOM_STATIC_MATCHES` feature access, off by default, enabled for verified companies (ASC, Ferguson). The CRM flow uses admin-scoped routes with the `BOM_CRM_INTEGRATION` permission.
- **Live dev page today:** title "Search RSFC Parts"; category tabs in a long scrolling row; search Input + orange button; table with 4 columns (Figure No., SKU, Description, Matches; Description and Matches sortable). Searching "valve" returned 23 Victaulic 716 parts, each with "2 matches". Match details modal: competitor part on the left (description, brand, SKU, figure, size, material "—"); RSFC equivalents on the right with Import/Domestic and Substitute/Exact Match tags, image, name, brand, figure, size, SKU with copy, View Product, View Submittal PDF; "All Types" filter. Figure-level rows show SKU "—".
- **ASC SKU search on dev:** searching 2200750046 (ASC SKU) returned competitor part V024716PE0 (Victaulic 716): the reverse lookup works, still shown as competitor rows.
- **Production check:** production code is the same; the live page was not viewable with Milos's account (permission gate), and no searches were run there.

### What Matt asked for, with sources
- Show all parts right away; don't force a part number first; search stays. (Meeting)
- Toggle: search from a competitor part or from an ASC part. (Meeting)
- Filters by category and attributes. (Meeting)
- E-commerce-like listing. (Meeting; "not just a list view" from Discord)
- Keep the match details modal as it is. (Discord 12 Nov, via BOM-431 comment)
- Attribute list from engineering so filters use real data. (BOM-431 comment 13 Nov; priorities sheet)
- **Not from Matt:** the CRM iframe version came from Loza (BOM-431 comment 11 Nov).

### Design implications
- Filters that can be designed on real data now: category, Domestic/Import, match type, ASC brand, ASC size, ASC material.
- No competitor material filter (no data).
- Reverse search technically works; the ASC-grouped view is new.
- "Show all parts" is mostly a decision for Matt and James (it changes BOM-360), not new engineering work.

---

## 8. Background from the 2027 plans and personas

- **Proposed Themes for 2027, theme 1 "Quote-to-cash: one front door for pricing":** ConnectED becomes the only way to request pricing (quote, job price, account price); retire BigCommerce, so ConnectED must show list price, discount, account pricing, inventory and lead time; templates from ConnectED into CPQ; enforce the margin floor. Three levels: (1) standardize how pricing requests come in, (2) consolidate the portal for self-service, (3) full e-commerce. Numbers on the page (to verify before use): BigCommerce about $500K a year; over half of last year's quotes below acceptable margin; target 4-hour quote turnaround. Theme 3 "Guided selling and configurators": valve configurator, Ed Macy owns requirements.
- **2027 Roadmap:** BOM Tool search and refinement (single search entry point, progressive filtering without starting over, simple first then advanced); Valve Selection (renamed from Valve Configurator, step-by-step build with pricing and availability); E-commerce and account integration (M3 accounts, product browsing, cart, end with "Request a Quote" or "Find a Distributor"; Ferguson as benchmark); product detail pages with attributes, related parts and bulk document download.
- **User Personas (Confluence):** customer service reps (internal; competitor BOM conversion, part lookup, submittals, CRM quoting; speed and accuracy); application and sales engineers (internal; technical validation, substitutions); PIM and operations teams (internal; product data); commercial strategy and leadership (internal); contractors and estimators (external; search products, convert BOMs, create submittals); specifiers and consulting engineers (external; specifications); distributor partners (partner; reference data, files, product feeds).

---

## 9. The FigJam board "Hydra Design - Next Steps"

Link: https://www.figma.com/board/W0T3Wr7stZaOVarRnxrgci. All content in plain English. Items labelled "my suggestion" on the board are proposals that did not come from a source. Every bulleted list has extra spacing. Earlier the board opened without sign-in: check Share settings before sharing outside the team.

Subtitle: "Everything in one place… Prepared 16 Nov 2026 from the meeting transcript, Jira, Confluence, the design priorities sheet, the code and the dev app. Anything that is my suggestion, not from a source, is marked 'suggestion'."

1. **Start here.** How to read the board (left to right; Ready / Partly / Missing tags; blue underlined = link). The short version (client wants an online-store feel; James leaning toward shutting down Connect Portal; step one Part Cross-Reference; then discovery). What to do today: ask Loza for the attribute list (zone 7); ask Matt whether he and James are OK to show all parts (zone 7); agree top priorities with Lucas (Jira tickets follow on Wednesday); post the UX rules link in Discord; finish the GitHub upload (PR #965 still open); start the Part Cross-Reference concepts (zone 6).
2. **What happened and why.** Who was there (described by what each person did in the meeting); three decisions; why e-commerce (Connect Portal facts; BigCommerce about $500K a year, not yet verified); what Matt expects before anyone builds; how it fits the 2027 plans.
3. **Words you will hear.** Glossary table (see section 14).
4. **Order of work.** 1 Today: send the questions in zone 7, start sketches → 2 Part Cross-Reference v2, 3 layout concepts → 3 Review with Matt by midweek → 4 CRM iframe version, then James's review → 5 E-commerce discovery → 6 Service blueprint from what we know today → 7 Working session with James, then the future state → 8 Prototypes, 1 to 2 directions → 9 Design framework and hi-fi screens → 10 Development starts only now. Side card "In parallel this week": priorities with Lucas, Jira tickets, UX rules link, PR #965 review and merge, Loza gives Micaely GitHub access (not Milos's task).
5. **What we deliver.** 11 deliverables:
   1. Top priorities for 1 to 2 weeks. Milos + Lucas. This week. Ready.
   2. Jira tickets for those priorities. Milos. After #1. Ready (sheet already has 23 tasks).
   3. Part Cross-Reference v2, 3 concepts (show all parts, both search directions, filters, keep the modal). Milos. Wed 18 Nov (midweek). Partly: attribute list from engineering; Matt and James OK to show all parts; Matt's Discord notes.
   4. Part Cross-Reference for the CRM iframe. Milos. After #3. Partly: exact width would help (optional).
   5. James's feedback on Part Cross-Reference. Matt. After #3. Ready.
   6. What "e-commerce" means for ConnectED (which features matter; format not decided). Milos + Lucas, with Matt and Micaely. Right after #3. Partly: what Connect Portal does today (no document found).
   7. Service blueprint: today. Lucas + Milos. After #6. Missing: real steps, people and tools.
   8. Working session with James + future blueprint. Lucas + Milos, with Matt. After #7. Missing.
   9. Interactive prototypes, 1 to 2 directions (e.g. cards on a home page, big search on top). Milos + Lucas. After #8. Partly.
   10. UX rules link in Discord. Milos. Today. Ready.
   11. UX skills on GitHub. Milos. Today. Partly: PR #965 open, needs review and merge.
6. **First step: Part Cross-Reference v2** (goal: review with Matt by Wed 18 Nov, then feedback from James). Cards: What exists today; What Matt asked for (with sources); Two ways people use it; What the data has today (section 7 facts); Watch out: the "search only" rule (BOM-360, Ferguson access, 1 character returns 4,853 on dev, 60/min per company, Matt and James should confirm; suggestion: mark "pending approval"); Rules the design must follow (Hydra DS only, UX-005, UX-006, all states, works in the CRM iframe, no invented filters); 3 layout ideas (suggestions: table + filter panel; store-style cards like Ferguson; side by side); Done when (about 3 concepts with both directions; filters on real data or marked as assumptions; loading, empty, no results, error; confirm scope with Matt and James); After Matt picks a concept (full screens, CRM version, James's review, update BOM-431); rough page sketch (suggestion): toggle, search + button, filter panel (Category, Domestic/Import, Match type, ASC brand, ASC size, ASC material), banner "All parts shown before any search (waiting for Matt and James)", 3 part cards, existing modal on "View matches", pattern later reused on the main Part Search page.
7. **Information we need, and from whom** (table: what, from whom, why, source, when):
   1. Attribute list per category and how complete it is. Loza (or Sofija, CON-347). Source: BOM-431 comment 13 Nov, priorities sheet. Today.
   2. OK to show all parts without a search. Matt and James. Source: priorities sheet. Before concepts are final.
   3. Matt's detailed feedback. Matt (already in Discord #-bom, 12 Nov). Source: meeting. Today.
   4. Top priorities for 1 to 2 weeks. Lucas, together with Milos. Source: meeting next steps. This week.
   5. Feedback on the Part Cross-Reference flow. James, through Matt. Source: BOM-431 comment. After Matt's review.
   6. What Connect Portal does today and what extending it would take. James's internal representative (name unknown; Matt knows). Source: meeting. During discovery.
   7. Corrections to today's service blueprint (what is wrong, missing, who knows more). James, in a 1-hour working session. Source: meeting. After the draft.
   8. Valve Configurator business rules. James and Ed Macy. Source: sheet, 2027 themes. Later (parked).
   9. Width of the Static matches iframe in Dynamics 365. Loza. Source: suggestion (optional). Before the CRM version.
8. **Service blueprint: what it is and how to start.** Definition; 4 steps (collect what we know today: meeting notes, User Personas, 2027 roadmap and themes → fill today's map, mark guesses → 1-hour working session with James → draw the future map, deliver value first without rebuilding everything); who uses the service (from User Personas); empty template table. Phases are a first guess to check with Lucas and Matt: Gets a parts list; Finds equivalent parts; Checks details and documents; Asks for a price or quote; Gets the quote; Orders through a distributor. Lanes: what the user does; what the user sees; what people do behind the scenes; systems involved; pain points and ideas. Two guesses filled in: "Finds equivalent parts" systems = ConnectED BOM, Part Cross-Reference, Connect Portal, public ASC site; "Asks for a price or quote" systems = Connect Portal (BigCommerce), CRM (Dynamics 365), CPQ.
9. **Not now.** Sidebar navigation (low; poor UX in every module; likely replaced by cards/CTAs). Valve Configurator (no design work; business rules open; Micaely reviewing the intake with Matt; renamed Valve Selection in the 2027 roadmap; expected to reuse the filter-style search). Better part search across the whole app (category search, James's "systems and specifications" category; needs a one-pager and PRD later).
10. **All links.** Meeting and planning, Jira, Confluence, Figma/code/examples (same as section 3).

**Your next 3 days** (separate section to the right of the board):
- **Monday 16 Nov, "Unblock and start"** (send the questions first, so answers arrive while you sketch): 1 ask Loza for the attribute list (zone 7, row 1); 2 ask Matt whether he and James are OK to show all parts (zone 7, row 2); 3 post the UX rules link in Discord; 4 ask for a review of PR #965; 5 message Lucas and agree the top priorities, update the sheet; 6 optional suggestion: copy Matt's Discord feedback into a BOM-431 comment; 7 start sketching the first concept, low-fi, in a new section next to the current flow in the BOM - RSFC file. Done when: messages to Loza, Matt and Lucas sent, sheet updated, first concept started.
- **Tuesday 17 Nov, "Sketch the concepts"**: read Loza's answer; until then design filters on existing data (category, Domestic/Import, match type, ASC brand, size, material); skip competitor material; sketch about 3 ways; look at Ferguson if trying cards; both directions in every concept; mark "show all parts" as waiting for approval if Matt hasn't answered. Done when: about 3 low-fi concepts with both directions.
- **Wednesday 18 Nov, "Polish and share with Matt"**: add states (loading, empty, no results, error); check UX-005, UX-006, Hydra DS; comment on BOM-431 with the Figma link and a 3-line summary; send Matt the link and ask which concept to take forward; create the Jira tickets for the agreed priorities. Done when: Matt has the link and the question, Jira tickets exist.
- **If something blocks you (suggestions):** no attribute list by Tuesday noon → continue with existing data; Matt says no to "show all" → keep search first, still add toggle and filters; ASC-grouped view not built → show it in one concept, mark "not built yet"; no time Wednesday → share 2 concepts, third on Thursday.
- **After Wednesday:** full screens, then CRM version, then James's review; e-commerce discovery; with Lucas: today's blueprint from what we know, then the session with James.

---

## 10. Messages and follow-ups

### 10.1 Loza: attribute list (sent)
Source: BOM-431 comment 13 Nov and the priorities sheet. The iframe line is a suggestion; delete it to ask only what was requested.

> Cao Loza,
>
> Radim redizajn Part Cross-Reference stranice ([BOM-431](https://ooden.atlassian.net/browse/BOM-431)). Matt je trazio filtere po atributima, pa mi treba lista atributa da dizajn bude na pravim podacima. Koji atributi postoje u PIM-u po kategoriji i koliko su popunjeni? Ako je to Sofijin deo ([CON-347](https://ooden.atlassian.net/browse/CON-347)), samo mi reci pa cu nju da pitam.
>
> Usput, kolika je sirina Static matches iframe-a u Dynamics 365?
>
> Hvala!

Milos sent the attribute question to Loza. The next step is to ask Sofija which PIM attributes are available on matched ASC/RSFC parts and how consistently they are populated by category. See the Discord clarification in section 7.

### 10.2 Matt: OK to show all parts?
Source: priorities sheet ("Matt / James OK on showing all matches (changes BOM-360)"). 4,853 is from dev.

> Hi Matt, showing all parts without a search changes [BOM-360](https://ooden.atlassian.net/browse/BOM-360) (search only, no list-all, no export). In practice one letter already returns almost everything (4,853 parts on dev). Are you and James OK to show the full list?

### 10.3 Lucas: priorities
Source: meeting next steps and decisions.

> Hi Lucas, let's lock the top priorities for the next 1 to 2 weeks in the [priorities sheet](https://docs.google.com/spreadsheets/d/1RfdKSuG78b8a_uNrHy9Qc9j9cZ6DiIvxm7R5eeMtHSI/edit). Matt asked to add an E-commerce discovery / UI refresh workstream and to set Sidebar to low. After that I'll create the Jira tickets.

### 10.4 Lucas: share the board and go through it today (casual)
Why these three topics: priorities are the shared meeting action; the service blueprint is Lucas's proposal; the row-action rule (BOM "Change match" vs SPEC "Continue review") is "Needs Decision" from the 11 Nov sync. Part Cross-Reference is optional with him (he did BOM-425).

> Hey Lucas! I put everything from Friday's meeting into one FigJam board: [Hydra Design - Next Steps](https://www.figma.com/board/W0T3Wr7stZaOVarRnxrgci). It has decisions, order of work, what we still need and from whom, plus a first look at Part Cross-Reference and a starting point for the blueprint. Basically the list you asked for, all in one place 🙂
>
> If you've got some time today, could we go through:
> 1. Priorities for the next 1–2 weeks, so I can make the Jira tickets
> 2. How we kick off the service blueprint
> 3. The row-action rule from our last sync (still "Needs decision")
>
> Stuff marked "my suggestion" is just me, feel free to push back!

### 10.5 Suggestions, not from the meeting (send only if wanted)
**Matt, input for e-commerce discovery.** The meeting said to build the blueprint from what we know today and review it with James; send this only if the team knows too little to start.

> Hi Matt, for the e-commerce discovery:
> 1) Can we get access to Connect Portal, or a short demo, so we can map what it does today?
> 2) Can we book 1 hour with you, Lucas and me to walk through today's flow from part search to quote (who does what, and in which tools: CRM, CPQ, BigCommerce)?
> We'll turn it into the first service blueprint before the session with James.

**For myself.** Matt said his most detailed feedback is in the Discord #-bom channel. Suggestion: copy it into a comment on [BOM-431](https://ooden.atlassian.net/browse/BOM-431) so every requirement lives in Jira, then check it against zone 6.

---

## 11. Working rules

- **Every ask, task or requirement needs a source:** transcript timestamp, Jira comment, priorities sheet row, Confluence page, or code. Anything else goes into a separate "suggestion" list for me to approve before it goes into a message, board or ticket.
- Don't make decisions on my behalf (scope, who to ask, what to ask). Nobody asked for effort estimates from engineering; the only real engineering ask is the attribute list.
- Verify claims against the actual system (code on `develop` / `azure-production`, the dev app). A Jira "Done" status is not proof of how the system works today.
- Messages: short. Lucas: friendly, casual. Loza: Serbian without diacritics. Matt, James, team: plain English.
- Board, Jira and Figma text: plain English, short sentences, no jargon, no em dashes.
- **Hydra design system rule (17 Nov 2026):** Always use the existing Hydra DS components, variants, text styles, and bound tokens for Hydra designs and previews. Before handoff, verify the actual bindings for colors, typography, spacing, borders and radii. Use the closest supported Hydra DS variant when translating an approved preview.
- BOM work: don't touch Content File Manager; use existing Hydra DS components, patterns and tokens; follow the Hydra UX rules (UX-001 to UX-013; e.g. UX-005 page search = Input + primary Search button; UX-006 screen min height 970). Keep the flow left to right; low-confidence rows are warnings, not blockers; "Choose", not "Refine", when no part is suggested; progressive disclosure for advanced metadata; the default UI should not feel like a spreadsheet.
- Don't send messages, change production settings or grant access without my explicit OK.

---

## 12. Corrections already made (don't repeat these mistakes)

1. "Cheat Sheets has only 8 columns": outdated July plan. The live API returns about 20 fields.
2. "Linking to PIM crosses a deliberate data boundary": outdated. BOM-414/422 removed the separation; the ASC side already reads PIM-backed metadata.
3. "BOM-372 limited search to competitor fields, so reverse search doesn't work": wrong. The current code searches ASC SKU and figure; confirmed on dev.
4. "Matt asked for the CRM version": wrong. It came from Loza.
5. "UX skills are only on my computer": incomplete. They are in on-hydra-app PR #965 (open); the prototype repo copy has 5 local-only commits on `feat/variant-modal-sidebar-layout`.
6. Service blueprint order: today's map from what we know → working session with James → future state.
7. Order after concepts: CRM version → James's review (per the sheet).
8. "Part Cross-Reference takes about one week": replaced with Matt's words ("a day or two of design", back-and-forth by midweek).
9. "Mid next week" (relative to 13 Nov) → **Wed 18 Nov (midweek)**.
10. Jira tickets: Wednesday everywhere.
11. BigCommerce "$500K a year" comes from a page that says to verify its numbers: marked "not yet verified".
12. Asking Loza "how much work is X" was not requested and was removed.
13. Unsourced ideas presented as requirements were removed or labelled as suggestions.

---

## 13. Open items (as of 17 Nov)

- [x] Send Loza the attribute-list question (10.1).
- [x] Follow up with Sofija about PIM attributes (CON-347). She sent the display mapping by product type on 17 Nov (section 15.9).
- [ ] Send Matt the "show all parts" question (10.2).
- [ ] Agree top priorities with Lucas; update the sheet (add E-commerce discovery / UI refresh workstream; Sidebar to low) (10.3, 10.4).
- [ ] Post the Hydra UX pattern rules link in Discord.
- [ ] Get PR #965 reviewed and merged.
- [x] Sketch about 3 Part Cross-Reference concepts in the BOM - RSFC Figma file (done 16 Nov, frame 7651:4917, see section 15).
- [x] Add loading, error with Retry, search with no hits, and an optional search-first starting state in Figma (A6–A9, sections 15.1 and 15.7).
- [x] Build concept B (cards, filters, both directions, states) in the prototype repo (17 Nov, sections 15.8 to 15.16).
- [x] Committed and pushed `feat/variant-modal-sidebar-layout` to Milos's fork (17 Nov): code `a627a8b`, docs `05e36ea`, `a87c041`. Not in the team repo yet.
- [x] Opened [PR #16](https://github.com/ooden-tech/on-hydra-app-prototype/pull/16) into the team repo `main` (17 Nov): clean branch `feat/part-cross-reference-v2`, code only.
- [ ] Get PR #16 reviewed and merged; run the `hydra-ux-audit` pass on the new page.
- [ ] Share the concepts with Matt by Wed 18 Nov and ask which concept to take forward; comment on BOM-431 with the Figma link and a short summary.
- [x] Prototype filters now follow Sofija's mapping (section 15.9). Values are still samples.
- [x] Update the Figma filter panels to the mapping (Variation A done 17 Nov, section 15.27): Product type, Size, End connection, Material, Certifications, Brand.
- [ ] If the removable grey filter tag is kept, add it to the Hydra DS Figma file (section 15.16).
- [ ] Decide whether the Figma concepts should be updated to the distilled card and filter version 2 from the repo (sections 15.11 and 15.15).
- [x] Figma Variation A matches localhost 1:1 (17 Nov, section 15.27).
- [ ] Fix or accept the repo issues found in the 1:1 check (section 15.27): flyout jumps after a value is checked, open panel can flash on load, "No parts match these filters" can't be reached.
- [ ] Create the Jira tickets for the agreed priorities (Wednesday).
- [ ] Then: CRM iframe version; James's review; e-commerce discovery; service blueprint today → working session with James → future state; prototypes.
- [ ] Optional: copy Matt's Discord feedback into BOM-431.
- [ ] Check the FigJam board's Share settings before sharing outside the team.
- **Not verified:** number of parts on production, BigCommerce cost, what Connect Portal does today, and which PIM attributes are reliable per category (confirm with Sofija).

---

## 14. Glossary

- **ConnectED / Hydra:** the web app for the client; Hydra is the internal project name.
- **ASC / RSFC:** the client; ASC Engineered Solutions was renamed Reliable Safety & Flow Corporation.
- **James (Simpson):** main decision maker on the client side.
- **BOM:** Bill of Materials; the module that turns a competitor parts list into ASC parts.
- **Part Cross-Reference / Static matches / Cheat Sheets:** the page to find ASC equivalents of competitor parts (route `static-matches`; backend name "cheat sheets").
- **Flip a part:** replace a competitor part with the matching ASC part.
- **Connect Portal:** separate BigCommerce-based portal for part search and quotes; James is leaning toward retiring it.
- **BigCommerce:** ready-made online store platform behind Connect Portal (cost about $500K a year, not verified).
- **E-commerce (here):** not online payment; a store-like experience: search, filters, product cards, cart, quote request.
- **PIM:** Product Information Management, the main product database (attributes); data still uneven.
- **Attribute / filter:** a part property (size, material, connection type) used to narrow results.
- **CRM iframe:** Part Cross-Reference embedded in the client's Dynamics 365 CRM (Quote → ConnectED BOM → Static matches), narrower, no Hydra shell.
- **CPQ:** Configure, Price, Quote, the client's quoting tool.
- **Discovery:** research before design: what we build, for whom, and why.
- **Service blueprint:** map of user steps plus what people and systems do behind the scenes; current state then future state.
- **Hi-fi screens:** final Figma screens built with Hydra DS components.
- **UX rules / skills:** approved Hydra UX rules UX-001 to UX-013 (hydra-ux-pattern skill), used to keep Figma and code consistent.
- **Valve Configurator / Valve Selection:** step-by-step valve builder; waits for business rules.
- **QA agent:** an internal tool built by Loza that answers technical questions from the source code.

---

## 15. Part Cross-Reference v2 concept sketches (16 Nov 2026)

**Status:** concept board refined and visually reviewed in Figma on 16 Nov. Matt's concept review is pending.

Link: https://www.figma.com/design/Ht3Up5MlRAKjK7eCuAy05L/BOM---RSFC?node-id=7651-4917 (file BOM - RSFC, page "Concepts", section "CHEAT SHEET - Part Cross-Reference v2 · concepts", 7651:4917). The existing v1 flow (section 7560:210686) was not changed.

### 15.1 Screens in the frame
| Row | Screen | Node | What it shows |
|---|---|---|---|
| A, Table + filter panel | A1 | 7651:11285 | Browse before search. Marked **OPEN DECISION**. The previous A1 (7655:4960) is a layout reference below. |
| A | A2 | 7655:5067 | Search "valve" in Check Valves. Domestic and Exact match selected, with nine sample parts and removable filter chips. |
| A | A3 | 7655:5174 | Reverse direction (RSFC part → competitor), search 7811. Columns: RSFC figure, RSFC SKU, Description, Brand, Competitor matches. |
| A | M | 7655:5281 | Existing match details modal, copied unchanged. |
| B, Part cards | B1 | 7655:5453 | Store-style part cards, competitor → RSFC. Card grid 7658:9420. |
| B | B2 | 7655:5560 | Part cards, RSFC → competitor. Card grid 7658:9681. |
| C, Side by side | C1 | 7655:5668 | Results beside a 390 px details panel. A Hydra selection tint identifies the selected row. |
| C | C2 | 7655:5775 | Side by side, reverse direction. |
| D, Filter and search states | A4 | 7666:9267 | Expanded Size group with search, 4″ and 6″ selected, and four sample results. |
| D | A5 | 7666:10073 | No results after filtering. Import and Exact match selected, with a Clear filters action. |
| D | A6 | 7695:6167 | Search in progress, with the query retained, loading button and Hydra skeleton. |
| D | A7 | 7695:6523 | Search failed, with the query retained and a Retry action. |
| D | A8 | 7695:6731 | Search has no hits for a sample SKU. The query stays available for editing. |
| D | A9 | 7698:7023 | Optional search-first start for review. |
| E | Local components | 7657:9378 | Holder for the local components used by the concepts. |

A warning Alert in the frame says: "Open decision: show all parts before a search (A1)".

### 15.2 Decisions made while sketching
- On 16 Nov 2026, Milos preferred the filter placement in [A1, frame 7651:11285](https://www.figma.com/design/Ht3Up5MlRAKjK7eCuAy05L/BOM---RSFC?node-id=7651-11285). Use this placement as the reference for the next iteration. The filters sit in a dedicated left column, aligned with the search controls and results table on the right. This preference is about filter placement. Showing all parts before a search still awaits confirmation.
- On 16 Nov 2026, the A1 filter placement was applied to the nine other concept and edge-case screens in the v2 section, plus the backdrop of the match-details modal. The list and details variants now show filters on the left, results in the middle, and match details on the right. The section was checked with screenshots after the update.
- Every screen has the same Segmented toggle: **"Competitor part → RSFC | RSFC part → competitor"** (Matt asked for the toggle, meeting 00:26:55).
- "Show all parts" stays an **open decision** until Matt and James confirm (it changes BOM-360). A1 shows browse before search with a warning alert. A9 shows the search-first option for review.
- The match details modal is **kept as is** (Matt, Discord 12 Nov, via BOM-431 comment).
- Search follows UX-005 (Input + primary Search button); screens follow UX-006 (min height 970).
- The RSFC-grouped view (one RSFC part with all its competitor matches, A3, B2, C2) does not exist in the code today. It is new work and must be presented as "not built yet".

### 15.3 Filter panel

**17 Nov 2026 — filter layout preview.** [PNG preview](</Users/milosdostanic/.codex/visualizations/2026/11/17/01a1e45c-5c09-74c2-bc3b-763c1c6cd737/hydra-filter-preview.png>) and [interactive HTML](</Users/milosdostanic/.codex/visualizations/2026/11/17/01a1e45c-5c09-74c2-bc3b-763c1c6cd737/hydra-filter-interactive.html>). The desktop rail is 288 px (Hydra controlHeight × 9), with consistent insets, Match type and RSFC origin always visible, and Size open by default with scoped search and all ten prototype sizes available. Material, Brand, End connection, Certifications and Product type use native disclosures. Applied filters are removable above results. At narrower widths the same controls open in a Hydra Drawer. The HTML uses the prototype's Hydra theme, controls, sample PIM values and filtering logic. Verified offline at 1440, 1024 and 390 px, including keyboard chip removal, size search, Clear all, the empty state and the mobile drawer. [Nike on Mobbin](https://mobbin.com/screens/31b15ce8-9153-4649-9b26-a700ea1c443e) informed disclosure groups beside results. [Canva on Mobbin](https://mobbin.com/screens/58f7ef38-bec1-4883-8857-b209db6bc7ee) informed visible filter state above results. This is a review proposal alongside the existing Figma and application layout.

The current concepts share one local [filter component set](https://www.figma.com/design/Ht3Up5MlRAKjK7eCuAy05L/BOM---RSFC?node-id=7692-6694). Match type and RSFC origin remain visible first. Size, Material and Brand use disclosure rows. The 260 px sidebar fits its contents within a 560 px cap. A4 shows Search sizes and Show all 24 sizes, with 4″ and 6″ checked. Applied filters appear as removable chips above the results, with a Clear all action. A5 offers Clear filters in the empty state. The global Search filters input, manual scrollbar and extra sample attributes were removed from the visible panels.

Earlier iterations
- Latest B1 iteration, 16 Nov 2026. The [Figma filter panel](https://www.figma.com/design/Ht3Up5MlRAKjK7eCuAy05L/BOM---RSFC?node-id=7662-9414) stays beside the results. RSFC part filters include Size (six sample checkboxes in two columns, Search sizes, Show all 24 sizes), Material and Brand. More attributes folds Connection type, Finish and Pressure rating into one row. Match type and Origin are visible in a separate group, with two choices each. The panel uses Hydra type, tokens and controls. All default controls fit within 260 × 560 px and were checked in the full B1 screen and a sidebar screenshot. [Nike](https://mobbin.com/screens/102cac41-a0ec-4dc3-a20a-867d2c526688) and [FARFETCH](https://mobbin.com/screens/0f4659a4-2cc4-40e5-9df6-f4a999e8421e) on Mobbin informed the persistent sidebar and expanded primary facets. Mobbin was reviewed in Chrome. These are Figma concept states; sample attributes still need confirmation from Sofija (CON-347).
- On 16 Nov 2026, the [B1 filter panel](https://www.figma.com/design/Ht3Up5MlRAKjK7eCuAy05L/BOM---RSFC?node-id=7662-9414) was refined in Figma. Size, material, and brand are first. The expanded size group shows five sample values, an input with the Hydra search icon, and Show all 24 sizes. The title stays above the scrolling groups, and Clear all is reserved for the applied state. All eight group headings fit in the 260 × 560 px default panel. Verified visually. The [Ferguson catalog](https://www.ferguson.com/category/pipe-fittings/) and [Baymard's B2B filter research](https://baymard.com/research-articles/allow-search-for-long-filter-options-lists) informed the layout. Mobbin MCP required sign-in in this session.
- Fixed panel 260 × 560 px that scrolls on its own, so it always fits a 970 px screen.
- Header "Filters (n)" with "Clear all", then a "Search filters" input.
- Open groups show checkboxes; other groups are collapsed with a count, e.g. "RSFC size (24)". Long groups show the first values plus "Show all".
- Applied filters appear as removable chips above the results.
- Note on the panel: "Sample values. More PIM attributes are added as collapsed groups; this panel scrolls on its own and always fits a 970 px screen."

### 15.4 Product images
- Real product images replace the placeholders, using the same pattern as the existing flow: a 72 × 72 container (colorFillQuaternary fill, 1 px colorBorderSecondary inside stroke, radius 8, clipped) with a 70 × 70 image set to Fit.
- Image hashes reused from the file: check valve 165d9ac44ed023a4bf819a755824decc766bebef, ball valve 4a2c1edce818a613e65a1b4eb0f0061ff608da35, butterfly 9a5d1d66ff927a7803cebf87e5cc7b0aaae39c15, fittings 94fe04ea8623b6e668604ce4cfdeb91aa2ec8e6a, placeholder ed1a3918446e091f3df5b3490f2d83a31027a906.

### 15.5 Card polish (Impeccable "polish" pass)
- Hydra DS correction, 17 Nov 2026. Migrated the [approved card](https://www.figma.com/design/Ht3Up5MlRAKjK7eCuAy05L/BOM---RSFC?node-id=7703-15774), its main component and all [six B1 cards](https://www.figma.com/design/Ht3Up5MlRAKjK7eCuAy05L/BOM---RSFC?node-id=7658-9420) to linked text styles and bound color, border, radius, and spacing tokens. The photo, tags, button and chevron use Hydra library instances. The cards measure 360 × 214 px with the native variants. Verified layout, text style linkage, original part data and images, and the Substitute status. The earlier HTML and PNG are historical review artifacts.
- Approved Stageshow card applied in Figma on 16 Nov 2026. Updated the [linked card](https://www.figma.com/design/Ht3Up5MlRAKjK7eCuAy05L/BOM---RSFC?node-id=7703-15774), the main component (7657:9379) and all six cards in the [B1 grid](https://www.figma.com/design/Ht3Up5MlRAKjK7eCuAy05L/BOM---RSFC?node-id=7658-9420). All six measure 360 × 212 px, with the tinted best-match block, preserved photo and identifiers, and aligned View matches actions. A figure that appeared twice now appears in the metadata. The Substitute example still shows its own match status. Verified the linked card and grid against the approved preview.
- Stageshow review proposal, 16 Nov 2026. Used the [current competitor-to-RSFC card](https://www.figma.com/design/Ht3Up5MlRAKjK7eCuAy05L/BOM---RSFC?node-id=7703-15774) as the source for a standalone [HTML preview](</Users/milosdostanic/.codex/visualizations/2026/11/16/01a1e5b4-c823-7530-b844-46ff1056a671/part-cross-reference-card.html>) and [PNG preview](</Users/milosdostanic/.codex/visualizations/2026/11/16/01a1e5b4-c823-7530-b844-46ff1056a671/part-cross-reference-card.png>). The 360 × 212 px design groups the best match on a soft surface, highlights the product name and retains the original photo, figure, SKU, status and action. Checked the 328 px version and a two-line product name.
- On 16 Nov 2026, Milos accepted the [polished card preview](assets/2026-11-16-part-cross-reference/b1-card-polish-reference.png) as the visual reference for B1.
- The approved preview was applied to the [B1 Figma card](https://www.figma.com/design/Ht3Up5MlRAKjK7eCuAy05L/BOM---RSFC?node-id=7657-9379) on 16 Nov 2026. The SKU and metadata share the top line, a Hydra border token separates the source and match, and the existing tag and photo instances were made smaller. Metadata uses Hydra Small/Normal. All six cards remain 360 px wide. The two rows measure 220 px and 235 px high, with aligned View matches buttons. The six cards and the standalone example retained their original text and product photos. Verified in a screenshot of the full B1 screen, including the two-line match title.
- On 16 Nov 2026, the [competitor-to-RSFC card](https://www.figma.com/design/Ht3Up5MlRAKjK7eCuAy05L/BOM---RSFC?node-id=7657-9379) was compacted in Figma. In the three-column B1 grid, all six 360 px cards went from 300 px to 244 px high. The best-match label and status tags share one line. Hydra's secondary text color improves metadata contrast, and View matches aligns across each row. The six cards and the standalone example retained their original text and product images. Checked the grid visually and exported the standalone card as a PNG preview.
- Used the Impeccable skill in "polish" mode (refinement only, no redesign). Its automatic detector cannot scan Figma, so the review was done by eye from screenshots. The project has no PRODUCT.md (optional later: run Impeccable "init").
- Changes on the cards: SKU first, then the description, then muted meta (brand, size, origin); tight spacing inside a group (paddingXS) and wider spacing between groups (paddingMD); divider removed; names cut at 2 lines; card content spread top to bottom so actions line up; equal card height per row; 3 columns at 360 px.
- Tag__Status texts set to "Exact match" and "Substitute" (DS default texts were "success" and "warning").

### 15.6 Known gaps (what is still missing)

Status 17 Nov: states, PIM attributes and the repo build are done (sections 15.8 to 15.16). The list below is the 16 Nov view; still true: CRM iframe variant, sample values, Matt's choice.

- **Prototype behavior:** the search states are static Figma examples. Live filtering and result counts still need validation during implementation.
- **CRM iframe variant** is not drawn (open item since the 11 Nov comment by Loza).
- **Filter values are samples.** "Connection type", "Finish" and "Pressure rating" are example attributes, not confirmed. Real attributes come from Sofija (CON-347). Filters available on real data today: category, Domestic/Import, match type, ASC brand, ASC size, ASC material.
- **Technical workaround:** the DS Collapse Item body slot cannot hold other instances, so the body is hidden and the checkboxes sit under the header as siblings. Fine for sketches; check before hi-fi.
- **Not done yet:** share with Matt, BOM-431 comment, hi-fi screens after Matt picks a concept.

### 15.7 Whole-board review (16 Nov 2026)

- Moved the preferred A1 into the main comparison row. Aligned section labels and grouped the search states beneath the table, card and side-by-side concepts.
- Applied the shared Hydra sidebar in both search directions and in the match dialog's backdrop. A3 and C2 show the selected RSFC brand above results. A2, A4 and A5 use distinct sample selections and corresponding results.
- Aligned B2's six 360 × 220 px cards and their View matches actions. Added a selection tint and clearer table columns in C1 and C2. Updated pagination for the sample counts and checked that the app shell fills each desktop frame.
- Added A6–A9 in Figma. A9 illustrates the open decision about search-first behavior. Kept the existing dialog content and applied the updated search screen behind it.
- Checked the board and individual screen renders. PIM values remain samples pending Sofija's attribute list (CON-347). CRM iframe design and Matt's concept choice remain open.

### 15.8 Concept B implemented in the prototype repo (17 Nov 2026)

Milos asked to put everything into the repo using option B (part cards). Plan: `Documents/plans/2026-11-17-part-cross-reference-concept-b-plan.md`. Branch `feat/variant-modal-sidebar-layout`, route `/bom/cross-reference`. **Not committed yet.**

- **Page** `src/bom/pages/BomPartCrossReferencePage.tsx` was rewritten to match Figma B1 (7655:5453) and B2 (7655:5560): filters column (260 px) on the left (A1 placement), toolbar with the direction toggle "Competitor part → RSFC | RSFC part → competitor", category select, search input + Search button (UX-005), 3-column card grid (12 per page; 6 left a large empty gap on tall screens), result count, removable filter chips and pagination.
- **New files:** `src/bom/components/PartCrossReferenceCard.tsx` (competitor card with the best RSFC match block; RSFC card with competitor matches) and `src/bom/components/PartCrossReferenceFilters.tsx` (Match type, RSFC origin, and Size / Material / Brand as disclosure rows with "Search sizes" and "Show all" for long lists).
- **Data** `src/bom/data/partCrossReferenceData.ts`: existing exports untouched. Added filter types, `listCompetitorParts`, `listRsfcParts` (the RSFC-grouped view built from the sample data) and the facet lists.
- **Match details modal** unchanged. In the RSFC to competitor view, "View matches" opens it for the first competitor match (the modal only knows competitor parts).
- **States built:** loading (skeleton cards), error with "Try again" (`?simulateError=1`), no results for filters ("Clear filters"), no results in a category or for a search term.
- **Open decision (BOM-360):** the page lists all parts before a search. `?start=search` switches to the search-first behaviour (A9). Needs Matt and James.
- **Verified 17 Nov:** `npm run build` passes (tsc + vite). In the browser: both directions, filters with chips, the empty state, the modal from both directions, the error state, and 1440 and 1750 px widths. At 1440 px the grid has 2 columns and the page scrolls; at 1750 px it has 3 columns. Not verified: dark theme, keyboard use, `hydra-ux-audit` pass.
- **Still sample data:** Size, Material and Brand values and the product photos (angle valve and fittings images from the catalog assets). Waiting for the PIM attribute list (CON-347).
- **Not done:** CRM iframe variant, concept A (table) and concept C (side by side) in code, live filtering against the backend (filters run client-side in the prototype), commit and push.
- **Decision, 17 Nov 2026 (Milos):** in the repo we do not apply UX-006 (screen min height 970). Do not add a minimum height to prototype pages. It still applies to Figma screens.
- **Card hover, 17 Nov 2026 (Milos):** the part cards use the same hover as the catalog part cards (`FeaturedPartCard`): 1 px primary border, tertiary shadow, mid-speed transition. Verified in the browser. Keyboard users open the modal with the "View matches" button; focus also highlights the card.

### 15.9 PIM attribute mapping from Sofija (17 Nov 2026)

Sofija Zec-Baškarad (CON-347) answered on Discord and sent `column-mapping-by-product-type-completed-updated.md`, based on the Syndigo export of 16 Nov (526 columns, 67,767 rows, 290 product types, 20 groups). She is still refining it with Lauren's feedback. Saved in the repo as `Documents/pim/2026-11-16-pim-column-mapping-by-product-type.md`.

What it means for Part Cross-Reference filters:
- **No pressure or temperature rating in PIM.** The Figma example "Pressure rating" must go. "Connection type" maps to End Connection 1/2 (Valve End Connection on Reliable valves). "Finish" is Coating / Finish, kept out of the prototype because the sample data has no value.
- **Size** is one field per end (Size 1, 2, 3; fraction or decimal), unit shown once. Reliable valves, risers and controls use **Valve Size** (decimal when empty).
- **Material** is `Body` (`Main Material` only where the two disagree, 35 rows).
- **Brand** is `Product Brand`. **Product type** is `Product Type`, spelled as Syndigo stores it. `Check Valve` (Gruvlok, SCI, FPPI, Kennedy) and `Check Valves` (Reliable) stay separate types in different groups.
- **Certifications:** 16 separate columns (UL Listed, FM Approved, ...), `Regulatory` as legacy fallback.
- An empty cell is hidden, so a filter group with no values is hidden. End Connection short codes show the full value (`Gr/Gr` → `Grooved`).

Applied in the prototype (17 Nov, verified in the browser and with `npm run build`):
- New `src/bom/data/pimDisplayMapping.ts`: the groups, filter attributes, labels, PIM columns, and the size and end-connection display rules.
- Filters: Match type and RSFC origin (match data), then RSFC attributes Product type, Size, End connection, Material, Certifications, Brand. Hovering a group label shows its PIM column. Chips use the same labels.
- Sample values derived from the demo part names: Gruvlok/SCI check valves → `Check Valve`, couplings → `Rigid Coupling`, `Grooved` ends, UL Listed and FM Approved only on the 78FP valves (their names say UL/ULC/FM). Example: FM Approved leaves 3 competitor parts (717 risers → 78FP).
- Not used from the mapping here: the figure/SKU page layout (variant table, selected SKU fields), Elbow Angle, and the leave-out lists. They matter for the catalog part detail page, not this filter panel.

### 15.10 Wider filter panel and three filter versions (17 Nov 2026)

- Repo: the filter panel is 30 px wider, 238 px instead of 208 px (`FILTER_PANEL_WIDTH` in `PartCrossReferenceFilters.tsx`). Type check passes.
- Artifact with three interactive filter versions, for comparing with Lucas and Matt: https://claude.ai/artifact/C53RuNMSFTMwarQTaEnrK5 (private until shared from its Share menu).
  1. **Side panel, grouped:** today's repo pattern. Match type and origin open, RSFC attributes fold away.
  2. **Side panel, open with counts:** every group open, each value shows how many parts it leaves, values that give 0 are disabled.
  3. **Top bar and drawer:** Match type, Origin, Product type, Size and Material as dropdowns above the cards, everything in "All filters". No side panel, so it also suits the narrow CRM iframe.
- Same 23 sample parts and PIM attributes as the repo. Filter logic checked with Node (FM Approved → 3 parts, Size 4 in → 3 parts). No version picked yet.
- **Artifact v2, 17 Nov 2026:** light theme only. Components copy the Hydra/Ant Design specs (Checkbox, Segmented, Input with search prefix, Button, 24 px Tag, ghost Collapse, Dropdown with Reset footer, 378 px Drawer, Empty, Pagination, real @ant-design/icons). Spacing uses the 4/8/12/16/20/24 token scale: 20 px between separate controls, 8 px inside a group, 16 px between filter groups and cards. Hydra colours from `src/theme` (primary #2576BB, action #F05A23, layout #F0F2F8). Product photos are the catalog images, embedded. 12 cards per page, same as the repo. Script syntax and filter counts checked with Node.

### 15.11 Filter version 2 in the repo (17 Nov 2026)

Milos chose **version 2** (side panel, every group open, counts) from the artifact https://claude.ai/artifact/C53RuNMSFTMwarQTaEnrK5 and asked for a 1:1 build.
- `PartCrossReferenceFilters.tsx` was rebuilt: no more Collapse. Match type and RSFC origin, then an "RSFC attributes" block (Product type, Size with "Search sizes" and "Show all 10", End connection, Material, Certifications, Brand). Each value shows how many parts it leaves; values that give 0 are disabled unless already checked. Group titles show the PIM column on hover.
- `partCrossReferenceData.ts`: new `countForFilterValue` (count if this value were the only one picked in its group, other groups kept). The page passes it in once a search state exists.
- Measured in the browser against the artifact: panel 238 px, card padding 20, 16 px between groups, 8 px title to values and between values. Import selected → Exact match, Gruvlok, FM Approved and UL Listed show 0 and are disabled, the other counts match the artifact. `npm run build` passes.
- Differences from the artifact, on purpose: the repo uses real antd components (Checkbox, Input, Card, Typography) and Hydra tokens instead of hand-written CSS, so tiny pixel differences are possible. Counts are not shown for the RSFC to competitor direction until a search state exists, same as the competitor direction.
- Not done: commit, `hydra-ux-audit`, Figma panels still show the old pattern, and versions 1 and 3 stay only in the artifact.

### 15.12 Card tag borders and filter panel without scroll (17 Nov 2026)

- **Tags on cards now have a border** (Exact match, Substitute, Domestic, Import use `HydraColorfulTag bordered`, 1 px). The filter chips already had one.
- **Filter panel edge case, no scroll:** the panel is `position: sticky` in the app content area. It measures its open height against the visible area. If it does not fit (example: 800 px window, open panel 1023 px), it switches to **compact**: Match type and RSFC origin stay open, each RSFC attribute becomes one row (title, selected count, chevron) that opens its values in a flyout to the right. Compact panel is 529 px, so everything stays reachable without scrolling the panel. In a tall window (1300 px) it goes back to the open version with counts. Verified in the browser at 800 px and 1300 px heights; `npm run build` passes.
- Limit: below roughly 600 px of visible height even the compact panel no longer fits. Not handled.
- Version 2 in the artifact is unchanged (no compact mode there).

### 15.13 RSFC part card redesign (17 Nov 2026)

In the RSFC part → competitor view the photo was a 48 px square floating next to a taller text block. Now the photo is 80 × 80 px (same frame pattern, Fit) and the text block beside it is exactly 80 px tall, spread top to bottom: the origin tag's top edge lines up with the photo's top, the brand/figure/SKU line with its bottom (measured: 0 px difference). The competitor → RSFC card keeps its 48 px photo inside the soft "Best RSFC match" block. `npm run build` passes.

### 15.14 Scroll only in the cards, pinned footer, one-line summary (17 Nov 2026)

- **Page does not scroll any more.** The page height is measured to fit the visible area (`BomPartCrossReferencePage.tsx`, `fitHeight`, with a 480 px floor). Only the card area scrolls; toolbar above it and the footer ("Showing 1–12 of 23" with pagination) stay in view at any window height. The cards area jumps back to the top on a new page, search or filter. Verified at 800, 970 and 1100 px window heights: the content area itself never scrolls, the footer stays at the bottom.
- **Filter panel:** no longer sticky (the page does not scroll). It must fit the row it sits in; if the open version is taller, it switches to the compact flyout version (section 15.12).
- **Summary row:** count and applied filter chips are now on one line (`22 competitor parts` · chips · `Clear all`), wrapping only with many chips. The hint "Select a card to see its matches" was removed: card hover and the "View matches" button already show that cards are clickable. This saves one row of height.
- Not verified: keyboard use, very narrow windows.

### 15.15 Cards distilled and count moved to the footer (17 Nov 2026)

Used the Impeccable skill in "distill" mode (remove what does not earn its place; one primary action; no card inside a card).
- **Competitor → RSFC card, 214 → 186 px.** Removed the footer row with the "View matches" button: the whole card is the action (role button, Enter/Space, hover and focus border), the same as the catalog part cards. Removed the grey block inside the card. The RSFC part sits under a section rule that carries the count ("Best of 2 RSFC matches ───", "RSFC match" when there is one). The RSFC part is one row: 72 px photo (Figma frame size) beside three lines (tags, name, brand/figure/SKU), top and bottom edges aligned with the photo.
- **RSFC → competitor card, 162 px.** Same pattern: photo row with "RSFC part" and the origin tag, then a rule "Best of N competitor matches" / "Competitor match", then the best competitor match with its match-type tag.
- Rejected on the way: putting "Best of 2 RSFC matches" next to the tags cut the label off on 3-column widths. The rule keeps it whole.
- **Result count moved to the footer:** "Showing 1–12 of 23 competitor parts", plus the search term and category when set. The row above the cards now appears only when filters are applied (chips and Clear all), so it no longer takes height by default.
- Verified in the browser at 1750 × 970 in both directions: no clipped text, photo alignment 0 px, page does not scroll, footer pinned. `npm run build` passes.

### 15.16 Applied filter tags (17 Nov 2026)

The grey closable chips were hard to see and only the small × removed them. New `src/bom/components/AppliedFilterTag.tsx`: Hydra DS `Tag / Default` (`HydraTag`, 24 px, Base/Normal) in the primary tone (blue-1 background, blue-3 border, primary text), matching the checked checkboxes. The whole tag is a button ("Remove filter Size: 3 in"), so clicking anywhere on it removes the filter; hover and keyboard focus darken the border and background. Verified in the browser: the target went from the 12 px × to the full tag (example 197 × 24 px), and a click removes one filter. `npm run build` passes. Note: no closable chip exists in the Hydra DS Figma file yet; if this pattern is kept it should be added there.
- **Update, same day (Milos):** grey instead of blue. `AppliedFilterTag` now uses the Hydra DS `Tag / Default` default tone: colorFillQuaternary background, colorBorder (#D9D9D9) 1 px border, colorText. Hover/focus: Ant Design fill step colorFillTertiary and a darker ×. The whole tag still removes the filter. Verified in the browser; build passes.

### 15.17 Committed (17 Nov 2026)

On branch `feat/variant-modal-sidebar-layout`, pushed to Milos's fork on 17 Nov:
- `a627a8b` feat(bom): Part Cross-Reference v2 with part cards and PIM filters (code plus `Documents/pim/2026-11-16-pim-column-mapping-by-product-type.md`).
- `05e36ea` docs(plans): handoff, plans, messages, UX audit notes, card reference image and the `figma-annotate` Cursor skill.
Still open: `hydra-ux-audit` pass, PR to the team repo, Figma filter panels and the removable tag in the Hydra DS file.

### 15.18 Pull request to the team repo (17 Nov 2026)

[PR #16](https://github.com/ooden-tech/on-hydra-app-prototype/pull/16) into `ooden-tech/on-hydra-app-prototype` `main`. The fork branch could not be used directly: its history differs from team `main` (PR #15 was a synced copy), so a direct PR would show 3,680 changed files and conflicts in the two Part Cross-Reference files. Instead a clean branch `feat/part-cross-reference-v2` was cut from team `main` (`ce699c6`) with only `BomPartCrossReferencePage.tsx`, `partCrossReferenceData.ts`, `PartCrossReferenceCard.tsx`, `PartCrossReferenceFilters.tsx`, `AppliedFilterTag.tsx`, `pimDisplayMapping.ts` and the PIM mapping doc. All other files the page uses were already identical in team `main`. `tsc` and `vite build` pass on that branch. The handoff, plans and messages stay on Milos's fork only. SSH to the team repo failed (host key); HTTPS with `gh` credentials works.

### 15.19 Cards reverted to the soft block, modal options (17 Nov 2026)

- **Cards (Milos):** the distilled cards (15.15) were reverted to the earlier design with the grey "Best RSFC match" block and the footer button, keeping one improvement: no "+1 more match" text; the button carries the count ("View 2 matches" / "View match"). Label "Best RSFC match" (or "RSFC match" when there is one). RSFC → competitor card keeps the 80 px photo row and uses "Best competitor match" / "Competitor match". Competitor card height 226 px at 1750 px. Built and checked in the browser; **not committed**. PR #16 still contains the distilled cards, so it needs this change too if it stays.
- **Match details modal, three options (Impeccable "shape"):** artifact https://claude.ai/artifact/UXsefMdBo2eEv6a9kjFEfp (private until shared). All keep today's content and functions, because Matt asked to keep the modal: competitor part, RSFC parts best first, origin filter, copy SKU, View product, Submittal PDF, warnings. Each adds real product photos, bordered tags and the card meta line; empty values are hidden.
  1. Two columns, card language (880 px wide): today's layout, RSFC parts as photo rows.
  2. Best match first (720 px): competitor in a slim strip, best RSFC part large with details and buttons, others as short rows.
  3. Side-by-side comparison (width grows with the number of matches, up to 1080 px): attributes in rows, "same" / "differs" marked.
  Three sample parts in the artifact: 2 matches, 1 match with the pressure warning, a coupling. Logic checked with Node for all 9 combinations. No option picked yet.
- **Modal version 1, competitor panel polished (Impeccable "polish"):** removed the meta line under the SKU (it repeated Brand, Figure and Size from the list). SKU and description now form one tight identity group (4 px apart), a hairline separates it from the attributes, attribute rows are 8 px apart with a 64 px label column. Republished to the same artifact link.
- **Modal version 1 built in the repo (Milos, 17 Nov), not committed:** `src/bom/components/PartCrossReferenceMatchModal.tsx` rewritten. Same content and functions (origin filter, copy SKU, View product, Submittal PDF, warnings). Two columns: 232 px competitor panel (label, SKU + name, hairline, Brand / Figure / Size / Material; empty values hidden), RSFC parts as card-language rows with a 72 px photo, bordered tags and a meta line, the best one with a primary border when there are several. Modal is 760 px wide (narrowed from 880 px at Milos's request). `PartPhoto` is exported from `PartCrossReferenceCard.tsx` and reused. Verified in the browser: photo and text edges aligned (0 px), nothing cut off; `npm run build` passes.
- **Rule from Milos (17 Nov): do not use the 12 px spacing token** (`marginSM` / `paddingSM`). Use 4, 8, 16 or 20 px steps. Applied in the modal. The cards, filter panel and artifacts still use 12 px in places; to be changed if Milos wants it everywhere.
- **12 px token, correction (Milos, 17 Nov):** the 12 px spacing token was briefly removed from the cards, filter panel and page, then put back exactly where it was (`marginSM` / `paddingSM`: card padding and gaps, grey block padding, photo gaps, skeleton cards, filter size-column gap and flyout padding, footer gap). The match details modal stays without 12 px (it uses 4, 8, 16 and 20 px). So the rule is: no 12 px in the modal; elsewhere keep what was already there.
- **Padding inside backgrounds (Milos, 17 Nov): must be the same everywhere in the cards.** Measured in the browser: part cards use 12 px on all four sides for both the card body and the grey "Best RSFC match" block (consistent). The match details modal uses 16 px for the competitor panel and for every RSFC match row (consistent inside the modal, but different from the part cards, because 12 px is not used in the modal). Open question for Milos: make the modal 12 px like the cards, or move the cards to 16 px.
- **Page height fix:** the page height could stay stale on first load (528 px instead of 784 px) when the header above changed size after the first paint. It is now measured again after fonts load and on the next frames; verified three times at 1750 × 970: the page does not scroll and the footer sits at 925 px.
- **Padding decision (Milos, 17 Nov): 12 px in the modal too.** The modal backgrounds (competitor panel and RSFC match rows) now use 12 px on all sides, the same as the part cards, and the 12 px gaps are back. The "no 12 px in the modal" rule is cancelled. Rule now: padding inside any background is 12 px in the cards and in the modal.
- **Question from Milos: is the "View matches" button on the cards redundant?** The whole card already opens the modal, so for mouse users the button adds nothing except the count and a visible hint. Option: remove the button, put the count in the grey block label ("Best of 2 RSFC matches"), make the card focusable (role button, Enter/Space) for keyboard users; saves about 32 px of height per card. Not decided.

### 15.20 "View matches" button removed from the cards (17 Nov 2026)

Milos chose to remove the footer button. The whole card is now the one action: `role="button"`, focusable (`tabIndex` 0), Enter or Space opens the match details, and hover and focus show the primary border. The match count moved into the grey block label: "Best of 2 matches", or "Only match" when there is one (same wording in the RSFC → competitor card). A longer label ("Best of 2 RSFC matches") wrapped onto its own line and cost the saved height, so it was shortened. Card height 226 → 190 px at 1750 px, all 12 cards equal. Verified in the browser: Enter opens the modal, no label wraps, no card has a button, the footer stays at 925 px. Not verifiable in the headless pane: the visual focus border (the pane window had no keyboard focus). Not committed; PR #16 still has older cards and the older modal.

### 15.21 Requirement check against the sources (17 Nov 2026)

Checked against the meeting (00:26:55), the BOM-431 comment of 13 Nov (no newer comments in Jira on 17 Nov) and the meeting next steps.

| Asked for (source) | Status |
|---|---|
| Show all parts, don't force a part number, search stays (Matt, meeting + Discord) | Built: all parts by default, search kept. Still needs Matt/James OK because it changes BOM-360 (message 10.2 not sent). |
| Toggle: competitor part or ASC part (Matt, meeting) | Built in Figma (all concepts) and repo. |
| "How many matches do I actually have" (Matt, meeting) | Built: count on each card ("Best of 2 matches") and in the modal. |
| Filters by category and attributes (Matt, meeting) | Built: category select plus PIM attributes from Sofija's mapping. Values are samples. Matt's example ("a half-inch stainless steel valve") cannot be shown with the sample data: no 1/2 in sizes and no stainless valves. |
| E-commerce-like, not just a list (Matt, Discord) | Built: part cards (concept B). |
| Keep the match details modal as it is (Matt, Discord) | **Deviation:** the modal was redesigned (version 1). Content and functions are the same, the look is new. Present it to Matt as an optional visual update, not as a change he asked for. |
| Attribute list from engineering (BOM-431 next step) | Done: Sofija's PIM mapping (CON-347). |
| Explore about 3 ways to show matches (BOM-431 next step) | Done in Figma (A table, B cards, C side by side). The repo builds only B. |
| Review with Matt by midweek, then James (meeting) | **Not done:** concepts not shared with Matt yet (deadline Wed 18 Nov). |
| CRM iframe variant (Loza, BOM-431) | **Not done.** |
| Meeting next steps for Milos: priorities with Lucas, Jira tickets on Wednesday, UX rules link in Discord, UX skills on GitHub (PR #965) | **Not done** as far as this file records. |

Also open: the latest card and modal work is not committed, and PR #16 still has older cards and the older modal.

FigJam board check (zone 6 and "Your next 3 days", 17 Nov):
- Zone 6 "Done when": about 3 concepts with both directions (done, Figma); filters on real data or marked as assumptions (done, PIM mapping, sample values); loading, empty, no results, error (done); confirm scope with Matt and James (**not done**).
- Zone 6 "After Matt picks a concept": full screens, then CRM iframe, then James. The repo already builds concept B before Matt has picked one; present it as one concept, not as the decision.
- Zone 6 sketch note "View matches opens the existing modal, it does not change": both changed since (button removed on 17 Nov, modal restyled). Both are Milos's decisions, not Matt's asks.
- Monday list: Loza asked (done); Matt asked about "show all parts" (**not sent**); UX rules link in Discord (**not done**); review request for PR #965 (**not done**); priorities with Lucas and the sheet (**not recorded as done**); first concept (done).
- Wednesday list: states (done); BOM-431 comment with Figma link and 3-line summary (**not done**); send Matt the link and the question which concept to take forward (**not done**); Jira tickets for the agreed priorities (**not done**).
- The board itself is now behind: zone 7 still lists the attribute list as missing, and zone 6 still shows the old filter set. Updating the board is optional (my suggestion).

### 15.22 Review frame for Matt in Figma (17 Nov 2026)

Milos asked to prepare in Figma what Matt asked for, without changing his designs or the repo. Added one new frame only, nothing existing was edited: [For Matt · Part Cross-Reference review](https://www.figma.com/design/Ht3Up5MlRAKjK7eCuAy05L/BOM---RSFC?node-id=7720-7129) (node 7720:7129), on the Concepts page above the concepts frame (y 10298). It uses the file's Hydra text styles (Title/Heading 2 and 5, Large/Normal, Base/Normal) and colour variables; the surface copies the concept card's fill, border and radius.
- **What you asked for:** the five asks with their sources (meeting 13 Nov; Discord 12 Nov), including "keep the modal as it is", noted as unchanged in these screens.
- **Where to look:** links to A1, A2, A3, B1, B2, C1, C2, the match details modal and the state screens (A4 to A9).
- **Two questions:** which concept to take forward; whether Matt and James are OK to show all parts before a search (changes BOM-360; one letter returns 4,853 parts on dev).
- **Good to know:** filter values are examples, the attribute list comes from the PIM mapping (CON-347) and PIM has no pressure data; the RSFC part view is new work; after the pick: full screens, CRM iframe, James's review.
Still to do by Milos: send Matt the link, and the BOM-431 comment.

### 15.23 Figma Concepts page organized, prototype screens added (17 Nov 2026)

Milos asked to organize the versions by sections and show the new design as built in the repo (filters, cards, modal), with an explanation of the filter panel and a click example. Original concept frames and components were not edited; they were only moved into sections at the same positions. New work uses copies.

Sections on the Concepts page (BOM - RSFC):
- **For Matt · review** (7728:9367): the review frame 7720:7129, now also linking P1 to P4.
- **Concept A · Table + filter panel** (7728:9368), **Concept B · Part cards** (7728:9369), **Concept C · Side by side** (7728:9370), **Filter and search states** (7728:9371), **Concept components** (7728:9372; the loose approved card 7703:15774 moved in here). Sections B to components were shifted down 150 to 545 px so they do not overlap. The old wrapper frame 7651:4917 now only holds the two intro texts (moved to y 10930, 2200 × 200).
- **Prototype · as built in the repo (17 Nov)** (7728:9373), left of the concepts:
  - P1 7723:7179: competitor → RSFC, compact filter panel with counts, 12 new cards ("Best of 2 matches", no button), clipped card area with scrollbar, footer "Showing 1–12 of 23 competitor parts".
  - P2 7723:8166: RSFC → competitor, new RSFC cards, single page (pagination hidden).
  - P3 7727:9438 + note 7727:9821 "How the filter panel works": Size flyout open (search, values with counts, Show all 10), markers 1 and 2, six numbered steps (open vs compact mode, click a row, pick a value, grey tag, close with click outside or Esc).
  - P4 7724:8349: match details modal version 1 over P1 (detached copy of the overlay; 760 px; competitor panel; photo rows; SKU and links below; Done).
  - Components (copies) 7722:7129: `Prototype / Part card · competitor → RSFC` 7722:7130, `Prototype / Part card · RSFC → competitor` 7722:7158, `Prototype / Filters · v2 compact` 7722:7181.
- Verified with screenshots of P1 to P4 and the page. Not drawn: the open (non-compact) filter panel at a tall screen height, and the applied-filter tag state.
- **Added 17 Nov (Milos: "add both"):**
  - P5 7729:9547: tall screen (1360 px) where the whole filter panel fits, so it uses the new component `Prototype / Filters · v2 open` (7729:9367): every group open with values and counts (Product type, Size with search, two columns and "Show all 10", End connection, Material, Certifications, Brand). The copy's 560 px max height was removed only in P5.
  - P6 7730:10050 + note 7730:10876 "After picking a value": Size 3 in applied. "Filters (1)" with "Clear all", "Size (1)", counts recalculated (3 each), grey tag "Size: 3 in" with close icon and "Clear all" above the cards, 3 cards (V030716PE0, V030717PHR, L030007PT0 with the fittings photo), footer "Showing 1–3 of 3 competitor parts", pagination hidden. The filter panel in P6 is a detached copy (the component stays untouched).
  - The review frame for Matt links P5 and P6 too. Verified with screenshots.

### 15.24 Concepts page rebuilt around two variations (17 Nov 2026)

Milos found the previous organisation unclear and asked for: clear sections; Variation A = everything in the repo (new filter, cards, modal, explanations, previous vs new modal and why, all states); Variation B = same pattern but filters as a slide-in (version 3 from the filter artifact), no left panel; empty state and edge cases for each; archive what is not needed (no variation with the long expandable left filter); a coloured components section; notes with an empty line between points and numbers styled like the markers on the screens.

Page "Concepts" in BOM - RSFC, top to bottom at x 12000:
- **0 · Start here · for Matt** (7732:10352): review frame 7720:7129 rewritten. Where to look links every A and B screen, Components and Archive. Questions: A or B; OK to show all parts before a search (BOM-360); keep the previous match details or take the updated one (A11 vs A12).
- **Variation A · Filters on the left (as built in the prototype)** (7732:10353): A1 7723:7179, A2 7723:8166, A3 tall screen 7729:9547; A4 flyout 7727:9438 + note "How the filter panel works" (markers 1 to 5); A5 after picking 7730:10050 + note (1 to 5); A11 previous modal 7655:5281, A12 new modal 7724:8349 + note "What changed in match details, and why" (1 to 5); states A6 searching 7732:10362, A7 no results after filters 7732:10742, A8 no matches 7732:11131, A9 search failed 7732:11507, A10 search-first 7732:11883.
- **Variation B · Filter bar and slide-in drawer** (7733:11739): copies of the A screens with the left panel hidden, a filter bar (Match type, RSFC origin, Product type, Size, Material, All filters) and three full-width card columns. B1 7733:11742, B2 7733:12345; B3 Size dropdown 7733:12835 + note (1 to 4); B4 All filters drawer 7733:13437 (mask, open filter groups, Clear all, Show 23 parts) + note (1 to 3); B5 after picking 7733:14039 + note (1 to 4); states B6 to B10 (7733:14491, 14837, 15248, 15596, 15947).
- **Components** (7735:15388, warm background): prototype components (cards, compact and open filter panels) and the earlier concept components.
- **Archive** (7735:15392, grey): the earlier Concept A table, Concept B cards, Concept C side by side, the long expandable left filter states, and the old intro frame.
- Notes: each point is a row with the same orange numbered circle used on the screen, 24 px between rows. Verified with screenshots of A and B; no overlapping sections.
- A7/B7 fixed (17 Nov): with the impossible combination every Match type and Origin count is 0 and the checkboxes are disabled (verified on the node and in a fresh screenshot). B has no tall-screen variant (the drawer covers it).

### 15.25 Subsections, Admin colours, equal card heights, checked example (17 Nov 2026)

- Cards in every row are the same height (tallest card in the row; the grey match block grows). The prototype card components now let "Part content" and the grey block fill the card height.
- Subsections inside Variation A (01 Main screens, 02 How the filter panel works, 03 Match details: previous and new, 04 States and edge cases) and Variation B (01 Main screens, 02 How the filters work, 03 States and edge cases). Each starts with a solid blue header bar (Hydra blue, white text) instead of the faint title.
- Colours follow the Admin - RSFC file: page background #787A7E; top-level sections navy #0C3559 at 10%; nested sections white at 10%; numbered subsection names like "01 · Search" in Admin. Components keep a warm tint (12%), Archive white at 5%.
- Checked example: A5 shows the Size flyout open with "3 in" checked next to the tag, "Size (1)" and the 3 results; B5 shows the same in the Size dropdown.
- Annotation draft (31 notes, figma-annotate skill) is waiting for Milos's "go". On approval the numbered markers and note cards are removed.

### 15.26 Native annotations instead of numbered markers (17 Nov 2026)

Milos approved the draft ("go"), then asked to keep only what is not obvious and only what explains how things work for a designer or PM.
- Written with the figma-annotate skill, then trimmed: 25 annotations remain on A and B screens (Interaction 13, State Change 4, Content 3, Data / API 2, Edge Case 2, Error Handling 1). Removed as obvious: card label count, Esc closes the flyout, "Filters (1)", "Size (1)", photo row, copy SKU, "filters are dropdowns", count in the dropdown label.
- Fixed versus scrolling is annotated on A1 card grid, B1 card grid and B4 drawer body (category Interaction, not Dev Notes).
- All 26 numbered markers and the 6 note cards were removed; A5 and B4 moved left to close the gaps.
- UI labels in annotations are bold (labelMarkdown) because the Figma API stored straight quotes as &quot;.
- One older annotation on A11 (Table cell 7695:7055) was left untouched.

### 15.27 Variation A made 1:1 with localhost (17 Nov 2026)

Milos asked for Variation A to be identical to `http://localhost:5173/bom/cross-reference`, not similar. Measured the running prototype (DOM sizes, texts, colours) at 1750x970 and 1750x1360 and changed only the Figma Concepts page (no repo changes).
- Shell on A1 to A12: no "Back to BOM"; topbar "Build or convert a Bill of Materials" and "Select project"; sidebar without "Feature Access Limit", "SeisBrace" spelling; title Heading 3 (24/500); description Base 14; content padding 24 top and bottom, 27 left and right; panel 238 and results 1186 with a 16 gap; toolbar 16/20 padding, segmented 346, category 192, search fills, placeholder empty.
- Card components: competitor card 366x190, RSFC card 366x194, 13 px inner padding, 48 and 80 px photos with the repo photos (angle-hose-valve.png, pipe-fittings-group.png uploaded), bordered Tag__Colorful for match type (green or gold) and origin (blue or purple), names in capitals, one line with ellipsis.
- Filter components: compact (198 wide, 32 px attribute rows, "Clear all" property) and open (983 tall like the repo). Flyout 256x168 at the Size row, "Show all 10" as a link.
- Screens: A1 and A12 background use the exact page 1 data (23 parts, pages "1 2"); A2 is the RSFC default (41 parts, 12 cards, pages 1 to 4); A3 1750x1360 with the open panel (cards 371 wide, no scrollbar); A4 flyout; A5 Size 3 in (3 cards, chip, "Filters (1)", "Clear all"); A6 12 skeleton cards, no footer; A7 copy from the repo with disabled 0 counts; A8 "No parts match “V999XYZ”" with "Clear search"; A9 Hydra DS Result error with "Try again"; A10 search-first copy, no counts (empty block detached because the DS block caps text at 560 px); A12 modal 760x460 at top 100 with repo spacing, tags and links.
- Verified with Figma screenshots next to browser screenshots and measurements.
- Repo issues found (not fixed, ask Milos first): after checking a value the Size flyout jumps away from its row; the open panel can show for a moment before compact mode; "No parts match these filters" can't be reached because 0-count values are disabled.

### 15.28 Concepts page cleaned up (17 Nov 2026)

Milos asked: a project selected on the screens, no tall-screen A3, only the current match details modal, the Archive section off the page, and a Components section with what A and B use.
- All A screens show "Riverside Office Park" in the topbar (B already did).
- Moved to the "🗄 Archive" page, section "Moved from Concepts · 17 Nov 2026 (not in use)" (7749:15229): old A3 tall screen, A11 previous modal, the whole Archive section (7735:15392), the concept sketch components and the concept filter set. Nothing deleted.
- Variation A renumbered: A1, A2 main; A3 flyout; A4 after picking Size 3 in; A5 match details (subsection "03 · Match details"); A6 to A10 states. The "For Matt" frame text updated to match (modal question is now "Is A5 OK?").
- Components section (7735:15388) holds only the 5 local components used by A and B, each with a label and where it is used: competitor card, RSFC card, Product image, Filters compact, Filters open. Tags, inputs and buttons come from the Hydra DS library.
- Sections re-stacked: Start here, Variation A, Variation B, Components, all 6210 wide at x 12000.

### 15.29 A5 modal rebuilt with the DS modal pattern (17 Nov 2026)

Milos pointed to the BOM Flows screen 2.6 (5570:200450) as the way modals are placed. A5 now follows it:
- Hydra DS `Modal__Overlay` instance (7750:8238), absolute, last child of the screen, with the DS `Modal` inside. Title "Match details · V024716PE0", close on, only the primary button ("Done").
- The content is a new local component `Prototype / Match details content` (7750:8202, in the Components section), placed in the modal's `.slot__component`, like `BOM / Parsed Line Editor` in 2.6.
- Repo sizes kept: modal 760x460, 100 px from the top (overlay aligned to the top), head 20 px top padding, content 8/8, footer 12/20.
- The old hand-built overlay frame was removed.

### 15.30 New UX rule UX-014: modal placement (17 Nov 2026)

Milos asked to add the modal pattern to the UX rules.
- New file `.cursor/skills/hydra-ux-pattern/rules/UX-014.md` (category Modals): open modal = DS `Modal__Overlay` as the last child of the screen, DS `Modal` inside, body as a local component in `.slot__component`, Modal and slot hug the content, Content Wrapper 8px top and bottom. References: BOM Flows 2.6 (5570:200450) and Concepts A5 (7750:8238).
- Added to the Figma skill table (`~/.claude/skills/hydra-ux-pattern-figma`), the repo code skill (`SKILL.md`, `code-audit.md`) and both catalogs in `Documentation/`.
- Confluence page "Hydra UX pattern rules" updated on 17 Nov 2026 with Milos's OK: UX-014 row added under UX-013 in the Rules table (version 5). Verified by reading the published page back; nothing else on the page changed.
- Not done yet: the `on-hydra-app` repo copy of the code skill (repo not on this machine). Not committed.
- UX-012 conflict is resolved in section 15.31: the back button was added.

### 15.31 Repo bugs fixed and "Back to BOM" added (17 Nov 2026)

Milos asked to fix the three repo bugs and to add "Back to BOM" to Variation A and B.
- Filter panel stayed open and was cut off (not compact): the panel now measures again whenever the page height changes, and stays hidden until that height is known, so it does not flash open. Checked at 900 and 700 px high: compact, fits the row. File: `PartCrossReferenceFilters.tsx`, new prop `fitHeight`.
- Size flyout moving away from its row: flyouts now use `autoAdjustOverflow={false}`, so each is always level with its own row. Checked for Brand, Size and Product type, before and after checking a value: same position.
- "No parts match these filters": shown only when the filters cause the empty list. If the search or category alone finds nothing, the search message shows ("No parts match "V999XYZ"") even with filters on. Filter values with 0 results stay disabled on purpose, so the filter message can only appear after the search or category changes.
- "Back to BOM" added to the prototype (`PageBackButton` to `/bom`, first item, 24 px above the title), as UX-012 asks.
- Figma Variation A: the same DS Button instance added as the first item in Content on A1 to A10. A3 and A4 flyouts moved down 56 px to follow the Size row. Variation B already had the button on B1 to B10, nothing changed there.
- Verified with the browser (DOM measurements and screenshot) and Figma screenshots of A2, A3, A4. Type check passes. Not committed.
- Still open: Variation B still shows "Feature Access Limit" in the sidebar and is not aligned to the repo otherwise.


### 15.32 Local main merged into the branch (17 Nov 2026)

Milos asked to merge `main` into `feat/variant-modal-sidebar-layout` locally.
- Local WIP committed first (`bdd1607`), then `main` merged (`b5b2bfe`). `main` is now an ancestor of the branch; nothing from `main` is missing.
- Five add/add conflicts (`SKILL.md`, `code-audit.md`, `PartCrossReferenceMatchModal.tsx`, `partCrossReferenceData.ts`, `BomPartCrossReferencePage.tsx`). Resolved by keeping the branch version: `main` (PR #14 UX skill, PR #15 demo sync) held older snapshots, identical to earlier commits of this branch (`5db4b42`, `a977f94`).
- The merge changes no file content against the branch, so nothing needed re-testing. Not pushed.
- Still open: push is not done, and PR #16 to the team repo was not re-checked after this merge.

### 15.33 Card Studio artifact: 6 card concepts for Part Cross-Reference (23 Nov 2026)

Milos asked how cross-reference cards should look, because today's card (B1) feels cluttered.
- Connect Portal (connectportal.asc-es.com, BigCommerce, public) checked read-only: result tiles are photo first, an uppercase name and two outlined buttons ("Add to Pricing Worksheet", "Add to Favorites"), with no SKU, brand or match info. The product page lists ASC item number, figure, source (Domestic), product type, size, finish, series, UPC and a submittal PDF.
- Artifact "Cross-Reference Card Studio" (private until shared): https://claude.ai/artifact/AMwg7JywgbbhPjmCXwpjD6. Today's B1 card as a baseline, plus 6 concepts (Swap line, Product tile, Side by side, Status row, Options stack, Spec card). Each concept is shown in three states (exact match, substitute with a caveat, no match with "Choose a part"). Hydra tokens, Barlow, and photos from the ConnectED catalog (`angle-hose-valve`, `7000-lr`). "Pick" marks favourites, and "Generate card" asks Claude (the artifact `sample` capability) for another concept in the same class vocabulary. Picks and generated cards are kept in the viewer's browser only.
- The Mobbin MCP is not connected, so the references are named public patterns (Octopart/Digi-Key, Connect Portal, Grainger/Amazon compare, Linear/Stripe rows, Google Shopping, McMaster-Carr), not Mobbin screens.
- Verified at 1280 px with a local preview: no overflow, all images load, card heights 102–332 px. "Generate card" was not exercised (it needs the claude.ai viewer).
- Next: Milos picks a direction, then it goes to Figma (BOM - RSFC, section 15) and the prototype card.

### 15.34 Design canvas: 6 photo tile ideas for Part Cross-Reference (23 Nov 2026)

Milos: today's cards (Figma 7735:15388) need less information and a simpler layout. The card must always have a photo and stay compact, and he only wants photo tiles: 6 different ideas.
- asc-es.com product results checked: each tile is a photo in a light box, then a small series/figure label and the name. No buttons or meta lines.
- Design canvas "Cross-Reference Cards · Simplified" (private until shared): https://claude.ai/artifact/3d4qyqdw2guQxR4YEpeASz. "Today" recreates both Figma cards. T1 ASC classic, T2 Status on photo, T3 Replaces footer, T4 Search header, T5 Spec chips, T6 Half tile. Each tile is 264 px wide and shown in three states (exact, substitute with caveat, no match with "Choose a part"). Hydra tokens, Barlow, ConnectED catalog photos.
- Origin (Domestic/Import), the competitor description and the figure/brand meta lines are off the card on every tile; they stay in the match details modal.
- Mobbin: no MCP in this session, and mobbin.com search returns 403 without a sign-in, so there are no Mobbin references.
- The earlier 6 non-tile directions were removed from the canvas at Milos's request. The Card Studio artifact (15.33) is unchanged.
- Next: Milos picks a tile, then it goes into the Figma components section (7735:15388) and `PartCrossReferenceCard.tsx`.

### 15.35 Photo tiles narrowed: T2, T5, T6 kept, U1–U6 added (23 Nov 2026)

Milos liked T2 (Status on photo), T5 (Spec chips) and T6 (Half tile), asked to remove the rest and add 6 more ideas based on those three.
- Canvas https://claude.ai/artifact/3d4qyqdw2guQxR4YEpeASz: T1, T3 and T4 were removed. T2, T5 and T6 now sit in one "Picked" row. The new row has U1 Status + chips (T2+T5), U2 Half tile + chips (T6+T5), U3 Half tile + photo badge (T6+T2), U4 Chips on photo (T2 pushed further), U5 Short tile (96 px photo band, specs as text), U6 Half tile + spec row (T6 on top, T5 underneath). All are 264 px wide and shown in exact, substitute and no-match states.
- Open DS questions: U3 uses a tinted status label, and Badge__Status has no fill. U4's tags on the photo need photos with padding at the bottom.
- Not checked in a browser after publishing. Next: Milos picks one, then Figma (7735:15388) and `PartCrossReferenceCard.tsx`.

### 15.36 Both tabs rebuilt with the simplified tile (23 Nov 2026)

Milos asked to see the simplified cards in a real screen for both search directions (Figma Variation A, 7732:10353).
- Added two 1750×970 artboards to the canvas https://claude.ai/artifact/3d4qyqdw2guQxR4YEpeASz, rebuilt from A1 (7723:7179) and A2 (7723:8166): the same sidebar, top bar, breadcrumb, Back to BOM, filters column, toolbar (direction toggle, categories, search) and footer with pagination.
- Tile: U1 (status + count on the photo, size and material tags). In a list the last line names the other side: "Replaces Victaulic V0…" on competitor → RSFC, "Matches Victaulic V0…" on RSFC → competitor. On the RSFC tab, the photo's top-right corner shows Domestic/Import instead of the count, because origin is a filter there. The grid is 4 per row, not 3; 12 per page is unchanged.
- Choice made by Claude (Milos did not name a tile). Not checked in a browser after publishing.

### 15.37 Repo: result cards rebuilt in the T2 format (23 Nov 2026)

Milos asked to make the cards in the repo simpler, in the T2 (Status on photo) format.
- Plan: `Documents/plans/2026-11-23-part-cross-reference-t2-cards-plan.md`.
- `src/bom/components/PartCrossReferenceCard.tsx`: both cards now share one tile. The photo is on top with a white status label (antd `Badge status`, Badge__Status) top left and "N options" top right when there is more than one. Below are two lines: the name and "For {brand} {competitor SKU}" (competitor → RSFC) or "Matches {brand} {competitor SKU}" (RSFC → competitor). A substitute with a caveat reads "Substitute · check" with the caveat in a tooltip. Removed from the card: the competitor description, the meta lines, the Domestic/Import and match-type tags, and the "Best of N" block (all still in the match modal). `MatchTypeTag`, `OriginTag` and `PartPhoto` are kept for the modal.
- `src/bom/pages/BomPartCrossReferencePage.tsx`: the grid minimum column went from `controlHeight * 9` to `* 8`, so cards fit 4 per row at 1750 px (card 271×190). 12 per page is unchanged.
- Verified: `tsc --noEmit` passes. In the browser at 1750×970, both tabs render 12 cards, 4 per row, all the same height. Click and Enter open the match modal, and the substitute tooltip shows. ESLint did not run (no `eslint.config.*` in the repo).
- Not committed. Not run yet: the `hydra-ux-audit` pass.

### 15.38 UX audit of the new cards, P1 fixed (23 Nov 2026)

Milos asked for the UX audit first, then "Ispravi P1".
- Audit (hydra-ux-audit + hydra-ux-pattern, read-only) found three P1 issues. BOM-UX013-001: the card showed match quality as a dot badge, but match quality must be a status tag. BOM-UX011-001: "N options" was a grey pill, but a count must be plain text. BOM-UX011-002 (older): `MatchTypeTag` used colourful green and gold tags. It also found two P2 issues, which are not fixed: the `controlHeightSM - 2`, `paddingXS + 2` and `maxWidth: '70%'` offsets, and a substitute caveat that only shows on hover.
- Fixed in `src/bom/components/PartCrossReferenceCard.tsx`. Top left on the photo is now a `HydraTag` status tag ("Exact match" green, "Substitute · check" yellow with the caveat in a tooltip). "2 options" is plain grey text on the right of the second line. `MatchTypeTag` is now `HydraTag` tone success or warning, so the match details modal changed the same way. Domestic and Import stay colourful.
- Verified: type check passes. In the browser at 1750×970, 12 cards render, all 190 px high, with no dot badges left. The card and modal tags use the status colours, and the modal opens. Status logs of UX-011 and UX-013 were updated. Not committed.

### 15.39 Option count made easier to see on the cards (23 Nov 2026)

Milos: the number of replacement options was hard to notice on the card.
- `PartCrossReferenceCard.tsx`: the count is always shown on the right of the second line. With more than one option it is link-coloured Small Medium text with a right chevron ("2 options >"), so it reads as "more inside" and the card opens the match details. With one it is plain grey ("1 option"). The RSFC part → competitor tab says "match" and "matches". It is still text, not a tag (UX-011).
- Verified: type check passes. In the browser at 1750×970 both tabs render 12 cards at 190 px with no overflow. Competitor tab: eleven "2 options", one "1 option". RSFC tab: all "1 match" in the sample data. Not committed.

### 15.40 Hydra DS check of the cards, two token offsets fixed (23 Nov 2026)

Milos asked whether the cards use Hydra DS correctly, then "Ispravi".
- Check: components come from `src/ui/antd.ts`, match quality uses `HydraTag` tone (DS `Tag__Status`), text uses Hydra text styles, and colours, border, shadow and radius are tokens (same pattern as `FeaturedPartCard`). Hydra DS has no product card, so the tile is composed from DS parts locally.
- Fixed in `PartCrossReferenceCard.tsx`: the text padding top went from `paddingXS + 2` to `paddingXS`. The photo now fills its frame inside `paddingSM` / `paddingLG` padding, replacing `height: photoHeight - paddingLG` and `maxWidth: '70%'`.
- Verified: type check passes. In the browser at 1750×970, 12 cards are 188 px high (was 190), the photo frame is 120 px, nothing overflows, and it looks the same as before. Not committed.

### 15.41 Match details modal: UX check and 6 proposals (23 Nov 2026)

Milos asked whether the modals explain things clearly and have good UX/UI, and for 6 proposals on the design canvas.
- Checked `PartCrossReferenceMatchModal.tsx` and the modal in the browser on both tabs. Main findings:
  - P1, RSFC part → competitor: clicking an RSFC card opens the competitor part's modal (`setOpenPart(result.competitors[0].part)`). The clicked part is not marked, and the counts disagree ("1 match" on the card vs "2 RSFC matches" in the modal).
  - P1: the title "Match details · V0…" does not say what the user is looking at.
  - P1: the best match is shown only by a blue border, with no label.
  - P2: "Done" is the only primary and only closes. The main job (copy the SKU) is a small icon.
  - P2: the Domestic/Import filter shows even for 2 matches. Two tags plus a long meta line per row. "View product" leaves the page. Submittal PDF is a stub message.
- Canvas https://claude.ai/artifact/3d4qyqdw2guQxR4YEpeASz, new row "Match details modal: six proposals": M1 Answer first, M2 Compare side by side, M3 Best match + others, M4 Drawer (needs a DS decision, UX-014 covers modals), M5 RSFC part → competitor (fixes the P1 on the RSFC tab), M6 Compact table (for 4 or more options; its rows are sample data).
- Not checked in a browser after publishing. Repo unchanged in this step.

### 15.42 Compare modal: specs side by side, competitor vs RSFC (23 Nov 2026)

Milos: a selected card should show the key specs, compare them clearly with the proposals, and make it obvious which part is the competitor and which is RSFC.
- Added M7 (competitor part → RSFC) and M8 (RSFC part → competitor) to the canvas https://claude.ai/artifact/3d4qyqdw2guQxR4YEpeASz, in the row "Specs side by side: competitor always left, RSFC always right".
- Pattern: the competitor is always the left column (grey, "COMPETITOR" label, "No photo for competitor parts"), RSFC is always the right column (blue, "RSFC" label, photo, status tag, SKU with Copy), with an arrow between them. One spec per row: Description, Product type, Size, End connection, Material, Certifications (M7), Origin. A middle column shows a green check when the values match. M7 has a switcher for the RSFC option (Option 1 Gruvlok 7811, Option 2 SCI 67CVE). M8 outlines the RSFC part that was opened ("You opened this") and, for a substitute, warns and links to the exact match.
- Data honesty: competitor parts only have brand, figure, size, SKU and description (material is always empty, no PIM). Product type and end connection are read from the competitor description and labelled "(from description)". The other competitor values say "Not in data". There is no pressure rating in PIM, so there is no pressure row. Certifications for the 7811 are empty in the sample data ("None listed in PIM").
- Not checked in a browser after publishing. Repo unchanged.

### 15.43 Compare modal distilled with /impeccable (23 Nov 2026)

Milos asked to run /impeccable to simplify the UI/UX further without losing the important parts, and to add the result below.
- Ran impeccable distill on M7 and M8. Added M9 (competitor part → RSFC) and M10 (RSFC part → competitor) under the row "M7 + M8 distilled: same compare, half the elements" on the canvas https://claude.ai/artifact/3d4qyqdw2guQxR4YEpeASz. Modal width back to 760.
- Kept: competitor left (grey, "Competitor"), RSFC right (blue, "RSFC", photo, status tag), the arrow, a one-line verdict ("Type, size and connection match"), the three specs both sides have, the option switch (M9), the one-line substitute warning with a link to the exact match (M10), and one primary "Copy SKU".
- Removed: the empty competitor photo box, the rows that only said "Not in data" (RSFC-only facts moved to one line under the RSFC name), the legend, the subtitle, the description row and the second footer link.
- Not checked in a browser after publishing. Repo unchanged.

### 15.44 Which information must show for a part and its equivalent (23 Nov 2026)

Milos asked to check all available sources for which information is required when we show a part and its equivalent.
- Sources read: Confluence "PRD - Static Matched Part Search (Cheat Sheets)" (2081193998: FR-3, FR-7, FR-8, AC-2), "STORY - Part Match Details Modal" (2160492545: Your Part rows, ASC card content, AC-3, AC-8, AC-9, AC-13), "BOM Template Ferguson Enablement - PRD" (1460928541: match type, origin and warning "to build trust"), Jira BOM-360 (eight approved result columns, search-only), and from this file: section 7 (backend fields), Matt's meeting asks and the personas. Also the Connect Portal product page fields (23 Nov).
- Must show. Competitor: brand, SKU, figure number, size, description. RSFC: SKU with copy, name/description, brand, figure number, size, photo. Match: match type, origin (Domestic/Import), warning/notes, and how many equivalents there are.
- Useful (RSFC only, from PIM): material, product type, end connection, certifications, product link, submittal PDF. Secondary: UPC (both sides).
- Not in the data: competitor material (always empty), competitor photo, competitor attributes beyond the description, pressure rating (not in PIM).
- Conflicts to decide: the modal story wants a placeholder ("—") for empty competitor values (AC-3), but the prototype hides empty values. The story wants "View Product"/"View PDF" to open without leaving the results (AC-9), but the prototype's "View product" navigates away. The story wants a single "OK" footer action (AC-13). It also mentions a hidden "Recommended" tag and a "Not Installation Ready" warning, which have no backing data.
- Gaps in M9/M10 compared with this list: no explicit competitor figure number, no match count number, and Submittal PDF is merged into one link.

### 15.45 M9 and M10 filled in with the required fields (23 Nov 2026)

Milos: "Da, dopuni" (fill in the gaps from 15.44).
- M9 and M10 on the canvas now show the SKU large on each side, then "Brand · Fig. NNN" (competitor: Victaulic · Fig. 716; RSFC: Gruvlok · Fig. 7811 or SCI · Fig. 67CVE), then the description (competitor) or material and origin (RSFC).
- Count: M9 says "2 equivalents" next to the option switch, M10 says "Replaces 1 competitor part" in the header.
- Links: "View product" and "Submittal PDF" are separate, each with an open-in-new-tab icon, so the search results stay (modal story AC-9).
- Still open from 15.44: the "—" placeholder vs hiding empty values (AC-3), and the footer "OK" only (AC-13) vs "Close" + "Copy SKU". Not checked in a browser after publishing. Repo unchanged.

### 15.46 Modal or another container for match details? (23 Nov 2026)

Milos asked whether match details should stay a modal or use another UX, with Mobbin research.
- Mobbin: still not reachable. Search returns 403 in the built-in browser and there is no Mobbin MCP. Used public sources instead: Smashing Magazine "Modal vs. Separate Page: UX Decision Tree" (2026), SAP master-detail and side panel guidance, Microsoft master-detail guidance, and the Digi-Key, Same Sky and TI cross-reference tools.
- What they say: a modal is for short, blocking decisions; a page is the default; a side panel or master-detail fits browsing and comparing many items with the list visible. Cross-reference tools label match tiers (Same Sky: exact, close, broad), compare parameters (Digi-Key) and handle "recognised part but no cross" (TI).
- Our constraints: CSRs do many lookups in a row on live calls; the view is read-only; the CRM iframe is narrow; Matt said "the current match details modal stays" (Discord 12 Nov); the 2027 roadmap has product detail pages.
- Recommendation (needs Matt's OK because it replaces the modal): a non-modal side panel (master-detail) with the M9/M10 content, Previous/Next through the results, and the open card marked. It becomes a full-width sheet in the CRM iframe and on narrow screens. A `?part=` URL param makes it shareable. A full product detail page later, with the e-commerce work. Not built.

### 15.47 Mobbin research: modal vs side panel, done with the Mobbin MCP (23 Nov 2026)

Milos connected Mobbin (plugin `mobbin@mobbin`, signed in via `/mcp`) and asked to do the research in this session. The Mobbin tools load only in new sessions, so the searches ran through the `claude` CLI on this machine (`claude -p` with `--allowedTools mcp__plugin_mobbin_mobbin`).
- Six web searches (product compare, details in a side panel, master-detail split view, quick view modal, similar/alternative products, B2B catalog search). Picked 12 references and checked them by looking at the screenshots. 5 side panels (Mercury, Remote, Unify, incident.io, H&M), 4 split views (Quo, Plane x2, Copilot Money), 2 modals (Givingli quick view, Base44 "More like this"), 1 full page (Tripadvisor "Similar").
- Canvas https://claude.ai/artifact/3d4qyqdw2guQxR4YEpeASz, new row "Modal or side panel? Mobbin references and the recommendation":
  - R1 is a reference board: 12 screenshots uploaded as canvas assets, each with app, container type, one line on what to borrow and an "Open on Mobbin" link.
  - P1 is the recommended non-modal side panel in the real screen. T2 tiles 3 per row, the open card is outlined, and a 460 px panel on the right holds the M9 content. Previous/Next ("Part 1 of 23") and Copy link (shareable) are at the top, close is on the right, and "Copy SKU" is the primary action at the bottom with View product and Submittal PDF.
- Conclusion: modals in the references are only quick previews. Comparing and stepping through items uses a side panel or split view (Mercury is closest: arrows, expand, open in page). Recommendation unchanged from 15.46: a non-modal side panel, full-width in the CRM iframe, a `?part=` link, and a full page later. Needs Matt's OK because he said the modal stays.
- Not checked in a browser after publishing. Repo unchanged.

### 15.48 Match details modal rebuilt in the M9 / M10 layout (23 Nov 2026)

Milos: do the modal proposal first, with Hydra DS and as few custom parts as possible, in the repo. Plan: `Documents/plans/2026-11-23-part-cross-reference-modal-m9-m10-plan.md`.
- `src/bom/components/PartCrossReferenceMatchModal.tsx` rebuilt from DS parts only (`Modal`, `Segmented`, `Table` small without header, `Alert`, `Button`, `Typography`, `Flex`, `HydraTag` status tag, `PartPhoto`). Title "RSFC replacement for {SKU}" (competitor tab) or "Competitor part for {brand} {SKU}" (RSFC tab). Count text plus a `Segmented` switch (Option 1/2, or competitor parts on the RSFC tab). Competitor block on the left (grey), RSFC block on the right (blue tint, photo, status tag, SKU, brand and figure, material, origin, certifications), an arrow between. One verdict line and a spec table (product type, size, end connection) with a check or warning per row; rows with no competitor value are hidden. Alert for the equivalent's note; on the RSFC tab a substitute gets an Alert naming the exact match with "Compare it". Footer: "View product" (real link, new tab) and "Submittal PDF" on the left, "Close" and primary "Copy SKU" on the right. Width 760. The old per-row origin filter, copy icon and meta line are gone.
- `src/bom/pages/BomPartCrossReferencePage.tsx`: the modal state is now `{ part, openedSku? }`, so the RSFC tab opens the modal for the RSFC card that was clicked (it used to open the first competitor part with no marker). 
- `src/bom/data/partCrossReferenceData.ts`: new small helper `competitorDescriptionAttributes` (product type and end connection from a competitor description, same patterns as `rsfcPimAttributes`).
- Verified: `tsc --noEmit` passes. In the browser at 1750×970: competitor tab (Option 1 exact match, Option 2 substitute, Copy SKU copies 4323000102 and shows the toast, Close), RSFC tab (substitute card shows "RSFC, you opened this" and the exact-match Alert, "Compare it" switches to the exact match), a part with a note (2 spec rows, note Alert). No console errors. Still open: footer "OK" only vs "Close" + "Copy SKU", and hiding vs a dash for empty competitor values. Not committed. The side panel (P1) stays a proposal for Matt.

### 15.49 Modal: bigger photo and the same label for both sides (23 Nov 2026)

Milos: the product photo in the modal is small, give it the same distance from the block edges as on the left, and make it clear which is the competitor and which is RSFC, in the same way.
- `PartCrossReferenceMatchModal.tsx`: the RSFC photo went from 60 px to 124 px (`controlHeightLG * 3 + marginXXS`), so the block grew from about 96 to 150 px and the modal about 55 px taller. Measured: 13 px (12 padding + 1 border) between the photo and the block edge on the left, top and bottom. The competitor block stretches to the same height.
- Both blocks now start with the same neutral `HydraTag`: "Competitor" and "RSFC". The match status tag follows the RSFC tag, and "You opened this" is a separate small line under it (RSFC tab).
- Verified: type check passes; in the browser the exact-match modal is 511 px tall and the substitute one 569 px, photo 124×124 in both. Not committed.

### 15.50 UX pattern audit of the Figma section "Part Cross-Reference · Current prototype" (24 Nov 2026)

Milos ran `/hydra-ux-pattern-figma` on BOM - RSFC, page Concepts, section `7926:22050` (9 screens, 01 to 09). Read-only, nothing changed in Figma.
- How: official Figma MCP (the figma-console Desktop Bridge was not connected), screenshots of all 9 screens plus read-only node scripts.
- The screens are a flat import: no Auto Layout anywhere (screen, content, cards, modal). Visually most rules match, but spacing is positional, not bound to tokens.
- Clear findings: the card "N options" count is a grey `Tag` (UX-011, 36 cards, local component "Cross-reference result" `7933:6965`); "Figure match" is `Tag__Colorful` geekblue on 4 cards and in modal 06 (UX-011 and UX-013, should be `Tag__Status`); modals 05 and 06 are a hand-built scrim plus frame, not `Modal__Overlay` + `Modal` (UX-014); screen 08 hides the filter panel, so the toolbar moves (UX-007 every state).
- Already correct: back button (UX-012), table links `colorLink` (UX-002), table counts plain text and match type `Tag__Status` (UX-011), state cards reach 24 px above the bottom (UX-009), Input + primary "Search" medium with 8 px (UX-005, visually).
- Needs review because of the flat structure: UX-001, UX-005 container, UX-006 minHeight, UX-007 tokens. Next: Milos decides which findings to fix ("Fix approved ..."); the code already has the UX-011 count fix from 23 Nov, so Figma lags behind it.

### 15.51 UX fixes 1 to 3 applied in Figma, modals checked (24 Nov 2026)

Milos: "Fix 001 to 003" on the 15.50 audit, then asked to check the modals.
- Fixed in BOM - RSFC, section `7926:22050`: card count is plain text (`Base/Normal`, `colorTextSecondary`) in the local component `7933:6965`, all 69 instances kept their text; "Figure match" is `Tag__Status` processing (8 cards and modal 06); "Domestic" and "Import" in modal 05 have border on. Verified by reading the nodes back and by screenshots. Status logs added to UX-011 and UX-013.
- Code is now behind Figma for "Figure match": `FigureMatchTag` still renders a geekblue colourful tag.
- Modals 05 and 06: hand-built (scrim rectangle, frame, rectangle "ant-modal-container", loose title text, bare CloseOutlined icon), not `Modal__Overlay` + `Modal` + body in `.slot__component` (UX-014, Needs review). The content is also older than the M9/M10 modal in the repo (15.48), so a rebuild should start from the repo version.

### 15.52 Match details modals 05 and 06 rebuilt with the DS Modal (24 Nov 2026)

Milos: "Yes, rebuild" (UX-014 on screens 05 and 06 of section `7926:22050`).
- Both screens now end with a DS `Modal__Overlay` (center) holding the DS `Modal`: title "Competitor Part Match", close icon, footer "Close". The bodies are local components in "05 · Components" (`7952:2610` equivalents, `7953:2633` figure), Auto Layout with DS spacing, radius and colour tokens, 984 wide so the modal is 1032 like the code. The old scrim and frames were deleted.
- Content is unchanged (same texts, tags, images, buttons). The SKU rows on 06 were misaligned by 11 px before and now line up.
- Verified: node read-back (overlay last child, Modal and slot Hug, Content Wrapper `paddingXS`) and screenshots of both screens.
- Still open: the content is older than the repo modal (M9/M10, 15.48), so the Figma modal and the code differ; "Domestic" and "Import" colours are not in the UX-013 Type table.

### 15.53 Match details modal: critique and 3 design samples (24 Nov 2026)

Milos asked to run the modal optimisation prompt (Part Cross-Reference only). Steps 1 to 3 done, no repo or Figma change.
- Finding: the checked-out `PartCrossReferenceMatchModal.tsx` on `main` is the older two-column modal (no Segmented, title "Competitor Part Match", footer "Close" only). The M9/M10 rebuild from 15.48 and 15.49 is not in this checkout (it was never committed, and later commits changed the file). Decide whether to rebuild it before any new change.
- Impeccable detector: 0 findings on the file. No PRODUCT.md or DESIGN.md exists, so Impeccable ran on the incumbent code only.
- Design samples in one Claude Artifact (canvas): https://claude.ai/artifact/GXbvzE17Hb64x8jwohFSQT . A clean two-column modal, B compare one option at a time, C side panel with step-through (needs Matt's OK). Next: Milos picks one, then a plan in `Documents/plans/`.

### 15.54 Modal samples revised: side panel dropped, one-option states added (24 Nov 2026)

Milos: no slide-in panel, add the case with just one option. Canvas https://claude.ai/artifact/GXbvzE17Hb64x8jwohFSQT now has 4 artboards: A two-column with 2 options, A with 1 option (exact match), B compare with 2 options, B with 1 option (a substitute, with a warning note and a warning on the size row). Sample C (side panel) was removed, so the side-panel proposal for Matt is no longer part of this work. The size and SKU data on the B 1-option sample (V020717PHR, 2 in vs 2-1/2 in) is illustrative, not checked against the data file.
- 15.54 addition (24 Nov 2026): the canvas now starts with a "Current modal" row (2 options, 1 option), redrawn from the repo modal on `main` and Figma screen 05, then the proposals row below. The 1-option current sample uses an illustrative pair (V020717PHR with SCI 67CVE as a substitute, size 2 in), not a checked record.

### 15.55 Hydra Daily brief added to the design canvas (24 Nov 2026)

Milos pasted the brief from today's 15:00 Hydra Daily (the Granola notes were not readable from this session). Canvas https://claude.ai/artifact/GXbvzE17Hb64x8jwohFSQT now holds: the brief as a sticky; results page in Cards and Table view (toggle links, text-only cards, fixed filter panel with Brand and Match type, a note that more RSFC filters wait for Ivan); the staging modal with 1, 2 and 7 matches; "1 Optimized modal" and "2 Slide-in panel", each with 1 and 7 matches, interactive (Copy SKU shows "Copied", match type chips filter the 7-match list); earlier A and B explorations kept in the bottom row.
- The side panel is back in scope because the brief asks to compare it with the optimized modal (15.54 had dropped it).
- Data: only the 7811 / SCI 67CVE pair is real. The other 7-match rows, the 1-match RSFC part (7001 coupling) and the 29 / 26 / 19 / 2 filter counts are illustrative. An orange sticky says so.
- Not built: the narrow-screen checkbox filter variant, and the brief's final decision. The brief says keep the existing modal if neither alternative is a clear improvement.
- 15.55 update (24 Nov 2026): Milos asked for one identical card that works with 1, 2 and 6 options, in the modal and in the slide-in, and to delete everything else. The canvas now has only: Modal 1, 2, 6 options; Slide-in 1, 2, 6 options; and three shared parts (`MatchCard`, `MatchModal`, `MatchPanel`) the six boards import. Deleted: staging baseline, results page (Cards and Table), earlier A and B explorations, the 7-match boards and old titles. The brief and data stickies and Milos's two pasted images were kept. The modal is now 800 wide (was 1032) because the card left a lot of white space. Data: only the 2-option pair (7811 and SCI 67CVE) is real, the 1-option and 6-option rows are illustrative. Not opened in a browser.
- 15.55 update 2 (24 Nov 2026): canvas rebuilt with real Hydra tokens from `Documentation/ds-inventory.json` (colorText `#000000e0`, borders `#d9d9d9` and `#f0f0f0`, colorLink `#2576bb`, success, warning and info tags, radii 8, 6 and 4, spacing 4 to 24, Barlow). No Hydra design system exists as an Artifact of type "Design System" for this account, so tokens are copied by value, not linked. Now 8 self-contained boards (the shared-import version was removed because boards were not showing): Modal 1, 2, 3 and 6 options (modal 800 wide, card about 492) and Slide-in 1, 2, 3 and 6 options (panel 524 wide, same card width). Copy SKU is a small default button in every row (UX-010), no orange primary. The 3-option case mixes an exact match, a substitute and a figure match. Not opened in a browser.
- 15.55 update 3 (25 Nov 2026): decision with Milos: the match details modal and slide-in have no tabs (no match type filter). The "N RSFC options" count line stays (removed, then restored at Milos's request, Version 38). Reason: most parts return 1 to 3 options, the group headings ("Best match", "Other options", "Figure matches") already split the list, and the tags on each card show the match type. Revisit only if real data often returns 8 or more options, and then add one small Select instead of tabs. Applied to all 8 boards. Not opened in a browser.

### 15.56 Match details rebuilt in Figma from the design canvas (25 Nov 2026)

BOM - RSFC (`Ht3Up5MlRAKjK7eCuAy05L`), page Concepts, section "Part Cross-Reference · Current prototype" (7926:22050).
- Section "03 · Match details · Modal": old screens 05 (SKU match) and 06 (Figure match) were replaced by 05a, 05b and 05c (modal with 1, 3 and 6 options). DS `Modal__Overlay` + `Modal`, body component in `.slot__component` (UX-014). Modal is 800 wide, title "RSFC replacements for <SKU>".
- 05c is the edge case: the modal is at its max height (screen minus 200px, 770px on a 970 screen) and the options list scrolls. Two native annotations: "Max modal height" (Edge Case) and "Options list scrolls" (Interaction).
- New section "03b · Match details · Slide-in" with 06a, 06b and 06c (1, 2 and 6 options). DS `Drawer` placement right, 544 wide so the card is 496 like in the modal. Sections 04 and 05 moved down. The 6-option list has an "Options list scrolls" annotation.
- New components in "05 · Components": `Prototype / RSFC option card` (variants Exact, Substitute, Figure; text props Name, Meta, SKU) and six body components (Modal 1, 3, 6; Slide-in 1, 2, 6). Old bodies "Equivalents body" and "Figure body" were deleted.
- Needs review: the DS `Drawer` panel is a fixed 378px and cannot be resized in an instance, so the instance is 544 wide with the panel set to Fill. Because of that the DS mask does not cover the page (the canvas design had no mask either). No tabs, as agreed. The blue border on the best match from the canvas was not used (no exact DS stroke token found). Only the 2-option pair (7811 and SCI 67CVE) is real data; the 1, 3 and 6 option rows are illustrative. Code is not changed.
- 15.56 update (25 Nov 2026): the 6-option modal (05c) and 6-option slide-in (06c) now have a DS `Scrollbar` instance on the right of the options list (absolute, full list height). The list has 20px right padding so the cards (476 wide there) do not run under it. Milos confirmed the slide-in stays without the dark page mask. Checked on screenshots.
- 15.56 update 2 (25 Nov 2026): slide-in repacked to take less height. "Your part" is now one compact block (label, part name, one line "Victaulic · SKU … · Fig. … · size"), 100px high instead of 208. The option card has no divider and 8px inner gap, and the link label is now "Submittal PDF" so the footer fits in the 372px drawer (it was cut off as "View Submittal Pl"). Card 137px instead of 154 (496 wide) or about 175 (372 wide). Gaps in the slide-in bodies are 12 and 8. Exact card variant (7960:70) is being edited by hand by Milos at the same time (SKU number inside the Copy button, wrapper around name and meta); Substitute and Figure variants do not have those edits yet, so the three variants differ until Milos finishes. Not touched by Claude after that.
- 15.56 update 3 (25 Nov 2026): Milos rebuilt the card as "RSFC Option Card" (7962:130173, props Headline, Subheader, Show Tag 1, Tag 1 and Tag 2 as Tag__Colorful swaps) and the modals now use one "Part match body" (7961:142). Claude added an instance swap property and exposed the nested tag props, then filled the three modal screens through instance overrides only: 05a (V050716PE0, one exact 7811), 05b (V030716PE0, exact 7811, substitute SCI 67CVE, figure 78FP with "Show 4 SKUs"), 05c (V040716PE0, count "6 RSFC options", three visible cards). Tag colours: Exact match green, Substitute gold, Figure match geekblue, Domestic blue, Import purple. Photos from the 7811, 67CVE and 78FP images. 05c title fixed to V040716PE0. Only the 2-1/2 in pair is real data. 05c has only 3 cards because the body component holds 3; the rest are implied below the scroll. Checked on screenshots.

### 15.57 Match details modal in the repo matches Figma 05a to 05c (25 Nov 2026)

Plan: `Documents/plans/2026-11-25-part-cross-reference-match-modal-figma-parity-plan.md`.
- `src/bom/components/PartCrossReferenceMatchModal.tsx`: title "RSFC replacements for <SKU or Fig.>", 800 wide (Your part 232 + options), count "N RSFC options", groups "Best match" and "Other options", no origin Select, card without divider, Copy SKU button labelled "SKU <number>", "Submittal PDF" link, figure cards with "Show N SKUs" toggle. On desktop the modal stops 100px from the top and bottom and only the options list scrolls; on narrow screens one column and the body scrolls.
- Kept from code, not from the Figma draft: status tags for match quality (UX-013), note alert, "View product" link.
- `src/bom/data/partCrossReferenceData.ts`: illustrative extra options (marked in a comment, not verified) so V030716PE0 has 3 and V040716PE0 has 6 options; they stay out of the figure SKU lists. Photo map extended for those SKUs.
- Verified: `npx tsc -b` passes; browser at 1600x970 (6 options: modal 800x770, 100px top and bottom, list scrolls), figure 712 "Show 10 SKUs" toggles, 375px mobile one column and no horizontal scroll. Copy SKU shows the error message in the preview pane because its clipboard is blocked; not checked in a normal browser. Not committed.
- 15.56 update 4 (25 Nov 2026): slide-in bodies (1, 2 and 6 options, used in 06a to 06c) now use the same "RSFC Option Card" (7962:130173) instances as the modals. The old card instances were replaced in place, keeping headline, subheader, tag text and colour (Exact match green, Substitute gold, Figure match geekblue, Domestic blue, Import purple), SKU on the copy button, and photo. Exact SKUs fixed to 2200750120 (1 option) and 2200750098 (6 options). Checked on screenshots. 06a drawer then fixed: title "RSFC replacements for V050716PE0", header buttons hidden, same as 06b and 06c.
- 15.56 update 5 (25 Nov 2026): slide-in 06b and 06c now use the same DS Drawer setup as 06a (420 wide panel, title "RSFC replacements for <SKU>", header buttons hidden, body 372 wide in the slot). The old 544 wide drawers were removed; bodies and cards unchanged. Annotations re-added because they were lost: 06c "Options list scrolls" and 05c "Max modal height" and "Options list scrolls". Note: the 05c mock is 676 high (body is 556), not the 770 max, so the annotation says the max in words. Checked on screenshots.
- 15.56 update 6 (25 Nov 2026): cleaned "05 · Components" (7926:23269). Deleted the unused loose "Cross-reference result" instance (7926:12283, an unchanged copy of the component, not used on any screen). The six components stay because all are used: Cross-reference result, RSFC Option Card, Part match body (modals), Part match body Slide-in 1, 2 and 6 options. Section size not changed.
- 15.56 update 7 (25 Nov 2026): one body component for modal and slide-in. "Part match body" is now a component set (7985:4933) with Layout=Modal (7961:142, existing, instances kept) and Layout=Slide-in (7985:4901, vertical, Your part details in a 2 x 2 grid). Both variants hold 6 RSFC Option Card instances (Best match + 5 other options); screens hide the cards they do not need. 06a, 06b, 06c moved to Layout=Slide-in with their data; 05b hides 3 cards; 05c now shows all 6 options, body capped at 650 so the modal is 770 high with the list clipped. The three old "Prototype / Part match body · Slide-in · 1/2/6 options" components were deleted. Components section and parent section resized to fit. Checked on screenshots.
- 15.58 (25 Nov 2026): auto layout pilot on "01 · Browse · Cards" (7929:72), following the reference "1.1 — Hub · Project List" (5289:21286): Screen vertical, hug, minHeight 970 > Body > Sidebar + Right > Top Bar, Breadcrumb, Content (24 gap, 24 padding) > Back button, Page header (4 gap), Filters and results row (16 gap) > Filter card (238, padding 20, groups with 8 gap) and Results card (Toolbar 16/20 with 20 gap, Search input + button 8 gap, Results view; cards grid as wrap 16/16; Footer with one "Showing 1–20 of 29 results" text and Pagination 8 gap). All gaps and paddings bound to Size/Padding tokens; card surfaces and radii copied from the old rectangles with their variables. Removed the loose rectangles, split texts and duplicate pagination icons. Screen is now 994 high. Waiting for Milos's OK before the other 12 screens.
- 15.58 update (25 Nov 2026): all 13 screens of "Part Cross-Reference · Current prototype" are now auto layout with the 01 structure (Screen > Body (min 970) > Sidebar + Right > Top Bar, Breadcrumb, Content). 05a to 06c reuse the 01 body with the Modal__Overlay or Drawer as the only absolute layer (UX-014). 02 table rebuilt as header row + 8 rows of auto layout cells; 03 keeps the size popover as an absolute auto layout frame next to "Size"; 04 has "Filters (1)" + "Clear all", new counts, an "Active filters" row and 4 cards; 07 has 16 auto layout skeleton cards; 08 and 09 have a centered state frame (577 high). Icon wrappers turned into fixed auto layout frames. Footers use the DS Pagination (type=basic, items 3 to 5 hidden, previous disabled) instead of 4 loose pagination items. Checked on screenshots.
- 15.58 update 2 (25 Nov 2026): DS components wherever possible, detached DS instances where a prop is missing. Swapped: 34 divider rectangles for Divider__Horizontal (detached, 1px, no margin, because the instance cannot be made 1px); 13 "Results view" frames for Segmented (items=2, medium, old item props copied); 04 "Clear all" texts for Button link small; 09 state for Result status=error ("Try again", Error Details hidden); 08 state for Empty State Block ("Clear search"); 03 popover for a detached Popover (right top, arrow) with the size search and options; 07 bars for detached Skeleton (title 40%, last row 60%); 02 table cells for Table / Table Item / Header Item and Table / Table cell (text and tag types, large, Tag__Status without icon). Earlier: footers use DS Pagination. Still hand-built because the DS has no matching component: the Filter card and Results card containers and the table row frames. Checked on screenshots.
- 15.59 (25 Nov 2026): new rule UX-015 "Screens Built Only From Auto Layout, DS Instances and Tokens" approved by Milos and written to `.cursor/skills/hydra-ux-pattern/rules/UX-015.md`. Decisions: height hugs content with minimum 970; a detached instance becomes a local component when used 3 or more times or on more than one screen; Card has no DS component so cards are auto layout frames with bound tokens and listed as a DS gap; applies to all RSFC Figma work, applied one section at a time on request. Registered in the repo skill table and code audit, and in the personal Figma skill `hydra-ux-pattern-figma`. Still to do when Milos asks: update the Confluence page "Hydra UX pattern rules" and the copy in `on-hydra-app` (`.agents/skills/hydra-ux-pattern/`). Candidates for local components in the Part Cross-Reference section: detached Divider (34 uses) and Skeleton.

### 15.60 New ask: selectable variant of the match details modal for the BOM replace part flow (25 Nov 2026)

Discord (13:35): the match details modal also needs a variant where an RSFC option can be selected by clicking it (BOM replace part flow), and then the footer button is "OK".
- Read: the live modal on `develop` (`StaticMatchesPartMatchModal`) already has one primary "OK" footer that only closes it (this is the modal story AC-13), and an optional per-card "Add to BOM" button used only on the CRM BOM page. It has no selectable cards. The prototype's BOM replace modals (`BomChoosePartModal`, `BomSuggestedPartsModal`, `BomCatalogSkuPickModal`) already use selectable cards (blue border and tint) with a disabled primary button until something is picked ("Select part", "Select match", "Use as replacement").
- Understanding: one modal, two modes. Look-up mode (Part Cross-Reference, cheat sheet): cards are read-only, footer "OK" or "Close". Replace mode (BOM): the whole RSFC Option Card is clickable and shows a selected state, footer "Cancel" + primary "OK", OK disabled until one option is chosen, OK replaces the part in the BOM line.
- Figma section 7926:22050 was not opened: the official MCP has no access to the file and the Desktop Bridge plugin was not connected. Open questions: is the default selection the best match; does a figure option need a SKU picked first ("Show N SKUs"); does the slide-in need the same mode.

### 15.61 Selectable RSFC option cards and "Add to BOM" with confirmation, in the repo (26 Nov 2026)

Milos: build the "RSFC Option Card" from Figma section 7926:22050 (component set 8017:11748, state=default, hover, selected) inside the match details modal; a 3-option case with one normal and two long names; Close just closes; Add to BOM asks for confirmation, then closes and shows a top toast.
- Figma read through the Desktop Bridge: default `colorBgContainer` + `colorBorderSecondary`; hover `colorPrimaryBorderHover` + `boxShadowSecondary`; selected `colorBgElevated` + `colorPrimary`; padding `paddingSM`, gap `paddingXS`, radius `borderRadiusLG`, dividers under the name and above the SKU row. 05b footer: "Close" + primary "Add to BOM".
- `src/bom/components/PartCrossReferenceMatchModal.tsx`: the option card is now a radio option (click, Enter or Space; copy, links and "Show N SKUs" do not select). The best match is selected when the modal opens; the choice resets on close. Footer "Close" + primary "Add to BOM" (only for SKU results; figure results keep "Close" only). Add to BOM opens `modal.confirm` "Add this part to the BOM?" (Cancel / Add to BOM); on confirm both close and `message.success` says "SKU <sku> added to the BOM as the replacement for <brand> <competitor SKU>." The DS `OptionCard` in `src/ui` was not reused because it has only title and description slots. Long names wrap in full, as in Figma.
- `src/bom/data/partCrossReferenceData.ts`: V030716PE0 (Figma 05b part) now shows the real Gruvlok 7811 exact match (normal name) and two Sharpe options with the long PIM descriptions used on the Figma cards (SERIES 25 check valve, SERIES 35 gate valve). Their SKUs (5500253000, 5500353000) and the mapping are illustrative, and SERIES 35 is a gate valve, so it is an edge-case placeholder only. The real SCI 67CVE substitute no longer shows for this part. No CRM data source is reachable from this repo.
- Verified: `npx tsc -b` passes; browser at 1600x970: best match selected on open, hover border and shadow, card click selects, copy click does not, keyboard Space selects, Add to BOM → confirm → modal closes and the top toast shows, Close closes with no toast, no console errors. Not committed.
- Open: does "Add to BOM" in the Part Cross-Reference page need a BOM or project picker (there is no BOM line on this page); replace-mode footer "OK" from 15.60 vs "Add to BOM" here; does the slide-in need the same selection.

### 15.62 Option card synced with Figma, nothing selected by default, link mix (26 Nov 2026)

Milos: update the RSFC Option Card from Figma; the modal can have no card selected (Add to BOM disabled), selecting one enables it; show a mix of long-title edge cases; check whether every card needs both View product and Submittal PDF.
- Figma (8017:11748) read again; the Desktop Bridge dropped, so only screenshots and the node list were used. Card unchanged since 15.61. Aligned the code to it: photo 64 px, meta line `Base/Medium` + `colorText`, links labelled "View Product" (link icon) and "Submittal PDF".
- `PartCrossReferenceMatchModal.tsx`: no default selection. The modal opens with all cards unselected and "Add to BOM" disabled; choosing a card enables it. There is no way to unselect (a radio group); Close resets it.
- Links: not every card needs both. Each link shows only when the ASC data has it (product URL per SKU, submittal PDF per figure), so a card can have both, one or none. The prototype data has real URLs for few SKUs, so most cards have one or none. Decision for Milos: keep it this way (no dead links), or show both buttons always with a disabled state.
- `partCrossReferenceData.ts`: V030716PE0 now mixes: 7811 exact match (normal name, submittal only), SERIES 25 (long name, product link only; the link is an illustrative root URL), SERIES 35 (long name, no links). Both links appear together on the V050717PE0 78FP card.
- Verified: `tsc -b` passes; browser: all 3 unselected, Add to BOM disabled, selecting card 3 enables it, links per card as listed, no console errors. Not committed.
