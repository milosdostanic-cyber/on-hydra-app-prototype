import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from 'react';

import {
  actionTrailModuleForMenuKey,
  clearNewTagsForModule,
  consumeForModule,
  countForModule,
  entriesForModule,
  getActionTrailServerSnapshot,
  getActionTrailSnapshot,
  isActionTrailEnabled,
  pendingItemIds,
  pendingSubProjectIds,
  pruneExpired,
  registerEntry,
  setActionTrailEnabled,
  shouldShowNewTag,
  subscribeActionTrail,
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
  countForModule: (module: ActionTrailModule) => number;
  countForMenuKey: (menuKey: string) => number;
  entriesForModule: (module: ActionTrailModule) => GuidanceEntry[];
  pendingSubProjectIds: (module: ActionTrailModule) => string[];
  pendingItemIds: (module: ActionTrailModule, subProjectId: string) => string[];
  shouldShowNewTag: (module: ActionTrailModule, subProjectId: string, itemId: string) => boolean;
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
      countForModule: countForModuleCb,
      countForMenuKey,
      entriesForModule,
      pendingSubProjectIds,
      pendingItemIds,
      shouldShowNewTag,
      consumeForModule,
      clearNewTagsForModule,
    }),
    [state.enabled, state.entries, countForModuleCb, countForMenuKey],
  );

  return <ActionTrailContext.Provider value={value}>{children}</ActionTrailContext.Provider>;
}

export function useActionTrail(): ActionTrailContextValue {
  const ctx = useContext(ActionTrailContext);
  if (!ctx) throw new Error('useActionTrail must be used within ActionTrailProvider');
  return ctx;
}

/** Mark module guidance consumed on mount; clear item "New" tags on unmount. */
export function useActionTrailModuleLifecycle(module: ActionTrailModule) {
  const { consumeForModule, clearNewTagsForModule } = useActionTrail();

  useEffect(() => {
    consumeForModule(module);
    return () => clearNewTagsForModule(module);
  }, [module, consumeForModule, clearNewTagsForModule]);
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
    (e) => e.module === module && e.subProjectId === subProjectId && e.newTagActive,
  );
}

export function useIsActionTrailEnabled(): boolean {
  return useSyncExternalStore(
    subscribeActionTrail,
    () => isActionTrailEnabled(),
    () => true,
  );
}
