import { DeleteOutlined, DownloadOutlined, FilePdfOutlined } from '@ant-design/icons';

import { App, Button, Flex, List, Space, Typography, theme } from '../../ui/antd';
import type { SeisBraceFile } from '../types';

type Props = {
  title: string;
  files: SeisBraceFile[];
  onDownload: (file: SeisBraceFile) => void;
  onDelete?: (file: SeisBraceFile) => void;
};

/** Files list (ZIP `FileListSection`): title + filename + download, with optional delete. */
export function FileListSection({ title, files, onDownload, onDelete }: Props) {
  const { token } = theme.useToken();
  const { modal } = App.useApp();

  if (files.length === 0) return null;

  const confirmDelete = (file: SeisBraceFile) => {
    modal.confirm({
      title: 'Remove file',
      okText: 'Remove',
      okButtonProps: { danger: true },
      content: `Remove "${file.filename}" from this project?`,
      onOk: () => onDelete?.(file),
    });
  };

  return (
    <Space orientation="vertical" size={token.marginXS} style={{ width: '100%' }}>
      <Typography.Text strong>{title}</Typography.Text>
      <List
        bordered
        dataSource={files}
        renderItem={(file) => (
          <List.Item>
            <Flex align="center" justify="space-between" gap={token.marginSM} style={{ width: '100%' }}>
              <Flex align="center" gap={token.marginSM} style={{ minWidth: 0 }}>
                <FilePdfOutlined style={{ color: token.colorError }} />
                <div style={{ minWidth: 0 }}>
                  <Typography.Text ellipsis={{ tooltip: file.title }} style={{ display: 'block' }}>
                    {file.title}
                  </Typography.Text>
                  <Typography.Text type="secondary" ellipsis={{ tooltip: file.filename }} style={{ display: 'block' }}>
                    {file.filename}
                  </Typography.Text>
                </div>
              </Flex>
              <Space size={token.marginXXS} style={{ flexShrink: 0 }}>
                <Button type="link" icon={<DownloadOutlined />} onClick={() => onDownload(file)}>
                  Download
                </Button>
                {onDelete ? (
                  <Button
                    type="link"
                    danger
                    icon={<DeleteOutlined />}
                    aria-label="Remove file"
                    onClick={() => confirmDelete(file)}
                  />
                ) : null}
              </Space>
            </Flex>
          </List.Item>
        )}
      />
    </Space>
  );
}
