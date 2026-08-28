import { deriveSpecWorkflowStatus } from '../constants/specWorkflowStatus';
import {
  mockSpecAnalysisRepository,
  mockSpecExportRepository,
  mockSpecProjectOutputRepository,
} from './repositories/specRepositories';
import { specExportPath } from '../specNavigation';
import {
  completeExportInStore,
  createWorkingCopyInStore,
  failExportInStore,
  getDocumentFromStore,
  listProjectBomOptionsFromStore,
  listProjectOutputsFromStore,
  resetSpecMock,
  saveRecommendationReviewInStore,
  setSpecDemoDelayMs,
  startExportInStore,
  updateWorkingCopyBlockInStore,
} from './specMockStore';

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

export async function runSpecExportWorkflowTests() {
  resetSpecMock('proprietary-division-23');
  setSpecDemoDelayMs(0);
  const documentId = 'spec-prop-23';

  const started = startExportInStore(documentId, 'revision-history');
  assert(started?.exportRun?.status === 'generating', 'Export must enter a generating state.');
  assert(started?.exportRun?.choice === 'revision-history', 'Export must retain the selected choice.');
  assert(deriveSpecWorkflowStatus(started!) === 'exporting', 'Generating export must derive exporting.');

  failExportInStore(documentId);
  const failed = getDocumentFromStore(documentId);
  assert(failed?.exportRun?.status === 'failed', 'Failure must keep the export run context.');
  assert(failed?.exportRun?.choice === 'revision-history', 'Failure must retain the document choice.');
  assert(deriveSpecWorkflowStatus(failed!) === 'export-failed', 'Failed export must derive export-failed.');

  const retried = await mockSpecExportRepository.retry(documentId);
  assert(retried?.exportRun?.status === 'generating', 'Retry must restart generation with the same choice.');
  completeExportInStore(documentId);
  const ready = getDocumentFromStore(documentId);
  assert(ready?.exportRun?.status === 'ready', 'Completion must produce a ready file.');
  assert(ready?.exportRecord?.fileName, 'Export history must include a generated filename.');
  assert(ready?.exportHistory?.length === 1, 'Export history must stay on the current customer version.');
  assert(deriveSpecWorkflowStatus(ready!) === 'exported', 'A stored export record must derive exported.');
  assert(
    specExportPath(documentId) === `/projects/2/spec/${documentId}/export`,
    'Canonical Export route must exist.',
  );

  const workingCopy = createWorkingCopyInStore(documentId, 'v1');
  const recommendations = await mockSpecAnalysisRepository.listRecommendations(documentId);
  const source = recommendations[0];
  updateWorkingCopyBlockInStore({
    documentId,
    workingCopyId: workingCopy.id,
    blockId: source.sourceCitation.blockId,
    text: 'Manual edit that requires re-analysis.',
  });
  const stale = getDocumentFromStore(documentId);
  assert(stale?.reanalysisRequired === true, 'Manual edits must mark analysis stale.');
  const refused = startExportInStore(documentId, 'clean-final');
  assert(
    refused?.exportRun?.status !== 'generating',
    'Stale analysis must block a new export run.',
  );

  resetSpecMock('proprietary-division-23');
  setSpecDemoDelayMs(0);
  const withProducts = await mockSpecAnalysisRepository.listRecommendations(documentId);
  const productRec =
    withProducts.find((recommendation) => recommendation.productEvidence.length > 0) ??
    withProducts[0];
  saveRecommendationReviewInStore({
    recommendationId: productRec.id,
    documentId,
    decision: 'accepted',
  });
  await mockSpecProjectOutputRepository.createBom({
    documentId,
    projectId: '2',
    name: 'Division 23 — Recommended Products',
    productRecommendationIds: [productRec.id],
    titles: [productRec.productEvidence[0]?.name ?? productRec.title],
  });
  const boms = listProjectBomOptionsFromStore('2');
  assert(
    boms.some((option) => option.name === 'Division 23 — Recommended Products'),
    'Create BOM must add a Project-local destination.',
  );
  const outputs = listProjectOutputsFromStore(documentId);
  assert(outputs[0]?.kind === 'bom', 'BOM output history must be tied to the customer version.');
  assert(
    outputs[0]?.productRecommendationIds.includes(productRec.id),
    'Downstream outputs must use accepted recommendations only.',
  );

  await mockSpecProjectOutputRepository.createPackage({
    documentId,
    projectId: '2',
    name: 'Division 23 — Product Submittal',
    productRecommendationIds: [productRec.id],
    titles: [productRec.productEvidence[0]?.name ?? productRec.title],
  });
  assert(
    listProjectOutputsFromStore(documentId).some((output) => output.kind === 'submittal'),
    'Submittal create must persist against the current document.',
  );

  return {
    exportStatus: deriveSpecWorkflowStatus(ready!),
    fileName: ready?.exportRecord?.fileName,
    outputs: listProjectOutputsFromStore(documentId).map((output) => output.kind),
  };
}
