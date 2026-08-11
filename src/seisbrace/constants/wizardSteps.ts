import type { CpMethod } from '../types';

export type WizardStepSlug =
  | 'seismic-design'
  | 'seismic-coefficient'
  | 'brace-type'
  | 'structure-sway-brace'
  | 'parts-selection';

export type WizardStepDef = {
  number: number;
  slug: WizardStepSlug;
  title: string;
  description: string;
};

/** Step order + titles mirrored from the ZIP `WizardStepType` registry. */
export const WIZARD_STEPS: WizardStepDef[] = [
  {
    number: 1,
    slug: 'seismic-design',
    title: 'Seismic Design Setup',
    description: 'Name the design and set the code, units, and load basis.',
  },
  {
    number: 2,
    slug: 'seismic-coefficient',
    title: 'Seismic Coefficient',
    description: 'Brace info and the seismic coefficient (Cp) calculation method.',
  },
  {
    number: 3,
    slug: 'brace-type',
    title: 'Brace Type',
    description: 'Brace orientation and the zone of influence.',
  },
  {
    number: 4,
    slug: 'structure-sway-brace',
    title: 'Structure & Sway Brace',
    description: 'Structure, fastener, and brace member selection.',
  },
  {
    number: 5,
    slug: 'parts-selection',
    title: 'Parts Selection',
    description: 'Swivel, structural attachment, and pipe attachment fittings.',
  },
];

export const WIZARD_STEP_BY_SLUG = new Map(WIZARD_STEPS.map((s) => [s.slug, s]));
export const WIZARD_STEP_BY_NUMBER = new Map(WIZARD_STEPS.map((s) => [s.number, s]));

/**
 * Representative Cp value for the prototype (no real seismic engine is ported). Method C uses the
 * manually-entered Cp; the rest derive a plausible value from their primary input.
 */
export function computeCp(method: CpMethod, inputs: Record<string, number | string>): number {
  const num = (key: string) => Number(inputs[key]) || 0;
  switch (method) {
    case 'C':
      return clampCp(num('cp'));
    case 'A':
    case 'B':
      return clampCp(0.4 + num('ss') * 0.1);
    case 'D':
    case 'E':
    case 'F':
      return clampCp(0.4 + num('ss') * 0.12 + num('z') * 0.0005);
    case 'G':
    case 'H':
      return clampCp(0.4 + num('sDs') * 0.15);
    default:
      return 0.4;
  }
}

function clampCp(value: number): number {
  if (!Number.isFinite(value) || value <= 0) return 0.4;
  return Math.round(Math.min(value, 4) * 100) / 100;
}
