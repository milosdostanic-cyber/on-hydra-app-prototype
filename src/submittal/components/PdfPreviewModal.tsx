import { DownloadOutlined, FilePdfOutlined } from '@ant-design/icons';

import { App, Button, Empty, Modal, Space, Typography, theme } from '../../ui/antd';
import type { SubmittalPackage } from '../types';

type Props = {
  open: boolean;
  pkg: SubmittalPackage | null;
  onCancel: () => void;
};

/**
 * Stub PDF preview + download (ZIP `PdfPreviewModal`). No real PDF engine in the prototype, so
 * this shows a framed placeholder listing the package contents and a stubbed download action.
 */
export function PdfPreviewModal({ open, pkg, onCancel }: Props) {
  const { token } = theme.useToken();
  const { message } = App.useApp();

  const handleDownload = () => {
    if (!pkg) return;
    message.success(`Submittal PDF queued for "${pkg.name}" (stub).`);
    onCancel();
  };

  return (
    <Modal
      open={open}
      title={pkg ? `Preview — ${pkg.name}` : 'Preview'}
      width={720}
      onCancel={onCancel}
      footer={[
        <Button key="close" onClick={onCancel}>
          Close
        </Button>,
        <Button
          key="download"
          type="primary"
          icon={<DownloadOutlined />}
          onClick={handleDownload}
          disabled={!pkg || pkg.parts.length === 0}
        >
          Download PDF
        </Button>,
      ]}
    >
      {pkg && pkg.parts.length > 0 ? (
        <div
          style={{
            border: `${token.lineWidth}px dashed ${token.colorBorder}`,
            borderRadius: token.borderRadiusLG,
            background: token.colorFillQuaternary,
            padding: token.paddingLG,
          }}
        >
          <Space orientation="vertical" size={token.marginSM} style={{ width: '100%' }}>
            <Space size={token.marginXS} align="center">
              <FilePdfOutlined style={{ color: token.colorError, fontSize: token.fontSizeHeading4 }} />
              <Typography.Text strong>{pkg.name}</Typography.Text>
            </Space>
            <Typography.Text type="secondary">
              {pkg.parts.length} cut sheet{pkg.parts.length === 1 ? '' : 's'} · generated preview (stub)
            </Typography.Text>
            <Space orientation="vertical" size={token.marginXXS} style={{ width: '100%' }}>
              {pkg.parts.map((part, index) => (
                <Typography.Text key={part.id} style={{ color: token.colorTextSecondary }}>
                  {index + 1}. {part.displayName} · Fig. {part.figureNumber}
                </Typography.Text>
              ))}
            </Space>
          </Space>
        </div>
      ) : (
        <Empty description="No cut sheets to preview yet. Add parts to this package first." />
      )}
    </Modal>
  );
}
