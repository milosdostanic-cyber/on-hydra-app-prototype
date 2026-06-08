import type { ReactNode } from 'react';

import {
  hydraBaseNormal,
  hydraLargeStrong,
  hydraTextStyleToReactCss,
  hydraSmallNormal,
  hydraTitleHeading4,
} from '../../theme/hydraTypography';
import { Flex, Space, Typography, theme } from '../../ui/antd';

type Props = {
  title: string;
  description?: string;
  /** Short context above the title (e.g. what “BOM” stands for). */
  eyebrow?: string;
  /** Figma `Large/Strong` (16/24/600) for Get started–style subtitles; default `Base/Normal`. */
  descriptionVariant?: 'base' | 'large-strong';
  /**
   * Primary flow actions (typically `size="large"` buttons) shown to the right of the title.
   * Table-scoped actions (filters, search, add row) stay above the table on each page.
   */
  actions?: ReactNode;
};

/** Page-level BOM headlines — Figma `Title/Heading 4` (20/28) on every screen of equal importance. */
export function BomPageHeader({ title, description, eyebrow, descriptionVariant = 'base', actions }: Props) {
  const { token } = theme.useToken();
  const descriptionTypography = descriptionVariant === 'large-strong' ? hydraLargeStrong : hydraBaseNormal;

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
        level={4}
        style={{
          margin: 0,
          ...hydraTextStyleToReactCss(hydraTitleHeading4),
        }}
      >
        {title}
      </Typography.Title>
      {description ? (
        <Typography.Paragraph
          style={{
            margin: 0,
            color: token.colorTextDescription,
            ...hydraTextStyleToReactCss(descriptionTypography),
          }}
        >
          {description}
        </Typography.Paragraph>
      ) : null}
    </Space>
  );

  if (actions) {
    return (
      <Flex align="center" justify="space-between" gap={token.marginSM} wrap="nowrap" style={{ width: '100%' }}>
        <div style={{ flex: '1 1 auto', minWidth: 0 }}>{titleStack}</div>
        <Flex gap={token.marginXS} align="center" wrap="nowrap" style={{ flexShrink: 0 }}>
          {actions}
        </Flex>
      </Flex>
    );
  }

  return (
    <Space orientation="vertical" size={token.marginXS} style={{ width: '100%' }}>
      {titleStack}
    </Space>
  );
}
