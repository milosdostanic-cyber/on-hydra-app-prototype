import { ArrowRightOutlined } from '@ant-design/icons';
import { useState } from 'react';

import {
  Button,
  Flex,
  Modal,
  Select,
  Space,
  Typography,
  message,
  theme,
} from '../../ui/antd';

/** All possible BOM source columns (left side — what user's BOM file may contain). */
const BOM_SOURCE_FIELDS = [
  'BRAND',
  'DESCRIPTION',
  'FIGURE NUM',
  'FINISH',
  'MFR NUM',
  'INSTALL TYPE',
  'MANUFACTURER',
  'MATERIAL',
  'ORDER FLAG',
  'PART NUMBER',
  'QTY',
  'UNIT',
  'NOTES',
];

/** Fixed ASC destination fields (right side — what the system expects). */
const ASC_DEST_FIELDS = [
  { key: 'BRAND', label: 'BRAND' },
  { key: 'DESCRIPTION', label: 'DESCRIPTION' },
  { key: 'FIGURE NUM', label: 'FIGURE NUM' },
  { key: 'FINISH', label: 'FINISH' },
  { key: 'MFR NUM', label: 'MFR NUM' },
  { key: 'INSTALL TYPE', label: 'INSTALL TYPE' },
  { key: 'MANUFACTURER', label: 'MANUFACTURER' },
  { key: 'MATERIAL', label: 'MATERIAL' },
  { key: 'ORDER FLAG', label: 'ORDER FLAG' },
];

type AliasMap = Record<string, string | undefined>;

const DEFAULT_ALIAS: AliasMap = {
  BRAND: 'BRAND',
  DESCRIPTION: 'DESCRIPTION',
  'FIGURE NUM': 'FIGURE NUM',
  FINISH: 'FINISH',
  'MFR NUM': 'MFR NUM',
  'INSTALL TYPE': 'INSTALL TYPE',
  MANUFACTURER: 'MANUFACTURER',
  MATERIAL: 'MATERIAL',
  'ORDER FLAG': 'ORDER FLAG',
};

interface BomAliasConfiguratorProps {
  open: boolean;
  onClose: () => void;
  onSave?: (aliasMap: AliasMap) => void;
}

export function BomAliasConfigurator({ open, onClose, onSave }: BomAliasConfiguratorProps) {
  const { token } = theme.useToken();
  const [aliasMap, setAliasMap] = useState<AliasMap>({ ...DEFAULT_ALIAS });

  const handleChange = (ascField: string, bomField: string | undefined) => {
    setAliasMap((prev) => ({ ...prev, [ascField]: bomField }));
  };

  const handleSave = () => {
    onSave?.(aliasMap);
    message.success('BOM alias configuration saved.');
    onClose();
  };

  const handleReset = () => {
    setAliasMap({ ...DEFAULT_ALIAS });
  };

  const fieldLabelStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: `${token.paddingXS}px ${token.paddingMD}px`,
    background: token.colorPrimaryBg,
    border: `${token.lineWidth}px ${token.lineType} ${token.colorPrimaryBorder}`,
    borderRadius: token.borderRadius,
    fontWeight: token.fontWeightStrong,
    fontSize: token.fontSizeSM,
    color: token.colorPrimary,
    minHeight: token.controlHeight,
    width: '100%',
    textAlign: 'center' as const,
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      width={580}
      title="BOM Alias Configurator"
      footer={
        <Flex justify="space-between" align="center">
          <Button onClick={handleReset}>Reset to defaults</Button>
          <Space>
            <Button onClick={onClose}>Cancel</Button>
            <Button type="primary" onClick={handleSave}>
              Configure
            </Button>
          </Space>
        </Flex>
      }
    >
      <Space direction="vertical" size={token.marginSM} style={{ width: '100%' }}>
        <Typography.Text type="secondary" style={{ fontSize: token.fontSizeSM }}>
          Map your BOM file columns to the corresponding ASC product fields. Select the column from
          your BOM that corresponds to each ASC field.
        </Typography.Text>

        {/* Header row */}
        <Flex gap={token.marginSM} align="center">
          <div style={{ flex: 1, textAlign: 'center' }}>
            <Typography.Text strong style={{ fontSize: token.fontSizeSM, color: token.colorTextSecondary }}>
              YOUR BOM FIELD
            </Typography.Text>
          </div>
          <div style={{ width: 28 }} />
          <div style={{ flex: 1, textAlign: 'center' }}>
            <Typography.Text strong style={{ fontSize: token.fontSizeSM, color: token.colorPrimary }}>
              ASC FIELD
            </Typography.Text>
          </div>
        </Flex>

        {/* Field mapping rows */}
        {ASC_DEST_FIELDS.map(({ key, label }) => (
          <Flex key={key} gap={token.marginSM} align="center">
            {/* BOM source selector */}
            <div style={{ flex: 1 }}>
              <Select
                value={aliasMap[key]}
                onChange={(val) => handleChange(key, val)}
                placeholder="Select BOM column…"
                style={{ width: '100%' }}
                allowClear
                options={BOM_SOURCE_FIELDS.map((f) => ({ value: f, label: f }))}
                size="middle"
              />
            </div>

            {/* Arrow */}
            <Flex
              align="center"
              justify="center"
              style={{
                width: 28,
                flexShrink: 0,
                color: aliasMap[key] ? token.colorPrimary : token.colorTextQuaternary,
              }}
            >
              <ArrowRightOutlined />
            </Flex>

            {/* ASC destination label */}
            <div style={{ flex: 1 }}>
              <div style={fieldLabelStyle}>{label}</div>
            </div>
          </Flex>
        ))}

        {/* Unmapped warning */}
        {Object.values(aliasMap).some((v) => !v) && (
          <Typography.Text type="warning" style={{ fontSize: token.fontSizeSM }}>
            Some ASC fields are not mapped. Unmapped fields will be left blank during import.
          </Typography.Text>
        )}
      </Space>
    </Modal>
  );
}
