# CON-296 — Content download history, objašnjeno jednostavno

Jira: [CON-296](https://ooden.atlassian.net/browse/CON-296)
Gde u prototipu: projekat → **Content** (`/projects/:id/content`)
Ovo je **dizajn / prototip**, ne production app.

---

## 1. Problem iz ugla korisnika

Zamisli da ti i tim skidate fajlove delova sa projekta — kao da skupljate sličice, crteže i 3D modele ventila, cevi, sprinklera.

**Stara strana je bila korpa.**

Ti dodaš deo u korpu. Drugi čovek doda svoj deo u svoju korpu. Korpa je “šta hoću da skinem sad”. Nije “šta smo već skinuli”.

Zato su se dešavale četiri dosadne stvari:

1. **Ne vidiš istoriju.** Ako Sarah juče skinula isti ventil, ti to ne vidiš. Možeš da ga skineš opet, ili da misliš da ga niko nema.
2. **Delovi i varijante su se mešali.** Jedan proizvod (npr. igličasti ventil S7166) može imati više varijanti (Config A, Config B). Stara lista je ponekad stavljala varijantu kao da je to glavni proizvod. Kao da u fioci stoje “cipele” i “leva cipela, veličina 42” na istom nivou. Teško je skenirati.
3. **Korpa je prepreka, ne pomoć.** Ako hoćeš Submittal paket (dokumenta za klijenta) ili BOM (listu materijala za naručivanje), moraš prvo da gurraš stvari kroz korpu. To je dodatni korak koji niko ne traži.
4. **Prazna strana laže.** Ako nema ničega, piše “nema downloadova”. Korisnik ne zna da istorija **počinje od dana izlaska** — stari downloadovi pre tog datuma se namerno ne prikazuju.

Jednom rečenicom: **inženjer ne pita “šta je u korpi?”, pita “šta smo već skinuli na ovom projektu, i mogu li od toga da napravim paket ili BOM?”**

---

## 2. Šta je traženo

Napravi **novu stranu umesto korpe**. Korpa nije glavna stvar. Glavna stvar je **istorija downloada**.

Strana mora da radi ovo:

### Vidi šta je skinuto

- Lista je kao porodično stablo.
- **Roditelj** = figure / deo (npr. “Needle Valve S7166”).
- **Deca** = varijante tog dela (Config A, Config B).
- Varijanta **nikad** ne stoji sama na vrhu. Uvek pripada svom delu.

Za svaki red vidiš:

- **šta je** (ime, slika, figure number)
- **koji formati** su skinuti (RFA, PDF, DWG…)
- **kad** je poslednji put skinuto
- **ko** je skinuo

### Izaberi redove i napravi nešto novo

Možeš da čekiraš:

- ceo deo (roditelja),
- jednu varijantu,
- ili mešavinu.

Od izbora možeš:

- **Create Submittal Package** — spakuj delove u paket za predaju
- **Create BOM** — dodaj konkretne stavke na listu materijala

Ako nemaš dozvolu za to, dugmad **ostaju vidljiva**, ali su ugašena, i tooltip kaže zašto. Ne nestaju. Nestanak bi izgledao kao da funkcija ne postoji.

### Ako je lista prazna

Ne piše samo “nema ničega”. Mora da kaže: **istorija počinje od dana izlaska proizvoda**. Šta je skinuto pre toga, ovde se ne vidi.

### Šta ostaje isto

Ime modula je i dalje **Content**. URL se ne menja. Samo se menja šta vidiš na toj strani.

Ticket **nije** tražio da se uradi pravi backend. Tražio je dizajn (Figma ili ekvivalent). Ovaj prototip je taj ekvivalent: klikabilan primer umesto statične slike.

---

## 3. Kako je rešeno — flow korak po korak

### Korak 0. Otvori projekat

U prototipu uđeš u projekat, pa u **Content**.

Dva korisna primera:

| Projekat | Šta vidiš |
|---|---|
| Downtown Convention Center | Puna istorija — mešavina delova, varijanti, ljudi, ponovljenih downloada |
| Riverside | Prazna istorija — empty state |

Naslov strane: **Content Downloads**.
Ispod: koliko figura i koliko varijanti je skinuto na tom projektu.

Korpa, “Download All Files”, “Clear all Items” — **nema više**. Ovo više nije shopping cart.

---

### Korak 1. Čitaš istoriju

Tabela ima dve vrste redova.

**Roditeljski red (Figure)**

```
[slika] Needle Valve S7166          Figure Number    Formati     Datum      Ko
        316 SS Needle Valve         S7166NV          RFA, TXT   Sep 14     Sarah +2
```

Ovo je “kutija”. Znači: ovaj proizvod je negde u istoriji. Možeš da ga otvoriš i vidiš varijante unutra.

**Dečiji red (Variation)**

Ispod, uvučeno, malo drugačija pozadina:

```
        Config A                    S7166NV-A        DWG, PDF   Sep 13     Sarah
        Config B                    S7166NV-B        DWG        Sep 12     James
```

Ovo je konkretna verzija tog proizvoda.

Zašto je ovo važno: skeniraš listu kao katalog. Prvo vidiš proizvod. Pa, ako treba, vidiš tačne varijante. Nikad ti varijanta ne iskoči kao da je poseban proizvod.

---

### Korak 2. Biraš šta ti treba

Gore iznad tabele piše: *Select figures or variations to create a submittal package or a BOM.*

Čekiraš redove.

- Čekiraš roditelja → čekiraju se i njegova deca (cascade).
- Možeš da čekiraš samo jednu varijantu.
- Možeš da mešaš: jedan ceo deo + tuđu varijantu sa drugog dela.

Kad imaš izbor, traka kaže npr. **“2 figures, 3 variations selected”**.
Tu stoje dva dugmeta:

1. **Create Submittal Package** (glavno, narandžasto)
2. **Create BOM** (sporedno)

Plus **Clear Selection** da skineš kvačice.

Aplikacija pamti *šta si čekirao*, ali kad kreneš da praviš paket ili BOM, pretvara to u smisao:

| Šta si čekirao | Šta to znači |
|---|---|
| Samo varijantu | “Hoću baš tu verziju.” |
| Roditelja i njegovu varijantu | Varijanta pobeđuje. Ne dupliramo isti deo. |
| Samo roditelja, nijednu njegovu varijantu | “Hoću ovaj proizvod, ali još nisam rekao koju verziju.” |

Zato Submittal i BOM ne rade identično. Objašnjeno ispod.

---

### Korak 3. Praviš Submittal paket

Submittal = fascikla dokumenata za klijenta. Klijentu treba **deo**, ne nužno tačna SKU varijanta.

Zato:

- Config A i Config B istog ventila = **jedan** unos u paket.
- Čekiran roditelj = isti taj deo.
- Čekiran roditelj + dete = i dalje **jedan** deo.

Otvori se modal:

1. Vidiš koje delove dodaješ.
2. Biras: **novi paket** ili **postojeći**.
3. Potvrdiš.

Gotovo. Možeš odmah da odeš na listu paketa.

Nema “prvo stavi u korpu, pa iz korpe u paket”. Istorija *je* izvor.

---

### Korak 4. Praviš BOM

BOM = shopping lista za naručivanje. Tu **mora tačna varijanta** (SKU). Ne možeš naručiti “neki igličasti ventil”. Moraš naručiti Config A ili Config B.

Zato flow ima dve grane.

**Grana A — sve što si čekirao već ima varijantu**

Modal:

1. Vidiš koje SKU stavke idu unutra.
2. Biras: **novi BOM** ili **postojeći**.
3. Potvrdiš.
4. Ako je neka stavka već u tom BOM-u, preskače se i kaže ti.

**Grana B — čekirao si roditelja bez varijante**

Aplikacija **ne piše ništa** dok ne rešiš svaki takav deo.

Otvori se drawer, kao vođeni kviz, jedan deo po jedan:

```
Figure 2 of 5
Ovaj deo je skinut, ali bez konkretne varijante.
Izaberi varijantu za BOM, ili preskoči ovaj deo.
```

Varijante koje su već downloadovane stoje gore i označene su (“Downloaded before”), da brže pogodiš šta tim već koristi.

Na svakom koraku:

- **Use this variation** — biraš tu SKU
- **Skip this figure** — ovaj deo ne ide u BOM
- **Cancel** — odustaješ, **ništa se ne upisuje**

Na kraju review:

- šta će se dodati
- šta je preskočeno

Tek tad, posle potvrde, stvari uđu u BOM.

Ako skipuješ sve, nema šta da se doda. Aplikacija to kaže i ne pravi prazan nered.

---

### Korak 5. Prazan projekat

Otvoriš Riverside (ili bilo koji projekat bez istorije).

Vidiš:

**No downloads yet**

**Download history starts from the release date — anything downloaded before then is not shown.**

Dugme: **Browse Part Search** — idi skini prvi deo.

Zašto je ova rečenica važna: prazno ne znači “nikad niste ništa skinuli u životu”. Znači “od ovog datuma nemamo zapis”. Stari svet pre lansiranja nije ovde.

---

### Korak 6. Nemaš dozvolu

Neki ljudi smeju da gledaju istoriju, ali ne smeju da prave BOM ili Submittal.

Dugmad i dalje stoje. Siva su. Hover kaže npr.:

- *You need BOM create access to do this.*
- *You need Submittal create access to do this.*

Ako smeš, ali nisi ništa čekirao:

- *Select at least one figure or variation.*

U prototipu, dole desno (samo u DEV) ima zupčanik. Time gasiš dozvole da vidiš baš to stanje. To nije pravi permission sistem — samo demo prekidač.

---

## 4. Četiri situacije koje su izgledale “čudno”, pa su rešene namerno

Ovo su dizajn pitanja iz ticketa. Odgovorena su u prototipu ovako.

### Samo su varijante skinute, deo kao ceo fajl nije

Neko je skinuo Config A i Config B, ali nikad “ceo figure” fajl.

**Šta vidiš:** roditeljski red i dalje postoji (kutija mora da postoji), a u kolonama formata piše **Variants only**. Ne glumi da je figure downloadovan, ako nije.

### Isti deo su skidali više ljudi

Sarah, James i Michael su svi skidali isti ventil.

**Šta vidiš:** poslednji ko je skinuo + broj ostalih, npr. `Sarah Mitchell +2`. Tooltip navede sve, sa datumima. Kolona ostaje uska, lista ostaje čitljiva.

### Isti deo je skinut više puta

Tim stalno vuče isti fajl.

**Šta vidiš:** datum poslednjeg downloada, i tihi badge `×3`. Tooltip kaže prvi i poslednji datum. Ako je skinuto samo jednom, badge nema — strana ostaje mirna.

### Čekirao si roditelja za BOM

To ne znači “ubaci bilo koju varijantu”. Znači “ovaj proizvod, varijantu biram sad”. Zato BOM otvara vođeni izbor, a Submittal ne mora — njemu je dovoljan deo.

---

## 5. Cela priča u jednom prolazu

```
Otvoriš projekat
        │
        ▼
Vidiš istoriju downloada
  (deo = roditelj, varijanta = dete)
        │
        ├── ništa u istoriji ──► empty state + idi na Part Search
        │
        ▼
Čekiraš delove i/ili varijante
        │
        ├── Create Submittal ──► izaberi novi ili postojeći paket
        │                         (varijante se spajaju u jedan deo)
        │
        └── Create BOM ────────► ima li neraščišćenih roditelja?
                                   da ──► izaberi varijantu, jedan po jedan
                                   ne ──► dodaj SKU u novi ili postojeći BOM
```

Korisnik više ne skuplja stvari u korpu da bi kasnije radio pravi posao.
Gleda **šta je tim već skinuo**, bira to, i odmah pravi paket ili listu za naručivanje.

---

## 6. Šta ovo nije

- Nije production kod. Pravi app (`on-hydra-app`) se ovim ticketom ne dira.
- Nije pravi permission sistem. Dozvole su demo prekidač.
- Nije gašenje korpe u Part Search. To je namerno ostavljeno za kasnije (druga priča).
- Nije backend. Nema pravog servera koji pamti istoriju. Ovde je seed + lokalna istorija, da se flow može kliknuti.

Ticket i dalje traži da se Q-1 do Q-4 (ona četiri pitanja gore) prepišu na Confluence story page posle PO pregleda. U kodu su već ugrađena. Na Confluence još nisu zakačena.
