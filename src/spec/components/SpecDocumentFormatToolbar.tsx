import {
  BoldOutlined,
  ClearOutlined,
  ItalicOutlined,
  OrderedListOutlined,
  RedoOutlined,
  UnderlineOutlined,
  UndoOutlined,
  UnorderedListOutlined,
} from '@ant-design/icons';
import type { CSSProperties, ReactNode } from 'react';

import { specA4Dimensions } from '../constants/specDocumentLayout';
import type { SpecBlockFormatting } from '../data/types';
import { Button, Divider, Flex, Select, Tooltip, Typography, theme } from '../../ui/antd';

export function SpecDocumentFormatToolbar({
  formatting,
  disabled,
  canUndo,
  canRedo,
  statusHint,
  fillContainer,
  onStyleChange,
  onToggle,
  onClearFormatting,
  onUndo,
  onRedo,
  style,
}: {
  formatting: SpecBlockFormatting;
  disabled?: boolean;
  canUndo: boolean;
  canRedo: boolean;
  statusHint?: ReactNode;
  /** Figma edit workspace — toolbar spans the center panel width. */
  fillContainer?: boolean;
  onStyleChange: (style: NonNullable<SpecBlockFormatting['style']>) => void;
  onToggle: (patch: Partial<SpecBlockFormatting>) => void;
  onClearFormatting: () => void;
  onUndo: () => void;
  onRedo: () => void;
  style?: CSSProperties;
}) {
  const { token } = theme.useToken();
  const { width: sheetWidth } = specA4Dimensions(token);

  const toggleStyle = (active: boolean | undefined) =>
    active ? token.colorPrimaryBg : 'transparent';

  const formatDisabled = disabled;

  return (
    <Flex
      vertical
      style={{
        width: fillContainer ? '100%' : sheetWidth,
        maxWidth: '100%',
        background: token.colorBgContainer,
        border: fillContainer
          ? undefined
          : `${token.lineWidth}px ${token.lineType} ${token.colorBorderSecondary}`,
        borderRadius: fillContainer ? 0 : `${token.borderRadiusLG}px ${token.borderRadiusLG}px 0 0`,
        boxShadow: fillContainer ? undefined : token.boxShadowTertiary,
        position: fillContainer ? 'static' : 'sticky',
        top: fillContainer ? undefined : 0,
        zIndex: fillContainer ? undefined : 2,
        ...style,
      }}
    >
      <Flex
        align="center"
        gap={token.marginXXS}
        wrap="wrap"
        style={{
          paddingInline: token.paddingSM,
          paddingBlock: token.paddingXS,
          borderBottom: `${token.lineWidth}px ${token.lineType} ${token.colorBorderSecondary}`,
        }}
      >
        <Select
          aria-label="Paragraph style"
          value={formatting.style ?? 'normal'}
          disabled={formatDisabled}
          onChange={onStyleChange}
          options={[
            { value: 'normal', label: 'Normal' },
            { value: 'heading', label: 'Heading' },
            { value: 'subheading', label: 'Subheading' },
          ]}
          style={{ width: token.controlHeight * 5 }}
        />
        <Divider type="vertical" style={{ height: token.controlHeightSM, marginInline: token.marginXXS }} />
        <Tooltip title="Bold">
          <Button
            type="text"
            aria-label="Bold"
            aria-pressed={Boolean(formatting.bold)}
            icon={<BoldOutlined />}
            disabled={formatDisabled}
            onClick={() => onToggle({ bold: !formatting.bold })}
            style={{ background: toggleStyle(formatting.bold) }}
          />
        </Tooltip>
        <Tooltip title="Italic">
          <Button
            type="text"
            aria-label="Italic"
            aria-pressed={Boolean(formatting.italic)}
            icon={<ItalicOutlined />}
            disabled={formatDisabled}
            onClick={() => onToggle({ italic: !formatting.italic })}
            style={{ background: toggleStyle(formatting.italic) }}
          />
        </Tooltip>
        <Tooltip title="Underline">
          <Button
            type="text"
            aria-label="Underline"
            aria-pressed={Boolean(formatting.underline)}
            icon={<UnderlineOutlined />}
            disabled={formatDisabled}
            onClick={() => onToggle({ underline: !formatting.underline })}
            style={{ background: toggleStyle(formatting.underline) }}
          />
        </Tooltip>
        <Divider type="vertical" style={{ height: token.controlHeightSM, marginInline: token.marginXXS }} />
        <Tooltip title="Bulleted list">
          <Button
            type="text"
            aria-label="Bulleted list"
            aria-pressed={Boolean(formatting.bulleted)}
            icon={<UnorderedListOutlined />}
            disabled={formatDisabled}
            onClick={() =>
              onToggle({
                bulleted: !formatting.bulleted,
                numbered: formatting.bulleted ? formatting.numbered : false,
              })
            }
            style={{ background: toggleStyle(formatting.bulleted) }}
          />
        </Tooltip>
        <Tooltip title="Numbered list">
          <Button
            type="text"
            aria-label="Numbered list"
            aria-pressed={Boolean(formatting.numbered)}
            icon={<OrderedListOutlined />}
            disabled={formatDisabled}
            onClick={() =>
              onToggle({
                numbered: !formatting.numbered,
                bulleted: formatting.numbered ? formatting.bulleted : false,
              })
            }
            style={{ background: toggleStyle(formatting.numbered) }}
          />
        </Tooltip>
        <Divider type="vertical" style={{ height: token.controlHeightSM, marginInline: token.marginXXS }} />
        <Tooltip title="Clear formatting">
          <Button
            type="text"
            aria-label="Clear formatting"
            icon={<ClearOutlined />}
            disabled={formatDisabled}
            onClick={onClearFormatting}
          />
        </Tooltip>
        <Tooltip title="Undo">
          <Button
            type="text"
            aria-label="Undo"
            icon={<UndoOutlined />}
            disabled={formatDisabled || !canUndo}
            onClick={onUndo}
          />
        </Tooltip>
        <Tooltip title="Redo">
          <Button
            type="text"
            aria-label="Redo"
            icon={<RedoOutlined />}
            disabled={formatDisabled || !canRedo}
            onClick={onRedo}
          />
        </Tooltip>
        <Flex flex={1} justify="flex-end" align="center" style={{ minWidth: token.controlHeight * 6 }}>
          {statusHint ? (
            <Typography.Text type="secondary" ellipsis>
              {statusHint}
            </Typography.Text>
          ) : null}
        </Flex>
      </Flex>
    </Flex>
  );
}
