import type { PipeAttachment, StructuralAttachment, SwivelType } from '../types';

/** Static parts catalogs for the Parts Selection step (ZIP swivel / pipe / structural attachment lists). */

export const SWIVEL_TYPES: SwivelType[] = [
  { id: 'sw-4a', name: 'Sway Brace Swivel Fitting 4A', figureNumber: 'Fig. 4A', listedLoadRating: 2000, adjustedLoadRating: 1700 },
  { id: 'sw-4l', name: 'Lateral/Longitudinal Swivel 4L', figureNumber: 'Fig. 4L', listedLoadRating: 2500, adjustedLoadRating: 2125 },
  { id: 'sw-4r', name: 'Riser Swivel Fitting 4R', figureNumber: 'Fig. 4R', listedLoadRating: 3000, adjustedLoadRating: 2550 },
  { id: 'sw-4h', name: 'Heavy-Duty Swivel 4H', figureNumber: 'Fig. 4H', listedLoadRating: 4000, adjustedLoadRating: 3400 },
];

export const PIPE_ATTACHMENTS: PipeAttachment[] = [
  { id: 'pa-200', name: 'Sway Brace Fitting 200', figureNumber: 'Fig. 200', size: '1" – 2"', capacity: 1800 },
  { id: 'pa-201', name: 'Sway Brace Fitting 201', figureNumber: 'Fig. 201', size: '2-1/2" – 4"', capacity: 2600 },
  { id: 'pa-202', name: 'Universal Pipe Attachment 202', figureNumber: 'Fig. 202', size: '1" – 8"', capacity: 3200 },
];

export const STRUCTURAL_ATTACHMENTS: StructuralAttachment[] = [
  {
    id: 'st-1',
    name: 'Concrete wedge anchor assembly',
    fastenerLoadCapacity: 2100,
    swivelConnectionCapacity: 2000,
    structuralAttachmentCapacity: 1900,
    minSlabThickness: '4 in',
    swivelConnectionFigure: 'Fig. 4A',
    structuralAttachmentFigure: 'Fig. 510',
    fastenerFigure: 'KB-TZ2 1/2"',
  },
  {
    id: 'st-2',
    name: 'Beam clamp (wide flange)',
    fastenerLoadCapacity: 2800,
    swivelConnectionCapacity: 2500,
    structuralAttachmentCapacity: 2400,
    minSlabThickness: 'n/a',
    swivelConnectionFigure: 'Fig. 4L',
    structuralAttachmentFigure: 'Fig. 650',
    fastenerFigure: 'Beam clamp 5/8"',
  },
  {
    id: 'st-3',
    name: 'Bar joist attachment',
    fastenerLoadCapacity: 1600,
    swivelConnectionCapacity: 1500,
    structuralAttachmentCapacity: 1450,
    minSlabThickness: 'n/a',
    swivelConnectionFigure: 'Fig. 4A',
    structuralAttachmentFigure: 'Fig. 660',
    fastenerFigure: 'Through bolt 1/2"',
  },
];
