import { SearchOutlined } from '@ant-design/icons';
import { forwardRef } from 'react';
import type { InputProps, InputRef } from 'antd';
import { Input, theme } from 'antd';

/**
 * Shared catalog / list search field: same `SearchOutlined` prefix and
 * `colorTextPlaceholder` icon tint everywhere (Hydra shell + BOM).
 *
 * When placed inline beside a primary CTA (`Button size="large"`), pass
 * `size={INLINE_SEARCH_CONTROL_SIZE}` on both the input and the button.
 */
export type AppSearchInputProps = Omit<InputProps, 'prefix'>;

/** Matches `Button size="large"` — use for search/input + CTA inline rows. */
export const INLINE_SEARCH_CONTROL_SIZE: NonNullable<InputProps['size']> = 'large';

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
