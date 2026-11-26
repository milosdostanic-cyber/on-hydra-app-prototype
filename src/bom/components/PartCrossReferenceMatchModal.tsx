import { useState, type ReactNode } from 'react';

import { RsfcOptionCard } from './RsfcOptionCard';
import { type CrossReferenceResult } from '../data/partCrossReferenceData';
import { sizeLabel } from '../data/pimDisplayMapping';
import { hydraLargeMedium, hydraTextStyleToReactCss } from '../../theme/hydraTypography';
import { App, Button, Card, Flex, Grid, Modal, Typography, theme } from '../../ui/antd';

/**
 * Figma BOM - RSFC, "03 · Match details · Modal" (05a, 05b, 05c): Your part 232 + gap 24 + options 496,
 * plus 24 padding on each side gives an 800 wide modal.
 */
const YOUR_PART_WIDTH = 232;
const MODAL_WIDTH = 800;

function OptionGroup({ title, children }: { title?: string; children: ReactNode }) {
  const { token } = theme.useToken();
  return (
    <Flex vertical gap={token.marginXXS}>
      {title && <Typography.Text strong>{title}</Typography.Text>}
      <Flex vertical gap={token.marginSM}>{children}</Flex>
    </Flex>
  );
}

function MatchDetails({
  result,
  sideBySide,
  selectedSku,
  onSelect,
}: {
  result: CrossReferenceResult;
  sideBySide: boolean;
  selectedSku?: string;
  onSelect: (sku: string) => void;
}) {
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
            role={result.kind === 'competitor-sku' ? 'radiogroup' : undefined}
            aria-label={result.kind === 'competitor-sku' ? 'Choose the RSFC option to add to the BOM' : sideBySide ? 'RSFC options list' : undefined}
            style={sideBySide ? {
              maxHeight: `calc(100dvh - ${token.controlHeight * 11}px)`,
              overflowY: 'auto',
              paddingInlineEnd: token.paddingXS,
            } : undefined}
          >
            {result.kind === 'figure' ? (
              <OptionGroup>
                {result.targets.map((target) => <RsfcOptionCard key={`${target.brand}:${target.figure}`} part={target} />)}
              </OptionGroup>
            ) : (
              <>
                <OptionGroup title="Best match">
                  <RsfcOptionCard part={best} selected={selectedSku === best.sku} onSelect={() => onSelect(best.sku)} />
                </OptionGroup>
                {others.length > 0 && (
                  <OptionGroup title="Other options">
                    {others.map((option) => (
                      <RsfcOptionCard
                        key={option.sku}
                        part={option}
                        selected={selectedSku === option.sku}
                        onSelect={() => onSelect(option.sku)}
                      />
                    ))}
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

function resultKey(result: CrossReferenceResult) {
  return result.kind === 'figure' ? result.key : result.part.sku;
}

export function PartCrossReferenceMatchModal({ result, onClose }: { result: CrossReferenceResult | null; onClose: () => void }) {
  const { md: sideBySide = false } = Grid.useBreakpoint();
  const { modal, message: toast } = App.useApp();
  /** The chosen option per opened part. Nothing is selected when the modal opens, so Add to BOM starts disabled. */
  const [choice, setChoice] = useState<{ key: string; sku: string } | null>(null);
  const identifier = result === null ? '' : result.kind === 'figure' ? `${result.source.brand} Fig. ${result.source.figure}` : result.part.sku;
  const canAdd = result?.kind === 'competitor-sku';
  const selectedSku = result?.kind === 'competitor-sku' && choice?.key === resultKey(result) ? choice.sku : undefined;

  const close = () => {
    setChoice(null);
    onClose();
  };

  const confirmAdd = () => {
    if (result?.kind !== 'competitor-sku' || !selectedSku) return;
    const option = result.equivalents.find((equivalent) => equivalent.sku === selectedSku);
    if (!option) return;
    const competitor = `${result.part.brand} ${result.part.sku}`;
    modal.confirm({
      title: 'Add this part to the BOM?',
      content: `${option.brand} SKU ${option.sku} will be added to the BOM as the replacement for ${competitor}.`,
      okText: 'Add to BOM',
      cancelText: 'Cancel',
      onOk: () => {
        close();
        toast.success(`SKU ${option.sku} added to the BOM as the replacement for ${competitor}.`);
      },
    });
  };

  return (
    <Modal
      open={result !== null}
      onCancel={close}
      centered
      destroyOnHidden
      width={MODAL_WIDTH}
      title={`RSFC replacements for ${identifier}`}
      styles={sideBySide ? undefined : { body: { maxHeight: 'calc(100dvh - 200px)', overflowY: 'auto' } }}
      footer={(
        <Flex justify="end" gap="small">
          <Button onClick={close}>Close</Button>
          {canAdd && (
            <Button type="primary" disabled={!selectedSku} onClick={confirmAdd}>
              Add to BOM
            </Button>
          )}
        </Flex>
      )}
    >
      {result && (
        <MatchDetails
          key={resultKey(result)}
          result={result}
          sideBySide={sideBySide}
          selectedSku={selectedSku}
          onSelect={(sku) => setChoice({ key: resultKey(result), sku })}
        />
      )}
    </Modal>
  );
}
