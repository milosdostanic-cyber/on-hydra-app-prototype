import {
  BellOutlined,
  DownOutlined,
  QuestionCircleOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import type { CSSProperties } from 'react';

import { hydraTextStyleToReactCss, hydraTitleHeading3 } from '../theme/hydraTypography';
import { shellLayout } from '../theme/hydraAlias';
import { Avatar, Badge, Button, Dropdown, Flex, Typography, theme } from '../ui/antd';
import type { MenuProps } from '../ui/antd';

const userMenuItems: MenuProps['items'] = [
  { key: 'profile', label: 'Profile' },
  { key: 'settings', label: 'Settings' },
  { type: 'divider' },
  { key: 'signout', label: 'Sign out' },
];

const shellControlBtnStyle = (color: string): CSSProperties => ({
  color,
});

/**
 * Primary brand strip above the main shell header (design node `742:79090`). Typography and spacing from
 * `hydraTypography` + `theme.useToken()` only.
 */
export function AppTopBar() {
  const { token } = theme.useToken();
  const onPrimary = token.colorTextLightSolid;

  return (
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
      <Flex align="center" gap={token.marginSM} wrap="wrap" style={{ minWidth: 0 }}>
        <Typography.Text
          style={{
            ...hydraTextStyleToReactCss(hydraTitleHeading3),
            color: onPrimary,
            margin: 0,
          }}
        >
          BOM
        </Typography.Text>
      </Flex>

      <Flex align="center" gap={token.marginXS} style={{ flexShrink: 0 }}>
        <Button
          type="text"
          icon={<SettingOutlined />}
          aria-label="Settings"
          styles={{ icon: { color: onPrimary } }}
          style={shellControlBtnStyle(onPrimary)}
        />
        <Button
          type="text"
          icon={<QuestionCircleOutlined />}
          aria-label="Help"
          styles={{ icon: { color: onPrimary } }}
          style={shellControlBtnStyle(onPrimary)}
        />
        <Badge count={99}>
          <Button
            type="text"
            icon={<BellOutlined />}
            aria-label="Notifications"
            styles={{ icon: { color: onPrimary } }}
            style={shellControlBtnStyle(onPrimary)}
          />
        </Badge>
        <Flex align="center" gap={token.marginXXS}>
          <Avatar style={{ background: token.colorBgContainer, color: token.colorPrimary }}>U</Avatar>
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
  );
}
