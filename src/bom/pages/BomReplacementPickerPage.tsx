import { useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

import {
  ASC_BROWSER_PRODUCTS,
  type AscBrowserProductRow,
} from '../data/ascBrowserProducts';
import { ascBrowserRowToCatalogPart } from '../bomChoosePartUtils';
import { matchScoreBand } from '../data/bomImportFlowSeed';
import { useBomMatchingData } from '../hooks/useBomMatchingData';
import { BomTablePaginationBar } from '../components/BomTablePaginationBar';
import { BomConfidenceTag, BomManualTag } from '../components/BomTags';
import { BomPageHeader } from '../layout/BomPageHeader';
import type { BomMatchResult } from '../data/types';
import { PageBackButton } from '../../shell/PageBackButton';
import {
  Alert,
  Button,
  Card,
  Checkbox,
  Space,
  Table,
  Typography,
  message,
  theme,
} from '../../ui/antd';
import type { TableColumnsType } from '../../ui/antd';
import { shellLayout } from '../../theme/hydraAlias';

type LocationState = {
  returnTo?: 'table' | 'review' | 'progressive';
  uploadId?: string;
};

const PICKER_WIDTHS = {
  select: 82,
  sku: 157,
  part: 257,
  figureNumber: 157,
  upc: 157,
  size: 157,
  weight: 157,
  matchScore: 157,
} as const;

export function BomReplacementPickerPage() {
  const { token } = theme.useToken();
  const { bomProjectId = '', itemId = '' } = useParams<{ bomProjectId: string; itemId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state ?? {}) as LocationState;
  const { matchResults, persist } = useBomMatchingData(bomProjectId);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const matchRow = matchResults.find((r) => r.itemId === itemId);
  const manualSwapLabel = matchRow?.topMatch
    ? `Manual Swap: ${matchRow.topMatch.partNumber} — ${matchRow.topMatch.description}`
  : matchRow?.originalRequest ?? 'BOM line';

  const paged = useMemo(() => {
    const start = (page - 1) * shellLayout.tablePageSizeDefault;
    return ASC_BROWSER_PRODUCTS.slice(start, start + shellLayout.tablePageSizeDefault);
  }, [page]);

  function goBack() {
    if (state.returnTo === 'review' || state.returnTo === 'progressive') {
      navigate(`/bom/projects/${bomProjectId}/matching/review`);
      return;
    }
    if (state.returnTo === 'table') {
      navigate(`/bom/projects/${bomProjectId}/matching/table`);
      return;
    }
    navigate(`/bom/projects/${bomProjectId}/matching/review`);
  }

  function handleApprove() {
    const row = ASC_BROWSER_PRODUCTS.find((p) => p.key === selectedKey);
    if (!row || !matchRow) {
      message.warning('Select a replacement part first.');
      return;
    }
    const topMatch = ascBrowserRowToCatalogPart(row);
    const next: BomMatchResult = {
      ...matchRow,
      topMatch,
      source: 'manual',
      lineStatus: 'pending',
      suggestedParts: [topMatch, ...matchRow.suggestedParts.filter((p) => p.partNumber !== topMatch.partNumber)].slice(
        0,
        3,
      ),
    };
    persist(matchResults.map((r) => (r.itemId === itemId ? next : r)));
    message.success('Part selected — confirm the match in review to continue.');
    goBack();
  }

  const columns: TableColumnsType<AscBrowserProductRow> = [
    {
      title: 'Select',
      key: 'select',
      width: PICKER_WIDTHS.select,
      render: (_, record) => (
        <Checkbox
          checked={selectedKey === record.key}
          onChange={() => setSelectedKey(record.key)}
        />
      ),
    },
    { title: 'SKU', dataIndex: 'ascNumber', key: 'sku', width: PICKER_WIDTHS.sku },
    { title: 'Part', dataIndex: 'description', key: 'part', width: PICKER_WIDTHS.part, ellipsis: true },
    { title: 'Figure Number', dataIndex: 'figureNumber', key: 'figureNumber', width: PICKER_WIDTHS.figureNumber },
    {
      title: 'UPC',
      key: 'upc',
      width: PICKER_WIDTHS.upc,
      render: () => '—',
    },
    { title: 'Size', dataIndex: 'size', key: 'size', width: PICKER_WIDTHS.size },
    {
      title: 'Weight',
      key: 'weight',
      width: PICKER_WIDTHS.weight,
      render: () => '0.25 lbs',
    },
    {
      title: 'Match Score',
      key: 'matchScore',
      width: PICKER_WIDTHS.matchScore,
      render: (_, record) => {
        if (selectedKey === record.key) {
          return <BomManualTag />;
        }
        const conf = 88;
        const band = matchScoreBand(conf);
        const confidence = band === 'high' ? 'high' : band === 'medium' ? 'medium' : 'low';
        return <BomConfidenceTag confidence={confidence} />;
      },
    },
  ];

  if (!matchRow) {
    return (
      <Space orientation="vertical" size={token.marginLG}>
        <Typography.Text>Line not found.</Typography.Text>
        <Button type="primary" onClick={goBack}>
          Back
        </Button>
      </Space>
    );
  }

  return (
    <Space orientation="vertical" size={token.marginLG} style={{ width: '100%' }}>
      <PageBackButton
        to={
          state.returnTo === 'table'
            ? `/bom/projects/${bomProjectId}/matching/table`
            : `/bom/projects/${bomProjectId}/matching/review`
        }
      >
        Back to match review
      </PageBackButton>

      <BomPageHeader
        title={matchRow.topMatch ? 'Choose a different part' : 'Choose a part'}
        description={
          matchRow.topMatch
            ? 'Select another ASC product for this BOM line.'
            : 'No match was suggested — pick the ASC part that fits this line.'
        }
        actions={
          <Space wrap>
            <Button size="large" onClick={() => setSelectedKey(null)}>
              Clear selection
            </Button>
            <Button type="primary" size="large" onClick={handleApprove}>
              Use selected part
            </Button>
          </Space>
        }
      />

      <Alert
        type="info"
        showIcon
        message={manualSwapLabel}
        description="Select a row below, then use the selected part and return to match review to confirm."
      />

      <Card styles={{ body: { padding: 0 } }}>
        <Table<AscBrowserProductRow>
          rowKey="key"
          columns={columns}
          dataSource={paged}
          pagination={false}
          scroll={{ x: 'max-content' }}
          tableLayout="fixed"
        />
        <BomTablePaginationBar
          current={page}
          total={ASC_BROWSER_PRODUCTS.length}
          onChange={setPage}
        />
      </Card>
    </Space>
  );
}
