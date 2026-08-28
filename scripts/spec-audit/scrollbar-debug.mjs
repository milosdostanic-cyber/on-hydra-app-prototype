import { chromium } from 'playwright';

const BASE = 'http://localhost:5173';
const browser = await chromium.launch({ channel: 'chrome' });
const page = await browser.newPage({ viewport: { width: 1512, height: 900 } });
await page.goto(`${BASE}/spec/spec-scan-21/edit`, { waitUntil: 'networkidle' });
await page.waitForTimeout(3000);
const info = await page.evaluate(() => ({
  url: location.href,
  title: document.title,
  bodyText: document.body.innerText.slice(0, 500),
  scrollAttrs: [...document.querySelectorAll('[data-spec-document-scroll]')].length,
  listbox: [...document.querySelectorAll('[role="listbox"]')].length,
  skeleton: document.querySelectorAll('.ant-skeleton').length,
  overflowEls: [...document.querySelectorAll('*')].filter((el) => {
    const s = getComputedStyle(el);
    return ['auto', 'scroll'].includes(s.overflowY) && el.scrollHeight > el.clientHeight + 2;
  }).map((el) => ({
    tag: el.tagName,
    class: el.className?.toString?.().slice(0, 60) ?? '',
    attr: el.getAttribute('data-spec-document-scroll'),
    text: el.textContent?.slice(0, 40),
    rect: (() => {
      const r = el.getBoundingClientRect();
      return { l: Math.round(r.left), r: Math.round(r.right), w: Math.round(r.width) };
    })(),
  })).slice(0, 15),
}));
console.log(JSON.stringify(info, null, 2));
await browser.close();
