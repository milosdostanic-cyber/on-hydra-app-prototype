import { PROJECT_SEED_ROWS, type ProjectRow } from '../../../shell/projectSeed';
import {
  addCommentMessageInStore,
  addCommentThreadInStore,
  addDeliverableCommentInStore,
  addLineToSubstitutionInStore,
  addManualChangeInStore,
  addObligationToPackageInStore,
  addSpecCorrection,
  completeExportInStore,
  createAskThreadInStore,
  createChangeFromDeltaInStore,
  createProjectBomInStore,
  createProposalFromAskAnswerInStore,
  createSubmittalPackageInStore,
  createWorkingCopyInStore,
  acquireEditorLockInStore,
  applyRecommendationTextInStore,
  getEditorLockFromStore,
  getAskThreadFromStore,
  getCitationFromStore,
  getDeliverableFromStore,
  getDemoRole,
  getDocumentFromStore,
  getRequirementFromStore,
  getSectionFromStore,
  getSubstitutionRequestFromStore,
  getSummaryFromStore,
  getWorkingCopyFromStore,
  listAskThreadsFromStore,
  listBaselinesFromStore,
  listBlocksFromStore,
  listChangesFromStore,
  listCitationsFromStore,
  listCommentThreadsFromStore,
  listCorrectionsFromStore,
  listDeliverablesFromStore,
  listDeltasFromStore,
  listDocumentsFromStore,
  listProductSuggestionsFromStore,
  listProposalsFromStore,
  listRecommendationReviewsFromStore,
  listRedFlagsFromStore,
  listRequirementsFromStore,
  listSavedVersionsFromStore,
  listSectionsFromStore,
  listSubmittalObligationsFromStore,
  listSubmittalPackagesFromStore,
  patchSpecDocument,
  removeSpecDocument,
  renameSubmittalPackageInStore,
  replyToAskThreadInStore,
  resolveChangeInStore,
  resolveProposalInStore,
  releaseEditorLockInStore,
  saveVersionInStore,
  saveRecommendationProposalInStore,
  saveRecommendationReviewInStore,
  setCommentThreadResolvedInStore,
  setDeliverableCurrentVersionInStore,
  setDeliverableStatusInStore,
  setProductSuggestionStatusInStore,
  submitSubstitutionInStore,
  updateGuideSpecContentInStore,
  updateWorkingCopyBlockInStore,
  updateSubstitutionNotesInStore,
  upsertSpecDocument,
  withSpecDelay,
  buildGuideMergePreviewInStore,
  getGuideSpecFromStore,
  insertGuideSnippetInStore,
  listGuideSpecsFromStore,
  ensureSpecExportTicker,
  ensureSpecProcessingTicker,
  ensureSpecReanalysisTicker,
  failExportInStore,
  retryReanalysisInStore,
  startExportInStore,
  startReanalysisInStore,
  dismissExportRunInStore,
  listProjectBomOptionsFromStore,
  listProjectOutputsFromStore,
  listProjectSubmittalPackagesFromStore,
  recordProjectOutputInStore,
  appendApprovedProductsToPackageInStore,
} from '../specMockStore';
import { createV2ProcessingStages } from '../../constants/specWorkflowStatus';
import { buildSpecRecommendations } from '../specAnalysisSeed';
import type {
  SpecAiProposal,
  SpecAlignmentDelta,
  SpecAscMaster,
  SpecAskContextSnapshot,
  SpecAskThread,
  SpecAskUrgency,
  SpecBaseline,
  SpecCitation,
  SpecCommentThread,
  SpecCorrection,
  SpecCorrectionReason,
  SpecDeliverBackStatus,
  SpecDeliverable,
  SpecDestination,
  SpecDocument,
  SpecDocumentBlock,
  SpecBlockFormatting,
  SpecDocumentRole,
  SpecDocumentVersionRecord,
  SpecEditorLock,
  SpecExportDocumentChoice,
  SpecFileType,
  SpecGuideMergePreview,
  SpecGuideSpec,
  SpecProductSuggestion,
  SpecRecommendation,
  SpecRecommendationDecision,
  SpecRecommendationReviewRecord,
  SpecReanalysisRun,
  SpecRedFlag,
  SpecRequirement,
  SpecRequirementCategory,
  SpecSavedVersion,
  SpecSection,
  SpecSectionSummary,
  SpecSubmittalObligation,
  SpecSubmittalPackage,
  SpecSubstitutionRequest,
  SpecSystemType,
  SpecTrackedChange,
  SpecWorkingCopy,
} from '../types';

export type SpecCreateDocumentInput = {
  title: string;
  fileName: string;
  fileType: SpecFileType;
  fileSizeBytes: number;
  destination: SpecDestination;
  projectId?: string;
  role: SpecDocumentRole;
  divisionHint?: string;
  systemType: SpecSystemType;
  /** Divisions confirmed in W01 step 2 (multi-select). */
  divisions?: string[];
  /** Confirmed in W01 step 2 before the SPEC record exists (audit §6.1, P0 fix). */
  ascMaster: SpecAscMaster;
};

/** W02 step 1/2 — replacement file plus the (possibly changed) confirmed Master. */
export type SpecCreateVersionInput = {
  fileName: string;
  fileType: SpecFileType;
  fileSizeBytes: number;
  divisionHint?: string;
  systemType: SpecSystemType;
  ascMaster: SpecAscMaster;
};

export interface SpecDocumentRepository {
  list(filters?: { projectId?: string; destination?: SpecDestination; query?: string }): Promise<SpecDocument[]>;
  getById(id: string): Promise<SpecDocument | undefined>;
  create(input: SpecCreateDocumentInput): Promise<SpecDocument>;
  update(id: string, patch: Partial<SpecDocument>): Promise<SpecDocument | undefined>;
  retryProcessing(id: string): Promise<SpecDocument | undefined>;
  cancelProcessing(id: string): Promise<SpecDocument | undefined>;
  /** W02 — preserves the current version in `previousVersions`; never overwrites history. */
  createNewVersion(id: string, input: SpecCreateVersionInput): Promise<SpecDocument | undefined>;
  /**
   * Screen 02 failure recovery — replace the file on the current customer version
   * and restart analysis. Does not create a new version record.
   */
  replaceProcessingFile(
    id: string,
    input: Pick<SpecCreateVersionInput, 'fileName' | 'fileType' | 'fileSizeBytes'>,
  ): Promise<SpecDocument | undefined>;
  /** Row overflow → Delete SPEC (destructive, visually separated in the UI). */
  remove(id: string): Promise<void>;
}

export interface SpecSectionRepository {
  listByDocument(documentId: string): Promise<SpecSection[]>;
  getById(id: string): Promise<SpecSection | undefined>;
}

export interface SpecAnalysisRepository {
  getSummary(sectionId: string): Promise<SpecSectionSummary | undefined>;
  listRequirements(sectionId: string): Promise<SpecRequirement[]>;
  listRedFlags(documentId: string, sectionId?: string): Promise<SpecRedFlag[]>;
  listRecommendations(documentId: string): Promise<SpecRecommendation[]>;
  saveRecommendationDecision(input: {
    recommendationId: string;
    documentId: string;
    decision: SpecRecommendationDecision;
    denialReason?: string;
  }): Promise<SpecRecommendationReviewRecord>;
  saveRecommendationProposal(input: {
    recommendationId: string;
    documentId: string;
    proposedText: string;
  }): Promise<SpecRecommendationReviewRecord>;
  listCitations(ids: string[]): Promise<SpecCitation[]>;
  getCitation(id: string): Promise<SpecCitation | undefined>;
  listBlocks(documentId: string, sectionId?: string): Promise<SpecDocumentBlock[]>;
}

export interface SpecCorrectionRepository {
  listForRequirement(requirementId: string): Promise<SpecCorrection[]>;
  create(input: {
    requirementId: string;
    nextValue: string;
    nextCategory: SpecRequirementCategory;
    reason: SpecCorrectionReason;
    note?: string;
    actor: string;
  }): Promise<SpecCorrection>;
}

export interface SpecProjectContextRepository {
  listProjects(): Promise<ProjectRow[]>;
  getProject(id: string): Promise<ProjectRow | undefined>;
}

function matchesQuery(doc: SpecDocument, query?: string): boolean {
  if (!query?.trim()) return true;
  const q = query.trim().toLowerCase();
  return (
    doc.title.toLowerCase().includes(q) ||
    doc.fileName.toLowerCase().includes(q) ||
    (doc.divisionHint?.includes(q) ?? false)
  );
}

export const mockSpecDocumentRepository: SpecDocumentRepository = {
  async list(filters) {
    let docs = listDocumentsFromStore();
    if (filters?.projectId) {
      docs = docs.filter((d) => d.projectId === filters.projectId);
    }
    if (filters?.destination) {
      docs = docs.filter((d) => d.destination === filters.destination);
    }
    if (filters?.query) {
      docs = docs.filter((d) => matchesQuery(d, filters.query));
    }
    return withSpecDelay(docs);
  },

  async getById(id) {
    return withSpecDelay(getDocumentFromStore(id));
  },

  async create(input) {
    const id = `spec-upload-${Date.now()}`;
    const now = new Date().toISOString();
    const doc: SpecDocument = {
      id,
      title: input.title,
      fileName: input.fileName,
      fileType: input.fileType,
      fileSizeBytes: input.fileSizeBytes,
      destination: input.destination,
      projectId: input.projectId,
      role: input.role,
      versionLabel: 'v1',
      versionNumber: 1,
      divisionHint: input.divisionHint,
      systemType: input.systemType,
      divisions: input.divisions,
      // Confirmed in W01 step 2 before this record exists — never persisted unconfirmed.
      ascMaster: input.ascMaster,
      ascMasterConfirmed: true,
      processingState: 'queued',
      stages: createV2ProcessingStages(0),
      reviewState: 'not-started',
      owner: 'You',
      createdAt: now,
      updatedAt: now,
      sectionCount: 0,
      requirementCount: 0,
      reviewedRequirementCount: 0,
      unresolvedRedFlagCount: 0,
      scanned: false,
      accessLevel: getDemoRole(),
      archived: false,
      sourcePreviewReady: false,
    };
    upsertSpecDocument(doc);
    ensureSpecProcessingTicker();
    return withSpecDelay(doc);
  },

  async update(id, patch) {
    patchSpecDocument(id, patch);
    return withSpecDelay(getDocumentFromStore(id));
  },

  async retryProcessing(id) {
    const existing = getDocumentFromStore(id);
    if (!existing) return withSpecDelay(undefined);
    patchSpecDocument(id, {
      processingState: 'processing',
      failureReason: undefined,
      stages: createV2ProcessingStages(0),
      sourcePreviewReady: false,
    });
    ensureSpecProcessingTicker();
    return withSpecDelay(getDocumentFromStore(id));
  },

  async cancelProcessing(id) {
    patchSpecDocument(id, {
      processingState: 'cancelled',
      stages: createV2ProcessingStages(0).map((stage) => ({ ...stage, state: 'skipped' as const })),
    });
    return withSpecDelay(getDocumentFromStore(id));
  },

  async createNewVersion(id, input) {
    const existing = getDocumentFromStore(id);
    if (!existing) return withSpecDelay(undefined);

    const previousVersionNumber = existing.versionNumber ?? 1;
    const previousVersion: SpecDocumentVersionRecord = {
      id: `${existing.id}-v${previousVersionNumber}`,
      versionNumber: previousVersionNumber,
      versionLabel: existing.versionLabel,
      fileName: existing.fileName,
      fileSizeBytes: existing.fileSizeBytes,
      uploadedAt: existing.updatedAt,
      uploadedBy: existing.owner,
      ascMaster: existing.ascMaster,
      reviewState: existing.reviewState,
    };
    const nextVersionNumber = previousVersionNumber + 1;
    const now = new Date().toISOString();

    const next: SpecDocument = {
      ...existing,
      fileName: input.fileName,
      fileType: input.fileType,
      fileSizeBytes: input.fileSizeBytes,
      versionLabel: `v${nextVersionNumber}`,
      versionNumber: nextVersionNumber,
      previousVersions: [previousVersion, ...(existing.previousVersions ?? [])],
      divisionHint: input.divisionHint ?? existing.divisionHint,
      systemType: input.systemType,
      ascMaster: input.ascMaster,
      ascMasterConfirmed: true,
      reanalysisRequired: false,
      processingState: 'queued',
      stages: createV2ProcessingStages(0),
      reviewState: 'not-started',
      reviewedRequirementCount: 0,
      unresolvedRedFlagCount: 0,
      exportRecord: undefined,
      exportRun: undefined,
      exportHistory: undefined,
      failureReason: undefined,
      sourcePreviewReady: false,
      updatedAt: now,
    };
    upsertSpecDocument(next);
    ensureSpecProcessingTicker();
    return withSpecDelay(next);
  },

  async replaceProcessingFile(id, input) {
    const existing = getDocumentFromStore(id);
    if (!existing) return withSpecDelay(undefined);
    patchSpecDocument(id, {
      fileName: input.fileName,
      fileType: input.fileType,
      fileSizeBytes: input.fileSizeBytes,
      processingState: 'queued',
      failureReason: undefined,
      stages: createV2ProcessingStages(0),
      sourcePreviewReady: false,
    });
    ensureSpecProcessingTicker();
    return withSpecDelay(getDocumentFromStore(id));
  },

  async remove(id) {
    removeSpecDocument(id);
    return withSpecDelay(undefined);
  },
};

export const mockSpecSectionRepository: SpecSectionRepository = {
  async listByDocument(documentId) {
    return withSpecDelay(listSectionsFromStore(documentId));
  },
  async getById(id) {
    return withSpecDelay(getSectionFromStore(id));
  },
};

export const mockSpecAnalysisRepository: SpecAnalysisRepository = {
  async getSummary(sectionId) {
    return withSpecDelay(getSummaryFromStore(sectionId));
  },
  async listRequirements(sectionId) {
    return withSpecDelay(listRequirementsFromStore(sectionId));
  },
  async listRedFlags(documentId, sectionId) {
    const sections = listSectionsFromStore(documentId);
    const sectionIds = new Set(sections.map((s) => s.id));
    let flags = listRedFlagsFromStore(sectionId);
    if (!sectionId) {
      flags = flags.filter((f) => sectionIds.has(f.sectionId));
    }
    return withSpecDelay(flags);
  },
  async listRecommendations(documentId) {
    const document = getDocumentFromStore(documentId);
    if (!document) return withSpecDelay([]);
    const sections = listSectionsFromStore(documentId);
    const requirements = sections.flatMap((section) =>
      listRequirementsFromStore(section.id),
    );
    const redFlags = listRedFlagsFromStore().filter((flag) =>
      sections.some((section) => section.id === flag.sectionId),
    );
    const productSuggestions = listProductSuggestionsFromStore(documentId);
    const citationIds = [
      ...new Set([
        ...requirements.flatMap((requirement) => requirement.citationIds),
        ...redFlags.flatMap((flag) => flag.citationIds),
        ...productSuggestions.flatMap((product) => product.citationIds),
      ]),
    ];
    const citations = listCitationsFromStore(citationIds);
    const blocks = listBlocksFromStore(documentId);
    const recommendationReviews = new Map(
      listRecommendationReviewsFromStore(documentId).map((record) => [
        record.recommendationId,
        record,
      ]),
    );
    const reanalysisResultById = new Map(
      (document.reanalysisRun?.results ?? []).map((result) => [
        result.recommendationId,
        result.state,
      ]),
    );
    const recommendations = buildSpecRecommendations({
        document,
        sections,
        requirements,
        redFlags,
        productSuggestions,
        citations,
        blocks,
      }).map((recommendation) => {
        const review = recommendationReviews.get(recommendation.id);
        const reanalysisState =
          reanalysisResultById.get(recommendation.id) ?? recommendation.reanalysisState;
        if (!review) return { ...recommendation, reanalysisState };
        return {
          ...recommendation,
          reanalysisState,
          proposedText: review.proposedTextOverride ?? recommendation.proposedText,
          decision: review.decision,
          denialReason: review.denialReason,
          decidedAt: review.decidedAt,
        };
      }).filter((recommendation) => recommendation.reanalysisState !== 'resolved');
    return withSpecDelay(recommendations);
  },
  async saveRecommendationDecision(input) {
    return withSpecDelay(saveRecommendationReviewInStore(input));
  },
  async saveRecommendationProposal(input) {
    return withSpecDelay(saveRecommendationProposalInStore(input));
  },
  async listCitations(ids) {
    return withSpecDelay(listCitationsFromStore(ids));
  },
  async getCitation(id) {
    return withSpecDelay(getCitationFromStore(id));
  },
  async listBlocks(documentId, sectionId) {
    return withSpecDelay(listBlocksFromStore(documentId, sectionId));
  },
};

export interface SpecReanalysisRepository {
  get(documentId: string): Promise<SpecReanalysisRun | undefined>;
  start(documentId: string): Promise<SpecDocument | undefined>;
  retry(documentId: string): Promise<SpecDocument | undefined>;
}

export const mockSpecReanalysisRepository: SpecReanalysisRepository = {
  async get(documentId) {
    return withSpecDelay(getDocumentFromStore(documentId)?.reanalysisRun);
  },

  async start(documentId) {
    const recommendations = await mockSpecAnalysisRepository.listRecommendations(documentId);
    const snapshots = recommendations.map((recommendation) => ({
      recommendationId: recommendation.id,
      sourceCitationId: recommendation.sourceCitation.id,
      sourceBlockId: recommendation.sourceCitation.blockId,
      sourceText: recommendation.existingText,
      proposedText: recommendation.proposedText,
      decision: recommendation.decision,
      denialReason: recommendation.denialReason,
      decidedAt: recommendation.decidedAt,
    }));
    const next = startReanalysisInStore(documentId, snapshots);
    ensureSpecReanalysisTicker();
    return withSpecDelay(next);
  },

  async retry(documentId) {
    const next = retryReanalysisInStore(documentId);
    ensureSpecReanalysisTicker();
    return withSpecDelay(next);
  },
};

export interface SpecExportRepository {
  start(
    documentId: string,
    choice: Exclude<SpecExportDocumentChoice, 'docx'>,
  ): Promise<SpecDocument | undefined>;
  retry(documentId: string): Promise<SpecDocument | undefined>;
  dismiss(documentId: string): Promise<SpecDocument | undefined>;
  fail(documentId: string): Promise<SpecDocument | undefined>;
  complete(documentId: string): Promise<void>;
}

export const mockSpecExportRepository: SpecExportRepository = {
  async start(documentId, choice) {
    const next = startExportInStore(documentId, choice);
    ensureSpecExportTicker();
    return withSpecDelay(next);
  },
  async retry(documentId) {
    const run = getDocumentFromStore(documentId)?.exportRun;
    if (!run) return withSpecDelay(getDocumentFromStore(documentId));
    const next = startExportInStore(documentId, run.choice);
    ensureSpecExportTicker();
    return withSpecDelay(next);
  },
  async dismiss(documentId) {
    return withSpecDelay(dismissExportRunInStore(documentId));
  },
  async fail(documentId) {
    return withSpecDelay(failExportInStore(documentId));
  },
  async complete(documentId) {
    completeExportInStore(documentId);
    return withSpecDelay(undefined);
  },
};

export interface SpecProjectOutputRepository {
  listBoms(projectId?: string): Promise<ReturnType<typeof listProjectBomOptionsFromStore>>;
  listPackages(projectId?: string): Promise<ReturnType<typeof listProjectSubmittalPackagesFromStore>>;
  listOutputs(documentId: string): Promise<ReturnType<typeof listProjectOutputsFromStore>>;
  createBom(input: {
    documentId: string;
    projectId: string;
    name: string;
    productRecommendationIds: string[];
    titles: string[];
  }): Promise<void>;
  updateBom(input: {
    documentId: string;
    projectId: string;
    bomId: string;
    name: string;
    productRecommendationIds: string[];
  }): Promise<void>;
  createPackage(input: {
    documentId: string;
    projectId?: string;
    name: string;
    productRecommendationIds: string[];
    titles: string[];
  }): Promise<void>;
  updatePackage(input: {
    documentId: string;
    projectId?: string;
    packageId: string;
    name: string;
    productRecommendationIds: string[];
    titles: string[];
  }): Promise<void>;
}

export const mockSpecProjectOutputRepository: SpecProjectOutputRepository = {
  async listBoms(projectId) {
    return withSpecDelay(listProjectBomOptionsFromStore(projectId));
  },
  async listPackages(projectId) {
    return withSpecDelay(listProjectSubmittalPackagesFromStore(projectId));
  },
  async listOutputs(documentId) {
    return withSpecDelay(listProjectOutputsFromStore(documentId));
  },
  async createBom(input) {
    const bom = createProjectBomInStore({ projectId: input.projectId, name: input.name });
    recordProjectOutputInStore({
      id: `output-${bom.id}`,
      kind: 'bom',
      mode: 'create',
      name: bom.name,
      documentId: input.documentId,
      projectId: input.projectId,
      productRecommendationIds: input.productRecommendationIds,
      createdAt: new Date().toISOString(),
    });
    return withSpecDelay(undefined);
  },
  async updateBom(input) {
    recordProjectOutputInStore({
      id: `output-update-${input.bomId}-${Date.now()}`,
      kind: 'bom',
      mode: 'update',
      name: input.name,
      documentId: input.documentId,
      projectId: input.projectId,
      productRecommendationIds: input.productRecommendationIds,
      createdAt: new Date().toISOString(),
    });
    return withSpecDelay(undefined);
  },
  async createPackage(input) {
    const pkg = createSubmittalPackageInStore(input.documentId, input.name);
    appendApprovedProductsToPackageInStore({
      packageId: pkg.id,
      titles: input.titles,
    });
    recordProjectOutputInStore({
      id: `output-${pkg.id}`,
      kind: 'submittal',
      mode: 'create',
      name: pkg.name,
      documentId: input.documentId,
      projectId: input.projectId,
      productRecommendationIds: input.productRecommendationIds,
      createdAt: new Date().toISOString(),
    });
    return withSpecDelay(undefined);
  },
  async updatePackage(input) {
    appendApprovedProductsToPackageInStore({
      packageId: input.packageId,
      titles: input.titles,
    });
    recordProjectOutputInStore({
      id: `output-update-${input.packageId}-${Date.now()}`,
      kind: 'submittal',
      mode: 'update',
      name: input.name,
      documentId: input.documentId,
      projectId: input.projectId,
      productRecommendationIds: input.productRecommendationIds,
      createdAt: new Date().toISOString(),
    });
    return withSpecDelay(undefined);
  },
};

export const mockSpecCorrectionRepository: SpecCorrectionRepository = {
  async listForRequirement(requirementId) {
    return withSpecDelay(listCorrectionsFromStore(requirementId));
  },
  async create(input) {
    const req = getRequirementFromStore(input.requirementId);
    if (!req) {
      throw new Error('Requirement not found');
    }
    const correction: SpecCorrection = {
      id: `corr-${Date.now()}`,
      requirementId: input.requirementId,
      previousValue: req.value,
      nextValue: input.nextValue,
      previousCategory: req.category,
      nextCategory: input.nextCategory,
      reason: input.reason,
      note: input.note,
      actor: input.actor,
      createdAt: new Date().toISOString(),
    };
    addSpecCorrection(correction);
    return withSpecDelay(correction);
  },
};

export const mockSpecProjectContextRepository: SpecProjectContextRepository = {
  async listProjects() {
    return withSpecDelay([...PROJECT_SEED_ROWS]);
  },
  async getProject(id) {
    return withSpecDelay(PROJECT_SEED_ROWS.find((p) => p.key === id));
  },
};

export interface SpecEditorRepository {
  getWorkingCopy(documentId: string): Promise<SpecWorkingCopy | undefined>;
  createWorkingCopy(documentId: string, basedOnVersionLabel: string): Promise<SpecWorkingCopy>;
  listChanges(documentId: string): Promise<SpecTrackedChange[]>;
  listProposals(documentId: string): Promise<SpecAiProposal[]>;
  listCommentThreads(documentId: string): Promise<SpecCommentThread[]>;
  listSavedVersions(documentId: string): Promise<SpecSavedVersion[]>;
  updateWorkingCopyBlock(input: {
    documentId: string;
    workingCopyId: string;
    blockId: string;
    text: string;
    formatting?: SpecBlockFormatting;
  }): Promise<SpecWorkingCopy | undefined>;
  applyRecommendationText(input: {
    documentId: string;
    workingCopyId: string;
    blockId: string;
    text: string;
  }): Promise<SpecWorkingCopy | undefined>;
  getEditorLock(documentId: string): Promise<SpecEditorLock | undefined>;
  acquireEditorLock(
    documentId: string,
    owner: string,
    timeoutMs: number,
  ): Promise<SpecEditorLock>;
  releaseEditorLock(documentId: string, owner?: string): Promise<void>;
  proposeManualChange(input: {
    documentId: string;
    workingCopyId: string;
    blockId: string;
    sectionId: string;
    originalText: string;
    proposedText: string;
    author: string;
    rationale?: string;
  }): Promise<SpecTrackedChange>;
  acceptChange(changeId: string): Promise<SpecTrackedChange | undefined>;
  rejectChange(changeId: string): Promise<SpecTrackedChange | undefined>;
  acceptProposal(proposalId: string): Promise<SpecAiProposal | undefined>;
  rejectProposal(proposalId: string): Promise<SpecAiProposal | undefined>;
  addComment(input: {
    documentId: string;
    blockId: string;
    sectionId: string;
    author: string;
    body: string;
  }): Promise<SpecCommentThread>;
  replyToThread(threadId: string, author: string, body: string): Promise<SpecCommentThread | undefined>;
  setThreadResolved(threadId: string, resolved: boolean): Promise<void>;
  saveVersion(input: {
    documentId: string;
    workingCopyId: string;
    label: string;
    description: string;
    actor: string;
  }): Promise<SpecSavedVersion>;
}

export const mockSpecEditorRepository: SpecEditorRepository = {
  async getWorkingCopy(documentId) {
    return withSpecDelay(getWorkingCopyFromStore(documentId));
  },
  async createWorkingCopy(documentId, basedOnVersionLabel) {
    return withSpecDelay(createWorkingCopyInStore(documentId, basedOnVersionLabel));
  },
  async listChanges(documentId) {
    return withSpecDelay(listChangesFromStore(documentId));
  },
  async listProposals(documentId) {
    return withSpecDelay(listProposalsFromStore(documentId));
  },
  async listCommentThreads(documentId) {
    return withSpecDelay(listCommentThreadsFromStore(documentId));
  },
  async listSavedVersions(documentId) {
    return withSpecDelay(listSavedVersionsFromStore(documentId));
  },
  async updateWorkingCopyBlock(input) {
    return withSpecDelay(updateWorkingCopyBlockInStore(input));
  },
  async applyRecommendationText(input) {
    return withSpecDelay(applyRecommendationTextInStore(input));
  },
  async getEditorLock(documentId) {
    return withSpecDelay(getEditorLockFromStore(documentId));
  },
  async acquireEditorLock(documentId, owner, timeoutMs) {
    return withSpecDelay(acquireEditorLockInStore(documentId, owner, timeoutMs));
  },
  async releaseEditorLock(documentId, owner) {
    releaseEditorLockInStore(documentId, owner);
    return withSpecDelay(undefined);
  },
  async proposeManualChange(input) {
    return withSpecDelay(addManualChangeInStore(input));
  },
  async acceptChange(changeId) {
    return withSpecDelay(resolveChangeInStore(changeId, 'accepted'));
  },
  async rejectChange(changeId) {
    return withSpecDelay(resolveChangeInStore(changeId, 'rejected'));
  },
  async acceptProposal(proposalId) {
    return withSpecDelay(resolveProposalInStore(proposalId, 'accepted'));
  },
  async rejectProposal(proposalId) {
    return withSpecDelay(resolveProposalInStore(proposalId, 'rejected'));
  },
  async addComment(input) {
    return withSpecDelay(addCommentThreadInStore(input));
  },
  async replyToThread(threadId, author, body) {
    return withSpecDelay(
      addCommentMessageInStore(threadId, {
        author,
        body,
        createdAt: new Date().toISOString(),
      }),
    );
  },
  async setThreadResolved(threadId, resolved) {
    setCommentThreadResolvedInStore(threadId, resolved);
    return withSpecDelay(undefined);
  },
  async saveVersion(input) {
    return withSpecDelay(saveVersionInStore(input));
  },
};

export interface SpecReviewRepository {
  listBaselines(documentId: string): Promise<SpecBaseline[]>;
  listDeltas(documentId: string, baselineId?: string): Promise<SpecAlignmentDelta[]>;
  createChangeFromDelta(input: {
    documentId: string;
    workingCopyId: string;
    delta: SpecAlignmentDelta;
    author: string;
  }): Promise<SpecTrackedChange>;
}

export const mockSpecReviewRepository: SpecReviewRepository = {
  async listBaselines(documentId) {
    return withSpecDelay(listBaselinesFromStore(documentId));
  },
  async listDeltas(documentId, baselineId) {
    return withSpecDelay(listDeltasFromStore(documentId, baselineId));
  },
  async createChangeFromDelta(input) {
    return withSpecDelay(createChangeFromDeltaInStore(input));
  },
};

export interface SpecProductsRepository {
  listSuggestions(documentId: string): Promise<SpecProductSuggestion[]>;
  selectSuggestion(id: string): Promise<SpecProductSuggestion | undefined>;
  dismissSuggestion(id: string): Promise<SpecProductSuggestion | undefined>;
  addToSubstitution(documentId: string, suggestion: SpecProductSuggestion): Promise<void>;
}

export const mockSpecProductsRepository: SpecProductsRepository = {
  async listSuggestions(documentId) {
    return withSpecDelay(listProductSuggestionsFromStore(documentId));
  },
  async selectSuggestion(id) {
    return withSpecDelay(setProductSuggestionStatusInStore(id, 'selected'));
  },
  async dismissSuggestion(id) {
    return withSpecDelay(setProductSuggestionStatusInStore(id, 'dismissed'));
  },
  async addToSubstitution(documentId, suggestion) {
    const req = suggestion.requirementId
      ? getRequirementFromStore(suggestion.requirementId)
      : undefined;
    addLineToSubstitutionInStore(documentId, {
      suggestionId: suggestion.id,
      specifiedValue: req?.value ?? 'Specified requirement',
      proposedSku: suggestion.sku,
      proposedName: suggestion.name,
      rationale: suggestion.fitReason,
      equivalence: suggestion.equivalence ?? [],
      savings: suggestion.savings,
      attachments: suggestion.attachments ?? [],
    });
    return withSpecDelay(undefined);
  },
};

export interface SpecArtifactsRepository {
  listObligations(documentId: string): Promise<SpecSubmittalObligation[]>;
  listPackages(documentId: string): Promise<SpecSubmittalPackage[]>;
  createPackage(documentId: string, name: string): Promise<SpecSubmittalPackage>;
  renamePackage(packageId: string, name: string): Promise<void>;
  addObligationToPackage(packageId: string, obligationId: string): Promise<void>;
  getSubstitution(documentId: string): Promise<SpecSubstitutionRequest | undefined>;
  updateSubstitutionNotes(documentId: string, notes: string): Promise<void>;
  submitSubstitution(documentId: string): Promise<SpecSubstitutionRequest | undefined>;
}

export const mockSpecArtifactsRepository: SpecArtifactsRepository = {
  async listObligations(documentId) {
    return withSpecDelay(listSubmittalObligationsFromStore(documentId));
  },
  async listPackages(documentId) {
    return withSpecDelay(listSubmittalPackagesFromStore(documentId));
  },
  async createPackage(documentId, name) {
    return withSpecDelay(createSubmittalPackageInStore(documentId, name));
  },
  async renamePackage(packageId, name) {
    renameSubmittalPackageInStore(packageId, name);
    return withSpecDelay(undefined);
  },
  async addObligationToPackage(packageId, obligationId) {
    addObligationToPackageInStore(packageId, obligationId);
    return withSpecDelay(undefined);
  },
  async getSubstitution(documentId) {
    return withSpecDelay(getSubstitutionRequestFromStore(documentId));
  },
  async updateSubstitutionNotes(documentId, notes) {
    updateSubstitutionNotesInStore(documentId, notes);
    return withSpecDelay(undefined);
  },
  async submitSubstitution(documentId) {
    return withSpecDelay(submitSubstitutionInStore(documentId));
  },
};

export interface SpecCollaborationRepository {
  listAskThreads(documentId: string): Promise<SpecAskThread[]>;
  getAskThread(threadId: string): Promise<SpecAskThread | undefined>;
  createAskThread(input: {
    documentId: string;
    subject: string;
    question: string;
    requestType: string;
    urgency: SpecAskUrgency;
    context: SpecAskContextSnapshot;
    author: string;
  }): Promise<SpecAskThread>;
  replyToAskThread(
    threadId: string,
    author: string,
    body: string,
    role: 'requester' | 'engineer' | 'system',
  ): Promise<SpecAskThread | undefined>;
  createProposalFromAnswer(threadId: string, messageId: string): Promise<SpecAiProposal | undefined>;
  listDeliverables(documentId: string): Promise<SpecDeliverable[]>;
  getDeliverable(deliverableId: string): Promise<SpecDeliverable | undefined>;
  setDeliverableStatus(
    deliverableId: string,
    status: SpecDeliverBackStatus,
    actor: string,
    detail?: string,
  ): Promise<SpecDeliverable | undefined>;
  addDeliverableComment(deliverableId: string, author: string, body: string): Promise<SpecDeliverable | undefined>;
  setCurrentVersion(deliverableId: string, versionId: string): Promise<void>;
}

export const mockSpecCollaborationRepository: SpecCollaborationRepository = {
  async listAskThreads(documentId) {
    return withSpecDelay(listAskThreadsFromStore(documentId));
  },
  async getAskThread(threadId) {
    return withSpecDelay(getAskThreadFromStore(threadId));
  },
  async createAskThread(input) {
    return withSpecDelay(createAskThreadInStore(input));
  },
  async replyToAskThread(threadId, author, body, role) {
    return withSpecDelay(
      replyToAskThreadInStore(threadId, { author, role, body, createdAt: new Date().toISOString() }),
    );
  },
  async createProposalFromAnswer(threadId, messageId) {
    return withSpecDelay(createProposalFromAskAnswerInStore(threadId, messageId));
  },
  async listDeliverables(documentId) {
    return withSpecDelay(listDeliverablesFromStore(documentId));
  },
  async getDeliverable(deliverableId) {
    return withSpecDelay(getDeliverableFromStore(deliverableId));
  },
  async setDeliverableStatus(deliverableId, status, actor, detail) {
    return withSpecDelay(setDeliverableStatusInStore(deliverableId, status, actor, detail));
  },
  async addDeliverableComment(deliverableId, author, body) {
    return withSpecDelay(addDeliverableCommentInStore(deliverableId, author, body));
  },
  async setCurrentVersion(deliverableId, versionId) {
    setDeliverableCurrentVersionInStore(deliverableId, versionId);
    return withSpecDelay(undefined);
  },
};

export interface SpecGuideSpecRepository {
  listGuideSpecs(): Promise<SpecGuideSpec[]>;
  getGuideSpec(id: string): Promise<SpecGuideSpec | undefined>;
  updateGuideContent(id: string, content: string): Promise<SpecGuideSpec | undefined>;
  buildMergePreview(input: {
    guideSpecId: string;
    snippetId: string;
    documentId: string;
  }): Promise<SpecGuideMergePreview | undefined>;
  insertSnippet(input: {
    preview: SpecGuideMergePreview;
    author: string;
    resolvePendingConflicts?: boolean;
  }): Promise<SpecTrackedChange | undefined>;
}

export const mockSpecGuideSpecRepository: SpecGuideSpecRepository = {
  async listGuideSpecs() {
    return withSpecDelay(listGuideSpecsFromStore());
  },
  async getGuideSpec(id) {
    return withSpecDelay(getGuideSpecFromStore(id));
  },
  async updateGuideContent(id, content) {
    return withSpecDelay(updateGuideSpecContentInStore(id, content));
  },
  async buildMergePreview(input) {
    return withSpecDelay(buildGuideMergePreviewInStore(input));
  },
  async insertSnippet(input) {
    return withSpecDelay(insertGuideSnippetInStore(input));
  },
};
