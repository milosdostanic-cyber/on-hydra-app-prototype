import { useMemo } from 'react';

import { parsingReviewIssueLabels } from '../bomParsingReviewAlert';
import { buildParsingReviewEditableFields } from '../bomParsingReviewColumns';
import { BomConfidenceTag } from './BomTags';
import type { BomItem, BomParsingReviewColumnProfile } from '../data/types';
import {
  hydraBaseNormal,
  hydraSmallNormal,
  hydraTextStyleToReactCss,
} from '../../theme/hydraTypography';
import { Alert, Button, Drawer, Flex, Form, Space, Typography, theme } from '../../ui/antd';

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
    <Drawer
      title={`Line ${draftRow.rowNumber} — add or edit info`}
      open={open}
      onClose={onClose}
      width={480}
      destroyOnClose
      footer={
        <Flex justify="flex-end" gap={token.marginSM}>
          <Button size="large" onClick={onClose}>
            Done
          </Button>
        </Flex>
      }
    >
      <Space orientation="vertical" size={token.marginMD} style={{ width: '100%' }}>
        <Flex align="center" gap={token.marginSM} wrap="wrap">
          <BomConfidenceTag confidence={draftRow.confidence} showIcon />
          {issueLabels.length > 0 ? (
            <Typography.Text type="secondary" style={hydraTextStyleToReactCss(hydraSmallNormal)}>
              {issueLabels.join(' · ')}
            </Typography.Text>
          ) : null}
        </Flex>

        {draftRow.confidence !== 'high' ? (
          <Alert
            type="info"
            showIcon
            message="Optional improvement"
            description="Adding missing details can improve match accuracy. You can still continue without changing this row."
          />
        ) : null}

        <div>
          <Typography.Text
            type="secondary"
            style={{
              ...hydraTextStyleToReactCss(hydraSmallNormal),
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              display: 'block',
              marginBottom: token.marginXXS,
            }}
          >
            Original import
          </Typography.Text>
          <Typography.Text style={hydraTextStyleToReactCss(hydraBaseNormal)}>
            {draftRow.originalInput}
          </Typography.Text>
        </div>

        <Form layout="vertical">
          {fields.map(({ key, label, node }) => (
            <Form.Item key={key} label={label}>
              {node}
            </Form.Item>
          ))}
        </Form>
      </Space>
    </Drawer>
  );
}
