import {
  CalculatorOutlined,
  FileDoneOutlined,
  FileTextOutlined,
  FolderOpenOutlined,
  InboxOutlined,
  PictureOutlined,
  ReadOutlined,
  UnorderedListOutlined,
} from '@ant-design/icons';
import type { ComponentType } from 'react';

import {
  hydraBaseNormal,
  hydraSmallNormal,
  hydraTextStyleToReactCss,
} from '../../theme/hydraTypography';
import {
  SEARCH_ENTITY_LABELS,
  type GlobalSearchResult,
  type SearchEntityType,
} from '../../search/globalSearchModel';
import { Flex, Tag, Typography, theme } from '../../ui/antd';

type Props = {
  result: GlobalSearchResult;
  selected: boolean;
  onSelect: () => void;
  onHover: () => void;
};

const ENTITY_ICONS: Record<SearchEntityType, ComponentType> = {
  part: PictureOutlined,
  project: FolderOpenOutlined,
  bom: UnorderedListOutlined,
  submittal: InboxOutlined,
  'seismic-design': CalculatorOutlined,
  spec: FileTextOutlined,
  download: ReadOutlined,
};

export function GlobalSearchResultRow({ result, selected, onSelect, onHover }: Props) {
  const { token } = theme.useToken();
  const Icon = result.entityType === 'part' ? FileDoneOutlined : ENTITY_ICONS[result.entityType];

  return (
    <button
      type="button"
      onMouseEnter={onHover}
      onMouseDown={(event) => event.preventDefault()}
      onClick={onSelect}
      style={{
        width: '100%',
        border: 0,
        background: selected ? token.colorFillAlter : 'transparent',
        cursor: 'pointer',
        paddingBlock: token.paddingSM,
        paddingInline: token.paddingMD,
        textAlign: 'left',
        borderRadius: token.borderRadius,
      }}
    >
      <Flex gap={token.marginSM} align="flex-start">
        <Flex
          align="center"
          justify="center"
          style={{
            width: token.controlHeightLG,
            height: token.controlHeightLG,
            flexShrink: 0,
            borderRadius: token.borderRadius,
            border: `${token.lineWidth}px ${token.lineType} ${token.colorBorderSecondary}`,
            background: result.entityType === 'part' ? token.colorFillAlter : token.colorPrimaryBg,
            color: result.entityType === 'part' ? token.colorTextTertiary : token.colorPrimary,
          }}
        >
          {result.thumbnailUrl ? (
            <img
              alt=""
              src={result.thumbnailUrl}
              style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: token.borderRadius }}
            />
          ) : (
            <Icon />
          )}
        </Flex>

        <Flex vertical gap={token.marginXXS} style={{ minWidth: 0, flex: 1 }}>
          <Flex align="center" gap={token.marginXS} wrap="wrap">
            <Typography.Text
              strong
              ellipsis
              style={{ maxWidth: '100%', ...hydraTextStyleToReactCss(hydraBaseNormal) }}
            >
              {result.title}
            </Typography.Text>
            <Tag bordered={false} style={{ margin: 0 }}>
              {SEARCH_ENTITY_LABELS[result.entityType]}
            </Tag>
          </Flex>
          <Typography.Text
            type="secondary"
            ellipsis
            style={{ maxWidth: '100%', ...hydraTextStyleToReactCss(hydraSmallNormal) }}
          >
            {result.subtitle}
          </Typography.Text>
          {result.context || result.meta?.length ? (
            <Flex gap={token.marginXS} wrap="wrap">
              {result.context ? (
                <Typography.Text type="secondary" style={hydraTextStyleToReactCss(hydraSmallNormal)}>
                  {result.context}
                </Typography.Text>
              ) : null}
              {(result.meta ?? []).slice(0, 3).map((meta) => (
                <Tag key={meta} color="default" style={{ margin: 0 }}>
                  {meta}
                </Tag>
              ))}
            </Flex>
          ) : null}
        </Flex>
      </Flex>
    </button>
  );
}
