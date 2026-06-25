import { parseSizeInches, formatSizeInches } from '../bomImportTableCells';
import { Input, InputNumber, Space, theme } from '../../ui/antd';

type EditableSizeInchesInputProps = {
  value: string | undefined;
  onChange: (next: string) => void;
  needsAttention?: boolean;
  min?: number;
  step?: number;
};

/** Inches size — same interaction as Qty: type a value or use ▲/▼ steppers. */
export function EditableSizeInchesInput({
  value,
  onChange,
  needsAttention,
  min = 0.125,
  step = 0.25,
}: EditableSizeInchesInputProps) {
  const { token } = theme.useToken();
  const parsed = parseSizeInches(value ?? '');

  return (
    <Space.Compact style={{ width: '100%' }}>
      <InputNumber
        min={min}
        step={step}
        controls
        style={{ width: '100%' }}
        value={parsed}
        placeholder="e.g. 4"
        status={needsAttention ? 'warning' : undefined}
        onChange={(n) => {
          if (typeof n === 'number' && !Number.isNaN(n)) {
            onChange(formatSizeInches(n, value ?? ''));
            return;
          }
          if (n === null) onChange('');
        }}
      />
      <Input
        readOnly
        tabIndex={-1}
        value="in"
        aria-hidden
        style={{
          width: token.controlHeight + token.paddingXS,
          flexShrink: 0,
          pointerEvents: 'none',
          textAlign: 'center',
          background: token.colorFillAlter,
          color: token.colorTextSecondary,
        }}
      />
    </Space.Compact>
  );
}
