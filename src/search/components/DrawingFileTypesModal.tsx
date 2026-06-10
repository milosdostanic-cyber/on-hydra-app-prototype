import { useEffect, useState } from 'react';

import type { PartVariationRow } from '../partDetailDemoData';
import { Checkbox, Modal, Space, Typography, theme } from '../../ui/antd';

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
      okText="Add to queue"
      okButtonProps={{ disabled: !canSubmit }}
      onOk={() => onConfirm(selected)}
      onCancel={onCancel}
      destroyOnClose
    >
      {variation ? (
        <>
          <Typography.Paragraph type="secondary" style={{ marginBottom: token.margin }}>
            Choose file types for <Typography.Text strong>{variation.name}</Typography.Text> (SKU{' '}
            {variation.sku}). Selected files are added to the download queue.
          </Typography.Paragraph>

          <Checkbox.Group
            value={selected}
            onChange={(values) => setSelected(values as string[])}
            style={{ width: '100%' }}
          >
            <Space orientation="vertical" size={token.marginXS}>
              {options.map((fileType) => (
                <Checkbox key={fileType} value={fileType}>
                  {fileType} · {variation.sku}.{fileType.toLowerCase()}
                </Checkbox>
              ))}
            </Space>
          </Checkbox.Group>
        </>
      ) : null}
    </Modal>
  );
}
