import type {
  SpecCitation,
  SpecDocument,
  SpecDocumentBlock,
  SpecProductSuggestion,
  SpecRecommendation,
  SpecRecommendationAction,
  SpecRecommendationDecision,
  SpecRecommendationPriority,
  SpecRecommendationType,
  SpecRedFlag,
  SpecRequirement,
  SpecSection,
} from './types';

import { SPEC_PORTFOLIO_DECISIONS } from './specPortfolioSeed';

/** Re-export — legacy analysis fixtures still live in `specDocumentsSeed`. */
export { buildScenarioFixtures } from './specDocumentsSeed';

export type SpecRecommendationSourceBag = {
  document: SpecDocument;
  sections: SpecSection[];
  requirements: SpecRequirement[];
  redFlags: SpecRedFlag[];
  productSuggestions: SpecProductSuggestion[];
  citations: SpecCitation[];
  blocks: SpecDocumentBlock[];
};

/**
 * Maps a recommendation onto Matt’s six action-type facets (#14).
 * Deterministic from existing fields — no seed rewrite required.
 */
export function deriveSpecRecommendationAction(
  recommendation: Pick<
    SpecRecommendation,
    'type' | 'category' | 'title' | 'productEvidence'
  >,
): SpecRecommendationAction {
  const category = recommendation.category.toLowerCase();
  const title = recommendation.title.toLowerCase();
  const evidence = recommendation.productEvidence;
  const hasNoFitOnly =
    evidence.length > 0 && evidence.every((product) => product.fit === 'no-fit');
  const hasCatalogPart = evidence.some(
    (product) => product.fit !== 'no-fit' && Boolean(product.sku),
  );
  const manufacturerCue =
    category.includes('manufacturer') ||
    title.includes('manufacturer') ||
    title.includes('manufacturers');

  if (hasNoFitOnly) return 'blocked';

  if (recommendation.type === 'language') return 'rewrite-language';

  if (recommendation.type === 'product') {
    if (manufacturerCue) return 'add-manufacturer';
    if (hasCatalogPart) return 'swap-part';
    return 'add-product';
  }

  if (recommendation.type === 'coordination' || recommendation.type === 'compliance') {
    if (manufacturerCue) return 'add-manufacturer';
    return 'update-reference';
  }

  return 'blocked';
}

const DECISION_BY_RECOMMENDATION_ID: Record<string, SpecRecommendationDecision> = {
  'rec:spec-prop-23:cit-prop-1': 'accepted',
  'rec:spec-contradict:cit-cont-a': 'later',
  'rec:spec-contradict:cit-cont-b': 'denied',
  'rec:spec-nofit-22:cit-nofit-1': 'denied',
  ...SPEC_PORTFOLIO_DECISIONS,
};

const REQUIREMENT_CATEGORY_LABEL: Record<SpecRequirement['category'], string> = {
  manufacturers: 'Manufacturer language',
  'basis-of-design': 'Basis of design',
  'materials-standards': 'Material standard',
  'pressure-temperature': 'Performance requirement',
  'joining-methods': 'Joining method',
  sizes: 'Size requirement',
  'listings-certifications': 'Listing or certification',
  testing: 'Testing requirement',
  'submittal-obligations': 'Submittal requirement',
  codes: 'Code reference',
  'substitution-policy': 'Substitution language',
};

function recommendationId(documentId: string, citationId: string): string {
  return `rec:${documentId}:${citationId}`;
}

function recommendationPriority(
  redFlags: SpecRedFlag[],
  products: SpecProductSuggestion[],
  requirements: SpecRequirement[],
): SpecRecommendationPriority {
  if (redFlags.some((flag) => flag.severity === 'critical' || flag.severity === 'major')) {
    return 'high';
  }
  if (products.some((product) => product.fit === 'no-fit')) return 'high';
  if (
    redFlags.some((flag) => flag.severity === 'minor') ||
    products.some((product) => product.fit === 'possible') ||
    requirements.some((requirement) => requirement.confidence === 'low')
  ) {
    return 'medium';
  }
  return 'low';
}

function recommendationType(
  redFlags: SpecRedFlag[],
  products: SpecProductSuggestion[],
  requirements: SpecRequirement[],
): SpecRecommendationType {
  if (redFlags.some((flag) => flag.type === 'contradiction')) return 'coordination';
  if (
    products.length > 0 ||
    redFlags.some((flag) =>
      ['sole-source', 'no-substitutions', 'no-prior-approval', 'proprietary-lock-in'].includes(
        flag.type,
      ),
    )
  ) {
    return 'product';
  }
  if (requirements.some((requirement) => requirement.category === 'codes')) return 'compliance';
  return 'language';
}

function recommendationCopy(
  type: SpecRecommendationType,
  redFlags: SpecRedFlag[],
  products: SpecProductSuggestion[],
  requirements: SpecRequirement[],
): Pick<SpecRecommendation, 'title' | 'outcome' | 'proposedText' | 'reason' | 'category'> {
  const primaryFlag = redFlags[0];
  const primaryProduct = products.find((product) => product.fit !== 'no-fit') ?? products[0];
  const primaryRequirement = requirements[0];
  const ascOption =
    primaryProduct && primaryProduct.fit !== 'no-fit'
      ? ` ${primaryProduct.name} (${primaryProduct.sku}) meets the listed requirements and may be approved instead.`
      : '';

  if (primaryFlag?.type === 'contradiction') {
    return {
      title: 'Resolve conflicting performance requirements',
      outcome: 'Creates one coordinated requirement across the affected sections.',
      proposedText:
        'Use one coordinated performance value and apply it consistently wherever this requirement appears.',
      reason: primaryFlag.explanation,
      category: 'Coordination',
    };
  }

  if (primaryFlag?.type === 'sole-source' || primaryFlag?.type === 'proprietary-lock-in') {
    return {
      title: 'Allow approved equivalent manufacturers',
      outcome: 'Removes unnecessary proprietary lock-in while preserving required performance.',
      proposedText: `Provide the named basis-of-design product or an approved equivalent that meets the listed performance requirements.${ascOption}`,
      reason: primaryFlag.explanation,
      category: 'Product substitution',
    };
  }

  if (primaryFlag?.type === 'no-substitutions' || primaryFlag?.type === 'no-prior-approval') {
    return {
      title: 'Add a clear substitution approval path',
      outcome: 'Makes equivalent-product review possible without weakening engineering approval.',
      proposedText: `Equivalent products may be submitted for approval with supporting compliance and performance evidence.${ascOption}`,
      reason: primaryFlag.explanation,
      category: 'Product substitution',
    };
  }

  if (primaryFlag) {
    return {
      title: primaryFlag.title,
      outcome: 'Clarifies the requirement and reduces review risk.',
      proposedText: 'Revise this clause to state one clear, current, and verifiable requirement.',
      reason: primaryFlag.explanation,
      category: 'Language rewrite',
    };
  }

  if (primaryProduct?.fit === 'no-fit') {
    return {
      title: 'Review the proprietary product requirement',
      outcome: 'Makes the absence of a compliant ASC product explicit before product approval.',
      proposedText:
        'Retain the specified product unless an approved equal is identified and documented by the design team.',
      reason: primaryProduct.fitReason,
      category: 'Product evidence',
    };
  }

  if (primaryProduct) {
    return {
      title: `Add ${primaryProduct.name} as an approved option`,
      outcome: 'Adds a supported product option tied to the source requirement.',
      proposedText: `Include ${primaryProduct.name} (${primaryProduct.sku}) as an approved product where all listed requirements are met.`,
      reason: primaryProduct.fitReason,
      category: 'Product substitution',
    };
  }

  return {
    title: `Clarify ${primaryRequirement ? REQUIREMENT_CATEGORY_LABEL[primaryRequirement.category].toLowerCase() : 'this requirement'}`,
    outcome: 'Makes the requirement easier to verify during review and procurement.',
    proposedText: primaryRequirement
      ? `State the ${REQUIREMENT_CATEGORY_LABEL[primaryRequirement.category].toLowerCase()} as one explicit, verifiable requirement.`
      : 'State this requirement as one explicit, verifiable clause.',
    reason:
      primaryRequirement?.qualifier ??
      'The extracted clause would benefit from clearer, outcome-focused wording.',
    category: type === 'compliance' ? 'Compliance' : 'Language rewrite',
  };
}

/**
 * Deterministically maps legacy extraction findings into the V2 contract.
 * Findings sharing the same source citation become one user-facing change so
 * duplicate requirements, flags, and product matches do not compete.
 */
export function buildSpecRecommendations({
  document,
  sections,
  requirements,
  redFlags,
  productSuggestions,
  citations,
  blocks,
}: SpecRecommendationSourceBag): SpecRecommendation[] {
  const sectionById = new Map(sections.map((section) => [section.id, section]));
  const citationById = new Map(citations.map((citation) => [citation.id, citation]));
  const blockById = new Map(blocks.map((block) => [block.id, block]));
  const groups = new Map<
    string,
    {
      citation: SpecCitation;
      requirements: SpecRequirement[];
      redFlags: SpecRedFlag[];
      products: SpecProductSuggestion[];
      supportingCitationIds: Set<string>;
    }
  >();

  const ensureGroup = (citationId: string) => {
    const citation = citationById.get(citationId);
    if (!citation) return undefined;
    const key = citation.blockId || citation.id;
    const existing = groups.get(key);
    if (existing) return existing;
    const group = {
      citation,
      requirements: [],
      redFlags: [],
      products: [],
      supportingCitationIds: new Set<string>([citation.id]),
    };
    groups.set(key, group);
    return group;
  };

  for (const requirement of requirements) {
    const group = ensureGroup(requirement.citationIds[0] ?? '');
    if (!group) continue;
    group.requirements.push(requirement);
    requirement.citationIds.forEach((id) => group.supportingCitationIds.add(id));
  }
  for (const flag of redFlags) {
    const group = ensureGroup(flag.citationIds[0] ?? '');
    if (!group) continue;
    group.redFlags.push(flag);
    flag.citationIds.forEach((id) => group.supportingCitationIds.add(id));
  }
  for (const product of productSuggestions) {
    const group = ensureGroup(product.citationIds[0] ?? '');
    if (!group) continue;
    group.products.push(product);
    product.citationIds.forEach((id) => group.supportingCitationIds.add(id));
  }

  return [...groups.values()]
    .map((group): SpecRecommendation | undefined => {
      const section = sectionById.get(group.citation.sectionId);
      if (!section) return undefined;
      const block = blockById.get(group.citation.blockId);
      const type = recommendationType(group.redFlags, group.products, group.requirements);
      const copy = recommendationCopy(type, group.redFlags, group.products, group.requirements);
      const id = recommendationId(document.id, group.citation.id);
      const decision = DECISION_BY_RECOMMENDATION_ID[id] ?? 'not-reviewed';
      const sourceFindingIds = [
        ...group.requirements.map((requirement) => requirement.id),
        ...group.redFlags.map((flag) => flag.id),
        ...group.products.map((product) => product.id),
      ];

      return {
        id,
        documentId: document.id,
        customerVersionId: `${document.id}:${document.versionLabel}`,
        customerVersionLabel: document.versionLabel,
        masterSpecId: document.ascMaster?.id ?? 'master-not-recorded',
        masterVersion: document.ascMaster?.version ?? 'Not recorded',
        sectionId: section.id,
        sectionNumber: section.sectionNumber,
        sectionTitle: section.title,
        paragraphLabel: block?.label ?? `Page ${group.citation.page}`,
        sourceCitation: group.citation,
        supportingCitationIds: [...group.supportingCitationIds],
        sourceFindingIds,
        ...copy,
        existingText: group.citation.excerpt,
        type,
        action: deriveSpecRecommendationAction({
          type,
          category: copy.category,
          title: copy.title,
          productEvidence: group.products.map((product) => ({
            suggestionId: product.id,
            sku: product.sku,
            name: product.name,
            fit: product.fit,
            fitReason: product.fitReason,
            attributeTags: product.attributeTags,
            commerciallyMotivated: product.commerciallyMotivated,
          })),
        }),
        priority: recommendationPriority(
          group.redFlags,
          group.products,
          group.requirements,
        ),
        productEvidence: group.products.map((product) => ({
          suggestionId: product.id,
          sku: product.sku,
          name: product.name,
          fit: product.fit,
          fitReason: product.fitReason,
          attributeTags: product.attributeTags,
          commerciallyMotivated: product.commerciallyMotivated,
        })),
        decision,
        denialReason:
          decision === 'denied' ? 'Retained in the prototype decision history.' : undefined,
        decidedAt: decision === 'not-reviewed' ? undefined : document.updatedAt,
        reanalysisState: 'unchanged',
      };
    })
    .filter((recommendation): recommendation is SpecRecommendation => Boolean(recommendation))
    .sort((a, b) => {
      return (
        a.sectionNumber.localeCompare(b.sectionNumber, undefined, { numeric: true }) ||
        a.sourceCitation.page - b.sourceCitation.page ||
        a.paragraphLabel.localeCompare(b.paragraphLabel, undefined, { numeric: true })
      );
    });
}
