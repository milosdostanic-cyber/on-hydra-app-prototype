import { SettingOutlined } from '@ant-design/icons';
import { useState } from 'react';

import { isSpecDemoEnabled, useSpecDemo } from '../context/SpecDemoContext';
import { SPEC_SCENARIOS, isScenarioImplemented } from '../data/specScenarios';
import type { SpecAccessLevel } from '../data/types';
import { accessLevelLabel } from '../constants/specStatusVocabulary';
import {
  Alert,
  App,
  Button,
  Drawer,
  Flex,
  FloatButton,
  Select,
  Switch,
  Typography,
  theme,
} from '../../ui/antd';

const ROLE_OPTIONS: SpecAccessLevel[] = ['owner', 'editor', 'comment-only', 'view-only', 'revoked'];

export function SpecDemoControls() {
  const enabled = isSpecDemoEnabled();
  const { token } = theme.useToken();
  const { message } = App.useApp();
  const demo = useSpecDemo();
  const [open, setOpen] = useState(false);

  if (!enabled) return null;

  return (
    <>
      <FloatButton
        icon={<SettingOutlined />}
        tooltip="Spec demo controls"
        onClick={() => setOpen(true)}
        style={{ insetInlineEnd: token.marginLG, insetBlockEnd: token.marginLG }}
      />
      <Drawer
        title="Spec demo controls"
        open={open}
        onClose={() => setOpen(false)}
        size={token.controlHeight * 11}
      >
        <Flex vertical gap={token.marginLG}>
          <Alert
            type="info"
            showIcon
            title="Development only"
            description="Switch scenarios to reseed fixtures. This drawer is hidden outside DEV unless localStorage hydra-spec-demo=1."
          />

          <div>
            <Typography.Text strong>Scenario</Typography.Text>
            <Select
              style={{ width: '100%', marginTop: token.marginXS }}
              value={demo.scenarioId}
              onChange={(id) => {
                demo.switchScenario(id);
                message.success('Scenario loaded.');
              }}
              options={SPEC_SCENARIOS.map((s) => ({
                value: s.id,
                label: `${s.label}${isScenarioImplemented(s) ? '' : ' (later)'}`,
                disabled: !isScenarioImplemented(s),
              }))}
            />
            <Typography.Paragraph type="secondary" style={{ marginTop: token.marginXS }}>
              {SPEC_SCENARIOS.find((s) => s.id === demo.scenarioId)?.purpose}
            </Typography.Paragraph>
          </div>

          <div>
            <Typography.Text strong>Simulated role</Typography.Text>
            <Select
              style={{ width: '100%', marginTop: token.marginXS }}
              value={demo.role}
              onChange={demo.setRole}
              options={ROLE_OPTIONS.map((r) => ({ value: r, label: accessLevelLabel[r] }))}
            />
          </div>

          <Flex align="center" justify="space-between" gap={token.marginSM}>
            <Typography.Text strong>Artificial delay</Typography.Text>
            <Switch
              checked={demo.delayMs > 0}
              onChange={(on) => demo.setDelayMs(on ? 400 : 0)}
              checkedChildren="On"
              unCheckedChildren="Off"
            />
          </Flex>

          <Button
            danger
            onClick={() => {
              demo.reset();
              message.success('Demo data reset for the current scenario.');
            }}
          >
            Reset demo data
          </Button>
        </Flex>
      </Drawer>
    </>
  );
}
