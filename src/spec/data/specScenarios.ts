/**
 * PRD §12.2 — named demo scenarios. Selecting one reseeds the mock store so a
 * reviewer can reach a specific state without clicking through the whole flow.
 *
 * Scenarios beyond the I0/I1 slice are declared here with `availableFrom` set to a
 * later increment so the demo drawer can list them honestly instead of hiding them.
 */
export type SpecScenarioId =
  | 'clean-division-22'
  | 'proprietary-division-23'
  | 'scanned-division-21'
  | 'large-project-manual'
  | 'contradictory-requirements'
  | 'failed-processing'
  | 'empty-project-first-onboarding'
  | 'addendum-review'
  | 'no-asc-fit'
  | 'async-deliver-back'
  | 'restricted-external-reviewer';

export type SpecIncrement = 'I1' | 'I2' | 'I3' | 'I4';

export type SpecScenario = {
  id: SpecScenarioId;
  label: string;
  purpose: string;
  availableFrom: SpecIncrement;
};

export const SPEC_SCENARIOS: SpecScenario[] = [
  {
    id: 'clean-division-22',
    label: 'Clean Division 22',
    purpose: 'Successful processing, high-confidence extraction, several citations, no critical risk.',
    availableFrom: 'I1',
  },
  {
    id: 'proprietary-division-23',
    label: 'Proprietary Division 23',
    purpose: 'Sole-source and no-substitution language with a competitor basis of design.',
    availableFrom: 'I1',
  },
  {
    id: 'scanned-division-21',
    label: 'Scanned Division 21',
    purpose: 'OCR warnings, approximate citations, low-confidence requirements to correct.',
    availableFrom: 'I1',
  },
  {
    id: 'large-project-manual',
    label: 'Large project manual',
    purpose: '1,000+ pages, background processing, partial sections, nonblocking navigation.',
    availableFrom: 'I1',
  },
  {
    id: 'contradictory-requirements',
    label: 'Contradictory requirements',
    purpose: 'Conflicting pressure and joining-method requirements across sections.',
    availableFrom: 'I1',
  },
  {
    id: 'failed-processing',
    label: 'Failed processing',
    purpose: 'Recoverable processing failure and retry without duplicating the document.',
    availableFrom: 'I1',
  },
  {
    id: 'empty-project-first-onboarding',
    label: 'Empty — first use',
    purpose: 'No projects or specifications. Walk the whole project-first path from scratch.',
    availableFrom: 'I1',
  },
  {
    id: 'addendum-review',
    label: 'Addendum review',
    purpose: 'Version/addendum baseline with matched, added, removed, and semantic deltas.',
    availableFrom: 'I2',
  },
  {
    id: 'no-asc-fit',
    label: 'No ASC fit',
    purpose: 'Neutral analysis succeeds but no suitable ASC product exists.',
    availableFrom: 'I3',
  },
  {
    id: 'async-deliver-back',
    label: 'Deliver-Back exchange',
    purpose: 'Request, engineering work, delivered artifact, revision request, accepted version.',
    availableFrom: 'I4',
  },
  {
    id: 'restricted-external-reviewer',
    label: 'Restricted external reviewer',
    purpose: 'Comment-only external access with blocked edit and approval actions.',
    availableFrom: 'I4',
  },
];

export const DEFAULT_SPEC_SCENARIO: SpecScenarioId = 'clean-division-22';

export function specScenarioById(id: SpecScenarioId): SpecScenario | undefined {
  return SPEC_SCENARIOS.find((s) => s.id === id);
}

/** Scenarios whose fixtures exist in the current build. */
export function isScenarioImplemented(scenario: SpecScenario): boolean {
  return (
    scenario.availableFrom === 'I1' ||
    scenario.availableFrom === 'I2' ||
    scenario.availableFrom === 'I3' ||
    scenario.availableFrom === 'I4'
  );
}
