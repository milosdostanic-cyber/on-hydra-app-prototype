import { ArrowRightOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { useMemo } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

import { bomSitePath, useActiveProject } from '../../context/ActiveProjectContext';
import {
  ASC_FIELD_MAPPING_TOTAL,
  bomAdvancedFieldMappingRoute,
  buildMappingSummaryEntries,
  countMappedAscFields,
  evaluateMappingConfidence,
  findDuplicateBomColumns,
  hasRequiredFieldMapping,
  mappingConfidenceLabel,
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
  hydraLargeStrong,
  hydraSmallStrong,
  hydraTextStyleToReactCss,
} from '../../theme/hydraTypography';
import {
  Alert,
  Button,
  Card,
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

  const fieldMapping = useMemo(() => resolveFieldMapping(uploadState.fieldMapping), [uploadState.fieldMapping]);
  const mappedCount = countMappedAscFields(fieldMapping);
  const mappingEntries = useMemo(() => buildMappingSummaryEntries(fieldMapping), [fieldMapping]);
  const confidence = evaluateMappingConfidence(fieldMapping);
  const duplicateColumns = findDuplicateBomColumns(fieldMapping);
  const canContinue = hasRequiredFieldMapping(fieldMapping) && duplicateColumns.size === 0;
  const alertCopy = confidenceAlertCopy(confidence, mappedCount, duplicateColumns.size);

  const projectMeta = bomProjectById(bomProjectId);
  const uploadFileName = readUploadFileName(uploadState);
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
        statusLabel={`${mappedCount} of ${ASC_FIELD_MAPPING_TOTAL} fields mapped`}
        statusTone={confidence === 'high' ? 'success' : 'warning'}
      />

      <BomPageHeader
        title="Column mapping"
        description="We matched columns from your uploaded BOM to ASC fields. Continue if this looks right."
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

      <Card
        styles={{ body: { padding: 0 } }}
        style={{ width: '100%', borderRadius: token.borderRadiusLG }}
      >
        <Flex
          align="center"
          justify="space-between"
          wrap="wrap"
          gap={token.marginSM}
          style={{
            paddingInline: token.paddingMD,
            paddingBlock: token.paddingSM,
            borderBottom: `${token.lineWidth}px ${token.lineType} ${token.colorBorderSecondary}`,
            background: token.colorFillAlter,
          }}
        >
          <Typography.Text
            strong
            style={{ ...hydraTextStyleToReactCss(hydraSmallStrong), color: token.colorTextSecondary }}
          >
            Mapped columns
          </Typography.Text>
          <Tag color={confidenceTagColor}>{mappingConfidenceLabel(confidence)}</Tag>
        </Flex>

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
              style={{ ...hydraTextStyleToReactCss(hydraSmallStrong), color: token.colorPrimary }}
            >
              YOUR BOM COLUMN
            </Typography.Text>
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
          {mappingEntries.map(({ bomColumn, ascLabel, ascKey }, idx) => (
            <Flex
              key={ascKey}
              align="center"
              gap={token.marginXS}
              style={{
                paddingInline: token.paddingMD,
                paddingBlock: token.paddingSM,
                borderBottom:
                  idx < mappingEntries.length - 1
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
                  background: token.colorPrimaryBg,
                  border: `${token.lineWidth}px ${token.lineType} ${token.colorPrimaryBorder}`,
                  borderRadius: token.borderRadius,
                }}
              >
                <Typography.Text
                  strong
                  style={{
                    ...hydraTextStyleToReactCss(hydraLargeStrong),
                    color: token.colorPrimary,
                  }}
                >
                  {bomColumn}
                </Typography.Text>
                <CheckCircleOutlined
                  style={{ color: token.colorSuccess, fontSize: hydraBaseNormal.fontSize }}
                />
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

              <Flex
                flex={1}
                align="center"
                style={{
                  minWidth: 0,
                  minHeight: token.controlHeightLG,
                  paddingInline: token.paddingSM,
                  paddingBlock: token.paddingXS,
                  background: token.colorFillQuaternary,
                  border: `${token.lineWidth}px ${token.lineType} ${token.colorBorderSecondary}`,
                  borderRadius: token.borderRadius,
                }}
              >
                <Typography.Text style={hydraTextStyleToReactCss(hydraBaseNormal)}>{ascLabel}</Typography.Text>
              </Flex>
            </Flex>
          ))}
        </Space>
      </Card>
    </Space>
  );
}
