import { ArrowLeftOutlined } from '@ant-design/icons';
import { useEffect, useMemo, useState } from 'react';

import { useActiveProject } from '../context/ActiveProjectContext';
import { initialWorkspaceRowsForBomProject, useBomWorkspace } from '../context/BomWorkspaceContext';
import { isSkuInBomRows } from '../search/catalogBomAdd';
import { Button, Divider, Flex, Form, Modal, Select, Space, Typography, theme } from '../ui/antd';

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
  /** Optional SKU used to flag BOM destinations that already contain the item. */
  bomSku?: string;
  /** Optional part key used to flag submittal packages that already contain the item. */
  submittalPartKey?: string;
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
  bomSku,
  submittalPartKey,
  destinationRequirement,
  onResolved,
  onCancel,
}: ProjectRequiredModalProps) {
  const { token } = theme.useToken();
  const { projects, addProject } = useActiveProject();
  const { rowsByProjectId } = useBomWorkspace();
  const [projectMode, setProjectMode] = useState<ProjectMode>(projects.length > 0 ? 'select' : 'create');
  const [flowStep, setFlowStep] = useState<FlowStep>('project');
  const [selectedId, setSelectedId] = useState<string | undefined>(undefined);
  const [destinationProjectId, setDestinationProjectId] = useState<string | null>(null);
  const [form] = Form.useForm();

  const bomFields = useBomDestinationFields(destinationProjectId ?? '');
  const submittalFields = useSubmittalDestinationFields(destinationProjectId ?? '');

  const bomAvailability = useMemo(() => {
    if (!bomSku) return {};
    return bomFields.boms.reduce<Record<string, { disabled?: boolean; label?: string; description?: string }>>(
      (acc, bom) => {
        const rows = rowsByProjectId[bom.id] ?? initialWorkspaceRowsForBomProject(bom.id);
        if (isSkuInBomRows(rows, bomSku)) {
          acc[bom.id] = {
            disabled: true,
            label: 'Already contains item',
            description: 'Choose another BOM or create a new BOM to add this item elsewhere.',
          };
        }
        return acc;
      },
      {},
    );
  }, [bomFields.boms, bomSku, rowsByProjectId]);

  const packageAvailability = useMemo(() => {
    if (!submittalPartKey) return {};
    return submittalFields.packages.reduce<Record<string, { disabled?: boolean; label?: string; description?: string }>>(
      (acc, pkg) => {
        if (pkg.parts.some((existing) => existing.partKey === submittalPartKey)) {
          acc[pkg.id] = {
            disabled: true,
            label: 'Already contains item',
            description: 'Choose another package or create a new package to add this item elsewhere.',
          };
        }
        return acc;
      },
      {},
    );
  }, [submittalFields.packages, submittalPartKey]);

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
    destinationRequirement === 'bom'
      ? bomFields.canSubmit && !(bomFields.selectedId && bomAvailability[bomFields.selectedId]?.disabled)
      : submittalFields.canSubmit &&
        !(submittalFields.selectedId && packageAvailability[submittalFields.selectedId]?.disabled);

  const destinationLabel = destinationRequirement === 'bom' ? 'BOM' : 'Submittal package';
  const destinationConfirmLabel =
    destinationRequirement === 'bom' ? 'Add to BOM' : 'Add to package';

  const modalTitle =
    flowStep === 'destination'
      ? `${actionLabel} — choose ${destinationLabel.toLowerCase()}`
      : `${actionLabel} needs a project`;

  const modalWidth = flowStep === 'destination' || projectMode === 'create' ? token.screenSM : 520;

  return (
    <Modal
      title={modalTitle}
      open={open}
      onCancel={onCancel}
      footer={null}
      width={modalWidth}
      destroyOnClose
    >
      <Space orientation="vertical" size={token.marginLG} style={{ width: '100%' }}>
        {flowStep === 'project' ? (
          <>
            <Flex
              vertical
              gap={token.marginXXS}
              style={{
                padding: token.padding,
                border: `${token.lineWidth}px ${token.lineType} ${token.colorBorderSecondary}`,
                borderRadius: token.borderRadiusLG,
                background: token.colorFillQuaternary,
              }}
            >
              <Typography.Text type="secondary">Project context</Typography.Text>
              <Typography.Text>
                {actionDescription ??
                  (needsDestination
                    ? 'Choose a project first, then select the exact BOM or submittal package inside that project.'
                    : 'Workflow actions are organized under a Unified Project. Choose one to continue.')}
              </Typography.Text>
            </Flex>

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
                <Flex justify="flex-end" gap={token.marginSM} wrap="wrap">
                  <Button onClick={onCancel}>Cancel</Button>
                  <Button type="primary" disabled={!selectedId} onClick={confirmSelect}>
                    {needsDestination ? 'Continue' : `Use this project & ${actionLabel.toLowerCase()}`}
                  </Button>
                </Flex>
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
            <Flex align="center" justify="space-between" gap={token.marginSM} wrap="wrap">
              <Flex
                vertical
                gap={token.marginXXS}
                style={{
                  flex: '1 1 auto',
                  minWidth: 0,
                  padding: token.padding,
                  border: `${token.lineWidth}px ${token.lineType} ${token.colorBorderSecondary}`,
                  borderRadius: token.borderRadiusLG,
                  background: token.colorFillQuaternary,
                }}
              >
                <Typography.Text type="secondary">Selected project</Typography.Text>
                <Typography.Text strong>{destinationProject?.name ?? destinationProjectId}</Typography.Text>
                <Typography.Text type="secondary">
                  Choose the exact {destinationLabel.toLowerCase()} inside this project before continuing.
                </Typography.Text>
              </Flex>
              <Button
                type="link"
                icon={<ArrowLeftOutlined />}
                style={{ paddingInline: 0 }}
                onClick={() => setFlowStep('project')}
              >
                Change project
              </Button>
            </Flex>

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
                  bomAvailability={bomAvailability}
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
                  packageAvailability={packageAvailability}
                  mode={submittalFields.mode}
                  onModeChange={submittalFields.setMode}
                  selectedId={submittalFields.selectedId}
                  onSelectedIdChange={submittalFields.setSelectedId}
                  newName={submittalFields.newName}
                  onNewNameChange={submittalFields.setNewName}
                />
              )}
            </div>

            <Flex justify="flex-end" gap={token.marginSM} wrap="wrap">
              <Button onClick={onCancel}>Cancel</Button>
              <Button type="primary" disabled={!destinationCanSubmit} onClick={confirmDestination}>
                {destinationConfirmLabel}
              </Button>
            </Flex>
          </>
        )}
      </Space>
    </Modal>
  );
}
