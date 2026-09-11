# Cloudflare Pages preview setup

One-time setup to deploy this prototype on every push to `main`, with password protection.

## Prerequisites

- Cloudflare account with access to **Workers & Pages**
- GitHub **org or repo admin** to approve the Cloudflare GitHub App on `ooden-tech/on-hydra-app-prototype` (private repo)

## Connect the repository

1. Open [Cloudflare dashboard](https://dash.cloudflare.com) → **Workers & Pages** → **Create** → **Pages** → **Connect to Git**.
2. Select **GitHub** and authorize **Cloudflare Pages** for the `ooden-tech` organization.
3. Choose repository **on-hydra-app-prototype**.

## Build configuration

| Setting | Value |
|--------|--------|
| Production branch | `main` |
| Framework preset | Vite |
| Build command | `npm run build` |
| Deploy command | `npx wrangler deploy` |
| Build output directory | `dist` |
| Environment variable (optional) | `NODE_VERSION` = `20` |

The repo includes:

- `wrangler.jsonc` — Worker + static assets. SPA fallback is `assets.not_found_handling: "single-page-application"` (do **not** use `/* /index.html 200` in `_redirects`; Cloudflare rejects that as an infinite loop, error 100324)
- `workers/auth.js` — HTTP Basic Auth on all requests before assets are served

## Environment variables

In the Cloudflare project → **Settings → Variables and Secrets**, add for **Production** and **Preview**:

| Name | Value |
|------|--------|
| `BASIC_AUTH_USER` | Shared preview username |
| `BASIC_AUTH_PASSWORD` | Strong shared password |

Do not commit these values to git. Share the URL and credentials with product via 1Password or Slack.

## Custom domain (optional)

**Custom domains** → add a hostname (e.g. `hydra-prototype.example.com`) and follow DNS instructions if the domain is on Cloudflare.

## Fallback: GitHub Actions deploy

If the Cloudflare GitHub App cannot be installed on the private repo, use a workflow with [cloudflare/wrangler-action](https://github.com/cloudflare/wrangler-action). A repo admin must add secrets:

- `CLOUDFLARE_API_TOKEN` (Pages edit permission)
- `CLOUDFLARE_ACCOUNT_ID`

Build and deploy with `npm run deploy` (or `npx wrangler deploy` after `npm run build`). Project name comes from `wrangler.jsonc`.

## Verify

1. Merge deploy-related files to `main` and wait for the first deployment.
2. Open the `*.pages.dev` URL — you should get a browser login prompt.
3. After signing in, navigate to `/search/results?q=all` and refresh the page (SPA routing should work).
