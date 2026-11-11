/**
 * Figma **Hydra Ant Design — DS** `Empty State Block` (page `❖ Empty State Block`).
 *
 * Token parity (Customize Theme → `theme.useToken()`):
 * - Root: centered column, gap `marginLG`, padding `marginXXL` block / `paddingLG` inline.
 * - Content: antd `Empty` (basic illustration), gap `margin`; text block gap `marginXS`:
 *   title `Title/Heading 3` + `colorText`, description `Base/Normal` + `colorTextDescription`.
 * - Actions: gap `paddingSM`; primary `Button` (large) + optional default `Button` (large).
 */
import type { CSSProperties, ReactNode } from 'react';

import { hydraBaseNormal, hydraTextStyleToReactCss, hydraTitleHeading3 } from '../theme/hydraTypography';
import { Button, Empty, Flex, Typography, theme } from 'antd';

export type EmptyStateBlockAction = {
  label: ReactNode;
  onClick?: () => void;
  icon?: ReactNode;
  disabled?: boolean;
};

export type EmptyStateBlockProps = {
  title: ReactNode;
  description?: ReactNode;
  /** Figma `show action` — primary CTA. */
  action?: EmptyStateBlockAction;
  /** Figma `show secondary action` — default button. */
  secondaryAction?: EmptyStateBlockAction;
  className?: string;
  style?: CSSProperties;
};

export function EmptyStateBlock({
  title,
  description,
  action,
  secondaryAction,
  className,
  style,
}: EmptyStateBlockProps) {
  const { token } = theme.useToken();

  return (
    <Flex
      vertical
      align="center"
      gap={token.marginLG}
      className={className}
      style={{
        boxSizing: 'border-box',
        width: '100%',
        paddingBlock: token.marginXXL,
        paddingInline: token.paddingLG,
        textAlign: 'center',
        ...style,
      }}
    >
      <Flex vertical align="center" gap={token.margin}>
        <Empty description={false} style={{ margin: 0 }} styles={{ image: { marginBottom: 0 } }} />
        <Flex vertical align="center" gap={token.marginXS}>
          <Typography.Title
            level={3}
            style={{ margin: 0, color: token.colorText, ...hydraTextStyleToReactCss(hydraTitleHeading3) }}
          >
            {title}
          </Typography.Title>
          {description != null ? (
            <Typography.Text
              style={{ color: token.colorTextDescription, ...hydraTextStyleToReactCss(hydraBaseNormal) }}
            >
              {description}
            </Typography.Text>
          ) : null}
        </Flex>
      </Flex>
      {action || secondaryAction ? (
        <Flex wrap justify="center" gap={token.paddingSM}>
          {action ? (
            <Button
              type="primary"
              size="large"
              icon={action.icon}
              disabled={action.disabled}
              onClick={action.onClick}
            >
              {action.label}
            </Button>
          ) : null}
          {secondaryAction ? (
            <Button
              size="large"
              icon={secondaryAction.icon}
              disabled={secondaryAction.disabled}
              onClick={secondaryAction.onClick}
            >
              {secondaryAction.label}
            </Button>
          ) : null}
        </Flex>
      ) : null}
    </Flex>
  );
}
