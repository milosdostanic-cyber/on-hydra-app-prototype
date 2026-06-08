import { useCallback, useMemo, useState } from 'react';

import { ascBrowserRowToCatalogPart } from '../bomChoosePartUtils';
import type { AscBrowserProductRow } from '../data/ascBrowserProducts';
import type { BomMatchResult } from '../data/types';
import { message } from '../../ui/antd';

export function useBomChoosePartDrawer(
  matchResults: BomMatchResult[],
  persist: (next: BomMatchResult[]) => void,
) {
  const [chooseItemId, setChooseItemId] = useState<string | null>(null);

  const chooseMatchRow = useMemo(
    () => (chooseItemId ? matchResults.find((r) => r.itemId === chooseItemId) ?? null : null),
    [chooseItemId, matchResults],
  );

  const openChoose = useCallback((itemId: string) => {
    setChooseItemId(itemId);
  }, []);

  const closeChoose = useCallback(() => {
    setChooseItemId(null);
  }, []);

  const handleSelectPart = useCallback(
    (product: AscBrowserProductRow) => {
      if (!chooseItemId) return;
      const matchRow = matchResults.find((r) => r.itemId === chooseItemId);
      if (!matchRow) return;

      const topMatch = ascBrowserRowToCatalogPart(product);
      const hadSuggestion = Boolean(matchRow.topMatch);
      const next: BomMatchResult = {
        ...matchRow,
        topMatch,
        source: 'manual',
        lineStatus: 'pending',
        matchLevel: 'sku',
        figureNumber: product.figureNumber,
        selectedVariantId: `manual-${product.key}`,
        suggestedParts: [topMatch, ...matchRow.suggestedParts.filter((p) => p.partNumber !== topMatch.partNumber)].slice(
          0,
          3,
        ),
      };
      persist(matchResults.map((r) => (r.itemId === chooseItemId ? next : r)));
      message.success(
        hadSuggestion ? 'Part updated — confirm the match to continue.' : 'Part selected — confirm the match to continue.',
      );
      setChooseItemId(null);
    },
    [chooseItemId, matchResults, persist],
  );

  return {
    chooseOpen: chooseItemId != null,
    chooseMatchRow,
    openChoose,
    closeChoose,
    handleSelectPart,
  };
}
