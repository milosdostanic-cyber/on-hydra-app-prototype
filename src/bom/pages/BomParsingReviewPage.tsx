import { useCallback, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

import { useBomHubPath } from '../../context/ActiveProjectContext';
import { shellLayout } from '../../theme/hydraAlias';
import type { BomUploadFlowLocationState } from '../bomUploadFlowState';
import { readUploadFileName, resolveUploadDestination } from '../bomUploadFlowState';
import {
  ASC_FIELD_MAPPING_TOTAL,
  parsingReviewColumnProfile,
  countMappedAscFields,
} from '../bomFieldMappingUtils';
import { buildParsingReviewColumns } from '../bomParsingReviewColumns';
import { BomUploadFlowStepChrome } from '../components/BomUploadFlowStepChrome';
import { BomPageHeader } from '../layout/BomPageHeader';
import { createParsingReviewRows } from '../data/bomImportFlowSeed';
import { bomProjectById, bomProjectTitleById } from '../data/mockData';
import { useBomCancelUpload } from '../hooks/useBomCancelUpload';
import { figmaParsingReviewAlert } from '../bomParsingReviewAlert';
import type { BomItem } from '../data/types';
import {
  Alert,
  Button,
  Card,
  Flex,
  Pagination,
  Space,
  Table,
  message,
  theme,
} from '../../ui/antd';

export function BomParsingReviewPage() {
  const { token } = theme.useToken();
  const { bomProjectId = '' } = useParams<{ bomProjectId: string }>();
  const navigate = useNavigate();
  const bomHubPath = useBomHubPath();
  const location = useLocation();
  const uploadState = (location.state ?? {}) as BomUploadFlowLocationState;
  const { destination: uploadDestination, appendTargetId: resolvedAppendId } = resolveUploadDestination(
    bomProjectId,
    uploadState,
  );
  const uploadFileName = readUploadFileName(uploadState);
  const projectMeta = bomProjectById(bomProjectId);
  const title = bomProjectTitleById(bomProjectId) ?? 'New BOM project';
  const [page, setPage] = useState(1);
  const [rows, setRows] = useState<BomItem[]>(() => createParsingReviewRows().map((r) => ({ ...r })));

  const columnProfile = parsingReviewColumnProfile(uploadState.fieldMapping);
  const mappedFieldsStatus = `${countMappedAscFields(uploadState.fieldMapping)} of ${ASC_FIELD_MAPPING_TOTAL} fields mapped`;
  const parsingBanner = figmaParsingReviewAlert(rows, columnProfile);

  const updateRow = useCallback((rowId: string, patch: Partial<BomItem>) => {
    setRows((prev) => prev.map((r) => (r.id === rowId ? { ...r, ...patch } : r)));
  }, []);

  const columns = useMemo(
    () => buildParsingReviewColumns(columnProfile, updateRow),
    [columnProfile, updateRow],
  );

  const pagedParsedItems = useMemo(() => {
    const start = (page - 1) * shellLayout.tablePageSizeDefault;
    return rows.slice(start, start + shellLayout.tablePageSizeDefault);
  }, [page, rows]);

  const fieldMappingRoute = `/bom/projects/${bomProjectId}/field-mapping`;
  const { confirmCancelUpload } = useBomCancelUpload(bomProjectId);

  function handleCommitParsingReview() {
    if (rows.length === 0) {
      message.warning('No parsed items to continue.');
      return;
    }
    navigate(`/bom/projects/${bomProjectId}/matching`, { state: uploadState });
  }

  if (bomProjectId && bomProjectId !== 'new' && !projectMeta) {
    return (
      <Space orientation="vertical" size={token.marginLG} style={{ width: '100%' }}>
        <BomPageHeader
          title="BOM project not found"
          description="Unknown project id in this demo."
          actions={
            <Button type="primary" size="large" onClick={() => navigate(bomHubPath)}>
              Go to BOM home
            </Button>
          }
        />
      </Space>
    );
  }

  if (rows.length === 0) {
    const appendWorkspaceId = resolvedAppendId ?? bomProjectId;
    const isAppendFlow = uploadDestination === 'append';
    return (
      <Space orientation="vertical" size={token.marginLG} style={{ width: '100%' }}>
        <BomUploadFlowStepChrome
          backTo={fieldMappingRoute}
          backLabel="Back to field mapping"
          backState={uploadState}
          fileName={uploadFileName}
          currentStep={1}
          statusLabel={mappedFieldsStatus}
        />
        <BomPageHeader
          title="Parsing review"
          description={`Review parsed rows before matching. Project: ${title}.`}
          actions={
            <Space wrap>
              <Button size="large" onClick={() => confirmCancelUpload('review')}>
                Cancel upload
              </Button>
              <Button
                type="primary"
                size="large"
                onClick={() => navigate(fieldMappingRoute, { state: uploadState })}
              >
                Open field mapping
              </Button>
              {isAppendFlow ? (
                <Button size="large" onClick={() => navigate(`/bom/projects/${appendWorkspaceId}/workspace`)}>
                  Cancel — keep workspace as-is
                </Button>
              ) : null}
            </Space>
          }
        />
      </Space>
    );
  }

  return (
    <Space orientation="vertical" size={token.marginLG} style={{ width: '100%' }}>
      <BomUploadFlowStepChrome
        backTo={fieldMappingRoute}
        backLabel="Back to field mapping"
        backState={uploadState}
        fileName={uploadFileName}
        currentStep={1}
        statusLabel={mappedFieldsStatus}
      />
      <BomPageHeader
        title="Parsing review"
        description={`Review parsed rows before matching. Project: ${title}.`}
        actions={
          <Flex gap={token.marginXS} align="center" wrap="wrap">
            <Button size="large" onClick={() => confirmCancelUpload('review')}>
              Cancel upload
            </Button>
            <Button type="primary" size="large" disabled={rows.length === 0} onClick={handleCommitParsingReview}>
              Continue to matching
            </Button>
          </Flex>
        }
      />

      <Alert
        type={parsingBanner.type === 'success' ? 'info' : parsingBanner.type}
        showIcon
        message={parsingBanner.message}
        description={parsingBanner.description}
      />

      <Card styles={{ body: { padding: 0 } }}>
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
    </Space>
  );
}
