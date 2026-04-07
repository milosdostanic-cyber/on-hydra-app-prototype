import { FileSearchOutlined, PlusOutlined, UploadOutlined, ApartmentOutlined } from '@ant-design/icons';
import { useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { BomCardTitle } from '../components/BomCardTitle';
import { BomPageHeader } from '../layout/BomPageHeader';
import { mockBomProjects } from '../data/mockData';
import { BomProjectStatusTag } from '../components/BomTags';
import type { BomProject } from '../data/types';
import {
  Button,
  Card,
  Col,
  Flex,
  Row,
  Space,
  Table,
  Typography,
  message,
  theme,
} from '../../ui/antd';
import type { TableColumnsType } from '../../ui/antd';

const VALID_UPLOAD_TYPES = new Set([
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/pdf',
  'text/csv',
]);

export function BomLandingPage() {
  const { token } = theme.useToken();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const columns: TableColumnsType<BomProject> = [
    {
      title: 'Project name',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, row) => (
        <Link to={`/bom/projects/${row.id}/workspace`}>{name}</Link>
      ),
    },
    {
      title: 'Last edited',
      dataIndex: 'lastEdited',
      key: 'lastEdited',
    },
    {
      title: 'Items',
      dataIndex: 'items',
      key: 'items',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (s: BomProject['status']) => <BomProjectStatusTag status={s} />,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, row) => (
        <Link to={`/bom/projects/${row.id}/workspace`}>Open</Link>
      ),
    },
  ];

  const triggerUpload = () => fileInputRef.current?.click();

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!VALID_UPLOAD_TYPES.has(file.type)) {
      message.error('Upload an Excel (.xlsx, .xls), CSV, or PDF file.');
      return;
    }
    setUploading(true);
    window.setTimeout(() => {
      setUploading(false);
      message.success('File received (demo). Opening parsing review.');
      navigate('/bom/projects/new/parsing-review');
    }, 1200);
  };

  const cardIconStyle = { fontSize: token.fontSizeHeading2, color: token.colorPrimary };

  return (
    <>
      <Space orientation="vertical" size={token.marginSM} style={{ width: '100%' }}>
        <div
          style={{
            width: '100%',
            background: token.colorFillAlter,
            borderRadius: token.borderRadiusLG,
            paddingBlock: token.paddingMD,
            paddingInline: token.paddingLG,
            border: `${token.lineWidth}px ${token.lineType} ${token.colorBorderSecondary}`,
          }}
        >
          <Flex gap={token.marginSM} align="stretch" wrap="wrap">
            <div
              aria-hidden
              style={{
                flexShrink: 0,
                width: token.marginXXS,
                minWidth: token.marginXXS,
                borderRadius: token.borderRadiusSM,
                background: token.colorPrimary,
              }}
            />
            <div style={{ flex: '1 1 0', minWidth: 0 }}>
              <BomPageHeader
                title="Build or Convert a Bill of Materials"
                description="Upload files, search parts, or start from scratch to create your BOM"
                titleLevel={3}
              />
              <Typography.Text type="secondary" style={{ display: 'block', marginTop: token.marginXS }}>
                Demo data.{' '}
                <Link to="/bom/flow">
                  <Space size={token.marginXXS}>
                    <ApartmentOutlined aria-hidden />
                    <span>Flow map</span>
                  </Space>
                </Link>
              </Typography.Text>
            </div>
          </Flex>
        </div>

        <Space orientation="vertical" size={token.marginXS} style={{ width: '100%' }}>
          <BomCardTitle>Get started</BomCardTitle>

          <Row gutter={[token.marginSM, token.marginXS]}>
            <Col xs={24} md={8}>
              <Card
                hoverable
                styles={{ body: { padding: token.paddingLG } }}
                style={{ height: '100%', borderColor: token.colorBorderSecondary }}
              >
                <Space orientation="vertical" size={token.marginSM} style={{ width: '100%' }}>
                  <UploadOutlined style={cardIconStyle} aria-hidden />
                  <BomCardTitle>Upload a file</BomCardTitle>
                  <Typography.Paragraph type="secondary" style={{ margin: 0 }}>
                    Excel, CSV, or PDF. We&apos;ll take you to parsing review after a short simulated import.
                  </Typography.Paragraph>
                  <Button type="primary" icon={<UploadOutlined />} loading={uploading} block onClick={triggerUpload}>
                    Choose file
                  </Button>
                </Space>
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card
                hoverable
                styles={{ body: { padding: token.paddingLG } }}
                style={{ height: '100%', borderColor: token.colorBorderSecondary }}
              >
                <Space orientation="vertical" size={token.marginSM} style={{ width: '100%' }}>
                  <FileSearchOutlined style={cardIconStyle} aria-hidden />
                  <BomCardTitle>Search parts</BomCardTitle>
                  <Typography.Paragraph type="secondary" style={{ margin: 0 }}>
                    Validate descriptions against the catalog before you commit lines to a BOM.
                  </Typography.Paragraph>
                  <Link to="/bom/search">
                    <Button icon={<FileSearchOutlined />} block>
                      Open search
                    </Button>
                  </Link>
                </Space>
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card
                hoverable
                styles={{ body: { padding: token.paddingLG } }}
                style={{ height: '100%', borderColor: token.colorBorderSecondary }}
              >
                <Space orientation="vertical" size={token.marginSM} style={{ width: '100%' }}>
                  <PlusOutlined style={cardIconStyle} aria-hidden />
                  <BomCardTitle>Start blank BOM</BomCardTitle>
                  <Typography.Paragraph type="secondary" style={{ margin: 0 }}>
                    Open an empty workspace and add lines manually (demo sample rows).
                  </Typography.Paragraph>
                  <Button
                    icon={<PlusOutlined />}
                    block
                    onClick={() => navigate('/bom/projects/new/workspace')}
                  >
                    Create blank
                  </Button>
                </Space>
              </Card>
            </Col>
          </Row>
        </Space>

        <Card
          title={<BomCardTitle>Your BOM projects</BomCardTitle>}
          styles={{ header: { borderBottom: `${token.lineWidth}px ${token.lineType} ${token.colorBorderSecondary}` } }}
        >
          <Table<BomProject>
            rowKey="id"
            columns={columns}
            dataSource={mockBomProjects}
            pagination={false}
          />
        </Card>
      </Space>

      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx,.xls,.csv,.pdf,application/pdf,text/csv,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        style={{ display: 'none' }}
        onChange={onFileChange}
      />
    </>
  );
}
