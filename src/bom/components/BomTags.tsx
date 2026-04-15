import type { BomItemConfidence, BomItemMatchStatus, BomProjectStatus, AscSubstitutionRisk } from '../data/types';
import { Tag, theme } from '../../ui/antd';

const bomProjectStatusLabel: Record<BomProjectStatus, string> = {
  'in-progress': 'In Progress',
  completed: 'Completed',
  'needs-review': 'Needs Review',
  draft: 'Draft',
  failed: 'Failed',
  partial: 'Partial',
};

export function BomProjectStatusTag({ status }: { status: BomProjectStatus }) {
  const { token } = theme.useToken();
  const color =
    status === 'completed'
      ? 'success'
      : status === 'needs-review'
        ? 'warning'
        : status === 'draft'
          ? 'default'
          : status === 'failed'
            ? 'error'
            : status === 'partial'
              ? 'orange'
              : 'processing';
  return (
    <Tag
      color={color}
      variant="outlined"
      styles={{
        root: {
          marginInline: 0,
          marginBlock: 0,
          borderRadius: token.borderRadiusSM,
        },
      }}
    >
      {bomProjectStatusLabel[status]}
    </Tag>
  );
}

const confidenceLabel: Record<BomItemConfidence, string> = {
  high: 'High',
  medium: 'Medium',
  low: 'Low',
};

export function BomConfidenceTag({ confidence }: { confidence: BomItemConfidence }) {
  const { token } = theme.useToken();
  const color = confidence === 'high' ? 'success' : confidence === 'medium' ? 'warning' : 'error';
  return (
    <Tag
      color={color}
      styles={{
        root: {
          marginInline: 0,
          marginBlock: 0,
          borderRadius: token.borderRadiusSM,
        },
      }}
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
  const color =
    status === 'confirmed'
      ? 'success'
      : status === 'needs-review'
        ? 'warning'
        : status === 'matched'
          ? 'processing'
          : 'default';
  return (
    <Tag
      color={color}
      variant="outlined"
      styles={{
        root: {
          marginInline: 0,
          marginBlock: 0,
          borderRadius: token.borderRadiusSM,
        },
      }}
    >
      {matchStatusLabel[status]}
    </Tag>
  );
}

export function BomRiskTag({ risk }: { risk: AscSubstitutionRisk }) {
  const { token } = theme.useToken();
  const color = risk === 'low' ? 'success' : risk === 'medium' ? 'warning' : 'error';
  return (
    <Tag
      color={color}
      styles={{
        root: {
          marginInline: 0,
          marginBlock: 0,
          borderRadius: token.borderRadiusSM,
        },
      }}
    >
      {risk} risk
    </Tag>
  );
}
