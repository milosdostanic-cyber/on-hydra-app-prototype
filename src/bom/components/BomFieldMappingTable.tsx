import { ArrowRightOutlined, CheckCircleOutlined } from '@ant-design/icons';
import type { ReactNode } from 'react';

import {
  ASC_DEST_FIELDS,
  BOM_FIELD_SKIP_VALUE,
  BOM_SOURCE_FIELDS,
} from '../bomFieldMappingConfig';
import type { BomFieldAliasMap } from '../bomFieldMappingConfig';
import { normalizeFieldMappingSkip } from '../bomFieldMappingUtils';
import {
  hydraBaseNormal,
  hydraBaseStrong,
  hydraTextStyleToReactCss,
} from '../../theme/hydraTypography';
import { Button, Card, Flex, Select, Space, Typography, theme } from '../../ui/antd';

/** Figma `5022:23843` — mapping table row metrics. */
const MAPPING_ARROW_SLOT_WIDTH = 16;

function mappingCellTextStyle(color: string) {
  return {
    ...hydraTextStyleToReactCss(hydraBaseNormal),
    color,
  };
}

type BomFieldMappingTableProps = {
  mode: 'view' | 'edit';
  /** Summary view rows (mapped pairs only). */
  viewRows?: { ascKey: string; ascLabel: string; bomColumn: string }[];
  /** Edit mode field map. */
  aliasMap?: BomFieldAliasMap;
  duplicateBomColumns?: Set<string>;
  onAliasChange?: (ascKey: string, bomColumn: string) => void;
  onResetDefaults?: () => void;
  /** Optional strip above column headers (e.g. Mapped columns + confidence tag). */
  topStrip?: ReactNode;
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
      style={{
        borderBottom: `${token.lineWidth}px ${token.lineType} ${token.colorBorderSecondary}`,
        background: token.colorFillAlter,
      }}
    >
      <Flex
        align="center"
        justify="space-between"
        gap={token.marginXS}
        style={{
          flex: 1,
          paddingInline: token.paddingMD,
          paddingBlock: token.paddingSM,
          minWidth: 0,
        }}
      >
        <Typography.Text strong style={headerTextStyle}>
          YOUR BOM COLUMN
        </Typography.Text>
        {showReset && onResetDefaults ? (
          <Button type="link" onClick={onResetDefaults} style={{ padding: 0, height: 'auto', flexShrink: 0 }}>
            Reset to Defaults
          </Button>
        ) : null}
      </Flex>
      <Flex style={{ width: MAPPING_ARROW_SLOT_WIDTH, flexShrink: 0 }} />
      <Flex
        align="center"
        style={{
          flex: 1,
          paddingInline: token.paddingMD,
          paddingBlock: token.paddingSM,
          minWidth: 0,
        }}
      >
        <Typography.Text strong style={headerTextStyle}>
          ASC FIELD
        </Typography.Text>
      </Flex>
    </Flex>
  );
}

function BomSourceCell({
  mode,
  bomValue,
  isMapped,
  isDuplicate,
  onChange,
}: {
  mode: 'view' | 'edit';
  bomValue: string | undefined;
  isMapped: boolean;
  isDuplicate: boolean;
  onChange?: (value: string) => void;
}) {
  const { token } = theme.useToken();

  return (
    <Flex
      flex={1}
      align="center"
      style={{
        minWidth: 0,
        minHeight: token.controlHeightLG,
        paddingInline: mode === 'edit' ? 0 : token.paddingSM,
        paddingBlock: mode === 'edit' ? 0 : token.paddingXS,
        background: token.colorBgContainer,
        border: `${token.lineWidth}px ${token.lineType} ${token.colorBorderSecondary}`,
        borderRadius: token.borderRadius,
      }}
    >
      {mode === 'edit' ? (
        <Select
          variant="borderless"
          value={bomValue ?? undefined}
          onChange={(val) => onChange?.(val)}
          placeholder={BOM_FIELD_SKIP_VALUE}
          style={{ width: '100%' }}
          status={isDuplicate ? 'warning' : undefined}
          options={BOM_SOURCE_FIELDS.map((f) => ({ value: f, label: f }))}
        />
      ) : (
        <Typography.Text
          style={mappingCellTextStyle(isMapped ? token.colorText : token.colorTextTertiary)}
        >
          {bomValue ?? BOM_FIELD_SKIP_VALUE}
        </Typography.Text>
      )}
    </Flex>
  );
}

function AscTargetCell({
  ascLabel,
  isMapped,
}: {
  ascLabel: string;
  isMapped: boolean;
}) {
  const { token } = theme.useToken();

  return (
    <Flex
      flex={1}
      align="center"
      justify="space-between"
      gap={token.marginXS}
      style={{
        minWidth: 0,
        minHeight: token.controlHeightLG,
        paddingInline: token.paddingSM,
        paddingBlock: token.paddingXS,
        background: isMapped ? token.colorPrimaryBgSubtle : token.colorFillQuaternary,
        border: `${token.lineWidth}px ${token.lineType} ${
          isMapped ? token.colorPrimaryBorderSubtle : token.colorBorderSecondary
        }`,
        borderRadius: token.borderRadius,
      }}
    >
      <Typography.Text
        style={mappingCellTextStyle(isMapped ? token.colorText : token.colorTextTertiary)}
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
}: BomFieldMappingTableProps) {
  const { token } = theme.useToken();

  const editRows = ASC_DEST_FIELDS.map(({ key, label }) => {
    const raw = aliasMap[key];
    const normalized = normalizeFieldMappingSkip(raw);
    return {
      ascKey: key,
      ascLabel: label,
      bomValue: raw,
      isMapped: Boolean(normalized),
      isDuplicate: Boolean(normalized && duplicateBomColumns.has(normalized)),
    };
  });

  const rows =
    mode === 'edit'
      ? editRows
      : viewRows.map((row) => ({
          ascKey: row.ascKey,
          ascLabel: row.ascLabel,
          bomValue: row.bomColumn,
          isMapped: true,
          isDuplicate: false,
        }));

  return (
    <Card
      styles={{ body: { padding: 0 } }}
      style={{ width: '100%', borderRadius: token.borderRadiusLG }}
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
              isDuplicate={row.isDuplicate}
              onChange={onAliasChange ? (val) => onAliasChange(row.ascKey, val) : undefined}
            />

            <Flex
              align="center"
              justify="center"
              style={{
                width: MAPPING_ARROW_SLOT_WIDTH,
                flexShrink: 0,
                color: token.colorPrimary,
              }}
            >
              <ArrowRightOutlined style={{ fontSize: hydraBaseNormal.fontSize }} />
            </Flex>

            <AscTargetCell ascLabel={row.ascLabel} isMapped={row.isMapped} />
          </Flex>
        ))}
      </Space>
    </Card>
  );
}
