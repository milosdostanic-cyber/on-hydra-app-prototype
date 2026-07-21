import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from 'react';

import { SUBMITTAL_PACKAGES_SEED } from '../submittal/data/submittalPackagesMockData';
import type {
  SubmittalCartItem,
  SubmittalPackage,
  SubmittalPackagePart,
} from '../submittal/types';

const STORAGE_KEY = 'hydra-submittal-packages';
const CART_STORAGE_KEY = 'hydra-submittal-package-cart';

/* ------------------------------------------------------------------ */
/* Packages store (sessionStorage-backed external store)              */
/* ------------------------------------------------------------------ */

function readPackages(): SubmittalPackage[] {
  if (typeof sessionStorage === 'undefined') return SUBMITTAL_PACKAGES_SEED;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return SUBMITTAL_PACKAGES_SEED;
    const parsed = JSON.parse(raw) as SubmittalPackage[];
    return Array.isArray(parsed) ? parsed : SUBMITTAL_PACKAGES_SEED;
  } catch {
    return SUBMITTAL_PACKAGES_SEED;
  }
}

function writePackages(list: SubmittalPackage[]) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch {
    /* ignore */
  }
}

let packagesCache: SubmittalPackage[] = readPackages();
const packageListeners = new Set<() => void>();

function emitPackages() {
  packageListeners.forEach((l) => l());
}

function setPackages(updater: (prev: SubmittalPackage[]) => SubmittalPackage[]) {
  packagesCache = updater(packagesCache);
  writePackages(packagesCache);
  emitPackages();
}

function subscribePackages(listener: () => void) {
  packageListeners.add(listener);
  return () => packageListeners.delete(listener);
}

function getPackagesSnapshot(): SubmittalPackage[] {
  return packagesCache;
}

function getPackagesServerSnapshot(): SubmittalPackage[] {
  return SUBMITTAL_PACKAGES_SEED;
}

/* ------------------------------------------------------------------ */
/* Session cart store                                                  */
/* ------------------------------------------------------------------ */

function readCart(): SubmittalCartItem[] {
  if (typeof sessionStorage === 'undefined') return [];
  try {
    const raw = sessionStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as SubmittalCartItem[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeCart(items: SubmittalCartItem[]) {
  try {
    sessionStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  } catch {
    /* ignore */
  }
}

let cartCache: SubmittalCartItem[] = readCart();
const cartListeners = new Set<() => void>();

function emitCart() {
  cartListeners.forEach((l) => l());
}

function setCart(updater: (prev: SubmittalCartItem[]) => SubmittalCartItem[]) {
  cartCache = updater(cartCache);
  writeCart(cartCache);
  emitCart();
}

function subscribeCart(listener: () => void) {
  cartListeners.add(listener);
  return () => cartListeners.delete(listener);
}

function getCartSnapshot(): SubmittalCartItem[] {
  return cartCache;
}

function getCartServerSnapshot(): SubmittalCartItem[] {
  return [];
}

/* ------------------------------------------------------------------ */
/* Context                                                             */
/* ------------------------------------------------------------------ */

type AddPartInput = Omit<SubmittalPackagePart, 'id'> & { id?: string };

type SubmittalPackagesContextValue = {
  packagesForProject: (projectId: string) => SubmittalPackage[];
  packageCountForProject: (projectId: string) => number;
  createPackage: (projectId: string, name: string) => string;
  updatePackage: (packageId: string, name: string) => void;
  deletePackage: (packageId: string) => void;
  addPartToPackage: (packageId: string, part: AddPartInput) => void;
  removePartFromPackage: (packageId: string, partRowId: string) => void;
  /** Move a part one slot up or down within its package. */
  movePart: (packageId: string, partRowId: string, direction: 'up' | 'down') => void;
  // Session cart (parts queued during a part-search session)
  cartItems: SubmittalCartItem[];
  cartCount: number;
  addCartItem: (item: SubmittalCartItem) => void;
  clearCart: () => void;
};

const SubmittalPackagesContext = createContext<SubmittalPackagesContextValue | null>(null);

function touch(pkg: SubmittalPackage): SubmittalPackage {
  return { ...pkg, updatedAt: new Date().toISOString() };
}

export function SubmittalPackagesProvider({ children }: { children: ReactNode }) {
  const packages = useSyncExternalStore(
    subscribePackages,
    getPackagesSnapshot,
    getPackagesServerSnapshot,
  );
  const cartItems = useSyncExternalStore(subscribeCart, getCartSnapshot, getCartServerSnapshot);

  const packagesForProject = useCallback(
    (projectId: string) =>
      packages
        .filter((p) => p.projectId === projectId)
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()),
    [packages],
  );

  const packageCountForProject = useCallback(
    (projectId: string) => packages.filter((p) => p.projectId === projectId).length,
    [packages],
  );

  const createPackage = useCallback((projectId: string, name: string) => {
    const id = `pkg-${Date.now()}`;
    const next: SubmittalPackage = {
      id,
      projectId,
      name: name.trim() || 'Untitled package',
      updatedAt: new Date().toISOString(),
      parts: [],
    };
    setPackages((prev) => [next, ...prev]);
    return id;
  }, []);

  const updatePackage = useCallback((packageId: string, name: string) => {
    setPackages((prev) =>
      prev.map((p) => (p.id === packageId ? touch({ ...p, name: name.trim() || p.name }) : p)),
    );
  }, []);

  const deletePackage = useCallback((packageId: string) => {
    setPackages((prev) => prev.filter((p) => p.id !== packageId));
  }, []);

  const addPartToPackage = useCallback((packageId: string, part: AddPartInput) => {
    const rowId = part.id ?? `pp-${packageId}-${part.partKey}-${Date.now()}`;
    setPackages((prev) =>
      prev.map((p) => {
        if (p.id !== packageId) return p;
        if (p.parts.some((existing) => existing.partKey === part.partKey)) return p;
        return touch({
          ...p,
          parts: [...p.parts, { id: rowId, partKey: part.partKey, displayName: part.displayName, figureNumber: part.figureNumber }],
        });
      }),
    );
  }, []);

  const removePartFromPackage = useCallback((packageId: string, partRowId: string) => {
    setPackages((prev) =>
      prev.map((p) =>
        p.id === packageId ? touch({ ...p, parts: p.parts.filter((r) => r.id !== partRowId) }) : p,
      ),
    );
  }, []);

  const movePart = useCallback(
    (packageId: string, partRowId: string, direction: 'up' | 'down') => {
      setPackages((prev) =>
        prev.map((p) => {
          if (p.id !== packageId) return p;
          const index = p.parts.findIndex((r) => r.id === partRowId);
          if (index < 0) return p;
          const target = direction === 'up' ? index - 1 : index + 1;
          if (target < 0 || target >= p.parts.length) return p;
          const reordered = [...p.parts];
          [reordered[index], reordered[target]] = [reordered[target], reordered[index]];
          return touch({ ...p, parts: reordered });
        }),
      );
    },
    [],
  );

  const addCartItem = useCallback((item: SubmittalCartItem) => {
    setCart((prev) => [...prev, item]);
  }, []);

  const clearCart = useCallback(() => {
    setCart(() => []);
  }, []);

  const value = useMemo(
    () => ({
      packagesForProject,
      packageCountForProject,
      createPackage,
      updatePackage,
      deletePackage,
      addPartToPackage,
      removePartFromPackage,
      movePart,
      cartItems,
      cartCount: cartItems.length,
      addCartItem,
      clearCart,
    }),
    [
      packagesForProject,
      packageCountForProject,
      createPackage,
      updatePackage,
      deletePackage,
      addPartToPackage,
      removePartFromPackage,
      movePart,
      cartItems,
      addCartItem,
      clearCart,
    ],
  );

  return (
    <SubmittalPackagesContext.Provider value={value}>{children}</SubmittalPackagesContext.Provider>
  );
}

export function useSubmittalPackages(): SubmittalPackagesContextValue {
  const ctx = useContext(SubmittalPackagesContext);
  if (!ctx) {
    throw new Error('useSubmittalPackages must be used within SubmittalPackagesProvider');
  }
  return ctx;
}

/** Read-only snapshot helpers for cross-flow checks (e.g. Action Trail duplicate detection). */
export function isPartInAnySubmittalPackage(partKey: string): boolean {
  return getPackagesSnapshot().some((pkg) => pkg.parts.some((p) => p.partKey === partKey));
}

export function findSubmittalPartRowId(packageId: string, partKey: string): string | undefined {
  const pkg = getPackagesSnapshot().find((p) => p.id === packageId);
  return pkg?.parts.find((p) => p.partKey === partKey)?.id;
}
