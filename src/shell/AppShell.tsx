import { useMemo } from 'react';
import { Outlet, useLocation, useParams } from 'react-router-dom';

import { Breadcrumb, Layout, theme } from '../ui/antd';

import { buildAppBreadcrumbItems } from './buildAppBreadcrumbItems';
import { AppShellSidebar } from './AppShellSidebar';
import { AppTopBar } from './AppTopBar';
import { shellBreadcrumbBarStyle, shellContentRailStyle } from './shellContentRail';

const { Header, Content } = Layout;

/** Product Catalog hero is full-bleed in the main column, flush under breadcrumbs (no shell rail / horizontal inset). */
export function isProjectProductCatalogPath(pathname: string): boolean {
  return /^\/projects\/[^/]+\/content$/.test(pathname);
}

export function AppShell() {
  const { token } = theme.useToken();
  const location = useLocation();
  const params = useParams();
  const locationState = (location.state ?? {}) as {
    swapRowId?: string;
    swapSource?: { partNumber?: string };
  };

  const crumbs = useMemo(
    () =>
      buildAppBreadcrumbItems({
        pathname: location.pathname,
        projectId: params.projectId,
        partId: params.partId,
        itemId: params.itemId,
        swapRowId: locationState.swapRowId,
        swapPartNumber: locationState.swapSource?.partNumber,
      }),
    [location.pathname, locationState.swapRowId, locationState.swapSource?.partNumber, params.projectId, params.partId, params.itemId],
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
