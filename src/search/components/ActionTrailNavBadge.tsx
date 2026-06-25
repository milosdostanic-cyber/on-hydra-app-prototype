import { useEffect, useRef, useState, type ReactNode } from 'react';

import { useActionTrail } from '../../context/ActionTrailContext';
import { actionTrailBadgePulseStyle } from '../actionTrailStyles';
import { Badge, theme } from '../../ui/antd';

type Props = {
  menuKey: string;
  children: ReactNode;
};

/** Sidebar nav badge — unseen Action Trail count with one-shot pulse on increase. */
export function ActionTrailNavBadge({ menuKey, children }: Props) {
  const { token } = theme.useToken();
  const { enabled, countForMenuKey } = useActionTrail();
  const count = enabled ? countForMenuKey(menuKey) : 0;
  const [pulsing, setPulsing] = useState(false);
  const prevCount = useRef(count);

  useEffect(() => {
    if (count > prevCount.current) {
      setPulsing(true);
      const durationMs = Number.parseFloat(token.motionDurationSlow) * 1000 || 300;
      const timer = window.setTimeout(() => setPulsing(false), durationMs);
      prevCount.current = count;
      return () => window.clearTimeout(timer);
    }
    prevCount.current = count;
    return undefined;
  }, [count, token.motionDurationSlow]);

  if (count <= 0) return <>{children}</>;

  return (
    <Badge
      count={count}
      size="small"
      offset={[-2, 2]}
      style={actionTrailBadgePulseStyle(token, pulsing)}
    >
      {children}
    </Badge>
  );
}
