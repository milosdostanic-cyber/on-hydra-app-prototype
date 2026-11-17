import { CloseOutlined } from '@ant-design/icons';
import { useState } from 'react';

import { HydraTag } from '../../ui/HydraTag';
import { theme } from '../../ui/antd';

type Props = {
  label: string;
  onRemove: () => void;
};

/**
 * Applied filter, removable. Hydra DS `Tag / Default` (24 px, Base/Normal, bordered): colorFillQuaternary background,
 * colorBorder stroke, colorText. Hover/focus follows Ant Design's fill steps (colorFillTertiary) and darkens the ×.
 * The whole tag is the remove target, not only the small ×.
 */
export function AppliedFilterTag({ label, onRemove }: Props) {
  const { token } = theme.useToken();
  const [hover, setHover] = useState(false);

  return (
    <button
      type="button"
      aria-label={`Remove filter ${label}`}
      onClick={onRemove}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onFocus={() => setHover(true)}
      onBlur={() => setHover(false)}
      style={{ all: 'unset', cursor: 'pointer', borderRadius: token.borderRadiusSM, display: 'inline-flex' }}
    >
      <HydraTag
        tone="default"
        style={{
          gap: token.marginXS,
          paddingInlineEnd: token.paddingXS - token.lineWidth,
          transition: `border-color ${token.motionDurationMid}, background ${token.motionDurationMid}`,
          ...(hover ? { background: token.colorFillTertiary } : {}),
        }}
      >
        <span>{label}</span>
        <CloseOutlined aria-hidden style={{ fontSize: token.fontSizeSM, color: hover ? token.colorText : token.colorTextTertiary }} />
      </HydraTag>
    </button>
  );
}
