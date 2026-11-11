import 'antd/es/theme/interface';

declare module 'antd/es/theme/interface' {
  interface AliasToken {
    /** Lighter primary surface — mapped BOM columns, soft chips (`primaryPrimitiveBlue`). */
    colorPrimaryBgSubtle: string;
    /** Softer primary outline paired with `colorPrimaryBgSubtle`. */
    colorPrimaryBorderSubtle: string;
    /** Figma `Color/Action/colorActionBg` — orange action tint (`buttonPrimaryPalette.bg`). */
    colorActionBg: string;
    /** Figma `Color/Action/colorActionBorder` — paired with `colorActionBg`. */
    colorActionBorder: string;
  }
}
