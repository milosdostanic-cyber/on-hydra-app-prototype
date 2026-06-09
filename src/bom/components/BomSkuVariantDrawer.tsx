import { useEffect, useMemo, useState } from 'react';

import {
  applyVariantToMatch,
  matchRequiresSkuSelection,
  resolveFigureNumber,
} from '../bomMatchSkuUtils';
import { getSkuVariantsForFigure } from '../data/ascSkuVariants';
import type { BomMatchResult } from '../data/types';
import { Alert, Button, Drawer, Flex, Space, theme } from '../../ui/antd';
import { BomSkuVariantPicker } from './BomSkuVariantPicker';

type BomSkuVariantDrawerProps = {
  open: boolean;
  matchRow: BomMatchResult | null;
  onClose: () => void;
  onApply: (next: BomMatchResult) => void;
};

export function BomSkuVariantDrawer({ open, matchRow, onClose, onApply }: BomSkuVariantDrawerProps) {
  const { token } = theme.useToken();
  const [pendingVariantId, setPendingVariantId] = useState<string | undefined>();

  const figureNumber = matchRow ? resolveFigureNumber(matchRow) : undefined;
  const variants = useMemo(
    () => (figureNumber ? getSkuVariantsForFigure(figureNumber) : []),
    [figureNumber],
  );
  const pendingVariant = variants.find((variant) => variant.id === pendingVariantId);

  useEffect(() => {
    if (!open) return;
    setPendingVariantId(matchRow?.selectedVariantId);
  }, [open, matchRow?.itemId, matchRow?.selectedVariantId]);

  if (!matchRow || !matchRequiresSkuSelection(matchRow) || !figureNumber) return null;

  return (
    <Drawer
      title="Pick a specific SKU"
      open={open}
      onClose={onClose}
      width={480}
      destroyOnClose
      styles={{
        body: {
          display: 'flex',
          flexDirection: 'column',
          paddingBottom: 0,
          overflow: 'hidden',
        },
      }}
      footer={
        <Flex justify="flex-end" gap={token.marginXS} wrap="wrap">
          <Button size="large" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="primary"
            size="large"
            disabled={!pendingVariant}
            onClick={() => {
              if (!pendingVariant) return;
              onApply(applyVariantToMatch(matchRow, pendingVariant));
              onClose();
            }}
          >
            Use selected SKU
          </Button>
        </Flex>
      }
    >
      <Space
        orientation="vertical"
        size={token.marginMD}
        style={{ width: '100%', height: '100%', minHeight: 0 }}
      >
        <Alert
          type="info"
          showIcon
          message="Figure-level match"
          description="We matched the parent figure number. Choose the exact SKU variant you need, then confirm the line."
        />

        <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', paddingBottom: token.paddingMD }}>
          <BomSkuVariantPicker
            figureNumber={figureNumber}
            figureDescription={matchRow.topMatch?.description}
            selectedVariantId={pendingVariantId}
            onChange={setPendingVariantId}
          />
        </div>
      </Space>
    </Drawer>
  );
}
