import {
  projectStagesToV2,
  v2CurrentStepCopy,
  v2ProcessingPercent,
  v2ProcessingStageLabel,
  v2StageDetail,
  V2_PROCESSING_STAGE_ORDER,
  type SpecV2ProcessingStageId,
} from '../constants/specWorkflowStatus';
import { systemTypeDivision, systemTypeLabel } from '../constants/specStatusVocabulary';
import type { SpecDocument, SpecProcessingStage } from '../data/types';
import { Alert, Button, Divider, Flex, Steps, Typography, theme } from '../../ui/antd';
import { SpecAnalysisProgressStrip } from './SpecAnalysisProgressStrip';

function stepStatus(stage: SpecProcessingStage): 'wait' | 'process' | 'finish' | 'error' {
  if (stage.state === 'done') return 'finish';
  if (stage.state === 'active') return 'process';
  if (stage.state === 'failed') return 'error';
  return 'wait';
}

export function SpecProcessingStages({
  document,
  onRetry,
  onReplaceFile,
  onOpenPartial,
  replaceError,
}: {
  document: SpecDocument;
  onRetry?: () => void;
  onReplaceFile?: () => void;
  onOpenPartial?: () => void;
  replaceError?: string;
}) {
  const { token } = theme.useToken();
  const failed = document.processingState === 'failed';
  const partial = document.processingState === 'partial';
  const cancelled = document.processingState === 'cancelled';
  const stages = projectStagesToV2(document.stages);
  const percent = v2ProcessingPercent(document.stages, document.processingState);
  const currentStep = v2CurrentStepCopy(document, document.stages);
  const doneCount = stages.filter((stage) => stage.state === 'done').length;
  const division = document.divisionHint ?? systemTypeDivision[document.systemType];
  const categoryLine = `Division ${division} — ${systemTypeLabel[document.systemType]}`;

  return (
    <Flex vertical gap={token.marginLG} style={{ width: '100%' }}>
      <SpecAnalysisProgressStrip
        nested
        title={
          failed
            ? 'Analysis could not finish'
            : partial
              ? 'Partial results'
              : cancelled
                ? 'Analysis cancelled'
                : 'Analysis in progress'
        }
        stepDetail={`Current step: ${currentStep} · ${doneCount} of ${V2_PROCESSING_STAGE_ORDER.length} steps complete`}
        percent={percent}
        categoryLine={categoryLine}
      />

      {failed ? (
        <div aria-live="polite" aria-atomic="true" role="alert">
          <Alert
            type="error"
            showIcon
            title="Analysis could not finish"
            description={
              document.failureReason ??
              'Something went wrong while reading this file. Retry analysis, replace the file, or go back to the SPEC list.'
            }
          />
        </div>
      ) : null}

      {replaceError ? (
        <Alert
          type="error"
          showIcon
          title="This file could not be validated as a supported SPEC"
          description={replaceError}
        />
      ) : null}

      {partial ? (
        <Alert
          type="info"
          showIcon
          title="Partial results"
          description="Some sections finished and are labeled as partial. You can open them while the rest continues."
          action={
            onOpenPartial ? (
              <Button size="small" onClick={onOpenPartial}>
                Open analysis
              </Button>
            ) : undefined
          }
        />
      ) : null}

      {cancelled ? (
        <Alert
          type="info"
          showIcon
          title="Analysis was cancelled"
          description="Nothing was discarded from the SPEC list. You can retry analysis when you are ready."
        />
      ) : null}

      <Divider style={{ margin: 0 }} />

      <Flex vertical gap={token.marginSM}>
        <Typography.Title level={5} style={{ margin: 0 }}>
          Analysis steps
        </Typography.Title>
        <Steps
          direction="vertical"
          items={stages.map((stage) => {
            const id = stage.id as SpecV2ProcessingStageId;
            return {
              title: v2ProcessingStageLabel[id],
              description: v2StageDetail(stage, document),
              status: stepStatus(stage),
            };
          })}
        />
      </Flex>

      {failed || cancelled ? (
        <Flex gap={token.marginXS} wrap="wrap">
          {onRetry ? (
            <Button type="primary" size="large" onClick={onRetry}>
              Retry analysis
            </Button>
          ) : null}
          {failed && onReplaceFile ? (
            <Button size="large" onClick={onReplaceFile}>
              Replace file
            </Button>
          ) : null}
        </Flex>
      ) : null}
    </Flex>
  );
}
