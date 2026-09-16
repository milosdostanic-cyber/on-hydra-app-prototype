import { SettingOutlined } from '@ant-design/icons';
import { useState } from 'react';

import { Alert, Drawer, Flex, FloatButton, Switch, Typography, theme } from '../../ui/antd';
import {
  isContentDownloadDemoEnabled,
  useContentDownloadAccess,
} from './contentDownloadAccess';

const COPY = {
  tooltip: 'Content demo controls',
  title: 'Content demo controls',
  alertTitle: 'Development only',
  alertDescription:
    'Turn these off to preview disabled create actions with the permission tooltip. Hidden outside DEV unless localStorage hydra-content-demo=1.',
  submittal: 'Submittal create',
  bom: 'BOM create',
};

export function ContentDownloadDemoControls() {
  const enabled = isContentDownloadDemoEnabled();
  const { token } = theme.useToken();
  const access = useContentDownloadAccess();
  const [open, setOpen] = useState(false);

  if (!enabled) return null;

  return (
    <>
      <FloatButton
        icon={<SettingOutlined />}
        tooltip={COPY.tooltip}
        onClick={() => setOpen(true)}
        style={{ insetInlineEnd: token.marginLG, insetBlockEnd: token.marginLG }}
      />
      <Drawer
        title={COPY.title}
        open={open}
        onClose={() => setOpen(false)}
        size={token.controlHeight * 11}
      >
        <Flex vertical gap={token.marginLG}>
          <Alert type="info" showIcon title={COPY.alertTitle} description={COPY.alertDescription} />

          <Flex align="center" justify="space-between" gap={token.marginSM}>
            <Typography.Text strong>{COPY.submittal}</Typography.Text>
            <Switch
              checked={access.canCreateSubmittal}
              onChange={access.setCanCreateSubmittal}
              aria-label={COPY.submittal}
              checkedChildren="On"
              unCheckedChildren="Off"
            />
          </Flex>

          <Flex align="center" justify="space-between" gap={token.marginSM}>
            <Typography.Text strong>{COPY.bom}</Typography.Text>
            <Switch
              checked={access.canCreateBom}
              onChange={access.setCanCreateBom}
              aria-label={COPY.bom}
              checkedChildren="On"
              unCheckedChildren="Off"
            />
          </Flex>
        </Flex>
      </Drawer>
    </>
  );
}
