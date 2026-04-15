import { useNavigate } from 'react-router-dom';

import { PageBackButton } from './PageBackButton';
import { PROJECT_SEED_ROWS } from './projectSeed';
import { Button, Card, Col, Flex, Progress, Row, Space, Typography, theme } from '../ui/antd';

export function DashboardPlaceholder() {
  const { token } = theme.useToken();
  const navigate = useNavigate();
  const projectCount = PROJECT_SEED_ROWS.length;

  return (
    <Space orientation="vertical" size={token.marginLG} style={{ width: '100%' }}>
      <PageBackButton to="/projects">Back to projects</PageBackButton>
      <Typography.Title level={3} style={{ margin: 0 }}>
        Dashboard
      </Typography.Title>
      <Typography.Paragraph type="secondary" style={{ margin: 0 }}>
        Cross-project overview (demo metrics).
      </Typography.Paragraph>

      <Row gutter={[token.marginMD, token.marginMD]}>
        <Col xs={24} sm={12} lg={6}>
          <Card size="small">
            <Typography.Text type="secondary">Active projects</Typography.Text>
            <Typography.Title level={2} style={{ margin: token.marginXXS }}>
              {projectCount}
            </Typography.Title>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card size="small">
            <Typography.Text type="secondary">BOM runs in progress</Typography.Text>
            <Typography.Title level={2} style={{ margin: token.marginXXS }}>
              8
            </Typography.Title>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card size="small">
            <Typography.Text type="secondary">Submittals</Typography.Text>
            <Typography.Title level={2} style={{ margin: token.marginXXS }}>
              34
            </Typography.Title>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card size="small">
            <Typography.Text type="secondary">Open requests</Typography.Text>
            <Typography.Title level={2} style={{ margin: token.marginXXS }}>
              3
            </Typography.Title>
          </Card>
        </Col>
      </Row>

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

      <Flex gap={token.marginSM} wrap="wrap">
        <Button type="primary" onClick={() => navigate('/projects')}>
          New project
        </Button>
        <Button onClick={() => navigate('/bom')}>Upload BOM</Button>
        <Button onClick={() => navigate('/catalog')}>Browse catalog</Button>
      </Flex>
    </Space>
  );
}
