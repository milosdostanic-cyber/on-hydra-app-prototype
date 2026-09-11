import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const BASE = process.env.BASE ?? 'http://localhost:5173';
const OUT = 'scripts/spec-audit/shots-scroll';
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({ channel: 'chrome' });
const ctx = await browser.newContext({ viewport: { width: 1512, height: 900 } });
const page = await ctx.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));

async function pickScenario(label) {
  await page.goto(`${BASE}/spec`, { waitUntil: 'networkidle' });
  await page.locator('button.ant-float-btn').click();
  const drawer = page.getByRole('dialog', { name: 'Spec demo controls' });
  await drawer.getByRole('combobox').first().click();
  await page.locator('.ant-select-item-option').filter({ hasText: label }).first().click();
  await page.waitForTimeout(900);
  await page.keyboard.press('Escape');
}

async function report(name, url, { height = 900 } = {}) {
  await page.setViewportSize({ width: 1512, height });
  await page.goto(`${BASE}${url}`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  const metrics = await page.evaluate(() => {
    const content = document.querySelector('.ant-layout-content');
    const scrollers = [...document.querySelectorAll('*')].filter((el) => {
      const style = getComputedStyle(el);
      return ['auto', 'scroll'].includes(style.overflowY) && el.scrollHeight > el.clientHeight + 2;
    });
    return {
      pageScrolls: content.scrollHeight > content.clientHeight + 2,
      innerScrollers: scrollers.length,
    };
  });
  console.log(name, JSON.stringify(metrics));
  await page.screenshot({ path: `${OUT}/${name}-top.png` });
  // Scroll every inner region to the bottom to inspect pinned chrome.
  await page.evaluate(() => {
    for (const el of document.querySelectorAll('*')) {
      const style = getComputedStyle(el);
      if (['auto', 'scroll'].includes(style.overflowY)) el.scrollTop = el.scrollHeight;
    }
  });
  await page.waitForTimeout(400);
  await page.screenshot({ path: `${OUT}/${name}-bottom.png` });
}

await pickScenario('Proprietary Division 23');
await report('analyze-prop', '/spec/spec-prop-23/analyze');
await report('analyze-prop-short', '/spec/spec-prop-23/analyze', { height: 620 });
await report('edit-prop', '/spec/spec-prop-23/edit');
await report('edit-prop-short', '/spec/spec-prop-23/edit', { height: 620 });

await pickScenario('Clean Division 22');
await report('analyze-clean', '/spec/spec-clean-22/analyze');
await report('edit-clean', '/spec/spec-clean-22/edit');

console.log('ERRORS', errors.slice(0, 5));
await browser.close();
