---
name: hydra-admin-module-to-figma
description: >-
  Rebuilds one Hydra Admin module at a time as Figma screens that use only
  published Hydra Ant Design - DS instances, variables, and text styles.
  Use when the user asks to capture Admin modules (Dashboard, Release Notes,
  Access Blacklist, Knowledge Center, Content, Companies, Users, Roles,
  Admin Roles, Feature Access Limit), put those screens in Figma, reorganize
  a module page, or align Admin screens to the same layout. Read-only until
  the user confirms that module. Never creates tokens or components, never
  uses raw design values, and never edits the contents of a Ready for Dev screen.
---

# Hydra Admin module → Figma

## Purpose

Turn one live Admin module into Figma screens that a developer can build from the Hydra design system.

Do one module per run. Propose the screen list and the shared page layout, then stop. Draw only after the user confirms that module.

## Default mode

Read-only until the user confirms the current module in a later turn ("go ahead", "build it", "kreni", or the same idea in their own words).

**Hard stop:** after the module plan is printed, stop. Do not call `use_figma`, move nodes, or start the next module in that same turn.

## What this skill must never do

- Create a variable, text style, effect style, or component.
- Detach an instance, or draw a button, input, table, icon, card, modal, or nav item by hand.
- Leave a raw hex, rgb, font size, font weight, line height, padding, gap, radius, or shadow on anything this skill creates or edits.
- Change the contents of a Ready for Dev screen. Moving that frame is allowed. Editing it is not.
- Start a second module before the user says the current one is done.
- Guess past a missing component, a missing variable, or an unclear target. Ask.

## Skills to load

| Job | Skill | Why this one |
|-----|--------|----------------|
| Draw the screen | `hydra-ant-design-screen-recreator` plus `figma-use` | Hydra library only. Instances stay linked. |
| Small UX improvements | `hydra-ux-audit` | Hierarchy, one clear action, states, plain copy. Stays inside existing components. |
| Do not load for this task | `impeccable`, `prototype-to-figma` | Those skills redesign a visual world or fall back to raw frames. That breaks this contract. |

Official Figma MCP only. Console MCP only if the user explicitly asks for it.

## Sources

Read both before proposing a module. The product source describes what the screen does. The Hydra library is the only visual source.

| Source | Use |
|--------|-----|
| `https://github.com/ooden-tech/on-hydra-app` → `apps/on-hydra-admin-frontend` | Routes, screens, copy, states. Start from `src/modules/app/router/constants/navigation.tsx`. |
| `https://admin.hydra-dev.spaceinch.tech/dashboard` | What the screen actually looks like, when a signed-in computer-use session already exists. |
| Hydra Ant Design - DS, file `3ghYBXR6XVUEaeBo3D5E4q` | The only components, variables, and text styles. |

If the live admin needs a login and no session is open, say so and continue from the GitHub app. Do not ask for or store a password.

Module order and the shared page grammar are in [module-layout.md](module-layout.md).

## Where the screens go

The Hydra file above is the **library**. Do not draw product screens on its Cover page or on any component page.

The target for Admin screens must be a product file the user names. If they have not named one, ask before the plan. The last known Admin file is `rONB8aMPanOjS3GC1uN16d` (Admin — RSFC). Treat that as a candidate, not as permission.

## Ready for Dev

A screen is protected when either is true:

- `devStatus.type` is `READY_FOR_DEV` or `COMPLETED`
- the page, section, or frame name says Ready for Dev

Protected screens **may be moved** into the shared module layout. After the move, the frame's width, height, and every descendant must be unchanged. Do not rebind variables, swap instances, change variants, edit text, or resize it.

If auto layout would reflow a protected frame, move it with fixed size only. If the move changes anything inside, revert and ask.

New and unprotected screens may be rebuilt and lightly improved. Protected screens stay as they are.

## Same layout on every module

Use the section order in [module-layout.md](module-layout.md) on every module page. Skip a section the module does not have. Do not invent a different order for one module.

Spacing between those sections comes from an existing Hydra spacing variable. If no variable matches, stop and ask. Do not type a pixel value.

## No raw values

On every node this skill creates or edits:

- fills, strokes, and text color are bound to Hydra variables
- padding, item spacing, and radius are bound to Hydra variables
- text uses a published Hydra text style (`textStyleId`)
- effects use a published Hydra effect style when an effect is needed

Semantic variables win over primitives when both exist. A missing variable is a stop, not a closest-value guess.

## Workflow

```text
Hydra Admin module → Figma:
- [ ] 1. Confirm the target file, or ask
- [ ] 2. Work on one module only
- [ ] 3. Read the live nav and that module's screens
- [ ] 4. Mark Ready for Dev frames as move-only
- [ ] 5. Map screens into the shared section order
- [ ] 6. List Hydra instances for unprotected screens
- [ ] 7. Note UX changes that stay inside hydra-ux-audit
- [ ] 8. Emit the module plan, then STOP
```

Build step, only after confirmation:

1. Load `figma-use` before every `use_figma` call.
2. Load `hydra-ant-design-screen-recreator` and follow it, including `get_libraries` and `includeLibraryKeys` for the Hydra library only.
3. Move protected frames first. Check that their contents did not change.
4. Build one unprotected region at a time. Search the Hydra library at runtime. Do not reuse cached keys as authority.
5. If a component or variable is missing, stop and ask. Do not draw a substitute.
6. Run the screen-recreator audit plus `hydra-ux-audit` on the new frames only.
7. Print the completion report, then ask before the next module.

## Output format

```markdown
# Admin module plan — [module name]

## Target
- File: [file name and key, or "need a target"]
- Page: [page name]

## Screens
| Screen | Section | Action |
|--------|---------|--------|
| [name] | [List / Detail / …] | Move only (Ready for Dev) / Rebuild / New |

## UX changes on unprotected screens
- [one change, and which existing Hydra component carries it]

## Blocked
- [missing Hydra component or variable, or "none"]

## Left untouched inside the frame
- [Ready for Dev frame names]
```

After the plan, ask whether to build this module. Do not build it in that same response.

## Completion report

After a confirmed build:

1. Target file and page.
2. Frames moved without internal edits.
3. Frames rebuilt, with the Hydra component families used.
4. Confirmation that no new token or component was created and no raw value remains.
5. DS gaps that stopped the work.

## Explicit non-goals

- Do not create tokens, styles, or components.
- Do not edit the contents of a Ready for Dev or Completed screen.
- Do not pull components or colors from any library other than Hydra Ant Design - DS.
- Do not redesign a module with a new visual language.
- Do not continue into the next module without an explicit yes.
