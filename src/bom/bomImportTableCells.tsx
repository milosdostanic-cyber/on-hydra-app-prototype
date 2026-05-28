import { Input, InputNumber, Typography } from '../ui/antd';

function isBlank(value: string | undefined): boolean {
  return !value?.trim();
}

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
  warnIfEmpty?: boolean;
};

export function editableTableText({ value, onChange, warnIfEmpty }: EditableTextProps) {
  return (
    <Input
      value={value ?? ''}
      status={warnIfEmpty && isBlank(value) ? 'warning' : undefined}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}

type EditableNumberProps = {
  value: number | undefined;
  onChange: (next: number | null) => void;
  warnIfEmpty?: boolean;
  min?: number;
};

export function editableTableNumber({ value, onChange, warnIfEmpty, min = 0 }: EditableNumberProps) {
  return (
    <InputNumber
      min={min}
      style={{ width: '100%' }}
      value={value}
      status={warnIfEmpty && (value == null || value <= 0) ? 'warning' : undefined}
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
