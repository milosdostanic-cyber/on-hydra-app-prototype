import {
  BellOutlined,
  CheckOutlined,
  DownOutlined,
  FolderOpenOutlined,
  QuestionCircleOutlined,
  SwapOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { useState } from 'react';
import type { CSSProperties } from 'react';
import { useLocation } from 'react-router-dom';

import {
  hydraBaseNormal,
  hydraLargeNormal,
  hydraTextStyleToReactCss,
  hydraTitleHeading3,
  hydraTitleHeading5,
} from '../theme/hydraTypography';
import { shellLayout } from '../theme/hydraAlias';
import { Avatar, Button, Dropdown, Flex, List, Modal, Switch, Typography, theme } from '../ui/antd';
import type { MenuProps } from '../ui/antd';
import { useActiveProject } from '../context/ActiveProjectContext';
import { useActionTrail } from '../context/ActionTrailContext';
import { GlobalSearch } from './GlobalSearch/GlobalSearch';
import { type ProjectRow } from './projectSeed';

const shellControlBtnStyle = (color: string): CSSProperties => ({
  color,
});

type TopBarCopy = { title: string; subtitle: string };

function topBarCopyForPath(pathname: string, activeProjectName?: string): TopBarCopy {
  const companyDashboardFlat = pathname === '/dashboard' || pathname === '/dashboard/';
  const companyDashboardUmbrella = /^\/[^/]+\/dashboard\/?$/.test(pathname);
  const scopedFlat = /^\/projects\/[^/]+\//.test(pathname);
  const scopedUmbrella = /^\/[^/]+\/projects\/[^/]+\//.test(pathname);

  if (companyDashboardFlat || companyDashboardUmbrella) {
    return {
      title: 'ConnectED',
      subtitle: 'Home · recent projects, overview, and job site directory',
    };
  }
  if (scopedFlat || scopedUmbrella) {
    return {
      title: 'ConnectED',
      subtitle: activeProjectName ? `${activeProjectName} · project workspace` : 'Project workspace',
    };
  }
  if (pathname.startsWith('/search')) {
    return {
      title: 'Search',
      subtitle: 'One search across parts, content, submittals, and BOM',
    };
  }
  if (pathname.startsWith('/catalog')) {
    return {
      title: 'Catalog',
      subtitle: 'Global browse — pick a project when you download or package an item',
    };
  }
  if (pathname.startsWith('/projects/reframing-proposal')) {
    return {
      title: 'Project Reframing Proposal',
      subtitle: 'Progressive project commitment — proposed flow & wireframes',
    };
  }
  if (pathname.startsWith('/bom')) {
    return {
      title: 'BOM',
      subtitle: 'Build or convert a Bill of Materials',
    };
  }
  return {
    title: 'ConnectED',
    subtitle: 'ASC Connected',
  };
}

function SwitchProjectModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { token } = theme.useToken();
  const { projectId, projects, setProjectId, clearProjectId } = useActiveProject();
  const noProjectSelected = projectId === null;

  return (
    <Modal
      title="Switch project"
      open={open}
      onCancel={onClose}
      footer={null}
      width={480}
      styles={{ body: { padding: 0 } }}
    >
      <List
        dataSource={[{ key: '__none__' }]}
        renderItem={() => (
          <List.Item
            onClick={() => {
              clearProjectId();
              onClose();
            }}
            style={{
              cursor: 'pointer',
              paddingInline: token.paddingMD,
              background: noProjectSelected ? token.colorFillAlter : undefined,
              borderBottom: `${token.lineWidth}px ${token.lineType} ${token.colorBorderSecondary}`,
            }}
          >
            <Flex align="center" justify="space-between" style={{ width: '100%' }}>
              <Flex vertical gap={2}>
                <Typography.Text strong={noProjectSelected}>No project selected</Typography.Text>
                <Typography.Text type="secondary" style={hydraTextStyleToReactCss(hydraLargeNormal)}>
                  Search and browse without scoping to a job site
                </Typography.Text>
              </Flex>
              {noProjectSelected ? (
                <CheckOutlined style={{ color: token.colorPrimary, flexShrink: 0 }} />
              ) : null}
            </Flex>
          </List.Item>
        )}
      />
      <List<ProjectRow>
        dataSource={projects}
        renderItem={(row) => {
          const isActive = row.key === projectId;
          return (
            <List.Item
              onClick={() => {
                setProjectId(row.key);
                onClose();
              }}
              style={{
                cursor: 'pointer',
                paddingInline: token.paddingMD,
                background: isActive ? token.colorFillAlter : undefined,
                transition: 'background 0.15s',
              }}
              onMouseEnter={(e) =>
                !isActive &&
                ((e.currentTarget as HTMLElement).style.background = token.colorFillTertiary)
              }
              onMouseLeave={(e) =>
                !isActive &&
                ((e.currentTarget as HTMLElement).style.background = 'transparent')
              }
            >
              <Flex align="center" justify="space-between" style={{ width: '100%' }}>
                <Flex vertical gap={2}>
                  <Typography.Text strong={isActive}>{row.name}</Typography.Text>
                  <Typography.Text type="secondary" style={hydraTextStyleToReactCss(hydraLargeNormal)}>
                    {row.city}, {row.state} · Last opened {row.lastOpened}
                  </Typography.Text>
                </Flex>
                {isActive && (
                  <CheckOutlined style={{ color: token.colorPrimary, flexShrink: 0 }} />
                )}
              </Flex>
            </List.Item>
          );
        }}
      />
    </Modal>
  );
}

/**
 * Primary brand strip — contextual title/subtitle on dashboard, workspace, BOM, catalog, and reframing flows.
 */
export function AppTopBar() {
  const { token } = theme.useToken();
  const location = useLocation();
  const { project } = useActiveProject();
  const { enabled: actionTrailEnabled, setEnabled: setActionTrailEnabled, resetActionTrail } = useActionTrail();
  const [switchOpen, setSwitchOpen] = useState(false);
  const onPrimary = token.colorTextLightSolid;

  const userMenuItems: MenuProps['items'] = [
    { key: 'profile', label: 'Profile' },
    {
      key: 'action-trail',
      label: (
        <Flex align="center" justify="space-between" gap={token.marginSM} style={{ minWidth: 200 }}>
          <Typography.Text>Action guidance</Typography.Text>
          <Switch
            size="small"
            checked={actionTrailEnabled}
            onChange={setActionTrailEnabled}
            onClick={(_, e) => e.stopPropagation()}
            aria-label="Toggle action guidance"
          />
        </Flex>
      ),
    },
    {
      key: 'action-trail-clear',
      label: 'Clear guidance trail',
      onClick: () => resetActionTrail(),
    },
    { key: 'settings', label: 'Settings' },
    { type: 'divider' },
    { key: 'signout', label: 'Sign out' },
  ];

  const { title, subtitle } = topBarCopyForPath(location.pathname, project?.name);

  return (
    <>
      <Flex
        align="center"
        justify="space-between"
        gap={token.marginLG}
        wrap="wrap"
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
        <Flex
          align="center"
          gap={token.marginMD}
          wrap="wrap"
          style={{ flex: '0 1 360px', minWidth: 0 }}
        >
          <Typography.Text
            style={{
              ...hydraTextStyleToReactCss(hydraTitleHeading3),
              color: onPrimary,
              margin: 0,
              minWidth: 0,
            }}
          >
            {title}
          </Typography.Text>
          <Typography.Text
            style={{
              ...hydraTextStyleToReactCss(hydraBaseNormal),
              color: onPrimary,
              margin: 0,
              maxWidth: 320,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {subtitle}
          </Typography.Text>
        </Flex>

        <GlobalSearch />

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

      <SwitchProjectModal open={switchOpen} onClose={() => setSwitchOpen(false)} />
    </>
  );
}
