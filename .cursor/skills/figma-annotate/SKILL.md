---
name: figma-annotate
description: >-
  Adds native Figma annotations, each with the right annotation category, to the frame or
  screen behind a Figma link. Writes short, human notes that explain only what is not clear
  from the design (hidden behaviour, conditions, data rules, edge cases, accessibility) and
  skips everything obvious. Shows a draft first and writes to Figma only after approval.
  Use when the user asks to annotate a Figma screen, add annotations or dev notes, explain a
  flow in Figma, or document behaviour for handoff on a figma.com link.
---

# Figma Annotate

Turns a Figma frame into a handoff-ready screen by adding a few clear, categorised notes.
The design itself is never changed; only annotations are added.

## Default mode: draft first

- Reading the file and drafting notes is safe and happens without asking.
- **Writing annotations to Figma happens only after the user says "go", "approved" or
  similar** to the draft in the same conversation.
- Never delete, rewrite or move existing annotations.

## Input

- One Figma URL with `node-id`. Parse `fileKey` and `nodeId` (`node-id=123-456` → `123:456`;
  for `/design/<key>/branch/<branchKey>/...` use `branchKey`).
- No `node-id` → ask for a link to the specific frame.
- Optional: focus ("interactions only", "for developers", "for PM"), language (default English).

## Workflow

```text
Figma Annotate:
- [ ] 1. Read the node (screenshot first, then structure)
- [ ] 2. Load the file's annotation categories
- [ ] 3. Pick what deserves a note (only non-obvious + important)
- [ ] 4. Attach each note to the most specific layer
- [ ] 5. Show the draft table and STOP for approval
- [ ] 6. On approval: write, re-read, screenshot, report
```

### 1. Read

Screenshot the node first to understand its purpose. Then read the structure: layers, component
instances and their variants/properties, visible text, prototype reactions (where things navigate
or what opens), hidden layers and nearby state frames (empty, error, loading) in the same section.
Understand the screen before writing anything.

### 2. Categories

Load the file's existing annotation categories (labels and colours). Reuse them. Map each note to
the closest existing category, e.g.:

| Note is about | Typical category |
|---|---|
| What happens on click, hover, submit; where it goes; what opens | Interaction |
| When something shows, hides, disables; state rules | Behavior |
| Where data comes from, sorting, limits, formats, truncation | Content / Data |
| Validation, edge cases, errors | Behavior (or Edge case, if the file has it) |
| Focus order, labels, keyboard, screen reader | Accessibility |
| Implementation detail only a developer needs | Development |

Use the file's own names. If no category fits, **propose** a new one in the draft and create it
only when the user approves.

### 3. What deserves a note

Annotate **only** what a designer, developer or PM could not understand from the visual:

- behaviour you can't see: click/hover/submit result, navigation target, what opens (modal,
  drawer, menu), what is copied or downloaded
- conditional logic: when something appears, hides or is disabled; empty / loading / error rules
- data rules: source of a value, default sort, limits, number/date formats, truncation
- edge cases and validation the frame doesn't show
- non-obvious content rules (e.g. "Count is plain text, not a tag")
- accessibility needs that aren't visible

**Do not annotate:** anything obvious from the visual (a "Save" button saves), standard
design-system behaviour (a Select opens a list), styling, spacing or tokens, or anything already
written on the screen. **When unsure whether it's obvious, leave it out.** Fewer, better notes
beat many small ones; a typical screen needs 3 to 8.

### 4. Placement

- Attach each note to the most specific layer it explains (the button, the column header, the
  field, the toggle), never to the whole screen unless the note is truly screen-wide.
- One idea per annotation.
- Repeated rows or instances: annotate the first one only.
- Skip hidden layers and Archive / Old / WIP pages.
- If a layer already has an annotation that says the same thing, skip it and list it in the report.

### 5. Draft (then stop)

Show a short table and stop:

| # | Layer (name · node ID) | Category | Annotation |
|---|---|---|---|

Below it: any proposed new category, and open questions (important things the design can't
confirm, e.g. "Does Clear search also reset the category?"). End with:
"Reply **go** to add these annotations, or tell me what to change."

### 6. Write and verify (only after approval)

- Write each annotation with its category on its layer (`label` text + `categoryId`).
  Keep existing annotations on the node: append, never replace.
- Re-read the annotations from the file, take one screenshot of the frame.
- Report: "Added N annotations (Interaction X, Behavior Y, ...)", the node IDs, the screenshot,
  skipped layers, and remaining open questions.

## Writing style (all output)

Applies to every annotation, the draft table and the final report.

- Write like a person explaining to a teammate. Plain words, short sentences, one idea per sentence.
- No long or short dashes (— –) in sentences. Use a comma, a full stop, a colon, or a new
  sentence. Write ranges as "1.3 to 1.6", "2 to 4 words".
- No AI-style symbols or decoration in sentences: no · separators, no arrows (→), no emoji, no
  ✅ ❌ ⚠️, no … (write "..."), no curly quotes. Use plain status words: "Already correct",
  "Fixed", "Needs review".
- Use straight quotes " " for UI labels: the "Search" button. Curly quotes and HTML entities
  (&quot;) are not allowed.
- No filler or stock phrases: "Please note", "It's worth noting", "In summary", "Overall",
  "seamless", "robust", "leverage", "delve", "ensure that".
- Bold only for the status word or one key term per item, never scattered through a sentence.
- Use a table only when it compares items side by side; otherwise short bullets.
- Keep Figma names exactly as they are, even if they contain a dash (frame "01 — Project SPEC
  list"). Quote them as names; do not copy their symbols into your own sentences.
- Final check before sending: search the text for — – → · … and emoji, and rewrite any
  that are not part of a quoted Figma name.

Annotation specifics:

- 1 or 2 short sentences, about 25 words max.
- Start with the action or the condition: "Opens the match details for this part." or
  "Shown only when the search finds nothing."
- Use "when ... then ..." for logic: "When no part is suggested, the button says Choose."
- No component or token names unless the reader is a developer and needs them.
- Sentence case, numbers as digits, UI named by its visible label in straight quotes.

## Tools

- **First choice: figma-console Desktop Bridge** (user preference): `figma_get_annotation_categories`,
  `figma_get_annotations`, `figma_set_annotations`, `figma_take_screenshot`, `figma_execute`.
- **Fallback: official Figma MCP**: call `create_session` first, load the `figma:figma-use` skill,
  then `use_figma` with `figma.annotations.getAnnotationCategoriesAsync()` and
  `node.annotations = [...node.annotations, { label, categoryId }]`; `get_screenshot` for evidence.
- Instances: annotations go on the instance or a non-nested layer; if the target sits deep inside an
  instance, annotate the nearest instance and name the inner element in the text.

## Explicit non-goals

- No design changes: no layout, text, component, variant, token or style edits.
- No deleting, rewriting or reordering existing annotations.
- No new annotation categories without approval.
- No annotations that restate what the design already shows.
- No writing in the same turn as the draft unless the user's request already said to write
  without review (e.g. "annotate and add them directly").
