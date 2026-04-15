import type { ReactNode } from 'react';

import {
  hydraBaseNormal,
  hydraTextStyleToReactCss,
  hydraSmallNormal,
  hydraTitleHeading2,
  hydraTitleHeading3,
} from '../../theme/hydraTypography';
import { Flex, Space, Typography, theme } from '../../ui/antd';

type Props = {
  title: string;
  description?: string;
  /** Short context above the title (e.g. what “BOM” stands for). */
  eyebrow?: string;
  /** Use 3 for a lighter landing-style headline. */
  titleLevel?: 2 | 3;
  /**
   * Primary flow actions (typically `size="large"` buttons) shown to the right of the title.
   * Table-scoped actions (filters, search, add row) stay above the table on each page.
   */
  actions?: ReactNode;
};

export function BomPageHeader({ title, description, eyebrow, titleLevel = 2, actions }: Props) {
  const { token } = theme.useToken();
  const heading = titleLevel === 3 ? hydraTitleHeading3 : hydraTitleHeading2;
  const antLevel = titleLevel === 3 ? 3 : 2;

  const titleStack = (
    <Space orientation="vertical" size={token.marginXS} style={{ minWidth: 0, width: actions ? undefined : '100%' }}>
      {eyebrow ? (
        <Typography.Text
          type="secondary"
          style={{
            display: 'block',
            ...hydraTextStyleToReactCss(hydraSmallNormal),
          }}
        >
          {eyebrow}
        </Typography.Text>
      ) : null}
      <Typography.Title
        level={antLevel}
        style={{
          margin: 0,
          ...hydraTextStyleToReactCss(heading),
        }}
      >
        {title}
      </Typography.Title>
      {description ? (
        <Typography.Paragraph
          style={{
            margin: 0,
            color: token.colorTextDescription,
            ...hydraTextStyleToReactCss(hydraBaseNormal),
          }}
        >
          {description}
        </Typography.Paragraph>
      ) : null}
    </Space>
  );

  if (actions) {
    return (
      <Flex align="flex-start" justify="space-between" gap={token.marginMD} wrap="wrap" style={{ width: '100%' }}>
        <div style={{ flex: '1 1 240px', minWidth: 0 }}>{titleStack}</div>
        <Space size={token.marginSM} wrap align="center" style={{ flexShrink: 0 }}>
          {actions}
        </Space>
      </Flex>
    );
  }

  return (
    <Space orientation="vertical" size={token.marginXS} style={{ width: '100%' }}>
      {titleStack}
    </Space>
  );
}
