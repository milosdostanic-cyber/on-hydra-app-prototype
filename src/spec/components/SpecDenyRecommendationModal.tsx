import { useEffect, useState } from 'react';

import { Button, Flex, Input, Modal, Typography, theme } from '../../ui/antd';
import { hydraBaseStrong, hydraTextStyleToReactCss } from '../../theme/hydraTypography';

export function SpecDenyRecommendationModal({
  open,
  initialReason,
  saving,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  initialReason?: string;
  saving?: boolean;
  onCancel: () => void;
  onConfirm: (reason?: string) => void;
}) {
  const { token } = theme.useToken();
  const [reason, setReason] = useState('');

  useEffect(() => {
    if (open) setReason(initialReason ?? '');
  }, [initialReason, open]);

  return (
    <Modal
      open={open}
      title="Deny this recommendation?"
      onCancel={onCancel}
      destroyOnHidden
      footer={
        <Flex justify="flex-end" gap={token.marginXS}>
          <Button size="large" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            danger
            size="large"
            loading={saving}
            onClick={() => onConfirm(reason.trim() || undefined)}
          >
            Deny recommendation
          </Button>
        </Flex>
      }
    >
      <Flex vertical gap={token.marginLG}>
        <Flex vertical gap={token.marginXS}>
          <Typography.Text type="secondary" style={hydraTextStyleToReactCss(hydraBaseStrong)}>
            REVIEW DECISION
          </Typography.Text>
          <Typography.Text type="secondary">
            The recommendation will remain in the history and count as reviewed.
          </Typography.Text>
        </Flex>
        <Flex vertical gap={token.marginXS}>
          <Typography.Text style={hydraTextStyleToReactCss(hydraBaseStrong)}>Reason (optional)</Typography.Text>
          <Input.TextArea
            autoFocus
            rows={4}
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            placeholder="Add context for the team, or leave this blank."
          />
        </Flex>
      </Flex>
    </Modal>
  );
}
