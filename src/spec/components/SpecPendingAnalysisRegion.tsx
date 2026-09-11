import { useEffect, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

import { BOM_SHELL_FLUSH_BELOW_BREADCRUMB_ID } from '../../shell/AppShell';
import { shellContentRailStyle } from '../../shell/shellContentRail';
import { Collapse, Flex, Typography, theme } from '../../ui/antd';
import { hydraLargeNormal, hydraTextStyleToReactCss } from '../../theme/hydraTypography';
import {
  projectStagesToV2,
  v2CurrentStepCopy,
  v2ProcessingPercent,
  v2ReanalysisPercent,
  v2ReanalysisStepDetail,
  V2_PROCESSING_STAGE_ORDER,
} from '../constants/specWorkflowStatus';
import type { SpecDocument } from '../data/types';
import { SpecAnalysisProgressStrip } from './SpecAnalysisProgressStrip';

type Props = {
  documents: SpecDocument[];
  onViewProgress: (document: SpecDocument) => void;
  defaultExpanded?: boolean;
};

function SpecPendingAnalysisShellSlot({ children }: { children: ReactNode }) {
  const { token } = theme.useToken();
  return (
    <div
      style={{
        width: '100%',
        background: token.colorWarningBg,
        boxShadow: token.boxShadowTertiary,
      }}
    >
      <div style={{ paddingInline: token.paddingLG, boxSizing: 'border-box' }}>
        <div style={shellContentRailStyle}>{children}</div>
      </div>
    </div>
  );
}

function stripPropsFor(document: SpecDocument): {
  title: string;
  stepDetail: string;
  percent: number;
} {
  const reanalysis =
    document.reanalysisRun?.status === 'queued' ||
    document.reanalysisRun?.status === 'processing';
  if (reanalysis && document.reanalysisRun) {
    const stages = document.reanalysisRun.stages;
    return {
      title: `Re-analysis in progress for "${document.title}"`,
      stepDetail: v2ReanalysisStepDetail(document.reanalysisRun),
      percent: v2ReanalysisPercent(stages),
    };
  }
  const stages = projectStagesToV2(document.stages);
  const doneCount = stages.filter((stage) => stage.state === 'done').length;
  const currentStep = v2CurrentStepCopy(document, document.stages);
  return {
    title: `Analysis in progress for "${document.title}"`,
    stepDetail: `Current step: ${currentStep} · ${doneCount} of ${V2_PROCESSING_STAGE_ORDER.length} steps complete`,
    percent: v2ProcessingPercent(document.stages, document.processingState),
  };
}

function SpecPendingAnalysisBody({
  documents,
  onViewProgress,
  defaultExpanded,
}: Props) {
  const { token } = theme.useToken();

  if (documents.length === 1) {
    const document = documents[0];
    const strip = stripPropsFor(document);
    return (
      <SpecAnalysisProgressStrip
        nested
        title={strip.title}
        stepDetail={strip.stepDetail}
        percent={strip.percent}
        actionLabel="View progress"
        onAction={() => onViewProgress(document)}
      />
    );
  }

  const count = documents.length;

  return (
    <Collapse
      bordered={false}
      expandIconPlacement="end"
      defaultActiveKey={defaultExpanded ? ['pending-analysis'] : []}
      style={{ background: 'transparent' }}
      styles={{
        header: {
          alignItems: 'center',
          background: 'transparent',
          paddingInline: 0,
          paddingBlock: token.paddingSM,
        },
        body: {
          background: 'transparent',
          padding: 0,
        },
      }}
      items={[
        {
          key: 'pending-analysis',
          label: (
            <Typography.Text style={hydraTextStyleToReactCss(hydraLargeNormal)}>
              {count} analyses pending completion.
            </Typography.Text>
          ),
          children: (
            <Flex vertical style={{ width: '100%' }}>
              {documents.map((document, index) => {
                const strip = stripPropsFor(document);
                return (
                  <div
                    key={document.id}
                    style={
                      index < documents.length - 1
                        ? {
                            borderBottom: `${token.lineWidth}px ${token.lineType} ${token.colorWarningBorder}`,
                          }
                        : undefined
                    }
                  >
                    <SpecAnalysisProgressStrip
                      nested
                      title={strip.title}
                      stepDetail={strip.stepDetail}
                      percent={strip.percent}
                      actionLabel="View progress"
                      onAction={() => onViewProgress(document)}
                    />
                  </div>
                );
              })}
            </Flex>
          ),
        },
      ]}
    />
  );
}

/**
 * Listing pending-analysis region — mirrors `BomPendingUploadsRegion` (portal into
 * the shell slot under breadcrumbs). Local SPEC composition only.
 */
export function SpecPendingAnalysisRegion({
  documents,
  onViewProgress,
  defaultExpanded = false,
}: Props) {
  const [slot, setSlot] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setSlot(document.getElementById(BOM_SHELL_FLUSH_BELOW_BREADCRUMB_ID));
  }, []);

  if (documents.length === 0) return null;

  const node = (
    <SpecPendingAnalysisShellSlot>
      <SpecPendingAnalysisBody
        documents={documents}
        onViewProgress={onViewProgress}
        defaultExpanded={defaultExpanded}
      />
    </SpecPendingAnalysisShellSlot>
  );

  if (slot) return createPortal(node, slot);
  return node;
}
