import { useEffect, useState } from 'react';

import { getSkuVariantsForFigure } from '../data/ascSkuVariants';
import type { AscCatalogPart, BomMatchResult } from '../data/types';
import {
  hydraBaseNormal,
  hydraTextStyleToReactCss,
} from '../../theme/hydraTypography';
import { Button, Flex, Modal, Radio, Space, Typography, theme } from '../../ui/antd';

type BomSuggestedPartsModalProps = {
  open: boolean;
  matchRow: BomMatchResult | null;
  onClose: () => void;
  onSelectCandidate: (part: AscCatalogPart) => void;
};

function candidateKey(part: AscCatalogPart): string {
  return part.figureNumber ?? part.partNumber;
}

export function BomSuggestedPartsModal({
  open,
  matchRow,
  onClose,
  onSelectCandidate,
}: BomSuggestedPartsModalProps) {
  const { token } = theme.useToken();
  const candidates = matchRow?.suggestedParts.filter(Boolean) ?? [];
  const [selectedKey, setSelectedKey] = useState<string | undefined>();

  useEffect(() => {
    if (open && matchRow?.topMatch) {
      setSelectedKey(candidateKey(matchRow.topMatch));
    }
  }, [open, matchRow?.topMatch, matchRow?.itemId]);

  if (!matchRow || candidates.length <= 1) return null;

  function handleApply() {
    const part = candidates.find((c) => candidateKey(c) === selectedKey);
    if (!part) return;
    onSelectCandidate(part);
    onClose();
  }

  return (
    <Modal
      title={`Compare ${candidates.length} possible matches`}
      open={open}
      onCancel={onClose}
      width={640}
      destroyOnClose
      footer={
        <Flex justify="flex-end" gap={token.marginXS} wrap="wrap">
          <Button size="large" onClick={onClose}>
            Cancel
          </Button>
          <Button type="primary" size="large" disabled={!selectedKey} onClick={handleApply}>
            Use this match
          </Button>
        </Flex>
      }
    >
      <Space orientation="vertical" size={token.marginMD} style={{ width: '100%' }}>
        <Typography.Text type="secondary" style={hydraTextStyleToReactCss(hydraBaseNormal)}>
          Pick the figure that best fits: {matchRow.originalRequest}
        </Typography.Text>
        <Radio.Group
          value={selectedKey}
          onChange={(e) => setSelectedKey(e.target.value)}
          style={{ width: '100%' }}
        >
          <Space orientation="vertical" size={0} style={{ width: '100%' }}>
            {candidates.map((part) => {
              const key = candidateKey(part);
              const variantCount = getSkuVariantsForFigure(part.figureNumber ?? part.partNumber).length;
              return (
                <Flex
                  key={key}
                  align="flex-start"
                  gap={token.marginSM}
                  style={{
                    width: '100%',
                    padding: token.paddingSM,
                    borderBottom: `${token.lineWidth}px ${token.lineType} ${token.colorBorderSecondary}`,
                    background: selectedKey === key ? token.colorPrimaryBg : token.colorBgContainer,
                  }}
                >
                  <Radio value={key} style={{ marginTop: token.marginXXS }} />
                  <Flex vertical gap={token.marginXXS} style={{ flex: 1, minWidth: 0 }}>
                    <Typography.Text strong>{part.figureNumber ?? part.partNumber}</Typography.Text>
                    <Typography.Text style={hydraTextStyleToReactCss(hydraBaseNormal)}>
                      {part.description}
                    </Typography.Text>
                    <Typography.Text type="secondary" style={hydraTextStyleToReactCss(hydraBaseNormal)}>
                      {part.productFamily}
                      {variantCount > 0 ? ` · ${variantCount} SKU variant${variantCount === 1 ? '' : 's'}` : ''}
                      {part.matchConfidence > 0 ? ` · ${part.matchConfidence}% match` : ''}
                    </Typography.Text>
                  </Flex>
                </Flex>
              );
            })}
          </Space>
        </Radio.Group>
      </Space>
    </Modal>
  );
}
