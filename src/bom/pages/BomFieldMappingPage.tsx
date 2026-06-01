import { ArrowRightOutlined, CheckCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

import type { BomUploadFlowLocationState } from '../bomUploadFlowState';
import { ASC_FIELD_MAPPING_TOTAL } from '../bomFieldMappingUtils';
import { BomImportProgressStrip } from '../components/BomImportProgressStrip';
import { useBomImportFlow } from '../context/BomImportFlowContext';
import { useBomImportSession } from '../hooks/useBomImportSession';
import { BomPageHeader } from '../layout/BomPageHeader';
import { bomProjectById, bomProjectTitleById } from '../data/mockData';
import { PageBackButton } from '../../shell/PageBackButton';
import {
  Alert,
  Button,
  Card,
  Flex,
  Modal,
  Select,
  Space,
  Tooltip,
  Typography,
  message,
  theme,
} from '../../ui/antd';
import {
  hydraBaseStrong,
  hydraLargeNormal,
  hydraSmallNormal,
  hydraTextStyleToReactCss,
} from '../../theme/hydraTypography';

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
  'SKU',
  'UPC',
  'UNIT',
  'NOTES',
];

const SAVE_MAPPING_DISABLED_TOOLTIP = 'Map at least Description, Figure Number, SKU, or UPC to continue.';

const ASC_DEST_FIELDS = [
  { key: 'PART NUMBER', label: 'Part Number' },
  { key: 'DESCRIPTION', label: 'Description' },
  { key: 'SKU', label: 'SKU' },
  { key: 'UPC', label: 'UPC' },
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
  DESCRIPTION: '— Skip —',
  SKU: '— Skip —',
  UPC: '— Skip —',
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
  const location = useLocation();
  const { ensureSession, updateProgress, dismissSession } = useBomImportFlow();
  const { session, uploadState, uploadId } = useBomImportSession(bomProjectId);
  const [aliasMap, setAliasMap] = useState<AliasMap>(() => ({
    ...DEFAULT_ALIAS,
    ...(uploadState.fieldMapping ?? {}),
  }));

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

  const hasProceedMapping =
    Boolean(normalizeSkip(aliasMap.DESCRIPTION)) ||
    Boolean(normalizeSkip(aliasMap['FIGURE NUM'])) ||
    Boolean(normalizeSkip(aliasMap.SKU)) ||
    Boolean(normalizeSkip(aliasMap.UPC));

  const canSaveMapping = hasProceedMapping && duplicateBomColumns.size === 0;
  const saveMappingDisabledTooltip = !hasProceedMapping
    ? SAVE_MAPPING_DISABLED_TOOLTIP
    : duplicateBomColumns.size > 0
      ? 'Each BOM column can map to only one ASC field. Adjust duplicate mappings.'
      : undefined;

  const categoryMapped = Boolean(normalizeSkip(aliasMap['FIGURE NUM']) || normalizeSkip(aliasMap.MATERIAL));

  useEffect(() => {
    if (!uploadId) return;
    updateProgress(uploadId, {
      currentStep: 'map',
      mappedAscFields: mappedCount,
      totalAscFields: ASC_FIELD_MAPPING_TOTAL,
      fieldMapping: aliasMap,
    });
  }, [uploadId, mappedCount, aliasMap, updateProgress]);

  function renderSaveMappingButton() {
    const button = (
      <Button type="primary" size="large" onClick={handleSave} disabled={!canSaveMapping}>
        Save mapping &amp; continue
      </Button>
    );

    if (!canSaveMapping) {
      return (
        <Tooltip title={saveMappingDisabledTooltip}>
          <span style={{ display: 'inline-block', cursor: 'not-allowed' }}>{button}</span>
        </Tooltip>
      );
    }

    return button;
  }

  function handleSave() {
    if (!hasProceedMapping) {
      message.warning(SAVE_MAPPING_DISABLED_TOOLTIP);
      return;
    }
    if (duplicateBomColumns.size > 0) {
      message.error('Each BOM column can map to only one ASC field. Adjust duplicate mappings.');
      return;
    }
    message.success('Field mapping saved.');
    const uploadBase: BomUploadFlowLocationState =
      typeof location.state === 'object' && location.state && !Array.isArray(location.state)
        ? { ...(location.state as BomUploadFlowLocationState) }
        : {};
    const fileName = uploadBase.uploadFileName ?? session?.progress.fileName ?? 'Uploaded file';
    const uploadId =
      session?.uploadId ??
      ensureSession(bomProjectId, fileName, aliasMap).uploadId;
    updateProgress(uploadId, {
      currentStep: 'review',
      mappedAscFields: mappedCount,
      totalAscFields: ASC_FIELD_MAPPING_TOTAL,
      fieldMapping: aliasMap,
    });
    navigate(`/bom/projects/${bomProjectId}/parsing-review`, {
      state: { ...uploadBase, fieldMapping: aliasMap, uploadId },
    });
  }

  function handleReset() {
    setAliasMap({ ...DEFAULT_ALIAS });
  }

  function handleCancel() {
    Modal.confirm({
      title: 'Cancel upload and lose mapping progress?',
      icon: <ExclamationCircleOutlined style={{ color: token.colorWarning }} />,
      centered: true,
      okText: 'Cancel upload',
      okType: 'danger',
      cancelText: 'Keep editing',
      content:
        'You are about to cancel the current translation/upload flow request. All unsaved field-mapping progress will be lost.',
      onOk: () => {
        const id = uploadId ?? session?.uploadId;
        if (id) dismissSession(id);
        if (bomProjectId && bomProjectId !== 'new' && projectMeta) {
          navigate(`/bom/projects/${bomProjectId}/workspace`);
          return;
        }
        navigate('/bom');
      },
    });
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
    <>
      <BomImportProgressStrip placement="shell-flush" progress={session.progress} />
      <Space orientation="vertical" size={token.marginLG} style={{ width: '100%' }}>
      <PageBackButton to="/bom">Back to BOM</PageBackButton>
      <BomPageHeader
        title="Field mapping"
        description={`Map columns from your uploaded BOM to ASC fields before parsing. ${projectLabel}.`}
        actions={
          <Space wrap>
            <Button size="large" onClick={handleCancel}>
              Cancel upload
            </Button>
            {renderSaveMappingButton()}
          </Space>
        }
      />

      {!hasProceedMapping ? (
        <Alert
          type="warning"
          showIcon
          message="Required mappings"
          description="Map at least one of: Description, Figure Number, SKU, or UPC to continue to parsing."
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
              <Typography.Text
                strong
                style={{ ...hydraTextStyleToReactCss(hydraBaseStrong), color: token.colorTextSecondary }}
              >
                ASC FIELD
              </Typography.Text>
            </div>
            <div style={{ width: 36, flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <Typography.Text
                strong
                style={{ ...hydraTextStyleToReactCss(hydraBaseStrong), color: token.colorPrimary }}
              >
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
                        style={{
                          ...hydraTextStyleToReactCss(hydraLargeNormal),
                          color: isMapped ? token.colorText : token.colorTextPlaceholder,
                        }}
                      >
                        {label}
                      </Typography.Text>
                      {isMapped ? (
                        <CheckCircleOutlined
                          style={{ color: token.colorSuccess, fontSize: token.fontSizeLG }}
                        />
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
                      size="large"
                      value={raw ?? undefined}
                      onChange={(val) => setAliasMap((prev) => ({ ...prev, [key]: val }))}
                      placeholder="Select BOM column…"
                      style={{ width: '100%' }}
                      status={dup ? 'warning' : undefined}
                      options={BOM_SOURCE_FIELDS.map((f) => ({ value: f, label: f }))}
                    />
                    {dup ? (
                      <Typography.Text type="warning" style={hydraTextStyleToReactCss(hydraSmallNormal)}>
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
                <Typography.Text type="secondary" style={hydraTextStyleToReactCss(hydraSmallNormal)}>
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
    </>
  );
}
