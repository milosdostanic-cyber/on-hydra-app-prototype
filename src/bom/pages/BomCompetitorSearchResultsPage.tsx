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
import { hydraBaseStrong, hydraTextStyleToReactCss } from '../../theme/hydraTypography';

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

  const hasNoResults = filtered.length === 0;
  const pageFrom = (page - 1) * shellLayout.tablePageSizeDefault + 1;
  const pageTo = Math.min(page * shellLayout.tablePageSizeDefault, filtered.length);

  return (
    <Flex vertical gap={token.marginLG} style={{ width: '100%', flex: 1 }}>
      <PageBackButton to={`/bom/search?mode=competitor${q ? `&q=${encodeURIComponent(q)}` : ''}`}>
        Back to search
      </PageBackButton>

      <BomPageHeader
        title={title}
        description="Suggested ASC equivalents for your competitor or unknown part search. Results stay in the BOM flow — not the general catalog search."
        actions={
          <Space size={token.paddingXS} wrap>
            <Button size="large" onClick={() => navigate('/bom/search?mode=asc')}>
              Switch to ASC catalog search
            </Button>
            {bomProjectId ? (
              <Button
                type="primary"
                size="large"
                onClick={() => navigate(`/bom/projects/${bomProjectId}/workspace`)}
              >
                Open BOM workspace
              </Button>
            ) : (
              <Button type="primary" size="large" onClick={() => navigate(bomHubPath)}>
                Go to BOM projects
              </Button>
            )}
          </Space>
        }
      />

      <Card
        style={{
          borderRadius: token.borderRadiusLG,
          boxShadow: token.boxShadowTertiary,
          overflow: 'hidden',
          ...(hasNoResults ? { flex: 1, display: 'flex', flexDirection: 'column' as const } : {}),
        }}
        styles={{
          body: {
            padding: 0,
            ...(hasNoResults ? { flex: 1, display: 'flex', flexDirection: 'column' as const } : {}),
          },
        }}
      >
        <Flex
          vertical
          gap={token.paddingXXS}
          style={{
            paddingInline: token.paddingMD,
            paddingBlock: token.padding,
            borderBottom: `${token.lineWidth}px ${token.lineType} ${token.colorBorderSecondary}`,
          }}
        >
          <BomCardTitle>Closest ASC matches</BomCardTitle>
          <Typography.Text type="secondary">
            {filtered.length} candidate{filtered.length !== 1 ? 's' : ''} ranked for BOM matching.
            {bomProjectId
              ? ' Open your BOM workspace to add a line and run guided matching.'
              : ' Start or open a BOM project to save a matched line.'}
          </Typography.Text>
        </Flex>

        {hasNoResults ? (
          <Flex vertical justify="center" style={{ flex: 1, padding: token.paddingLG }}>
            <Empty
              description={
                <Space orientation="vertical" size={token.marginXXS}>
                  <Typography.Text style={hydraTextStyleToReactCss(hydraBaseStrong)}>No ASC matches found</Typography.Text>
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
          </Flex>
        ) : (
          <>
            <Table
              rowKey="ascNumber"
              size="middle"
              pagination={false}
              dataSource={pagedRows}
              columns={columns}
            />
            <Flex
              justify="space-between"
              align="center"
              wrap="wrap"
              gap={token.paddingSM}
              style={{
                paddingInline: token.paddingMD,
                paddingBlock: token.padding,
                borderTop: `${token.lineWidth}px ${token.lineType} ${token.colorBorderSecondary}`,
              }}
            >
              <Typography.Text type="secondary">
                Showing {pageFrom}–{pageTo} of {filtered.length}
              </Typography.Text>
              <Pagination
                current={page}
                pageSize={shellLayout.tablePageSizeDefault}
                total={filtered.length}
                showSizeChanger={false}
                hideOnSinglePage
                onChange={setPage}
              />
            </Flex>
          </>
        )}
      </Card>
    </Flex>
  );
}
