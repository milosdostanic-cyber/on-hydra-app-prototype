import { createContext, useContext, useMemo, type ReactNode } from 'react';

import { trackSpecEvent } from '../specAnalytics';
import {
  resetSpecMock,
  setSpecDemoDelayMs,
  setSpecDemoRole,
  switchSpecScenario,
  useSpecMockStore,
} from '../data/specMockStore';
import type { SpecAccessLevel } from '../data/types';
import type { SpecScenarioId } from '../data/specScenarios';

type SpecDemoContextValue = {
  scenarioId: SpecScenarioId;
  role: SpecAccessLevel;
  delayMs: number;
  switchScenario: (id: SpecScenarioId) => void;
  setRole: (role: SpecAccessLevel) => void;
  setDelayMs: (ms: number) => void;
  reset: () => void;
};

const SpecDemoContext = createContext<SpecDemoContextValue | null>(null);

export function SpecDemoProvider({ children }: { children: ReactNode }) {
  const store = useSpecMockStore();

  const value = useMemo<SpecDemoContextValue>(
    () => ({
      scenarioId: store.scenarioId,
      role: store.role,
      delayMs: store.delayMs,
      switchScenario: (id) => {
        switchSpecScenario(id);
        trackSpecEvent('spec_demo_scenario_switched', { scenarioId: id });
      },
      setRole: (role) => {
        setSpecDemoRole(role);
        trackSpecEvent('spec_role_simulated', { role });
      },
      setDelayMs: (ms) => setSpecDemoDelayMs(ms),
      reset: () => {
        resetSpecMock();
        trackSpecEvent('spec_demo_reset', { scenarioId: store.scenarioId });
      },
    }),
    [store.scenarioId, store.role, store.delayMs],
  );

  return <SpecDemoContext.Provider value={value}>{children}</SpecDemoContext.Provider>;
}

export function useSpecDemo(): SpecDemoContextValue {
  const ctx = useContext(SpecDemoContext);
  if (!ctx) {
    throw new Error('useSpecDemo must be used within SpecDemoProvider');
  }
  return ctx;
}

/** Demo controls are available in DEV, or when localStorage flag `hydra-spec-demo=1` is set. */
export function isSpecDemoEnabled(): boolean {
  if (import.meta.env.DEV) return true;
  try {
    return localStorage.getItem('hydra-spec-demo') === '1';
  } catch {
    return false;
  }
}
