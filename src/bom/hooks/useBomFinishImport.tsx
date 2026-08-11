import { ExclamationCircleOutlined } from '@ant-design/icons';
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import { useActiveProject, resolveActiveConstructionProjectId, useBomHubPath } from '../../context/ActiveProjectContext';
import { useBomWorkspace } from '../../context/BomWorkspaceContext';
import { buildImportedWorkspaceRows, resolveImportBomProjectId } from '../bomFinishImport';
import { computeMatchingReviewSummary } from '../bomMatchingReviewStatus';
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
      resolveActiveConstructionProjectId(constructionProjectId),
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
    const reviewSummary = computeMatchingReviewSummary(matchResults);

    if (reviewSummary.pending > 0) {
      const detailParts: string[] = [];
      if (reviewSummary.unresolved > 0) {
        detailParts.push(
          `${reviewSummary.unresolved} unresolved (no part selected)`,
        );
      }
      if (reviewSummary.needsSku > 0) {
        detailParts.push(`${reviewSummary.needsSku} need a SKU variant`);
      }
      if (reviewSummary.readyToConfirm > 0) {
        detailParts.push(`${reviewSummary.readyToConfirm} ready to confirm`);
      }
      const detail =
        detailParts.length > 0 ? ` ${detailParts.join(' · ')}.` : '';
      message.warning(
        `Review ${reviewSummary.pending} incomplete part${reviewSummary.pending === 1 ? '' : 's'} before importing.${detail}`,
      );
      return;
    }

    const confirmedCount = reviewSummary.confirmed + reviewSummary.chosen;
    if (confirmedCount === 0 && reviewSummary.cantMatch === 0) {
      message.warning('Confirm at least one match before importing.');
      return;
    }

    if (confirmedCount === 0 && reviewSummary.cantMatch > 0) {
      modal.confirm({
        title: `${reviewSummary.cantMatch} line${reviewSummary.cantMatch === 1 ? '' : 's'} can't be matched`,
        icon: <ExclamationCircleOutlined style={{ color: token.colorWarning }} />,
        content:
          'No parts were confirmed. Lines that could not be matched will still be imported as unmatched so nothing is lost — you can pick parts for them in the workspace.',
        okText: 'Import unmatched lines',
        cancelText: 'Go back',
        centered: true,
        onOk: runImport,
      });
      return;
    }

    const incompleteCount = reviewSummary.skipped;
    if (incompleteCount > 0) {
      modal.confirm({
        title: `${incompleteCount} part${incompleteCount === 1 ? '' : 's'} not ready to import`,
        icon: <ExclamationCircleOutlined style={{ color: token.colorWarning }} />,
        content: (
          <>
            {incompleteCount} skipped line{incompleteCount === 1 ? '' : 's'} will not be added to your BOM and may not
            translate correctly. {confirmedCount} confirmed match{confirmedCount === 1 ? '' : 'es'} can be imported if
            you continue. You can go back and complete the review first.
          </>
        ),
        okText: 'Stay and review',
        cancelText: 'Continue anyway',
        centered: true,
        onOk: () => {
          onReviewSkipped?.();
        },
        cancelButtonProps: {
          onClick: () => {
            runImport();
          },
        },
      });
      return;
    }

    modal.confirm({
      title: 'Import confirmed matches to BOM?',
      content: `${confirmedCount} part${confirmedCount === 1 ? '' : 's'} will be added to your BOM project as confirmed lines.`,
      okText: 'Import to BOM',
      cancelText: 'Not yet',
      centered: true,
      onOk: runImport,
    });
  }, [
    matchResults,
    modal,
    onReviewSkipped,
    runImport,
    token.colorWarning,
  ]);

  return { confirmFinishImport, runImport };
}
