import { useCallback, useSyncExternalStore } from 'react';

export type DownloadQueueItemKind = 'revit' | 'drawing';

/** File queued for later download — scoped to a construction project. */
export type DownloadQueueItem = {
  id: string;
  kind: DownloadQueueItemKind;
  projectId: string;
  partKey: string;
  sku: string;
  fileName: string;
  fileType?: string;
  variationKey?: string;
  /** Human part / variation label for Download Center rows. */
  displayName?: string;
  figureNumber?: string;
  thumbnailUrl?: string;
};

export type DownloadHistoryEntry = {
  id: string;
  kind: DownloadQueueItemKind;
  projectId: string;
  partKey: string;
  sku: string;
  fileName: string;
  fileType?: string;
  variationKey?: string;
  displayName?: string;
  figureNumber?: string;
  thumbnailUrl?: string;
  queuedAt: string;
};

/** @deprecated Use {@link DownloadQueueItem}. */
export type RevitDownloadQueueItem = DownloadQueueItem;

const STORAGE_KEY = 'hydra-revit-download-queue';
const HISTORY_STORAGE_KEY = 'hydra-download-history';

function readQueue(): DownloadQueueItem[] {
  if (typeof sessionStorage === 'undefined') return [];
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as DownloadQueueItem[];
    if (!Array.isArray(parsed)) return [];
    return parsed.map((item) => ({
      ...item,
      kind: item.kind ?? 'revit',
    }));
  } catch {
    return [];
  }
}

function readHistory(): DownloadHistoryEntry[] {
  if (typeof sessionStorage === 'undefined') return [];
  try {
    const raw = sessionStorage.getItem(HISTORY_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as DownloadHistoryEntry[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeQueue(items: DownloadQueueItem[]) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    /* ignore */
  }
}

function writeHistory(items: DownloadHistoryEntry[]) {
  try {
    sessionStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(items));
  } catch {
    /* ignore */
  }
}

function drawingFileName(sku: string, fileType: string): string {
  return `${sku}.${fileType.toLowerCase()}`;
}

let queueCache = readQueue();
let historyCache = readHistory();
const queueListeners = new Set<() => void>();
const historyListeners = new Set<() => void>();

function emitQueue() {
  queueListeners.forEach((l) => l());
}

function emitHistory() {
  historyListeners.forEach((l) => l());
}

function appendHistory(entries: Omit<DownloadHistoryEntry, 'queuedAt'>[]) {
  if (entries.length === 0) return;
  const stamped = entries.map((e) => ({ ...e, queuedAt: new Date().toISOString() }));
  historyCache = [...stamped, ...historyCache];
  writeHistory(historyCache);
  emitHistory();
}

function setQueue(updater: (prev: DownloadQueueItem[]) => DownloadQueueItem[]) {
  queueCache = updater(queueCache);
  writeQueue(queueCache);
  emitQueue();
}

function subscribeQueue(listener: () => void) {
  queueListeners.add(listener);
  return () => queueListeners.delete(listener);
}

function subscribeHistory(listener: () => void) {
  historyListeners.add(listener);
  return () => historyListeners.delete(listener);
}

function getQueueSnapshot() {
  return queueCache;
}

function getHistorySnapshot() {
  return historyCache;
}

function getQueueServerSnapshot() {
  return [];
}

function getHistoryServerSnapshot() {
  return [];
}

/** Module-level session queue — same external-store pattern as SubmittalPackagesContext cart slice. */
export function useRevitDownloadQueue() {
  const items = useSyncExternalStore(subscribeQueue, getQueueSnapshot, getQueueServerSnapshot);

  const queueCount = items.length;

  const addToQueue = useCallback(
    (input: {
      projectId: string;
      partKey: string;
      sku: string;
      displayName?: string;
      figureNumber?: string;
      thumbnailUrl?: string;
    }): string => {
      const fileName = `${input.sku}.rfa`;
      const id = `rfa-${Date.now()}`;
      const item: DownloadQueueItem = {
        id,
        kind: 'revit',
        projectId: input.projectId,
        partKey: input.partKey,
        sku: input.sku,
        fileName,
        fileType: 'RFA',
        displayName: input.displayName,
        figureNumber: input.figureNumber,
        thumbnailUrl: input.thumbnailUrl,
      };
      setQueue((prev) => [...prev, item]);
      appendHistory([
        {
          id,
          kind: 'revit',
          projectId: input.projectId,
          partKey: input.partKey,
          sku: input.sku,
          fileName,
          fileType: 'RFA',
          displayName: input.displayName,
          figureNumber: input.figureNumber,
          thumbnailUrl: input.thumbnailUrl,
        },
      ]);
      return id;
    },
    [],
  );

  const addDrawingFilesToQueue = useCallback(
    (input: {
      projectId: string;
      partKey: string;
      variationKey: string;
      sku: string;
      fileTypes: string[];
      displayName?: string;
      figureNumber?: string;
      thumbnailUrl?: string;
    }): string[] => {
      if (input.fileTypes.length === 0) return [];
      const stamp = Date.now();
      const queueItems: DownloadQueueItem[] = input.fileTypes.map((fileType, index) => ({
        id: `draw-${stamp}-${index}`,
        kind: 'drawing' as const,
        projectId: input.projectId,
        partKey: input.partKey,
        variationKey: input.variationKey,
        sku: input.sku,
        fileType,
        fileName: drawingFileName(input.sku, fileType),
        displayName: input.displayName,
        figureNumber: input.figureNumber,
        thumbnailUrl: input.thumbnailUrl,
      }));
      setQueue((prev) => [...prev, ...queueItems]);
      appendHistory(
        queueItems.map(
          ({
            id,
            kind,
            projectId,
            partKey,
            sku,
            fileName,
            fileType,
            variationKey,
            displayName,
            figureNumber,
            thumbnailUrl,
          }) => ({
            id,
            kind,
            projectId,
            partKey,
            sku,
            fileName,
            fileType,
            variationKey,
            displayName,
            figureNumber,
            thumbnailUrl,
          }),
        ),
      );
      return queueItems.map((item) => item.id);
    },
    [],
  );

  const clearQueue = useCallback(() => {
    setQueue(() => []);
  }, []);

  const removeItem = useCallback((id: string) => {
    setQueue((prev) => prev.filter((item) => item.id !== id));
  }, []);

  return { items, queueCount, addToQueue, addDrawingFilesToQueue, clearQueue, removeItem };
}

export function useDownloadHistory() {
  const history = useSyncExternalStore(subscribeHistory, getHistorySnapshot, getHistoryServerSnapshot);

  const historyForProject = useCallback(
    (projectId: string) => history.filter((h) => h.projectId === projectId),
    [history],
  );

  return { history, historyForProject };
}
