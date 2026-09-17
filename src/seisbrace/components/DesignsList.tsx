import { CopyOutlined, DeleteOutlined, EditOutlined, RightOutlined } from '@ant-design/icons';
import { useState } from 'react';

import { hydraBaseStrong, hydraSmallNormal, hydraTextStyleToReactCss } from '../../theme/hydraTypography';
import { App, Button, Empty, Flex, Tooltip, Typography, theme } from '../../ui/antd';
import type { SeismicDesign } from '../types';

const dateFormatter = new Intl.DateTimeFormat(undefined, {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
});

type Props = {
  designs: SeismicDesign[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onEdit: (design: SeismicDesign) => void;
  onCopy: (design: SeismicDesign) => void;
  onDelete: (design: SeismicDesign) => void;
};

/**
 * Left-rail list of seismic designs (ZIP `DesignsList`). Row actions stay inside the panel and
 * reveal on hover (Phase 5h-A); selected row gets a primary left accent. Creation is owned by the
 * header "New design" CTA (single create affordance — no duplicate footer button).
 */
export function DesignsList({ designs, selectedId, onSelect, onEdit, onCopy, onDelete }: Props) {
  const { token } = theme.useToken();
  const { modal } = App.useApp();
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const confirmDelete = (design: SeismicDesign) => {
    modal.confirm({
      title: 'Delete seismic design',
      okText: 'Delete',
      okButtonProps: { danger: true },
      content: `Delete "${design.displayName}" and its brace configurations? This cannot be undone in the prototype.`,
      onOk: () => onDelete(design),
    });
  };

  return (
    <Flex vertical style={{ height: '100%', minWidth: 0 }}>
      <div style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
        {designs.length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="No designs"
            style={{ marginTop: token.marginLG }}
          />
        ) : (
          designs.map((design) => {
            const selected = design.id === selectedId;
            const hovered = design.id === hoveredId;
            return (
              <div
                key={design.id}
                role="button"
                tabIndex={0}
                onClick={() => onSelect(design.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') onSelect(design.id);
                }}
                onMouseEnter={() => setHoveredId(design.id)}
                onMouseLeave={() => setHoveredId(null)}
                style={{
                  position: 'relative',
                  cursor: 'pointer',
                  padding: `${token.paddingSM}px ${token.padding}px`,
                  paddingInlineStart: token.padding + token.lineWidthBold,
                  borderInlineStart: `${token.lineWidthBold}px ${token.lineType} ${
                    selected ? token.colorPrimary : 'transparent'
                  }`,
                  background: selected ? token.colorPrimaryBg : 'transparent',
                  borderBottom: `${token.lineWidth}px ${token.lineType} ${token.colorBorderSecondary}`,
                  overflow: 'hidden',
                }}
              >
                <Flex align="center" justify="space-between" gap={token.marginXS}>
                  <div style={{ minWidth: 0 }}>
                    <Typography.Text
                      ellipsis={{ tooltip: design.displayName }}
                      style={{ ...hydraTextStyleToReactCss(hydraBaseStrong), display: 'block', maxWidth: '100%' }}
                    >
                      {design.displayName}
                    </Typography.Text>
                    <Typography.Text
                      type="secondary"
                      style={{ display: 'block', ...hydraTextStyleToReactCss(hydraSmallNormal) }}
                    >
                      {dateFormatter.format(new Date(design.projectDate))}
                    </Typography.Text>
                  </div>
                  {hovered ? (
                    <Flex align="center" gap={token.marginXXS} style={{ flexShrink: 0 }}>
                      <Tooltip title="Edit design">
                        <Button
                          type="text"
                          size="small"
                          icon={<EditOutlined />}
                          aria-label="Edit design"
                          onClick={(e) => {
                            e.stopPropagation();
                            onEdit(design);
                          }}
                        />
                      </Tooltip>
                      <Tooltip title="Copy design">
                        <Button
                          type="text"
                          size="small"
                          icon={<CopyOutlined />}
                          aria-label="Copy design"
                          onClick={(e) => {
                            e.stopPropagation();
                            onCopy(design);
                          }}
                        />
                      </Tooltip>
                      <Tooltip title="Delete design">
                        <Button
                          type="text"
                          size="small"
                          danger
                          icon={<DeleteOutlined />}
                          aria-label="Delete design"
                          onClick={(e) => {
                            e.stopPropagation();
                            confirmDelete(design);
                          }}
                        />
                      </Tooltip>
                    </Flex>
                  ) : (
                    <RightOutlined style={{ color: token.colorTextQuaternary, flexShrink: 0 }} />
                  )}
                </Flex>
              </div>
            );
          })
        )}
      </div>
    </Flex>
  );
}
