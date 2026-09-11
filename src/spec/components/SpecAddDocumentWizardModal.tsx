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
  Checkbox,
  Flex,
  Modal,
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

const DIVISION_CARD_MIN_HEIGHT = (token: ReturnType<typeof theme.useToken>['token']) =>
  token.sizeUnit * 26 + token.sizeUnit / 2;

/**
 * Prototype heuristic — mirrors Matt’s W01 Step 2 note: divisions are auto-detected
 * at upload; the user may override on Confirm Master SPEC (multi-select checkboxes).
 */
function inferSystemTypesFromFileName(fileName: string): SpecSystemType[] {
  const name = fileName.toLowerCase();
  const detected: SpecSystemType[] = [];

  if (/\b(fire|suppression|sprinkler|div(?:ision)?[_\s-]*21|\b21[_\s-])\b/.test(name)) {
    detected.push('fire-protection');
  }
  if (/\b(plumb|fixture|water|piping|div(?:ision)?[_\s-]*22|\b22[_\s-])\b/.test(name)) {
    detected.push('plumbing');
  }
  if (/\b(hvac|mechanical|heating|ventilat|air[_\s-]?cond|div(?:ision)?[_\s-]*23|\b23[_\s-])\b/.test(name)) {
    detected.push('hvac');
  }

  // Figma 8305:93044 — plumbing uploads often surface Division 21 + 22 from the SPEC body.
  if (detected.includes('plumbing') && !detected.includes('fire-protection')) {
    detected.unshift('fire-protection');
  }

  return detected.length > 0 ? detected : ['plumbing', 'fire-protection'];
}

function catalogOrder(types: SpecSystemType[]): SpecSystemType[] {
  const order = SPEC_MASTER_CATALOG.map((entry) => entry.systemType);
  return order.filter((systemType) => types.includes(systemType));
}

/**
 * W01 — Add SPEC (audit §6.1). One modal wizard replaces every prior upload
 * entry point; Master SPEC confirmation happens in step 2, then analysis starts
 * (no separate review step). No unconfirmed master is persisted.
 *
 * Step 2 UX (Figma 8305:93044):
 * - Success banner with uploaded file name
 * - Horizontal steps (Upload file → Confirm Master SPEC)
 * - Division cards with checkbox multi-select and “Detected from SPEC” tags
 */
export function SpecAddDocumentWizardModal({ open, projectId, projectTitle, onCancel, onCreated }: Props) {
  const { token } = theme.useToken();
  const { message } = App.useApp();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState(0);
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string>();
  const [selectedSystemTypes, setSelectedSystemTypes] = useState<SpecSystemType[]>(['plumbing']);
  const [detectedSystemTypes, setDetectedSystemTypes] = useState<SpecSystemType[]>(['plumbing']);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (!open) return;
    setStep(0);
    setFile(null);
    setFileError(undefined);
    setSelectedSystemTypes(['plumbing']);
    setDetectedSystemTypes(['plumbing']);
  }, [open]);

  const primarySystemType = catalogOrder(selectedSystemTypes)[0] ?? 'plumbing';
  const masterEntry = specMasterCatalogEntry(primarySystemType);
  const masterVersion = masterEntry.currentVersion;

  function pickFile(nextFile: File | null) {
    if (!nextFile) return;
    const rejection = validateSpecUpload(nextFile);
    if (rejection) {
      setFile(null);
      setFileError(rejection.message);
      return;
    }
    const detected = inferSystemTypesFromFileName(nextFile.name);
    setFile(nextFile);
    setFileError(undefined);
    setSelectedSystemTypes(detected);
    setDetectedSystemTypes(detected);
  }

  function retryValidation() {
    if (file) pickFile(file);
  }

  function toggleDivision(systemType: SpecSystemType) {
    setSelectedSystemTypes((current) => {
      if (current.includes(systemType)) {
        if (current.length === 1) return current;
        return current.filter((entry) => entry !== systemType);
      }
      return catalogOrder([...current, systemType]);
    });
  }

  async function startAnalysis() {
    if (!file || selectedSystemTypes.length === 0) return;
    const fileType = specFileTypeFromName(file.name);
    if (!fileType) {
      setFileError('This file type is not supported.');
      setStep(0);
      return;
    }
    setCreating(true);
    try {
      const divisions = catalogOrder(selectedSystemTypes).map((systemType) => systemTypeDivision[systemType]);
      const document = await mockSpecDocumentRepository.create({
        title: file.name.replace(/\.(pdf|docx?)$/i, ''),
        fileName: file.name,
        fileType,
        fileSizeBytes: file.size,
        destination: 'project',
        projectId,
        role: 'project-specification',
        divisionHint: divisions[0],
        divisions,
        systemType: primarySystemType,
        ascMaster: { id: `${primarySystemType}-${masterVersion}`, label: masterEntry.label, version: masterVersion },
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
            <Button
              type="primary"
              loading={creating}
              disabled={selectedSystemTypes.length === 0}
              onClick={() => void startAnalysis()}
            >
              Start analysis
            </Button>
          )}
        </Flex>
      }
    >
      {step === 0 ? (
        <Flex vertical gap={token.marginLG}>
          <Flex vertical gap={token.marginMD}>
            <Typography.Text type="secondary">
              Add a customer PDF or DOCX to <Typography.Text strong>{projectTitle}</Typography.Text>.
            </Typography.Text>
            <Steps current={step} items={STEP_ITEMS} />
          </Flex>

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
        </Flex>
      ) : (
        <Flex vertical gap={token.marginMD} style={{ paddingBlock: token.paddingSM }}>
          {file ? (
            <Alert
              type="success"
              showIcon={false}
              message={
                <Flex align="center" justify="center" gap={token.marginXXS} wrap="wrap">
                  <Typography.Text strong>Uploaded file:</Typography.Text>
                  <Typography.Text>{file.name}</Typography.Text>
                </Flex>
              }
              style={{ width: '100%' }}
            />
          ) : null}

          <Steps current={step} items={STEP_ITEMS} />

          <Flex vertical gap={token.marginXS}>
            <Flex vertical>
              <Typography.Text strong>Division</Typography.Text>
              <Typography.Text type="secondary">
                Change it only if the document belongs to another supported division.
              </Typography.Text>
            </Flex>
            <Checkbox.Group
              value={selectedSystemTypes}
              onChange={(values) => {
                const next = catalogOrder(values as SpecSystemType[]);
                if (next.length === 0) return;
                setSelectedSystemTypes(next);
              }}
              style={{ width: '100%' }}
            >
              <Flex gap={token.paddingSM} style={{ width: '100%' }}>
                {SPEC_MASTER_CATALOG.map((entry) => {
                  const checked = selectedSystemTypes.includes(entry.systemType);
                  const autoDetected = detectedSystemTypes.includes(entry.systemType);
                  return (
                    <Flex
                      key={entry.systemType}
                      vertical
                      gap={token.marginXXS}
                      onClick={() => toggleDivision(entry.systemType)}
                      style={{
                        flex: '1 1 0',
                        minWidth: token.sizeUnit * 40,
                        minHeight: DIVISION_CARD_MIN_HEIGHT(token),
                        padding: token.paddingSM,
                        cursor: 'pointer',
                        background: token.colorBgContainer,
                        borderWidth: token.lineWidth,
                        borderStyle: 'solid',
                        borderColor: checked ? token.colorPrimary : token.colorBorder,
                        borderRadius: token.borderRadius,
                        boxShadow: checked ? token.boxShadowTertiary : undefined,
                      }}
                    >
                      <Checkbox
                        value={entry.systemType}
                        onClick={(event) => event.stopPropagation()}
                      >
                        Division {entry.division}
                      </Checkbox>
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
            </Checkbox.Group>
          </Flex>
        </Flex>
      )}
    </Modal>
  );
}
