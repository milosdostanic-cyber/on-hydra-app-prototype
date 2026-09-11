/**
 * Spec module domain types — I0–I2 (library, upload, processing, analyzer, review, editor).
 * Products / Artifacts / Collaboration arrive with later increments.
 *
 * Plan: `Documents/plans/2026-08-04-spec-rewrite-frontend-implementation.md`
 */

/** Where a document lives. Organization library documents are not bound to a project. */
export type SpecDestination = 'project' | 'library';

/** PRD §10.2 — document role chosen at upload. */
export type SpecDocumentRole =
  | 'project-specification'
  | 'office-master'
  | 'prior-project'
  | 'addendum'
  | 'guide-spec'
  | 'other';

export type SpecFileType = 'pdf' | 'doc' | 'docx';

/**
 * Processing stage IDs. Release 1 (V2) uses the first four IDs as the canonical
 * user-facing stages (audit §5.2); labels live in `specWorkflowStatus.ts`.
 * The remaining three IDs are retained so existing seed fixtures still type-check
 * (`specDocumentsSeed` / `specSeedHelpers` are outside the Phase 2 allowlist).
 * `projectStagesToV2()` maps legacy 7-stage arrays onto the four V2 stages.
 */
export type SpecProcessingStageId =
  | 'upload-received'
  | 'ocr-layout'
  | 'section-detection'
  | 'requirement-extraction'
  | 'red-flag-analysis'
  | 'citation-mapping'
  | 'finalizing';

export type SpecStageState = 'pending' | 'active' | 'done' | 'failed' | 'skipped';

export type SpecProcessingStage = {
  id: SpecProcessingStageId;
  state: SpecStageState;
  /** Shown instead of a fake percentage when the stage has something to report. */
  note?: string;
};

export type SpecReanalysisStageId =
  | 'capture-manual-edits'
  | 'refresh-recommendations'
  | 'preserve-decisions'
  | 'prepare-review';

export type SpecReanalysisStatus = 'queued' | 'processing' | 'failed' | 'complete';

export type SpecReanalysisRecommendationSnapshot = {
  recommendationId: string;
  sourceCitationId: string;
  sourceBlockId: string;
  sourceText: string;
  proposedText: string;
  decision: SpecRecommendationDecision;
  denialReason?: string;
  decidedAt?: string;
};

export type SpecReanalysisRecommendationResult = {
  recommendationId: string;
  state: SpecRecommendationReanalysisState;
};

export type SpecReanalysisSummary = {
  newCount: number;
  changedCount: number;
  resolvedCount: number;
  decisionsKeptCount: number;
  targetRecommendationId?: string;
};

export type SpecReanalysisRun = {
  id: string;
  documentId: string;
  status: SpecReanalysisStatus;
  stages: Array<{ id: SpecReanalysisStageId; state: SpecStageState }>;
  snapshots: SpecReanalysisRecommendationSnapshot[];
  results?: SpecReanalysisRecommendationResult[];
  summary?: SpecReanalysisSummary;
  startedAt: string;
  updatedAt: string;
  failureReason?: string;
};

/**
 * Document-level processing state. `partial` means some sections are usable while
 * others failed or are still running (PRD AC-007).
 */
export type SpecProcessingState = 'queued' | 'processing' | 'partial' | 'ready' | 'failed' | 'cancelled';

export type SpecReviewState = 'not-started' | 'in-review' | 'corrected' | 'approved';

export type SpecSystemType = 'fire-protection' | 'plumbing' | 'hvac';

export type SpecAscMaster = {
  id: string;
  label: string;
  version: string;
};

/** Screen 06 document choices. `docx` is a legacy portfolio fixture alias for clean-final. */
export type SpecExportDocumentChoice =
  | 'clean-final'
  | 'revision-history'
  | 'comparison-appendix'
  | 'docx';

export type SpecExportRunStatus = 'generating' | 'ready' | 'failed';

export type SpecExportRun = {
  id: string;
  documentId: string;
  status: SpecExportRunStatus;
  choice: Exclude<SpecExportDocumentChoice, 'docx'>;
  fileName?: string;
  startedAt: string;
  updatedAt: string;
  failureReason?: string;
};

export type SpecExportRecord = {
  id: string;
  exportedAt: string;
  format: SpecExportDocumentChoice;
  fileName?: string;
  choice?: Exclude<SpecExportDocumentChoice, 'docx'>;
};

export type SpecProjectOutputKind = 'bom' | 'submittal';

export type SpecProjectOutputMode = 'create' | 'update';

export type SpecProjectBomOption = {
  id: string;
  projectId: string;
  name: string;
};

export type SpecProjectOutputRecord = {
  id: string;
  kind: SpecProjectOutputKind;
  mode: SpecProjectOutputMode;
  name: string;
  documentId: string;
  projectId?: string;
  productRecommendationIds: string[];
  createdAt: string;
};

/**
 * Snapshot of a superseded SPEC version (V2 Version contract — audit §5.4/§4.4).
 * The current version lives on the `SpecDocument` fields themselves; uploading a
 * new version pushes the previous head into `SpecDocument.previousVersions`.
 */
export type SpecDocumentVersionRecord = {
  id: string;
  versionNumber: number;
  versionLabel: string;
  fileName: string;
  fileSizeBytes: number;
  uploadedAt: string;
  uploadedBy: string;
  ascMaster?: SpecAscMaster;
  reviewState: SpecReviewState;
};

/** Confidence is always shown as a band plus text, never colour alone (PRD AC-040). */
export type SpecConfidenceBand = 'high' | 'medium' | 'low';

export type SpecSeverity = 'critical' | 'major' | 'minor' | 'info';

export type SpecAccessLevel = 'owner' | 'editor' | 'comment-only' | 'view-only' | 'revoked';

export type SpecDocument = {
  id: string;
  title: string;
  fileName: string;
  fileType: SpecFileType;
  fileSizeBytes: number;
  destination: SpecDestination;
  /** Set when `destination` is `project`; keys into the shell project list. */
  projectId?: string;
  role: SpecDocumentRole;
  versionLabel: string;
  /** Numeric counter backing `versionLabel` for new uploads (W01/W02). Optional for older fixtures. */
  versionNumber?: number;
  /** Reverse-chronological snapshots of superseded versions (V2 version history — M01). */
  previousVersions?: SpecDocumentVersionRecord[];
  addendumLabel?: string;
  divisionHint?: string;
  systemType: SpecSystemType;
  ascMaster?: SpecAscMaster;
  /** False while the user still needs to confirm the suggested ASC master. */
  ascMasterConfirmed?: boolean;
  /** True when the source changed after analysis and needs a fresh run. */
  reanalysisRequired?: boolean;
  /** Current-version re-analysis workflow. Historical customer versions remain immutable. */
  reanalysisRun?: SpecReanalysisRun;
  exportRun?: SpecExportRun;
  exportRecord?: SpecExportRecord;
  exportHistory?: SpecExportRecord[];
  processingState: SpecProcessingState;
  stages: SpecProcessingStage[];
  reviewState: SpecReviewState;
  owner: string;
  createdAt: string;
  updatedAt: string;
  sectionCount: number;
  requirementCount: number;
  reviewedRequirementCount: number;
  unresolvedRedFlagCount: number;
  highestSeverity?: SpecSeverity;
  /** True when the fixture represents scanned pages, so citations may be approximate. */
  scanned: boolean;
  accessLevel: SpecAccessLevel;
  archived: boolean;
  /** Source preview can be ready before analysis finishes (PRD AC-044). */
  sourcePreviewReady: boolean;
  /** Human-readable failure reason when `processingState` is `failed`. */
  failureReason?: string;
  // ── Library metadata card (PRD FR-9) ───────────────────────────────────────
  location?: string;
  generalContractor?: string;
  engineerOfRecord?: string;
  /** Divisions present in the document, for structured library filtering. */
  divisions?: string[];
  /** Free-form value tags used by the org to group projects. */
  valueTags?: string[];
};

/** SectionFormat three-part structure. */
export type SpecSectionPart = 'general' | 'products' | 'execution';

export type SpecSection = {
  id: string;
  documentId: string;
  division: string;
  divisionTitle: string;
  sectionNumber: string;
  title: string;
  parts: SpecSectionPart[];
  pageStart: number;
  pageEnd: number;
  processingState: Extract<SpecProcessingState, 'processing' | 'ready' | 'failed'>;
  requirementCount: number;
  redFlagCount: number;
  highestSeverity?: SpecSeverity;
  hasLowConfidence: boolean;
  hasCorrections: boolean;
  hasProductOpportunities: boolean;
};

export type SpecSectionSummary = {
  sectionId: string;
  summary: string;
  attentionPoints: string[];
  /** 0–100; describes how much of the section the fixture claims to have extracted. */
  extractionCompleteness: number;
  generatedAt: string;
  /** Placeholder label only — no real model is called. */
  modelLabel: string;
};

/** PRD §10.4 — requirement categories. */
export type SpecRequirementCategory =
  | 'manufacturers'
  | 'basis-of-design'
  | 'materials-standards'
  | 'pressure-temperature'
  | 'joining-methods'
  | 'sizes'
  | 'listings-certifications'
  | 'testing'
  | 'submittal-obligations'
  | 'codes'
  | 'substitution-policy';

export type SpecVerificationState = 'extracted' | 'human-verified' | 'dismissed';

export type SpecRequirement = {
  id: string;
  sectionId: string;
  category: SpecRequirementCategory;
  value: string;
  qualifier?: string;
  part: SpecSectionPart;
  confidence: SpecConfidenceBand;
  confidencePercent: number;
  citationIds: string[];
  verification: SpecVerificationState;
};

export type SpecRedFlagType =
  | 'sole-source'
  | 'no-substitutions'
  | 'no-prior-approval'
  | 'proprietary-lock-in'
  | 'contradiction'
  | 'missing-reference'
  | 'stale-reference';

export type SpecRedFlagState = 'open' | 'confirmed' | 'dismissed' | 'resolved-in-working-copy';

export type SpecRedFlag = {
  id: string;
  sectionId: string;
  type: SpecRedFlagType;
  severity: SpecSeverity;
  title: string;
  explanation: string;
  confidence: SpecConfidenceBand;
  confidencePercent: number;
  citationIds: string[];
  state: SpecRedFlagState;
  owner?: string;
  /** Fixture rank; the UI orders by this, it does not compute severity itself. */
  rank: number;
};

/** How trustworthy a citation anchor is (PRD AC-013). */
export type SpecAnchorType = 'exact' | 'approximate' | 'unavailable';

export type SpecCitation = {
  id: string;
  documentId: string;
  versionLabel: string;
  sectionId: string;
  page: number;
  /** Stable id of the target block in the fixture document model. */
  blockId: string;
  excerpt: string;
  anchorType: SpecAnchorType;
};

export type SpecCorrectionReason =
  | 'incorrect'
  | 'incomplete'
  | 'wrong-category'
  | 'duplicate'
  | 'outdated'
  | 'other';

export type SpecCorrection = {
  id: string;
  requirementId: string;
  previousValue: string;
  nextValue: string;
  previousCategory: SpecRequirementCategory;
  nextCategory: SpecRequirementCategory;
  reason: SpecCorrectionReason;
  note?: string;
  actor: string;
  createdAt: string;
};

/** A paragraph-level block of the source document, rendered by the viewer adapter. */
export type SpecDocumentBlockKind = 'heading' | 'subheading' | 'paragraph' | 'list-item';

export type SpecDocumentBlock = {
  id: string;
  documentId: string;
  sectionId: string;
  page: number;
  kind: SpecDocumentBlockKind;
  /** Paragraph number as printed in the specification, e.g. `2.1.A.3`. */
  label?: string;
  text: string;
};

// ── SPEC V2 — recommendation-centered analysis and review ───────────────────

export type SpecRecommendationType = 'language' | 'product' | 'coordination' | 'compliance';

/** Matt’s six dashboard action groups (#14) — derived from type/category/evidence. */
export type SpecRecommendationAction =
  | 'add-manufacturer'
  | 'rewrite-language'
  | 'swap-part'
  | 'add-product'
  | 'update-reference'
  | 'blocked';

export type SpecRecommendationPriority = 'high' | 'medium' | 'low';

export type SpecRecommendationDecision = 'not-reviewed' | 'accepted' | 'later' | 'denied';

export type SpecRecommendationReanalysisState =
  | 'unchanged'
  | 'preserved'
  | 'changed'
  | 'resolved'
  | 'new';

export type SpecRecommendationProductEvidence = {
  suggestionId: string;
  sku: string;
  name: string;
  fit: SpecProductFit;
  fitReason: string;
  attributeTags: string[];
  commerciallyMotivated: boolean;
};

/**
 * Canonical V2 recommendation entity (implementation plan §5.3).
 * Existing extraction models are mapped into this shape by the analysis
 * repository so pages never translate requirements, red flags, and products.
 */
export type SpecRecommendation = {
  id: string;
  documentId: string;
  customerVersionId: string;
  customerVersionLabel: string;
  masterSpecId: string;
  masterVersion: string;
  sectionId: string;
  sectionNumber: string;
  sectionTitle: string;
  paragraphLabel: string;
  sourceCitation: SpecCitation;
  supportingCitationIds: string[];
  sourceFindingIds: string[];
  title: string;
  outcome: string;
  existingText: string;
  proposedText: string;
  reason: string;
  type: SpecRecommendationType;
  /** Derived dashboard facet — see `deriveSpecRecommendationAction`. */
  action: SpecRecommendationAction;
  category: string;
  priority: SpecRecommendationPriority;
  productEvidence: SpecRecommendationProductEvidence[];
  decision: SpecRecommendationDecision;
  denialReason?: string;
  decidedAt?: string;
  manualEditId?: string;
  reanalysisState: SpecRecommendationReanalysisState;
};

/** Persisted review mutation layered over the deterministic recommendation selector. */
export type SpecRecommendationReviewRecord = {
  recommendationId: string;
  documentId: string;
  decision: SpecRecommendationDecision;
  denialReason?: string;
  proposedTextOverride?: string;
  decidedAt?: string;
  updatedAt: string;
};

/** Basic whole-paragraph formatting supported by the Release 1 editor. */
export type SpecBlockFormatting = {
  style?: 'normal' | 'heading' | 'subheading';
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  bulleted?: boolean;
  numbered?: boolean;
};

/** One-editor-at-a-time prototype lock with an explicit inactivity expiry. */
export type SpecEditorLock = {
  documentId: string;
  owner: string;
  acquiredAt: string;
  expiresAt: string;
};

// ── I2 — Working copy, track changes, proposals, comments, review ────────────

export type SpecChangeStatus = 'pending' | 'accepted' | 'rejected';

export type SpecChangeMethod = 'manual' | 'ai';

/** Editable working copy of a document (PRD §10.5). Source blocks stay immutable. */
export type SpecWorkingCopy = {
  id: string;
  documentId: string;
  label: string;
  basedOnVersionLabel: string;
  createdAt: string;
  updatedAt: string;
  /** Paragraph overrides keyed by block id — applied only after Accept. */
  blockOverrides: Record<string, string>;
  /** Optional basic formatting overrides keyed by block id. */
  blockFormatting?: Record<string, SpecBlockFormatting>;
};

/** Tracked change on the working copy (manual edit or accepted AI proposal). */
export type SpecTrackedChange = {
  id: string;
  documentId: string;
  workingCopyId: string;
  blockId: string;
  sectionId: string;
  originalText: string;
  proposedText: string;
  status: SpecChangeStatus;
  method: SpecChangeMethod;
  author: string;
  rationale?: string;
  createdAt: string;
  resolvedAt?: string;
  /** Set when this change came from an AI proposal. */
  proposalId?: string;
  /** Set when this change came from Get Specified insertion (version trace). */
  guideSpecId?: string;
  guideVersion?: string;
  guideSnippetId?: string;
};

/** AI-proposed revision — working copy changes only on Accept (AC-018). */
export type SpecAiProposal = {
  id: string;
  documentId: string;
  workingCopyId: string;
  blockId: string;
  sectionId: string;
  originalText: string;
  proposedText: string;
  rationale: string;
  confidence: SpecConfidenceBand;
  confidencePercent: number;
  citationIds: string[];
  /** When true, UI shows persistent "ASC suggestion" tag (AC-019). */
  commerciallyMotivated: boolean;
  status: SpecChangeStatus;
  createdAt: string;
};

export type SpecCommentMessage = {
  id: string;
  author: string;
  body: string;
  createdAt: string;
};

/** Range-anchored comment thread (PRD §10.5 / §10.11). */
export type SpecCommentThread = {
  id: string;
  documentId: string;
  blockId: string;
  sectionId: string;
  resolved: boolean;
  createdAt: string;
  messages: SpecCommentMessage[];
};

/** Fixture-declared baseline for project review (PRD §10.6). */
export type SpecBaseline = {
  id: string;
  documentId: string;
  label: string;
  role: SpecDocumentRole;
  compatible: boolean;
  incompatibilityReason?: string;
};

/**
 * Delta category is declared by the fixture — the frontend never computes
 * semantic diff (PRD §10.6 / AC-021).
 */
export type SpecDeltaCategory = 'matched' | 'added' | 'removed' | 'unmatched' | 'semantic';

export type SpecAlignmentDelta = {
  id: string;
  documentId: string;
  baselineId: string;
  sectionKey: string;
  title: string;
  category: SpecDeltaCategory;
  currentText: string;
  baselineText: string;
  note?: string;
};

/** Saved version snapshot from the working copy (AC-020). */
export type SpecSavedVersion = {
  id: string;
  documentId: string;
  workingCopyId: string;
  label: string;
  description: string;
  createdAt: string;
  actor: string;
};

// ── I3 — Products, submittals, substitution ──────────────────────────────────

/** Fit is always labeled in text, never colour alone (AC-040). */
export type SpecProductFit = 'strong' | 'possible' | 'unknown' | 'no-fit';

export type SpecProductSuggestionStatus = 'suggested' | 'selected' | 'dismissed' | 'added-to-substitution';

export type SpecProductSuggestion = {
  id: string;
  documentId: string;
  sectionId: string;
  requirementId?: string;
  sku: string;
  name: string;
  series?: string;
  fit: SpecProductFit;
  fitReason: string;
  confidence: SpecConfidenceBand;
  confidencePercent: number;
  attributeTags: string[];
  /** Commercial ASC suggestion — must stay visually separate from neutral analysis. */
  commerciallyMotivated: boolean;
  status: SpecProductSuggestionStatus;
  citationIds: string[];
  /** Carried into a substitution line when the suggestion is added (PRD FR-15). */
  equivalence?: SpecEquivalenceAttribute[];
  savings?: SpecSubstitutionSavings;
  attachments?: SpecSubstitutionAttachment[];
};

export type SpecSubmittalObligationStatus = 'open' | 'in-package' | 'exported' | 'waived';

export type SpecSubmittalObligation = {
  id: string;
  documentId: string;
  sectionId: string;
  requirementId?: string;
  title: string;
  description: string;
  dueLabel?: string;
  status: SpecSubmittalObligationStatus;
  packageId?: string;
  missingDocuments: boolean;
};

export type SpecSubmittalPackageItem = {
  id: string;
  obligationId: string;
  title: string;
};

export type SpecSubmittalPackage = {
  id: string;
  documentId: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  items: SpecSubmittalPackageItem[];
};

export type SpecSubstitutionRequestStatus = 'draft' | 'ready-to-preview' | 'submitted';

/**
 * Outcome of one attribute comparison. `does-not-meet` must stay visible in the
 * request rather than being dropped — PRD FR-15 "honest justification".
 */
export type SpecEquivalenceOutcome = 'meets' | 'exceeds' | 'does-not-meet' | 'needs-review';

export type SpecEquivalenceAttribute = {
  id: string;
  attribute: string;
  specifiedValue: string;
  proposedValue: string;
  outcome: SpecEquivalenceOutcome;
  note?: string;
  citationId?: string;
};

/** Savings hooks (PRD FR-15). `basis` states where the numbers come from. */
export type SpecSubstitutionSavings = {
  materialLabel: string;
  labourLabel: string;
  leadTimeLabel: string;
  basis: string;
};

export type SpecSubstitutionAttachmentKind = 'cut-sheet' | 'listing' | 'test-report' | 'drawing';

export type SpecSubstitutionAttachment = {
  id: string;
  title: string;
  kind: SpecSubstitutionAttachmentKind;
  available: boolean;
  note?: string;
};

export type SpecSubstitutionLine = {
  id: string;
  suggestionId: string;
  specifiedValue: string;
  proposedSku: string;
  proposedName: string;
  rationale: string;
  equivalence: SpecEquivalenceAttribute[];
  savings?: SpecSubstitutionSavings;
  attachments: SpecSubstitutionAttachment[];
};

export type SpecSubstitutionRequest = {
  id: string;
  documentId: string;
  title: string;
  status: SpecSubstitutionRequestStatus;
  lines: SpecSubstitutionLine[];
  notes?: string;
  updatedAt: string;
};

// ── I4 — Ask an Engineer + Deliver-Back ──────────────────────────────────────

export type SpecAskThreadStatus = 'draft' | 'submitted' | 'in-progress' | 'answered' | 'closed';

export type SpecAskUrgency = 'normal' | 'high';

/** Non-editable snapshot captured when the request is created (AC-030). */
export type SpecAskContextSnapshot = {
  documentId: string;
  documentTitle: string;
  versionLabel: string;
  sectionId: string;
  sectionLabel: string;
  findingId?: string;
  findingTitle?: string;
  citationId?: string;
  citationExcerpt?: string;
};

export type SpecAskMessageRole = 'requester' | 'engineer' | 'system';

export type SpecAskProposedWording = {
  blockId: string;
  sectionId: string;
  originalText: string;
  proposedText: string;
  rationale: string;
};

export type SpecAskMessage = {
  id: string;
  author: string;
  role: SpecAskMessageRole;
  body: string;
  createdAt: string;
  /** When set, UI can create a pending editor proposal (AC-031). */
  proposedWording?: SpecAskProposedWording;
};

export type SpecAskThread = {
  id: string;
  documentId: string;
  subject: string;
  question: string;
  requestType: string;
  urgency: SpecAskUrgency;
  status: SpecAskThreadStatus;
  context: SpecAskContextSnapshot;
  messages: SpecAskMessage[];
  createdAt: string;
  updatedAt: string;
  /** Set after "Create change from answer" produces a pending proposal. */
  createdProposalId?: string;
};

export type SpecDeliverBackStatus =
  | 'requested'
  | 'in-progress'
  | 'delivered'
  | 'revision-requested'
  | 'accepted';

export type SpecDeliverBackVersion = {
  id: string;
  label: string;
  summary: string;
  createdAt: string;
  accepted: boolean;
};

export type SpecDeliverBackActivity = {
  id: string;
  at: string;
  actor: string;
  action: string;
  detail?: string;
};

export type SpecDeliverBackNotification = {
  id: string;
  at: string;
  title: string;
  body: string;
};

export type SpecDeliverBackRedline = {
  id: string;
  summary: string;
  status: 'open' | 'resolved';
};

export type SpecDeliverable = {
  id: string;
  documentId: string;
  title: string;
  owner: string;
  recipientOrg: string;
  status: SpecDeliverBackStatus;
  currentVersionId: string;
  versions: SpecDeliverBackVersion[];
  activity: SpecDeliverBackActivity[];
  notifications: SpecDeliverBackNotification[];
  comments: SpecCommentMessage[];
  redlines: SpecDeliverBackRedline[];
  previewText: string;
};

/** Guide-language approval lifecycle (PRD §10.12, AC-035). */
export type SpecGuideApprovalStatus = 'draft' | 'in-review' | 'approved' | 'superseded';

/**
 * How non-approved language behaves on insert (AC-035).
 * `warn` → confirm; `blocked` → cannot insert.
 */
export type SpecGuideInsertPermission = 'allow' | 'warn' | 'blocked';

export type SpecGuideSnippet = {
  id: string;
  title: string;
  body: string;
  /** Suggested MasterFormat clause label after insert (e.g. 2.2.B). */
  suggestedLabel: string;
  /** Preferred target block when inserting into a matching section. */
  preferredBlockId?: string;
  preferredSectionId?: string;
};

export type SpecGuideSpec = {
  id: string;
  title: string;
  division: string;
  sectionNumber: string;
  sectionTitle: string;
  productFamily: string;
  application: string;
  jurisdiction: string;
  approvalStatus: SpecGuideApprovalStatus;
  insertPermission: SpecGuideInsertPermission;
  owner: string;
  version: string;
  lastReviewedAt: string;
  updatedAt: string;
  content: string;
  snippets: SpecGuideSnippet[];
  /** When true, UI shows adoption placeholder (no real telemetry). */
  adoptionPlaceholder?: string;
};

/** Computed merge preview before creating a working-copy change (AC-036). */
export type SpecGuideMergePreview = {
  guideSpecId: string;
  guideVersion: string;
  snippetId: string;
  documentId: string;
  workingCopyId: string;
  blockId: string;
  sectionId: string;
  currentLabel?: string;
  proposedLabel: string;
  originalText: string;
  proposedText: string;
  numberingNote: string;
  conflicts: string[];
  canInsert: boolean;
};
