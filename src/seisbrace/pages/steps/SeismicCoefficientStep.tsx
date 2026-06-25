import { useNavigate } from 'react-router-dom';

import { CODE_REQUIREMENT_TO_METHODS, CP_METHOD_LABELS } from '../../constants/options';
import { computeCp } from '../../constants/wizardSteps';
import { useSeisBrace } from '../../context/SeisBraceContext';
import { useSeisBraceWizard } from '../../context/SeisBraceWizardContext';
import { CpCalculationInput } from '../../components/CpCalculationInput';
import { WizardFooter } from '../../components/WizardFooter';
import { PageDescription } from '../../../shell/PageDescription';
import { draftToBraceFields } from '../../utils/draft';
import {
  App,
  Card,
  Col,
  Form,
  Input,
  InputNumber,
  Radio,
  Row,
  Space,
  Typography,
  theme,
} from '../../../ui/antd';
import type { CpMethod } from '../../types';

export function SeismicCoefficientStep() {
  const { token } = theme.useToken();
  const { message } = App.useApp();
  const navigate = useNavigate();
  const { createBrace, updateBrace } = useSeisBrace();
  const { draft, patchDraft, markStepReached, goToStep } = useSeisBraceWizard();
  const [form] = Form.useForm();

  const methods = CODE_REQUIREMENT_TO_METHODS[draft.codeRequirement] ?? ['A', 'B', 'C'];

  const handleMethodChange = (method: CpMethod) => {
    const cpValue = computeCp(method, draft.cpInputs);
    patchDraft({ cpMethod: method, cpValue });
  };

  const handleInputsChange = (next: Record<string, number | string>) => {
    const cpValue = computeCp(draft.cpMethod, next);
    patchDraft({ cpInputs: next, cpValue });
  };

  const persist = (): string | null => {
    if (!draft.seismicDesignId) {
      message.warning('Start from a seismic design first.');
      return null;
    }
    const fields = draftToBraceFields(draft, 'INCOMPLETE');
    if (draft.braceId) {
      updateBrace(draft.braceId, fields);
      return draft.braceId;
    }
    const id = createBrace(draft.seismicDesignId, fields);
    patchDraft({ braceId: id });
    return id;
  };

  const handleNext = () => {
    form.validateFields().then(() => {
      const id = persist();
      if (!id) return;
      markStepReached(3);
      goToStep('brace-type');
    });
  };

  const handleSave = () => {
    form.validateFields().then(() => {
      if (persist()) {
        message.success('Brace saved.');
        navigate('/seisbrace');
      }
    });
  };

  return (
    <Space orientation="vertical" size={token.marginLG} style={{ width: '100%' }}>
      <div>
        <Typography.Title level={4} style={{ margin: 0 }}>
          Seismic Coefficient
        </Typography.Title>
        <PageDescription>
          Enter the brace information and choose how the seismic coefficient (Cp) is calculated.
        </PageDescription>
      </div>

      <Form
        form={form}
        layout="vertical"
        requiredMark={false}
        initialValues={{ name: draft.braceName, drawingRef: draft.drawingRef, quantity: draft.qty }}
        onValuesChange={(changed) => {
          if ('name' in changed) patchDraft({ braceName: changed.name });
          if ('drawingRef' in changed) patchDraft({ drawingRef: changed.drawingRef });
          if ('quantity' in changed) patchDraft({ qty: changed.quantity });
        }}
        style={{ maxWidth: 720 }}
      >
        <Card size="small" title="Brace information" style={{ marginBottom: token.marginLG }}>
          <Row gutter={token.marginMD}>
            <Col xs={24} sm={12}>
              <Form.Item name="name" label="Brace Name" rules={[{ required: true, message: 'Enter a brace name' }]}>
                <Input placeholder="e.g. B-101" maxLength={60} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item name="drawingRef" label="Drawing Reference">
                <Input placeholder="e.g. FP-201" maxLength={60} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item name="quantity" label="Quantity (for Bill of Materials)">
                <InputNumber min={1} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        <Card size="small" title="Seismic Coefficient (Cp) Calculation">
          <Space orientation="vertical" size={token.margin} style={{ width: '100%' }}>
            <div>
              <Typography.Text type="secondary" style={{ display: 'block', marginBottom: token.marginXS }}>
                Method
              </Typography.Text>
              <Radio.Group
                value={draft.cpMethod}
                onChange={(e) => handleMethodChange(e.target.value as CpMethod)}
              >
                <Space orientation="vertical" size={token.marginXXS}>
                  {methods.map((m) => (
                    <Radio key={m} value={m}>
                      {CP_METHOD_LABELS[m]}
                    </Radio>
                  ))}
                </Space>
              </Radio.Group>
            </div>

            <CpCalculationInput method={draft.cpMethod} inputs={draft.cpInputs} onChange={handleInputsChange} />

            <Card
              size="small"
              style={{ background: token.colorFillQuaternary }}
              styles={{ body: { padding: token.paddingSM } }}
            >
              <Space align="baseline" size={token.marginXS}>
                <Typography.Text type="secondary">Calculated Cp:</Typography.Text>
                <Typography.Title level={4} style={{ margin: 0 }}>
                  {draft.cpValue || '-'}
                </Typography.Title>
              </Space>
            </Card>
          </Space>
        </Card>
      </Form>

      <WizardFooter
        onBack={() => goToStep('seismic-design')}
        onSave={handleSave}
        onNext={handleNext}
      />
    </Space>
  );
}
