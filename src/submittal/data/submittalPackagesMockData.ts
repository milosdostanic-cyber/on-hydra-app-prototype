import type { SubmittalPackage } from '../types';

/**
 * Seed submittal packages, scoped by construction `projectId` so the top-bar project switcher
 * shows distinct fixtures per job site. Part keys/figure numbers reference the shared catalog
 * demo data (`src/catalog/catalogDemoData.ts`).
 *
 * States covered:
 * - Project '1': multiple packages, one full + one empty package
 * - Project '2': single package with a few parts
 * - Project '3': single empty package (no parts)
 * - Projects '4'/'5': no packages (zero-state)
 */
export const SUBMITTAL_PACKAGES_SEED: SubmittalPackage[] = [
  {
    id: 'pkg-1001',
    projectId: '1',
    name: 'Level 2 Mechanical Room — Submittal Rev 2',
    updatedAt: '2026-05-28T15:12:00.000Z',
    parts: [
      { id: 'pp-1', partKey: 'p-300', displayName: 'Grooved coupling 4 inch FireLock style 005', figureNumber: '005' },
      { id: 'pp-2', partKey: 'p-400', displayName: 'Standard response sprinkler head 155F pendent', figureNumber: 'TY323' },
      { id: 'pp-3', partKey: 'p-700', displayName: 'Check valve grooved 300 PSI 4 inch', figureNumber: '717' },
    ],
  },
  {
    id: 'pkg-1002',
    projectId: '1',
    name: 'Riser Detail Package',
    updatedAt: '2026-05-30T09:45:00.000Z',
    parts: [
      { id: 'pp-4', partKey: 'p-500', displayName: 'Gate valve flanged class 150 6 inch', figureNumber: 'GV150' },
    ],
  },
  {
    id: 'pkg-1003',
    projectId: '1',
    name: 'Seismic Bracing Cut Sheets',
    updatedAt: '2026-05-31T11:20:00.000Z',
    parts: [],
  },
  {
    id: 'pkg-2001',
    projectId: '2',
    name: 'Fire Protection — Phase 1 Submittal',
    updatedAt: '2026-05-25T14:05:00.000Z',
    parts: [
      { id: 'pp-5', partKey: 'p-300', displayName: 'Grooved coupling 4 inch FireLock style 005', figureNumber: '005' },
      { id: 'pp-6', partKey: 'p-600', displayName: 'Threaded rod seismic brace hardware kit', figureNumber: 'SB100' },
    ],
  },
  {
    id: 'pkg-3001',
    projectId: '3',
    name: 'Retail Plaza — Draft Package',
    updatedAt: '2026-05-20T08:30:00.000Z',
    parts: [],
  },
];
