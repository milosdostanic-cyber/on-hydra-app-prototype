import {
  classifyReanalysisRecommendations,
  completeReanalysisInStore,
  createWorkingCopyInStore,
  failReanalysisInStore,
  getDocumentFromStore,
  getWorkingCopyFromStore,
  resetSpecMock,
  saveRecommendationReviewInStore,
  setSpecDemoDelayMs,
  updateWorkingCopyBlockInStore,
} from './specMockStore';
import {
  mockSpecAnalysisRepository,
  mockSpecReanalysisRepository,
} from './repositories/specRepositories';
import type { SpecReanalysisRecommendationSnapshot } from './types';

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function snapshot(
  recommendationId: string,
  sourceBlockId: string,
  sourceText: string,
  decision: SpecReanalysisRecommendationSnapshot['decision'] = 'not-reviewed',
): SpecReanalysisRecommendationSnapshot {
  return {
    recommendationId,
    sourceCitationId: `citation-${recommendationId}`,
    sourceBlockId,
    sourceText,
    proposedText: `Updated ${sourceText}`,
    decision,
  };
}

export async function runSpecReanalysisWorkflowTests() {
  const classifications = classifyReanalysisRecommendations({
    snapshots: [
      snapshot('rec:doc:unchanged', 'block-unchanged', 'Original unchanged', 'accepted'),
      snapshot('rec:doc:changed', 'block-changed', 'Original changed', 'denied'),
      snapshot('rec:doc:deleted', 'block-deleted', 'Original deleted'),
    ],
    currentRecommendations: [
      {
        recommendationId: 'rec:doc:unchanged',
        sourceBlockId: 'block-unchanged',
        proposedText: 'Updated Original unchanged',
      },
      {
        recommendationId: 'rec:doc:changed',
        sourceBlockId: 'block-changed',
        proposedText: 'Updated Original changed',
      },
      {
        recommendationId: 'rec:doc:deleted',
        sourceBlockId: 'block-deleted',
        proposedText: 'Updated Original deleted',
      },
      {
        recommendationId: 'rec:doc:new',
        sourceBlockId: 'block-new',
        proposedText: 'Updated New source',
      },
    ],
    currentSourceTextByBlock: {
      'block-unchanged': 'Original unchanged',
      'block-changed': 'Manually changed text',
      'block-deleted': '',
      'block-new': 'New source',
    },
  });
  const stateById = new Map(
    classifications.results.map((result) => [result.recommendationId, result.state]),
  );
  assert(
    stateById.get('rec:doc:unchanged') === 'preserved',
    'An accepted decision must be preserved when its source is unchanged.',
  );
  assert(
    stateById.get('rec:doc:changed') === 'changed',
    'A previous decision must not attach to changed source.',
  );
  assert(
    stateById.get('rec:doc:deleted') === 'resolved',
    'A deleted source range must resolve its previous recommendation.',
  );
  assert(
    stateById.get('rec:doc:new') === 'new',
    'A recommendation with no previous stable ID must be marked new.',
  );

  resetSpecMock('proprietary-division-23');
  setSpecDemoDelayMs(0);
  const documentId = 'spec-prop-23';
  const recommendations = await mockSpecAnalysisRepository.listRecommendations(documentId);
  const changedRecommendation = recommendations[0];
  const preservedRecommendation = recommendations.find(
    (recommendation) =>
      recommendation.sourceCitation.blockId !==
      changedRecommendation.sourceCitation.blockId,
  );
  assert(changedRecommendation && preservedRecommendation, 'Scenario needs two source ranges.');

  saveRecommendationReviewInStore({
    recommendationId: changedRecommendation.id,
    documentId,
    decision: 'accepted',
  });
  saveRecommendationReviewInStore({
    recommendationId: preservedRecommendation.id,
    documentId,
    decision: 'denied',
    denialReason: 'Keep the customer requirement.',
  });
  const workingCopy = createWorkingCopyInStore(documentId, 'v1');
  updateWorkingCopyBlockInStore({
    documentId,
    workingCopyId: workingCopy.id,
    blockId: changedRecommendation.sourceCitation.blockId,
    text: 'Manual customer wording that changes the analyzed source.',
  });
  await mockSpecReanalysisRepository.start(documentId);
  failReanalysisInStore(documentId);
  assert(
    getWorkingCopyFromStore(documentId)?.blockOverrides[
      changedRecommendation.sourceCitation.blockId
    ] === 'Manual customer wording that changes the analyzed source.',
    'Failure must not lose working-copy edits.',
  );
  assert(
    getDocumentFromStore(documentId)?.reanalysisRequired === true,
    'Analysis must remain stale after failure.',
  );

  await mockSpecReanalysisRepository.retry(documentId);
  completeReanalysisInStore(documentId);
  const updated = await mockSpecAnalysisRepository.listRecommendations(documentId);
  assert(
    getDocumentFromStore(documentId)?.reanalysisRequired === false,
    'Analysis becomes current only after successful completion.',
  );
  assert(
    getDocumentFromStore(documentId)?.reanalysisRun?.status === 'complete',
    'Completed re-analysis summary must land on the document for the dashboard card.',
  );
  assert(
    getDocumentFromStore(documentId)?.reanalysisRun?.summary != null,
    'Completion summary metrics must be available for SpecReanalysisCompletion.',
  );
  assert(
    updated.find((recommendation) => recommendation.id === changedRecommendation.id)
      ?.decision === 'not-reviewed',
    'A decision on changed source must be cleared.',
  );
  assert(
    updated.find((recommendation) => recommendation.id === preservedRecommendation.id)
      ?.decision === 'denied',
    'A denied decision on unchanged source must remain.',
  );
  assert(
    getWorkingCopyFromStore(documentId)?.blockOverrides[
      changedRecommendation.sourceCitation.blockId
    ] === 'Manual customer wording that changes the analyzed source.',
    'Success must not lose working-copy edits.',
  );

  return {
    classifications: Object.fromEntries(stateById),
    completion: getDocumentFromStore(documentId)?.reanalysisRun?.summary,
  };
}
