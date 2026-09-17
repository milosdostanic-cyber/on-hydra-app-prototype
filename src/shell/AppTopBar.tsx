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
  hydraBaseStrong,
  hydraLargeNormal,
  hydraTextStyleToReactCss,
  hydraTitleHeading3,
  hydraTitleHeading5,
} from '../theme/hydraTypography';
import { Avatar, Button, Dropdown, Flex, List, Modal, Switch, Typography, theme } from '../ui/antd';
import type { MenuProps } from '../ui/antd';
import { useActiveProject } from '../context/ActiveProjectContext';
import { useActionTrail } from '../context/ActionTrailContext';
import { isSpecModulePath } from '../spec/specNavigation';
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
  if (isSpecModulePath(pathname)) {
    return {
      title: 'SPEC',
      subtitle: 'Analyze and rewrite project specifications',
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
      title: 'Part Search',
      subtitle: 'Catalog browse — pick a project when you download or package an item',
    };
  }
  if (pathname.startsWith('/seisbrace')) {
    return {
      title: 'SeisBrace',
      subtitle: 'Seismic brace designs and calculations',
    };
  }
  if (pathname.startsWith('/revit-plugin')) {
    return {
      title: 'Revit Plug-in',
      subtitle: 'Download, install, and support for the Revit plug-in',
    };
  }
  if (pathname.startsWith('/knowledge-center')) {
    return {
      title: 'Knowledge Center',
      subtitle: 'Documentation, guides, and shared resources',
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
                <Typography.Text style={hydraTextStyleToReactCss(noProjectSelected ? hydraBaseStrong : hydraBaseNormal)}>No project selected</Typography.Text>
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
                  <Typography.Text style={hydraTextStyleToReactCss(isActive ? hydraBaseStrong : hydraBaseNormal)}>{row.name}</Typography.Text>
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
 * Primary brand strip — contextual title/subtitle for Home, project workspace, and modules.
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
        gap={token.paddingMD}
        style={{
          width: '100%',
          boxSizing: 'border-box',
          paddingInline: token.paddingLG,
          paddingBlock: token.padding,
          background: token.colorPrimary,
        }}
      >
        <Flex
          vertical
          gap={token.paddingXXS}
          style={{ flex: 1, minWidth: 0 }}
        >
          <Typography.Text
            style={{
              ...hydraTextStyleToReactCss(hydraTitleHeading3),
              color: onPrimary,
              margin: 0,
            }}
          >
            {title}
          </Typography.Text>
          <Typography.Text
            style={{
              ...hydraTextStyleToReactCss(hydraTitleHeading5),
              color: onPrimary,
              margin: 0,
              opacity: 0.65,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {subtitle}
          </Typography.Text>
        </Flex>

        <Flex
          align="center"
          justify="flex-end"
          gap={token.paddingXL}
          style={{ flex: 1, minWidth: 0 }}
        >
          <Flex align="center" gap={token.paddingSM} style={{ flexShrink: 0 }}>
            <Typography.Text
              style={{ ...hydraTextStyleToReactCss(hydraLargeNormal), color: onPrimary }}
            >
              Project:
            </Typography.Text>
            <Button
              type="primary"
              size="large"
              icon={<FolderOpenOutlined />}
              onClick={() => setSwitchOpen(true)}
            >
              <Flex align="center" gap={token.paddingXS}>
                <span
                  style={{
                    maxWidth: 200,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {project?.name ?? 'Select project'}
                </span>
                <SwapOutlined aria-hidden />
              </Flex>
            </Button>
          </Flex>

          <Flex align="center" gap={token.paddingXS} style={{ flexShrink: 0 }}>
            <Button
              type="text"
              icon={<QuestionCircleOutlined />}
              aria-label="Help"
              styles={{ icon: { color: onPrimary, fontSize: token.sizeMS } }}
              style={shellControlBtnStyle(onPrimary)}
            />
            <Button
              type="text"
              icon={<BellOutlined />}
              aria-label="Notifications"
              styles={{ icon: { color: onPrimary, fontSize: token.sizeMS } }}
              style={shellControlBtnStyle(onPrimary)}
            />
            <Dropdown menu={{ items: userMenuItems }} trigger={['click']}>
              <Flex
                align="center"
                gap={token.paddingXS}
                role="button"
                tabIndex={0}
                aria-label="Account menu"
                style={{ cursor: 'pointer' }}
              >
                <Avatar icon={<UserOutlined aria-hidden />} />
                <DownOutlined style={{ color: onPrimary, fontSize: token.fontSize }} />
              </Flex>
            </Dropdown>
          </Flex>
        </Flex>
      </Flex>

      <SwitchProjectModal open={switchOpen} onClose={() => setSwitchOpen(false)} />
    </>
  );
}
