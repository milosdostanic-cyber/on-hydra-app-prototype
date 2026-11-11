import {
  CONTENT_FILE_TYPE_TAG_VISIBLE_COUNT,
  contentFileTypeTagPreset,
} from '../contentFileTypeTags';
import { hydraBaseNormal, hydraTextStyleToReactCss } from '../../theme/hydraTypography';
import { Flex, Tooltip, Typography, theme } from '../../ui/antd';
import { HydraColorfulTag, HydraTag } from '../../ui/HydraTag';

function FileTypeTag({ fileType }: { fileType: string }) {
  const preset = contentFileTypeTagPreset(fileType);
  if (!preset) {
    return <HydraTag>{fileType}</HydraTag>;
  }
  return (
    <HydraColorfulTag preset={preset} bordered>
      {fileType}
    </HydraColorfulTag>
  );
}

/**
 * Colored file-type tags. More than three types collapse into a "+X" tag; hovering it opens a light Tooltip with the hidden tags.
 * `showAll` lists every type (expanded detail views where the row already shows the short list).
 */
export function ContentFileTypeTags({ fileTypes, showAll = false }: { fileTypes: string[]; showAll?: boolean }) {
  const { token } = theme.useToken();

  if (fileTypes.length === 0) {
    return (
      <Typography.Text type="secondary" style={hydraTextStyleToReactCss(hydraBaseNormal)}>
        —
      </Typography.Text>
    );
  }

  const visibleCount = showAll ? fileTypes.length : CONTENT_FILE_TYPE_TAG_VISIBLE_COUNT;
  const visible = fileTypes.slice(0, visibleCount);
  const hidden = fileTypes.slice(visibleCount);

  return (
    <Flex align="center" gap={token.marginXS} wrap={showAll ? 'wrap' : 'nowrap'}>
      {visible.map((fileType) => (
        <FileTypeTag key={fileType} fileType={fileType} />
      ))}
      {hidden.length > 0 ? (
        <Tooltip
          color={token.colorBgElevated}
          title={
            <Flex align="center" gap={token.marginXS} wrap="wrap">
              {hidden.map((fileType) => (
                <FileTypeTag key={fileType} fileType={fileType} />
              ))}
            </Flex>
          }
          placement="top"
          trigger={['hover', 'focus']}
        >
          <span tabIndex={0} aria-label={`${hidden.length} more file types: ${hidden.join(', ')}`}>
            <HydraTag>{`+${hidden.length}`}</HydraTag>
          </span>
        </Tooltip>
      ) : null}
    </Flex>
  );
}
