import { PlusOutlined } from '@ant-design/icons';
import { useMemo, useState } from 'react';

import { AppSearchInput, Divider, Flex, Radio, Space, Tag, Typography, theme } from '../../ui/antd';
import type { BomProject } from '../../bom/data/types';

export type BomDestinationValue = {
  bomProjectId: string;
  bomProjectName: string;
};

const BOM_LIST_SEARCH_THRESHOLD = 6;
const BOM_VISIBLE_ROW_COUNT = 6;

type BomDestinationFieldsProps = {
  boms: BomProject[];
  bomAvailability?: Record<string, { disabled?: boolean; label?: string; description?: string }>;
  selectedId: string | null;
  onSelectedIdChange: (id: string) => void;
  onRequestCreateNew: () => void;
};

/**
 * Pick a BOM within a construction project.
 * Shared by {@link ProjectRequiredModal} (step 2) and {@link AddToBomModal}.
 */
export function BomDestinationFields({
  boms,
  bomAvailability,
  selectedId,
  onSelectedIdChange,
  onRequestCreateNew,
}: BomDestinationFieldsProps) {
  const { token } = theme.useToken();
  const [searchQuery, setSearchQuery] = useState('');

  const showSearch = boms.length > BOM_LIST_SEARCH_THRESHOLD;

  const filteredBoms = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return boms;
    return boms.filter((bom) => bom.name.toLowerCase().includes(query));
  }, [boms, searchQuery]);

  const listMaxHeight = token.controlHeightLG * BOM_VISIBLE_ROW_COUNT;

  return (
    <Space orientation="vertical" size={token.marginMD} style={{ width: '100%' }}>
      {boms.length > 0 ? (
        <Space orientation="vertical" size={token.marginSM} style={{ width: '100%' }}>
          <Typography.Text strong>Select BOM</Typography.Text>

          {showSearch ? (
            <AppSearchInput
              allowClear
              placeholder="Search BOMs…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          ) : null}

          <div
            style={{
              maxHeight: showSearch ? listMaxHeight : undefined,
              overflowY: showSearch ? 'auto' : undefined,
              border: `${token.lineWidth}px ${token.lineType} ${token.colorBorderSecondary}`,
              borderRadius: token.borderRadiusLG,
              background: token.colorBgContainer,
            }}
          >
            {filteredBoms.length === 0 ? (
              <Typography.Text
                type="secondary"
                style={{ display: 'block', padding: token.paddingSM }}
              >
                No BOMs match your search.
              </Typography.Text>
            ) : (
              <Radio.Group
                value={selectedId}
                onChange={(e) => onSelectedIdChange(e.target.value as string)}
                style={{ width: '100%' }}
              >
                <Space orientation="vertical" size={0} style={{ width: '100%' }}>
                  {filteredBoms.map((bom, index) => {
                    const availability = bomAvailability?.[bom.id];
                    const selected = selectedId === bom.id;
                    return (
                      <Radio
                        key={bom.id}
                        value={bom.id}
                        disabled={availability?.disabled}
                        style={{
                          width: '100%',
                          margin: 0,
                          padding: token.paddingSM,
                          borderBottom:
                            index === filteredBoms.length - 1
                              ? undefined
                              : `${token.lineWidth}px ${token.lineType} ${token.colorBorderSecondary}`,
                          background: selected ? token.colorFillQuaternary : token.colorBgContainer,
                        }}
                      >
                        <Flex align="center" justify="space-between" gap={token.marginMD} style={{ width: '100%' }}>
                          <Flex vertical gap={token.marginXXS} style={{ minWidth: 0 }}>
                            <Space size={token.marginXS} wrap>
                              <Typography.Text strong ellipsis>
                                {bom.name}
                              </Typography.Text>
                              {availability?.label ? <Tag color="warning">{availability.label}</Tag> : null}
                            </Space>
                            {availability?.description ? (
                              <Typography.Text type="secondary">{availability.description}</Typography.Text>
                            ) : null}
                          </Flex>
                          <Typography.Text type="secondary" style={{ whiteSpace: 'nowrap' }}>
                            {bom.items} item{bom.items === 1 ? '' : 's'}
                          </Typography.Text>
                        </Flex>
                      </Radio>
                    );
                  })}
                </Space>
              </Radio.Group>
            )}
          </div>
        </Space>
      ) : (
        <Typography.Text type="secondary">
          No BOMs in this project yet. Create one to add this part.
        </Typography.Text>
      )}

      <Divider style={{ margin: 0 }} />
      <Typography.Link onClick={onRequestCreateNew}>
        <Space size={token.marginXS}>
          <PlusOutlined />
          <span>Create a new BOM instead</span>
        </Space>
      </Typography.Link>
    </Space>
  );
}
