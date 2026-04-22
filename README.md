# Hydra App Prototype

Hydra App Prototype is a React + Vite app for BOM (Bill of Materials) workflows in ASC Connected.
It is optimized for fast prototyping with existing Ant Design components and Hydra theme tokens.

## Who This README Is For

Use this guide if you are:
- a PM/designer reviewing or iterating on prototype flows
- a developer implementing UI changes in Cursor
- a stakeholder who needs to run the app locally from a GitHub link

## Figma References

- Design System (Hydra Ant Design DS): [Hydra Ant Design - DS](https://www.figma.com/design/3ghYBXR6XVUEaeBo3D5E4q/Hydra-Ant-Design---DS?node-id=204-47936&t=V9ypdSdYk2oXONOX-1)
- BOM product/design flows: [BOM SPEC - ASC Connected v2](https://www.figma.com/design/Ht3Up5MlRAKjK7eCuAy05L/BOM-SPEC---ASC-Connected-v2?node-id=670-18849&t=1ggZcsa1oIJ6jHIA-1)

## Tech Stack

- React 19
- TypeScript
- Vite
- Ant Design
- React Router

## Quick Start (Step by Step)

### 1) Install prerequisites

- Install Node.js 20+ (LTS recommended)
- Install npm (ships with Node.js)
- Install Cursor

#### Fresh macOS setup (simple, one step at a time)

If this is your first time setting up the project on a new Mac, follow these exact steps.

Step 0: Open Terminal.

Step 1: Install Homebrew (skip this step if `brew -v` already works).

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

Step 2: Install Node.js 20 (npm is included).

```bash
brew install node@20
echo 'export PATH="/opt/homebrew/opt/node@20/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

Step 3: Install Git (optional, only if `git --version` fails).

```bash
brew install git
```

Step 4: Confirm required tools are installed.

```bash
node -v
npm -v
git --version
```

Step 5: Clone the repository and enter the project folder.

```bash
git clone https://github.com/ooden-tech/on-hydra-app-prototype.git
cd on-hydra-app-prototype
```

Step 6: Install project dependencies.

```bash
npm install
```

Step 7: Start the app.

```bash
npm run dev
```

Step 8: Open the local URL shown in Terminal (usually `http://localhost:5173/`).

This repository uses npm and `package-lock.json`, so `yarn` and `pnpm` are not required.

### 5) Verify core routes

After startup, quickly verify these routes:

- `/projects` (entry/home)
- `/catalog`
- `/bom`

## Working in Cursor (PM-Friendly)

1. Open Cursor
2. Select `Open Folder` and choose this repository
3. Open `README.md` and keep it pinned
4. Use built-in terminal in Cursor and run:

```bash
npm run dev
```

5. Keep browser and Cursor side-by-side:
   - browser for validating UX
   - Cursor chat for change requests

## Prototyping Workflow (PM + Cursor)

Use this flow for safe, fast iteration without breaking shared UI foundations.

### Golden Rules

- Reuse existing patterns before creating new layout compositions
- Do not change shared/core components unless explicitly requested
- Do not create or modify design tokens during PM prototyping
- Keep changes local to the target screen/flow

### Suggested PM Cycle

1. Choose one target screen/flow (example: BOM Matching)
2. Write one focused change request (scope + expected behavior)
3. Run and review locally
4. Iterate in small steps until approved
5. Capture screenshots/videos for stakeholder review

### Recommended Prompt Template

Use the template in:

- `docs/prompt-templates/pm-prototyping-prompt.md`

Paste it into Cursor chat and replace the screen/flow specifics.

## Project Structure (High Level)

- `src/shell/*` - shell pages (projects, catalog, top-level workspace)
- `src/bom/*` - BOM-specific flows and pages
- `src/theme/*` - Hydra/Ant theme tokens and mappings
- `docs/prompt-templates/*` - PM prompt templates

## Available App Routes (Reference)

- `/projects` - projects list and project creation entry
- `/catalog` - catalog landing
- `/catalog/results` - catalog search/result view
- `/catalog/parts/:partId` - part details
- `/bom` - BOM landing
- `/bom/search` - BOM search/import flow
- `/bom/projects/:bomProjectId/parsing-review`
- `/bom/projects/:bomProjectId/matching`
- `/bom/projects/:bomProjectId/items/:itemId/narrow`
- `/bom/projects/:bomProjectId/items/:itemId/recommend`
- `/bom/projects/:bomProjectId/workspace`
- `/bom/projects/:bomProjectId/asc-products`
- `/bom/projects/:bomProjectId/translate`
- `/bom/projects/:bomProjectId/field-mapping`
- `/bom/projects/:bomProjectId/export`
- `/bom/projects/:bomProjectId/service-request`

## Scripts

- `npm run dev` - start Vite dev server
- `npm run build` - run TypeScript build and Vite production build
- `npm run preview` - preview production build locally
- `npm run tokens:dump` - dump primary token data via local script

## Git Workflow (Simple)

- Create a branch for each feature/fix
- Keep commits small and clear
- Open PR to `main`
- Merge only after quick route sanity check (`/projects`, `/catalog`, `/bom`)

## Troubleshooting

### `npm install` fails

- Confirm Node 20+:

```bash
node -v
```

- Remove and reinstall:

```bash
rm -rf node_modules package-lock.json
npm install
```

### App does not open on `5173`

- Check terminal output for Vite port override
- Open the exact URL shown in terminal

### Blank page after startup

- Stop server and restart:

```bash
npm run dev
```

- Check browser console errors

## Notes

- This repo is prototype-oriented: prioritize speed and clarity of UX validation
- Keep design-system alignment: Ant Design + Hydra tokens first
