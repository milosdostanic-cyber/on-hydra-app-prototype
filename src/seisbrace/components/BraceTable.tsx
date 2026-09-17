import {
  ArrowDownOutlined,
  ArrowUpOutlined,
  CopyOutlined,
  DeleteOutlined,
  ExclamationCircleFilled,
  PlusOutlined,
} from '@ant-design/icons';
import { useState, type Key } from 'react';

import { ORIENTATION_LABELS } from '../constants/options';
import { CopyBraceDestinationModal, type CopyBraceDestination } from './CopyBraceDestinationModal';
import { useSeisBrace } from '../context/SeisBraceContext';
import {
  Alert,
  App,
  Button,
  Empty,
  Space,
  Table,
  Tooltip,
  Typography,
  theme,
  type TableColumnsType,
} from '../../ui/antd';
import type { Brace, SeismicDesign } from '../types';

type Props = {
  design: SeismicDesign | undefined;
  designs: SeismicDesign[];
  braces: Brace[];
  selectedKeys: Key[];
  onSelectionChange: (keys: Key[]) => void;
  onEditBrace: (brace: Brace) => void;
  onNewBrace: () => void;
  onBraceCopied: (designId: string) => void;
};

/** Brace configurations table (ZIP `BraceTable`). Drag reorder → move up/down (no DnD dep). */
export function BraceTable({
  design,
  designs,
  braces,
  selectedKeys,
  onSelectionChange,
  onEditBrace,
  onNewBrace,
  onBraceCopied,
}: Props) {
  const { token } = theme.useToken();
  const { modal } = App.useApp();
  const { deleteBraces, copyBrace, createDesign, moveBrace } = useSeisBrace();
  const [braceToCopy, setBraceToCopy] = useState<Brace | null>(null);

  const unitSuffix = design?.unit === 'METRIC' ? 'N' : 'lbf';
  const hasUserDefined = braces.some((b) => b.isStructureUserDefined || b.isFastenerUserDefined);

  const handleCopyConfirm = (destination: CopyBraceDestination) => {
    if (!braceToCopy || !design) return;
    let targetId = design.id;
    if (destination.kind === 'existing') {
      targetId = destination.designId;
    } else if (destination.kind === 'new') {
      targetId = createDesign(design.projectId, {
        name: destination.name,
        projectDate: new Date().toISOString(),
        codeRequirement: design.codeRequirement,
        loadType: design.loadType,
        unit: design.unit,
        notes: design.notes,
      });
    }
    const newId = copyBrace(braceToCopy.id, targetId);
    setBraceToCopy(null);
    if (newId) onBraceCopied(targetId);
  };

  const confirmDelete = (brace: Brace) => {
    modal.confirm({
      title: 'Delete brace configuration',
      okText: 'Delete',
      okButtonProps: { danger: true },
      content: `Delete "${brace.displayName}"?`,
      onOk: () => deleteBraces([brace.id]),
    });
  };

  const columns: TableColumnsType<Brace> = [
    {
      title: 'Brace Name',
      dataIndex: 'displayName',
      render: (value: string, row) => (
        <Button type="link" style={{ padding: 0, height: 'auto' }} onClick={() => onEditBrace(row)}>
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{value}</span>
        </Button>
      ),
    },
    {
      title: 'Drawing Ref',
      dataIndex: 'drawingRef',
      render: (value: string | null) => value || '-',
    },
    {
      title: 'Qty',
      dataIndex: 'qty',
      align: 'center',
      width: 72,
      render: (value: number | null) => (value == null ? '-' : value),
    },
    {
      title: 'Seismic Load',
      dataIndex: 'seismicLoad',
      width: 130,
      render: (value: number) => (value > 0 ? `${value.toLocaleString()} ${unitSuffix}` : '-'),
    },
    {
      title: 'Structure',
      dataIndex: 'structure',
      ellipsis: true,
      render: (value: string, row) => (row.isStructureUserDefined ? `*${value}` : value),
    },
    {
      title: 'Brace Description',
      dataIndex: 'braceDescription',
      ellipsis: true,
      render: (value: Brace['braceDescription']) => ORIENTATION_LABELS[value],
    },
    {
      title: 'Fastener',
      dataIndex: 'fastener',
      ellipsis: true,
      render: (value: string, row) => (row.isFastenerUserDefined ? `*${value}` : value),
    },
    {
      title: 'Attachments',
      dataIndex: 'attachments',
      ellipsis: true,
    },
    {
      title: '',
      key: 'status',
      width: 40,
      render: (_, row) =>
        row.status !== 'COMPLETE' ? (
          <Tooltip title="Incomplete — finish the wizard to complete this brace">
            <ExclamationCircleFilled style={{ color: token.colorWarning }} />
          </Tooltip>
        ) : null,
    },
    {
      title: 'Order',
      key: 'order',
      width: 88,
      render: (_, row, index) => (
        <Space size={token.marginXXS}>
          <Button
            type="text"
            size="small"
            icon={<ArrowUpOutlined />}
            disabled={index === 0}
            aria-label="Move up"
            onClick={() => design && moveBrace(design.id, row.id, 'up')}
          />
          <Button
            type="text"
            size="small"
            icon={<ArrowDownOutlined />}
            disabled={index === braces.length - 1}
            aria-label="Move down"
            onClick={() => design && moveBrace(design.id, row.id, 'down')}
          />
        </Space>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 150,
      render: (_, row) => (
        <Space size={token.marginXS}>
          <Button type="link" style={{ padding: 0, height: 'auto' }} onClick={() => onEditBrace(row)}>
            Edit
          </Button>
          <Button
            type="link"
            style={{ padding: 0, height: 'auto' }}
            icon={<CopyOutlined />}
            aria-label="Copy brace"
            onClick={() => setBraceToCopy(row)}
          />
          <Button
            type="link"
            danger
            style={{ padding: 0, height: 'auto' }}
            icon={<DeleteOutlined />}
            aria-label="Delete brace"
            onClick={() => confirmDelete(row)}
          />
        </Space>
      ),
    },
  ];

  return (
    <Space orientation="vertical" size={token.margin} style={{ width: '100%' }}>
      {hasUserDefined ? (
        <Alert
          type="warning"
          showIcon
          message="This design includes user-defined structures or fasteners (marked with *). Verify their load ratings before submitting."
        />
      ) : null}

      {braces.length > 0 ? (
        <Table<Brace>
          rowKey="id"
          size="small"
          columns={columns}
          dataSource={braces}
          pagination={false}
          scroll={{ x: 'max-content' }}
          rowSelection={{
            selectedRowKeys: selectedKeys,
            onChange: onSelectionChange,
            getCheckboxProps: (row) => ({ disabled: row.status !== 'COMPLETE' }),
          }}
        />
      ) : (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={
            <Space orientation="vertical" size={token.marginXXS}>
              <Typography.Text>No brace configurations in this design yet.</Typography.Text>
              <Typography.Text type="secondary">Add a brace configuration to get started.</Typography.Text>
            </Space>
          }
        />
      )}

      <Button
        type="dashed"
        icon={<PlusOutlined />}
        onClick={onNewBrace}
        style={{ alignSelf: 'flex-start' }}
        disabled={!design}
      >
        New brace configuration
      </Button>

      <CopyBraceDestinationModal
        open={braceToCopy !== null}
        braceName={braceToCopy?.displayName ?? ''}
        sourceDesign={design}
        designs={designs}
        onConfirm={handleCopyConfirm}
        onCancel={() => setBraceToCopy(null)}
      />
    </Space>
  );
}
