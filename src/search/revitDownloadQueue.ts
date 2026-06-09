import { useCallback, useSyncExternalStore } from 'react';

/** Revit (.rfa) file queued for later download — scoped to a construction project. */
export type RevitDownloadQueueItem = {
  id: string;
  projectId: string;
  partKey: string;
  sku: string;
  fileName: string;
};

const STORAGE_KEY = 'hydra-revit-download-queue';

function readQueue(): RevitDownloadQueueItem[] {
  if (typeof sessionStorage === 'undefined') return [];
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as RevitDownloadQueueItem[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeQueue(items: RevitDownloadQueueItem[]) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    /* ignore */
  }
}

let queueCache = readQueue();
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

function setQueue(updater: (prev: RevitDownloadQueueItem[]) => RevitDownloadQueueItem[]) {
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
          projectId: input.projectId,
          partKey: input.partKey,
          sku: input.sku,
          fileName,
        },
      ]);
    },
    [],
  );

  const clearQueue = useCallback(() => {
    setQueue(() => []);
  }, []);

  return { items, queueCount, addToQueue, clearQueue };
}
