import { PlusOutlined } from '@ant-design/icons';
import { hydraBaseNormal, hydraTextStyleToReactCss } from '../../theme/hydraTypography';
import type { PartActionPayload } from '../usePartActionFlows';
import { usePartActionFlows } from '../usePartActionFlows';
import type { PartVariationRow } from '../partDetailDemoData';
import { useVariantActionFlows } from '../useVariantActionFlows';
import { Button, Col, Flex, Row, Tooltip, Typography, theme } from '../../ui/antd';

const VARIATION_REQUIRED_TOOLTIP = 'Select a variation to enable this action.';
const FILE_UNAVAILABLE_TOOLTIP = "This file type isn't available for the selected variation.";

type Props = {
  partKey: string;
  payload: PartActionPayload;
  variations: PartVariationRow[];
  selectedVariation: PartVariationRow | null;
  /** `stack` = full-width column (sidebar). `grid` = responsive 2–3 col grid (wide footer). */
  layout?: 'stack' | 'grid';
};

function ActionButtonCell({
  label,
  onAdd,
  disabled,
  disabledTooltip,
}: {
  label: string;
  onAdd: () => void;
  disabled?: boolean;
  disabledTooltip?: string;
}) {
  const button = (
    <Button
      type="default"
      size="middle"
      icon={<PlusOutlined />}
      disabled={disabled}
      onClick={onAdd}
      block
    >
      {label}
    </Button>
  );

  return disabled && disabledTooltip ? (
    <Tooltip title={disabledTooltip}>
      <span style={{ display: 'block', width: '100%' }}>{button}</span>
    </Tooltip>
  ) : (
    button
  );
}

/** Variation-gated action buttons shown inside the Available Sizes & Variations card. */
export function ActionsPanel({
  partKey,
  payload,
  variations,
  selectedVariation,
  layout = 'grid',
}: Props) {
  const { token } = theme.useToken();
  const figureFlows = usePartActionFlows(payload);
  const variantFlows = useVariantActionFlows(partKey, selectedVariation, variations);
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
        : `Add ${fileType} to Content`;

    return (
      <ActionButtonCell
        key={fileType}
        label={`Add ${fileType} File to Downloads`}
        onAdd={() => variantFlows.queueSingleFileType(fileType)}
        disabled={disabled}
        disabledTooltip={tooltip}
      />
    );
  };

  const actionCells = [
    <ActionButtonCell
      key="bom"
      label="Add Part Variant to BOM"
      onAdd={() => variantFlows.requestAction('bom')}
      disabled={!hasVariation}
      disabledTooltip={VARIATION_REQUIRED_TOOLTIP}
    />,
    <ActionButtonCell
      key="submittal"
      label="Add Part to Submittal Package"
      onAdd={() => figureFlows.requestAction('submittal')}
      disabled={!hasVariation}
      disabledTooltip={VARIATION_REQUIRED_TOOLTIP}
    />,
    <ActionButtonCell
      key="revit"
      label="Add Revit File to Downloads"
      onAdd={() => figureFlows.requestAction('revit-queue')}
      disabled={!hasVariation}
      disabledTooltip={VARIATION_REQUIRED_TOOLTIP}
    />,
    fileTypeCell('PDF'),
    fileTypeCell('DWG'),
    fileTypeCell('STEP'),
  ];

  return (
    <>
      <Flex vertical gap={token.marginSM} style={{ width: '100%' }}>
        <Typography.Paragraph
          type="secondary"
          style={{ margin: 0, ...hydraTextStyleToReactCss(hydraBaseNormal) }}
        >
          Choose a variation to add this part to a BOM, add it to a submittal package, or download files.
        </Typography.Paragraph>

        {layout === 'stack' ? (
          <Flex vertical gap={token.paddingSM} style={{ width: '100%' }}>
            {actionCells}
          </Flex>
        ) : (
          <Row gutter={[token.paddingSM, token.paddingSM]} style={{ width: '100%' }}>
            {actionCells.map((cell) => (
              <Col key={cell.key} xs={24} sm={12} xl={8}>
                {cell}
              </Col>
            ))}
          </Row>
        )}
      </Flex>
      {figureFlows.modals}
      {variantFlows.modals}
    </>
  );
}
