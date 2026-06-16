import { ExclamationCircleOutlined } from '@ant-design/icons';
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import { useBomHubPath } from '../../context/ActiveProjectContext';
import { App, theme } from '../../ui/antd';
import { useBomImportFlow } from '../context/BomImportFlowContext';
import { bomProjectById } from '../data/mockData';
import { useBomImportSession } from './useBomImportSession';

export type BomCancelUploadStep = 'map' | 'review' | 'match';

const CANCEL_UPLOAD_COPY: Record<
  BomCancelUploadStep,
  { title: string; content: string; cancelText: string }
> = {
  map: {
    title: 'Cancel upload and lose mapping progress?',
    content:
      'You are about to cancel this file upload. All field-mapping progress for this file will be lost.',
    cancelText: 'Keep editing',
  },
  review: {
    title: 'Cancel upload and lose progress?',
    content: 'All progress reviewing this file will be lost.',
    cancelText: 'Keep editing',
  },
  match: {
    title: 'Cancel upload?',
    content: 'All matching progress for this file will be discarded.',
    cancelText: 'Keep matching',
  },
};

/**
 * Confirms cancel on BOM upload steps — dismisses import session so workspace pending banners clear.
 */
export function useBomCancelUpload(bomProjectId: string) {
  const { modal } = App.useApp();
  const { token } = theme.useToken();
  const navigate = useNavigate();
  const bomHubPath = useBomHubPath();
  const { dismissSession, setActiveUploadId } = useBomImportFlow();
  const { uploadId } = useBomImportSession(bomProjectId);
  const projectMeta = bomProjectById(bomProjectId);

  const confirmCancelUpload = useCallback(
    (step: BomCancelUploadStep) => {
      const copy = CANCEL_UPLOAD_COPY[step];
      modal.confirm({
        title: copy.title,
        content: copy.content,
        icon: <ExclamationCircleOutlined style={{ color: token.colorWarning }} />,
        centered: true,
        okText: 'Cancel upload',
        okType: 'danger',
        cancelText: copy.cancelText,
        onOk: () => {
          if (uploadId) {
            dismissSession(uploadId);
            setActiveUploadId(undefined);
          }
          if (bomProjectId && bomProjectId !== 'new' && projectMeta) {
            navigate(`/bom/projects/${bomProjectId}/workspace`);
            return;
          }
          navigate(bomHubPath);
        },
      });
    },
    [
      bomHubPath,
      bomProjectId,
      dismissSession,
      modal,
      navigate,
      projectMeta,
      setActiveUploadId,
      token.colorWarning,
      uploadId,
    ],
  );

  return { confirmCancelUpload };
}
