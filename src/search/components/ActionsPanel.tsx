import { PlusOutlined } from '@ant-design/icons';
import type { CSSProperties, ReactNode } from 'react';

import type { PartActionPayload } from '../usePartActionFlows';
import { usePartActionFlows } from '../usePartActionFlows';
import type { PartVariationRow } from '../partDetailDemoData';
import { useVariantActionFlows } from '../useVariantActionFlows';
import { Button, Flex, Tooltip, theme } from '../../ui/antd';

const VARIATION_REQUIRED_TOOLTIP = 'Select a variation to enable this action.';
const FILE_UNAVAILABLE_TOOLTIP = "This file type isn't available for the selected variation.";

type Props = {
  partKey: string;
  payload: PartActionPayload;
  selectedVariation: PartVariationRow | null;
};

function ActionButtonWrap({
  disabled,
  tooltip,
  children,
}: {
  disabled: boolean;
  tooltip?: string;
  children: ReactNode;
}) {
  if (!disabled || !tooltip) return <>{children}</>;

  return (
    <Tooltip title={tooltip}>
      <span style={{ display: 'block', width: '100%' }} tabIndex={0}>
        {children}
      </span>
    </Tooltip>
  );
}

/** Actions card — figure-level and variation-gated download/BOM actions. */
export function ActionsPanel({ partKey, payload, selectedVariation }: Props) {
  const { token } = theme.useToken();
  const figureFlows = usePartActionFlows(payload);
  const variantFlows = useVariantActionFlows(partKey, selectedVariation);

  const enabledOutlineStyle: CSSProperties = {
    color: token.colorPrimary,
    borderColor: token.colorPrimary,
    fontWeight: token.fontWeightStrong,
    textAlign: 'left',
    justifyContent: 'flex-start',
  };

  const actionBtn = (
    label: string,
    onClick: () => void,
    options: { disabled?: boolean; tooltip?: string; enabled?: boolean },
  ) => (
    <ActionButtonWrap disabled={Boolean(options.disabled)} tooltip={options.tooltip}>
      <Button
        block
        type="default"
        icon={<PlusOutlined />}
        disabled={options.disabled}
        onClick={onClick}
        style={
          options.enabled && !options.disabled
            ? enabledOutlineStyle
            : { textAlign: 'left', justifyContent: 'flex-start' }
        }
      >
        {label}
      </Button>
    </ActionButtonWrap>
  );

  const fileTypeEnabled = (fileType: string) =>
    Boolean(selectedVariation?.drawingFileTypes.includes(fileType));

  const fileTypeAction = (label: string, fileType: string) => {
    const hasVariation = Boolean(selectedVariation);
    const available = fileTypeEnabled(fileType);
    const disabled = !hasVariation || !available;
    const tooltip = !hasVariation
      ? VARIATION_REQUIRED_TOOLTIP
      : !available
        ? FILE_UNAVAILABLE_TOOLTIP
        : undefined;

    return actionBtn(
      label,
      () => variantFlows.queueSingleFileType(fileType),
      { disabled, tooltip, enabled: !disabled },
    );
  };

  return (
    <>
      <Flex vertical gap={token.marginXS} style={{ width: '100%' }}>
        {actionBtn('Add Part to Submittal Package', () => figureFlows.requestAction('submittal'), {
          enabled: true,
        })}
        {actionBtn('Add Revit File to Downloads', () => figureFlows.requestAction('revit-queue'), {
          enabled: true,
        })}
        {actionBtn(
          'Add Part Variant to BOM',
          () => variantFlows.requestAction('bom'),
          {
            disabled: !selectedVariation,
            tooltip: !selectedVariation ? VARIATION_REQUIRED_TOOLTIP : undefined,
            enabled: Boolean(selectedVariation),
          },
        )}
        {fileTypeAction('Add PDF File to Downloads', 'PDF')}
        {fileTypeAction('Add STEP File to Downloads', 'STEP')}
        {fileTypeAction('Add DWG File to Downloads', 'DWG')}
      </Flex>
      {figureFlows.modals}
      {variantFlows.modals}
    </>
  );
}
