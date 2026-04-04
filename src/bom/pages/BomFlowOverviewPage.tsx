import { Link } from 'react-router-dom';

import { BomPageHeader } from '../layout/BomPageHeader';
import { Button, Card, Col, Flex, Row, Space, Steps, Typography, theme } from '../../ui/antd';

const FLOW_STEPS = [
  {
    title: 'Landing',
    description: 'Upload, search, or start blank',
    path: '/bom',
  },
  {
    title: 'Parsing review',
    description: 'Verify extracted lines',
    path: '/bom/projects/new/parsing-review',
  },
  {
    title: 'Matching results',
    description: 'Review AI-suggested catalog matches',
    path: '/bom/projects/new/matching',
  },
  {
    title: 'Guided narrowing',
    description: 'Answer clarifying questions',
    path: '/bom/projects/new/items/item-1/narrow',
  },
  {
    title: 'Recommended result',
    description: 'Confirm selection and risk',
    path: '/bom/projects/new/items/item-1/recommend',
  },
  {
    title: 'BOM workspace',
    description: 'Edit quantities and line items',
    path: '/bom/projects/new/workspace',
  },
  {
    title: 'Export',
    description: 'Excel, CSV, packages',
    path: '/bom/projects/new/export',
  },
  {
    title: 'Service request',
    description: 'Optional expert review',
    path: '/bom/projects/new/service-request',
  },
] as const;

export function BomFlowOverviewPage() {
  const { token } = theme.useToken();
  return (
    <Space orientation="vertical" size={token.marginLG} style={{ width: '100%' }}>
      <BomPageHeader
        title="BOM application flow"
        description="End-to-end journey from intake to export. Use the cards below to jump into any demo step (sample project “new”)."
      />

      <Card
        style={{
          background: token.colorFillAlter,
          borderColor: token.colorBorderSecondary,
        }}
        title="Linear journey"
      >
        <Steps
          direction="vertical"
          size="small"
          current={-1}
          items={FLOW_STEPS.map((s) => ({
            title: s.title,
            description: s.description,
          }))}
        />
      </Card>

      <Typography.Title level={5} style={{ margin: 0 }}>
        Jump to a step
      </Typography.Title>
      <Row gutter={[token.margin, token.margin]}>
        {FLOW_STEPS.map((s) => (
          <Col xs={24} sm={12} lg={8} key={s.path}>
            <Card
              hoverable
              size="small"
              styles={{ body: { padding: token.padding } }}
              style={{ height: '100%', borderColor: token.colorBorderSecondary }}
            >
              <Space orientation="vertical" size={token.marginXS} style={{ width: '100%' }}>
                <Typography.Text strong>{s.title}</Typography.Text>
                <Typography.Paragraph type="secondary" style={{ margin: 0 }}>
                  {s.description}
                </Typography.Paragraph>
                <Link to={s.path}>
                  <Button type="primary" ghost block size="small">
                    Open (demo)
                  </Button>
                </Link>
              </Space>
            </Card>
          </Col>
        ))}
      </Row>

      <Flex justify="flex-start">
        <Link to="/bom">
          <Button>Back to BOM home</Button>
        </Link>
      </Flex>
    </Space>
  );
}
