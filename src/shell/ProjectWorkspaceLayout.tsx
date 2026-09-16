import {
  FilePdfOutlined,
  FileTextOutlined,
  FolderOpenOutlined,
  LeftOutlined,
} from '@ant-design/icons';
import { useEffect, useMemo } from 'react';
import { Outlet, useLocation, useNavigate, useParams } from 'react-router-dom';

import { useSubmittalPackages } from '../context/SubmittalPackagesContext';
import { Badge, Button, Flex, Layout, Menu, Typography, theme } from '../ui/antd';
import type { MenuProps } from '../ui/antd';

import { hydraMenuItemBorderRadius } from '../theme/hydraMenuMetrics';
import { shellLayout } from '../theme/hydraAlias';
import { setLastScopedProjectId } from './lastProjectScope';
import { pageDescriptionStyle } from './pageDescriptionStyle';
import { projectTitleById } from './projectSeed';

const { Sider, Content } = Layout;

type ModuleKey = 'submittal' | 'content';

function moduleFromPath(pathname: string): ModuleKey {
  if (pathname.includes('/submittal')) return 'submittal';
  return 'content';
}

/** In-project module rail (Spec / Submittal / Content) — nested under a selected project. */
export function ProjectWorkspaceLayout() {
  const { token } = theme.useToken();
  const { projectId = '' } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { packageCountForProject } = useSubmittalPackages();
  const base = `/projects/${projectId}`;
  const title = projectTitleById(projectId) ?? 'Project';
  const selected = moduleFromPath(location.pathname);
  const submittalCount = packageCountForProject(projectId);

  useEffect(() => {
    if (projectId) setLastScopedProjectId(projectId);
  }, [projectId]);

  const items: MenuProps['items'] = useMemo(
    () => [
      {
        key: 'spec',
        icon: <FileTextOutlined />,
        label: 'Spec',
      },
      {
        key: 'submittal',
        icon: <FilePdfOutlined />,
        label: (
          <Flex align="center" gap={token.marginXS} style={{ width: '100%' }}>
            <span>Submittal manager</span>
            {submittalCount > 0 ? (
              <Badge count={submittalCount} size="small" color={token.colorPrimary} />
            ) : null}
          </Flex>
        ),
      },
      {
        key: 'content',
        icon: <FolderOpenOutlined />,
        label: 'Content',
      },
    ],
    [submittalCount, token.colorPrimary, token.marginXS],
  );

  /**
   * Content Downloads uses the app sidebar (Spec / Submittal manager / Content) for navigation.
   * This in-project rail would just duplicate that menu and steal width from the history table.
   */
  if (selected === 'content') {
    return <Outlet />;
  }

  return (
    <Layout style={{ minHeight: '100%', background: 'transparent' }}>
      <Sider
        width={shellLayout.siderWidth}
        theme="light"
        style={{
          background: token.colorFillAlter,
          borderInlineEnd: `${token.lineWidth}px ${token.lineType} ${token.colorBorderSecondary}`,
        }}
      >
        <div style={{ padding: token.paddingLG }}>
          <Button
            type="text"
            size="small"
            icon={<LeftOutlined />}
            onClick={() => navigate('/dashboard')}
            style={{ marginBottom: token.marginXS, padding: 0, height: 'auto' }}
          >
            Home
          </Button>
          <Typography.Text strong>{title}</Typography.Text>
          <Typography.Paragraph style={{ ...pageDescriptionStyle(token), marginTop: token.marginXXS }}>
            Modules for this project
          </Typography.Paragraph>
        </div>
        <Menu
          mode="inline"
          selectable
          selectedKeys={[selected]}
          style={{ borderInlineEnd: 'none', background: 'transparent' }}
          items={items}
          onClick={({ key }) => navigate(`${base}/${key}`)}
          styles={{
            item: { borderRadius: hydraMenuItemBorderRadius },
          }}
        />
      </Sider>
      <Content style={{ paddingInlineStart: token.paddingLG, minHeight: shellLayout.contentMinHeight }}>
        <Outlet />
      </Content>
    </Layout>
  );
}
