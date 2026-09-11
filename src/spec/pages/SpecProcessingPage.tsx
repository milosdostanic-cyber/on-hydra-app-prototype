import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { BomPageHeader } from '../../bom/layout/BomPageHeader';
import { PageBackButton } from '../../shell/PageBackButton';
import { Alert, Card, Flex, theme } from '../../ui/antd';
import { SpecProcessingStages } from '../components/SpecProcessingStages';
import {
  SPEC_UPLOAD_ACCEPT_ATTRIBUTE,
  specFileTypeFromName,
  validateSpecUpload,
} from '../constants/specUploadLimits';
import { useSpecMockStore } from '../data/specMockStore';
import { useSpecProcessingSimulation } from '../hooks/useSpecProcessingSimulation';
import { specAnalyzePath, specHomePath, specListPathForProject } from '../specNavigation';

const PROCESSING_SUBTITLE =
  'Analysis continues in the background. You can leave this page and return later. Progress also appears on the Project SPEC list.';

/**
 * Deep-link fallback for analysis progress. Upload and primary navigation land on
 * the analysis dashboard; this route remains so "View progress" and old links resolve.
 */
export function SpecProcessingPage() {
  const { token } = theme.useToken();
  const navigate = useNavigate();
  const { specId = '' } = useParams<{ specId: string }>();
  const store = useSpecMockStore();
  const document = store.documents.find((entry) => entry.id === specId);
  const { retry, replaceFile } = useSpecProcessingSimulation(document);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [replaceError, setReplaceError] = useState<string>();

  useEffect(() => {
    if (!document) return;
    if (document.processingState === 'ready') {
      navigate(specAnalyzePath(document.id), { replace: true });
      return;
    }
    if (document.processingState === 'failed') {
      navigate(specAnalyzePath(document.id), { replace: true });
    }
  }, [document, navigate]);

  if (!document) {
    return (
      <Flex vertical gap={token.marginLG}>
        <PageBackButton to={specHomePath()}>Back to SPEC list</PageBackButton>
        <Alert type="error" showIcon title="Specification not found." />
      </Flex>
    );
  }

  if (
    document.processingState === 'ready' ||
    document.processingState === 'failed'
  ) {
    return null;
  }

  const listPath = specListPathForProject(document.projectId);

  function pickReplacement(file: File | null) {
    if (!file) return;
    const rejection = validateSpecUpload(file);
    if (rejection) {
      setReplaceError(rejection.message);
      return;
    }
    const fileType = specFileTypeFromName(file.name);
    if (!fileType) {
      setReplaceError(`${file.name} is not a supported file.`);
      return;
    }
    setReplaceError(undefined);
    void replaceFile({ fileName: file.name, fileType, fileSizeBytes: file.size });
  }

  return (
    <Flex vertical gap={token.marginLG} style={{ width: '100%' }}>
      <PageBackButton to={listPath}>Back to SPEC list</PageBackButton>

      <BomPageHeader
        title={`Analyzing ${document.title}`}
        description={PROCESSING_SUBTITLE}
      />

      <Card>
        <SpecProcessingStages
          document={document}
          onRetry={() => {
            setReplaceError(undefined);
            void retry();
          }}
          onReplaceFile={() => fileInputRef.current?.click()}
          onOpenPartial={() => navigate(specAnalyzePath(document.id))}
          replaceError={replaceError}
        />
      </Card>

      <input
        ref={fileInputRef}
        type="file"
        accept={SPEC_UPLOAD_ACCEPT_ATTRIBUTE}
        style={{ display: 'none' }}
        onChange={(event) => {
          pickReplacement(event.target.files?.[0] ?? null);
          event.target.value = '';
        }}
      />
    </Flex>
  );
}
