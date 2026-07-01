import { hydraBaseNormal, hydraTextStyleToReactCss } from '../../theme/hydraTypography';
import type { PartActionPayload } from '../usePartActionFlows';
import { usePartActionFlows } from '../usePartActionFlows';
import type { PartVariationRow } from '../partDetailDemoData';
import { useVariantActionFlows } from '../useVariantActionFlows';
import { Button, Flex, Tooltip, Typography, theme } from '../../ui/antd';

const VARIATION_REQUIRED_TOOLTIP = 'Select a variation to enable this action.';
const FILE_UNAVAILABLE_TOOLTIP = "This file type isn't available for the selected variation.";

type Props = {
  partKey: string;
  payload: PartActionPayload;
  selectedVariation: PartVariationRow | null;
};

function ActionButtonCell({
  label,
  hint,
  onAdd,
  disabled,
  disabledTooltip,
}: {
  label: string;
  hint?: string;
  onAdd: () => void;
  disabled?: boolean;
  disabledTooltip?: string;
}) {
  const { token } = theme.useToken();

  const button = (
    <Button type="default" size="middle" disabled={disabled} onClick={onAdd} block>
      {label}
    </Button>
  );

  return (
    <Flex vertical gap={token.marginXXS} style={{ flex: '1 1 0', minWidth: 0 }}>
      {disabled && disabledTooltip ? (
        <Tooltip title={disabledTooltip}>
          <span>{button}</span>
        </Tooltip>
      ) : (
        <Tooltip title={label}>{button}</Tooltip>
      )}
      {hint ? (
        <Typography.Text type="secondary" style={hydraTextStyleToReactCss(hydraBaseNormal)}>
          {hint}
        </Typography.Text>
      ) : null}
    </Flex>
  );
}

/** Variation-gated action buttons shown inside the Available Sizes & Variations card. */
export function ActionsPanel({ partKey, payload, selectedVariation }: Props) {
  const { token } = theme.useToken();
  const figureFlows = usePartActionFlows(payload);
  const variantFlows = useVariantActionFlows(partKey, selectedVariation);
  const hasVariation = Boolean(selectedVariation);

  const fileTypeEnabled = (fileType: string) =>
    Boolean(selectedVariation?.drawingFileTypes.includes(fileType));

  const fileTypeCell = (fileType: string) => {
    const available = fileTypeEnabled(fileType);
    const disabled = !hasVariation || !available;
    const tooltip = !hasVariation
      ? VARIATION_REQUIRED_TOOLTIP
      : !available
        ? FILE_UNAVAILABLE_TOOLTIP
        : `Add ${fileType} to Download Center`;

    return (
      <ActionButtonCell
        key={fileType}
        label={`Add ${fileType} File to Downloads`}
        hint={hasVariation && !available ? 'Not available for this variant' : undefined}
        onAdd={() => variantFlows.queueSingleFileType(fileType)}
        disabled={disabled}
        disabledTooltip={tooltip}
      />
    );
  };

  return (
    <>
      <Flex vertical gap={token.marginSM} style={{ width: '100%' }}>
        <Typography.Paragraph
          type="secondary"
          style={{ margin: 0, ...hydraTextStyleToReactCss(hydraBaseNormal) }}
        >
          Choose a variation to add this part to a BOM, add it to a submittal package, or download files.
        </Typography.Paragraph>

        <Flex gap={token.marginSM} align="flex-start" style={{ width: '100%' }}>
          <ActionButtonCell
            label="Add Part Variant to BOM"
            onAdd={() => variantFlows.requestAction('bom')}
            disabled={!hasVariation}
            disabledTooltip={VARIATION_REQUIRED_TOOLTIP}
          />
          <ActionButtonCell
            label="Add Part to Submittal Package"
            onAdd={() => figureFlows.requestAction('submittal')}
            disabled={!hasVariation}
            disabledTooltip={VARIATION_REQUIRED_TOOLTIP}
          />
          <ActionButtonCell
            label="Add Revit File to Downloads"
            onAdd={() => figureFlows.requestAction('revit-queue')}
            disabled={!hasVariation}
            disabledTooltip={VARIATION_REQUIRED_TOOLTIP}
          />
          {fileTypeCell('PDF')}
          {fileTypeCell('STEP')}
          {fileTypeCell('DWG')}
        </Flex>
      </Flex>
      {figureFlows.modals}
      {variantFlows.modals}
    </>
  );
}
