import { DownloadOutlined } from '@ant-design/icons';

import { useActiveProject } from '../../context/ActiveProjectContext';
import { App, Badge, Button, theme } from '../../ui/antd';
import { useRevitDownloadQueue } from '../revitDownloadQueue';

/**
 * Floating download-queue affordance (mirrors {@link SubmittalPackageCartFloatingButton}).
 * Shown when Revit files are queued; offset above the submittal cart when both are visible.
 */
export function RevitDownloadQueueFloatingButton() {
  const { token } = theme.useToken();
  const { message } = App.useApp();
  const { projectId } = useActiveProject();
  const { queueCount, clearQueue } = useRevitDownloadQueue();

  if (queueCount === 0 || !projectId) return null;

  return (
    <div
      style={{
        position: 'fixed',
        right: token.marginLG,
        bottom: token.marginLG + token.controlHeightLG + token.marginSM,
        zIndex: 1000,
      }}
    >
      <Badge count={queueCount}>
        <Button
          type="primary"
          size="large"
          shape="round"
          icon={<DownloadOutlined />}
          onClick={() => {
            message.success(`${queueCount} Revit file${queueCount === 1 ? '' : 's'} ready to download (stub).`);
            clearQueue();
          }}
        >
          Download queue
        </Button>
      </Badge>
    </div>
  );
}
