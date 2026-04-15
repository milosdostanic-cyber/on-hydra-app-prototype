import { ArrowRightOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { BomPageHeader } from '../layout/BomPageHeader';
import { bomProjectById, bomProjectTitleById } from '../data/mockData';
import { PageBackButton } from '../../shell/PageBackButton';
import {
  Alert,
  Button,
  Card,
  Flex,
  Select,
  Space,
  Typography,
  message,
  theme,
} from '../../ui/antd';

const BOM_SOURCE_FIELDS = [
  '— Skip —',
  'BRAND',
  'DESCRIPTION',
  'FIGURE NUM',
  'FINISH',
  'MFR NUM',
  'INSTALL TYPE',
  'MANUFACTURER',
  'MATERIAL',
  'ORDER FLAG',
  'PART NUMBER',
  'QTY',
  'UNIT',
  'NOTES',
];

const ASC_DEST_FIELDS = [
  { key: 'PART NUMBER', label: 'Part Number' },
  { key: 'DESCRIPTION', label: 'Description' },
  { key: 'QTY', label: 'Quantity' },
  { key: 'BRAND', label: 'Brand' },
  { key: 'FIGURE NUM', label: 'Figure Number' },
  { key: 'FINISH', label: 'Finish' },
  { key: 'MFR NUM', label: 'Mfr Number' },
  { key: 'INSTALL TYPE', label: 'Install Type' },
  { key: 'MANUFACTURER', label: 'Manufacturer' },
  { key: 'MATERIAL', label: 'Material' },
  { key: 'ORDER FLAG', label: 'Order Flag' },
] as const;

type AliasMap = Record<string, string | undefined>;

const DEFAULT_ALIAS: AliasMap = {
  'PART NUMBER': 'PART NUMBER',
  DESCRIPTION: 'DESCRIPTION',
  QTY: 'QTY',
  BRAND: 'BRAND',
  'FIGURE NUM': 'FIGURE NUM',
  FINISH: 'FINISH',
  'MFR NUM': 'MFR NUM',
  'INSTALL TYPE': 'INSTALL TYPE',
  MANUFACTURER: 'MANUFACTURER',
  MATERIAL: 'MATERIAL',
  'ORDER FLAG': 'ORDER FLAG',
};

function normalizeSkip(val: string | undefined) {
  if (!val || val === '— Skip —') return undefined;
  return val;
}

export function BomFieldMappingPage() {
  const { token } = theme.useToken();
  const { bomProjectId = '' } = useParams<{ bomProjectId: string }>();
  const navigate = useNavigate();
  const [aliasMap, setAliasMap] = useState<AliasMap>({ ...DEFAULT_ALIAS });

  const projectMeta = bomProjectById(bomProjectId);
  const projectLabel = bomProjectTitleById(bomProjectId) ?? 'BOM project';

  const mappedValues = useMemo(
    () => Object.entries(aliasMap).map(([k, v]) => [k, normalizeSkip(v)] as const),
    [aliasMap],
  );
  const mappedCount = mappedValues.filter(([, v]) => Boolean(v)).length;
  const totalFields = ASC_DEST_FIELDS.length;

  const duplicateBomColumns = useMemo(() => {
    const counts = new Map<string, number>();
    for (const [, v] of mappedValues) {
      if (!v) continue;
      counts.set(v, (counts.get(v) ?? 0) + 1);
    }
    return new Set([...counts.entries()].filter(([, n]) => n > 1).map(([col]) => col));
  }, [mappedValues]);

  const hasRequired =
    Boolean(normalizeSkip(aliasMap['PART NUMBER'])) &&
    Boolean(normalizeSkip(aliasMap.DESCRIPTION)) &&
    Boolean(normalizeSkip(aliasMap.QTY));

  const categoryMapped = Boolean(normalizeSkip(aliasMap['FIGURE NUM']) || normalizeSkip(aliasMap.MATERIAL));

  function handleSave() {
    if (!hasRequired) {
      message.warning('Map Part Number, Description, and Quantity before continuing.');
      return;
    }
    if (duplicateBomColumns.size > 0) {
      message.error('Each BOM column can map to only one ASC field. Adjust duplicate mappings.');
      return;
    }
    message.success('Field mapping saved.');
    navigate(`/bom/projects/${bomProjectId}/parsing-review`, { state: { fieldMapping: aliasMap } });
  }

  function handleReset() {
    setAliasMap({ ...DEFAULT_ALIAS });
  }

  function handleCancel() {
    if (bomProjectId && bomProjectId !== 'new' && projectMeta) {
      navigate(`/bom/projects/${bomProjectId}/workspace`);
      return;
    }
    navigate('/bom');
  }

  if (bomProjectId && bomProjectId !== 'new' && !projectMeta) {
    return (
      <Space orientation="vertical" size={token.marginLG} style={{ width: '100%' }}>
        <BomPageHeader
          title="BOM project not found"
          description="This project id is not in the demo list."
          actions={
            <Button type="primary" size="large" onClick={() => navigate('/bom')}>
              Go to BOM home
            </Button>
          }
        />
      </Space>
    );
  }

  return (
    <Space orientation="vertical" size={token.marginLG} style={{ width: '100%' }}>
      <PageBackButton to="/bom">Back to BOM</PageBackButton>
      <BomPageHeader
        title="Field mapping"
        description={`Map columns from your uploaded BOM to ASC fields before parsing. ${projectLabel}.`}
        actions={
          <Space wrap>
            <Button size="large" onClick={handleCancel}>
              Cancel
            </Button>
            <Button
              type="primary"
              size="large"
              onClick={handleSave}
              disabled={!hasRequired || duplicateBomColumns.size > 0}
            >
              Save mapping &amp; continue
            </Button>
          </Space>
        }
      />

      {!hasRequired ? (
        <Alert
          type="warning"
          showIcon
          message="Required mappings"
          description="Map at least Part Number, Description, and Quantity to continue."
        />
      ) : null}

      {duplicateBomColumns.size > 0 ? (
        <Alert
          type="error"
          showIcon
          message="Duplicate BOM column"
          description="Two or more ASC fields point at the same BOM column. Change one mapping."
        />
      ) : null}

      {!categoryMapped ? (
        <Alert
          type="info"
          showIcon
          message="Category not mapped"
          description="Matching accuracy may be lower until figure or material columns are mapped."
        />
      ) : null}

      <Flex gap={token.marginMD} align="flex-start" wrap="wrap">
        <Card
          styles={{ body: { padding: 0 } }}
          style={{ flex: '1 1 400px', minWidth: 0 }}
        >
          <Flex
            gap={token.marginSM}
            align="center"
            style={{
              paddingInline: token.paddingMD,
              paddingBlock: token.paddingSM,
              borderBottom: `${token.lineWidth}px ${token.lineType} ${token.colorBorderSecondary}`,
              background: token.colorFillAlter,
            }}
          >
            <div style={{ flex: 1 }}>
              <Typography.Text strong style={{ fontSize: token.fontSizeSM, color: token.colorTextSecondary }}>
                ASC FIELD
              </Typography.Text>
            </div>
            <div style={{ width: 36, flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <Typography.Text strong style={{ fontSize: token.fontSizeSM, color: token.colorPrimary }}>
                YOUR BOM COLUMN
              </Typography.Text>
            </div>
          </Flex>

          <Space orientation="vertical" size={0} style={{ width: '100%' }}>
            {ASC_DEST_FIELDS.map(({ key, label }, idx) => {
              const raw = aliasMap[key];
              const normalized = normalizeSkip(raw);
              const isMapped = Boolean(normalized);
              const dup = normalized && duplicateBomColumns.has(normalized);
              return (
                <Flex
                  key={key}
                  gap={token.marginSM}
                  align="center"
                  style={{
                    paddingInline: token.paddingMD,
                    paddingBlock: token.paddingSM,
                    borderBottom:
                      idx < ASC_DEST_FIELDS.length - 1
                        ? `${token.lineWidth}px ${token.lineType} ${token.colorBorderSecondary}`
                        : undefined,
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <Flex
                      align="center"
                      justify="space-between"
                      style={{
                        paddingInline: token.paddingMD,
                        paddingBlock: token.paddingXS,
                        background: isMapped ? token.colorPrimaryBg : token.colorFillQuaternary,
                        border: `${token.lineWidth}px ${token.lineType} ${isMapped ? token.colorPrimaryBorder : token.colorBorderSecondary}`,
                        borderRadius: token.borderRadius,
                        minHeight: token.controlHeight,
                      }}
                    >
                      <Typography.Text
                        strong={isMapped}
                        style={{
                          fontSize: token.fontSizeSM,
                          color: isMapped ? token.colorPrimary : token.colorTextTertiary,
                        }}
                      >
                        {label}
                      </Typography.Text>
                      {isMapped ? (
                        <CheckCircleOutlined style={{ color: token.colorSuccess, fontSize: token.fontSizeSM }} />
                      ) : null}
                    </Flex>
                  </div>

                  <Flex
                    align="center"
                    justify="center"
                    style={{
                      width: 36,
                      flexShrink: 0,
                      color: isMapped ? token.colorPrimary : token.colorBorderSecondary,
                    }}
                  >
                    <ArrowRightOutlined />
                  </Flex>

                  <div style={{ flex: 1 }}>
                    <Select
                      value={raw ?? undefined}
                      onChange={(val) => setAliasMap((prev) => ({ ...prev, [key]: val }))}
                      placeholder="Select BOM column…"
                      style={{ width: '100%' }}
                      status={dup ? 'warning' : undefined}
                      options={BOM_SOURCE_FIELDS.map((f) => ({ value: f, label: f }))}
                    />
                    {dup ? (
                      <Typography.Text type="warning" style={{ fontSize: token.fontSizeSM }}>
                        This BOM column is already mapped elsewhere.
                      </Typography.Text>
                    ) : null}
                  </div>
                </Flex>
              );
            })}
          </Space>
        </Card>

        <Flex vertical gap={token.marginSM} style={{ width: 220, flexShrink: 0 }}>
          <Card styles={{ body: { padding: token.paddingMD } }}>
            <Space orientation="vertical" size={token.marginSM} style={{ width: '100%' }}>
              <Typography.Text strong>Mapping status</Typography.Text>
              <Flex justify="space-between" align="center">
                <Typography.Text type="secondary" style={{ fontSize: token.fontSizeSM }}>
                  Fields mapped
                </Typography.Text>
                <Typography.Text strong>
                  {mappedCount} / {totalFields}
                </Typography.Text>
              </Flex>
            </Space>
          </Card>

          <Button block onClick={handleReset}>
            Reset to defaults
          </Button>
        </Flex>
      </Flex>
    </Space>
  );
}
