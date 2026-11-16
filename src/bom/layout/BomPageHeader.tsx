import type { ReactNode } from 'react';

import {
  hydraLargeNormal,
  hydraTextStyleToReactCss,
  hydraTitleHeading2,
  hydraTitleHeading3,
  hydraTitleHeading4,
} from '../../theme/hydraTypography';
import { pageDescriptionStyle } from '../../shell/pageDescriptionStyle';
import { Flex, Space, Typography, theme } from '../../ui/antd';

type Props = {
  title: string;
  description?: ReactNode;
  /** Short context above the title (e.g. what “BOM” stands for). */
  eyebrow?: string;
  /** Figma `Large/Strong` (16/24/600) for Get started–style subtitles; default `Base/Normal`. */
  descriptionVariant?: 'base' | 'large-strong';
  /** Figma `Title/Heading 3` (24) for page titles; `heading4` reserved for card-level titles elsewhere. */
  titleVariant?: 'heading3' | 'heading4';
  /**
   * Primary flow actions (typically `size="large"` buttons) shown to the right of the title.
   * Table-scoped actions (filters, search, add row) stay above the table on each page.
   */
  actions?: ReactNode;
  /** Inline control beside the title (e.g. workspace edit icon — Figma `5080:16558`). */
  titleAddon?: ReactNode;
  /**
   * UX-003 module entry page title: `Title/Heading 2` in `colorText`, description `Large/Normal` in
   * `colorTextDescription`, `paddingXXS` gap. Overrides `titleVariant` and `descriptionVariant`.
   */
  entry?: boolean;
};

/** Page-level BOM headlines — Figma `Title/Heading 3` (24/32) on every screen of equal importance. */
export function BomPageHeader({
  title,
  description,
  eyebrow,
  descriptionVariant = 'base',
  titleVariant = 'heading3',
  actions,
  titleAddon,
  entry = false,
}: Props) {
  const { token } = theme.useToken();
  const titleTypography = entry
    ? hydraTitleHeading2
    : titleVariant === 'heading3'
      ? hydraTitleHeading3
      : hydraTitleHeading4;
  const titleLevel = entry ? 2 : titleVariant === 'heading3' ? 3 : 4;
  const descriptionStyle = entry
    ? { margin: 0, color: token.colorTextDescription, ...hydraTextStyleToReactCss(hydraLargeNormal) }
    : pageDescriptionStyle(token, descriptionVariant);

  const titleStack = (
    <Space
      orientation="vertical"
      size={entry ? token.paddingXXS : token.marginXS}
      style={{ minWidth: 0, width: actions ? undefined : '100%' }}
    >
      {eyebrow ? (
        <Typography.Text style={{ display: 'block', ...pageDescriptionStyle(token) }}>{eyebrow}</Typography.Text>
      ) : null}
      <Flex align="center" gap={token.marginXXS} wrap="wrap">
        <Typography.Title
          level={titleLevel}
          style={{
            margin: 0,
            ...(entry ? { color: token.colorText } : {}),
            ...hydraTextStyleToReactCss(titleTypography),
          }}
        >
          {title}
        </Typography.Title>
        {titleAddon}
      </Flex>
      {description ? (
        <Typography.Text style={{ display: 'block', ...descriptionStyle }}>
          {description}
        </Typography.Text>
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
