import {
  BookOutlined,
  BuildOutlined,
  CalculatorOutlined,
  FileTextOutlined,
  HomeOutlined,
  InboxOutlined,
  LeftOutlined,
  RightOutlined,
  ReadOutlined,
  SearchOutlined,
  UnorderedListOutlined,
} from '@ant-design/icons';
import { useMemo, useState, type ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { useHydraColorMode } from '../context/HydraThemeContext';
import { ActionTrailMenuGuidanceTag } from '../search/components/ActionTrailMenuGuidanceTag';
import { shellLayout } from '../theme/hydraAlias';
import {
  hydraMenuItemBorderRadius,
  hydraSidebarCollapseTriggerTopPx,
} from '../theme/hydraMenuMetrics';
import { sidebarSemanticsFor } from '../theme/sidebarSemantics';
import { Button, Flex, Layout, Menu, theme } from '../ui/antd';
import type { MenuProps } from '../ui/antd';

import { ConnectedSidebarBrand } from './ConnectedSidebarBrand';
import { getLastScopedProjectId } from './lastProjectScope';

const { Sider } = Layout;

function primarySideKey(pathname: string): string {
  if (pathname.startsWith('/search')) return 'part-search';
  if (pathname.startsWith('/catalog')) return 'part-search';
  if (/\/projects\/[^/]+\/catalog(\/|$)/.test(pathname)) return 'part-search';
  if (pathname.startsWith('/bom')) return 'bom';
  if (pathname.startsWith('/seisbrace')) return 'seis';
  if (pathname.startsWith('/revit-plugin')) return 'revit-plugin';
  if (pathname.startsWith('/knowledge-center')) return 'knowledge-center';
  if (pathname.startsWith('/dashboard')) return 'dash';
  if (pathname.startsWith('/projects')) {
    if (pathname === '/projects' || pathname === '/projects/') return 'dash';
    if (/\/projects\/[^/]+\/seis-brace/.test(pathname)) return 'seis';
    if (/\/projects\/[^/]+\/sales-brace/.test(pathname)) return 'spec';
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

  const primaryMenuItems: MenuProps['items'] = useMemo(
    () => [
      { key: 'dash', icon: <HomeOutlined />, label: 'Home' },
      { key: 'part-search', icon: <SearchOutlined />, label: 'Part Search' },
      trailMenuItem('content', <ReadOutlined />, 'Content', collapsed, token),
      trailMenuItem('bom', <UnorderedListOutlined />, 'BOM', collapsed, token),
      { key: 'spec', icon: <FileTextOutlined />, label: 'Spec' },
      { key: 'seis', icon: <CalculatorOutlined />, label: 'SeisBrace' },
      trailMenuItem('submittal', <InboxOutlined />, 'Submittal Manager', collapsed, token),
      { key: 'revit-plugin', icon: <BuildOutlined />, label: 'Revit Plug-in' },
      { key: 'knowledge-center', icon: <BookOutlined />, label: 'Knowledge Center' },
    ],
    [collapsed, token],
  );

  const selectedMenuKeys = useMemo(() => [primarySideKey(location.pathname)], [location.pathname]);

  const onMenuClick: MenuProps['onClick'] = ({ key }) => {
    const pid = getLastScopedProjectId();
    const projectScoped =
      key === 'spec' || key === 'submittal' || key === 'content' || key === 'bom' || key === 'seis';
    if (projectScoped && !pid) {
      navigate('/dashboard');
      return;
    }
    const routes: Record<string, string> = {
      dash: '/dashboard',
      'part-search': pid ? `/projects/${pid}/catalog` : '/catalog',
      content: `/projects/${pid}/content`,
      bom: '/bom',
      spec: `/projects/${pid}/sales-brace`,
      seis: '/seisbrace',
      submittal: `/projects/${pid}/submittal`,
      'revit-plugin': '/revit-plugin',
      'knowledge-center': '/knowledge-center',
    };
    const path = routes[key];
    if (path) navigate(path);
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
            borderBottom: `${token.lineWidth}px ${token.lineType} ${token.colorSplit}`,
          }}
        >
          <ConnectedSidebarBrand collapsed={collapsed} />
        </div>
        <div style={{ flex: 1, minHeight: 0, overflow: 'hidden', paddingBlock: token.paddingXXS }}>
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
        </div>
      </div>
      <Button
        type="text"
        aria-expanded={!collapsed}
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        onClick={() => setCollapsed((c) => !c)}
        icon={collapsed ? <RightOutlined /> : <LeftOutlined />}
        style={{
          position: 'absolute',
          top: hydraSidebarCollapseTriggerTopPx,
          right: 0,
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
          boxShadow: token.boxShadowTertiary,
        }}
      />
    </Sider>
  );
}
