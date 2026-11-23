import { CopyOutlined, ExportOutlined, FilePdfOutlined } from '@ant-design/icons';
import { useState } from 'react';

import { FigureMatchTag, MatchTypeTag, OriginTag, PartPhoto } from './PartCrossReferenceCard';
import {
  listPrototypeVariantsForFigure,
  rsfcSkuPhoto,
  rsfcSubmittal,
  type CrossReferenceFigure,
  type CrossReferenceResult,
  type RsfcEquivalent,
  type RsfcOrigin,
} from '../data/partCrossReferenceData';
import { sizeLabel } from '../data/pimDisplayMapping';
import { hydraLargeMedium, hydraTextStyleToReactCss } from '../../theme/hydraTypography';
import { Alert, Button, Card, Flex, Grid, Modal, Select, Typography, message, theme } from '../../ui/antd';

const ORIGINS = [
  { label: 'All origins', value: 'all' },
  { label: 'Domestic', value: 'Domestic' },
  { label: 'Import', value: 'Import' },
] satisfies Array<{ label: string; value: RsfcOrigin | 'all' }>;

function CopySku({ sku, compact = false }: { sku: string; compact?: boolean }) {
  const { token } = theme.useToken();
  async function copy() {
    try {
      await navigator.clipboard.writeText(sku);
      message.success(`SKU ${sku} copied`);
    } catch {
      message.error('Could not copy the SKU. Select it and copy it by hand.');
    }
  }

  return (
    <Flex align="center" gap={token.marginXS} wrap="wrap">
      <Typography.Text strong={!compact}>{`SKU ${sku}`}</Typography.Text>
      <Button
        type={compact ? 'text' : 'default'}
        size="small"
        icon={<CopyOutlined aria-hidden />}
        aria-label={`Copy SKU ${sku}`}
        onClick={copy}
      >
        {!compact && 'Copy SKU'}
      </Button>
    </Flex>
  );
}

function EquivalentCard({ part, variants }: { part: RsfcEquivalent | CrossReferenceFigure; variants?: RsfcEquivalent[] }) {
  const { token } = theme.useToken();
  const skuPart = 'sku' in part ? part : undefined;
  const description = 'name' in part ? part.name : part.description;
  const photo = 'sku' in part ? rsfcSkuPhoto(part.sku) : part.photo;
  const submittal = rsfcSubmittal(part);
  const productUrl = skuPart?.productUrl;

  return (
    <Card size="small" variant="outlined">
      <Flex vertical gap={token.marginSM}>
        <Flex gap={token.marginSM} wrap="wrap" align="start">
          {photo && <PartPhoto src={photo} size={token.controlHeightLG * 2} />}
          <Flex vertical gap={token.marginXXS} style={{ flex: '1 1 0', minWidth: `min(100%, ${token.controlHeight * 5}px)` }}>
            <Typography.Text style={{ ...hydraTextStyleToReactCss(hydraLargeMedium), overflowWrap: 'anywhere' }}>
              {description}
            </Typography.Text>
            <Typography.Text type="secondary">
              {[`${part.brand} · Fig. ${part.figure}`, skuPart?.size && sizeLabel(skuPart.size)].filter(Boolean).join(' · ')}
            </Typography.Text>
            <Flex gap={token.marginXS} wrap="wrap" style={{ marginTop: token.marginXXS }}>
              {skuPart ? (
                <>
                  <MatchTypeTag type={skuPart.matchType} />
                  <OriginTag origin={skuPart.origin} />
                </>
              ) : <FigureMatchTag />}
            </Flex>
          </Flex>
        </Flex>
        {skuPart?.note && (
          <Alert
            type={skuPart.matchType === 'Substitute' ? 'warning' : 'info'}
            showIcon
            title={skuPart.note.title}
            description={skuPart.note.description}
          />
        )}
        {(productUrl || submittal || skuPart) && (
          <Flex gap={token.marginXS} justify="space-between" align="center" wrap="wrap" style={{
            paddingTop: token.paddingXS,
            borderTop: `${token.lineWidth}px ${token.lineType} ${token.colorBorderSecondary}`,
          }}>
            {skuPart && <CopySku sku={skuPart.sku} />}
            {(productUrl || submittal) && (
              <Flex gap={token.marginXXS} wrap="wrap">
                {productUrl && (
                  <Button type="link" size="small" href={productUrl} target="_blank" rel="noopener noreferrer" icon={<ExportOutlined aria-hidden />}>
                    View product
                  </Button>
                )}
                {submittal && (
                  <Button type="link" size="small" href={submittal} target="_blank" rel="noopener noreferrer" icon={<FilePdfOutlined aria-hidden />}>
                    View Submittal PDF
                  </Button>
                )}
              </Flex>
            )}
          </Flex>
        )}
        {variants && (
          <Flex vertical gap={token.marginXXS}>
            {variants.length > 0 ? (
              <>
                <Typography.Text strong>Available RSFC SKUs</Typography.Text>
                <Typography.Text type="secondary">Check the size and specifications before choosing a SKU.</Typography.Text>
                {variants.map((variant) => (
                  <Flex key={variant.sku} justify="space-between" align="center" gap={token.marginXS} wrap="wrap">
                    <Typography.Text type="secondary">{sizeLabel(variant.size)}</Typography.Text>
                    <CopySku sku={variant.sku} compact />
                  </Flex>
                ))}
              </>
            ) : (
              <Typography.Text type="secondary">No SKU variants are available for this figure in the prototype.</Typography.Text>
            )}
          </Flex>
        )}
      </Flex>
    </Card>
  );
}

function MatchDetails({ result }: { result: CrossReferenceResult }) {
  const { token } = theme.useToken();
  const { md: sideBySide } = Grid.useBreakpoint();
  const [origin, setOrigin] = useState<RsfcOrigin | 'all'>('all');
  const source = result.kind === 'figure' ? result.source : result.part;
  const sku = 'sku' in source ? source.sku : undefined;
  const details = [
    ['Brand', source.brand],
    ['SKU', sku],
    ['Figure Number', source.figure],
    ['Size', 'size' in source && source.size ? sizeLabel(source.size) : undefined],
    ['Material', 'material' in source ? source.material : undefined],
  ].filter(([, value]) => Boolean(value));
  const total = result.kind === 'figure' ? result.targets.length : result.equivalents.length;
  const matches = result.kind === 'competitor-sku'
    ? result.equivalents.filter((option) => origin === 'all' || option.origin === origin)
    : [];
  const canFilterOrigin = result.kind === 'competitor-sku'
    && new Set(result.equivalents.map((option) => option.origin)).size > 1;
  const resource = result.kind === 'figure' ? 'RSFC Figures' : 'RSFC Equivalents';

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: sideBySide ? 'minmax(0, 1fr) minmax(0, 2fr)' : 'minmax(0, 1fr)',
      gap: token.marginLG,
      borderTop: `${token.lineWidth}px ${token.lineType} ${token.colorBorderSecondary}`,
      paddingTop: token.paddingMD,
    }}>
      <section aria-label="Your Part">
        <Card size="small" variant="borderless" style={{ background: token.colorFillAlter }}>
          <Flex vertical gap={token.marginSM}>
            <Typography.Title level={5} style={{ margin: 0 }}>Your Part</Typography.Title>
            <Typography.Text style={{ ...hydraTextStyleToReactCss(hydraLargeMedium), overflowWrap: 'anywhere' }}>
              {source.description}
            </Typography.Text>
            <dl style={{ margin: 0 }}>
              {details.map(([label, value]) => (
                <div key={label} style={{
                  display: 'grid',
                  gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1.5fr)',
                  gap: token.marginXS,
                  paddingBlock: token.paddingXXS,
                }}>
                  <dt><Typography.Text type="secondary">{label}</Typography.Text></dt>
                  <dd style={{ margin: 0, overflowWrap: 'anywhere' }}>{value}</dd>
                </div>
              ))}
            </dl>
          </Flex>
        </Card>
      </section>
      <section aria-label={resource}>
        <Flex vertical gap={token.marginSM}>
          <Flex align="start" justify="space-between" gap={token.marginSM} wrap="wrap">
            <Flex vertical>
              <Typography.Title level={5} style={{ margin: 0 }}>{`${resource} (${total})`}</Typography.Title>
              {canFilterOrigin && origin !== 'all' && <Typography.Text type="secondary" aria-live="polite">{`Showing ${matches.length} of ${total} matches`}</Typography.Text>}
            </Flex>
            {canFilterOrigin && (
              <Select aria-label="RSFC origin" options={ORIGINS} value={origin} onChange={setOrigin} />
            )}
          </Flex>
          {result.kind === 'figure'
            ? result.targets.map((target) => (
              <EquivalentCard key={`${target.brand}:${target.figure}`} part={target} variants={listPrototypeVariantsForFigure(target)} />
            ))
            : matches.map((match) => <EquivalentCard key={match.sku} part={match} />)}
        </Flex>
      </section>
    </div>
  );
}

export function PartCrossReferenceMatchModal({ result, onClose }: { result: CrossReferenceResult | null; onClose: () => void }) {
  const { token } = theme.useToken();

  return (
    <Modal
      open={result !== null}
      onCancel={onClose}
      centered
      destroyOnHidden
      width={1032}
      title={<Typography.Title level={4} style={{ margin: 0 }}>Competitor Part Match</Typography.Title>}
      styles={{ body: { maxHeight: `min(72dvh, calc(100dvh - ${token.controlHeight * 4}px))`, overflowY: 'auto' } }}
      footer={<Button onClick={onClose}>Close</Button>}
    >
      {result && <MatchDetails key={result.kind === 'figure' ? result.key : result.part.sku} result={result} />}
    </Modal>
  );
}
