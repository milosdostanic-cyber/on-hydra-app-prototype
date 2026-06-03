import type {
  BraceOrientation,
  CpMethod,
  SeismicCodeRequirement,
  SeismicDesignLoadType,
  SeismicDesignUnit,
} from '../types';

/** Label maps + select options mirrored from the ZIP enums (values regenerated for the prototype). */

export const CODE_REQUIREMENT_LABELS: Record<SeismicCodeRequirement, string> = {
  ASCE_7_16: 'ASCE 7-16',
  ASCE_7_22: 'ASCE 7-22',
  NFPA_13_2022: 'NFPA 13 (2022)',
  IBC_2021: 'IBC 2021',
};

export const CODE_REQUIREMENT_OPTIONS = (
  Object.keys(CODE_REQUIREMENT_LABELS) as SeismicCodeRequirement[]
).map((value) => ({ value, label: CODE_REQUIREMENT_LABELS[value] }));

export const UNIT_LABELS: Record<SeismicDesignUnit, string> = {
  IMPERIAL: 'Imperial (lb, in)',
  METRIC: 'Metric (kg, mm)',
};

export const UNIT_OPTIONS = (Object.keys(UNIT_LABELS) as SeismicDesignUnit[]).map((value) => ({
  value,
  label: UNIT_LABELS[value],
}));

export const LOAD_TYPE_LABELS: Record<SeismicDesignLoadType, string> = {
  UL: 'UL loads',
  FM: 'FM loads',
};

export const LOAD_TYPE_OPTIONS = (
  Object.keys(LOAD_TYPE_LABELS) as SeismicDesignLoadType[]
).map((value) => ({ value, label: LOAD_TYPE_LABELS[value] }));

export const ORIENTATION_LABELS: Record<BraceOrientation, string> = {
  LAT_ORIENTATION: 'Lateral',
  LONG_ORIENTATION: 'Longitudinal',
  LAT_LONG_ORIENTATION: 'Lateral / Longitudinal',
  VERTICAL_ORIENTATION: 'Vertical (Riser)',
};

export const ORIENTATION_OPTIONS = (
  Object.keys(ORIENTATION_LABELS) as BraceOrientation[]
).map((value) => ({ value, label: ORIENTATION_LABELS[value] }));

/** Cp methods available per code requirement (ZIP `CodeRequirementToMethods`, simplified). */
export const CODE_REQUIREMENT_TO_METHODS: Record<SeismicCodeRequirement, CpMethod[]> = {
  ASCE_7_16: ['A', 'B', 'C', 'D'],
  ASCE_7_22: ['A', 'B', 'C', 'D', 'G', 'H'],
  NFPA_13_2022: ['A', 'B', 'C', 'E', 'F'],
  IBC_2021: ['A', 'B', 'C', 'D'],
};

export const CP_METHOD_LABELS: Record<CpMethod, string> = {
  A: 'Method A — Ss lookup',
  B: 'Method B — Ss (alt.)',
  C: 'Method C — Manual Cp',
  D: 'Method D — Ss + site class + height',
  E: 'Method E — NFPA Ss + site class',
  F: 'Method F — Ss + brace height + site',
  G: 'Method G — SDs + brace height',
  H: 'Method H — SDs + risk category',
};

export const SITE_CLASS_OPTIONS = ['A', 'B', 'C', 'D', 'E', 'F'].map((v) => ({
  value: v,
  label: `Site Class ${v}`,
}));

export const STRUCTURE_OPTIONS = [
  'Concrete (normal weight)',
  'Concrete (lightweight)',
  'Steel — Wide Flange',
  'Steel — Bar Joist',
  'Wood',
  'USER_DEFINED',
].map((v) => ({ value: v, label: v === 'USER_DEFINED' ? 'User defined…' : v }));

export const SUBSTRATE_OPTIONS = [
  'Cracked concrete',
  'Uncracked concrete',
  'Composite deck',
  'Hollow core',
].map((v) => ({ value: v, label: v }));

export const FASTENER_OPTIONS = [
  'Wedge anchor 1/2"',
  'Wedge anchor 5/8"',
  'Adhesive anchor 1/2"',
  'Through bolt 5/8"',
  'USER_DEFINED',
].map((v) => ({ value: v, label: v === 'USER_DEFINED' ? 'User defined…' : v }));

export const FASTENER_ORIENTATION_OPTIONS = ['Vertical', 'Horizontal', 'Overhead'].map((v) => ({
  value: v,
  label: v,
}));

export const FASTENER_SIZE_OPTIONS = ['1/2"', '5/8"', '3/4"'].map((v) => ({ value: v, label: v }));

export const BRACE_ANGLE_OPTIONS = [30, 45, 60, 90].map((v) => ({ value: v, label: `${v}°` }));

export const BRACE_MEMBER_OPTIONS = [
  'Pipe 1" Sch 40',
  'Pipe 1-1/4" Sch 40',
  'Pipe 1-1/2" Sch 40',
  'Angle 1-1/2 x 1-1/2 x 1/4',
].map((v) => ({ value: v, label: v }));

export const PIPE_SIZE_OPTIONS = ['1"', '1-1/4"', '1-1/2"', '2"', '2-1/2"', '3"', '4"', '6"'].map(
  (v) => ({ value: v, label: v }),
);

export const PIPE_TYPE_OPTIONS = ['Sch 10', 'Sch 40', 'CPVC', 'Copper'].map((v) => ({
  value: v,
  label: v,
}));
