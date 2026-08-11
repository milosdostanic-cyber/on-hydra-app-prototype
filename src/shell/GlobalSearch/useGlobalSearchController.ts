import { useEffect, useMemo, useState, type KeyboardEvent } from 'react';
import { useNavigate } from 'react-router-dom';

import { useActiveProject } from '../../context/ActiveProjectContext';
import {
  getRecentGlobalSearches,
  saveRecentGlobalSearch,
  searchGlobal,
} from '../../search/globalSearchIndex';
import {
  MIN_GLOBAL_SEARCH_CHARS,
  type GlobalSearchResult,
  type SearchScope,
} from '../../search/globalSearchModel';

const SEARCH_DEBOUNCE_MS = 180;

export function useGlobalSearchController() {
  const navigate = useNavigate();
  const { setProjectId } = useActiveProject();
  const [scope, setScope] = useState<SearchScope>('parts');
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState<GlobalSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [recentSearches, setRecentSearches] = useState<string[]>(() => getRecentGlobalSearches());

  const trimmedQuery = query.trim();
  const belowThreshold = trimmedQuery.length > 0 && trimmedQuery.length < MIN_GLOBAL_SEARCH_CHARS;

  useEffect(() => {
    if (!trimmedQuery || belowThreshold) {
      setResults([]);
      setLoading(false);
      setError(null);
      setSelectedIndex(0);
      return;
    }

    setLoading(true);
    setError(null);
    const handle = window.setTimeout(() => {
      try {
        const nextResults = searchGlobal(trimmedQuery, scope);
        setResults(nextResults);
        setSelectedIndex(0);
      } catch {
        setError('Search failed. Try again or use a shorter search term.');
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, SEARCH_DEBOUNCE_MS);

    return () => window.clearTimeout(handle);
  }, [belowThreshold, scope, trimmedQuery]);

  const selectedResult = useMemo(
    () => (results.length > 0 ? results[Math.min(selectedIndex, results.length - 1)] : undefined),
    [results, selectedIndex],
  );

  const rememberQuery = (value: string) => {
    saveRecentGlobalSearch(value);
    setRecentSearches(getRecentGlobalSearches());
  };

  const runFullSearch = (value = query, nextScope = scope) => {
    const q = value.trim() || 'all';
    rememberQuery(q);
    setIsOpen(false);
    navigate(`/search/results?q=${encodeURIComponent(q)}&scope=${encodeURIComponent(nextScope)}`);
  };

  const selectResult = (result: GlobalSearchResult) => {
    if (query.trim()) rememberQuery(query);
    if (result.projectId) setProjectId(result.projectId);
    setIsOpen(false);
    navigate(result.href);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Escape') {
      setIsOpen(false);
      return;
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setIsOpen(true);
      setSelectedIndex((current) => Math.min(current + 1, Math.max(results.length - 1, 0)));
      return;
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      setSelectedIndex((current) => Math.max(current - 1, 0));
      return;
    }

    if (event.key === 'Enter') {
      event.preventDefault();
      if (selectedResult) {
        selectResult(selectedResult);
      } else {
        runFullSearch();
      }
    }
  };

  const applyExample = (value: string) => {
    setQuery(value);
    setIsOpen(true);
  };

  return {
    scope,
    setScope,
    query,
    setQuery,
    isOpen,
    setIsOpen,
    results,
    loading,
    error,
    belowThreshold,
    selectedResultKey: selectedResult?.key,
    setSelectedIndex,
    recentSearches,
    runFullSearch,
    selectResult,
    onKeyDown,
    applyExample,
  };
}
