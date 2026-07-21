import { useMemo } from 'react';
import { Outlet, useLocation, useParams } from 'react-router-dom';

import { useActiveProject, resolveActiveConstructionProjectId } from '../context/ActiveProjectContext';
import { Breadcrumb, Layout, theme } from '../ui/antd';

import { buildAppBreadcrumbItems } from './buildAppBreadcrumbItems';
import { AppShellSidebar } from './AppShellSidebar';
import { AppTopBar } from './AppTopBar';
import { shellBreadcrumbBarStyle, shellContentRailStyle } from './shellContentRail';

const { Header, Content } = Layout;

/** Portal target for BOM workspace pending-upload collapse — flush under breadcrumbs (Figma `5080:16558`, gap 0). */
export const BOM_SHELL_FLUSH_BELOW_BREADCRUMB_ID = 'bom-shell-flush-below-breadcrumb';

/** Product Catalog hero is full-bleed in the main column, flush under breadcrumbs (no shell rail / horizontal inset). */
export function isProjectProductCatalogPath(pathname: string): boolean {
  return /^\/projects\/[^/]+\/catalog$/.test(pathname);
}

export function AppShell() {
  const { token } = theme.useToken();
  const location = useLocation();
  const params = useParams();
  const { projectId: activeConstructionProjectId } = useActiveProject();
  const locationState = (location.state ?? {}) as {
    swapRowId?: string;
    swapSource?: { partNumber?: string };
  };

  const crumbs = useMemo(
    () =>
      buildAppBreadcrumbItems({
        pathname: location.pathname,
        projectId: params.projectId,
        constructionProjectId:
          params.constructionProjectId ??
          resolveActiveConstructionProjectId(activeConstructionProjectId),
        partId: params.partId,
        itemId: params.itemId,
        swapRowId: locationState.swapRowId,
        swapPartNumber: locationState.swapSource?.partNumber,
      }),
    [
      location.pathname,
      locationState.swapRowId,
      locationState.swapSource?.partNumber,
      params.projectId,
      params.constructionProjectId,
      activeConstructionProjectId,
      params.partId,
      params.itemId,
    ],
  );

  const showBreadcrumbHeader = true;
  const productCatalogFullBleed = isProjectProductCatalogPath(location.pathname);

  return (
    <Layout
      style={{
        minHeight: '100vh',
        height: '100vh',
        maxHeight: '100vh',
        overflow: 'hidden',
      }}
    >
      <AppShellSidebar />
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
        {showBreadcrumbHeader ? (
          <Header
            style={{
              background: token.colorBgContainer,
              boxShadow: token.boxShadowTertiary,
              paddingInline: token.paddingLG,
              paddingBlock: token.paddingSM,
              minHeight: shellBreadcrumbBarStyle.minHeightPx,
              height: 'auto',
              lineHeight: 'inherit',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <div style={shellContentRailStyle}>
              <Breadcrumb items={crumbs} />
            </div>
          </Header>
        ) : null}
        <div id={BOM_SHELL_FLUSH_BELOW_BREADCRUMB_ID} style={{ width: '100%', flexShrink: 0 }} />
        <Content
          style={{
            flex: 1,
            minHeight: 0,
            overflow: 'auto',
            margin: 0,
            paddingTop: productCatalogFullBleed ? 0 : token.paddingLG,
            paddingBottom: token.paddingLG,
            paddingInline: productCatalogFullBleed ? 0 : token.paddingLG,
            background: 'transparent',
            borderRadius: 0,
            border: 'none',
            boxShadow: 'none',
          }}
        >
          {productCatalogFullBleed ? (
            <Outlet />
          ) : (
            <div style={shellContentRailStyle}>
              <Outlet />
            </div>
          )}
        </Content>
      </Layout>
    </Layout>
  );
}
