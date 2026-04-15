import type {
  AscCatalogPart,
  BomItem,
  BomMatchResult,
  BomProject,
  BomRun,
  GuidedQuestion,
} from './types';

const bomProjectStatusCycle: BomProject['status'][] = [
  'in-progress',
  'completed',
  'needs-review',
  'draft',
  'failed',
  'partial',
];

/** Construction project IDs cycle for bulk seed rows. */
const projectIdCycle: BomProject['projectId'][] = ['1', '2', '3', '4'];

export const mockBomProjects: BomProject[] = [
  {
    id: '1',
    projectId: '1',
    name: 'Hospital Wing Renovation - Phase 2',
    lastEdited: '2026-03-15',
    items: 142,
    status: 'in-progress',
  },
  {
    id: '2',
    projectId: '2',
    name: 'Industrial Plant Fire Protection',
    lastEdited: '2026-03-14',
    items: 89,
    status: 'completed',
  },
  {
    id: '3',
    projectId: '1',
    name: 'Office Complex HVAC Upgrade',
    lastEdited: '2026-03-12',
    items: 67,
    status: 'needs-review',
  },
  {
    id: '4',
    projectId: '3',
    name: 'Warehouse Sprinkler System',
    lastEdited: '2026-03-10',
    items: 234,
    status: 'draft',
  },
  {
    id: '5',
    projectId: '2',
    name: 'School Campus Fire Alarm Upgrade',
    lastEdited: '2026-03-05',
    items: 178,
    status: 'in-progress',
  },
  {
    id: '6',
    projectId: '1',
    name: 'Parking Garage Electrical Upgrade',
    lastEdited: '2026-03-02',
    items: 93,
    status: 'in-progress',
  },
  ...Array.from({ length: 24 }, (_, i): BomProject => {
    const idx = i + 7;
    return {
      id: String(idx),
      projectId: projectIdCycle[i % 4],
      name: `Fire protection BOM — package ${idx}`,
      lastEdited: `2026-02-${String(15 + (i % 12)).padStart(2, '0')}`,
      items: 50 + (idx * 11) % 180,
      status: bomProjectStatusCycle[i % 4],
    };
  }),
];

export const mockParsedItems: BomItem[] = [
  {
    id: 'item-1',
    rowNumber: 1,
    originalInput: 'Victaulic 005 coupling 4" grooved',
    parsedDescription: 'FireLock coupling, grooved',
    size: '4 inch',
    pressureClass: '300 PSI',
    connectionType: 'Grooved',
    quantity: 24,
    confidence: 'high',
  },
  {
    id: 'item-2',
    rowNumber: 2,
    originalInput: 'Tyco TY3251 sprinkler head 155F',
    parsedDescription: 'Standard response sprinkler head',
    size: '1/2 inch',
    pressureClass: '175 PSI',
    connectionType: 'Threaded',
    quantity: 180,
    confidence: 'high',
  },
  {
    id: 'item-3',
    rowNumber: 3,
    originalInput: 'Gate valve 6in flanged 150lb',
    parsedDescription: 'Gate valve, flanged',
    size: '6 inch',
    pressureClass: '150 PSI',
    connectionType: 'Flanged',
    quantity: 12,
    confidence: 'medium',
  },
  {
    id: 'item-4',
    rowNumber: 4,
    originalInput: 'Red pipe 2.5 sch40',
    parsedDescription: 'Fire protection pipe',
    size: '2.5 inch',
    pressureClass: '',
    connectionType: '',
    quantity: 450,
    confidence: 'low',
  },
  {
    id: 'item-5',
    rowNumber: 5,
    originalInput: 'Check valve 4" grooved type',
    parsedDescription: 'Check valve, grooved',
    size: '4 inch',
    pressureClass: '300 PSI',
    connectionType: 'Grooved',
    quantity: 6,
    confidence: 'high',
  },
];

export const mockAscParts: AscCatalogPart[] = [
  {
    partNumber: 'ASC-FL-400-G',
    productFamily: 'FireLock Series',
    description: 'FireLock Grooved Coupling, Style 005',
    dimensions: '4 inch (101.6mm)',
    pressureRating: '300 PSI',
    connectionType: 'Grooved',
    approvals: ['UL Listed', 'FM Approved', 'VdS', 'LPCB'],
    matchConfidence: 98,
    matchedAttributes: ['Size: 4 inch', 'Connection: Grooved', 'Pressure: 300 PSI', 'Application: Fire Protection'],
    ignoredAttributes: ['Color', 'Manufacturer brand'],
    conversionRule: 'Victaulic 005 → ASC FireLock Series',
    substitutionRisk: 'low',
  },
  {
    partNumber: 'ASC-SR-155-TH',
    productFamily: 'Standard Response Sprinklers',
    description: 'Standard Response Pendent Sprinkler, 155°F',
    dimensions: '1/2 inch NPT',
    pressureRating: '175 PSI',
    connectionType: 'Threaded',
    approvals: ['UL Listed', 'FM Approved', 'NFPA 13'],
    matchConfidence: 95,
    matchedAttributes: ['Temperature: 155°F', 'Type: Standard Response', 'Thread: 1/2 NPT'],
    ignoredAttributes: ['Finish color'],
    conversionRule: 'Tyco TY-Series → ASC Standard Response',
    substitutionRisk: 'low',
  },
  {
    partNumber: 'ASC-GV-600-FL',
    productFamily: 'Valves',
    description: 'Gate Valve, Flanged, Class 150',
    dimensions: '6 inch',
    pressureRating: '150 PSI',
    connectionType: 'Flanged',
    approvals: ['UL Listed', 'FM Approved'],
    matchConfidence: 88,
    matchedAttributes: ['Size: 6 inch', 'Connection: Flanged'],
    ignoredAttributes: [],
    conversionRule: 'Generic gate valve → ASC flanged line',
    substitutionRisk: 'medium',
  },
];

/** BOM workspace table — aligned with BOM-SPEC workspace screen (sample rows). */
export const mockWorkspaceItems: BomItem[] = [
  {
    id: 'ws-1',
    rowNumber: 1,
    originalInput: 'ASC-FL-400-G',
    parsedDescription: 'FireLock Grooved Coupling, Style 005',
    size: '4 inch',
    pressureClass: '300 PSI',
    connectionType: 'Grooved',
    quantity: 24,
    confidence: 'high',
    category: 'Couplings',
    unit: 'EA',
    status: 'confirmed',
  },
  {
    id: 'ws-2',
    rowNumber: 2,
    originalInput: 'ASC-GV-600-FL',
    parsedDescription: 'Gate Valve, Flanged',
    size: '6 inch',
    pressureClass: '150 PSI',
    connectionType: 'Flanged',
    quantity: 12,
    confidence: 'high',
    category: 'Valves',
    unit: 'EA',
    status: 'confirmed',
  },
  {
    id: 'ws-3',
    rowNumber: 3,
    originalInput: 'ASC-CV-400-G',
    parsedDescription: 'Check Valve, Grooved',
    size: '4 inch',
    pressureClass: '300 PSI',
    connectionType: 'Grooved',
    quantity: 6,
    confidence: 'high',
    category: 'Valves',
    unit: 'EA',
    status: 'confirmed',
  },
  {
    id: 'ws-4',
    rowNumber: 4,
    originalInput: 'ASC-PIPE-4-SCH10',
    parsedDescription: 'Galvanized Steel Pipe Schedule 10',
    size: '4 inch',
    pressureClass: '',
    connectionType: 'Grooved',
    quantity: 220,
    confidence: 'medium',
    category: 'Pipe',
    unit: 'FT',
    status: 'needs-review',
  },
  {
    id: 'ws-5',
    rowNumber: 5,
    originalInput: 'ASC-CV-400-G',
    parsedDescription: 'Check Valve, Grooved',
    size: '4 inch',
    pressureClass: '300 PSI',
    connectionType: 'Grooved',
    quantity: 6,
    confidence: 'high',
    category: 'Valves',
    unit: 'EA',
    status: 'confirmed',
  },
  {
    id: 'ws-6',
    rowNumber: 6,
    originalInput: 'ASC-BFV-300-LG',
    parsedDescription: 'Butterfly Valve, Lug Type',
    size: '3 inch',
    pressureClass: '300 PSI',
    connectionType: 'Lug',
    quantity: 16,
    confidence: 'medium',
    category: 'Valves',
    unit: 'EA',
    status: 'needs-review',
  },
  {
    id: 'ws-7',
    rowNumber: 7,
    originalInput: 'ASC-PIPE-4-SCH10',
    parsedDescription: 'Galvanized Steel Pipe Schedule 10',
    size: '4 inch',
    pressureClass: '',
    connectionType: 'Grooved',
    quantity: 220,
    confidence: 'medium',
    category: 'Pipe',
    unit: 'FT',
    status: 'needs-review',
  },
];

export const mockGuidedQuestions: GuidedQuestion[] = [
  {
    id: 'q1',
    question: 'What connection type is required?',
    options: ['Grooved', 'Threaded', 'Flanged', 'Welded'],
  },
  {
    id: 'q2',
    question: 'Is this for fire protection or general piping?',
    options: ['Fire Protection', 'General Piping', 'HVAC', 'Industrial Process'],
  },
  {
    id: 'q3',
    question: 'What pressure rating do you need?',
    options: ['150 PSI', '175 PSI', '300 PSI', '600 PSI'],
  },
];

function matchForItem(item: BomItem): BomMatchResult {
  const pool = mockAscParts;
  const top =
    item.id === 'item-1'
      ? pool[0]
      : item.id === 'item-2'
        ? pool[1]
        : item.id === 'item-3'
          ? pool[2]
          : pool[0];
  const suggested = [top, ...pool.filter((p) => p.partNumber !== top.partNumber)].slice(0, 3);
  return {
    itemId: item.id,
    originalRequest: item.originalInput,
    suggestedParts: suggested,
    topMatch: top,
  };
}

export const mockMatchResults: BomMatchResult[] = mockParsedItems.map(matchForItem);

export function bomProjectById(bomProjectId: string | undefined): BomProject | undefined {
  if (!bomProjectId) return undefined;
  return mockBomProjects.find((p) => p.id === bomProjectId);
}

export function bomProjectTitleById(bomProjectId: string | undefined): string | undefined {
  if (!bomProjectId) return undefined;
  if (bomProjectId === 'new') return 'New BOM project';
  return bomProjectById(bomProjectId)?.name;
}

export function addBomProject(name: string, description?: string): BomProject {
  const id = `proj-${Date.now()}`;
  const project: BomProject = {
    id,
    projectId: '1',
    name,
    description,
    lastEdited: new Date().toISOString().slice(0, 10),
    items: 0,
    status: 'draft',
  };
  mockBomProjects.unshift(project);
  return project;
}

export function bomItemById(itemId: string | undefined): BomItem | undefined {
  if (!itemId) return undefined;
  return mockParsedItems.find((i) => i.id === itemId);
}

export function matchResultForItem(itemId: string | undefined): BomMatchResult | undefined {
  if (!itemId) return undefined;
  return mockMatchResults.find((m) => m.itemId === itemId);
}

// ── BOM Runs ────────────────────────────────────────────────────────────────

export const mockBomRuns: BomRun[] = [
  { id: 'run-1', projectId: '1', label: 'BOM v1 — initial upload',  createdAt: '2026-03-10', status: 'completed', itemCount: 142 },
  { id: 'run-2', projectId: '1', label: 'BOM v2 — revised scope',   createdAt: '2026-03-13', status: 'in-review', itemCount: 138 },
  { id: 'run-3', projectId: '1', label: 'BOM v3 — contractor draft', createdAt: '2026-03-15', status: 'in-review', itemCount: 142 },
  { id: 'run-1b', projectId: '3', label: 'BOM v1 — import',          createdAt: '2026-03-12', status: 'completed', itemCount: 67 },
];

export function bomRunsByProjectId(projectId: string): BomRun[] {
  return mockBomRuns.filter((r) => r.projectId === projectId);
}

export function addBomRun(projectId: string, label: string): BomRun {
  const run: BomRun = {
    id: `run-${Date.now()}`,
    projectId,
    label,
    createdAt: new Date().toISOString().slice(0, 10),
    status: 'draft',
    itemCount: 0,
  };
  mockBomRuns.push(run);
  return run;
}
