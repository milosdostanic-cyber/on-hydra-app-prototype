import { ArrowLeftOutlined } from '@ant-design/icons';
import { useEffect, useState } from 'react';

import { useActiveProject } from '../context/ActiveProjectContext';
import { Button, Divider, Form, Modal, Select, Space, Typography, theme } from '../ui/antd';

import { BomDestinationFields } from './components/BomDestinationFields';
import { SubmittalDestinationFields } from './components/SubmittalDestinationFields';
import { useBomDestinationFields } from './components/useBomDestinationFields';
import { useSubmittalDestinationFields } from './components/useSubmittalDestinationFields';
import { ProjectFormFields, formValuesToProjectFields } from './ProjectFormFields';
import type { ProjectFormValues } from './projectSeed';

export type ProjectDestinationRequirement = 'bom' | 'submittal';

export type ProjectResolution =
  | { projectId: string }
  | { projectId: string; bomProjectId: string; bomProjectName: string }
  | { projectId: string; packageId: string; packageName: string };

type ProjectRequiredModalProps = {
  open: boolean;
  /** Short verb for the gated action, e.g. "Download" or "Add to submittal". */
  actionLabel: string;
  /** Optional one-line explanation of why a project is needed. */
  actionDescription?: string;
  /**
   * When set, step 2 in the same modal picks a BOM or submittal package under the chosen project.
   * The part/action is not resolved until both project and destination are selected.
   */
  destinationRequirement?: ProjectDestinationRequirement;
  onResolved: (result: ProjectResolution) => void;
  onCancel: () => void;
};

type ProjectMode = 'select' | 'create';
type FlowStep = 'project' | 'destination';

/**
 * Project gate: select or create a Unified Project, optionally pick a BOM or submittal package
 * in the same modal before resolving the pending action.
 */
export function ProjectRequiredModal({
  open,
  actionLabel,
  actionDescription,
  destinationRequirement,
  onResolved,
  onCancel,
}: ProjectRequiredModalProps) {
  const { token } = theme.useToken();
  const { projects, addProject } = useActiveProject();
  const [projectMode, setProjectMode] = useState<ProjectMode>(projects.length > 0 ? 'select' : 'create');
  const [flowStep, setFlowStep] = useState<FlowStep>('project');
  const [selectedId, setSelectedId] = useState<string | undefined>(undefined);
  const [destinationProjectId, setDestinationProjectId] = useState<string | null>(null);
  const [form] = Form.useForm();

  const bomFields = useBomDestinationFields(destinationProjectId ?? '');
  const submittalFields = useSubmittalDestinationFields(destinationProjectId ?? '');

  useEffect(() => {
    if (!open) return;
    setProjectMode(projects.length > 0 ? 'select' : 'create');
    setFlowStep('project');
    setSelectedId(projects[0]?.key);
    setDestinationProjectId(null);
    form.resetFields();
  }, [open, projects, form]);

  const needsDestination = Boolean(destinationRequirement);
  const destinationProject = projects.find((p) => p.key === destinationProjectId);

  const advanceToDestination = (projectId: string) => {
    setDestinationProjectId(projectId);
    setFlowStep('destination');
  };

  const confirmSelect = () => {
    if (!selectedId) return;
    if (needsDestination) {
      advanceToDestination(selectedId);
    } else {
      onResolved({ projectId: selectedId });
    }
  };

  const confirmCreate = (values: ProjectFormValues) => {
    const key = addProject(formValuesToProjectFields(values));
    if (needsDestination) {
      advanceToDestination(key);
    } else {
      onResolved({ projectId: key });
    }
  };

  const confirmDestination = () => {
    if (!destinationProjectId || !destinationRequirement) return;

    if (destinationRequirement === 'bom') {
      const dest = bomFields.resolve();
      if (!dest) return;
      onResolved({
        projectId: destinationProjectId,
        bomProjectId: dest.bomProjectId,
        bomProjectName: dest.bomProjectName,
      });
      return;
    }

    const dest = submittalFields.resolve();
    if (!dest) return;
    onResolved({
      projectId: destinationProjectId,
      packageId: dest.packageId,
      packageName: dest.packageName,
    });
  };

  const destinationCanSubmit =
    destinationRequirement === 'bom' ? bomFields.canSubmit : submittalFields.canSubmit;

  const destinationLabel = destinationRequirement === 'bom' ? 'BOM' : 'Submittal package';
  const destinationConfirmLabel =
    destinationRequirement === 'bom' ? 'Add to BOM' : 'Add to package';

  const modalTitle =
    flowStep === 'destination'
      ? `${actionLabel} — choose ${destinationLabel.toLowerCase()}`
      : `${actionLabel} needs a project`;

  const modalWidth =
    flowStep === 'destination' || projectMode === 'create' ? 560 : 480;

  return (
    <Modal
      title={modalTitle}
      open={open}
      onCancel={onCancel}
      footer={null}
      width={modalWidth}
      destroyOnClose
    >
      <Space orientation="vertical" size={token.margin} style={{ width: '100%' }}>
        {flowStep === 'project' ? (
          <>
            <Typography.Paragraph type="secondary" style={{ margin: 0 }}>
              {actionDescription ??
                (needsDestination
                  ? 'Choose a project, then pick the BOM or submittal package to add this item to — all in one step.'
                  : 'Workflow actions are organized under a Unified Project. Choose one to continue — we keep your place and finish the action automatically.')}
            </Typography.Paragraph>

            {projectMode === 'select' ? (
              <>
                <div>
                  <Typography.Text
                    type="secondary"
                    style={{ display: 'block', marginBottom: token.marginXS }}
                  >
                    Project
                  </Typography.Text>
                  <Select
                    showSearch
                    optionFilterProp="label"
                    style={{ width: '100%' }}
                    placeholder="Select a project"
                    value={selectedId}
                    onChange={setSelectedId}
                    options={projects.map((p) => ({ value: p.key, label: p.name }))}
                  />
                </div>
                <Space>
                  <Button type="primary" disabled={!selectedId} onClick={confirmSelect}>
                    {needsDestination ? 'Continue' : `Use this project & ${actionLabel.toLowerCase()}`}
                  </Button>
                  <Button onClick={onCancel}>Cancel</Button>
                </Space>
                <Divider style={{ margin: 0 }} plain>
                  <Typography.Text type="secondary" style={{ fontSize: token.fontSizeSM }}>
                    or
                  </Typography.Text>
                </Divider>
                <Button type="link" style={{ paddingInline: 0 }} onClick={() => setProjectMode('create')}>
                  Create a new project instead
                </Button>
              </>
            ) : (
              <Form
                layout="vertical"
                form={form}
                initialValues={{ country: 'US', contacts: [{}] }}
                onFinish={confirmCreate}
              >
                <ProjectFormFields
                  submitLabel={
                    needsDestination ? 'Create & continue' : `Create & ${actionLabel.toLowerCase()}`
                  }
                  onCancel={projects.length > 0 ? () => setProjectMode('select') : onCancel}
                />
              </Form>
            )}
          </>
        ) : (
          <>
            <Button
              type="link"
              icon={<ArrowLeftOutlined />}
              style={{ paddingInline: 0, alignSelf: 'flex-start' }}
              onClick={() => setFlowStep('project')}
            >
              Change project
            </Button>

            <Typography.Paragraph type="secondary" style={{ margin: 0 }}>
              Project:{' '}
              <Typography.Text strong>{destinationProject?.name ?? destinationProjectId}</Typography.Text>
            </Typography.Paragraph>

            <div>
              <Typography.Text
                type="secondary"
                style={{ display: 'block', marginBottom: token.marginXS }}
              >
                {destinationLabel}
              </Typography.Text>

              {destinationRequirement === 'bom' ? (
                <BomDestinationFields
                  boms={bomFields.boms}
                  mode={bomFields.mode}
                  onModeChange={bomFields.setMode}
                  selectedId={bomFields.selectedId}
                  onSelectedIdChange={bomFields.setSelectedId}
                  newName={bomFields.newName}
                  onNewNameChange={bomFields.setNewName}
                />
              ) : (
                <SubmittalDestinationFields
                  packages={submittalFields.packages}
                  mode={submittalFields.mode}
                  onModeChange={submittalFields.setMode}
                  selectedId={submittalFields.selectedId}
                  onSelectedIdChange={submittalFields.setSelectedId}
                  newName={submittalFields.newName}
                  onNewNameChange={submittalFields.setNewName}
                />
              )}
            </div>

            <Space>
              <Button type="primary" disabled={!destinationCanSubmit} onClick={confirmDestination}>
                {destinationConfirmLabel}
              </Button>
              <Button onClick={onCancel}>Cancel</Button>
            </Space>
          </>
        )}
      </Space>
    </Modal>
  );
}
