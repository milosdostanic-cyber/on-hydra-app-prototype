import { useCallback, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

import { useBomHubPath } from '../../context/ActiveProjectContext';
import { shellLayout } from '../../theme/hydraAlias';
import { bluePrimaryPrimitiveLight } from '../../theme/primaryPrimitiveBlue';
import {
  hydraBaseNormal,
  hydraTextStyleToReactCss,
  hydraTitleHeading3,
} from '../../theme/hydraTypography';
import { BomConfidenceTag } from '../components/BomTags';
import type { BomItemConfidence } from '../data/types';
import type { BomUploadFlowLocationState } from '../bomUploadFlowState';
import { readUploadFileName } from '../bomUploadFlowState';
import { ASC_FIELD_MAPPING_TOTAL, countMappedAscFields } from '../bomFieldMappingUtils';
import {
  applyAcceptAllHighSkipRest,
  bulkAcceptHighSkipRestMessage,
  HIGH_MATCH_AUTO_ACCEPT_THRESHOLD,
} from '../bomMatchingBulkActions';
import { buildMatchingResultsColumns } from '../bomMatchingColumns';
import { BomUploadFlowStepChrome } from '../components/BomUploadFlowStepChrome';
import { BomPageHeader } from '../layout/BomPageHeader';
import { createParsingReviewRows } from '../data/bomImportFlowSeed';
import { bomProjectById, bomProjectTitleById } from '../data/mockData';
import { useBomCancelUpload } from '../hooks/useBomCancelUpload';
import { useBomMatchingData } from '../hooks/useBomMatchingData';
import type { BomMatchResult } from '../data/types';
import {
  Button,
  Card,
  Flex,
  Pagination,
  Select,
  Space,
  Table,
  Typography,
  message,
  theme,
} from '../../ui/antd';

type ConfidenceFilter = 'all' | 'high' | 'medium' | 'low';

function rowConfidence(row: BomMatchResult): 'high' | 'medium' | 'low' | 'none' {
  const p = row.topMatch?.matchConfidence ?? 0;
  if (!row.topMatch) return 'none';
  if (p >= HIGH_MATCH_AUTO_ACCEPT_THRESHOLD) return 'high';
  if (p >= 70) return 'medium';
  return 'low';
}

/** KPI reflects accepted lines only — skipped medium/low are not treated as accepted matches. */
function aggregateMatchConfidence(results: BomMatchResult[]): BomItemConfidence {
  const accepted = results.filter((r) => r.lineStatus === 'accepted');
  const source = accepted.length > 0 ? accepted : results.filter((r) => r.lineStatus === 'pending');
  if (source.length === 0) return 'low';

  const bands = source.map(rowConfidence);
  if (bands.every((b) => b === 'high' || b === 'none')) return 'high';
  if (bands.some((b) => b === 'low' || b === 'none')) return 'low';
  return 'medium';
}

/** Figma `5026:21422` — KPI stat strip above matching table. */
function BomMatchingStatsStrip({
  total,
  accepted,
  pending,
  skipped,
  matchConfidence,
}: {
  total: number;
  accepted: number;
  pending: number;
  skipped: number;
  matchConfidence: BomItemConfidence;
}) {
  const { token } = theme.useToken();

  const cardShellStyle = (accentColor: string, flex?: string | number) => ({
    flex: flex ?? 1,
    minWidth: 212,
    height: 56,
    paddingLeft: token.paddingMD,
    paddingRight: token.paddingMD,
    paddingTop: token.paddingSM,
    paddingBottom: token.paddingSM,
    borderRadius: token.borderRadiusLG,
    border: 'none',
    borderLeft: `${token.sizeUnit}px solid ${accentColor}`,
    background: token.colorBgContainer,
    boxShadow: token.boxShadowTertiary,
    boxSizing: 'border-box' as const,
  });

  const statInner = (label: string, value: number) => (
    <Flex align="center" justify="space-between" style={{ width: '100%', height: 32 }}>
      <Typography.Text type="secondary" style={hydraTextStyleToReactCss(hydraBaseNormal)}>
        {label}
      </Typography.Text>
      <Typography.Text style={hydraTextStyleToReactCss(hydraTitleHeading3)}>{value}</Typography.Text>
    </Flex>
  );

  return (
    <Flex gap={token.margin} align="stretch" style={{ width: '100%' }}>
      <Flex align="center" style={cardShellStyle(bluePrimaryPrimitiveLight[6])}>
        {statInner('Total items', total)}
      </Flex>
      <Flex align="center" style={cardShellStyle(token.colorSuccessBorder)}>
        {statInner('Accepted', accepted)}
      </Flex>
      <Flex align="center" style={cardShellStyle(bluePrimaryPrimitiveLight[2])}>
        {statInner('Pending', pending)}
      </Flex>
      <Flex align="center" style={cardShellStyle(token.colorWarning)}>
        {statInner('Skipped', skipped)}
      </Flex>
      <Flex align="center" style={{ ...cardShellStyle(bluePrimaryPrimitiveLight[2], 'none'), minWidth: 368 }}>
        <Flex align="center" justify="space-between" style={{ width: '100%', maxWidth: 326, height: 30 }}>
          <Typography.Text type="secondary" style={hydraTextStyleToReactCss(hydraBaseNormal)}>
            Match Confidence
          </Typography.Text>
          <BomConfidenceTag confidence={matchConfidence} showIcon />
        </Flex>
      </Flex>
    </Flex>
  );
}

export function BomMatchingPage() {
  const { token } = theme.useToken();
  const { bomProjectId = '' } = useParams<{ bomProjectId: string }>();
  const navigate = useNavigate();
  const bomHubPath = useBomHubPath();
  const location = useLocation();
  const uploadState = (location.state ?? {}) as BomUploadFlowLocationState;
  const uploadFileName = readUploadFileName(uploadState);
  const projectMeta = bomProjectById(bomProjectId);
  const projectTitle = bomProjectTitleById(bomProjectId) ?? 'New BOM project';
  const [page, setPage] = useState(1);
  const [confidenceFilter, setConfidenceFilter] = useState<ConfidenceFilter>('all');

  const { matchResults, persist, stats } = useBomMatchingData(bomProjectId);

  const rowNumbers = useMemo(() => {
    const parsed = createParsingReviewRows();
    return new Map(parsed.map((r) => [r.id, r.rowNumber]));
  }, []);

  const filteredResults = useMemo(() => {
    return matchResults.filter((row) => {
      const c = rowConfidence(row);
      if (confidenceFilter === 'all') return true;
      if (confidenceFilter === 'high') return c === 'high';
      if (confidenceFilter === 'medium') return c === 'medium';
      if (confidenceFilter === 'low') return c === 'low' || c === 'none';
      return true;
    });
  }, [confidenceFilter, matchResults]);

  const pagedMatchResults = useMemo(() => {
    const start = (page - 1) * shellLayout.tablePageSizeDefault;
    return filteredResults.slice(start, start + shellLayout.tablePageSizeDefault);
  }, [filteredResults, page]);

  const matchConfidence = aggregateMatchConfidence(matchResults);
  const allLinesReviewed = stats.pending === 0;
  const mappedFieldsStatus = `${countMappedAscFields(uploadState.fieldMapping)} of ${ASC_FIELD_MAPPING_TOTAL} fields mapped`;
  const matchingProgressStatus = allLinesReviewed
    ? `All ${stats.total} reviewed`
    : mappedFieldsStatus;
  const parsingReviewRoute = `/bom/projects/${bomProjectId}/parsing-review`;
  const { confirmCancelUpload } = useBomCancelUpload(bomProjectId);

  const handleAccept = useCallback(
    (row: BomMatchResult) => {
      persist(matchResults.map((r) => (r.itemId === row.itemId ? { ...r, lineStatus: 'accepted' } : r)));
      message.success('Line accepted.');
    },
    [matchResults, persist],
  );

  const handleSkip = useCallback(
    (row: BomMatchResult) => {
      persist(matchResults.map((r) => (r.itemId === row.itemId ? { ...r, lineStatus: 'skipped' } : r)));
      message.info('Line skipped.');
    },
    [matchResults, persist],
  );

  const handleRefine = useCallback(
    (row: BomMatchResult) => {
      navigate(`/bom/projects/${bomProjectId}/matching/items/${row.itemId}/replacement`, {
        state: { ...uploadState, returnTo: 'matching' },
      });
    },
    [bomProjectId, navigate, uploadState],
  );

  const columns = useMemo(
    () =>
      buildMatchingResultsColumns((itemId) => rowNumbers.get(itemId), {
        onAccept: handleAccept,
        onSkip: handleSkip,
        onRefine: handleRefine,
      }),
    [handleAccept, handleRefine, handleSkip, rowNumbers],
  );

  function handleAcceptAllHighAndSkipRest() {
    const { next, acceptedCount, skippedCount } = applyAcceptAllHighSkipRest(matchResults);
    if (acceptedCount === 0 && skippedCount === 0) {
      message.info('No pending lines to update.');
      return;
    }
    persist(next);
    message.success(bulkAcceptHighSkipRestMessage(acceptedCount, skippedCount));
  }

  if (bomProjectId && bomProjectId !== 'new' && !projectMeta) {
    return (
      <Space orientation="vertical" size={token.marginLG} style={{ width: '100%' }}>
        <BomPageHeader
          title="BOM project not found"
          description="Unknown project id."
          actions={
            <Button type="primary" size="large" onClick={() => navigate(bomHubPath)}>
              Go to BOM home
            </Button>
          }
        />
      </Space>
    );
  }

  return (
    <Space orientation="vertical" size={token.marginLG} style={{ width: '100%' }}>
      <BomUploadFlowStepChrome
        backTo={parsingReviewRoute}
        backLabel="Back to parsing review"
        backState={uploadState}
        fileName={uploadFileName}
        currentStep={2}
        statusLabel={matchingProgressStatus}
        statusTone={allLinesReviewed ? 'success' : 'warning'}
        stepsComplete={allLinesReviewed}
      />
      <BomPageHeader
        title="Matching results"
        description={`Catalog candidates per BOM line. Project: ${projectTitle}.`}
        actions={
          <Flex gap={token.marginXS} align="center" wrap="wrap">
            <Button size="large" onClick={() => confirmCancelUpload('match')}>
              Cancel upload
            </Button>
            <Button type="primary" size="large" onClick={() => navigate(`/bom/projects/${bomProjectId}/workspace`)}>
              Save and import to BOM
            </Button>
          </Flex>
        }
      />

      <BomMatchingStatsStrip
        total={stats.total}
        accepted={stats.accepted}
        pending={stats.pending}
        skipped={stats.skipped}
        matchConfidence={matchConfidence}
      />

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
            style={{ width: 160 }}
            options={[
              { value: 'all', label: 'All confidence level' },
              { value: 'high', label: 'High' },
              { value: 'medium', label: 'Medium' },
              { value: 'low', label: 'Low' },
            ]}
          />
          <Button
            type="primary"
            ghost
            disabled={stats.pending === 0}
            onClick={handleAcceptAllHighAndSkipRest}
          >
            Accept all high matches and skip rest
          </Button>
        </Flex>
        <Table<BomMatchResult>
          rowKey="itemId"
          columns={columns}
          dataSource={pagedMatchResults}
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
            total={filteredResults.length}
            onChange={setPage}
            showSizeChanger={false}
          />
        </Flex>
      </Card>
    </Space>
  );
}
