import type { BadgeProps } from 'antd';

import {
  deriveReviewDisplayStatus,
  reviewDisplayStatusLabel,
  type BomReviewDisplayStatus,
} from '../bomMatchingReviewStatus';
import type {
  BomItemConfidence,
  BomItemMatchStatus,
  BomMatchLineStatus,
  BomMatchResult,
  BomProjectStatus,
  AscSubstitutionRisk,
} from '../data/types';
import { bomProjectStatusDescription } from '../bomProjectStatus';
import { HydraTag, type HydraTagTone } from '../../ui/HydraTag';
import { Badge, Tooltip } from '../../ui/antd';
import { CheckCircleOutlined, CloseCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { hydraBaseNormal, hydraTextStyleToReactCss } from '../../theme/hydraTypography';

type AntBadgeStatus = NonNullable<BadgeProps['status']>;

/** Figma DS `Badge__Status` — antd status dot + label. */
export function BomStatusBadge({ status, text }: { status: AntBadgeStatus; text: string }) {
  return <Badge status={status} text={text} />;
}

const bomProjectStatusLabel: Record<BomProjectStatus, string> = {
  ready: 'Ready',
  'needs-review': 'Needs Review',
};

function bomProjectBadgeStatus(status: BomProjectStatus): AntBadgeStatus {
  if (status === 'ready') return 'success';
  return 'warning';
}

export function BomProjectStatusTag({ status }: { status: BomProjectStatus }) {
  return (
    <Tooltip title={bomProjectStatusDescription(status)}>
      <span>
        <BomStatusBadge status={bomProjectBadgeStatus(status)} text={bomProjectStatusLabel[status]} />
      </span>
    </Tooltip>
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
  percent,
  bandWithPercent = false,
  size = 'sm',
}: {
  confidence: BomItemConfidence;
  showIcon?: boolean;
  /** When set, renders percent only, or "High · 94%" when `bandWithPercent`. */
  percent?: number;
  bandWithPercent?: boolean;
  /** `base` uses 14px (Figma Base/Normal); default `sm` keeps compact table tags. */
  size?: 'sm' | 'base';
}) {
  const tone: HydraTagTone = confidence === 'high' ? 'success' : confidence === 'medium' ? 'warning' : 'error';
  const label =
    percent != null && percent > 0
      ? bandWithPercent
        ? `${confidenceLabel[confidence]} · ${percent}%`
        : `${percent}%`
      : confidenceLabel[confidence];
  return (
    <HydraTag
      tone={tone}
      icon={showIcon ? confidenceIcon(confidence) : undefined}
      style={size === 'base' ? hydraTextStyleToReactCss(hydraBaseNormal) : undefined}
    >
      {label}
    </HydraTag>
  );
}

const matchLevelTooltip: Record<'figure' | 'sku', string> = {
  figure:
    'Matched at the product family (figure) level — pick the exact sellable SKU before saving this line',
  sku: 'Exact sellable part — ready to add to your workspace',
};

export function BomMatchLevelTag({ level }: { level: 'figure' | 'sku' | 'none' }) {
  if (level === 'none') return null;
  const label = level === 'figure' ? 'Product family' : 'Exact product';
  return (
    <Tooltip title={matchLevelTooltip[level]}>
      <span>
        <HydraTag tone={level === 'figure' ? 'processing' : 'success'}>{label}</HydraTag>
      </span>
    </Tooltip>
  );
}

const matchStatusLabel: Record<BomItemMatchStatus, string> = {
  confirmed: 'Confirmed',
  'needs-review': 'Needs Review',
  matched: 'Matched',
  pending: 'Pending',
};

function workspaceMatchBadgeStatus(status: BomItemMatchStatus): AntBadgeStatus {
  if (status === 'confirmed') return 'success';
  if (status === 'needs-review') return 'warning';
  if (status === 'matched') return 'processing';
  return 'default';
}

export function BomMatchStatusTag({ status }: { status: BomItemMatchStatus }) {
  return (
    <BomStatusBadge status={workspaceMatchBadgeStatus(status)} text={matchStatusLabel[status]} />
  );
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

function matchLineBadgeStatus(status: BomMatchLineStatus): AntBadgeStatus {
  if (status === 'accepted') return 'success';
  if (status === 'skipped') return 'warning';
  return 'processing';
}

export function BomMatchLineStatusTag({ status }: { status: BomMatchLineStatus }) {
  return <BomStatusBadge status={matchLineBadgeStatus(status)} text={lineStatusLabel[status]} />;
}

function reviewDisplayBadgeStatus(status: BomReviewDisplayStatus): AntBadgeStatus {
  if (status === 'confirmed' || status === 'chosen') return 'success';
  if (status === 'skipped') return 'warning';
  if (status === 'unresolved' || status === 'needs-sku') return 'error';
  return 'processing';
}

/** Derived guided-review status for matching summary table rows. */
export function BomReviewDisplayStatusTag({ row }: { row: BomMatchResult }) {
  const status = deriveReviewDisplayStatus(row);
  return (
    <BomStatusBadge
      status={reviewDisplayBadgeStatus(status)}
      text={reviewDisplayStatusLabel[status]}
    />
  );
}
