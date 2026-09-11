/**
 * Project SPEC portfolio fixtures (Screen 01 — audit §5.1).
 *
 * The default demo scenario needs several SPECs per Project so the list shows
 * every workflow status from the status/next-action table, not a single row.
 * Documents that reached analysis also carry sections, clauses, citations,
 * requirements, and red flags so the Analysis Dashboard and Review screens are
 * populated instead of empty.
 *
 * Clause text is written as plain specification language; nothing here is real
 * project content.
 */
import {
  completeV2ProcessingStages,
  createV2ProcessingStages,
  failedV2ProcessingStages,
} from '../constants/specWorkflowStatus';
import {
  ensureMinimumDocumentPages,
  sectionPageStart,
} from './specDocumentBodySeed';
import { isoDaysAgo } from './specSeedHelpers';
import type {
  SpecAscMaster,
  SpecCitation,
  SpecConfidenceBand,
  SpecDocument,
  SpecDocumentBlock,
  SpecDocumentRole,
  SpecDocumentVersionRecord,
  SpecFileType,
  SpecRecommendationDecision,
  SpecRedFlag,
  SpecRedFlagState,
  SpecRedFlagType,
  SpecRequirement,
  SpecRequirementCategory,
  SpecSection,
  SpecSectionPart,
  SpecSectionSummary,
  SpecSeverity,
  SpecSystemType,
} from './types';

/** Row states covered by the portfolio, matching `deriveSpecWorkflowStatus`. */
type PortfolioStatus =
  | 'processing'
  | 'analysis-failed'
  | 'ready-to-review'
  | 'in-review'
  | 'reanalysis-required'
  | 'ready-to-export'
  | 'exported';

type ClauseSeed = {
  /** Paragraph number as printed in the specification. */
  label: string;
  /** Page inside the section, offset to an absolute page by the builder. */
  page: number;
  text: string;
  category: SpecRequirementCategory;
  value: string;
  part: SpecSectionPart;
  confidence?: SpecConfidenceBand;
  confidencePercent?: number;
  flag?: {
    type: SpecRedFlagType;
    severity: SpecSeverity;
    title: string;
    explanation: string;
  };
};

type SectionSeed = {
  division: string;
  divisionTitle: string;
  number: string;
  title: string;
  parts: SpecSectionPart[];
  /** Section length in pages; absolute pages are assigned by the builder. */
  pageCount: number;
  summary: string;
  attentionPoints: string[];
  extractionCompleteness: number;
  clauses: ClauseSeed[];
};

type PortfolioSpecSeed = {
  id: string;
  projectId: string;
  title: string;
  fileName: string;
  fileType: SpecFileType;
  fileSizeBytes: number;
  systemType: SpecSystemType;
  role?: SpecDocumentRole;
  versionNumber: number;
  status: PortfolioStatus;
  owner: string;
  createdDaysAgo: number;
  updatedDaysAgo: number;
  location: string;
  generalContractor: string;
  engineerOfRecord: string;
  valueTags: string[];
  scanned?: boolean;
  failureReason?: string;
  /** Stage index still running; only used by `processing`. */
  activeStageIndex?: number;
  /** How many recommendations already carry a decision. */
  decidedCount?: number;
  sections?: SectionSeed[];
};

// ── Clause banks ─────────────────────────────────────────────────────────────
// Each factory returns a fresh object so documents never share nested state.

function plumbingDomesticWater(): SectionSeed {
  return {
    division: '22',
    divisionTitle: 'Plumbing',
    number: '22 11 16',
    title: 'Domestic Water Piping',
    parts: ['general', 'products', 'execution'],
    pageCount: 8,
    summary:
      'Domestic water piping specifies copper Type L and PEX-a with a 160 psi working pressure. Valve language names a single manufacturer.',
    attentionPoints: [
      'Valve paragraph names one manufacturer with no approved-equal path.',
      'Confirm joining methods against the selected materials.',
    ],
    extractionCompleteness: 94,
    clauses: [
      {
        label: '1.5.A',
        page: 1,
        text: 'Submit product data for pipe, fittings, valves, and insulation before fabrication begins.',
        category: 'submittal-obligations',
        value: 'Product data for pipe, fittings, valves, and insulation',
        part: 'general',
        confidence: 'medium',
        confidencePercent: 79,
      },
      {
        label: '2.1.A',
        page: 3,
        text: 'Copper tube shall be Type L, hard drawn, conforming to ASTM B88. PEX-a tubing shall conform to ASTM F876 and ASTM F877.',
        category: 'materials-standards',
        value: 'Copper Type L ASTM B88; PEX-a ASTM F876/F877',
        part: 'products',
      },
      {
        label: '2.2.A',
        page: 4,
        text: 'Domestic water piping shall be rated for a minimum working pressure of 160 psi at 73 degrees F.',
        category: 'pressure-temperature',
        value: '160 psi at 73°F working pressure',
        part: 'products',
      },
      {
        label: '2.3.B',
        page: 5,
        text: 'Provide ball valves as manufactured by Cordell Valve Company. No other manufacturers will be considered.',
        category: 'manufacturers',
        value: 'Cordell Valve Company ball valves only',
        part: 'products',
        flag: {
          type: 'sole-source',
          severity: 'critical',
          title: 'Sole-source valve manufacturer',
          explanation:
            'Only Cordell Valve Company is named for ball valves, so equivalent products are excluded by name.',
        },
      },
      {
        label: '3.1.C',
        page: 7,
        text: 'Join copper with lead-free solder. Join PEX-a with cold-expansion fittings installed per the tubing manufacturer instructions.',
        category: 'joining-methods',
        value: 'Lead-free soldered copper; cold-expansion PEX-a fittings',
        part: 'execution',
      },
    ],
  };
}

function plumbingSanitaryWaste(): SectionSeed {
  return {
    division: '22',
    divisionTitle: 'Plumbing',
    number: '22 13 16',
    title: 'Sanitary Waste and Vent Piping',
    parts: ['general', 'products', 'execution'],
    pageCount: 6,
    summary:
      'Waste and vent piping requires service-weight cast iron above grade and blocks plastic alternates in plenums.',
    attentionPoints: ['Substitution language has no review path for plenum-rated alternates.'],
    extractionCompleteness: 92,
    clauses: [
      {
        label: '2.1.A',
        page: 2,
        text: 'Above-grade waste and vent piping shall be service-weight cast iron with no-hub couplings conforming to ASTM A888.',
        category: 'materials-standards',
        value: 'Service-weight cast iron, ASTM A888 no-hub',
        part: 'products',
      },
      {
        label: '2.2.C',
        page: 3,
        text: 'Substitution of plastic piping for cast iron is not permitted in return air plenums.',
        category: 'substitution-policy',
        value: 'No plastic substitutes in return air plenums',
        part: 'products',
        flag: {
          type: 'no-substitutions',
          severity: 'major',
          title: 'No substitution path for plenum piping',
          explanation:
            'Plenum-rated alternates are excluded outright instead of being routed through an approval review.',
        },
      },
      {
        label: '3.2.A',
        page: 5,
        text: 'Test drainage piping with a 10-foot head of water for 15 minutes with no loss of water level.',
        category: 'testing',
        value: '10-foot head of water for 15 minutes',
        part: 'execution',
      },
    ],
  };
}

function plumbingWaterHeaters(): SectionSeed {
  return {
    division: '22',
    divisionTitle: 'Plumbing',
    number: '22 34 00',
    title: 'Fuel-Fired Domestic Water Heaters',
    parts: ['general', 'products'],
    pageCount: 5,
    summary:
      'Water heaters are specified around one basis-of-design model, and equal products are cut off before bid.',
    attentionPoints: ['Approved-equal window closes before bid, which blocks late alternates.'],
    extractionCompleteness: 90,
    clauses: [
      {
        label: '2.1.A',
        page: 2,
        text: 'Provide gas-fired condensing water heaters with 96 percent thermal efficiency and ASME-rated relief valves.',
        category: 'listings-certifications',
        value: '96% thermal efficiency; ASME-rated relief valves',
        part: 'products',
      },
      {
        label: '2.1.C',
        page: 3,
        text: 'Basis of design is Northline Thermal Model GT-199. Equal products will not be reviewed after the bid date.',
        category: 'basis-of-design',
        value: 'Northline Thermal GT-199 basis of design',
        part: 'products',
        flag: {
          type: 'no-prior-approval',
          severity: 'major',
          title: 'No prior-approval path after bid',
          explanation:
            'Equal products are refused after the bid date, so alternates cannot be reviewed during procurement.',
        },
      },
      {
        label: '2.2.B',
        page: 4,
        text: 'Storage tanks shall be rated for 150 psi working pressure at 180 degrees F.',
        category: 'pressure-temperature',
        value: '150 psi at 180°F storage rating',
        part: 'products',
      },
    ],
  };
}

function fireWetPipeSprinklers(): SectionSeed {
  return {
    division: '21',
    divisionTitle: 'Fire Suppression',
    number: '21 13 13',
    title: 'Wet-Pipe Sprinkler Systems',
    parts: ['general', 'products', 'execution'],
    pageCount: 9,
    summary:
      'Wet-pipe sprinkler work follows NFPA 13 with a 175 psi component rating. Sprinkler heads are limited to one manufacturer.',
    attentionPoints: [
      'Sprinkler paragraph names one manufacturer and refuses substitutions.',
      'Confirm the hydrostatic test pressure against the component rating.',
    ],
    extractionCompleteness: 93,
    clauses: [
      {
        label: '1.4.B',
        page: 1,
        text: 'Design and install the system in accordance with NFPA 13 and the requirements of the authority having jurisdiction.',
        category: 'codes',
        value: 'NFPA 13 and AHJ requirements',
        part: 'general',
      },
      {
        label: '2.1.A',
        page: 3,
        text: 'Sprinklers shall be UL Listed and FM Approved for the intended occupancy and installation orientation.',
        category: 'listings-certifications',
        value: 'UL Listed and FM Approved sprinklers',
        part: 'products',
      },
      {
        label: '2.2.B',
        page: 4,
        text: 'System components shall be rated for a working pressure of 175 psi.',
        category: 'pressure-temperature',
        value: '175 psi component working pressure',
        part: 'products',
      },
      {
        label: '2.3.A',
        page: 5,
        text: 'Provide sprinklers manufactured by Halcyon Fire Products. Substitutions will not be considered.',
        category: 'manufacturers',
        value: 'Halcyon Fire Products sprinklers only',
        part: 'products',
        flag: {
          type: 'sole-source',
          severity: 'critical',
          title: 'Sole-source sprinkler manufacturer',
          explanation:
            'One sprinkler manufacturer is named and substitutions are refused, which removes competing listed products.',
        },
      },
      {
        label: '3.3.A',
        page: 8,
        text: 'Hydrostatically test the completed system at 200 psi for two hours without leakage.',
        category: 'testing',
        value: '200 psi hydrostatic test for two hours',
        part: 'execution',
        flag: {
          type: 'contradiction',
          severity: 'major',
          title: 'Test pressure exceeds the component rating',
          explanation:
            'The system is tested at 200 psi while components are only required to be rated for 175 psi.',
        },
      },
    ],
  };
}

function fireStandpipes(): SectionSeed {
  return {
    division: '21',
    divisionTitle: 'Fire Suppression',
    number: '21 12 00',
    title: 'Fire-Suppression Standpipes',
    parts: ['general', 'products'],
    pageCount: 5,
    summary: 'Standpipe work follows NFPA 14 with Schedule 40 steel risers and listed hose valves.',
    attentionPoints: ['Confirm fire department connection location with the local fire authority.'],
    extractionCompleteness: 91,
    clauses: [
      {
        label: '1.3.A',
        page: 1,
        text: 'Comply with NFPA 14 and the fire department connection requirements of the local fire authority.',
        category: 'codes',
        value: 'NFPA 14 and local fire department requirements',
        part: 'general',
      },
      {
        label: '2.1.A',
        page: 2,
        text: 'Standpipe risers shall be Schedule 40 black steel conforming to ASTM A53, Grade B.',
        category: 'materials-standards',
        value: 'Schedule 40 black steel, ASTM A53 Grade B',
        part: 'products',
      },
      {
        label: '2.2.A',
        page: 4,
        text: 'Hose valves shall be 2-1/2 inch, brass, UL Listed, with pressure-restricting devices.',
        category: 'sizes',
        value: '2-1/2 inch UL Listed brass hose valves',
        part: 'products',
        confidence: 'medium',
        confidencePercent: 81,
      },
    ],
  };
}

function hvacMetalDucts(): SectionSeed {
  return {
    division: '23',
    divisionTitle: 'HVAC',
    number: '23 31 13',
    title: 'Metal Ducts',
    parts: ['general', 'products', 'execution'],
    pageCount: 7,
    summary:
      'Metal duct work follows SMACNA fabrication and sealing classes, but names one duct manufacturer as the only acceptable source.',
    attentionPoints: ['Duct manufacturer paragraph excludes all other fabricators.'],
    extractionCompleteness: 95,
    clauses: [
      {
        label: '2.1.A',
        page: 2,
        text: 'Ducts shall be galvanized steel conforming to ASTM A653 with G60 coating, fabricated in accordance with SMACNA standards.',
        category: 'materials-standards',
        value: 'Galvanized steel ASTM A653 G60, SMACNA fabrication',
        part: 'products',
      },
      {
        label: '2.2.A',
        page: 3,
        text: 'Ductwork shall be as manufactured by Ardent Air Systems, Model DX-400. No other manufacturers are acceptable.',
        category: 'manufacturers',
        value: 'Ardent Air Systems DX-400 only',
        part: 'products',
        flag: {
          type: 'sole-source',
          severity: 'critical',
          title: 'Sole-source duct manufacturer',
          explanation:
            'A single fabricator and model are named, so equally compliant fabricators cannot be offered.',
        },
      },
      {
        label: '3.1.B',
        page: 5,
        text: 'Seal all transverse and longitudinal joints to SMACNA Seal Class A.',
        category: 'joining-methods',
        value: 'SMACNA Seal Class A joints',
        part: 'execution',
      },
      {
        label: '3.4.A',
        page: 6,
        text: 'Duct leakage shall not exceed SMACNA Leakage Class 6 when tested at 2 inches water gauge.',
        category: 'testing',
        value: 'SMACNA Leakage Class 6 at 2 in. w.g.',
        part: 'execution',
      },
    ],
  };
}

function hvacAirHandlingUnits(): SectionSeed {
  return {
    division: '23',
    divisionTitle: 'HVAC',
    number: '23 73 13',
    title: 'Modular Indoor Central-Station Air-Handling Units',
    parts: ['general', 'products'],
    pageCount: 6,
    summary:
      'Air-handling units are specified with double-wall construction, a fixed airflow duty, and a filtration clause that blocks alternates.',
    attentionPoints: [
      'Filter paragraph rejects alternates instead of stating a performance requirement.',
    ],
    extractionCompleteness: 89,
    clauses: [
      {
        label: '1.6.A',
        page: 1,
        text: 'Submit certified fan curves and sound power data with the unit submittal package.',
        category: 'submittal-obligations',
        value: 'Certified fan curves and sound power data',
        part: 'general',
        confidence: 'medium',
        confidencePercent: 77,
      },
      {
        label: '2.1.A',
        page: 2,
        text: 'Air-handling units shall be double-wall construction with 2-inch thermal-break insulated panels.',
        category: 'materials-standards',
        value: 'Double-wall, 2-inch thermal-break panels',
        part: 'products',
      },
      {
        label: '2.2.B',
        page: 3,
        text: 'Each unit shall deliver 12,000 cfm at 3.5 inches water gauge external static pressure.',
        category: 'sizes',
        value: '12,000 cfm at 3.5 in. w.g. external static',
        part: 'products',
      },
      {
        label: '2.3.A',
        page: 5,
        text: 'Provide MERV 13 final filters. MERV 8 pre-filters are not acceptable as a substitute.',
        category: 'substitution-policy',
        value: 'MERV 13 final filters; no MERV 8 substitution',
        part: 'products',
        flag: {
          type: 'no-substitutions',
          severity: 'major',
          title: 'Filtration alternates excluded',
          explanation:
            'The clause refuses alternates by product class rather than stating the filtration performance to be met.',
        },
      },
    ],
  };
}

function hvacDirectDigitalControls(): SectionSeed {
  return {
    division: '23',
    divisionTitle: 'HVAC',
    number: '23 09 23',
    title: 'Direct Digital Control Systems for HVAC',
    parts: ['general', 'products', 'execution'],
    pageCount: 6,
    summary:
      'Controls are BACnet native and follow Guideline 36 sequences, but controller hardware is locked to one vendor as a campus standard.',
    attentionPoints: ['Campus-standard language creates long-term vendor lock-in.'],
    extractionCompleteness: 92,
    clauses: [
      {
        label: '1.4.C',
        page: 1,
        text: 'Sequences of operation shall comply with ASHRAE Guideline 36 for the applicable system types.',
        category: 'codes',
        value: 'ASHRAE Guideline 36 sequences',
        part: 'general',
      },
      {
        label: '2.1.A',
        page: 2,
        text: 'Controllers shall be BACnet native and BTL listed for the installed device profile.',
        category: 'listings-certifications',
        value: 'BACnet native, BTL listed controllers',
        part: 'products',
      },
      {
        label: '2.2.A',
        page: 3,
        text: 'Provide controllers by Sentinel Controls Group. The campus standard prohibits alternate control vendors.',
        category: 'manufacturers',
        value: 'Sentinel Controls Group controllers only',
        part: 'products',
        flag: {
          type: 'proprietary-lock-in',
          severity: 'critical',
          title: 'Proprietary controls lock-in',
          explanation:
            'A single controls vendor is mandated as a campus standard, which prevents open BACnet alternates from competing.',
        },
      },
      {
        label: '3.5.A',
        page: 5,
        text: 'Perform point-to-point verification of 100 percent of installed control points before demonstration.',
        category: 'testing',
        value: 'Point-to-point verification of all points',
        part: 'execution',
      },
    ],
  };
}

function hvacScannedReissue(): SectionSeed {
  return {
    division: '23',
    divisionTitle: 'HVAC',
    number: '23 21 13',
    title: 'Hydronic Piping',
    parts: ['general', 'products'],
    pageCount: 6,
    summary:
      'Hydronic piping was read from a scanned reissue, so several values have low text-recognition confidence.',
    attentionPoints: [
      'Low-confidence values should be checked against the original document.',
      'Citation locations on scanned pages are approximate.',
    ],
    extractionCompleteness: 64,
    clauses: [
      {
        label: '2.1.A',
        page: 2,
        text: 'Hydronic piping shall be Schedule 40 black steel with welded joints for sizes 2-1/2 inch and larger.',
        category: 'materials-standards',
        value: 'Schedule 40 black steel, welded 2-1/2 in. and larger',
        part: 'products',
        confidence: 'low',
        confidencePercent: 52,
      },
      {
        label: '2.2.A',
        page: 4,
        text: 'Piping and fittings shall be rated for 125 psi working pressure at 200 degrees F.',
        category: 'pressure-temperature',
        value: '125 psi at 200°F (text recognition uncertain)',
        part: 'products',
        confidence: 'low',
        confidencePercent: 46,
      },
    ],
  };
}

function hvacHydronicPiping(): SectionSeed {
  return {
    division: '23',
    divisionTitle: 'HVAC',
    number: '23 21 13',
    title: 'Hydronic Piping',
    parts: ['general', 'products', 'execution'],
    pageCount: 6,
    summary:
      'Hydronic piping specifies steel and copper systems with pressure ratings and joining methods across multiple pipe sizes.',
    attentionPoints: [
      'Confirm glycol concentration against the mechanical equipment submittals.',
      'Isolation valve paragraph limits manufacturers without an approved-equal path.',
    ],
    extractionCompleteness: 91,
    clauses: [
      {
        label: '1.4.A',
        page: 1,
        text: 'Submit piping isometric diagrams and valve schedules before underground installation begins.',
        category: 'submittal-obligations',
        value: 'Isometric diagrams and valve schedules',
        part: 'general',
      },
      {
        label: '2.1.A',
        page: 2,
        text: 'Hydronic piping 2-1/2 inches and larger shall be Schedule 40 black steel with welded joints.',
        category: 'materials-standards',
        value: 'Schedule 40 black steel, welded 2-1/2 in. and larger',
        part: 'products',
      },
      {
        label: '2.2.B',
        page: 3,
        text: 'Piping and fittings shall be rated for 125 psi working pressure at 200 degrees F.',
        category: 'pressure-temperature',
        value: '125 psi at 200°F working pressure',
        part: 'products',
      },
      {
        label: '2.3.A',
        page: 4,
        text: 'Provide butterfly isolation valves as manufactured by Cordell Valve Company only.',
        category: 'manufacturers',
        value: 'Cordell Valve Company butterfly valves only',
        part: 'products',
        flag: {
          type: 'sole-source',
          severity: 'major',
          title: 'Sole-source isolation valve manufacturer',
          explanation:
            'Only one valve manufacturer is named for hydronic isolation valves, excluding listed alternates.',
        },
      },
      {
        label: '3.2.A',
        page: 5,
        text: 'Pressure-test the completed hydronic piping at 1.5 times the design working pressure for four hours.',
        category: 'testing',
        value: '1.5× design pressure for four hours',
        part: 'execution',
      },
    ],
  };
}

function hvacVariableAirVolume(): SectionSeed {
  return {
    division: '23',
    divisionTitle: 'HVAC',
    number: '23 36 00',
    title: 'Variable-Air-Volume Units',
    parts: ['general', 'products'],
    pageCount: 5,
    summary:
      'VAV terminal units require pressure-independent control with factory-mounted reheat coils and listed airflow ranges.',
    attentionPoints: ['Reheat coil paragraph blocks alternates after the bid date.'],
    extractionCompleteness: 88,
    clauses: [
      {
        label: '1.5.B',
        page: 1,
        text: 'Submit certified airflow and sound data for each VAV box type with the equipment submittal.',
        category: 'submittal-obligations',
        value: 'Certified airflow and sound data per box type',
        part: 'general',
      },
      {
        label: '2.1.A',
        page: 2,
        text: 'VAV terminal units shall be pressure-independent with factory-calibrated airflow sensors.',
        category: 'materials-standards',
        value: 'Pressure-independent units with factory sensors',
        part: 'products',
      },
      {
        label: '2.2.A',
        page: 3,
        text: 'Provide hot-water reheat coils with copper tubes and aluminum fins rated for 200°F entering water.',
        category: 'pressure-temperature',
        value: '200°F entering water reheat coils',
        part: 'products',
      },
      {
        label: '2.3.C',
        page: 4,
        text: 'Basis of design is Northline Thermal Model VAV-12. Equal products will not be reviewed after bid.',
        category: 'basis-of-design',
        value: 'Northline Thermal VAV-12 basis of design',
        part: 'products',
        flag: {
          type: 'no-prior-approval',
          severity: 'major',
          title: 'Post-bid alternates excluded for VAV boxes',
          explanation:
            'The approved-equal window closes at bid, which prevents late substitution of compliant VAV terminals.',
        },
      },
    ],
  };
}

function plumbingStormDrainage(): SectionSeed {
  return {
    division: '22',
    divisionTitle: 'Plumbing',
    number: '22 14 00',
    title: 'Storm Drainage Piping',
    parts: ['general', 'products', 'execution'],
    pageCount: 4,
    summary:
      'Storm drainage requires cast-iron roof leaders and HDPE underground mains with cleanouts at every change of direction.',
    attentionPoints: ['Roof drain manufacturer is named without an approved-equal clause.'],
    extractionCompleteness: 90,
    clauses: [
      {
        label: '2.1.A',
        page: 1,
        text: 'Above-grade storm leaders shall be service-weight cast iron conforming to ASTM A888.',
        category: 'materials-standards',
        value: 'Service-weight cast iron, ASTM A888',
        part: 'products',
      },
      {
        label: '2.2.A',
        page: 2,
        text: 'Underground storm mains shall be HDPE SDR 35 with gasketed joints.',
        category: 'materials-standards',
        value: 'HDPE SDR 35 gasketed joints',
        part: 'products',
      },
      {
        label: '2.3.A',
        page: 3,
        text: 'Provide roof drains as manufactured by Halcyon Drain Products. No substitutions.',
        category: 'manufacturers',
        value: 'Halcyon Drain Products roof drains only',
        part: 'products',
        flag: {
          type: 'sole-source',
          severity: 'major',
          title: 'Sole-source roof drain manufacturer',
          explanation:
            'Roof drains are limited to one manufacturer, which removes competing listed products from bid review.',
        },
      },
      {
        label: '3.1.A',
        page: 4,
        text: 'Install cleanouts at every change of direction greater than 45 degrees and at intervals not exceeding 100 feet.',
        category: 'joining-methods',
        value: 'Cleanouts at 45° changes and every 100 ft',
        part: 'execution',
      },
    ],
  };
}

function plumbingNaturalGasPiping(): SectionSeed {
  return {
    division: '22',
    divisionTitle: 'Plumbing',
    number: '22 11 23',
    title: 'Natural-Gas Piping',
    parts: ['general', 'products'],
    pageCount: 5,
    summary:
      'Natural-gas piping follows NFPA 54 with threaded steel above grade and polyethylene below grade within listed pressure limits.',
    attentionPoints: ['Polyethylene paragraph excludes mechanical coupling alternates.'],
    extractionCompleteness: 89,
    clauses: [
      {
        label: '1.3.A',
        page: 1,
        text: 'Design and install gas piping in accordance with NFPA 54 and the local gas utility requirements.',
        category: 'codes',
        value: 'NFPA 54 and local gas utility requirements',
        part: 'general',
      },
      {
        label: '2.1.A',
        page: 2,
        text: 'Above-grade gas piping shall be Schedule 40 black steel with threaded joints.',
        category: 'materials-standards',
        value: 'Schedule 40 black steel, threaded joints',
        part: 'products',
      },
      {
        label: '2.2.A',
        page: 3,
        text: 'Underground gas mains shall be medium-density polyethylene with heat-fusion joints only.',
        category: 'joining-methods',
        value: 'MDPE with heat-fusion joints only',
        part: 'products',
        flag: {
          type: 'no-substitutions',
          severity: 'minor',
          title: 'Mechanical coupling alternates excluded',
          explanation:
            'Underground polyethylene is limited to heat-fusion joints without a path for listed mechanical couplings.',
        },
      },
      {
        label: '2.3.A',
        page: 4,
        text: 'Gas piping shall be rated for 5 psi operating pressure unless noted otherwise on the drawings.',
        category: 'pressure-temperature',
        value: '5 psi operating pressure',
        part: 'products',
      },
    ],
  };
}

function fireFirePump(): SectionSeed {
  return {
    division: '21',
    divisionTitle: 'Fire Suppression',
    number: '21 30 00',
    title: 'Fire Pumps',
    parts: ['general', 'products', 'execution'],
    pageCount: 6,
    summary:
      'Fire pumps require UL/FM listed electric drivers with automatic transfer and weekly test provisions.',
    attentionPoints: ['Controller paragraph locks the fire pump to one vendor as campus standard.'],
    extractionCompleteness: 92,
    clauses: [
      {
        label: '1.4.A',
        page: 1,
        text: 'Submit pump curves, driver data, and controller wiring diagrams with the equipment submittal.',
        category: 'submittal-obligations',
        value: 'Pump curves, driver data, and controller diagrams',
        part: 'general',
      },
      {
        label: '2.1.A',
        page: 2,
        text: 'Fire pumps shall be UL Listed and FM Approved for the rated capacity and pressure shown on the drawings.',
        category: 'listings-certifications',
        value: 'UL Listed and FM Approved fire pumps',
        part: 'products',
      },
      {
        label: '2.2.A',
        page: 3,
        text: 'Provide fire pump controllers by Sentinel Controls Group as the campus standard. No alternates.',
        category: 'manufacturers',
        value: 'Sentinel Controls Group fire pump controllers only',
        part: 'products',
        flag: {
          type: 'proprietary-lock-in',
          severity: 'critical',
          title: 'Proprietary fire pump controller lock-in',
          explanation:
            'Campus-standard controller language prevents competing UL-listed controllers from being offered.',
        },
      },
      {
        label: '3.2.A',
        page: 5,
        text: 'Perform a churn test and a rated-flow test before final acceptance by the authority having jurisdiction.',
        category: 'testing',
        value: 'Churn test and rated-flow test before acceptance',
        part: 'execution',
      },
    ],
  };
}

function plumbingCommonWorkResults(): SectionSeed {
  return {
    division: '22',
    divisionTitle: 'Plumbing',
    number: '22 05 00',
    title: 'Common Work Results for Plumbing',
    parts: ['general'],
    pageCount: 4,
    summary:
      'General plumbing requirements covering submittals, coordination, and references to Division 01.',
    attentionPoints: ['Confirm Division 01 cross-references before bid.'],
    extractionCompleteness: 91,
    clauses: [
      {
        label: '1.3.A',
        page: 1,
        text: 'Comply with applicable plumbing codes and the requirements of authorities having jurisdiction.',
        category: 'codes',
        value: 'Applicable plumbing codes and AHJ requirements',
        part: 'general',
      },
      {
        label: '1.5.B',
        page: 2,
        text: 'Submit product data, shop drawings, and coordination drawings in accordance with Section 01 33 00.',
        category: 'submittal-obligations',
        value: 'Product data and coordination drawings per 01 33 00',
        part: 'general',
      },
    ],
  };
}

function plumbingInsulation(): SectionSeed {
  return {
    division: '22',
    divisionTitle: 'Plumbing',
    number: '22 07 00',
    title: 'Plumbing Insulation',
    parts: ['general', 'products'],
    pageCount: 3,
    summary: 'Insulation thicknesses and jacket types for domestic water, sanitary, and storm piping.',
    attentionPoints: ['Verify thickness against energy code tables.'],
    extractionCompleteness: 88,
    clauses: [
      {
        label: '2.1.A',
        page: 1,
        text: 'Insulate domestic hot-water piping with 1-inch fiberglass pipe insulation and ASJ jacket.',
        category: 'materials-standards',
        value: '1 in. fiberglass with ASJ jacket on domestic hot water',
        part: 'products',
      },
      {
        label: '2.2.A',
        page: 2,
        text: 'Insulate sanitary waste piping in conditioned spaces with 1/2-inch closed-cell elastomeric insulation.',
        category: 'materials-standards',
        value: '1/2 in. elastomeric on sanitary waste in conditioned spaces',
        part: 'products',
      },
    ],
  };
}

function plumbingDomesticWaterSpecialties(): SectionSeed {
  return {
    division: '22',
    divisionTitle: 'Plumbing',
    number: '22 11 19',
    title: 'Domestic Water Piping Specialties',
    parts: ['products'],
    pageCount: 4,
    summary: 'Backflow preventers, pressure-reducing valves, and water-hammer arrestors for domestic systems.',
    attentionPoints: ['Confirm valve pressure ratings against upstream piping.'],
    extractionCompleteness: 86,
    clauses: [
      {
        label: '2.1.A',
        page: 1,
        text: 'Provide reduced-pressure backflow preventers listed for the service and rated for system working pressure.',
        category: 'listings-certifications',
        value: 'Listed reduced-pressure backflow preventers',
        part: 'products',
      },
      {
        label: '2.2.A',
        page: 2,
        text: 'Pressure-reducing valves shall maintain downstream pressure within plus or minus 2 psi of setpoint.',
        category: 'pressure-temperature',
        value: '±2 psi downstream pressure regulation',
        part: 'products',
      },
    ],
  };
}

function plumbingDrinkingFountains(): SectionSeed {
  return {
    division: '22',
    divisionTitle: 'Plumbing',
    number: '22 47 00',
    title: 'Drinking Fountains and Water Coolers',
    parts: ['general', 'products'],
    pageCount: 3,
    summary: 'Wall-mounted and floor-standing drinking fountains with bottle fillers and ADA clearances.',
    attentionPoints: ['Verify ADA knee and toe clearances at each location.'],
    extractionCompleteness: 84,
    clauses: [
      {
        label: '2.1.A',
        page: 1,
        text: 'Provide bi-level drinking fountains with bottle-filling stations and electronic sensor operation.',
        category: 'materials-standards',
        value: 'Bi-level fountains with bottle fillers and sensors',
        part: 'products',
      },
    ],
  };
}

function fireCommonWorkResults(): SectionSeed {
  return {
    division: '21',
    divisionTitle: 'Fire Suppression',
    number: '21 05 00',
    title: 'Common Work Results for Fire Suppression',
    parts: ['general'],
    pageCount: 4,
    summary: 'General fire-suppression requirements, submittals, and coordination with the sprinkler contractor.',
    attentionPoints: ['Coordinate ceiling access with architectural reflected ceiling plans.'],
    extractionCompleteness: 90,
    clauses: [
      {
        label: '1.4.A',
        page: 1,
        text: 'Design and install fire-suppression systems in accordance with NFPA standards cited in individual sections.',
        category: 'codes',
        value: 'NFPA standards per section',
        part: 'general',
      },
      {
        label: '1.6.B',
        page: 2,
        text: 'Submit hydraulic calculations, shop drawings, and product data before ordering materials.',
        category: 'submittal-obligations',
        value: 'Hydraulic calcs, shop drawings, and product data',
        part: 'general',
      },
    ],
  };
}

function fireExtinguishingSystems(): SectionSeed {
  return {
    division: '21',
    divisionTitle: 'Fire Suppression',
    number: '21 21 00',
    title: 'Fire-Extinguishing Systems',
    parts: ['general', 'products'],
    pageCount: 5,
    summary: 'Clean-agent and kitchen hood suppression systems where indicated on the drawings.',
    attentionPoints: ['Confirm agent compatibility with occupied spaces.'],
    extractionCompleteness: 87,
    clauses: [
      {
        label: '2.1.A',
        page: 2,
        text: 'Provide kitchen hood wet-chemical suppression systems listed for the cooking appliance types shown.',
        category: 'listings-certifications',
        value: 'Listed wet-chemical hood suppression',
        part: 'products',
      },
    ],
  };
}

function fireStorageTanks(): SectionSeed {
  return {
    division: '21',
    divisionTitle: 'Fire Suppression',
    number: '21 41 00',
    title: 'Storage Tanks for Fire-Suppression Water',
    parts: ['general', 'products', 'execution'],
    pageCount: 4,
    summary: 'Break tanks and storage vessels for fire-pump suction supplies.',
    attentionPoints: ['Verify seismic anchorage details with structural engineer.'],
    extractionCompleteness: 85,
    clauses: [
      {
        label: '2.1.A',
        page: 1,
        text: 'Provide steel storage tanks with epoxy lining rated for fire-protection water service.',
        category: 'materials-standards',
        value: 'Epoxy-lined steel fire-protection storage tanks',
        part: 'products',
      },
    ],
  };
}

function hvacCommonWorkResults(): SectionSeed {
  return {
    division: '23',
    divisionTitle: 'HVAC',
    number: '23 05 00',
    title: 'Common Work Results for HVAC',
    parts: ['general'],
    pageCount: 4,
    summary: 'General HVAC requirements, submittals, and coordination with controls and electrical trades.',
    attentionPoints: ['Align equipment schedules with Division 23 section references.'],
    extractionCompleteness: 92,
    clauses: [
      {
        label: '1.3.A',
        page: 1,
        text: 'Comply with applicable mechanical codes, ASHRAE standards, and the Contract Documents.',
        category: 'codes',
        value: 'Mechanical codes, ASHRAE, and Contract Documents',
        part: 'general',
      },
      {
        label: '1.5.C',
        page: 2,
        text: 'Submit equipment schedules, fan curves, and sound data with the shop drawing package.',
        category: 'submittal-obligations',
        value: 'Equipment schedules, fan curves, and sound data',
        part: 'general',
      },
    ],
  };
}

function hvacInsulation(): SectionSeed {
  return {
    division: '23',
    divisionTitle: 'HVAC',
    number: '23 07 00',
    title: 'HVAC Insulation',
    parts: ['general', 'products'],
    pageCount: 3,
    summary: 'Duct, piping, and equipment insulation with vapor barriers in unconditioned spaces.',
    attentionPoints: ['Confirm indoor versus outdoor jacket requirements.'],
    extractionCompleteness: 89,
    clauses: [
      {
        label: '2.1.A',
        page: 1,
        text: 'Insulate supply and return ductwork in unconditioned spaces with 2-inch fiberglass and vapor barrier.',
        category: 'materials-standards',
        value: '2 in. duct insulation with vapor barrier',
        part: 'products',
      },
    ],
  };
}

function hvacDuctAccessories(): SectionSeed {
  return {
    division: '23',
    divisionTitle: 'HVAC',
    number: '23 33 00',
    title: 'Air Duct Accessories',
    parts: ['products'],
    pageCount: 4,
    summary: 'Volume dampers, fire dampers, access doors, and turning vanes for duct systems.',
    attentionPoints: ['Fire damper ratings must match wall assembly listings.'],
    extractionCompleteness: 88,
    clauses: [
      {
        label: '2.1.A',
        page: 1,
        text: 'Provide fire dampers listed for the wall or floor assembly in which they are installed.',
        category: 'listings-certifications',
        value: 'Listed fire dampers per assembly',
        part: 'products',
      },
      {
        label: '2.2.A',
        page: 2,
        text: 'Manual volume dampers shall be opposed-blade type with locking quadrants.',
        category: 'materials-standards',
        value: 'Opposed-blade volume dampers with locking quadrants',
        part: 'products',
      },
    ],
  };
}

function hvacFans(): SectionSeed {
  return {
    division: '23',
    divisionTitle: 'HVAC',
    number: '23 34 00',
    title: 'HVAC Fans',
    parts: ['general', 'products'],
    pageCount: 5,
    summary: 'Centrifugal and inline fans for exhaust, relief, and smoke-control duty.',
    attentionPoints: ['Verify smoke-control fan listings where applicable.'],
    extractionCompleteness: 86,
    clauses: [
      {
        label: '2.1.A',
        page: 2,
        text: 'Provide belt-driven centrifugal exhaust fans with aluminum wheels and factory-mounted drives.',
        category: 'materials-standards',
        value: 'Belt-driven centrifugal exhaust fans',
        part: 'products',
      },
    ],
  };
}

function hvacBoilers(): SectionSeed {
  return {
    division: '23',
    divisionTitle: 'HVAC',
    number: '23 52 00',
    title: 'Heating Boilers',
    parts: ['general', 'products', 'execution'],
    pageCount: 6,
    summary: 'Condensing hot-water boilers with pumping, relief piping, and combustion air.',
    attentionPoints: ['Confirm gas train components match local utility requirements.'],
    extractionCompleteness: 90,
    clauses: [
      {
        label: '2.1.A',
        page: 2,
        text: 'Provide condensing boilers with minimum 95 percent AFUE and ASME-rated relief valves.',
        category: 'listings-certifications',
        value: '95% AFUE condensing boilers with ASME relief',
        part: 'products',
      },
    ],
  };
}

function fireFireDepartmentConnections(): SectionSeed {
  return {
    division: '21',
    divisionTitle: 'Fire Suppression',
    number: '21 13 39',
    title: 'Fire-Department Connections',
    parts: ['general', 'products'],
    pageCount: 4,
    summary:
      'Fire-department connections require listed inlets, check valves, and signage per local fire authority requirements.',
    attentionPoints: ['Confirm thread type with the local fire department before ordering.'],
    extractionCompleteness: 87,
    clauses: [
      {
        label: '1.2.A',
        page: 1,
        text: 'Provide fire-department connections in locations approved by the local fire authority.',
        category: 'codes',
        value: 'Locations approved by local fire authority',
        part: 'general',
      },
      {
        label: '2.1.A',
        page: 2,
        text: 'Inlets shall be 2-1/2 inch by 2-1/2 inch by 2-1/2 inch, brass, with clapper check valves.',
        category: 'sizes',
        value: '2-1/2 in. brass inlets with clapper checks',
        part: 'products',
      },
      {
        label: '2.2.A',
        page: 3,
        text: 'Provide FDC bodies as manufactured by Halcyon Fire Products. Substitutions are not permitted.',
        category: 'manufacturers',
        value: 'Halcyon Fire Products FDC bodies only',
        part: 'products',
        flag: {
          type: 'sole-source',
          severity: 'major',
          title: 'Sole-source FDC manufacturer',
          explanation:
            'Fire-department connection bodies are limited to one manufacturer without an approved-equal path.',
        },
      },
    ],
  };
}

const SEVERITY_RANK: Record<SpecSeverity, number> = {
  critical: 4,
  major: 3,
  minor: 2,
  info: 1,
};

/** Full division catalogs — every analyzed portfolio SPEC opens on a rich TOC. */
function sectionsForSystemType(systemType: SpecSystemType): SectionSeed[] {
  switch (systemType) {
    case 'plumbing':
      return [
        plumbingCommonWorkResults(),
        plumbingInsulation(),
        plumbingDomesticWater(),
        plumbingDomesticWaterSpecialties(),
        plumbingSanitaryWaste(),
        plumbingStormDrainage(),
        plumbingWaterHeaters(),
        plumbingDrinkingFountains(),
        plumbingNaturalGasPiping(),
      ];
    case 'fire-protection':
      return [
        fireCommonWorkResults(),
        fireStandpipes(),
        fireWetPipeSprinklers(),
        fireFireDepartmentConnections(),
        fireExtinguishingSystems(),
        fireFirePump(),
        fireStorageTanks(),
      ];
    case 'hvac':
      return [
        hvacCommonWorkResults(),
        hvacInsulation(),
        hvacDirectDigitalControls(),
        hvacHydronicPiping(),
        hvacMetalDucts(),
        hvacDuctAccessories(),
        hvacFans(),
        hvacVariableAirVolume(),
        hvacBoilers(),
        hvacAirHandlingUnits(),
      ];
    default:
      return [];
  }
}

/** Division section catalog for TOC expansion (scenario + portfolio builders). */
export function getSectionCatalogForSystemType(systemType: SpecSystemType): SectionSeed[] {
  return ensureMinimumDocumentPages(sectionsForSystemType(systemType));
}

export type SpecDocumentAnalysisFixtures = {
  sections: SpecSection[];
  summaries: SpecSectionSummary[];
  requirements: SpecRequirement[];
  redFlags: SpecRedFlag[];
  citations: SpecCitation[];
  blocks: SpecDocumentBlock[];
};

function sectionIdFromNumber(number: string): string {
  return `sec-${number.replace(/\s/g, '')}`;
}

/**
 * Builds analysis fixtures (sections through blocks) from section seeds.
 * Used by portfolio expansion and scenario documents that need a full TOC.
 */
export function buildDocumentAnalysisFromSectionSeeds(input: {
  documentId: string;
  versionLabel: string;
  sectionSeeds: SectionSeed[];
  startingPage?: number;
  scanned?: boolean;
  updatedDaysAgo?: number;
  sectionId?: (seed: SectionSeed, index: number) => string;
  idPrefix?: string;
  flagState?: SpecRedFlagState;
}): SpecDocumentAnalysisFixtures {
  const {
    documentId,
    versionLabel,
    sectionSeeds,
    startingPage = 1,
    scanned = false,
    updatedDaysAgo = 0,
    sectionId = (seed) => sectionIdFromNumber(seed.number),
    idPrefix = documentId,
    flagState = 'open',
  } = input;

  const sections: SpecSection[] = [];
  const summaries: SpecSectionSummary[] = [];
  const requirements: SpecRequirement[] = [];
  const redFlags: SpecRedFlag[] = [];
  const citations: SpecCitation[] = [];
  const blocks: SpecDocumentBlock[] = [];
  let flagRank = 0;

  sectionSeeds.forEach((sectionSeed, sectionIndex) => {
    const sectionIdValue = sectionId(sectionSeed, sectionIndex);
    const offset = sectionPageStart(sectionSeeds, sectionIndex) + startingPage - 1;
    const pageStart = offset;
    const pageEnd = offset + sectionSeed.pageCount - 1;
    let sectionFlagCount = 0;
    let sectionSeverity: SpecSeverity | undefined;
    let hasLowConfidence = false;

    blocks.push({
      id: `${idPrefix}-blk-${sectionIndex + 1}-h`,
      documentId,
      sectionId: sectionIdValue,
      page: pageStart,
      kind: 'heading',
      text: `SECTION ${sectionSeed.number} — ${sectionSeed.title.toUpperCase()}`,
    });

    sectionSeed.clauses.forEach((clause, clauseIndex) => {
      const blockId = `${idPrefix}-blk-${sectionIndex + 1}-${clauseIndex + 1}`;
      const citation = `${idPrefix}-cit-${sectionIndex + 1}-${clauseIndex + 1}`;
      const page = offset + clause.page - 1;
      const confidence = clause.confidence ?? 'high';
      const confidencePercent = clause.confidencePercent ?? 92;
      if (confidence === 'low') hasLowConfidence = true;

      blocks.push({
        id: blockId,
        documentId,
        sectionId: sectionIdValue,
        page,
        kind: 'paragraph',
        label: clause.label,
        text: clause.text,
      });

      citations.push({
        id: citation,
        documentId,
        versionLabel,
        sectionId: sectionIdValue,
        page,
        blockId,
        excerpt: clause.text,
        anchorType: scanned ? 'approximate' : 'exact',
      });

      requirements.push({
        id: `${idPrefix}-req-${sectionIndex + 1}-${clauseIndex + 1}`,
        sectionId: sectionIdValue,
        category: clause.category,
        value: clause.value,
        part: clause.part,
        confidence,
        confidencePercent,
        citationIds: [citation],
        verification: 'extracted',
      });

      if (clause.flag) {
        flagRank += 1;
        sectionFlagCount += 1;
        if (
          !sectionSeverity ||
          SEVERITY_RANK[clause.flag.severity] > SEVERITY_RANK[sectionSeverity]
        ) {
          sectionSeverity = clause.flag.severity;
        }
        redFlags.push({
          id: `${idPrefix}-rf-${sectionIndex + 1}-${clauseIndex + 1}`,
          sectionId: sectionIdValue,
          type: clause.flag.type,
          severity: clause.flag.severity,
          title: clause.flag.title,
          explanation: clause.flag.explanation,
          confidence: 'high',
          confidencePercent: 93,
          citationIds: [citation],
          state: flagState,
          rank: flagRank,
        });
      }
    });

    sections.push({
      id: sectionIdValue,
      documentId,
      division: sectionSeed.division,
      divisionTitle: sectionSeed.divisionTitle,
      sectionNumber: sectionSeed.number,
      title: sectionSeed.title,
      parts: sectionSeed.parts,
      pageStart,
      pageEnd,
      processingState: 'ready',
      requirementCount: sectionSeed.clauses.length,
      redFlagCount: sectionFlagCount,
      highestSeverity: sectionSeverity,
      hasLowConfidence,
      hasCorrections: false,
      hasProductOpportunities: sectionFlagCount > 0,
    });

    summaries.push({
      sectionId: sectionIdValue,
      summary: sectionSeed.summary,
      attentionPoints: sectionSeed.attentionPoints,
      extractionCompleteness: sectionSeed.extractionCompleteness,
      generatedAt: isoDaysAgo(updatedDaysAgo),
      modelLabel: scanned ? 'mock-ocr-v1' : 'mock-extractor-v1',
    });
  });

  return { sections, summaries, requirements, redFlags, citations, blocks };
}

/** Scanned reissue keeps a sparse body; all other analyzed SPECs use the full catalog. */
function resolvePortfolioSections(seed: PortfolioSpecSeed): SectionSeed[] {
  if (!seed.sections || seed.sections.length === 0) return [];
  if (seed.scanned && seed.sections.length === 1 && seed.sections[0].title === 'Hydronic Piping') {
    return ensureMinimumDocumentPages([hvacScannedReissue()]);
  }
  return ensureMinimumDocumentPages(sectionsForSystemType(seed.systemType));
}

// ── Portfolio descriptors ────────────────────────────────────────────────────

const PORTFOLIO_SPECS: PortfolioSpecSeed[] = [
  // Project 1 — Downtown Convention Center
  {
    id: 'spec-dcc-hvac-bid',
    projectId: '1',
    title: 'HVAC (Bid Set)',
    fileName: 'DCC-Div23-HVAC-Bid-Set.pdf',
    fileType: 'pdf',
    fileSizeBytes: 8_400_000,
    systemType: 'hvac',
    versionNumber: 2,
    status: 'in-review',
    owner: 'Alex Rivera',
    createdDaysAgo: 12,
    updatedDaysAgo: 0,
    location: 'Phoenix, AZ',
    generalContractor: 'Sonoran Builders',
    engineerOfRecord: 'Halstead MEP Engineering',
    valueTags: ['Civic', '$50M+'],
    decidedCount: 5,
    sections: [hvacMetalDucts(), hvacAirHandlingUnits()],
  },
  {
    id: 'spec-dcc-fire-bid',
    projectId: '1',
    title: 'Fire Suppression (Bid Set)',
    fileName: 'DCC-Div21-Fire-Bid-Set.pdf',
    fileType: 'pdf',
    fileSizeBytes: 6_100_000,
    systemType: 'fire-protection',
    versionNumber: 1,
    status: 'processing',
    activeStageIndex: 2,
    owner: 'Sam Chen',
    createdDaysAgo: 0,
    updatedDaysAgo: 0,
    location: 'Phoenix, AZ',
    generalContractor: 'Sonoran Builders',
    engineerOfRecord: 'Verity Fire Protection Engineers',
    valueTags: ['Civic', '$50M+'],
    // Sections are seeded while processing runs so the finished analysis opens
    // on real clauses instead of the generic upload placeholder.
    sections: [fireWetPipeSprinklers(), fireStandpipes()],
  },
  {
    id: 'spec-dcc-plumb-addendum',
    projectId: '1',
    title: 'Addendum 02 — Plumbing',
    fileName: 'DCC-Addendum-02-Div22.pdf',
    fileType: 'pdf',
    fileSizeBytes: 2_200_000,
    systemType: 'plumbing',
    role: 'addendum',
    versionNumber: 1,
    status: 'analysis-failed',
    owner: 'Alex Rivera',
    createdDaysAgo: 1,
    updatedDaysAgo: 1,
    location: 'Phoenix, AZ',
    generalContractor: 'Sonoran Builders',
    engineerOfRecord: 'Halstead MEP Engineering',
    valueTags: ['Civic', '$50M+'],
    scanned: true,
    failureReason:
      'Too few pages could be read as text to continue. Re-scan the addendum at a higher quality and retry.',
  },
  {
    id: 'spec-dcc-plumb-permit',
    projectId: '1',
    title: 'Plumbing (Permit Set)',
    fileName: 'DCC-Div22-Plumbing-Permit-Set.docx',
    fileType: 'docx',
    fileSizeBytes: 4_800_000,
    systemType: 'plumbing',
    versionNumber: 3,
    status: 'in-review',
    owner: 'Jordan Lee',
    createdDaysAgo: 20,
    updatedDaysAgo: 0,
    location: 'Phoenix, AZ',
    generalContractor: 'Sonoran Builders',
    engineerOfRecord: 'Halstead MEP Engineering',
    valueTags: ['Civic', '$50M+'],
    decidedCount: 4,
    sections: [plumbingDomesticWater(), plumbingSanitaryWaste()],
  },
  {
    id: 'spec-dcc-hvac-controls',
    projectId: '1',
    title: 'HVAC Controls',
    fileName: 'DCC-Div23-Controls.docx',
    fileType: 'docx',
    fileSizeBytes: 3_300_000,
    systemType: 'hvac',
    versionNumber: 2,
    status: 'ready-to-export',
    owner: 'Priya Nair',
    createdDaysAgo: 16,
    updatedDaysAgo: 2,
    location: 'Phoenix, AZ',
    generalContractor: 'Sonoran Builders',
    engineerOfRecord: 'Cardinal Mechanical Design',
    valueTags: ['Civic', '$50M+'],
    sections: [hvacDirectDigitalControls()],
  },
  {
    id: 'spec-dcc-fire-ifc',
    projectId: '1',
    title: 'Fire Suppression (IFC)',
    fileName: 'DCC-Div21-Fire-IFC.docx',
    fileType: 'docx',
    fileSizeBytes: 5_400_000,
    systemType: 'fire-protection',
    versionNumber: 4,
    status: 'exported',
    owner: 'Sam Chen',
    createdDaysAgo: 34,
    updatedDaysAgo: 4,
    location: 'Phoenix, AZ',
    generalContractor: 'Sonoran Builders',
    engineerOfRecord: 'Verity Fire Protection Engineers',
    valueTags: ['Civic', '$50M+'],
    sections: [fireWetPipeSprinklers()],
  },

  // Project 2 — Riverside Office Park
  {
    id: 'spec-rop-plumb-bid',
    projectId: '2',
    title: 'Plumbing (Bid Set)',
    fileName: 'ROP-Div22-Plumbing-Bid-Set.pdf',
    fileType: 'pdf',
    fileSizeBytes: 7_600_000,
    systemType: 'plumbing',
    versionNumber: 3,
    status: 'in-review',
    owner: 'Alex Rivera',
    createdDaysAgo: 9,
    updatedDaysAgo: 1,
    location: 'Tucson, AZ',
    generalContractor: 'Pacific Build Group',
    engineerOfRecord: 'Puget Consulting Engineers',
    valueTags: ['Office', '$20M–$50M'],
    decidedCount: 6,
    sections: [plumbingDomesticWater(), plumbingWaterHeaters()],
  },
  {
    id: 'spec-rop-fire-bid',
    projectId: '2',
    title: 'Fire Suppression (Bid Set)',
    fileName: 'ROP-Div21-Fire-Bid-Set.pdf',
    fileType: 'pdf',
    fileSizeBytes: 6_900_000,
    systemType: 'fire-protection',
    versionNumber: 1,
    status: 'ready-to-review',
    owner: 'Sam Chen',
    createdDaysAgo: 3,
    updatedDaysAgo: 2,
    location: 'Tucson, AZ',
    generalContractor: 'Pacific Build Group',
    engineerOfRecord: 'Verity Fire Protection Engineers',
    valueTags: ['Office', '$20M–$50M'],
    sections: [fireWetPipeSprinklers(), fireStandpipes()],
  },
  {
    id: 'spec-rop-hvac-bid',
    projectId: '2',
    title: 'HVAC (Bid Set)',
    fileName: 'ROP-Div23-HVAC-Bid-Set.pdf',
    fileType: 'pdf',
    fileSizeBytes: 9_800_000,
    systemType: 'hvac',
    versionNumber: 2,
    status: 'processing',
    activeStageIndex: 2,
    owner: 'Priya Nair',
    createdDaysAgo: 0,
    updatedDaysAgo: 0,
    location: 'Tucson, AZ',
    generalContractor: 'Pacific Build Group',
    engineerOfRecord: 'Cardinal Mechanical Design',
    valueTags: ['Office', '$20M–$50M'],
    sections: [hvacMetalDucts(), hvacAirHandlingUnits()],
  },
  {
    id: 'spec-rop-plumb-final',
    projectId: '2',
    title: 'Plumbing (Final Issue)',
    fileName: 'ROP-Div22-Plumbing-Final.docx',
    fileType: 'docx',
    fileSizeBytes: 4_100_000,
    systemType: 'plumbing',
    versionNumber: 2,
    status: 'exported',
    owner: 'Jordan Lee',
    createdDaysAgo: 28,
    updatedDaysAgo: 6,
    location: 'Tucson, AZ',
    generalContractor: 'Pacific Build Group',
    engineerOfRecord: 'Puget Consulting Engineers',
    valueTags: ['Office', '$20M–$50M'],
    sections: [plumbingSanitaryWaste()],
  },

  // Project 3 — Highland Retail Plaza
  {
    id: 'spec-hrp-hvac-shell',
    projectId: '3',
    title: 'HVAC (Shell)',
    fileName: 'HRP-Div23-Shell-Core.pdf',
    fileType: 'pdf',
    fileSizeBytes: 5_200_000,
    systemType: 'hvac',
    versionNumber: 1,
    status: 'ready-to-review',
    owner: 'Priya Nair',
    createdDaysAgo: 4,
    updatedDaysAgo: 3,
    location: 'Scottsdale, AZ',
    generalContractor: 'Highland Contractors',
    engineerOfRecord: 'Cardinal Mechanical Design',
    valueTags: ['Retail', '$5M–$20M'],
    sections: [hvacAirHandlingUnits()],
  },
  {
    id: 'spec-hrp-plumb-scan',
    projectId: '3',
    title: 'Plumbing (Rescan)',
    fileName: 'HRP-Div22-Plumbing-Scan.pdf',
    fileType: 'pdf',
    fileSizeBytes: 21_500_000,
    systemType: 'plumbing',
    versionNumber: 2,
    status: 'analysis-failed',
    owner: 'Jordan Lee',
    createdDaysAgo: 2,
    updatedDaysAgo: 2,
    location: 'Scottsdale, AZ',
    generalContractor: 'Highland Contractors',
    engineerOfRecord: 'Puget Consulting Engineers',
    valueTags: ['Retail', '$5M–$20M'],
    scanned: true,
    failureReason:
      'The scan quality was too low to build a reliable document structure. Replace the file with a text-based PDF and retry.',
  },
  {
    id: 'spec-hrp-fire-ti',
    projectId: '3',
    title: 'Fire Suppression (TI)',
    fileName: 'HRP-Div21-Fire-TI.docx',
    fileType: 'docx',
    fileSizeBytes: 3_700_000,
    systemType: 'fire-protection',
    versionNumber: 2,
    status: 'in-review',
    owner: 'Sam Chen',
    createdDaysAgo: 7,
    updatedDaysAgo: 1,
    location: 'Scottsdale, AZ',
    generalContractor: 'Highland Contractors',
    engineerOfRecord: 'Verity Fire Protection Engineers',
    valueTags: ['Retail', '$5M–$20M'],
    decidedCount: 2,
    sections: [fireWetPipeSprinklers()],
  },

  // Project 4 — Desert Logistics Hub
  {
    id: 'spec-dlh-plumb-manual',
    projectId: '4',
    title: 'Plumbing (Vol. 2)',
    fileName: 'DLH-Project-Manual-Vol2-Div22.pdf',
    fileType: 'pdf',
    fileSizeBytes: 32_000_000,
    systemType: 'plumbing',
    versionNumber: 2,
    status: 'in-review',
    owner: 'Alex Rivera',
    createdDaysAgo: 15,
    updatedDaysAgo: 0,
    location: 'Mesa, AZ',
    generalContractor: 'Front Range Constructors',
    engineerOfRecord: 'Summit Engineering Partners',
    valueTags: ['Industrial', '$20M–$50M'],
    decidedCount: 3,
    sections: [plumbingDomesticWater()],
  },
  {
    id: 'spec-dlh-fire-warehouse',
    projectId: '4',
    title: 'Fire Suppression (ESFR)',
    fileName: 'DLH-Div21-Warehouse-ESFR.pdf',
    fileType: 'pdf',
    fileSizeBytes: 7_200_000,
    systemType: 'fire-protection',
    versionNumber: 3,
    status: 'ready-to-export',
    owner: 'Sam Chen',
    createdDaysAgo: 22,
    updatedDaysAgo: 3,
    location: 'Mesa, AZ',
    generalContractor: 'Front Range Constructors',
    engineerOfRecord: 'Verity Fire Protection Engineers',
    valueTags: ['Industrial', '$20M–$50M'],
    sections: [fireWetPipeSprinklers(), fireStandpipes()],
  },
  {
    id: 'spec-dlh-hvac-office',
    projectId: '4',
    title: 'HVAC (Office)',
    fileName: 'DLH-Div23-Office-Build-Out.docx',
    fileType: 'docx',
    fileSizeBytes: 2_900_000,
    systemType: 'hvac',
    versionNumber: 1,
    status: 'ready-to-review',
    owner: 'Priya Nair',
    createdDaysAgo: 2,
    updatedDaysAgo: 1,
    location: 'Mesa, AZ',
    generalContractor: 'Front Range Constructors',
    engineerOfRecord: 'Cardinal Mechanical Design',
    valueTags: ['Industrial', '$20M–$50M'],
    sections: [hvacMetalDucts()],
  },

  // Project 5 — Metro Rail Station Fit-Out
  {
    id: 'spec-mrs-fire-platform',
    projectId: '5',
    title: 'Fire Suppression (Platform)',
    fileName: 'MRS-Div21-Platform.pdf',
    fileType: 'pdf',
    fileSizeBytes: 5_800_000,
    systemType: 'fire-protection',
    versionNumber: 1,
    status: 'processing',
    activeStageIndex: 1,
    owner: 'Sam Chen',
    createdDaysAgo: 0,
    updatedDaysAgo: 0,
    location: 'Tempe, AZ',
    generalContractor: 'Transit Works Group',
    engineerOfRecord: 'Verity Fire Protection Engineers',
    valueTags: ['Transit', '$20M–$50M'],
    sections: [fireStandpipes()],
  },
  {
    id: 'spec-mrs-hvac-tunnel',
    projectId: '5',
    title: 'HVAC (Tunnel)',
    fileName: 'MRS-Div23-Tunnel-Ventilation.pdf',
    fileType: 'pdf',
    fileSizeBytes: 11_400_000,
    systemType: 'hvac',
    versionNumber: 1,
    status: 'ready-to-review',
    owner: 'Priya Nair',
    createdDaysAgo: 5,
    updatedDaysAgo: 4,
    location: 'Tempe, AZ',
    generalContractor: 'Transit Works Group',
    engineerOfRecord: 'Cardinal Mechanical Design',
    valueTags: ['Transit', '$20M–$50M'],
    sections: [hvacScannedReissue(), hvacDirectDigitalControls()],
  },
];

// ── Builder ──────────────────────────────────────────────────────────────────

/** Decisions cycle so review lists show accepted, deferred, and denied together. */
const IN_REVIEW_DECISION_CYCLE: SpecRecommendationDecision[] = [
  'accepted',
  'accepted',
  'later',
  'denied',
];

const APPROVED_DECISION_CYCLE: SpecRecommendationDecision[] = [
  'accepted',
  'accepted',
  'accepted',
  'denied',
];

function isDecided(status: PortfolioStatus): boolean {
  return status === 'ready-to-export' || status === 'exported';
}

function decisionCycleFor(status: PortfolioStatus): SpecRecommendationDecision[] {
  return isDecided(status) ? APPROVED_DECISION_CYCLE : IN_REVIEW_DECISION_CYCLE;
}

function clauseCount(seed: PortfolioSpecSeed): number {
  return resolvePortfolioSections(seed).reduce(
    (total, section) => total + section.clauses.length,
    0,
  );
}

function decidedCountFor(seed: PortfolioSpecSeed): number {
  const total = clauseCount(seed);
  if (isDecided(seed.status)) return total;
  return Math.min(seed.decidedCount ?? 0, total);
}

function citationId(documentId: string, sectionIndex: number, clauseIndex: number): string {
  return `${documentId}-cit-${sectionIndex + 1}-${clauseIndex + 1}`;
}

function recommendationId(documentId: string, citation: string): string {
  return `rec:${documentId}:${citation}`;
}

/**
 * Seeded review decisions for portfolio recommendations, keyed by the
 * deterministic recommendation id built in `specAnalysisSeed`.
 */
function buildPortfolioDecisions(): Record<string, SpecRecommendationDecision> {
  const decisions: Record<string, SpecRecommendationDecision> = {};
  for (const seed of PORTFOLIO_SPECS) {
    const remaining = decidedCountFor(seed);
    if (remaining === 0) continue;
    const cycle = decisionCycleFor(seed.status);
    let assigned = 0;
    const resolvedSections = resolvePortfolioSections(seed);
    resolvedSections.forEach((section, sectionIndex) => {
      section.clauses.forEach((_, clauseIndex) => {
        if (assigned >= remaining) return;
        const id = recommendationId(seed.id, citationId(seed.id, sectionIndex, clauseIndex));
        decisions[id] = cycle[assigned % cycle.length];
        assigned += 1;
      });
    });
  }
  return decisions;
}

export const SPEC_PORTFOLIO_DECISIONS: Record<string, SpecRecommendationDecision> =
  buildPortfolioDecisions();

function buildPreviousVersions(
  seed: PortfolioSpecSeed,
  master: SpecAscMaster,
): SpecDocumentVersionRecord[] {
  const records: SpecDocumentVersionRecord[] = [];
  for (let version = seed.versionNumber - 1; version >= 1; version -= 1) {
    const age = seed.createdDaysAgo + (seed.versionNumber - version) * 7;
    records.push({
      id: `${seed.id}-v${version}`,
      versionNumber: version,
      versionLabel: `v${version}`,
      fileName: seed.fileName.replace(/(\.[a-z]+)$/i, `-v${version}$1`),
      fileSizeBytes: Math.round(seed.fileSizeBytes * 0.92),
      uploadedAt: isoDaysAgo(age),
      uploadedBy: seed.owner,
      ascMaster: master,
      reviewState: 'corrected',
    });
  }
  return records;
}

export type SpecPortfolioFixtures = {
  documents: SpecDocument[];
  sections: SpecSection[];
  summaries: SpecSectionSummary[];
  requirements: SpecRequirement[];
  redFlags: SpecRedFlag[];
  citations: SpecCitation[];
  blocks: SpecDocumentBlock[];
};

/**
 * Expands the portfolio descriptors into store-shaped fixtures.
 * `resolveMaster` is injected so the ASC Master catalog stays the single source
 * of master labels and versions.
 */
export function buildSpecPortfolio(
  resolveMaster: (systemType: SpecSystemType) => SpecAscMaster,
): SpecPortfolioFixtures {
  const documents: SpecDocument[] = [];
  const sections: SpecSection[] = [];
  const summaries: SpecSectionSummary[] = [];
  const requirements: SpecRequirement[] = [];
  const redFlags: SpecRedFlag[] = [];
  const citations: SpecCitation[] = [];
  const blocks: SpecDocumentBlock[] = [];

  for (const seed of PORTFOLIO_SPECS) {
    const master = resolveMaster(seed.systemType);
    const versionLabel = `v${seed.versionNumber}`;
    const seedSections = resolvePortfolioSections(seed);
    const decided = decidedCountFor(seed);
    const approved = isDecided(seed.status);
    const flagState: SpecRedFlagState = approved ? 'resolved-in-working-copy' : 'open';

    const built = buildDocumentAnalysisFromSectionSeeds({
      documentId: seed.id,
      versionLabel,
      sectionSeeds: seedSections,
      scanned: seed.scanned,
      updatedDaysAgo: seed.updatedDaysAgo,
      sectionId: (_, index) => `${seed.id}-sec-${index + 1}`,
      idPrefix: seed.id,
      flagState,
    });

    const documentFlagCount = built.redFlags.length;
    const highestSeverity = built.redFlags.reduce<SpecSeverity | undefined>(
      (best, flag) => {
        if (!best || SEVERITY_RANK[flag.severity] > SEVERITY_RANK[best]) {
          return flag.severity;
        }
        return best;
      },
      undefined,
    );

    sections.push(...built.sections);
    summaries.push(...built.summaries);
    requirements.push(...built.requirements);
    redFlags.push(...built.redFlags);
    citations.push(...built.citations);
    blocks.push(...built.blocks);

    const processing = seed.status === 'processing';
    const failed = seed.status === 'analysis-failed';

    documents.push({
      id: seed.id,
      title: seed.title,
      fileName: seed.fileName,
      fileType: seed.fileType,
      fileSizeBytes: seed.fileSizeBytes,
      destination: 'project',
      projectId: seed.projectId,
      role: seed.role ?? 'project-specification',
      versionLabel,
      versionNumber: seed.versionNumber,
      previousVersions:
        seed.versionNumber > 1 ? buildPreviousVersions(seed, master) : undefined,
      divisionHint: seedSections[0]?.division,
      systemType: seed.systemType,
      ascMaster: master,
      ascMasterConfirmed: true,
      reanalysisRequired: seed.status === 'reanalysis-required' || undefined,
      exportRecord:
        seed.status === 'exported'
          ? {
              id: `export-${seed.id}`,
              exportedAt: isoDaysAgo(seed.updatedDaysAgo),
              format: 'docx',
            }
          : undefined,
      processingState: processing ? 'processing' : failed ? 'failed' : 'ready',
      stages: processing
        ? createV2ProcessingStages(seed.activeStageIndex ?? 1)
        : failed
          ? failedV2ProcessingStages('ocr-layout')
          : completeV2ProcessingStages(),
      reviewState: approved
        ? 'approved'
        : seed.status === 'in-review' || seed.status === 'reanalysis-required'
          ? 'in-review'
          : 'not-started',
      owner: seed.owner,
      createdAt: isoDaysAgo(seed.createdDaysAgo),
      updatedAt: isoDaysAgo(seed.updatedDaysAgo),
      sectionCount: seedSections.length,
      requirementCount: clauseCount(seed),
      reviewedRequirementCount: decided,
      unresolvedRedFlagCount: approved ? 0 : documentFlagCount,
      highestSeverity: approved ? undefined : highestSeverity,
      scanned: Boolean(seed.scanned),
      accessLevel: 'editor',
      archived: false,
      sourcePreviewReady: !failed,
      failureReason: seed.failureReason,
      location: seed.location,
      generalContractor: seed.generalContractor,
      engineerOfRecord: seed.engineerOfRecord,
      divisions: [...new Set(seedSections.map((section) => section.division))],
      valueTags: seed.valueTags,
    });
  }

  return { documents, sections, summaries, requirements, redFlags, citations, blocks };
}
