---
name: hydra-figma-flow-explainer
description: >-
  Writes "How this flow works" copy for a Hydra Figma user-flow section and
  applies every correction in Figma: renamed top-level screen frames plus
  updated card text. Use when the user attaches this skill plus a Figma URL.
  The required output is the corrected Figma section, not a chat draft. Say
  "copy only" to skip Figma writes.
---

# Hydra Figma Flow Explainer

## Purpose

Turn a Figma **flow section** into short explanation copy that a non-technical
reader can follow, **and apply that copy in Figma**. The card sits beside the
screens. Reuse this skill for any Hydra flow: keep the card structure and
voice, and change only the content to match the linked flow.

**The required output is Figma.** Chat is a report of what was already written
into the file. A markdown draft without a successful Figma write is not done.

Canonical voice and structure come from
[SPEC — Core user flows (Release 1)](https://www.figma.com/design/KmU1mTvL7D1fLZvJ8SIGTN/SPEC---ASC-Connected?node-id=8075-133874)
in **SPEC — ASC Connected**. Full examples live in
[references/voice-and-structure.md](./references/voice-and-structure.md).

## Default mode: fix it in Figma

The skill is not finished until the Figma section is corrected.

- **Do** read the linked Figma flow (Official Figma MCP).
- **Do** validate top-level screen frame names against the parent section
  and the visible screen; **rename them in Figma** if they are wrong.
- **Do** draft one explanation card per flow subsection in the SPEC voice.
- **Do** write that copy onto that subsection's **How this flow works** frame
  in Figma (eyebrow, title, purpose, steps, `Next:`).
- **Do not** restyle the card, move screens, or edit product UI chrome.
- **Do not** implement application code or tokens.
- **Do not** stop after printing copy in chat. Chat comes **after** the Figma
  write succeeds.
- **Do not** emit a copy-only draft, the report template, or a Console fallback
  when Official MCP can still retry (wrong page, one rate-limit hit).

**Write targets in Figma (all of these, in order):**

1. Top-level screen frame `.name` values that fail the section/screen check.
2. Text layers on the **How this flow works** card.

Canonical card:
[How this flow works](https://www.figma.com/design/KmU1mTvL7D1fLZvJ8SIGTN/SPEC---ASC-Connected?node-id=8156-110277)
(`8156:110277`) inside `04 — Download ASC Master SPEC`.

Opt out with **copy only** / **don't edit Figma** — then emit the template
and stop without `use_figma`. Without that opt-out, Figma must be updated.

## When to run

Trigger when the user:

- attaches `@hydra-figma-flow-explainer` and a Figma URL
- asks to explain / narrate / write **How this flow works** copy for a Figma
  section
- asks to rewrite flow cards to match the SPEC board language

**Required input:** a Figma design URL with `node-id` for the flow to explain
**or** for that section's **How this flow works** frame. If the URL is
missing or has no `node-id`, ask for it and stop.

Do **not** run this skill to implement screens, audit tokens, or recreate
UI in Figma. Those are other skills.

## Required Figma source

Use **Official Figma MCP** (`plugin-figma-figma`) only. Do not use Figma
Console unless the user explicitly opts in.

1. Parse `fileKey` and `nodeId` from the URL (`node-id=8075-133874` → `8075:133874`).
2. Call `GetDynamicTools` for `plugin-figma-figma` before the first call.
3. `get_metadata` on the target node to list subsections, **How this flow works**
   frames, and screen frames.
4. `get_screenshot` on each **How this flow works** card (if present) and on
   each distinct screen in the flow. Read what the user actually sees: headings,
   button labels, statuses, alerts, empty states.
5. Use `get_design_context` only when a screen's labels or states are still
   unclear after metadata + screenshot. Load `figma-design-to-code` first if
   you call it. Treat its code as reference, not something to implement.

`get_metadata` / `get_screenshot` can read a node on **any** page.
`use_figma` cannot — see **Official MCP writes: page context** below.

If a **read** rate-limits, retry Official MCP **once**. If it still fails, name
the failure and wait. Never invent a flow from memory. Do not switch to
copy-only. Do not offer Console if the user already required Official MCP.
If a **write** fails, the run is not done — retry per the failure table.

## What to explain

| Target node | Explain | Write into |
|-------------|---------|------------|
| Parent board (several `NN — Title` sections) | One card per subsection, in canvas order | Each subsection's **How this flow works** child |
| One numbered subsection | One card for that flow | That section's **How this flow works** child |
| The **How this flow works** frame itself | The parent subsection's flow | That linked frame |
| A single screen inside a subsection | The parent subsection's card; map the screen to the matching step | The sibling **How this flow works** frame in that section |

A subsection is a flow when it contains screens that a user walks through in
order. Ignore chrome-only duplicates. If a section name and an existing card
title disagree (stale copy), trust the **screens** and flag the mismatch.

Do not invent screens, steps, or outcomes that are not visible in the linked
Figma.

## Card structure (fixed)

Every card uses this five-part shape. Do not add a sixth part. Do not drop
a part. Do not rename the labels.

```text
FLOW XX OF YY          ← eyebrow, uppercase, space around OF
Title                  ← short noun phrase, no number, no "flow"
Purpose                ← 2–3 short sentences
1. / 2. / 3.           ← imperative steps (usually 3, never more than 4)
Next: …                ← one line, always starts with "Next:"
```

| Part | Role |
|------|------|
| Eyebrow | Position in the parent board (`FLOW 01 OF 06`). Count subsections on the parent, not screens inside one flow. |
| Title | Matches the subsection title without the `NN —` prefix. |
| Purpose | When to use this / what this place is / what the system does for you. |
| Steps | What the user does, in order, matching the screens from left to right. |
| Next | The immediate following action after this flow. Not a distant future. |

## Voice (non-negotiable)

Write for a non-technical human. Match the SPEC board, not a PRD or a
changelog.

- Second person, present tense: **you**.
- Short sentences. One idea per sentence when possible.
- Start steps with an imperative: Scan, Choose, Confirm, Check, Read, Filter,
  Start, Accept, Wait, Use, Continue.
- Use the **on-screen** names of actions (`Upload SPEC`, `Download ASC Master SPEC`).
- Product nouns the user already meets are allowed: SPEC, Master SPEC, division,
  analysis, review, export, version.
- Explain side effects that would otherwise surprise: progress is saved, the
  current file is not overwritten, you can leave and come back, older versions
  stay in history, export is blocked until analysis is current.
- Purpose openers that already exist — reuse the closest one:
  - `This is the starting point.`
  - `Use this flow to…`
  - `Use this when…`
  - `After [event], this page shows…`
  - `Here you…`
  - `If you…, [consequence].`

Forbidden in this copy:

- Designer/dev jargon: token, component, drawer as a system name, modal as a
  system name, MCP, prototype, Figma, Ant Design, state machine
- Implementation detail: APIs, files, routes, flags, data models
- Marketing, filler, or hype
- Hedging: "might", "could possibly", "in some cases you may want to consider"
- Numbered titles (`01 — …`) inside the card title field

Read [references/voice-and-structure.md](./references/voice-and-structure.md)
before writing. Prefer echoing those sentence shapes over inventing a new
register.

## Workflow

```text
Hydra Figma Flow Explainer:
- [ ] 1. Require a Figma URL with node-id; stop if missing
- [ ] 2. Official MCP: metadata of the target node
- [ ] 3. Resolve the How this flow works write-target frame(s)
- [ ] 4. Screenshot the card (if present) and each distinct screen
- [ ] 5. Validate screen frame names vs the parent section and the visible UI
- [ ] 6. Switch `use_figma` to the owning page, then rename mismatched
        top-level screen frames (required unless copy-only)
- [ ] 7. Map screens left-to-right into 2–4 user steps
- [ ] 8. Draft one card per subsection in the SPEC voice
- [ ] 9. Self-check against the voice rules and canonical examples
- [ ] 10. On the same owning page, write text into the How this flow works
         frame (required unless copy-only)
- [ ] 11. Screenshot the updated card to verify the Figma write
- [ ] 12. Emit the chat report of what Figma now contains
```

## Output format

Always respond with this structure. Repeat the `###` card block once per
subsection.

```markdown
# How this flow works — [parent board or section name]

Source: [Figma URL]

## Cards

### FLOW XX OF YY — [Title]

[Purpose paragraph]

1. [Step]
2. [Step]
3. [Step]

Next: [immediate next action]

## Screen map

| Step | Screen frame name | What the user does here |
|------|-------------------|-------------------------|
| 1 | … | … |

## Screen names

| Frame | Before | After | Why |
|-------|--------|-------|-----|
| [id] | [old name] | [new name, or "unchanged"] | [section prefix / visible step] |

## Notes

- [Stale existing copy, missing screen, or open question — omit this section if none]

Applied to: [Figma URL of the How this flow works frame]
```

The **Screen map** must use the **corrected** frame names.

The chat template is a **report after Figma is fixed**. Do not emit it as a
substitute for writing into Figma. `Applied to:` must be the live card URL
only after `use_figma` succeeded and a screenshot confirmed the new text.

If copy-only, fill **Screen names** with proposed After values, set
`Applied to: copy only — not written`, and do not call `use_figma`.

## Validate and rename screen frames

Do this **before** drafting or writing the explanation. Wrong names (cloned
from another flow, wrong number, suffix that does not match the screenshot)
must not appear in the card or the screen map.

Naming rules live in
[references/voice-and-structure.md](./references/voice-and-structure.md#screen-frame-names).

1. Collect **top-level screen frames** only: direct children of the numbered
   subsection that are not named **How this flow works**. Do not rename nested
   layers (`Body`, `Sidebar`, `Table`, instances, overlays).
2. Read the parent section name as `NN — Title` (for example
   `04 — Download ASC Master SPEC`).
3. For each screen, compare:
   - **Section:** the `NN —` prefix and title must belong to this section, not
     a leftover from a cloned flow.
   - **Screen itself:** the part after ` · ` must match what the screenshot
     actually shows (heading, dialog title, primary action, distinct state).
4. If either check fails, set `.name` on that top-level frame to
   `NN — Title` or `NN — Title · Step`. Load `@figma-use` first. Switch to
   the owning page (`SPEC` in this file) before `getNodeByIdAsync`. Return
   mutated node IDs. Do not move, restyle, or edit children.
5. If the suffix is ambiguous from the screenshot, stop and ask — do not
   guess a step name.
6. copy-only: report Before/After, do not rename.

Do not rename the section, the **How this flow works** frame, or product UI.

## Official MCP writes: page context (required)

`use_figma` starts on the **first page** of the file every call. In
**SPEC — ASC Connected** that first page is `🖼️`. The core user-flow board
lives on the page named **`SPEC`**. Until that page is loaded,
`getNodeById` / `getNodeByIdAsync` returns null even when `get_metadata`
just listed the same id.

**`Node not found` is a page miss, not a blocked write.** Do not emit
copy-only. Do not ask for Figma Console. Do not tell the user Figma cannot
be updated.

Before every rename or text write:

1. Load `@figma-use`. Include `figma-use` in `skillNames`.
2. Discovery call (no page switch): return `figma.root.children` as
   `{ id, name }` plus `figma.currentPage.name`.
3. Write call: `await figma.setCurrentPageAsync` **once** onto the page that
   owns the node. For this file that is **`SPEC`** unless metadata showed
   otherwise. Then `getNodeByIdAsync` and mutate. Return every mutated id.
4. If the node is still missing, the next `use_figma` call switches to a
   different page (still one switch per call). Retry until the node is found
   or every page was tried.
5. Never loop `setCurrentPageAsync` inside one script.

## Write the How this flow works frame

This is required on the default run. The card in Figma must match the drafted
copy before the chat report is printed.

1. Load `@figma-use` before any `use_figma` call. Include `figma-use` in
   `skillNames`. Switch to the owning page first (page-context section
   above). Do not call `getNodeByIdAsync` on the default first page.
2. Resolve the write target from the linked node (table above). The frame
   name is **How this flow works**.
3. Update **text only** on these existing layers — do not restyle, do not
   move the card, do not edit product screens:

   | Card layer | Write |
   |------------|-------|
   | First text (eyebrow) | `FLOW XX OF YY` |
   | Second text (title) | Short title, no number |
   | Third text (purpose) | 2–3 short sentences |
   | `Steps` → `Step N` → the sentence next to `1.` / `2.` / `3.` | Imperative step. Leave the number labels. |
   | Last text | `Next: …` |

4. Load each text node's current fonts via `getStyledTextSegments(['fontName'])`,
   `await` `loadFontAsync`, then set `characters`. Return every mutated node ID.
5. If a subsection has no **How this flow works** frame, ask before creating
   one. Do not invent a new card layout.
6. If the card has fewer step slots than the draft, ask before adding a
   `Step` row. If it has extra slots, do not leave stale sentences — stop and
   ask, or hide the unused row only if the user confirmed that.
7. Screenshot the updated card. If text clips, let the existing auto-layout
   hug — still no new colors, type styles, or components.

Do not implement application code as part of this skill.

## Failure / sparse-data behavior

| Situation | Behavior |
|-----------|----------|
| No Figma URL / no `node-id` | Ask for a node-specific link; stop |
| MCP auth, timeout, or rate limit on **read** | Retry Official MCP once. If still blocked, name the failure and wait. Do not invent the flow. Do not emit copy-only. Do not offer Console if the user already required Official MCP |
| `use_figma` returns **Node not found** | Wrong page. Switch to `SPEC` (or the next page) and retry Official. Not copy-only. Not Console |
| MCP rate limit or other `use_figma` failure on **write** | The run is **not done**. Keep the drafted copy internally. Do not print the report template. Do not claim Figma was updated. Retry Official, including a page switch. Ask Console only if Official stays blocked after that retry **and** the user has not already required Official MCP |
| User says copy only / don't edit Figma | Emit the template including proposed Screen names; do not call `use_figma` |
| Node is a single UI screen with no flow siblings | Write one card for that screen's job; say that parent flow count is unknown |
| Existing card copy is stale vs screens | Trust screens; flag the mismatch in Notes |
| More than 4 meaningful screens | Group into at most 4 user steps; do not write one step per screenshot |
| User asks to explain a repo route instead of Figma | Ask for the Figma section link; this skill does not narrate code |
| Screen frame name is from another flow (wrong `NN` or title) | Rename the top-level screen frame first, then write the card |
| Suffix does not match the visible screen | Rename the ` · Step` part to the on-screen state; then write the card |
| Suffix is ambiguous | Ask; do not write the card yet |

## Explicit non-goals

- Do not implement or restyle product screens.
- Do not edit Figma nodes except: (1) `.name` on top-level screen frames in
  the linked section, and (2) text layers inside that section's **How this
  flow works** card.
- Do not rename nested UI layers, the section itself, or the card frame.
- Do not invent tokens, components, or a new card layout.
- Do not write PRDs, Jira tickets, or implementation plans.
- Do not switch to Figma Console MCP unless the user opts in, and never
  when they already required Official MCP.
- Do not treat `Node not found` as a reason to skip the Figma write.
- Do not broaden into a different flow than the linked node.
