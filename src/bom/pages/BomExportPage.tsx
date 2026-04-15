import { CheckCircleOutlined, FileExcelOutlined, FileTextOutlined, SendOutlined } from '@ant-design/icons';
import { useMemo, useState, type ReactNode } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { useBomWorkspaceRows } from '../../context/BomWorkspaceContext';
import { isWorkspaceRowConfirmed } from '../bomWorkspaceHelpers';
import { shellLayout } from '../../theme/hydraAlias';
import { BomPageHeader } from '../layout/BomPageHeader';
import { bomProjectById, bomProjectTitleById } from '../data/mockData';
import type { BomItem } from '../data/types';
import { BomCardTitle } from '../components/BomCardTitle';
import { ExportCard } from '../../ui/ExportCard';
import {
  Alert,
  Button,
  Card,
  Checkbox,
  Col,
  Flex,
  Form,
  Input,
  Modal,
  Pagination,
  Row,
  Space,
  Table,
  Typography,
  theme,
  message,
} from '../../ui/antd';
import type { TableColumnsType } from '../../ui/antd';

type ExportMode = 'excel-csv' | 'package' | 'distributor' | 'service';

const EXPORT_MODE_ORDER: ExportMode[] = ['excel-csv', 'package', 'distributor', 'service'];

type ExportModeMeta = {
  title: string;
  cardDescription: string;
  cta: string;
};

const EXPORT_MODE_META: Record<ExportMode, ExportModeMeta> = {
  'excel-csv': {
    title: 'Export to Excel / CSV',
    cardDescription: 'Excel or CSV with the columns and quantities you pick.',
    cta: 'Download BOM',
  },
  package: {
    title: 'Generate submittal package',
    cardDescription:
      'Create a complete package with datasheets, approvals, and formatted line summaries.',
    cta: 'Generate package',
  },
  distributor: {
    title: 'Send to distributor',
    cardDescription: 'Share your BOM with distributors for pricing and availability confirmation.',
    cta: 'Select distributor',
  },
  service: {
    title: 'Request white glove assist',
    cardDescription:
      'Ask the team to review substitutions, optimize selections, and finalize your BOM.',
    cta: 'Request service',
  },
};

function exportModeIcon(
  mode: ExportMode,
  token: { colorSuccess: string; colorPrimary: string; colorInfo: string; colorWarning: string },
): ReactNode {
  switch (mode) {
    case 'excel-csv':
      return <FileExcelOutlined style={{ color: token.colorSuccess }} />;
    case 'package':
      return <FileTextOutlined style={{ color: token.colorPrimary }} />;
    case 'distributor':
      return <SendOutlined style={{ color: token.colorInfo }} />;
    case 'service':
      return <CheckCircleOutlined style={{ color: token.colorWarning }} />;
  }
}

type ColumnOption = {
  key: keyof BomItem | 'approvals';
  label: string;
  checked: boolean;
};

export function BomExportPage() {
  const { token } = theme.useToken();
  const { bomProjectId = '' } = useParams<{ bomProjectId: string }>();
  const navigate = useNavigate();
  const { rows } = useBomWorkspaceRows(bomProjectId);
  const projectMeta = bomProjectById(bomProjectId);
  const projectTitle = bomProjectTitleById(bomProjectId) ?? 'BOM project';
  const [mode, setMode] = useState<ExportMode>('excel-csv');
  const [previewPage, setPreviewPage] = useState(1);
  const [emailOpen, setEmailOpen] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [fileName, setFileName] = useState(() => `BOM_${projectTitle.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}`);

  const confirmedRows = useMemo(() => rows.filter(isWorkspaceRowConfirmed), [rows]);

  const pagedExportPreview = useMemo(() => {
    const start = (previewPage - 1) * shellLayout.tablePageSizeDefault;
    return confirmedRows.slice(start, start + shellLayout.tablePageSizeDefault);
  }, [confirmedRows, previewPage]);

  const [columnOptions, setColumnOptions] = useState<ColumnOption[]>([
    { key: 'originalInput', label: 'Part number', checked: true },
    { key: 'parsedDescription', label: 'Description', checked: true },
    { key: 'category', label: 'Category', checked: true },
    { key: 'size', label: 'Size', checked: true },
    { key: 'quantity', label: 'Quantity', checked: true },
    { key: 'unit', label: 'Unit', checked: true },
    { key: 'pressureClass', label: 'Pressure rating', checked: false },
    { key: 'connectionType', label: 'Connection type', checked: false },
    { key: 'approvals', label: 'Approvals', checked: false },
  ]);

  const selectedColumns = useMemo(
    () => columnOptions.filter((opt) => opt.checked).map((opt) => opt.key),
    [columnOptions],
  );

  const columns: TableColumnsType<BomItem> = useMemo(() => {
    const all: Record<string, TableColumnsType<BomItem>[number]> = {
      rowNumber: { title: 'Row', dataIndex: 'rowNumber', key: 'rowNumber', width: 64 },
      originalInput: { title: 'Part number', dataIndex: 'originalInput', key: 'originalInput' },
      parsedDescription: { title: 'Description', dataIndex: 'parsedDescription', key: 'parsedDescription' },
      category: { title: 'Category', dataIndex: 'category', key: 'category' },
      size: { title: 'Size', dataIndex: 'size', key: 'size' },
      quantity: { title: 'Qty', dataIndex: 'quantity', key: 'quantity', width: 84 },
      unit: { title: 'Unit', dataIndex: 'unit', key: 'unit', width: 72 },
      pressureClass: { title: 'Pressure rating', dataIndex: 'pressureClass', key: 'pressureClass' },
      connectionType: { title: 'Connection type', dataIndex: 'connectionType', key: 'connectionType' },
      approvals: {
        title: 'Approvals',
        key: 'approvals',
        render: () => 'Included in package',
      },
    };

    return [
      all.rowNumber,
      ...selectedColumns
        .map((key) => all[key])
        .filter((col): col is NonNullable<typeof col> => Boolean(col)),
    ];
  }, [selectedColumns]);

  const toggleAllColumns = (checked: boolean) => {
    setColumnOptions((prev) => prev.map((c) => ({ ...c, checked })));
  };

  const submit = () => {
    if (confirmedRows.length === 0) {
      message.warning('No confirmed items to export. Return to the workspace first.');
      navigate(`/bom/projects/${bomProjectId}/workspace`);
      return;
    }
    if (mode === 'service') {
      navigate(`/bom/projects/${bomProjectId}/service-request`);
      return;
    }
    if (mode === 'distributor') {
      setEmailOpen(true);
      return;
    }
    setExporting(true);
    window.setTimeout(() => {
      setExporting(false);
      message.success(`${EXPORT_MODE_META[mode].title} queued as ${fileName}.csv (demo).`);
    }, 900);
  };

  if (bomProjectId && bomProjectId !== 'new' && !projectMeta) {
    return (
      <Space orientation="vertical" size={token.marginLG} style={{ width: '100%' }}>
        <BomPageHeader
          title="BOM project not found"
          description="Unknown project id."
          actions={
            <Button type="primary" size="large" onClick={() => navigate('/bom')}>
              Go to BOM home
            </Button>
          }
        />
      </Space>
    );
  }

  return (
    <Space orientation="vertical" size={token.marginLG} style={{ width: '100%' }}>
      <BomPageHeader
        title="Export"
        description={`Choose one export route, preview the output, then run a single final action. Project: ${projectTitle}.`}
        actions={
          <Space wrap>
            <Link to="/bom">
              <Button size="large">BOM home</Button>
            </Link>
            <Button
              type="primary"
              size="large"
              onClick={submit}
              loading={exporting}
              disabled={confirmedRows.length === 0}
            >
              {EXPORT_MODE_META[mode].cta}
            </Button>
          </Space>
        }
      />

      {confirmedRows.length === 0 ? (
        <Alert
          type="warning"
          showIcon
          message="No items to export"
          description="Confirm all workspace lines before exporting."
          action={
            <Button size="small" type="primary" onClick={() => navigate(`/bom/projects/${bomProjectId}/workspace`)}>
              Go to workspace
            </Button>
          }
        />
      ) : null}

      <Row gutter={[token.marginSM, token.marginSM]}>
        {EXPORT_MODE_ORDER.map((m) => {
          const meta = EXPORT_MODE_META[m];
          return (
            <Col key={m} xs={24} sm={12} lg={6}>
              <ExportCard
                selected={mode === m}
                onClick={() => setMode(m)}
                icon={exportModeIcon(m, token)}
                title={meta.title}
                description={meta.cardDescription}
              />
            </Col>
          );
        })}
      </Row>

      <Card
        title={<BomCardTitle>Export preview</BomCardTitle>}
        style={{ borderColor: token.colorBorderSecondary }}
        styles={{ body: { padding: 0 } }}
      >
        <div style={{ paddingInline: token.paddingMD, paddingTop: token.paddingSM }}>
          <Typography.Paragraph type="secondary">
            Preview how your BOM appears for <strong>{EXPORT_MODE_META[mode].title}</strong>.{' '}
            {confirmedRows.length} confirmed row{confirmedRows.length !== 1 ? 's' : ''}.
          </Typography.Paragraph>
          <Flex gap={token.marginSM} wrap="wrap" style={{ marginBottom: token.marginSM }}>
            <Typography.Text type="secondary" style={{ fontSize: token.fontSizeSM }}>
              File name
            </Typography.Text>
            <Input value={fileName} onChange={(e) => setFileName(e.target.value)} style={{ maxWidth: token.screenSM }} />
          </Flex>
        </div>
        <Table<BomItem>
          rowKey="id"
          columns={columns}
          dataSource={pagedExportPreview}
          pagination={false}
          scroll={{ x: 'max-content' }}
          styles={{
            header: {
              cell: {
                background: token.colorFillAlter,
                borderBottomColor: token.colorBorderSecondary,
                fontWeight: token.fontWeightStrong,
              },
            },
            body: { cell: { borderBottomColor: token.colorBorderSecondary, paddingBlock: token.paddingSM } },
          }}
        />
        <Flex
          justify="flex-end"
          align="center"
          style={{
            paddingInline: token.paddingMD,
            paddingBlock: token.paddingSM,
            borderTop: `${token.lineWidth}px ${token.lineType} ${token.colorBorderSecondary}`,
          }}
        >
          <Pagination
            current={previewPage}
            pageSize={shellLayout.tablePageSizeDefault}
            total={confirmedRows.length}
            onChange={setPreviewPage}
            showSizeChanger={false}
          />
        </Flex>
      </Card>

      <Card title={<BomCardTitle>Column mapping</BomCardTitle>} style={{ borderColor: token.colorBorderSecondary }}>
        <Typography.Paragraph type="secondary">
          Customize which columns to include in your output.
        </Typography.Paragraph>
        <Flex gap={token.marginSM} style={{ marginBottom: token.marginSM }}>
          <Button size="small" onClick={() => toggleAllColumns(true)}>
            Select all
          </Button>
          <Button size="small" onClick={() => toggleAllColumns(false)}>
            Deselect all
          </Button>
        </Flex>
        <Row gutter={[token.marginSM, token.marginXS]}>
          {columnOptions.map((option) => (
            <Col key={option.key} xs={24} sm={12} md={8}>
              <Checkbox
                checked={option.checked}
                onChange={(e) =>
                  setColumnOptions((prev) =>
                    prev.map((col) =>
                      col.key === option.key ? { ...col, checked: e.target.checked } : col,
                    ),
                  )
                }
              >
                {option.label}
              </Checkbox>
            </Col>
          ))}
        </Row>
      </Card>

      <Modal
        title="Send email summary"
        open={emailOpen}
        onCancel={() => setEmailOpen(false)}
        footer={null}
        destroyOnClose
      >
        <Form
          layout="vertical"
          onFinish={() => {
            message.success('Email queued (demo).');
            setEmailOpen(false);
          }}
        >
          <Form.Item label="To" name="to" rules={[{ required: true, type: 'email', message: 'Valid email required' }]}>
            <Input placeholder="recipient@example.com" />
          </Form.Item>
          <Form.Item label="Subject" name="subject" initialValue={`BOM export: ${projectTitle}`}>
            <Input />
          </Form.Item>
          <Form.Item label="Message" name="body" initialValue="Please find the BOM summary attached (demo).">
            <Input.TextArea rows={4} />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                Send email
              </Button>
              <Button onClick={() => setEmailOpen(false)}>Cancel</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </Space>
  );
}
