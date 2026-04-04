import {
  DashboardOutlined,
  FolderOpenOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  SettingOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import { useState } from 'react';

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
import type { MenuProps } from '../ui/antd';

const { Header, Sider, Content } = Layout;

const menuItems: MenuProps['items'] = [
  { key: 'dash', icon: <DashboardOutlined />, label: 'Dashboard' },
  { key: 'proj', icon: <FolderOpenOutlined />, label: 'Projects' },
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
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const { token } = theme.useToken();

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
          defaultSelectedKeys={['dash']}
          defaultOpenKeys={['team']}
          items={menuItems}
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
            <Breadcrumb items={[{ title: 'App' }, { title: 'Projects' }]} />
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
          {children}
        </Content>
      </Layout>
    </Layout>
  );
}
