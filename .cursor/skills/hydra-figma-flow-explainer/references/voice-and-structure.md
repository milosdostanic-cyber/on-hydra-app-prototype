# How this flow works — voice and structure

Canonical source: [SPEC — Core user flows (Release 1)](https://www.figma.com/design/KmU1mTvL7D1fLZvJ8SIGTN/SPEC---ASC-Connected?node-id=8075-133874)
in **SPEC — ASC Connected** (`fileKey` `KmU1mTvL7D1fLZvJ8SIGTN`, node `8075:133874`).

Use these cards as the register to copy. When explaining a **different** flow,
keep this shape and sentence length. Replace only the nouns, actions, and
outcomes so they match the linked screens.

## Board layout

Each numbered subsection is a horizontal strip:

1. Left: a **How this flow works** card (~520px).
2. Right: 1–3 product screens in left-to-right order.

Section names on the canvas use `NN — Title` (for example `01 — Project SPEC list`).
The card title drops the number: `Project SPEC list`.

The write target for this skill is that left-hand **How this flow works** frame — not the product screens. Example card: [8156:110277](https://www.figma.com/design/KmU1mTvL7D1fLZvJ8SIGTN/SPEC---ASC-Connected?node-id=8156-110277).

Parent board name: `SPEC — Core user flows (Release 1)`.
The board lives on the Figma page named **`SPEC`**, not on the file's first page (`🖼️`). `use_figma` must switch to `SPEC` before renaming screens or writing card text.

## Screen frame names

Top-level product screens (not the **How this flow works** card) use:

```text
NN — Title
NN — Title · Step
```

- `NN —` is the **parent section** number and em dash. Never a leftover from a cloned flow.
- `Title` is the section title (a short form is allowed: `Upload a new SPEC` → `Upload SPEC`).
- ` · Step` is required when the section has more than one screen, or when one screen shows a distinct state (dialog, empty, locked, processing). Name the state from what is **on the screen**: heading, dialog title, or primary action.

Canonical examples:

| Section | Screen frame |
|---------|----------------|
| `01 — Project SPEC list` | `01 — Project SPEC list` |
| `02 — Upload a new SPEC` | `02 — Upload SPEC · Choose file` |
| `02 — Upload a new SPEC` | `02 — Upload SPEC · Confirm Master SPEC` |
| `03 — Upload a new version` | `03 — Upload new version · Choose file` |
| `04 — Download ASC Master SPEC` | `04 — Download ASC Master SPEC · Choose Master SPECs` |
| `05 — Review and edit` | `05 — Review and edit · Recommendation list` |

Wrong (cloned leftover — must rename before writing the card):

| Section | Wrong screen name |
|---------|-------------------|
| `04 — Download ASC Master SPEC` | `03 — Upload new version · Choose file` |

Do not rename nested layers. Only the top-level screen frame `.name`.

## Card anatomy

Layer names in Figma:

| Layer | Content |
|-------|---------|
| (text) | `FLOW 01 OF 06` |
| (text) | Title |
| (text) | Purpose paragraph |
| `Steps` → `Step 1` / `Step 2` / `Step 3` | `1.` + imperative line |
| (text) | `Next: …` |

Typical card height is 302–368px. Purpose is 2–3 sentences. Steps are usually
three. The `Next:` line is a single sentence.

## Voice patterns

**Purpose**

- Start with situation, not UI chrome.
- Tell the user what this place is for, then what the system already did for them.
- Second sentence often names the visible result (status, next action, count).

**Steps**

- One action per step. Match the screens from left to right.
- Name the control the user will click, using the label on the screen.
- Put the reassurance on the same step as the risky action (`You can leave the page. Progress is saved.`).

**Next**

- Always begins with `Next:`.
- Names the following flow, not a summary of this one.
- May include a condition (`If you edited the text, run analysis again first.`).

## Canonical cards

Copy these verbatim as style references. Do not paste them onto a different
flow.

### FLOW 01 OF 06 — Project SPEC list

This is the starting point. Open a project and see every specification in it. Each row shows the current status and the next action.

1. Scan the list and pick the SPEC you need.
2. Use Upload SPEC to add a new file, or Download ASC Master SPEC to get a blank master.
3. Continue from the row action: review, retry, export, or view progress.

Next: upload a new SPEC, or open a SPEC that is ready to review.

### FLOW 02 OF 06 — Upload a new SPEC

Use this flow to add a customer PDF or Word file to the project. The system checks that the file can be read, then suggests a division and an ASC Master SPEC.

1. Choose the file, or replace it if the file cannot be processed.
2. Confirm the division and the Master SPEC. Change them only if they are wrong.
3. Check the setup and start analysis. You can leave the page. Progress is saved.

Next: wait for analysis, then open the dashboard.

### FLOW 03 OF 06 — Upload a new version

Use this when a SPEC already exists and the customer sends a new file. The new file becomes the next version. The current file is not overwritten.

1. Choose the replacement PDF or Word file.
2. Check the version change, division, and Master SPEC.
3. Start analysis. Older versions, decisions, and exports stay in history.

Next: analysis runs on the new version. You review it like a new SPEC.

### FLOW 04 OF 06 — Analysis dashboard

After analysis finishes, this page shows the result. You see how many recommendations there are, which ones are high priority, and how many you have already reviewed.

1. Read the summary so you know what needs attention.
2. Filter by priority, type, or status if the list is long.
3. Start review, or export if there is nothing left to review.

Next: open review and work through recommendations one by one.

### FLOW 05 OF 06 — Review and edit

Here you work inside the document. Each recommendation sits next to the original text, so you can see the change in context.

1. Accept a change, deny it, leave it for later, or edit the text yourself.
2. If you edit the document by hand, analysis becomes out of date.
3. Only one person can edit at a time. If someone else is editing, the document is read-only until it is free.

Next: finish review, then export. If you edited the text, run analysis again first.

### FLOW 06 OF 06 — Re-analysis

If you change the document by hand, the old analysis is out of date. You cannot export until analysis runs again.

1. Confirm that you want to run analysis again.
2. Wait while findings refresh. You can leave and come back.
3. Previous decisions stay when the related text did not change.

Next: return to review, then export when analysis is current.

## Rewrite checklist

Before emitting a new card:

- [ ] Eyebrow uses `FLOW XX OF YY` with the parent subsection count
- [ ] Title has no number and no word "flow"
- [ ] Purpose is 2–3 short sentences, second person
- [ ] Exactly 2–4 steps; 3 is the default
- [ ] Each step starts with an imperative and maps to a visible screen
- [ ] `Next:` is one line and names the following action
- [ ] No designer/dev jargon
- [ ] Surprising side effects are stated (saved progress, not overwritten, blocked export)
- [ ] On-screen button labels are used as the user sees them
