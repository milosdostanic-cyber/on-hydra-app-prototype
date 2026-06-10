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
  /** Drawing queue entries only. */
  fileType?: string;
  variationKey?: string;
};

/** @deprecated Use {@link DownloadQueueItem}. */
export type RevitDownloadQueueItem = DownloadQueueItem;

const STORAGE_KEY = 'hydra-revit-download-queue';

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

function writeQueue(items: DownloadQueueItem[]) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    /* ignore */
  }
}

function drawingFileName(sku: string, fileType: string): string {
  return `${sku}.${fileType.toLowerCase()}`;
}

let queueCache = readQueue();
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

function setQueue(updater: (prev: DownloadQueueItem[]) => DownloadQueueItem[]) {
  queueCache = updater(queueCache);
  writeQueue(queueCache);
  emit();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return queueCache;
}

function getServerSnapshot() {
  return [];
}

/** Module-level session queue — same external-store pattern as SubmittalPackagesContext cart slice. */
export function useRevitDownloadQueue() {
  const items = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const queueCount = items.length;

  const addToQueue = useCallback(
    (input: { projectId: string; partKey: string; sku: string }) => {
      const fileName = `${input.sku}.rfa`;
      setQueue((prev) => [
        ...prev,
        {
          id: `rfa-${Date.now()}`,
          kind: 'revit',
          projectId: input.projectId,
          partKey: input.partKey,
          sku: input.sku,
          fileName,
        },
      ]);
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
    }) => {
      if (input.fileTypes.length === 0) return;
      const stamp = Date.now();
      setQueue((prev) => [
        ...prev,
        ...input.fileTypes.map((fileType, index) => ({
          id: `draw-${stamp}-${index}`,
          kind: 'drawing' as const,
          projectId: input.projectId,
          partKey: input.partKey,
          variationKey: input.variationKey,
          sku: input.sku,
          fileType,
          fileName: drawingFileName(input.sku, fileType),
        })),
      ]);
    },
    [],
  );

  const clearQueue = useCallback(() => {
    setQueue(() => []);
  }, []);

  return { items, queueCount, addToQueue, addDrawingFilesToQueue, clearQueue };
}
