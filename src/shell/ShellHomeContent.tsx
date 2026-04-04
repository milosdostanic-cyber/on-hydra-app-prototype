import { PlusOutlined, SearchOutlined, StarFilled, StarOutlined } from '@ant-design/icons';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  Button,
  Flex,
  Input,
  Space,
  Table,
  Tabs,
  Typography,
  theme,
} from '../ui/antd';
import type { TableColumnsType, TabsProps } from '../ui/antd';

import { figmaBaseStrong } from '../theme/figmaTypography';
import { PROJECT_SEED_ROWS, type ProjectRow } from './projectSeed';

/** Projects shell view — spacing, color, and radii from `theme.useToken()` only. */
export function ShellHomeContent() {
  const { token } = theme.useToken();
  const navigate = useNavigate();
  const [tab, setTab] = useState<string>('all');
  const [starredKeys, setStarredKeys] = useState<Set<string>>(() => new Set(['1', '3']));
  const [rows] = useState<ProjectRow[]>(PROJECT_SEED_ROWS);

  const toggleStar = (key: string) => {
    setStarredKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const filteredRows = useMemo(() => {
    let list = rows;
    if (tab === 'recent') list = list.filter((r) => r.recent);
    if (tab === 'starred') list = list.filter((r) => starredKeys.has(r.key));
    return list.map((r) => ({ ...r, starred: starredKeys.has(r.key) }));
  }, [rows, tab, starredKeys]);

  const tabItems: TabsProps['items'] = [
    { key: 'all', label: 'All' },
    { key: 'recent', label: 'Recent' },
    { key: 'starred', label: 'Starred' },
  ];

  const columns: TableColumnsType<ProjectRow & { starred: boolean }> = [
    {
      key: 'star',
      width: token.controlHeightLG,
      align: 'center',
      render: (_, record) => (
        <Button
          type="text"
          icon={
            record.starred ? (
              <StarFilled style={{ color: token.colorWarning }} />
            ) : (
              <StarOutlined style={{ color: token.colorTextSecondary }} />
            )
          }
          onClick={(e) => {
            e.stopPropagation();
            toggleStar(record.key);
          }}
          aria-label={record.starred ? 'Remove star' : 'Star project'}
        />
      ),
    },
    {
      title: 'Project Name',
      dataIndex: 'name',
      key: 'name',
      render: (name: string) => <Typography.Text strong>{name}</Typography.Text>,
    },
    {
      title: 'Address',
      dataIndex: 'address',
      key: 'address',
    },
    {
      title: 'City',
      dataIndex: 'city',
      key: 'city',
    },
    {
      title: 'State',
      dataIndex: 'state',
      key: 'state',
      width: token.controlHeightSM * 2,
    },
    {
      title: 'Last Opened',
      dataIndex: 'lastOpened',
      key: 'lastOpened',
      align: 'right',
    },
  ];

  return (
    <Space orientation="vertical" size={token.marginLG} style={{ width: '100%' }}>
      <Flex justify="space-between" align="center" wrap="wrap" gap={token.margin}>
        <Typography.Title level={3} style={{ margin: 0 }}>
          Projects
        </Typography.Title>
        <Button type="primary" icon={<PlusOutlined />}>
          Create Project
        </Button>
      </Flex>

      <Input
        allowClear
        placeholder="Search projects by name, address, city, or state..."
        prefix={<SearchOutlined style={{ color: token.colorTextPlaceholder }} />}
        style={{ width: '100%' }}
      />

      <Tabs activeKey={tab} items={tabItems} onChange={setTab} />

      <Table<ProjectRow & { starred: boolean }>
        rowKey="key"
        pagination={false}
        columns={columns}
        dataSource={filteredRows}
        onRow={(record) => ({
          onClick: () => navigate(`/projects/${record.key}`),
          style: { cursor: 'pointer' },
        })}
        styles={{
          header: {
            cell: {
              color: token.colorTextDescription,
              fontWeight: figmaBaseStrong.fontWeight,
            },
          },
        }}
      />
    </Space>
  );
}
