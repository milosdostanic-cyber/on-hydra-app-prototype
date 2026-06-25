import { useCallback, useEffect, useMemo, useState } from 'react';

import { useBomImportFlow } from '../context/BomImportFlowContext';
import { createInitialMatchResults, normalizeParsedItemsForUpload } from '../data/bomImportFlowSeed';
import type { BomMatchResult } from '../data/types';
import { useBomImportSession } from './useBomImportSession';

export function useBomMatchingData(bomProjectId: string) {
  const { session, uploadId } = useBomImportSession(bomProjectId);
  const { updateProgress } = useBomImportFlow();

  const [matchResults, setMatchResults] = useState<BomMatchResult[]>(() => {
    if (session?.matchResults?.length) return session.matchResults.map((r) => ({ ...r }));
    const items = normalizeParsedItemsForUpload(session?.parsedItems, session?.progress.fileName);
    return createInitialMatchResults(items);
  });

  useEffect(() => {
    if (session?.matchResults?.length) {
      setMatchResults(session.matchResults.map((r) => ({ ...r })));
    }
  }, [session?.uploadId, session?.matchResults?.length]);

  const persist = useCallback(
    (next: BomMatchResult[]) => {
      setMatchResults(next);
      if (uploadId) {
        const accepted = next.filter((r) => r.lineStatus === 'accepted').length;
        const skipped = next.filter((r) => r.lineStatus === 'skipped').length;
        const manual = next.filter((r) => r.source === 'manual').length;
        updateProgress(uploadId, {
          matchResults: next,
          acceptedCount: accepted,
          skippedCount: skipped,
          manualCount: manual,
          matchedRows: accepted + skipped + manual,
        });
      }
    },
    [uploadId, updateProgress],
  );

  const resetFromParsed = useCallback(
    (parsedIds: string[]) => {
      const items = session?.parsedItems ?? [];
      const filtered = items.filter((i) => parsedIds.includes(i.id));
      const next = createInitialMatchResults(filtered.length ? filtered : items);
      persist(next);
    },
    [session?.parsedItems, persist],
  );

  const stats = useMemo(() => {
    const total = matchResults.length;
    const accepted = matchResults.filter((r) => r.lineStatus === 'accepted').length;
    const skipped = matchResults.filter((r) => r.lineStatus === 'skipped').length;
    const pending = matchResults.filter((r) => r.lineStatus === 'pending').length;
    const manual = matchResults.filter((r) => r.source === 'manual').length;
    return { total, accepted, skipped, pending, manual };
  }, [matchResults]);

  return {
    session,
    uploadId,
    matchResults,
    persist,
    resetFromParsed,
    stats,
  };
}
