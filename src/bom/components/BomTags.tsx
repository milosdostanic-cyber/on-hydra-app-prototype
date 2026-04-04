import type { BomItemConfidence, BomItemMatchStatus, BomProjectStatus, AscSubstitutionRisk } from '../data/types';
import { Tag } from '../../ui/antd';

export function BomProjectStatusTag({ status }: { status: BomProjectStatus }) {
  const color =
    status === 'completed'
      ? 'success'
      : status === 'needs-review'
        ? 'warning'
        : status === 'draft'
          ? 'default'
          : 'processing';
  return (
    <Tag color={color} style={{ margin: 0 }}>
      {status.replace('-', ' ')}
    </Tag>
  );
}

export function BomConfidenceTag({ confidence }: { confidence: BomItemConfidence }) {
  const color = confidence === 'high' ? 'success' : confidence === 'medium' ? 'warning' : 'error';
  return (
    <Tag color={color} style={{ margin: 0 }}>
      {confidence}
    </Tag>
  );
}

export function BomMatchStatusTag({ status }: { status: BomItemMatchStatus }) {
  const color =
    status === 'confirmed'
      ? 'success'
      : status === 'needs-review'
        ? 'warning'
        : status === 'matched'
          ? 'processing'
          : 'default';
  return (
    <Tag color={color} style={{ margin: 0 }}>
      {status.replace('-', ' ')}
    </Tag>
  );
}

export function BomRiskTag({ risk }: { risk: AscSubstitutionRisk }) {
  const color = risk === 'low' ? 'success' : risk === 'medium' ? 'warning' : 'error';
  return (
    <Tag color={color} style={{ margin: 0 }}>
      {risk} risk
    </Tag>
  );
}
