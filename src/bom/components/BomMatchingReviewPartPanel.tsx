import {
  CopyOutlined,
  ExportOutlined,
  FilePdfOutlined,
  PictureOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import { useMemo, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

import { resolveImportedPartDisplayLabel } from '../bomMatchingReviewAlert';
import { matchScoreBand } from '../data/bomImportFlowSeed';
import { matchRequiresSkuSelection, resolveFigureNumber } from '../bomMatchSkuUtils';
import { getSkuVariantsForFigure } from '../data/ascSkuVariants';
import {
  demoCatalogImageForPart,
  demoDomesticImportForPart,
  demoProductUrlForFigure,
  demoSubmittalUrlForFigure,
} from '../bomWorkspaceDashboard';
import type { AscCatalogPart, BomItem, BomMatchResult } from '../data/types';
import { BomConfidenceTag, BomManualTag, BomMatchLevelTag } from './BomTags';
import { BomSkuVariantPicker, matchingReviewSelectableCardStyle } from './BomSkuVariantPicker';
import { HydraTag } from '../../ui/HydraTag';
import {
  hydraBaseNormal,
  hydraBaseStrong,
  hydraLargeStrong,
  hydraTextStyleToReactCss,
} from '../../theme/hydraTypography';
import {
  Button,
  Divider,
  Empty,
  Flex,
  Select,
  Space,
  Typography,
  message,
  theme,
} from '../../ui/antd';

type BomMatchingReviewPartPanelProps = {
  matchRow: BomMatchResult;
  parsedItem?: BomItem;
  onSelectCandidate: (part: AscCatalogPart) => void;
  onSelectVariant: (variantId: string) => void;
  onChoosePart?: () => void;
};

type TypeFilter = 'all' | 'Domestic' | 'Import';

const COLUMN_LABEL_WIDTH = 104;

function candidateKey(part: AscCatalogPart): string {
  return part.figureNumber ?? part.partNumber;
}

function copyToClipboard(value: string, label: string) {
  void navigator.clipboard?.writeText(value).then(
    () => message.success(`${label} copied`),
    () => message.info(value),
  );
}

function PanelColumnHeaderBlock({
  title,
  subtitle,
  titleExtra,
  trailing,
}: {
  title: string;
  subtitle?: string;
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
            <Typography.Text type="secondary" style={hydraTextStyleToReactCss(hydraBaseNormal)}>
              {subtitle}
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

function InlineMeta({ label, value }: { label: string; value?: string }) {
  const { token } = theme.useToken();
  const display = value?.trim();
  if (!display) return null;

  return (
    <Typography.Text style={hydraTextStyleToReactCss(hydraBaseNormal)}>
      <Typography.Text type="secondary" style={hydraTextStyleToReactCss(hydraBaseNormal)}>
        {label}:{' '}
      </Typography.Text>
      <Typography.Text style={{ ...hydraTextStyleToReactCss(hydraBaseNormal), color: token.colorText }}>
        {display}
      </Typography.Text>
    </Typography.Text>
  );
}

function AscEquivalentCard({
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
  const domesticImport = demoDomesticImportForPart(part);
  const scoreBand = matchScoreBand(part.matchConfidence);
  const productUrl = demoProductUrlForFigure(figureRef);
  const submittalUrl = demoSubmittalUrlForFigure(figureRef);
  const imageUrl = demoCatalogImageForPart(part);
  const matchLevel = part.matchLevel === 'figure' ? 'figure' : 'sku';
  const thumbSize = token.controlHeightLG + token.sizeLG + token.marginXS;

  return (
    <button
      type="button"
      onClick={onSelect}
      style={matchingReviewSelectableCardStyle(token, selected)}
    >
      <Flex gap={token.marginMD} align="flex-start">
        <Flex
          align="center"
          justify="center"
          style={{
            width: thumbSize,
            height: thumbSize,
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
              style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
            />
          ) : (
            <PictureOutlined style={{ color: token.colorTextQuaternary, fontSize: token.fontSizeHeading4 }} />
          )}
        </Flex>

        <Flex vertical gap={token.marginXS} style={{ flex: 1, minWidth: 0, paddingBlock: token.paddingXXS }}>
          <Flex align="center" justify="space-between" gap={token.marginSM}>
            <Typography.Text
              style={{
                ...hydraTextStyleToReactCss(hydraBaseStrong),
                color: token.colorTextHeading,
                flex: 1,
                minWidth: 0,
                wordBreak: 'break-word',
              }}
            >
              {part.description}
            </Typography.Text>
            <Flex align="center" gap={token.marginXS} wrap="wrap" justify="flex-end" style={{ flexShrink: 0 }}>
              {domesticImport ? (
                <HydraTag tone={domesticImport === 'Domestic' ? 'processing' : 'default'}>
                  {domesticImport}
                </HydraTag>
              ) : null}
              {scoreBand !== 'processing' && part.matchConfidence > 0 ? (
                <BomConfidenceTag
                  confidence={scoreBand === 'high' ? 'high' : scoreBand === 'medium' ? 'medium' : 'low'}
                  percent={part.matchConfidence}
                />
              ) : null}
              <BomMatchLevelTag level={matchLevel} />
            </Flex>
          </Flex>

          <Flex align="center" gap={token.marginMD} wrap="wrap" style={{ marginTop: token.marginXXS }}>
            <InlineMeta label="Brand" value={part.productFamily} />
            {part.partNumber ? (
              <Flex align="center" gap={token.marginXXS}>
                <InlineMeta label="SKU" value={part.partNumber} />
                <Button
                  type="text"
                  size="small"
                  aria-label="Copy SKU"
                  icon={<CopyOutlined />}
                  onClick={(e) => {
                    e.stopPropagation();
                    copyToClipboard(part.partNumber, 'SKU');
                  }}
                  style={{ color: token.colorTextDescription, margin: 0, padding: 0, height: 'auto' }}
                />
              </Flex>
            ) : null}
            <InlineMeta label="Size" value={part.dimensions} />
          </Flex>

          <Flex
            align="center"
            gap={token.marginMD}
            wrap="wrap"
            style={{ marginTop: token.marginXXS, paddingTop: token.paddingXXS }}
          >
            {productUrl ? (
              <Typography.Link
                href={productUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                style={{
                  ...hydraTextStyleToReactCss(hydraBaseNormal),
                  color: token.colorLink,
                }}
              >
                View product <ExportOutlined aria-hidden />
              </Typography.Link>
            ) : null}
            <Typography.Link
              href={submittalUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              style={{
                ...hydraTextStyleToReactCss(hydraBaseNormal),
                color: token.colorLink,
              }}
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
}: {
  children: ReactNode;
  background: string;
  width?: string;
  flex?: string;
  emphasized?: boolean;
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
        padding: token.paddingMD,
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

export function BomMatchingReviewPartPanel({
  matchRow,
  parsedItem,
  onSelectCandidate,
  onSelectVariant,
  onChoosePart,
}: BomMatchingReviewPartPanelProps) {
  const { token } = theme.useToken();
  const navigate = useNavigate();
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');

  const candidates = useMemo(
    () => matchRow.suggestedParts.filter(Boolean),
    [matchRow.suggestedParts],
  );
  const selectedKey = matchRow.topMatch ? candidateKey(matchRow.topMatch) : undefined;
  const needsSku = matchRequiresSkuSelection(matchRow);
  const figureRef = resolveFigureNumber(matchRow);
  const skuVariantCount = figureRef ? getSkuVariantsForFigure(figureRef).length : 0;
  const showSkuPanel = needsSku && Boolean(figureRef) && skuVariantCount > 0;

  const filteredCandidates = useMemo(() => {
    if (typeFilter === 'all') return candidates;
    return candidates.filter((part) => demoDomesticImportForPart(part) === typeFilter);
  }, [candidates, typeFilter]);

  const hasMixedTypes = useMemo(() => {
    const types = new Set(candidates.map((part) => demoDomesticImportForPart(part)).filter(Boolean));
    return types.size > 1;
  }, [candidates]);

  const description = resolveImportedPartDisplayLabel(matchRow, parsedItem);
  const material =
    parsedItem?.connectionType?.trim() ||
    parsedItem?.category?.trim() ||
    parsedItem?.pressureClass?.trim();

  return (
    <Flex gap={token.marginMD} align="stretch" style={{ flex: 1, minHeight: 0, height: '100%' }}>
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

      <PanelColumnShell background={token.colorBgContainer} flex={showSkuPanel ? '1 1 320px' : '1 1 0'}>
        {candidates.length > 0 ? (
          <>
            <PanelColumnHeaderBlock
              title={`HOW WE MATCHED IT (${candidates.length})`}
              subtitle={
                candidates.length > 1
                  ? `Showing ${filteredCandidates.length} of ${candidates.length} matches`
                  : 'Best match from the ASC catalog'
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

            <div
              style={{
                flex: 1,
                minHeight: 0,
                overflowY: 'auto',
                paddingRight: token.paddingXXS,
              }}
            >
              <Space orientation="vertical" size={token.marginSM} style={{ width: '100%' }}>
                {filteredCandidates.map((part) => {
                  const key = candidateKey(part);
                  return (
                    <AscEquivalentCard
                      key={key}
                      part={part}
                      selected={selectedKey === key}
                      onSelect={() => onSelectCandidate(part)}
                    />
                  );
                })}
                {filteredCandidates.length === 0 ? (
                  <Typography.Text type="secondary" style={hydraTextStyleToReactCss(hydraBaseNormal)}>
                    No matches for this filter. Try &ldquo;All types&rdquo;.
                  </Typography.Text>
                ) : null}
              </Space>
            </div>
          </>
        ) : (
          <>
            <PanelColumnHeaderBlock
              title="HOW WE MATCHED IT"
              subtitle="No catalog matches for this line"
            />
            <Flex vertical align="center" justify="center" style={{ flex: 1, minHeight: 80 }}>
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="No match found for this part"
                style={{ padding: `${token.paddingMD}px 0` }}
              >
                <Space>
                  {onChoosePart ? (
                    <Button icon={<SearchOutlined />} onClick={onChoosePart}>
                      Browse ASC parts
                    </Button>
                  ) : null}
                  <Button type="link" onClick={() => navigate('/bom/search')}>
                    Search manually
                  </Button>
                </Space>
              </Empty>
            </Flex>
          </>
        )}
      </PanelColumnShell>

      {showSkuPanel && figureRef ? (
        <PanelColumnShell background={token.colorFillAlter} width="300px" flex="0 0 300px">
          <PanelColumnHeaderBlock
            title="Select SKU"
            subtitle={`Figure ${figureRef} · ${skuVariantCount} option${skuVariantCount === 1 ? '' : 's'}`}
          />
          <div
            style={{
              flex: 1,
              minHeight: 0,
              overflowY: 'auto',
              paddingRight: token.paddingXXS,
            }}
          >
            <BomSkuVariantPicker
              figureNumber={figureRef}
              figureDescription={matchRow.topMatch?.description}
              selectedVariantId={matchRow.selectedVariantId}
              onChange={onSelectVariant}
              layout="stack"
            />
          </div>
        </PanelColumnShell>
      ) : null}
    </Flex>
  );
}
