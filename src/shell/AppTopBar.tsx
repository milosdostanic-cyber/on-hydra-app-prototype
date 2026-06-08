import {
  BellOutlined,
  DownOutlined,
  FolderOpenOutlined,
  QuestionCircleOutlined,
  SwapOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { useState } from 'react';
import type { CSSProperties } from 'react';
import { useLocation } from 'react-router-dom';

import { useActiveProject } from '../context/ActiveProjectContext';
import {
  hydraBaseNormal,
  hydraTextStyleToReactCss,
  hydraTitleHeading3,
  hydraTitleHeading5,
} from '../theme/hydraTypography';
import { shellLayout } from '../theme/hydraAlias';
import { Avatar, Button, Dropdown, Flex, Typography, theme } from '../ui/antd';
import type { MenuProps } from '../ui/antd';
import { ConstructionProjectSwitcherModal } from './ConstructionProjectSwitcherModal';

const userMenuItems: MenuProps['items'] = [
  { key: 'profile', label: 'Profile' },
  { key: 'settings', label: 'Settings' },
  { type: 'divider' },
  { key: 'signout', label: 'Sign out' },
];

const shellControlBtnStyle = (color: string): CSSProperties => ({
  color,
});

function topBarTitleAndSubtitle(pathname: string): { title: string; subtitle: string } {
  if (/^\/projects\/[^/]+\/content(\/|$)/.test(pathname)) {
    return {
      title: 'Content',
      subtitle: 'Product catalog, parts, and BIM-ready content',
    };
  }
  if (pathname.startsWith('/bom')) {
    return {
      title: 'BOM',
      subtitle: 'Build or Convert a Bill of Materials',
    };
  }
  return {
    title: 'BOM',
    subtitle: 'Build or Convert a Bill of Materials',
  };
}

/**
 * Primary brand strip (BOM SPEC ASC Connected v2). Title + subtitle on primary bar; utilities match frame
 * (help, notifications, account). Typography from `hydraTypography` + `theme.useToken()` only.
 */
export function AppTopBar() {
  const { token } = theme.useToken();
  const { pathname } = useLocation();
  const { project } = useActiveProject();
  const [switchOpen, setSwitchOpen] = useState(false);
  const onPrimary = token.colorTextLightSolid;
  const { title: topTitle, subtitle: topSubtitle } = topBarTitleAndSubtitle(pathname);

  return (
    <>
      <Flex
        align="center"
        justify="space-between"
        style={{
          width: '100%',
          boxSizing: 'border-box',
          minHeight: shellLayout.headerHeight,
          paddingInline: token.paddingLG,
          paddingBlock: token.paddingSM,
          background: token.colorPrimary,
          borderBottom: `${token.lineWidth}px ${token.lineType} ${token.colorPrimaryActive}`,
        }}
      >
        <Flex align="center" gap={token.marginMD} wrap="wrap" style={{ minWidth: 0 }}>
          <Typography.Text
            style={{
              ...hydraTextStyleToReactCss(hydraTitleHeading3),
              color: onPrimary,
              margin: 0,
            }}
          >
            {topTitle}
          </Typography.Text>
          <Typography.Text
            style={{
              ...hydraTextStyleToReactCss(hydraBaseNormal),
              color: onPrimary,
              margin: 0,
            }}
          >
            {topSubtitle}
          </Typography.Text>
        </Flex>

        <Flex align="center" gap={token.marginSM} style={{ flexShrink: 0 }}>
          <Button
            type="text"
            icon={<FolderOpenOutlined />}
            onClick={() => setSwitchOpen(true)}
            style={{
              color: onPrimary,
              display: 'flex',
              alignItems: 'center',
              gap: token.marginXXS,
              paddingInline: token.paddingSM,
            }}
          >
            <Flex align="center" gap={token.marginXS}>
              <Typography.Text
                style={{
                  ...hydraTextStyleToReactCss(hydraBaseNormal),
                  color: onPrimary,
                  maxWidth: 200,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {project?.name ?? 'No project'}
              </Typography.Text>
              <SwapOutlined style={{ color: onPrimary, fontSize: hydraTitleHeading5.fontSize }} />
            </Flex>
          </Button>

          <Button
            type="text"
            icon={<QuestionCircleOutlined />}
            aria-label="Help"
            styles={{ icon: { color: onPrimary } }}
            style={shellControlBtnStyle(onPrimary)}
          />
          <Button
            type="text"
            icon={<BellOutlined />}
            aria-label="Notifications"
            styles={{ icon: { color: onPrimary } }}
            style={shellControlBtnStyle(onPrimary)}
          />
          <Flex align="center" gap={token.marginXXS}>
            <Avatar
              style={{ background: token.colorBgContainer, color: token.colorPrimary }}
              icon={<UserOutlined aria-hidden />}
            />
            <Dropdown menu={{ items: userMenuItems }} trigger={['click']}>
              <Button
                type="text"
                icon={<DownOutlined />}
                aria-label="Account menu"
                styles={{ icon: { color: onPrimary } }}
                style={shellControlBtnStyle(onPrimary)}
              />
            </Dropdown>
          </Flex>
        </Flex>
      </Flex>

      <ConstructionProjectSwitcherModal open={switchOpen} onClose={() => setSwitchOpen(false)} />
    </>
  );
}
