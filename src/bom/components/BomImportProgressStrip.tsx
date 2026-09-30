import { Button, Flex, Progress, Typography, theme } from '../../ui/antd';
import type { BomImportProgress } from '../data/types';
import {
  overallProgressPercent,
  stepIndex,
  stepLabel,
} from '../bomImportProgressState';
import {
  hydraBaseNormal,
  hydraSubtitleLarge,
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

  const stepDetail =
    variant === 'resume'
      ? `Continue from: ${currentStepLabel} · Step ${stepNum} of 3`
      : `Current step: ${currentStepLabel} · ${stepNum} of 3 steps complete`;

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
          style={{
            ...hydraTextStyleToReactCss(hydraSubtitleLarge),
            color: token.colorText,
          }}
        >
          {title}
        </Typography.Text>
        <Typography.Text type="secondary" style={hydraTextStyleToReactCss(hydraBaseNormal)}>
          {stepDetail}
        </Typography.Text>
      </Flex>

      <Flex align="center" gap={token.marginXS} style={{ flex: '1 1 200px', minWidth: 120, maxWidth: 360 }}>
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
          Continue upload
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
