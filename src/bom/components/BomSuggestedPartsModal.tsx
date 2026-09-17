import { PictureOutlined } from '@ant-design/icons';
import { useEffect, useMemo, useState } from 'react';

import { getSkuVariantsForFigure } from '../data/ascSkuVariants';
import type { AscCatalogPart, BomMatchResult } from '../data/types';
import { BomConfidenceTag } from './BomTags';
import { matchScoreBand } from '../data/bomImportFlowSeed';
import {
  hydraBaseNormal,
  hydraBaseStrong,
  hydraSubtitleLarge,
  hydraTextStyleToReactCss,
} from '../../theme/hydraTypography';
import { Button, Card, Col, Flex, Modal, Row, Space, Typography, theme } from '../../ui/antd';

type BomSuggestedPartsModalProps = {
  open: boolean;
  matchRow: BomMatchResult | null;
  onClose: () => void;
  onSelectCandidate: (part: AscCatalogPart) => void;
};

function candidateKey(part: AscCatalogPart): string {
  return part.figureNumber ?? part.partNumber;
}

function MatchCandidateCard({
  part,
  selected,
  onSelect,
}: {
  part: AscCatalogPart;
  selected: boolean;
  onSelect: () => void;
}) {
  const { token } = theme.useToken();
  const figureRef = part.figureNumber ?? part.partNumber;
  const variantCount = getSkuVariantsForFigure(figureRef).length;
  const scoreBand = matchScoreBand(part.matchConfidence);

  return (
    <Card
      hoverable
      size="small"
      onClick={onSelect}
      styles={{ body: { padding: token.paddingSM } }}
      style={{
        borderColor: selected ? token.colorPrimary : token.colorBorderSecondary,
        background: selected ? token.colorPrimaryBgSubtle : token.colorBgContainer,
        boxShadow: selected ? token.boxShadowSecondary : token.boxShadowTertiary,
        cursor: 'pointer',
        height: '100%',
      }}
    >
      <Flex gap={token.marginSM} align="flex-start">
        <Flex
          align="center"
          justify="center"
          style={{
            width: 56,
            height: 56,
            flexShrink: 0,
            borderRadius: token.borderRadius,
            background: token.colorFillAlter,
            border: `${token.lineWidth}px ${token.lineType} ${token.colorBorderSecondary}`,
          }}
        >
          {part.imageUrl ? (
            <img
              src={part.imageUrl}
              alt=""
              style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
            />
          ) : (
            <PictureOutlined style={{ color: token.colorTextQuaternary, fontSize: token.fontSizeHeading4 }} />
          )}
        </Flex>
        <Flex vertical gap={token.marginXXS} style={{ flex: 1, minWidth: 0 }}>
          <Typography.Text type="secondary" style={hydraTextStyleToReactCss(hydraBaseNormal)}>
            Fig. {figureRef}
          </Typography.Text>
          <Typography.Text style={hydraTextStyleToReactCss(hydraSubtitleLarge)}>
            {part.partNumber}
          </Typography.Text>
          <Typography.Text
            ellipsis={{ tooltip: part.description }}
            style={hydraTextStyleToReactCss(hydraBaseNormal)}
          >
            {part.description}
          </Typography.Text>
          <Flex align="center" gap={token.marginXS} wrap="wrap">
            <Typography.Text type="secondary" style={hydraTextStyleToReactCss(hydraBaseNormal)}>
              {part.productFamily}
              {variantCount > 0 ? ` · ${variantCount} SKU variant${variantCount === 1 ? '' : 's'}` : ''}
            </Typography.Text>
            {scoreBand !== 'processing' && part.matchConfidence > 0 ? (
              <BomConfidenceTag
                confidence={scoreBand === 'high' ? 'high' : scoreBand === 'medium' ? 'medium' : 'low'}
                percent={part.matchConfidence}
              />
            ) : null}
          </Flex>
        </Flex>
      </Flex>
    </Card>
  );
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

  const selectedPart = useMemo(
    () => candidates.find((c) => candidateKey(c) === selectedKey),
    [candidates, selectedKey],
  );

  useEffect(() => {
    if (open && matchRow?.topMatch) {
      setSelectedKey(candidateKey(matchRow.topMatch));
    }
  }, [open, matchRow?.topMatch, matchRow?.itemId]);

  if (!matchRow || candidates.length <= 1) return null;

  function handleClose() {
    setSelectedKey(undefined);
    onClose();
  }

  function handleApply() {
    if (!selectedPart) return;
    onSelectCandidate(selectedPart);
    handleClose();
  }

  return (
    <Modal
      title={`Compare ${candidates.length} possible matches`}
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
            {selectedPart ? (
              <Typography.Text type="secondary" style={hydraTextStyleToReactCss(hydraBaseNormal)}>
                Selected: <Typography.Text style={hydraTextStyleToReactCss(hydraBaseStrong)}>{selectedPart.figureNumber ?? selectedPart.partNumber}</Typography.Text>
                {' — '}
                {selectedPart.description}
              </Typography.Text>
            ) : (
              <Typography.Text type="secondary" style={hydraTextStyleToReactCss(hydraBaseNormal)}>
                Pick the figure that best fits this line.
              </Typography.Text>
            )}
            <Button type="primary" size="large" disabled={!selectedPart} onClick={handleApply}>
              Select match
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
            Multiple figure matches — pick the best fit
          </Typography.Text>
          <Typography.Text style={hydraTextStyleToReactCss(hydraSubtitleLarge)}>
            {matchRow.originalRequest}
          </Typography.Text>
        </Flex>

        <Row gutter={[token.marginSM, token.marginSM]}>
          {candidates.map((part) => {
            const key = candidateKey(part);
            return (
              <Col key={key} xs={24} sm={12}>
                <MatchCandidateCard
                  part={part}
                  selected={selectedKey === key}
                  onSelect={() => setSelectedKey(key)}
                />
              </Col>
            );
          })}
        </Row>
      </Space>
    </Modal>
  );
}
