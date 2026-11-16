import { useState } from 'react';

import {
  hydraBaseNormal,
  hydraLargeStrong,
  hydraSmallStrong,
  hydraTextStyleToReactCss,
} from '../../theme/hydraTypography';
import { HydraColorfulTag } from '../../ui/HydraTag';
import { Divider, Flex, Tooltip, Typography, theme } from '../../ui/antd';
import { SpecPanelScrollBody } from '../layout/SpecPanelScrollBody';
import type { SpecSection } from '../data/types';

/** Same hover border as `SpecRecommendationListCard`. */
function SpecTocCard({
  section,
  selected,
  pending,
  onSelect,
}: {
  section: SpecSection;
  selected: boolean;
  pending: number;
  onSelect: () => void;
}) {
  const { token } = theme.useToken();
  const [hovered, setHovered] = useState(false);
  const selectedAccent = `${token.lineWidthBold}px ${token.lineType} ${token.colorPrimaryActive}`;

  return (
    <Flex
      role="option"
      tabIndex={0}
      aria-selected={selected}
      align="center"
      gap={token.paddingXS}
      onClick={onSelect}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onSelect();
        }
      }}
      style={{
        cursor: 'pointer',
        width: '100%',
        flexShrink: 0,
        paddingBlock: token.paddingXS,
        paddingInline: token.paddingSM,
        borderRadius: token.borderRadius,
        background: selected ? token.colorFillQuaternary : token.colorBgContainer,
        ...(selected
          ? { borderInlineStart: selectedAccent }
          : {
              border: `${token.lineWidth}px ${token.lineType} ${
                hovered ? token.colorPrimaryBorderHover : token.colorBorderSecondary
              }`,
            }),
      }}
    >
      <Flex vertical gap={token.paddingXXS} style={{ minWidth: 0, flex: 1 }}>
        <Tooltip title={section.title}>
          <Typography.Paragraph
            ellipsis={{ rows: 2 }}
            style={{
              margin: 0,
              color: token.colorText,
              ...hydraTextStyleToReactCss(hydraBaseNormal),
            }}
          >
            {section.title}
          </Typography.Paragraph>
        </Tooltip>
        <Typography.Text
          style={{
            color: token.colorTextDescription,
            ...hydraTextStyleToReactCss(hydraSmallStrong),
          }}
        >
          {`Section ${section.sectionNumber}`}
        </Typography.Text>
      </Flex>
      {pending > 0 ? (
        <HydraColorfulTag preset="volcano" bordered>
          {pending}
        </HydraColorfulTag>
      ) : null}
    </Flex>
  );
}

/** Editor TOC — Figma `8066:127387` (`TOC`). */
export function SpecSectionNavigator({
  sections,
  selectedSectionId,
  pendingBySectionId,
  variant = 'default',
  onSelect,
}: {
  sections: SpecSection[];
  selectedSectionId?: string | null;
  /** Undecided recommendation count per section — Volcano Tag when > 0. */
  pendingBySectionId?: Record<string, number>;
  /** @deprecated All variants use the same Figma TOC row styling. */
  variant?: 'default' | 'compact';
  onSelect: (sectionId: string) => void;
}) {
  const { token } = theme.useToken();
  void variant;
  const panelChrome = {
    background: token.colorBgContainer,
    borderRadius: token.borderRadiusLG,
    boxShadow: token.boxShadowTertiary,
  } as const;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        width: '100%',
        height: '100%',
        minHeight: 0,
        overflow: 'hidden',
        ...panelChrome,
      }}
    >
      <Flex
        vertical
        gap={token.paddingSM}
        style={{
          width: '100%',
          flexShrink: 0,
          paddingInline: token.padding,
          paddingBlockStart: token.padding,
        }}
      >
        <Typography.Text
          style={{
            color: token.colorText,
            ...hydraTextStyleToReactCss(hydraLargeStrong),
          }}
        >
          Table of contents
        </Typography.Text>
        <Flex align="center" style={{ height: hydraBaseNormal.lineHeight, width: '100%' }}>
          <Divider style={{ margin: 0, width: '100%' }} />
        </Flex>
      </Flex>
      <SpecPanelScrollBody>
        <Flex
          role="listbox"
          aria-label="Document sections"
          vertical
          gap={token.paddingXS}
          style={{
            width: '100%',
            boxSizing: 'border-box',
            paddingInline: token.padding,
            paddingBlockEnd: token.padding,
          }}
        >
          {sections.map((section) => (
            <SpecTocCard
              key={section.id}
              section={section}
              selected={section.id === selectedSectionId}
              pending={pendingBySectionId?.[section.id] ?? 0}
              onSelect={() => onSelect(section.id)}
            />
          ))}
        </Flex>
      </SpecPanelScrollBody>
    </div>
  );
}
