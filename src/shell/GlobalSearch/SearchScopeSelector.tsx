import { DownOutlined } from '@ant-design/icons';

import {
  SEARCH_SCOPE_LABELS,
  type SearchScope,
} from '../../search/globalSearchModel';
import { Button, Dropdown, theme } from '../../ui/antd';
import type { MenuProps } from '../../ui/antd';

type Props = {
  scope: SearchScope;
  onChange: (scope: SearchScope) => void;
};

const scopeOptions: SearchScope[] = ['parts', 'connected', 'all'];

export function SearchScopeSelector({ scope, onChange }: Props) {
  const { token } = theme.useToken();
  const items: MenuProps['items'] = scopeOptions.map((option) => ({
    key: option,
    label: SEARCH_SCOPE_LABELS[option],
  }));

  return (
    <Dropdown
      trigger={['click']}
      menu={{
        items,
        selectable: true,
        selectedKeys: [scope],
        onClick: ({ key }) => onChange(key as SearchScope),
      }}
    >
      <Button
        type="text"
        size="small"
        onMouseDown={(event) => event.preventDefault()}
        style={{
          height: token.controlHeightSM,
          paddingInline: token.paddingXS,
          color: token.colorText,
          fontWeight: token.fontWeightStrong,
          borderInlineEnd: `${token.lineWidth}px ${token.lineType} ${token.colorBorderSecondary}`,
          borderRadius: 0,
        }}
      >
        {SEARCH_SCOPE_LABELS[scope]} <DownOutlined style={{ fontSize: token.fontSizeSM }} />
      </Button>
    </Dropdown>
  );
}
