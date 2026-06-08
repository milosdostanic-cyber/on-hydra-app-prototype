import { ArrowRightOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

import { bomSitePath, useActiveProject } from '../../context/ActiveProjectContext';
import type { BomUploadFlowLocationState } from '../bomUploadFlowState';
import { readUploadFileName } from '../bomUploadFlowState';
import { BomUploadFlowStepChrome } from '../components/BomUploadFlowStepChrome';
import { BomPageHeader } from '../layout/BomPageHeader';
import { bomProjectById } from '../data/mockData';
import { useBomCancelUpload } from '../hooks/useBomCancelUpload';
import {
  hydraBaseNormal,
  hydraLargeNormal,
  hydraLargeStrong,
  hydraSmallStrong,
  hydraTextStyleToReactCss,
} from '../../theme/hydraTypography';
import {
  Button,
  Card,
  Flex,
  Select,
  Space,
  Typography,
  message,
  theme,
} from '../../ui/antd';

const SKIP_VALUE = '--Skip--';

const BOM_SOURCE_FIELDS = [
  SKIP_VALUE,
  'BRAND',
  'DESCRIPTION',
  'FIGURE NUM',
  'FINISH',
  'MFR NUM',
  'INSTALL TYPE',
  'MANUFACTURER',
  'MATERIAL',
  'PART NUMBER',
  'QTY',
  'SKU',
  'UNIT',
  'UPC',
];

/** Figma 5202:19667 — 9 visible rows + 4 below fold; badge default "11 of 13 fields mapped". */
const ASC_DEST_FIELDS = [
  { key: 'PART NUMBER', label: 'Part Number' },
  { key: 'DESCRIPTION', label: 'Description' },
  { key: 'SKU', label: 'SKU' },
  { key: 'UPC', label: 'UPC' },
  { key: 'FIGURE NUM', label: 'Figure Number' },
  { key: 'FINISH', label: 'Finish' },
  { key: 'MFR NUM', label: 'Mfr Number' },
  { key: 'INSTALL TYPE', label: 'Install Type' },
  { key: 'MANUFACTURER', label: 'Manufacturer' },
  { key: 'QTY', label: 'Quantity' },
  { key: 'BRAND', label: 'Brand' },
  { key: 'MATERIAL', label: 'Material' },
  { key: 'UNIT', label: 'Unit' },
] as const;

type AliasMap = Record<string, string | undefined>;

const DEFAULT_ALIAS: AliasMap = {
  'PART NUMBER': 'PART NUMBER',
  DESCRIPTION: 'DESCRIPTION',
  SKU: SKIP_VALUE,
  UPC: SKIP_VALUE,
  'FIGURE NUM': 'FIGURE NUM',
  FINISH: 'FINISH',
  'MFR NUM': 'MFR NUM',
  'INSTALL TYPE': 'INSTALL TYPE',
  MANUFACTURER: 'MANUFACTURER',
  QTY: 'QTY',
  BRAND: 'BRAND',
  MATERIAL: 'MATERIAL',
  UNIT: 'UNIT',
};

function normalizeSkip(val: string | undefined) {
  if (!val || val === SKIP_VALUE) return undefined;
  return val;
}

export function BomFieldMappingPage() {
  const { token } = theme.useToken();
  const { bomProjectId = '' } = useParams<{ bomProjectId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { projectId } = useActiveProject();
  const uploadState =
    typeof location.state === 'object' && location.state && !Array.isArray(location.state)
      ? (location.state as BomUploadFlowLocationState)
      : {};
  const [aliasMap, setAliasMap] = useState<AliasMap>(() => {
    const saved = uploadState.fieldMapping;
    if (saved && Object.keys(saved).length > 0) {
      return { ...DEFAULT_ALIAS, ...saved };
    }
    return { ...DEFAULT_ALIAS };
  });

  const projectMeta = bomProjectById(bomProjectId);
  const uploadFileName = readUploadFileName(uploadState);

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

  const bomBackTarget = bomSitePath(projectId);
  const flowBackTo = uploadState.uploadFlowBackTo ?? bomBackTarget;
  const flowBackLabel = uploadState.uploadFlowBackLabel ?? 'Back to BOM';
  const { confirmCancelUpload } = useBomCancelUpload(bomProjectId);

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
    const uploadBase: BomUploadFlowLocationState = { ...uploadState };
    navigate(`/bom/projects/${bomProjectId}/parsing-review`, {
      state: { ...uploadBase, fieldMapping: aliasMap },
    });
  }

  function handleReset() {
    setAliasMap({ ...DEFAULT_ALIAS });
  }

  if (bomProjectId && bomProjectId !== 'new' && !projectMeta) {
    return (
      <Space orientation="vertical" size={token.marginLG} style={{ width: '100%' }}>
        <BomPageHeader title="BOM project not found" />
        <Button type="primary" size="large" onClick={() => navigate(bomBackTarget)}>
          Go to BOM home
        </Button>
      </Space>
    );
  }

  return (
    <Space orientation="vertical" size={token.marginLG} style={{ width: '100%' }}>
      <BomUploadFlowStepChrome
        backTo={flowBackTo}
        backLabel={flowBackLabel}
        backState={uploadState}
        fileName={uploadFileName}
        currentStep={0}
        statusLabel={`${mappedCount} of ${totalFields} fields mapped`}
      />

      <BomPageHeader
        title="Field mapping"
        description="Map columns from your uploaded BOM to ASC fields before parsing. New BOM project."
        actions={
          <Flex gap={token.marginXS} align="center" wrap="wrap">
            <Button size="large" onClick={() => confirmCancelUpload('map')}>
              Cancel upload
            </Button>
            <Button
              type="primary"
              size="large"
              onClick={handleSave}
              disabled={!hasRequired || duplicateBomColumns.size > 0}
            >
              Save mapping &amp; continue
            </Button>
          </Flex>
        }
      />

      {/* Mapping table — Projects Container gap 12; row pad 16/12, inner gap 8 */}
      <Card
        styles={{ body: { padding: 0 } }}
        style={{ width: '100%', borderRadius: token.borderRadiusLG }}
      >
        <Flex
          style={{
            borderBottom: `${token.lineWidth}px ${token.lineType} ${token.colorBorderSecondary}`,
            background: token.colorFillAlter,
          }}
        >
          <Flex
            align="center"
            style={{
              flex: 1,
              paddingInline: token.paddingMD,
              paddingBlock: token.paddingSM,
              minWidth: 0,
            }}
          >
            <Typography.Text
              strong
              style={{ ...hydraTextStyleToReactCss(hydraSmallStrong), color: token.colorTextSecondary }}
            >
              ASC FIELD
            </Typography.Text>
          </Flex>
          <Flex
            align="center"
            justify="space-between"
            gap={token.marginXS}
            style={{
              flex: 1,
              paddingInline: token.paddingMD,
              paddingBlock: token.paddingSM,
              minWidth: 0,
            }}
          >
            <Typography.Text
              strong
              style={{ ...hydraTextStyleToReactCss(hydraSmallStrong), color: token.colorPrimary }}
            >
              YOUR BOM COLUMN
            </Typography.Text>
            <Button type="link" onClick={handleReset} style={{ padding: 0, height: 'auto', flexShrink: 0 }}>
              Reset to Defaults
            </Button>
          </Flex>
        </Flex>

        <Space orientation="vertical" size={0} style={{ width: '100%' }}>
          {ASC_DEST_FIELDS.map(({ key, label }, idx) => {
            const raw = aliasMap[key];
            const normalized = normalizeSkip(raw);
            const isMapped = Boolean(normalized);
            const dup = normalized && duplicateBomColumns.has(normalized);
            const chipTypography = isMapped ? hydraLargeStrong : hydraLargeNormal;
            return (
              <Flex
                key={key}
                align="center"
                gap={token.marginXS}
                style={{
                  paddingInline: token.paddingMD,
                  paddingBlock: token.paddingSM,
                  borderBottom:
                    idx < ASC_DEST_FIELDS.length - 1
                      ? `${token.lineWidth}px ${token.lineType} ${token.colorBorderSecondary}`
                      : undefined,
                }}
              >
                <Flex
                  flex={1}
                  align="center"
                  justify="space-between"
                  style={{
                    minWidth: 0,
                    minHeight: token.controlHeightLG,
                    paddingInline: token.paddingSM,
                    paddingBlock: token.paddingXS,
                    background: isMapped ? token.colorPrimaryBg : token.colorFillQuaternary,
                    border: `${token.lineWidth}px ${token.lineType} ${isMapped ? token.colorPrimaryBorder : token.colorBorderSecondary}`,
                    borderRadius: token.borderRadius,
                  }}
                >
                  <Typography.Text
                    style={{
                      ...hydraTextStyleToReactCss(chipTypography),
                      color: isMapped ? token.colorPrimary : token.colorTextTertiary,
                    }}
                  >
                    {label}
                  </Typography.Text>
                  {isMapped ? (
                    <CheckCircleOutlined
                      style={{ color: token.colorSuccess, fontSize: hydraLargeNormal.fontSize }}
                    />
                  ) : null}
                </Flex>

                <Flex
                  align="center"
                  justify="center"
                  style={{
                    width: token.fontSizeLG,
                    flexShrink: 0,
                    color: token.colorTextQuaternary,
                  }}
                >
                  <ArrowRightOutlined style={{ fontSize: hydraBaseNormal.fontSize }} />
                </Flex>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <Select
                    size="large"
                    value={raw ?? undefined}
                    onChange={(val) => setAliasMap((prev) => ({ ...prev, [key]: val }))}
                    placeholder={SKIP_VALUE}
                    style={{ width: '100%' }}
                    status={dup ? 'warning' : undefined}
                    options={BOM_SOURCE_FIELDS.map((f) => ({ value: f, label: f }))}
                  />
                </div>
              </Flex>
            );
          })}
        </Space>
      </Card>
    </Space>
  );
}
