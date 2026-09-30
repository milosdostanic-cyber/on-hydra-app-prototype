import type { DownloadHistoryEntry } from '../../search/revitDownloadQueue';

/**
 * Teammate names for the demo seed. Project contacts in `projectSeed.ts` have no
 * populated names, so these stand in as the construction-project team.
 */
export const DEMO_DOWNLOADERS = {
  sarah: 'Sarah Mitchell',
  james: 'James Walker',
  michael: 'Michael Brooks',
  ashley: 'Ashley Reynolds',
} as const;

/** Downtown Convention Center — mixed populated history covering Q-1–Q-4. */
const PROJECT_DCC = '1';
/** Highland Retail Plaza — single figure, no nested variants. */
const PROJECT_HIGHLAND = '3';

/**
 * Demo thumbnails keyed by catalog `partKey` — reuses existing static product tiles under
 * `public/assets/catalog/` (same reuse-first pattern as `BOM_DEMO_IMAGE_BY_FIGURE` in
 * `bomWorkspaceDashboard.ts`) instead of the generic placeholder tile.
 */
const DEMO_THUMBNAIL_BY_PART: Record<string, string> = {
  'lp-needle-s7166': '/assets/catalog/figma-featured-parts/600-f.png',
  'lp-ball-s76': '/assets/catalog/featured-tiles/angle-hose-valve.png',
  'lp-bf-1': '/assets/catalog/figma-featured-parts/300-c.png',
  'lp-check-s76': '/assets/catalog/featured-tiles/7000-lr.png',
  'lp-stub-4': '/assets/catalog/figma-featured-parts/500-e.png',
  'lp-act-1': '/assets/catalog/featured-tiles/ffp-flex-drop.png',
};

function entry(
  partial: Omit<DownloadHistoryEntry, 'queuedAt'> & { queuedAt: string },
): DownloadHistoryEntry {
  return {
    ...partial,
    thumbnailUrl: partial.thumbnailUrl ?? DEMO_THUMBNAIL_BY_PART[partial.partKey],
  };
}

/**
 * Seeded download history for demo projects.
 * Covers: figure + variant mix, variants-only (Q-1), several downloaders (Q-3), repeats (Q-4).
 */
export const DOWNLOAD_HISTORY_SEED: DownloadHistoryEntry[] = [
  // --- Q mixed: figure-level + variant downloads (Needle valve S7166NV) ---
  entry({
    id: 'seed-s7166-figure-rfa',
    kind: 'revit',
    projectId: PROJECT_DCC,
    partKey: 'lp-needle-s7166',
    sku: 'S7166NV',
    fileName: 'S7166NV.rfa',
    fileType: 'RFA',
    fileFormats: ['RFA', 'TXT'],
    displayName: '316 SS 6000 CWP Thrd End Needle Valve',
    figureNumber: 'S7166NV',
    downloadedBy: DEMO_DOWNLOADERS.sarah,
    queuedAt: '2026-09-14T16:20:00.000Z',
  }),
  entry({
    id: 'seed-s7166-var-a',
    kind: 'drawing',
    projectId: PROJECT_DCC,
    partKey: 'lp-needle-s7166',
    variationKey: 'v-s7166-a',
    sku: 'S7166NV-A',
    fileName: 'S7166NV-A.dwg',
    fileType: 'DWG',
    fileFormats: ['DWG', 'PDF'],
    displayName: '316 SS Needle Valve — Config A',
    figureNumber: 'S7166NV',
    downloadedBy: DEMO_DOWNLOADERS.sarah,
    queuedAt: '2026-09-13T11:05:00.000Z',
  }),
  entry({
    id: 'seed-s7166-var-b',
    kind: 'drawing',
    projectId: PROJECT_DCC,
    partKey: 'lp-needle-s7166',
    variationKey: 'v-s7166-b',
    sku: 'S7166NV-B',
    fileName: 'S7166NV-B.dwg',
    fileType: 'DWG',
    fileFormats: ['DWG'],
    displayName: '316 SS Needle Valve — Config B',
    figureNumber: 'S7166NV',
    downloadedBy: DEMO_DOWNLOADERS.james,
    queuedAt: '2026-09-09T09:40:00.000Z',
  }),

  // --- Q-1: variants only — parent still materialises (Ball valve S76BVH) ---
  entry({
    id: 'seed-s76-var-only',
    kind: 'drawing',
    projectId: PROJECT_DCC,
    partKey: 'lp-ball-s76',
    variationKey: 'v-s76-1',
    sku: 'S76BVH-1',
    fileName: 'S76BVH-1.pdf',
    fileType: 'PDF',
    fileFormats: ['PDF', 'DWG'],
    displayName: 'S76BVH — Size 1',
    figureNumber: 'S76BVH',
    downloadedBy: DEMO_DOWNLOADERS.michael,
    queuedAt: '2026-09-11T14:22:00.000Z',
  }),

  // --- Q-3: several teammates downloaded the same figure (Butterfly BF-TO-1) ---
  entry({
    id: 'seed-bf-ana',
    kind: 'revit',
    projectId: PROJECT_DCC,
    partKey: 'lp-bf-1',
    sku: 'BF-TO-1',
    fileName: 'BF-TO-1.rfa',
    fileType: 'RFA',
    fileFormats: ['RFA'],
    displayName: 'Triple Offset Butterfly — Stub',
    figureNumber: 'BF-TO-1',
    downloadedBy: DEMO_DOWNLOADERS.sarah,
    queuedAt: '2026-09-13T18:10:00.000Z',
  }),
  entry({
    id: 'seed-bf-jordan',
    kind: 'revit',
    projectId: PROJECT_DCC,
    partKey: 'lp-bf-1',
    sku: 'BF-TO-1',
    fileName: 'BF-TO-1.rfa',
    fileType: 'RFA',
    fileFormats: ['RFA'],
    displayName: 'Triple Offset Butterfly — Stub',
    figureNumber: 'BF-TO-1',
    downloadedBy: DEMO_DOWNLOADERS.james,
    queuedAt: '2026-09-10T08:15:00.000Z',
  }),
  entry({
    id: 'seed-bf-sam',
    kind: 'drawing',
    projectId: PROJECT_DCC,
    partKey: 'lp-bf-1',
    sku: 'BF-TO-1',
    fileName: 'BF-TO-1.txt',
    fileType: 'TXT',
    fileFormats: ['TXT'],
    displayName: 'Triple Offset Butterfly — Stub',
    figureNumber: 'BF-TO-1',
    downloadedBy: DEMO_DOWNLOADERS.michael,
    queuedAt: '2026-09-08T12:00:00.000Z',
  }),

  // --- Q-4: repeats of the same figure (Check valve S76PCV3) ---
  entry({
    id: 'seed-pcv-repeat-1',
    kind: 'revit',
    projectId: PROJECT_DCC,
    partKey: 'lp-check-s76',
    sku: 'S76PCV3',
    fileName: 'S76PCV3.rfa',
    fileType: 'RFA',
    fileFormats: ['RFA'],
    displayName: '316SS-3000 PSI Instrum. T.E. Poppet CV, Dbl Ferr.',
    figureNumber: 'S76PCV3',
    downloadedBy: DEMO_DOWNLOADERS.sarah,
    queuedAt: '2026-09-12T10:00:00.000Z',
  }),
  entry({
    id: 'seed-pcv-repeat-2',
    kind: 'revit',
    projectId: PROJECT_DCC,
    partKey: 'lp-check-s76',
    sku: 'S76PCV3',
    fileName: 'S76PCV3.rfa',
    fileType: 'RFA',
    fileFormats: ['RFA'],
    displayName: '316SS-3000 PSI Instrum. T.E. Poppet CV, Dbl Ferr.',
    figureNumber: 'S76PCV3',
    downloadedBy: DEMO_DOWNLOADERS.sarah,
    queuedAt: '2026-08-20T10:00:00.000Z',
  }),
  entry({
    id: 'seed-pcv-repeat-3',
    kind: 'revit',
    projectId: PROJECT_DCC,
    partKey: 'lp-check-s76',
    sku: 'S76PCV3',
    fileName: 'S76PCV3.rfa',
    fileType: 'RFA',
    fileFormats: ['RFA'],
    displayName: '316SS-3000 PSI Instrum. T.E. Poppet CV, Dbl Ferr.',
    figureNumber: 'S76PCV3',
    downloadedBy: DEMO_DOWNLOADERS.ashley,
    queuedAt: '2026-07-02T10:00:00.000Z',
  }),

  // --- Figure-level only, no nested variant rows (Gauge valve) ---
  entry({
    id: 'seed-gv-figure-only',
    kind: 'revit',
    projectId: PROJECT_DCC,
    partKey: 'lp-stub-4',
    sku: 'S77GV1',
    fileName: 'S77GV1.rfa',
    fileType: 'RFA',
    fileFormats: ['RFA', 'TXT'],
    displayName: '316 SS Gauge Valve — Stub',
    figureNumber: 'S77GV1',
    downloadedBy: DEMO_DOWNLOADERS.james,
    queuedAt: '2026-09-07T15:30:00.000Z',
  }),

  // Project '2' (Riverside) has no seed rows — empty state (FR-9).

  // --- Single-figure project (Highland) ---
  entry({
    id: 'seed-highland-act',
    kind: 'revit',
    projectId: PROJECT_HIGHLAND,
    partKey: 'lp-act-1',
    sku: 'ACT-E-01',
    fileName: 'ACT-E-01.rfa',
    fileType: 'RFA',
    fileFormats: ['RFA'],
    displayName: 'Electric actuator — stub',
    figureNumber: 'ACT-E-01',
    downloadedBy: DEMO_DOWNLOADERS.ashley,
    queuedAt: '2026-09-06T09:00:00.000Z',
  }),
];

/** Seed rows for one construction project, merged with live session history (live ids win). */
export function historyEntriesForProject(
  projectId: string,
  liveEntries: DownloadHistoryEntry[],
): DownloadHistoryEntry[] {
  const seeded = DOWNLOAD_HISTORY_SEED.filter((row) => row.projectId === projectId);
  const liveIds = new Set(liveEntries.map((row) => row.id));
  return [...liveEntries, ...seeded.filter((row) => !liveIds.has(row.id))];
}
