import { useSyncExternalStore } from 'react';

import {
  isActionTrailEnabled,
  shouldShowSubProjectNewTag,
  subscribeActionTrail,
  type ActionTrailModule,
} from '../../context/actionTrailStore';
import { Tag } from '../../ui/antd';

type Props = {
  module: ActionTrailModule;
  subProjectId: string;
};

/** Level-2 "New" pill — BOM project row or Submittal package title. */
export function ActionTrailSubProjectNewTag({ module, subProjectId }: Props) {
  const show = useSyncExternalStore(
    subscribeActionTrail,
    () => isActionTrailEnabled() && shouldShowSubProjectNewTag(module, subProjectId),
    () => false,
  );

  if (!show) return null;
  return <Tag color="processing">New</Tag>;
}
