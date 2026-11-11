import { chromium } from 'playwright';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';

const html = resolve('scripts/brand-compare/semantic-map.html');
const out = resolve('Documentation/assets/rsfc-rebrand-semantic-token-map.png');

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1320, height: 1000 }, deviceScaleFactor: 2 });
await page.goto(pathToFileURL(html).href, { waitUntil: 'networkidle' });
await page.evaluate(() => document.fonts.ready);
await page.waitForTimeout(400);
await page.screenshot({ path: out, fullPage: true });
await browser.close();

console.log(`wrote ${out}`);
