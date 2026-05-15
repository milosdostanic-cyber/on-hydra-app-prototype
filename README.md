# Hydra App Prototype

React + Vite prototype for BOM workflows in ASC Connected (Ant Design + Hydra theme).

## Branch: `milos-feature-parts-updates`

GitHub: [ooden-tech/on-hydra-app-prototype @ `milos-feature-parts-updates`](https://github.com/ooden-tech/on-hydra-app-prototype/tree/milos-feature-parts-updates)

### What changed on this branch (summary)

- **Product catalog navigation (prototype):** demo hierarchy and navigation helpers; browse/search flows wired through the shell (`ProductCatalogContent`, search page, category “all parts”, subcategory hub, product line parts, part variants list and variant detail).
- **Featured parts:** configurable featured section with cards (`FeaturedPartCard`, layout/config/content listing), thumbnails and tile assets, links into catalog part routes.
- **Shell integration:** updates to `AppShell`, top bar, breadcrumbs, and content rail so catalog home and the new routes work together; catalog home, results, and part pages adjusted for the new flow.
- **Demo data and assets:** expanded `catalogDemoData`, hero/cover imagery, featured tiles and Figma-style featured part images under `public/assets/catalog/`.
- **Documentation and process:** PRD/UX notes under `Documentation/prd/` (featured parts, catalog navigation, implementation brief), `Documentation/hydra-app-capabilities.md`, GitHub pull request template, Cursor rule `hydra-prd-ux-playbook.mdc`.
- **Polish:** follow-up commits refine the catalog/featured-parts UX.

### Check out this branch and run locally

**If you already cloned the repository** (you are inside the project folder):

```bash
git fetch origin
git checkout milos-feature-parts-updates
git pull origin milos-feature-parts-updates
```

If the branch does not exist locally yet, create it tracking the remote:

```bash
git fetch origin milos-feature-parts-updates
git switch -c milos-feature-parts-updates --track origin/milos-feature-parts-updates
```

Then install dependencies and start the dev server:

```bash
npm install
npm run dev
```

**If you have not cloned the repository yet:**

```bash
git clone https://github.com/ooden-tech/on-hydra-app-prototype.git
cd on-hydra-app-prototype
git fetch origin
git checkout milos-feature-parts-updates
npm install
npm run dev
```

If you use SSH remotes, clone with `git@github.com:ooden-tech/on-hydra-app-prototype.git` instead of the HTTPS URL above. Open the URL Vite prints in the terminal (often `http://localhost:5173/`).
