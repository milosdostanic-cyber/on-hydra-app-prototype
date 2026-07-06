import { useEffect, useState } from 'react';

import type { PartVariationRow } from '../partDetailDemoData';
import { Button, Checkbox, Flex, Modal, Space, Typography, theme } from '../../ui/antd';

type Props = {
  open: boolean;
  variation: PartVariationRow | null;
  onConfirm: (selectedTypes: string[]) => void;
  onCancel: () => void;
};

/**
 * Lets the user pick which drawing file types to queue for a part variant.
 * Files are added to the session download queue — not downloaded immediately.
 */
export function DrawingFileTypesModal({ open, variation, onConfirm, onCancel }: Props) {
  const { token } = theme.useToken();
  const [selected, setSelected] = useState<string[]>([]);

  useEffect(() => {
    if (!open || !variation) return;
    setSelected(variation.drawingFileTypes);
  }, [open, variation]);

  const options = variation?.drawingFileTypes ?? [];
  const canSubmit = selected.length > 0;

  return (
    <Modal
      open={open}
      title="Download Drawing Files"
      width={token.screenSM}
      footer={null}
      onCancel={onCancel}
      destroyOnClose
    >
      <Space orientation="vertical" size={token.marginLG} style={{ width: '100%' }}>
        {variation ? (
          <Flex
            vertical
            gap={token.marginXXS}
            style={{
              padding: token.padding,
              border: `${token.lineWidth}px ${token.lineType} ${token.colorBorderSecondary}`,
              borderRadius: token.borderRadiusLG,
              background: token.colorFillQuaternary,
            }}
          >
            <Typography.Text type="secondary">Adding to download queue</Typography.Text>
            <Typography.Text strong>{variation.name}</Typography.Text>
            <Typography.Text type="secondary">SKU {variation.sku}</Typography.Text>
            <Typography.Text type="secondary">
              Choose file types — selected files are queued, not downloaded immediately.
            </Typography.Text>
          </Flex>
        ) : null}

        <Checkbox.Group
          value={selected}
          onChange={(values) => setSelected(values as string[])}
          style={{ width: '100%' }}
        >
          <Space orientation="vertical" size={token.marginXS}>
            {options.map((fileType) => (
              <Checkbox key={fileType} value={fileType}>
                {fileType} · {variation?.sku}.{fileType.toLowerCase()}
              </Checkbox>
            ))}
          </Space>
        </Checkbox.Group>

        <Flex justify="flex-end" gap={token.marginSM} wrap="wrap">
          <Button onClick={onCancel}>Cancel</Button>
          <Button type="primary" disabled={!canSubmit} onClick={() => onConfirm(selected)}>
            Add to queue
          </Button>
        </Flex>
      </Space>
    </Modal>
  );
}
