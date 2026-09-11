import { useCallback, useState } from 'react';

import { mockSpecCorrectionRepository } from '../data/repositories/specRepositories';
import type { SpecCorrectionReason, SpecRequirementCategory } from '../data/types';
import { trackSpecEvent } from '../specAnalytics';

export function useSpecCorrection() {
  const [saving, setSaving] = useState(false);

  const saveCorrection = useCallback(
    async (input: {
      requirementId: string;
      nextValue: string;
      nextCategory: SpecRequirementCategory;
      reason: SpecCorrectionReason;
      note?: string;
      actor?: string;
    }) => {
      setSaving(true);
      try {
        const correction = await mockSpecCorrectionRepository.create({
          ...input,
          actor: input.actor ?? 'You',
        });
        trackSpecEvent('spec_correction_saved', {
          requirementId: input.requirementId,
          reason: input.reason,
        });
        return correction;
      } finally {
        setSaving(false);
      }
    },
    [],
  );

  return { saveCorrection, saving };
}
