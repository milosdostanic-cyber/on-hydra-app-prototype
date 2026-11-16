import { MenuOutlined, ProfileOutlined } from '@ant-design/icons';
import type { CSSProperties, ReactNode } from 'react';
import { useState } from 'react';

import { shellLayout } from '../../theme/hydraAlias';
import { Button, Drawer, Flex, Grid, theme } from '../../ui/antd';
import { useSpecScrollFit } from '../hooks/useSpecScrollFit';

/**
 * G1 — three-region analyzer shell.
 * Below `lg`, left/right become Drawers. Widths come from shellLayout tokens (no ad-hoc px).
 *
 * On `lg` and up the workspace fills the remaining shell height, so the section
 * rail and the recommendation rail stay in place while only the document column
 * scrolls. Regions scroll independently instead of pushing the page down.
 */
export function SpecWorkspaceRegions({
  left,
  center,
  right,
  leftTitle = 'Sections',
  rightTitle = 'Analysis',
  minHeight = shellLayout.contentMinHeight,
  embeddedSidePanels = false,
  fillParent = false,
}: {
  left: ReactNode;
  center: ReactNode;
  right: ReactNode;
  leftTitle?: string;
  rightTitle?: string;
  /** Smallest workable workspace — below this the page scrolls instead. */
  minHeight?: number;
  /** Side rails fill column height with internal scroll (review workspace). */
  embeddedSidePanels?: boolean;
  /** Fill a parent that already owns remaining viewport height (page header + banners above). */
  fillParent?: boolean;
}) {
  const { token } = theme.useToken();
  const screens = Grid.useBreakpoint();
  const isLg = Boolean(screens.lg);
  const [leftOpen, setLeftOpen] = useState(false);
  const [rightOpen, setRightOpen] = useState(false);
  const [workspaceRef, scrollFit] = useSpecScrollFit();

  const leftWidth = shellLayout.siderWidth;
  const rightWidth = shellLayout.siderWidth + token.paddingXL * 4;
  // Match the visible shell area so both rails stay fully on screen. On viewports
  // too short for a usable workspace, keep the page scroll instead.
  const measuredHeight =
    (scrollFit.fillHeight ?? 0) >= minHeight ? scrollFit.fillHeight : undefined;
  const workspaceHeight = fillParent ? '100%' : measuredHeight;

  const sideRailStyle = embeddedSidePanels
    ? {
        padding: 0,
        flex: 1,
        height: '100%',
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column' as const,
        overflow: 'hidden' as const,
      }
    : { padding: token.paddingMD };

  const panelShellStyle = (fixedWidth?: number): CSSProperties => ({
    ...(fixedWidth
      ? {
          flex: `0 0 ${fixedWidth}px`,
          width: fixedWidth,
          maxWidth: fixedWidth,
          minWidth: fixedWidth,
        }
      : { flex: '1 1 0%', minWidth: 0 }),
    height: '100%',
    minHeight: 0,
    display: 'flex',
    flexDirection: 'column',
    borderRadius: token.borderRadiusLG,
    boxShadow: token.boxShadowTertiary,
    background: token.colorBgContainer,
    overflow: 'hidden',
  });

  if (!isLg) {
    return (
      <Flex vertical gap={token.marginSM} style={{ width: '100%' }}>
        <Flex gap={token.marginXS}>
          <Button icon={<MenuOutlined />} onClick={() => setLeftOpen(true)}>
            {leftTitle}
          </Button>
          <Button icon={<ProfileOutlined />} onClick={() => setRightOpen(true)}>
            {rightTitle}
          </Button>
        </Flex>
        <div style={{ width: '100%', minHeight }}>{center}</div>
        <Drawer title={leftTitle} open={leftOpen} onClose={() => setLeftOpen(false)} placement="left">
          {left}
        </Drawer>
        <Drawer title={rightTitle} open={rightOpen} onClose={() => setRightOpen(false)} placement="right" size={rightWidth}>
          {right}
        </Drawer>
      </Flex>
    );
  }

  if (embeddedSidePanels) {
    return (
      <Flex
        ref={workspaceRef}
        gap={token.marginXS}
        align="stretch"
        style={{
          width: '100%',
          height: workspaceHeight,
          minHeight: fillParent ? 0 : (workspaceHeight ?? minHeight),
        }}
      >
        <div
          style={{
            flex: `0 0 ${leftWidth}px`,
            width: leftWidth,
            maxWidth: leftWidth,
            minWidth: leftWidth,
            height: '100%',
            minHeight: 0,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {left}
        </div>
        <div style={panelShellStyle()}>
          <div
            style={{
              flex: 1,
              minHeight: 0,
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {center}
          </div>
        </div>
        <div
          style={{
            flex: `0 0 ${rightWidth}px`,
            width: rightWidth,
            maxWidth: rightWidth,
            minWidth: rightWidth,
            height: '100%',
            minHeight: 0,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {right}
        </div>
      </Flex>
    );
  }

  return (
    <Flex
      ref={workspaceRef}
      align="stretch"
        style={{
          width: '100%',
          height: workspaceHeight,
          minHeight: fillParent ? 0 : (workspaceHeight ?? minHeight),
          border: `${token.lineWidth}px ${token.lineType} ${token.colorBorderSecondary}`,
          borderRadius: token.borderRadiusLG,
          overflow: 'hidden',
          background: token.colorBgLayout,
        }}
    >
      <div
        style={{
          flex: `0 0 ${leftWidth}px`,
          width: leftWidth,
          maxWidth: leftWidth,
          minWidth: leftWidth,
          background: token.colorBgContainer,
          borderInlineEnd: `${token.lineWidth}px ${token.lineType} ${token.colorBorderSecondary}`,
          overflow: embeddedSidePanels ? 'hidden' : 'auto',
          display: embeddedSidePanels ? 'flex' : undefined,
          flexDirection: embeddedSidePanels ? 'column' : undefined,
          minHeight: embeddedSidePanels ? 0 : undefined,
        }}
      >
        <div style={sideRailStyle}>{left}</div>
      </div>
      {/* Padding sits inside the scroll area so pinned toolbars can reach the
          region edge instead of leaving a strip where content scrolls through. */}
      <div
        style={{
          flex: 1,
          minWidth: 0,
          overflow: 'auto',
          background: token.colorBgLayout,
        }}
      >
        <div style={{ padding: token.paddingMD }}>{center}</div>
      </div>
      <div
        style={{
          flex: `0 0 ${rightWidth}px`,
          width: rightWidth,
          maxWidth: rightWidth,
          minWidth: rightWidth,
          background: token.colorBgContainer,
          borderInlineStart: `${token.lineWidth}px ${token.lineType} ${token.colorBorderSecondary}`,
          overflow: embeddedSidePanels ? 'hidden' : 'auto',
          display: embeddedSidePanels ? 'flex' : undefined,
          flexDirection: embeddedSidePanels ? 'column' : undefined,
          minHeight: embeddedSidePanels ? 0 : undefined,
        }}
      >
        <div style={{ ...sideRailStyle, padding: embeddedSidePanels ? token.paddingSM : token.paddingMD }}>
          {right}
        </div>
      </div>
    </Flex>
  );
}
