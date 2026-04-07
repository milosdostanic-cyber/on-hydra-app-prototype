import { Link } from 'react-router-dom';

import { BomCardTitle } from '../components/BomCardTitle';
import { BomPageHeader } from '../layout/BomPageHeader';
import { Button, Card, Col, Row, Space, Steps, Typography, theme } from '../../ui/antd';

const FLOW_STEPS = [
  {
    title: 'Landing',
    description: 'Home: choose upload, catalog search, or blank project',
    path: '/bom',
  },
  {
    title: 'Parsing review',
    description: 'Confirm each imported line was read correctly',
    path: '/bom/projects/new/parsing-review',
  },
  {
    title: 'Matching results',
    description: 'See suggested catalog parts for every line',
    path: '/bom/projects/new/matching',
  },
  {
    title: 'Guided narrowing',
    description: 'Answer a few questions to lock the right SKU',
    path: '/bom/projects/new/items/item-1/narrow',
  },
  {
    title: 'Recommended result',
    description: 'Review fit, confidence, and substitution risk',
    path: '/bom/projects/new/items/item-1/recommend',
  },
  {
    title: 'BOM workspace',
    description: 'Edit quantities and scan line status in one grid',
    path: '/bom/projects/new/workspace',
  },
  {
    title: 'Export',
    description: 'Download Excel, CSV, or package (demo)',
    path: '/bom/projects/new/export',
  },
  {
    title: 'Service request',
    description: 'Optional hand-off to an expert (demo)',
    path: '/bom/projects/new/service-request',
  },
] as const;

export function BomFlowOverviewPage() {
  const { token } = theme.useToken();
  return (
    <Space orientation="vertical" size={token.marginLG} style={{ width: '100%' }}>
      <BomPageHeader
        eyebrow="How this module works"
        title="BOM application flow"
        description="Follow the list top to bottom—that is the real order users take. Each card below opens that screen with demo project “new” so you can click through without guessing."
      />

      <Card
        style={{
          background: token.colorFillAlter,
          borderColor: token.colorBorderSecondary,
        }}
        title={<BomCardTitle>Linear journey</BomCardTitle>}
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

      <BomCardTitle>Jump to a step</BomCardTitle>
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
                <BomCardTitle>{s.title}</BomCardTitle>
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

    </Space>
  );
}
