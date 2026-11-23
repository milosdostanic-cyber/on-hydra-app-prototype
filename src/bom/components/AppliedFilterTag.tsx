import { CloseOutlined } from '@ant-design/icons';
import { useState } from 'react';

import { HydraColorfulTag, HydraTag, type HydraColorfulPreset } from '../../ui/HydraTag';
import { theme } from '../../ui/antd';

type Props = {
  label: string;
  preset?: HydraColorfulPreset;
  onRemove: () => void;
};

/**
 * Applied filter, removable. Hydra DS `Tag / Default` (24 px, Base/Normal, bordered): colorFillQuaternary background,
 * colorBorder stroke, colorText. Hover/focus follows Ant Design's fill steps (colorFillTertiary) and darkens the ×.
 * The whole tag is the remove target, not only the small ×.
 */
export function AppliedFilterTag({ label, preset, onRemove }: Props) {
  const { token } = theme.useToken();
  const [hover, setHover] = useState(false);
  const tagStyle = {
    gap: token.marginXS,
    paddingInlineEnd: token.paddingXS - token.lineWidth,
    transition: `border-color ${token.motionDurationMid}, background ${token.motionDurationMid}`,
    ...(hover && !preset ? { background: token.colorFillTertiary } : {}),
    ...(hover && preset ? { background: token[`${preset}2`] } : {}),
  };
  const closeColor = hover ? token.colorText : token.colorTextTertiary;
  const content = (
    <>
      <span>{label}</span>
      <CloseOutlined aria-hidden style={{ fontSize: token.fontSizeSM, color: preset ? 'currentColor' : closeColor }} />
    </>
  );

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
      {preset ? (
        <HydraColorfulTag preset={preset} style={tagStyle}>{content}</HydraColorfulTag>
      ) : (
        <HydraTag style={tagStyle}>{content}</HydraTag>
      )}
    </button>
  );
}
