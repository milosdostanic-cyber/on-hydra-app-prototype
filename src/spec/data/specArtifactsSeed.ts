import { isoDaysAgo } from './specSeedHelpers';
import type {
  SpecSubmittalObligation,
  SpecSubmittalPackage,
  SpecSubstitutionRequest,
} from './types';

export type SpecArtifactsFixtures = {
  submittalObligations: SpecSubmittalObligation[];
  submittalPackages: SpecSubmittalPackage[];
  substitutionRequests: SpecSubstitutionRequest[];
};

export const emptyArtifactsFixtures: SpecArtifactsFixtures = {
  submittalObligations: [],
  submittalPackages: [],
  substitutionRequests: [],
};

export function buildClean22ArtifactsFixtures(): SpecArtifactsFixtures {
  const documentId = 'spec-clean-22';
  const sectionId = 'sec-221116';
  const pkgId = 'pkg-clean-1';

  return {
    submittalObligations: [
      {
        id: 'obl-clean-1',
        documentId,
        sectionId,
        requirementId: 'req-clean-4',
        title: 'Product data — pipe, fittings, and valves',
        description: 'Submit manufacturer product data for domestic water piping materials.',
        dueLabel: 'Before rough-in',
        status: 'in-package',
        packageId: pkgId,
        missingDocuments: false,
      },
      {
        id: 'obl-clean-2',
        documentId,
        sectionId,
        title: 'Shop drawings — joining methods',
        description: 'Detail soldered and crimped joint procedures for review.',
        dueLabel: 'With product data',
        status: 'open',
        missingDocuments: true,
      },
      {
        id: 'obl-clean-3',
        documentId,
        sectionId,
        title: 'Test reports — pressure',
        description: 'Provide factory or field test reports confirming 160 psi working pressure.',
        status: 'open',
        missingDocuments: false,
      },
    ],
    submittalPackages: [
      {
        id: pkgId,
        documentId,
        name: 'Div 22 — Domestic water product data',
        createdAt: isoDaysAgo(1),
        updatedAt: isoDaysAgo(0),
        items: [
          {
            id: 'pkgitem-1',
            obligationId: 'obl-clean-1',
            title: 'Product data — pipe, fittings, and valves',
          },
        ],
      },
    ],
    substitutionRequests: [
      {
        id: 'subreq-clean-1',
        documentId,
        title: 'Domestic water piping — ASC equals',
        status: 'draft',
        notes: 'Draft from selected ASC suggestions. Preview before sharing with the engineer.',
        updatedAt: isoDaysAgo(0),
        lines: [],
      },
    ],
  };
}

export function buildNoAscFitArtifactsFixtures(): SpecArtifactsFixtures {
  const documentId = 'spec-nofit-22';
  const sectionId = 'sec-nofit-221116';

  return {
    submittalObligations: [
      {
        id: 'obl-nofit-1',
        documentId,
        sectionId,
        title: 'Product data — proprietary material',
        description: 'Submit data for the specified proprietary material system.',
        status: 'open',
        missingDocuments: true,
      },
    ],
    submittalPackages: [],
    substitutionRequests: [
      {
        id: 'subreq-nofit-1',
        documentId,
        title: 'Request equal — no ASC catalog fit',
        status: 'draft',
        notes: 'Use Ask an Engineer if a catalog equal cannot be proposed.',
        updatedAt: isoDaysAgo(0),
        lines: [],
      },
    ],
  };
}
