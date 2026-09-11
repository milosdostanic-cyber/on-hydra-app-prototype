import { buildSpecRecommendations } from './specAnalysisSeed';
import { buildScenarioFixtures } from './specDocumentsSeed';
import type { SpecRecommendation } from './types';
import type { SpecScenarioId } from './specScenarios';

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function recommendationsFor(
  scenarioId: SpecScenarioId,
  documentId: string,
): SpecRecommendation[] {
  const fixtures = buildScenarioFixtures(scenarioId);
  const document = fixtures.documents.find((entry) => entry.id === documentId);
  assert(document, `Missing ${documentId} in ${scenarioId}`);
  const sections = fixtures.sections.filter(
    (section) => section.documentId === document.id,
  );
  const sectionIds = new Set(sections.map((section) => section.id));
  return buildSpecRecommendations({
    document,
    sections,
    requirements: fixtures.requirements.filter((requirement) =>
      sectionIds.has(requirement.sectionId),
    ),
    redFlags: fixtures.redFlags.filter((flag) => sectionIds.has(flag.sectionId)),
    productSuggestions: fixtures.productSuggestions.filter(
      (product) => product.documentId === document.id,
    ),
    citations: fixtures.citations.filter(
      (citation) => citation.documentId === document.id,
    ),
    blocks: fixtures.blocks.filter((block) => block.documentId === document.id),
  });
}

export function runSpecRecommendationSelectorTests() {
  const zero = recommendationsFor('clean-division-22', 'spec-clean-22');
  const one = recommendationsFor('large-project-manual', 'spec-large-manual');
  const many = recommendationsFor('proprietary-division-23', 'spec-prop-23');
  const mixed = recommendationsFor(
    'contradictory-requirements',
    'spec-contradict',
  );

  assert(zero.length > 1, 'Clean scenario must produce reviewable recommendations.');
  assert(one.length >= 1, 'Large-project scenario must produce at least one recommendation.');
  assert(many.length > 1, 'Proprietary scenario must produce many recommendations.');
  assert(
    new Set(mixed.map((recommendation) => recommendation.decision)).size > 1,
    'Contradictory scenario must contain mixed review decisions.',
  );
  assert(
    many.every(
      (recommendation) =>
        recommendation.sourceCitation.id &&
        recommendation.sectionNumber &&
        recommendation.paragraphLabel &&
        recommendation.action,
    ),
    'Every recommendation must have exact source evidence and an action facet.',
  );

  const rerun = recommendationsFor('proprietary-division-23', 'spec-prop-23');
  assert(
    many.map((recommendation) => recommendation.id).join('|') ===
      rerun.map((recommendation) => recommendation.id).join('|'),
    'Recommendation IDs must be stable across selector runs.',
  );

  return {
    zero: zero.length,
    one: one.length,
    many: many.length,
    mixedDecisions: [...new Set(mixed.map((recommendation) => recommendation.decision))],
    stableIds: many.map((recommendation) => recommendation.id),
  };
}
