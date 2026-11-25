import { CopyOutlined, ExportOutlined, FilePdfOutlined } from '@ant-design/icons';
import { useState, type ReactNode } from 'react';

import { FigureMatchTag, MatchTypeTag, OriginTag, PartPhoto } from './PartCrossReferenceCard';
import {
  listPrototypeVariantsForFigure,
  rsfcSkuPhoto,
  rsfcSubmittal,
  type CrossReferenceFigure,
  type CrossReferenceResult,
  type RsfcEquivalent,
} from '../data/partCrossReferenceData';
import { sizeLabel } from '../data/pimDisplayMapping';
import { hydraLargeMedium, hydraTextStyleToReactCss } from '../../theme/hydraTypography';
import { Alert, Button, Card, Flex, Grid, Modal, Typography, message, theme } from '../../ui/antd';

/**
 * Figma BOM - RSFC, "03 · Match details · Modal" (05a, 05b, 05c): Your part 232 + gap 24 + options 496,
 * plus 24 padding on each side gives an 800 wide modal.
 */
const YOUR_PART_WIDTH = 232;
const MODAL_WIDTH = 800;

async function copySku(sku: string) {
  try {
    await navigator.clipboard.writeText(sku);
    message.success(`SKU ${sku} copied`);
  } catch {
    message.error('Could not copy the SKU. Select it and copy it by hand.');
  }
}

/** The SKU is the label of its own copy button (Figma "RSFC Option Card"), a small default button per UX-010. */
function CopySkuButton({ sku }: { sku: string }) {
  return (
    <Button size="small" icon={<CopyOutlined aria-hidden />} aria-label={`Copy SKU ${sku}`} onClick={() => copySku(sku)}>
      {`SKU ${sku}`}
    </Button>
  );
}

function FigureSkuList({ variants }: { variants: RsfcEquivalent[] }) {
  const { token } = theme.useToken();
  return (
    <Flex vertical gap={token.marginXXS}>
      <Typography.Text type="secondary">Check the size and specifications before choosing a SKU.</Typography.Text>
      {variants.map((variant) => (
        <Flex key={variant.sku} justify="space-between" align="center" gap={token.marginXS} wrap="wrap">
          <Typography.Text>{sizeLabel(variant.size)}</Typography.Text>
          <CopySkuButton sku={variant.sku} />
        </Flex>
      ))}
    </Flex>
  );
}

function OptionCard({ part }: { part: RsfcEquivalent | CrossReferenceFigure }) {
  const { token } = theme.useToken();
  const [showSkus, setShowSkus] = useState(false);
  const skuPart = 'sku' in part ? part : undefined;
  const name = 'name' in part ? part.name : part.description;
  const photo = 'sku' in part ? rsfcSkuPhoto(part.sku) : part.photo;
  const submittal = rsfcSubmittal(part);
  const productUrl = skuPart?.productUrl;
  const variants = 'sku' in part ? [] : listPrototypeVariantsForFigure(part);
  const meta = [`${part.brand} · Fig. ${part.figure}`, skuPart?.size && sizeLabel(skuPart.size)].filter(Boolean).join(' · ');

  return (
    <Card size="small" variant="outlined">
      <Flex vertical gap={token.margin}>
        <Flex gap={token.marginSM} align="start">
          {photo && <PartPhoto src={photo} size={token.controlHeightLG * 2} />}
          <Flex vertical gap={token.marginSM} style={{ flex: '1 1 0', minWidth: 0 }}>
            <Flex vertical>
              <Typography.Text style={hydraTextStyleToReactCss(hydraLargeMedium)} ellipsis={{ tooltip: name }}>
                {name}
              </Typography.Text>
              <Typography.Text type="secondary">{meta}</Typography.Text>
            </Flex>
            <Flex gap={token.marginXS} wrap="wrap">
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
        <Flex gap={token.marginXS} justify="space-between" align="center" wrap="wrap">
          {skuPart && <CopySkuButton sku={skuPart.sku} />}
          {!skuPart && variants.length > 0 && (
            <Button size="small" aria-expanded={showSkus} onClick={() => setShowSkus((open) => !open)}>
              {showSkus ? 'Hide SKUs' : `Show ${variants.length} ${variants.length === 1 ? 'SKU' : 'SKUs'}`}
            </Button>
          )}
          {!skuPart && variants.length === 0 && (
            <Typography.Text type="secondary">No SKUs for this figure in the prototype</Typography.Text>
          )}
          {(productUrl || submittal) && (
            <Flex gap={token.marginXXS} wrap="wrap">
              {productUrl && (
                <Button type="link" size="small" href={productUrl} target="_blank" rel="noopener noreferrer" icon={<ExportOutlined aria-hidden />}>
                  View product
                </Button>
              )}
              {submittal && (
                <Button type="link" size="small" href={submittal} target="_blank" rel="noopener noreferrer" icon={<FilePdfOutlined aria-hidden />}>
                  Submittal PDF
                </Button>
              )}
            </Flex>
          )}
        </Flex>
        {showSkus && <FigureSkuList variants={variants} />}
      </Flex>
    </Card>
  );
}

function OptionGroup({ title, children }: { title?: string; children: ReactNode }) {
  const { token } = theme.useToken();
  return (
    <Flex vertical gap={token.marginXXS}>
      {title && <Typography.Text strong>{title}</Typography.Text>}
      <Flex vertical gap={token.marginSM}>{children}</Flex>
    </Flex>
  );
}

function MatchDetails({ result, sideBySide }: { result: CrossReferenceResult; sideBySide: boolean }) {
  const { token } = theme.useToken();
  const source = result.kind === 'figure' ? result.source : result.part;
  const sku = 'sku' in source ? source.sku : undefined;
  const details = [
    ['Brand', source.brand],
    ['SKU', sku],
    ['Figure', source.figure],
    ['Size', 'size' in source && source.size ? sizeLabel(source.size) : undefined],
    ['Material', 'material' in source ? source.material : undefined],
  ].filter(([, value]) => Boolean(value));
  const total = result.kind === 'figure' ? result.targets.length : result.equivalents.length;
  const [best, ...others] = result.kind === 'competitor-sku' ? result.equivalents : [];

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: sideBySide ? `${YOUR_PART_WIDTH}px minmax(0, 1fr)` : 'minmax(0, 1fr)',
      gap: token.marginLG,
      alignItems: 'start',
    }}>
      <section aria-label="Your part">
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
                  gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)',
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
      <section aria-label="RSFC options">
        <Flex vertical gap={token.marginSM}>
          <Typography.Title level={5} style={{ margin: 0 }}>{`${total} RSFC ${total === 1 ? 'option' : 'options'}`}</Typography.Title>
          {/* Figma 05c: the modal stops 100px from the top and bottom of the screen and only this list scrolls. */}
          <Flex
            vertical
            gap={token.marginSM}
            tabIndex={sideBySide ? 0 : undefined}
            aria-label={sideBySide ? 'RSFC options list' : undefined}
            style={sideBySide ? {
              maxHeight: `calc(100dvh - ${token.controlHeight * 11}px)`,
              overflowY: 'auto',
              paddingInlineEnd: token.paddingXS,
            } : undefined}
          >
            {result.kind === 'figure' ? (
              <OptionGroup>
                {result.targets.map((target) => <OptionCard key={`${target.brand}:${target.figure}`} part={target} />)}
              </OptionGroup>
            ) : (
              <>
                <OptionGroup title="Best match">
                  <OptionCard part={best} />
                </OptionGroup>
                {others.length > 0 && (
                  <OptionGroup title="Other options">
                    {others.map((option) => <OptionCard key={option.sku} part={option} />)}
                  </OptionGroup>
                )}
              </>
            )}
          </Flex>
        </Flex>
      </section>
    </div>
  );
}

export function PartCrossReferenceMatchModal({ result, onClose }: { result: CrossReferenceResult | null; onClose: () => void }) {
  const { md: sideBySide = false } = Grid.useBreakpoint();
  const identifier = result === null ? '' : result.kind === 'figure' ? `${result.source.brand} Fig. ${result.source.figure}` : result.part.sku;

  return (
    <Modal
      open={result !== null}
      onCancel={onClose}
      centered
      destroyOnHidden
      width={MODAL_WIDTH}
      title={`RSFC replacements for ${identifier}`}
      styles={sideBySide ? undefined : { body: { maxHeight: 'calc(100dvh - 200px)', overflowY: 'auto' } }}
      footer={<Button onClick={onClose}>Close</Button>}
    >
      {result && (
        <MatchDetails
          key={result.kind === 'figure' ? result.key : result.part.sku}
          result={result}
          sideBySide={sideBySide}
        />
      )}
    </Modal>
  );
}
