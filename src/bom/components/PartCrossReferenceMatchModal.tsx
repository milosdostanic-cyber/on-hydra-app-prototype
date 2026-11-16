import { CopyOutlined, FilePdfOutlined, LinkOutlined, PictureOutlined } from '@ant-design/icons';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  sortEquivalents,
  type CompetitorPart,
  type RsfcEquivalent,
  type RsfcOrigin,
} from '../data/partCrossReferenceData';
import {
  hydraBaseMedium,
  hydraBaseNormal,
  hydraTextStyleToReactCss,
  hydraTitleHeading5,
} from '../../theme/hydraTypography';
import { HydraColorfulTag } from '../../ui/HydraTag';
import {
  Alert,
  Avatar,
  Button,
  Card,
  Descriptions,
  Flex,
  Modal,
  Segmented,
  Typography,
  message,
  theme,
} from '../../ui/antd';

type OriginFilter = 'all' | RsfcOrigin;

type Props = {
  part: CompetitorPart | null;
  onClose: () => void;
};

/** Figma BOM - RSFC 1.4–1.6 — competitor part on the left, RSFC equivalents (best match first) on the right. */
export function PartCrossReferenceMatchModal({ part, onClose }: Props) {
  const { token } = theme.useToken();
  const [origin, setOrigin] = useState<OriginFilter>('all');

  useEffect(() => {
    setOrigin('all');
  }, [part?.sku]);

  const equivalents = useMemo(() => (part ? sortEquivalents(part.equivalents) : []), [part]);
  const visible = origin === 'all' ? equivalents : equivalents.filter((e) => e.origin === origin);
  const countFor = (o: RsfcOrigin) => equivalents.filter((e) => e.origin === o).length;

  const labelStyle = { color: token.colorTextDescription, ...hydraTextStyleToReactCss(hydraBaseNormal) };

  return (
    <Modal
      open={part !== null}
      onCancel={onClose}
      title={part ? `Match details · ${part.sku}` : undefined}
      width={token.screenLG}
      destroyOnHidden
      footer={
        <Button type="primary" onClick={onClose}>
          Done
        </Button>
      }
    >
      {part ? (
        <Flex gap={token.marginLG} align="flex-start" wrap="wrap" style={{ paddingBlock: token.paddingXS }}>
          <Flex
            vertical
            gap={token.marginXS}
            style={{
              flex: `0 0 ${token.controlHeight * 9}px`,
              padding: token.padding,
              background: token.colorFillQuaternary,
              borderRadius: token.borderRadiusLG,
            }}
          >
            <Typography.Text style={hydraTextStyleToReactCss(hydraBaseMedium)}>Competitor part</Typography.Text>
            <Descriptions
              column={1}
              size="small"
              colon={false}
              styles={{ label: { ...labelStyle, width: token.controlHeight * 3 }, content: hydraTextStyleToReactCss(hydraBaseNormal) }}
              items={[
                { key: 'description', label: 'Description', children: part.description },
                { key: 'brand', label: 'Brand', children: part.brand },
                { key: 'sku', label: 'SKU', children: part.sku },
                { key: 'figure', label: 'Figure No.', children: part.figure },
                { key: 'size', label: 'Size', children: part.size },
                {
                  key: 'material',
                  label: 'Material',
                  children: part.material ?? <Typography.Text type="secondary">Not specified</Typography.Text>,
                },
              ]}
            />
          </Flex>

          <Flex vertical gap={token.margin} style={{ flex: '1 1 0', minWidth: token.screenXS }}>
            <Flex justify="space-between" align="center" gap={token.marginSM} wrap="wrap">
              <Flex vertical gap={token.marginXXS}>
                <Typography.Title level={5} style={{ margin: 0, ...hydraTextStyleToReactCss(hydraTitleHeading5) }}>
                  {equivalents.length} RSFC equivalent{equivalents.length === 1 ? '' : 's'}
                </Typography.Title>
                <Typography.Text type="secondary">
                  {equivalents.length > 1
                    ? 'Best match first. Filter by product origin.'
                    : 'Only one equivalent is available for this part.'}
                </Typography.Text>
              </Flex>
              {equivalents.length > 1 ? (
                <Segmented<OriginFilter>
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
              {visible.map((equivalent) => (
                <EquivalentCard key={equivalent.sku} equivalent={equivalent} onNavigate={onClose} />
              ))}
            </Flex>
          </Flex>
        </Flex>
      ) : null}
    </Modal>
  );
}

function EquivalentCard({ equivalent, onNavigate }: { equivalent: RsfcEquivalent; onNavigate: () => void }) {
  const { token } = theme.useToken();
  const navigate = useNavigate();

  return (
    <Card size="small" styles={{ body: { padding: token.padding } }} style={{ borderColor: token.colorBorderSecondary }}>
      <Flex gap={token.margin} align="flex-start">
        <Avatar shape="square" size={token.controlHeightLG * 1.6} icon={<PictureOutlined />} alt="" />
        <Flex vertical gap={token.marginXS} style={{ flex: 1, minWidth: 0 }}>
          <Flex gap={token.marginXS} wrap="wrap">
            <HydraColorfulTag preset={equivalent.matchType === 'Exact match' ? 'green' : 'gold'}>
              {equivalent.matchType}
            </HydraColorfulTag>
            <HydraColorfulTag preset={equivalent.origin === 'Domestic' ? 'blue' : 'purple'}>
              {equivalent.origin}
            </HydraColorfulTag>
          </Flex>
          <Flex vertical gap={token.marginXXS}>
            <Typography.Text style={hydraTextStyleToReactCss(hydraBaseMedium)}>{equivalent.name}</Typography.Text>
            <Typography.Text type="secondary">
              {equivalent.brand} · Fig. {equivalent.figure} · Size {equivalent.size}
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
          {equivalent.note ? <Alert type="warning" showIcon title={equivalent.note} /> : null}
        </Flex>
        <Flex align="center" gap={token.marginXXS} style={{ flexShrink: 0 }}>
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
      </Flex>
    </Card>
  );
}
