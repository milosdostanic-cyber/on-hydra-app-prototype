import { FilePdfOutlined, PictureOutlined } from '@ant-design/icons';

import { matchScoreBand } from '../data/bomImportFlowSeed';
import {
  isReadyToConfirmMatch,
  matchRequiresSkuSelection,
  resolveFigureNumber,
} from '../bomMatchSkuUtils';
import { demoSubmittalUrlForFigure } from '../bomWorkspaceDashboard';
import { BomConfidenceTag, BomManualTag } from './BomTags';
import type { BomItem, BomMatchResult } from '../data/types';
import {
  hydraBaseNormal,
  hydraSmallNormal,
  hydraTextStyleToReactCss,
} from '../../theme/hydraTypography';
import {
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
  onClose: () => void;
  onConfirm: () => void;
  onChoose: () => void;
};

export function BomMatchDetailDrawer({
  open,
  matchRow,
  parsedItem,
  onClose,
  onConfirm,
  onChoose,
}: BomMatchDetailDrawerProps) {
  const { token } = theme.useToken();

  const top = matchRow?.topMatch;
  if (!matchRow || !top) return null;

  const figureRef = resolveFigureNumber(matchRow);
  const needsSku = matchRequiresSkuSelection(matchRow);
  const confirmReady = isReadyToConfirmMatch(matchRow);
  const conf = top.matchConfidence ?? 0;
  const scoreBand = matchScoreBand(conf);
  const submittalUrl = demoSubmittalUrlForFigure(figureRef);
  const selectedSku =
    matchRow.selectedVariantId && matchRow.matchLevel !== 'figure' ? top.partNumber : undefined;

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
      title="Match details"
      open={open}
      onClose={onClose}
      width={560}
      destroyOnClose
      footer={
        <Flex vertical gap={token.marginXS}>
          {needsSku ? (
            <Typography.Text type="warning" style={hydraTextStyleToReactCss(hydraSmallNormal)}>
              Select a SKU variant in the review screen before confirming.
            </Typography.Text>
          ) : null}
          <Flex justify="flex-end" gap={token.marginSM}>
            <Button size="large" onClick={handleChoose}>
              Choose different part
            </Button>
            <Button type="primary" size="large" disabled={!confirmReady} onClick={handleConfirm}>
              Confirm match
            </Button>
          </Flex>
        </Flex>
      }
    >
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
          {figureRef ? (
            <Typography.Text type="secondary" style={hydraTextStyleToReactCss(hydraSmallNormal)}>
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
          <Typography.Text type="secondary" style={hydraTextStyleToReactCss(hydraSmallNormal)}>
            Match confidence:
          </Typography.Text>
          {matchRow.source === 'manual' ? (
            <BomManualTag />
          ) : scoreBand !== 'processing' ? (
            <BomConfidenceTag
              confidence={scoreBand === 'high' ? 'high' : scoreBand === 'medium' ? 'medium' : 'low'}
              showIcon
            />
          ) : null}
          {matchRow.source !== 'manual' && conf > 0 ? (
            <Typography.Text type="secondary" style={hydraTextStyleToReactCss(hydraSmallNormal)}>
              Score {conf}%
            </Typography.Text>
          ) : null}
        </Flex>

        <Descriptions bordered size="small" column={1}>
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

        <Typography.Link href={submittalUrl} target="_blank" rel="noopener noreferrer">
          <FilePdfOutlined aria-hidden /> View submittal / datasheet
        </Typography.Link>

        <Divider style={{ margin: 0 }} />

        <Flex vertical gap={token.marginXXS}>
          <Typography.Text
            type="secondary"
            style={{
              ...hydraTextStyleToReactCss(hydraSmallNormal),
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
            <Typography.Text type="secondary" style={hydraTextStyleToReactCss(hydraSmallNormal)}>
              Qty {parsedItem.quantity}
              {parsedItem.manufacturer ? ` · ${parsedItem.manufacturer}` : ''}
            </Typography.Text>
          ) : null}
        </Flex>
      </Space>
    </Drawer>
  );
}
