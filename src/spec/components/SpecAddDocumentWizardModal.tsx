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
import {
  Alert,
  App,
  Button,
  Flex,
  Modal,
  Radio,
  Steps,
  Tag,
  Typography,
  theme,
} from '../../ui/antd';

type Props = {
  open: boolean;
  projectId: string;
  projectTitle: string;
  onCancel: () => void;
  onCreated: (document: SpecDocument) => void;
};

const STEP_ITEMS = [
  { title: 'Upload file' },
  { title: 'Confirm Master SPEC' },
];

/**
 * Prototype heuristic — mirrors Matt’s W01 Step 2 note: division is auto-detected
 * at upload; the user may override on Confirm Master SPEC.
 */
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
 * W01 — Add SPEC (audit §6.1). One modal wizard replaces every prior upload
 * entry point; Master SPEC confirmation happens in step 2, then analysis starts
 * (no separate review step). No unconfirmed master is persisted.
 *
 * Step 2 UX (Kickoff V2 + Matt pins on `2257:232`):
 * - Division is auto-selected from the upload; user can override.
 * - ASC publishes one Master SPEC per division — show current only (no version history).
 */
export function SpecAddDocumentWizardModal({ open, projectId, projectTitle, onCancel, onCreated }: Props) {
  const { token } = theme.useToken();
  const { message } = App.useApp();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState(0);
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string>();
  const [systemType, setSystemType] = useState<SpecSystemType>('plumbing');
  const [detectedType, setDetectedType] = useState<SpecSystemType>('plumbing');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (!open) return;
    setStep(0);
    setFile(null);
    setFileError(undefined);
    setSystemType('plumbing');
    setDetectedType('plumbing');
  }, [open]);

  const masterEntry = specMasterCatalogEntry(systemType);
  const masterVersion = masterEntry.currentVersion;

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

  async function startAnalysis() {
    if (!file) return;
    const fileType = specFileTypeFromName(file.name);
    if (!fileType) {
      setFileError('This file type is not supported.');
      setStep(0);
      return;
    }
    setCreating(true);
    try {
      const document = await mockSpecDocumentRepository.create({
        title: file.name.replace(/\.(pdf|docx?)$/i, ''),
        fileName: file.name,
        fileType,
        fileSizeBytes: file.size,
        destination: 'project',
        projectId,
        role: 'project-specification',
        divisionHint: systemTypeDivision[systemType],
        systemType,
        ascMaster: { id: `${systemType}-${masterVersion}`, label: masterEntry.label, version: masterVersion },
      });
      trackSpecEvent('spec_upload_started', { destination: 'project' });
      message.success('Upload received. Analysis has started.');
      onCreated(document);
    } catch {
      message.error('The SPEC could not be uploaded. Try again.');
    } finally {
      setCreating(false);
    }
  }

  const canContinueStep0 = Boolean(file) && !fileError;

  function handleDropZoneDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    event.stopPropagation();
    pickFile(event.dataTransfer.files?.[0] ?? null);
  }

  const modalTitle = step === 0 ? 'Upload a SPEC' : 'Confirm the Master SPEC';

  return (
    <Modal
      title={modalTitle}
      open={open}
      onCancel={onCancel}
      destroyOnHidden
      width={token.sizeUnit * 170}
      footer={
        <Flex justify="flex-end" gap={token.marginXS}>
          {step === 0 ? (
            <Button onClick={onCancel} disabled={creating}>
              Cancel
            </Button>
          ) : (
            <Button onClick={() => setStep(0)} disabled={creating}>
              Back
            </Button>
          )}
          {step === 0 ? (
            <Button type="primary" disabled={!canContinueStep0} onClick={() => setStep(1)}>
              Continue
            </Button>
          ) : (
            <Button type="primary" loading={creating} onClick={() => void startAnalysis()}>
              Start analysis
            </Button>
          )}
        </Flex>
      }
    >
      <Flex vertical gap={token.marginLG}>
        <Flex vertical gap={token.marginMD}>
          <Typography.Text type="secondary">
            {step === 0 ? (
              <>
                Add a customer PDF or DOCX to{' '}
                <Typography.Text strong>{projectTitle}</Typography.Text>.
              </>
            ) : (
              'Review the automatically selected category before analysis.'
            )}
          </Typography.Text>

          <Steps current={step} items={STEP_ITEMS} />
        </Flex>

        {step === 0 ? (
          <Flex vertical gap={token.marginSM}>
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
                paddingInline: token.paddingLG,
                paddingBlock: token.marginXL,
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
                  {file ? file.name : 'Choose PDF or Word document'}
                </Typography.Title>
                <Typography.Text type="secondary">
                  {file
                    ? formatSpecFileSize(file.size)
                    : 'PDF or Word document. Scanned pages are supported; recognized text may be approximate.'}
                </Typography.Text>
              </Flex>
              <Button onClick={() => fileInputRef.current?.click()}>Choose file</Button>
            </Flex>

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
          </Flex>
        ) : null}
      </Flex>
    </Modal>
  );
}
