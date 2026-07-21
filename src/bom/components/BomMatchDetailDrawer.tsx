import { FilePdfOutlined, PictureOutlined } from '@ant-design/icons';

import { getSkuVariantsForFigure } from '../data/ascSkuVariants';
import { matchScoreBand } from '../data/bomImportFlowSeed';
import {
  reviewDetailPrimaryLabel,
  reviewSecondaryCtaLabel,
} from '../bomMatchingReviewCtas';
import {
  figureLevelMatchExplanation,
  isReadyToConfirmMatch,
  matchRequiresSkuSelection,
  resolveFigureNumber,
} from '../bomMatchSkuUtils';
import { ascPartShowsCatalogLinks, demoProductUrlForFigure, demoSubmittalUrlForFigure } from '../bomWorkspaceDashboard';
import { BomAscFigureLink } from './BomAscFigureLink';
import { BomConfidenceTag, BomManualTag } from './BomTags';
import type { BomItem, BomMatchResult } from '../data/types';
import {
  hydraBaseNormal,
  hydraTextStyleToReactCss,
} from '../../theme/hydraTypography';
import {
  Alert,
  Button,
  Descriptions,
  Divider,
  Drawer,
  Flex,
  Space,
  Typography,
  theme,
} from '../../ui/antd';

type BomMatchDetailDrawerProps = {
  open: boolean;
  matchRow: BomMatchResult | null;
  parsedItem?: BomItem;
  bomProjectId?: string;
  onClose: () => void;
  onConfirm: () => void;
  onChoose: () => void;
  onSkip?: () => void;
  onPickVariant?: () => void;
};

export function BomMatchDetailDrawer({
  open,
  matchRow,
  parsedItem,
  bomProjectId,
  onClose,
  onConfirm,
  onChoose,
  onSkip,
  onPickVariant,
}: BomMatchDetailDrawerProps) {
  const { token } = theme.useToken();

  const top = matchRow?.topMatch;
  if (!matchRow || !top) return null;

  const figureRef = resolveFigureNumber(matchRow);
  const needsSku = matchRequiresSkuSelection(matchRow);
  const confirmReady = isReadyToConfirmMatch(matchRow);
  const conf = top.matchConfidence ?? 0;
  const scoreBand = matchScoreBand(conf);
  const showCatalogLinks = ascPartShowsCatalogLinks(top);
  const submittalUrl = showCatalogLinks ? demoSubmittalUrlForFigure(figureRef) : undefined;
  const productUrl = showCatalogLinks ? demoProductUrlForFigure(figureRef) : undefined;
  const selectedSku =
    matchRow.selectedVariantId && matchRow.matchLevel !== 'figure' ? top.partNumber : undefined;
  const secondaryLabel = reviewSecondaryCtaLabel(matchRow);
  const primaryLabel = reviewDetailPrimaryLabel(matchRow);

  function handleConfirm() {
    onConfirm();
    onClose();
  }

  function handleChoose() {
    onClose();
    onChoose();
  }

  return (
    <Drawer
      title="Verify this match"
      open={open}
      onClose={onClose}
      width={560}
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
        <Flex justify="space-between" align="center" wrap="wrap" gap={token.marginSM}>
          {onSkip ? (
            <Button type="link" size="large" onClick={() => { onClose(); onSkip(); }}>
              Skip for now
            </Button>
          ) : (
            <span />
          )}
          <Flex gap={token.marginXS} wrap="wrap" justify="flex-end">
            {secondaryLabel ? (
              <Button size="large" onClick={handleChoose}>
                {secondaryLabel}
              </Button>
            ) : null}
            {needsSku && onPickVariant ? (
              <Button type="primary" size="large" onClick={() => { onClose(); onPickVariant(); }}>
                {primaryLabel}
              </Button>
            ) : (
              <Button type="primary" size="large" disabled={!confirmReady} onClick={handleConfirm}>
                {primaryLabel}
              </Button>
            )}
          </Flex>
        </Flex>
      }
    >
      <Space
        orientation="vertical"
        size={token.marginMD}
        style={{ width: '100%', height: '100%', minHeight: 0 }}
      >
        {needsSku ? (
          <Alert
            type="info"
            showIcon
            message="Product family match"
            description={
              figureRef
                ? figureLevelMatchExplanation(figureRef, getSkuVariantsForFigure(figureRef).length)
                : 'Pick the exact SKU variant before you confirm this line.'
            }
          />
        ) : null}

        <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', paddingBottom: token.paddingMD }}>
          <Space orientation="vertical" size={token.marginMD} style={{ width: '100%' }}>
            <Flex
              align="center"
              justify="center"
              style={{
                width: '100%',
                height: 160,
                background: token.colorFillAlter,
                borderRadius: token.borderRadiusLG,
                border: `${token.lineWidth}px ${token.lineType} ${token.colorBorderSecondary}`,
                overflow: 'hidden',
              }}
            >
              {top.imageUrl ? (
                <img
                  src={top.imageUrl}
                  alt={top.description}
                  style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                />
              ) : (
                <PictureOutlined style={{ fontSize: token.fontSizeHeading1, color: token.colorTextQuaternary }} />
              )}
            </Flex>

            <Flex vertical gap={token.marginXXS}>
              {figureRef && bomProjectId ? (
                <BomAscFigureLink
                  bomProjectId={bomProjectId}
                  figureNumber={figureRef}
                  prefix="Figure "
                />
              ) : figureRef ? (
                <Typography.Text type="secondary" style={hydraTextStyleToReactCss(hydraBaseNormal)}>
                  Figure {figureRef}
                </Typography.Text>
              ) : null}
              <Typography.Title level={4} style={{ margin: 0 }}>
                {needsSku ? `${top.partNumber} (figure)` : top.partNumber}
              </Typography.Title>
              <Typography.Text style={hydraTextStyleToReactCss(hydraBaseNormal)}>
                {top.description}
              </Typography.Text>
            </Flex>

            <Flex align="center" gap={token.marginXS} wrap="wrap">
              <Typography.Text type="secondary" style={hydraTextStyleToReactCss(hydraBaseNormal)}>
                Match confidence:
              </Typography.Text>
              {matchRow.source === 'manual' ? (
                <BomManualTag />
              ) : scoreBand !== 'processing' ? (
                <BomConfidenceTag
                  confidence={scoreBand === 'high' ? 'high' : scoreBand === 'medium' ? 'medium' : 'low'}
                  percent={conf}
                  showIcon
                />
              ) : null}
            </Flex>

            <Descriptions bordered column={1} size="small">
              {top.productFamily ? (
                <Descriptions.Item label="Family">{top.productFamily}</Descriptions.Item>
              ) : null}
              {selectedSku ? <Descriptions.Item label="SKU / variant">{selectedSku}</Descriptions.Item> : null}
              {top.dimensions ? <Descriptions.Item label="Dimensions">{top.dimensions}</Descriptions.Item> : null}
              {top.pressureRating ? (
                <Descriptions.Item label="Pressure">{top.pressureRating}</Descriptions.Item>
              ) : null}
              {top.connectionType ? (
                <Descriptions.Item label="Connection">{top.connectionType}</Descriptions.Item>
              ) : null}
              {top.approvals.length > 0 ? (
                <Descriptions.Item label="Approvals">{top.approvals.join(' · ')}</Descriptions.Item>
              ) : null}
            </Descriptions>

            <Space orientation="vertical" size={token.marginXXS}>
              {productUrl ? (
                <Typography.Link href={productUrl} target="_blank" rel="noopener noreferrer">
                  View product page
                </Typography.Link>
              ) : null}
              {submittalUrl ? (
                <Typography.Link href={submittalUrl} target="_blank" rel="noopener noreferrer">
                  <FilePdfOutlined aria-hidden /> View submittal / datasheet
                </Typography.Link>
              ) : null}
            </Space>

            <Divider style={{ margin: 0 }} />

            <Flex vertical gap={token.marginXXS}>
              <Typography.Text
                type="secondary"
                style={{
                  ...hydraTextStyleToReactCss(hydraBaseNormal),
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                }}
              >
                Original imported part
              </Typography.Text>
              <Typography.Text strong>{matchRow.originalRequest}</Typography.Text>
              {parsedItem?.parsedDescription ? (
                <Typography.Text type="secondary" style={hydraTextStyleToReactCss(hydraBaseNormal)}>
                  {parsedItem.parsedDescription}
                </Typography.Text>
              ) : null}
              {parsedItem ? (
                <Typography.Text type="secondary" style={hydraTextStyleToReactCss(hydraBaseNormal)}>
                  Qty {parsedItem.quantity}
                  {parsedItem.manufacturer ? ` · ${parsedItem.manufacturer}` : ''}
                </Typography.Text>
              ) : null}
            </Flex>
          </Space>
        </div>
      </Space>
    </Drawer>
  );
}
