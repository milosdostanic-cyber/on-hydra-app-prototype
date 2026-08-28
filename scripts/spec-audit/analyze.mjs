import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const BASE = 'http://localhost:4173';
const OUT = 'scripts/spec-audit/shots';
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
await page.waitForTimeout(500);

const state = await page.evaluate(() => {
  const raw = localStorage.getItem('hydra-spec-mock-v1');
  if (!raw) return 'NO STATE';
  const p = JSON.parse(raw);
  return {
    scenarioId: p.scenarioId,
    docs: (p.documents ?? []).map((d) => ({ id: d.id, state: d.processingState })),
    sections: (p.sections ?? []).length,
    requirements: (p.requirements ?? []).length,
    keys: Object.keys(p),
  };
});
console.log('STORE:', JSON.stringify(state, null, 2));

await page.getByRole('link', { name: /Division 22/i }).first().click();
await page.waitForTimeout(3000);
console.log('URL:', page.url());
await page.screenshot({ path: `${OUT}/analyze.png`, fullPage: true });
console.log('ERRORS:', errors.slice(0, 10));
await browser.close();
