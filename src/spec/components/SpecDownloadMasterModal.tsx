import { DownloadOutlined, FileWordOutlined } from '@ant-design/icons';
import { useEffect, useState } from 'react';

import { specMasterCatalogEntry, SPEC_MASTER_CATALOG } from '../data/specDocumentsSeed';
import type { SpecSystemType } from '../data/types';
import { systemTypeLabel } from '../constants/specStatusVocabulary';
import { trackSpecEvent } from '../specAnalytics';
import { Alert, App, Button, Checkbox, Flex, Modal, Typography, theme } from '../../ui/antd';

type Props = {
  open: boolean;
  onCancel: () => void;
};

const DEFAULT_SELECTION: SpecSystemType[] = ['fire-protection'];
const catalogSystemTypes = SPEC_MASTER_CATALOG.map((entry) => entry.systemType);

/**
 * M02 — Download ASC Master SPEC (audit §7.2). Standalone editable download;
 * creates no `SpecDocument` and starts no analysis.
 */
export function SpecDownloadMasterModal({ open, onCancel }: Props) {
  const { token } = theme.useToken();
  const { message } = App.useApp();
  const [selected, setSelected] = useState<SpecSystemType[]>(DEFAULT_SELECTION);
  const allSelected = selected.length === catalogSystemTypes.length;
  const someSelected = selected.length > 0 && !allSelected;

  useEffect(() => {
    if (!open) return;
    setSelected(DEFAULT_SELECTION);
  }, [open]);

  function download() {
    if (selected.length === 0) return;

    for (const systemType of selected) {
      const entry = specMasterCatalogEntry(systemType);
      trackSpecEvent('spec_master_downloaded', { systemType, version: entry.currentVersion });
    }

    if (selected.length === 1) {
      const entry = specMasterCatalogEntry(selected[0]!);
      message.success(
        `${entry.label} ${entry.currentVersion} prepared as an editable Word document (mock).`,
      );
    } else {
      message.success(
        `${selected.length} Master SPECs prepared as editable Word documents (mock).`,
      );
    }
    onCancel();
  }

  return (
    <Modal
      title="Download ASC Master SPEC"
      open={open}
      onCancel={onCancel}
      destroyOnHidden
      footer={
        <Flex justify="flex-end" gap={token.marginXS}>
          <Button size="large" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            type="primary"
            size="large"
            icon={<DownloadOutlined />}
            disabled={selected.length === 0}
            onClick={download}
          >
            {selected.length > 0 ? `Download (${selected.length})` : 'Download'}
          </Button>
        </Flex>
      }
    >
      <Flex vertical gap={token.marginMD}>
        <Typography.Text type="secondary">
          Choose one or more ASC Master SPECs to download as editable Word files.
        </Typography.Text>
        <Flex
          vertical
          style={{
            border: `${token.lineWidth}px ${token.lineType} ${token.colorBorderSecondary}`,
            borderRadius: token.borderRadiusLG,
            overflow: 'hidden',
          }}
        >
          <Flex
            align="center"
            justify="space-between"
            gap={token.marginSM}
            style={{
              paddingInline: token.paddingSM,
              paddingBlock: token.paddingXS,
              background: token.colorFillAlter,
              borderBottom: `${token.lineWidth}px ${token.lineType} ${token.colorBorderSecondary}`,
            }}
          >
            <Checkbox
              checked={allSelected}
              indeterminate={someSelected}
              onChange={(event) => {
                setSelected(event.target.checked ? catalogSystemTypes : []);
              }}
            >
              Select all
            </Checkbox>
            <Typography.Text type="secondary">
              {selected.length} of {catalogSystemTypes.length} selected
            </Typography.Text>
          </Flex>
          <Checkbox.Group
            value={selected}
            onChange={(values) => setSelected(values as SpecSystemType[])}
            style={{ width: '100%', padding: token.paddingSM }}
          >
            <Flex vertical gap={token.marginSM}>
              {SPEC_MASTER_CATALOG.map((catalogEntry) => (
                <Checkbox key={catalogEntry.systemType} value={catalogEntry.systemType}>
                  <Flex vertical gap={token.marginXXS}>
                    <Typography.Text strong>
                      Division {catalogEntry.division} — {systemTypeLabel[catalogEntry.systemType]}
                    </Typography.Text>
                    <Typography.Text type="secondary">
                      {catalogEntry.label} · Current version {catalogEntry.currentVersion}
                    </Typography.Text>
                  </Flex>
                </Checkbox>
              ))}
            </Flex>
          </Checkbox.Group>
        </Flex>
        {selected.length === 0 ? (
          <Typography.Text type="secondary">Select at least one Master SPEC to download.</Typography.Text>
        ) : null}
        <Alert
          type="info"
          showIcon
          icon={<FileWordOutlined />}
          message="Editable Word format"
          description="This is a standalone download and does not start analysis. The prototype confirms a mock download; no production file is generated."
        />
      </Flex>
    </Modal>
  );
}
