import { CheckCircleFilled, FileTextOutlined, InboxOutlined } from '@ant-design/icons';
import { useEffect, useState } from 'react';

import { Checkbox, Flex, Modal, Space, Typography, theme } from '../../ui/antd';
import type { SeisBraceFile } from '../types';

type GenerateOption = 'generate-report' | 'generate-report-and-submittal';

type Props = {
  open: boolean;
  selectedBraceCount: number;
  projectFiles: SeisBraceFile[];
  onGenerate: (payload: { includeSubmittal: boolean; fileIds: string[] }) => void;
  onCancel: () => void;
};

const OPTIONS: { key: GenerateOption; title: string; description: string; icon: React.ReactNode }[] = [
  {
    key: 'generate-report',
    title: 'Generate Report',
    description: 'Seismic calculation report for the selected braces.',
    icon: <FileTextOutlined />,
  },
  {
    key: 'generate-report-and-submittal',
    title: 'Generate Report and a Submittal',
    description: 'Calculation report plus a submittal package section.',
    icon: <InboxOutlined />,
  },
];

/** Report / submittal generation options (ZIP `SubmittalOptionsModal`). */
export function SubmittalOptionsModal({ open, selectedBraceCount, projectFiles, onGenerate, onCancel }: Props) {
  const { token } = theme.useToken();
  const [active, setActive] = useState<GenerateOption>('generate-report');
  const [fileIds, setFileIds] = useState<string[]>([]);

  useEffect(() => {
    if (open) {
      setActive('generate-report');
      setFileIds([]);
    }
  }, [open]);

  return (
    <Modal
      open={open}
      title="Report & Submittal"
      okText="Generate"
      onOk={() =>
        onGenerate({ includeSubmittal: active === 'generate-report-and-submittal', fileIds })
      }
      onCancel={onCancel}
      width={560}
    >
      <Space orientation="vertical" size={token.margin} style={{ width: '100%' }}>
        <Typography.Text type="secondary">
          {selectedBraceCount} brace{selectedBraceCount === 1 ? '' : 's'} selected.
        </Typography.Text>

        <Flex gap={token.marginSM} wrap="wrap">
          {OPTIONS.map((opt) => {
            const selected = active === opt.key;
            return (
              <div
                key={opt.key}
                role="button"
                tabIndex={0}
                onClick={() => setActive(opt.key)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') setActive(opt.key);
                }}
                style={{
                  position: 'relative',
                  flex: '1 1 220px',
                  cursor: 'pointer',
                  padding: token.padding,
                  borderRadius: token.borderRadiusLG,
                  border: `${token.lineWidth}px ${token.lineType} ${
                    selected ? token.colorPrimary : token.colorBorder
                  }`,
                  background: selected ? token.colorPrimaryBg : token.colorBgContainer,
                  boxShadow: selected ? token.boxShadowTertiary : 'none',
                }}
              >
                {selected ? (
                  <CheckCircleFilled
                    style={{ position: 'absolute', top: token.paddingXS, right: token.paddingXS, color: token.colorPrimary }}
                  />
                ) : null}
                <Space orientation="vertical" size={token.marginXXS}>
                  <Typography.Text style={{ fontSize: token.fontSizeHeading4 }}>{opt.icon}</Typography.Text>
                  <Typography.Text strong>{opt.title}</Typography.Text>
                  <Typography.Text type="secondary">{opt.description}</Typography.Text>
                </Space>
              </div>
            );
          })}
        </Flex>

        {projectFiles.length > 0 ? (
          <Space orientation="vertical" size={token.marginXS} style={{ width: '100%' }}>
            <Typography.Text strong>Attach project files</Typography.Text>
            <Checkbox.Group
              value={fileIds}
              onChange={(vals) => setFileIds(vals as string[])}
              style={{ width: '100%' }}
            >
              <Space orientation="vertical" size={token.marginXXS}>
                {projectFiles.map((file) => (
                  <Checkbox key={file.id} value={file.id}>
                    {file.title}
                  </Checkbox>
                ))}
              </Space>
            </Checkbox.Group>
          </Space>
        ) : null}
      </Space>
    </Modal>
  );
}
