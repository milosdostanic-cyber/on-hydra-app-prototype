import { useState } from 'react';

import {
  deltaCategoryLabel,
  deltaCategoryTone,
} from '../constants/specStatusVocabulary';
import type { SpecAlignmentDelta } from '../data/types';
import {
  Badge,
  Button,
  Col,
  Empty,
  Flex,
  Radio,
  Row,
  Typography,
  theme,
} from '../../ui/antd';
import { HydraTag } from '../../ui/HydraTag';
import { hydraBaseStrong, hydraTextStyleToReactCss } from '../../theme/hydraTypography';

type CompareMode = 'side-by-side' | 'inline';

/**
 * G7 — three-region compare: alignment list + side-by-side/inline panes + detail.
 * Diff categories come from fixtures; the client never computes semantic diff.
 */
export function SpecCompareRegions({
  deltas,
  selectedDeltaId,
  onSelect,
  canCreateChange,
  onCreateChange,
}: {
  deltas: SpecAlignmentDelta[];
  selectedDeltaId?: string | null;
  onSelect: (delta: SpecAlignmentDelta) => void;
  canCreateChange: boolean;
  onCreateChange: (delta: SpecAlignmentDelta) => void;
}) {
  const { token } = theme.useToken();
  const [mode, setMode] = useState<CompareMode>('side-by-side');
  const selected = deltas.find((d) => d.id === selectedDeltaId) ?? deltas[0];

  if (deltas.length === 0) {
    return (
      <Empty
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        description="No differences for this baseline."
      />
    );
  }

  return (
    <Flex
      align="stretch"
      style={{
        width: '100%',
        border: `${token.lineWidth}px ${token.lineType} ${token.colorBorderSecondary}`,
        borderRadius: token.borderRadiusLG,
        overflow: 'hidden',
        background: token.colorBgLayout,
        minHeight: token.controlHeight * 12,
      }}
    >
      <div
        style={{
          flex: '0 0 28%',
          background: token.colorBgContainer,
          borderInlineEnd: `${token.lineWidth}px ${token.lineType} ${token.colorBorderSecondary}`,
          overflow: 'auto',
          padding: token.paddingSM,
        }}
      >
        <Typography.Text style={{ ...hydraTextStyleToReactCss(hydraBaseStrong), display: 'block', marginBottom: token.marginSM }}>
          Alignment
        </Typography.Text>
        <Flex vertical gap={token.marginXS}>
          {deltas.map((delta) => {
            const active = delta.id === selected?.id;
            return (
              <Button
                key={delta.id}
                type={active ? 'primary' : 'default'}
                ghost={active}
                block
                style={{
                  height: 'auto',
                  textAlign: 'start',
                  paddingBlock: token.paddingXS,
                  paddingInline: token.paddingSM,
                  background: active ? token.colorPrimaryBg : token.colorFillQuaternary,
                }}
                onClick={() => onSelect(delta)}
              >
                <Flex vertical gap={token.marginXXS} align="flex-start">
                  <Flex gap={token.marginXXS} wrap="wrap" align="center">
                    <HydraTag tone={deltaCategoryTone(delta.category)}>
                      {deltaCategoryLabel[delta.category]}
                    </HydraTag>
                    <Typography.Text type="secondary">{delta.sectionKey}</Typography.Text>
                  </Flex>
                  <Typography.Text>{delta.title}</Typography.Text>
                </Flex>
              </Button>
            );
          })}
        </Flex>
      </div>

      <div style={{ flex: 1, minWidth: 0, padding: token.paddingMD, overflow: 'auto' }}>
        <Flex justify="space-between" align="center" gap={token.marginSM} style={{ marginBottom: token.marginMD }}>
          <Typography.Text style={hydraTextStyleToReactCss(hydraBaseStrong)}>{selected?.title}</Typography.Text>
          <Radio.Group
            value={mode}
            optionType="button"
            buttonStyle="solid"
            onChange={(event) => setMode(event.target.value as CompareMode)}
            options={[
              { label: 'Side by side', value: 'side-by-side' },
              { label: 'Inline', value: 'inline' },
            ]}
          />
        </Flex>
        {selected ? (
          mode === 'side-by-side' ? (
            <Row gutter={[token.marginMD, token.marginMD]}>
              <Col span={12}>
                <DeltaPane
                  label="Baseline"
                  text={selected.baselineText}
                  category={selected.category === 'removed' || selected.category === 'semantic' ? 'removed' : undefined}
                />
              </Col>
              <Col span={12}>
                <DeltaPane
                  label="Current"
                  text={selected.currentText}
                  category={selected.category === 'added' || selected.category === 'semantic' ? 'added' : undefined}
                />
              </Col>
            </Row>
          ) : (
            <Flex vertical gap={token.marginMD}>
              <DeltaPane
                label="Baseline"
                text={selected.baselineText}
                category={selected.category === 'removed' || selected.category === 'semantic' ? 'removed' : undefined}
              />
              <DeltaPane
                label="Current"
                text={selected.currentText}
                category={selected.category === 'added' || selected.category === 'semantic' ? 'added' : undefined}
              />
            </Flex>
          )
        ) : null}
      </div>

      <div
        style={{
          flex: '0 0 24%',
          background: token.colorBgContainer,
          borderInlineStart: `${token.lineWidth}px ${token.lineType} ${token.colorBorderSecondary}`,
          overflow: 'auto',
          padding: token.paddingMD,
        }}
      >
        {selected ? (
          <Flex vertical gap={token.marginSM}>
            <Typography.Text style={hydraTextStyleToReactCss(hydraBaseStrong)}>Selected difference</Typography.Text>
            <Badge
              status={
                selected.category === 'added'
                  ? 'success'
                  : selected.category === 'removed'
                    ? 'error'
                    : selected.category === 'semantic'
                      ? 'warning'
                      : 'default'
              }
              text={deltaCategoryLabel[selected.category]}
            />
            <Typography.Text type="secondary">{selected.sectionKey}</Typography.Text>
            {selected.note ? <Typography.Paragraph>{selected.note}</Typography.Paragraph> : null}
            {canCreateChange && selected.category !== 'matched' ? (
              <Button type="primary" size="large" onClick={() => onCreateChange(selected)}>
                Create change from difference
              </Button>
            ) : null}
            {selected.category === 'matched' ? (
              <Typography.Text type="secondary">Matched sections do not need a change.</Typography.Text>
            ) : null}
          </Flex>
        ) : (
          <Empty description="Select a difference." />
        )}
      </div>
    </Flex>
  );
}

function DeltaPane({
  label,
  text,
  category,
}: {
  label: string;
  text: string;
  category?: 'added' | 'removed';
}) {
  const { token } = theme.useToken();
  const background =
    category === 'added' ? token.colorSuccessBg : category === 'removed' ? token.colorErrorBg : token.colorBgContainer;
  const categoryLabel =
    category === 'added' ? deltaCategoryLabel.added : category === 'removed' ? deltaCategoryLabel.removed : undefined;

  return (
    <div
      style={{
        padding: token.paddingMD,
        borderRadius: token.borderRadiusLG,
        background,
        border: `${token.lineWidth}px ${token.lineType} ${token.colorBorderSecondary}`,
        minHeight: token.controlHeightLG * 3,
      }}
    >
      <Flex justify="space-between" gap={token.marginXS} style={{ marginBottom: token.marginXS }}>
        <Typography.Text type="secondary">{label}</Typography.Text>
        {categoryLabel ? <HydraTag tone={category === 'added' ? 'success' : 'error'}>{categoryLabel}</HydraTag> : null}
      </Flex>
      <Typography.Paragraph style={{ marginBottom: 0 }}>
        {text.trim() ? text : '—'}
      </Typography.Paragraph>
    </div>
  );
}
