import {
  FilePdfOutlined,
  FileUnknownOutlined,
  FileZipOutlined,
} from '@ant-design/icons';

import type { PartVariationRow } from '../partDetailDemoData';
import { useVariantActionFlows } from '../useVariantActionFlows';
import { Button, Flex, Space, Tooltip, Typography, theme } from '../../ui/antd';

const FILE_TYPE_ICONS: Record<string, typeof FilePdfOutlined> = {
  PDF: FilePdfOutlined,
  DWG: FileUnknownOutlined,
  STEP: FileZipOutlined,
};

type Props = {
  partKey: string;
  variation: PartVariationRow;
};

/** Variant-level pill CTAs and file-type icon row (greyed when unavailable). */
export function VariantFileActions({ partKey, variation }: Props) {
  const { token } = theme.useToken();
  const { requestBomAdd, queueSingleFileType, modals, pillActions } = useVariantActionFlows(partKey, [
    variation,
  ]);

  return (
    <>
      <Space orientation="vertical" size={token.marginMD} style={{ width: '100%' }}>
        <Flex wrap="wrap" gap={token.marginXS}>
          {pillActions.map(({ id, label }) => (
            <Button
              key={id}
              type="primary"
              shape="round"
              size="small"
              style={{ fontWeight: token.fontWeightStrong }}
              onClick={() => {
                if (id === 'bom') requestBomAdd([variation]);
              }}
            >
              {label}
            </Button>
          ))}
        </Flex>

        <div>
          <Typography.Text
            type="secondary"
            style={{
              display: 'block',
              marginBottom: token.marginXS,
              fontSize: token.fontSizeSM,
            }}
          >
            Available file types
          </Typography.Text>
          <Flex wrap="wrap" gap={token.marginSM}>
            {variation.allDrawingFileTypes.map((fileType) => {
              const available = variation.drawingFileTypes.includes(fileType);
              const Icon = FILE_TYPE_ICONS[fileType] ?? FileUnknownOutlined;
              const iconBtn = (
                <Button
                  type="text"
                  disabled={!available}
                  icon={<Icon style={{ fontSize: token.fontSizeHeading4 }} />}
                  aria-label={`${fileType} file for ${variation.sku}`}
                  onClick={() => available && queueSingleFileType(fileType, variation)}
                  style={{
                    color: available ? token.colorPrimary : token.colorTextQuaternary,
                    cursor: available ? 'pointer' : 'not-allowed',
                    opacity: available ? 1 : 0.45,
                  }}
                />
              );
              return (
                <Flex key={fileType} vertical align="center" gap={token.marginXXS}>
                  {available ? (
                    iconBtn
                  ) : (
                    <Tooltip title={`${fileType} not available for this variant`}>{iconBtn}</Tooltip>
                  )}
                  <Typography.Text
                    type={available ? undefined : 'secondary'}
                    style={{ fontSize: token.fontSizeSM }}
                  >
                    {fileType}
                  </Typography.Text>
                </Flex>
              );
            })}
          </Flex>
        </div>
      </Space>
      {modals}
    </>
  );
}
