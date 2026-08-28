import { isoDaysAgo } from './specSeedHelpers';
import type { SpecGuideSpec } from './types';

export type SpecGuideSpecsFixtures = {
  guideSpecs: SpecGuideSpec[];
};

export const emptyGuideSpecsFixtures: SpecGuideSpecsFixtures = {
  guideSpecs: [],
};

/**
 * Organization guide-language library (PRD §10.12).
 * Available across scenarios so Get Specified is reachable from Spec Home.
 */
export function buildDefaultGuideSpecsFixtures(): SpecGuideSpecsFixtures {
  const guideSpecs: SpecGuideSpec[] = [
    {
      id: 'guide-asc-221116-materials',
      title: 'ASC Domestic Water — Materials (Approved)',
      division: '22',
      sectionNumber: '22 11 16',
      sectionTitle: 'Domestic Water Piping',
      productFamily: 'Copper & PEX piping',
      application: 'Commercial plumbing',
      jurisdiction: 'National (model)',
      approvalStatus: 'approved',
      insertPermission: 'allow',
      owner: 'ASC Guide Specs',
      version: 'GS-22.1.4',
      lastReviewedAt: isoDaysAgo(14),
      updatedAt: isoDaysAgo(7),
      content:
        'Approved ASC materials language for Type L copper and ASTM F876 PEX in domestic water systems.',
      adoptionPlaceholder: 'Adoption tracking comes later — placeholder only.',
      snippets: [
        {
          id: 'snip-materials-a',
          title: 'Materials — Type L / PEX',
          body: 'Copper tubing shall be Type L, hard drawn, conforming to ASTM B88. PEX tubing shall conform to ASTM F876 and be rated for the system working pressure.',
          suggestedLabel: '2.1.A',
          preferredBlockId: 'blk-clean-p1',
          preferredSectionId: 'sec-221116',
        },
      ],
    },
    {
      id: 'guide-asc-221116-pressure',
      title: 'ASC Domestic Water — Pressure rating (Approved)',
      division: '22',
      sectionNumber: '22 11 16',
      sectionTitle: 'Domestic Water Piping',
      productFamily: 'Copper & PEX piping',
      application: 'Commercial plumbing',
      jurisdiction: 'National (model)',
      approvalStatus: 'approved',
      insertPermission: 'allow',
      owner: 'ASC Guide Specs',
      version: 'GS-22.1.5',
      lastReviewedAt: isoDaysAgo(10),
      updatedAt: isoDaysAgo(3),
      content:
        'Approved ASC continuous working-pressure and field-test language. Prefer insert into 2.2.A; may renumber when a pending edit already occupies that clause.',
      adoptionPlaceholder: 'Adoption tracking comes later — placeholder only.',
      snippets: [
        {
          id: 'snip-pressure-a',
          title: 'Working pressure + test',
          body: 'Piping shall be rated for a minimum working pressure of 160 psi at 73°F continuous, and field-tested to 240 psi before concealment.',
          suggestedLabel: '2.2.B',
          preferredBlockId: 'blk-clean-p2',
          preferredSectionId: 'sec-221116',
        },
      ],
    },
    {
      id: 'guide-asc-221116-draft',
      title: 'ASC Joining methods (Draft)',
      division: '22',
      sectionNumber: '22 11 16',
      sectionTitle: 'Domestic Water Piping',
      productFamily: 'Fittings',
      application: 'Commercial plumbing',
      jurisdiction: 'National (model)',
      approvalStatus: 'draft',
      insertPermission: 'warn',
      owner: 'Jordan Lee',
      version: 'GS-22.0.9-draft',
      lastReviewedAt: isoDaysAgo(40),
      updatedAt: isoDaysAgo(1),
      content: 'Draft joining-method language — not yet approved for production inserts.',
      snippets: [
        {
          id: 'snip-join-draft',
          title: 'Joining — press / crimp',
          body: 'Join copper with soldered or press-connect fittings where listed; join PEX with manufacturer-approved crimp or expansion rings.',
          suggestedLabel: '3.1.B',
          preferredBlockId: 'blk-clean-p3',
          preferredSectionId: 'sec-221116',
        },
      ],
    },
    {
      id: 'guide-asc-230000-review',
      title: 'ASC HVAC hydronic — Isolation valves (In review)',
      division: '23',
      sectionNumber: '23 21 13',
      sectionTitle: 'Hydronic Piping',
      productFamily: 'Valves',
      application: 'HVAC hydronic',
      jurisdiction: 'California',
      approvalStatus: 'in-review',
      insertPermission: 'warn',
      owner: 'Sam Chen',
      version: 'GS-23.2.1-rc',
      lastReviewedAt: isoDaysAgo(5),
      updatedAt: isoDaysAgo(2),
      content: 'In-review isolation valve language pending guide-spec committee sign-off.',
      snippets: [
        {
          id: 'snip-valve-review',
          title: 'Isolation valves',
          body: 'Provide isolation valves at equipment connections and at the base of each riser.',
          suggestedLabel: '2.3.A',
        },
      ],
    },
    {
      id: 'guide-asc-221116-superseded',
      title: 'ASC Domestic Water — Legacy materials (Superseded)',
      division: '22',
      sectionNumber: '22 11 16',
      sectionTitle: 'Domestic Water Piping',
      productFamily: 'Copper piping',
      application: 'Commercial plumbing',
      jurisdiction: 'National (model)',
      approvalStatus: 'superseded',
      insertPermission: 'blocked',
      owner: 'ASC Guide Specs',
      version: 'GS-22.0.2',
      lastReviewedAt: isoDaysAgo(400),
      updatedAt: isoDaysAgo(90),
      content: 'Superseded by GS-22.1.4. Insert is blocked in the fixture permission.',
      snippets: [
        {
          id: 'snip-legacy-blocked',
          title: 'Legacy Type M copper',
          body: 'Copper tubing shall be Type M conforming to ASTM B88.',
          suggestedLabel: '2.1.A',
          preferredBlockId: 'blk-clean-p1',
          preferredSectionId: 'sec-221116',
        },
      ],
    },
  ];

  return { guideSpecs };
}
