import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { PageBackButton } from '../../shell/PageBackButton';
import { projectTitleById } from '../../shell/projectSeed';
import { PackageCreateEditModal } from '../../submittal/components/PackageCreateEditModal';
import {
  Alert,
  App,
  Badge,
  Button,
  Card,
  Empty,
  Flex,
  Select,
  Skeleton,
  Table,
  Typography,
  theme,
  type TableColumnsType,
} from '../../ui/antd';
import { SpecPermissionBoundary } from '../components/SpecPermissionBoundary';
import { SpecWorkspaceHeader } from '../components/SpecWorkspaceHeader';
import {
  canEdit,
  submittalObligationStatusLabel,
} from '../constants/specStatusVocabulary';
import { useSpecDemo } from '../context/SpecDemoContext';
import { useSpecWorkspace } from '../context/SpecWorkspaceContext';
import { mockSpecArtifactsRepository } from '../data/repositories/specRepositories';
import { useSpecMockStore } from '../data/specMockStore';
import type { SpecSubmittalObligation, SpecSubmittalPackage } from '../data/types';
import { useSpecDocument } from '../hooks/useSpecDocument';
import { trackSpecEvent } from '../specAnalytics';
import { specHomePath } from '../specNavigation';
import { navigateSpecWorkspaceTab, specWorkspaceTabItems } from '../specWorkspaceTabs';
import { hydraBaseStrong, hydraTextStyleToReactCss } from '../../theme/hydraTypography';

/**
 * I3 — Submittal obligations register + package builder (reuses PackageCreateEditModal).
 */
export function SpecSubmittalsPage() {
  const { token } = theme.useToken();
  const { message } = App.useApp();
  const navigate = useNavigate();
  const { specId = '' } = useParams<{ specId: string }>();
  const { document, loading, error } = useSpecDocument(specId);
  const store = useSpecMockStore();
  const workspace = useSpecWorkspace();
  const demo = useSpecDemo();
  const access = demo.role;
  const editable = canEdit(access);

  const [obligations, setObligations] = useState<SpecSubmittalObligation[]>([]);
  const [packages, setPackages] = useState<SpecSubmittalPackage[]>([]);
  const [panelLoading, setPanelLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [renameTarget, setRenameTarget] = useState<SpecSubmittalPackage | null>(null);
  const [addTarget, setAddTarget] = useState<SpecSubmittalObligation | null>(null);
  const [selectedPackageId, setSelectedPackageId] = useState<string | undefined>();

  const reload = useCallback(async (documentId: string) => {
    setPanelLoading(true);
    try {
      const [obs, pkgs] = await Promise.all([
        mockSpecArtifactsRepository.listObligations(documentId),
        mockSpecArtifactsRepository.listPackages(documentId),
      ]);
      setObligations(obs);
      setPackages(pkgs);
      setSelectedPackageId((prev) => prev ?? pkgs[0]?.id);
    } finally {
      setPanelLoading(false);
    }
  }, []);

  useEffect(() => {
    if (document) {
      workspace.setDocumentId(document.id);
      trackSpecEvent('spec_submittals_opened', { documentId: document.id });
      void reload(document.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [document?.id, store.scenarioId, store.submittalObligations, store.submittalPackages]);

  const projectName = document?.projectId ? projectTitleById(document.projectId) : undefined;
  const missingDocs = obligations.some((o) => o.missingDocuments);

  const columns: TableColumnsType<SpecSubmittalObligation> = [
    {
      title: 'Obligation',
      dataIndex: 'title',
      render: (_, row) => (
        <Flex vertical gap={token.marginXXS}>
          <Typography.Text style={hydraTextStyleToReactCss(hydraBaseStrong)}>{row.title}</Typography.Text>
          <Typography.Text type="secondary">{row.description}</Typography.Text>
        </Flex>
      ),
    },
    {
      title: 'Due',
      dataIndex: 'dueLabel',
      width: 140,
      render: (v?: string) => v ?? '—',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      width: 140,
      render: (status: SpecSubmittalObligation['status']) => (
        <Badge
          status={status === 'open' ? 'warning' : status === 'in-package' ? 'success' : 'default'}
          text={submittalObligationStatusLabel[status]}
        />
      ),
    },
    {
      title: 'Docs',
      key: 'docs',
      width: 120,
      render: (_, row) =>
        row.missingDocuments ? (
          <Badge status="warning" text="Missing" />
        ) : (
          <Badge status="success" text="Ready" />
        ),
    },
    {
      title: '',
      key: 'actions',
      width: 160,
      render: (_, row) =>
        editable && row.status === 'open' ? (
          <Button
            type="link"
            size="small"
            onClick={() => {
              if (packages.length === 0) {
                setCreateOpen(true);
                setAddTarget(row);
                return;
              }
              setAddTarget(row);
            }}
          >
            Add to package
          </Button>
        ) : null,
    },
  ];

  if (loading) return <Skeleton active paragraph={{ rows: 8 }} />;
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
      <PageBackButton to={specHomePath(document.projectId)}>Back to Spec</PageBackButton>

      <SpecWorkspaceHeader
        document={document}
        projectName={projectName}
        tabItems={specWorkspaceTabItems()}
        activeTab="submittals"
        onTabChange={(key) => navigateSpecWorkspaceTab(document.id, key, navigate)}
        actions={
          editable ? (
            <Button type="primary" size="large" onClick={() => setCreateOpen(true)}>
              New package
            </Button>
          ) : undefined
        }
      />

      {!editable ? <SpecPermissionBoundary access={access} actionLabel="Building packages" /> : null}

      {missingDocs ? (
        <Alert
          type="warning"
          showIcon
          title="Some obligations are missing documents"
          description="You can still build a package. Export stays mocked until documents are attached."
        />
      ) : null}

      {panelLoading ? (
        <Skeleton active paragraph={{ rows: 6 }} />
      ) : (
        <Flex vertical gap={token.marginLG}>
          <Card styles={{ body: { padding: 0 } }}>
            {obligations.length === 0 ? (
              <Empty
                style={{ padding: token.paddingLG }}
                description="No submittal obligations extracted for this specification."
              />
            ) : (
              <Table
                rowKey="id"
                columns={columns}
                dataSource={obligations}
                pagination={false}
                scroll={{ x: 'max-content' }}
              />
            )}
          </Card>

          <Flex vertical gap={token.marginSM}>
            <Typography.Title level={5} style={{ margin: 0 }}>
              Packages ({packages.length})
            </Typography.Title>
            {packages.length === 0 ? (
              <Empty description="No packages yet. Create one to collect open obligations." />
            ) : (
              packages.map((pkg) => (
                <Card
                  key={pkg.id}
                  size="small"
                  title={pkg.name}
                  extra={
                    editable ? (
                      <Button type="link" size="small" onClick={() => setRenameTarget(pkg)}>
                        Rename
                      </Button>
                    ) : null
                  }
                >
                  {pkg.items.length === 0 ? (
                    <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No items in this package." />
                  ) : (
                    <Flex vertical gap={token.marginXS}>
                      {pkg.items.map((item) => (
                        <Typography.Text key={item.id}>• {item.title}</Typography.Text>
                      ))}
                    </Flex>
                  )}
                  <Typography.Text type="secondary">
                    Updated {new Date(pkg.updatedAt).toLocaleString()} · Mock export only
                  </Typography.Text>
                </Card>
              ))
            )}
          </Flex>
        </Flex>
      )}

      <PackageCreateEditModal
        open={createOpen || Boolean(renameTarget)}
        initialName={renameTarget?.name}
        onCancel={() => {
          setCreateOpen(false);
          setRenameTarget(null);
          setAddTarget(null);
        }}
        onSubmit={async (name) => {
          if (renameTarget) {
            await mockSpecArtifactsRepository.renamePackage(renameTarget.id, name);
            message.success('Package renamed.');
          } else {
            const pkg = await mockSpecArtifactsRepository.createPackage(document.id, name);
            message.success('Package created.');
            if (addTarget) {
              await mockSpecArtifactsRepository.addObligationToPackage(pkg.id, addTarget.id);
              message.success('Obligation added to package.');
            }
          }
          setCreateOpen(false);
          setRenameTarget(null);
          setAddTarget(null);
          void reload(document.id);
        }}
      />

      {addTarget && packages.length > 0 && !createOpen ? (
        <Card size="small" title={`Add “${addTarget.title}” to a package`}>
          <Flex gap={token.marginSM} wrap="wrap" align="center">
            <Select
              style={{ minWidth: token.controlHeight * 8 }}
              value={selectedPackageId}
              onChange={setSelectedPackageId}
              options={packages.map((p) => ({ value: p.id, label: p.name }))}
            />
            <Button
              type="primary"
              disabled={!selectedPackageId}
              onClick={async () => {
                if (!selectedPackageId) return;
                await mockSpecArtifactsRepository.addObligationToPackage(selectedPackageId, addTarget.id);
                message.success('Obligation added to package.');
                setAddTarget(null);
                void reload(document.id);
              }}
            >
              Add
            </Button>
            <Button onClick={() => setAddTarget(null)}>Cancel</Button>
          </Flex>
        </Card>
      ) : null}
    </Flex>
  );
}
