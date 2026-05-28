import { ExclamationCircleOutlined } from '@ant-design/icons';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { shellLayout } from '../../theme/hydraAlias';
import { parsingReviewColumnProfile } from '../bomFieldMappingUtils';
import { summarizeParsingReviewAlert } from '../bomParsingReviewAlert';
import { buildParsingReviewColumns } from '../bomParsingReviewColumns';
import { createInitialMatchResults } from '../data/bomImportFlowSeed';
import { useBomImportFlow } from '../context/BomImportFlowContext';
import { useBomImportSession } from '../hooks/useBomImportSession';
import type { BomUploadFlowLocationState } from '../bomUploadFlowState';
import { BomImportProgressStrip } from '../components/BomImportProgressStrip';
import { BomTablePaginationBar } from '../components/BomTablePaginationBar';
import { BomPageHeader } from '../layout/BomPageHeader';
import { bomProjectById, bomProjectTitleById } from '../data/mockData';
import type { BomItem } from '../data/types';
import { PageBackButton } from '../../shell/PageBackButton';
import {
  Alert,
  App,
  Button,
  Card,
  Space,
  Table,
  message,
  theme,
} from '../../ui/antd';

export function BomParsingReviewPage() {
  const { token } = theme.useToken();
  const { modal } = App.useApp();
  const { bomProjectId = '' } = useParams<{ bomProjectId: string }>();
  const navigate = useNavigate();
  const { updateProgress, dismissSession } = useBomImportFlow();
  const { session, uploadState, uploadId: flowUploadId } = useBomImportSession(bomProjectId);
  const projectMeta = bomProjectById(bomProjectId);
  const title = bomProjectTitleById(bomProjectId) ?? 'BOM project';
  const [page, setPage] = useState(1);

  const [rows, setRows] = useState<BomItem[]>([]);

  useEffect(() => {
    if (session?.parsedItems?.length) {
      setRows(session.parsedItems.map((r) => ({ ...r })));
    }
  }, [session?.uploadId, session?.parsedItems]);

  useEffect(() => {
    const uploadId = session?.uploadId;
    if (!uploadId || rows.length === 0) return;
    updateProgress(uploadId, {
      currentStep: 'review',
      totalRows: rows.length,
      parsedRows: rows.length,
    });
  }, [session?.uploadId, rows.length, updateProgress]);

  const profile = parsingReviewColumnProfile(uploadState.fieldMapping ?? session?.fieldMapping);

  const parsingAlert = useMemo(() => summarizeParsingReviewAlert(rows, profile), [rows, profile]);

  const pagedRows = useMemo(() => {
    const start = (page - 1) * shellLayout.tablePageSizeDefault;
    return rows.slice(start, start + shellLayout.tablePageSizeDefault);
  }, [page, rows]);

  const updateRow = useCallback((rowId: string, patch: Partial<BomItem>) => {
    setRows((prev) => prev.map((r) => (r.id === rowId ? { ...r, ...patch } : r)));
  }, []);

  const columns = useMemo(() => buildParsingReviewColumns(profile, updateRow), [profile, updateRow]);

  function handleCancelUpload() {
    modal.confirm({
      title: 'Cancel upload and lose progress?',
      icon: <ExclamationCircleOutlined style={{ color: token.colorWarning }} />,
      centered: true,
      okText: 'Cancel upload',
      okType: 'danger',
      cancelText: 'Keep editing',
      content: 'All unsaved parsing progress for this file will be lost.',
      onOk: () => {
        const uploadId = flowUploadId ?? session?.uploadId;
        if (uploadId) dismissSession(uploadId);
        navigate('/bom');
      },
    });
  }

  function handleContinue() {
    if (rows.length === 0) {
      message.warning('No parsed rows to continue.');
      return;
    }

    const uploadId = flowUploadId ?? session?.uploadId;
    const matchResults = createInitialMatchResults(rows);

    if (uploadId) {
      updateProgress(uploadId, {
        currentStep: 'match',
        parsedRows: rows.length,
        totalRows: rows.length,
        parsedItems: rows,
        matchResults,
      });
    }

    const navState: BomUploadFlowLocationState = {
      ...uploadState,
      uploadId,
      fieldMapping: uploadState.fieldMapping ?? session?.fieldMapping,
    };

    navigate(`/bom/projects/${bomProjectId}/matching`, { state: navState });
  }

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

  const hasSession = Boolean(session?.uploadId);

  if (!hasSession) {
    return (
      <Space orientation="vertical" size={token.marginLG} style={{ width: '100%' }}>
        <PageBackButton to="/bom">Back to BOM</PageBackButton>
        <BomPageHeader
          title="Parsing review"
          description={`Review parsed rows before matching. Project: ${title}.`}
          actions={
            <Button
              type="primary"
              size="large"
              onClick={() => navigate(`/bom/projects/${bomProjectId}/field-mapping`)}
            >
              Back to field mapping
            </Button>
          }
        />
        <Alert
          type="error"
          showIcon
          message="Parsing session not found"
          description="No active upload session was found for this project. This can happen if the page was refreshed mid-import. Return to field mapping to start again."
        />
      </Space>
    );
  }

  if (rows.length === 0) {
    return (
      <Space orientation="vertical" size={token.marginLG} style={{ width: '100%' }}>
        <PageBackButton to="/bom">Back to BOM</PageBackButton>
        <BomPageHeader
          title="Nothing to parse"
          description="No line items were produced from your file. Adjust column mapping or upload a different file."
          actions={
            <Button
              type="primary"
              size="large"
              onClick={() =>
                navigate(`/bom/projects/${bomProjectId}/field-mapping`, { state: uploadState })
              }
            >
              Open field mapping
            </Button>
          }
        />
      </Space>
    );
  }

  return (
    <Space orientation="vertical" size={token.marginLG} style={{ width: '100%' }}>
      <PageBackButton to="/bom">Back to BOM</PageBackButton>
      <BomImportProgressStrip progress={session.progress} />

      <BomPageHeader
        title="Parsing review"
        description={`Review parsed rows before matching. Project: ${title}.`}
        actions={
          <Space wrap>
            <Button size="large" onClick={handleCancelUpload}>
              Cancel upload
            </Button>
            <Button type="primary" size="large" onClick={handleContinue}>
              Continue to matching
            </Button>
          </Space>
        }
      />

      <Alert
        type={parsingAlert.type}
        showIcon
        message={parsingAlert.message}
        description={parsingAlert.description}
        style={{
          paddingBlock: token.paddingMD,
          paddingInline: token.paddingLG,
        }}
      />

      <Card styles={{ body: { padding: 0 } }}>
        <Table<BomItem>
          rowKey="id"
          columns={columns}
          dataSource={pagedRows}
          pagination={false}
          scroll={{ x: 'max-content' }}
          tableLayout="fixed"
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
        <BomTablePaginationBar current={page} total={rows.length} onChange={setPage} />
      </Card>
    </Space>
  );
}
