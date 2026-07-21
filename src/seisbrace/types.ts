/**
 * SeisBrace domain types — Hydra reframe of the Content ZIP `business/projects` (seismic bracing)
 * module. The ZIP "project" is the construction project, owned by the shell/top bar
 * (`useActiveProject()`), so the importable entities are seismic designs, their braces, the parts
 * catalog, and project files — all scoped by construction `projectId`.
 *
 * Engineering values (seismic load, Cp, capacities, weights) are representative static figures for
 * the prototype — no real calculation engine is ported.
 */

export type SeismicCodeRequirement =
  | 'ASCE_7_16'
  | 'ASCE_7_22'
  | 'NFPA_13_2022'
  | 'IBC_2021';

export type SeismicDesignUnit = 'IMPERIAL' | 'METRIC';

export type SeismicDesignLoadType = 'UL' | 'FM';

/** Step 2 seismic coefficient calculation method (ZIP `CPCalculationMethod` A–H). */
export type CpMethod = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H';

export type BraceStatus = 'COMPLETE' | 'INCOMPLETE';

export type BraceOrientation =
  | 'LAT_ORIENTATION'
  | 'LONG_ORIENTATION'
  | 'LAT_LONG_ORIENTATION'
  | 'VERTICAL_ORIENTATION';

export type SeismicDesign = {
  id: string;
  /** Construction project (matches `useActiveProject().projectId`). */
  projectId: string;
  name: string;
  displayName: string;
  projectDate: string;
  codeRequirement: SeismicCodeRequirement;
  loadType: SeismicDesignLoadType;
  unit: SeismicDesignUnit;
  notes?: string;
};

/** Zone-of-influence pipe segment row (Brace Configuration step main/branch line). */
export type SegmentRow = {
  id: string;
  pipeSize: string;
  pipeType: string;
  pipeLength: number;
  pipeWeight: number;
};

/** Deeper wizard config that is not a brace-table column (round-tripped when editing a brace). */
export type BraceConfig = {
  cpMethod: CpMethod;
  cpInputs: Record<string, number | string>;
  orientation: BraceOrientation;
  segments: SegmentRow[];
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
  swivelTypeId: string | null;
  pipeAttachmentId: string | null;
  structuralAttachmentId: string | null;
};

export type Brace = {
  id: string;
  seismicDesignId: string;
  name: string;
  displayName: string;
  drawingRef: string | null;
  qty: number | null;
  /** Seismic design force Fpw (lbf), shown in the brace table. */
  seismicLoad: number;
  structure: string;
  braceDescription: BraceOrientation;
  fastener: string;
  attachments: string;
  status: BraceStatus;
  cpValue: number;
  order: number;
  isStructureUserDefined: boolean;
  isFastenerUserDefined: boolean;
  config?: BraceConfig;
};

export type SeisBraceFile = {
  id: string;
  projectId: string;
  title: string;
  filename: string;
  /** 'submittal' files render in the Submittals & Reports section; 'user' under Uploaded files. */
  kind: 'submittal' | 'user';
};

export type SwivelType = {
  id: string;
  name: string;
  figureNumber: string;
  listedLoadRating: number;
  adjustedLoadRating: number;
};

export type PipeAttachment = {
  id: string;
  name: string;
  figureNumber: string;
  size: string;
  capacity: number;
};

export type StructuralAttachment = {
  id: string;
  name: string;
  fastenerLoadCapacity: number;
  swivelConnectionCapacity: number;
  structuralAttachmentCapacity: number;
  minSlabThickness: string;
  swivelConnectionFigure: string;
  structuralAttachmentFigure: string;
  fastenerFigure: string;
};
