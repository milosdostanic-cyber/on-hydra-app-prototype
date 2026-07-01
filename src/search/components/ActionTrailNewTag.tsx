import { useSyncExternalStore } from 'react';

import {
  isActionTrailEnabled,
  shouldShowNewTag,
  subscribeActionTrail,
  type ActionTrailModule,
} from '../../context/actionTrailStore';
import { Tag } from '../../ui/antd';

type Props = {
  module: ActionTrailModule;
  subProjectId: string;
  itemId: string;
  /** Fallback match when workspace row id drifted from trail itemIds. */
  partKey?: string;
};

/** Ephemeral "New" label for Action Trail item-level guidance. */
export function ActionTrailNewTag({ module, subProjectId, itemId, partKey }: Props) {
  const show = useSyncExternalStore(
    subscribeActionTrail,
    () => {
      const enabled = isActionTrailEnabled();
      return enabled && shouldShowNewTag(module, subProjectId, itemId, partKey);
    },
    () => false,
  );

  if (!show) return null;
  return <Tag color="processing">New</Tag>;
}
