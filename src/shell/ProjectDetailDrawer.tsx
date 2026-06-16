import {
  AppstoreOutlined,
  ArrowRightOutlined,
  EnvironmentOutlined,
  FilePdfOutlined,
  FolderOpenOutlined,
  GlobalOutlined,
  UnorderedListOutlined,
} from '@ant-design/icons';
import { useState } from 'react';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

import { shellLayout } from '../theme/hydraAlias';
import {
  hydraLargeNormal,
  hydraLargeStrong,
  hydraTextStyleToReactCss,
  hydraTitleHeading5,
} from '../theme/hydraTypography';
import { Button, Card, Divider, Drawer, Flex, Space, Tag, Typography, theme } from '../ui/antd';
import type { ProjectRow } from './projectSeed';

type Props = {
  project: ProjectRow | null;
  open: boolean;
  onClose: () => void;
};

const DRAWER_WIDTH = Math.max(520, shellLayout.siderWidth * 2);

type ModuleLink = {
  key: string;
  label: string;
  description: string;
  icon: ReactNode;
  getPath: (projectId: string) => string;
};

const PROJECT_MODULES: ModuleLink[] = [
  {
    key: 'content',
    label: 'Download Center',
    description: 'Browse downloads and manage your download history',
    icon: <FolderOpenOutlined />,
    getPath: (id) => `/projects/${id}/content`,
  },
  {
    key: 'submittal',
    label: 'Submittal Manager',
    description: 'Build and manage submittals for this project',
    icon: <FilePdfOutlined />,
    getPath: (id) => `/projects/${id}/submittal`,
  },
  {
    key: 'seis-brace',
    label: 'SeisBrace',
    description: 'Design names and braces for this project',
    icon: <AppstoreOutlined />,
    getPath: (id) => `/projects/${id}/seis-brace`,
  },
  {
    key: 'bom',
    label: 'BOM',
    description: 'Build or convert a Bill of Materials',
    icon: <UnorderedListOutlined />,
    getPath: () => '/bom',
  },
];

function outlineInteractiveCardStyle(
  token: ReturnType<typeof theme.useToken>['token'],
  hoveredKey: string | null,
  rowKey: string,
) {
  const isHover = hoveredKey === rowKey;
  return {
    background: token.colorBgContainer,
    borderRadius: token.borderRadiusLG,
    border: `${token.lineWidth}px ${token.lineType} ${
      isHover ? token.colorPrimaryBorderHover : token.colorBorderSecondary
    }`,
    boxShadow: 'none' as const,
    cursor: 'pointer' as const,
    transition: `border-color ${token.motionDurationMid}`,
  };
}

export function ProjectDetailDrawer({ project, open, onClose }: Props) {
  const { token } = theme.useToken();
  const navigate = useNavigate();
  const [hoveredKey, setHoveredKey] = useState<string | null>(null);

  if (!project) return null;

  function goTo(path: string) {
    onClose();
    navigate(path);
  }

  return (
    <Drawer
      title={null}
      placement="right"
      width={DRAWER_WIDTH}
      open={open}
      onClose={onClose}
      afterOpenChange={(nextOpen) => {
        if (!nextOpen) setHoveredKey(null);
      }}
      styles={{
        body: { padding: 0 },
        header: { display: 'none' },
      }}
    >
      <Flex vertical style={{ height: '100%' }}>
        <div
          style={{
            padding: token.paddingLG,
            paddingBottom: token.paddingMD,
            background: token.colorBgContainer,
            borderBottom: `${token.lineWidth}px ${token.lineType} ${token.colorBorderSecondary}`,
          }}
        >
          <Flex justify="space-between" align="flex-start" gap={token.marginMD}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <Typography.Title level={4} style={{ margin: 0 }}>
                {project.name}
              </Typography.Title>
              <Flex align="center" gap={token.marginXS} style={{ marginTop: token.marginXS }}>
                <EnvironmentOutlined style={{ color: token.colorTextSecondary }} />
                <Typography.Text type="secondary">
                  {project.address}, {project.city}, {project.state}
                </Typography.Text>
              </Flex>
              <Flex gap={token.marginXS} style={{ marginTop: token.marginSM }}>
                <Tag color="blue">Active</Tag>
                <Typography.Text type="secondary" style={hydraTextStyleToReactCss(hydraLargeNormal)}>
                  Last opened {project.lastOpened}
                </Typography.Text>
              </Flex>
            </div>
          </Flex>
        </div>

        <div
          style={{
            flex: 1,
            overflow: 'auto',
            padding: token.paddingLG,
          }}
        >
          <Typography.Text
            strong
            type="secondary"
            style={{
              ...hydraTextStyleToReactCss(hydraLargeStrong),
              textTransform: 'uppercase',
              letterSpacing: 0.5,
            }}
          >
            Open with this project
          </Typography.Text>

          <Space
            direction="vertical"
            size={token.marginSM}
            style={{ width: '100%', marginTop: token.marginMD }}
          >
            {PROJECT_MODULES.map((mod) => (
              <Card
                key={mod.key}
                size="small"
                style={outlineInteractiveCardStyle(token, hoveredKey, mod.key)}
                styles={{
                  body: { padding: token.paddingMD },
                }}
                onClick={() => goTo(mod.getPath(project.key))}
                onMouseEnter={() => setHoveredKey(mod.key)}
                onMouseLeave={() => setHoveredKey(null)}
              >
                <Flex align="center" justify="space-between" gap={token.marginMD}>
                  <Flex align="center" gap={token.marginMD} style={{ flex: 1, minWidth: 0 }}>
                    <Flex
                      align="center"
                      justify="center"
                      style={{
                        width: token.controlHeightLG,
                        height: token.controlHeightLG,
                        borderRadius: token.borderRadiusSM,
                        background: token.colorFillAlter,
                        fontSize: hydraTitleHeading5.fontSize,
                        color: token.colorPrimary,
                        flexShrink: 0,
                      }}
                    >
                      {mod.icon}
                    </Flex>
                    <div style={{ minWidth: 0 }}>
                      <Typography.Text strong>{mod.label}</Typography.Text>
                      <br />
                      <Typography.Text type="secondary" style={hydraTextStyleToReactCss(hydraLargeNormal)}>
                        {mod.description}
                      </Typography.Text>
                    </div>
                  </Flex>
                  <ArrowRightOutlined style={{ color: token.colorTextTertiary, flexShrink: 0 }} />
                </Flex>
              </Card>
            ))}
          </Space>

          <Divider style={{ margin: `${token.marginLG}px 0` }} />

          <Typography.Text
            strong
            type="secondary"
            style={{
              ...hydraTextStyleToReactCss(hydraLargeStrong),
              textTransform: 'uppercase',
              letterSpacing: 0.5,
            }}
          >
            Or without a project
          </Typography.Text>

          <Card
            size="small"
            style={{
              ...outlineInteractiveCardStyle(token, hoveredKey, 'catalog'),
              marginTop: token.marginMD,
            }}
            styles={{
              body: { padding: token.paddingMD },
            }}
            onClick={() => goTo('/catalog')}
            onMouseEnter={() => setHoveredKey('catalog')}
            onMouseLeave={() => setHoveredKey(null)}
          >
            <Flex align="center" justify="space-between" gap={token.marginMD}>
              <Flex align="center" gap={token.marginMD} style={{ flex: 1, minWidth: 0 }}>
                <Flex
                  align="center"
                  justify="center"
                  style={{
                    width: token.controlHeightLG,
                    height: token.controlHeightLG,
                    borderRadius: token.borderRadiusSM,
                    background: token.colorFillAlter,
                    fontSize: hydraTitleHeading5.fontSize,
                    color: token.colorTextSecondary,
                    flexShrink: 0,
                  }}
                >
                  <GlobalOutlined />
                </Flex>
                <div style={{ minWidth: 0 }}>
                  <Typography.Text strong>Browse catalog</Typography.Text>
                  <br />
                  <Typography.Text type="secondary" style={hydraTextStyleToReactCss(hydraLargeNormal)}>
                    Explore products without selecting a project
                  </Typography.Text>
                </div>
              </Flex>
              <ArrowRightOutlined style={{ color: token.colorTextTertiary, flexShrink: 0 }} />
            </Flex>
          </Card>
        </div>

        <div
          style={{
            padding: token.paddingMD,
            paddingInline: token.paddingLG,
            borderTop: `${token.lineWidth}px ${token.lineType} ${token.colorBorderSecondary}`,
            background: token.colorBgContainer,
          }}
        >
          <Flex gap={token.marginSM}>
            <Button type="primary" block onClick={() => goTo(`/projects/${project.key}/content`)}>
              Open full workspace
            </Button>
            <Button block onClick={onClose}>
              Close
            </Button>
          </Flex>
        </div>
      </Flex>
    </Drawer>
  );
}
