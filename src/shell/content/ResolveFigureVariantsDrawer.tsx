import { useEffect, useState } from 'react';

import { flattenAllLeafParts } from '../../catalog/productCatalogHierarchy.demo';
import { CatalogThumbnailPlaceholder } from '../../catalog/CatalogThumbnailPlaceholder';
import { HydraTag } from '../../ui/HydraTag';
import {
  Alert,
  Button,
  Drawer,
  Flex,
  Radio,
  Space,
  Steps,
  Typography,
  theme,
} from '../../ui/antd';
import type { ResolvedHistoryVariant, UnresolvedHistoryFigure } from './downloadHistorySelection';
import { hydraBaseStrong, hydraTextStyleToReactCss } from '../../theme/hydraTypography';

const COPY = {
  title: 'Choose a variation',
  progress: (current: number, total: number) => `Figure ${current} of ${total}`,
  hint: 'This figure was downloaded without a specific variation. Pick one to add to the BOM, or skip it.',
  downloaded: 'Downloaded before',
  skip: 'Skip this figure',
  useVariation: 'Use this variation',
  reviewTitle: 'Review before adding',
  reviewHint: 'Nothing is added until you confirm. Skipped figures are left out.',
  willAdd: 'Will be added',
  skipped: 'Skipped',
  noneToAdd: 'Every figure was skipped, so there is nothing to add to the BOM.',
  confirm: 'Add to BOM',
  cancel: 'Cancel',
  back: 'Back',
};

type VariantOption = {
  id: string;
  name: string;
  figureNumber: string;
  description: string;
  downloaded: boolean;
};

function variantsForFigure(figure: UnresolvedHistoryFigure): VariantOption[] {
  const hit = flattenAllLeafParts().find((row) => row.part.id === figure.partKey);
  const downloaded = new Set(figure.downloadedVariationKeys);
  const options =
    hit?.part.variants.map((variant) => ({
      id: variant.id,
      name: variant.name,
      figureNumber: variant.figureNumber,
      description: variant.description,
      downloaded: downloaded.has(variant.id),
    })) ?? [];
  return [...options].sort((a, b) => Number(b.downloaded) - Number(a.downloaded));
}

type Props = {
  open: boolean;
  figures: UnresolvedHistoryFigure[];
  alreadyResolved: ResolvedHistoryVariant[];
  onCancel: () => void;
  onConfirm: (resolved: ResolvedHistoryVariant[], dropped: UnresolvedHistoryFigure[]) => void;
};

type StepResolution = ResolvedHistoryVariant | 'skipped';

/**
 * Steps through unresolved parent figures so each one becomes a concrete BOM variant or is dropped (FR-12).
 * Abandoning the drawer writes nothing.
 */
export function ResolveFigureVariantsDrawer({
  open,
  figures,
  alreadyResolved,
  onCancel,
  onConfirm,
}: Props) {
  const { token } = theme.useToken();
  const [step, setStep] = useState(0);
  const [pickedId, setPickedId] = useState<string | null>(null);
  const [resolutions, setResolutions] = useState<Record<string, StepResolution>>({});

  useEffect(() => {
    if (!open) return;
    setStep(0);
    setPickedId(null);
    setResolutions({});
  }, [open]);

  const reviewStep = figures.length;
  const onReview = step >= reviewStep;
  const currentFigure = figures[step];
  const options = currentFigure ? variantsForFigure(currentFigure) : [];

  const reset = () => {
    setStep(0);
    setPickedId(null);
    setResolutions({});
  };

  const handleClose = () => {
    reset();
    onCancel();
  };

  const applyResolution = (value: StepResolution) => {
    if (!currentFigure) return;
    const next = { ...resolutions, [currentFigure.partKey]: value };
    setResolutions(next);
    setPickedId(null);
    setStep((current) => current + 1);
  };

  const handleUseVariation = () => {
    if (!currentFigure || !pickedId) return;
    const option = options.find((row) => row.id === pickedId);
    if (!option) return;
    applyResolution({
      partKey: currentFigure.partKey,
      variationKey: option.id,
      name: option.name,
      sku: option.figureNumber,
      figureNumber: currentFigure.figureNumber,
    });
  };

  const resolvedFromQueue = figures.flatMap((figure) => {
    const value = resolutions[figure.partKey];
    if (!value || value === 'skipped') return [];
    return [value];
  });
  const dropped = figures.filter((figure) => resolutions[figure.partKey] === 'skipped');
  const toWrite = [...alreadyResolved, ...resolvedFromQueue];

  const stepItems = [
    ...figures.map((figure, index) => ({
      title: figure.figureNumber || `Figure ${index + 1}`,
    })),
    { title: 'Review' },
  ];

  return (
    <Drawer
      title={onReview ? COPY.reviewTitle : COPY.title}
      open={open}
      onClose={handleClose}
      size="large"
      destroyOnClose
      footer={
        <Flex justify="space-between" align="center" wrap="wrap" gap={token.marginSM}>
          <Button size="large" onClick={handleClose}>
            {COPY.cancel}
          </Button>
          <Flex gap={token.marginXS} wrap="wrap" justify="flex-end">
            {onReview ? (
              <>
                <Button size="large" onClick={() => setStep(Math.max(0, reviewStep - 1))}>
                  {COPY.back}
                </Button>
                <Button
                  type="primary"
                  size="large"
                  disabled={toWrite.length === 0}
                  onClick={() => {
                    if (toWrite.length === 0) return;
                    onConfirm(toWrite, dropped);
                    reset();
                  }}
                >
                  {COPY.confirm}
                </Button>
              </>
            ) : (
              <>
                <Button size="large" onClick={() => applyResolution('skipped')}>
                  {COPY.skip}
                </Button>
                <Button type="primary" size="large" disabled={!pickedId} onClick={handleUseVariation}>
                  {COPY.useVariation}
                </Button>
              </>
            )}
          </Flex>
        </Flex>
      }
    >
      <Space orientation="vertical" size={token.marginLG} style={{ width: '100%' }}>
        {figures.length > 1 ? (
          <Steps current={Math.min(step, reviewStep)} items={stepItems} size="small" />
        ) : null}

        {onReview ? (
          <Space orientation="vertical" size={token.marginMD} style={{ width: '100%' }}>
            <Typography.Text type="secondary">{COPY.reviewHint}</Typography.Text>
            {toWrite.length === 0 ? (
              <Alert type="warning" showIcon title={COPY.noneToAdd} />
            ) : (
              <Flex vertical gap={token.marginXS}>
                <Typography.Text style={hydraTextStyleToReactCss(hydraBaseStrong)}>{COPY.willAdd}</Typography.Text>
                {toWrite.map((item) => (
                  <Typography.Text key={`${item.partKey}-${item.variationKey}`}>
                    {item.name} · {item.sku}
                  </Typography.Text>
                ))}
              </Flex>
            )}
            {dropped.length > 0 ? (
              <Flex vertical gap={token.marginXS}>
                <Typography.Text style={hydraTextStyleToReactCss(hydraBaseStrong)}>{COPY.skipped}</Typography.Text>
                {dropped.map((figure) => (
                  <Typography.Text key={figure.partKey} type="secondary">
                    {figure.name} · {figure.figureNumber}
                  </Typography.Text>
                ))}
              </Flex>
            ) : null}
          </Space>
        ) : currentFigure ? (
          <Space orientation="vertical" size={token.marginMD} style={{ width: '100%' }}>
            <Typography.Text type="secondary">
              {COPY.progress(step + 1, figures.length)}
            </Typography.Text>
            <Flex vertical gap={token.marginXXS}>
              <Typography.Text style={hydraTextStyleToReactCss(hydraBaseStrong)}>{currentFigure.name}</Typography.Text>
              <Typography.Text type="secondary">Figure {currentFigure.figureNumber}</Typography.Text>
            </Flex>
            <Typography.Text>{COPY.hint}</Typography.Text>
            {options.length === 0 ? (
              <Alert
                type="warning"
                showIcon
                title="No variations are listed for this figure. Skip it to continue."
              />
            ) : (
              <Radio.Group
                value={pickedId}
                onChange={(event) => setPickedId(event.target.value as string)}
                style={{ width: '100%' }}
              >
                <Space orientation="vertical" size={0} style={{ width: '100%' }}>
                  {options.map((option, index) => (
                    <Radio
                      key={option.id}
                      value={option.id}
                      style={{
                        width: '100%',
                        margin: 0,
                        padding: token.paddingSM,
                        borderBottom:
                          index === options.length - 1
                            ? undefined
                            : `${token.lineWidth}px ${token.lineType} ${token.colorBorderSecondary}`,
                      }}
                    >
                      <Flex align="center" gap={token.marginSM} style={{ minWidth: 0 }}>
                        <CatalogThumbnailPlaceholder />
                        <Flex vertical gap={token.marginXXS} style={{ minWidth: 0 }}>
                          <Flex align="center" gap={token.marginXS} wrap="wrap">
                            <Typography.Text style={hydraTextStyleToReactCss(hydraBaseStrong)}>{option.name}</Typography.Text>
                            {option.downloaded ? <HydraTag tone="processing">{COPY.downloaded}</HydraTag> : null}
                          </Flex>
                          <Typography.Text type="secondary">{option.figureNumber}</Typography.Text>
                        </Flex>
                      </Flex>
                    </Radio>
                  ))}
                </Space>
              </Radio.Group>
            )}
          </Space>
        ) : null}
      </Space>
    </Drawer>
  );
}
