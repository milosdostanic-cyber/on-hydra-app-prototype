import {
  acquireEditorLockInStore,
  createWorkingCopyInStore,
  getDocumentFromStore,
  getEditorLockFromStore,
  getSpecMockSnapshot,
  releaseEditorLockInStore,
  resetSpecMock,
  saveRecommendationReviewInStore,
  setSpecDemoDelayMs,
  updateWorkingCopyBlockInStore,
} from './specMockStore';
import { mockSpecAnalysisRepository } from './repositories/specRepositories';

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

export async function runSpecReviewWorkflowTests() {
  resetSpecMock('proprietary-division-23');
  setSpecDemoDelayMs(0);

  const documentId = 'spec-prop-23';
  const initial = await mockSpecAnalysisRepository.listRecommendations(documentId);
  assert(initial.length > 1, 'The review scenario needs multiple recommendations.');

  saveRecommendationReviewInStore({
    recommendationId: initial[0].id,
    documentId,
    decision: 'accepted',
  });
  saveRecommendationReviewInStore({
    recommendationId: initial[1].id,
    documentId,
    decision: 'denied',
  });
  const withOptionalReason = saveRecommendationReviewInStore({
    recommendationId: initial[1].id,
    documentId,
    decision: 'denied',
    denialReason: 'Customer standard remains stricter.',
  });
  assert(
    withOptionalReason.denialReason === 'Customer standard remains stricter.',
    'A denial reason must be retained when supplied.',
  );

  const updated = await mockSpecAnalysisRepository.listRecommendations(documentId);
  assert(updated[0].decision === 'accepted', 'Accept must persist on the stable recommendation.');
  assert(updated[1].decision === 'denied', 'Deny must persist on the stable recommendation.');
  assert(
    updated[1].denialReason === 'Customer standard remains stricter.',
    'The selector must return the retained denial reason.',
  );

  const workingCopy = createWorkingCopyInStore(documentId, 'v1');
  const block = updated[0].sourceCitation.blockId;
  const originalText =
    workingCopy.blockOverrides[block] ??
    getSpecMockSnapshot().blocks.find((entry) => entry.id === block)?.text ??
    updated[0].existingText;
  updateWorkingCopyBlockInStore({
    documentId,
    workingCopyId: workingCopy.id,
    blockId: block,
    text: originalText,
    formatting: { bold: true },
  });
  assert(
    getDocumentFromStore(documentId)?.reanalysisRequired !== true,
    'Formatting-only changes must not mark analysis stale.',
  );
  updateWorkingCopyBlockInStore({
    documentId,
    workingCopyId: workingCopy.id,
    blockId: block,
    text: 'Manually edited customer wording.',
    formatting: { bold: true },
  });
  assert(
    getDocumentFromStore(documentId)?.reanalysisRequired === true,
    'A manual text edit in the document must immediately mark analysis stale.',
  );

  const now = Date.now();
  const external = acquireEditorLockInStore(documentId, 'Jordan Lee', 1000, now);
  assert(external.owner === 'Jordan Lee', 'The lock must identify the active editor.');
  const blocked = acquireEditorLockInStore(documentId, 'You', 1000, now);
  assert(blocked.owner === 'Jordan Lee', 'A second editor must remain read-only.');
  assert(
    getEditorLockFromStore(documentId, now + 1001) == null,
    'The lock must end after inactivity timeout.',
  );
  releaseEditorLockInStore(documentId);
  assert(getEditorLockFromStore(documentId) == null, 'A finished session must release its lock.');

  return {
    recommendationIds: updated.map((recommendation) => recommendation.id),
    decisions: updated.map((recommendation) => recommendation.decision),
    stale: getDocumentFromStore(documentId)?.reanalysisRequired,
  };
}
