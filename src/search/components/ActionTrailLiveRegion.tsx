import { useEffect, useMemo, useRef, useState } from 'react';

import { useActionTrail } from '../../context/ActionTrailContext';
import { theme } from '../../ui/antd';

/** Screen-reader announcements when unseen Action Trail counts increase. */
export function ActionTrailLiveRegion() {
  const { token } = theme.useToken();
  const { enabled, entries } = useActionTrail();
  const [announcement, setAnnouncement] = useState('');
  const prevUnseen = useRef(0);

  const unseenTotal = useMemo(
    () =>
      enabled
        ? entries.filter((e) => !e.seen).reduce((sum, e) => sum + e.partCount, 0)
        : 0,
    [enabled, entries],
  );

  useEffect(() => {
    if (!enabled) {
      prevUnseen.current = 0;
      return;
    }
    if (unseenTotal > prevUnseen.current) {
      const added = unseenTotal - prevUnseen.current;
      setAnnouncement(
        `${added} new item${added === 1 ? '' : 's'} added to your modules. ${unseenTotal} unseen total.`,
      );
    }
    prevUnseen.current = unseenTotal;
  }, [enabled, unseenTotal]);

  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      style={{
        position: 'absolute',
        width: 1,
        height: 1,
        padding: 0,
        margin: -token.marginXXS,
        overflow: 'hidden',
        clip: 'rect(0, 0, 0, 0)',
        whiteSpace: 'nowrap',
        border: 0,
      }}
    >
      {announcement}
    </div>
  );
}
