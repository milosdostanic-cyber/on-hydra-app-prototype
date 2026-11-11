import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const OUT = 'scripts/spec-audit/shell-parity';
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

await page.goto('http://localhost:5173/projects/2/spec', { waitUntil: 'networkidle' });
await page.waitForTimeout(1200);

await page.screenshot({ path: `${OUT}/shell-full.png` });
await page.locator('aside').first().screenshot({ path: `${OUT}/sidebar.png` });
await page.screenshot({ path: `${OUT}/topbar.png`, clip: { x: 256, y: 0, width: 1184, height: 120 } });

const measured = await page.evaluate(() => {
  const box = (el) => (el ? el.getBoundingClientRect() : null);
  const cs = (el) => (el ? getComputedStyle(el) : null);

  const sider = document.querySelector('aside');
  const brandBand = sider?.querySelector('.ant-layout-sider-children > div > div');
  const items = [...document.querySelectorAll('aside .ant-menu-item')];
  const home = items[0];
  const selected = document.querySelector('aside .ant-menu-item-selected');
  const homeIcon = home?.querySelector('.ant-menu-item-icon');
  const homeLabel = home?.querySelector('.ant-menu-title-content');

  const projectBtn = [...document.querySelectorAll('button')].find((b) =>
    b.textContent?.includes('Riverside Office Park'),
  );
  const projectLabel = [...document.querySelectorAll('span')].find(
    (s) => s.textContent?.trim() === 'Project:',
  );

  let topBar = projectLabel;
  while (topBar && cs(topBar)?.backgroundColor !== 'rgb(0, 115, 165)') {
    topBar = topBar.parentElement;
  }
  const avatar = document.querySelector('.ant-avatar');

  return {
    siderWidth: box(sider)?.width,
    brandBandHeight: box(brandBand)?.height,
    brandBandPaddingInline: cs(brandBand)?.paddingInline,
    brandBandBorderBottom: cs(brandBand)?.borderBottomWidth,
    menuItemHeight: box(home)?.height,
    menuFirstItemTop: box(home)?.top,
    menuItemPitch: items[1] && home ? box(items[1]).top - box(home).top : null,
    menuItemPaddingInline: cs(home)?.paddingInline,
    menuIconSize: box(homeIcon)?.width,
    menuIconToLabelGap:
      homeIcon && homeLabel ? box(homeLabel).left - box(homeIcon).right : null,
    menuLabelFontSize: cs(homeLabel)?.fontSize,
    selectedBg: cs(selected)?.backgroundColor,
    selectedColor: cs(selected)?.color,
    topBarBg: cs(topBar)?.backgroundColor,
    topBarPadding: cs(topBar)?.padding,
    topBarBorderBottom: cs(topBar)?.borderBottomWidth,
    projectLabelFontSize: cs(projectLabel)?.fontSize,
    projectLabelToButtonGap:
      projectLabel && projectBtn ? box(projectBtn).left - box(projectLabel).right : null,
    projectBtnHeight: box(projectBtn)?.height,
    projectBtnBg: cs(projectBtn)?.backgroundColor,
    projectBtnRadius: cs(projectBtn)?.borderRadius,
    projectBtnFontSize: cs(projectBtn)?.fontSize,
    avatarSize: box(avatar)?.width,
    avatarBg: cs(avatar)?.backgroundColor,
  };
});

const FIGMA = {
  siderWidth: 256,
  brandBandHeight: 62,
  brandBandPaddingInline: '20px',
  brandBandBorderBottom: '0px',
  menuItemHeight: 40,
  menuFirstItemTop: 74,
  menuItemPitch: 48,
  menuItemPaddingInline: '24px',
  menuIconSize: 16,
  menuIconToLabelGap: 8,
  menuLabelFontSize: '14px',
  selectedBg: 'rgb(184, 234, 255)',
  selectedColor: 'rgb(0, 54, 95)',
  topBarBg: 'rgb(0, 115, 165)',
  topBarPadding: '16px 24px',
  topBarBorderBottom: '0px',
  projectLabelFontSize: '16px',
  projectLabelToButtonGap: 12,
  projectBtnHeight: 40,
  projectBtnBg: 'rgb(240, 90, 35)',
  projectBtnRadius: '8px',
  projectBtnFontSize: '16px',
  avatarSize: 32,
  avatarBg: 'rgba(0, 0, 0, 0.25)',
};

let fails = 0;
for (const [key, expected] of Object.entries(FIGMA)) {
  const actual = measured[key];
  const ok =
    typeof expected === 'number'
      ? typeof actual === 'number' && Math.abs(actual - expected) <= 1
      : actual === expected;
  if (!ok) fails += 1;
  console.log(`${ok ? 'OK  ' : 'FAIL'} ${key}: figma=${expected} code=${actual}`);
}
console.log(fails === 0 ? '\nAll shell measurements match Figma.' : `\n${fails} mismatch(es).`);

await browser.close();
