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

export function projectTitleById(projectId: string): string | undefined {
  return PROJECT_SEED_ROWS.find((r) => r.key === projectId)?.name;
}
