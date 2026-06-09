import { ExclamationCircleOutlined } from '@ant-design/icons';
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import { useActiveProject, useBomHubPath } from '../../context/ActiveProjectContext';
import { useBomWorkspace } from '../../context/BomWorkspaceContext';
import { buildImportedWorkspaceRows, resolveImportBomProjectId } from '../bomFinishImport';
import type { BomUploadFlowLocationState } from '../bomUploadFlowState';
import type { BomImportSession } from '../bomImportProgressState';
import { useBomImportFlow } from '../context/BomImportFlowContext';
import type { BomMatchResult } from '../data/types';
import { App, message, theme } from '../../ui/antd';

type MatchingImportStats = {
  total: number;
  accepted: number;
  manual: number;
  skipped: number;
  pending: number;
};

type UseBomFinishImportOptions = {
  bomProjectId: string;
  uploadState: BomUploadFlowLocationState;
  uploadFileName: string;
  matchResults: BomMatchResult[];
  stats: MatchingImportStats;
  session: BomImportSession | null | undefined;
  uploadId: string | undefined;
  /** When confirm modal offers to review skipped lines first. */
  onReviewSkipped?: () => void;
};

export function useBomFinishImport({
  bomProjectId,
  uploadState,
  uploadFileName,
  matchResults,
  stats,
  session,
  uploadId,
  onReviewSkipped,
}: UseBomFinishImportOptions) {
  const { modal } = App.useApp();
  const { token } = theme.useToken();
  const navigate = useNavigate();
  const bomHubPath = useBomHubPath();
  const { projectId: constructionProjectId } = useActiveProject();
  const { rowsByProjectId, setWorkspaceRows } = useBomWorkspace();
  const { updateProgress } = useBomImportFlow();

  const runImport = useCallback(() => {
    const targetProjectId = resolveImportBomProjectId(
      bomProjectId,
      uploadState,
      constructionProjectId,
      uploadFileName,
    );
    const parsedItems = session?.parsedItems ?? [];
    const existingRows = rowsByProjectId[targetProjectId] ?? [];
    const newRows = buildImportedWorkspaceRows(matchResults, parsedItems, existingRows.length);

    if (newRows.length > 0) {
      setWorkspaceRows(targetProjectId, (prev) => [...prev, ...newRows]);
    }

    if (uploadId) {
      updateProgress(uploadId, { currentStep: 'done' });
    }

    const confirmedCount = stats.accepted + stats.manual;
    message.success(
      `Imported ${newRows.length} item${newRows.length === 1 ? '' : 's'} into your BOM project — ${confirmedCount} confirmed${stats.skipped > 0 ? ` · ${stats.skipped} skipped` : ''}.`,
    );

    navigate(bomHubPath, {
      state: { refreshBomProjects: true, importedBomProjectId: targetProjectId },
    });
  }, [
    bomHubPath,
    bomProjectId,
    constructionProjectId,
    matchResults,
    navigate,
    rowsByProjectId,
    session?.parsedItems,
    setWorkspaceRows,
    stats.accepted,
    stats.manual,
    stats.skipped,
    updateProgress,
    uploadFileName,
    uploadId,
    uploadState,
  ]);

  const confirmFinishImport = useCallback(() => {
    if (stats.pending > 0) {
      message.warning(
        `Review ${stats.pending} pending part${stats.pending === 1 ? '' : 's'} before importing.`,
      );
      return;
    }

    const confirmedCount = stats.accepted + stats.manual;
    if (confirmedCount === 0) {
      message.warning('Confirm at least one match before importing.');
      return;
    }

    if (stats.skipped > 0) {
      modal.confirm({
        title: `Import without ${stats.skipped} skipped line${stats.skipped === 1 ? '' : 's'}?`,
        icon: <ExclamationCircleOutlined style={{ color: token.colorWarning }} />,
        content: `Skipped lines will not be added to your BOM. Import ${confirmedCount} confirmed match${confirmedCount === 1 ? '' : 'es'} now, or review skipped lines first.`,
        okText: 'Import to BOM',
        cancelText: onReviewSkipped ? 'Review skipped first' : 'Go back',
        centered: true,
        onOk: runImport,
        onCancel: onReviewSkipped,
      });
      return;
    }

    modal.confirm({
      title: 'Import confirmed matches to BOM?',
      content: `${confirmedCount} part${confirmedCount === 1 ? '' : 's'} will be added to your BOM project. You can open the project from the list to review lines.`,
      okText: 'Import to BOM',
      cancelText: 'Not yet',
      centered: true,
      onOk: runImport,
    });
  }, [
    modal,
    onReviewSkipped,
    runImport,
    stats.accepted,
    stats.manual,
    stats.pending,
    stats.skipped,
    token.colorWarning,
  ]);

  return { confirmFinishImport, runImport };
}
