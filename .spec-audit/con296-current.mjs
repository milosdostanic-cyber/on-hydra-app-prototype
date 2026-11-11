import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const OUT = '.spec-audit/con296-current';
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });

const errors = [];
page.on('pageerror', (err) => errors.push(String(err)));
page.on('console', (msg) => {
  if (msg.type() === 'error') errors.push(msg.text());
});

// 1. Populated history
await page.goto('http://localhost:5173/projects/1/content', { waitUntil: 'networkidle' });
await page.waitForSelector('.download-history-table tbody tr.ant-table-row', { timeout: 15000 });
await page.waitForTimeout(800);
await page.screenshot({ path: `${OUT}/01-populated.png`, fullPage: true });

// 2. Mixed selection (parent + one child)
await page
  .locator('.download-history-table tbody tr.ant-table-row input[type="checkbox"]')
  .first()
  .check();
await page.waitForTimeout(400);
await page.screenshot({ path: `${OUT}/02-selection.png`, fullPage: true });

// 3. Empty state (project with no history)
await page.goto('http://localhost:5173/projects/2/content', { waitUntil: 'networkidle' });
await page.waitForTimeout(800);
await page.screenshot({ path: `${OUT}/03-empty.png`, fullPage: true });

console.log(JSON.stringify({ errors: [...new Set(errors)] }, null, 2));
await browser.close();
