import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import type { SpecCitation } from '../data/types';

type SpecWorkspaceSelection = {
  documentId: string | null;
  sectionId: string | null;
  findingId: string | null;
  citationId: string | null;
  highlightBlockId: string | null;
  approximateCitation: boolean;
};

type SpecWorkspaceContextValue = SpecWorkspaceSelection & {
  setDocumentId: (id: string | null) => void;
  setSectionId: (id: string | null) => void;
  setFindingId: (id: string | null) => void;
  setHighlightBlockId: (id: string | null) => void;
  openCitation: (citation: SpecCitation) => void;
  clearHighlight: () => void;
};

const SpecWorkspaceContext = createContext<SpecWorkspaceContextValue | null>(null);

const initial: SpecWorkspaceSelection = {
  documentId: null,
  sectionId: null,
  findingId: null,
  citationId: null,
  highlightBlockId: null,
  approximateCitation: false,
};

export function SpecWorkspaceProvider({ children }: { children: ReactNode }) {
  const [selection, setSelection] = useState<SpecWorkspaceSelection>(initial);

  const setDocumentId = useCallback((id: string | null) => {
    setSelection((prev) => ({
      ...prev,
      documentId: id,
      sectionId: null,
      findingId: null,
      citationId: null,
      highlightBlockId: null,
      approximateCitation: false,
    }));
  }, []);

  const setSectionId = useCallback((id: string | null) => {
    setSelection((prev) => ({
      ...prev,
      sectionId: id,
      findingId: null,
      citationId: null,
      highlightBlockId: null,
      approximateCitation: false,
    }));
  }, []);

  const setFindingId = useCallback((id: string | null) => {
    setSelection((prev) => ({ ...prev, findingId: id }));
  }, []);

  const setHighlightBlockId = useCallback((id: string | null) => {
    setSelection((prev) => ({
      ...prev,
      highlightBlockId: id,
      approximateCitation: false,
    }));
  }, []);

  const openCitation = useCallback((citation: SpecCitation) => {
    setSelection((prev) => ({
      ...prev,
      sectionId: citation.sectionId,
      citationId: citation.id,
      highlightBlockId: citation.blockId,
      approximateCitation: citation.anchorType !== 'exact',
    }));
  }, []);

  const clearHighlight = useCallback(() => {
    setSelection((prev) => ({
      ...prev,
      citationId: null,
      highlightBlockId: null,
      approximateCitation: false,
    }));
  }, []);

  const value = useMemo(
    () => ({
      ...selection,
      setDocumentId,
      setSectionId,
      setFindingId,
      setHighlightBlockId,
      openCitation,
      clearHighlight,
    }),
    [selection, setDocumentId, setSectionId, setFindingId, setHighlightBlockId, openCitation, clearHighlight],
  );

  return <SpecWorkspaceContext.Provider value={value}>{children}</SpecWorkspaceContext.Provider>;
}

export function useSpecWorkspace(): SpecWorkspaceContextValue {
  const ctx = useContext(SpecWorkspaceContext);
  if (!ctx) {
    throw new Error('useSpecWorkspace must be used within SpecWorkspaceProvider');
  }
  return ctx;
}
