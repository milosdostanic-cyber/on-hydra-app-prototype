import { PlusOutlined } from '@ant-design/icons';

import type { PartActionPayload } from '../usePartActionFlows';
import { usePartActionFlows } from '../usePartActionFlows';
import type { PartVariationRow } from '../partDetailDemoData';
import { useVariantActionFlows } from '../useVariantActionFlows';
import { Button, Col, Row, Space, Tooltip, Typography, theme } from '../../ui/antd';

const VARIATION_REQUIRED_TOOLTIP = 'Select a variation to enable this action.';
const FILE_UNAVAILABLE_TOOLTIP = "This file type isn't available for the selected variation.";

type Props = {
  partKey: string;
  payload: PartActionPayload;
  selectedVariation: PartVariationRow | null;
};

function ActionButton({
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

  const addButton = (
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

  return (
    <Space orientation="vertical" size={0} style={{ width: '100%' }}>
      {disabled && disabledTooltip ? (
        <Tooltip title={disabledTooltip}>
          <span>{addButton}</span>
        </Tooltip>
      ) : (
        <Tooltip title={label}>{addButton}</Tooltip>
      )}
      {hint ? (
        <Typography.Text type="secondary" style={{ fontSize: token.fontSizeSM }}>
          {hint}
        </Typography.Text>
      ) : null}
    </Space>
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

  const fileTypeRow = (fileType: string) => {
    const available = fileTypeEnabled(fileType);
    const disabled = !hasVariation || !available;
    const tooltip = !hasVariation
      ? VARIATION_REQUIRED_TOOLTIP
      : !available
        ? FILE_UNAVAILABLE_TOOLTIP
        : `Add ${fileType} to Download Center`;

    return (
      <Col key={fileType} xs={24} sm={12} lg={4}>
        <ActionButton
          label={`Add ${fileType} File to Downloads`}
          hint={hasVariation && !available ? 'Not available for this variant' : undefined}
          onAdd={() => variantFlows.queueSingleFileType(fileType)}
          disabled={disabled}
          disabledTooltip={tooltip}
        />
      </Col>
    );
  };

  return (
    <>
      <Space orientation="vertical" size={token.marginSM} style={{ width: '100%' }}>
        <Typography.Paragraph
          type="secondary"
          style={{ margin: 0, fontSize: token.fontSizeSM }}
        >
          Choose a variation above to add this part to a BOM, add it to a submittal package, or download files.
        </Typography.Paragraph>

        <Row gutter={[token.marginSM, token.marginSM]} style={{ width: '100%' }}>
          <Col xs={24} sm={12} lg={4}>
            <ActionButton
              label="Add Part Variant to BOM"
              onAdd={() => variantFlows.requestAction('bom')}
              disabled={!hasVariation}
              disabledTooltip={VARIATION_REQUIRED_TOOLTIP}
            />
          </Col>
          <Col xs={24} sm={12} lg={4}>
            <ActionButton
              label="Add Part to Submittal Package"
              onAdd={() => figureFlows.requestAction('submittal')}
              disabled={!hasVariation}
              disabledTooltip={VARIATION_REQUIRED_TOOLTIP}
            />
          </Col>
          <Col xs={24} sm={12} lg={4}>
            <ActionButton
              label="Add Revit File to Downloads"
              onAdd={() => figureFlows.requestAction('revit-queue')}
              disabled={!hasVariation}
              disabledTooltip={VARIATION_REQUIRED_TOOLTIP}
            />
          </Col>
          {fileTypeRow('PDF')}
          {fileTypeRow('STEP')}
          {fileTypeRow('DWG')}
        </Row>
      </Space>
      {figureFlows.modals}
      {variantFlows.modals}
    </>
  );
}
