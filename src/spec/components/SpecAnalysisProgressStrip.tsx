import { Button, Flex, Progress, Typography, theme } from '../../ui/antd';
import {
  hydraBaseNormal,
  hydraLargeStrong,
  hydraTextStyleToReactCss,
} from '../../theme/hydraTypography';

type Props = {
  title: string;
  stepDetail: string;
  percent: number;
  /** Optional secondary line under the step detail (e.g. model-chosen division). */
  categoryLine?: string;
  actionLabel?: string;
  onAction?: () => void;
  /**
   * `shell-flush` — full-bleed under app breadcrumbs (BOM pending-uploads pattern).
   * `content` — inset strip inside page padding.
   */
  placement?: 'shell-flush' | 'content';
  flushAttachTop?: boolean;
  /** Inside a parent warning surface — no extra background or shadow. */
  nested?: boolean;
};

/**
 * Local SPEC analysis progress strip — mirrors `BomImportProgressStrip` chrome
 * (title + step detail + Progress + optional action) without editing that shared
 * component. BOM step labels are hard-coded there, so SPEC cannot reuse it as-is.
 */
export function SpecAnalysisProgressStrip({
  title,
  stepDetail,
  percent,
  categoryLine,
  actionLabel,
  onAction,
  placement = 'content',
  flushAttachTop = true,
  nested = false,
}: Props) {
  const { token } = theme.useToken();
  const isShellFlush = placement === 'shell-flush';
  const clamped = Math.max(0, Math.min(100, Math.round(percent)));

  const strip = (
    <Flex
      align="center"
      justify="space-between"
      gap={token.marginMD}
      wrap="nowrap"
      style={{
        width: '100%',
        paddingInline: nested ? 0 : token.paddingLG,
        paddingBlock: token.paddingSM,
        background: nested ? 'transparent' : token.colorWarningBg,
        borderRadius: nested || isShellFlush ? 0 : token.borderRadiusLG,
        boxShadow: nested ? undefined : token.boxShadowTertiary,
      }}
    >
      <Flex vertical gap={0} style={{ flex: '0 1 auto', minWidth: 0, maxWidth: '100%' }}>
        <Typography.Text
          strong
          style={{
            ...hydraTextStyleToReactCss(hydraLargeStrong),
            color: token.colorText,
          }}
        >
          {title}
        </Typography.Text>
        <Typography.Text type="secondary" style={hydraTextStyleToReactCss(hydraBaseNormal)}>
          {stepDetail}
        </Typography.Text>
        {categoryLine ? (
          <Typography.Text type="secondary" style={hydraTextStyleToReactCss(hydraBaseNormal)}>
            {categoryLine}
          </Typography.Text>
        ) : null}
      </Flex>

      <Flex align="center" gap={token.marginXS} style={{ flex: '1 1 200px', minWidth: 120, maxWidth: 360 }}>
        <Progress
          percent={clamped}
          showInfo
          size="default"
          strokeLinecap="round"
          strokeColor={token.colorPrimary}
          style={{ flex: 1, margin: 0, minWidth: 0 }}
          format={(value) => (
            <Typography.Text
              style={{
                ...hydraTextStyleToReactCss(hydraBaseNormal),
                color: token.colorText,
              }}
            >
              {value}%
            </Typography.Text>
          )}
        />
      </Flex>

      {onAction && actionLabel ? (
        <Button type="primary" onClick={onAction} style={{ flexShrink: 0 }}>
          {actionLabel}
        </Button>
      ) : null}
    </Flex>
  );

  if (!isShellFlush) {
    return strip;
  }

  return (
    <div
      style={{
        width: `calc(100% + ${token.paddingLG * 2}px)`,
        marginInline: `calc(-1 * ${token.paddingLG}px)`,
        marginTop: flushAttachTop ? `calc(-1 * ${token.paddingLG}px)` : 0,
        marginBottom: token.paddingLG,
      }}
    >
      {strip}
    </div>
  );
}
