import { Flex, Typography, theme } from '../ui/antd';

import { ascWordmarkSvgUrl } from '../assets/brand/ascLogoUrls';
import { shellLayout } from '../theme/hydraAlias';
import { brandFontFamily, hydraTextStyleToReactCss, hydraTitleHeading4 } from '../theme/hydraTypography';

type Props = { collapsed: boolean };

/**
 * Sidebar header above the menu: **`On_Dark.svg`** wordmark + **ConnectED** (Figma `Title/Heading 4` metrics).
 */
export function ConnectedSidebarBrand({ collapsed }: Props) {
  const { token } = theme.useToken();
  const innerH = shellLayout.headerHeight - token.paddingSM * 2;

  const logo = (
    <img
      src={ascWordmarkSvgUrl.onDark}
      alt="ASC Engineered Solutions"
      style={{
        height: innerH,
        width: 'auto',
        maxWidth: '100%',
        objectFit: 'contain',
        display: 'block',
      }}
    />
  );

  if (collapsed) {
    return (
      <Flex align="center" justify="center" style={{ width: '100%', minHeight: 0 }} aria-label="ConnectED">
        {logo}
      </Flex>
    );
  }

  return (
    <Flex align="center" gap={token.marginSM} style={{ width: '100%', minWidth: 0 }} aria-label="ConnectED">
      <Flex flex="1" style={{ minWidth: 0, minHeight: 0 }} align="center">
        {logo}
      </Flex>
      <Typography.Text
        style={{
          color: token.colorTextLightSolid,
          fontFamily: brandFontFamily,
          ...hydraTextStyleToReactCss(hydraTitleHeading4),
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
