import { useMemo } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

import { bomSitePath, resolveActiveConstructionProjectId, useActiveProject } from '../../context/ActiveProjectContext';
import { mappingStepStatusLabel } from '../bomUploadFlowStatus';
import {
  ASC_FIELD_MAPPING_TOTAL,
  bomAdvancedFieldMappingRoute,
  buildMappingSummaryEntries,
  countMappedAscFields,
  deriveFieldMappingForUpload,
  evaluateMappingConfidence,
  findDuplicateBomColumns,
  getMissingRequiredFieldLabels,
  hasRequiredFieldMapping,
  isConcatenatedColumnUpload,
  mappingConfidenceLabel,
  PARSING_IDENTIFIER_MAPPING_TOOLTIP,
} from '../bomFieldMappingUtils';
import type { BomUploadFlowLocationState } from '../bomUploadFlowState';
import { readUploadFileName } from '../bomUploadFlowState';
import { BomFieldMappingTable } from '../components/BomFieldMappingTable';
import { BomUploadFlowStepChrome } from '../components/BomUploadFlowStepChrome';
import { BomPageHeader } from '../layout/BomPageHeader';
import { bomProjectById } from '../data/mockData';
import { useBomCancelUpload } from '../hooks/useBomCancelUpload';
import { useBomImportSession } from '../hooks/useBomImportSession';
import {
  hydraBaseNormal,
  hydraBaseStrong,
  hydraTextStyleToReactCss,
} from '../../theme/hydraTypography';
import {
  Alert,
  Button,
  Flex,
  Space,
  Tag,
  Tooltip,
  Typography,
  message,
  theme,
} from '../../ui/antd';

function confidenceAlertCopy(
  confidence: ReturnType<typeof evaluateMappingConfidence>,
  mappedCount: number,
  duplicateCount: number,
  fieldMapping: ReturnType<typeof deriveFieldMappingForUpload>,
): { type: 'success' | 'warning' | 'error'; message: string; description: string } {
  if (confidence === 'blocked') {
    if (duplicateCount > 0) {
      return {
        type: 'error',
        message: 'We need you to fix your column links',
        description:
          'Two or more fields point to the same spreadsheet column. Open Review columns to fix duplicates before continuing.',
      };
    }
    const missing = getMissingRequiredFieldLabels(fieldMapping);
    const missingList = missing.length > 0 ? missing.join(', ') : 'Description, SKU or UPC';
    return {
      type: 'error',
      message: `${missingList} ${missing.length !== 1 ? 'are' : 'is'} not linked — import is blocked.`,
      description: `Link at least one of Description, SKU, or UPC in Review columns to continue.`,
    };
  }
  if (confidence === 'partial') {
    return {
      type: 'warning',
      message: `${mappedCount} of ${ASC_FIELD_MAPPING_TOTAL} columns linked`,
      description:
        'Some optional columns were not recognised by name. Review them quickly, then continue when you are ready.',
    };
  }
  return {
    type: 'success',
    message: `${mappedCount} of ${ASC_FIELD_MAPPING_TOTAL} columns linked`,
    description: '',
  };
}

function mappingSummaryPageDescription(
  confidence: ReturnType<typeof evaluateMappingConfidence>,
): string {
  if (confidence === 'high') {
    return 'We found these columns in your file and linked them to ASC fields automatically. If the links look right, continue — or use Review columns to adjust.';
  }
  if (confidence === 'partial') {
    return 'We found these columns in your file — some need linking before you can continue. Review them below.';
  }
  return "We couldn't link the required columns. Map them below to continue.";
}

function HighConfidenceConfirmAlertDescription() {
  const bodyStyle = hydraTextStyleToReactCss(hydraBaseNormal);
  const emphasisStyle = hydraTextStyleToReactCss(hydraBaseStrong);

  return (
    <Typography.Paragraph style={{ ...bodyStyle, marginBottom: 0 }}>
      Here are the columns we found in your file and how we linked them to ASC fields. We matched
      these automatically based on your column names.
      <br />
      If this looks right, <span style={emphasisStyle}>continue</span>. Otherwise, use{' '}
      <span style={emphasisStyle}>Review columns</span> to adjust any links.
    </Typography.Paragraph>
  );
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
  const continueDisabledTooltip = !canContinue
    ? duplicateColumns.size > 0
      ? 'Fix duplicate column links before continuing'
      : !hasRequiredFieldMapping(fieldMapping)
        ? PARSING_IDENTIFIER_MAPPING_TOOLTIP
        : undefined
    : undefined;
  const alertCopy = confidenceAlertCopy(confidence, mappedCount, duplicateColumns.size, fieldMapping);

  const projectMeta = bomProjectById(bomProjectId);
  const bomBackTarget = bomSitePath(resolveActiveConstructionProjectId(projectId));
  const flowBackTo = uploadState.uploadFlowBackTo ?? bomBackTarget;
  const flowBackLabel = uploadState.uploadFlowBackLabel ?? 'Back to BOM';
  const advancedMappingRoute = bomAdvancedFieldMappingRoute(bomProjectId);
  const { confirmCancelUpload } = useBomCancelUpload(bomProjectId);
  const { uploadId } = useBomImportSession(bomProjectId);

  const confidenceTagColor =
    confidence === 'high' ? 'success' : confidence === 'partial' ? 'warning' : 'error';

  function handleContinue() {
    if (!canContinue) {
      message.warning('Complete required column links before continuing.');
      return;
    }
    const nextState: BomUploadFlowLocationState = {
      ...uploadState,
      fieldMapping,
      mappingConfidence: confidence,
      uploadId: uploadId ?? uploadState.uploadId,
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
        title="Review your columns"
        description={mappingSummaryPageDescription(confidence)}
        actions={
          <Flex gap={token.marginXS} align="center" wrap="wrap">
            <Button size="large" onClick={() => confirmCancelUpload('map')}>
              Cancel upload
            </Button>
            <Button
              size="large"
              type={confidence === 'blocked' ? 'primary' : 'default'}
              danger={confidence === 'blocked'}
              onClick={handleReviewMapping}
            >
              Review columns
            </Button>
            <Tooltip title={continueDisabledTooltip}>
              <span>
                <Button
                  type="primary"
                  size="large"
                  disabled={!canContinue}
                  onClick={canContinue ? handleContinue : undefined}
                >
                  Continue
                </Button>
              </span>
            </Tooltip>
          </Flex>
        }
      />

      <Alert
        type={alertCopy.type}
        showIcon
        message={alertCopy.message}
        description={
          confidence === 'high' ? (
            <HighConfidenceConfirmAlertDescription />
          ) : (
            alertCopy.description
          )
        }
      />

      {isConcatenatedUpload ? (
        <Alert
          type="warning"
          showIcon
          message="Single combined column detected"
          description="Your file appears to have one column with mixed part information. We matched it to Description by default. Match accuracy may be lower until you add more detail or use Review columns to adjust."
        />
      ) : null}

      <BomFieldMappingTable
        mode="view"
        viewRows={mappingEntries}
        cardStyle={{ opacity: 0.7 }}
        topStrip={
          <>
            <Typography.Text
              strong
              style={{ ...hydraTextStyleToReactCss(hydraBaseStrong), color: token.colorTextSecondary }}
            >
              HOW WE LINKED YOUR COLUMNS
            </Typography.Text>
            {confidence === 'high' ? (
              <Tag color={confidenceTagColor}>Matched with high confidence</Tag>
            ) : (
              <Tag color={confidenceTagColor}>{mappingConfidenceLabel(confidence)}</Tag>
            )}
          </>
        }
      />
    </Space>
  );
}
