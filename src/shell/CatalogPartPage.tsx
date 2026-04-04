import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { catalogPartByKey } from '../catalog/catalogDemoData';
import { figmaSmallNormal, figmaTextStyleToReactCss } from '../theme/figmaTypography';
import { useSubmittalDraft } from '../context/SubmittalDraftContext';
import { PROJECT_SEED_ROWS } from './projectSeed';
import {
  App,
  Button,
  Descriptions,
  Flex,
  Modal,
  Select,
  Space,
  Tooltip,
  Typography,
  theme,
} from '../ui/antd';

/**
 * Single part page: quick download without a project; submittal adds a cut-sheet PDF line after project pick.
 */
export function CatalogPartPage() {
  const { token } = theme.useToken();
  const { message } = App.useApp();
  const { partId } = useParams<{ partId: string }>();
  const navigate = useNavigate();
  const { addLine } = useSubmittalDraft();

  const [gateOpen, setGateOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string | undefined>(undefined);

  const part = partId ? catalogPartByKey(partId) : undefined;
  const label = part?.sku ?? partId ?? '—';
  const partTitle = part?.description ?? `Part ${label}`;

  const openGate = () => {
    setSelectedProjectId(PROJECT_SEED_ROWS[0]?.key);
    setGateOpen(true);
  };

  const confirmAddToSubmittal = () => {
    if (!partId || !part || !selectedProjectId) {
      message.warning('Choose a project to continue.');
      return;
    }
    const projectName =
      PROJECT_SEED_ROWS.find((p) => p.key === selectedProjectId)?.name ?? 'project';
    addLine(selectedProjectId, {
      partKey: part.key,
      partSku: part.sku,
      title: `${part.sku} — ${part.description}`,
    });
    message.success(`${part.sku} cut sheet added to submittal for ${projectName}.`);
    setGateOpen(false);
    navigate(`/projects/${selectedProjectId}/submittal`);
  };

  return (
    <Space orientation="vertical" size={token.marginLG} style={{ width: '100%' }}>
      <Typography.Title level={3} style={{ margin: 0 }}>
        {partTitle}
      </Typography.Title>
      <Typography.Paragraph type="secondary" style={{ margin: 0 }}>
        The cut sheet PDF for this part can be added to a <Typography.Text strong>submittal package</Typography.Text>{' '}
        under a project. Submittal PDFs are managed in{' '}
        <Typography.Text strong>Submittal manager</Typography.Text> for the project you choose.
      </Typography.Paragraph>

      <Descriptions column={1} size="small" bordered styles={{ label: { width: token.controlHeight * 5 } }}>
        <Descriptions.Item label="SKU">{label}</Descriptions.Item>
        <Descriptions.Item label="Document">Cut sheet PDF (stub)</Descriptions.Item>
      </Descriptions>

      <Flex wrap="wrap" gap={token.margin} align="center">
        <Tooltip title="Downloads immediately. No project required.">
          <Button onClick={() => message.info('Stub: file would download now.')}>Quick download</Button>
        </Tooltip>
        <Tooltip title="Pick a project, then opens Submittal manager with this PDF queued.">
          <Button type="primary" onClick={openGate}>
            Add PDF to submittal
          </Button>
        </Tooltip>
      </Flex>
      <Typography.Text type="secondary" style={figmaTextStyleToReactCss(figmaSmallNormal)}>
        Quick download: no project. Add to submittal: requires a project; you&apos;ll land in Submittal
        manager for that project.
      </Typography.Text>

      <Modal
        title="Add cut sheet to submittal"
        open={gateOpen}
        onCancel={() => setGateOpen(false)}
        onOk={confirmAddToSubmittal}
        okText="Add and open submittal"
        destroyOnClose
      >
        <Space orientation="vertical" size={token.margin} style={{ width: '100%' }}>
          <Typography.Paragraph style={{ margin: 0 }}>
            Submittals are organized per project. Choose which project should receive this cut sheet; we
            open <Typography.Text strong>Submittal manager</Typography.Text> so you can review or add more
            PDFs.
          </Typography.Paragraph>
          <div>
            <Typography.Text type="secondary" style={{ display: 'block', marginBottom: token.marginXS }}>
              Project
            </Typography.Text>
            <Select
              style={{ width: '100%' }}
              placeholder="Select a project"
              value={selectedProjectId}
              onChange={setSelectedProjectId}
              options={PROJECT_SEED_ROWS.map((p) => ({ value: p.key, label: p.name }))}
            />
          </div>
        </Space>
      </Modal>
    </Space>
  );
}
