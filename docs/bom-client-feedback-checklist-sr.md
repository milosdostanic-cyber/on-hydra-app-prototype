# BOM — šta je urađeno (kratka lista)

Provereno na grani `bom-upload-match-review-plan` ([PR #5](https://github.com/ooden-tech/on-hydra-app-prototype/pull/5)).

Za test: `npm run dev` → [http://localhost:5173](http://localhost:5173)

---

## 1. Upload i search treba da se više vide

**Gde u app-u:** [BOM početna — kartice Upload / Search](http://localhost:5173/bom/site/3)

**Šta smo uradili:** Dve velike kartice (upload fajla i pretraga delova). Na hover se istaknu — odmah se vidi šta da klikneš.

**Kod:**
- [`src/bom/pages/BomSiteProjectsPage.tsx`](../src/bom/pages/BomSiteProjectsPage.tsx)
- [`src/bom/pages/BomWorkspacePage.tsx`](../src/bom/pages/BomWorkspacePage.tsx) (prazan workspace)

---

## 2. Jasniji tekst na mapiranju + naglašeni podaci iz fajla

**Gde u app-u:**
- [Mapiranje kolona — pregled](http://localhost:5173/bom/projects/new/mapping-summary)
- [Mapiranje kolona — izmena](http://localhost:5173/bom/projects/new/field-mapping)
- [Provera parsiranog fajla](http://localhost:5173/bom/projects/new/parsing-review)
- [Guided match](http://localhost:5173/bom/projects/new/matching/review)

**Šta smo uradili:**
- Umesto tehničkog žargona: **IN YOUR FILE**, **PART DETAIL WE NEED**, **YOUR PART**, **HOW WE MATCHED IT**
- Vrednosti iz tvog fajla imaju plavi okvir sa leve strane — lakše se vide od ASC kolona

**Kod:**
- [`src/bom/components/BomFieldMappingTable.tsx`](../src/bom/components/BomFieldMappingTable.tsx)
- [`src/bom/pages/BomMappingSummaryPage.tsx`](../src/bom/pages/BomMappingSummaryPage.tsx)
- [`src/bom/bomImportedDataEmphasis.tsx`](../src/bom/bomImportedDataEmphasis.tsx)
- [`src/bom/bomParsingReviewColumns.tsx`](../src/bom/bomParsingReviewColumns.tsx)
- [`src/bom/components/BomMatchingReviewPartPanel.tsx`](../src/bom/components/BomMatchingReviewPartPanel.tsx)
- [`src/bom/pages/BomFieldMappingPage.tsx`](../src/bom/pages/BomFieldMappingPage.tsx)

---

## 3. Slabi matchovi — korisnik mora da obrati pažnju

**Gde u app-u:**
- [Guided match](http://localhost:5173/bom/projects/new/matching/review) — žuti alert na slabom matchu
- [Provera fajla](http://localhost:5173/bom/projects/new/parsing-review) — upozorenje na loše parsirane redove
- [Mapiranje](http://localhost:5173/bom/projects/new/mapping-summary) — ako fali obavezna kolona, **Continue** je blokiran

**Šta smo uradili:**
- Slab match → upozorenje „proveri pre potvrde“, ne tiho prihvatanje
- Match samo na nivo porodice (figure) → moraš izabrati tačan SKU pre **Confirm**
- Loše mapirane kolone → ne može dalje dok se ne popravi

**Kod:**
- [`src/bom/bomMatchingReviewAlert.ts`](../src/bom/bomMatchingReviewAlert.ts)
- [`src/bom/components/BomMatchingReviewQualityAlert.tsx`](../src/bom/components/BomMatchingReviewQualityAlert.tsx)
- [`src/bom/bomMatchSkuUtils.ts`](../src/bom/bomMatchSkuUtils.ts)
- [`src/bom/bomFieldMappingUtils.ts`](../src/bom/bomFieldMappingUtils.ts)

---

## 4. Na kraju nema ponovnog potvrđivanja red po red

**Gde u app-u:**
1. [Guided review — ekran „gotovo“](http://localhost:5173/bom/projects/new/matching/review) (posle svih redova)
2. Zatim [tabela — import summary](http://localhost:5173/bom/projects/new/matching/table)

**Šta smo uradili:**
- Potvrda ide **jednom** u guided review-u
- Na završnom ekranu: brojevi + **Continue to import summary** (i **Review skipped lines** ako ima preskočenih)
- U tabeli već potvrđeni redovi **nemaju** ponovo dugme Confirm — samo meni `…`

**Kod:**
- [`src/bom/components/BomGuidedReviewCompletePanel.tsx`](../src/bom/components/BomGuidedReviewCompletePanel.tsx)
- [`src/bom/pages/BomProgressiveMatchingPage.tsx`](../src/bom/pages/BomProgressiveMatchingPage.tsx)
- [`src/bom/bomMatchingColumns.tsx`](../src/bom/bomMatchingColumns.tsx)
- [`src/bom/pages/BomMatchingPage.tsx`](../src/bom/pages/BomMatchingPage.tsx)

---

## 5. Imported part — običan tekst, akcije u meniju

**Gde u app-u:**
- [Matching tabela](http://localhost:5173/bom/projects/new/matching/table)
- [Workspace](http://localhost:5173/bom/projects/new/workspace)

**Šta smo uradili:**
- Kolona sa delom iz fajla = **samo tekst**, nije link
- Link ka ASC katalogu ostaje na **Figure** / našem delu
- View original, submittal, delete → u meniju `…` ili **Review**

**Kod:**
- [`src/bom/bomMatchingColumns.tsx`](../src/bom/bomMatchingColumns.tsx)
- [`src/bom/bomWorkspaceColumns.tsx`](../src/bom/bomWorkspaceColumns.tsx)

---

## 6. „Add item“ — dve opcije: ASC ili competitor

**Gde u app-u:** [Workspace → Add item](http://localhost:5173/bom/projects/new/workspace)

**Šta smo uradili:**
- **Find an ASC part** → brzi ASC picker
- **Add competitor / unknown part** → uneseš tekst → ide u **guided matching** za taj jedan red (ne direktno u tabelu)

**Kod:**
- [`src/bom/pages/BomWorkspacePage.tsx`](../src/bom/pages/BomWorkspacePage.tsx)
- [`src/bom/bomAdHocMatchSession.ts`](../src/bom/bomAdHocMatchSession.ts)

---

## 7. Competitor pretraga ostaje u BOM-u, ne u običnom catalog search-u

**Gde u app-u:**
- [BOM pretraga](http://localhost:5173/bom/search) — prekidač **Competitor / unknown** | **ASC catalog**
- Competitor rezultati: [http://localhost:5173/bom/search/results?q=coupling](http://localhost:5173/bom/search/results?q=coupling)
- ASC rezultati: [http://localhost:5173/catalog/results?q=FP7450](http://localhost:5173/catalog/results?q=FP7450)

**Šta smo uradili:**
- Competitor više ne ide automatski na `/catalog/results`
- Dva jasna moda — BOM competitor flow vs klasičan ASC katalog

**Kod:**
- [`src/bom/pages/BomSearchPage.tsx`](../src/bom/pages/BomSearchPage.tsx)
- [`src/bom/pages/BomCompetitorSearchResultsPage.tsx`](../src/bom/pages/BomCompetitorSearchResultsPage.tsx)
- [`src/bom/BomRoutes.tsx`](../src/bom/BomRoutes.tsx)

---

## Brzi prolaz kroz sve (5 min)

1. [http://localhost:5173/bom/site/3](http://localhost:5173/bom/site/3) — upload kartice  
2. Upload fajl → mapiranje → parsing  
3. [http://localhost:5173/bom/projects/new/matching/review](http://localhost:5173/bom/projects/new/matching/review) — redom 1, 2, 3…  
4. Završni ekran → **Continue to import summary**  
5. Workspace → **Add item** (obe opcije)  
6. [http://localhost:5173/bom/search](http://localhost:5173/bom/search) — oba moda pretrage  

---

*Poslednja provera: commit `cec21b9` na `bom-upload-match-review-plan`.*
