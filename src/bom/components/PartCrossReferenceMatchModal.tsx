import { ArrowRightOutlined, CheckCircleOutlined, ExclamationCircleFilled, ExportOutlined } from '@ant-design/icons';
import { useEffect, useMemo, useState } from 'react';

import { MatchTypeTag, PartPhoto } from './PartCrossReferenceCard';
import { HydraTag } from '../../ui/HydraTag';
import {
  RSFC_PARTS,
  competitorDescriptionAttributes,
  rsfcPimAttributes,
  sortEquivalents,
  type CompetitorPart,
} from '../data/partCrossReferenceData';
import { sizeLabel } from '../data/pimDisplayMapping';
import {
  hydraBaseMedium,
  hydraSmallNormal,
  hydraTextStyleToReactCss,
} from '../../theme/hydraTypography';
import { Alert, Button, Flex, Modal, Segmented, Table, Typography, message, theme } from '../../ui/antd';

type Props = {
  part: CompetitorPart | null;
  /** Set on the RSFC part → competitor tab: the RSFC SKU of the card that was opened. */
  openedSku?: string;
  onClose: () => void;
};

type SpecRow = { key: string; label: string; short: string; competitor: string; rsfc: string; same: boolean };

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
 * Match details, compare layout (design canvas M9 / M10, 23 Nov 2026). The competitor part is always on the left and
 * the RSFC part always on the right, with the specs both sides have in one small table. One RSFC option (competitor
 * part → RSFC) or one competitor part (RSFC part → competitor) is shown at a time. Empty values are hidden, so there
 * is no "Not specified". Built from DS parts and tokens only.
 */
export function PartCrossReferenceMatchModal({ part, openedSku, onClose }: Props) {
  const { token } = theme.useToken();
  const small = hydraTextStyleToReactCss(hydraSmallNormal);
  const medium = hydraTextStyleToReactCss(hydraBaseMedium);
  const rsfcMode = Boolean(openedSku);

  const [index, setIndex] = useState(0);
  const [sku, setSku] = useState<string | undefined>(openedSku);

  useEffect(() => {
    setIndex(0);
    setSku(openedSku);
  }, [part?.sku, openedSku]);

  const competitors = useMemo(() => {
    if (!part) return [];
    const rsfcPart = openedSku ? RSFC_PARTS.find((p) => p.sku === openedSku) : undefined;
    return rsfcPart ? rsfcPart.competitors.map((c) => c.part) : [part];
  }, [part, openedSku]);

  const competitor = rsfcMode ? competitors[index] : part;
  const equivalents = useMemo(() => (competitor ? sortEquivalents(competitor.equivalents) : []), [competitor]);
  const equivalent = rsfcMode ? (equivalents.find((e) => e.sku === sku) ?? equivalents[0]) : equivalents[index];

  const ready = Boolean(competitor && equivalent);

  const copySku = async () => {
    if (!equivalent) return;
    try {
      await navigator.clipboard.writeText(equivalent.sku);
      message.success(`SKU ${equivalent.sku} copied`);
    } catch {
      message.error('Could not copy the SKU. Select it and copy it by hand.');
    }
  };

  let body = null;
  if (competitor && equivalent) {
    const pim = rsfcPimAttributes(competitor, equivalent);
    const fromDescription = competitorDescriptionAttributes(competitor);
    const candidates: Array<Omit<SpecRow, 'same'> & { competitor?: string; rsfc?: string }> = [
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
      .filter((row): row is SpecRow => Boolean(row.competitor && row.rsfc))
      .map((row) => ({ ...row, same: row.competitor.toLowerCase() === row.rsfc.toLowerCase() }));
    const differing = rows.filter((row) => !row.same);
    const verdict =
      differing.length === 0
        ? sentence(`${joinWords(rows.map((row) => row.short))} match`)
        : `Check before using: ${joinWords(differing.map((row) => row.short))} differ`;

    const exactOther =
      rsfcMode && equivalent.matchType === 'Substitute'
        ? equivalents.find((e) => e.matchType === 'Exact match' && e.sku !== equivalent.sku)
        : undefined;
    const opened = rsfcMode && equivalent.sku === openedSku;
    const rsfcMeta = [pim.material, equivalent.origin, ...pim.certifications].filter(Boolean).join(' · ');

    const switchOptions = rsfcMode
      ? competitors.map((c, i) => ({ value: i, label: `${c.brand} ${c.sku}` }))
      : equivalents.map((_, i) => ({ value: i, label: `Option ${i + 1}` }));
    const count = rsfcMode ? competitors.length : equivalents.length;
    const countText = rsfcMode
      ? `Replaces ${count} competitor part${count === 1 ? '' : 's'}`
      : `${count} equivalent${count === 1 ? '' : 's'}`;

    body = (
      <Flex vertical gap={token.margin} style={{ paddingBlock: token.paddingXS }}>
        <Flex justify="space-between" align="center" gap={token.marginSM} wrap="wrap">
          <Typography.Text type="secondary">{countText}</Typography.Text>
          {switchOptions.length > 1 ? (
            <Segmented
              aria-label={rsfcMode ? 'Competitor part' : 'RSFC option'}
              value={index}
              options={switchOptions}
              onChange={(value) => {
                setIndex(value);
                setSku(openedSku);
              }}
            />
          ) : null}
        </Flex>

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) auto minmax(0, 1fr)', alignItems: 'center', gap: token.marginXS }}>
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
            <Flex>
              <HydraTag>Competitor</HydraTag>
            </Flex>
            <Typography.Text style={medium}>{competitor.sku}</Typography.Text>
            <Typography.Text>{`${competitor.brand} · Fig. ${competitor.figure}`}</Typography.Text>
            <Typography.Text type="secondary" style={{ ...small, overflowWrap: 'anywhere' }}>
              {competitor.description}
            </Typography.Text>
          </Flex>

          <ArrowRightOutlined aria-hidden style={{ color: token.colorTextTertiary }} />

          <Flex
            gap={token.marginSM}
            align="center"
            aria-label="RSFC part"
            style={{
              alignSelf: 'stretch',
              padding: token.paddingSM,
              background: token.colorPrimaryBg,
              border: `${token.lineWidth}px ${token.lineType} ${token.colorPrimaryBorder}`,
              borderRadius: token.borderRadiusLG,
            }}
          >
            {/* The photo fills the block: the same paddingSM from the top, bottom and left edges. */}
            <PartPhoto name={equivalent.name} size={token.controlHeightLG * 3 + token.marginXXS} />
            <Flex vertical gap={token.marginXXS} style={{ minWidth: 0 }}>
              <Flex gap={token.marginXS} align="center" wrap="wrap">
                <HydraTag>RSFC</HydraTag>
                <MatchTypeTag type={equivalent.matchType} />
              </Flex>
              {opened ? (
                <Typography.Text style={{ ...small, color: token.colorPrimaryText }}>You opened this</Typography.Text>
              ) : null}
              <Typography.Text style={medium}>{equivalent.sku}</Typography.Text>
              <Typography.Text>{`${equivalent.brand} · Fig. ${equivalent.figure}`}</Typography.Text>
              <Typography.Text type="secondary" style={{ ...small, overflowWrap: 'anywhere' }}>
                {rsfcMeta}
              </Typography.Text>
            </Flex>
          </Flex>
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
              showHeader={false}
              rowKey="key"
              dataSource={rows}
              columns={[
                {
                  dataIndex: 'label',
                  width: token.controlHeight * 4,
                  render: (value: string) => <Typography.Text type="secondary">{value}</Typography.Text>,
                },
                { dataIndex: 'competitor' },
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
                  dataIndex: 'rsfc',
                  render: (value: string) => <Typography.Text style={medium}>{value}</Typography.Text>,
                },
              ]}
            />
            <Typography.Text type="secondary" style={small}>
              Competitor values are read from its description. Material and origin are known for RSFC parts only.
            </Typography.Text>
          </Flex>
        ) : null}

        {exactOther ? (
          <Alert
            type="warning"
            showIcon
            title={`Substitute. The exact match for this part is ${exactOther.brand} Fig. ${exactOther.figure} (${exactOther.sku}).`}
            action={
              <Button type="link" size="small" onClick={() => setSku(exactOther.sku)}>
                Compare it
              </Button>
            }
          />
        ) : null}
        {equivalent.note ? <Alert type="warning" showIcon title={equivalent.note} /> : null}
      </Flex>
    );
  }

  return (
    <Modal
      open={part !== null && ready}
      onCancel={onClose}
      title={
        competitor && equivalent
          ? rsfcMode
            ? `Competitor part for ${equivalent.brand} ${equivalent.sku}`
            : `RSFC replacement for ${competitor.sku}`
          : undefined
      }
      width={MODAL_WIDTH}
      destroyOnHidden
      footer={
        equivalent ? (
          <Flex justify="space-between" align="center" gap={token.marginSM}>
            <Flex gap={token.margin}>
              <Typography.Link
                href={`/search/results?q=${encodeURIComponent(equivalent.sku)}`}
                target="_blank"
                rel="noopener noreferrer"
                title="Opens in a new tab"
              >
                View product <ExportOutlined aria-hidden />
              </Typography.Link>
              {equivalent.hasSubmittalPdf ? (
                <Button
                  type="link"
                  size="small"
                  title="Opens in a new tab"
                  style={{ paddingInline: 0, height: 'auto' }}
                  onClick={() => message.info('Submittal PDFs open from the product page in the live app.')}
                >
                  Submittal PDF <ExportOutlined aria-hidden />
                </Button>
              ) : null}
            </Flex>
            <Flex gap={token.marginXS}>
              <Button onClick={onClose}>Close</Button>
              <Button type="primary" onClick={copySku}>
                Copy SKU
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
