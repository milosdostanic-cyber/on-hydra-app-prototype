import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { shellLayout } from '../../theme/hydraAlias';
import { BomPageHeader } from '../layout/BomPageHeader';
import { BomAliasConfigurator } from '../components/BomAliasConfigurator';
import { mockParsedItems, bomProjectById, bomProjectTitleById } from '../data/mockData';
import type { BomItem } from '../data/types';
import { BomConfidenceTag } from '../components/BomTags';
import {
  Alert,
  Button,
  Card,
  Flex,
  Input,
  InputNumber,
  Pagination,
  Space,
  Table,
  Typography,
  theme,
} from '../../ui/antd';
import type { TableColumnsType } from '../../ui/antd';

export function BomParsingReviewPage() {
  const { token } = theme.useToken();
  const { bomProjectId = '' } = useParams<{ bomProjectId: string }>();
  const navigate = useNavigate();
  const projectMeta = bomProjectById(bomProjectId);
  const title = bomProjectTitleById(bomProjectId) ?? 'BOM project';
  const [page, setPage] = useState(1);
  const [rows, setRows] = useState<BomItem[]>(() => mockParsedItems.map((r) => ({ ...r })));
  const [aliasOpen, setAliasOpen] = useState(false);

  const warningRows = rows.filter((r) => r.confidence === 'medium' || r.confidence === 'low').length;
  const errorRows = rows.filter((r) => r.confidence === 'low').length;

  const pagedParsedItems = useMemo(() => {
    const start = (page - 1) * shellLayout.tablePageSizeDefault;
    return rows.slice(start, start + shellLayout.tablePageSizeDefault);
  }, [page, rows]);

  const columns: TableColumnsType<BomItem> = [
    { title: '#', dataIndex: 'rowNumber', key: 'rowNumber', width: 56 },
    {
      title: 'Original input',
      dataIndex: 'originalInput',
      key: 'originalInput',
      render: (v: string, record) => (
        <Input
          value={v}
          onChange={(e) =>
            setRows((prev) => prev.map((r) => (r.id === record.id ? { ...r, originalInput: e.target.value } : r)))
          }
        />
      ),
    },
    {
      title: 'Parsed description',
      dataIndex: 'parsedDescription',
      key: 'parsedDescription',
      render: (v: string, record) => (
        <Input
          value={v}
          onChange={(e) =>
            setRows((prev) =>
              prev.map((r) => (r.id === record.id ? { ...r, parsedDescription: e.target.value } : r)),
            )
          }
        />
      ),
    },
    {
      title: 'Size',
      dataIndex: 'size',
      key: 'size',
      render: (v: string, record) => (
        <Input
          value={v}
          onChange={(e) =>
            setRows((prev) => prev.map((r) => (r.id === record.id ? { ...r, size: e.target.value } : r)))
          }
        />
      ),
    },
    {
      title: 'Pressure',
      dataIndex: 'pressureClass',
      key: 'pressureClass',
      render: (v: string, record) => (
        <Input
          value={v}
          onChange={(e) =>
            setRows((prev) => prev.map((r) => (r.id === record.id ? { ...r, pressureClass: e.target.value } : r)))
          }
        />
      ),
    },
    {
      title: 'Connection',
      dataIndex: 'connectionType',
      key: 'connectionType',
      render: (v: string, record) => (
        <Input
          value={v}
          onChange={(e) =>
            setRows((prev) => prev.map((r) => (r.id === record.id ? { ...r, connectionType: e.target.value } : r)))
          }
        />
      ),
    },
    {
      title: 'Qty',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 100,
      render: (v: number, record) => (
        <InputNumber
          min={0}
          value={v}
          onChange={(n) =>
            setRows((prev) =>
              prev.map((r) => (r.id === record.id ? { ...r, quantity: typeof n === 'number' ? n : r.quantity } : r)),
            )
          }
        />
      ),
    },
    {
      title: 'Confidence',
      dataIndex: 'confidence',
      key: 'confidence',
      render: (c: BomItem['confidence']) => <BomConfidenceTag confidence={c} />,
    },
  ];

  if (bomProjectId && bomProjectId !== 'new' && !projectMeta) {
    return (
      <Space orientation="vertical" size={token.marginLG} style={{ width: '100%' }}>
        <BomPageHeader
          title="BOM project not found"
          description="Unknown project id in this demo."
          actions={
            <Button type="primary" size="large" onClick={() => navigate('/bom')}>
              Go to BOM home
            </Button>
          }
        />
      </Space>
    );
  }

  if (rows.length === 0) {
    return (
      <Space orientation="vertical" size={token.marginLG} style={{ width: '100%' }}>
        <BomPageHeader
          title="Nothing to parse"
          description="No line items were produced from your file. Adjust column mapping or upload a different file."
          actions={
            <Space wrap>
              <Button size="large" onClick={() => setAliasOpen(true)}>
                Change column mapping
              </Button>
              <Button type="primary" size="large" onClick={() => navigate(`/bom/projects/${bomProjectId}/field-mapping`)}>
                Open field mapping
              </Button>
              <Link to="/bom">
                <Button size="large">BOM home</Button>
              </Link>
            </Space>
          }
        />
        <BomAliasConfigurator open={aliasOpen} onClose={() => setAliasOpen(false)} />
      </Space>
    );
  }

  return (
    <Space orientation="vertical" size={token.marginLG} style={{ width: '100%' }}>
      <BomPageHeader
        title="Parsing review"
        description={`Review parsed rows before matching. Project: ${title}.`}
        actions={
          <Space wrap>
            <Button type="primary" size="large" onClick={() => navigate(`/bom/projects/${bomProjectId}/matching`)}>
              Continue to matching
            </Button>
            <Link to="/bom">
              <Button size="large">BOM home</Button>
            </Link>
          </Space>
        }
      />

      <Alert
        type={errorRows > 0 ? 'warning' : 'info'}
        showIcon
        message={`${rows.length} items parsed`}
        description={
          warningRows > 0
            ? `${warningRows} row${warningRows !== 1 ? 's' : ''} may need attention (confidence or missing attributes).`
            : 'All sample rows parsed with high or medium confidence.'
        }
      />

      <Card styles={{ body: { padding: 0 } }}>
        <Flex
          wrap
          gap={token.marginSM}
          align="center"
          style={{
            paddingInline: token.paddingMD,
            paddingBlock: token.paddingSM,
            borderBottom: `${token.lineWidth}px ${token.lineType} ${token.colorBorderSecondary}`,
            background: token.colorFillAlter,
          }}
        >
          <Typography.Link onClick={() => setAliasOpen(true)}>Change column mapping</Typography.Link>
          <Typography.Text type="secondary">·</Typography.Text>
          <Typography.Link onClick={() => navigate(`/bom/projects/${bomProjectId}/field-mapping`)}>
            Open full field mapping page
          </Typography.Link>
        </Flex>
        <Table<BomItem>
          rowKey="id"
          columns={columns}
          dataSource={pagedParsedItems}
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
            current={page}
            pageSize={shellLayout.tablePageSizeDefault}
            total={rows.length}
            onChange={setPage}
            showSizeChanger={false}
          />
        </Flex>
      </Card>

      <BomAliasConfigurator
        open={aliasOpen}
        onClose={() => setAliasOpen(false)}
        onSave={() => {
          /* Demo: re-parse hook would run here */
        }}
      />
    </Space>
  );
}
