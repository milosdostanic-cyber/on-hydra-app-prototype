import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';

import {
  CODE_REQUIREMENT_OPTIONS,
  LOAD_TYPE_OPTIONS,
  UNIT_OPTIONS,
} from '../../constants/options';
import { useActiveProject } from '../../../context/ActiveProjectContext';
import { useSeisBrace } from '../../context/SeisBraceContext';
import { useSeisBraceWizard } from '../../context/SeisBraceWizardContext';
import { WizardFooter } from '../../components/WizardFooter';
import { App, DatePicker, Form, Input, Select, Space, Typography, theme } from '../../../ui/antd';

export function SeismicDesignStep() {
  const { token } = theme.useToken();
  const { message } = App.useApp();
  const navigate = useNavigate();
  const { projectId } = useActiveProject();
  const { createDesign, updateDesign } = useSeisBrace();
  const { draft, patchDraft, markStepReached, goToStep } = useSeisBraceWizard();
  const [form] = Form.useForm();

  const persist = (): string | null => {
    if (!projectId) {
      message.warning('Select a construction project from the top bar first.');
      return null;
    }
    const fields = {
      name: draft.designName,
      projectDate: draft.projectDate,
      codeRequirement: draft.codeRequirement,
      loadType: draft.loadType,
      unit: draft.unit,
      notes: draft.notes,
    };
    if (draft.seismicDesignId) {
      updateDesign(draft.seismicDesignId, fields);
      return draft.seismicDesignId;
    }
    const id = createDesign(projectId, fields);
    patchDraft({ seismicDesignId: id });
    return id;
  };

  const handleNext = () => {
    form.validateFields().then(() => {
      const id = persist();
      if (!id) return;
      markStepReached(2);
      goToStep('seismic-coefficient');
    });
  };

  const handleSave = () => {
    form.validateFields().then(() => {
      if (persist()) {
        message.success('Seismic design saved.');
        navigate('/seisbrace');
      }
    });
  };

  return (
    <Space orientation="vertical" size={token.marginLG} style={{ width: '100%' }}>
      <div>
        <Typography.Title level={4} style={{ margin: 0 }}>
          Seismic Design Setup
        </Typography.Title>
        <Typography.Paragraph type="secondary" style={{ margin: 0 }}>
          Name the design and set the governing code, units, and load basis.
        </Typography.Paragraph>
      </div>

      <Form
        form={form}
        layout="vertical"
        requiredMark={false}
        initialValues={{
          name: draft.designName,
          projectDate: draft.projectDate ? dayjs(draft.projectDate) : undefined,
          codeRequirements: draft.codeRequirement,
          unit: draft.unit,
          loadType: draft.loadType,
          notes: draft.notes,
        }}
        onValuesChange={(changed) => {
          if ('name' in changed) patchDraft({ designName: changed.name });
          if ('projectDate' in changed)
            patchDraft({ projectDate: changed.projectDate ? changed.projectDate.toISOString() : '' });
          if ('codeRequirements' in changed) patchDraft({ codeRequirement: changed.codeRequirements });
          if ('unit' in changed) patchDraft({ unit: changed.unit });
          if ('loadType' in changed) patchDraft({ loadType: changed.loadType });
          if ('notes' in changed) patchDraft({ notes: changed.notes });
        }}
        style={{ maxWidth: 640 }}
      >
        <Form.Item name="name" label="Seismic Design Name" rules={[{ required: true, message: 'Enter a design name' }]}>
          <Input placeholder="e.g. Level 2 Mechanical — Fire Protection" maxLength={120} />
        </Form.Item>
        <Form.Item name="projectDate" label="Project Date">
          <DatePicker style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item name="codeRequirements" label="Code Requirements" rules={[{ required: true, message: 'Select a code' }]}>
          <Select options={CODE_REQUIREMENT_OPTIONS} />
        </Form.Item>
        <Form.Item name="unit" label="Unit" rules={[{ required: true }]}>
          <Select options={UNIT_OPTIONS} />
        </Form.Item>
        <Form.Item name="loadType" label="Pick UL or FM loads" rules={[{ required: true }]}>
          <Select options={LOAD_TYPE_OPTIONS} />
        </Form.Item>
        <Form.Item name="notes" label="Notes">
          <Input.TextArea rows={3} maxLength={500} />
        </Form.Item>
      </Form>

      <WizardFooter onSave={handleSave} onNext={handleNext} />
    </Space>
  );
}
