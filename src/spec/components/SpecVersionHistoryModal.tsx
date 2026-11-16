import { useMemo } from 'react';

import type { SpecDocument, SpecDocumentVersionRecord } from '../data/types';
import { reviewStateLabel } from '../constants/specStatusVocabulary';
import { Button, Card, Flex, Modal, Tag, Tooltip, Typography, theme } from '../../ui/antd';
import { hydraBaseStrong, hydraTextStyleToReactCss } from '../../theme/hydraTypography';

type VersionCardData = {
  key: string;
  versionLabel: string;
  current: boolean;
  uploadedAt: string;
  uploadedBy: string;
  reviewStateLabel: string;
  ascMasterLabel: string;
};

type Props = {
  open: boolean;
  document: SpecDocument | undefined;
  onCancel: () => void;
  onUploadNewVersion: () => void;
  onOpenCurrentVersion: (document: SpecDocument) => void;
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

function toCardData(document: SpecDocument): VersionCardData[] {
  const current: VersionCardData = {
    key: document.id,
    versionLabel: document.versionLabel,
    current: true,
    uploadedAt: document.updatedAt,
    uploadedBy: document.owner,
    reviewStateLabel: reviewStateLabel[document.reviewState],
    ascMasterLabel: document.ascMaster ? `${document.ascMaster.label} · Version ${document.ascMaster.version}` : 'Not selected',
  };
  const previous = (document.previousVersions ?? []).map(
    (version: SpecDocumentVersionRecord): VersionCardData => ({
      key: version.id,
      versionLabel: version.versionLabel,
      current: false,
      uploadedAt: version.uploadedAt,
      uploadedBy: version.uploadedBy,
      reviewStateLabel: reviewStateLabel[version.reviewState],
      ascMasterLabel: version.ascMaster ? `${version.ascMaster.label} · Version ${version.ascMaster.version}` : 'Not selected',
    }),
  );
  return [current, ...previous];
}

/**
 * M01 — SPEC version history (audit §7.1). Every analysis/export stays tied
 * to the exact customer and Master SPEC versions in effect at the time.
 */
export function SpecVersionHistoryModal({ open, document, onCancel, onUploadNewVersion, onOpenCurrentVersion }: Props) {
  const { token } = theme.useToken();
  const cards = useMemo(() => (document ? toCardData(document) : []), [document]);

  return (
    <Modal
      title="Version history"
      open={open}
      onCancel={onCancel}
      destroyOnHidden
      width={token.sizeUnit * 130}
      footer={
        <Flex justify="flex-end">
          <Button type="primary" size="large" onClick={onUploadNewVersion}>
            Upload new version
          </Button>
        </Flex>
      }
    >
      <Flex vertical gap={token.marginMD}>
        <Flex vertical gap={token.marginXXS}>
          <Typography.Text style={hydraTextStyleToReactCss(hydraBaseStrong)}>{document?.title}</Typography.Text>
          <Typography.Text type="secondary">
            Every analysis and export remains tied to the exact customer and Master SPEC versions used at the
            time.
          </Typography.Text>
        </Flex>

        <Flex vertical gap={token.marginSM}>
          {cards.map((card) => (
            <Card key={card.key} size="small" styles={{ body: { padding: token.paddingSM } }}>
              <Flex justify="space-between" align="flex-start" gap={token.marginSM} wrap="wrap">
                <Flex vertical gap={token.marginXXS}>
                  <Flex align="center" gap={token.marginXS}>
                    <Typography.Text style={hydraTextStyleToReactCss(hydraBaseStrong)}>{card.versionLabel}</Typography.Text>
                    {card.current ? <Tag color="processing">Current</Tag> : null}
                  </Flex>
                  <Typography.Text type="secondary">
                    Uploaded {formatDate(card.uploadedAt)} by {card.uploadedBy}
                  </Typography.Text>
                  <Typography.Text type="secondary">{card.reviewStateLabel}</Typography.Text>
                  <Typography.Text type="secondary">{card.ascMasterLabel}</Typography.Text>
                </Flex>
                {card.current ? (
                  <Button
                    type="link"
                    size="small"
                    style={{ padding: 0, height: 'auto' }}
                    onClick={() => document && onOpenCurrentVersion(document)}
                  >
                    Open
                  </Button>
                ) : (
                  <Tooltip title="Opening a specific past version arrives in a later phase.">
                    <Button type="link" size="small" disabled style={{ padding: 0, height: 'auto' }}>
                      Open
                    </Button>
                  </Tooltip>
                )}
              </Flex>
            </Card>
          ))}
        </Flex>
      </Flex>
    </Modal>
  );
}
