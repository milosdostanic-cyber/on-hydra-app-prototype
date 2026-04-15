import { SearchOutlined } from '@ant-design/icons';
import { forwardRef } from 'react';
import type { InputProps, InputRef } from 'antd';
import { Input, theme } from 'antd';

/**
 * Shared catalog / list search field: same `SearchOutlined` prefix and
 * `colorTextPlaceholder` icon tint everywhere (Hydra shell + BOM).
 */
export type AppSearchInputProps = Omit<InputProps, 'prefix'>;

export const AppSearchInput = forwardRef<InputRef, AppSearchInputProps>(function AppSearchInput(
  props,
  ref,
) {
  const { token } = theme.useToken();
  return (
    <Input
      ref={ref}
      {...props}
      prefix={<SearchOutlined style={{ color: token.colorTextPlaceholder }} aria-hidden />}
    />
  );
});
