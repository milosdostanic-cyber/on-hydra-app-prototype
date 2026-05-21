import {
  AppstoreOutlined,
  FilePdfOutlined,
  FolderOpenOutlined,
  LeftOutlined,
} from '@ant-design/icons';
import { useEffect, useMemo } from 'react';
import { Outlet, useLocation, useNavigate, useParams } from 'react-router-dom';

import { useActiveProject } from '../context/ActiveProjectContext';
import { useSubmittalDraft } from '../context/SubmittalDraftContext';
import { Badge, Button, Flex, Layout, Tabs, Typography, theme } from '../ui/antd';
import type { TabsProps } from '../ui/antd';

import { shellLayout } from '../theme/hydraAlias';
import { setLastScopedProjectId } from './lastProjectScope';
import { projectTitleById } from './projectSeed';

const { Content } = Layout;

type ModuleKey = 'sales-brace' | 'submittal' | 'content';

function moduleFromPath(pathname: string): ModuleKey {
  if (pathname.includes('/sales-brace') || pathname.includes('/seis-brace')) return 'sales-brace';
  if (pathname.includes('/submittal')) return 'submittal';
  return 'content';
}

/**
 * Project workspace: Spec / Submittal show header + module tabs + outlet. Content route is intentionally empty
 * (outlet only) so the main area is just app shell chrome — sidebar, top bar, breadcrumbs.
 */
export function ProjectWorkspaceLayout() {
  const { token } = theme.useToken();
  const { projectId = '' } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { setProjectId } = useActiveProject();
  const { countForProject } = useSubmittalDraft();
  const base = `/projects/${projectId}`;
  const title = projectTitleById(projectId) ?? 'Project';
  const selected = moduleFromPath(location.pathname);
  const submittalCount = countForProject(projectId);

  useEffect(() => {
    if (!projectId) return;
    setLastScopedProjectId(projectId);
    setProjectId(projectId);
  }, [projectId, setProjectId]);

  const tabItems: TabsProps['items'] = useMemo(
    () => [
      {
        key: 'sales-brace',
        label: (
          <Flex align="center" gap={token.marginXS}>
            <AppstoreOutlined />
            <span>Spec</span>
          </Flex>
        ),
      },
      {
        key: 'submittal',
        label: (
          <Flex align="center" gap={token.marginXS}>
            <FilePdfOutlined />
            <span>Submittal manager</span>
            {submittalCount > 0 ? (
              <Badge count={submittalCount} size="small" color={token.colorPrimary} />
            ) : null}
          </Flex>
        ),
      },
      {
        key: 'content',
        label: (
          <Flex align="center" gap={token.marginXS}>
            <FolderOpenOutlined />
            <span>Content</span>
          </Flex>
        ),
      },
    ],
    [submittalCount, token.colorPrimary, token.marginXS],
  );

  /** Content module: empty canvas; navigation via app shell only (sidebar / breadcrumbs). */
  if (selected === 'content') {
    return (
      <Layout style={{ minHeight: '100%', background: 'transparent' }}>
        <Content style={{ minHeight: shellLayout.contentMinHeight }}>
          <Outlet />
        </Content>
      </Layout>
    );
  }

  return (
    <Layout style={{ minHeight: '100%', background: 'transparent' }}>
      <Content style={{ minHeight: shellLayout.contentMinHeight }}>
        <Flex vertical gap={token.marginMD} style={{ width: '100%' }}>
          <div>
            <Button
              type="text"
              size="small"
              icon={<LeftOutlined />}
              onClick={() => navigate('/projects')}
              style={{ marginBottom: token.marginXS, padding: 0, height: 'auto' }}
            >
              All projects
            </Button>
            <Typography.Title level={4} style={{ margin: 0 }}>
              {title}
            </Typography.Title>
            <Typography.Text type="secondary" style={{ display: 'block', marginTop: token.marginXXS }}>
              Modules for this project
            </Typography.Text>
          </div>

          <Tabs
            activeKey={selected}
            items={tabItems}
            onChange={(key) => navigate(`${base}/${key}`)}
            style={{ marginBottom: 0 }}
          />

          <Outlet />
        </Flex>
      </Content>
    </Layout>
  );
}
