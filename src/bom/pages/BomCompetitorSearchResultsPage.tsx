import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';

import { filterAscBrowserProducts } from '../bomChoosePartUtils';
import type { AscBrowserProductRow } from '../data/ascBrowserProducts';
import { BomCardTitle } from '../components/BomCardTitle';
import { BomPageHeader } from '../layout/BomPageHeader';
import { useBomHubPath } from '../../context/ActiveProjectContext';
import { catalogPartReturnFrom } from '../../catalog/catalogPartNavigation';
import { PageBackButton } from '../../shell/PageBackButton';
import { shellLayout } from '../../theme/hydraAlias';
import { Button, Card, Empty, Flex, Pagination, Space, Table, Typography, theme } from '../../ui/antd';
import type { TableColumnsType } from '../../ui/antd';

export function BomCompetitorSearchResultsPage() {
  const { token } = theme.useToken();
  const navigate = useNavigate();
  const bomHubPath = useBomHubPath();
  const [params] = useSearchParams();
  const q = params.get('q') ?? '';
  const bomProjectId = params.get('project') ?? '';
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => filterAscBrowserProducts(q), [q]);

  useEffect(() => {
    setPage(1);
  }, [q]);

  const pagedRows = useMemo(() => {
    const start = (page - 1) * shellLayout.tablePageSizeDefault;
    return filtered.slice(start, start + shellLayout.tablePageSizeDefault);
  }, [filtered, page]);

  const returnState = catalogPartReturnFrom(`/bom/search/results?q=${encodeURIComponent(q)}`);

  const columns: TableColumnsType<AscBrowserProductRow> = [
    {
      title: 'ASC figure',
      dataIndex: 'figureNumber',
      key: 'figureNumber',
      width: 120,
    },
    {
      title: 'ASC part',
      dataIndex: 'ascNumber',
      key: 'ascNumber',
      render: (sku: string, row) => (
        <Link to={`/catalog/parts/${encodeURIComponent(row.ascNumber)}`} state={returnState}>
          {sku}
        </Link>
      ),
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: 'Type',
      dataIndex: 'partType',
      key: 'partType',
      width: 140,
    },
  ];

  const title = q.trim() ? `ASC matches for “${q.trim()}”` : 'Competitor search results';

  return (
    <Space orientation="vertical" size={token.marginLG} style={{ width: '100%' }}>
      <PageBackButton to={`/bom/search?mode=competitor${q ? `&q=${encodeURIComponent(q)}` : ''}`}>
        Back to search
      </PageBackButton>

      <BomPageHeader
        title={title}
        description="Suggested ASC equivalents for your competitor or unknown part search. Results stay in the BOM flow — not the general catalog search."
        actions={
          <Button size="large" onClick={() => navigate('/bom/search?mode=asc')}>
            Switch to ASC catalog search
          </Button>
        }
      />

      <Card style={{ borderColor: token.colorBorderSecondary }}>
        <Space orientation="vertical" size={token.margin} style={{ width: '100%' }}>
          <BomCardTitle>Closest ASC matches</BomCardTitle>
          <Typography.Text type="secondary">
            {filtered.length} candidate{filtered.length !== 1 ? 's' : ''} ranked for BOM matching.
            {bomProjectId
              ? ' Open your BOM workspace to add a line and run guided matching.'
              : ' Start or open a BOM project to save a matched line.'}
          </Typography.Text>

          {filtered.length === 0 ? (
            <Empty
              description={
                <Space orientation="vertical" size={token.marginXXS}>
                  <Typography.Text strong>No ASC matches found</Typography.Text>
                  <Typography.Text type="secondary">
                    Try a competitor part number or plain-language description.
                  </Typography.Text>
                </Space>
              }
            >
              <Button type="primary" onClick={() => navigate('/bom/search?mode=competitor')}>
                Refine search
              </Button>
            </Empty>
          ) : (
            <>
              <Table
                rowKey="ascNumber"
                size="middle"
                pagination={false}
                dataSource={pagedRows}
                columns={columns}
              />
              <Flex justify="space-between" align="center" wrap="wrap" gap={token.marginSM}>
                <Pagination
                  current={page}
                  pageSize={shellLayout.tablePageSizeDefault}
                  total={filtered.length}
                  showSizeChanger={false}
                  onChange={setPage}
                />
                {bomProjectId ? (
                  <Button
                    type="primary"
                    onClick={() => navigate(`/bom/projects/${bomProjectId}/workspace`)}
                  >
                    Open BOM workspace
                  </Button>
                ) : (
                  <Button type="primary" onClick={() => navigate(bomHubPath)}>
                    Go to BOM projects
                  </Button>
                )}
              </Flex>
            </>
          )}
        </Space>
      </Card>
    </Space>
  );
}
