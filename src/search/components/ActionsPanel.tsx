import { CheckOutlined, PlusOutlined } from '@ant-design/icons';
import type { ReactNode } from 'react';

import type { PartActionPayload } from '../usePartActionFlows';
import { usePartActionFlows } from '../usePartActionFlows';
import type { PartVariationRow } from '../partDetailDemoData';
import { useVariantActionFlows } from '../useVariantActionFlows';
import { Button, Divider, Flex, Space, Tag, Tooltip, Typography, theme } from '../../ui/antd';

const VARIATION_REQUIRED_TOOLTIP = 'Select a variation to enable this action.';
const FILE_UNAVAILABLE_TOOLTIP = "This file type isn't available for the selected variation.";

type Props = {
  partKey: string;
  payload: PartActionPayload;
  selectedVariation: PartVariationRow | null;
};

function ActionRow({
  label,
  hint,
  addLabel,
  onAdd,
  disabled,
  disabledTooltip,
  inState,
  inStateLabel,
}: {
  label: string;
  hint?: string;
  addLabel: string;
  onAdd: () => void;
  disabled?: boolean;
  disabledTooltip?: string;
  inState?: boolean;
  inStateLabel?: string;
}) {
  const { token } = theme.useToken();

  const addButton = (
    <Button
      type="default"
      size="middle"
      icon={<PlusOutlined />}
      disabled={disabled}
      onClick={onAdd}
      aria-label={addLabel}
    />
  );

  return (
    <Flex align="center" justify="space-between" gap={token.marginSM} style={{ width: '100%' }}>
      <Flex vertical gap={token.marginXXS} style={{ minWidth: 0, flex: 1 }}>
        <Typography.Text>{label}</Typography.Text>
        {hint ? (
          <Typography.Text type="secondary" style={{ fontSize: token.fontSizeSM }}>
            {hint}
          </Typography.Text>
        ) : null}
      </Flex>
      {inState ? (
        <Tag icon={<CheckOutlined />} color="success">
          {inStateLabel}
        </Tag>
      ) : disabled && disabledTooltip ? (
        <Tooltip title={disabledTooltip}>
          <span>{addButton}</span>
        </Tooltip>
      ) : (
        <Tooltip title={addLabel}>{addButton}</Tooltip>
      )}
    </Flex>
  );
}

function ActionSection({ title, children }: { title: string; children: ReactNode }) {
  const { token } = theme.useToken();
  return (
    <Space orientation="vertical" size={token.marginSM} style={{ width: '100%' }}>
      <Typography.Text
        type="secondary"
        style={{
          display: 'block',
          fontSize: token.fontSizeSM,
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
        }}
      >
        {title}
      </Typography.Text>
      <Space orientation="vertical" size={token.marginSM} style={{ width: '100%' }}>
        {children}
      </Space>
    </Space>
  );
}

/** Actions card — grouped rows with compact + controls (labels left, add on the right). */
export function ActionsPanel({ partKey, payload, selectedVariation }: Props) {
  const { token } = theme.useToken();
  const figureFlows = usePartActionFlows(payload);
  const variantFlows = useVariantActionFlows(partKey, selectedVariation);

  const fileTypeEnabled = (fileType: string) =>
    Boolean(selectedVariation?.drawingFileTypes.includes(fileType));

  const fileTypeRow = (fileType: string) => {
    const hasVariation = Boolean(selectedVariation);
    const available = fileTypeEnabled(fileType);
    const disabled = !hasVariation || !available;
    const tooltip = !hasVariation
      ? VARIATION_REQUIRED_TOOLTIP
      : !available
        ? FILE_UNAVAILABLE_TOOLTIP
        : `Add ${fileType} to Download Center`;

    return (
      <ActionRow
        key={fileType}
        label={`${fileType} file`}
        hint={hasVariation && !available ? 'Not available for this variant' : undefined}
        addLabel={`Add ${fileType} to Download Center`}
        onAdd={() => variantFlows.queueSingleFileType(fileType)}
        disabled={disabled}
        disabledTooltip={tooltip}
      />
    );
  };

  return (
    <>
      <Space orientation="vertical" size={token.marginMD} style={{ width: '100%' }}>
        <ActionSection title="Add to project">
          <ActionRow
            label="Submittal package"
            hint="Figure-level cut sheet"
            addLabel="Add to submittal package"
            onAdd={() => figureFlows.requestAction('submittal')}
            inState={figureFlows.isInSubmittalPackage}
            inStateLabel="In Submittal"
          />
          <ActionRow
            label="BOM"
            hint={selectedVariation ? `Variant ${selectedVariation.sku}` : 'Select a variant first'}
            addLabel="Add variant to BOM"
            onAdd={() => variantFlows.requestAction('bom')}
            disabled={!selectedVariation}
            disabledTooltip={VARIATION_REQUIRED_TOOLTIP}
            inState={variantFlows.isInBom}
            inStateLabel="In BOM"
          />
        </ActionSection>

        <Divider style={{ margin: 0 }} />

        <ActionSection title="Send to Download Center">
          <ActionRow
            label="Revit file"
            addLabel="Add Revit file to Download Center"
            onAdd={() => figureFlows.requestAction('revit-queue')}
          />
          {fileTypeRow('PDF')}
          {fileTypeRow('STEP')}
          {fileTypeRow('DWG')}
        </ActionSection>
      </Space>
      {figureFlows.modals}
      {variantFlows.modals}
    </>
  );
}
