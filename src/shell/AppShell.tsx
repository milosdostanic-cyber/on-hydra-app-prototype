import {
  DashboardOutlined,
  FileSearchOutlined,
  FolderOpenOutlined,
  LeftOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  SettingOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import { useMemo, useState } from 'react';
import { Outlet, useLocation, useNavigate, useParams } from 'react-router-dom';

import { figmaMenuItemBorderRadius } from '../theme/figmaMenuMetrics';
import { shellLayout } from '../theme/hydraAlias';
import { sidebarSemanticsLight } from '../theme/sidebarSemantics';
import {
  Avatar,
  Breadcrumb,
  Button,
  Input,
  Layout,
  Menu,
  Space,
  theme,
  Typography,
} from '../ui/antd';
import type { BreadcrumbProps, MenuProps } from '../ui/antd';

import { projectTitleById } from './projectSeed';

const { Header, Sider, Content } = Layout;

const TOP_PATHS_NO_BACK = new Set(['/dashboard', '/projects', '/catalog']);

function breadcrumbItemsForPath(pathname: string, projectId?: string, partId?: string): BreadcrumbProps['items'] {
  const items: BreadcrumbProps['items'] = [{ title: 'App' }];

  if (pathname.startsWith('/catalog')) {
    items.push({ title: 'Catalog' });
    if (pathname.includes('/results')) items.push({ title: 'Results' });
    if (partId) items.push({ title: `Part ${partId}` });
    return items;
  }

  if (pathname.startsWith('/projects')) {
    items.push({ title: 'Projects' });
    if (projectId) {
      items.push({ title: projectTitleById(projectId) ?? 'Project' });
      if (pathname.includes('/sales-brace')) items.push({ title: 'Sales brace' });
      else if (pathname.includes('/submittal')) items.push({ title: 'Submittal manager' });
      else if (pathname.includes('/content')) items.push({ title: 'Content' });
    }
    return items;
  }

  if (pathname.startsWith('/dashboard')) {
    items.push({ title: 'Dashboard' });
    return items;
  }

  return items;
}

function primarySideKey(pathname: string): string {
  if (pathname.startsWith('/catalog')) return 'catalog';
  if (pathname.startsWith('/projects')) return 'proj';
  if (pathname.startsWith('/dashboard')) return 'dash';
  return 'dash';
}

export function AppShell() {
  const [collapsed, setCollapsed] = useState(false);
  const { token } = theme.useToken();
  const location = useLocation();
  const navigate = useNavigate();
  const params = useParams();

  const menuItems: MenuProps['items'] = useMemo(
    () => [
      { key: 'dash', icon: <DashboardOutlined />, label: 'Dashboard' },
      { key: 'proj', icon: <FolderOpenOutlined />, label: 'Projects' },
      { key: 'catalog', icon: <FileSearchOutlined />, label: 'Catalog' },
      {
        key: 'team',
        icon: <TeamOutlined />,
        label: 'Team',
        children: [
          { key: 'team:m', label: 'Members' },
          { key: 'team:r', label: 'Roles' },
        ],
      },
      { key: 'set', icon: <SettingOutlined />, label: 'Settings' },
    ],
    [],
  );

  const selectedMenuKeys = useMemo(() => [primarySideKey(location.pathname)], [location.pathname]);

  const crumbs = useMemo(
    () => breadcrumbItemsForPath(location.pathname, params.projectId, params.partId),
    [location.pathname, params.projectId, params.partId],
  );

  const showBack = !TOP_PATHS_NO_BACK.has(location.pathname);

  const onMenuClick: MenuProps['onClick'] = ({ key }) => {
    const routes: Record<string, string> = {
      dash: '/dashboard',
      proj: '/projects',
      catalog: '/catalog',
    };
    if (routes[key]) navigate(routes[key]);
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        trigger={null}
        theme="dark"
        width={shellLayout.siderWidth}
        collapsedWidth={shellLayout.siderCollapsedWidth}
        style={{
          background: sidebarSemanticsLight.colorSidebar,
          borderInlineEnd: `${token.lineWidth}px ${token.lineType} ${token.colorSplit}`,
        }}
      >
        <div
          style={{
            height: shellLayout.headerHeight,
            display: 'flex',
            alignItems: 'center',
            paddingInline: collapsed ? token.paddingSM : token.paddingLG,
            justifyContent: collapsed ? 'center' : 'flex-start',
            background: sidebarSemanticsLight.colorSidebarHeader,
          }}
        >
          {collapsed ? (
            <Typography.Text style={{ color: token.colorTextLightSolid, fontSize: token.fontSizeLG }}>
              H
            </Typography.Text>
          ) : (
            <Typography.Text
              strong
              style={{ color: token.colorTextLightSolid, fontSize: token.fontSizeLG }}
            >
              Hydra
            </Typography.Text>
          )}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={selectedMenuKeys}
          defaultOpenKeys={['team']}
          items={menuItems}
          onClick={onMenuClick}
          style={{ borderInlineEnd: 'none', background: 'transparent' }}
          styles={{
            item: { borderRadius: figmaMenuItemBorderRadius },
            subMenu: { item: { borderRadius: figmaMenuItemBorderRadius } },
          }}
        />
      </Sider>
      <Layout style={{ background: token.colorBgLayout }}>
        <Header
          style={{
            position: 'sticky',
            top: 0,
            zIndex: token.zIndexBase + 1,
            background: token.colorBgContainer,
            borderBottom: `${token.lineWidth}px ${token.lineType} ${token.colorBorderSecondary}`,
            paddingInline: token.paddingLG,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            height: shellLayout.headerHeight,
            lineHeight: `${shellLayout.headerHeight}px`,
          }}
        >
          <Space size="middle" align="center">
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed((c) => !c)}
              aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            />
            {showBack ? (
              <Button
                type="text"
                icon={<LeftOutlined />}
                onClick={() => navigate(-1)}
                aria-label="Go back"
              >
                Back
              </Button>
            ) : null}
            <Breadcrumb items={crumbs} />
          </Space>
          <Space size="middle">
            <Input.Search
              placeholder="Search"
              allowClear
              style={{ width: shellLayout.topBarSearchWidth }}
            />
            <Avatar style={{ background: token.colorPrimary }}>U</Avatar>
          </Space>
        </Header>
        <Content
          style={{
            margin: token.marginLG,
            padding: token.paddingLG,
            background: token.colorBgContainer,
            borderRadius: token.borderRadiusLG,
            border: `${token.lineWidth}px ${token.lineType} ${token.colorBorderSecondary}`,
            minHeight: shellLayout.contentMinHeight,
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
