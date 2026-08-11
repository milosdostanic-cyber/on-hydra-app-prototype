import { PictureOutlined } from '@ant-design/icons';

import { Flex, theme } from '../ui/antd';

type Props = {
  /** Edge length in `theme` spacing units is avoided — use antd `token.controlHeight` scale. */
  sizePx?: number;
};

/** Placeholder tile for catalog tables when no product image exists. */
export function CatalogThumbnailPlaceholder({ sizePx }: Props) {
  const { token } = theme.useToken();
  const edge = sizePx ?? token.controlHeight;
  return (
    <Flex
      align="center"
      justify="center"
      style={{
        width: edge,
        height: edge,
        borderRadius: token.borderRadiusSM,
        border: `${token.lineWidth}px ${token.lineType} ${token.colorBorderSecondary}`,
        background: token.colorFillQuaternary,
        flexShrink: 0,
      }}
    >
      <PictureOutlined style={{ color: token.colorTextTertiary }} />
    </Flex>
  );
}
