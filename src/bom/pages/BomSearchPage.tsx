import { SearchOutlined } from '@ant-design/icons';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { BomPageHeader } from '../layout/BomPageHeader';
import { Alert, Button, Card, Flex, Input, Space, Typography, theme } from '../../ui/antd';

export function BomSearchPage() {
  const { token } = theme.useToken();
  const navigate = useNavigate();
  const [q, setQ] = useState('');

  const goCatalog = () => {
    const next = q.trim() || 'all';
    navigate(`/catalog/results?q=${encodeURIComponent(next)}`);
  };

  return (
    <Space orientation="vertical" size={token.marginLG} style={{ width: '100%' }}>
      <Card
        style={{
          background: token.colorPrimaryBg,
          borderColor: token.colorPrimaryBorder,
        }}
        styles={{ body: { padding: token.paddingLG } }}
      >
        <BomPageHeader
          title="Search parts"
          description="Look up catalog parts to validate descriptions while you build a BOM. Results open in the main Catalog experience."
        />
      </Card>

      <Card title="Catalog search">
        <Space orientation="vertical" size={token.margin} style={{ width: '100%' }}>
          <Flex wrap="wrap" gap={token.margin} align="flex-end">
            <Input
              allowClear
              placeholder="Part number, keyword, family…"
              prefix={<SearchOutlined style={{ color: token.colorTextPlaceholder }} />}
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onPressEnter={() => goCatalog()}
              style={{ minWidth: token.controlHeight * 10, flex: 1 }}
            />
            <Button type="primary" onClick={() => goCatalog()}>
              Search in catalog
            </Button>
          </Flex>
          <Alert
            type="info"
            showIcon
            message="Leaving BOM module"
            description="You will navigate to Catalog results. Use the app sidebar to return to BOM anytime."
            style={{ background: token.colorFillAlter, borderColor: token.colorBorderSecondary }}
          />
          <Typography.Paragraph type="secondary" style={{ margin: 0 }}>
            Prefer browsing? <Link to="/catalog">Open catalog home</Link>
          </Typography.Paragraph>
        </Space>
      </Card>

      <Link to="/bom">
        <Button>Back to BOM home</Button>
      </Link>
    </Space>
  );
}
