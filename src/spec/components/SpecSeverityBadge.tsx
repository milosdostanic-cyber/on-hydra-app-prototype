import { severityLabel } from '../constants/specStatusVocabulary';
import type { SpecSeverity } from '../data/types';
import { HydraTag, type HydraTagTone } from '../../ui/HydraTag';

function toneFor(severity: SpecSeverity): HydraTagTone {
  if (severity === 'critical') return 'error';
  if (severity === 'major') return 'warning';
  if (severity === 'minor') return 'processing';
  return 'default';
}

/** Severity always includes a text label (PRD AC-040). */
export function SpecSeverityBadge({ severity }: { severity: SpecSeverity }) {
  return <HydraTag tone={toneFor(severity)}>{severityLabel[severity]}</HydraTag>;
}
