import { useEffect, useMemo, useState } from 'react';

import { resolveBomProjectStatus } from '../bomProjectStatus';
import { BomProjectStatusTag } from './BomTags';
import type { BomProject } from '../data/types';
import { sortBomProjectsByLastEditedDesc } from '../bomUploadFlowState';
import {
  hydraBaseNormal,
  hydraLargeStrong,
  hydraSubtitleLarge,
  hydraTextStyleToReactCss,
  hydraTitleHeading5,
} from '../../theme/hydraTypography';
import {
  Alert,
  Button,
  Divider,
  Flex,
  Modal,
  Radio,
  Select,
  Space,
  Typography,
  theme,
} from '../../ui/antd';

type BomUploadDestinationModalProps = {
  open: boolean;
  fileName: string;
  fileSizeBytes: number;
  /** BOM projects in the active construction project (already filtered). */
  projectBoms: BomProject[];
  /** When false, "Add to existing" is disabled (no construction project selected). */
  hasConstructionProject: boolean;
  onCancel: () => void;
  onContinue: (payload: { mode: 'new' } | { mode: 'append'; projectId: string }) => void;
};

export function BomUploadDestinationModal({
  open,
  fileName,
  fileSizeBytes,
  projectBoms,
  hasConstructionProject,
  onCancel,
  onContinue,
}: BomUploadDestinationModalProps) {
  const { token } = theme.useToken();
  const sorted = useMemo(() => sortBomProjectsByLastEditedDesc(projectBoms), [projectBoms]);
  const [mode, setMode] = useState<'new' | 'append'>('new');
  const [appendProjectId, setAppendProjectId] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (!open) return;
    setMode('new');
    setAppendProjectId(sorted.length === 1 ? sorted[0].id : undefined);
  }, [open, sorted]);

  const sizeLabel = useMemo(() => {
    if (fileSizeBytes < 1024) return `${fileSizeBytes} B`;
    if (fileSizeBytes < 1024 * 1024) return `${Math.round(fileSizeBytes / 1024)} KB`;
    return `${(fileSizeBytes / (1024 * 1024)).toFixed(1)} MB`;
  }, [fileSizeBytes]);

  const canAppend = hasConstructionProject && projectBoms.length > 0;
  const appendDisabledReason = !hasConstructionProject
    ? 'Pick a construction project in the top bar first.'
    : projectBoms.length === 0
      ? 'No BOM projects yet in this construction project.'
      : undefined;

  const primaryDisabled = mode === 'append' && (!appendProjectId || !canAppend);

  const selectOptions = useMemo(
    () =>
      sorted.map((p) => ({
        value: p.id,
        label: (
          <Flex vertical gap={token.marginXXS}>
            <Typography.Text style={hydraTextStyleToReactCss(hydraSubtitleLarge)}>
              {p.name}
            </Typography.Text>
            <Flex gap={token.marginSM} align="center" wrap="wrap">
              <Typography.Text type="secondary" style={hydraTextStyleToReactCss(hydraBaseNormal)}>
                {p.lastEdited}
              </Typography.Text>
              <BomProjectStatusTag status={resolveBomProjectStatus(p.id)} />
              <Typography.Text type="secondary" style={hydraTextStyleToReactCss(hydraBaseNormal)}>
                {p.items} items
              </Typography.Text>
            </Flex>
          </Flex>
        ),
      })),
    [sorted, token.marginSM, token.marginXXS],
  );

  const fileSummary = (
    <>
      <Typography.Text style={{ display: 'block', color: token.colorText, ...hydraTextStyleToReactCss(hydraBaseNormal) }}>
        {fileName}
      </Typography.Text>
      <Typography.Text style={{ display: 'block', color: token.colorText, ...hydraTextStyleToReactCss(hydraBaseNormal) }}>
        {sizeLabel}
      </Typography.Text>
    </>
  );

  return (
    <Modal
      title={
        <span style={{ color: token.colorText, ...hydraTextStyleToReactCss(hydraTitleHeading5) }}>
          Upload destination
        </span>
      }
      open={open}
      onCancel={onCancel}
      footer={
        <Flex justify="flex-end" gap={token.marginXS} wrap="wrap">
          <Button onClick={onCancel}>Cancel</Button>
          <Button
            type="primary"
            disabled={primaryDisabled}
            onClick={() => {
              if (mode === 'new') onContinue({ mode: 'new' });
              else if (appendProjectId) onContinue({ mode: 'append', projectId: appendProjectId });
            }}
          >
            Continue
          </Button>
        </Flex>
      }
      width={token.sizeUnit * 130}
      centered
      destroyOnClose
    >
      <Flex vertical gap={0} style={{ width: '100%', paddingBottom: token.paddingSM }}>
        <Alert
          type="success"
          showIcon={false}
          message={
            <Typography.Text style={{ color: token.colorText, ...hydraTextStyleToReactCss(hydraLargeStrong) }}>
              Selected file
            </Typography.Text>
          }
          description={fileSummary}
          style={{ borderRadius: token.borderRadiusLG }}
        />

        <Flex vertical gap={token.paddingXS} style={{ width: '100%', marginTop: token.paddingSM }}>
          <Divider style={{ margin: 0, borderColor: token.colorBorderSecondary }} />

          <Typography.Text style={{ color: token.colorText, ...hydraTextStyleToReactCss(hydraLargeStrong) }}>
            Where should this file go?
          </Typography.Text>

          <Radio.Group value={mode} onChange={(e) => setMode(e.target.value)} style={{ width: '100%' }}>
            <Space orientation="vertical" size={token.marginXS} style={{ width: '100%' }}>
              <Radio value="new">
                <Typography.Text style={{ color: token.colorText, ...hydraTextStyleToReactCss(hydraBaseNormal) }}>
                  Create a new BOM project
                </Typography.Text>
              </Radio>
              <Radio value="append" disabled={!canAppend}>
                <Typography.Text style={{ color: token.colorText, ...hydraTextStyleToReactCss(hydraBaseNormal) }}>
                  Add to an existing BOM project
                </Typography.Text>
              </Radio>
            </Space>
          </Radio.Group>

          {!canAppend && appendDisabledReason ? (
            <Typography.Text type="secondary" style={hydraTextStyleToReactCss(hydraBaseNormal)}>
              {appendDisabledReason}
            </Typography.Text>
          ) : null}

          {mode === 'append' && canAppend ? (
            <Flex vertical gap={token.marginXS} style={{ width: '100%', marginTop: token.paddingSM }}>
              <Typography.Text type="secondary" style={hydraTextStyleToReactCss(hydraBaseNormal)}>
                BOM project
              </Typography.Text>
              <Select
                showSearch
                placeholder="Search or select a BOM project"
                value={appendProjectId}
                onChange={setAppendProjectId}
                style={{ width: '100%' }}
                options={selectOptions}
                filterOption={(input, option) => {
                  const proj = sorted.find((x) => x.id === option?.value);
                  return proj?.name.toLowerCase().includes(input.toLowerCase()) ?? false;
                }}
              />
            </Flex>
          ) : null}
        </Flex>
      </Flex>
    </Modal>
  );
}
