import { useEffect, useMemo, useState } from 'react';

import {
  applyVariantToMatch,
  matchRequiresSkuSelection,
  resolveFigureNumber,
} from '../bomMatchSkuUtils';
import { getSkuVariantsForFigure } from '../data/ascSkuVariants';
import type { BomMatchResult } from '../data/types';
import {
  hydraBaseNormal,
  hydraLargeStrong,
  hydraTextStyleToReactCss,
} from '../../theme/hydraTypography';
import { Button, Flex, Modal, Space, Typography, theme } from '../../ui/antd';
import { BomSkuVariantPicker } from './BomSkuVariantPicker';

type BomSkuVariantModalProps = {
  open: boolean;
  matchRow: BomMatchResult | null;
  onClose: () => void;
  onApply: (next: BomMatchResult) => void;
};

export function BomSkuVariantModal({ open, matchRow, onClose, onApply }: BomSkuVariantModalProps) {
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

  function handleClose() {
    setPendingVariantId(undefined);
    onClose();
  }

  function handleConfirm() {
    if (!matchRow || !pendingVariant) return;
    onApply(applyVariantToMatch(matchRow, pendingVariant));
    handleClose();
  }

  return (
    <Modal
      title="Select SKU"
      open={open}
      onCancel={handleClose}
      width={760}
      centered
      destroyOnClose
      footer={
        <Flex align="center" justify="space-between" wrap="wrap" gap={token.marginSM}>
          <Button type="link" size="large" onClick={handleClose}>
            Back to review
          </Button>
          <Flex vertical align="flex-end" gap={token.marginXXS} style={{ flex: 1, minWidth: 200 }}>
            {pendingVariant ? (
              <Typography.Text type="secondary" style={hydraTextStyleToReactCss(hydraBaseNormal)}>
                Selected SKU: <Typography.Text strong>{pendingVariant.sku}</Typography.Text>
                {' — '}
                {pendingVariant.description}
              </Typography.Text>
            ) : (
              <Typography.Text type="secondary" style={hydraTextStyleToReactCss(hydraBaseNormal)}>
                Pick the exact variant you need, then confirm.
              </Typography.Text>
            )}
            <Button type="primary" size="large" disabled={!pendingVariant} onClick={handleConfirm}>
              Select SKU
            </Button>
          </Flex>
        </Flex>
      }
    >
      <Space orientation="vertical" size={token.marginMD} style={{ width: '100%' }}>
        <Flex
          vertical
          gap={token.marginXXS}
          style={{
            padding: token.paddingMD,
            borderRadius: token.borderRadiusLG,
            background: token.colorFillAlter,
            border: `${token.lineWidth}px ${token.lineType} ${token.colorBorderSecondary}`,
          }}
        >
          <Typography.Text type="secondary" style={hydraTextStyleToReactCss(hydraBaseNormal)}>
            Figure-level match — choose the sellable SKU
          </Typography.Text>
          <Typography.Text strong style={hydraTextStyleToReactCss(hydraLargeStrong)}>
            {matchRow.originalRequest}
          </Typography.Text>
          {matchRow.topMatch ? (
            <Typography.Text type="secondary" style={hydraTextStyleToReactCss(hydraBaseNormal)}>
              Parent figure {figureNumber} · {matchRow.topMatch.description}
            </Typography.Text>
          ) : null}
        </Flex>

        <BomSkuVariantPicker
          figureNumber={figureNumber}
          figureDescription={matchRow.topMatch?.description}
          selectedVariantId={pendingVariantId}
          onChange={setPendingVariantId}
        />
      </Space>
    </Modal>
  );
}
