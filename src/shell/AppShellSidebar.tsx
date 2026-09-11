import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import { useMemo, useState, type ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { useHydraColorMode } from '../context/HydraThemeContext';
import {
  resolveActiveConstructionProjectId,
  useActiveProject,
} from '../context/ActiveProjectContext';
import { ActionTrailMenuGuidanceTag } from '../search/components/ActionTrailMenuGuidanceTag';
import { shellLayout } from '../theme/hydraAlias';
import {
  hydraMenuItemBorderRadius,
  hydraSidebarCollapseTriggerTopPx,
} from '../theme/hydraMenuMetrics';
import { sidebarSemanticsFor } from '../theme/sidebarSemantics';
import { Button, ConfigProvider, Flex, Layout, Menu, theme } from '../ui/antd';
import type { MenuProps } from '../ui/antd';

import { ConnectedSidebarBrand } from './ConnectedSidebarBrand';
import {
  BomNavIcon,
  ContentNavIcon,
  HomeNavIcon,
  KnowledgeCenterNavIcon,
  PartSearchNavIcon,
  RevitNavIcon,
  SeizBraceNavIcon,
  SpecNavIcon,
  SubmittalManagerNavIcon,
} from './sidebarNavIcons';
import { getLastScopedProjectId, setLastScopedProjectId } from './lastProjectScope';
import { productCatalogHomePath } from '../catalog/productCatalogNavigation';

const { Sider } = Layout;

function primarySideKey(pathname: string): string {
  if (pathname.startsWith('/search')) return 'part-search';
  if (pathname.startsWith('/catalog')) return 'part-search';
  if (/\/projects\/[^/]+\/catalog(\/|$)/.test(pathname)) return 'part-search';
  if (pathname.startsWith('/bom')) return 'bom';
  if (pathname.startsWith('/seisbrace')) return 'seis';
  if (pathname.startsWith('/spec')) return 'spec';
  if (pathname.startsWith('/revit-plugin')) return 'revit-plugin';
  if (pathname.startsWith('/knowledge-center')) return 'knowledge-center';
  if (pathname.startsWith('/dashboard')) return 'dash';
  if (pathname.startsWith('/projects')) {
    if (pathname === '/projects' || pathname === '/projects/') return 'dash';
    if (/\/projects\/[^/]+\/spec(\/|$)/.test(pathname)) return 'spec';
    if (/\/projects\/[^/]+\/seis-brace/.test(pathname)) return 'seis';
    if (/\/projects\/[^/]+\/submittal/.test(pathname)) return 'submittal';
    if (/\/projects\/[^/]+\/content/.test(pathname)) return 'content';
    return 'dash';
  }
  return 'dash';
}

/** Spec omitted until Add to Spec action ships (no registerEntry yet). */
const TRAIL_MENU_KEYS = new Set(['bom', 'submittal', 'content']);

function trailMenuItem(
  key: string,
  icon: ReactNode,
  labelText: string,
  collapsed: boolean,
  token: ReturnType<typeof theme.useToken>['token'],
): NonNullable<MenuProps['items']>[number] {
  const isTrail = TRAIL_MENU_KEYS.has(key);

  if (!isTrail) {
    return { key, icon, label: labelText };
  }

  if (collapsed) {
    return {
      key,
      icon: <ActionTrailMenuGuidanceTag menuKey={key} variant="icon">{icon}</ActionTrailMenuGuidanceTag>,
      label: labelText,
    };
  }

  return {
    key,
    icon,
    label: (
      <Flex align="center" gap={token.marginXS} style={{ width: '100%' }}>
        <span style={{ flex: '1 1 auto', minWidth: 0 }}>{labelText}</span>
        <ActionTrailMenuGuidanceTag menuKey={key} variant="inline" />
      </Flex>
    ),
  };
}

export function AppShellSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const { colorMode } = useHydraColorMode();
  const sidebarSurface = sidebarSemanticsFor(colorMode);
  const { token } = theme.useToken();
  const location = useLocation();
  const navigate = useNavigate();
  const { projectId: activeProjectId, setProjectId } = useActiveProject();

  const primaryMenuItems: MenuProps['items'] = useMemo(
    () => [
      { key: 'dash', icon: <HomeNavIcon />, label: 'Home' },
      { key: 'part-search', icon: <PartSearchNavIcon />, label: 'Part Search' },
      trailMenuItem('content', <ContentNavIcon />, 'Content', collapsed, token),
      trailMenuItem('bom', <BomNavIcon />, 'BOM', collapsed, token),
      { key: 'spec', icon: <SpecNavIcon />, label: 'Spec' },
      { key: 'seis', icon: <SeizBraceNavIcon />, label: 'SeisBrace' },
      trailMenuItem('submittal', <SubmittalManagerNavIcon />, 'Submittal Manager', collapsed, token),
      { key: 'revit-plugin', icon: <RevitNavIcon />, label: 'Revit Plug-in' },
      { key: 'knowledge-center', icon: <KnowledgeCenterNavIcon />, label: 'Knowledge Center' },
    ],
    [collapsed, token],
  );

  const selectedMenuKeys = useMemo(() => [primarySideKey(location.pathname)], [location.pathname]);

  const onMenuClick: MenuProps['onClick'] = ({ key }) => {
    const scopedProjectId = resolveActiveConstructionProjectId(
      activeProjectId ?? getLastScopedProjectId(),
    );
    // Part Search landing = product catalog (cover + Featured Parts + Categories). Always
    // resolve a construction project — bare `/catalog` is the older search-first home.
    const routes: Record<string, string> = {
      dash: '/dashboard',
      'part-search': productCatalogHomePath(scopedProjectId),
      content: `/projects/${scopedProjectId}/content`,
      bom: '/bom',
      spec: `/projects/${scopedProjectId}/spec`,
      seis: '/seisbrace',
      submittal: `/projects/${scopedProjectId}/submittal`,
      'revit-plugin': '/revit-plugin',
      'knowledge-center': '/knowledge-center',
    };
    const path = routes[key];
    if (!path) return;
    if (key === 'content' || key === 'spec' || key === 'submittal' || key === 'part-search') {
      setProjectId(scopedProjectId);
      setLastScopedProjectId(scopedProjectId);
    }
    navigate(path);
  };

  return (
    <Sider
      collapsible
      collapsed={collapsed}
      onCollapse={setCollapsed}
      trigger={null}
      theme="dark"
      width={shellLayout.siderWidth}
      collapsedWidth={shellLayout.siderCollapsedWidth}
      style={{
        background: sidebarSurface.colorSidebar,
        borderInlineEnd: `${token.lineWidth}px ${token.lineType} ${token.colorSplit}`,
        alignSelf: 'stretch',
        overflow: 'hidden',
        position: 'relative',
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
            paddingInline: collapsed ? token.paddingSM : token.paddingMD,
            justifyContent: collapsed ? 'center' : 'flex-start',
            background: sidebarSurface.colorSidebarHeader,
          }}
        >
          <ConnectedSidebarBrand collapsed={collapsed} />
        </div>
        {/**
         * Figma menu band: `paddingSM` above the first row and an 8px gap between rows. antd collapses the
         * item's `marginBlock`, so the 8px lives on the item and the band keeps the remaining `paddingXXS`.
         */}
        <div style={{ flex: 1, minHeight: 0, overflow: 'hidden', paddingBlock: token.paddingXXS }}>
          {/* Figma sidebar rows sit at `paddingLG` inset with a 16px icon — wider than the DS `Menu` default. */}
          <ConfigProvider
            theme={{
              components: {
                Menu: {
                  itemPaddingInline: token.paddingLG,
                  iconMarginInlineEnd: token.paddingXS,
                  iconSize: token.sizeMS,
                  itemMarginBlock: token.paddingXS,
                },
              },
            }}
          >
            <Menu
              theme="dark"
              mode="inline"
              inlineCollapsed={collapsed}
              selectedKeys={selectedMenuKeys}
              items={primaryMenuItems}
              onClick={onMenuClick}
              style={{ borderInlineEnd: 'none', background: 'transparent' }}
              styles={{
                item: { borderRadius: hydraMenuItemBorderRadius },
              }}
            />
          </ConfigProvider>
        </div>
      </div>
      <Button
        type="text"
        aria-expanded={!collapsed}
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        onClick={() => setCollapsed((c) => !c)}
        icon={collapsed ? <RightOutlined /> : <LeftOutlined />}
        styles={{ icon: { fontSize: token.sizeMS } }}
        style={{
          position: 'absolute',
          top: hydraSidebarCollapseTriggerTopPx,
          /** Figma overlaps the sider's 1px right border so the tab sits flush with the content edge. */
          right: -token.lineWidth,
          zIndex: 2,
          height: token.controlHeightSM,
          minWidth: token.controlHeightSM,
          paddingInline: token.marginXXS,
          paddingBlock: token.paddingXXS,
          background: sidebarSurface.colorSidebar,
          color: token.colorTextLightSolid,
          borderStartStartRadius: token.borderRadiusSM,
          borderEndStartRadius: token.borderRadiusSM,
          borderStartEndRadius: 0,
          borderEndEndRadius: 0,
          boxShadow: token.boxShadow,
        }}
      />
    </Sider>
  );
}
