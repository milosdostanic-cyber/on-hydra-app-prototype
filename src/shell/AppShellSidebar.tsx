import {
  BarChartOutlined,
  CalculatorOutlined,
  FileTextOutlined,
  HomeOutlined,
  InboxOutlined,
  LeftOutlined,
  ReadOutlined,
  RightOutlined,
  UnorderedListOutlined,
} from '@ant-design/icons';
import { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { useHydraColorMode } from '../context/HydraThemeContext';
import { shellLayout } from '../theme/hydraAlias';
import {
  hydraMenuItemBorderRadius,
  hydraSidebarCollapseTriggerTopPx,
} from '../theme/hydraMenuMetrics';
import { sidebarSemanticsFor } from '../theme/sidebarSemantics';
import { Button, Layout, Menu, theme } from '../ui/antd';
import type { MenuProps } from '../ui/antd';

import { ConnectedSidebarBrand } from './ConnectedSidebarBrand';
import { getLastScopedProjectId } from './lastProjectScope';

const { Sider } = Layout;

function primarySideKey(pathname: string): string {
  if (pathname.startsWith('/bom')) return 'bom';
  if (pathname.startsWith('/dashboard')) return 'dash';
  if (pathname.startsWith('/projects')) {
    if (/\/projects\/[^/]+\/seis-brace/.test(pathname)) return 'seis';
    if (/\/projects\/[^/]+\/sales-brace/.test(pathname)) return 'spec';
    if (/\/projects\/[^/]+\/submittal/.test(pathname)) return 'submittal';
    if (/\/projects\/[^/]+\/content/.test(pathname)) return 'content';
    return 'proj';
  }
  return 'dash';
}

export function AppShellSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const { colorMode } = useHydraColorMode();
  const sidebarSurface = sidebarSemanticsFor(colorMode);
  const { token } = theme.useToken();
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems: MenuProps['items'] = useMemo(
    () => [
      { key: 'dash', icon: <HomeOutlined />, label: 'Homepage' },
      { key: 'proj', icon: <BarChartOutlined />, label: 'Projects' },
      { key: 'seis', icon: <CalculatorOutlined />, label: 'SeisBrace' },
      { key: 'spec', icon: <FileTextOutlined />, label: 'Spec' },
      { key: 'submittal', icon: <InboxOutlined />, label: 'Submittal' },
      { key: 'bom', icon: <UnorderedListOutlined />, label: 'BOM' },
      { key: 'content', icon: <ReadOutlined />, label: 'Content' },
    ],
    [],
  );

  const selectedMenuKeys = useMemo(() => [primarySideKey(location.pathname)], [location.pathname]);

  const onMenuClick: MenuProps['onClick'] = ({ key }) => {
    const pid = getLastScopedProjectId();
    const routes: Record<string, string> = {
      dash: '/dashboard',
      proj: '/projects',
      seis: `/projects/${pid}/seis-brace`,
      spec: `/projects/${pid}/sales-brace`,
      submittal: `/projects/${pid}/submittal`,
      bom: '/bom',
      content: `/projects/${pid}/content`,
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
        <div
          style={{
            flex: 1,
            minHeight: 0,
            overflow: 'hidden',
            paddingBlock: token.paddingXXS,
          }}
        >
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
