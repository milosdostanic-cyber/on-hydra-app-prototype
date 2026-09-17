import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
  type RefObject,
} from 'react';

import { SpecCitationHighlightBanner } from './SpecCitationLink';
import { SPEC_A4_ASPECT_RATIO, specA4Dimensions } from '../constants/specDocumentLayout';
import type { SpecBlockFormatting, SpecDocumentBlock } from '../data/types';
import { Alert, Button, Empty, Flex, Input, Typography, theme } from '../../ui/antd';
import {
  hydraBaseItalic,
  hydraBaseNormal,
  hydraBaseStrong,
  hydraBaseUnderline,
  hydraLargeNormal,
  hydraTextStyleToReactCss,
  hydraTitleHeading4,
} from '../../theme/hydraTypography';

/** Closest existing body role for document inline formatting. Bold wins; no composed styles. */
function specInlineTextStyle(formatting?: SpecBlockFormatting) {
  if (formatting?.bold) return hydraBaseStrong;
  if (formatting?.italic) return hydraBaseItalic;
  if (formatting?.underline) return hydraBaseUnderline;
  return hydraBaseNormal;
}

export type SpecDocumentHighlightSpan = {
  text: string;
  tone: 'active' | 'pending';
  recommendationId: string;
};

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function collectHighlightRanges(
  text: string,
  spans: SpecDocumentHighlightSpan[] | undefined,
): Array<{ start: number; end: number; tone: 'active' | 'pending'; recommendationId: string }> {
  if (!spans?.length) return [];
  const ranges: Array<{
    start: number;
    end: number;
    tone: 'active' | 'pending';
    recommendationId: string;
  }> = [];
  for (const span of spans) {
    const needle = span.text.trim();
    if (!needle) continue;
    const idx = text.indexOf(needle);
    if (idx >= 0) {
      ranges.push({
        start: idx,
        end: idx + needle.length,
        tone: span.tone,
        recommendationId: span.recommendationId,
      });
    } else if (span.tone === 'active') {
      ranges.push({
        start: 0,
        end: text.length,
        tone: 'active',
        recommendationId: span.recommendationId,
      });
    }
  }
  ranges.sort((a, b) => a.start - b.start);
  return ranges;
}

type SpecHighlightStyleBag = {
  active: string;
  pending: string;
  borderRadius: number;
  paddingInline: number;
  /** Parent row already paints the highlight box — mark is a click target only. */
  surfaceFromParent?: boolean;
};

/** Figma SPEC highlights: yellow (`colorWarningBg`) pending, pink (`colorErrorBg`) active. */
function highlightMarkCss(
  tone: 'active' | 'pending',
  colors: SpecHighlightStyleBag,
): CSSProperties {
  if (colors.surfaceFromParent) {
    return {
      background: 'transparent',
      color: 'inherit',
      padding: 0,
      margin: 0,
      cursor: 'pointer',
    };
  }
  const isActive = tone === 'active';
  return {
    background: isActive ? colors.active : colors.pending,
    color: 'inherit',
    paddingBlock: 0,
    paddingInline: colors.paddingInline,
    margin: 0,
    cursor: 'pointer',
    borderRadius: colors.borderRadius,
    boxDecorationBreak: 'clone',
    WebkitBoxDecorationBreak: 'clone',
  };
}

function markStyle(tone: 'active' | 'pending', colors: SpecHighlightStyleBag): string {
  const css = highlightMarkCss(tone, colors);
  if (colors.surfaceFromParent) {
    return ['background:transparent', 'color:inherit', 'padding:0', 'margin:0', 'cursor:pointer'].join(';');
  }
  return [
    `background:${css.background}`,
    'color:inherit',
    `padding:0 ${colors.paddingInline}px`,
    'margin:0',
    'cursor:pointer',
    `border-radius:${colors.borderRadius}px`,
    'box-decoration-break:clone',
    '-webkit-box-decoration-break:clone',
  ].join(';');
}

function buildHighlightedHtml(
  text: string,
  spans: SpecDocumentHighlightSpan[] | undefined,
  colors: SpecHighlightStyleBag,
): string {
  const ranges = collectHighlightRanges(text, spans);
  if (!ranges.length) return escapeHtml(text);

  let html = '';
  let cursor = 0;
  for (const range of ranges) {
    if (range.start < cursor) continue;
    if (range.start > cursor) {
      html += escapeHtml(text.slice(cursor, range.start));
    }
    const slice = escapeHtml(text.slice(range.start, range.end));
    html += `<mark data-spec-highlight="${range.tone}" data-spec-rec-id="${range.recommendationId}" tabindex="0" role="button" style="${markStyle(range.tone, colors)}">${slice}</mark>`;
    cursor = range.end;
  }
  if (cursor < text.length) {
    html += escapeHtml(text.slice(cursor));
  }
  return html;
}

function renderHighlightedText(
  text: string,
  spans: SpecDocumentHighlightSpan[] | undefined,
  colors: SpecHighlightStyleBag,
  onHighlightClick?: (recommendationId: string) => void,
): ReactNode {
  const ranges = collectHighlightRanges(text, spans);
  if (!ranges.length) return text;

  const parts: ReactNode[] = [];
  let cursor = 0;
  for (const range of ranges) {
    if (range.start < cursor) continue;
    if (range.start > cursor) {
      parts.push(text.slice(cursor, range.start));
    }
    parts.push(
      <mark
        key={`${range.start}-${range.end}-${range.recommendationId}`}
        data-spec-highlight={range.tone}
        data-spec-rec-id={range.recommendationId}
        role="button"
        tabIndex={0}
        style={highlightMarkCss(range.tone, colors)}
        onClick={(event) => {
          event.stopPropagation();
          onHighlightClick?.(range.recommendationId);
        }}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            event.stopPropagation();
            onHighlightClick?.(range.recommendationId);
          }
        }}
      >
        {text.slice(range.start, range.end)}
      </mark>,
    );
    cursor = range.end;
  }
  if (cursor < text.length) {
    parts.push(text.slice(cursor));
  }
  return parts;
}

function listMarker(
  block: SpecDocumentBlock,
  formatting: SpecBlockFormatting | undefined,
  indexOnPage: number,
): string | null {
  if (formatting?.numbered) return `${indexOnPage + 1}.`;
  if (formatting?.bulleted || block.kind === 'list-item') return '•';
  return null;
}

function DocumentEditableBlock({
  block,
  formatting,
  editable,
  highlightSpans,
  highlightRef,
  sectionRef,
  listIndexOnPage = 0,
  highlightSurfaceFromParent,
  onSelect,
  onChange,
  onHighlightClick,
}: {
  block: SpecDocumentBlock;
  formatting?: SpecBlockFormatting;
  editable?: boolean;
  highlightSpans?: SpecDocumentHighlightSpan[];
  highlightRef?: RefObject<HTMLDivElement | null>;
  sectionRef?: RefObject<HTMLDivElement | null>;
  listIndexOnPage?: number;
  highlightSurfaceFromParent?: boolean;
  onSelect?: () => void;
  onChange?: (text: string) => void;
  onHighlightClick?: (recommendationId: string) => void;
}) {
  const { token } = theme.useToken();
  const contentRef = useRef<HTMLDivElement | null>(null);
  const focusedRef = useRef(false);
  const focusSnapshotRef = useRef('');

  const colors: SpecHighlightStyleBag = {
    active: token.colorErrorBg,
    pending: token.colorWarningBg,
    borderRadius: token.borderRadiusSM,
    paddingInline: token.paddingXXS,
    surfaceFromParent: highlightSurfaceFromParent,
  };

  const handleHighlightPointer = (event: MouseEvent | KeyboardEvent) => {
    const target = event.target as HTMLElement;
    const mark = target.closest('[data-spec-rec-id]');
    if (!mark) return;
    event.preventDefault();
    event.stopPropagation();
    const recommendationId = mark.getAttribute('data-spec-rec-id');
    if (recommendationId) onHighlightClick?.(recommendationId);
  };

  const normalizeEditableText = (value: string) =>
    value.replace(/\u00a0/g, ' ').replace(/\s+/g, ' ').trim();

  const syncDisplayedContent = () => {
    const node = contentRef.current;
    if (!node || focusedRef.current) return;
    if (editable) {
      node.innerHTML = buildHighlightedHtml(block.text, highlightSpans, colors);
    }
  };

  useEffect(() => {
    syncDisplayedContent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [block.text, highlightSpans, editable, highlightSurfaceFromParent]);

  const isListItem =
    formatting?.bulleted || formatting?.numbered || block.kind === 'list-item';
  const marker = listMarker(block, formatting, listIndexOnPage);

  const isHeading =
    block.kind === 'heading' ||
    block.kind === 'subheading' ||
    formatting?.style === 'heading' ||
    formatting?.style === 'subheading';
  const isSubheading = block.kind === 'subheading' || formatting?.style === 'subheading';
  const roleStyle = isHeading
    ? isSubheading
      ? hydraLargeNormal
      : hydraTitleHeading4
    : specInlineTextStyle(formatting);
  const roleCss = hydraTextStyleToReactCss(roleStyle);

  const typographyStyle = {
    marginBottom: 0,
    outline: 'none',
    whiteSpace: 'pre-wrap' as const,
    wordBreak: 'break-word' as const,
    ...roleCss,
    marginTop: 0,
    cursor: editable ? 'text' : 'default',
  };

  const commitBlur = () => {
    focusedRef.current = false;
    const node = contentRef.current;
    if (!node) return;
    const next = normalizeEditableText(node.textContent ?? '');
    const started = normalizeEditableText(focusSnapshotRef.current);
    // Only a real manual edit since focus marks analysis stale. Accept/external
    // text updates must not look like a document edit on blur.
    if (!next || next === started) {
      syncDisplayedContent();
      return;
    }
    onChange?.(next);
  };

  if (!editable) {
    const body = renderHighlightedText(block.text, highlightSpans, colors, onHighlightClick);
    if (isHeading) {
      return (
        <div ref={highlightRef ?? sectionRef} id={`spec-block-${block.id}`}>
          {isSubheading ? (
            <Typography.Text style={{ display: 'block', ...roleCss }}>{body}</Typography.Text>
          ) : (
            <Typography.Title level={4} style={{ marginBottom: 0, marginTop: 0, ...roleCss }}>
              {body}
            </Typography.Title>
          )}
        </div>
      );
    }
    return (
      <div ref={highlightRef ?? sectionRef} id={`spec-block-${block.id}`}>
        <Flex
          gap={token.marginXS}
          align="flex-start"
          style={isListItem ? { paddingInlineStart: token.paddingMD } : undefined}
        >
          {marker ? (
            <Typography.Text style={{ ...hydraTextStyleToReactCss(hydraBaseNormal), minWidth: token.fontSizeLG }}>
              {marker}
            </Typography.Text>
          ) : null}
          <Typography.Paragraph
            style={{
              marginBottom: token.marginXXS,
              flex: 1,
              ...hydraTextStyleToReactCss(specInlineTextStyle(formatting)),
            }}
          >
            {body}
          </Typography.Paragraph>
        </Flex>
      </div>
    );
  }

  return (
    <div ref={highlightRef ?? sectionRef} id={`spec-block-${block.id}`}>
      <Flex
        gap={token.marginXS}
        align="flex-start"
        style={isListItem ? { paddingInlineStart: token.paddingMD } : undefined}
      >
        {marker ? (
          <Typography.Text style={{ ...hydraTextStyleToReactCss(hydraBaseNormal), userSelect: 'none', minWidth: token.fontSizeLG }}>
            {marker}
          </Typography.Text>
        ) : null}
        <div
          ref={contentRef}
          role="textbox"
          aria-label={isHeading ? 'Section heading' : 'Specification paragraph'}
          aria-multiline="true"
          contentEditable
          suppressContentEditableWarning
          style={{ ...typographyStyle, flex: 1, minWidth: 0 }}
          onMouseDown={(event) => {
            const mark = (event.target as HTMLElement).closest('[data-spec-rec-id]');
            if (mark) handleHighlightPointer(event);
          }}
          onKeyDown={(event) => {
            const mark = (event.target as HTMLElement).closest('[data-spec-rec-id]');
            if (mark && (event.key === 'Enter' || event.key === ' ')) {
              handleHighlightPointer(event);
              return;
            }
            if (event.key === 'Enter' && !event.shiftKey && block.kind !== 'list-item') {
              event.preventDefault();
              contentRef.current?.blur();
            }
          }}
          onFocus={() => {
            focusedRef.current = true;
            onSelect?.();
            const node = contentRef.current;
            if (node && node.textContent !== block.text) {
              node.textContent = block.text;
            }
            focusSnapshotRef.current = block.text;
          }}
          onBlur={commitBlur}
        />
      </Flex>
    </div>
  );
}

function EditableBlockContent({
  block,
  formatting,
  editable,
  showEditButton = true,
  onSelect,
  onChange,
}: {
  block: SpecDocumentBlock;
  formatting?: SpecBlockFormatting;
  editable?: boolean;
  showEditButton?: boolean;
  onSelect?: () => void;
  onChange?: (text: string) => void;
}) {
  const { token } = theme.useToken();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(block.text);

  useEffect(() => {
    if (!editing) setDraft(block.text);
  }, [block.text, editing]);

  const startEditing = () => {
    onSelect?.();
    setEditing(true);
  };

  if (editing) {
    return (
      <Flex vertical gap={token.marginXS} style={{ flex: 1 }}>
        <Input.TextArea
          autoFocus
          autoSize={{ minRows: 2 }}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
        />
        <Flex gap={token.marginXS}>
          <Button
            type="primary"
            size="small"
            disabled={!draft.trim() || draft.trim() === block.text}
            onClick={() => {
              onChange?.(draft.trim());
              setEditing(false);
            }}
          >
            Save text
          </Button>
          <Button
            size="small"
            onClick={() => {
              setDraft(block.text);
              setEditing(false);
            }}
          >
            Cancel
          </Button>
        </Flex>
      </Flex>
    );
  }

  const isHeading =
    block.kind === 'heading' ||
    block.kind === 'subheading' ||
    formatting?.style === 'heading' ||
    formatting?.style === 'subheading';
  const isSubheading = block.kind === 'subheading' || formatting?.style === 'subheading';

  if (isHeading) {
    return (
      <Typography.Title
        level={isSubheading ? 5 : 4}
        style={{
          marginBottom: 0,
          marginTop: isSubheading ? token.marginSM : token.marginMD,
        }}
      >
        {block.text}
      </Typography.Title>
    );
  }

  return (
    <Flex gap={token.marginXS} align="flex-start" style={{ flex: 1 }}>
      {formatting?.bulleted || block.kind === 'list-item' ? (
        <Typography.Text style={hydraTextStyleToReactCss(hydraBaseNormal)}>•</Typography.Text>
      ) : null}
      <Typography.Paragraph
        style={{ ...hydraTextStyleToReactCss(specInlineTextStyle(formatting)), marginBottom: 0, flex: 1 }}
      >
        {block.text}
      </Typography.Paragraph>
      {editable && showEditButton ? (
        <Button type="text" size="small" onClick={startEditing}>
          Edit
        </Button>
      ) : null}
    </Flex>
  );
}

function BlocksVariantViewer({
  filtered,
  highlightBlockId,
  scrollToSectionId,
  approximateCitation,
  editable,
  selectedBlockId,
  formattingByBlockId,
  onSelectBlock,
  onBlockChange,
}: {
  filtered: SpecDocumentBlock[];
  highlightBlockId?: string | null;
  scrollToSectionId?: string | null;
  approximateCitation?: boolean;
  editable?: boolean;
  selectedBlockId?: string | null;
  formattingByBlockId?: Record<string, SpecBlockFormatting>;
  onSelectBlock?: (blockId: string) => void;
  onBlockChange?: (block: SpecDocumentBlock, text: string) => void;
}) {
  const { token } = theme.useToken();
  const highlightRef = useRef<HTMLDivElement | null>(null);
  const sectionRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (highlightBlockId && highlightRef.current) {
      highlightRef.current.scrollIntoView({ behavior: 'auto', block: 'center' });
    }
  }, [highlightBlockId]);

  useEffect(() => {
    if (!scrollToSectionId || highlightBlockId) return;
    if (sectionRef.current) {
      sectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [scrollToSectionId, highlightBlockId]);

  const firstSectionBlockId =
    scrollToSectionId != null
      ? filtered.find((block) => block.sectionId === scrollToSectionId)?.id
      : undefined;

  return (
    <Flex vertical gap={token.marginSM} style={{ width: '100%' }}>
      {filtered.map((block) => {
        const highlighted = block.id === highlightBlockId;
        const selected = block.id === selectedBlockId;
        const formatting = formattingByBlockId?.[block.id];
        const isSectionAnchor = block.id === firstSectionBlockId;
        return (
          <div
            key={block.id}
            ref={highlighted ? highlightRef : isSectionAnchor ? sectionRef : undefined}
            id={`spec-block-${block.id}`}
            onClick={() => onSelectBlock?.(block.id)}
            style={{
              padding: token.paddingSM,
              borderRadius: token.borderRadiusLG,
              background: highlighted
                ? approximateCitation
                  ? token.colorWarningBg
                  : token.colorPrimaryBg
                : token.colorBgContainer,
              border: `${selected ? token.lineWidthBold : token.lineWidth}px ${token.lineType} ${
                highlighted || selected ? token.colorPrimaryBorder : token.colorBorderSecondary
              }`,
            }}
          >
            <Flex justify="space-between" gap={token.marginXS} style={{ marginBottom: token.marginXXS }}>
              <Typography.Text type="secondary">
                Page {block.page}
                {block.label ? ` · ${block.label}` : ''}
              </Typography.Text>
              {highlighted ? <SpecCitationHighlightBanner approximate={approximateCitation} /> : null}
            </Flex>
            <EditableBlockContent
              block={block}
              formatting={formatting}
              editable={editable}
              onSelect={() => onSelectBlock?.(block.id)}
              onChange={(value) => onBlockChange?.(block, value)}
            />
          </div>
        );
      })}
    </Flex>
  );
}

function groupBlocksByPage(
  blocks: SpecDocumentBlock[],
): Array<{ page: number; blocks: SpecDocumentBlock[] }> {
  const byPage = new Map<number, SpecDocumentBlock[]>();
  for (const block of blocks) {
    const pageBlocks = byPage.get(block.page) ?? [];
    pageBlocks.push(block);
    byPage.set(block.page, pageBlocks);
  }
  return [...byPage.entries()]
    .sort(([pageA], [pageB]) => pageA - pageB)
    .map(([page, pageBlocks]) => ({ page, blocks: pageBlocks }));
}

function DocumentPageSheet({
  page,
  totalPages,
  sheetWidth,
  sheetHeight,
  fillContainer,
  children,
}: {
  page: number;
  totalPages: number;
  sheetWidth: number | string;
  sheetHeight: number;
  fillContainer?: boolean;
  children: ReactNode;
}) {
  const { token } = theme.useToken();

  return (
    <Flex
      vertical
      style={{
        width: sheetWidth,
        maxWidth: '100%',
        height: fillContainer ? undefined : sheetHeight,
        minHeight: fillContainer ? undefined : sheetHeight,
        aspectRatio: fillContainer ? 1 / SPEC_A4_ASPECT_RATIO : undefined,
        background: token.colorBgContainer,
        boxShadow: token.boxShadowTertiary,
        overflow: 'hidden',
        flexShrink: 0,
      }}
    >
      <Flex
        vertical
        gap={token.marginXXS}
        style={{
          flex: 1,
          minHeight: 0,
          padding: token.paddingXL,
          overflow: 'hidden',
        }}
      >
        {children}
      </Flex>
      <Flex
        justify="center"
        align="center"
        style={{
          paddingBlock: token.paddingXS,
          borderTop: `${token.lineWidth}px ${token.lineType} ${token.colorBorderSecondary}`,
          background: token.colorFillQuaternary,
        }}
      >
        <Typography.Text type="secondary">
          {page} / {totalPages}
        </Typography.Text>
      </Flex>
    </Flex>
  );
}

function DocumentBlockRow({
  selected,
  fillContainer,
  highlightTone,
  children,
  onSelect,
}: {
  selected?: boolean;
  fillContainer?: boolean;
  highlightTone?: 'active' | 'pending';
  children: ReactNode;
  onSelect?: () => void;
}) {
  const { token } = theme.useToken();
  const isError = fillContainer && highlightTone === 'active';
  const isPending = fillContainer && highlightTone === 'pending';
  const showFullBorder = Boolean(selected);
  const borderWidth = token.lineWidthBold;
  // Border tracks the highlight fill (error / warning), not primary blue.
  const borderColor = isError
    ? token.colorErrorBorder
    : isPending
      ? token.colorWarningBorder
      : selected
        ? token.colorPrimary
        : 'transparent';

  return (
    <div
      role="presentation"
      onClick={onSelect}
      style={{
        padding: token.paddingXS,
        marginInline: fillContainer ? 0 : -token.paddingXS,
        borderRadius: fillContainer
          ? showFullBorder || isPending
            ? token.borderRadiusSM
            : 0
          : token.borderRadiusSM,
        background: isError
          ? token.colorErrorBg
          : isPending
            ? token.colorWarningBg
            : selected && !fillContainer
              ? token.colorPrimaryBg
              : 'transparent',
        ...(fillContainer
          ? showFullBorder
            ? {
                border: `${borderWidth}px ${token.lineType} ${borderColor}`,
              }
            : {
                borderInlineStart: `${borderWidth}px ${token.lineType} ${borderColor}`,
              }
          : {
              borderInlineStart: `${borderWidth}px ${token.lineType} ${
                selected ? token.colorPrimary : 'transparent'
              }`,
            }),
        cursor: onSelect ? 'pointer' : 'default',
      }}
    >
      {children}
    </div>
  );
}

function DocumentVariantViewer({
  filtered,
  highlightBlockId,
  scrollToSectionId,
  approximateCitation,
  highlightSpansByBlockId,
  editable,
  selectedBlockId,
  formattingByBlockId,
  attachToToolbar,
  fillContainer,
  onSelectBlock,
  onBlockChange,
  onHighlightClick,
}: {
  filtered: SpecDocumentBlock[];
  highlightBlockId?: string | null;
  scrollToSectionId?: string | null;
  approximateCitation?: boolean;
  highlightSpansByBlockId?: Record<string, SpecDocumentHighlightSpan[]>;
  editable?: boolean;
  selectedBlockId?: string | null;
  formattingByBlockId?: Record<string, SpecBlockFormatting>;
  /** First page shares a border with the format toolbar above. */
  attachToToolbar?: boolean;
  fillContainer?: boolean;
  onSelectBlock?: (blockId: string) => void;
  onBlockChange?: (block: SpecDocumentBlock, text: string) => void;
  onHighlightClick?: (recommendationId: string) => void;
}) {
  const { token } = theme.useToken();
  const { width: sheetWidth, height: sheetHeight } = specA4Dimensions(token);
  const resolvedWidth: number | string = fillContainer ? '100%' : sheetWidth;
  const highlightRef = useRef<HTMLDivElement | null>(null);
  const sectionRef = useRef<HTMLDivElement | null>(null);

  const pageGroups = useMemo(() => groupBlocksByPage(filtered), [filtered]);
  const totalPages = useMemo(
    () => (filtered.length ? Math.max(...filtered.map((block) => block.page)) : 0),
    [filtered],
  );

  useEffect(() => {
    if (highlightBlockId && highlightRef.current) {
      highlightRef.current.scrollIntoView({ behavior: 'auto', block: 'center' });
      const mark = highlightRef.current.querySelector('[data-spec-highlight="active"]');
      mark?.scrollIntoView({ behavior: 'auto', block: 'center' });
    }
  }, [highlightBlockId]);

  useEffect(() => {
    if (!scrollToSectionId || highlightBlockId) return;
    if (sectionRef.current) {
      sectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [scrollToSectionId, highlightBlockId]);

  const firstSectionBlockId =
    scrollToSectionId != null
      ? filtered.find((block) => block.sectionId === scrollToSectionId)?.id
      : undefined;

  return (
    <Flex
      vertical
      align={fillContainer ? 'stretch' : 'center'}
      gap={attachToToolbar ? 0 : token.marginMD}
      style={{ width: '100%' }}
    >
      {approximateCitation && highlightBlockId ? (
        <Alert
          type="info"
          showIcon
          title="This citation is approximate"
          description="The highlight shows the best matching passage. Confirm the wording against the original page."
          style={{ width: resolvedWidth, maxWidth: '100%' }}
        />
      ) : null}
      <Flex
        vertical
        align={fillContainer ? 'stretch' : 'center'}
        gap={token.marginXXS}
        style={{ width: resolvedWidth, maxWidth: '100%' }}
      >
        {pageGroups.map(({ page, blocks: pageBlocks }) => {
          let listCounter = 0;
          return (
            <DocumentPageSheet
              key={page}
              page={page}
              totalPages={totalPages}
              sheetWidth={resolvedWidth}
              sheetHeight={sheetHeight}
              fillContainer={fillContainer}
            >
              {pageBlocks.map((block) => {
                const isActiveBlock = block.id === highlightBlockId;
                const isSectionAnchor = block.id === firstSectionBlockId;
                const selected = block.id === selectedBlockId;
                const formatting = formattingByBlockId?.[block.id];
                const isList =
                  formatting?.bulleted ||
                  formatting?.numbered ||
                  block.kind === 'list-item';
                const listIndexOnPage = isList ? listCounter++ : 0;
                const spans = highlightSpansByBlockId?.[block.id];
                const highlightTone = isActiveBlock
                  ? 'active'
                  : spans?.some((span) => span.tone === 'pending')
                    ? 'pending'
                    : undefined;
                return (
                  <DocumentBlockRow
                    key={block.id}
                    selected={selected}
                    fillContainer={fillContainer}
                    highlightTone={highlightTone}
                    onSelect={() => onSelectBlock?.(block.id)}
                  >
                    <DocumentEditableBlock
                      block={block}
                      formatting={formatting}
                      editable={editable}
                      highlightSpans={highlightSpansByBlockId?.[block.id]}
                      highlightRef={isActiveBlock ? highlightRef : undefined}
                      sectionRef={isSectionAnchor ? sectionRef : undefined}
                      listIndexOnPage={listIndexOnPage}
                      highlightSurfaceFromParent={Boolean(fillContainer && highlightTone)}
                      onSelect={() => onSelectBlock?.(block.id)}
                      onChange={(text) => onBlockChange?.(block, text)}
                      onHighlightClick={onHighlightClick}
                    />
                  </DocumentBlockRow>
                );
              })}
            </DocumentPageSheet>
          );
        })}
      </Flex>
    </Flex>
  );
}

export function SpecDocumentViewer({
  blocks,
  variant = 'blocks',
  highlightBlockId,
  scrollToSectionId,
  highlightSpansByBlockId,
  approximateCitation,
  pageFilter,
  searchQuery,
  editable,
  selectedBlockId,
  formattingByBlockId,
  attachToToolbar,
  fillContainer,
  onSelectBlock,
  onBlockChange,
  onHighlightClick,
}: {
  blocks: SpecDocumentBlock[];
  /** `document` — continuous spec layout; `blocks` — card list (drawer / legacy). */
  variant?: 'blocks' | 'document';
  highlightBlockId?: string | null;
  scrollToSectionId?: string | null;
  /** Inline text ranges to tint (document mode). */
  highlightSpansByBlockId?: Record<string, SpecDocumentHighlightSpan[]>;
  approximateCitation?: boolean;
  pageFilter?: number | null;
  searchQuery?: string;
  editable?: boolean;
  selectedBlockId?: string | null;
  formattingByBlockId?: Record<string, SpecBlockFormatting>;
  /** Document mode: first page connects visually to the format toolbar. */
  attachToToolbar?: boolean;
  /** Document mode: sheet spans the workspace center column (Review & Edit). */
  fillContainer?: boolean;
  onSelectBlock?: (blockId: string) => void;
  onBlockChange?: (block: SpecDocumentBlock, text: string) => void;
  /** Opens the matching recommendation when inline highlight is clicked. */
  onHighlightClick?: (recommendationId: string) => void;
}) {
  const q = searchQuery?.trim().toLowerCase();
  const filtered = blocks.filter((b) => {
    if (pageFilter != null && b.page !== pageFilter) return false;
    if (q && !b.text.toLowerCase().includes(q)) return false;
    return true;
  });

  if (filtered.length === 0) {
    return (
      <Empty
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        description={q ? 'No blocks match this search.' : 'No source text for this section yet.'}
      />
    );
  }

  if (variant === 'document') {
    return (
      <DocumentVariantViewer
        filtered={filtered}
        highlightBlockId={highlightBlockId}
        scrollToSectionId={scrollToSectionId}
        approximateCitation={approximateCitation}
        highlightSpansByBlockId={highlightSpansByBlockId}
        editable={editable}
        selectedBlockId={selectedBlockId}
        formattingByBlockId={formattingByBlockId}
        attachToToolbar={attachToToolbar}
        fillContainer={fillContainer}
        onSelectBlock={onSelectBlock}
        onBlockChange={onBlockChange}
        onHighlightClick={onHighlightClick}
      />
    );
  }

  return (
    <BlocksVariantViewer
      filtered={filtered}
      highlightBlockId={highlightBlockId}
      scrollToSectionId={scrollToSectionId}
      approximateCitation={approximateCitation}
      editable={editable}
      selectedBlockId={selectedBlockId}
      formattingByBlockId={formattingByBlockId}
      onSelectBlock={onSelectBlock}
      onBlockChange={onBlockChange}
    />
  );
}
