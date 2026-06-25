import { useEffect, useState } from 'react';

import { getSkuVariantsForFigure } from '../data/ascSkuVariants';
import type { AscBrowserProductRow } from '../data/ascBrowserProducts';
import {
  hydraBaseNormal,
  hydraLargeStrong,
  hydraTextStyleToReactCss,
} from '../../theme/hydraTypography';
import { Button, Flex, Modal, Space, Typography, theme } from '../../ui/antd';
import { BomSkuVariantPicker } from './BomSkuVariantPicker';

type BomCatalogSkuPickModalProps = {
  open: boolean;
  product: AscBrowserProductRow | null;
  initialVariantId?: string;
  onClose: () => void;
  onConfirm: (variantId: string) => void;
};

export function BomCatalogSkuPickModal({
  open,
  product,
  initialVariantId,
  onClose,
  onConfirm,
}: BomCatalogSkuPickModalProps) {
  const { token } = theme.useToken();
  const [pendingVariantId, setPendingVariantId] = useState<string | undefined>();

  const figureNumber = product?.figureNumber;
  const variants = figureNumber ? getSkuVariantsForFigure(figureNumber) : [];
  const pendingVariant = variants.find((variant) => variant.id === pendingVariantId);

  useEffect(() => {
    if (!open) return;
    setPendingVariantId(initialVariantId ?? variants[0]?.id);
  }, [open, initialVariantId, product?.key, variants]);

  if (!product || variants.length === 0) return null;

  function handleClose() {
    setPendingVariantId(undefined);
    onClose();
  }

  function handleConfirm() {
    if (!pendingVariantId) return;
    onConfirm(pendingVariantId);
    handleClose();
  }

  return (
    <Modal
      title="Choose SKU variant"
      open={open}
      onCancel={handleClose}
      width={760}
      centered
      destroyOnClose
      footer={
        <Flex align="center" justify="space-between" wrap="wrap" gap={token.marginSM}>
          <Button type="link" size="large" onClick={handleClose}>
            Back to part
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
            <Button type="primary" size="large" disabled={!pendingVariantId} onClick={handleConfirm}>
              Use as replacement
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
            {product.figureNumber}
          </Typography.Text>
          <Typography.Text strong style={hydraTextStyleToReactCss(hydraLargeStrong)}>
            {product.description}
          </Typography.Text>
        </Flex>

        <BomSkuVariantPicker
          figureNumber={product.figureNumber}
          figureDescription={product.description}
          selectedVariantId={pendingVariantId}
          onChange={setPendingVariantId}
        />
      </Space>
    </Modal>
  );
}
