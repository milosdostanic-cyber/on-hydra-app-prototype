import { Flex, Progress, Typography, theme } from '../../ui/antd';
import {
  v2ReanalysisPercent,
  v2ReanalysisStepDetail,
} from '../constants/specWorkflowStatus';
import type { SpecDocument, SpecReanalysisRun } from '../data/types';

export function SpecReanalysisProgress({
  run,
}: {
  document?: SpecDocument;
  run: SpecReanalysisRun;
}) {
  const { token } = theme.useToken();
  const percent = run.status === 'complete' ? 100 : v2ReanalysisPercent(run.stages);

  return (
    <Flex
      align="center"
      gap={token.paddingMD}
      wrap="nowrap"
      role="status"
      aria-live="polite"
      aria-atomic="true"
      style={{
        width: '100%',
        paddingInline: token.paddingMD,
        paddingBlock: token.paddingSM,
        background: token.colorBgContainer,
        borderRadius: token.borderRadius,
        boxShadow: token.boxShadowTertiary,
      }}
    >
      <Flex vertical gap={token.marginXXS} style={{ flex: '0 0 auto', minWidth: 0 }}>
        <Typography.Title level={5} style={{ margin: 0 }}>
          Re-analysis in progress
        </Typography.Title>
        <Typography.Text type="secondary">{v2ReanalysisStepDetail(run)}</Typography.Text>
      </Flex>
      <Progress
        percent={percent}
        showInfo
        size="default"
        strokeLinecap="round"
        strokeColor={token.colorPrimary}
        style={{ flex: 1, margin: 0, minWidth: 0 }}
      />
    </Flex>
  );
}
