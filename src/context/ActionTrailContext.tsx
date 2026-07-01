import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useSyncExternalStore,
  type ReactNode,
} from 'react';

import { ActionTrailLiveRegion } from '../search/components/ActionTrailLiveRegion';

import {
  actionTrailModuleForMenuKey,
  activateModuleGuidance,
  activateItemGuidance,
  clearNewTagsForModule,
  consumeForModule,
  countForModule,
  entriesForModule,
  getActionTrailServerSnapshot,
  getActionTrailSnapshot,
  isActionTrailEnabled,
  markItemViewed,
  pendingItemIds,
  pendingSubProjectIds,
  pruneExpired,
  registerEntry,
  resetActionTrail,
  setActionTrailEnabled,
  shouldShowNewTag,
  shouldShowSubProjectNewTag,
  subscribeActionTrail,
  unseenSubProjectIds,
  type ActionTrailModule,
  type GuidanceEntry,
  type RegisterEntryInput,
} from './actionTrailStore';

export type { ActionTrailModule, GuidanceEntry, RegisterEntryInput };

type ActionTrailContextValue = {
  enabled: boolean;
  entries: GuidanceEntry[];
  setEnabled: (enabled: boolean) => void;
  registerEntry: (input: RegisterEntryInput) => void;
  resetActionTrail: () => void;
  countForModule: (module: ActionTrailModule) => number;
  countForMenuKey: (menuKey: string) => number;
  entriesForModule: (module: ActionTrailModule) => GuidanceEntry[];
  pendingSubProjectIds: (module: ActionTrailModule) => string[];
  unseenSubProjectIds: (module: ActionTrailModule) => string[];
  shouldShowSubProjectNewTag: (module: ActionTrailModule, subProjectId: string) => boolean;
  pendingItemIds: (module: ActionTrailModule, subProjectId: string) => string[];
  shouldShowNewTag: (module: ActionTrailModule, subProjectId: string, itemId: string, partKey?: string) => boolean;
  activateModuleGuidance: (module: ActionTrailModule) => void;
  activateItemGuidance: (module: ActionTrailModule, subProjectId: string) => void;
  markItemViewed: (module: ActionTrailModule, subProjectId: string, itemId: string, partKey?: string) => void;
  consumeForModule: (module: ActionTrailModule, subProjectId?: string) => void;
  clearNewTagsForModule: (module: ActionTrailModule) => void;
};

const ActionTrailContext = createContext<ActionTrailContextValue | null>(null);

export function ActionTrailProvider({ children }: { children: ReactNode }) {
  const state = useSyncExternalStore(
    subscribeActionTrail,
    getActionTrailSnapshot,
    getActionTrailServerSnapshot,
  );

  useEffect(() => {
    pruneExpired();
  }, []);

  const countForModuleCb = useCallback(
    (module: ActionTrailModule) => countForModule(module),
    [state.entries, state.enabled],
  );

  const countForMenuKey = useCallback(
    (menuKey: string) => {
      const module = actionTrailModuleForMenuKey(menuKey);
      return module ? countForModule(module) : 0;
    },
    [state.entries, state.enabled],
  );

  const value = useMemo<ActionTrailContextValue>(
    () => ({
      enabled: state.enabled,
      entries: state.entries,
      setEnabled: setActionTrailEnabled,
      registerEntry,
      resetActionTrail,
      countForModule: countForModuleCb,
      countForMenuKey,
      entriesForModule,
      pendingSubProjectIds,
      unseenSubProjectIds,
      shouldShowSubProjectNewTag,
      pendingItemIds,
      shouldShowNewTag,
      activateModuleGuidance,
      activateItemGuidance,
      markItemViewed,
      consumeForModule,
      clearNewTagsForModule,
    }),
    [state.enabled, state.entries, countForModuleCb, countForMenuKey],
  );

  return (
    <ActionTrailContext.Provider value={value}>
      <ActionTrailLiveRegion />
      {children}
    </ActionTrailContext.Provider>
  );
}

export function useActionTrail(): ActionTrailContextValue {
  const ctx = useContext(ActionTrailContext);
  if (!ctx) throw new Error('useActionTrail must be used within ActionTrailProvider');
  return ctx;
}

/** Activate L2/L3 guidance on mount; L1 badge clears only on L3 (`markItemViewed`). Content clears on open. */
export function useActionTrailModuleLifecycle(module: ActionTrailModule) {
  const { activateModuleGuidance, consumeForModule, clearNewTagsForModule } = useActionTrail();
  const visitGeneration = useRef(0);

  useEffect(() => {
    visitGeneration.current += 1;
    const generation = visitGeneration.current;
    if (module === 'content') {
      consumeForModule(module);
    } else {
      activateModuleGuidance(module);
    }
    return () => {
      queueMicrotask(() => {
        if (visitGeneration.current === generation) {
          clearNewTagsForModule(module);
        }
      });
    };
  }, [module, activateModuleGuidance, consumeForModule, clearNewTagsForModule]);
}

export function useActionTrailHighlightActive(
  module: ActionTrailModule,
  subProjectId: string,
): boolean {
  const state = useSyncExternalStore(
    subscribeActionTrail,
    getActionTrailSnapshot,
    getActionTrailServerSnapshot,
  );
  return state.entries.some(
    (e) => e.module === module && e.subProjectId === subProjectId && !e.seen,
  );
}

export function useIsActionTrailEnabled(): boolean {
  return useSyncExternalStore(
    subscribeActionTrail,
    () => isActionTrailEnabled(),
    () => true,
  );
}
