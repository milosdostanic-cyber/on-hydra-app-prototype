import { Input, InputNumber, Typography } from '../ui/antd';

/** Read-only table cell (Figma: plain text, no input chrome). */
export function readOnlyTableText(value: string | undefined, ellipsis = true) {
  const display = value?.trim() ? value : '—';
  return (
    <Typography.Text ellipsis={ellipsis ? { tooltip: display } : false} style={{ display: 'block' }}>
      {display}
    </Typography.Text>
  );
}

type EditableTextProps = {
  value: string | undefined;
  onChange: (next: string) => void;
  /** Figma attention state — yellow input border when the parser left this field empty. */
  needsAttention?: boolean;
};

export function editableTableText({ value, onChange, needsAttention }: EditableTextProps) {
  return (
    <Input
      value={value ?? ''}
      status={needsAttention ? 'warning' : undefined}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}

type EditableNumberProps = {
  value: number | undefined;
  onChange: (next: number | null) => void;
  needsAttention?: boolean;
  min?: number;
};

export function editableTableNumber({ value, onChange, needsAttention, min = 0 }: EditableNumberProps) {
  return (
    <InputNumber
      min={min}
      style={{ width: '100%' }}
      value={value}
      status={needsAttention ? 'warning' : undefined}
      onChange={(n) => onChange(typeof n === 'number' ? n : null)}
    />
  );
}

export function parseSizeInches(size: string): number | undefined {
  const match = size.match(/(\d+\.?\d*|\d+\/\d+)/);
  if (!match) return undefined;
  const numStr = match[1];
  if (numStr.includes('/')) {
    const parts = numStr.split('/').map(Number);
    return parts[0] / parts[1];
  }
  return Number(numStr);
}

export function formatSizeInches(n: number | null, fallback: string): string {
  if (typeof n !== 'number' || Number.isNaN(n)) return fallback;
  return `${n} inch`;
}
