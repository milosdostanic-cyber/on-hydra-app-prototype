import { hydraBaseNormal, hydraBaseStrong, hydraTextStyleToReactCss } from '../../theme/hydraTypography';
import { Flex, Steps, Tag, Typography, theme } from '../../ui/antd';

/** Figma Progress Bar `5102:15683` — shown on every BOM file upload flow step. */
export const BOM_UPLOAD_FLOW_STEPS = [
  { title: 'Link your columns' },
  { title: 'Check your file' },
  { title: 'Match your parts' },
] as const;

export type BomUploadFlowStepIndex = 0 | 1 | 2;

export type BomUploadProgressStatusTone = 'warning' | 'success';

type BomUploadProgressBarProps = {
  fileName: string;
  currentStep: BomUploadFlowStepIndex;
  /** Step-specific status tag — mapping: fields mapped; parsing: items ready; matching: parts reviewed. Omit to hide. */
  statusLabel?: string;
  /** Tag chrome — warning for in-progress mapping; success when all lines reviewed (`5204:211018`). */
  statusTone?: BomUploadProgressStatusTone;
  /** All three steps show finished checkmarks (matching complete — Figma `5204:211018`). */
  stepsComplete?: boolean;
};

/**
 * Upload flow progress chrome — filename, 3-step indicator, optional status tag.
 * Mirror: Figma `5102:15683` / complete matching `5204:211018`.
 */
export function BomUploadProgressBar({
  fileName,
  currentStep,
  statusLabel,
  statusTone = 'warning',
  stepsComplete = false,
}: BomUploadProgressBarProps) {
  const { token } = theme.useToken();
  const stepsCurrent = stepsComplete ? BOM_UPLOAD_FLOW_STEPS.length : currentStep;
  const tagColors =
    statusTone === 'success'
      ? {
          color: token.colorSuccessText,
          borderColor: token.colorSuccessBorder,
          background: token.colorSuccessBg,
        }
      : {
          color: token.colorWarningText,
          borderColor: token.colorWarningBorderHover,
          background: token.colorBgContainer,
        };

  return (
    <Flex
      vertical
      style={{
        width: '100%',
        paddingBlock: token.paddingSM,
        borderRadius: token.borderRadiusLG,
        background: token.colorWarningBg,
        border: `${token.lineWidth}px ${token.lineType} ${token.colorWarningBorder}`,
      }}
    >
      <Flex
        align="center"
        gap={token.marginXL}
        style={{ width: '100%', paddingInline: token.paddingLG }}
      >
        <Typography.Text
          strong
          style={{ ...hydraTextStyleToReactCss(hydraBaseStrong), flexShrink: 0 }}
        >
          {fileName}
        </Typography.Text>
        <Steps
          current={stepsCurrent}
          items={[...BOM_UPLOAD_FLOW_STEPS]}
          size="small"
          style={{ flex: 1, minWidth: 0 }}
        />
        {statusLabel ? (
          <Tag
            style={{
              margin: 0,
              flexShrink: 0,
              ...tagColors,
              borderRadius: token.borderRadiusSM,
              paddingInline: token.paddingSM,
              paddingBlock: token.paddingXXS,
              ...hydraTextStyleToReactCss(hydraBaseNormal),
            }}
          >
            {statusLabel}
          </Tag>
        ) : null}
      </Flex>
    </Flex>
  );
}
