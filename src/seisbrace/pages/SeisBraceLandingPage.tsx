import { DownloadOutlined, FileTextOutlined, PlusOutlined, UploadOutlined } from '@ant-design/icons';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Key } from 'react';

import { useActiveProject } from '../../context/ActiveProjectContext';
import { BomPageHeader } from '../../bom/layout/BomPageHeader';
import { PageBackButton } from '../../shell/PageBackButton';
import {
  Alert,
  App,
  AppSearchInput,
  INLINE_SEARCH_CONTROL_SIZE,
  Button,
  Card,
  Divider,
  Empty,
  Flex,
  Select,
  Space,
  Typography,
  theme,
} from '../../ui/antd';
import { BraceTable } from '../components/BraceTable';
import { DesignsList } from '../components/DesignsList';
import { FastenerUploadModal } from '../components/FastenerUploadModal';
import { FileListSection } from '../components/FileListSection';
import { SubmittalOptionsModal } from '../components/SubmittalOptionsModal';
import { useSeisBrace } from '../context/SeisBraceContext';
import { useSeisBraceWizard } from '../context/SeisBraceWizardContext';
import type { Brace, SeisBraceFile, SeismicDesign } from '../types';
import { hydraBaseStrong, hydraTextStyleToReactCss } from '../../theme/hydraTypography';

type SortKey = 'date' | 'name';

const SORT_OPTIONS = [
  { value: 'date', label: 'Sort: Date' },
  { value: 'name', label: 'Sort: Name' },
];

export function SeisBraceLandingPage() {
  const { token } = theme.useToken();
  const { message } = App.useApp();
  const navigate = useNavigate();
  const { projectId, project } = useActiveProject();
  const {
    designsForProject,
    bracesForDesign,
    filesForProject,
    copyDesign,
    deleteDesign,
    addFile,
    deleteFile,
  } = useSeisBrace();
  const { resetDraft } = useSeisBraceWizard();

  const designs = useMemo(
    () => (projectId ? designsForProject(projectId) : []),
    [projectId, designsForProject],
  );

  const [selectedDesignId, setSelectedDesignId] = useState<string | null>(null);
  const [selectedBraceKeys, setSelectedBraceKeys] = useState<Key[]>([]);
  const [searchText, setSearchText] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('date');
  const [submittalOpen, setSubmittalOpen] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);

  // Reset module UI state when switching construction project (BOM pattern).
  useEffect(() => {
    setSelectedDesignId(null);
    setSelectedBraceKeys([]);
    setSearchText('');
    setSortKey('date');
  }, [projectId]);

  // Keep a valid design selected as the list changes.
  useEffect(() => {
    if (designs.length === 0) {
      setSelectedDesignId(null);
      return;
    }
    if (!selectedDesignId || !designs.some((d) => d.id === selectedDesignId)) {
      setSelectedDesignId(designs[0].id);
    }
  }, [designs, selectedDesignId]);

  const sortedDesigns = useMemo(() => {
    const list = [...designs];
    if (searchText.trim()) {
      const q = searchText.toLowerCase();
      return list.filter((d) => d.displayName.toLowerCase().includes(q));
    }
    list.sort((a, b) =>
      sortKey === 'name'
        ? a.displayName.localeCompare(b.displayName)
        : new Date(b.projectDate).getTime() - new Date(a.projectDate).getTime(),
    );
    return list;
  }, [designs, searchText, sortKey]);

  const selectedDesign = designs.find((d) => d.id === selectedDesignId);
  const braces = useMemo(
    () => bracesForDesign(selectedDesignId ?? undefined),
    [selectedDesignId, bracesForDesign],
  );
  const projectFiles = projectId ? filesForProject(projectId) : [];
  const submittalFiles = projectFiles.filter((f) => f.kind === 'submittal');
  const userFiles = projectFiles.filter((f) => f.kind === 'user');

  // Reset brace selection when the active design changes.
  useEffect(() => {
    setSelectedBraceKeys([]);
  }, [selectedDesignId]);

  const startNewDesign = () => {
    resetDraft({});
    navigate('/seisbrace/wizard/seismic-design');
  };

  const startEditDesign = (design: SeismicDesign) => {
    resetDraft({
      seismicDesignId: design.id,
      designName: design.name,
      projectDate: design.projectDate,
      codeRequirement: design.codeRequirement,
      loadType: design.loadType,
      unit: design.unit,
      notes: design.notes ?? '',
    });
    navigate('/seisbrace/wizard/seismic-design');
  };

  const startNewBrace = () => {
    if (!selectedDesign) return;
    resetDraft({
      seismicDesignId: selectedDesign.id,
      codeRequirement: selectedDesign.codeRequirement,
      unit: selectedDesign.unit,
      loadType: selectedDesign.loadType,
    });
    navigate('/seisbrace/wizard/seismic-coefficient');
  };

  const startEditBrace = (brace: Brace) => {
    const cfg = brace.config;
    resetDraft({
      seismicDesignId: brace.seismicDesignId,
      braceId: brace.id,
      codeRequirement: selectedDesign?.codeRequirement ?? 'ASCE_7_22',
      unit: selectedDesign?.unit ?? 'IMPERIAL',
      loadType: selectedDesign?.loadType ?? 'UL',
      braceName: brace.name,
      drawingRef: brace.drawingRef ?? '',
      qty: brace.qty,
      cpValue: brace.cpValue,
      cpMethod: cfg?.cpMethod ?? 'A',
      cpInputs: cfg?.cpInputs ?? { ss: 1 },
      orientation: cfg?.orientation ?? brace.braceDescription,
      segments: cfg?.segments ?? [
        { id: 'seg-1', pipeSize: '2"', pipeType: 'Sch 40', pipeLength: 20, pipeWeight: 5 },
      ],
      structure: cfg?.structure ?? brace.structure,
      isStructureUserDefined: cfg?.isStructureUserDefined ?? brace.isStructureUserDefined,
      substrate: cfg?.substrate ?? 'Cracked concrete',
      fastener: cfg?.fastener ?? brace.fastener,
      isFastenerUserDefined: cfg?.isFastenerUserDefined ?? brace.isFastenerUserDefined,
      fastenerOrientation: cfg?.fastenerOrientation ?? 'Vertical',
      fastenerSize: cfg?.fastenerSize ?? '1/2"',
      braceAngleMin: cfg?.braceAngleMin ?? 30,
      braceAngleMax: cfg?.braceAngleMax ?? 60,
      lrMax: cfg?.lrMax ?? 200,
      braceMember: cfg?.braceMember ?? 'Pipe 1" Sch 40',
      swivelTypeId: cfg?.swivelTypeId ?? null,
      pipeAttachmentId: cfg?.pipeAttachmentId ?? null,
      structuralAttachmentId: cfg?.structuralAttachmentId ?? null,
    });
    navigate('/seisbrace/wizard/seismic-coefficient');
  };

  const handleDownloadFile = (file: SeisBraceFile) => {
    message.success(`Download started for ${file.filename} (stub).`);
  };

  const cardShellStyle = {
    background: token.colorBgContainer,
    borderRadius: token.borderRadiusLG,
    border: 'none' as const,
    boxShadow: token.boxShadowTertiary,
    overflow: 'hidden' as const,
  };

  const hasDesigns = designs.length > 0;

  return (
    <>
      <Space orientation="vertical" size={token.marginLG} style={{ width: '100%' }}>
        <PageBackButton to="/dashboard">Back to home</PageBackButton>

        {!project ? (
          <Alert
            type="info"
            showIcon
            message="Select a construction project"
            description="Pick a project from the top bar to scope seismic designs to the right job site."
          />
        ) : null}

        <BomPageHeader
          title="SeisBrace"
          description="Seismic designs and brace configurations for this construction project."
          actions={
            <Button type="primary" size="large" icon={<PlusOutlined />} onClick={startNewDesign}>
              New design
            </Button>
          }
        />

        {hasDesigns ? (
          <Flex align="center" justify="space-between" gap={token.marginSM} wrap="wrap">
            <AppSearchInput
              placeholder="Search designs…"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
              size={INLINE_SEARCH_CONTROL_SIZE}
              style={{ flex: '1 1 240px', maxWidth: 360 }}
            />
            <Flex gap={token.marginSM} align="center" wrap="wrap">
              <Select
                size={INLINE_SEARCH_CONTROL_SIZE}
                value={sortKey}
                onChange={(v) => setSortKey(v as SortKey)}
                options={SORT_OPTIONS}
                style={{ width: 160 }}
              />
              <Button size={INLINE_SEARCH_CONTROL_SIZE} icon={<DownloadOutlined />} onClick={() => message.success('DWG file download started (stub).')}>
                Get DWG file
              </Button>
              <Button
                type="primary"
                size={INLINE_SEARCH_CONTROL_SIZE}
                icon={<FileTextOutlined />}
                disabled={selectedBraceKeys.length === 0}
                onClick={() => setSubmittalOpen(true)}
              >
                Report &amp; Submittal
              </Button>
            </Flex>
          </Flex>
        ) : null}

        <Card variant="borderless" styles={{ body: { padding: 0 } }} style={cardShellStyle}>
          {!hasDesigns ? (
            <Flex vertical align="center" justify="center" style={{ padding: `${token.paddingLG * 2}px ${token.paddingLG}px` }}>
              <Empty
                description={
                  <Space orientation="vertical" size={token.marginXXS}>
                    <Typography.Text style={hydraTextStyleToReactCss(hydraBaseStrong)}>No seismic designs yet</Typography.Text>
                    <Typography.Text type="secondary">
                      Create your first seismic design to start configuring braces.
                    </Typography.Text>
                  </Space>
                }
              >
                <Button type="primary" icon={<PlusOutlined />} onClick={startNewDesign}>
                  Create a seismic design
                </Button>
              </Empty>
            </Flex>
          ) : (
            <Flex align="stretch" style={{ width: '100%', overflow: 'hidden' }}>
              <div
                style={{
                  flex: `0 0 240px`,
                  maxWidth: 240,
                  minWidth: 240,
                  borderInlineEnd: `${token.lineWidth}px ${token.lineType} ${token.colorBorderSecondary}`,
                  overflow: 'hidden',
                }}
              >
                <DesignsList
                  designs={sortedDesigns}
                  selectedId={selectedDesignId}
                  onSelect={setSelectedDesignId}
                  onEdit={startEditDesign}
                  onCopy={(d) => {
                    const newId = copyDesign(d.id);
                    if (newId) {
                      setSelectedDesignId(newId);
                      message.success('Design copied.');
                    }
                  }}
                  onDelete={(d) => {
                    deleteDesign(d.id);
                    message.success('Design deleted.');
                  }}
                />
              </div>
              <div style={{ flex: 1, minWidth: 0, padding: token.paddingLG }}>
                <BraceTable
                  design={selectedDesign}
                  designs={designs}
                  braces={braces}
                  selectedKeys={selectedBraceKeys}
                  onSelectionChange={setSelectedBraceKeys}
                  onEditBrace={startEditBrace}
                  onNewBrace={startNewBrace}
                  onBraceCopied={(designId) => {
                    setSelectedDesignId(designId);
                    message.success('Brace copied.');
                  }}
                />

                {submittalFiles.length > 0 || userFiles.length > 0 ? (
                  <Divider style={{ margin: `${token.marginLG}px 0` }} />
                ) : null}

                <Space orientation="vertical" size={token.marginLG} style={{ width: '100%' }}>
                  <FileListSection
                    title="Submittals and reports"
                    files={submittalFiles}
                    onDownload={handleDownloadFile}
                  />
                  <FileListSection
                    title="User uploaded files"
                    files={userFiles}
                    onDownload={handleDownloadFile}
                    onDelete={(f) => {
                      deleteFile(f.id);
                      message.success('File removed.');
                    }}
                  />
                </Space>

                <Divider style={{ margin: `${token.marginLG}px 0` }} />

                <Button icon={<UploadOutlined />} onClick={() => setUploadOpen(true)}>
                  Upload fastener calculations
                </Button>
              </div>
            </Flex>
          )}
        </Card>
      </Space>

      <SubmittalOptionsModal
        open={submittalOpen}
        selectedBraceCount={selectedBraceKeys.length}
        projectFiles={projectFiles}
        onGenerate={({ includeSubmittal }) => {
          setSubmittalOpen(false);
          message.success(
            includeSubmittal
              ? 'Report and submittal generation queued (stub).'
              : 'Report generation queued (stub).',
          );
        }}
        onCancel={() => setSubmittalOpen(false)}
      />

      <FastenerUploadModal
        open={uploadOpen}
        onUpload={(filenames) => {
          if (projectId) filenames.forEach((name) => addFile(projectId, name));
          setUploadOpen(false);
        }}
        onCancel={() => setUploadOpen(false)}
      />
    </>
  );
}
