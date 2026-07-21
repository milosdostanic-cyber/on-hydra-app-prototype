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
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import { useActionTrail } from '../../context/ActionTrailContext';
import { markItemViewed, shouldShowNewTag } from '../../context/actionTrailStore';
import { useSubmittalPackages } from '../../context/SubmittalPackagesContext';
import { ActionTrailNewTag } from '../../search/components/ActionTrailNewTag';
import { actionTrailTableRowProps } from '../../search/actionTrailStyles';
import { shellTableLinkButtonStyle, shellTableStyles } from '../../shell/shellTablePatterns';
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
  const { entries, activateItemGuidance, markSubProjectViewed } = useActionTrail();
  const navigate = useNavigate();
  const { deletePackage, removePartFromPackage, movePart } = useSubmittalPackages();
  const [expanded, setExpanded] = useState(true);

  const isTrailRow = useCallback(
    (row: SubmittalPackagePart) =>
      shouldShowNewTag('submittal', pkg.id, row.id, row.partKey),
    [pkg.id, entries],
  );

  useEffect(() => {
    if (!expanded) return;
    activateItemGuidance('submittal', pkg.id);
    const hasTrailItems = pkg.parts.some((row) =>
      shouldShowNewTag('submittal', pkg.id, row.id, row.partKey),
    );
    if (hasTrailItems) {
      markSubProjectViewed('submittal', pkg.id);
    }
  }, [expanded, pkg.id, pkg.parts, activateItemGuidance, markSubProjectViewed]);

  const columns: TableColumnsType<SubmittalPackagePart> = [
    {
      title: '',
      key: 'actionTrail',
      width: 56,
      render: (_: unknown, row) => (
        <ActionTrailNewTag module="submittal" subProjectId={pkg.id} itemId={row.id} partKey={row.partKey} />
      ),
    },
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
        <Button
          type="link"
          style={shellTableLinkButtonStyle}
          onClick={() => {
            markItemViewed('submittal', pkg.id, row.id, row.partKey);
            navigate(`/search/parts/${row.partKey}`);
          }}
        >
          {row.displayName}
        </Button>
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
          <Tooltip title="Add part from search">
            <Button
              icon={<PlusOutlined />}
              onClick={() => navigate('/search/results?q=all')}
              aria-label="Add part from search"
            />
          </Tooltip>
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
              columns={columns}
              dataSource={pkg.parts}
              pagination={false}
              onRow={(record) => actionTrailTableRowProps(token, isTrailRow(record))}
              styles={shellTableStyles(token)}
            />
          ) : (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="No parts yet. Use + above or add cut sheets from search."
            />
          )}
        </Space>
      )}
    </Card>
  );
}
