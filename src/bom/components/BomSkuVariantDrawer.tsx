import {
  applyVariantToMatch,
  matchRequiresSkuSelection,
  resolveFigureNumber,
} from '../bomMatchSkuUtils';
import type { BomMatchResult } from '../data/types';
import { Drawer } from '../../ui/antd';
import { BomSkuVariantPicker } from './BomSkuVariantPicker';

type BomSkuVariantDrawerProps = {
  open: boolean;
  matchRow: BomMatchResult | null;
  onClose: () => void;
  onApply: (next: BomMatchResult) => void;
};

export function BomSkuVariantDrawer({ open, matchRow, onClose, onApply }: BomSkuVariantDrawerProps) {
  if (!matchRow || !matchRequiresSkuSelection(matchRow)) return null;

  const figureNumber = resolveFigureNumber(matchRow);
  if (!figureNumber) return null;

  return (
    <Drawer
      title="Select SKU variant"
      open={open}
      onClose={onClose}
      width={480}
      destroyOnClose
    >
      <BomSkuVariantPicker
        figureNumber={figureNumber}
        figureDescription={matchRow.topMatch?.description}
        selectedVariantId={matchRow.selectedVariantId}
        onSelectVariant={(variant) => {
          onApply(applyVariantToMatch(matchRow, variant));
          onClose();
        }}
      />
    </Drawer>
  );
}
