import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

import { bomSitePath, resolveActiveConstructionProjectId, useActiveProject } from '../../context/ActiveProjectContext';
import type { BomFieldAliasMap } from '../bomFieldMappingConfig';
import { mappingStepStatusLabel } from '../bomUploadFlowStatus';
import {
  bomMappingSummaryRoute,
  countMappedAscFields,
  evaluateMappingConfidence,
  findDuplicateBomColumns,
  getMissingRequiredFieldLabels,
  hasRequiredFieldMapping,
  deriveFieldMappingForUpload,
  PARSING_IDENTIFIER_MAPPING_TOOLTIP,
} from '../bomFieldMappingUtils';
import type { BomUploadFlowLocationState } from '../bomUploadFlowState';
import { readUploadFileName } from '../bomUploadFlowState';
import { BomFieldMappingTable } from '../components/BomFieldMappingTable';
import { BomUploadFlowStepChrome } from '../components/BomUploadFlowStepChrome';
import { BomPageHeader } from '../layout/BomPageHeader';
import { bomProjectById } from '../data/mockData';
import { useBomImportSession } from '../hooks/useBomImportSession';
import {
  hydraBaseStrong,
  hydraTextStyleToReactCss,
} from '../../theme/hydraTypography';
import { App, Alert, Button, Flex, Space, Tag, Tooltip, Typography, message, theme } from '../../ui/antd';

export function BomFieldMappingPage() {
  const { token } = theme.useToken();
  const { modal } = App.useApp();
  const { bomProjectId = '' } = useParams<{ bomProjectId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { projectId } = useActiveProject();
  const uploadState =
    typeof location.state === 'object' && location.state && !Array.isArray(location.state)
      ? (location.state as BomUploadFlowLocationState)
      : {};
  const uploadFileName = readUploadFileName(uploadState);
  const initialMapping = useMemo(
    () => deriveFieldMappingForUpload(uploadFileName, uploadState.fieldMapping),
    [uploadFileName, uploadState.fieldMapping],
  );
  const [aliasMap, setAliasMap] = useState<BomFieldAliasMap>(initialMapping);

  useEffect(() => {
    setAliasMap(initialMapping);
  }, [initialMapping]);

  const isDirty = useMemo(
    () => JSON.stringify(aliasMap) !== JSON.stringify(initialMapping),
    [aliasMap, initialMapping],
  );

  const projectMeta = bomProjectById(bomProjectId);
  const mappingSummaryRoute = bomMappingSummaryRoute(bomProjectId);

  const mappedCount = countMappedAscFields(aliasMap);
  const duplicateBomColumns = useMemo(() => findDuplicateBomColumns(aliasMap), [aliasMap]);
  const hasRequired = hasRequiredFieldMapping(aliasMap);
  const missingRequired = useMemo(() => getMissingRequiredFieldLabels(aliasMap), [aliasMap]);
  const requiredHeaderLabels = useMemo(() => 'DESCRIPTION, SKU OR UPC', []);
  const saveDisabled = !isDirty || !hasRequired || duplicateBomColumns.size > 0;
  const saveDisabledReason = !isDirty
    ? 'Change a column link before saving.'
    : !hasRequired
      ? PARSING_IDENTIFIER_MAPPING_TOOLTIP
      : duplicateBomColumns.size > 0
        ? 'Each file column can link to only one part detail. Fix duplicates first.'
        : undefined;
  const bomBackTarget = bomSitePath(resolveActiveConstructionProjectId(projectId));
  const { uploadId } = useBomImportSession(bomProjectId);

  function returnToMappingSummary(fieldMapping: BomFieldAliasMap) {
    const confidence = evaluateMappingConfidence(fieldMapping);
    navigate(mappingSummaryRoute, {
      state: {
        ...uploadState,
        fieldMapping,
        mappingConfidence: confidence,
        uploadId: uploadId ?? uploadState.uploadId,
      },
    });
  }

  function handleStopEditing() {
    const goBack = () => returnToMappingSummary(initialMapping);

    if (!isDirty) {
      goBack();
      return;
    }

    modal.confirm({
      title: 'Stop editing?',
      content: 'Unsaved mapping changes will be discarded.',
      okText: 'Stop editing',
      cancelText: 'Keep editing',
      centered: true,
      onOk: goBack,
    });
  }

  function handleSave() {
    if (!hasRequired) {
      message.warning(PARSING_IDENTIFIER_MAPPING_TOOLTIP);
      return;
    }
    if (duplicateBomColumns.size > 0) {
      message.error('Each BOM column can map to only one ASC field. Adjust duplicate mappings.');
      return;
    }
    message.success('Mapping saved.');
    returnToMappingSummary(aliasMap);
  }

  function handleResetDefaults() {
    setAliasMap(deriveFieldMappingForUpload(uploadFileName));
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
        statusLabel={mappingStepStatusLabel(mappedCount)}
      />

      <BomPageHeader
        title="Review column links"
        description="Link at least one of Description, SKU, or UPC to a column from your file. Optional rows can stay as Skip."
        actions={
          <Flex gap={token.marginXS} align="center" wrap="wrap">
            <Button size="large" onClick={handleStopEditing}>
              Stop editing
            </Button>
            <Tooltip title={saveDisabled ? saveDisabledReason : undefined}>
              <span>
                <Button
                  type="primary"
                  size="large"
                  onClick={handleSave}
                  disabled={saveDisabled}
                >
                  Save
                </Button>
              </span>
            </Tooltip>
          </Flex>
        }
      />

      {!hasRequired ? (
        <Alert
          type="error"
          showIcon
          message="Link at least Description, SKU, or UPC before you can save"
          description="At least one of the rows marked Required below must point to a column in your file. Everything else is optional."
        />
      ) : !isDirty ? (
        <Alert
          type="info"
          showIcon
          message="No changes yet"
          description="Adjust a column link above when something looks wrong, then save."
        />
      ) : null}

      <BomFieldMappingTable
        mode="edit"
        aliasMap={aliasMap}
        duplicateBomColumns={duplicateBomColumns}
        onAliasChange={(ascKey, bomColumn) =>
          setAliasMap((prev) => ({ ...prev, [ascKey]: bomColumn }))
        }
        onResetDefaults={handleResetDefaults}
        topStrip={
          <Flex align="center" gap={token.marginSM} wrap="wrap">
            <Typography.Text
              style={{ ...hydraTextStyleToReactCss(hydraBaseStrong), color: token.colorTextSecondary }}
            >
              REQUIRED: {requiredHeaderLabels}
            </Typography.Text>
            {missingRequired.length > 0 ? (
              <Tag color="error">{missingRequired.length} still to link</Tag>
            ) : (
              <Tag color="success">Required links complete</Tag>
            )}
          </Flex>
        }
      />
    </Space>
  );
}
