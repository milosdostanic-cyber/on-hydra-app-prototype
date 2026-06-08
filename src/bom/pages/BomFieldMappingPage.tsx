import { ArrowRightOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

import { bomSitePath, useActiveProject } from '../../context/ActiveProjectContext';
import {
  ASC_DEST_FIELDS,
  BOM_FIELD_SKIP_VALUE,
  BOM_SOURCE_FIELDS,
  type BomFieldAliasMap,
} from '../bomFieldMappingConfig';
import {
  ASC_FIELD_MAPPING_TOTAL,
  bomMappingSummaryRoute,
  countMappedAscFields,
  evaluateMappingConfidence,
  findDuplicateBomColumns,
  hasRequiredFieldMapping,
  normalizeFieldMappingSkip,
  resolveFieldMapping,
} from '../bomFieldMappingUtils';
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
  const [aliasMap, setAliasMap] = useState<BomFieldAliasMap>(() => resolveFieldMapping(uploadState.fieldMapping));

  const projectMeta = bomProjectById(bomProjectId);
  const uploadFileName = readUploadFileName(uploadState);
  const mappingSummaryRoute = bomMappingSummaryRoute(bomProjectId);

  const mappedCount = countMappedAscFields(aliasMap);
  const duplicateBomColumns = useMemo(() => findDuplicateBomColumns(aliasMap), [aliasMap]);
  const hasRequired = hasRequiredFieldMapping(aliasMap);
  const bomBackTarget = bomSitePath(projectId);
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
    const confidence = evaluateMappingConfidence(aliasMap);
    const uploadBase: BomUploadFlowLocationState = {
      ...uploadState,
      fieldMapping: aliasMap,
      mappingConfidence: confidence,
    };
    navigate(`/bom/projects/${bomProjectId}/parsing-review`, {
      state: uploadBase,
    });
  }

  function handleReset() {
    setAliasMap(resolveFieldMapping());
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
        backTo={mappingSummaryRoute}
        backLabel="Back to mapping summary"
        backState={{ ...uploadState, fieldMapping: aliasMap }}
        fileName={uploadFileName}
        currentStep={0}
        statusLabel={`${mappedCount} of ${ASC_FIELD_MAPPING_TOTAL} fields mapped`}
      />

      <BomPageHeader
        title="Review mapping"
        description="Adjust how columns from your uploaded BOM map to ASC fields. Only change rows that look wrong."
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
              Reset to defaults
            </Button>
          </Flex>
          <Flex style={{ width: token.fontSizeLG, flexShrink: 0 }} />
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
        </Flex>

        <Space orientation="vertical" size={0} style={{ width: '100%' }}>
          {ASC_DEST_FIELDS.map(({ key, label }, idx) => {
            const raw = aliasMap[key];
            const normalized = normalizeFieldMappingSkip(raw);
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
                <div style={{ flex: 1, minWidth: 0 }}>
                  <Select
                    size="large"
                    value={raw ?? undefined}
                    onChange={(val) => setAliasMap((prev) => ({ ...prev, [key]: val }))}
                    placeholder={BOM_FIELD_SKIP_VALUE}
                    style={{ width: '100%' }}
                    status={dup ? 'warning' : undefined}
                    options={BOM_SOURCE_FIELDS.map((f) => ({ value: f, label: f }))}
                  />
                </div>

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
              </Flex>
            );
          })}
        </Space>
      </Card>
    </Space>
  );
}
