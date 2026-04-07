import {
  hydraTextStyleToReactCss,
  hydraTitleHeading4,
  hydraTitleHeading5,
} from '../../theme/hydraTypography';
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
  /** Zero-based index matching the linear demo flow (`progress` only). */
  activeStep: number;
  projectLabel?: string;
  /**
   * `progress` — current step highlighted (in-flow screens).
   * `map` — full path at a glance (e.g. landing); no step selected.
   */
  variant?: 'progress' | 'map';
};

/**
 * Read-only orientation strip so users see where they are in the intake → workspace → export journey.
 */
export function BomFlowStepper({ activeStep, projectLabel, variant = 'progress' }: Props) {
  const { token } = theme.useToken();
  const isMap = variant === 'map';
  const safeStep = Math.min(Math.max(activeStep, 0), FLOW_STEP_ITEMS.length - 1);

  const mapHeading = hydraTitleHeading5;
  const progressHeading = hydraTitleHeading4;

  return (
    <Card
      size="small"
      style={{
        background: token.colorFillAlter,
        borderColor: token.colorBorderSecondary,
      }}
      styles={{
        body: {
          paddingBlock: isMap ? token.paddingXS : token.paddingSM,
          paddingInline: isMap ? token.paddingSM : token.padding,
        },
      }}
    >
      <Typography.Title
        level={isMap ? 5 : 4}
        style={{
          margin: 0,
          marginBottom: token.marginXS,
          ...(isMap
            ? hydraTextStyleToReactCss(mapHeading)
            : hydraTextStyleToReactCss(progressHeading)),
        }}
      >
        {isMap ? 'Flow' : 'Where you are'}
      </Typography.Title>
      {!isMap && projectLabel ? (
        <Typography.Text type="secondary" style={{ display: 'block', marginBottom: token.marginXS }}>
          Project: {projectLabel}
        </Typography.Text>
      ) : null}
      <div style={{ width: '100%', overflowX: 'auto' }}>
        <Steps
          type={isMap ? 'default' : 'navigation'}
          size="small"
          current={isMap ? -1 : safeStep}
          items={[...FLOW_STEP_ITEMS]}
        />
      </div>
    </Card>
  );
}
