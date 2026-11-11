import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const BASE = process.env.BASE ?? 'http://localhost:5173';
const OUT = 'scripts/spec-audit/live/asc-swap';
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1600, height: 1100 } });
const page = await ctx.newPage();

for (const id of ['spec-rop-fire-bid', 'spec-dlh-plumb-manual']) {
  await page.goto(`${BASE}/spec/${id}/analyze`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1600);

  const chips = await page.evaluate(() =>
    [...document.querySelectorAll('*')]
      .filter(
        (n) =>
          n.children.length === 0 &&
          /^(Swap part|Add manufacturer|Add product|Rewrite language|Update reference|Blocked)/.test(
            n.textContent?.trim() ?? '',
          ),
      )
      .map((n) => n.textContent.trim()),
  );
  console.log(id, 'action chips:', [...new Set(chips)]);
  await page.screenshot({ path: `${OUT}/${id}-analyze.png`, fullPage: false });

  await page.goto(`${BASE}/spec/${id}/products`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1200);
  await page.screenshot({ path: `${OUT}/${id}-products.png`, fullPage: false });
}

await browser.close();
