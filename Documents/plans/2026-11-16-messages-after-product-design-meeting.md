# Messages after the Product/Design meeting (13 Nov 2026)

Prepared on 16 Nov 2026. Each message lists its source. Messages marked **my suggestion** were not asked for in the meeting or in Jira; send them only if you want to.

FigJam board (without these messages): https://www.figma.com/board/W0T3Wr7stZaOVarRnxrgci
Zone 7 on the board lists what information we need and from whom; this file holds the message text for each ask.

---

## 1. Loza: attribute list (send today)

**Source:** your BOM-431 comment from 13 Nov ("Get the attribute list from engineering so the filters are designed against real data") and the priorities sheet ("Waiting on: attribute list from Engineering for filters").
**Note:** the iframe question is my suggestion. You only need it later for the CRM version. Delete that line if you want to ask only what was requested.

> Cao Loza,
>
> Radim redizajn Part Cross-Reference stranice ([BOM-431](https://ooden.atlassian.net/browse/BOM-431)). Matt je trazio filtere po atributima, pa mi treba lista atributa da dizajn bude na pravim podacima. Koji atributi postoje u PIM-u po kategoriji i koliko su popunjeni? Ako je to Sofijin deo ([CON-347](https://ooden.atlassian.net/browse/CON-347)), samo mi reci pa cu nju da pitam.
>
> Usput, kolika je sirina Static matches iframe-a u Dynamics 365?
>
> Hvala!

---

## 2. Matt: OK to show all parts?

**Source:** the priorities sheet lists "Matt / James OK on showing all matches (changes BOM-360)" as open.
**Fact check:** 4,853 is the result of searching "a" on dev (16 Nov). Not measured on production; your account has no access to the page there.

> Hi Matt, showing all parts without a search changes [BOM-360](https://ooden.atlassian.net/browse/BOM-360) (search only, no list-all, no export). In practice one letter already returns almost everything (4,853 parts on dev). Are you and James OK to show the full list?

---

## 3. Lucas: priorities for the next 1 to 2 weeks

**Source:** meeting next steps (Milos + Lucas define priorities; Milos creates Jira tickets). Matt asked for the new workstream and for Sidebar to be low priority (Gemini notes, "Decisions").

> Hi Lucas, let's lock the top priorities for the next 1 to 2 weeks in the [priorities sheet](https://docs.google.com/spreadsheets/d/1RfdKSuG78b8a_uNrHy9Qc9j9cZ6DiIvxm7R5eeMtHSI/edit). Matt asked to add an E-commerce discovery / UI refresh workstream and to set Sidebar to low. After that I'll create the Jira tickets.

---

## 4. Lucas: share the FigJam board

**Source:** none, this is optional. Before sending, check the board's Share settings (it opened without sign-in earlier).

> Hi Lucas, I put everything from Friday's Product/Design meeting into one FigJam board: what we decided, the order of work, the deliverables, the open questions, and a starting point for the service blueprint. Could you take a look before we lock the priorities? Items marked "my suggestion" are not from the meeting, so feel free to challenge them.
> https://www.figma.com/board/W0T3Wr7stZaOVarRnxrgci

---

## 5. Matt: input for e-commerce discovery (my suggestion)

**Source:** not from the meeting. The meeting said: build the service blueprint from what we know today, then review it with James in a working session. Send this only if you feel the team knows too little to start.

> Hi Matt, for the e-commerce discovery:
> 1) Can we get access to Connect Portal, or a short demo, so we can map what it does today?
> 2) Can we book 1 hour with you, Lucas and me to walk through today's flow from part search to quote (who does what, and in which tools: CRM, CPQ, BigCommerce)?
> We'll turn it into the first service blueprint before the session with James.

---

## 6. For yourself: Matt's Discord notes (my suggestion)

**Source:** in the meeting Matt said his most detailed feedback is in the Discord #-bom channel. Copying it to Jira is my suggestion.

- Copy Matt's feedback from the Discord #-bom channel (12 Nov) into a comment on [BOM-431](https://ooden.atlassian.net/browse/BOM-431), so every requirement lives in Jira.
- Then check it against zone 6 on the board and add anything that is missing.
