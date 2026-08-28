import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';

import { confidenceLabel, confidenceShortLabel } from '../constants/specStatusVocabulary';
import type { SpecConfidenceBand } from '../data/types';
import { HydraTag, type HydraTagTone } from '../../ui/HydraTag';

function confidenceIcon(band: SpecConfidenceBand) {
  if (band === 'high') return <CheckCircleOutlined />;
  if (band === 'medium') return <ExclamationCircleOutlined />;
  return <CloseCircleOutlined />;
}

function toneFor(band: SpecConfidenceBand): HydraTagTone {
  if (band === 'high') return 'success';
  if (band === 'medium') return 'warning';
  return 'error';
}

export function SpecConfidenceTag({
  band,
  percent,
  showIcon = true,
  compact = false,
}: {
  band: SpecConfidenceBand;
  percent?: number;
  showIcon?: boolean;
  compact?: boolean;
}) {
  const base = compact ? confidenceShortLabel[band] : confidenceLabel[band];
  const label = percent != null && percent > 0 ? `${base} · ${percent}%` : base;
  return (
    <HydraTag tone={toneFor(band)} icon={showIcon ? confidenceIcon(band) : undefined}>
      {label}
    </HydraTag>
  );
}
