import { useMemo } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

import { bomSitePath, useActiveProject } from '../../context/ActiveProjectContext';
import { mappingStepStatusLabel } from '../bomUploadFlowStatus';
import {
  ASC_FIELD_MAPPING_TOTAL,
  bomAdvancedFieldMappingRoute,
  buildMappingSummaryEntries,
  countMappedAscFields,
  deriveFieldMappingForUpload,
  evaluateMappingConfidence,
  findDuplicateBomColumns,
  hasRequiredFieldMapping,
  isConcatenatedColumnUpload,
  mappingConfidenceLabel,
} from '../bomFieldMappingUtils';
import type { BomUploadFlowLocationState } from '../bomUploadFlowState';
import { readUploadFileName } from '../bomUploadFlowState';
import { BomFieldMappingTable } from '../components/BomFieldMappingTable';
import { BomUploadFlowStepChrome } from '../components/BomUploadFlowStepChrome';
import { BomPageHeader } from '../layout/BomPageHeader';
import { bomProjectById } from '../data/mockData';
import { useBomCancelUpload } from '../hooks/useBomCancelUpload';
import { hydraBaseStrong, hydraTextStyleToReactCss } from '../../theme/hydraTypography';
import {
  Alert,
  Button,
  Flex,
  Space,
  Tag,
  Typography,
  message,
  theme,
} from '../../ui/antd';

function confidenceAlertCopy(
  confidence: ReturnType<typeof evaluateMappingConfidence>,
  mappedCount: number,
  duplicateCount: number,
): { type: 'success' | 'warning' | 'error'; message: string; description: string } {
  if (confidence === 'blocked') {
    if (duplicateCount > 0) {
      return {
        type: 'error',
        message: 'We need you to fix the column mapping',
        description:
          'Two or more ASC fields point to the same BOM column. Open Review mapping to adjust duplicates before continuing.',
      };
    }
    return {
      type: 'error',
      message: 'Required columns are missing',
      description:
        'Part Number, Description, and Quantity must be mapped before we can parse your file. Open Review mapping to complete the required fields.',
    };
  }
  if (confidence === 'partial') {
    return {
      type: 'warning',
      message: `${mappedCount} of ${ASC_FIELD_MAPPING_TOTAL} fields matched from your column names`,
      description:
        'Some optional columns were not recognised by name. You can continue with the current mapping or open Review mapping to adjust.',
    };
  }
  return {
    type: 'success',
    message: `${mappedCount} of ${ASC_FIELD_MAPPING_TOTAL} fields matched from your column names`,
    description:
      'We matched these based on your column names — give them a quick look. Continue to review parsed rows, or open Review mapping to double-check.',
  };
}

export function BomMappingSummaryPage() {
  const { token } = theme.useToken();
  const { bomProjectId = '' } = useParams<{ bomProjectId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { projectId } = useActiveProject();
  const uploadState =
    typeof location.state === 'object' && location.state && !Array.isArray(location.state)
      ? (location.state as BomUploadFlowLocationState)
      : {};
  const uploadFileName = readUploadFileName(uploadState);

  const fieldMapping = useMemo(
    () => deriveFieldMappingForUpload(uploadFileName, uploadState.fieldMapping),
    [uploadFileName, uploadState.fieldMapping],
  );
  const isConcatenatedUpload = isConcatenatedColumnUpload(uploadFileName);
  const mappedCount = countMappedAscFields(fieldMapping);
  const mappingEntries = useMemo(() => buildMappingSummaryEntries(fieldMapping), [fieldMapping]);
  const confidence = evaluateMappingConfidence(fieldMapping);
  const duplicateColumns = findDuplicateBomColumns(fieldMapping);
  const canContinue = hasRequiredFieldMapping(fieldMapping) && duplicateColumns.size === 0;
  const alertCopy = confidenceAlertCopy(confidence, mappedCount, duplicateColumns.size);

  const projectMeta = bomProjectById(bomProjectId);
  const bomBackTarget = bomSitePath(projectId);
  const flowBackTo = uploadState.uploadFlowBackTo ?? bomBackTarget;
  const flowBackLabel = uploadState.uploadFlowBackLabel ?? 'Back to BOM';
  const advancedMappingRoute = bomAdvancedFieldMappingRoute(bomProjectId);
  const { confirmCancelUpload } = useBomCancelUpload(bomProjectId);

  const confidenceTagColor =
    confidence === 'high' ? 'success' : confidence === 'partial' ? 'warning' : 'error';

  function handleContinue() {
    if (!canContinue) {
      message.warning('Complete required mapping before continuing.');
      return;
    }
    const nextState: BomUploadFlowLocationState = {
      ...uploadState,
      fieldMapping,
      mappingConfidence: confidence,
    };
    navigate(`/bom/projects/${bomProjectId}/parsing-review`, { state: nextState });
  }

  function handleReviewMapping() {
    navigate(advancedMappingRoute, {
      state: { ...uploadState, fieldMapping },
    });
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
        statusLabel={mappingStepStatusLabel(mappedCount)}
        statusTone={confidence === 'high' ? 'success' : 'warning'}
      />

      <BomPageHeader
        title="Smart mapping summary"
        description="We mapped your uploaded BOM columns to ASC fields automatically. Give it a quick look, then continue."
        actions={
          <Flex gap={token.marginXS} align="center" wrap="wrap">
            <Button size="large" onClick={() => confirmCancelUpload('map')}>
              Cancel upload
            </Button>
            <Button size="large" onClick={handleReviewMapping}>
              Review mapping
            </Button>
            <Button type="primary" size="large" disabled={!canContinue} onClick={handleContinue}>
              Continue
            </Button>
          </Flex>
        }
      />

      <Alert
        type={alertCopy.type}
        showIcon
        message={alertCopy.message}
        description={alertCopy.description}
      />

      {isConcatenatedUpload ? (
        <Alert
          type="warning"
          showIcon
          message="Single combined column detected"
          description="Your file appears to have one column with mixed part information. We mapped it to Description by default. Match accuracy may be lower until you add more detail or refine mapping."
        />
      ) : null}

      <BomFieldMappingTable
        mode="view"
        viewRows={mappingEntries}
        topStrip={
          <>
            <Typography.Text
              strong
              style={{ ...hydraTextStyleToReactCss(hydraBaseStrong), color: token.colorTextSecondary }}
            >
              Mapped columns
            </Typography.Text>
            <Tag color={confidenceTagColor}>{mappingConfidenceLabel(confidence)}</Tag>
          </>
        }
      />
    </Space>
  );
}
