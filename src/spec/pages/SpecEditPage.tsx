import { ReloadOutlined } from '@ant-design/icons';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';

import { BomPageHeader } from '../../bom/layout/BomPageHeader';
import {
  Alert,
  Button,
  Empty,
  Flex,
  Skeleton,
  Tooltip,
  Typography,
  theme,
} from '../../ui/antd';
import { SpecDenyRecommendationModal } from '../components/SpecDenyRecommendationModal';
import { SpecConfirmReanalysisModal } from '../components/SpecConfirmReanalysisModal';
import { SpecDocumentFormatToolbar } from '../components/SpecDocumentFormatToolbar';
import { SpecDocumentViewer, type SpecDocumentHighlightSpan } from '../components/SpecDocumentViewer';
import { SpecRecommendationsListPanel } from '../components/SpecRecommendationsListPanel';
import { SpecReanalysisProgress } from '../components/SpecReanalysisProgress';
import { SpecSectionNavigator } from '../components/SpecSectionNavigator';
import { useSpecDemo } from '../context/SpecDemoContext';
import { useSpecWorkspace } from '../context/SpecWorkspaceContext';
import { RECOMMENDATION_ACTION_ORDER, systemTypeDivision } from '../constants/specStatusVocabulary';
import {
  mockSpecAnalysisRepository,
  mockSpecEditorRepository,
  mockSpecReanalysisRepository,
  mockSpecSectionRepository,
} from '../data/repositories/specRepositories';
import { useSpecMockStore, ensureSpecReanalysisTicker } from '../data/specMockStore';
import type {
  SpecBlockFormatting,
  SpecDocumentBlock,
  SpecEditorLock,
  SpecRecommendation,
  SpecRecommendationAction,
  SpecRecommendationDecision,
  SpecSection,
  SpecWorkingCopy,
} from '../data/types';
import { useSpecDocument } from '../hooks/useSpecDocument';
import { useSpecScrollFit } from '../hooks/useSpecScrollFit';
import { SpecWorkspaceRegions } from '../layout/SpecWorkspaceRegions';
import { specExportPath } from '../specNavigation';

const CURRENT_EDITOR = 'You';
const OTHER_EDITOR = 'Jordan Lee';
const EDITOR_LOCK_TIMEOUT_MS = 5 * 60 * 1000;
const DEMO_LOCK_MINIMUM_MS = 1000;

type SaveState = 'saved' | 'saving' | 'error';
type EditHistoryEntry = { blockId: string; before: string; after: string };

/** Next still-to-review recommendation after a decision (forward, then wrap). */
function nextToReviewRecommendationIndex(
  recommendations: SpecRecommendation[],
  currentIndex: number,
): number | null {
  if (recommendations.length === 0) return null;
  const isToReview = (decision: SpecRecommendationDecision) =>
    decision === 'not-reviewed' || decision === 'later';

  for (let offset = 1; offset < recommendations.length; offset++) {
    const index = currentIndex + offset;
    if (index >= recommendations.length) break;
    const recommendation = recommendations[index];
    if (recommendation && isToReview(recommendation.decision)) return index;
  }
  for (let index = 0; index < currentIndex; index++) {
    const recommendation = recommendations[index];
    if (recommendation && isToReview(recommendation.decision)) return index;
  }
  return null;
}

export function SpecEditPage() {
  const { token } = theme.useToken();
  const navigate = useNavigate();
  const { specId = '' } = useParams<{ specId: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const { document, loading, error, reload } = useSpecDocument(specId);
  const store = useSpecMockStore();
  const demo = useSpecDemo();
  const workspace = useSpecWorkspace();

  const [sections, setSections] = useState<SpecSection[]>([]);
  const [blocks, setBlocks] = useState<SpecDocumentBlock[]>([]);
  const [recommendations, setRecommendations] = useState<SpecRecommendation[]>([]);
  const [workingCopy, setWorkingCopy] = useState<SpecWorkingCopy>();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [panelLoading, setPanelLoading] = useState(true);
  const [saveState, setSaveState] = useState<SaveState>('saved');
  const [decisionSaving, setDecisionSaving] = useState(false);
  const [denyOpen, setDenyOpen] = useState(false);
  const [reanalysisConfirmOpen, setReanalysisConfirmOpen] = useState(false);
  const [startingReanalysis, setStartingReanalysis] = useState(false);
  const [editorLock, setEditorLock] = useState<SpecEditorLock>();
  const [history, setHistory] = useState<EditHistoryEntry[]>([]);
  const [future, setFuture] = useState<EditHistoryEntry[]>([]);
  const [recommendationDetailOpen, setRecommendationDetailOpen] = useState(false);
  const saveSequence = useRef(0);
  const [pageRef, pageFit] = useSpecScrollFit();

  const currentRecommendation = recommendations[currentIndex];
  const lockedByAnotherEditor =
    editorLock != null && editorLock.owner !== CURRENT_EDITOR;
  const reanalysisInProgress =
    document?.reanalysisRun?.status === 'queued' ||
    document?.reanalysisRun?.status === 'processing';
  const workspaceReadOnly = lockedByAnotherEditor || reanalysisInProgress;

  useEffect(() => {
    if (reanalysisInProgress) ensureSpecReanalysisTicker();
  }, [reanalysisInProgress, document?.id]);

  const displayBlocks = useMemo(
    () =>
      blocks.map((block) => ({
        ...block,
        text: workingCopy?.blockOverrides[block.id] ?? block.text,
      })),
    [blocks, workingCopy],
  );

  const saveStatusCopy =
    saveState === 'saving'
      ? 'Saving changes…'
      : saveState === 'error'
        ? 'Changes could not be saved'
        : 'All changes saved';

  const setRecommendationInUrl = useCallback(
    (recommendation: SpecRecommendation) => {
      const next = {
        recommendation: recommendation.id,
        section: recommendation.sectionId,
        citation: recommendation.sourceCitation.id,
        version: recommendation.customerVersionLabel,
      };
      const alreadyCurrent = Object.entries(next).every(
        ([key, value]) => searchParams.get(key) === value,
      );
      if (!alreadyCurrent) setSearchParams(next, { replace: true });
    },
    [searchParams, setSearchParams],
  );

  const loadWorkspace = useCallback(
    async (documentId: string, versionLabel: string) => {
      setPanelLoading(true);
      try {
        const [sectionList, blockList, recommendationList, existingWorkingCopy] =
          await Promise.all([
            mockSpecSectionRepository.listByDocument(documentId),
            mockSpecAnalysisRepository.listBlocks(documentId),
            mockSpecAnalysisRepository.listRecommendations(documentId),
            mockSpecEditorRepository.getWorkingCopy(documentId),
          ]);
        const nextWorkingCopy =
          existingWorkingCopy ??
          (await mockSpecEditorRepository.createWorkingCopy(documentId, versionLabel));
        setSections(sectionList);
        setBlocks(blockList);
        setRecommendations(recommendationList);
        setWorkingCopy(nextWorkingCopy);

        const requestedRecommendationId = searchParams.get('recommendation');
        const requestedSectionId = searchParams.get('section');
        const requestedCitationId = searchParams.get('citation');
        const requestedVersion = searchParams.get('version');
        const requestedIndex = recommendationList.findIndex(
          (recommendation) =>
            recommendation.id === requestedRecommendationId &&
            (!requestedSectionId || recommendation.sectionId === requestedSectionId) &&
            (!requestedCitationId ||
              recommendation.sourceCitation.id === requestedCitationId) &&
            (!requestedVersion ||
              recommendation.customerVersionLabel === requestedVersion),
        );
        const firstPendingIndex = recommendationList.findIndex(
          (recommendation) => recommendation.decision === 'not-reviewed',
        );
        const nextIndex =
          requestedIndex >= 0 ? requestedIndex : firstPendingIndex >= 0 ? firstPendingIndex : 0;
        setCurrentIndex(nextIndex);
        const focused = recommendationList[nextIndex];
        if (focused) {
          setSelectedBlockId(focused.sourceCitation.blockId);
          workspace.openCitation(focused.sourceCitation);
          setRecommendationInUrl(focused);
        } else {
          setSelectedBlockId(blockList[0]?.id ?? null);
        }
      } finally {
        setPanelLoading(false);
      }
    },
    [searchParams, setRecommendationInUrl, workspace],
  );

  useEffect(() => {
    if (!document) return;
    workspace.setDocumentId(document.id);
    void loadWorkspace(document.id, document.versionLabel);
    // Re-load only when the document or demo fixture changes; review mutations
    // update local state after their repository call.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [document?.id, store.scenarioId]);

  useEffect(() => {
    if (!document) return;
    let active = true;
    const simulateOtherEditor = demo.scenarioId === 'restricted-external-reviewer';
    const owner = simulateOtherEditor ? OTHER_EDITOR : CURRENT_EDITOR;
    const timeout = simulateOtherEditor
      ? Math.max(demo.delayMs * 4, DEMO_LOCK_MINIMUM_MS)
      : EDITOR_LOCK_TIMEOUT_MS;
    void mockSpecEditorRepository
      .acquireEditorLock(document.id, owner, timeout)
      .then((lock) => {
        if (active) setEditorLock(lock);
      });
    return () => {
      active = false;
      if (!simulateOtherEditor) {
        void mockSpecEditorRepository.releaseEditorLock(document.id, CURRENT_EDITOR);
      }
    };
  }, [demo.delayMs, demo.scenarioId, document?.id]);

  useEffect(() => {
    if (!currentRecommendation) return;
    setSelectedBlockId(currentRecommendation.sourceCitation.blockId);
    workspace.openCitation(currentRecommendation.sourceCitation);
  }, [
    currentIndex,
    currentRecommendation?.id,
    workspace.openCitation,
  ]);

  const refreshLock = async () => {
    if (!document) return;
    const lock = await mockSpecEditorRepository.acquireEditorLock(
      document.id,
      CURRENT_EDITOR,
      EDITOR_LOCK_TIMEOUT_MS,
    );
    setEditorLock(lock);
  };

  const runSave = async (operation: () => Promise<unknown>): Promise<boolean> => {
    const sequence = ++saveSequence.current;
    setSaveState('saving');
    try {
      await operation();
      if (sequence === saveSequence.current) setSaveState('saved');
      return true;
    } catch {
      if (sequence === saveSequence.current) setSaveState('error');
      return false;
    }
  };

  const persistBlock = async (
    blockId: string,
    text: string,
    formatting?: SpecBlockFormatting,
  ) => {
    if (!document || !workingCopy || workspaceReadOnly) return;
    setBlocks((current) =>
      current.map((block) => (block.id === blockId ? { ...block, text } : block)),
    );
    await runSave(async () => {
      const next = await mockSpecEditorRepository.updateWorkingCopyBlock({
        documentId: document.id,
        workingCopyId: workingCopy.id,
        blockId,
        text,
        formatting,
      });
      if (next) setWorkingCopy(next);
      await reload();
    });
  };

  const handleBlockChange = (block: SpecDocumentBlock, text: string) => {
    const before = displayBlocks.find((entry) => entry.id === block.id)?.text ?? block.text;
    if (before === text) return;
    setHistory((current) => [...current, { blockId: block.id, before, after: text }]);
    setFuture([]);
    void persistBlock(
      block.id,
      text,
      workingCopy?.blockFormatting?.[block.id],
    );
  };

  const updateSelectedFormatting = (patch: Partial<SpecBlockFormatting>) => {
    if (!selectedBlockId) return;
    const selected = displayBlocks.find((block) => block.id === selectedBlockId);
    if (!selected) return;
    const current = workingCopy?.blockFormatting?.[selectedBlockId] ?? {};
    void persistBlock(selectedBlockId, selected.text, { ...current, ...patch });
  };

  const clearSelectedFormatting = () => {
    if (!selectedBlockId) return;
    const selected = displayBlocks.find((block) => block.id === selectedBlockId);
    if (!selected) return;
    void persistBlock(selectedBlockId, selected.text, {});
  };

  const undo = () => {
    const entry = history[history.length - 1];
    if (!entry) return;
    setHistory((current) => current.slice(0, -1));
    setFuture((current) => [entry, ...current]);
    void persistBlock(
      entry.blockId,
      entry.before,
      workingCopy?.blockFormatting?.[entry.blockId],
    );
  };

  const redo = () => {
    const entry = future[0];
    if (!entry) return;
    setFuture((current) => current.slice(1));
    setHistory((current) => [...current, entry]);
    void persistBlock(
      entry.blockId,
      entry.after,
      workingCopy?.blockFormatting?.[entry.blockId],
    );
  };

  const navigateRecommendation = (index: number) => {
    if (index < 0 || index >= recommendations.length) return;
    const recommendation = recommendations[index];
    setCurrentIndex(index);
    setSelectedBlockId(recommendation.sourceCitation.blockId);
    setRecommendationInUrl(recommendation);
    workspace.openCitation(recommendation.sourceCitation);
  };

  const selectBlockFromDocument = (blockId: string) => {
    setSelectedBlockId(blockId);
    const matches = recommendations
      .map((recommendation, index) => ({ recommendation, index }))
      .filter(({ recommendation }) => recommendation.sourceCitation.blockId === blockId);
    if (matches.length === 0) return;
    const preferred =
      matches.find(
        ({ recommendation }) =>
          recommendation.decision === 'not-reviewed' || recommendation.decision === 'later',
      ) ?? matches[0];
    setCurrentIndex(preferred.index);
    setRecommendationInUrl(preferred.recommendation);
    workspace.openCitation(preferred.recommendation.sourceCitation);
    setRecommendationDetailOpen(true);
  };

  const handleHighlightClick = (recommendationId: string) => {
    const index = recommendations.findIndex(
      (recommendation) => recommendation.id === recommendationId,
    );
    if (index < 0) return;
    navigateRecommendation(index);
    setRecommendationDetailOpen(true);
  };

  const saveDecision = async (
    decision: Exclude<SpecRecommendationDecision, 'not-reviewed'>,
    options?: { proposedText?: string },
    denialReason?: string,
  ) => {
    if (!document || !workingCopy || !currentRecommendation || workspaceReadOnly) return;
    setDecisionSaving(true);
    try {
      const acceptedText = options?.proposedText ?? currentRecommendation.proposedText;
      const saved = await runSave(async () => {
        if (
          decision === 'accepted' &&
          acceptedText !== currentRecommendation.proposedText
        ) {
          await mockSpecAnalysisRepository.saveRecommendationProposal({
            recommendationId: currentRecommendation.id,
            documentId: document.id,
            proposedText: acceptedText,
          });
        }
        await mockSpecAnalysisRepository.saveRecommendationDecision({
          recommendationId: currentRecommendation.id,
          documentId: document.id,
          decision,
          denialReason,
        });
        if (decision === 'accepted') {
          const next = await mockSpecEditorRepository.applyRecommendationText({
            documentId: document.id,
            workingCopyId: workingCopy.id,
            blockId: currentRecommendation.sourceCitation.blockId,
            text: acceptedText,
          });
          if (next) setWorkingCopy(next);
        }
        const nextRecommendations =
          await mockSpecAnalysisRepository.listRecommendations(document.id);
        setRecommendations(nextRecommendations);
        await reload();
        const nextIndex = nextToReviewRecommendationIndex(
          nextRecommendations,
          currentIndex,
        );
        if (nextIndex != null) {
          const nextRecommendation = nextRecommendations[nextIndex];
          setCurrentIndex(nextIndex);
          setSelectedBlockId(nextRecommendation.sourceCitation.blockId);
          setRecommendationInUrl(nextRecommendation);
          workspace.openCitation(nextRecommendation.sourceCitation);
          setRecommendationDetailOpen(true);
        } else {
          setRecommendationDetailOpen(false);
        }
      });
      if (!saved) return;
      setDenyOpen(false);
    } finally {
      setDecisionSaving(false);
    }
  };

  const pendingBySectionId = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const recommendation of recommendations) {
      if (recommendation.decision !== 'not-reviewed') continue;
      counts[recommendation.sectionId] = (counts[recommendation.sectionId] ?? 0) + 1;
    }
    return counts;
  }, [recommendations]);

  const highlightSpansByBlockId = useMemo(() => {
    const map: Record<string, SpecDocumentHighlightSpan[]> = {};
    for (const recommendation of recommendations) {
      if (recommendation.decision !== 'not-reviewed') continue;
      const blockId = recommendation.sourceCitation.blockId;
      const tone =
        recommendation.id === currentRecommendation?.id ? 'active' : 'pending';
      if (!map[blockId]) map[blockId] = [];
      map[blockId].push({
        text: recommendation.existingText,
        tone,
        recommendationId: recommendation.id,
      });
    }
    return map;
  }, [recommendations, currentRecommendation?.id]);

  const saveProposal = async (proposedText: string) => {
    if (!document || !currentRecommendation || workspaceReadOnly) return;
    setDecisionSaving(true);
    try {
      await runSave(async () => {
        await mockSpecAnalysisRepository.saveRecommendationProposal({
          recommendationId: currentRecommendation.id,
          documentId: document.id,
          proposedText,
        });
        const nextRecommendations =
          await mockSpecAnalysisRepository.listRecommendations(document.id);
        setRecommendations(nextRecommendations);
      });
    } finally {
      setDecisionSaving(false);
    }
  };

  if (loading) return <Skeleton active paragraph={{ rows: 8 }} />;

  if (error || !document) {
    return (
      <Alert type="error" showIcon title={error ?? 'Specification not found.'} />
    );
  }

  const currentFormatting = selectedBlockId
    ? workingCopy?.blockFormatting?.[selectedBlockId] ?? {}
    : {};
  const analysisIsCurrent = !document.reanalysisRequired;
  const exportExplanation = analysisIsCurrent
    ? undefined
    : 'Export is blocked until the document is re-analyzed.';
  const tocSectionId = currentRecommendation?.sectionId ?? workspace.sectionId;

  const left = (
    <SpecSectionNavigator
      variant="compact"
      sections={sections}
      selectedSectionId={tocSectionId}
      pendingBySectionId={pendingBySectionId}
      onSelect={(sectionId) => {
        workspace.setSectionId(sectionId);
        const recommendationIndex = recommendations.findIndex(
          (recommendation) =>
            recommendation.sectionId === sectionId &&
            recommendation.decision === 'not-reviewed',
        );
        if (recommendationIndex >= 0) {
          navigateRecommendation(recommendationIndex);
          return;
        }
        const firstInSection = recommendations.findIndex(
          (recommendation) => recommendation.sectionId === sectionId,
        );
        if (firstInSection >= 0) {
          navigateRecommendation(firstInSection);
          return;
        }
        const firstBlock = displayBlocks.find((block) => block.sectionId === sectionId);
        setSelectedBlockId(firstBlock?.id ?? null);
      }}
    />
  );

  const center = panelLoading ? (
    <Skeleton active paragraph={{ rows: 8 }} />
  ) : displayBlocks.length === 0 ? (
    <Empty description="No editable document content is available." />
  ) : (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        minHeight: 0,
        overflow: 'hidden',
        width: '100%',
      }}
    >
      <div style={{ flexShrink: 0 }}>
        <SpecDocumentFormatToolbar
          fillContainer
          formatting={currentFormatting}
          disabled={!selectedBlockId || workspaceReadOnly}
          canUndo={history.length > 0}
          canRedo={future.length > 0}
          statusHint={saveStatusCopy}
          onToggle={updateSelectedFormatting}
          onClearFormatting={clearSelectedFormatting}
          onUndo={undo}
          onRedo={redo}
        />
      </div>
      <div
        data-spec-document-scroll=""
        style={{
          flex: 1,
          minHeight: 0,
          overflow: 'auto',
          width: '100%',
        }}
      >
        <SpecDocumentViewer
          variant="document"
          attachToToolbar
          fillContainer
          blocks={displayBlocks}
          highlightBlockId={currentRecommendation?.sourceCitation.blockId}
          scrollToSectionId={tocSectionId}
          highlightSpansByBlockId={highlightSpansByBlockId}
          approximateCitation={
            currentRecommendation
              ? currentRecommendation.sourceCitation.anchorType !== 'exact'
              : undefined
          }
          editable={!workspaceReadOnly}
          selectedBlockId={selectedBlockId}
          formattingByBlockId={workingCopy?.blockFormatting}
          onSelectBlock={selectBlockFromDocument}
          onBlockChange={handleBlockChange}
          onHighlightClick={handleHighlightClick}
        />
        <Typography.Paragraph
          type="secondary"
          style={{
            marginBlockEnd: 0,
            marginBlockStart: token.marginMD,
            paddingInline: token.paddingSM,
            fontSize: token.fontSizeSM,
          }}
        >
          Edit the document directly like a word processor. Highlighted passages mark recommended
          changes — review and accept proposals on the right. Manual text edits in the
          document require re-analysis before export. Accepting a recommendation does not.
        </Typography.Paragraph>
      </div>
    </div>
  );

  const actionParamRaw = searchParams.get('action');
  const initialActionFilter: SpecRecommendationAction | undefined =
    actionParamRaw &&
    (RECOMMENDATION_ACTION_ORDER as readonly string[]).includes(actionParamRaw)
      ? (actionParamRaw as SpecRecommendationAction)
      : undefined;

  const right = (
    <SpecRecommendationsListPanel
      recommendations={recommendations}
      selectedIndex={currentIndex}
      detailOpen={recommendationDetailOpen}
      onDetailOpenChange={setRecommendationDetailOpen}
      readOnly={workspaceReadOnly}
      saving={decisionSaving}
      initialActionFilter={initialActionFilter}
      onSelect={(index) => navigateRecommendation(index)}
      onOpenSource={() => {
        if (!currentRecommendation) return;
        workspace.openCitation(currentRecommendation.sourceCitation);
        setSelectedBlockId(currentRecommendation.sourceCitation.blockId);
      }}
      onSaveProposal={(proposedText) => void saveProposal(proposedText)}
      onDecision={(decision, options) => {
        if (decision === 'denied') {
          setDenyOpen(true);
          return;
        }
        void saveDecision(decision, options);
      }}
    />
  );

  return (
    <Flex
      ref={pageRef}
      vertical
      gap={token.marginLG}
      style={{
        width: '100%',
        height: pageFit.fillHeight,
        minHeight: 0,
        overflow: pageFit.fillHeight ? 'hidden' : undefined,
      }}
    >
      <Flex vertical gap={token.marginSM} style={{ width: '100%', flexShrink: 0 }}>
        <BomPageHeader
          title="SPEC documents"
          description="Validate your specification against ASC's master specs and product catalog."
          titleVariant="heading4"
          descriptionVariant="large-strong"
          actions={
            <Tooltip title={exportExplanation}>
              <Button
                type="primary"
                size="large"
                disabled={!analysisIsCurrent}
                onClick={() => navigate(specExportPath(document.id))}
              >
                Export
              </Button>
            </Tooltip>
          }
        />

        {reanalysisInProgress && document.reanalysisRun ? (
          <SpecReanalysisProgress document={document} run={document.reanalysisRun} />
        ) : null}

        {lockedByAnotherEditor ? (
          <Alert
            type="warning"
            showIcon
            title={`${editorLock.owner} is editing this SPEC`}
            description="The document and recommendation decisions are read-only until their editing session ends or becomes inactive."
            action={
              <Button icon={<ReloadOutlined />} onClick={() => void refreshLock()}>
                Refresh
              </Button>
            }
            style={{ width: '100%' }}
          />
        ) : null}

        {!reanalysisInProgress && !analysisIsCurrent ? (
          <Alert
            type="warning"
            showIcon
            title="Re-analysis required"
            description="Manual edits made this analysis out of date. Export remains unavailable until analysis runs again."
            action={
              <Button onClick={() => setReanalysisConfirmOpen(true)}>
                Re-run analysis
              </Button>
            }
            style={{ width: '100%' }}
          />
        ) : null}

        {saveState === 'error' ? (
          <Alert
            type="error"
            showIcon
            title="Changes could not be saved"
            description="Try the edit or decision again."
            style={{ width: '100%' }}
          />
        ) : null}
      </Flex>

      <div style={{ flex: 1, minHeight: 0, width: '100%' }}>
        <SpecWorkspaceRegions
          embeddedSidePanels
          fillParent
          left={left}
          center={center}
          right={right}
          leftTitle="Table of contents"
          rightTitle="Recommendations"
        />
      </div>

      <SpecDenyRecommendationModal
        open={denyOpen}
        initialReason={currentRecommendation?.denialReason}
        saving={decisionSaving}
        onCancel={() => setDenyOpen(false)}
        onConfirm={(reason) => void saveDecision('denied', undefined, reason)}
      />
      <SpecConfirmReanalysisModal
        open={reanalysisConfirmOpen}
        documentTitle={document.title}
        division={document.divisionHint ?? systemTypeDivision[document.systemType]}
        masterVersion={document.ascMaster?.version ?? 'Not recorded'}
        confirming={startingReanalysis}
        onCancel={() => setReanalysisConfirmOpen(false)}
        onConfirm={() => {
          setStartingReanalysis(true);
          void mockSpecReanalysisRepository
            .start(document.id)
            .then(() => {
              setReanalysisConfirmOpen(false);
            })
            .finally(() => setStartingReanalysis(false));
        }}
      />
    </Flex>
  );
}
