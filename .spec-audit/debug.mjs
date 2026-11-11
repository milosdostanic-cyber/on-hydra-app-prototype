import { chromium } from 'playwright';

const BASE = 'http://localhost:5174';
const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1440, height: 1200 } });
await context.addInitScript(() => {
  localStorage.setItem('hydra-spec-demo', '1');
  localStorage.removeItem('hydra-spec-mock-v1');
});
const page = await context.newPage();
await page.goto(BASE + '/spec', { waitUntil: 'networkidle' });

await page.locator('.ant-float-btn').click();
await page.waitForTimeout(400);
await page.locator('.ant-drawer .ant-select').first().click();
await page.waitForTimeout(300);
const opts = await page.locator('.ant-select-item-option').allTextContents();
console.log('OPTIONS:', opts);
await page.locator('.ant-select-item-option[title="Proprietary Division 23"]').click();
await page.waitForTimeout(800);

const ls = await page.evaluate(() => {
  const raw = localStorage.getItem('hydra-spec-mock-v1');
  if (!raw) return 'NO LS';
  const p = JSON.parse(raw);
  return { scenarioId: p.scenarioId, docs: (p.documents || []).map((d) => d.id) };
});
console.log('AFTER SWITCH LS:', JSON.stringify(ls));

await page.keyboard.press('Escape');
await page.waitForTimeout(300);
await page.goto(BASE + '/spec', { waitUntil: 'networkidle' });
await page.waitForTimeout(1000);
const ls2 = await page.evaluate(() => {
  const raw = localStorage.getItem('hydra-spec-mock-v1');
  if (!raw) return 'NO LS';
  const p = JSON.parse(raw);
  return { scenarioId: p.scenarioId, docs: (p.documents || []).map((d) => d.id) };
});
console.log('AFTER RELOAD LS:', JSON.stringify(ls2));
console.log('HOME TEXT:', (await page.locator('main').innerText()).replace(/\s+/g, ' ').slice(0, 300));

await browser.close();
