import { Alert, Button, Flex, Modal, Typography, theme } from '../../ui/antd';
import { systemTypeDivision, systemTypeLabel } from '../constants/specStatusVocabulary';
import type { SpecDocument } from '../data/types';

export function SpecAnalysisFailedModal({
  open,
  document,
  retrying,
  onCancel,
  onRetry,
  onReplaceFile,
}: {
  open: boolean;
  document?: SpecDocument;
  retrying?: boolean;
  onCancel: () => void;
  onRetry: () => void;
  onReplaceFile: () => void;
}) {
  const { token } = theme.useToken();
  const division = document
    ? document.divisionHint ?? systemTypeDivision[document.systemType]
    : '';
  const masterVersion = document?.ascMaster?.version ?? 'Not recorded';

  return (
    <Modal
      open={open}
      onCancel={onCancel}
      destroyOnHidden
      title={
        <Typography.Title level={4} style={{ margin: 0 }}>
          Analysis could not finish
        </Typography.Title>
      }
      footer={
        <Flex justify="flex-end" gap={token.marginXS} wrap="wrap">
          <Button size="large" onClick={onCancel}>
            Cancel
          </Button>
          <Button size="large" onClick={onReplaceFile}>
            Replace file
          </Button>
          <Button type="primary" size="large" loading={retrying} onClick={onRetry}>
            Retry analysis
          </Button>
        </Flex>
      }
    >
      <Flex vertical gap={token.marginLG}>
        <Alert
          type="error"
          showIcon
          title="Something went wrong while reading this file"
          description={
            document?.failureReason ??
            'Retry analysis, replace the file, or cancel and return later. The current customer version is kept.'
          }
        />
        {document ? (
          <Flex vertical gap={token.marginSM}>
            <Typography.Text type="secondary">Saved analysis input</Typography.Text>
            <Typography.Text>
              File: {document.fileName}
            </Typography.Text>
            <Typography.Text>
              Division {division} — {systemTypeLabel[document.systemType]}
            </Typography.Text>
            <Typography.Text>
              Master SPEC Version {masterVersion}
            </Typography.Text>
          </Flex>
        ) : null}
      </Flex>
    </Modal>
  );
}
