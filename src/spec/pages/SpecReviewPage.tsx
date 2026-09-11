import { CheckOutlined, FileTextOutlined, FileWordOutlined } from '@ant-design/icons';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { PageBackButton } from '../../shell/PageBackButton';
import { projectTitleById } from '../../shell/projectSeed';
import { ExportCard } from '../../ui/ExportCard';
import { HydraTag } from '../../ui/HydraTag';
import {
  Alert,
  App,
  Button,
  Col,
  Empty,
  Flex,
  Modal,
  Row,
  Select,
  Skeleton,
  Typography,
  theme,
} from '../../ui/antd';
import { SpecCompareRegions } from '../components/SpecCompareRegions';
import { SpecPermissionBoundary } from '../components/SpecPermissionBoundary';
import { SpecWorkspaceHeader } from '../components/SpecWorkspaceHeader';
import {
  canEdit,
  deltaCategoryLabel,
  deltaCategoryTone,
} from '../constants/specStatusVocabulary';
import { useSpecDemo } from '../context/SpecDemoContext';
import { useSpecWorkspace } from '../context/SpecWorkspaceContext';
import {
  mockSpecEditorRepository,
  mockSpecReviewRepository,
} from '../data/repositories/specRepositories';
import { useSpecMockStore } from '../data/specMockStore';
import type { SpecAlignmentDelta, SpecBaseline, SpecDeltaCategory, SpecWorkingCopy } from '../data/types';
import { useSpecDocument } from '../hooks/useSpecDocument';
import { trackSpecEvent } from '../specAnalytics';
import { specAnalyzePath, specEditPath, specHomePath } from '../specNavigation';

/**
 * Supplemental baseline comparison retained by direct route only.
 * Recommendation review lives in `SpecEditPage`.
 */
export function SpecReviewPage() {
  const { token } = theme.useToken();
  const { modal, message } = App.useApp();
  const navigate = useNavigate();
  const { specId = '' } = useParams<{ specId: string }>();
  const { document, loading, error } = useSpecDocument(specId);
  const store = useSpecMockStore();
  const workspace = useSpecWorkspace();
  const demo = useSpecDemo();
  const access = demo.role;

  const [baselines, setBaselines] = useState<SpecBaseline[]>([]);
  const [baselineId, setBaselineId] = useState<string | undefined>();
  const [deltas, setDeltas] = useState<SpecAlignmentDelta[]>([]);
  const [selectedDeltaId, setSelectedDeltaId] = useState<string | null>(null);
  const [workingCopy, setWorkingCopy] = useState<SpecWorkingCopy | undefined>();
  const [panelLoading, setPanelLoading] = useState(true);
  const [exportOpen, setExportOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState<'docx' | 'pdf'>('docx');

  const reloadReview = useCallback(async (documentId: string, selectedBaseline?: string) => {
    setPanelLoading(true);
    try {
      const [bases, wc] = await Promise.all([
        mockSpecReviewRepository.listBaselines(documentId),
        mockSpecEditorRepository.getWorkingCopy(documentId),
      ]);
      setBaselines(bases);
      setWorkingCopy(wc);

      const nextBaseline =
        selectedBaseline && bases.some((b) => b.id === selectedBaseline)
          ? selectedBaseline
          : bases.find((b) => b.compatible)?.id ?? bases[0]?.id;

      setBaselineId(nextBaseline);
      if (nextBaseline) {
        const list = await mockSpecReviewRepository.listDeltas(documentId, nextBaseline);
        setDeltas(list);
        setSelectedDeltaId(list[0]?.id ?? null);
      } else {
        setDeltas([]);
        setSelectedDeltaId(null);
      }
    } finally {
      setPanelLoading(false);
    }
  }, []);

  useEffect(() => {
    if (document) {
      workspace.setDocumentId(document.id);
      trackSpecEvent('spec_review_opened', { documentId: document.id });
      void reloadReview(document.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [document?.id, store.scenarioId, store.baselines, store.deltas, store.workingCopies]);

  const selectedBaseline = baselines.find((b) => b.id === baselineId);
  const projectName = document?.projectId ? projectTitleById(document.projectId) : undefined;
  const editable = canEdit(access);

  const deltaCounts = useMemo(() => {
    const counts = new Map<SpecDeltaCategory, number>();
    for (const d of deltas) counts.set(d.category, (counts.get(d.category) ?? 0) + 1);
    return [...counts.entries()];
  }, [deltas]);

  const changedCount = deltas.filter((d) => d.category !== 'matched').length;

  const onBaselineChange = async (id: string) => {
    if (!document) return;
    setBaselineId(id);
    setPanelLoading(true);
    try {
      const list = await mockSpecReviewRepository.listDeltas(document.id, id);
      setDeltas(list);
      setSelectedDeltaId(list[0]?.id ?? null);
    } finally {
      setPanelLoading(false);
    }
  };

  const createChangeFromDelta = (delta: SpecAlignmentDelta) => {
    if (!document) return;

    if (!workingCopy) {
      modal.confirm({
        title: 'Create a working copy first?',
        content: 'Differences become tracked changes on a working copy. Open Edit to create one, then return here.',
        okText: 'Go to Edit',
        onOk: () => navigate(specEditPath(document.id)),
      });
      return;
    }

    modal.confirm({
      title: 'Create change from this difference?',
      content: 'A pending change will appear on the working copy. Accept it in Edit when you are ready.',
      okText: 'Create change',
      onOk: async () => {
        await mockSpecReviewRepository.createChangeFromDelta({
          documentId: document.id,
          workingCopyId: workingCopy.id,
          delta,
          author: 'You',
        });
        trackSpecEvent('spec_delta_to_change', { deltaId: delta.id });
        message.success('Change created — review it in Edit.');
        navigate(specEditPath(document.id));
      },
    });
  };

  if (loading) {
    return <Skeleton active paragraph={{ rows: 8 }} />;
  }

  if (error || !document) {
    return (
      <Flex vertical gap={token.marginLG}>
        <PageBackButton to={specHomePath()}>Back to Spec</PageBackButton>
        <Alert type="error" showIcon title={error ?? 'Specification not found.'} />
      </Flex>
    );
  }

  return (
    <Flex vertical gap={token.marginLG} style={{ width: '100%' }}>
      <PageBackButton to={specAnalyzePath(document.id)}>Back to dashboard</PageBackButton>

      <SpecWorkspaceHeader
        document={document}
        projectName={projectName}
        actions={
          selectedBaseline?.compatible && deltas.length > 0 ? (
            <Button size="large" onClick={() => setExportOpen(true)}>
              Export redline
            </Button>
          ) : undefined
        }
      />

      <Alert
        type="info"
        showIcon
        title="Baseline comparison"
        description="This supplemental comparison is separate from recommendation Review & Edit."
        action={
          <Button onClick={() => navigate(specEditPath(document.id))}>
            Open Review & Edit
          </Button>
        }
      />

      {!editable ? <SpecPermissionBoundary access={access} actionLabel="Creating changes" /> : null}

      <Flex vertical gap={token.marginMD} style={{ width: '100%' }}>
        <Flex gap={token.marginMD} wrap="wrap" align="center">
          <Typography.Text strong>Compare with</Typography.Text>
          <Select
            style={{ minWidth: token.controlHeight * 10 }}
            placeholder="Select a baseline"
            value={baselineId}
            onChange={onBaselineChange}
            options={baselines.map((b) => ({
              value: b.id,
              label: b.label,
            }))}
            notFoundContent={<Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No baselines" />}
          />
        </Flex>

        {!baselineId ? (
          <Empty description="Select a baseline to compare this specification." />
        ) : null}

        {selectedBaseline && !selectedBaseline.compatible ? (
          <Alert
            type="warning"
            showIcon
            title="Incompatible baseline"
            description={
              selectedBaseline.incompatibilityReason ??
              'This baseline cannot be aligned with the current document.'
            }
          />
        ) : null}

        {panelLoading ? (
          <Skeleton active paragraph={{ rows: 8 }} />
        ) : selectedBaseline?.compatible ? (
          <>
            <Flex gap={token.marginXS} wrap="wrap" align="center">
              <Typography.Text type="secondary">
                {changedCount === 0
                  ? 'No differences against this baseline.'
                  : `${changedCount} of ${deltas.length} sections differ from this baseline.`}
              </Typography.Text>
              {deltaCounts.map(([category, count]) => (
                <HydraTag key={category} tone={deltaCategoryTone(category)}>
                  {deltaCategoryLabel[category]} · {count}
                </HydraTag>
              ))}
            </Flex>
            <SpecCompareRegions
              deltas={deltas}
              selectedDeltaId={selectedDeltaId}
              onSelect={(d) => setSelectedDeltaId(d.id)}
              canCreateChange={editable}
              onCreateChange={createChangeFromDelta}
            />
          </>
        ) : null}
      </Flex>

      <Modal
        title="Export redline"
        open={exportOpen}
        onCancel={() => setExportOpen(false)}
        destroyOnHidden
        okText="Export (mock)"
        cancelText="Cancel"
        onOk={() => {
          trackSpecEvent('spec_review_redline_exported', {
            documentId: document.id,
            baselineId,
            exportFormat,
          });
          setExportOpen(false);
          message.success(
            `Redline export prepared as ${exportFormat.toUpperCase()} — mock only, no file generated.`,
          );
        }}
      >
        <Flex vertical gap={token.marginMD}>
          <Alert
            type="info"
            showIcon
            title="Mock export"
            description={`The redline covers ${changedCount} changed ${changedCount === 1 ? 'section' : 'sections'} against ${selectedBaseline?.label ?? 'the selected baseline'}. Matched sections are listed without markup.`}
          />
          <Row gutter={[token.marginSM, token.marginSM]}>
            <Col xs={24} sm={12}>
              <ExportCard
                title="Word redline (.docx)"
                description="Tracked-change markup for the engineer of record."
                icon={<FileWordOutlined />}
                selected={exportFormat === 'docx'}
                onClick={() => setExportFormat('docx')}
                endAffordance={exportFormat === 'docx' ? <CheckOutlined /> : undefined}
              />
            </Col>
            <Col xs={24} sm={12}>
              <ExportCard
                title="PDF summary (.pdf)"
                description="Side-by-side comparison for circulation."
                icon={<FileTextOutlined />}
                selected={exportFormat === 'pdf'}
                onClick={() => setExportFormat('pdf')}
                endAffordance={exportFormat === 'pdf' ? <CheckOutlined /> : undefined}
              />
            </Col>
          </Row>
        </Flex>
      </Modal>
    </Flex>
  );
}
