import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { PageBackButton } from '../../shell/PageBackButton';
import { projectTitleById } from '../../shell/projectSeed';
import {
  Alert,
  App,
  Button,
  Col,
  Empty,
  Flex,
  Row,
  Skeleton,
  Typography,
  theme,
} from '../../ui/antd';
import { SpecPermissionBoundary } from '../components/SpecPermissionBoundary';
import { SpecProductSuggestionCard } from '../components/SpecProductSuggestionCard';
import { SpecWorkspaceHeader } from '../components/SpecWorkspaceHeader';
import { canEdit } from '../constants/specStatusVocabulary';
import { useSpecDemo } from '../context/SpecDemoContext';
import { useSpecWorkspace } from '../context/SpecWorkspaceContext';
import { mockSpecProductsRepository } from '../data/repositories/specRepositories';
import { useSpecMockStore } from '../data/specMockStore';
import type { SpecProductSuggestion } from '../data/types';
import { useSpecDocument } from '../hooks/useSpecDocument';
import { trackSpecEvent } from '../specAnalytics';
import { specAskPath, specHomePath, specSubstitutionPath } from '../specNavigation';
import { navigateSpecWorkspaceTab, specWorkspaceTabItems } from '../specWorkspaceTabs';

/**
 * I3 — Suggested products with commercial separation notice (AC-023+).
 */
export function SpecProductsPage() {
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

  const [suggestions, setSuggestions] = useState<SpecProductSuggestion[]>([]);
  const [panelLoading, setPanelLoading] = useState(true);

  const reload = useCallback(async (documentId: string) => {
    setPanelLoading(true);
    try {
      setSuggestions(await mockSpecProductsRepository.listSuggestions(documentId));
    } finally {
      setPanelLoading(false);
    }
  }, []);

  useEffect(() => {
    if (document) {
      workspace.setDocumentId(document.id);
      trackSpecEvent('spec_products_opened', { documentId: document.id });
      void reload(document.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [document?.id, store.scenarioId, store.productSuggestions]);

  const commercial = useMemo(
    () => suggestions.filter((s) => s.commerciallyMotivated && s.fit !== 'no-fit'),
    [suggestions],
  );
  const noFit = useMemo(() => suggestions.filter((s) => s.fit === 'no-fit'), [suggestions]);
  const projectName = document?.projectId ? projectTitleById(document.projectId) : undefined;

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
        activeTab="products"
        onTabChange={(key) => navigateSpecWorkspaceTab(document.id, key, navigate)}
        actions={
          <Button size="large" onClick={() => navigate(specSubstitutionPath(document.id))}>
            Open substitution
          </Button>
        }
      />

      {!editable ? <SpecPermissionBoundary access={access} actionLabel="Product selection" /> : null}

      <Alert
        type="info"
        showIcon
        title="Commercial suggestions are optional"
        description="Analyzer findings stay neutral. ASC product suggestions below are commercial and do not change the source analysis."
      />

      {panelLoading ? (
        <Skeleton active paragraph={{ rows: 6 }} />
      ) : suggestions.length === 0 ? (
        <Empty
          description={
            <Flex vertical gap={token.marginSM}>
              <Typography.Text>No product suggestions yet</Typography.Text>
              <Typography.Text type="secondary">
                Finish analysis first, then return here for ASC equals.
              </Typography.Text>
            </Flex>
          }
        />
      ) : (
        <Flex vertical gap={token.marginLG}>
          {noFit.length > 0 ? (
            <Flex vertical gap={token.marginSM}>
              <Typography.Title level={5} style={{ margin: 0 }}>
                No ASC catalog fit
              </Typography.Title>
              <Alert
                type="warning"
                showIcon
                title="No suitable ASC product"
                description="Neutral analysis succeeded, but nothing in the ASC catalog matches. Ask an Engineer or draft a substitution request."
                action={
                  <Flex gap={token.marginXS}>
                    <Button
                      size="small"
                      type="primary"
                      onClick={() =>
                        navigate(specAskPath(document.id), {
                          state: {
                            subject: 'No ASC catalog fit — engineer guidance',
                            context: {
                              documentId: document.id,
                              documentTitle: document.title,
                              versionLabel: document.versionLabel,
                              sectionId: noFit[0]?.sectionId,
                              sectionLabel: 'No ASC catalog fit',
                              findingId: noFit[0]?.id,
                              findingTitle: noFit[0]?.name,
                              citationId: noFit[0]?.citationIds[0],
                            },
                          },
                        })
                      }
                    >
                      Ask an Engineer
                    </Button>
                    <Button size="small" onClick={() => navigate(specSubstitutionPath(document.id))}>
                      Substitution
                    </Button>
                  </Flex>
                }
              />
              {noFit.map((s) => (
                <SpecProductSuggestionCard
                  key={s.id}
                  suggestion={s}
                  canAct={false}
                  onSelect={() => undefined}
                  onDismiss={() => undefined}
                  onAddToSubstitution={() => undefined}
                />
              ))}
            </Flex>
          ) : null}

          {commercial.length > 0 ? (
            <Flex vertical gap={token.marginSM}>
              <Typography.Title level={5} style={{ margin: 0 }}>
                ASC suggestions ({commercial.length})
              </Typography.Title>
              <Row gutter={[token.marginMD, token.marginMD]}>
                {commercial.map((s) => (
                  <Col key={s.id} xs={24} md={12}>
                    <SpecProductSuggestionCard
                      suggestion={s}
                      selected={s.status === 'selected' || s.status === 'added-to-substitution'}
                      canAct={editable}
                      onSelect={async (item) => {
                        await mockSpecProductsRepository.selectSuggestion(item.id);
                        message.success('Product selected.');
                        void reload(document.id);
                      }}
                      onDismiss={async (item) => {
                        await mockSpecProductsRepository.dismissSuggestion(item.id);
                        message.success('Suggestion dismissed.');
                        void reload(document.id);
                      }}
                      onAddToSubstitution={async (item) => {
                        await mockSpecProductsRepository.addToSubstitution(document.id, item);
                        message.success('Added to substitution request.');
                        void reload(document.id);
                      }}
                    />
                  </Col>
                ))}
              </Row>
            </Flex>
          ) : null}
        </Flex>
      )}
    </Flex>
  );
}
