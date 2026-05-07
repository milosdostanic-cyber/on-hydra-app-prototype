import type { TagProps } from 'antd';

import { PageBackButton } from './PageBackButton';
import { shellLayout } from '../theme/hydraAlias';
import { Alert, Card, Col, Flex, List, Row, Space, Tag, Typography, theme } from '../ui/antd';

type StepStatus = 'EXPLORE' | 'SOFT' | 'TRIGGER' | 'PROJECT';

type ProposalStep = {
  id: string;
  title: string;
  status: StepStatus;
  wireframeSummary: string[];
  notes: Array<{ label: string; text: string }>;
};

type ProposalPhase = {
  id: string;
  title: string;
  description: string;
  steps: ProposalStep[];
};

const statusColorByType: Record<StepStatus, TagProps['color']> = {
  EXPLORE: 'success',
  SOFT: 'warning',
  TRIGGER: 'error',
  PROJECT: 'processing',
};

const phases: ProposalPhase[] = [
  {
    id: 'PHASE 01',
    title: 'Free exploration',
    description:
      'Browse and compare without a project; optional save to project only when user chooses.',
    steps: [
      {
        id: '01',
        title: 'Entry - no project selected',
        status: 'EXPLORE',
        wireframeSummary: [
          'Top bar shows dashed "No project selected" picker.',
          'Quick Start surfaces Catalog + BOM and keeps recent projects visible.',
          'No project state is treated as a valid entry state, not an error.',
        ],
        notes: [
          {
            label: "WHAT'S HAPPENING",
            text: 'User lands without project context, but shell still offers immediate value paths.',
          },
          {
            label: 'WHY IT MATTERS',
            text: 'Users explore before committing; this lowers first-touch friction and builds trust.',
          },
        ],
      },
      {
        id: '02',
        title: 'Explore catalog freely',
        status: 'EXPLORE',
        wireframeSummary: [
          'Catalog search, filters, sort, and compare all available with no project selected.',
          'Product grid supports lightweight evaluation without project prompt.',
          'No upsell pattern interrupts exploration flow.',
        ],
        notes: [
          {
            label: "WHAT'S HAPPENING",
            text: 'Catalog remains fully usable before project commitment.',
          },
          {
            label: 'WHY IT MATTERS',
            text: 'Open exploration earns intent; forced commitment here causes drop-off.',
          },
        ],
      },
      {
        id: '03',
        title: 'Build a working set - soft engagement',
        status: 'SOFT',
        wireframeSummary: [
          'Comparison rail holds temporary set and estimated total.',
          '"Save to project" is visible but optional.',
          'Flow does not gate user before project-bound action is triggered.',
        ],
        notes: [
          {
            label: "WHAT'S HAPPENING",
            text: 'User accumulates intent through comparison while still in no-project mode.',
          },
          {
            label: 'WHY IT MATTERS',
            text: 'Soft engagement should not feel like a trap door into mandatory setup.',
          },
        ],
      },
    ],
  },
  {
    id: 'PHASE 02',
    title: 'Commit & attach',
    description:
      'Hard gate -> project-required modal -> select or create -> short context transfer beat.',
    steps: [
      {
        id: '04',
        title: 'Commit action - hard gate',
        status: 'TRIGGER',
        wireframeSummary: [
          'Project-bound action (for example BOM) triggers in-page explanation banner.',
          'Empty-state copy explains why project is needed.',
          'CTA hierarchy remains clear: Continue as primary, Go back as secondary.',
        ],
        notes: [
          {
            label: "WHAT'S HAPPENING",
            text: 'Constraint is framed around workflow logic, not user blame.',
          },
          {
            label: 'WHY IT MATTERS',
            text: 'Helpful framing increases acceptance of gate and reduces frustration.',
          },
        ],
      },
      {
        id: '05',
        title: 'Project required modal',
        status: 'TRIGGER',
        wireframeSummary: [
          'Three-action modal: Select a project, Create new project, Cancel.',
          'Copy anchors on "This needs a project".',
          'Select path is the dominant action.',
        ],
        notes: [
          {
            label: 'MODAL PATTERN',
            text: 'Keep Select / Create / Cancel options explicit and stable.',
          },
          {
            label: 'IMPLEMENTATION NOTE',
            text: 'Any additional escape path should be documented as explicit extension.',
          },
        ],
      },
      {
        id: '06',
        title: 'Select or create a project',
        status: 'PROJECT',
        wireframeSummary: [
          'Search recent projects and pick existing container.',
          'Clear + Create new project action remains available from same step.',
          'Top bar stays in no-project visual state until project is attached.',
        ],
        notes: [
          {
            label: "WHAT'S HAPPENING",
            text: 'Commit decision is separated from container selection for better clarity.',
          },
          {
            label: 'WHY IT MATTERS',
            text: 'This split reduces cognitive load at the gate moment.',
          },
        ],
      },
      {
        id: '07',
        title: 'Minimal project creation',
        status: 'PROJECT',
        wireframeSummary: [
          'Create modal keeps one required field: project name.',
          'Type is optional; deeper setup deferred.',
          'Primary CTA: Create & continue.',
        ],
        notes: [
          {
            label: "WHAT'S HAPPENING",
            text: 'Creation form minimizes friction at doorway.',
          },
          {
            label: 'WHY IT MATTERS',
            text: 'Configuration belongs after project exists, not before.',
          },
        ],
      },
      {
        id: '08',
        title: 'Context transfer',
        status: 'PROJECT',
        wireframeSummary: [
          'Explicit loading beat names destination project.',
          'Progress feedback confirms attach is in progress.',
          'State can map to real async attach call.',
        ],
        notes: [
          {
            label: 'HANDOFF MOMENT',
            text: 'Visible transition avoids silent jump between contexts.',
          },
          {
            label: 'PRODUCT TIE-IN',
            text: 'Keep destination project name visible during transfer.',
          },
        ],
      },
    ],
  },
  {
    id: 'PHASE 03',
    title: 'Inside the project',
    description: 'Active project chrome, then continuity across BOM, Submittals, and Approvals.',
    steps: [
      {
        id: '09',
        title: 'Project active - selections in context',
        status: 'PROJECT',
        wireframeSummary: [
          'Top bar switches to active project chip.',
          'Success banner confirms pre-project selections were transferred.',
          'BOM table renders transferred rows with draft status.',
        ],
        notes: [
          {
            label: "WHAT'S HAPPENING",
            text: 'Selection continuity becomes explicit and verifiable.',
          },
          {
            label: 'WHY IT MATTERS',
            text: 'If transfer fails visibly, commitment gate feels punitive.',
          },
        ],
      },
      {
        id: '10',
        title: 'Cross-module persistence',
        status: 'PROJECT',
        wireframeSummary: [
          'Flow communicates BOM -> Submittals -> Approvals continuity.',
          'Same project context applies across modules.',
          'Context should remain stable while user navigates module boundaries.',
        ],
        notes: [
          {
            label: "WHAT'S HAPPENING",
            text: 'Project scope acts as shared container for related workflows.',
          },
          {
            label: 'BUILD IMPLICATION',
            text: 'Client and API should read/write one active project scope.',
          },
        ],
      },
    ],
  },
  {
    id: 'PHASE 04',
    title: 'Mobility',
    description: 'Switch projects or step back to no-project state without losing place in app.',
    steps: [
      {
        id: '11',
        title: 'Project switcher',
        status: 'PROJECT',
        wireframeSummary: [
          'Switcher opens from active project chip.',
          'Search + recent + create new options live in same control.',
          'Current project row is clearly marked.',
        ],
        notes: [
          {
            label: "WHAT'S HAPPENING",
            text: 'User can change project context without route reset.',
          },
          {
            label: 'WHY IT MATTERS',
            text: 'Safe switching prevents users from avoiding commitment.',
          },
        ],
      },
      {
        id: '12',
        title: 'Back to explore',
        status: 'EXPLORE',
        wireframeSummary: [
          'Clearing project returns top bar to dashed no-project state.',
          'Global modules remain available; project-gated actions re-trigger commit flow.',
          'Loop closes with explicit success confirmation for explore mode.',
        ],
        notes: [
          {
            label: 'CLOSURE',
            text: 'No-project should be destination state, not dead end.',
          },
          {
            label: 'PRODUCT NOTE',
            text: 'Working-set retention policy when leaving project context still needs product decision.',
          },
        ],
      },
    ],
  },
];

const proposalPrinciples = [
  'No-project is first-class state.',
  'Commit only when workflow requires it.',
  'Commit modal pattern stays Select / Create / Cancel.',
  'Continuity of selection is core contract.',
  'One project context across modules.',
  'Mobility without trap doors.',
  'Minimal creation at the door.',
  'Language carries constraint without blaming user.',
];

export function ProjectReframingProposalPage() {
  const { token } = theme.useToken();
  const phaseSurface = token.colorBgContainer;

  return (
    <Space orientation="vertical" size={token.marginLG} style={{ width: '100%' }}>
      <PageBackButton to="/projects">Back to home</PageBackButton>

      <Card
        style={{
          width: '100%',
          maxWidth: shellLayout.contentRailMaxWidthPx,
          marginInline: 'auto',
          background: token.colorBgLayout,
        }}
        styles={{ body: { padding: token.paddingLG } }}
      >
        <Flex vertical gap={token.marginXL}>
          <Space orientation="vertical" size={token.marginMD}>
            <Typography.Text type="secondary">PROPOSAL - PROGRESSIVE PROJECT COMMITMENT</Typography.Text>
            <Typography.Title level={2} style={{ margin: 0 }}>
              Progressive Project Commitment <em>- proposed flow</em>
            </Typography.Title>
            <Typography.Paragraph style={{ margin: 0 }}>
              This page proposes a progressive commitment model for ASC ConnectED: start with no project,
              build a temporary working set, require a project only when workflow needs a container, carry
              selections into that project, then support mobility across projects and back to exploration.
            </Typography.Paragraph>
            <Flex gap={token.marginSM} wrap="wrap">
              <Tag color="success">Explore - no project</Tag>
              <Tag color="warning">Soft engagement</Tag>
              <Tag color="error">Commit trigger</Tag>
              <Tag color="processing">Project context</Tag>
            </Flex>
          </Space>

          {phases.map((phase) => (
            <Card
              key={phase.id}
              style={{ background: phaseSurface }}
              styles={{
                header: { background: 'transparent' },
                body: { background: 'transparent' },
              }}
              title={
                <Space size={token.marginSM}>
                  <Typography.Text type="secondary">{phase.id}</Typography.Text>
                  <Typography.Text strong>
                    <em>{phase.title}</em>
                  </Typography.Text>
                </Space>
              }
              extra={<Typography.Text type="secondary">{phase.description}</Typography.Text>}
            >
              <Space orientation="vertical" size={token.marginMD} style={{ width: '100%' }}>
                {phase.steps.map((step) => (
                  <Card
                    key={step.id}
                    size="small"
                    style={{ background: token.colorBgContainer }}
                    title={
                      <Space size={token.marginSM}>
                        <Typography.Text strong>{step.id}</Typography.Text>
                        <Typography.Text>{step.title}</Typography.Text>
                      </Space>
                    }
                    extra={<Tag color={statusColorByType[step.status]}>{step.status}</Tag>}
                  >
                    <Space orientation="vertical" size={token.marginMD} style={{ width: '100%' }}>
                      <Alert
                        type="info"
                        showIcon
                        message="Wireframe summary"
                        description={
                          <List
                            size="small"
                            dataSource={step.wireframeSummary}
                            renderItem={(item) => <List.Item>{item}</List.Item>}
                          />
                        }
                      />

                      <Row gutter={[token.marginMD, token.marginMD]}>
                        {step.notes.map((note) => (
                          <Col key={note.label} xs={24} md={12}>
                            <Card size="small" style={{ background: token.colorFillAlter }}>
                              <Space orientation="vertical" size={token.marginXS}>
                                <Typography.Text type="secondary">{note.label}</Typography.Text>
                                <Typography.Paragraph style={{ margin: 0 }}>{note.text}</Typography.Paragraph>
                              </Space>
                            </Card>
                          </Col>
                        ))}
                      </Row>
                    </Space>
                  </Card>
                ))}
              </Space>
            </Card>
          ))}

          <Card
            style={{ background: token.colorBgContainer }}
            title={
              <Typography.Text strong>
                <em>Principles for this proposal</em>
              </Typography.Text>
            }
          >
            <List
              dataSource={proposalPrinciples}
              renderItem={(item, index) => (
                <List.Item>
                  <Space>
                    <Typography.Text strong>{String(index + 1).padStart(2, '0')}</Typography.Text>
                    <Typography.Text>{item}</Typography.Text>
                  </Space>
                </List.Item>
              )}
            />
          </Card>
        </Flex>
      </Card>
    </Space>
  );
}
