import { useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

import {
  ASC_BROWSER_PRODUCTS,
  type AscBrowserProductRow,
} from '../data/ascBrowserProducts';
import { mockAscParts } from '../data/mockData';
import { matchScoreBand, matchScoreLabel } from '../data/bomImportFlowSeed';
import { useBomMatchingData } from '../hooks/useBomMatchingData';
import { BomTablePaginationBar } from '../components/BomTablePaginationBar';
import { BomPageHeader } from '../layout/BomPageHeader';
import type { AscCatalogPart, BomMatchResult } from '../data/types';
import { PageBackButton } from '../../shell/PageBackButton';
import {
  Alert,
  Button,
  Card,
  Checkbox,
  Space,
  Table,
  Tag,
  Typography,
  message,
  theme,
} from '../../ui/antd';
import type { TableColumnsType } from '../../ui/antd';
import { shellLayout } from '../../theme/hydraAlias';

type LocationState = {
  returnTo?: 'table' | 'progressive';
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

function catalogPartToAsc(row: AscBrowserProductRow): AscCatalogPart {
  const existing = mockAscParts.find((p) => p.partNumber === row.ascNumber);
  if (existing) return { ...existing, matchConfidence: 92 };
  return {
    partNumber: row.ascNumber,
    productFamily: row.partType,
    description: row.description,
    dimensions: row.size,
    pressureRating: '300 PSI',
    connectionType: 'Grooved',
    approvals: ['UL Listed'],
    matchConfidence: 85,
    matchedAttributes: [],
    ignoredAttributes: [],
    conversionRule: 'Manual catalog selection',
    substitutionRisk: 'low',
  };
}

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
    if (state.returnTo === 'progressive') {
      navigate(`/bom/projects/${bomProjectId}/matching/progressive`);
      return;
    }
    navigate(`/bom/projects/${bomProjectId}/matching`);
  }

  function handleApprove() {
    const row = ASC_BROWSER_PRODUCTS.find((p) => p.key === selectedKey);
    if (!row || !matchRow) {
      message.warning('Select a replacement part first.');
      return;
    }
    const topMatch = catalogPartToAsc(row);
    const next: BomMatchResult = {
      ...matchRow,
      topMatch,
      source: 'manual',
      lineStatus: 'accepted',
      suggestedParts: [topMatch, ...matchRow.suggestedParts].slice(0, 3),
    };
    persist(matchResults.map((r) => (r.itemId === itemId ? next : r)));
    message.success('Part approved and marked as added manually.');
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
          return <Tag style={{ margin: 0 }}>Added manually</Tag>;
        }
        const conf = 88;
        const band = matchScoreBand(conf);
        const color = band === 'high' ? 'success' : band === 'medium' ? 'warning' : 'error';
        return (
          <Tag color={color} style={{ margin: 0 }}>
            {matchScoreLabel('auto', conf)}
          </Tag>
        );
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
      <PageBackButton to={`/bom/projects/${bomProjectId}/matching`}>
        {state.returnTo === 'progressive' ? 'Back to matching' : 'Back to review'}
      </PageBackButton>

      <BomPageHeader
        title="Replacement Part"
        description="Choose an ASC product to replace the current suggested match for this BOM line."
        actions={
          <Space wrap>
            <Button size="large" onClick={() => setSelectedKey(null)}>
              Choose different part
            </Button>
            <Button type="primary" size="large" onClick={handleApprove}>
              Approve
            </Button>
          </Space>
        }
      />

      <Alert
        type="info"
        showIcon
        message={manualSwapLabel}
        description="Select a row below, then Approve to mark this line as added manually."
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
