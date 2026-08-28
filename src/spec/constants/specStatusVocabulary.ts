import type { BadgeProps } from 'antd';

import type {
  SpecAccessLevel,
  SpecAnchorType,
  SpecAskThreadStatus,
  SpecChangeMethod,
  SpecChangeStatus,
  SpecConfidenceBand,
  SpecDeltaCategory,
  SpecDeliverBackStatus,
  SpecDocumentRole,
  SpecEquivalenceOutcome,
  SpecGuideApprovalStatus,
  SpecProcessingStageId,
  SpecProcessingState,
  SpecProductFit,
  SpecProductSuggestionStatus,
  SpecRecommendationAction,
  SpecRedFlagState,
  SpecRedFlagType,
  SpecRequirementCategory,
  SpecReviewState,
  SpecSectionPart,
  SpecSeverity,
  SpecSubmittalObligationStatus,
  SpecSubstitutionAttachmentKind,
  SpecSubstitutionRequestStatus,
  SpecSystemType,
  SpecVerificationState,
} from '../data/types';

/**
 * Every user-visible Spec label lives here so trust language stays consistent
 * (PRD §14.4) and so no status is ever communicated by colour alone (PRD AC-040).
 */

type AntBadgeStatus = NonNullable<BadgeProps['status']>;

export const processingStateLabel: Record<SpecProcessingState, string> = {
  queued: 'Queued',
  processing: 'Processing',
  partial: 'Partial results',
  ready: 'Ready',
  failed: 'Failed',
  cancelled: 'Cancelled',
};

export function processingBadgeStatus(state: SpecProcessingState): AntBadgeStatus {
  if (state === 'ready') return 'success';
  if (state === 'failed') return 'error';
  if (state === 'partial') return 'warning';
  if (state === 'cancelled') return 'default';
  return 'processing';
}

/** PRD §10.3 — the seven stages, in the order they run. */
export const PROCESSING_STAGE_ORDER: SpecProcessingStageId[] = [
  'upload-received',
  'ocr-layout',
  'section-detection',
  'requirement-extraction',
  'red-flag-analysis',
  'citation-mapping',
  'finalizing',
];

export const processingStageLabel: Record<SpecProcessingStageId, string> = {
  'upload-received': 'Upload received',
  'ocr-layout': 'Reading pages and layout',
  'section-detection': 'Detecting sections',
  'requirement-extraction': 'Extracting requirements',
  'red-flag-analysis': 'Analysing red flags',
  'citation-mapping': 'Mapping citations to source',
  finalizing: 'Finalizing',
};

export const reviewStateLabel: Record<SpecReviewState, string> = {
  'not-started': 'Not reviewed',
  'in-review': 'In review',
  corrected: 'Corrected',
  approved: 'Approved',
};

export const systemTypeLabel: Record<SpecSystemType, string> = {
  'fire-protection': 'Fire Protection',
  plumbing: 'Plumbing',
  hvac: 'HVAC',
};

export const systemTypeDivision: Record<SpecSystemType, string> = {
  'fire-protection': '21',
  plumbing: '22',
  hvac: '23',
};

/** Matt #14 — dashboard action-type facets. */
export const recommendationActionLabel: Record<SpecRecommendationAction, string> = {
  'add-manufacturer': 'Add manufacturer',
  'rewrite-language': 'Rewrite language',
  'swap-part': 'Swap part',
  'add-product': 'Add product',
  'update-reference': 'Update reference',
  blocked: 'Blocked',
};

export const RECOMMENDATION_ACTION_ORDER: SpecRecommendationAction[] = [
  'add-manufacturer',
  'rewrite-language',
  'swap-part',
  'add-product',
  'update-reference',
  'blocked',
];

export const documentRoleLabel: Record<SpecDocumentRole, string> = {
  'project-specification': 'Project specification',
  'office-master': 'Office master',
  'prior-project': 'Prior project',
  addendum: 'Addendum',
  'guide-spec': 'Guide spec',
  other: 'Other',
};

export const confidenceLabel: Record<SpecConfidenceBand, string> = {
  high: 'High confidence',
  medium: 'Medium confidence',
  low: 'Low confidence',
};

/** Compact form for dense table cells. */
export const confidenceShortLabel: Record<SpecConfidenceBand, string> = {
  high: 'High',
  medium: 'Medium',
  low: 'Low',
};

export const severityLabel: Record<SpecSeverity, string> = {
  critical: 'Critical',
  major: 'Major',
  minor: 'Minor',
  info: 'For information',
};

/** Fixture-independent ordering for the Red Flags list (PRD AC-011). */
export const severityRank: Record<SpecSeverity, number> = {
  critical: 0,
  major: 1,
  minor: 2,
  info: 3,
};

export const redFlagTypeLabel: Record<SpecRedFlagType, string> = {
  'sole-source': 'Sole source',
  'no-substitutions': 'No substitutions permitted',
  'no-prior-approval': 'No prior approval process',
  'proprietary-lock-in': 'Proprietary lock-in',
  contradiction: 'Contradiction',
  'missing-reference': 'Missing reference',
  'stale-reference': 'Stale reference',
};

export const redFlagStateLabel: Record<SpecRedFlagState, string> = {
  open: 'Open',
  confirmed: 'Confirmed',
  dismissed: 'Dismissed',
  'resolved-in-working-copy': 'Resolved in working copy',
};

export function redFlagBadgeStatus(state: SpecRedFlagState): AntBadgeStatus {
  if (state === 'confirmed') return 'error';
  if (state === 'dismissed') return 'default';
  if (state === 'resolved-in-working-copy') return 'success';
  return 'warning';
}

export const requirementCategoryLabel: Record<SpecRequirementCategory, string> = {
  manufacturers: 'Manufacturers',
  'basis-of-design': 'Basis of design',
  'materials-standards': 'Materials and standards',
  'pressure-temperature': 'Pressure and temperature',
  'joining-methods': 'Joining methods',
  sizes: 'Sizes',
  'listings-certifications': 'Listings and certifications',
  testing: 'Testing',
  'submittal-obligations': 'Submittal obligations',
  codes: 'Codes',
  'substitution-policy': 'Substitution policy',
};

export const REQUIREMENT_CATEGORY_ORDER: SpecRequirementCategory[] = [
  'manufacturers',
  'basis-of-design',
  'materials-standards',
  'pressure-temperature',
  'joining-methods',
  'sizes',
  'listings-certifications',
  'testing',
  'submittal-obligations',
  'codes',
  'substitution-policy',
];

/** PRD §14.4 — "Extracted" until a person confirms it, then "Human verified". */
export const verificationLabel: Record<SpecVerificationState, string> = {
  extracted: 'Extracted',
  'human-verified': 'Human verified',
  dismissed: 'Dismissed',
};

export const sectionPartLabel: Record<SpecSectionPart, string> = {
  general: 'Part 1 — General',
  products: 'Part 2 — Products',
  execution: 'Part 3 — Execution',
};

export const sectionPartShortLabel: Record<SpecSectionPart, string> = {
  general: 'P1',
  products: 'P2',
  execution: 'P3',
};

export const anchorTypeLabel: Record<SpecAnchorType, string> = {
  exact: 'Exact location',
  approximate: 'Approximate location',
  unavailable: 'Location unavailable',
};

export const accessLevelLabel: Record<SpecAccessLevel, string> = {
  owner: 'Owner',
  editor: 'Can edit',
  'comment-only': 'Comment only',
  'view-only': 'View only',
  revoked: 'Access revoked',
};

/** Explains to the user why an action is unavailable, instead of a bare disabled button. */
export const accessLevelRestriction: Record<SpecAccessLevel, string | undefined> = {
  owner: undefined,
  editor: undefined,
  'comment-only': 'Your access to this document is comment only. You can add comments but not edit or approve.',
  'view-only': 'Your access to this document is view only. You cannot comment, edit, or approve.',
  revoked: 'Your access to this document has been revoked. Ask the owner to share it again.',
};

export function canEdit(access: SpecAccessLevel): boolean {
  return access === 'owner' || access === 'editor';
}

export function canComment(access: SpecAccessLevel): boolean {
  return access === 'owner' || access === 'editor' || access === 'comment-only';
}

export const LIBRARY_SCOPE_LABEL = 'Organization library';

// ── I2 vocabulary ────────────────────────────────────────────────────────────

export const changeStatusLabel: Record<SpecChangeStatus, string> = {
  pending: 'Pending',
  accepted: 'Accepted',
  rejected: 'Rejected',
};

export const changeMethodLabel: Record<SpecChangeMethod, string> = {
  manual: 'Manual edit',
  ai: 'AI proposal',
};

export const deltaCategoryLabel: Record<SpecDeltaCategory, string> = {
  matched: 'Matched',
  added: 'Added',
  removed: 'Removed',
  unmatched: 'Unmatched',
  semantic: 'Changed meaning',
};

export function deltaCategoryTone(
  category: SpecDeltaCategory,
): 'default' | 'success' | 'warning' | 'error' | 'processing' {
  if (category === 'added') return 'success';
  if (category === 'removed') return 'error';
  if (category === 'semantic') return 'warning';
  if (category === 'unmatched') return 'processing';
  return 'default';
}

// ── I3 vocabulary ────────────────────────────────────────────────────────────

export const productFitLabel: Record<SpecProductFit, string> = {
  strong: 'Strong fit',
  possible: 'Possible fit',
  unknown: 'Fit unknown',
  'no-fit': 'No suitable ASC product',
};

export function productFitTone(
  fit: SpecProductFit,
): 'default' | 'success' | 'warning' | 'error' | 'processing' {
  if (fit === 'strong') return 'success';
  if (fit === 'possible') return 'processing';
  if (fit === 'unknown') return 'warning';
  return 'error';
}

export const productSuggestionStatusLabel: Record<SpecProductSuggestionStatus, string> = {
  suggested: 'Suggested',
  selected: 'Selected',
  dismissed: 'Dismissed',
  'added-to-substitution': 'On substitution request',
};

export const submittalObligationStatusLabel: Record<SpecSubmittalObligationStatus, string> = {
  open: 'Open',
  'in-package': 'In package',
  exported: 'Exported',
  waived: 'Waived',
};

export const substitutionRequestStatusLabel: Record<SpecSubstitutionRequestStatus, string> = {
  draft: 'Draft',
  'ready-to-preview': 'Ready to preview',
  submitted: 'Submitted',
};

export const equivalenceOutcomeLabel: Record<SpecEquivalenceOutcome, string> = {
  meets: 'Meets',
  exceeds: 'Exceeds',
  'does-not-meet': 'Does not meet',
  'needs-review': 'Needs review',
};

export function equivalenceOutcomeTone(
  outcome: SpecEquivalenceOutcome,
): 'default' | 'success' | 'warning' | 'error' | 'processing' {
  if (outcome === 'meets') return 'success';
  if (outcome === 'exceeds') return 'processing';
  if (outcome === 'does-not-meet') return 'error';
  return 'warning';
}

export const substitutionAttachmentKindLabel: Record<SpecSubstitutionAttachmentKind, string> = {
  'cut-sheet': 'Cut sheet',
  listing: 'Listing',
  'test-report': 'Test report',
  drawing: 'Drawing',
};

// ── I4 vocabulary ────────────────────────────────────────────────────────────

export const askThreadStatusLabel: Record<SpecAskThreadStatus, string> = {
  draft: 'Draft',
  submitted: 'Submitted',
  'in-progress': 'In progress',
  answered: 'Answered',
  closed: 'Closed',
};

export function askThreadBadgeStatus(status: SpecAskThreadStatus): AntBadgeStatus {
  if (status === 'answered') return 'success';
  if (status === 'closed') return 'default';
  if (status === 'in-progress') return 'processing';
  if (status === 'submitted') return 'warning';
  return 'default';
}

export const deliverBackStatusLabel: Record<SpecDeliverBackStatus, string> = {
  requested: 'Requested',
  'in-progress': 'In progress',
  delivered: 'Delivered',
  'revision-requested': 'Revision requested',
  accepted: 'Accepted',
};

export function deliverBackBadgeStatus(status: SpecDeliverBackStatus): AntBadgeStatus {
  if (status === 'accepted') return 'success';
  if (status === 'delivered') return 'warning';
  if (status === 'revision-requested') return 'error';
  if (status === 'in-progress') return 'processing';
  return 'default';
}

/** Lifecycle step order for Deliver-Back vertical Steps (AC-032). */
export const DELIVER_BACK_STEP_ORDER: SpecDeliverBackStatus[] = [
  'requested',
  'in-progress',
  'delivered',
  'accepted',
];

export function canApprove(access: SpecAccessLevel): boolean {
  return access === 'owner' || access === 'editor';
}

/** Guide-language approval labels (PRD §10.12, AC-035) — text always accompanies colour. */
export const guideApprovalStatusLabel: Record<SpecGuideApprovalStatus, string> = {
  draft: 'Draft',
  'in-review': 'In review',
  approved: 'Approved',
  superseded: 'Superseded',
};

export function guideApprovalBadgeStatus(status: SpecGuideApprovalStatus): AntBadgeStatus {
  if (status === 'approved') return 'success';
  if (status === 'superseded') return 'default';
  if (status === 'in-review') return 'processing';
  return 'warning';
}

export const GUIDE_EXPORT_CHOICES = [
  { key: 'docx', title: 'DOCX', description: 'Mock Word export of the selected guide language.' },
  {
    key: 'speclink',
    title: 'SpecLink-friendly',
    description: 'Mock package shaped for SpecLink import.',
  },
  {
    key: 'masterspec',
    title: 'MasterSpec-friendly',
    description: 'Mock package shaped for MasterSpec workflows.',
  },
] as const;
