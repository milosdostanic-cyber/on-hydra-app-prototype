import { LeftOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

import type { BomUploadFlowLocationState } from '../bomUploadFlowState';
import { Button, Flex, theme } from '../../ui/antd';
import {
  BomUploadProgressBar,
  type BomUploadFlowStepIndex,
} from './BomUploadProgressBar';

type BomUploadFlowStepChromeProps = {
  backTo: string;
  backLabel: string;
  backState?: BomUploadFlowLocationState;
  fileName: string;
  currentStep: BomUploadFlowStepIndex;
  statusLabel?: string;
};

/**
 * Fixed upload-flow chrome — Figma order: Back button row, then Progress Bar `5102:15683`.
 * Use as the first child in the page vertical `Space` so position is identical on every step.
 * Back → stepper gap: `token.marginLG` (24px).
 */
export function BomUploadFlowStepChrome({
  backTo,
  backLabel,
  backState,
  fileName,
  currentStep,
  statusLabel,
}: BomUploadFlowStepChromeProps) {
  const navigate = useNavigate();
  const { token } = theme.useToken();

  return (
    <Flex vertical gap={token.marginLG} style={{ width: '100%' }}>
      <Button
        type="default"
        icon={<LeftOutlined />}
        onClick={() => navigate(backTo, backState ? { state: backState } : undefined)}
        style={{ alignSelf: 'flex-start', margin: 0 }}
      >
        {backLabel}
      </Button>
      <BomUploadProgressBar
        fileName={fileName}
        currentStep={currentStep}
        statusLabel={statusLabel}
      />
    </Flex>
  );
}
