import type {
  BomItemConfidence,
  BomItemMatchStatus,
  BomMatchLineStatus,
  BomProjectStatus,
  AscSubstitutionRisk,
} from '../data/types';
import { HydraTag, type HydraTagTone } from '../../ui/HydraTag';
import { CheckCircleOutlined, CloseCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons';

const bomProjectStatusLabel: Record<BomProjectStatus, string> = {
  'in-progress': 'In Progress',
  completed: 'Ready',
  'needs-review': 'Needs Review',
  draft: 'Draft',
  failed: 'Failed',
  partial: 'Partial',
};

export function BomProjectStatusTag({ status }: { status: BomProjectStatus }) {
  const tone: HydraTagTone =
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
  return <HydraTag tone={tone}>{bomProjectStatusLabel[status]}</HydraTag>;
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
  const tone: HydraTagTone = confidence === 'high' ? 'success' : confidence === 'medium' ? 'warning' : 'error';
  return (
    <HydraTag tone={tone} icon={showIcon ? confidenceIcon(confidence) : undefined}>
      {confidenceLabel[confidence]}
    </HydraTag>
  );
}

const matchStatusLabel: Record<BomItemMatchStatus, string> = {
  confirmed: 'Confirmed',
  'needs-review': 'Needs Review',
  matched: 'Matched',
  pending: 'Pending',
};

export function BomMatchStatusTag({ status }: { status: BomItemMatchStatus }) {
  const tone: HydraTagTone =
    status === 'confirmed'
      ? 'success'
      : status === 'needs-review'
        ? 'warning'
        : status === 'matched'
          ? 'processing'
          : 'default';
  return <HydraTag tone={tone}>{matchStatusLabel[status]}</HydraTag>;
}

export function BomRiskTag({ risk }: { risk: AscSubstitutionRisk }) {
  const tone: HydraTagTone = risk === 'low' ? 'success' : risk === 'medium' ? 'warning' : 'error';
  return <HydraTag tone={tone}>{risk} risk</HydraTag>;
}

export function BomManualTag() {
  return <HydraTag tone="processing">Added manually</HydraTag>;
}

const lineStatusLabel: Record<BomMatchLineStatus, string> = {
  pending: 'Pending',
  accepted: 'Accepted',
  skipped: 'Skipped',
};

export function BomMatchLineStatusTag({ status }: { status: BomMatchLineStatus }) {
  const tone: HydraTagTone =
    status === 'accepted' ? 'success' : status === 'skipped' ? 'warning' : 'processing';
  return <HydraTag tone={tone}>{lineStatusLabel[status]}</HydraTag>;
}
