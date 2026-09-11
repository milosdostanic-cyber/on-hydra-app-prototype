import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const BASE = process.env.BASE ?? 'http://localhost:5173';
const OUT = 'scripts/spec-audit/shots-analyze';
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
const page = await ctx.newPage();
const errors = [];
page.on('console', (m) => {
  if (m.type() === 'error') errors.push(m.text());
});
page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));

await page.goto(`${BASE}/spec`, { waitUntil: 'networkidle' });
await page.waitForTimeout(1200);
console.log('INDEX URL:', page.url());
await page.screenshot({ path: `${OUT}/00-list.png`, fullPage: true });

const rowNames = await page
  .locator('tbody tr td:nth-child(2)')
  .evaluateAll((cells) => cells.map((cell) => cell.innerText.trim()));
console.log('ROWS:', rowNames);

const ids = [];
for (const name of rowNames) {
  await page.goto(`${BASE}/projects/1/spec`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(900);
  await page.getByText(name, { exact: true }).first().click();
  await page.waitForTimeout(2400);
  const url = page.url();
  const id = url.match(/\/spec\/([^/?]+)\//)?.[1] ?? name;
  ids.push({ name, url, id });
  const slug = name.replace(/[^a-z0-9]+/gi, '-').toLowerCase();
  await page.screenshot({ path: `${OUT}/${slug}.png`, fullPage: true });
  const text = await page.evaluate(() => document.body.innerText.slice(0, 1800));
  console.log(`\n===== ${name} → ${url}\n${text}`);
}
console.log('\nIDS:', JSON.stringify(ids, null, 2));

console.log('\nERRORS:', errors.slice(0, 20));
await browser.close();
