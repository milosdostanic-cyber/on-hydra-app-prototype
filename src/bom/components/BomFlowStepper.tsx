import { Card, Steps, Typography, theme } from '../../ui/antd';

const FLOW_STEP_ITEMS = [
  { title: 'Parsing' },
  { title: 'Matching' },
  { title: 'Narrow' },
  { title: 'Recommend' },
  { title: 'Workspace' },
  { title: 'Export' },
  { title: 'Service' },
] as const;

type Props = {
  /** Zero-based index matching the linear demo flow */
  activeStep: number;
  projectLabel?: string;
};

/**
 * Read-only orientation strip so users see where they are in the intake → workspace → export journey.
 */
export function BomFlowStepper({ activeStep, projectLabel }: Props) {
  const { token } = theme.useToken();
  const safeStep = Math.min(Math.max(activeStep, 0), FLOW_STEP_ITEMS.length - 1);

  return (
    <Card
      size="small"
      style={{
        background: token.colorFillAlter,
        borderColor: token.colorBorderSecondary,
      }}
      styles={{
        body: { paddingBlock: token.paddingSM, paddingInline: token.padding },
      }}
    >
      {projectLabel ? (
        <Typography.Text type="secondary" style={{ display: 'block', marginBottom: token.marginXS }}>
          {projectLabel}
        </Typography.Text>
      ) : null}
      <Steps
        type="navigation"
        size="small"
        current={safeStep}
        items={[...FLOW_STEP_ITEMS]}
      />
    </Card>
  );
}
