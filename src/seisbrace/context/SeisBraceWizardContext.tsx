import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useNavigate } from 'react-router-dom';

import {
  WIZARD_STEPS,
  WIZARD_STEP_BY_NUMBER,
  type WizardStepSlug,
} from '../constants/wizardSteps';
import type {
  BraceConfig,
  BraceOrientation,
  CpMethod,
  SegmentRow,
  SeismicCodeRequirement,
  SeismicDesignLoadType,
  SeismicDesignUnit,
} from '../types';

/** Full wizard draft accumulated across steps before committing to the data store. */
export type WizardDraft = {
  seismicDesignId: string | null;
  braceId: string | null;
  // Step 1 — seismic design
  designName: string;
  projectDate: string;
  codeRequirement: SeismicCodeRequirement;
  loadType: SeismicDesignLoadType;
  unit: SeismicDesignUnit;
  notes: string;
  // Step 2 — brace info + Cp
  braceName: string;
  drawingRef: string;
  qty: number | null;
  cpMethod: CpMethod;
  cpInputs: Record<string, number | string>;
  cpValue: number;
  // Step 3 — brace type / ZOI
  orientation: BraceOrientation;
  segments: SegmentRow[];
  // Step 4 — structure & sway brace
  structure: string;
  isStructureUserDefined: boolean;
  substrate: string;
  fastener: string;
  isFastenerUserDefined: boolean;
  fastenerOrientation: string;
  fastenerSize: string;
  braceAngleMin: number;
  braceAngleMax: number;
  lrMax: number;
  braceMember: string;
  // Step 5 — parts selection
  swivelTypeId: string | null;
  pipeAttachmentId: string | null;
  structuralAttachmentId: string | null;
};

function emptyDraft(): WizardDraft {
  return {
    seismicDesignId: null,
    braceId: null,
    designName: '',
    projectDate: new Date().toISOString(),
    codeRequirement: 'ASCE_7_22',
    loadType: 'UL',
    unit: 'IMPERIAL',
    notes: '',
    braceName: '',
    drawingRef: '',
    qty: 1,
    cpMethod: 'A',
    cpInputs: { ss: 1 },
    cpValue: 0.5,
    orientation: 'LAT_ORIENTATION',
    segments: [{ id: 'seg-1', pipeSize: '2"', pipeType: 'Sch 40', pipeLength: 20, pipeWeight: 5 }],
    structure: 'Concrete (normal weight)',
    isStructureUserDefined: false,
    substrate: 'Cracked concrete',
    fastener: 'Wedge anchor 1/2"',
    isFastenerUserDefined: false,
    fastenerOrientation: 'Vertical',
    fastenerSize: '1/2"',
    braceAngleMin: 30,
    braceAngleMax: 60,
    lrMax: 200,
    braceMember: 'Pipe 1" Sch 40',
    swivelTypeId: null,
    pipeAttachmentId: null,
    structuralAttachmentId: null,
  };
}

export function draftToBraceConfig(draft: WizardDraft): BraceConfig {
  return {
    cpMethod: draft.cpMethod,
    cpInputs: draft.cpInputs,
    orientation: draft.orientation,
    segments: draft.segments,
    structure: draft.structure,
    isStructureUserDefined: draft.isStructureUserDefined,
    substrate: draft.substrate,
    fastener: draft.fastener,
    isFastenerUserDefined: draft.isFastenerUserDefined,
    fastenerOrientation: draft.fastenerOrientation,
    fastenerSize: draft.fastenerSize,
    braceAngleMin: draft.braceAngleMin,
    braceAngleMax: draft.braceAngleMax,
    lrMax: draft.lrMax,
    braceMember: draft.braceMember,
    swivelTypeId: draft.swivelTypeId,
    pipeAttachmentId: draft.pipeAttachmentId,
    structuralAttachmentId: draft.structuralAttachmentId,
  };
}

type WizardContextValue = {
  draft: WizardDraft;
  patchDraft: (partial: Partial<WizardDraft>) => void;
  resetDraft: (initial?: Partial<WizardDraft>) => void;
  /** Highest step number reached (controls which sider steps are clickable). */
  maxStepReached: number;
  markStepReached: (stepNumber: number) => void;
  goToStep: (slug: WizardStepSlug) => void;
};

const SeisBraceWizardContext = createContext<WizardContextValue | null>(null);

export function SeisBraceWizardProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const [draft, setDraft] = useState<WizardDraft>(emptyDraft);
  const [maxStepReached, setMaxStepReached] = useState(1);

  const patchDraft = useCallback((partial: Partial<WizardDraft>) => {
    setDraft((prev) => ({ ...prev, ...partial }));
  }, []);

  const resetDraft = useCallback((initial?: Partial<WizardDraft>) => {
    setDraft({ ...emptyDraft(), ...initial });
    // Editing a brace → all steps reachable; adding a brace to an existing design → from step 2;
    // brand-new design → only step 1.
    if (initial?.braceId) setMaxStepReached(WIZARD_STEPS.length);
    else if (initial?.seismicDesignId) setMaxStepReached(2);
    else setMaxStepReached(1);
  }, []);

  const markStepReached = useCallback((stepNumber: number) => {
    setMaxStepReached((prev) => Math.max(prev, stepNumber));
  }, []);

  const goToStep = useCallback(
    (slug: WizardStepSlug) => {
      navigate(`/seisbrace/wizard/${slug}`);
    },
    [navigate],
  );

  const value = useMemo<WizardContextValue>(
    () => ({ draft, patchDraft, resetDraft, maxStepReached, markStepReached, goToStep }),
    [draft, patchDraft, resetDraft, maxStepReached, markStepReached, goToStep],
  );

  return (
    <SeisBraceWizardContext.Provider value={value}>{children}</SeisBraceWizardContext.Provider>
  );
}

export function useSeisBraceWizard(): WizardContextValue {
  const ctx = useContext(SeisBraceWizardContext);
  if (!ctx) throw new Error('useSeisBraceWizard must be used within SeisBraceWizardProvider');
  return ctx;
}

export { WIZARD_STEP_BY_NUMBER };
