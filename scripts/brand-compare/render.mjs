import { chromium } from 'playwright';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';

const html = resolve('scripts/brand-compare/color-comparison.html');
const out = resolve('Documentation/assets/rsfc-rebrand-color-comparison.png');

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1240, height: 1400 }, deviceScaleFactor: 2 });
await page.goto(pathToFileURL(html).href, { waitUntil: 'networkidle' });
await page.evaluate(() => document.fonts.ready);
await page.waitForTimeout(400);
await page.screenshot({ path: out, fullPage: true });
await browser.close();

console.log(`wrote ${out}`);
