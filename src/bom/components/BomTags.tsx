import type { BomItemConfidence, BomItemMatchStatus, BomProjectStatus, AscSubstitutionRisk } from '../data/types';
import { Tag, theme } from '../../ui/antd';
import { CheckCircleOutlined, CloseCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import type { CSSProperties } from 'react';
import { hydraBaseNormal } from '../../theme/hydraTypography';

type TagTone = 'default' | 'success' | 'warning' | 'error' | 'processing';

function dsTagColors(token: ReturnType<typeof theme.useToken>['token'], tone: TagTone) {
  if (tone === 'success') {
    return { background: token.colorSuccessBg, borderColor: token.colorSuccessBorder, textColor: token.colorSuccessText };
  }
  if (tone === 'warning') {
    return { background: token.colorWarningBg, borderColor: token.colorWarningBorder, textColor: token.colorWarningText };
  }
  if (tone === 'error') {
    return { background: token.colorErrorBg, borderColor: token.colorErrorBorder, textColor: token.colorErrorText };
  }
  if (tone === 'processing') {
    return { background: token.colorPrimaryBg, borderColor: token.colorPrimaryBorder, textColor: token.colorPrimaryText };
  }
  return {
    background: token.colorFillQuaternary,
    borderColor: token.colorBorder,
    textColor: token.colorText,
  };
}

function buildDsTagRootStyle(
  token: ReturnType<typeof theme.useToken>['token'],
  tone: TagTone,
): CSSProperties {
  const colors = dsTagColors(token, tone);
  return {
    marginInline: 0,
    marginBlock: 0,
    borderRadius: token.borderRadiusSM,
    paddingInline: token.paddingSM,
    paddingBlock: token.paddingXXS,
    fontSize: token.fontSizeSM,
    lineHeight: `${token.fontSizeSM * token.lineHeightSM}px`,
    fontWeight: hydraBaseNormal.fontWeight,
    borderWidth: token.lineWidth,
    borderStyle: token.lineType,
    borderColor: colors.borderColor,
    background: colors.background,
    color: colors.textColor,
    display: 'inline-flex',
    alignItems: 'center',
    gap: token.marginXXS,
  };
}

function buildDsTagIconStyle(
  token: ReturnType<typeof theme.useToken>['token'],
  tone: TagTone,
): CSSProperties {
  return {
    color: dsTagColors(token, tone).textColor,
    fontSize: token.fontSizeSM,
    lineHeight: `${token.fontSizeSM * token.lineHeightSM}px`,
  };
}

const bomProjectStatusLabel: Record<BomProjectStatus, string> = {
  'in-progress': 'In Progress',
  completed: 'Ready',
  'needs-review': 'Needs Review',
  draft: 'Draft',
  failed: 'Failed',
  partial: 'Partial',
};

export function BomProjectStatusTag({ status }: { status: BomProjectStatus }) {
  const { token } = theme.useToken();
  const tone: TagTone =
    status === 'completed'
      ? 'success'
      : status === 'needs-review'
        ? 'warning'
        : status === 'draft'
          ? 'default'
          : status === 'failed'
            ? 'error'
            : status === 'partial'
              ? 'warning'
              : 'processing';
  return (
    <Tag styles={{ root: buildDsTagRootStyle(token, tone), icon: buildDsTagIconStyle(token, tone) }}>
      {bomProjectStatusLabel[status]}
    </Tag>
  );
}

const confidenceLabel: Record<BomItemConfidence, string> = {
  high: 'High',
  medium: 'Medium',
  low: 'Low',
};

function confidenceIcon(confidence: BomItemConfidence) {
  if (confidence === 'high') return <CheckCircleOutlined />;
  if (confidence === 'medium') return <ExclamationCircleOutlined />;
  return <CloseCircleOutlined />;
}

export function BomConfidenceTag({
  confidence,
  showIcon = false,
}: {
  confidence: BomItemConfidence;
  showIcon?: boolean;
}) {
  const { token } = theme.useToken();
  const tone: TagTone = confidence === 'high' ? 'success' : confidence === 'medium' ? 'warning' : 'error';
  return (
    <Tag
      icon={showIcon ? confidenceIcon(confidence) : undefined}
      styles={{ root: buildDsTagRootStyle(token, tone), icon: buildDsTagIconStyle(token, tone) }}
    >
      {confidenceLabel[confidence]}
    </Tag>
  );
}

const matchStatusLabel: Record<BomItemMatchStatus, string> = {
  confirmed: 'Confirmed',
  'needs-review': 'Needs Review',
  matched: 'Matched',
  pending: 'Pending',
};

export function BomMatchStatusTag({ status }: { status: BomItemMatchStatus }) {
  const { token } = theme.useToken();
  const tone: TagTone =
    status === 'confirmed'
      ? 'success'
      : status === 'needs-review'
        ? 'warning'
        : status === 'matched'
          ? 'processing'
          : 'default';
  return (
    <Tag styles={{ root: buildDsTagRootStyle(token, tone), icon: buildDsTagIconStyle(token, tone) }}>
      {matchStatusLabel[status]}
    </Tag>
  );
}

export function BomRiskTag({ risk }: { risk: AscSubstitutionRisk }) {
  const { token } = theme.useToken();
  const tone: TagTone = risk === 'low' ? 'success' : risk === 'medium' ? 'warning' : 'error';
  return (
    <Tag styles={{ root: buildDsTagRootStyle(token, tone), icon: buildDsTagIconStyle(token, tone) }}>
      {risk} risk
    </Tag>
  );
}

export function BomManualTag() {
  const { token } = theme.useToken();
  return (
    <Tag styles={{ root: buildDsTagRootStyle(token, 'processing'), icon: buildDsTagIconStyle(token, 'processing') }}>
      Added manually
    </Tag>
  );
}
