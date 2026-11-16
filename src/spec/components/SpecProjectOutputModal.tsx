import { Button, Flex, Input, Modal, Radio, Select, Typography, theme } from '../../ui/antd';
import type { SpecProjectOutputKind, SpecProjectOutputMode } from '../data/types';
import { hydraBaseStrong, hydraTextStyleToReactCss } from '../../theme/hydraTypography';

export function SpecProjectOutputModal({
  kind,
  open,
  projectTitle,
  documentTitle,
  versionLabel,
  mode,
  onModeChange,
  name,
  onNameChange,
  existingOptions,
  selectedExistingId,
  onSelectExisting,
  submitting,
  canSubmit,
  noApprovedProducts,
  onCancel,
  onConfirm,
}: {
  kind: SpecProjectOutputKind;
  open: boolean;
  projectTitle: string;
  documentTitle: string;
  versionLabel: string;
  mode: SpecProjectOutputMode;
  onModeChange: (mode: SpecProjectOutputMode) => void;
  name: string;
  onNameChange: (value: string) => void;
  existingOptions: Array<{ id: string; name: string }>;
  selectedExistingId?: string;
  onSelectExisting: (id: string) => void;
  submitting?: boolean;
  canSubmit: boolean;
  noApprovedProducts: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const { token } = theme.useToken();
  const isBom = kind === 'bom';
  const createLabel = isBom ? 'Create a new BOM' : 'Create a new Submittal Package';
  const updateLabel = isBom ? 'Add to an existing BOM' : 'Add to an existing Submittal Package';
  const createCopy = isBom
    ? 'Start a BOM from the approved product recommendations.'
    : 'Start a package from the approved product recommendations.';
  const updateCopy = isBom
    ? 'Add the approved recommendations to a BOM already in this Project.'
    : 'Add the approved recommendations to a package already in this Project.';
  const primaryLabel =
    mode === 'create'
      ? isBom
        ? 'Create BOM'
        : 'Create package'
      : isBom
        ? 'Update BOM'
        : 'Update package';
  const selectedStyle = (selected: boolean) => ({
    border: `${token.lineWidth}px ${token.lineType} ${
      selected ? token.colorPrimary : token.colorBorder
    }`,
    background: selected ? token.colorFillAlter : token.colorBgContainer,
    padding: token.paddingSM,
    borderRadius: token.borderRadiusLG,
    cursor: 'pointer' as const,
  });

  return (
    <Modal
      open={open}
      onCancel={onCancel}
      destroyOnHidden
      title={
        <Flex vertical gap={token.marginXS}>
          <Typography.Text type="secondary">PROJECT OUTPUT</Typography.Text>
          <Typography.Title level={4} style={{ margin: 0 }}>
            {isBom ? 'Create or update a BOM' : 'Create or update a Submittal Package'}
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
            loading={submitting}
            disabled={!canSubmit || noApprovedProducts}
            onClick={onConfirm}
          >
            {primaryLabel}
          </Button>
        </Flex>
      }
    >
      <Flex vertical gap={token.marginLG}>
        <Typography.Text type="secondary">
          {projectTitle} • Source: {documentTitle}, {versionLabel}
        </Typography.Text>
        {noApprovedProducts ? (
          <Typography.Text type="secondary">
            Outputs use accepted product recommendations only. Accept a product recommendation
            first.
          </Typography.Text>
        ) : null}
        <Radio.Group
          value={mode}
          onChange={(event) => onModeChange(event.target.value)}
          style={{ width: '100%' }}
        >
          <Flex vertical gap={token.marginSM}>
            <div
              style={selectedStyle(mode === 'create')}
              onClick={() => onModeChange('create')}
            >
              <Radio value="create">
                <Flex vertical gap={token.marginXXS}>
                  <Typography.Text style={hydraTextStyleToReactCss(hydraBaseStrong)}>{createLabel}</Typography.Text>
                  {mode === 'create' ? (
                    <Typography.Text type="secondary">{createCopy}</Typography.Text>
                  ) : null}
                </Flex>
              </Radio>
            </div>
            <div
              style={selectedStyle(mode === 'update')}
              onClick={() => onModeChange('update')}
            >
              <Radio value="update">
                <Flex vertical gap={token.marginXXS}>
                  <Typography.Text style={hydraTextStyleToReactCss(hydraBaseStrong)}>{updateLabel}</Typography.Text>
                  {mode === 'update' ? (
                    <Typography.Text type="secondary">{updateCopy}</Typography.Text>
                  ) : null}
                </Flex>
              </Radio>
            </div>
          </Flex>
        </Radio.Group>
        {mode === 'create' ? (
          <Flex vertical gap={token.marginXXS}>
            <Typography.Text style={hydraTextStyleToReactCss(hydraBaseStrong)}>{isBom ? 'BOM name' : 'Package name'}</Typography.Text>
            <Input size="large" value={name} onChange={(event) => onNameChange(event.target.value)} />
          </Flex>
        ) : (
          <Flex vertical gap={token.marginXXS}>
            <Typography.Text style={hydraTextStyleToReactCss(hydraBaseStrong)}>{isBom ? 'Existing BOM' : 'Existing package'}</Typography.Text>
            <Select
              size="large"
              value={selectedExistingId}
              onChange={onSelectExisting}
              placeholder={
                existingOptions.length === 0
                  ? isBom
                    ? 'No BOM exists in this Project yet'
                    : 'No package exists in this Project yet'
                  : isBom
                    ? 'Select a BOM'
                    : 'Select a package'
              }
              options={existingOptions.map((option) => ({
                value: option.id,
                label: option.name,
              }))}
            />
          </Flex>
        )}
      </Flex>
    </Modal>
  );
}
