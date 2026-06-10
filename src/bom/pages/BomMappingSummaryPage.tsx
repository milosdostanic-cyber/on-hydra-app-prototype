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
        message: 'We need you to fix your column links',
        description:
          'Two or more fields point to the same spreadsheet column. Open Review columns to fix duplicates before continuing.',
      };
    }
    return {
      type: 'error',
      message: 'Required columns are missing',
      description:
        'Part Number, Description, and Quantity must be linked before we can read your file. Open Review columns to complete the required fields.',
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
    return 'We matched your columns to ASC fields automatically. If the links below look right, continue — otherwise use Review columns to adjust them.';
  }
  if (confidence === 'partial') {
    return 'We matched some columns from your file to ASC fields. Review the links below before continuing.';
  }
  return 'Link the required columns from your file to ASC fields before you can continue.';
}

function HighConfidenceConfirmAlertDescription() {
  const bodyStyle = hydraTextStyleToReactCss(hydraBaseNormal);
  const emphasisStyle = hydraTextStyleToReactCss(hydraBaseStrong);

  return (
    <Typography.Paragraph style={{ ...bodyStyle, marginBottom: 0 }}>
      Here&apos;s how we think your spreadsheet columns match our ASC fields. We linked these
      automatically based on your column names.
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
      message.warning('Complete required column links before continuing.');
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
        title="Review your columns"
        description={mappingSummaryPageDescription(confidence)}
        actions={
          <Flex gap={token.marginXS} align="center" wrap="wrap">
            <Button size="large" onClick={() => confirmCancelUpload('map')}>
              Cancel upload
            </Button>
            <Button size="large" onClick={handleReviewMapping}>
              Review columns
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
        topStrip={
          <>
            <Typography.Text
              strong
              style={{ ...hydraTextStyleToReactCss(hydraBaseStrong), color: token.colorTextSecondary }}
            >
              Linked columns
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
