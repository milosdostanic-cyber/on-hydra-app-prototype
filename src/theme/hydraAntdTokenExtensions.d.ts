import 'antd/es/theme/interface';

declare module 'antd/es/theme/interface' {
  interface AliasToken {
    /** Lighter primary surface — mapped BOM columns, soft chips (`primaryPrimitiveBlue`). */
    colorPrimaryBgSubtle: string;
    /** Softer primary outline paired with `colorPrimaryBgSubtle`. */
    colorPrimaryBorderSubtle: string;
  }
}
