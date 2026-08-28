import { useCallback, useEffect, useState } from 'react';

import { mockSpecDocumentRepository } from '../data/repositories/specRepositories';
import { useSpecMockStore } from '../data/specMockStore';
import type { SpecDocument } from '../data/types';

export function useSpecDocument(specId: string | undefined) {
  const store = useSpecMockStore();
  const [document, setDocument] = useState<SpecDocument | undefined>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | undefined>();

  const reload = useCallback(async () => {
    if (!specId) {
      setDocument(undefined);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(undefined);
    try {
      const doc = await mockSpecDocumentRepository.getById(specId);
      setDocument(doc);
    } catch {
      setError('Could not load this specification.');
      setDocument(undefined);
    } finally {
      setLoading(false);
    }
  }, [specId]);

  useEffect(() => {
    void reload();
  }, [reload, store.documents, store.scenarioId]);

  return { document, loading, error, reload };
}
