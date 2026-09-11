import { CheckCircleOutlined } from '@ant-design/icons';

import { Alert, Button, Card, Flex, Typography, theme } from '../../ui/antd';
import type { SpecReanalysisSummary } from '../data/types';

export function SpecReanalysisCompletion({
  summary,
  onReturn,
}: {
  summary: SpecReanalysisSummary;
  onReturn: () => void;
}) {
  const { token } = theme.useToken();
  const metrics = [
    { label: 'New', value: summary.newCount },
    { label: 'Changed', value: summary.changedCount },
    { label: 'Resolved', value: summary.resolvedCount },
    { label: 'Decisions kept', value: summary.decisionsKeptCount },
  ];

  return (
    <Flex vertical gap={token.marginLG}>
      <Alert
        type="success"
        showIcon
        icon={<CheckCircleOutlined />}
        title="Re-analysis complete"
        description="Recommendations now reflect the edited document. Valid accepted and denied decisions were kept where the related customer text was unchanged."
      />
      <Flex gap={token.marginSM} wrap="wrap">
        {metrics.map((metric) => (
          <Card key={metric.label} size="small" style={{ flex: '1 1 0%', minWidth: 0 }}>
            <Flex vertical gap={token.marginXXS}>
              <Typography.Title level={3} style={{ margin: 0 }}>
                {metric.value}
              </Typography.Title>
              <Typography.Text type="secondary">{metric.label}</Typography.Text>
            </Flex>
          </Card>
        ))}
      </Flex>
      <Typography.Paragraph type="secondary" style={{ margin: 0 }}>
        Return to Review and Edit to review the next not-reviewed, changed, or new
        recommendation.
      </Typography.Paragraph>
      <Flex justify="flex-end">
        <Button type="primary" size="large" onClick={onReturn}>
          Return to review
        </Button>
      </Flex>
    </Flex>
  );
}
