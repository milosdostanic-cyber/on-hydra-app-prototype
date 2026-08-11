import { PIPE_ATTACHMENTS, SWIVEL_TYPES } from '../data/partsCatalog';
import type { NewBraceInput } from '../context/SeisBraceContext';
import type { WizardDraft } from '../context/SeisBraceWizardContext';
import { draftToBraceConfig } from '../context/SeisBraceWizardContext';
import type { BraceStatus } from '../types';

/** Total zone-of-influence pipe weight (representative — sum of weight x length per segment). */
export function totalZoiWeight(draft: WizardDraft): number {
  return Math.round(draft.segments.reduce((sum, s) => sum + s.pipeWeight * s.pipeLength, 0));
}

/** Representative seismic design force Fpw = Cp x Wp (no real engine). */
export function seismicDesignForce(draft: WizardDraft): number {
  return Math.round(draft.cpValue * totalZoiWeight(draft));
}

function attachmentsLabel(draft: WizardDraft): string {
  const swivel = SWIVEL_TYPES.find((s) => s.id === draft.swivelTypeId)?.figureNumber;
  const pipe = PIPE_ATTACHMENTS.find((p) => p.id === draft.pipeAttachmentId)?.figureNumber;
  return [swivel, pipe].filter(Boolean).join(' / ') || '-';
}

/** Map the wizard draft to brace store fields for create/update. */
export function draftToBraceFields(draft: WizardDraft, status: BraceStatus): NewBraceInput {
  return {
    name: draft.braceName.trim() || 'New brace',
    displayName: draft.braceName.trim() || 'New brace',
    drawingRef: draft.drawingRef.trim() || null,
    qty: draft.qty,
    seismicLoad: status === 'COMPLETE' ? seismicDesignForce(draft) : 0,
    structure: draft.structure,
    braceDescription: draft.orientation,
    fastener: draft.fastener,
    attachments: attachmentsLabel(draft),
    status,
    cpValue: draft.cpValue,
    isStructureUserDefined: draft.isStructureUserDefined,
    isFastenerUserDefined: draft.isFastenerUserDefined,
    config: draftToBraceConfig(draft),
  };
}
