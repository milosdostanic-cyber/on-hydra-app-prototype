import {
  AppstoreOutlined,
  FilePdfOutlined,
  FolderOpenOutlined,
} from '@ant-design/icons';
import { useMemo } from 'react';
import { Outlet, useLocation, useNavigate, useParams } from 'react-router-dom';

import { Layout, Menu, Typography, theme } from '../ui/antd';
import type { MenuProps } from '../ui/antd';

import { figmaMenuItemBorderRadius } from '../theme/figmaMenuMetrics';
import { shellLayout } from '../theme/hydraAlias';
import { projectTitleById } from './projectSeed';

const { Sider, Content } = Layout;

type ModuleKey = 'sales-brace' | 'submittal' | 'content';

function moduleFromPath(pathname: string): ModuleKey {
  if (pathname.includes('/sales-brace')) return 'sales-brace';
  if (pathname.includes('/submittal')) return 'submittal';
  return 'content';
}

/** In-project module rail (Sales brace / Submittal / Content) — nested under a selected project. */
export function ProjectWorkspaceLayout() {
  const { token } = theme.useToken();
  const { projectId = '' } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const base = `/projects/${projectId}`;
  const title = projectTitleById(projectId) ?? 'Project';
  const selected = moduleFromPath(location.pathname);

  const items: MenuProps['items'] = useMemo(
    () => [
      {
        key: 'sales-brace',
        icon: <AppstoreOutlined />,
        label: 'Sales brace',
      },
      {
        key: 'submittal',
        icon: <FilePdfOutlined />,
        label: 'Submittal manager',
      },
      {
        key: 'content',
        icon: <FolderOpenOutlined />,
        label: 'Content',
      },
    ],
    [],
  );

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
          <Typography.Text strong>{title}</Typography.Text>
          <Typography.Paragraph type="secondary" style={{ marginBottom: 0, marginTop: token.marginXXS }}>
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
            item: { borderRadius: figmaMenuItemBorderRadius },
          }}
        />
      </Sider>
      <Content style={{ paddingInlineStart: token.paddingLG, minHeight: shellLayout.contentMinHeight }}>
        <Outlet />
      </Content>
    </Layout>
  );
}
