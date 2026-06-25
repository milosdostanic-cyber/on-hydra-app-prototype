import {
  CopyOutlined,
  FilePdfOutlined,
  LinkOutlined,
  PictureOutlined,
} from '@ant-design/icons';
import { useMemo, useState, type ReactNode } from 'react';

import { resolveImportedPartDisplayLabel } from '../bomMatchingReviewAlert';
import { buildMatchReviewSkuCards, matchRowMatchesSkuCard, type SkuMatchCardItem } from '../bomMatchSkuUtils';
import {
  demoCatalogImageForPart,
  demoDomesticImportForPart,
  demoProductUrlForFigure,
  demoSubmittalUrlForFigure,
  demoUpcForCatalogPart,
} from '../bomWorkspaceDashboard';
import type { BomItem, BomMatchResult } from '../data/types';
import { matchScoreBand } from '../data/bomImportFlowSeed';
import { BomConfidenceTag, BomManualTag } from './BomTags';
import { HydraTag } from '../../ui/HydraTag';
import {
  hydraBaseNormal,
  hydraLargeStrong,
  hydraTextStyleToReactCss,
  hydraTitleHeading5,
} from '../../theme/hydraTypography';
import { matchingReviewSelectableCardStyle } from './BomSkuVariantPicker';
import {
  Button,
  Col,
  Divider,
  Empty,
  Flex,
  Row,
  Select,
  Space,
  Typography,
  message,
  theme,
} from '../../ui/antd';

type BomMatchingReviewPartPanelProps = {
  matchRow: BomMatchResult;
  parsedItem?: BomItem;
  onSelectSku: (item: SkuMatchCardItem) => void;
};

type TypeFilter = 'all' | 'Domestic' | 'Import';

const COLUMN_LABEL_WIDTH = 104;

function copyToClipboard(value: string, label: string) {
  void navigator.clipboard?.writeText(value).then(
    () => message.success(`${label} copied`),
    () => message.info(value),
  );
}

function PanelColumnHeaderBlock({
  title,
  subtitle,
  detail,
  titleExtra,
  trailing,
}: {
  title: string;
  subtitle?: string;
  detail?: string;
  titleExtra?: ReactNode;
  trailing?: ReactNode;
}) {
  const { token } = theme.useToken();

  return (
    <div style={{ flexShrink: 0 }}>
      <Flex align="flex-start" justify="space-between" gap={token.marginSM} wrap="wrap">
        <Flex vertical gap={token.marginXXS} style={{ minWidth: 0 }}>
          <Flex align="center" gap={token.marginXS} wrap="wrap">
            <Typography.Text strong style={hydraTextStyleToReactCss(hydraLargeStrong)}>
              {title}
            </Typography.Text>
            {titleExtra}
          </Flex>
          {subtitle ? (
            <Typography.Text strong style={hydraTextStyleToReactCss(hydraBaseNormal)}>
              {subtitle}
            </Typography.Text>
          ) : null}
          {detail ? (
            <Typography.Text type="secondary" style={hydraTextStyleToReactCss(hydraBaseNormal)}>
              {detail}
            </Typography.Text>
          ) : null}
        </Flex>
        {trailing ? <div style={{ flexShrink: 0 }}>{trailing}</div> : null}
      </Flex>
      <Divider style={{ marginBlock: token.marginSM }} />
    </div>
  );
}

function DetailRow({
  label,
  value,
  copyable,
  children,
}: {
  label: string;
  value?: string;
  copyable?: boolean;
  children?: ReactNode;
}) {
  const { token } = theme.useToken();

  return (
    <Flex align="flex-start" justify="space-between" gap={token.marginSM} style={{ width: '100%' }}>
      <Typography.Text
        type="secondary"
        style={{
          ...hydraTextStyleToReactCss(hydraBaseNormal),
          flex: `0 0 ${COLUMN_LABEL_WIDTH}px`,
        }}
      >
        {label}:
      </Typography.Text>
      <Flex
        align="center"
        justify="flex-end"
        gap={token.marginXXS}
        wrap="wrap"
        style={{ flex: 1, minWidth: 0, textAlign: 'right' }}
      >
        {children ?? (
          <Typography.Text style={{ ...hydraTextStyleToReactCss(hydraBaseNormal), wordBreak: 'break-word' }}>
            {value?.trim() || '—'}
          </Typography.Text>
        )}
        {copyable && value?.trim() ? (
          <Button
            type="text"
            size="small"
            aria-label={`Copy ${label}`}
            icon={<CopyOutlined />}
            onClick={() => copyToClipboard(value.trim(), label)}
            style={{ flexShrink: 0, color: token.colorTextSecondary }}
          />
        ) : null}
      </Flex>
    </Flex>
  );
}

function SkuMetaInline({ label, value }: { label: string; value?: string }) {
  const display = value?.trim() || '—';

  return (
    <Typography.Text
      ellipsis={{ tooltip: `${label}: ${display}` }}
      style={{ ...hydraTextStyleToReactCss(hydraBaseNormal), flexShrink: 0 }}
    >
      <Typography.Text type="secondary" style={hydraTextStyleToReactCss(hydraBaseNormal)}>
        {label}:{' '}
      </Typography.Text>
      {display}
    </Typography.Text>
  );
}

function SkuMatchCard({
  item,
  selected,
  onSelect,
}: {
  item: SkuMatchCardItem;
  selected: boolean;
  onSelect: () => void;
}) {
  const { token } = theme.useToken();
  const { catalogPart: part, parentPart } = item;
  const figureRef = part.figureNumber ?? parentPart.figureNumber ?? parentPart.partNumber;
  const domesticImport = demoDomesticImportForPart(part) ?? 'Import';
  const productUrl = demoProductUrlForFigure(figureRef);
  const submittalUrl = demoSubmittalUrlForFigure(figureRef);
  const imageUrl = demoCatalogImageForPart(part);
  const upc = demoUpcForCatalogPart(part);
  const thumbnailSize = token.controlHeightLG + token.paddingLG;
  const matchConfidence = item.parentPart.matchConfidence;
  const scoreBand = matchScoreBand(matchConfidence);

  return (
    <button
      type="button"
      onClick={onSelect}
      style={{
        ...matchingReviewSelectableCardStyle(token, selected),
        width: '100%',
        minWidth: 0,
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: token.paddingMD,
        boxShadow: selected ? 'none' : token.boxShadowTertiary,
      }}
    >
      <Flex
        align="center"
        justify="center"
        style={{
          width: thumbnailSize,
          height: thumbnailSize,
          flexShrink: 0,
          background: token.colorFillAlter,
          borderRadius: token.borderRadiusLG,
          border: `${token.lineWidth}px ${token.lineType} ${token.colorBorderSecondary}`,
          overflow: 'hidden',
        }}
      >
        {imageUrl ? (
          <img
            src={imageUrl}
            alt=""
            style={{ width: '100%', height: '100%', objectFit: 'contain', padding: token.paddingXXS }}
          />
        ) : (
          <PictureOutlined style={{ color: token.colorTextQuaternary, fontSize: token.fontSizeHeading5 }} />
        )}
      </Flex>

      <Flex vertical gap={token.marginSM} style={{ flex: 1, minWidth: 0 }}>
        <Flex align="center" justify="space-between" gap={token.marginXS} wrap="wrap">
          <Flex align="center" gap={token.marginXXS} style={{ minWidth: 0 }}>
            <Typography.Text
              ellipsis={{ tooltip: part.partNumber }}
              style={{
                ...hydraTextStyleToReactCss(hydraTitleHeading5),
                color: token.colorText,
              }}
            >
              {part.partNumber}
            </Typography.Text>
            <Button
              type="text"
              size="small"
              aria-label="Copy SKU"
              icon={<CopyOutlined />}
              onClick={(e) => {
                e.stopPropagation();
                copyToClipboard(part.partNumber, 'SKU');
              }}
              style={{ color: token.colorTextDescription, margin: 0, padding: token.paddingXXS, height: 'auto', flexShrink: 0 }}
            />
          </Flex>
          <Flex align="center" gap={token.marginXS} wrap="wrap" justify="flex-end" style={{ flexShrink: 0 }}>
            {scoreBand !== 'processing' && matchConfidence > 0 ? (
              <BomConfidenceTag
                confidence={scoreBand === 'high' ? 'high' : scoreBand === 'medium' ? 'medium' : 'low'}
                percent={matchConfidence}
                bandWithPercent
                size="base"
              />
            ) : null}
            <HydraTag tone={domesticImport === 'Domestic' ? 'processing' : 'default'}>
              {domesticImport}
            </HydraTag>
            <HydraTag tone="success">Exact Product</HydraTag>
          </Flex>
        </Flex>

        <Flex vertical gap={token.marginXS} style={{ width: '100%' }}>
          <Typography.Text
            ellipsis={{ tooltip: part.description }}
            style={{
              ...hydraTextStyleToReactCss(hydraBaseNormal),
              color: token.colorText,
              display: 'block',
            }}
          >
            {part.description}
          </Typography.Text>

          <Flex align="center" gap={token.paddingLG} wrap="wrap" style={{ width: '100%' }}>
            <SkuMetaInline label="Fig" value={figureRef} />
            <SkuMetaInline label="Brand" value={part.productFamily} />
            <SkuMetaInline label="UPC" value={upc} />
          </Flex>

          <Flex align="center" gap={token.marginSM} wrap="wrap">
            {productUrl ? (
              <Typography.Link
                href={productUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                style={{ ...hydraTextStyleToReactCss(hydraBaseNormal), color: token.colorPrimaryText }}
              >
                <LinkOutlined aria-hidden /> View Product
              </Typography.Link>
            ) : null}
            <Typography.Link
              href={submittalUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              style={{ ...hydraTextStyleToReactCss(hydraBaseNormal), color: token.colorPrimaryText }}
            >
              <FilePdfOutlined aria-hidden /> View PDF
            </Typography.Link>
          </Flex>
        </Flex>
      </Flex>
    </button>
  );
}

function PanelColumnShell({
  children,
  background,
  width,
  flex,
  emphasized,
  shellPadding,
}: {
  children: ReactNode;
  background: string;
  width?: string;
  flex?: string;
  emphasized?: boolean;
  /** Override default panel inset; defaults to theme `paddingMD`. */
  shellPadding?: number;
}) {
  const { token } = theme.useToken();

  return (
    <div
      style={{
        flex: flex ?? '1 1 0',
        width,
        minWidth: 0,
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column',
        padding: shellPadding ?? token.paddingMD,
        borderRadius: token.borderRadiusLG,
        border: `${token.lineWidth}px ${token.lineType} ${token.colorBorderSecondary}`,
        borderLeft: emphasized
          ? `${token.lineWidth * 3}px solid ${token.colorPrimaryBorder}`
          : `${token.lineWidth}px ${token.lineType} ${token.colorBorderSecondary}`,
        background,
      }}
    >
      {children}
    </div>
  );
}

function SkuCardGrid({
  items,
  isSkuSelected,
  onSelectSku,
}: {
  items: SkuMatchCardItem[];
  isSkuSelected: (item: SkuMatchCardItem) => boolean;
  onSelectSku: (item: SkuMatchCardItem) => void;
}) {
  const { token } = theme.useToken();

  return (
    <Row gutter={[token.marginMD, token.marginMD]} style={{ width: '100%' }}>
      {items.map((item) => (
        <Col key={item.key} span={12} style={{ display: 'flex', minWidth: 0 }}>
          <SkuMatchCard
            item={item}
            selected={isSkuSelected(item)}
            onSelect={() => onSelectSku(item)}
          />
        </Col>
      ))}
    </Row>
  );
}

export function BomMatchingReviewPartPanel({
  matchRow,
  parsedItem,
  onSelectSku,
}: BomMatchingReviewPartPanelProps) {
  const { token } = theme.useToken();
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');

  const skuCards = useMemo(() => buildMatchReviewSkuCards(matchRow), [matchRow]);

  const filteredSkuCards = useMemo(() => {
    if (typeFilter === 'all') return skuCards;
    return skuCards.filter((item) => demoDomesticImportForPart(item.catalogPart) === typeFilter);
  }, [skuCards, typeFilter]);

  const hasMixedTypes = useMemo(() => {
    const types = new Set(
      skuCards.map((item) => demoDomesticImportForPart(item.catalogPart)).filter(Boolean),
    );
    return types.size > 1;
  }, [skuCards]);

  function isSkuSelected(item: SkuMatchCardItem): boolean {
    return matchRowMatchesSkuCard(matchRow, item);
  }

  const description = resolveImportedPartDisplayLabel(matchRow, parsedItem);
  const material =
    parsedItem?.connectionType?.trim() ||
    parsedItem?.category?.trim() ||
    parsedItem?.pressureClass?.trim();

  return (
    <Flex
      gap={token.marginMD}
      align="stretch"
      style={{ flex: 1, minHeight: 0, minWidth: 0, width: '100%', overflow: 'hidden' }}
    >
      <PanelColumnShell background={token.colorFillAlter} width="280px" flex="0 0 280px" emphasized>
        <PanelColumnHeaderBlock
          title="YOUR PART"
          subtitle="Imported line from your file"
        />
        <Space orientation="vertical" size={token.marginXXS} style={{ width: '100%' }}>
          <DetailRow label="Description" value={description} />
          <DetailRow label="Brand" value={parsedItem?.manufacturer} />
          <DetailRow label="SKU" value={parsedItem?.sku} copyable />
          <DetailRow label="Figure number" value={parsedItem?.figureNumber} />
          <DetailRow label="Size" value={parsedItem?.size} />
          <DetailRow label="Material" value={material} />
          {parsedItem ? <DetailRow label="Quantity" value={String(parsedItem.quantity)} /> : null}
        </Space>
      </PanelColumnShell>

      <PanelColumnShell background={token.colorBgContainer} flex="1 1 0" shellPadding={0}>
        {skuCards.length > 0 ? (
          <>
            <div style={{ padding: `${token.paddingMD}px ${token.paddingLG}px 0` }}>
              <PanelColumnHeaderBlock
                title={`HOW WE MATCHED IT (${skuCards.length})`}
                subtitle={
                  skuCards.length > 1
                    ? `${filteredSkuCards.length} of ${skuCards.length} options — best match pre-selected`
                    : 'Best match pre-selected'
                }
                titleExtra={matchRow.source === 'manual' && matchRow.topMatch ? <BomManualTag /> : undefined}
                trailing={
                  hasMixedTypes ? (
                    <Select<TypeFilter>
                      value={typeFilter}
                      onChange={setTypeFilter}
                      style={{ minWidth: 128 }}
                      options={[
                        { value: 'all', label: 'All types' },
                        { value: 'Domestic', label: 'Domestic' },
                        { value: 'Import', label: 'Import' },
                      ]}
                    />
                  ) : undefined
                }
              />
            </div>

            <div
              style={{
                flex: 1,
                minHeight: 0,
                overflowY: 'auto',
                overflowX: 'hidden',
                width: '100%',
                padding: token.paddingLG,
              }}
            >
              {filteredSkuCards.length === 0 ? (
                <Typography.Text type="secondary" style={hydraTextStyleToReactCss(hydraBaseNormal)}>
                  No SKU options for this filter. Try &ldquo;All types&rdquo;.
                </Typography.Text>
              ) : (
                <SkuCardGrid
                  items={filteredSkuCards}
                  isSkuSelected={isSkuSelected}
                  onSelectSku={onSelectSku}
                />
              )}
            </div>
          </>
        ) : (
          <div style={{ padding: token.paddingLG, display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
            <PanelColumnHeaderBlock title="HOW WE MATCHED IT" subtitle="No catalog options" />
            <Flex vertical align="center" justify="center" style={{ flex: 1, paddingBlock: token.paddingLG }}>
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={
                  <Space orientation="vertical" size={token.marginXS} style={{ maxWidth: 420 }}>
                    <Typography.Text style={hydraTextStyleToReactCss(hydraBaseNormal)}>
                      No catalog options for this line.
                    </Typography.Text>
                    <Typography.Text type="secondary" style={hydraTextStyleToReactCss(hydraBaseNormal)}>
                      Choose a part from the catalog, search unknown parts, or skip for now — use the
                      buttons at the top of this page.
                    </Typography.Text>
                  </Space>
                }
              />
            </Flex>
          </div>
        )}
      </PanelColumnShell>
    </Flex>
  );
}
