import { Button, Flex, Progress, Typography, theme } from '../../ui/antd';
import type { BomImportProgress } from '../data/types';
import {
  overallProgressPercent,
  stepIndex,
  stepLabel,
} from '../bomImportProgressState';
import {
  hydraBaseNormal,
  hydraBaseStrong,
  hydraLargeStrong,
  hydraTextStyleToReactCss,
} from '../../theme/hydraTypography';

type Props = {
  progress: BomImportProgress;
  /** Resume interrupted upload (workspace). Default: in-flow import pages. */
  variant?: 'active' | 'resume';
  onContinue?: () => void;
  /**
   * `shell-flush` — full-bleed under app breadcrumbs (Figma `4986:20039` / Alert `4986:20478`).
   * `content` — inset strip inside page padding.
   */
  placement?: 'shell-flush' | 'content';
  /** When multiple flush strips stack, only the first cancels shell content top padding. */
  flushAttachTop?: boolean;
  /** Inside a parent warning surface (e.g. Collapse body) — no extra background or shadow. */
  nested?: boolean;
};

/**
 * Import-flow progress strip (Figma BOM-SPEC Alert `4986:20478`).
 * Horizontal warning surface: title + step copy + Progress line (showInfo, round) + optional Continue.
 */
export function BomImportProgressStrip({
  progress,
  variant = 'active',
  onContinue,
  placement = 'content',
  flushAttachTop = true,
  nested = false,
}: Props) {
  const { token } = theme.useToken();
  const percent = overallProgressPercent(progress);
  const stepNum = Math.min(3, Math.max(1, stepIndex(progress.currentStep) + 1));
  const currentStepLabel = stepLabel(progress.currentStep);
  const isShellFlush = placement === 'shell-flush';

  const title =
    variant === 'resume'
      ? `Continue file upload process for "${progress.fileName}"?`
      : `Import in progress for "${progress.fileName}"`;

  const stepPrefix = variant === 'resume' ? 'Stopped at:' : 'Current step:';

  const strip = (
    <Flex
      align="center"
      gap={token.marginMD}
      wrap="wrap"
      style={{
        width: '100%',
        paddingInline: token.paddingLG,
        paddingBlock: token.paddingSM,
        background: nested ? 'transparent' : token.colorWarningBg,
        borderRadius: nested || isShellFlush ? 0 : token.borderRadiusLG,
        boxShadow: nested ? undefined : isShellFlush ? token.boxShadowTertiary : token.boxShadowSecondary,
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
        <Typography.Text style={hydraTextStyleToReactCss(hydraBaseNormal)}>
          <Typography.Text type="secondary" style={hydraTextStyleToReactCss(hydraBaseNormal)}>
            {stepPrefix}{' '}
          </Typography.Text>
          <Typography.Text
            style={{
              ...hydraTextStyleToReactCss(hydraBaseStrong),
              color: token.colorText,
            }}
          >
            {currentStepLabel}
          </Typography.Text>
          <Typography.Text type="secondary" style={hydraTextStyleToReactCss(hydraBaseNormal)}>
            {' '}
            · {stepNum} of 3 steps complete
          </Typography.Text>
        </Typography.Text>
      </Flex>

      <Flex align="center" gap={token.marginXS} style={{ flex: '1 1 200px', minWidth: 0 }}>
        <Progress
          percent={percent}
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

      {onContinue ? (
        <Button type="primary" onClick={onContinue} style={{ flexShrink: 0 }}>
          Continue
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
