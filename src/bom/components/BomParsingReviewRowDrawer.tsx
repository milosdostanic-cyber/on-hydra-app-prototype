import { useMemo } from 'react';

import { parsingReviewIssueLabels } from '../bomParsingReviewAlert';
import { buildParsingReviewEditableFields } from '../bomParsingReviewColumns';
import { BomConfidenceTag } from './BomTags';
import { bomImportedDataShellStyle } from '../bomImportedDataEmphasis';
import type { BomItem, BomParsingReviewColumnProfile } from '../data/types';
import {
  hydraBaseNormal,
  hydraBaseStrong,
  hydraTextStyleToReactCss,
} from '../../theme/hydraTypography';
import { Alert, Button, Flex, Form, Modal, Space, Typography, theme } from '../../ui/antd';

type BomParsingReviewRowDrawerProps = {
  open: boolean;
  row: BomItem | null;
  profile: BomParsingReviewColumnProfile;
  onClose: () => void;
  onSave: (rowId: string, patch: Partial<BomItem>) => void;
};

export function BomParsingReviewRowDrawer({
  open,
  row,
  profile,
  onClose,
  onSave,
}: BomParsingReviewRowDrawerProps) {
  const { token } = theme.useToken();

  const draftRow = row;
  const issueLabels = useMemo(
    () => (draftRow ? parsingReviewIssueLabels(draftRow, profile) : []),
    [draftRow, profile],
  );

  if (!draftRow) return null;

  function handleFieldUpdate(rowId: string, patch: Partial<BomItem>) {
    onSave(rowId, patch);
  }

  const fields = buildParsingReviewEditableFields(profile, draftRow, handleFieldUpdate);

  return (
    <Modal
      title={`Line ${draftRow.rowNumber} — add or edit info`}
      open={open}
      onCancel={onClose}
      width={520}
      centered
      destroyOnClose
      footer={
        <Flex justify="flex-end" gap={token.marginXS}>
          <Button size="large" type="primary" onClick={onClose}>
            Done
          </Button>
        </Flex>
      }
    >
      <Space orientation="vertical" size={token.marginMD} style={{ width: '100%' }}>
        <Flex align="center" gap={token.marginSM} wrap="wrap">
          <BomConfidenceTag confidence={draftRow.confidence} showIcon />
          {issueLabels.length > 0 ? (
            <Typography.Text type="secondary" style={hydraTextStyleToReactCss(hydraBaseNormal)}>
              {issueLabels.join(' · ')}
            </Typography.Text>
          ) : null}
        </Flex>

        {issueLabels.length > 0 ? (
          <Alert
            type="warning"
            showIcon
            message="We may not match this line well"
            description={
              <Typography.Paragraph style={{ ...hydraTextStyleToReactCss(hydraBaseNormal), marginBottom: 0 }}>
                We could not parse everything we usually need. If you have manufacturer, size, SKU, or figure
                number details, add them here — otherwise expect a weaker match or no suggested part.{' '}
                <span style={hydraTextStyleToReactCss(hydraBaseStrong)}>
                  You can still continue without changes.
                </span>
              </Typography.Paragraph>
            }
          />
        ) : null}

        <div>
          <Typography.Text
            type="secondary"
            style={{
              ...hydraTextStyleToReactCss(hydraBaseNormal),
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              display: 'block',
              marginBottom: token.marginXXS,
            }}
          >
            From your file
          </Typography.Text>
          <div style={bomImportedDataShellStyle(token)}>
            <Typography.Text style={hydraTextStyleToReactCss(hydraBaseNormal)}>
              {draftRow.originalInput}
            </Typography.Text>
          </div>
        </div>

        <Typography.Text type="secondary" style={hydraTextStyleToReactCss(hydraBaseNormal)}>
          How we split this to match our catalog
        </Typography.Text>

        <Form layout="vertical">
          {fields.map(({ key, label, node }) => (
            <Form.Item key={key} label={label}>
              {node}
            </Form.Item>
          ))}
        </Form>
      </Space>
    </Modal>
  );
}
