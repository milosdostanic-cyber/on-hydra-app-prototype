import { ArrowRightOutlined, CheckCircleOutlined, ExclamationCircleFilled, ExportOutlined } from '@ant-design/icons';
import { useEffect, useMemo, useState } from 'react';

import { MatchTypeTag, PartPhoto } from './PartCrossReferenceCard';
import { HydraTag } from '../../ui/HydraTag';
import {
  competitorDescriptionAttributes,
  rsfcPimAttributes,
  rsfcSkuPhoto,
  sortEquivalents,
  type SkuMatchResult,
} from '../data/partCrossReferenceData';
import { sizeLabel } from '../data/pimDisplayMapping';
import {
  hydraBaseMedium,
  hydraSmallNormal,
  hydraTextStyleToReactCss,
} from '../../theme/hydraTypography';
import { Alert, Button, Flex, Grid, Modal, Segmented, Table, Typography, message, theme } from '../../ui/antd';

type Props = {
  result: SkuMatchResult | null;
  onClose: () => void;
};

type SpecValues = { key: string; label: string; short: string; competitor: string; rsfc: string };
type SpecCandidate = Omit<SpecValues, 'competitor' | 'rsfc'> & { competitor?: string; rsfc?: string };
type SpecRow = SpecValues & { same: boolean };

/** Modal width (design canvas M9 / M10). */
const MODAL_WIDTH = 760;

function joinWords(words: string[]): string {
  if (words.length <= 1) return words.join('');
  return `${words.slice(0, -1).join(', ')} and ${words[words.length - 1]}`;
}

function sentence(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/**
 * Compare the selected source with one result at a time. The panels and shared specs follow the search direction.
 */
export function PartCrossReferenceMatchModal({ result, onClose }: Props) {
  const { token } = theme.useToken();
  const { md: sideBySide, xs: narrowScreen } = Grid.useBreakpoint();
  const small = hydraTextStyleToReactCss(hydraSmallNormal);
  const medium = hydraTextStyleToReactCss(hydraBaseMedium);
  const rsfcMode = result?.kind === 'rsfc-sku';
  const openedSku = result?.kind === 'rsfc-sku' ? result.part.sku : undefined;

  const [index, setIndex] = useState(0);
  const [sku, setSku] = useState<string | undefined>(openedSku);

  useEffect(() => {
    setIndex(0);
    setSku(openedSku);
  }, [result, openedSku]);

  const competitors = result?.kind === 'rsfc-sku' ? result.competitors.map((match) => match.part) : [];
  const competitor = result?.kind === 'competitor-sku' ? result.part : competitors[index];
  const equivalents = useMemo(
    () => result?.kind === 'competitor-sku' ? result.equivalents : competitor ? sortEquivalents(competitor.equivalents) : [],
    [result, competitor],
  );
  const equivalent = rsfcMode
    ? equivalents.find((item) => item.sku === (sku ?? openedSku))
    : equivalents[index];

  const ready = Boolean(competitor && equivalent);

  const copySku = async () => {
    const skuToCopy = rsfcMode ? competitor?.sku : equivalent?.sku;
    if (!skuToCopy) return;
    try {
      await navigator.clipboard.writeText(skuToCopy);
      message.success(`SKU ${skuToCopy} copied`);
    } catch {
      message.error('Could not copy the SKU. Select it and copy it by hand.');
    }
  };

  let body = null;
  if (competitor && equivalent) {
    const pim = rsfcPimAttributes(competitor, equivalent);
    const fromDescription = competitorDescriptionAttributes(competitor);
    const candidates: SpecCandidate[] = [
      { key: 'type', label: 'Product type', short: 'type', competitor: fromDescription.productType, rsfc: pim.productType },
      {
        key: 'size',
        label: 'Size',
        short: 'size',
        competitor: competitor.size ? sizeLabel(competitor.size) : undefined,
        rsfc: sizeLabel(equivalent.size),
      },
      {
        key: 'connection',
        label: 'End connection',
        short: 'connection',
        competitor: fromDescription.endConnection,
        rsfc: pim.endConnection,
      },
    ];
    const rows: SpecRow[] = candidates
      .filter((row): row is SpecValues => Boolean(row.competitor && row.rsfc))
      .map((row) => ({ ...row, same: row.competitor.toLowerCase() === row.rsfc.toLowerCase() }));
    const differing = rows.filter((row) => !row.same);
    const verdict =
      differing.length === 0
        ? sentence(`${joinWords(rows.map((row) => row.short))} match`)
        : `Check before using: ${joinWords(differing.map((row) => row.short))} differ`;

    const isSubstitute = equivalent.matchType === 'Substitute';
    const note = equivalent.note;
    const exactOther =
      rsfcMode && isSubstitute
        ? equivalents.find((e) => e.matchType === 'Exact match' && e.sku !== equivalent.sku)
        : undefined;
    const rsfcMeta = [pim.material, equivalent.origin, ...pim.certifications].filter(Boolean).join(' · ');
    const photo = rsfcSkuPhoto(equivalent.sku);

    const switchOptions = rsfcMode
      ? competitors.map((c, i) => ({ value: i, label: `${c.brand} ${c.sku}` }))
      : equivalents.map((option, index, options) => {
        const model = `${option.brand} · Fig. ${option.figure}`;
        const sharedFigure = options.some((other) =>
          other.brand === option.brand && other.figure === option.figure && other.sku !== option.sku,
        );
        return { value: index, label: sharedFigure ? `${model} · ${option.sku}` : model };
      });
    const count = rsfcMode ? competitors.length : equivalents.length;
    const countText = rsfcMode
      ? `${count} competitor match${count === 1 ? '' : 'es'}`
      : `${count} equivalent${count === 1 ? '' : 's'}`;

    const matchStatus = <MatchTypeTag type={equivalent.matchType} label={`SKU · ${equivalent.matchType}`} />;
    const competitorPanel = (
      <Flex
        vertical
        gap={token.marginXXS}
        aria-label="Competitor part"
        style={{
          alignSelf: 'stretch',
          padding: token.paddingSM,
          background: token.colorFillAlter,
          border: `${token.lineWidth}px ${token.lineType} ${token.colorBorderSecondary}`,
          borderRadius: token.borderRadiusLG,
        }}
      >
        <Flex gap={token.marginXS} align="center" wrap="wrap">
          <HydraTag>Competitor</HydraTag>
          {rsfcMode && matchStatus}
        </Flex>
        <Typography.Text style={medium}>{competitor.sku}</Typography.Text>
        <Typography.Text>{`${competitor.brand} · Fig. ${competitor.figure}`}</Typography.Text>
        <Typography.Text type="secondary" style={{ ...small, overflowWrap: 'anywhere' }}>
          {competitor.description}
        </Typography.Text>
      </Flex>
    );
    const rsfcPanel = (
      <Flex
        vertical
        gap={token.marginXS}
        aria-label="RSFC part"
        style={{
          alignSelf: 'stretch',
          padding: token.paddingSM,
          background: token.colorPrimaryBg,
          border: `${token.lineWidth}px ${token.lineType} ${token.colorPrimaryBorder}`,
          borderRadius: token.borderRadiusLG,
        }}
      >
        <Flex gap={token.marginXS} align="center" wrap="wrap">
          <HydraTag>RSFC</HydraTag>
          {!rsfcMode && matchStatus}
        </Flex>
        <Flex align="center" gap={token.marginSM}>
          {photo && <PartPhoto src={photo} size={token.controlHeightLG * 3 + token.marginXXS} />}
          <Flex vertical gap={token.marginXXS} style={{ minWidth: 0 }}>
            <Typography.Text style={medium}>{equivalent.sku}</Typography.Text>
            <Typography.Text>{`${equivalent.brand} · Fig. ${equivalent.figure}`}</Typography.Text>
            <Typography.Text type="secondary" style={{ ...small, overflowWrap: 'anywhere' }}>
              {equivalent.name}
            </Typography.Text>
            <Typography.Text type="secondary" style={{ ...small, overflowWrap: 'anywhere' }}>
              {rsfcMeta}
            </Typography.Text>
          </Flex>
        </Flex>
      </Flex>
    );

    body = (
      <Flex vertical gap={token.margin} style={{ paddingBlock: token.paddingXS }}>
        <Flex justify="space-between" align="center" gap={token.marginSM} wrap="wrap">
          <Typography.Text type="secondary">{countText}</Typography.Text>
          {switchOptions.length > 1 ? (
            <Segmented
              aria-label={rsfcMode ? 'Competitor part' : 'RSFC option'}
              orientation={!rsfcMode && narrowScreen ? 'vertical' : 'horizontal'}
              style={{ maxWidth: '100%' }}
              value={index}
              options={switchOptions}
              onChange={(value) => {
                setIndex(value);
                setSku(openedSku);
              }}
            />
          ) : null}
        </Flex>

        {(isSubstitute || note) && (
          <Alert
            type="warning"
            showIcon
            title={note?.title ?? 'Check this substitute'}
            description={
              exactOther ? (
                <Flex vertical gap={token.marginXXS}>
                  {note?.description && <span>{note.description}</span>}
                  <span>{`Exact match: ${exactOther.brand} Fig. ${exactOther.figure} (${exactOther.sku}).`}</span>
                </Flex>
              ) : note?.description ?? 'Confirm this part meets the job requirements before using it.'
            }
            action={
              exactOther && (
                <Button type="link" size="small" onClick={() => setSku(exactOther.sku)}>
                  Compare it
                </Button>
              )
            }
          />
        )}

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: sideBySide ? 'minmax(0, 1fr) auto minmax(0, 1fr)' : 'minmax(0, 1fr)',
            alignItems: 'center',
            gap: token.marginXS,
          }}
        >
          {rsfcMode ? rsfcPanel : competitorPanel}

          <ArrowRightOutlined
            aria-hidden
            rotate={sideBySide ? 0 : 90}
            style={{ color: token.colorTextTertiary, justifySelf: 'center' }}
          />

          {rsfcMode ? competitorPanel : rsfcPanel}
        </div>

        {rows.length > 0 ? (
          <Flex vertical gap={token.marginXS}>
            <Flex gap={token.marginXS} align="center">
              {differing.length > 0 && (
                <ExclamationCircleFilled aria-hidden style={{ color: token.colorWarning }} />
              )}
              <Typography.Text style={medium}>{verdict}</Typography.Text>
            </Flex>
            <Table<SpecRow>
              size="small"
              pagination={false}
              showHeader={rsfcMode}
              rowKey="key"
              dataSource={rows}
              columns={[
                {
                  title: 'Attribute',
                  dataIndex: 'label',
                  width: token.controlHeight * 4,
                  render: (value: string) => <Typography.Text type="secondary">{value}</Typography.Text>,
                },
                { title: rsfcMode ? 'RSFC' : 'Competitor', dataIndex: rsfcMode ? 'rsfc' : 'competitor' },
                {
                  key: 'match',
                  width: token.controlHeightLG,
                  align: 'center',
                  render: (_: unknown, row: SpecRow) =>
                    row.same ? (
                      <CheckCircleOutlined aria-label="Same" style={{ color: token.colorSuccess }} />
                    ) : (
                      <ExclamationCircleFilled aria-label="Differs" style={{ color: token.colorWarning }} />
                    ),
                },
                {
                  title: rsfcMode ? 'Competitor' : 'RSFC',
                  dataIndex: rsfcMode ? 'competitor' : 'rsfc',
                  render: (value: string) => <Typography.Text style={medium}>{value}</Typography.Text>,
                },
              ]}
            />
            <Typography.Text type="secondary" style={small}>
              Competitor values are read from its description. Material and origin are known for RSFC parts only.
            </Typography.Text>
          </Flex>
        ) : null}

      </Flex>
    );
  }

  return (
    <Modal
      open={result !== null && ready}
      onCancel={onClose}
      title={
        competitor && equivalent
          ? rsfcMode
            ? `Competitor matches for ${equivalent.brand} ${equivalent.sku}`
            : `RSFC replacement for ${competitor.sku}`
          : undefined
      }
      width={MODAL_WIDTH}
      destroyOnHidden
      footer={
        equivalent ? (
          <Flex justify="space-between" align="center" gap={token.marginSM} wrap="wrap">
            <Flex gap={token.margin} wrap="wrap">
              <Typography.Link
                href={equivalent.productUrl ?? `/search/results?q=${encodeURIComponent(equivalent.sku)}`}
                target="_blank"
                rel="noopener noreferrer"
                title="Opens in a new tab"
              >
                {rsfcMode ? 'View RSFC product' : 'View product'} <ExportOutlined aria-hidden />
              </Typography.Link>
              {equivalent.hasSubmittalPdf ? (
                <Button
                  type="link"
                  size="small"
                  title="Opens in a new tab"
                  style={{ paddingInline: 0, height: 'auto' }}
                  onClick={() => message.info('Submittal PDFs open from the product page in the live app.')}
                >
                  {rsfcMode ? 'RSFC submittal PDF' : 'Submittal PDF'} <ExportOutlined aria-hidden />
                </Button>
              ) : null}
            </Flex>
            <Flex gap={token.marginXS} style={{ marginInlineStart: 'auto' }}>
              <Button onClick={onClose}>Close</Button>
              <Button type="primary" onClick={copySku}>
                {rsfcMode ? 'Copy competitor SKU' : 'Copy SKU'}
              </Button>
            </Flex>
          </Flex>
        ) : null
      }
    >
      {body}
    </Modal>
  );
}
