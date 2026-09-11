import type { SpecAlignmentDelta, SpecBaseline } from './types';

/** Review fixtures — baselines and fixture-declared deltas (no client-side diff). */
export type SpecReviewFixtures = {
  baselines: SpecBaseline[];
  deltas: SpecAlignmentDelta[];
};

export const emptyReviewFixtures: SpecReviewFixtures = {
  baselines: [],
  deltas: [],
};

/** Baselines for Clean Division 22 — office master + prior project. */
export function buildClean22ReviewFixtures(): SpecReviewFixtures {
  const documentId = 'spec-clean-22';
  const officeMasterId = 'base-clean-office';
  const priorId = 'base-clean-prior';
  const incompatibleId = 'base-clean-incompat';

  const baselines: SpecBaseline[] = [
    {
      id: officeMasterId,
      documentId,
      label: 'Office master — Div 22 (2024)',
      role: 'office-master',
      compatible: true,
    },
    {
      id: priorId,
      documentId,
      label: 'Prior project — Harbor Lofts',
      role: 'prior-project',
      compatible: true,
    },
    {
      id: incompatibleId,
      documentId,
      label: 'Division 23 HVAC master (wrong division)',
      role: 'office-master',
      compatible: false,
      incompatibilityReason:
        'This baseline is a different division. Choose a Division 22 baseline to compare section alignment.',
    },
  ];

  const deltas: SpecAlignmentDelta[] = [
    {
      id: 'delta-clean-1',
      documentId,
      baselineId: officeMasterId,
      sectionKey: '22 11 16',
      title: 'Domestic Water Piping — materials',
      category: 'matched',
      currentText: 'Copper Type L ASTM B88; PEX ASTM F876',
      baselineText: 'Copper Type L ASTM B88; PEX ASTM F876',
      note: 'Wording matches the office master.',
    },
    {
      id: 'delta-clean-2',
      documentId,
      baselineId: officeMasterId,
      sectionKey: '22 11 16',
      title: 'Domestic Water Piping — pressure',
      category: 'semantic',
      currentText: '160 psi at 73°F working pressure',
      baselineText: '150 psi at 73°F working pressure',
      note: 'Project raises working pressure from the office master.',
    },
    {
      id: 'delta-clean-3',
      documentId,
      baselineId: officeMasterId,
      sectionKey: '22 11 19',
      title: 'Domestic Water Piping Specialties',
      category: 'added',
      currentText: 'Product data for pipe, fittings, and valves',
      baselineText: '',
      note: 'Submittal obligation added in this project specification.',
    },
    {
      id: 'delta-clean-4',
      documentId,
      baselineId: priorId,
      sectionKey: '22 11 16',
      title: 'Joining methods',
      category: 'removed',
      currentText: '',
      baselineText: 'Grooved couplings permitted for copper above 2 inch.',
      note: 'Prior project allowed grooved couplings; this project does not.',
    },
    {
      id: 'delta-clean-5',
      documentId,
      baselineId: priorId,
      sectionKey: '22 40 00',
      title: 'Plumbing Fixtures',
      category: 'unmatched',
      currentText: '',
      baselineText: 'Section present in prior project only.',
      note: 'No matching section in the current document.',
    },
  ];

  return { baselines, deltas };
}

/** Full addendum-review scenario fixtures for baselines + deltas. */
export function buildAddendumReviewFixtures(): SpecReviewFixtures {
  const documentId = 'spec-addendum-22';
  const baseV1 = 'base-add-v1';
  const baseOffice = 'base-add-office';

  const baselines: SpecBaseline[] = [
    {
      id: baseV1,
      documentId,
      label: 'Project specification v1 (pre-addendum)',
      role: 'project-specification',
      compatible: true,
    },
    {
      id: baseOffice,
      documentId,
      label: 'Office master — Div 22',
      role: 'office-master',
      compatible: true,
    },
  ];

  const deltas: SpecAlignmentDelta[] = [
    {
      id: 'delta-add-1',
      documentId,
      baselineId: baseV1,
      sectionKey: '22 11 16',
      title: 'Materials — CPVC added',
      category: 'added',
      currentText: 'Copper Type L ASTM B88; PEX ASTM F876; CPVC ASTM D2846 where permitted.',
      baselineText: 'Copper Type L ASTM B88; PEX ASTM F876.',
      note: 'Addendum A adds CPVC as an allowed material.',
    },
    {
      id: 'delta-add-2',
      documentId,
      baselineId: baseV1,
      sectionKey: '22 11 16',
      title: 'Working pressure raised',
      category: 'semantic',
      currentText: '200 psi at 73°F working pressure',
      baselineText: '160 psi at 73°F working pressure',
      note: 'Addendum raises working pressure.',
    },
    {
      id: 'delta-add-3',
      documentId,
      baselineId: baseV1,
      sectionKey: '22 11 16',
      title: 'Sole-source language removed',
      category: 'removed',
      currentText: '',
      baselineText: 'Provide products of Manufacturer X only.',
      note: 'Proprietary lock-in removed by addendum.',
    },
    {
      id: 'delta-add-4',
      documentId,
      baselineId: baseV1,
      sectionKey: '22 11 19',
      title: 'Specialties — still aligned',
      category: 'matched',
      currentText: 'Valves shall be bronze, rising stem.',
      baselineText: 'Valves shall be bronze, rising stem.',
    },
    {
      id: 'delta-add-5',
      documentId,
      baselineId: baseOffice,
      sectionKey: '22 05 00',
      title: 'Common Work Results',
      category: 'unmatched',
      currentText: '',
      baselineText: 'Present in office master; not in this addendum package.',
      note: 'Section exists only in the office master baseline.',
    },
  ];

  return { baselines, deltas };
}
