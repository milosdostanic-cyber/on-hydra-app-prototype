import { useCallback, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

import { useSpecWorkspace } from '../context/SpecWorkspaceContext';
import { mockSpecAnalysisRepository } from '../data/repositories/specRepositories';

/**
 * Deep-link contract (PRD §13.3):
 * `/projects/:projectId/spec/:specId/analyze?version=v2&section=…&finding=…&citation=…`
 * (legacy `/spec/:specId/analyze?…` redirects into that tree).
 */
export function useSpecDeepLink() {
  const [params, setParams] = useSearchParams();
  const workspace = useSpecWorkspace();

  useEffect(() => {
    const section = params.get('section');
    const finding = params.get('finding');
    const citation = params.get('citation');

    if (section && section !== workspace.sectionId) {
      workspace.setSectionId(section);
    }
    if (finding && finding !== workspace.findingId) {
      workspace.setFindingId(finding);
    }
    if (citation && citation !== workspace.citationId) {
      void mockSpecAnalysisRepository.getCitation(citation).then((c) => {
        if (c) workspace.openCitation(c);
      });
    }
    // Intentionally sync from URL → workspace once params change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

  const writeDeepLink = useCallback(
    (next: { section?: string; finding?: string; citation?: string; version?: string }) => {
      const sp = new URLSearchParams(params);
      if (next.version) sp.set('version', next.version);
      if (next.section) sp.set('section', next.section);
      else if (next.section === '') sp.delete('section');
      if (next.finding) sp.set('finding', next.finding);
      else if (next.finding === '') sp.delete('finding');
      if (next.citation) sp.set('citation', next.citation);
      else if (next.citation === '') sp.delete('citation');
      setParams(sp, { replace: true });
    },
    [params, setParams],
  );

  return {
    version: params.get('version'),
    section: params.get('section'),
    finding: params.get('finding'),
    citation: params.get('citation'),
    writeDeepLink,
  };
}
