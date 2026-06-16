import { ArrowRightOutlined, CheckCircleOutlined, MinusCircleOutlined } from '@ant-design/icons';
import type { CSSProperties, ReactNode } from 'react';
import type { GlobalToken } from 'antd/es/theme/interface';

import {
  ASC_DEST_FIELDS,
  BOM_FIELD_SKIP_VALUE,
  BOM_SOURCE_FIELDS,
} from '../bomFieldMappingConfig';
import type { BomFieldAliasMap } from '../bomFieldMappingConfig';
import { isConcatenatedFieldMapping, normalizeFieldMappingSkip, REQUIRED_ASC_FIELD_KEYS } from '../bomFieldMappingUtils';
import { bomImportedDataShellStyle } from '../bomImportedDataEmphasis';
import {
  hydraBaseNormal,
  hydraBaseStrong,
  hydraTextStyleToReactCss,
} from '../../theme/hydraTypography';
import { Button, Card, Flex, Select, Space, Typography, theme } from '../../ui/antd';

/** Figma `5022:23843` — mapping table row metrics. */
const MAPPING_ARROW_SLOT_WIDTH = 16;

/** Shared inset metrics for left/right mapping row cells (matches AscTargetCell). */
function mappingRowCellMetrics(token: GlobalToken): CSSProperties {
  return {
    minWidth: 0,
    minHeight: token.controlHeightLG,
    paddingInline: token.paddingSM,
    paddingBlock: token.paddingXS,
  };
}

function mappingCellTextStyle(color: string) {
  return {
    ...hydraTextStyleToReactCss(hydraBaseNormal),
    color,
  };
}

type BomFieldMappingTableProps = {
  mode: 'view' | 'edit';
  /** Summary view rows — all fields; unmapped rows have isMapped=false. */
  viewRows?: { ascKey: string; ascLabel: string; bomColumn: string; isMapped?: boolean; isRequired?: boolean }[];
  /** Edit mode field map. */
  aliasMap?: BomFieldAliasMap;
  duplicateBomColumns?: Set<string>;
  onAliasChange?: (ascKey: string, bomColumn: string) => void;
  onResetDefaults?: () => void;
  /** Optional strip above column headers (e.g. Mapped columns + confidence tag). */
  topStrip?: ReactNode;
  /** Optional style merged onto the outer Card shell. */
  cardStyle?: CSSProperties;
};

function MappingColumnHeaders({
  showReset,
  onResetDefaults,
}: {
  showReset: boolean;
  onResetDefaults?: () => void;
}) {
  const { token } = theme.useToken();
  const headerTextStyle = {
    ...hydraTextStyleToReactCss(hydraBaseStrong),
    color: token.colorTextSecondary,
  };

  return (
    <Flex
      align="center"
      gap={token.marginXS}
      style={{
        borderBottom: `${token.lineWidth}px ${token.lineType} ${token.colorBorderSecondary}`,
        background: token.colorFillAlter,
        paddingInline: token.paddingMD,
        paddingBlock: token.paddingSM,
      }}
    >
      <Flex align="center" gap={token.marginSM} style={{ flex: 1, minWidth: 0 }}>
        <Typography.Text strong style={headerTextStyle}>
          IN YOUR FILE
        </Typography.Text>
        {showReset && onResetDefaults ? (
          <Button type="link" onClick={onResetDefaults} style={{ padding: 0, height: 'auto', flexShrink: 0 }}>
            Reset to Defaults
          </Button>
        ) : null}
      </Flex>
      <Flex
        align="center"
        justify="center"
        style={{ width: MAPPING_ARROW_SLOT_WIDTH, flexShrink: 0 }}
      />
      <Flex align="center" style={{ flex: 1, minWidth: 0 }}>
        <Typography.Text strong style={headerTextStyle}>
          PART DETAIL WE NEED
        </Typography.Text>
      </Flex>
    </Flex>
  );
}

function optionalMappingCellShellStyle(token: GlobalToken): CSSProperties {
  return {
    background: token.colorFillQuaternary,
    border: `${token.lineWidth}px ${token.lineType} ${token.colorBorderSecondary}`,
    borderRadius: token.borderRadius,
  };
}

function BomSourceCell({
  mode,
  bomValue,
  isMapped,
  isRequired,
  isDuplicate,
  onChange,
}: {
  mode: 'view' | 'edit';
  bomValue: string | undefined;
  isMapped: boolean;
  isRequired?: boolean;
  isDuplicate: boolean;
  onChange?: (value: string) => void;
}) {
  const { token } = theme.useToken();
  const rowMetrics = mappingRowCellMetrics(token);

  const editCellMetrics: CSSProperties = {
    minWidth: 0,
    minHeight: token.controlHeightLG,
    paddingInline: 0,
    paddingBlock: 0,
  };

  const cellStyle: CSSProperties =
    mode === 'edit'
      ? isMapped
        ? {
            ...editCellMetrics,
            background: token.colorPrimaryBgSubtle,
            borderLeft: `${token.lineWidth * 3}px solid ${token.colorPrimaryBorder}`,
            borderRadius: token.borderRadius,
          }
        : isRequired
          ? {
              ...editCellMetrics,
              background: token.colorErrorBg,
              borderLeft: `${token.lineWidth * 3}px solid ${token.colorError}`,
              borderRadius: token.borderRadius,
            }
          : {
              ...optionalMappingCellShellStyle(token),
              ...editCellMetrics,
            }
      : isMapped
        ? {
            ...bomImportedDataShellStyle(token),
            minWidth: 0,
            minHeight: token.controlHeightLG,
          }
        : isRequired
          ? {
              minWidth: 0,
              minHeight: token.controlHeightLG,
              background: token.colorErrorBg,
              borderLeft: `${token.lineWidth * 3}px solid ${token.colorError}`,
              borderRadius: token.borderRadius,
              padding: `${token.paddingXXS}px ${token.paddingSM}px`,
            }
          : {
              ...optionalMappingCellShellStyle(token),
              ...rowMetrics,
            };

  const showRequiredPicker = Boolean(isRequired && !isMapped);
  const showSkipValue =
    mode === 'edit' && !isMapped && !isRequired && bomValue === BOM_FIELD_SKIP_VALUE;
  const mutedSelectText = showRequiredPicker || showSkipValue;

  return (
    <Flex
      flex={1}
      align="center"
      gap={token.marginXXS}
      style={cellStyle}
    >
      {mode === 'edit' ? (
        <Select
          variant="borderless"
          value={showRequiredPicker ? undefined : (bomValue ?? undefined)}
          onChange={(val) => onChange?.(val)}
          placeholder={
            showRequiredPicker ? 'Required — choose a column' : BOM_FIELD_SKIP_VALUE
          }
          style={{
            width: '100%',
            ...(mutedSelectText ? { color: token.colorTextTertiary } : {}),
          }}
          styles={
            mutedSelectText
              ? { placeholder: { color: token.colorTextTertiary } }
              : undefined
          }
          status={isDuplicate ? 'warning' : undefined}
          options={BOM_SOURCE_FIELDS.map((f) => ({ value: f, label: f }))}
        />
      ) : isMapped ? (
        <Typography.Text style={mappingCellTextStyle(token.colorText)}>{bomValue}</Typography.Text>
      ) : (
        <>
          <MinusCircleOutlined
            style={{
              fontSize: hydraBaseNormal.fontSize,
              color: token.colorTextTertiary,
              flexShrink: 0,
            }}
          />
          <Typography.Text
            style={mappingCellTextStyle(token.colorTextTertiary)}
          >
            {isRequired ? 'Required — not linked' : 'Not linked'}
          </Typography.Text>
        </>
      )}
    </Flex>
  );
}

function AscTargetCell({
  ascLabel,
  isMapped,
  isRequired,
}: {
  ascLabel: string;
  isMapped: boolean;
  isRequired?: boolean;
}) {
  const { token } = theme.useToken();

  const showRequired = isRequired && !isMapped;

  return (
    <Flex
      flex={1}
      align="center"
      justify="space-between"
      gap={token.marginXS}
      style={{
        ...mappingRowCellMetrics(token),
        background: isMapped
          ? token.colorPrimaryBgSubtle
          : showRequired
            ? token.colorErrorBg
            : token.colorFillQuaternary,
        border: `${token.lineWidth}px ${token.lineType} ${
          isMapped
            ? token.colorPrimaryBorderSubtle
            : showRequired
              ? token.colorErrorBorder
              : token.colorBorderSecondary
        }`,
        borderRadius: token.borderRadius,
      }}
    >
      <Typography.Text
        style={mappingCellTextStyle(
          isMapped ? token.colorTextSecondary : showRequired ? token.colorErrorText : token.colorTextTertiary,
        )}
      >
        {ascLabel}
      </Typography.Text>
      {isMapped ? (
        <CheckCircleOutlined
          style={{ color: token.colorSuccess, fontSize: hydraBaseNormal.fontSize, flexShrink: 0 }}
        />
      ) : null}
    </Flex>
  );
}

export function BomFieldMappingTable({
  mode,
  viewRows = [],
  aliasMap = {},
  duplicateBomColumns = new Set(),
  onAliasChange,
  onResetDefaults,
  topStrip,
  cardStyle,
}: BomFieldMappingTableProps) {
  const { token } = theme.useToken();

  const concatenatedUpload = isConcatenatedFieldMapping(aliasMap);

  const editRows = ASC_DEST_FIELDS.map(({ key, label }) => {
    const raw = aliasMap[key];
    const normalized = normalizeFieldMappingSkip(raw);
    return {
      ascKey: key,
      ascLabel: label,
      bomValue: raw,
      isMapped: Boolean(normalized),
      isRequired: concatenatedUpload ? key === 'DESCRIPTION' : REQUIRED_ASC_FIELD_KEYS.has(key),
      isDuplicate: Boolean(normalized && duplicateBomColumns.has(normalized)),
    };
  });

  const rows =
    mode === 'edit'
      ? editRows
      : viewRows.map((row) => ({
          ascKey: row.ascKey,
          ascLabel: row.ascLabel,
          bomValue: row.bomColumn || undefined,
          isMapped: row.isMapped ?? Boolean(row.bomColumn),
          isRequired: row.isRequired ?? false,
          isDuplicate: false,
        }));

  return (
    <Card
      styles={{ body: { padding: 0 } }}
      style={{ width: '100%', borderRadius: token.borderRadiusLG, ...cardStyle }}
    >
      {topStrip ? (
        <Flex
          align="center"
          justify="space-between"
          wrap="wrap"
          gap={token.marginSM}
          style={{
            paddingInline: token.paddingMD,
            paddingBlock: token.paddingSM,
            borderBottom: `${token.lineWidth}px ${token.lineType} ${token.colorBorderSecondary}`,
            background: token.colorFillAlter,
          }}
        >
          {topStrip}
        </Flex>
      ) : null}

      <MappingColumnHeaders showReset={mode === 'edit'} onResetDefaults={onResetDefaults} />

      <Space orientation="vertical" size={0} style={{ width: '100%' }}>
        {rows.map((row, idx) => (
          <Flex
            key={row.ascKey}
            align="center"
            gap={token.marginXS}
            style={{
              paddingInline: token.paddingMD,
              paddingBlock: token.paddingSM,
              borderBottom:
                idx < rows.length - 1
                  ? `${token.lineWidth}px ${token.lineType} ${token.colorBorderSecondary}`
                  : undefined,
            }}
          >
            <BomSourceCell
              mode={mode}
              bomValue={row.bomValue}
              isMapped={row.isMapped}
              isRequired={'isRequired' in row ? row.isRequired : undefined}
              isDuplicate={row.isDuplicate}
              onChange={onAliasChange ? (val) => onAliasChange(row.ascKey, val) : undefined}
            />

            <Flex
              align="center"
              justify="center"
              style={{
                width: MAPPING_ARROW_SLOT_WIDTH,
                flexShrink: 0,
                color: row.isMapped ? token.colorPrimary : token.colorTextQuaternary,
              }}
            >
              <ArrowRightOutlined style={{ fontSize: hydraBaseNormal.fontSize }} />
            </Flex>

            <AscTargetCell
              ascLabel={row.ascLabel}
              isMapped={row.isMapped}
              isRequired={'isRequired' in row ? row.isRequired : undefined}
            />
          </Flex>
        ))}
      </Space>
    </Card>
  );
}
