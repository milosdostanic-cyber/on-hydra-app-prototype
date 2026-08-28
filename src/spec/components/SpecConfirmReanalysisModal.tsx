import { Alert, Button, Flex, Modal, Typography, theme } from '../../ui/antd';

export function SpecConfirmReanalysisModal({
  open,
  documentTitle,
  division,
  masterVersion,
  confirming,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  documentTitle: string;
  division: string;
  masterVersion: string;
  confirming?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const { token } = theme.useToken();

  return (
    <Modal
      open={open}
      onCancel={onCancel}
      destroyOnHidden
      title={
        <Flex vertical gap={token.marginXS}>
          <Typography.Text type="secondary">RE-ANALYSIS</Typography.Text>
          <Typography.Title level={4} style={{ margin: 0 }}>
            Re-run analysis now?
          </Typography.Title>
        </Flex>
      }
      footer={
        <Flex justify="flex-end" gap={token.marginXS}>
          <Button size="large" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            type="primary"
            size="large"
            loading={confirming}
            onClick={onConfirm}
          >
            Re-run analysis
          </Button>
        </Flex>
      }
    >
      <Flex vertical gap={token.marginLG}>
        <Typography.Text type="secondary">
          The edited document {documentTitle} will be analyzed again against ASC Master
          SPEC — Division {division}, Version {masterVersion}.
        </Typography.Text>
        <Alert
          type="info"
          title="Previous decisions are preserved when possible"
          description="Accepted and denied recommendations remain when the related customer text has not changed."
        />
        <Typography.Text type="secondary">
          Export remains unavailable until this re-analysis finishes.
        </Typography.Text>
      </Flex>
    </Modal>
  );
}
