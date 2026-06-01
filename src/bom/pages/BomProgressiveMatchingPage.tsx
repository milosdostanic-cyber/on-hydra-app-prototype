import {
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  RightOutlined,
  TableOutlined,
} from '@ant-design/icons';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { matchScoreBand } from '../data/bomImportFlowSeed';
import { useBomMatchingData } from '../hooks/useBomMatchingData';
import { useBomImportFlow } from '../context/BomImportFlowContext';
import { useBomWorkspace } from '../../context/BomWorkspaceContext';
import { ensureWorkspaceRowDisplayFields } from '../data/bomWorkspaceSeed';
import { BomImportProgressStrip } from '../components/BomImportProgressStrip';
import { BomConfidenceTag, BomManualTag } from '../components/BomTags';
import { BomPageHeader } from '../layout/BomPageHeader';
import { bomItemById } from '../data/mockData';
import type { BomItem, BomItemConfidence, BomMatchResult } from '../data/types';
import { PageBackButton } from '../../shell/PageBackButton';
import {
  App,
  Button,
  Card,
  Divider,
  Flex,
  Progress,
  Space,
  Typography,
  message,
  theme,
} from '../../ui/antd';

function buildWorkspaceRowFromMatch(
  result: BomMatchResult,
  parsedItem: BomItem | undefined,
  rowIndex: number,
): BomItem {
  const match = result.topMatch;
  const conf: BomItemConfidence =
    result.source === 'manual' || (match?.matchConfidence ?? 0) >= 90
      ? 'high'
      : (match?.matchConfidence ?? 0) >= 70
        ? 'medium'
        : 'low';
  return ensureWorkspaceRowDisplayFields({
    id: `ws-import-${result.itemId}`,
    rowNumber: rowIndex,
    originalInput: result.originalRequest,
    parsedDescription: match?.description ?? result.originalRequest,
    sku: match?.partNumber,
    size: match?.dimensions ?? parsedItem?.size ?? '',
    pressureClass: match?.pressureRating ?? parsedItem?.pressureClass ?? '',
    connectionType: match?.connectionType ?? parsedItem?.connectionType ?? '',
    quantity: parsedItem?.quantity ?? 1,
    confidence: conf,
    category: match?.productFamily ?? parsedItem?.category,
    unit: parsedItem?.unit ?? 'EA',
    manufacturer: parsedItem?.manufacturer,
    status: 'pending' as const,
  });
}
import {
  hydraLargeNormal,
  hydraLargeStrong,
  hydraTextStyleToReactCss,
  hydraTitleHeading1,
} from '../../theme/hydraTypography';

export function BomProgressiveMatchingPage() {
  const { token } = theme.useToken();
  const { modal } = App.useApp();
  const { bomProjectId = '' } = useParams<{ bomProjectId: string }>();
  const navigate = useNavigate();
  const { updateProgress, dismissSession } = useBomImportFlow();
  const { rowsByProjectId, setWorkspaceRows } = useBomWorkspace();
  const { session, uploadId, matchResults, persist, stats } = useBomMatchingData(bomProjectId);

  const queue = useMemo(
    () => matchResults.filter((r) => r.lineStatus === 'pending'),
    [matchResults],
  );

  const [index, setIndex] = useState(0);
  const current: BomMatchResult | undefined = queue[index];
  const parsedItem = current ? bomItemById(current.itemId) ?? session?.parsedItems.find((i) => i.id === current.itemId) : undefined;
  const processed = stats.accepted + stats.skipped + stats.manual;
  const allDone = queue.length === 0;

  useEffect(() => {
    if (index >= queue.length && queue.length > 0) setIndex(0);
  }, [queue.length, index]);

  function handleCancelUpload() {
    modal.confirm({
      title: 'Cancel upload?',
      content: 'All matching progress for this file will be discarded.',
      icon: <ExclamationCircleOutlined style={{ color: token.colorWarning }} />,
      okText: 'Cancel upload',
      okType: 'danger',
      cancelText: 'Keep matching',
      onOk: () => {
        if (uploadId) dismissSession(uploadId);
        navigate('/bom');
      },
    });
  }

  function patchCurrent(patch: Partial<BomMatchResult>) {
    if (!current) return;
    persist(matchResults.map((r) => (r.itemId === current.itemId ? { ...r, ...patch } : r)));
  }

  function advanceAfterAction() {
    if (index < queue.length - 1) setIndex((i) => i + 1);
    else setIndex(0);
  }

  function handleAcceptAndNext() {
    if (!current) return;
    patchCurrent({ lineStatus: 'accepted', source: 'auto' });
    message.success('Line accepted.');
    advanceAfterAction();
  }

  function handleSkip() {
    if (!current) return;
    patchCurrent({ lineStatus: 'skipped' });
    advanceAfterAction();
  }

  function handleManualPick() {
    if (!current) return;
    navigate(`/bom/projects/${bomProjectId}/matching/items/${current.itemId}/replacement`, {
      state: { returnTo: 'progressive', uploadId },
    });
  }

  function handleAcceptAllHigh() {
    const next = matchResults.map((r) => {
      const conf = r.topMatch?.matchConfidence ?? 0;
      if (r.lineStatus === 'pending' && conf >= 90) return { ...r, lineStatus: 'accepted' as const };
      if (r.lineStatus === 'pending' && conf < 90) return { ...r, lineStatus: 'skipped' as const };
      return r;
    });
    persist(next);
    message.success('Accepted all high-confidence matches; remaining lines skipped.');
    setIndex(0);
  }

  function handleSaveAndImport() {
    const accepted = matchResults.filter((r) => r.lineStatus === 'accepted' || r.source === 'manual');
    const parsedItems = session?.parsedItems ?? [];
    const existingRows = rowsByProjectId[bomProjectId] ?? [];
    const startIndex = existingRows.length;
    const newRows = accepted.map((result, i) => {
      const parsedItem = parsedItems.find((p) => p.id === result.itemId);
      return buildWorkspaceRowFromMatch(result, parsedItem, startIndex + i + 1);
    });
    if (newRows.length > 0) {
      setWorkspaceRows(bomProjectId, (prev) => [...prev, ...newRows]);
    }
    if (uploadId) updateProgress(uploadId, { currentStep: 'done' });
    message.success(
      `Imported ${stats.total} items — ${stats.accepted} accepted · ${stats.manual} added manually · ${stats.skipped} skipped.`,
    );
    navigate(`/bom/projects/${bomProjectId}/workspace`, {
      state: {
        importSummary: {
          fileName: session?.progress.fileName,
          total: stats.total,
          accepted: stats.accepted,
          manual: stats.manual,
          skipped: stats.skipped,
        },
      },
    });
  }

  if (allDone) {
    return (
      <Flex vertical align="center" justify="center" gap={token.marginLG} style={{ minHeight: 400, width: '100%' }}>
        <CheckCircleOutlined style={{ fontSize: hydraTitleHeading1.fontSize, color: token.colorSuccess }} />
        <Typography.Title level={3} style={{ margin: 0 }}>
          Matching complete
        </Typography.Title>
        <Typography.Text type="secondary">
          {stats.accepted} accepted · {stats.manual} added manually · {stats.skipped} skipped
        </Typography.Text>
        <Space wrap>
          <Button onClick={() => navigate(`/bom/projects/${bomProjectId}/matching`)}>View as table</Button>
          <Button type="primary" size="large" onClick={handleSaveAndImport}>
            Save and import to BOM
          </Button>
        </Space>
      </Flex>
    );
  }

  if (!current) return null;

  const top = current.topMatch;
  const conf = top?.matchConfidence ?? 0;

  return (
    <>
      <BomImportProgressStrip placement="shell-flush" progress={session.progress} />
      <Space orientation="vertical" size={token.marginMD} style={{ width: '100%' }}>
      <PageBackButton to="/bom">Back to BOM</PageBackButton>

      <BomPageHeader
        title="Matching results"
        description="Confirm matches one line at a time, or switch to the table view."
        actions={
          <Space wrap>
            <Button
              size="large"
              icon={<TableOutlined />}
              onClick={() => navigate(`/bom/projects/${bomProjectId}/matching`)}
            >
              View as table
            </Button>
            <Button size="large" onClick={handleCancelUpload}>
              Cancel upload
            </Button>
            <Button onClick={handleAcceptAllHigh}>Accept all high matches and skip rest</Button>
            <Button
              type="primary"
              size="large"
              disabled={queue.length > 0}
              title={queue.length > 0 ? `${queue.length} item${queue.length === 1 ? '' : 's'} still pending — review all items before importing.` : undefined}
              onClick={handleSaveAndImport}
            >
              Save and import to BOM
            </Button>
          </Space>
        }
      />

      <Card styles={{ body: { padding: `${token.paddingSM}px ${token.paddingMD}px` } }}>
        <Flex align="center" gap={token.marginMD}>
          <Flex vertical gap={token.marginXXS}>
            <Typography.Text strong>
              {index + 1}{' '}
              <Typography.Text type="secondary">/ {queue.length} pending</Typography.Text>
            </Typography.Text>
            <Typography.Text type="secondary" style={hydraTextStyleToReactCss(hydraLargeNormal)}>
              {processed} of {matchResults.length} lines processed overall
            </Typography.Text>
          </Flex>
          <Progress
            percent={matchResults.length ? Math.round((processed / matchResults.length) * 100) : 0}
            showInfo={false}
            strokeColor={token.colorPrimary}
            style={{ flex: 1, margin: 0 }}
          />
        </Flex>
      </Card>

      {top ? (
        <Flex
          gap={token.marginSM}
          wrap="wrap"
          style={{
            paddingInline: token.paddingMD,
            paddingBlock: token.paddingXS,
            background: token.colorFillAlter,
            borderRadius: token.borderRadiusLG,
            border: `${token.lineWidth}px ${token.lineType} ${token.colorBorderSecondary}`,
          }}
        >
          <Typography.Text type="secondary" style={hydraTextStyleToReactCss(hydraLargeNormal)}>
            Match score:
          </Typography.Text>
          {current.source === 'manual' ? (
            <BomManualTag />
          ) : (
            <BomConfidenceTag confidence={matchScoreBand(conf) === 'high' ? 'high' : matchScoreBand(conf) === 'medium' ? 'medium' : 'low'} />
          )}
        </Flex>
      ) : null}

      <Card styles={{ body: { padding: token.paddingMD } }}>
        <Flex gap={token.marginMD} align="stretch" wrap="wrap">
          <div
            style={{
              flex: 1,
              minWidth: 240,
              padding: token.paddingMD,
              background: token.colorFillAlter,
              borderRadius: token.borderRadiusLG,
              border: `${token.lineWidth}px ${token.lineType} ${token.colorBorderSecondary}`,
            }}
          >
            <Typography.Text strong style={{ display: 'block', marginBottom: token.marginSM }}>
              ORIGINAL PART
            </Typography.Text>
            <Divider style={{ marginBlock: token.marginXS }} />
            <Space orientation="vertical" size={token.marginXS}>
              <Typography.Text>{current.originalRequest}</Typography.Text>
              {parsedItem ? (
                <Typography.Text type="secondary">{parsedItem.parsedDescription}</Typography.Text>
              ) : null}
            </Space>
          </div>

          <Flex align="center" justify="center" style={{ flexShrink: 0 }}>
            <RightOutlined style={{ color: token.colorPrimary, fontSize: token.fontSizeLG }} />
          </Flex>

          <div
            style={{
              flex: 1,
              minWidth: 240,
              padding: token.paddingMD,
              background: top ? token.colorPrimaryBg : token.colorFillQuaternary,
              borderRadius: token.borderRadiusLG,
              border: `${token.lineWidth}px ${token.lineType} ${top ? token.colorPrimaryBorder : token.colorBorderSecondary}`,
            }}
          >
            <Typography.Text strong style={{ display: 'block', marginBottom: token.marginSM }}>
              SUGGESTED ASC PART
            </Typography.Text>
            <Divider style={{ marginBlock: token.marginXS }} />
            {top ? (
              <Space orientation="vertical" size={token.marginXS}>
                <Typography.Text strong style={hydraTextStyleToReactCss(hydraLargeStrong)}>
                  {top.partNumber}
                </Typography.Text>
                <Typography.Text>{top.description}</Typography.Text>
              </Space>
            ) : (
              <Typography.Text type="secondary">No automatic match — pick a part manually.</Typography.Text>
            )}
          </div>
        </Flex>

        <Flex justify="flex-end" gap={token.marginSM} wrap="wrap" style={{ marginTop: token.marginMD }}>
          <Button onClick={handleSkip}>Skip</Button>
          <Button onClick={handleManualPick}>Manual pick</Button>
          <Button type="primary" onClick={handleAcceptAndNext}>
            Approve &amp; next
          </Button>
        </Flex>
      </Card>
    </Space>
    </>
  );
}
