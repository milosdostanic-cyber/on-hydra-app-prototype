import type { SpecProductSuggestion } from './types';

export type SpecProductsFixtures = {
  productSuggestions: SpecProductSuggestion[];
};

export const emptyProductsFixtures: SpecProductsFixtures = {
  productSuggestions: [],
};

export function buildClean22ProductsFixtures(): SpecProductsFixtures {
  const documentId = 'spec-clean-22';
  const sectionId = 'sec-221116';

  return {
    productSuggestions: [
      {
        id: 'prod-clean-1',
        documentId,
        sectionId,
        requirementId: 'req-clean-1',
        sku: 'ASC-PEX-F876-1',
        name: 'ASC PEX tubing — ASTM F876',
        series: 'AquaFlow',
        fit: 'strong',
        fitReason: 'Matches Type L / PEX material requirement and pressure rating.',
        confidence: 'high',
        confidencePercent: 92,
        attributeTags: ['PEX', 'ASTM F876', '160 psi'],
        commerciallyMotivated: true,
        status: 'suggested',
        citationIds: ['cit-clean-1'],
        equivalence: [
          {
            id: 'eq-clean-1-material',
            attribute: 'Material standard',
            specifiedValue: 'PEX conforming to ASTM F876',
            proposedValue: 'PEX conforming to ASTM F876',
            outcome: 'meets',
            citationId: 'cit-clean-1',
          },
          {
            id: 'eq-clean-1-pressure',
            attribute: 'Working pressure',
            specifiedValue: '160 psi at 73°F',
            proposedValue: '180 psi at 73°F',
            outcome: 'exceeds',
            note: 'Rated above the specified minimum.',
            citationId: 'cit-clean-2',
          },
          {
            id: 'eq-clean-1-joining',
            attribute: 'Joining method',
            specifiedValue: 'Crimp rings, manufacturer approved',
            proposedValue: 'Crimp and press-connect',
            outcome: 'meets',
            citationId: 'cit-clean-3',
          },
          {
            id: 'eq-clean-1-listing',
            attribute: 'Third-party listing',
            specifiedValue: 'NSF-61 potable water listing',
            proposedValue: 'NSF-61 listed; NSF-372 pending renewal',
            outcome: 'needs-review',
            note: 'Renewal certificate is dated after bid. Confirm with the engineer.',
          },
        ],
        savings: {
          materialLabel: 'About 6% lower material cost',
          labourLabel: 'About 1.5 h saved per 100 ft (crimp vs solder)',
          leadTimeLabel: '2 weeks earlier than the specified basis of design',
          basis: 'Indicative prototype figures from list pricing and published install rates. Not a quotation.',
        },
        attachments: [
          { id: 'att-clean-1-cut', title: 'AquaFlow PEX cut sheet', kind: 'cut-sheet', available: true },
          { id: 'att-clean-1-listing', title: 'NSF-61 listing certificate', kind: 'listing', available: true },
          {
            id: 'att-clean-1-test',
            title: 'Hydrostatic test report',
            kind: 'test-report',
            available: false,
            note: 'Not on file — request from ASC before submitting.',
          },
        ],
      },
      {
        id: 'prod-clean-2',
        documentId,
        sectionId,
        requirementId: 'req-clean-2',
        sku: 'ASC-CU-L-B88',
        name: 'ASC copper Type L — ASTM B88',
        series: 'CopperLine',
        fit: 'strong',
        fitReason: 'Copper Type L hard-drawn matches the extracted materials clause.',
        confidence: 'high',
        confidencePercent: 90,
        attributeTags: ['Copper Type L', 'ASTM B88'],
        commerciallyMotivated: true,
        status: 'suggested',
        citationIds: ['cit-clean-1'],
        equivalence: [
          {
            id: 'eq-clean-2-material',
            attribute: 'Material standard',
            specifiedValue: 'Copper Type L, hard drawn, ASTM B88',
            proposedValue: 'Copper Type L, hard drawn, ASTM B88',
            outcome: 'meets',
            citationId: 'cit-clean-1',
          },
          {
            id: 'eq-clean-2-pressure',
            attribute: 'Working pressure',
            specifiedValue: '160 psi at 73°F',
            proposedValue: '160 psi at 73°F',
            outcome: 'meets',
            citationId: 'cit-clean-2',
          },
          {
            id: 'eq-clean-2-size',
            attribute: 'Size range',
            specifiedValue: '½" through 4"',
            proposedValue: '½" through 3"',
            outcome: 'does-not-meet',
            note: 'The 4" size is not stocked in this series. A separate line is needed for 4" runs.',
          },
        ],
        savings: {
          materialLabel: 'No material saving — parity pricing',
          labourLabel: 'No labour change — same soldered joints',
          leadTimeLabel: 'In stock; same lead time',
          basis: 'Indicative prototype figures. Not a quotation.',
        },
        attachments: [
          { id: 'att-clean-2-cut', title: 'CopperLine Type L cut sheet', kind: 'cut-sheet', available: true },
          { id: 'att-clean-2-test', title: 'ASTM B88 mill certificate', kind: 'test-report', available: true },
        ],
      },
      {
        id: 'prod-clean-3',
        documentId,
        sectionId,
        requirementId: 'req-clean-3',
        sku: 'ASC-CRIMP-RING',
        name: 'ASC PEX crimp ring kit',
        fit: 'possible',
        fitReason: 'Supports crimped PEX joints; confirm ring size against pipe schedule.',
        confidence: 'medium',
        confidencePercent: 74,
        attributeTags: ['Crimp', 'PEX'],
        commerciallyMotivated: true,
        status: 'suggested',
        citationIds: ['cit-clean-3'],
        equivalence: [
          {
            id: 'eq-clean-3-joining',
            attribute: 'Joining method',
            specifiedValue: 'Manufacturer-approved crimp rings',
            proposedValue: 'Copper crimp rings, ASTM F2159 system',
            outcome: 'meets',
            citationId: 'cit-clean-3',
          },
          {
            id: 'eq-clean-3-size',
            attribute: 'Ring size range',
            specifiedValue: 'Match pipe schedule ½"–2"',
            proposedValue: '½"–1½" in the kit',
            outcome: 'needs-review',
            note: 'Confirm whether 2" runs exist on this project.',
          },
        ],
        attachments: [
          { id: 'att-clean-3-cut', title: 'Crimp ring kit cut sheet', kind: 'cut-sheet', available: true },
        ],
      },
    ],
  };
}

export function buildNoAscFitProductsFixtures(): SpecProductsFixtures {
  const documentId = 'spec-nofit-22';
  const sectionId = 'sec-nofit-221116';

  return {
    productSuggestions: [
      {
        id: 'prod-nofit-1',
        documentId,
        sectionId,
        sku: '—',
        name: 'No ASC product matches this requirement',
        fit: 'no-fit',
        fitReason:
          'Neutral analysis succeeded, but no ASC catalog item meets the proprietary material lock.',
        confidence: 'high',
        confidencePercent: 88,
        attributeTags: ['No match'],
        commerciallyMotivated: false,
        status: 'suggested',
        citationIds: ['cit-nofit-1'],
      },
    ],
  };
}
