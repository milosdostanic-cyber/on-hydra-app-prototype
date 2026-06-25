import { useActionTrail } from '../context/ActionTrailContext';
import type { ActionTrailModule } from '../context/actionTrailStore';
import { Tag } from '../ui/antd';

type Props = {
  module: ActionTrailModule;
  subProjectId: string;
  itemId: string;
};

/** Ephemeral "New" label for Action Trail item-level guidance. */
export function ActionTrailNewTag({ module, subProjectId, itemId }: Props) {
  const { enabled, shouldShowNewTag } = useActionTrail();
  if (!enabled || !shouldShowNewTag(module, subProjectId, itemId)) return null;
  return <Tag color="processing">New</Tag>;
}
