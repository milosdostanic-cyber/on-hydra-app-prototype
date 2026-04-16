import {
  CheckCircleOutlined,
  FileExcelOutlined,
  FileTextOutlined,
  SendOutlined,
} from '@ant-design/icons';
import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { BomPageHeader } from '../layout/BomPageHeader';
import { bomProjectTitleById, mockWorkspaceItems } from '../data/mockData';
import type { BomItem } from '../data/types';
import { BomCardTitle } from '../components/BomCardTitle';
import {
  Button,
  Card,
  Checkbox,
  Col,
  Row,
  Space,
  Table,
  Typography,
  theme,
  message,
} from '../../ui/antd';
import type { TableColumnsType } from '../../ui/antd';

type ExportMode = 'excel-csv' | 'package' | 'distributor' | 'service';

type ColumnOption = {
  key: keyof BomItem | 'approvals';
  label: string;
  checked: boolean;
};

export function BomExportPage() {
  const { token } = theme.useToken();
  const { bomProjectId = '' } = useParams<{ bomProjectId: string }>();
  const navigate = useNavigate();
  const projectTitle = bomProjectTitleById(bomProjectId) ?? 'BOM project';
  const [mode, setMode] = useState<ExportMode>('excel-csv');
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

  const modeUi = {
    'excel-csv': {
      title: 'Export to Excel / CSV',
      body: 'Download your BOM as a structured spreadsheet with all selected attributes and quantities.',
      cta: 'Download BOM',
      ok: true,
    },
    package: {
      title: 'Generate submittal package',
      body: 'Create a complete package with datasheets, approvals, and formatted line summaries.',
      cta: 'Generate package',
      ok: true,
    },
    distributor: {
      title: 'Send to distributor',
      body: 'Share your BOM with distributors for pricing and availability confirmation.',
      cta: 'Select distributor',
      ok: true,
    },
    service: {
      title: 'Request white glove assist',
      body: 'Ask the team to review substitutions, optimize selections, and finalize your BOM.',
      cta: 'Request service',
      ok: false,
    },
  } as const;

  const submit = () => {
    if (mode === 'service') {
      navigate(`/bom/projects/${bomProjectId}/service-request`);
      return;
    }
    message.success(`${modeUi[mode].title} queued (demo).`);
  };

  return (
    <Space orientation="vertical" size={token.marginLG} style={{ width: '100%' }}>
      <BomPageHeader
        title="Export"
        description={`Choose one export route, preview the output, then run a single final action. Project: ${projectTitle}.`}
      />

      <Row gutter={[token.marginSM, token.marginSM]}>
        <Col xs={24} md={12}>
          <Card
            hoverable
            style={{ borderColor: mode === 'excel-csv' ? token.colorPrimary : token.colorBorderSecondary }}
            onClick={() => setMode('excel-csv')}
          >
            <Space orientation="vertical" size={token.marginXS}>
              <FileExcelOutlined style={{ color: token.colorSuccess, fontSize: token.fontSizeHeading3 }} />
              <BomCardTitle>Export to Excel / CSV</BomCardTitle>
              <Typography.Text type="secondary">
                Download your BOM as a structured spreadsheet with all attributes and quantities.
              </Typography.Text>
            </Space>
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card
            hoverable
            style={{ borderColor: mode === 'package' ? token.colorPrimary : token.colorBorderSecondary }}
            onClick={() => setMode('package')}
          >
            <Space orientation="vertical" size={token.marginXS}>
              <FileTextOutlined style={{ color: token.colorPrimary, fontSize: token.fontSizeHeading3 }} />
              <BomCardTitle>Generate submittal package</BomCardTitle>
              <Typography.Text type="secondary">
                Create a complete package with datasheets, approvals, and specifications.
              </Typography.Text>
            </Space>
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card
            hoverable
            style={{ borderColor: mode === 'distributor' ? token.colorPrimary : token.colorBorderSecondary }}
            onClick={() => setMode('distributor')}
          >
            <Space orientation="vertical" size={token.marginXS}>
              <SendOutlined style={{ color: token.colorInfo, fontSize: token.fontSizeHeading3 }} />
              <BomCardTitle>Send to distributor</BomCardTitle>
              <Typography.Text type="secondary">
                Share your BOM directly with distributors for pricing and availability.
              </Typography.Text>
            </Space>
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card
            hoverable
            style={{ borderColor: mode === 'service' ? token.colorPrimary : token.colorBorderSecondary }}
            onClick={() => setMode('service')}
          >
            <Space orientation="vertical" size={token.marginXS}>
              <CheckCircleOutlined style={{ color: token.colorWarning, fontSize: token.fontSizeHeading3 }} />
              <BomCardTitle>Request white glove assist</BomCardTitle>
              <Typography.Text type="secondary">
                Get expert help from the team to review, optimize, and finalize your BOM.
              </Typography.Text>
            </Space>
          </Card>
        </Col>
      </Row>

      <Card title={<BomCardTitle>Export preview</BomCardTitle>} style={{ borderColor: token.colorBorderSecondary }}>
        <Typography.Paragraph type="secondary">
          Preview how your BOM appears for <strong>{modeUi[mode].title}</strong>.
        </Typography.Paragraph>
        <Table<BomItem>
          rowKey="id"
          columns={columns}
          dataSource={mockWorkspaceItems}
          pagination={false}
          scroll={{ x: 'max-content' }}
        />
      </Card>

      <Card title={<BomCardTitle>Column mapping</BomCardTitle>} style={{ borderColor: token.colorBorderSecondary }}>
        <Typography.Paragraph type="secondary">
          Customize which columns to include in your output.
        </Typography.Paragraph>
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

      <Space wrap>
        <Link to="/bom">
          <Button>BOM home</Button>
        </Link>
        <Button type="primary" onClick={submit}>
          {modeUi[mode].cta}
        </Button>
      </Space>
    </Space>
  );
}
