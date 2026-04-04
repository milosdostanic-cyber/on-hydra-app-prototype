import {
  DashboardOutlined,
  FileSearchOutlined,
  FolderOpenOutlined,
  LeftOutlined,
  SettingOutlined,
  TeamOutlined,
  UnorderedListOutlined,
} from '@ant-design/icons';
import { useMemo, useState } from 'react';
import { Outlet, useLocation, useNavigate, useParams } from 'react-router-dom';

import { figmaMenuItemBorderRadius } from '../theme/figmaMenuMetrics';
import { shellLayout } from '../theme/hydraAlias';
import { sidebarSemanticsLight } from '../theme/sidebarSemantics';
import { Breadcrumb, Button, Layout, Menu, Space, theme } from '../ui/antd';
import type { BreadcrumbProps, MenuProps } from '../ui/antd';

import { AppTopBar } from './AppTopBar';
import { ConnectedSidebarBrand } from './ConnectedSidebarBrand';
import { bomProjectTitleById } from '../bom/data/mockData';
import { projectTitleById } from './projectSeed';

const { Header, Sider, Content } = Layout;

const TOP_PATHS_NO_BACK = new Set(['/dashboard', '/projects', '/catalog', '/bom']);

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

  if (pathname.startsWith('/bom')) {
    items.push({ title: 'BOM' });
    if (pathname === '/bom') return items;
    if (pathname === '/bom/flow') {
      items.push({ title: 'Flow overview' });
      return items;
    }
    if (pathname === '/bom/search') {
      items.push({ title: 'Search' });
      return items;
    }
    const bomProjectMatch = /^\/bom\/projects\/([^/]+)/.exec(pathname);
    if (bomProjectMatch) {
      const bomProjectId = bomProjectMatch[1];
      items.push({ title: bomProjectTitleById(bomProjectId) ?? 'BOM project' });
      const itemMatch = /\/items\/([^/]+)/.exec(pathname);
      if (itemMatch) {
        items.push({ title: `Line ${itemMatch[1]}` });
      }
      if (pathname.includes('/parsing-review')) items.push({ title: 'Parsing review' });
      else if (pathname.includes('/matching')) items.push({ title: 'Matching results' });
      else if (pathname.includes('/narrow')) items.push({ title: 'Guided narrowing' });
      else if (pathname.includes('/recommend')) items.push({ title: 'Recommended result' });
      else if (pathname.includes('/workspace')) items.push({ title: 'Workspace' });
      else if (pathname.includes('/export')) items.push({ title: 'Export' });
      else if (pathname.includes('/service-request')) items.push({ title: 'Service request' });
    }
    return items;
  }

  return items;
}

function primarySideKey(pathname: string): string {
  if (pathname.startsWith('/catalog')) return 'catalog';
  if (pathname.startsWith('/bom')) return 'bom';
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
      { key: 'bom', icon: <UnorderedListOutlined />, label: 'BOM' },
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
      bom: '/bom',
    };
    if (routes[key]) navigate(routes[key]);
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
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
            boxSizing: 'border-box',
            display: 'flex',
            alignItems: 'center',
            paddingBlock: token.paddingSM,
            paddingInline: collapsed ? token.paddingSM : token.paddingLG,
            justifyContent: collapsed ? 'center' : 'flex-start',
            background: sidebarSemanticsLight.colorSidebarHeader,
            borderBottom: `${token.lineWidth}px ${token.lineType} ${token.colorSplit}`,
          }}
        >
          <ConnectedSidebarBrand collapsed={collapsed} />
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
        <AppTopBar />
        <Header
          style={{
            background: token.colorBgContainer,
            borderBottom: `${token.lineWidth}px ${token.lineType} ${token.colorBorderSecondary}`,
            paddingInline: token.paddingLG,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-start',
            height: shellLayout.headerHeight,
            lineHeight: `${shellLayout.headerHeight}px`,
          }}
        >
          <Space size="middle" align="center">
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
