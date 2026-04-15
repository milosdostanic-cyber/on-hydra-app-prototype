import { useMemo } from 'react';
import { Outlet, useLocation, useParams } from 'react-router-dom';

import { shellLayout } from '../theme/hydraAlias';
import { Breadcrumb, Layout, theme } from '../ui/antd';

import { buildAppBreadcrumbItems } from './buildAppBreadcrumbItems';
import { AppShellSidebar } from './AppShellSidebar';
import { AppTopBar } from './AppTopBar';

const { Header, Content } = Layout;

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
              height: 'auto',
              lineHeight: 'inherit',
            }}
          >
            <div
              style={{
                width: '100%',
                maxWidth: shellLayout.contentRailMaxWidthPx,
                minWidth: `min(100%, ${shellLayout.contentRailMinWidthPx}px)`,
                marginInline: 'auto',
                boxSizing: 'border-box',
              }}
            >
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
            padding: token.paddingLG,
            background: 'transparent',
            borderRadius: 0,
            border: 'none',
            boxShadow: 'none',
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: shellLayout.contentRailMaxWidthPx,
              minWidth: `min(100%, ${shellLayout.contentRailMinWidthPx}px)`,
              marginInline: 'auto',
              boxSizing: 'border-box',
            }}
          >
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
}
