import { useState } from 'react';

import { useSubmittalPackages } from '../../context/SubmittalPackagesContext';
import { SubmittalDestinationFields } from '../components/SubmittalDestinationFields';
import { useSubmittalDestinationFields } from '../components/useSubmittalDestinationFields';
import { figureRowByPartKey } from './downloadHistorySelection';
import type { HistoryFigureRow } from './downloadHistoryRows';
import { Alert, App, Flex, Modal, Space, Typography, theme } from '../../ui/antd';
import { hydraBaseStrong, hydraTextStyleToReactCss } from '../../theme/hydraTypography';

const COPY = {
  title: 'Create Submittal Package',
  ok: 'Create package',
  adding: 'These parts will be added',
  empty: 'Select at least one figure or variation first.',
};

export type HistorySubmittalPart = {
  partKey: string;
  displayName: string;
  figureNumber: string;
};

type Props = {
  open: boolean;
  projectId: string;
  partKeys: string[];
  rows: HistoryFigureRow[];
  onCancel: () => void;
  onCreated: (info: { packageId: string; packageName: string; partCount: number }) => void;
};

export function partsFromHistorySelection(
  partKeys: string[],
  rows: HistoryFigureRow[],
): HistorySubmittalPart[] {
  return partKeys.flatMap((partKey) => {
    const row = figureRowByPartKey(rows, partKey);
    if (!row) return [];
    return [
      {
        partKey: row.partKey,
        displayName: row.name,
        figureNumber: row.figureNumber,
      },
    ];
  });
}

/**
 * Create a submittal package (or add to an existing one) from history selection.
 * Child variants contribute their parent part; parent + child collapse to one entry (FR-11).
 */
export function CreateSubmittalFromHistoryModal({
  open,
  projectId,
  partKeys,
  rows,
  onCancel,
  onCreated,
}: Props) {
  const { token } = theme.useToken();
  const { message } = App.useApp();
  const { addPartToPackage } = useSubmittalPackages();
  const fields = useSubmittalDestinationFields(projectId);
  const [submitting, setSubmitting] = useState(false);

  const parts = partsFromHistorySelection(partKeys, rows);

  const handleOk = () => {
    if (parts.length === 0 || !fields.canSubmit || submitting) return;
    const dest = fields.resolve();
    if (!dest) {
      message.error('Choose a package, or name a new one, to continue.');
      return;
    }

    setSubmitting(true);
    try {
      for (const part of parts) {
        addPartToPackage(dest.packageId, {
          partKey: part.partKey,
          displayName: part.displayName,
          figureNumber: part.figureNumber,
        });
      }
      onCreated({ packageId: dest.packageId, packageName: dest.packageName, partCount: parts.length });
    } catch {
      message.error('Could not add these parts to the package. Try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      title={COPY.title}
      width={token.screenSM}
      okText={COPY.ok}
      okButtonProps={{ disabled: !fields.canSubmit || parts.length === 0, loading: submitting }}
      onOk={handleOk}
      onCancel={onCancel}
      destroyOnClose
    >
      <Space orientation="vertical" size={token.marginLG} style={{ width: '100%' }}>
        {parts.length === 0 ? (
          <Alert type="info" showIcon title={COPY.empty} />
        ) : (
          <Flex
            vertical
            gap={token.marginXXS}
            style={{
              padding: token.padding,
              border: `${token.lineWidth}px ${token.lineType} ${token.colorBorderSecondary}`,
              borderRadius: token.borderRadiusLG,
              background: token.colorFillQuaternary,
            }}
          >
            <Typography.Text type="secondary">{COPY.adding}</Typography.Text>
            {parts.map((part) => (
              <Typography.Text key={part.partKey} style={hydraTextStyleToReactCss(hydraBaseStrong)}>
                {part.displayName}
                {part.figureNumber ? ` · ${part.figureNumber}` : ''}
              </Typography.Text>
            ))}
          </Flex>
        )}

        <SubmittalDestinationFields
          packages={fields.packages}
          mode={fields.mode}
          onModeChange={fields.setMode}
          selectedId={fields.selectedId}
          onSelectedIdChange={fields.setSelectedId}
          newName={fields.newName}
          onNewNameChange={fields.setNewName}
        />
      </Space>
    </Modal>
  );
}
