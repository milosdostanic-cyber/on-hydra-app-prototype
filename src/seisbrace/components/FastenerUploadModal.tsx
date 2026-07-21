import { InboxOutlined } from '@ant-design/icons';
import { useEffect, useState } from 'react';

import { App, Modal, Typography, Upload, theme } from '../../ui/antd';

type Props = {
  open: boolean;
  onUpload: (filenames: string[]) => void;
  onCancel: () => void;
};

/** Upload fastener calculation PDFs (ZIP `FastenerCalculationsUploadModal`). Stub — no real upload. */
export function FastenerUploadModal({ open, onUpload, onCancel }: Props) {
  const { token } = theme.useToken();
  const { message } = App.useApp();
  const [fileList, setFileList] = useState<{ uid: string; name: string }[]>([]);

  useEffect(() => {
    if (open) setFileList([]);
  }, [open]);

  return (
    <Modal
      open={open}
      title="Upload Fastener Calculations"
      okText="Upload"
      okButtonProps={{ disabled: fileList.length === 0 }}
      onOk={() => {
        onUpload(fileList.map((f) => f.name));
        message.success(`${fileList.length} file${fileList.length === 1 ? '' : 's'} attached (stub).`);
      }}
      onCancel={onCancel}
      destroyOnClose
    >
      <Typography.Paragraph type="secondary">
        Attach manufacturer fastener calculation PDFs to this project. They appear under uploaded files.
      </Typography.Paragraph>
      <Upload.Dragger
        multiple
        accept=".pdf"
        fileList={fileList}
        beforeUpload={() => false}
        onChange={(info) => setFileList(info.fileList.map((f) => ({ uid: f.uid, name: f.name })))}
      >
        <p className="ant-upload-drag-icon">
          <InboxOutlined style={{ color: token.colorPrimary }} />
        </p>
        <p className="ant-upload-text">Click or drag PDF files to this area</p>
        <p className="ant-upload-hint">PDF only. This prototype does not store the files.</p>
      </Upload.Dragger>
    </Modal>
  );
}
