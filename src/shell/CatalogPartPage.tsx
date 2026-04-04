import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { Button, Flex, Modal, Space, Typography, theme } from '../ui/antd';

/**
 * Single "part page" stub: quick actions without a project vs. gate when a project is required.
 */
export function CatalogPartPage() {
  const { token } = theme.useToken();
  const { partId } = useParams<{ partId: string }>();
  const navigate = useNavigate();
  const [gateOpen, setGateOpen] = useState(false);

  const label = partId ?? '—';

  return (
    <Space orientation="vertical" size={token.marginLG} style={{ width: '100%' }}>
      <Typography.Title level={3} style={{ margin: 0 }}>
        Part {label}
      </Typography.Title>
      <Typography.Paragraph type="secondary" style={{ margin: 0 }}>
        Unified part page (stub). Quick download stays available without a project; submittal / project
        workflows open a gate to create or select a project.
      </Typography.Paragraph>
      <Flex wrap="wrap" gap={token.margin}>
        <Button
          onClick={() => {
            Modal.info({
              title: 'Quick download',
              content: 'No project required — this is a stub for an immediate file fetch.',
            });
          }}
        >
          Quick download
        </Button>
        <Button type="primary" onClick={() => setGateOpen(true)}>
          Add PDF to submittal
        </Button>
      </Flex>

      <Modal
        title="Project required"
        open={gateOpen}
        onCancel={() => setGateOpen(false)}
        onOk={() => {
          setGateOpen(false);
          navigate('/projects');
        }}
        okText="Go to projects"
      >
        <Typography.Paragraph style={{ margin: 0 }}>
          To add this PDF to a submittal, create or open a project first. You can keep browsing the catalog
          without one until you choose an action that needs a project.
        </Typography.Paragraph>
      </Modal>
    </Space>
  );
}
