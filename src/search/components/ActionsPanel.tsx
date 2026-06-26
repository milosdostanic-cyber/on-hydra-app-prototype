import { CheckOutlined, FileAddOutlined, PlusOutlined } from '@ant-design/icons';
import type { ReactNode } from 'react';

import { hydraBaseNormal, hydraTextStyleToReactCss } from '../../theme/hydraTypography';
import { pageDescriptionStyle } from '../../shell/pageDescriptionStyle';
import type { PartActionPayload } from '../usePartActionFlows';
import { usePartActionFlows } from '../usePartActionFlows';
import type { PartVariationRow } from '../partDetailDemoData';
import { useVariantActionFlows } from '../useVariantActionFlows';
import { Button, Divider, Flex, Space, Tag, Tooltip, Typography, theme } from '../../ui/antd';

const VARIATION_REQUIRED_TOOLTIP = 'Select a variation to enable this action.';
const FILE_UNAVAILABLE_TOOLTIP = "This file type isn't available for the selected variation.";

type Flows = {
  figureFlows: ReturnType<typeof usePartActionFlows>;
  variantFlows: ReturnType<typeof useVariantActionFlows>;
};

type Props = {
  partKey: string;
  payload: PartActionPayload;
  selectedVariation: PartVariationRow | null;
};

export function usePartDetailActionFlows(partKey: string, payload: PartActionPayload, selectedVariation: PartVariationRow | null): Flows {
  const figureFlows = usePartActionFlows(payload);
  const variantFlows = useVariantActionFlows(partKey, selectedVariation);
  return { figureFlows, variantFlows };
}

function fieldLabelStyle() {
  return {
    ...hydraTextStyleToReactCss(hydraBaseNormal),
    textTransform: 'uppercase' as const,
    letterSpacing: '0.04em',
  };
}

function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <Typography.Text type="secondary" style={{ display: 'block', ...fieldLabelStyle() }}>
      {children}
    </Typography.Text>
  );
}

type DownloadChip = {
  key: string;
  label: string;
  addLabel: string;
  onAdd: () => void;
  disabled?: boolean;
  disabledTooltip?: string;
};

function DownloadChipButton({ chip }: { chip: DownloadChip }) {
  const button = (
    <Button
      size="middle"
      icon={<PlusOutlined />}
      disabled={chip.disabled}
      onClick={chip.onAdd}
      aria-label={chip.addLabel}
    >
      {chip.label}
    </Button>
  );

  if (chip.disabled && chip.disabledTooltip) {
    return (
      <Tooltip title={chip.disabledTooltip}>
        <span>{button}</span>
      </Tooltip>
    );
  }

  return <Tooltip title={chip.addLabel}>{button}</Tooltip>;
}

/** Primary project actions — after variant pick. */
export function PartProjectActions({
  figureFlows,
  variantFlows,
  selectedVariation,
  bare = false,
}: Pick<Flows, 'figureFlows' | 'variantFlows'> & { selectedVariation: PartVariationRow | null; bare?: boolean }) {
  const { token } = theme.useToken();

  const actionButtons = (
    <Flex gap={token.marginXS} wrap="wrap" align="center">
      {variantFlows.isInBom ? (
        <Tag icon={<CheckOutlined />} color="success">
          In BOM
        </Tag>
      ) : (
        <Tooltip title={!selectedVariation ? VARIATION_REQUIRED_TOOLTIP : undefined}>
          <Button
            type="default"
            size="middle"
            icon={<PlusOutlined />}
            disabled={!selectedVariation}
            onClick={() => variantFlows.requestAction('bom')}
          >
            Add to BOM
          </Button>
        </Tooltip>
      )}

      {figureFlows.isInSubmittalPackage ? (
        <Tag icon={<CheckOutlined />} color="success">
          In submittal
        </Tag>
      ) : (
        <Button size="middle" icon={<FileAddOutlined />} onClick={() => figureFlows.requestAction('submittal')}>
          Add to submittal
        </Button>
      )}
    </Flex>
  );

  if (bare) {
    return actionButtons;
  }

  return (
    <Space orientation="vertical" size={token.marginXS} style={{ width: '100%' }}>
      <SectionLabel>Add to project</SectionLabel>
      {actionButtons}
      {!selectedVariation ? (
        <Typography.Text type="secondary" style={pageDescriptionStyle(token)}>
          Choose a variation above, then add the variant to a BOM.
        </Typography.Text>
      ) : null}
    </Space>
  );
}

/** Download files — compact chip row (default) or legacy full-width list. */
export function PartDownloadActions({
  figureFlows,
  variantFlows,
  selectedVariation,
  layout = 'compact',
}: Pick<Flows, 'figureFlows' | 'variantFlows'> & {
  selectedVariation: PartVariationRow | null;
  layout?: 'compact' | 'list';
}) {
  const { token } = theme.useToken();

  const fileTypeEnabled = (fileType: string) =>
    Boolean(selectedVariation?.drawingFileTypes.includes(fileType));

  const buildFileChip = (fileType: string): DownloadChip => {
    const hasVariation = Boolean(selectedVariation);
    const available = fileTypeEnabled(fileType);
    const disabled = !hasVariation || !available;
    const tooltip = !hasVariation
      ? VARIATION_REQUIRED_TOOLTIP
      : !available
        ? FILE_UNAVAILABLE_TOOLTIP
        : `Add ${fileType} to Download Center`;

    return {
      key: fileType,
      label: fileType,
      addLabel: `Add ${fileType} to Download Center`,
      onAdd: () => variantFlows.queueSingleFileType(fileType),
      disabled,
      disabledTooltip: tooltip,
    };
  };

  const chips: DownloadChip[] = [
    {
      key: 'revit',
      label: 'Revit',
      addLabel: 'Add Revit file to Download Center',
      onAdd: () => figureFlows.requestAction('revit-queue'),
    },
    buildFileChip('PDF'),
    buildFileChip('STEP'),
    buildFileChip('DWG'),
  ];

  if (layout === 'compact') {
    return (
      <Flex gap={token.marginXS} wrap="wrap" align="center">
        {chips.map((chip) => (
          <DownloadChipButton key={chip.key} chip={chip} />
        ))}
      </Flex>
    );
  }

  return (
    <Space orientation="vertical" size={token.marginXS} style={{ width: '100%' }}>
      {chips.map((chip) => (
        <Flex key={chip.key} align="center" justify="space-between" gap={token.marginSM} style={{ width: '100%' }}>
          <Typography.Text style={hydraTextStyleToReactCss(hydraBaseNormal)}>{chip.label} file</Typography.Text>
          <DownloadChipButton chip={chip} />
        </Flex>
      ))}
    </Space>
  );
}

export function PartDetailActionModals({ figureFlows, variantFlows }: Flows) {
  return (
    <>
      {figureFlows.modals}
      {variantFlows.modals}
    </>
  );
}

/** Full actions panel — single hook site when both sections stay together. */
export function ActionsPanel({ partKey, payload, selectedVariation }: Props) {
  const { token } = theme.useToken();
  const flows = usePartDetailActionFlows(partKey, payload, selectedVariation);

  return (
    <>
      <Space orientation="vertical" size={token.marginSM} style={{ width: '100%' }}>
        <PartProjectActions
          figureFlows={flows.figureFlows}
          variantFlows={flows.variantFlows}
          selectedVariation={selectedVariation}
        />
        <Divider style={{ margin: 0 }} />
        <SectionLabel>Download files</SectionLabel>
        <PartDownloadActions
          figureFlows={flows.figureFlows}
          variantFlows={flows.variantFlows}
          selectedVariation={selectedVariation}
        />
      </Space>
      <PartDetailActionModals {...flows} />
    </>
  );
}
