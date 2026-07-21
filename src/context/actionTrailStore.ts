/** Cross-module Action Trail — unseen-log store (localStorage + multi-tab sync). */

export type ActionTrailModule = 'bom' | 'submittal' | 'spec' | 'content';

export type GuidanceEntry = {
  id: string;
  module: ActionTrailModule;
  subProjectId: string;
  subProjectLabel: string;
  partKey: string;
  variantKey?: string;
  itemIds: string[];
  partCount: number;
  createdAt: string;
  seen: boolean;
  /** True after the user leaves the destination module — suppresses repeat highlights. */
  highlightDismissed: boolean;
  /** True after the user opens the destination module — drives "New" tags until next visit. */
  newTagActive: boolean;
};

export type RegisterEntryInput = {
  module: ActionTrailModule;
  subProjectId: string;
  subProjectLabel: string;
  partKey: string;
  variantKey?: string;
  itemIds: string[];
  partCount?: number;
};

type StoreState = {
  entries: GuidanceEntry[];
  enabled: boolean;
};

const STORAGE_KEY = 'hydra-action-trail';
const TTL_MS = 7 * 24 * 60 * 60 * 1000;

const DEFAULT_STATE: StoreState = { entries: [], enabled: true };

function readState(): StoreState {
  if (typeof localStorage === 'undefined') return DEFAULT_STATE;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STATE;
    const parsed = JSON.parse(raw) as StoreState;
    if (!parsed || typeof parsed !== 'object') return DEFAULT_STATE;
    return {
      entries: Array.isArray(parsed.entries)
        ? parsed.entries.map((entry) => ({
            ...entry,
            highlightDismissed: entry.highlightDismissed === true,
            newTagActive: entry.newTagActive === true,
          }))
        : [],
      enabled: parsed.enabled !== false,
    };
  } catch {
    return DEFAULT_STATE;
  }
}

function writeState(state: StoreState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* ignore */
  }
}

let storeCache: StoreState = readState();
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

function setState(updater: (prev: StoreState) => StoreState) {
  storeCache = updater(storeCache);
  writeState(storeCache);
  emit();
}

function reloadFromStorage() {
  storeCache = readState();
  emit();
}

if (typeof window !== 'undefined') {
  window.addEventListener('storage', (event) => {
    if (event.key === STORAGE_KEY) reloadFromStorage();
  });
  window.addEventListener('focus', () => {
    pruneExpired();
    reloadFromStorage();
  });
}

export function subscribeActionTrail(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getActionTrailSnapshot(): StoreState {
  return storeCache;
}

export function getActionTrailServerSnapshot(): StoreState {
  return DEFAULT_STATE;
}

export function pruneExpired() {
  const cutoff = Date.now() - TTL_MS;
  setState((prev) => ({
    ...prev,
    entries: prev.entries.filter((e) => new Date(e.createdAt).getTime() >= cutoff),
  }));
}

export function registerEntry(input: RegisterEntryInput) {
  setState((prev) => {
    if (!prev.enabled) return prev;
    const entry: GuidanceEntry = {
      id: `trail-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      module: input.module,
      subProjectId: input.subProjectId,
      subProjectLabel: input.subProjectLabel,
      partKey: input.partKey,
      variantKey: input.variantKey,
      itemIds: input.itemIds,
      partCount: input.partCount ?? 1,
      createdAt: new Date().toISOString(),
      seen: false,
      highlightDismissed: false,
      newTagActive: true,
    };
    return { ...prev, entries: [...prev.entries, entry] };
  });
}

export function countForModule(module: ActionTrailModule): number {
  if (!storeCache.enabled) return 0;
  return storeCache.entries
    .filter((e) => e.module === module && !e.seen)
    .reduce((sum, e) => sum + e.partCount, 0);
}

export function entriesForModule(module: ActionTrailModule): GuidanceEntry[] {
  return storeCache.entries.filter((e) => e.module === module);
}

export function unseenSubProjectIds(module: ActionTrailModule): string[] {
  const ids = new Set<string>();
  storeCache.entries.forEach((e) => {
    if (e.module === module && e.newTagActive) ids.add(e.subProjectId);
  });
  return [...ids];
}

export function shouldShowSubProjectNewTag(module: ActionTrailModule, subProjectId: string): boolean {
  return storeCache.entries.some(
    (e) => e.module === module && e.subProjectId === subProjectId && e.newTagActive,
  );
}

export function pendingSubProjectIds(module: ActionTrailModule): string[] {
  const ids = new Set<string>();
  storeCache.entries.forEach((e) => {
    if (e.module === module && e.newTagActive && !e.seen) ids.add(e.subProjectId);
  });
  return [...ids];
}

export function pendingItemIds(module: ActionTrailModule, subProjectId: string): string[] {
  const ids = new Set<string>();
  storeCache.entries.forEach((e) => {
    if (e.module === module && e.subProjectId === subProjectId && e.newTagActive) {
      e.itemIds.forEach((id) => ids.add(id));
    }
  });
  return [...ids];
}

export function shouldShowNewTag(
  module: ActionTrailModule,
  subProjectId: string,
  itemId: string,
  partKey?: string,
): boolean {
  return storeCache.entries.some((e) => {
    if (e.module !== module || e.subProjectId !== subProjectId || !e.newTagActive) return false;
    if (e.itemIds.includes(itemId)) return true;
    return partKey != null && e.partKey === partKey;
  });
}

export function activateModuleGuidance(module: ActionTrailModule) {
  setState((prev) => ({
    ...prev,
    entries: prev.entries.map((e) =>
      e.module === module && !e.seen ? { ...e, newTagActive: true } : e,
    ),
  }));
}

/** Level 2 → workspace / package — ensure item tags for one sub-project without clearing L1 badge. */
export function activateItemGuidance(module: ActionTrailModule, subProjectId: string) {
  setState((prev) => ({
    ...prev,
    entries: prev.entries.map((e) =>
      e.module === module && e.subProjectId === subProjectId && !e.seen
        ? { ...e, newTagActive: true }
        : e,
    ),
  }));
}

/** Level 3 drill-down — mark trail entry seen; L1 badge decrements and "New" tag clears. */
export function markItemViewed(
  module: ActionTrailModule,
  subProjectId: string,
  itemId: string,
  partKey?: string,
) {
  setState((prev) => ({
    ...prev,
    entries: prev.entries.map((e) => {
      if (e.module !== module || e.subProjectId !== subProjectId || e.seen) return e;
      const matchesItem = e.itemIds.includes(itemId);
      const matchesPart = partKey != null && e.partKey === partKey;
      if (!matchesItem && !matchesPart) return e;
      return { ...e, seen: true, newTagActive: false };
    }),
  }));
}

/**
 * Clears L1 badge for one sub-project while keeping item "New" tags for this visit.
 * Used by Submittal (expand package). BOM must not call this on workspace open — badge
 * clears only via `markItemViewed` on figure link click (UATL-350).
 */
export function markSubProjectViewed(module: ActionTrailModule, subProjectId: string) {
  setState((prev) => ({
    ...prev,
    entries: prev.entries.map((e) => {
      if (e.module !== module || e.subProjectId !== subProjectId || e.seen) return e;
      return { ...e, seen: true };
    }),
  }));
}

export function consumeForModule(module: ActionTrailModule, subProjectId?: string) {
  setState((prev) => ({
    ...prev,
    entries: prev.entries.map((e) => {
      if (e.module !== module) return e;
      if (subProjectId && e.subProjectId !== subProjectId) return e;
      return {
        ...e,
        seen: true,
        newTagActive: !e.highlightDismissed,
      };
    }),
  }));
}

export function clearNewTagsForModule(module: ActionTrailModule) {
  setState((prev) => ({
    ...prev,
    entries: prev.entries.map((e) => {
      if (e.module !== module) return e;
      // Unseen entries keep newTagActive so "New" survives leaving/re-entering the module.
      if (!e.seen) return { ...e, highlightDismissed: true };
      return { ...e, newTagActive: false, highlightDismissed: true };
    }),
  }));
}

export function setActionTrailEnabled(enabled: boolean) {
  setState((prev) => ({ ...prev, enabled }));
}

/** Demo reset — clear all guidance entries (badges, highlights, New tags). */
export function resetActionTrail() {
  setState((prev) => ({ ...prev, entries: [] }));
}

export function isActionTrailEnabled(): boolean {
  return storeCache.enabled;
}

/** Sidebar menu key → Action Trail module (undefined = no badge). */
export function actionTrailModuleForMenuKey(key: string): ActionTrailModule | undefined {
  if (key === 'bom' || key === 'submittal' || key === 'spec' || key === 'content') return key;
  return undefined;
}
