import { SearchOutlined } from '@ant-design/icons';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Button, Flex, Input, Space, Typography, theme } from '../ui/antd';

/** Top-level catalog entry: browse parts without selecting a project (Matt flow). */
export function CatalogHome() {
  const { token } = theme.useToken();
  const navigate = useNavigate();
  const [q, setQ] = useState('');

  const goResults = () => {
    const query = q.trim() || 'all';
    navigate(`/catalog/results?q=${encodeURIComponent(query)}`);
  };

  return (
    <Space orientation="vertical" size={token.marginLG} style={{ width: '100%' }}>
      <Typography.Title level={3} style={{ margin: 0 }}>
        Catalog
      </Typography.Title>
      <Typography.Paragraph type="secondary" style={{ margin: 0 }}>
        Search the product catalog without creating or opening a project. When you need submittals or
        project-scoped downloads, we&apos;ll ask you to pick or create a project at that moment.
      </Typography.Paragraph>
      <Flex wrap="wrap" gap={token.margin}>
        <Input
          allowClear
          placeholder="Category, figure, keyword…"
          prefix={<SearchOutlined style={{ color: token.colorTextPlaceholder }} />}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onPressEnter={goResults}
          style={{ minWidth: token.controlHeight * 10, flex: 1 }}
        />
        <Button type="primary" onClick={goResults}>
          Search catalog
        </Button>
      </Flex>
    </Space>
  );
}
