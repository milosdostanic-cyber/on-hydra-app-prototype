import { useEffect, useRef, useState, type ReactNode } from 'react';

import { useActionTrail } from '../../context/ActionTrailContext';
import { actionTrailBadgePulseStyle } from '../actionTrailStyles';
import { Tag, theme } from '../../ui/antd';

type Props = {
  menuKey: string;
  /** `inline` — Tag after menu label (expanded). `icon` — compact tag on collapsed icon rail. */
  variant?: 'inline' | 'icon';
  children?: ReactNode;
};

/** Figma `menu__item` → `show guidance tag` (Tag / Colorful / Volcano). */
export function ActionTrailMenuGuidanceTag({ menuKey, variant = 'inline', children }: Props) {
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

  const label = count > 99 ? '99+' : String(count);

  const tagNode =
    count > 0 ? (
      <Tag
        color="volcano"
        variant="filled"
        style={{
          marginInlineEnd: 0,
          flexShrink: 0,
          minWidth: token.controlHeightXS,
          textAlign: 'center',
          fontSize: token.fontSizeSM,
          lineHeight: token.lineHeightSM,
          paddingInline: token.paddingXS,
          paddingBlock: 0,
          ...actionTrailBadgePulseStyle(token, pulsing),
        }}
      >
        {label}
      </Tag>
    ) : null;

  if (variant === 'icon') {
    return (
      <span style={{ position: 'relative', display: 'inline-flex', lineHeight: 0 }}>
        {children}
        {tagNode ? (
          <span
            style={{
              position: 'absolute',
              top: -token.marginXXS,
              insetInlineEnd: -token.marginXS,
              lineHeight: 0,
            }}
          >
            {tagNode}
          </span>
        ) : null}
      </span>
    );
  }

  return tagNode;
}
