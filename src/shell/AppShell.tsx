import {
  BorderOuterOutlined,
  FilePdfOutlined,
  FileTextOutlined,
  FolderOpenOutlined,
  HomeOutlined,
  LeftOutlined,
  MailOutlined,
} from '@ant-design/icons';
import { useMemo, useState } from 'react';
import { Outlet, useLocation, useNavigate, useParams } from 'react-router-dom';

import { hydraMenuItemBorderRadius } from '../theme/hydraMenuMetrics';
import { shellLayout } from '../theme/hydraAlias';
import { sidebarSemanticsLight } from '../theme/sidebarSemantics';
import { Breadcrumb, Button, Layout, Menu, Space, theme } from '../ui/antd';
import type { BreadcrumbProps, MenuProps } from '../ui/antd';

import { AppTopBar } from './AppTopBar';
import { ConnectedSidebarBrand } from './ConnectedSidebarBrand';
import { bomProjectTitleById } from '../bom/data/mockData';
import { getLastScopedProjectId } from './lastProjectScope';
import { projectTitleById } from './projectSeed';

const { Header, Sider, Content } = Layout;

const TOP_PATHS_NO_BACK = new Set(['/dashboard', '/projects', '/bom']);

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
      if (pathname.includes('/sales-brace')) items.push({ title: 'Spec' });
      else if (pathname.includes('/submittal')) items.push({ title: 'Submittal' });
      else if (pathname.includes('/content')) items.push({ title: 'Content' });
    }
    return items;
  }

  if (pathname.startsWith('/dashboard')) {
    items.push({ title: 'Homepage' });
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
  if (pathname.startsWith('/bom')) return 'bom';
  if (pathname.startsWith('/dashboard')) return 'dash';
  if (pathname.startsWith('/projects')) {
    if (/\/projects\/[^/]+\/sales-brace/.test(pathname)) return 'spec';
    if (/\/projects\/[^/]+\/submittal/.test(pathname)) return 'submittal';
    if (/\/projects\/[^/]+\/content/.test(pathname)) return 'content';
    return 'proj';
  }
  return 'dash';
}

function backTargetForPath(pathname: string, projectId?: string): { label: string; path?: string } {
  if (pathname === '/catalog/results') return { label: 'Back to Catalog', path: '/catalog' };
  if (/^\/catalog\/parts\/[^/]+/.test(pathname)) return { label: 'Back to Results', path: '/catalog/results' };

  if (pathname === '/bom/flow' || pathname === '/bom/search') {
    return { label: 'Back to BOM', path: '/bom' };
  }
  if (/^\/bom\/projects\/[^/]+\/parsing-review/.test(pathname)) {
    return { label: 'Back to BOM', path: '/bom' };
  }
  if (/^\/bom\/projects\/[^/]+\/matching/.test(pathname)) {
    return {
      label: 'Back to Parsing',
      path: projectId ? `/bom/projects/${projectId}/parsing-review` : undefined,
    };
  }
  if (/^\/bom\/projects\/[^/]+\/items\/[^/]+\/narrow/.test(pathname)) {
    return {
      label: 'Back to Matching',
      path: projectId ? `/bom/projects/${projectId}/matching` : undefined,
    };
  }
  if (/^\/bom\/projects\/[^/]+\/items\/[^/]+\/recommend/.test(pathname)) {
    return {
      label: 'Back to Narrowing',
      path: projectId ? `/bom/projects/${projectId}/matching` : undefined,
    };
  }
  if (/^\/bom\/projects\/[^/]+\/workspace/.test(pathname)) {
    return {
      label: 'Back to Matching',
      path: projectId ? `/bom/projects/${projectId}/matching` : undefined,
    };
  }
  if (/^\/bom\/projects\/[^/]+\/export/.test(pathname) || /^\/bom\/projects\/[^/]+\/service-request/.test(pathname)) {
    return {
      label: 'Back to Workspace',
      path: projectId ? `/bom/projects/${projectId}/workspace` : undefined,
    };
  }

  if (/^\/projects\/[^/]+\/sales-brace/.test(pathname)) {
    return { label: 'Back to Projects', path: '/projects' };
  }
  if (/^\/projects\/[^/]+\/submittal/.test(pathname) || /^\/projects\/[^/]+\/content/.test(pathname)) {
    return {
      label: 'Back to Spec',
      path: projectId ? `/projects/${projectId}/sales-brace` : undefined,
    };
  }

  return { label: 'Back to Previous' };
}

export function AppShell() {
  const [collapsed, setCollapsed] = useState(false);
  const { token } = theme.useToken();
  const location = useLocation();
  const navigate = useNavigate();
  const params = useParams();

  const menuItems: MenuProps['items'] = useMemo(
    () => [
      { key: 'dash', icon: <HomeOutlined />, label: 'Homepage' },
      { key: 'proj', icon: <FolderOpenOutlined />, label: 'Projects' },
      { key: 'bom', icon: <FilePdfOutlined />, label: 'BOM' },
      { key: 'spec', icon: <BorderOuterOutlined />, label: 'Spec' },
      { key: 'submittal', icon: <FileTextOutlined />, label: 'Submittal' },
      { key: 'content', icon: <MailOutlined />, label: 'Content' },
    ],
    [],
  );

  const selectedMenuKeys = useMemo(() => [primarySideKey(location.pathname)], [location.pathname]);

  const crumbs = useMemo(
    () => breadcrumbItemsForPath(location.pathname, params.projectId, params.partId),
    [location.pathname, params.projectId, params.partId],
  );

  const showBack = !TOP_PATHS_NO_BACK.has(location.pathname);
  const backTarget = useMemo(
    () => backTargetForPath(location.pathname, params.projectId),
    [location.pathname, params.projectId],
  );

  const onMenuClick: MenuProps['onClick'] = ({ key }) => {
    const pid = getLastScopedProjectId();
    const routes: Record<string, string> = {
      dash: '/dashboard',
      proj: '/projects',
      bom: '/bom',
      spec: `/projects/${pid}/sales-brace`,
      submittal: `/projects/${pid}/submittal`,
      content: `/projects/${pid}/content`,
    };
    const path = routes[key];
    if (path) navigate(path);
  };

  return (
    <Layout
      style={{
        minHeight: '100vh',
        height: '100vh',
        maxHeight: '100vh',
        overflow: 'hidden',
      }}
    >
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
          alignSelf: 'stretch',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            minHeight: 0,
          }}
        >
          <div
            style={{
              flexShrink: 0,
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
          <div style={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
            <Menu
              theme="dark"
              mode="inline"
              selectedKeys={selectedMenuKeys}
              items={menuItems}
              onClick={onMenuClick}
              style={{ borderInlineEnd: 'none', background: 'transparent' }}
              styles={{
                item: { borderRadius: hydraMenuItemBorderRadius },
              }}
            />
          </div>
        </div>
      </Sider>
      <Layout
        style={{
          flex: 1,
          minWidth: 0,
          minHeight: 0,
          overflow: 'hidden',
          background: token.colorBgLayout,
        }}
      >
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
                onClick={() => {
                  if (backTarget.path) navigate(backTarget.path);
                  else navigate(-1);
                }}
                aria-label={backTarget.label}
              >
                {backTarget.label}
              </Button>
            ) : null}
            <Breadcrumb items={crumbs} />
          </Space>
        </Header>
        <Content
          style={{
            flex: 1,
            minHeight: 0,
            overflow: 'auto',
            margin: token.marginLG,
            padding: token.paddingLG,
            background: token.colorBgContainer,
            borderRadius: token.borderRadiusLG,
            border: `${token.lineWidth}px ${token.lineType} ${token.colorBorderSecondary}`,
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
