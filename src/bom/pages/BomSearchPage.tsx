import { SearchOutlined } from '@ant-design/icons';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { BomCardTitle } from '../components/BomCardTitle';
import { BomPageHeader } from '../layout/BomPageHeader';
import { Button, Card, Flex, Input, Space, Typography, theme } from '../../ui/antd';

export function BomSearchPage() {
  const { token } = theme.useToken();
  const navigate = useNavigate();
  const [q, setQ] = useState('');

  const exampleQueries = ['005 FireLock coupling 4 inch grooved', 'Victaulic grooved coupling', 'Tyco sprinkler head 155F'];

  const goCatalog = () => {
    const next = q.trim() || 'all';
    navigate(`/catalog/results?q=${encodeURIComponent(next)}`);
  };

  return (
    <Space orientation="vertical" size={token.marginLG} style={{ width: '100%' }}>
      <BomPageHeader
        title="Natural language search"
        description="Search for parts using competitor part numbers, generic descriptions, or natural language."
      />

      <Card style={{ borderColor: token.colorBorderSecondary }}>
        <Space orientation="vertical" size={token.margin} style={{ width: '100%' }}>
          <BomCardTitle>Search input</BomCardTitle>
          <Flex gap={token.marginSM} align="center" wrap="wrap">
            <Input
              allowClear
              size="large"
              placeholder="Example: 005 FireLock coupling 4 inch grooved"
              prefix={<SearchOutlined style={{ color: token.colorTextPlaceholder }} />}
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onPressEnter={() => goCatalog()}
              style={{ flex: '1 1 360px' }}
            />
            <Button type="primary" size="large" onClick={() => goCatalog()}>
              Search catalog
            </Button>
          </Flex>
          <Typography.Text type="secondary">
            Tip: Use competitor part number first, then plain language if no direct hit.
          </Typography.Text>
          <Space wrap>
            {exampleQueries.map((example) => (
              <Button key={example} size="small" onClick={() => setQ(example)}>
                {example}
              </Button>
            ))}
          </Space>
        </Space>
      </Card>

      <Card
        style={{ borderStyle: 'dashed', borderColor: token.colorBorderSecondary }}
        styles={{ body: { paddingBlock: token.paddingXL, paddingInline: token.paddingLG } }}
      >
        <Space orientation="vertical" size={token.margin} style={{ width: '100%', textAlign: 'center' }}>
          <SearchOutlined style={{ fontSize: token.fontSizeHeading2, color: token.colorTextQuaternary }} />
          <Typography.Title level={3} style={{ margin: 0 }}>
            Start your search
          </Typography.Title>
          <Typography.Paragraph type="secondary" style={{ margin: 0 }}>
            Enter a part number, description, or use natural language to find ASC equivalents.
            Our AI helps narrow down results.
          </Typography.Paragraph>
          <Button type="primary" size="large" onClick={() => goCatalog()}>
            Search catalog
          </Button>
        </Space>
      </Card>

      <Card style={{ background: token.colorFillAlter, borderColor: token.colorBorderSecondary }}>
        <Space orientation="vertical" size={token.marginXS}>
          <BomCardTitle>Search tips</BomCardTitle>
          <Typography.Text type="secondary">Use competitor part numbers for direct conversions.</Typography.Text>
          <Typography.Text type="secondary">
            Describe the product in plain language (for example: &quot;4 inch grooved coupling&quot;).
          </Typography.Text>
          <Typography.Text type="secondary">
            Include size, connection type, and pressure rating when known.
          </Typography.Text>
          <Typography.Text type="secondary">Use guided narrowing if you get too many results.</Typography.Text>
        </Space>
      </Card>

    </Space>
  );
}
