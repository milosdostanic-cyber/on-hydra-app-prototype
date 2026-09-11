import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const BASE = process.env.SPEC_BASE ?? 'http://localhost:4173';
const OUT = 'scripts/spec-audit/shots';
mkdirSync(OUT, { recursive: true });

const ID = 'spec-clean-22';
const routes = [
  ['home', '/spec'],
  ['guide-specs', '/spec/guide-specs'],
  ['new', '/spec/new'],
  ['analyze', `/spec/${ID}/analyze`],
  ['edit', `/spec/${ID}/edit`],
  ['review', `/spec/${ID}/review`],
  ['products', `/spec/${ID}/products`],
  ['submittals', `/spec/${ID}/submittals`],
  ['substitution', `/spec/${ID}/substitution`],
  ['ask', `/spec/${ID}/ask`],
  ['deliver-back', `/spec/${ID}/deliver-back`],
];

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
const page = await ctx.newPage();
const problems = [];
page.on('console', (m) => {
  if (m.type() === 'error') problems.push(`[console] ${m.text()}`);
});
page.on('pageerror', (e) => problems.push(`[pageerror] ${e.message}`));

for (const [name, path] of routes) {
  await page.goto(BASE + path, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2200);
  await page.screenshot({ path: `${OUT}/sweep-${name}.png`, fullPage: true });

  // Overflow / clipping detection on text nodes.
  const clipped = await page.evaluate(() => {
    const out = [];
    document.querySelectorAll('*').forEach((el) => {
      if (el.children.length) return;
      const text = (el.textContent ?? '').trim();
      if (!text) return;
      if (el.scrollWidth > el.clientWidth + 2 || el.scrollHeight > el.clientHeight + 2) {
        const style = getComputedStyle(el);
        if (style.overflow === 'visible' && style.overflowY === 'visible') return;
        out.push(text.slice(0, 60));
      }
    });
    return out.slice(0, 8);
  });

  const primaryCtas = await page.locator('.ant-btn-primary:visible').allInnerTexts();
  console.log(`\n=== ${name} (${path})`);
  console.log('  primary CTAs:', primaryCtas);
  if (clipped.length) console.log('  clipped:', clipped);
}

console.log('\nPROBLEMS:', [...new Set(problems)].slice(0, 20));
await browser.close();
