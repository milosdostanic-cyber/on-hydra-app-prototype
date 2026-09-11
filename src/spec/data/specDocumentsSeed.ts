import type { SpecScenarioId } from './specScenarios';
import { buildAscSubstitutionSuggestions } from './specAscSubstitutionSeed';
import {
  buildAddendumEditorFixtures,
  buildClean22EditorFixtures,
  emptyEditorFixtures,
  type SpecEditorFixtures,
} from './specEditorSeed';
import {
  buildClean22ArtifactsFixtures,
  buildNoAscFitArtifactsFixtures,
  emptyArtifactsFixtures,
  type SpecArtifactsFixtures,
} from './specArtifactsSeed';
import {
  buildAsyncDeliverBackCollaborationFixtures,
  buildClean22CollaborationFixtures,
  buildNoAscFitCollaborationFixtures,
  buildRestrictedExternalCollaborationFixtures,
  emptyCollaborationFixtures,
  type SpecCollaborationFixtures,
} from './specCollaborationSeed';
import {
  buildClean22ProductsFixtures,
  buildNoAscFitProductsFixtures,
  emptyProductsFixtures,
  type SpecProductsFixtures,
} from './specProductsSeed';
import {
  buildAddendumReviewFixtures,
  buildClean22ReviewFixtures,
  emptyReviewFixtures,
  type SpecReviewFixtures,
} from './specReviewSeed';
import {
  buildDefaultGuideSpecsFixtures,
  emptyGuideSpecsFixtures,
  type SpecGuideSpecsFixtures,
} from './specGuideSpecsSeed';
import {
  buildSpecPortfolio,
  buildDocumentAnalysisFromSectionSeeds,
  getSectionCatalogForSystemType,
} from './specPortfolioSeed';
import { expandSpecDocumentBodies } from './specDocumentBodySeed';
import { failedStages, isoDaysAgo, processingAt, readyStages } from './specSeedHelpers';
import type {
  SpecCitation,
  SpecCorrection,
  SpecDocument,
  SpecDocumentBlock,
  SpecRedFlag,
  SpecRequirement,
  SpecSection,
  SpecSectionSummary,
  SpecSeverity,
  SpecSystemType,
} from './types';

/**
 * ASC Master SPEC catalog — single source for M02 (Download ASC Master SPEC) and
 * W01/W02 step 2 (Confirm Master SPEC). Division numbers mirror
 * `specStatusVocabulary.systemTypeDivision`.
 */
export type SpecAscMasterCatalogEntry = {
  systemType: SpecSystemType;
  division: string;
  label: string;
  currentVersion: string;
  /**
   * One published version per master (Matt #23). Kept as a one-element array so
   * frozen modals that still map `availableVersions` compile without edits (§9a).
   */
  availableVersions: string[];
};

export const SPEC_MASTER_CATALOG: SpecAscMasterCatalogEntry[] = [
  {
    systemType: 'fire-protection',
    division: '21',
    label: 'ASC Fire Protection Master',
    currentVersion: '2026.3',
    availableVersions: ['2026.3'],
  },
  {
    systemType: 'plumbing',
    division: '22',
    label: 'ASC Plumbing Master',
    currentVersion: '2026.2',
    availableVersions: ['2026.2'],
  },
  {
    systemType: 'hvac',
    division: '23',
    label: 'ASC HVAC Master',
    currentVersion: '2026.1',
    availableVersions: ['2026.1'],
  },
];

export function specMasterCatalogEntry(systemType: SpecSystemType): SpecAscMasterCatalogEntry {
  return SPEC_MASTER_CATALOG.find((entry) => entry.systemType === systemType) ?? SPEC_MASTER_CATALOG[0];
}

/** Analysis / library fixtures (I1). Editor + review bags are merged in `buildScenarioFixtures`. */
export type SpecCoreFixtures = {
  documents: SpecDocument[];
  sections: SpecSection[];
  summaries: SpecSectionSummary[];
  requirements: SpecRequirement[];
  redFlags: SpecRedFlag[];
  citations: SpecCitation[];
  blocks: SpecDocumentBlock[];
  corrections: SpecCorrection[];
};

/** Full fixture bag for one demo scenario. */
export type SpecScenarioFixtures = SpecCoreFixtures &
  SpecEditorFixtures &
  SpecReviewFixtures &
  SpecProductsFixtures &
  SpecArtifactsFixtures &
  SpecCollaborationFixtures &
  SpecGuideSpecsFixtures;

const emptyCore: SpecCoreFixtures = {
  documents: [],
  sections: [],
  summaries: [],
  requirements: [],
  redFlags: [],
  citations: [],
  blocks: [],
  corrections: [],
};

const empty: SpecScenarioFixtures = {
  ...emptyCore,
  ...emptyEditorFixtures,
  ...emptyReviewFixtures,
  ...emptyProductsFixtures,
  ...emptyArtifactsFixtures,
  ...emptyCollaborationFixtures,
  ...emptyGuideSpecsFixtures,
};

function expandCoreFixtures(core: SpecCoreFixtures): SpecCoreFixtures {
  if (core.sections.length === 0 || core.blocks.length === 0) return core;
  const expanded = expandSpecDocumentBodies({
    sections: core.sections,
    blocks: core.blocks,
    citations: core.citations,
  });
  return { ...core, ...expanded };
}

function assemble(
  core: SpecCoreFixtures,
  editor: SpecEditorFixtures = emptyEditorFixtures,
  review: SpecReviewFixtures = emptyReviewFixtures,
  products: SpecProductsFixtures = emptyProductsFixtures,
  artifacts: SpecArtifactsFixtures = emptyArtifactsFixtures,
  collaboration: SpecCollaborationFixtures = emptyCollaborationFixtures,
  guideSpecs: SpecGuideSpecsFixtures = buildDefaultGuideSpecsFixtures(),
): SpecScenarioFixtures {
  const expandedCore = expandCoreFixtures(core);
  const withSubstitutions: SpecProductsFixtures = {
    productSuggestions: [
      ...products.productSuggestions,
      ...buildAscSubstitutionSuggestions({
        documents: expandedCore.documents,
        requirements: expandedCore.requirements,
        redFlags: expandedCore.redFlags,
        citations: expandedCore.citations,
        existing: products.productSuggestions,
      }),
    ],
  };
  return {
    ...expandedCore,
    ...editor,
    ...review,
    ...withSubstitutions,
    ...artifacts,
    ...collaboration,
    ...guideSpecs,
  };
}

const SEVERITY_RANK: Record<SpecSeverity, number> = {
  critical: 4,
  major: 3,
  minor: 2,
  info: 1,
};

/** Appends division catalog sections after existing featured sections (richer TOC). */
function appendCatalogSections(
  core: SpecCoreFixtures,
  systemType: SpecSystemType,
  options: { skipSectionNumbers?: string[]; scanned?: boolean } = {},
): SpecCoreFixtures {
  const document = core.documents[0];
  if (!document) return core;

  const skip = new Set(options.skipSectionNumbers ?? []);
  const additionalSeeds = getSectionCatalogForSystemType(systemType).filter(
    (seed) => !skip.has(seed.number),
  );
  if (additionalSeeds.length === 0) return core;

  const startingPage =
    core.sections.reduce((max, section) => Math.max(max, section.pageEnd), 0) + 1;

  const built = buildDocumentAnalysisFromSectionSeeds({
    documentId: document.id,
    versionLabel: document.versionLabel,
    sectionSeeds: additionalSeeds,
    startingPage,
    scanned: options.scanned ?? document.scanned,
    updatedDaysAgo: 0,
    sectionId: (seed) => `sec-${seed.number.replace(/\s/g, '')}`,
  });

  const sections = [...core.sections, ...built.sections];
  const requirements = [...core.requirements, ...built.requirements];
  const redFlags = [...core.redFlags, ...built.redFlags];

  const openFlags = redFlags.filter((flag) => flag.state === 'open');
  const highestFromFlags = openFlags.reduce<SpecSeverity | undefined>((best, flag) => {
    if (!best || SEVERITY_RANK[flag.severity] > SEVERITY_RANK[best]) return flag.severity;
    return best;
  }, undefined);

  const highestSeverity =
    document.highestSeverity && highestFromFlags
      ? SEVERITY_RANK[document.highestSeverity] >= SEVERITY_RANK[highestFromFlags]
        ? document.highestSeverity
        : highestFromFlags
      : document.highestSeverity ?? highestFromFlags;

  return {
    ...core,
    documents: [
      {
        ...document,
        sectionCount: sections.length,
        requirementCount: requirements.length,
        unresolvedRedFlagCount: openFlags.length,
        highestSeverity,
      },
    ],
    sections,
    summaries: [...core.summaries, ...built.summaries],
    requirements,
    redFlags,
    citations: [...core.citations, ...built.citations],
    blocks: [...core.blocks, ...built.blocks],
  };
}

function buildCleanDivision22(): SpecCoreFixtures {
  const docId = 'spec-clean-22';
  const secId = 'sec-221116';
  const cit1 = 'cit-clean-1';
  const cit2 = 'cit-clean-2';
  const cit3 = 'cit-clean-3';
  const blk1 = 'blk-clean-h1';
  const blk2 = 'blk-clean-p1';
  const blk3 = 'blk-clean-p2';
  const blk4 = 'blk-clean-p3';

  const document: SpecDocument = {
    id: docId,
    title: 'Division 22 — Plumbing',
    fileName: 'Division-22-Plumbing.pdf',
    fileType: 'pdf',
    fileSizeBytes: 4_200_000,
    destination: 'project',
    projectId: '1',
    role: 'project-specification',
    versionLabel: 'v1',
    divisionHint: '22',
    systemType: 'plumbing',
    ascMaster: { id: 'asc-master-22', label: 'ASC Plumbing Master', version: '2026.2' },
    ascMasterConfirmed: true,
    processingState: 'ready',
    stages: readyStages(),
    reviewState: 'not-started',
    owner: 'Alex Rivera',
    createdAt: isoDaysAgo(3),
    updatedAt: isoDaysAgo(0),
    sectionCount: 1,
    requirementCount: 4,
    reviewedRequirementCount: 0,
    unresolvedRedFlagCount: 0,
    scanned: false,
    accessLevel: 'editor',
    archived: false,
    sourcePreviewReady: true,
    location: 'Chicago, IL',
    generalContractor: 'Meridian Construction',
    engineerOfRecord: 'Halstead MEP Engineering',
    divisions: ['22'],
    valueTags: ['Commercial', '$20M–$50M'],
  };

  const section: SpecSection = {
    id: secId,
    documentId: docId,
    division: '22',
    divisionTitle: 'Plumbing',
    sectionNumber: '22 11 16',
    title: 'Domestic Water Piping',
    parts: ['general', 'products', 'execution'],
    pageStart: 12,
    pageEnd: 18,
    processingState: 'ready',
    requirementCount: 4,
    redFlagCount: 0,
    hasLowConfidence: false,
    hasCorrections: false,
    hasProductOpportunities: true,
  };

  const summary: SpecSectionSummary = {
    sectionId: secId,
    summary:
      'Domestic water piping specifies copper Type L and PEX with soldered and crimped joints. Pressure rating 160 psi at 73°F. Submittals required for pipe, fittings, and valves.',
    attentionPoints: ['Confirm joining method compatibility with selected materials.'],
    extractionCompleteness: 96,
    generatedAt: isoDaysAgo(0),
    modelLabel: 'mock-extractor-v1',
  };

  const requirements: SpecRequirement[] = [
    {
      id: 'req-clean-1',
      sectionId: secId,
      category: 'materials-standards',
      value: 'Copper Type L ASTM B88; PEX ASTM F876',
      part: 'products',
      confidence: 'high',
      confidencePercent: 94,
      citationIds: [cit1],
      verification: 'extracted',
    },
    {
      id: 'req-clean-2',
      sectionId: secId,
      category: 'pressure-temperature',
      value: '160 psi at 73°F working pressure',
      part: 'products',
      confidence: 'high',
      confidencePercent: 91,
      citationIds: [cit2],
      verification: 'extracted',
    },
    {
      id: 'req-clean-3',
      sectionId: secId,
      category: 'joining-methods',
      value: 'Soldered joints for copper; crimped for PEX',
      part: 'execution',
      confidence: 'high',
      confidencePercent: 88,
      citationIds: [cit3],
      verification: 'extracted',
    },
    {
      id: 'req-clean-4',
      sectionId: secId,
      category: 'submittal-obligations',
      value: 'Product data for pipe, fittings, and valves',
      part: 'general',
      confidence: 'medium',
      confidencePercent: 78,
      citationIds: [cit1],
      verification: 'extracted',
    },
  ];

  const citations: SpecCitation[] = [
    {
      id: cit1,
      documentId: docId,
      versionLabel: 'v1',
      sectionId: secId,
      page: 14,
      blockId: blk2,
      excerpt: 'Copper tubing shall be Type L, hard drawn, conforming to ASTM B88.',
      anchorType: 'exact',
    },
    {
      id: cit2,
      documentId: docId,
      versionLabel: 'v1',
      sectionId: secId,
      page: 15,
      blockId: blk3,
      excerpt: 'Piping shall be rated for a minimum working pressure of 160 psi at 73°F.',
      anchorType: 'exact',
    },
    {
      id: cit3,
      documentId: docId,
      versionLabel: 'v1',
      sectionId: secId,
      page: 16,
      blockId: blk4,
      excerpt: 'Join copper with soldered fittings; join PEX with manufacturer-approved crimp rings.',
      anchorType: 'exact',
    },
  ];

  const blocks: SpecDocumentBlock[] = [
    {
      id: blk1,
      documentId: docId,
      sectionId: secId,
      page: 12,
      kind: 'heading',
      text: 'SECTION 22 11 16 — DOMESTIC WATER PIPING',
    },
    {
      id: blk2,
      documentId: docId,
      sectionId: secId,
      page: 14,
      kind: 'paragraph',
      label: '2.1.A',
      text: 'Copper tubing shall be Type L, hard drawn, conforming to ASTM B88. PEX tubing shall conform to ASTM F876.',
    },
    {
      id: blk3,
      documentId: docId,
      sectionId: secId,
      page: 15,
      kind: 'paragraph',
      label: '2.2.A',
      text: 'Piping shall be rated for a minimum working pressure of 160 psi at 73°F.',
    },
    {
      id: blk4,
      documentId: docId,
      sectionId: secId,
      page: 16,
      kind: 'paragraph',
      label: '3.1.B',
      text: 'Join copper with soldered fittings; join PEX with manufacturer-approved crimp rings.',
    },
  ];

  // Every Project needs several SPECs across the workflow statuses, so the
  // portfolio fixtures supply the rest of Screen 01 plus their analysis data.
  const portfolio = buildSpecPortfolio((systemType) => {
    const entry = specMasterCatalogEntry(systemType);
    return {
      id: `asc-master-${entry.division}`,
      label: entry.label,
      version: entry.currentVersion,
    };
  });

  const featured = appendCatalogSections(
    {
      documents: [document],
      sections: [section],
      summaries: [summary],
      requirements,
      redFlags: [],
      citations,
      blocks,
      corrections: [],
    },
    'plumbing',
    { skipSectionNumbers: ['22 11 16'] },
  );

  return {
    documents: [featured.documents[0], ...portfolio.documents],
    sections: [...featured.sections, ...portfolio.sections],
    summaries: [...featured.summaries, ...portfolio.summaries],
    requirements: [...featured.requirements, ...portfolio.requirements],
    redFlags: portfolio.redFlags,
    citations: [...featured.citations, ...portfolio.citations],
    blocks: [...featured.blocks, ...portfolio.blocks],
    corrections: [],
  };
}

function buildProprietaryDivision23(): SpecCoreFixtures {
  const docId = 'spec-prop-23';
  const secId = 'sec-233113';
  const cit1 = 'cit-prop-1';
  const cit2 = 'cit-prop-2';
  const blk1 = 'blk-prop-h1';
  const blk2 = 'blk-prop-p1';
  const blk3 = 'blk-prop-p2';

  const document: SpecDocument = {
    id: docId,
    title: 'Division 23 — HVAC',
    fileName: 'Division-23-HVAC.docx',
    fileType: 'docx',
    fileSizeBytes: 3_100_000,
    destination: 'project',
    projectId: '2',
    role: 'project-specification',
    versionLabel: 'v1',
    divisionHint: '23',
    systemType: 'hvac',
    ascMaster: { id: 'asc-master-23', label: 'ASC HVAC Master', version: '2026.1' },
    ascMasterConfirmed: true,
    processingState: 'ready',
    stages: readyStages(),
    reviewState: 'in-review',
    owner: 'Jordan Lee',
    createdAt: isoDaysAgo(5),
    updatedAt: isoDaysAgo(1),
    sectionCount: 1,
    requirementCount: 3,
    reviewedRequirementCount: 1,
    unresolvedRedFlagCount: 2,
    highestSeverity: 'critical',
    scanned: false,
    accessLevel: 'editor',
    archived: false,
    sourcePreviewReady: true,
    location: 'Riverside, CA',
    generalContractor: 'Pacific Build Group',
    engineerOfRecord: 'Cardinal Mechanical Design',
    divisions: ['23'],
    valueTags: ['Office', '$5M–$20M'],
  };

  const section: SpecSection = {
    id: secId,
    documentId: docId,
    division: '23',
    divisionTitle: 'HVAC',
    sectionNumber: '23 31 13',
    title: 'Metal Ducts',
    parts: ['general', 'products', 'execution'],
    pageStart: 4,
    pageEnd: 11,
    processingState: 'ready',
    requirementCount: 3,
    redFlagCount: 2,
    highestSeverity: 'critical',
    hasLowConfidence: false,
    hasCorrections: false,
    hasProductOpportunities: true,
  };

  const summary: SpecSectionSummary = {
    sectionId: secId,
    summary:
      'Metal ducts name a single manufacturer as basis of design and prohibit substitutions without prior written approval.',
    attentionPoints: [
      'Sole-source manufacturer language',
      'No-substitutions clause without prior approval path',
    ],
    extractionCompleteness: 90,
    generatedAt: isoDaysAgo(1),
    modelLabel: 'mock-extractor-v1',
  };

  const requirements: SpecRequirement[] = [
    {
      id: 'req-prop-1',
      sectionId: secId,
      category: 'manufacturers',
      value: 'Acme Air Systems only',
      part: 'products',
      confidence: 'high',
      confidencePercent: 95,
      citationIds: [cit1],
      verification: 'extracted',
    },
    {
      id: 'req-prop-2',
      sectionId: secId,
      category: 'basis-of-design',
      value: 'Acme Air Systems Model DX-400',
      part: 'products',
      confidence: 'high',
      confidencePercent: 92,
      citationIds: [cit1],
      verification: 'extracted',
    },
    {
      id: 'req-prop-3',
      sectionId: secId,
      category: 'substitution-policy',
      value: 'No substitutions permitted',
      part: 'general',
      confidence: 'high',
      confidencePercent: 97,
      citationIds: [cit2],
      verification: 'extracted',
    },
  ];

  const redFlags: SpecRedFlag[] = [
    {
      id: 'rf-prop-1',
      sectionId: secId,
      type: 'sole-source',
      severity: 'critical',
      title: 'Sole-source manufacturer',
      explanation: 'Only Acme Air Systems is named. Competing products are excluded by name.',
      confidence: 'high',
      confidencePercent: 96,
      citationIds: [cit1],
      state: 'open',
      rank: 1,
    },
    {
      id: 'rf-prop-2',
      sectionId: secId,
      type: 'no-substitutions',
      severity: 'major',
      title: 'No substitutions permitted',
      explanation: 'Substitution language blocks alternates without a defined prior-approval path.',
      confidence: 'high',
      confidencePercent: 94,
      citationIds: [cit2],
      state: 'open',
      rank: 2,
    },
  ];

  const citations: SpecCitation[] = [
    {
      id: cit1,
      documentId: docId,
      versionLabel: 'v1',
      sectionId: secId,
      page: 6,
      blockId: blk2,
      excerpt: 'Ductwork shall be as manufactured by Acme Air Systems, Model DX-400. No other manufacturers are acceptable.',
      anchorType: 'exact',
    },
    {
      id: cit2,
      documentId: docId,
      versionLabel: 'v1',
      sectionId: secId,
      page: 5,
      blockId: blk3,
      excerpt: 'Substitutions will not be considered. Provide products as specified.',
      anchorType: 'exact',
    },
  ];

  const blocks: SpecDocumentBlock[] = [
    {
      id: blk1,
      documentId: docId,
      sectionId: secId,
      page: 4,
      kind: 'heading',
      text: 'SECTION 23 31 13 — METAL DUCTS',
    },
    {
      id: blk2,
      documentId: docId,
      sectionId: secId,
      page: 6,
      kind: 'paragraph',
      label: '2.1.A',
      text: 'Ductwork shall be as manufactured by Acme Air Systems, Model DX-400. No other manufacturers are acceptable.',
    },
    {
      id: blk3,
      documentId: docId,
      sectionId: secId,
      page: 5,
      kind: 'paragraph',
      label: '1.4.A',
      text: 'Substitutions will not be considered. Provide products as specified.',
    },
  ];

  return appendCatalogSections(
    {
      documents: [document],
      sections: [section],
      summaries: [summary],
      requirements,
      redFlags,
      citations,
      blocks,
      corrections: [],
    },
    'hvac',
    { skipSectionNumbers: ['23 31 13'] },
  );
}

function buildScannedDivision21(): SpecCoreFixtures {
  const docId = 'spec-scan-21';
  const secId = 'sec-211313';
  const cit1 = 'cit-scan-1';
  const cit2 = 'cit-scan-2';
  const blk1 = 'blk-scan-h1';
  const blk2 = 'blk-scan-p1';
  const blk3 = 'blk-scan-p2';

  const document: SpecDocument = {
    id: docId,
    title: 'Division 21 — Fire Suppression (scanned)',
    fileName: 'Division-21-Fire-Scanned.pdf',
    fileType: 'pdf',
    fileSizeBytes: 18_500_000,
    destination: 'project',
    projectId: '3',
    role: 'project-specification',
    versionLabel: 'v1',
    divisionHint: '21',
    systemType: 'fire-protection',
    ascMaster: { id: 'asc-master-21', label: 'ASC Fire Protection Master', version: '2026.3' },
    ascMasterConfirmed: true,
    processingState: 'ready',
    stages: readyStages().map((s) =>
      s.id === 'ocr-layout' ? { ...s, note: 'Scanned pages — OCR confidence is reduced.' } : s,
    ),
    reviewState: 'not-started',
    owner: 'Sam Chen',
    createdAt: isoDaysAgo(2),
    updatedAt: isoDaysAgo(0),
    sectionCount: 1,
    requirementCount: 2,
    reviewedRequirementCount: 0,
    unresolvedRedFlagCount: 0,
    scanned: true,
    accessLevel: 'editor',
    archived: false,
    sourcePreviewReady: true,
    location: 'Austin, TX',
    generalContractor: 'Lone Star Builders',
    engineerOfRecord: 'Verity Fire Protection Engineers',
    divisions: ['21'],
    valueTags: ['Healthcare', '$50M+'],
  };

  const section: SpecSection = {
    id: secId,
    documentId: docId,
    division: '21',
    divisionTitle: 'Fire Suppression',
    sectionNumber: '21 13 13',
    title: 'Wet-Pipe Sprinkler Systems',
    parts: ['general', 'products', 'execution'],
    pageStart: 1,
    pageEnd: 9,
    processingState: 'ready',
    requirementCount: 2,
    redFlagCount: 0,
    hasLowConfidence: true,
    hasCorrections: false,
    hasProductOpportunities: false,
  };

  const summary: SpecSectionSummary = {
    sectionId: secId,
    summary:
      'Scanned wet-pipe sprinkler section. Several requirements have low OCR confidence and approximate page anchors.',
    attentionPoints: ['Review low-confidence values before relying on them.', 'Citation locations are approximate.'],
    extractionCompleteness: 62,
    generatedAt: isoDaysAgo(0),
    modelLabel: 'mock-ocr-v1',
  };

  const requirements: SpecRequirement[] = [
    {
      id: 'req-scan-1',
      sectionId: secId,
      category: 'listings-certifications',
      value: 'UL Listed / FM Approved sprinklers (OCR uncertain)',
      part: 'products',
      confidence: 'low',
      confidencePercent: 48,
      citationIds: [cit1],
      verification: 'extracted',
    },
    {
      id: 'req-scan-2',
      sectionId: secId,
      category: 'pressure-temperature',
      value: '175 psi? (illegible on scan)',
      part: 'products',
      confidence: 'low',
      confidencePercent: 41,
      citationIds: [cit2],
      verification: 'extracted',
    },
  ];

  const citations: SpecCitation[] = [
    {
      id: cit1,
      documentId: docId,
      versionLabel: 'v1',
      sectionId: secId,
      page: 3,
      blockId: blk2,
      excerpt: 'Sprinklers shall be UL Listed and FM Approved…',
      anchorType: 'approximate',
    },
    {
      id: cit2,
      documentId: docId,
      versionLabel: 'v1',
      sectionId: secId,
      page: 4,
      blockId: blk3,
      excerpt: 'System working pressure approximately 175 psi…',
      anchorType: 'approximate',
    },
  ];

  const blocks: SpecDocumentBlock[] = [
    {
      id: blk1,
      documentId: docId,
      sectionId: secId,
      page: 1,
      kind: 'heading',
      text: 'SECTION 21 13 13 — WET-PIPE SPRINKLER SYSTEMS',
    },
    {
      id: blk2,
      documentId: docId,
      sectionId: secId,
      page: 3,
      kind: 'paragraph',
      label: '2.1',
      text: 'Sprinklers shall be UL Listed and FM Approved. (OCR: characters partially illegible.)',
    },
    {
      id: blk3,
      documentId: docId,
      sectionId: secId,
      page: 4,
      kind: 'paragraph',
      label: '2.3',
      text: 'System working pressure approximately 175 psi. Confirm against original hard copy.',
    },
  ];

  return appendCatalogSections(
    {
      documents: [document],
      sections: [section],
      summaries: [summary],
      requirements,
      redFlags: [],
      citations,
      blocks,
      corrections: [],
    },
    'fire-protection',
    { skipSectionNumbers: ['21 13 13'], scanned: true },
  );
}

function buildLargeProjectManual(): SpecCoreFixtures {
  const docId = 'spec-large-manual';
  const secReady = 'sec-large-220500';
  const secPartial = 'sec-large-221000';
  const secProc = 'sec-large-230000';

  const document: SpecDocument = {
    id: docId,
    title: 'Project Manual — Volumes 1–3',
    fileName: 'Project-Manual-Full.pdf',
    fileType: 'pdf',
    fileSizeBytes: 95_000_000,
    destination: 'project',
    projectId: '4',
    role: 'project-specification',
    versionLabel: 'v2',
    systemType: 'plumbing',
    ascMaster: { id: 'asc-master-22', label: 'ASC Plumbing Master', version: '2026.2' },
    ascMasterConfirmed: true,
    processingState: 'partial',
    stages: processingAt('red-flag-analysis').map((s) => {
      if (s.state === 'done' && s.id === 'section-detection') {
        return { ...s, note: '248 sections detected; 12 still processing.' };
      }
      return s;
    }),
    reviewState: 'not-started',
    owner: 'Alex Rivera',
    createdAt: isoDaysAgo(0),
    updatedAt: isoDaysAgo(0),
    sectionCount: 3,
    requirementCount: 2,
    reviewedRequirementCount: 0,
    unresolvedRedFlagCount: 0,
    scanned: false,
    accessLevel: 'editor',
    archived: false,
    sourcePreviewReady: true,
    location: 'Denver, CO',
    generalContractor: 'Front Range Constructors',
    engineerOfRecord: 'Summit Engineering Partners',
    divisions: ['21', '22', '23'],
    valueTags: ['Campus', '$50M+'],
  };

  const sections: SpecSection[] = [
    {
      id: secReady,
      documentId: docId,
      division: '22',
      divisionTitle: 'Plumbing',
      sectionNumber: '22 05 00',
      title: 'Common Work Results for Plumbing',
      parts: ['general'],
      pageStart: 40,
      pageEnd: 52,
      processingState: 'ready',
      requirementCount: 2,
      redFlagCount: 0,
      hasLowConfidence: false,
      hasCorrections: false,
      hasProductOpportunities: false,
    },
    {
      id: secPartial,
      documentId: docId,
      division: '22',
      divisionTitle: 'Plumbing',
      sectionNumber: '22 10 00',
      title: 'Plumbing Piping',
      parts: ['general', 'products'],
      pageStart: 53,
      pageEnd: 78,
      processingState: 'processing',
      requirementCount: 0,
      redFlagCount: 0,
      hasLowConfidence: false,
      hasCorrections: false,
      hasProductOpportunities: false,
    },
    {
      id: secProc,
      documentId: docId,
      division: '23',
      divisionTitle: 'HVAC',
      sectionNumber: '23 00 00',
      title: 'Heating, Ventilating, and Air Conditioning',
      parts: ['general'],
      pageStart: 200,
      pageEnd: 210,
      processingState: 'processing',
      requirementCount: 0,
      redFlagCount: 0,
      hasLowConfidence: false,
      hasCorrections: false,
      hasProductOpportunities: false,
    },
  ];

  const cit1 = 'cit-large-1';
  const blk1 = 'blk-large-h1';
  const blk2 = 'blk-large-p1';

  const withPlumbing = appendCatalogSections(
    {
      documents: [document],
      sections,
      summaries: [
        {
          sectionId: secReady,
          summary: 'Common plumbing work results are ready. Later divisions are still processing.',
          attentionPoints: ['Open partial analysis while remaining sections finish.'],
          extractionCompleteness: 100,
          generatedAt: isoDaysAgo(0),
          modelLabel: 'mock-extractor-v1',
        },
      ],
      requirements: [
        {
          id: 'req-large-1',
          sectionId: secReady,
          category: 'codes',
          value: 'Comply with IPC and local amendments',
          part: 'general',
          confidence: 'high',
          confidencePercent: 90,
          citationIds: [cit1],
          verification: 'extracted',
        },
        {
          id: 'req-large-2',
          sectionId: secReady,
          category: 'submittal-obligations',
          value: 'Shop drawings for piping layout',
          part: 'general',
          confidence: 'medium',
          confidencePercent: 75,
          citationIds: [cit1],
          verification: 'extracted',
        },
      ],
      redFlags: [],
      citations: [
        {
          id: cit1,
          documentId: docId,
          versionLabel: 'v2',
          sectionId: secReady,
          page: 42,
          blockId: blk2,
          excerpt: 'Comply with the International Plumbing Code and applicable local amendments.',
          anchorType: 'exact',
        },
      ],
      blocks: [
        {
          id: blk1,
          documentId: docId,
          sectionId: secReady,
          page: 40,
          kind: 'heading',
          text: 'SECTION 22 05 00 — COMMON WORK RESULTS FOR PLUMBING',
        },
        {
          id: blk2,
          documentId: docId,
          sectionId: secReady,
          page: 42,
          kind: 'paragraph',
          label: '1.2.A',
          text: 'Comply with the International Plumbing Code and applicable local amendments.',
        },
      ],
      corrections: [],
    },
    'plumbing',
    { skipSectionNumbers: ['22 05 00'] },
  );

  return appendCatalogSections(withPlumbing, 'hvac');
}

function buildContradictoryRequirements(): SpecCoreFixtures {
  const docId = 'spec-contradict';
  const secA = 'sec-cont-221116';
  const secB = 'sec-cont-221119';
  const citA = 'cit-cont-a';
  const citB = 'cit-cont-b';
  const blkA = 'blk-cont-a';
  const blkB = 'blk-cont-b';

  const document: SpecDocument = {
    id: docId,
    title: 'Plumbing — conflicting pressure notes',
    fileName: 'Plumbing-Conflicts.pdf',
    fileType: 'pdf',
    fileSizeBytes: 2_400_000,
    destination: 'project',
    projectId: '5',
    role: 'project-specification',
    versionLabel: 'v1',
    divisionHint: '22',
    systemType: 'plumbing',
    ascMaster: { id: 'asc-master-22', label: 'ASC Plumbing Master', version: '2026.2' },
    ascMasterConfirmed: true,
    processingState: 'ready',
    stages: readyStages(),
    reviewState: 'not-started',
    owner: 'Jordan Lee',
    createdAt: isoDaysAgo(1),
    updatedAt: isoDaysAgo(0),
    sectionCount: 2,
    requirementCount: 2,
    reviewedRequirementCount: 0,
    unresolvedRedFlagCount: 1,
    highestSeverity: 'major',
    scanned: false,
    accessLevel: 'editor',
    archived: false,
    sourcePreviewReady: true,
    location: 'Seattle, WA',
    generalContractor: 'Cascade General',
    engineerOfRecord: 'Puget Consulting Engineers',
    divisions: ['22'],
    valueTags: ['Education', '$5M–$20M'],
  };

  const sections: SpecSection[] = [
    {
      id: secA,
      documentId: docId,
      division: '22',
      divisionTitle: 'Plumbing',
      sectionNumber: '22 11 16',
      title: 'Domestic Water Piping',
      parts: ['products'],
      pageStart: 10,
      pageEnd: 14,
      processingState: 'ready',
      requirementCount: 1,
      redFlagCount: 1,
      highestSeverity: 'major',
      hasLowConfidence: false,
      hasCorrections: false,
      hasProductOpportunities: false,
    },
    {
      id: secB,
      documentId: docId,
      division: '22',
      divisionTitle: 'Plumbing',
      sectionNumber: '22 11 19',
      title: 'Domestic Water Piping Specialties',
      parts: ['products'],
      pageStart: 15,
      pageEnd: 18,
      processingState: 'ready',
      requirementCount: 1,
      redFlagCount: 0,
      hasLowConfidence: false,
      hasCorrections: false,
      hasProductOpportunities: false,
    },
  ];

  return appendCatalogSections(
    {
      documents: [document],
      sections,
      summaries: [
        {
          sectionId: secA,
          summary: 'Requires 200 psi working pressure for domestic water piping.',
          attentionPoints: ['Conflicts with Section 22 11 19 pressure rating.'],
          extractionCompleteness: 88,
          generatedAt: isoDaysAgo(0),
          modelLabel: 'mock-extractor-v1',
        },
        {
          sectionId: secB,
          summary: 'Specialties are rated for 125 psi maximum.',
          attentionPoints: ['Conflicts with Section 22 11 16 pressure rating.'],
          extractionCompleteness: 85,
          generatedAt: isoDaysAgo(0),
          modelLabel: 'mock-extractor-v1',
        },
      ],
      requirements: [
        {
          id: 'req-cont-1',
          sectionId: secA,
          category: 'pressure-temperature',
          value: '200 psi working pressure',
          part: 'products',
          confidence: 'high',
          confidencePercent: 90,
          citationIds: [citA],
          verification: 'extracted',
        },
        {
          id: 'req-cont-2',
          sectionId: secB,
          category: 'pressure-temperature',
          value: '125 psi maximum',
          part: 'products',
          confidence: 'high',
          confidencePercent: 89,
          citationIds: [citB],
          verification: 'extracted',
        },
      ],
      redFlags: [
        {
          id: 'rf-cont-1',
          sectionId: secA,
          type: 'contradiction',
          severity: 'major',
          title: 'Conflicting pressure requirements',
          explanation:
            'Section 22 11 16 requires 200 psi working pressure while Section 22 11 19 limits specialties to 125 psi.',
          confidence: 'high',
          confidencePercent: 93,
          citationIds: [citA, citB],
          state: 'open',
          rank: 1,
        },
      ],
      citations: [
        {
          id: citA,
          documentId: docId,
          versionLabel: 'v1',
          sectionId: secA,
          page: 12,
          blockId: blkA,
          excerpt: 'Piping shall be rated for 200 psi working pressure.',
          anchorType: 'exact',
        },
        {
          id: citB,
          documentId: docId,
          versionLabel: 'v1',
          sectionId: secB,
          page: 16,
          blockId: blkB,
          excerpt: 'Specialties shall be rated for a maximum of 125 psi.',
          anchorType: 'exact',
        },
      ],
      blocks: [
        {
          id: blkA,
          documentId: docId,
          sectionId: secA,
          page: 12,
          kind: 'paragraph',
          label: '2.2.A',
          text: 'Piping shall be rated for 200 psi working pressure.',
        },
        {
          id: blkB,
          documentId: docId,
          sectionId: secB,
          page: 16,
          kind: 'paragraph',
          label: '2.1.B',
          text: 'Specialties shall be rated for a maximum of 125 psi.',
        },
      ],
      corrections: [],
    },
    'plumbing',
    { skipSectionNumbers: ['22 11 16', '22 11 19'] },
  );
}

function buildFailedProcessing(): SpecCoreFixtures {
  const docId = 'spec-failed-1';
  const document: SpecDocument = {
    id: docId,
    title: 'Unreadable addendum scan',
    fileName: 'Addendum-Corrupted.pdf',
    fileType: 'pdf',
    fileSizeBytes: 1_200_000,
    destination: 'project',
    projectId: '1',
    role: 'addendum',
    versionLabel: 'Addendum A',
    addendumLabel: 'Addendum A',
    systemType: 'plumbing',
    processingState: 'failed',
    stages: failedStages('ocr-layout'),
    reviewState: 'not-started',
    owner: 'Alex Rivera',
    createdAt: isoDaysAgo(0),
    updatedAt: isoDaysAgo(0),
    sectionCount: 0,
    requirementCount: 0,
    reviewedRequirementCount: 0,
    unresolvedRedFlagCount: 0,
    scanned: true,
    accessLevel: 'editor',
    archived: false,
    sourcePreviewReady: false,
    location: 'Chicago, IL',
    generalContractor: 'Meridian Construction',
    engineerOfRecord: 'Halstead MEP Engineering',
    valueTags: ['Commercial', '$20M–$50M'],
    failureReason: 'OCR could not read enough pages to continue. Retry after re-scanning the source.',
  };

  return {
    documents: [document],
    sections: [],
    summaries: [],
    requirements: [],
    redFlags: [],
    citations: [],
    blocks: [],
    corrections: [],
  };
}

function buildAddendumReviewCore(): SpecCoreFixtures {
  const docId = 'spec-addendum-22';
  const secId = 'sec-add-221116';
  const cit1 = 'cit-add-1';
  const cit2 = 'cit-add-2';
  const blkH = 'blk-add-h1';
  const blk1 = 'blk-add-p1';
  const blk2 = 'blk-add-p2';

  const document: SpecDocument = {
    id: docId,
    title: 'Division 22 — Plumbing (Addendum A)',
    fileName: 'Division-22-Addendum-A.pdf',
    fileType: 'pdf',
    fileSizeBytes: 1_800_000,
    destination: 'project',
    projectId: '1',
    role: 'addendum',
    versionLabel: 'Addendum A',
    addendumLabel: 'Addendum A',
    divisionHint: '22',
    systemType: 'plumbing',
    ascMaster: { id: 'asc-master-22', label: 'ASC Plumbing Master', version: '2026.2' },
    ascMasterConfirmed: true,
    processingState: 'ready',
    stages: readyStages(),
    reviewState: 'in-review',
    owner: 'Alex Rivera',
    createdAt: isoDaysAgo(1),
    updatedAt: isoDaysAgo(0),
    sectionCount: 1,
    requirementCount: 2,
    reviewedRequirementCount: 1,
    unresolvedRedFlagCount: 0,
    scanned: false,
    accessLevel: 'editor',
    archived: false,
    sourcePreviewReady: true,
    location: 'Chicago, IL',
    generalContractor: 'Meridian Construction',
    engineerOfRecord: 'Halstead MEP Engineering',
    divisions: ['22'],
    valueTags: ['Commercial', '$20M–$50M'],
  };

  const section: SpecSection = {
    id: secId,
    documentId: docId,
    division: '22',
    divisionTitle: 'Plumbing',
    sectionNumber: '22 11 16',
    title: 'Domestic Water Piping',
    parts: ['general', 'products', 'execution'],
    pageStart: 1,
    pageEnd: 4,
    processingState: 'ready',
    requirementCount: 2,
    redFlagCount: 0,
    hasLowConfidence: false,
    hasCorrections: false,
    hasProductOpportunities: true,
  };

  return appendCatalogSections(
    {
      documents: [document],
      sections: [section],
      summaries: [
        {
          sectionId: secId,
          summary:
            'Addendum A updates materials to allow CPVC and raises working pressure to 200 psi. Proprietary sole-source language from v1 is removed.',
          attentionPoints: ['Confirm pressure change with the engineer of record.'],
          extractionCompleteness: 94,
          generatedAt: isoDaysAgo(0),
          modelLabel: 'mock-extractor-v1',
        },
      ],
      requirements: [
        {
          id: 'req-add-1',
          sectionId: secId,
          category: 'materials-standards',
          value: 'Copper Type L ASTM B88; PEX ASTM F876; CPVC ASTM D2846 where permitted',
          part: 'products',
          confidence: 'high',
          confidencePercent: 92,
          citationIds: [cit1],
          verification: 'extracted',
        },
        {
          id: 'req-add-2',
          sectionId: secId,
          category: 'pressure-temperature',
          value: '200 psi at 73°F working pressure',
          part: 'products',
          confidence: 'high',
          confidencePercent: 90,
          citationIds: [cit2],
          verification: 'extracted',
        },
      ],
      redFlags: [],
      citations: [
        {
          id: cit1,
          documentId: docId,
          versionLabel: 'Addendum A',
          sectionId: secId,
          page: 2,
          blockId: blk1,
          excerpt: 'Copper Type L ASTM B88; PEX ASTM F876; CPVC ASTM D2846 where permitted.',
          anchorType: 'exact',
        },
        {
          id: cit2,
          documentId: docId,
          versionLabel: 'Addendum A',
          sectionId: secId,
          page: 2,
          blockId: blk2,
          excerpt: 'Working pressure shall be 200 psi at 73°F.',
          anchorType: 'exact',
        },
      ],
      blocks: [
        {
          id: blkH,
          documentId: docId,
          sectionId: secId,
          page: 1,
          kind: 'heading',
          text: '22 11 16 Domestic Water Piping — Addendum A',
        },
        {
          id: blk1,
          documentId: docId,
          sectionId: secId,
          page: 2,
          kind: 'paragraph',
          label: '2.1.A',
          text: 'Copper Type L ASTM B88; PEX ASTM F876; CPVC ASTM D2846 where permitted.',
        },
        {
          id: blk2,
          documentId: docId,
          sectionId: secId,
          page: 2,
          kind: 'paragraph',
          label: '2.2.A',
          text: 'Working pressure shall be 200 psi at 73°F.',
        },
      ],
      corrections: [],
    },
    'plumbing',
    { skipSectionNumbers: ['22 11 16'] },
  );
}

function buildNoAscFitCore(): SpecCoreFixtures {
  const docId = 'spec-nofit-22';
  const secId = 'sec-nofit-221116';
  const cit1 = 'cit-nofit-1';
  const blk1 = 'blk-nofit-p1';

  return appendCatalogSections(
    {
      documents: [
        {
          id: docId,
          title: 'Division 22 — Proprietary material lock',
          fileName: 'Division-22-Proprietary.pdf',
          fileType: 'pdf',
          fileSizeBytes: 2_400_000,
          destination: 'project',
          projectId: '1',
          role: 'project-specification',
          versionLabel: 'v1',
          divisionHint: '22',
          systemType: 'plumbing',
          ascMaster: { id: 'asc-master-22', label: 'ASC Plumbing Master', version: '2026.2' },
          ascMasterConfirmed: true,
          processingState: 'ready',
          stages: readyStages(),
          reviewState: 'in-review',
          owner: 'Alex Rivera',
          createdAt: isoDaysAgo(2),
          updatedAt: isoDaysAgo(0),
          sectionCount: 1,
          requirementCount: 1,
          reviewedRequirementCount: 0,
          unresolvedRedFlagCount: 1,
          highestSeverity: 'major',
          scanned: false,
          accessLevel: 'editor',
          archived: false,
          sourcePreviewReady: true,
          location: 'Chicago, IL',
          generalContractor: 'Meridian Construction',
          engineerOfRecord: 'Halstead MEP Engineering',
          divisions: ['22'],
          valueTags: ['Commercial', '$20M–$50M'],
        },
      ],
      sections: [
        {
          id: secId,
          documentId: docId,
          division: '22',
          divisionTitle: 'Plumbing',
          sectionNumber: '22 11 16',
          title: 'Domestic Water Piping',
          parts: ['products'],
          pageStart: 10,
          pageEnd: 12,
          processingState: 'ready',
          requirementCount: 1,
          redFlagCount: 1,
          highestSeverity: 'major',
          hasLowConfidence: false,
          hasCorrections: false,
          hasProductOpportunities: false,
        },
      ],
      summaries: [
        {
          sectionId: secId,
          summary:
            'Neutral extraction succeeded. The section locks materials to a proprietary brand with no ASC catalog equal.',
          attentionPoints: ['No ASC product fit — consider Ask an Engineer or a substitution request.'],
          extractionCompleteness: 91,
          generatedAt: isoDaysAgo(0),
          modelLabel: 'mock-extractor-v1',
        },
      ],
      requirements: [
        {
          id: 'req-nofit-1',
          sectionId: secId,
          category: 'manufacturers',
          value: 'Provide BrandX proprietary alloy piping only',
          part: 'products',
          confidence: 'high',
          confidencePercent: 94,
          citationIds: [cit1],
          verification: 'extracted',
        },
      ],
      redFlags: [
        {
          id: 'rf-nofit-1',
          sectionId: secId,
          type: 'proprietary-lock-in',
          severity: 'major',
          title: 'Proprietary manufacturer lock',
          explanation: 'Only BrandX alloy is allowed. No ASC catalog item matches this requirement.',
          confidence: 'high',
          confidencePercent: 95,
          citationIds: [cit1],
          state: 'open',
          rank: 1,
        },
      ],
      citations: [
        {
          id: cit1,
          documentId: docId,
          versionLabel: 'v1',
          sectionId: secId,
          page: 11,
          blockId: blk1,
          excerpt: 'Provide BrandX proprietary alloy piping only. No substitutions.',
          anchorType: 'exact',
        },
      ],
      blocks: [
        {
          id: blk1,
          documentId: docId,
          sectionId: secId,
          page: 11,
          kind: 'paragraph',
          label: '2.1.A',
          text: 'Provide BrandX proprietary alloy piping only. No substitutions.',
        },
      ],
      corrections: [],
    },
    'plumbing',
    { skipSectionNumbers: ['22 11 16'] },
  );
}

/**
 * Builds deterministic fixtures for a named scenario.
 * Components must never import this directly — go through the mock store / repositories.
 */
export function buildScenarioFixtures(scenarioId: SpecScenarioId): SpecScenarioFixtures {
  switch (scenarioId) {
    case 'clean-division-22':
      return assemble(
        buildCleanDivision22(),
        buildClean22EditorFixtures(),
        buildClean22ReviewFixtures(),
        buildClean22ProductsFixtures(),
        buildClean22ArtifactsFixtures(),
        buildClean22CollaborationFixtures(),
      );
    case 'proprietary-division-23':
      return assemble(buildProprietaryDivision23());
    case 'scanned-division-21':
      return assemble(buildScannedDivision21());
    case 'large-project-manual':
      return assemble(buildLargeProjectManual());
    case 'contradictory-requirements':
      return assemble(buildContradictoryRequirements());
    case 'failed-processing':
      return assemble(buildFailedProcessing());
    case 'empty-project-first-onboarding':
      return { ...empty };
    case 'addendum-review':
      return assemble(
        buildAddendumReviewCore(),
        buildAddendumEditorFixtures(),
        buildAddendumReviewFixtures(),
      );
    case 'no-asc-fit':
      return assemble(
        buildNoAscFitCore(),
        emptyEditorFixtures,
        emptyReviewFixtures,
        buildNoAscFitProductsFixtures(),
        buildNoAscFitArtifactsFixtures(),
        buildNoAscFitCollaborationFixtures(),
      );
    case 'async-deliver-back':
      return assemble(
        buildCleanDivision22(),
        buildClean22EditorFixtures(),
        buildClean22ReviewFixtures(),
        buildClean22ProductsFixtures(),
        buildClean22ArtifactsFixtures(),
        buildAsyncDeliverBackCollaborationFixtures(),
      );
    case 'restricted-external-reviewer':
      return assemble(
        buildCleanDivision22(),
        buildClean22EditorFixtures(),
        buildClean22ReviewFixtures(),
        buildClean22ProductsFixtures(),
        buildClean22ArtifactsFixtures(),
        buildRestrictedExternalCollaborationFixtures(),
      );
    default:
      return assemble(
        buildCleanDivision22(),
        buildClean22EditorFixtures(),
        buildClean22ReviewFixtures(),
        buildClean22ProductsFixtures(),
        buildClean22ArtifactsFixtures(),
        buildClean22CollaborationFixtures(),
      );
  }
}
