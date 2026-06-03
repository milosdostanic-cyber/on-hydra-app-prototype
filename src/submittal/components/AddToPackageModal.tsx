import { PlusOutlined } from '@ant-design/icons';
import { useEffect, useMemo, useState } from 'react';

import { useSubmittalPackages } from '../../context/SubmittalPackagesContext';
import { Button, Divider, Form, Input, Modal, Radio, Space, Typography, theme } from '../../ui/antd';

export type AddToPackagePart = {
  partKey: string;
  displayName: string;
  figureNumber: string;
};

type Props = {
  open: boolean;
  projectId: string;
  part: AddToPackagePart | null;
  /** Fired after the part is added; receives the resolved package id + name for the success toast. */
  onAdded: (info: { packageId: string; packageName: string }) => void;
  onCancel: () => void;
};

type Mode = 'existing' | 'new';

/**
 * Pick an existing submittal package or create one on the fly, then add the current part.
 * (ZIP `AddToPackageModal`, reframed to the Hydra package context.)
 */
export function AddToPackageModal({ open, projectId, part, onAdded, onCancel }: Props) {
  const { token } = theme.useToken();
  const { packagesForProject, createPackage, addPartToPackage } = useSubmittalPackages();
  const packages = useMemo(() => packagesForProject(projectId), [packagesForProject, projectId]);

  const [mode, setMode] = useState<Mode>('existing');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [newName, setNewName] = useState('');

  useEffect(() => {
    if (!open) return;
    if (packages.length > 0) {
      setMode('existing');
      setSelectedId(packages[0].id);
    } else {
      setMode('new');
      setSelectedId(null);
    }
    setNewName('');
  }, [open, packages]);

  const canSubmit = mode === 'existing' ? Boolean(selectedId) : newName.trim().length > 0;

  const handleOk = () => {
    if (!part) return;
    let packageId = selectedId;
    let packageName = packages.find((p) => p.id === selectedId)?.name ?? '';

    if (mode === 'new') {
      const trimmed = newName.trim();
      if (!trimmed) return;
      packageId = createPackage(projectId, trimmed);
      packageName = trimmed;
    }
    if (!packageId) return;

    addPartToPackage(packageId, {
      partKey: part.partKey,
      displayName: part.displayName,
      figureNumber: part.figureNumber,
    });
    onAdded({ packageId, packageName });
  };

  return (
    <Modal
      open={open}
      title="Add to submittal package"
      okText="Add to package"
      okButtonProps={{ disabled: !canSubmit }}
      onOk={handleOk}
      onCancel={onCancel}
      destroyOnClose
    >
      {part && (
        <Typography.Paragraph type="secondary" style={{ marginBottom: token.margin }}>
          Adding <Typography.Text strong>{part.displayName}</Typography.Text> (Fig. {part.figureNumber}).
        </Typography.Paragraph>
      )}

      {packages.length > 0 && (
        <Radio.Group
          value={mode}
          onChange={(e) => setMode(e.target.value as Mode)}
          style={{ marginBottom: token.margin }}
        >
          <Radio.Button value="existing">Existing package</Radio.Button>
          <Radio.Button value="new">New package</Radio.Button>
        </Radio.Group>
      )}

      {mode === 'existing' && packages.length > 0 ? (
        <Radio.Group
          value={selectedId}
          onChange={(e) => setSelectedId(e.target.value as string)}
          style={{ width: '100%' }}
        >
          <Space orientation="vertical" size={token.marginXS} style={{ width: '100%' }}>
            {packages.map((pkg) => (
              <Radio key={pkg.id} value={pkg.id}>
                {pkg.name}{' '}
                <Typography.Text type="secondary">
                  · {pkg.parts.length} part{pkg.parts.length === 1 ? '' : 's'}
                </Typography.Text>
              </Radio>
            ))}
          </Space>
        </Radio.Group>
      ) : (
        <Form layout="vertical" requiredMark={false}>
          <Form.Item label="New package name">
            <Input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="e.g. Level 2 Mechanical Room — Submittal Rev 2"
              autoFocus
              maxLength={120}
              onPressEnter={handleOk}
            />
          </Form.Item>
        </Form>
      )}

      {mode === 'existing' && packages.length > 0 && (
        <>
          <Divider style={{ margin: `${token.marginSM}px 0` }} />
          <Button type="link" icon={<PlusOutlined />} style={{ padding: 0 }} onClick={() => setMode('new')}>
            Create a new package instead
          </Button>
        </>
      )}
    </Modal>
  );
}
