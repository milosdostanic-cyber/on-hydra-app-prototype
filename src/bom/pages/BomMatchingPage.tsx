import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { shellLayout } from '../../theme/hydraAlias';
import { BomPageHeader } from '../layout/BomPageHeader';
import { bomProjectById, bomProjectTitleById, mockMatchResults, mockParsedItems } from '../data/mockData';
import {
  Alert,
  Button,
  Card,
  Flex,
  Pagination,
  Progress,
  Select,
  Space,
  Table,
  Typography,
  message,
  theme,
} from '../../ui/antd';
import type { TableColumnsType } from '../../ui/antd';
import type { BomMatchResult } from '../data/types';
import { BomRiskTag } from '../components/BomTags';

type ConfidenceFilter = 'all' | 'high' | 'medium' | 'low';

function rowConfidence(row: BomMatchResult): 'high' | 'medium' | 'low' | 'none' {
  const p = row.topMatch?.matchConfidence ?? 0;
  if (!row.topMatch) return 'none';
  if (p >= 90) return 'high';
  if (p >= 70) return 'medium';
  return 'low';
}

export function BomMatchingPage() {
  const { token } = theme.useToken();
  const { bomProjectId = '' } = useParams<{ bomProjectId: string }>();
  const navigate = useNavigate();
  const projectMeta = bomProjectById(bomProjectId);
  const projectTitle = bomProjectTitleById(bomProjectId) ?? 'BOM project';
  const [page, setPage] = useState(1);
  const [confidenceFilter, setConfidenceFilter] = useState<ConfidenceFilter>('all');
  const [matchError, setMatchError] = useState(false);

  const filteredResults = useMemo(() => {
    return mockMatchResults.filter((row) => {
      const c = rowConfidence(row);
      if (confidenceFilter === 'all') return true;
      if (confidenceFilter === 'high') return c === 'high';
      if (confidenceFilter === 'medium') return c === 'medium';
      if (confidenceFilter === 'low') return c === 'low' || c === 'none';
      return true;
    });
  }, [confidenceFilter]);

  const noMatches = mockMatchResults.every((r) => !r.topMatch);

  const pagedMatchResults = useMemo(() => {
    const start = (page - 1) * shellLayout.tablePageSizeDefault;
    return filteredResults.slice(start, start + shellLayout.tablePageSizeDefault);
  }, [filteredResults, page]);

  const highConfidenceCount = mockMatchResults.filter((r) => rowConfidence(r) === 'high').length;

  const columns: TableColumnsType<BomMatchResult> = [
    {
      title: 'Line',
      key: 'line',
      width: 64,
      render: (_, row) => mockParsedItems.find((i) => i.id === row.itemId)?.rowNumber ?? '—',
    },
    {
      title: 'Original request',
      dataIndex: 'originalRequest',
      key: 'originalRequest',
    },
    {
      title: 'Top match',
      key: 'top',
      render: (_, row) =>
        row.topMatch ? (
          <Space orientation="vertical" size={token.marginXXS}>
            <Typography.Text strong>{row.topMatch.partNumber}</Typography.Text>
            <Typography.Text type="secondary">{row.topMatch.description}</Typography.Text>
            <Progress percent={row.topMatch.matchConfidence} size="small" />
            <Typography.Text type="secondary" style={{ fontSize: token.fontSizeSM }}>
              {row.suggestedParts.length} candidate{row.suggestedParts.length !== 1 ? 's' : ''}
            </Typography.Text>
          </Space>
        ) : (
          <Typography.Text type="secondary">No matches — manual selection required</Typography.Text>
        ),
    },
    {
      title: 'Risk',
      key: 'risk',
      width: 120,
      render: (_, row) => (row.topMatch ? <BomRiskTag risk={row.topMatch.substitutionRisk} /> : '—'),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 160,
      render: (_, row) => (
        <Button
          type="link"
          size="small"
          style={{ padding: 0, height: 'auto' }}
          onClick={() => navigate(`/bom/projects/${bomProjectId}/items/${row.itemId}/narrow`)}
        >
          Refine
        </Button>
      ),
    },
  ];

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
        title="Matching results"
        description={`Catalog candidates per BOM line. Project: ${projectTitle}.`}
        actions={
          <Space wrap>
            <Button type="primary" size="large" onClick={() => navigate(`/bom/projects/${bomProjectId}/workspace`)}>
              Skip to workspace
            </Button>
            <Link to="/bom">
              <Button size="large">BOM home</Button>
            </Link>
          </Space>
        }
      />

      {matchError ? (
        <Alert
          type="error"
          showIcon
          message="Matching could not be completed"
          description="Try again or continue to the workspace for manual matching."
          action={
            <Space>
              <Button size="small" onClick={() => setMatchError(false)}>
                Retry
              </Button>
              <Button size="small" type="primary" onClick={() => navigate(`/bom/projects/${bomProjectId}/workspace`)}>
                Go to workspace
              </Button>
            </Space>
          }
        />
      ) : null}

      {noMatches ? (
        <Alert
          type="warning"
          showIcon
          message="No automatic matches"
          description="You can still continue to the workspace to pick products manually or revisit column mapping."
          action={
            <Button size="small" onClick={() => navigate(`/bom/projects/${bomProjectId}/field-mapping`)}>
              Change mapping
            </Button>
          }
        />
      ) : null}

      <Card styles={{ body: { padding: 0 } }}>
        <Flex
          align="center"
          justify="space-between"
          gap={token.marginSM}
          wrap="wrap"
          style={{
            paddingInline: token.paddingMD,
            paddingBlock: token.paddingSM,
            borderBottom: `${token.lineWidth}px ${token.lineType} ${token.colorBorderSecondary}`,
            background: token.colorFillAlter,
          }}
        >
          <Select<ConfidenceFilter>
            value={confidenceFilter}
            onChange={(v) => {
              setConfidenceFilter(v);
              setPage(1);
            }}
            style={{ minWidth: token.controlHeight * 5 }}
            options={[
              { value: 'all', label: 'All confidence levels' },
              { value: 'high', label: 'High (≥90%)' },
              { value: 'medium', label: 'Medium (70–89%)' },
              { value: 'low', label: 'Low / none' },
            ]}
          />
          <Button
            onClick={() => {
              message.success(`Accepted ${highConfidenceCount} high-confidence line${highConfidenceCount !== 1 ? 's' : ''} (demo).`);
            }}
          >
            Accept all high-confidence
          </Button>
        </Flex>
        <Table<BomMatchResult>
          rowKey="itemId"
          columns={columns}
          dataSource={pagedMatchResults}
          pagination={false}
          scroll={{ x: 'max-content' }}
          onRow={(record) => ({
            style: {
              background:
                rowConfidence(record) === 'low' || rowConfidence(record) === 'none'
                  ? token.colorWarningBg
                  : undefined,
            },
          })}
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
            total={filteredResults.length}
            onChange={setPage}
            showSizeChanger={false}
          />
        </Flex>
      </Card>
    </Space>
  );
}
