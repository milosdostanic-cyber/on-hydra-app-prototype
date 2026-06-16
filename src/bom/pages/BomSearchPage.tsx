import { SearchOutlined } from '@ant-design/icons';
import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { BomCardTitle } from '../components/BomCardTitle';
import { BomPageHeader } from '../layout/BomPageHeader';
import { useBomHubPath } from '../../context/ActiveProjectContext';
import { PageBackButton } from '../../shell/PageBackButton';
import { AppSearchInput, Button, Card, Flex, Space, Typography, message, theme } from '../../ui/antd';

export function BomSearchPage() {
  const { token } = theme.useToken();
  const navigate = useNavigate();
  const bomHubPath = useBomHubPath();
  const [searchParams] = useSearchParams();
  const [q, setQ] = useState(searchParams.get('q') ?? '');

  const exampleQueries = ['005 FireLock coupling 4 inch grooved', 'Victaulic grooved coupling', 'Tyco sprinkler head 155F'];

  const goCatalog = () => {
    if (!q.trim()) {
      message.warning('Enter a search term');
      return;
    }
    navigate(`/catalog/results?q=${encodeURIComponent(q.trim())}`);
  };

  return (
    <Space orientation="vertical" size={token.marginLG} style={{ width: '100%' }}>
      <PageBackButton to={bomHubPath}>Back to BOM</PageBackButton>
      <BomPageHeader
        title="Search for a competitor or unknown part"
        description="Enter a competitor part number, generic description, or plain language and we'll find the closest ASC match."
        actions={
          <Button type="primary" size="large" icon={<SearchOutlined />} onClick={() => goCatalog()}>
            Search catalog
          </Button>
        }
      />

      <Card style={{ borderColor: token.colorBorderSecondary }}>
        <Space orientation="vertical" size={token.margin} style={{ width: '100%' }}>
          <BomCardTitle>Search input</BomCardTitle>
          <AppSearchInput
            allowClear
            size="large"
            placeholder="Example: 005 FireLock coupling 4 inch grooved"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onPressEnter={() => goCatalog()}
            style={{ width: '100%', maxWidth: token.screenLG }}
          />
          <Flex align="center" justify="space-between" wrap="wrap" gap={token.marginXS}>
            <Typography.Text type="secondary">
              Tip: Use competitor part number first, then plain language if no direct hit.
            </Typography.Text>
            <Typography.Link onClick={() => navigate('/catalog')}>
              Looking for an ASC part? Browse the catalog →
            </Typography.Link>
          </Flex>
          <Space wrap align="center">
            <Typography.Text type="secondary">Try an example:</Typography.Text>
            {exampleQueries.map((example) => (
              <Button key={example} size="small" onClick={() => setQ(example)}>
                {example}
              </Button>
            ))}
          </Space>
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
