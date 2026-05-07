import { Card, Col, Flex, Progress, Row, Space, Typography, theme } from '../ui/antd';

type CrossProjectOverviewProps = {
  projectCount: number;
};

/** Cross-project metrics (formerly dashboard-only body). */
export function CrossProjectOverview({ projectCount }: CrossProjectOverviewProps) {
  const { token } = theme.useToken();

  return (
    <Space orientation="vertical" size={token.marginLG} style={{ width: '100%' }}>
      <Typography.Title level={4} style={{ margin: 0 }}>
        Company overview
      </Typography.Title>
      <Typography.Paragraph type="secondary" style={{ margin: 0 }}>
        Summary context for the company ({projectCount} job sites in this demo). Below: workload snapshot.
      </Typography.Paragraph>

      <Row gutter={[token.marginMD, token.marginMD]}>
        <Col xs={24} lg={14}>
          <Card title="Active BOM runs" size="small">
            <Space orientation="vertical" size={token.marginMD} style={{ width: '100%' }}>
              <div>
                <Flex justify="space-between" align="center" style={{ marginBottom: token.marginXXS }}>
                  <Typography.Text>Mechanical Piping</Typography.Text>
                  <Typography.Text type="secondary">85%</Typography.Text>
                </Flex>
                <Progress percent={85} strokeColor={token.colorPrimary} />
              </div>
              <div>
                <Flex justify="space-between" align="center" style={{ marginBottom: token.marginXXS }}>
                  <Typography.Text>Electrical</Typography.Text>
                  <Typography.Text type="secondary">40%</Typography.Text>
                </Flex>
                <Progress percent={40} strokeColor={token.colorInfo} />
              </div>
              <div>
                <Flex justify="space-between" align="center" style={{ marginBottom: token.marginXXS }}>
                  <Typography.Text>HVAC</Typography.Text>
                  <Typography.Text type="secondary">100%</Typography.Text>
                </Flex>
                <Progress percent={100} strokeColor={token.colorSuccess} />
              </div>
            </Space>
          </Card>
        </Col>
        <Col xs={24} lg={10}>
          <Card title="Recent activity" size="small">
            <Space orientation="vertical" size={token.marginSM}>
              <Typography.Text>Exported HVAC BOM</Typography.Text>
              <Typography.Text type="secondary">Matched 45 items on a sample project</Typography.Text>
              <Typography.Text type="secondary">Service request SR-42 updated</Typography.Text>
            </Space>
          </Card>
        </Col>
      </Row>
    </Space>
  );
}
