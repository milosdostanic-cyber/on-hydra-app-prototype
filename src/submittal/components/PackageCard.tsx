import {
  ArrowDownOutlined,
  ArrowUpOutlined,
  DeleteOutlined,
  DownloadOutlined,
  DownOutlined,
  EditOutlined,
  FileImageOutlined,
  PlusOutlined,
  RightOutlined,
} from '@ant-design/icons';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { useSubmittalPackages } from '../../context/SubmittalPackagesContext';
import {
  Button,
  Card,
  Empty,
  Flex,
  Popconfirm,
  Space,
  Table,
  Tooltip,
  Typography,
  theme,
  type TableColumnsType,
} from '../../ui/antd';
import type { SubmittalPackage, SubmittalPackagePart } from '../types';

type Props = {
  pkg: SubmittalPackage;
  onDownload: (pkg: SubmittalPackage) => void;
  onEdit: (pkg: SubmittalPackage) => void;
};

const dateFormatter = new Intl.DateTimeFormat(undefined, {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
});

/** Collapsible submittal package card with a parts table + footer actions (ZIP `PackageCard`). */
export function PackageCard({ pkg, onDownload, onEdit }: Props) {
  const { token } = theme.useToken();
  const navigate = useNavigate();
  const { deletePackage, removePartFromPackage, movePart } = useSubmittalPackages();
  const [expanded, setExpanded] = useState(true);

  const columns: TableColumnsType<SubmittalPackagePart> = [
    {
      title: '',
      dataIndex: 'thumb',
      width: 56,
      render: () => (
        <Flex
          align="center"
          justify="center"
          style={{
            width: 40,
            height: 40,
            borderRadius: token.borderRadius,
            background: token.colorFillQuaternary,
            color: token.colorTextQuaternary,
          }}
        >
          <FileImageOutlined />
        </Flex>
      ),
    },
    {
      title: 'Part',
      dataIndex: 'displayName',
      render: (_, row) => (
        <Link to={`/search/parts/${row.partKey}`}>{row.displayName}</Link>
      ),
    },
    {
      title: 'Figure #',
      dataIndex: 'figureNumber',
      width: 120,
      render: (value: string) => <Typography.Text type="secondary">{value}</Typography.Text>,
    },
    {
      title: 'Order',
      key: 'order',
      width: 96,
      render: (_, row, index) => (
        <Space size={token.marginXXS}>
          <Tooltip title="Move up">
            <Button
              type="text"
              size="small"
              icon={<ArrowUpOutlined />}
              disabled={index === 0}
              onClick={() => movePart(pkg.id, row.id, 'up')}
              aria-label="Move up"
            />
          </Tooltip>
          <Tooltip title="Move down">
            <Button
              type="text"
              size="small"
              icon={<ArrowDownOutlined />}
              disabled={index === pkg.parts.length - 1}
              onClick={() => movePart(pkg.id, row.id, 'down')}
              aria-label="Move down"
            />
          </Tooltip>
        </Space>
      ),
    },
    {
      title: '',
      key: 'remove',
      width: 48,
      render: (_, row) => (
        <Popconfirm
          title="Remove this part from the package?"
          okText="Remove"
          onConfirm={() => removePartFromPackage(pkg.id, row.id)}
        >
          <Button type="text" size="small" danger icon={<DeleteOutlined />} aria-label="Remove part" />
        </Popconfirm>
      ),
    },
  ];

  return (
    <Card
      styles={{ body: { padding: expanded ? token.paddingLG : 0 } }}
      title={
        <Flex align="center" gap={token.marginXS}>
          <Button
            type="text"
            size="small"
            icon={expanded ? <DownOutlined /> : <RightOutlined />}
            onClick={() => setExpanded((v) => !v)}
            aria-label={expanded ? 'Collapse package' : 'Expand package'}
          />
          <Flex vertical>
            <Typography.Text strong>{pkg.name}</Typography.Text>
            <Typography.Text type="secondary" style={{ fontSize: token.fontSizeSM }}>
              {pkg.parts.length} part{pkg.parts.length === 1 ? '' : 's'} · Updated{' '}
              {dateFormatter.format(new Date(pkg.updatedAt))}
            </Typography.Text>
          </Flex>
        </Flex>
      }
      extra={
        <Space size={token.marginXS}>
          <Tooltip title="Download submittal PDF">
            <Button icon={<DownloadOutlined />} onClick={() => onDownload(pkg)} aria-label="Download" />
          </Tooltip>
          <Tooltip title="Rename package">
            <Button icon={<EditOutlined />} onClick={() => onEdit(pkg)} aria-label="Rename" />
          </Tooltip>
          <Popconfirm
            title="Delete this package?"
            description="This removes the package and its part list."
            okText="Delete"
            okButtonProps={{ danger: true }}
            onConfirm={() => deletePackage(pkg.id)}
          >
            <Button danger icon={<DeleteOutlined />} aria-label="Delete package" />
          </Popconfirm>
        </Space>
      }
    >
      {expanded && (
        <Space orientation="vertical" size={token.margin} style={{ width: '100%' }}>
          {pkg.parts.length > 0 ? (
            <Table
              rowKey="id"
              size="small"
              columns={columns}
              dataSource={pkg.parts}
              pagination={false}
            />
          ) : (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="No parts yet. Add cut sheets from search."
            />
          )}
          <Button
            type="dashed"
            icon={<PlusOutlined />}
            onClick={() => navigate('/search/results?q=all')}
            style={{ alignSelf: 'flex-start' }}
          >
            Add part from search
          </Button>
        </Space>
      )}
    </Card>
  );
}
