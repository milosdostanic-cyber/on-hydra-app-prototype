/**
 * Expands sparse SPEC fixtures into continuous, page-complete document bodies.
 * Every analyzed document gets boilerplate “OK” paragraphs plus a minimum page count.
 */
import type { SpecCitation, SpecDocumentBlock, SpecSection, SpecSectionPart } from './types';

export const MIN_SPEC_DOCUMENT_PAGES = 20;

const PART_HEADINGS: Record<SpecSectionPart, string> = {
  general: 'PART 1 — GENERAL',
  products: 'PART 2 — PRODUCTS',
  execution: 'PART 3 — EXECUTION',
};

const FILLER_BY_PART: Record<SpecSectionPart, string[]> = {
  general: [
    'Work included under this Section includes all labor, materials, equipment, and incidentals required for complete, operable systems.',
    'Coordinate installation with related trades and provide openings, sleeves, and supports as required by the Contract Documents.',
    'Comply with applicable codes, standards, and the requirements of authorities having jurisdiction.',
    'Submit submittals in accordance with Section 01 33 00 and the requirements of this Section.',
    'Verify dimensions and field conditions before fabrication or ordering materials.',
    'Provide qualified personnel and supervision for all work specified herein.',
    'Maintain a clean and safe work area and protect existing construction from damage during installation.',
    'Sequence work to avoid conflicts with other trades and to maintain required access and egress.',
    'Provide temporary facilities, power, and ventilation required for testing and commissioning.',
    'Record as-built conditions and update project documentation before final acceptance.',
  ],
  products: [
    'Provide new materials that meet the quality standards of the referenced specifications and listings.',
    'Deliver products in original, unopened containers bearing the manufacturer name and applicable listings.',
    'Store materials in a clean, dry location and protect from damage until installation.',
    'Provide products from manufacturers with established service representatives in the project region.',
    'Where a basis-of-design product is named, equivalent products may be considered when they meet every stated requirement.',
    'Replace defective or damaged products at no additional cost to the Owner.',
    'Provide spare parts, tools, and accessories required for maintenance as indicated on the drawings.',
    'Label all equipment and components in accordance with project identification standards.',
    'Use only fasteners, gaskets, and accessories recommended by the equipment manufacturer.',
    'Obtain Owner approval before substituting materials not specifically named in the Contract Documents.',
  ],
  execution: [
    'Install products in accordance with manufacturer instructions and the Contract Documents.',
    'Cut, fit, and align work accurately. Restore adjacent finishes disturbed by this work.',
    'Clean exposed surfaces after installation and remove construction debris from the site.',
    'Perform tests and inspections required by codes and this Section and provide written results.',
    'Demonstrate operational readiness to the Owner or designated representative before acceptance.',
    'Provide maintenance data, spare parts, and training as specified in Section 01 77 00.',
    'Adjust and balance systems after installation to achieve specified performance criteria.',
    'Repair or replace work that does not conform to the requirements of this Section.',
    'Protect installed work from damage until final acceptance of the project.',
    'Coordinate startup and commissioning with the Owner and other affected trades.',
  ],
};

/** Target body blocks per A4 page so the editor preview reads as a full specification sheet. */
const BODY_BLOCKS_PER_A4_PAGE = 11;

type SectionSeedLike = {
  pageCount: number;
};

/** Ensures the summed section length meets the minimum document page count. */
export function ensureMinimumDocumentPages<T extends SectionSeedLike>(
  sections: T[],
  minPages = MIN_SPEC_DOCUMENT_PAGES,
): T[] {
  if (sections.length === 0) return sections;
  const cloned = sections.map((section) => ({ ...section }));
  const total = cloned.reduce((sum, section) => sum + section.pageCount, 0);
  if (total >= minPages) return cloned;
  const last = cloned[cloned.length - 1];
  cloned[cloned.length - 1] = {
    ...last,
    pageCount: last.pageCount + (minPages - total),
  };
  return cloned;
}

/** Consecutive page 1…N offsets for portfolio section builders. */
export function sectionPageStart(sectionSeeds: SectionSeedLike[], index: number): number {
  let start = 1;
  for (let i = 0; i < index; i += 1) {
    start += sectionSeeds[i].pageCount;
  }
  return start;
}

function partForPage(
  page: number,
  pageStart: number,
  pageEnd: number,
  parts: SpecSectionPart[],
): SpecSectionPart {
  const span = Math.max(1, pageEnd - pageStart + 1);
  const index = Math.min(
    parts.length - 1,
    Math.floor(((page - pageStart) / span) * parts.length),
  );
  return parts[index] ?? 'general';
}

function labelForPage(page: number, pageStart: number, indexOnPage: number): string {
  const partNumber = Math.floor((page - pageStart) / 3) + 1;
  const suffix = String.fromCharCode(65 + (indexOnPage % 3));
  return `${partNumber}.${((page - pageStart) % 3) + 1}.${suffix}`;
}

function pickFiller(part: SpecSectionPart, page: number, indexOnPage: number): string {
  const bank = FILLER_BY_PART[part];
  return bank[(page + indexOnPage) % bank.length];
}

function sortBlocks(a: SpecDocumentBlock, b: SpecDocumentBlock): number {
  if (a.page !== b.page) return a.page - b.page;
  const kindRank = { heading: 0, subheading: 1, paragraph: 2, 'list-item': 3 } as const;
  const rankDiff = kindRank[a.kind] - kindRank[b.kind];
  if (rankDiff !== 0) return rankDiff;
  return a.id.localeCompare(b.id);
}

function expandSectionBlocks(input: {
  documentId: string;
  section: SpecSection;
  sectionIndex: number;
  existingBlocks: SpecDocumentBlock[];
}): SpecDocumentBlock[] {
  const { documentId, section, sectionIndex, existingBlocks } = input;
  const { pageStart, pageEnd } = section;
  const existingByPage = new Map<number, SpecDocumentBlock[]>();
  for (const block of existingBlocks) {
    const list = existingByPage.get(block.page) ?? [];
    list.push(block);
    existingByPage.set(block.page, list);
  }

  const output: SpecDocumentBlock[] = [];
  const partHeadingPages = new Set<number>();
  const span = Math.max(1, pageEnd - pageStart + 1);
  for (const part of section.parts) {
    const partIndex = section.parts.indexOf(part);
    const page = pageStart + Math.floor((span / section.parts.length) * partIndex);
    partHeadingPages.add(page);
  }

  for (let page = pageStart; page <= pageEnd; page += 1) {
    const part = partForPage(page, pageStart, pageEnd, section.parts);
    if (partHeadingPages.has(page)) {
      output.push({
        id: `${documentId}-part-${sectionIndex + 1}-${part}`,
        documentId,
        sectionId: section.id,
        page,
        kind: 'subheading',
        text: PART_HEADINGS[part],
      });
    }

    const onPage = existingByPage.get(page) ?? [];
    const chromeBlocks = onPage.filter(
      (block) => block.kind === 'heading' || block.kind === 'subheading',
    );
    const bodyBlocks = onPage.filter(
      (block) => block.kind !== 'heading' && block.kind !== 'subheading',
    );

    output.push(...chromeBlocks);
    output.push(...bodyBlocks);

    const fillersNeeded = Math.max(
      0,
      BODY_BLOCKS_PER_A4_PAGE - bodyBlocks.length - chromeBlocks.length,
    );
    for (let index = 0; index < fillersNeeded; index += 1) {
      const isListItem = index % 4 === 3;
      output.push({
        id: `${documentId}-fill-${sectionIndex + 1}-${page}-${index}`,
        documentId,
        sectionId: section.id,
        page,
        kind: isListItem ? 'list-item' : 'paragraph',
        label: labelForPage(page, pageStart, bodyBlocks.length + index),
        text: pickFiller(part, page, bodyBlocks.length + index),
      });
    }
  }

  return output.sort(sortBlocks);
}

function remapSectionPages(
  section: SpecSection,
  nextStart: number,
  blocks: SpecDocumentBlock[],
  citations: SpecCitation[],
): SpecSection {
  const count = Math.max(1, section.pageEnd - section.pageStart + 1);
  const pageStart = nextStart;
  const pageEnd = nextStart + count - 1;

  for (const block of blocks) {
    if (block.sectionId !== section.id) continue;
    const relative = block.page - section.pageStart;
    block.page = pageStart + Math.max(0, Math.min(count - 1, relative));
  }

  for (const citation of citations) {
    if (citation.sectionId !== section.id) continue;
    const relative = citation.page - section.pageStart;
    citation.page = pageStart + Math.max(0, Math.min(count - 1, relative));
  }

  return { ...section, pageStart, pageEnd };
}

/**
 * Normalizes page ranges, enforces the minimum page count, and fills each section
 * with continuous boilerplate so the editor shows a complete document.
 */
export function expandSpecDocumentBodies(input: {
  sections: SpecSection[];
  blocks: SpecDocumentBlock[];
  citations: SpecCitation[];
  minPages?: number;
}): {
  sections: SpecSection[];
  blocks: SpecDocumentBlock[];
  citations: SpecCitation[];
} {
  const minPages = input.minPages ?? MIN_SPEC_DOCUMENT_PAGES;
  const sections = input.sections.map((section) => ({ ...section }));
  const blocks = input.blocks.map((block) => ({ ...block }));
  const citations = input.citations.map((citation) => ({ ...citation }));

  const documentIds = [...new Set(sections.map((section) => section.documentId))];
  const nextBlocks = blocks.filter(
    (block) => !documentIds.includes(block.documentId),
  );
  const nextSections = sections.filter(
    (section) => !documentIds.includes(section.documentId),
  );
  const nextCitations = citations.filter(
    (citation) => !documentIds.includes(citation.documentId),
  );

  for (const documentId of documentIds) {
    const docSections = sections
      .filter((section) => section.documentId === documentId)
      .sort((a, b) => a.pageStart - b.pageStart);
    if (docSections.length === 0) continue;

    const docBlocks = blocks.filter((block) => block.documentId === documentId);
    const docCitations = citations.filter((citation) => citation.documentId === documentId);

    let cursor = 1;
    const normalizedSections: SpecSection[] = [];
    for (const section of docSections) {
      const normalized = remapSectionPages(section, cursor, docBlocks, docCitations);
      normalizedSections.push(normalized);
      cursor = normalized.pageEnd + 1;
    }

    if (cursor - 1 < minPages) {
      const last = normalizedSections[normalizedSections.length - 1];
      const extra = minPages - (cursor - 1);
      last.pageEnd += extra;
    }

    normalizedSections.forEach((section, sectionIndex) => {
      const sectionBlocks = docBlocks.filter((block) => block.sectionId === section.id);
      nextSections.push(section);
      nextBlocks.push(
        ...expandSectionBlocks({
          documentId,
          section,
          sectionIndex,
          existingBlocks: sectionBlocks,
        }),
      );
    });

    nextCitations.push(...docCitations);
  }

  return {
    sections: nextSections,
    blocks: nextBlocks,
    citations: nextCitations,
  };
}
