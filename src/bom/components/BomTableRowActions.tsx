import { MoreOutlined } from '@ant-design/icons';
import type { MenuProps } from 'antd';

import { Button, Dropdown, Flex, theme } from '../../ui/antd';

export type BomTableRowAction = {
  key: string;
  label: string;
  onClick: () => void;
  danger?: boolean;
  disabled?: boolean;
};

const linkButtonStyle = { padding: 0, height: 'auto' } as const;

/** Up to three single-word inline actions; additional actions go in ⋮. */
const DEFAULT_MAX_VISIBLE = 3;

type BomTableRowActionsProps = {
  actions: BomTableRowAction[];
  /** Inline link buttons before overflow (default 3). */
  maxVisible?: number;
  /** Keep actions on one line (recommended for dense tables). */
  nowrap?: boolean;
};

function buildOverflowMenuItems(actions: BomTableRowAction[]): MenuProps['items'] {
  const items: MenuProps['items'] = [];
  let dividerInserted = false;

  for (const action of actions) {
    if (action.danger && !dividerInserted && items.length > 0) {
      items.push({ type: 'divider' });
      dividerInserted = true;
    }
    items.push({
      key: action.key,
      label: action.label,
      danger: action.danger,
      disabled: action.disabled,
      onClick: () => action.onClick(),
    });
  }

  return items;
}

/** Table row actions: limited inline link buttons, remainder in a ⋮ menu. */
export function BomTableRowActions({
  actions,
  maxVisible = DEFAULT_MAX_VISIBLE,
  nowrap = false,
}: BomTableRowActionsProps) {
  const { token } = theme.useToken();

  if (actions.length === 0) return null;

  const useOverflow = maxVisible === 0 || actions.length > maxVisible;

  if (!useOverflow) {
    return (
      <Flex gap={token.marginXS} wrap={nowrap ? 'nowrap' : 'wrap'} align="center">
        {actions.map((action) => (
          <Button
            key={action.key}
            type="link"
            size="small"
            danger={action.danger}
            disabled={action.disabled}
            style={linkButtonStyle}
            onClick={(event) => {
              event.stopPropagation();
              action.onClick();
            }}
          >
            {action.label}
          </Button>
        ))}
      </Flex>
    );
  }

  const visible = maxVisible > 0 ? actions.slice(0, maxVisible) : [];
  const overflow = maxVisible > 0 ? actions.slice(maxVisible) : actions;
  const menuItems = buildOverflowMenuItems(overflow);

  return (
    <Flex gap={token.marginXS} wrap={nowrap ? 'nowrap' : 'wrap'} align="center">
      {visible.map((action) => (
        <Button
          key={action.key}
          type="link"
          size="small"
          danger={action.danger}
          disabled={action.disabled}
          style={linkButtonStyle}
          onClick={(event) => {
            event.stopPropagation();
            action.onClick();
          }}
        >
          {action.label}
        </Button>
      ))}
      <Dropdown menu={{ items: menuItems }} trigger={['click']} placement="bottomRight">
        <Button
          type="text"
          size="small"
          icon={<MoreOutlined />}
          aria-label="More actions"
          style={{ paddingInline: token.paddingXXS }}
          onClick={(event) => event.stopPropagation()}
        />
      </Dropdown>
    </Flex>
  );
}
