import { Card, Flex, Progress, Steps, Typography, theme } from '../../ui/antd';
import type { BomImportProgress } from '../data/types';
import {
  overallProgressPercent,
  stepIndex,
  stepLabel,
} from '../bomImportProgressState';
import { hydraSmallNormal, hydraTextStyleToReactCss } from '../../theme/hydraTypography';

type Props = {
  progress: BomImportProgress;
};

/** Shared import-flow stepper (Field mapping → Parsing review → Matching results). */
export function BomImportProgressStrip({ progress }: Props) {
  const { token } = theme.useToken();
  const current = stepIndex(progress.currentStep);
  const percent = overallProgressPercent(progress);

  const stepDetail =
    progress.currentStep === 'map'
      ? `${progress.mappedAscFields} of ${progress.totalAscFields} fields mapped`
      : progress.currentStep === 'review'
        ? `${progress.parsedRows || progress.totalRows} of ${progress.totalRows} rows in this table`
        : progress.currentStep === 'match'
          ? `${progress.acceptedCount + progress.skippedCount + progress.manualCount} of ${progress.totalRows} lines processed`
          : 'Import complete';

  return (
    <Card
      styles={{
        body: {
          padding: `${token.paddingLG}px ${token.paddingLG}px`,
        },
      }}
    >
      <Flex vertical gap={token.marginMD} style={{ width: '100%' }}>
        <Flex justify="space-between" align="center" wrap="wrap" gap={token.marginXS}>
          <Typography.Text type="secondary" style={hydraTextStyleToReactCss(hydraSmallNormal)}>
            File: {progress.fileName}
          </Typography.Text>
          <Typography.Text type="secondary" style={hydraTextStyleToReactCss(hydraSmallNormal)}>
            {stepDetail}
          </Typography.Text>
        </Flex>
        <Steps
          size="default"
          current={progress.currentStep === 'done' ? 3 : current}
          status={progress.currentStep === 'done' ? 'finish' : 'process'}
          style={{ paddingBlock: token.paddingXS }}
          items={[
            { title: stepLabel('map') },
            { title: stepLabel('review') },
            { title: stepLabel('match') },
          ]}
        />
        <Progress
          percent={percent}
          showInfo
          size="default"
          strokeColor={token.colorPrimary}
          style={{ marginTop: token.marginXXS }}
        />
      </Flex>
    </Card>
  );
}
