import { useEffect, useMemo, useState } from 'react';

import {
  isParsingReviewLowConfidenceRow,
  parsingReviewMissingFieldsTag,
} from '../bomParsingReviewAlert';
import { buildParsingReviewEditableFields } from '../bomParsingReviewColumns';
import type { BomFieldAliasMap } from '../bomFieldMappingConfig';
import type { BomItem, BomParsingReviewColumnProfile } from '../data/types';
import { HydraTag } from '../../ui/HydraTag';
import {
  hydraBaseNormal,
  hydraBaseStrong,
  hydraTextStyleToReactCss,
} from '../../theme/hydraTypography';
import { Alert, Button, Col, Flex, Form, Modal, Row, Space, Typography, theme } from '../../ui/antd';

/** Figma modal body width (`5506:187558` → `🎰 modal` frame). */
const PARSING_REVIEW_EDIT_MODAL_WIDTH = 681;

type BomParsingReviewRowDrawerProps = {
  open: boolean;
  row: BomItem | null;
  profile: BomParsingReviewColumnProfile;
  fieldMapping?: BomFieldAliasMap;
  onClose: () => void;
  onSave: (rowId: string, patch: Partial<BomItem>) => void;
};

function editableRowPatch(row: BomItem, profile: BomParsingReviewColumnProfile): Partial<BomItem> {
  const patch: Partial<BomItem> = {
    size: row.size,
    manufacturer: row.manufacturer,
    figureNumber: row.figureNumber,
    quantity: row.quantity,
  };

  if (profile === 'description') {
    patch.parsedDescription = row.parsedDescription;
    patch.upc = row.upc;
  }

  if (profile === 'description' || profile === 'sku-only' || profile === 'upc') {
    patch.sku = row.sku;
  }

  if (profile === 'upc') {
    patch.upc = row.upc;
  }

  return patch;
}

function chunkFields<T>(items: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks;
}

export function BomParsingReviewRowDrawer({
  open,
  row,
  profile,
  fieldMapping,
  onClose,
  onSave,
}: BomParsingReviewRowDrawerProps) {
  const { token } = theme.useToken();
  const [draft, setDraft] = useState<BomItem | null>(null);

  useEffect(() => {
    if (open && row) {
      setDraft({ ...row });
    } else {
      setDraft(null);
    }
  }, [open, row]);

  const showIncompleteAlert = useMemo(
    () => (draft ? isParsingReviewLowConfidenceRow(draft, profile) : false),
    [draft, profile],
  );

  const missingFieldsTag = useMemo(
    () => (draft ? parsingReviewMissingFieldsTag(draft, profile) : null),
    [draft, profile],
  );

  if (!draft) return null;

  function handleFieldUpdate(rowId: string, patch: Partial<BomItem>) {
    setDraft((prev) => (prev && prev.id === rowId ? { ...prev, ...patch } : prev));
  }

  function handleSave() {
    if (!draft) return;
    onSave(draft.id, editableRowPatch(draft, profile));
    onClose();
  }

  const fields = buildParsingReviewEditableFields(profile, draft, handleFieldUpdate, fieldMapping);
  const fieldRows = chunkFields(fields, 2);

  return (
    <Modal
      title={`Edit ${draft.originalInput}`}
      open={open}
      onCancel={onClose}
      width={PARSING_REVIEW_EDIT_MODAL_WIDTH}
      centered
      destroyOnClose
      footer={
        <Flex justify="flex-end" gap={token.marginXS}>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="primary" onClick={handleSave}>
            Save Edits
          </Button>
        </Flex>
      }
    >
      <Space orientation="vertical" size={token.marginMD} style={{ width: '100%' }}>
        {missingFieldsTag ? (
          <Flex align="center" gap={token.marginSM} wrap="wrap">
            <HydraTag tone="warning">{missingFieldsTag}</HydraTag>
          </Flex>
        ) : null}

        {showIncompleteAlert ? (
          <Alert
            type="warning"
            showIcon
            message="We may not match this line well"
            description={
              <Typography.Paragraph style={{ ...hydraTextStyleToReactCss(hydraBaseNormal), marginBottom: 0 }}>
                We could not parse everything we usually need. If you have manufacturer, size, SKU, or figure
                number details, add them here — otherwise expect a weaker match or no suggested part. You can still
                continue without changes.
              </Typography.Paragraph>
            }
          />
        ) : null}

        <div
          style={{
            background: token.colorFillAlter,
            borderRadius: token.borderRadius,
            padding: token.paddingMD,
          }}
        >
          <Typography.Text
            type="secondary"
            strong
            style={{ ...hydraTextStyleToReactCss(hydraBaseStrong), display: 'block' }}
          >
            From your file
          </Typography.Text>
          <Typography.Text
            strong
            style={{
              ...hydraTextStyleToReactCss(hydraBaseStrong),
              display: 'block',
              marginTop: token.marginXS,
            }}
          >
            {draft.originalInput}
          </Typography.Text>
        </div>

        <Typography.Text type="secondary" style={hydraTextStyleToReactCss(hydraBaseNormal)}>
          How we split this to match our catalog
        </Typography.Text>

        <Form layout="vertical" requiredMark={false}>
          {fieldRows.map((pair, rowIndex) => (
            <Row key={rowIndex} gutter={[token.marginMD, 0]}>
              {pair.map(({ key, label, node }) => (
                <Col key={key} xs={24} sm={12}>
                  <Form.Item label={label} style={{ marginBottom: token.marginMD }}>
                    {node}
                  </Form.Item>
                </Col>
              ))}
            </Row>
          ))}
        </Form>
      </Space>
    </Modal>
  );
}
