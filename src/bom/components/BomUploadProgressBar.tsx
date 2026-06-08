import { hydraBaseNormal, hydraBaseStrong, hydraTextStyleToReactCss } from '../../theme/hydraTypography';
import { Flex, Steps, Tag, Typography, theme } from '../../ui/antd';

/** Figma Progress Bar `5102:15683` — shown on every BOM file upload flow step. */
export const BOM_UPLOAD_FLOW_STEPS = [
  { title: 'Map Columns' },
  { title: 'Review Parsed Rows' },
  { title: 'Match parts' },
] as const;

export type BomUploadFlowStepIndex = 0 | 1 | 2;

type BomUploadProgressBarProps = {
  fileName: string;
  currentStep: BomUploadFlowStepIndex;
  /** Right-side status tag (e.g. "11 of 13 fields mapped"). Omit to hide tag. */
  statusLabel?: string;
};

/**
 * Upload flow progress chrome — filename, 3-step indicator, optional status tag.
 * Mirror: Figma `5102:15683` (padding 12 vertical, indicator padding 24, gap 32, Steps size small).
 */
export function BomUploadProgressBar({ fileName, currentStep, statusLabel }: BomUploadProgressBarProps) {
  const { token } = theme.useToken();

  return (
    <Flex
      vertical
      style={{
        width: '100%',
        paddingBlock: token.paddingSM,
        borderRadius: token.borderRadiusLG,
        background: token.colorFillTertiary,
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
          current={currentStep}
          items={[...BOM_UPLOAD_FLOW_STEPS]}
          size="small"
          style={{ flex: 1, minWidth: 0 }}
        />
        {statusLabel ? (
          <Tag
            style={{
              margin: 0,
              flexShrink: 0,
              color: token.colorWarning,
              borderColor: token.colorWarningBorder,
              background: token.colorWarningBg,
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
