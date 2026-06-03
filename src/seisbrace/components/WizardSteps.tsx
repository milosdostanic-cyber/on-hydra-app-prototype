import { CheckOutlined } from '@ant-design/icons';

import { WIZARD_STEPS } from '../constants/wizardSteps';
import { useSeisBraceWizard } from '../context/SeisBraceWizardContext';
import { Flex, Typography, theme } from '../../ui/antd';

type Props = {
  currentStepNumber: number;
};

/** Wizard stepper rail (ZIP `WizardSteps`): numbered steps, completed check, click to navigate. */
export function WizardSteps({ currentStepNumber }: Props) {
  const { token } = theme.useToken();
  const { maxStepReached, goToStep } = useSeisBraceWizard();

  return (
    <Flex vertical gap={token.marginXS} style={{ padding: token.padding }}>
      <Typography.Text strong style={{ marginBottom: token.marginXS }}>
        Brace setup
      </Typography.Text>
      {WIZARD_STEPS.map((step) => {
        const isActive = step.number === currentStepNumber;
        const isCompleted = step.number < currentStepNumber || step.number < maxStepReached;
        const isClickable = step.number <= maxStepReached;

        const circleBg = isActive
          ? token.colorPrimary
          : isCompleted
            ? token.colorSuccess
            : token.colorFillSecondary;
        const circleColor = isActive || isCompleted ? token.colorWhite : token.colorTextSecondary;

        return (
          <div
            key={step.slug}
            role={isClickable ? 'button' : undefined}
            tabIndex={isClickable ? 0 : undefined}
            onClick={() => isClickable && goToStep(step.slug)}
            onKeyDown={(e) => {
              if (isClickable && (e.key === 'Enter' || e.key === ' ')) goToStep(step.slug);
            }}
            style={{
              cursor: isClickable ? 'pointer' : 'default',
              padding: token.paddingSM,
              borderRadius: token.borderRadius,
              background: isActive ? token.colorPrimaryBg : 'transparent',
              opacity: isClickable ? 1 : 0.55,
            }}
          >
            <Flex align="flex-start" gap={token.marginSM}>
              <Flex
                align="center"
                justify="center"
                style={{
                  flexShrink: 0,
                  width: token.controlHeightSM,
                  height: token.controlHeightSM,
                  borderRadius: '50%',
                  background: circleBg,
                  color: circleColor,
                  fontWeight: token.fontWeightStrong,
                }}
              >
                {isCompleted && !isActive ? <CheckOutlined /> : step.number}
              </Flex>
              <div style={{ minWidth: 0, alignSelf: 'center' }}>
                <Typography.Text
                  strong={isActive}
                  ellipsis={{ tooltip: step.title }}
                  style={{ display: 'block' }}
                >
                  {step.title}
                </Typography.Text>
              </div>
            </Flex>
          </div>
        );
      })}
    </Flex>
  );
}
