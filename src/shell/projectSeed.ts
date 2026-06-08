export type ProjectRow = {
  key: string;
  name: string;
  address: string;
  city: string;
  state: string;
  lastOpened: string;
  recent: boolean;
};

export const PROJECT_SEED_ROWS: ProjectRow[] = [
  {
    key: '1',
    name: 'Downtown Convention Center',
    address: '123 Main Street',
    city: 'Phoenix',
    state: 'AZ',
    lastOpened: '2 hours ago',
    recent: true,
  },
  {
    key: '2',
    name: 'Riverside Office Park',
    address: '456 River Road',
    city: 'Tucson',
    state: 'AZ',
    lastOpened: 'Yesterday',
    recent: true,
  },
  {
    key: '3',
    name: 'Highland Retail Plaza',
    address: '789 Highland Ave',
    city: 'Scottsdale',
    state: 'AZ',
    lastOpened: '3 days ago',
    recent: false,
  },
  {
    key: '4',
    name: 'Desert Logistics Hub',
    address: '321 Desert Way',
    city: 'Mesa',
    state: 'AZ',
    lastOpened: 'Last week',
    recent: false,
  },
  {
    key: '5',
    name: 'Metro Rail Station Fit-Out',
    address: '100 Transit Plaza',
    city: 'Tempe',
    state: 'AZ',
    lastOpened: 'Never',
    recent: false,
  },
];

const PROJECTS_STORAGE_KEY = 'hydra:constructionProjects';

export function readStoredProjects(): ProjectRow[] {
  try {
    const raw = sessionStorage.getItem(PROJECTS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as ProjectRow[];
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {
    /* ignore */
  }
  return [...PROJECT_SEED_ROWS];
}

export function writeStoredProjects(rows: ProjectRow[]): void {
  try {
    sessionStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(rows));
  } catch {
    /* ignore */
  }
}

export function projectTitleById(projectId: string): string | undefined {
  return readStoredProjects().find((r) => r.key === projectId)?.name;
}

export type ConstructionProjectInput = {
  name: string;
  address?: string;
  city?: string;
  state?: string;
};
