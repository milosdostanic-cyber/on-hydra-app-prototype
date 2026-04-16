/**
 * Regenerate primary token values from antd (seed + Hydra overrides).
 * Run: npm run tokens:dump
 */
import { theme } from 'antd';

const { getDesignToken } = theme;

const merged = getDesignToken({
  token: {
    colorPrimary: '#0073A5',
    colorPrimaryActive: '#004173',
    colorPrimaryTextActive: '#004173',
    colorPrimaryBorderHover: '#00B9F0',
    colorPrimaryTextHover: '#00B9F0',
  },
});

const keys = Object.keys(merged)
  .filter((k) => /^colorPrimary/i.test(k))
  .sort();
console.log(JSON.stringify(Object.fromEntries(keys.map((k) => [k, merged[k]])), null, 2));
