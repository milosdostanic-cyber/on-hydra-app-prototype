import { CopyOutlined, FilePdfOutlined, LinkOutlined } from '@ant-design/icons';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { MatchTypeTag, OriginTag, PartPhoto } from './PartCrossReferenceCard';
import {
  rsfcPimAttributes,
  sortEquivalents,
  type CompetitorPart,
  type RsfcEquivalent,
  type RsfcOrigin,
} from '../data/partCrossReferenceData';
import { sizeLabel } from '../data/pimDisplayMapping';
import {
  hydraBaseMedium,
  hydraSmallNormal,
  hydraTextStyleToReactCss,
  hydraTitleHeading5,
} from '../../theme/hydraTypography';
import { Alert, Button, Flex, Modal, Segmented, Typography, message, theme } from '../../ui/antd';

type OriginFilter = 'all' | RsfcOrigin;

type Props = {
  part: CompetitorPart | null;
  onClose: () => void;
};

/** Modal width: 232 px competitor panel + the match list. Narrowed from 880 px on 17 Nov 2026 (Milos). */
const MODAL_WIDTH = 760;
const COMPETITOR_PANEL = 232;
const PHOTO = 72;

function meta(...parts: Array<string | undefined>): string {
  return parts.filter(Boolean).join(' · ');
}

/**
 * Match details, version 1 (chosen 17 Nov 2026): today's two-column layout in the part card language.
 * Content and functions unchanged, as Matt asked (BOM-431): competitor part on the left; RSFC parts best first on the
 * right with origin filter, copy SKU, View product, Submittal PDF and warnings. Adds real photos, bordered tags and
 * the card meta line. Empty values are hidden (PIM display mapping), so no "Not specified".
 */
export function PartCrossReferenceMatchModal({ part, onClose }: Props) {
  const { token } = theme.useToken();
  const [origin, setOrigin] = useState<OriginFilter>('all');

  useEffect(() => {
    setOrigin('all');
  }, [part?.sku]);

  const equivalents = useMemo(() => (part ? sortEquivalents(part.equivalents) : []), [part]);
  const visible = origin === 'all' ? equivalents : equivalents.filter((e) => e.origin === origin);
  const countFor = (o: RsfcOrigin) => equivalents.filter((e) => e.origin === o).length;
  const small = hydraTextStyleToReactCss(hydraSmallNormal);

  const attributes = part
    ? ([
        ['Brand', part.brand],
        ['Figure', part.figure],
        ['Size', part.size ? sizeLabel(part.size) : undefined],
        ['Material', part.material],
      ].filter(([, value]) => Boolean(value)) as Array<[string, string]>)
    : [];

  return (
    <Modal
      open={part !== null}
      onCancel={onClose}
      title={part ? `Match details · ${part.sku}` : undefined}
      width={MODAL_WIDTH}
      destroyOnHidden
      footer={
        <Button type="primary" onClick={onClose}>
          Done
        </Button>
      }
    >
      {part ? (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: `${COMPETITOR_PANEL}px minmax(0, 1fr)`,
            gap: token.marginLG,
            alignItems: 'start',
            paddingBlock: token.paddingXS,
          }}
        >
          {/* Competitor part: label → identity (SKU + name) → hairline → attributes */}
          <Flex
            vertical
            gap={token.marginXS}
            aria-label="Competitor part"
            style={{
              padding: token.paddingSM,
              background: token.colorFillAlter,
              border: `${token.lineWidth}px ${token.lineType} ${token.colorBorderSecondary}`,
              borderRadius: token.borderRadiusLG,
            }}
          >
            <Typography.Text type="secondary" style={small}>
              Competitor part
            </Typography.Text>
            <Flex
              vertical
              gap={token.marginXXS}
              style={{
                paddingBottom: token.padding,
                borderBottom: `${token.lineWidth}px ${token.lineType} ${token.colorBorderSecondary}`,
              }}
            >
              <Typography.Text style={hydraTextStyleToReactCss(hydraBaseMedium)}>{part.sku}</Typography.Text>
              <Typography.Text type="secondary" style={{ overflowWrap: 'anywhere' }}>
                {part.description}
              </Typography.Text>
            </Flex>
            <dl
              style={{
                display: 'grid',
                gridTemplateColumns: `${token.controlHeight * 2}px minmax(0, 1fr)`,
                gap: `${token.marginXS}px ${token.marginSM}px`,
                margin: 0,
                paddingTop: token.marginXS,
              }}
            >
              {attributes.map(([label, value]) => (
                <div key={label} style={{ display: 'contents' }}>
                  <dt style={{ color: token.colorTextTertiary }}>{label}</dt>
                  <dd style={{ margin: 0, minWidth: 0, overflowWrap: 'anywhere' }}>{value}</dd>
                </div>
              ))}
            </dl>
          </Flex>

          {/* RSFC parts, best first */}
          <Flex vertical gap={token.margin} style={{ minWidth: 0 }}>
            <Flex justify="space-between" align="center" gap={token.marginSM} wrap="wrap">
              <Typography.Title level={5} style={{ margin: 0, ...hydraTextStyleToReactCss(hydraTitleHeading5) }}>
                {equivalents.length} RSFC match{equivalents.length === 1 ? '' : 'es'}
              </Typography.Title>
              {equivalents.length > 1 ? (
                <Segmented<OriginFilter>
                  aria-label="Origin"
                  value={origin}
                  onChange={setOrigin}
                  options={[
                    { value: 'all', label: `All (${equivalents.length})` },
                    { value: 'Domestic', label: `Domestic (${countFor('Domestic')})`, disabled: countFor('Domestic') === 0 },
                    { value: 'Import', label: `Import (${countFor('Import')})`, disabled: countFor('Import') === 0 },
                  ]}
                />
              ) : null}
            </Flex>

            <Flex vertical gap={token.marginSM}>
              {visible.map((equivalent, index) => (
                <MatchRow
                  key={equivalent.sku}
                  part={part}
                  equivalent={equivalent}
                  best={index === 0 && origin === 'all' && equivalents.length > 1}
                  onNavigate={onClose}
                />
              ))}
            </Flex>
          </Flex>
        </div>
      ) : null}
    </Modal>
  );
}

/** One RSFC part, card language: 72 px photo beside tags / name / meta, then SKU with copy and the links. */
function MatchRow({
  part,
  equivalent,
  best,
  onNavigate,
}: {
  part: CompetitorPart;
  equivalent: RsfcEquivalent;
  best: boolean;
  onNavigate: () => void;
}) {
  const { token } = theme.useToken();
  const navigate = useNavigate();
  const small = hydraTextStyleToReactCss(hydraSmallNormal);
  const material = rsfcPimAttributes(part, equivalent).material;

  return (
    <Flex
      vertical
      gap={token.marginSM}
      style={{
        padding: token.paddingSM,
        background: token.colorBgContainer,
        border: `${token.lineWidth}px ${token.lineType} ${best ? token.colorPrimaryBorder : token.colorBorderSecondary}`,
        borderRadius: token.borderRadiusLG,
        boxShadow: token.boxShadowTertiary,
      }}
    >
      <Flex gap={token.marginSM} align="center" style={{ minWidth: 0 }}>
        <PartPhoto name={equivalent.name} size={PHOTO} />
        <Flex vertical justify="space-between" style={{ flex: 1, minWidth: 0, height: PHOTO }}>
          <Flex gap={token.marginXXS} wrap="wrap">
            <MatchTypeTag type={equivalent.matchType} />
            <OriginTag origin={equivalent.origin} />
          </Flex>
          <Typography.Text style={hydraTextStyleToReactCss(hydraBaseMedium)} ellipsis={{ tooltip: equivalent.name }}>
            {equivalent.name}
          </Typography.Text>
          <Typography.Text type="secondary" ellipsis style={small}>
            {meta(equivalent.brand, `Fig. ${equivalent.figure}`, `Size ${sizeLabel(equivalent.size)}`, material)}
          </Typography.Text>
        </Flex>
      </Flex>

      {equivalent.note ? <Alert type="warning" showIcon title={equivalent.note} /> : null}

      <Flex justify="space-between" align="center" gap={token.marginSM} wrap="wrap">
        <Flex align="center" gap={token.marginXXS}>
          <Typography.Text type="secondary">SKU</Typography.Text>
          <Typography.Text
            style={hydraTextStyleToReactCss(hydraBaseMedium)}
            copyable={{
              text: equivalent.sku,
              icon: <CopyOutlined aria-label={`Copy SKU ${equivalent.sku}`} />,
              tooltips: ['Copy SKU', 'Copied'],
              onCopy: () => message.success(`SKU ${equivalent.sku} copied`),
            }}
          >
            {equivalent.sku}
          </Typography.Text>
        </Flex>
        <Flex gap={token.margin} wrap="wrap">
          <Button
            type="link"
            size="small"
            icon={<LinkOutlined />}
            style={{ paddingInline: 0 }}
            onClick={() => {
              onNavigate();
              navigate(`/search/results?q=${encodeURIComponent(equivalent.sku)}`);
            }}
          >
            View product
          </Button>
          {equivalent.hasSubmittalPdf ? (
            <Button
              type="link"
              size="small"
              icon={<FilePdfOutlined />}
              style={{ paddingInline: 0 }}
              onClick={() => message.info('Submittal PDFs open from the product page in the live app.')}
            >
              Submittal PDF
            </Button>
          ) : null}
        </Flex>
      </Flex>
    </Flex>
  );
}
