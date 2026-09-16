import { Flex, Typography, theme } from '../ui/antd';

import { rsfcWordmarkSvgUrl } from '../assets/brand/rsfcLogoUrls';
import { brandHeadingFontFamily, hydraTextStyleToReactCss, hydraTitleHeading5 } from '../theme/hydraTypography';

type Props = { collapsed: boolean };

/**
 * Sidebar header above the menu: Figma `RSFC_logo` reverse lockup + **ConnectED**
 * (`Title/Heading 5` metrics).
 */
export function ConnectedSidebarBrand({ collapsed }: Props) {
  const { token } = theme.useToken();

  const logo = (
    <img
      src={rsfcWordmarkSvgUrl.onDark}
      alt="Reliable Safety & Flow Corporation"
      style={{
        height: token.controlHeight,
        width: 'auto',
        maxWidth: collapsed ? 'none' : '100%',
        objectFit: 'contain',
        display: 'block',
      }}
    />
  );

  if (collapsed) {
    return (
      <Flex align="center" justify="center" style={{ width: '100%', minHeight: 0 }} aria-label="ConnectED">
        <Flex
          style={{
            width: token.controlHeight,
            height: token.controlHeight,
            overflow: 'hidden',
            flexShrink: 0,
          }}
        >
          {logo}
        </Flex>
      </Flex>
    );
  }

  return (
    <Flex align="center" justify="space-between" style={{ width: '100%', minWidth: 0 }} aria-label="ConnectED">
      {logo}
      <Typography.Text
        style={{
          color: token.colorTextLightSolid,
          ...hydraTextStyleToReactCss(hydraTitleHeading5),
          fontFamily: brandHeadingFontFamily,
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
