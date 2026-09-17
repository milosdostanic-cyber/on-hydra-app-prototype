import { Flex, Typography, theme } from '../ui/antd';

import { rsfcLogoSvgUrl } from '../assets/brand/rsfcLogoUrls';
import {
  hydraSidebarRsfcLogoHeightPx,
  hydraSidebarRsfcLogoMark,
  hydraSidebarRsfcLogoWidthPx,
  hydraSidebarRsfcLogoWordmark,
} from '../theme/hydraMenuMetrics';
import { brandFontFamily, hydraTextStyleToReactCss, hydraTitleHeading5 } from '../theme/hydraTypography';

type Props = { collapsed: boolean };

function RsfcMark({ alt }: { alt: string }) {
  return (
    <img
      src={rsfcLogoSvgUrl.mark}
      alt={alt}
      style={{
        position: 'absolute',
        left: hydraSidebarRsfcLogoMark.left,
        top: hydraSidebarRsfcLogoMark.top,
        width: hydraSidebarRsfcLogoMark.width,
        height: hydraSidebarRsfcLogoMark.height,
        display: 'block',
      }}
    />
  );
}

function RsfcLockup() {
  return (
    <div
      role="img"
      aria-label="Reliable Safety & Flow Corporation"
      style={{
        position: 'relative',
        width: hydraSidebarRsfcLogoWidthPx,
        height: hydraSidebarRsfcLogoHeightPx,
        overflow: 'hidden',
        flexShrink: 0,
      }}
    >
      <RsfcMark alt="" />
      <img
        src={rsfcLogoSvgUrl.wordmark}
        alt=""
        style={{
          position: 'absolute',
          left: hydraSidebarRsfcLogoWordmark.left,
          top: hydraSidebarRsfcLogoWordmark.top,
          width: hydraSidebarRsfcLogoWordmark.width,
          height: hydraSidebarRsfcLogoWordmark.height,
          display: 'block',
        }}
      />
    </div>
  );
}

/**
 * Sidebar header above the menu: Figma `RSFC_logo` (120×29) + **ConnectED**
 * (`Title/Heading 5` / Barlow Medium).
 */
export function ConnectedSidebarBrand({ collapsed }: Props) {
  const { token } = theme.useToken();

  if (collapsed) {
    return (
      <Flex align="center" justify="center" style={{ width: '100%', minHeight: 0 }} aria-label="ConnectED">
        <div
          style={{
            position: 'relative',
            width: hydraSidebarRsfcLogoMark.width,
            height: hydraSidebarRsfcLogoMark.height,
            flexShrink: 0,
          }}
        >
          <RsfcMark alt="Reliable Safety & Flow Corporation" />
        </div>
      </Flex>
    );
  }

  return (
    <Flex align="center" justify="space-between" style={{ width: '100%', minWidth: 0 }} aria-label="ConnectED">
      <RsfcLockup />
      <Typography.Text
        style={{
          color: token.colorTextLightSolid,
          fontFamily: brandFontFamily,
          ...hydraTextStyleToReactCss(hydraTitleHeading5),
          margin: 0,
          whiteSpace: 'nowrap',
          flexShrink: 0,
        }}
      >
        ConnectED
      </Typography.Text>
    </Flex>
  );
}
