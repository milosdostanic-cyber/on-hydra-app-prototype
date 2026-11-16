import { useCallback, useSyncExternalStore } from 'react';

/**
 * Prototype-only simulated access for Content download create actions (FR-13).
 * Not a shared permission system — local to this module, following the Spec demo-role precedent.
 */

const STORAGE_KEY = 'hydra-content-download-access';

export type ContentDownloadAccess = {
  canCreateBom: boolean;
  canCreateSubmittal: boolean;
};

const DEFAULT_ACCESS: ContentDownloadAccess = {
  canCreateBom: true,
  canCreateSubmittal: true,
};

function readAccess(): ContentDownloadAccess {
  if (typeof sessionStorage === 'undefined') return DEFAULT_ACCESS;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_ACCESS;
    const parsed = JSON.parse(raw) as Partial<ContentDownloadAccess>;
    return {
      canCreateBom: parsed.canCreateBom ?? DEFAULT_ACCESS.canCreateBom,
      canCreateSubmittal: parsed.canCreateSubmittal ?? DEFAULT_ACCESS.canCreateSubmittal,
    };
  } catch {
    return DEFAULT_ACCESS;
  }
}

let accessCache = readAccess();
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

function writeAccess(next: ContentDownloadAccess) {
  accessCache = next;
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    /* ignore */
  }
  emit();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return accessCache;
}

function getServerSnapshot(): ContentDownloadAccess {
  return DEFAULT_ACCESS;
}

/** Demo controls are available in DEV, or when localStorage flag `hydra-content-demo=1` is set. */
export function isContentDownloadDemoEnabled(): boolean {
  if (import.meta.env.DEV) return true;
  try {
    return localStorage.getItem('hydra-content-demo') === '1';
  } catch {
    return false;
  }
}

export function useContentDownloadAccess() {
  const access = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const setCanCreateBom = useCallback((canCreateBom: boolean) => {
    writeAccess({ ...accessCache, canCreateBom });
  }, []);

  const setCanCreateSubmittal = useCallback((canCreateSubmittal: boolean) => {
    writeAccess({ ...accessCache, canCreateSubmittal });
  }, []);

  return {
    canCreateBom: access.canCreateBom,
    canCreateSubmittal: access.canCreateSubmittal,
    setCanCreateBom,
    setCanCreateSubmittal,
  };
}
