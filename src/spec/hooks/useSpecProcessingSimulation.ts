import { useCallback, useEffect } from 'react';

import { mockSpecDocumentRepository } from '../data/repositories/specRepositories';
import { ensureSpecProcessingTicker } from '../data/specMockStore';
import type { SpecDocument, SpecFileType } from '../data/types';
import { trackSpecEvent } from '../specAnalytics';

/**
 * Ensures store-level processing continues after the user leaves Screen 02.
 * Retry and replace operate on the same customer version (no duplicate record).
 */
export function useSpecProcessingSimulation(document: SpecDocument | undefined) {
  useEffect(() => {
    if (!document) return;
    if (document.processingState !== 'queued' && document.processingState !== 'processing') {
      return;
    }
    ensureSpecProcessingTicker();
  }, [document]);

  const retry = useCallback(async () => {
    if (!document) return;
    await mockSpecDocumentRepository.retryProcessing(document.id);
    trackSpecEvent('spec_processing_retried', { documentId: document.id });
  }, [document]);

  const replaceFile = useCallback(
    async (file: { fileName: string; fileType: SpecFileType; fileSizeBytes: number }) => {
      if (!document) return;
      await mockSpecDocumentRepository.replaceProcessingFile(document.id, file);
      trackSpecEvent('spec_processing_retried', {
        documentId: document.id,
        replacedFile: true,
      });
    },
    [document],
  );

  return { retry, replaceFile };
}
