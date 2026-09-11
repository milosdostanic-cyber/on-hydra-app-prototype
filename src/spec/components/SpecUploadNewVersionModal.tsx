import { UploadOutlined } from '@ant-design/icons';
import { useEffect, useRef, useState, type DragEvent } from 'react';

import { specMasterCatalogEntry, SPEC_MASTER_CATALOG } from '../data/specDocumentsSeed';
import type { SpecDocument, SpecSystemType } from '../data/types';
import { mockSpecDocumentRepository } from '../data/repositories/specRepositories';
import { systemTypeDivision, systemTypeLabel } from '../constants/specStatusVocabulary';
import {
  SPEC_UPLOAD_ACCEPT_ATTRIBUTE,
  formatSpecFileSize,
  specFileTypeFromName,
  validateSpecUpload,
} from '../constants/specUploadLimits';
import { trackSpecEvent } from '../specAnalytics';
import { Alert, App, Button, Flex, Modal, Radio, Steps, Tag, Typography, theme } from '../../ui/antd';

type Props = {
  open: boolean;
  document: SpecDocument;
  projectTitle: string;
  onCancel: () => void;
  onUploaded: (document: SpecDocument) => void;
};

const STEP_ITEMS = [{ title: 'Upload file' }, { title: 'Review and start' }];

/** Same heuristic as W01 — division is auto-detected at upload; user may override on step 2. */
function inferSystemTypeFromFileName(fileName: string): SpecSystemType {
  const name = fileName.toLowerCase();
  if (/\b(fire|suppression|sprinkler|div(?:ision)?[_\s-]*21|\b21[_\s-])\b/.test(name)) {
    return 'fire-protection';
  }
  if (/\b(hvac|mechanical|heating|ventilat|air[_\s-]?cond|div(?:ision)?[_\s-]*23|\b23[_\s-])\b/.test(name)) {
    return 'hvac';
  }
  if (/\b(plumb|fixture|water|piping|div(?:ision)?[_\s-]*22|\b22[_\s-])\b/.test(name)) {
    return 'plumbing';
  }
  return 'plumbing';
}

/**
 * W02 — Upload new version (audit §6.2). Never overwrites the current
 * version; `SpecDocumentRepository.createNewVersion` pushes it into
 * `previousVersions` (V2 version contract — plan §5.4).
 *
 * Step 2 keeps W02 review content (version change, Master SPEC, preservation)
 * and uses the Confirm Master SPEC UI pattern (success file Alert, Division cards).
 */
export function SpecUploadNewVersionModal({ open, document, projectTitle, onCancel, onUploaded }: Props) {
  const { token } = theme.useToken();
  const { message } = App.useApp();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState(0);
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string>();
  const [systemType, setSystemType] = useState<SpecSystemType>(document.systemType);
  const [detectedType, setDetectedType] = useState<SpecSystemType>(document.systemType);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!open) return;
    setStep(0);
    setFile(null);
    setFileError(undefined);
    setSystemType(document.systemType);
    setDetectedType(document.systemType);
  }, [open, document]);

  const masterEntry = specMasterCatalogEntry(systemType);
  const masterVersion = masterEntry.currentVersion;
  const nextVersionNumber = (document.versionNumber ?? 1) + 1;

  function pickFile(nextFile: File | null) {
    if (!nextFile) return;
    const rejection = validateSpecUpload(nextFile);
    if (rejection) {
      setFile(null);
      setFileError(rejection.message);
      return;
    }
    const detected = inferSystemTypeFromFileName(nextFile.name);
    setFile(nextFile);
    setFileError(undefined);
    setSystemType(detected);
    setDetectedType(detected);
  }

  function retryValidation() {
    if (file) pickFile(file);
  }

  async function uploadAndAnalyze() {
    if (!file) return;
    const fileType = specFileTypeFromName(file.name);
    if (!fileType) {
      setFileError('This file type is not supported.');
      setStep(0);
      return;
    }
    setUploading(true);
    try {
      const next = await mockSpecDocumentRepository.createNewVersion(document.id, {
        fileName: file.name,
        fileType,
        fileSizeBytes: file.size,
        divisionHint: systemTypeDivision[systemType],
        systemType,
        ascMaster: { id: `${systemType}-${masterVersion}`, label: masterEntry.label, version: masterVersion },
      });
      if (!next) {
        message.error('This SPEC could not be found. Try again from the list.');
        return;
      }
      trackSpecEvent('spec_upload_started', { destination: 'project' });
      message.success(`Version ${next.versionLabel} uploaded. Analysis has started.`);
      onUploaded(next);
    } catch {
      message.error('The new version could not be uploaded. Try again.');
    } finally {
      setUploading(false);
    }
  }

  const canContinue = Boolean(file) && !fileError;

  function handleDropZoneDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    event.stopPropagation();
    pickFile(event.dataTransfer.files?.[0] ?? null);
  }

  return (
    <Modal
      title="Upload a new version"
      open={open}
      onCancel={onCancel}
      destroyOnHidden
      width={token.sizeUnit * 170}
      footer={
        <Flex justify="flex-end" gap={token.marginXS}>
          {step === 0 ? (
            <Button onClick={onCancel} disabled={uploading}>
              Cancel
            </Button>
          ) : (
            <Button onClick={() => setStep(0)} disabled={uploading}>
              Back
            </Button>
          )}
          {step === 0 ? (
            <Button type="primary" disabled={!canContinue} onClick={() => setStep(1)}>
              Continue
            </Button>
          ) : (
            <Button type="primary" loading={uploading} onClick={() => void uploadAndAnalyze()}>
              Upload and analyze
            </Button>
          )}
        </Flex>
      }
    >
      <Flex vertical gap={token.marginMD}>
        <Steps current={step} items={STEP_ITEMS} />

        {step === 0 ? (
          <Flex vertical gap={token.marginMD}>
            <Flex vertical gap={token.marginXXS}>
              <Typography.Text type="secondary">Project</Typography.Text>
              <Typography.Text strong>{projectTitle}</Typography.Text>
            </Flex>
            <Flex vertical gap={token.marginXXS}>
              <Typography.Text type="secondary">SPEC</Typography.Text>
              <Typography.Text strong>
                {document.title} · Current version {document.versionLabel}
              </Typography.Text>
            </Flex>
            <input
              ref={fileInputRef}
              type="file"
              accept={SPEC_UPLOAD_ACCEPT_ATTRIBUTE}
              style={{ display: 'none' }}
              onChange={(event) => pickFile(event.target.files?.[0] ?? null)}
            />
            <Flex
              vertical
              align="center"
              justify="center"
              gap={token.paddingSM}
              onDragOver={(event) => {
                event.preventDefault();
                event.stopPropagation();
              }}
              onDrop={handleDropZoneDrop}
              style={{
                width: '100%',
                padding: token.paddingLG,
                background: token.colorFillQuaternary,
                borderWidth: token.lineWidth,
                borderStyle: 'dashed',
                borderColor: token.colorBorder,
                borderRadius: token.borderRadius,
              }}
            >
              <UploadOutlined style={{ fontSize: token.sizeLG, color: token.colorPrimary }} />
              <Flex vertical align="center" gap={token.marginXXS} style={{ width: '100%', textAlign: 'center' }}>
                <Typography.Title level={5} style={{ margin: 0 }}>
                  {file ? file.name : 'Drop the replacement PDF or DOCX here'}
                </Typography.Title>
                <Typography.Text type="secondary">
                  {file
                    ? formatSpecFileSize(file.size)
                    : 'The current version, its decisions, and export history remain available.'}
                </Typography.Text>
              </Flex>
              <Button type="primary" onClick={() => fileInputRef.current?.click()}>
                Choose file
              </Button>
            </Flex>
            <Alert
              type="info"
              message={`This uploads version v${nextVersionNumber}`}
              description="Current decisions and export history for the earlier version remain available in Version history. The current version is not overwritten."
            />

            {fileError ? (
              <Alert
                type="error"
                showIcon
                message="This file could not be validated as a supported SPEC"
                description={fileError}
                action={
                  <Flex gap={token.marginXS}>
                    <Button size="small" onClick={() => fileInputRef.current?.click()}>
                      Choose another file
                    </Button>
                    <Button size="small" onClick={retryValidation}>
                      Retry
                    </Button>
                  </Flex>
                }
              />
            ) : null}
          </Flex>
        ) : null}

        {step === 1 ? (
          <Flex vertical gap={token.marginMD}>
            <Typography.Text type="secondary">
              Version {document.versionLabel} → v{nextVersionNumber}
            </Typography.Text>

            {file ? (
              <Alert type="success" message="Uploaded file" description={file.name} style={{ width: '100%' }} />
            ) : null}

            <Flex vertical gap={token.marginXS}>
              <Flex vertical>
                <Typography.Text strong>Division</Typography.Text>
                <Typography.Text type="secondary">
                  Change it only if the document belongs to another supported division.
                </Typography.Text>
              </Flex>
              <Radio.Group
                value={systemType}
                onChange={(event) => setSystemType(event.target.value as SpecSystemType)}
                style={{ width: '100%' }}
              >
                <Flex gap={token.marginSM} wrap="wrap">
                  {SPEC_MASTER_CATALOG.map((entry) => {
                    const selected = systemType === entry.systemType;
                    const autoDetected = entry.systemType === detectedType;
                    return (
                      <Flex
                        key={entry.systemType}
                        vertical
                        gap={token.marginXXS}
                        onClick={() => setSystemType(entry.systemType)}
                        style={{
                          flex: `1 1 ${token.sizeUnit * 40}px`,
                          minWidth: token.sizeUnit * 40,
                          padding: token.paddingSM,
                          cursor: 'pointer',
                          background: token.colorBgContainer,
                          borderWidth: token.lineWidth,
                          borderStyle: 'solid',
                          borderColor: selected ? token.colorPrimary : token.colorBorder,
                          borderRadius: token.borderRadius,
                          boxShadow: selected ? token.boxShadowTertiary : undefined,
                        }}
                      >
                        <Radio value={entry.systemType}>Division {entry.division}</Radio>
                        <Typography.Text type="secondary" style={{ paddingInlineStart: token.paddingLG }}>
                          {systemTypeLabel[entry.systemType]}
                        </Typography.Text>
                        {autoDetected ? (
                          <Tag
                            color="blue"
                            style={{
                              alignSelf: 'flex-start',
                              marginInlineStart: token.paddingLG,
                              marginBlockStart: token.marginXXS,
                            }}
                          >
                            Detected from SPEC
                          </Tag>
                        ) : null}
                      </Flex>
                    );
                  })}
                </Flex>
              </Radio.Group>
            </Flex>

            <Flex vertical gap={token.marginXXS}>
              <Typography.Text strong>Master SPEC version</Typography.Text>
              <Flex
                align="center"
                style={{
                  width: '100%',
                  paddingInline: token.padding,
                  paddingBlock: token.paddingSM,
                  background: token.colorFillQuaternary,
                  borderWidth: token.lineWidth,
                  borderStyle: 'solid',
                  borderColor: token.colorBorder,
                  borderRadius: token.borderRadius,
                }}
              >
                <Typography.Text>
                  ASC Master SPEC — Division {masterEntry.division} — Version {masterVersion} (current)
                </Typography.Text>
              </Flex>
            </Flex>

            <Alert
              type="info"
              message="Decisions and export history are preserved"
              description="Accepted and denied recommendations tied to unchanged text carry forward after re-analysis."
            />
          </Flex>
        ) : null}
      </Flex>
    </Modal>
  );
}
