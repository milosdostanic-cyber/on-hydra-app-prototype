import { useEffect } from 'react';
import { Navigate, useParams } from 'react-router-dom';

import { WIZARD_STEP_BY_SLUG, type WizardStepSlug } from '../constants/wizardSteps';
import { useSeisBraceWizard } from '../context/SeisBraceWizardContext';
import { PageBackButton } from '../../shell/PageBackButton';
import { Card, Flex, Space, theme } from '../../ui/antd';
import { WizardSteps } from '../components/WizardSteps';
import { BraceConfigurationStep } from './steps/BraceConfigurationStep';
import { PartsSelectionStep } from './steps/PartsSelectionStep';
import { SeismicCoefficientStep } from './steps/SeismicCoefficientStep';
import { SeismicDesignStep } from './steps/SeismicDesignStep';
import { StructureAndSwayBraceStep } from './steps/StructureAndSwayBraceStep';

const STEP_COMPONENTS: Record<WizardStepSlug, React.FC> = {
  'seismic-design': SeismicDesignStep,
  'seismic-coefficient': SeismicCoefficientStep,
  'brace-type': BraceConfigurationStep,
  'structure-sway-brace': StructureAndSwayBraceStep,
  'parts-selection': PartsSelectionStep,
};

export function WizardPage() {
  const { token } = theme.useToken();
  const { step } = useParams<{ step: string }>();
  const { markStepReached } = useSeisBraceWizard();

  const stepDef = step ? WIZARD_STEP_BY_SLUG.get(step as WizardStepSlug) : undefined;

  useEffect(() => {
    if (stepDef) markStepReached(stepDef.number);
  }, [stepDef, markStepReached]);

  if (!stepDef) {
    return <Navigate to="/seisbrace/wizard/seismic-design" replace />;
  }

  const StepComponent = STEP_COMPONENTS[stepDef.slug];

  return (
    <Space orientation="vertical" size={token.marginMD} style={{ width: '100%' }}>
      <PageBackButton to="/seisbrace">Back to SeisBrace</PageBackButton>

      <Card variant="borderless" styles={{ body: { padding: 0 } }} style={{ overflow: 'hidden', border: 'none', boxShadow: token.boxShadowTertiary }}>
        <Flex align="stretch" style={{ width: '100%', overflow: 'hidden' }}>
          <div
            style={{
              flex: '0 0 260px',
              maxWidth: 260,
              minWidth: 260,
              borderInlineEnd: `${token.lineWidth}px ${token.lineType} ${token.colorBorderSecondary}`,
              background: token.colorFillAlter,
              overflow: 'hidden',
            }}
          >
            <WizardSteps currentStepNumber={stepDef.number} />
          </div>
          <div style={{ flex: 1, minWidth: 0, padding: token.paddingLG }}>
            <StepComponent />
          </div>
        </Flex>
      </Card>
    </Space>
  );
}
