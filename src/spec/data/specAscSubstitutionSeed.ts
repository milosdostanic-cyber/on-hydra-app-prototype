/**
 * ASC substitution opportunities for every analyzed SPEC (Screen 05 / 06).
 *
 * The portfolio and scenario builders produce clauses, requirements, and red
 * flags but no catalog evidence, so most documents used to reach Review with
 * nothing to approve and ConnectED Actions stayed disabled. This module derives
 * a small, deterministic set of ASC product suggestions from the clauses that
 * name a single manufacturer, lock a basis of design, or fix a material
 * standard — the places where an ASC part can be confirmed instead.
 *
 * Documents that already carry hand-written suggestions (the Clean Division 22
 * walkthrough and the deliberate "No ASC fit" fixture) are left untouched.
 */
import type {
  SpecCitation,
  SpecConfidenceBand,
  SpecDocument,
  SpecEquivalenceAttribute,
  SpecProductFit,
  SpecProductSuggestion,
  SpecRedFlag,
  SpecRequirement,
  SpecRequirementCategory,
  SpecSubstitutionAttachment,
  SpecSubstitutionSavings,
  SpecSystemType,
} from './types';

/** How many substitution opportunities one document may show. */
const MAX_SUGGESTIONS_PER_DOCUMENT = 3;

type AscSubstitutionTemplate = {
  /** Stable id fragment — the suggestion id is namespaced by document. */
  key: string;
  sku: string;
  name: string;
  series?: string;
  fit: Extract<SpecProductFit, 'strong' | 'possible'>;
  fitReason: string;
  confidence: SpecConfidenceBand;
  confidencePercent: number;
  attributeTags: string[];
  /** Clause categories this part can answer. */
  categories: SpecRequirementCategory[];
  /** Lowercase clause keywords; at least one must appear in the clause text. */
  keywords: string[];
  /** Label for the first equivalence row, compared against the clause value. */
  comparedAttribute: string;
  proposedValue: string;
  supportingEquivalence: Omit<SpecEquivalenceAttribute, 'id' | 'citationId'>[];
  savings: SpecSubstitutionSavings;
  attachments: Omit<SpecSubstitutionAttachment, 'id'>[];
};

const INDICATIVE_BASIS =
  'Indicative prototype figures from list pricing and published install rates. Not a quotation.';

const PLUMBING_TEMPLATES: AscSubstitutionTemplate[] = [
  {
    key: 'ball-valve',
    sku: 'ASC-BV-150-BR',
    name: 'ASC bronze ball valve — Class 150',
    series: 'Valves',
    fit: 'strong',
    fitReason:
      'Full-port bronze ball valve rated above the specified domestic water pressure, so the named manufacturer is not required.',
    confidence: 'high',
    confidencePercent: 91,
    attributeTags: ['Bronze', 'Full port', '200 psi'],
    categories: ['manufacturers'],
    keywords: ['ball valve'],
    comparedAttribute: 'Manufacturer requirement',
    proposedValue: 'ASC bronze ball valve, full port, 200 psi WOG',
    supportingEquivalence: [
      {
        attribute: 'Working pressure',
        specifiedValue: '160 psi at 73°F',
        proposedValue: '200 psi WOG',
        outcome: 'exceeds',
      },
      {
        attribute: 'Potable water listing',
        specifiedValue: 'Listed for domestic water service',
        proposedValue: 'NSF-61 and NSF-372 listed',
        outcome: 'meets',
      },
    ],
    savings: {
      materialLabel: 'About 11% lower material cost than the named valve',
      labourLabel: 'No labour change — same threaded connections',
      leadTimeLabel: '3 weeks earlier than the named manufacturer',
      basis: INDICATIVE_BASIS,
    },
    attachments: [
      { title: 'ASC ball valve cut sheet', kind: 'cut-sheet', available: true },
      { title: 'NSF-61 listing certificate', kind: 'listing', available: true },
    ],
  },
  {
    key: 'water-heater',
    sku: 'ASC-WH-199-CD',
    name: 'ASC condensing gas water heater — 199 MBH',
    series: 'Water Heaters',
    fit: 'strong',
    fitReason:
      'Matches the specified thermal efficiency and ASME relief requirement, so it can be offered as an approved equal.',
    confidence: 'high',
    confidencePercent: 89,
    attributeTags: ['96% efficiency', 'ASME relief', 'Condensing'],
    categories: ['basis-of-design'],
    keywords: ['water heater', 'gt-199'],
    comparedAttribute: 'Basis of design',
    proposedValue: 'ASC condensing gas water heater, 199 MBH',
    supportingEquivalence: [
      {
        attribute: 'Thermal efficiency',
        specifiedValue: '96 percent thermal efficiency',
        proposedValue: '96.2 percent thermal efficiency',
        outcome: 'meets',
      },
      {
        attribute: 'Storage pressure rating',
        specifiedValue: '150 psi at 180°F',
        proposedValue: '150 psi at 180°F',
        outcome: 'meets',
      },
    ],
    savings: {
      materialLabel: 'About 7% lower equipment cost',
      labourLabel: 'No labour change — same gas and vent connections',
      leadTimeLabel: '4 weeks earlier than the basis of design',
      basis: INDICATIVE_BASIS,
    },
    attachments: [
      { title: 'ASC water heater cut sheet', kind: 'cut-sheet', available: true },
      {
        title: 'Efficiency test report',
        kind: 'test-report',
        available: false,
        note: 'Not on file — request from ASC before submitting.',
      },
    ],
  },
  {
    key: 'copper-type-l',
    sku: 'ASC-CU-L-B88',
    name: 'ASC copper Type L — ASTM B88',
    series: 'CopperLine',
    fit: 'strong',
    fitReason: 'Hard-drawn copper Type L matching the specified material standard and pressure class.',
    confidence: 'high',
    confidencePercent: 93,
    attributeTags: ['Copper Type L', 'ASTM B88'],
    categories: ['materials-standards'],
    keywords: ['copper tube'],
    comparedAttribute: 'Material standard',
    proposedValue: 'Copper Type L, hard drawn, ASTM B88',
    supportingEquivalence: [
      {
        attribute: 'Size range',
        specifiedValue: '½" through 4"',
        proposedValue: '½" through 4"',
        outcome: 'meets',
      },
    ],
    savings: {
      materialLabel: 'Parity pricing on copper',
      labourLabel: 'No labour change — same soldered joints',
      leadTimeLabel: 'In stock',
      basis: INDICATIVE_BASIS,
    },
    attachments: [
      { title: 'CopperLine Type L cut sheet', kind: 'cut-sheet', available: true },
    ],
  },
  {
    key: 'roof-drain',
    sku: 'ASC-RD-4-CI',
    name: 'ASC cast-iron roof drain — 4 in. outlet',
    series: 'Drains',
    fit: 'possible',
    fitReason:
      'Cast-iron roof drain with a matching outlet size; confirm the dome and flashing options against the roof assembly.',
    confidence: 'medium',
    confidencePercent: 76,
    attributeTags: ['Cast iron', '4 in. outlet'],
    categories: ['manufacturers'],
    keywords: ['roof drain'],
    comparedAttribute: 'Manufacturer requirement',
    proposedValue: 'ASC cast-iron roof drain with cast-iron dome',
    supportingEquivalence: [
      {
        attribute: 'Flashing collar',
        specifiedValue: 'Match roofing assembly',
        proposedValue: 'Integral flashing clamp; membrane collar optional',
        outcome: 'needs-review',
        note: 'Confirm the roofing type before selecting the collar.',
      },
    ],
    savings: {
      materialLabel: 'About 9% lower material cost',
      labourLabel: 'No labour change',
      leadTimeLabel: '2 weeks earlier than the named manufacturer',
      basis: INDICATIVE_BASIS,
    },
    attachments: [{ title: 'ASC roof drain cut sheet', kind: 'cut-sheet', available: true }],
  },
];

const FIRE_TEMPLATES: AscSubstitutionTemplate[] = [
  {
    key: 'sprinkler',
    sku: 'ASC-SR-155-TH',
    name: 'ASC standard response pendent sprinkler — 155°F',
    series: 'Standard Response Sprinklers',
    fit: 'strong',
    fitReason:
      'UL Listed and FM Approved for the specified occupancy and orientation, so the sole-source paragraph is not needed.',
    confidence: 'high',
    confidencePercent: 94,
    attributeTags: ['UL Listed', 'FM Approved', '155°F'],
    categories: ['manufacturers'],
    keywords: ['sprinkler'],
    comparedAttribute: 'Manufacturer requirement',
    proposedValue: 'ASC standard response pendent sprinkler, 1/2 in. NPT',
    supportingEquivalence: [
      {
        attribute: 'Listings',
        specifiedValue: 'UL Listed and FM Approved',
        proposedValue: 'UL Listed, FM Approved, NFPA 13 compliant',
        outcome: 'meets',
      },
      {
        attribute: 'Component pressure rating',
        specifiedValue: '175 psi working pressure',
        proposedValue: '175 psi working pressure',
        outcome: 'meets',
      },
    ],
    savings: {
      materialLabel: 'About 12% lower material cost per head',
      labourLabel: 'No labour change — same threaded connection',
      leadTimeLabel: 'In stock; 3 weeks earlier than the named manufacturer',
      basis: INDICATIVE_BASIS,
    },
    attachments: [
      { title: 'ASC sprinkler cut sheet', kind: 'cut-sheet', available: true },
      { title: 'UL listing card', kind: 'listing', available: true },
    ],
  },
  {
    key: 'fdc',
    sku: 'ASC-FDC-250-BR',
    name: 'ASC fire-department connection — 2-1/2 in. brass',
    series: 'FireLock Series',
    fit: 'strong',
    fitReason:
      'Brass FDC body with clapper checks in the specified inlet size; thread pattern is made to the local fire department standard.',
    confidence: 'high',
    confidencePercent: 88,
    attributeTags: ['Brass', '2-1/2 in.', 'Clapper check'],
    categories: ['manufacturers'],
    keywords: ['fdc', 'fire-department connection'],
    comparedAttribute: 'Manufacturer requirement',
    proposedValue: 'ASC brass FDC body with clapper check valves',
    supportingEquivalence: [
      {
        attribute: 'Inlet size',
        specifiedValue: '2-1/2 in. inlets',
        proposedValue: '2-1/2 in. inlets',
        outcome: 'meets',
      },
      {
        attribute: 'Thread pattern',
        specifiedValue: 'Approved by the local fire authority',
        proposedValue: 'NST standard; local patterns made to order',
        outcome: 'needs-review',
        note: 'Confirm the thread pattern with the fire department before ordering.',
      },
    ],
    savings: {
      materialLabel: 'About 8% lower material cost',
      labourLabel: 'No labour change',
      leadTimeLabel: 'Parity lead time on standard threads',
      basis: INDICATIVE_BASIS,
    },
    attachments: [{ title: 'ASC FDC cut sheet', kind: 'cut-sheet', available: true }],
  },
  {
    key: 'standpipe-steel',
    sku: 'ASC-PIPE-2.5-S40',
    name: 'ASC Schedule 40 black steel pipe — ASTM A53 Grade B',
    series: 'Pipe',
    fit: 'strong',
    fitReason: 'Matches the specified steel grade and wall schedule for standpipe risers.',
    confidence: 'high',
    confidencePercent: 92,
    attributeTags: ['Schedule 40', 'ASTM A53 Grade B'],
    categories: ['materials-standards'],
    keywords: ['schedule 40 black steel'],
    comparedAttribute: 'Material standard',
    proposedValue: 'Schedule 40 black steel, ASTM A53 Grade B',
    supportingEquivalence: [
      {
        attribute: 'Joining method',
        specifiedValue: 'Welded or grooved as shown',
        proposedValue: 'Welded, threaded, and grooved ends available',
        outcome: 'meets',
      },
    ],
    savings: {
      materialLabel: 'Parity pricing on steel pipe',
      labourLabel: 'No labour change',
      leadTimeLabel: 'In stock',
      basis: INDICATIVE_BASIS,
    },
    attachments: [{ title: 'ASC steel pipe mill certificate', kind: 'test-report', available: true }],
  },
  {
    key: 'fire-pump-controller',
    sku: 'ASC-FPC-460-UL',
    name: 'ASC fire pump controller — 460 V, UL Listed',
    series: 'Controls',
    fit: 'possible',
    fitReason:
      'UL Listed controller for the specified driver; confirm the campus monitoring interface before replacing the standard.',
    confidence: 'medium',
    confidencePercent: 72,
    attributeTags: ['UL Listed', '460 V', 'Automatic transfer'],
    categories: ['manufacturers'],
    keywords: ['fire pump controller'],
    comparedAttribute: 'Manufacturer requirement',
    proposedValue: 'ASC UL Listed fire pump controller with automatic transfer',
    supportingEquivalence: [
      {
        attribute: 'Monitoring interface',
        specifiedValue: 'Campus standard controls platform',
        proposedValue: 'BACnet/IP and dry-contact monitoring',
        outcome: 'needs-review',
        note: 'Confirm how the campus head end reads controller alarms.',
      },
    ],
    savings: {
      materialLabel: 'About 14% lower equipment cost',
      labourLabel: 'Adds about 4 h for interface commissioning',
      leadTimeLabel: '5 weeks earlier than the campus standard',
      basis: INDICATIVE_BASIS,
    },
    attachments: [
      { title: 'ASC controller cut sheet', kind: 'cut-sheet', available: true },
      { title: 'UL listing card', kind: 'listing', available: true },
    ],
  },
];

const HVAC_TEMPLATES: AscSubstitutionTemplate[] = [
  {
    key: 'duct',
    sku: 'ASC-DUCT-G60',
    name: 'ASC galvanized duct — ASTM A653 G60',
    series: 'Duct',
    fit: 'strong',
    fitReason:
      'Galvanized duct fabricated to SMACNA with the specified coating class, so a single fabricator is not required.',
    confidence: 'high',
    confidencePercent: 90,
    attributeTags: ['ASTM A653 G60', 'SMACNA'],
    categories: ['manufacturers'],
    keywords: ['ductwork'],
    comparedAttribute: 'Manufacturer requirement',
    proposedValue: 'ASC galvanized duct, ASTM A653 G60, SMACNA fabrication',
    supportingEquivalence: [
      {
        attribute: 'Seal class',
        specifiedValue: 'SMACNA Seal Class A',
        proposedValue: 'SMACNA Seal Class A',
        outcome: 'meets',
      },
      {
        attribute: 'Leakage class',
        specifiedValue: 'SMACNA Leakage Class 6 at 2 in. w.g.',
        proposedValue: 'Leakage Class 3 at 2 in. w.g.',
        outcome: 'exceeds',
      },
    ],
    savings: {
      materialLabel: 'About 10% lower fabrication cost',
      labourLabel: 'No labour change — same joint types',
      leadTimeLabel: '2 weeks earlier than the named fabricator',
      basis: INDICATIVE_BASIS,
    },
    attachments: [{ title: 'ASC duct fabrication data', kind: 'cut-sheet', available: true }],
  },
  {
    key: 'ddc-controller',
    sku: 'ASC-DDC-BTL-24',
    name: 'ASC BACnet native controller — BTL listed',
    series: 'Controls',
    fit: 'strong',
    fitReason:
      'BTL-listed BACnet native controller that supports the specified Guideline 36 sequences without the proprietary platform.',
    confidence: 'high',
    confidencePercent: 87,
    attributeTags: ['BACnet native', 'BTL listed', 'Guideline 36'],
    categories: ['manufacturers'],
    keywords: ['controllers'],
    comparedAttribute: 'Manufacturer requirement',
    proposedValue: 'ASC BACnet native controller, BTL listed',
    supportingEquivalence: [
      {
        attribute: 'Device profile',
        specifiedValue: 'BTL listed for the installed profile',
        proposedValue: 'BTL listed B-AAC and B-ASC profiles',
        outcome: 'meets',
      },
      {
        attribute: 'Campus head end',
        specifiedValue: 'Campus standard controls platform',
        proposedValue: 'Open BACnet/IP integration',
        outcome: 'needs-review',
        note: 'Confirm graphics and alarm handling with the campus operator.',
      },
    ],
    savings: {
      materialLabel: 'About 16% lower hardware cost',
      labourLabel: 'Adds about 8 h for graphics integration',
      leadTimeLabel: '4 weeks earlier than the campus standard',
      basis: INDICATIVE_BASIS,
    },
    attachments: [
      { title: 'ASC controller cut sheet', kind: 'cut-sheet', available: true },
      { title: 'BTL listing certificate', kind: 'listing', available: true },
    ],
  },
  {
    key: 'butterfly-valve',
    sku: 'ASC-BFV-300-LG',
    name: 'ASC lug-style butterfly valve — Class 300',
    series: 'Valves',
    fit: 'strong',
    fitReason:
      'Lug-style butterfly valve rated above the specified hydronic pressure and temperature, offered as an approved equal.',
    confidence: 'high',
    confidencePercent: 90,
    attributeTags: ['Lug style', 'Class 300', 'EPDM seat'],
    categories: ['manufacturers'],
    keywords: ['butterfly'],
    comparedAttribute: 'Manufacturer requirement',
    proposedValue: 'ASC lug-style butterfly valve, Class 300, EPDM seat',
    supportingEquivalence: [
      {
        attribute: 'Pressure and temperature',
        specifiedValue: '125 psi at 200°F',
        proposedValue: '300 psi at 250°F',
        outcome: 'exceeds',
      },
    ],
    savings: {
      materialLabel: 'About 13% lower material cost',
      labourLabel: 'No labour change — same flanged connections',
      leadTimeLabel: 'In stock',
      basis: INDICATIVE_BASIS,
    },
    attachments: [{ title: 'ASC butterfly valve cut sheet', kind: 'cut-sheet', available: true }],
  },
  {
    key: 'vav-terminal',
    sku: 'ASC-VAV-12-PI',
    name: 'ASC pressure-independent VAV terminal — 12 in.',
    series: 'Air Terminals',
    fit: 'strong',
    fitReason:
      'Pressure-independent terminal with factory-calibrated sensors and a hot-water reheat coil matching the schedule.',
    confidence: 'high',
    confidencePercent: 86,
    attributeTags: ['Pressure independent', 'Hot-water reheat'],
    categories: ['basis-of-design'],
    keywords: ['vav'],
    comparedAttribute: 'Basis of design',
    proposedValue: 'ASC pressure-independent VAV terminal with reheat coil',
    supportingEquivalence: [
      {
        attribute: 'Reheat coil rating',
        specifiedValue: '200°F entering water',
        proposedValue: '200°F entering water',
        outcome: 'meets',
      },
      {
        attribute: 'Sound data',
        specifiedValue: 'Certified airflow and sound data per box type',
        proposedValue: 'AHRI 880 certified data published',
        outcome: 'meets',
      },
    ],
    savings: {
      materialLabel: 'About 9% lower equipment cost',
      labourLabel: 'No labour change',
      leadTimeLabel: '3 weeks earlier than the basis of design',
      basis: INDICATIVE_BASIS,
    },
    attachments: [{ title: 'ASC VAV terminal cut sheet', kind: 'cut-sheet', available: true }],
  },
  {
    key: 'final-filter',
    sku: 'ASC-FLT-M13',
    name: 'ASC MERV 13 final filter — 4 in.',
    series: 'Filtration',
    fit: 'possible',
    fitReason:
      'Meets the specified filtration class; confirm the final pressure drop against the fan external static.',
    confidence: 'medium',
    confidencePercent: 78,
    attributeTags: ['MERV 13', '4 in. depth'],
    categories: ['substitution-policy'],
    keywords: ['merv 13'],
    comparedAttribute: 'Filtration requirement',
    proposedValue: 'ASC MERV 13 pleated final filter, 4 in. depth',
    supportingEquivalence: [
      {
        attribute: 'Filtration class',
        specifiedValue: 'MERV 13 final filters',
        proposedValue: 'MERV 13 rated per ASHRAE 52.2',
        outcome: 'meets',
      },
      {
        attribute: 'Pressure drop',
        specifiedValue: '3.5 in. w.g. external static available',
        proposedValue: '0.42 in. w.g. clean; 1.0 in. w.g. final',
        outcome: 'needs-review',
        note: 'Check the final pressure drop against the selected fan curve.',
      },
    ],
    savings: {
      materialLabel: 'About 6% lower filter cost per change-out',
      labourLabel: 'No labour change',
      leadTimeLabel: 'In stock',
      basis: INDICATIVE_BASIS,
    },
    attachments: [{ title: 'ASC filter performance data', kind: 'cut-sheet', available: true }],
  },
];

const TEMPLATES_BY_SYSTEM_TYPE: Record<SpecSystemType, AscSubstitutionTemplate[]> = {
  plumbing: PLUMBING_TEMPLATES,
  'fire-protection': FIRE_TEMPLATES,
  hvac: HVAC_TEMPLATES,
};

/** Used when a document's clauses match no template — every SPEC keeps one opportunity. */
const FALLBACK_TEMPLATE_KEY: Record<SpecSystemType, string> = {
  plumbing: 'copper-type-l',
  'fire-protection': 'standpipe-steel',
  hvac: 'butterfly-valve',
};

/** Clause categories that can carry a substitution, most explicit first. */
const FALLBACK_CATEGORY_ORDER: SpecRequirementCategory[] = [
  'manufacturers',
  'basis-of-design',
  'substitution-policy',
  'materials-standards',
  'pressure-temperature',
];

function matchesTemplate(
  template: AscSubstitutionTemplate,
  requirement: SpecRequirement,
  clauseText: string,
): boolean {
  if (!template.categories.includes(requirement.category)) return false;
  const haystack = `${clauseText} ${requirement.value}`.toLowerCase();
  return template.keywords.some((keyword) => haystack.includes(keyword));
}

function buildSuggestion(input: {
  template: AscSubstitutionTemplate;
  document: SpecDocument;
  requirement: SpecRequirement;
  citation: SpecCitation;
}): SpecProductSuggestion {
  const { template, document, requirement, citation } = input;
  const idBase = `prod-${document.id}-${template.key}`;

  const equivalence: SpecEquivalenceAttribute[] = [
    {
      id: `${idBase}-eq-1`,
      attribute: template.comparedAttribute,
      specifiedValue: requirement.value,
      proposedValue: template.proposedValue,
      outcome: template.fit === 'strong' ? 'meets' : 'needs-review',
      citationId: citation.id,
    },
    ...template.supportingEquivalence.map((row, index) => ({
      ...row,
      id: `${idBase}-eq-${index + 2}`,
    })),
  ];

  return {
    id: idBase,
    documentId: document.id,
    sectionId: requirement.sectionId,
    requirementId: requirement.id,
    sku: template.sku,
    name: template.name,
    series: template.series,
    fit: template.fit,
    fitReason: template.fitReason,
    confidence: template.confidence,
    confidencePercent: template.confidencePercent,
    attributeTags: template.attributeTags,
    commerciallyMotivated: true,
    status: 'suggested',
    citationIds: [citation.id],
    equivalence,
    savings: template.savings,
    attachments: template.attachments.map((attachment, index) => ({
      ...attachment,
      id: `${idBase}-att-${index + 1}`,
    })),
  };
}

/**
 * Derives ASC substitution suggestions for documents that have none, so every
 * analyzed SPEC offers at least one ASC part to confirm in Review.
 */
export function buildAscSubstitutionSuggestions(input: {
  documents: SpecDocument[];
  requirements: SpecRequirement[];
  redFlags: SpecRedFlag[];
  citations: SpecCitation[];
  existing: SpecProductSuggestion[];
}): SpecProductSuggestion[] {
  const { documents, requirements, redFlags, citations, existing } = input;
  const documentsWithEvidence = new Set(existing.map((suggestion) => suggestion.documentId));
  const citationById = new Map(citations.map((citation) => [citation.id, citation]));
  const flaggedCitationIds = new Set(redFlags.flatMap((flag) => flag.citationIds));

  const requirementsByDocument = new Map<string, { requirement: SpecRequirement; citation: SpecCitation }[]>();
  for (const requirement of requirements) {
    const citation = citationById.get(requirement.citationIds[0] ?? '');
    if (!citation) continue;
    const bucket = requirementsByDocument.get(citation.documentId) ?? [];
    bucket.push({ requirement, citation });
    requirementsByDocument.set(citation.documentId, bucket);
  }

  const suggestions: SpecProductSuggestion[] = [];

  for (const document of documents) {
    if (documentsWithEvidence.has(document.id)) continue;
    const candidates = requirementsByDocument.get(document.id) ?? [];
    if (candidates.length === 0) continue;

    const templates = TEMPLATES_BY_SYSTEM_TYPE[document.systemType] ?? [];
    const usedCitationIds = new Set<string>();
    const documentSuggestions: SpecProductSuggestion[] = [];

    for (const template of templates) {
      if (documentSuggestions.length >= MAX_SUGGESTIONS_PER_DOCUMENT) break;
      const matches = candidates.filter(
        (candidate) =>
          !usedCitationIds.has(candidate.citation.id) &&
          matchesTemplate(template, candidate.requirement, candidate.citation.excerpt),
      );
      if (matches.length === 0) continue;
      // Flagged clauses read as the clearest substitution moment in Review.
      const match =
        matches.find((candidate) => flaggedCitationIds.has(candidate.citation.id)) ?? matches[0];
      usedCitationIds.add(match.citation.id);
      documentSuggestions.push(
        buildSuggestion({
          template,
          document,
          requirement: match.requirement,
          citation: match.citation,
        }),
      );
    }

    if (documentSuggestions.length === 0) {
      const fallbackKey = FALLBACK_TEMPLATE_KEY[document.systemType];
      const fallback = templates.find((template) => template.key === fallbackKey);
      const anchor = FALLBACK_CATEGORY_ORDER.reduce<
        { requirement: SpecRequirement; citation: SpecCitation } | undefined
      >(
        (found, category) =>
          found ?? candidates.find((candidate) => candidate.requirement.category === category),
        undefined,
      );
      if (fallback && anchor) {
        documentSuggestions.push(
          buildSuggestion({
            template: { ...fallback, fit: 'possible' },
            document,
            requirement: anchor.requirement,
            citation: anchor.citation,
          }),
        );
      }
    }

    suggestions.push(...documentSuggestions);
  }

  return suggestions;
}
