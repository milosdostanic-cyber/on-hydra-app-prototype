/** `location.state` when opening a part from catalog browse / featured cards. */
export type CatalogPartLocationState = {
  catalogReturnTo: string;
  catalogReturnLabel: string;
};

const DEFAULT_RETURN: CatalogPartLocationState = {
  catalogReturnTo: '/catalog/results?q=all',
  catalogReturnLabel: 'Back to results',
};

/** Build return target from the screen the user navigated from (path + optional search). */
export function catalogPartReturnFrom(originPath: string): CatalogPartLocationState {
  const [pathname, search = ''] = originPath.split('?');
  const path = pathname.replace(/\/+$/, '') || '/';
  const withSearch = search ? `${path}?${search}` : path;

  if (/^\/projects\/[^/]+\/content/.test(path)) {
    const homeMatch = path.match(/^(\/projects\/[^/]+\/content)/);
    const home = homeMatch?.[1] ?? path;
    return { catalogReturnTo: home, catalogReturnLabel: 'Back to Home' };
  }
  if (path === '/catalog') {
    return { catalogReturnTo: '/catalog', catalogReturnLabel: 'Back to catalog' };
  }
  if (path.startsWith('/catalog/results')) {
    return { catalogReturnTo: withSearch, catalogReturnLabel: 'Back to results' };
  }
  return DEFAULT_RETURN;
}

export function readCatalogPartReturnState(state: unknown): CatalogPartLocationState {
  const s = state as Partial<CatalogPartLocationState> | null | undefined;
  if (typeof s?.catalogReturnTo === 'string' && typeof s?.catalogReturnLabel === 'string') {
    return { catalogReturnTo: s.catalogReturnTo, catalogReturnLabel: s.catalogReturnLabel };
  }
  return DEFAULT_RETURN;
}
