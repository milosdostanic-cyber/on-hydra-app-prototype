import type { TagProps } from 'antd';
import {
  AppstoreOutlined,
  BellOutlined,
  CalculatorOutlined,
  CheckCircleOutlined,
  FileOutlined,
  FileTextOutlined,
  HomeOutlined,
  SearchOutlined,
  ToolOutlined,
  UnorderedListOutlined,
  UserOutlined,
} from '@ant-design/icons';

import { CloseOutlined, UploadOutlined } from '@ant-design/icons';

import { PageBackButton } from './PageBackButton';
import { shellLayout } from '../theme/hydraAlias';
import { Alert, Button, Card, Col, Divider, Flex, Input, List, Menu, Progress, Row, Select, Space, Table, Tag, Typography, theme } from '../ui/antd';

type StepStatus = 'EXPLORE' | 'SOFT' | 'TRIGGER' | 'PROJECT';

type ProposalStep = {
  id: string;
  title: string;
  status: StepStatus;
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
        title: 'Entry — no project selected',
        status: 'EXPLORE',
        notes: [
          {
            label: "WHAT'S HAPPENING",
            text: 'The user lands without a project selected. This flow treats that as a first-class state: greeting, Catalog and BOM as quick entry, and recent projects—not an empty or “broken” shell.',
          },
          {
            label: 'WHY IT MATTERS',
            text: 'The dashed project picker signals optional context, not an error. Modules that are safe to open without a project should stay visible so exploration does not feel blocked.',
          },
        ],
      },
      {
        id: '02',
        title: 'Explore catalog freely',
        status: 'EXPLORE',
        notes: [
          {
            label: "WHAT'S HAPPENING",
            text: 'Full catalog access without a project. Search, filters, and “+ Compare” are all available. No upsells, no project-creation prompts.',
          },
          {
            label: 'WHY IT MATTERS',
            text: 'This is where trust gets earned. A user who can browse without commitment will commit later when it’s actually useful. Forcing a project here is the fastest way to lose first-time users.',
          },
        ],
      },
      {
        id: '03',
        title: 'Build a working set — soft engagement',
        status: 'SOFT',
        notes: [
          {
            label: "WHAT'S HAPPENING",
            text: 'The user keeps a temporary comparison while still in explore mode. Save to project is visible but not required—soft engagement only.',
          },
          {
            label: 'WHY IT MATTERS',
            text: 'Letting people assemble a set before naming a container earns intent. The hard gate comes only when a module needs a project (e.g. BOM), not here.',
          },
        ],
      },
    ],
  },
  {
    id: 'PHASE 02',
    title: 'Commit & attach',
    description:
      'Hard gate → project-required modal (select / create / cancel) → pick or create → brief handoff while context transfers.',
    steps: [
      {
        id: '04',
        title: 'Commit action — hard gate (e.g. BOM)',
        status: 'TRIGGER',
        notes: [
          {
            label: "WHAT'S HAPPENING",
            text: 'The user clicked into BOM (or tried to “Add to BOM” from a product card). The empty state explains why a project is needed before introducing the prompt.',
          },
          {
            label: 'WHY IT MATTERS',
            text: 'The framing is “a BOM needs a home” — not “you need to create a project to continue.” Constraints feel helpful when they explain the underlying logic instead of stating a rule.',
          },
        ],
      },
      {
        id: '05',
        title: 'Project required modal',
        status: 'TRIGGER',
        notes: [
          {
            label: 'MODAL PATTERN',
            text: 'Three actions: Select a project, Create new project, or Cancel. Copy centers the work (“this needs a project”), not the user as the problem.',
          },
          {
            label: 'IMPLEMENTATION NOTE',
            text: 'If engineering adds alternate escape paths (e.g. drafts), document them as extensions to this proposal—not silent behavior changes.',
          },
        ],
      },
      {
        id: '06',
        title: 'Select or create a project',
        status: 'PROJECT',
        notes: [
          {
            label: "WHAT'S HAPPENING",
            text: 'After Select a project from the modal, this flow shows a searchable recent projects list plus a clear path to create new.',
          },
          {
            label: 'WHY IT MATTERS',
            text: 'Separating this from the empty BOM keeps the commit moment legible: first acknowledge the rule, then pick the container.',
          },
        ],
      },
      {
        id: '07',
        title: 'Minimal project creation',
        status: 'PROJECT',
        notes: [
          {
            label: "WHAT'S HAPPENING",
            text: 'One required field. Type is optional with a sensible default. Members, permissions, and settings are deferred to after creation.',
          },
          {
            label: 'WHY IT MATTERS',
            text: 'The friction has to be proportional to the moment. The user just clicked “create” — they haven’t earned a configuration form. Configuration belongs inside the project, not in the doorway.',
          },
        ],
      },
      {
        id: '08',
        title: 'Context transfer',
        status: 'PROJECT',
        notes: [
          {
            label: 'HANDOFF MOMENT',
            text: 'An explicit loading beat makes the handoff feel intentional, not like a silent jump.',
          },
          {
            label: 'PRODUCT TIE-IN',
            text: 'Use the same screen for real async work (API attach) or a short timed state in prototypes—keep the project name visible.',
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
        title: 'Project active — selections in context',
        status: 'PROJECT',
        notes: [
          {
            label: "WHAT'S HAPPENING",
            text: 'The 3 items the user had selected pre-project now live in the BOM. The success banner makes the transfer visible and dismissible.',
          },
          {
            label: 'WHY IT MATTERS',
            text: 'If the selection didn’t carry over, the whole gate would feel like punishment for committing. Continuity of work is the contract the prompt makes with the user.',
          },
        ],
      },
      {
        id: '10',
        title: 'Cross-module persistence',
        status: 'PROJECT',
        notes: [
          {
            label: "WHAT'S HAPPENING",
            text: 'A simple BOM → Submittals → Approvals read shows why the project container matters beyond a single screen.',
          },
          {
            label: 'BUILD IMPLICATION',
            text: 'Engineering should keep one project scope in client and API so these modules read/write the same ids—not three disconnected silos.',
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
        notes: [
          {
            label: "WHAT'S HAPPENING",
            text: 'From the project name in the top bar, the user opens recent projects and create new—mobility without leaving the shell.',
          },
          {
            label: 'WHY IT MATTERS',
            text: 'Switching has to feel safe; otherwise users avoid committing. Keep context and route stable when only projectId changes.',
          },
        ],
      },
      {
        id: '12',
        title: 'Back to explore',
        status: 'EXPLORE',
        notes: [
          {
            label: 'CLOSURE',
            text: 'Step 12 makes no-project an explicit return state, not a dead end—aligned with steps 1–2.',
          },
          {
            label: 'PRODUCT NOTE',
            text: 'Preserve any in-memory working set policy in spec (clear vs keep) when exiting project context; this proposal assumes users can browse freely again.',
          },
        ],
      },
    ],
  },
];

const proposalPrinciples = [
  'No-project is a first-class state.',
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
  const previewHeight = token.controlHeight * 11;
  const previewCardStyle = {
    background: token.colorFillAlter,
    borderColor: token.colorBorderSecondary,
  };
  const sidebarItems = [
    { key: 'home', icon: <HomeOutlined />, label: 'Home' },
    { key: 'catalog', icon: <AppstoreOutlined />, label: 'Catalog' },
    { key: 'bom', icon: <UnorderedListOutlined />, label: 'BOM' },
    { key: 'submittals', icon: <FileTextOutlined />, label: 'Submittals' },
    { key: 'seis', icon: <CalculatorOutlined />, label: 'SeisBrace' },
    { key: 'approvals', icon: <CheckCircleOutlined />, label: 'Approvals' },
    { key: 'tools', icon: <ToolOutlined />, label: 'Tools' },
    { key: 'templates', icon: <FileOutlined />, label: 'Templates' },
  ];

  const renderShellSidebar = (selectedKey: string) => (
    <Flex
      vertical
      style={{
        width: '20%',
        minWidth: token.controlHeight * 4,
        borderInlineEnd: `${token.lineWidth}px ${token.lineType} ${token.colorBorderSecondary}`,
        paddingInline: token.paddingXS,
        paddingBlock: token.paddingSM,
      }}
    >
      <Menu
        mode="inline"
        selectedKeys={[selectedKey]}
        items={sidebarItems}
        style={{ borderInlineEnd: 'none', background: 'transparent' }}
      />
    </Flex>
  );

  const renderStepPreview = (stepId: string) => {
    if (stepId === '01') {
      return (
        <Card size="small" style={previewCardStyle}>
          <Flex style={{ minHeight: previewHeight }}>
            {renderShellSidebar('home')}
            <Flex
              vertical
              style={{ flex: 1 }}
              gap={token.marginLG}
            >
              {/* Top bar — px-24 py-12 border-b */}
              <Flex
                justify="space-between"
                align="center"
                style={{
                  paddingInline: token.paddingLG,
                  paddingBlock: token.paddingSM,
                  borderBottom: `${token.lineWidth}px ${token.lineType} ${token.colorBorderSecondary}`,
                }}
              >
                <Select
                  size="small"
                  value="No project selected"
                  style={{ width: token.controlHeight * 5.8 }}
                  options={[{ value: 'No project selected', label: 'No project selected' }]}
                />
                <Flex gap={token.marginXS}>
                  <Button size="small" type="text" icon={<SearchOutlined />} />
                  <Button size="small" type="text" icon={<BellOutlined />} />
                  <Button size="small" type="text" icon={<UserOutlined />} />
                </Flex>
              </Flex>

              {/* Greeting — px-24 gap-4 */}
              <Space
                direction="vertical"
                size={token.marginXXS}
                style={{ paddingInline: token.paddingLG }}
              >
                <Typography.Title level={4} style={{ margin: 0 }}>
                  Good morning, Alex
                </Typography.Title>
                <Typography.Text type="secondary">
                  What would you like to work on today?
                </Typography.Text>
              </Space>

              {/* Quick Start — px-24 */}
              <Flex vertical gap={token.marginXS} style={{ paddingInline: token.paddingLG }}>
                <Typography.Text type="secondary">QUICK START</Typography.Text>
                <Flex gap={token.marginXS}>
                  <Alert
                    style={{ flex: 1 }}
                    type="success"
                    showIcon={false}
                    message={
                      <Typography.Text strong style={{ fontSize: token.fontSizeLG }}>
                        Catalog
                      </Typography.Text>
                    }
                    description="Search, filters, compare — no project"
                  />
                  <Alert
                    style={{ flex: 1 }}
                    type="info"
                    showIcon={false}
                    message={
                      <Typography.Text strong style={{ fontSize: token.fontSizeLG }}>
                        BOM
                      </Typography.Text>
                    }
                    description="Opens commit flow when no project"
                  />
                </Flex>
              </Flex>

              {/* Recent Projects — px-24 gap-8 */}
              <Flex vertical gap={token.marginXS} style={{ paddingInline: token.paddingLG }}>
                <Typography.Text type="secondary">RECENT PROJECTS · 3</Typography.Text>
                <Card size="small">
                  <Flex justify="space-between" align="center">
                    <Space size={token.marginSM}>
                      <Typography.Text strong>Hospital Renovation A</Typography.Text>
                      <Typography.Text type="secondary">
                        12 items · updated 2d ago · Commercial
                      </Typography.Text>
                    </Space>
                    <Button size="small">Open</Button>
                  </Flex>
                </Card>
              </Flex>
            </Flex>
          </Flex>
        </Card>
      );
    }
    if (stepId === '02') {
      return (
        <Card size="small" style={previewCardStyle}>
          <Flex style={{ minHeight: previewHeight }}>
            {renderShellSidebar('catalog')}
            <Flex vertical style={{ flex: 1 }} gap={token.marginLG}>
              {/* Top bar — px-24 py-12 border-b */}
              <Flex
                justify="space-between"
                align="center"
                style={{
                  paddingInline: token.paddingLG,
                  paddingBlock: token.paddingSM,
                  borderBottom: `${token.lineWidth}px ${token.lineType} ${token.colorBorderSecondary}`,
                }}
              >
                <Select
                  size="small"
                  value="No project selected"
                  style={{ width: token.controlHeight * 5.8 }}
                  options={[{ value: 'No project selected', label: 'No project selected' }]}
                />
              </Flex>

              {/* Content — px-24 */}
              <Flex vertical gap={token.marginMD} style={{ paddingInline: token.paddingLG }}>
                <Typography.Title level={4} style={{ margin: 0 }}>Catalog</Typography.Title>
                <Flex gap={token.marginSM}>
                  <Input size="small" prefix={<SearchOutlined />} placeholder="Search products, categories…" />
                  <Button size="small">Filters</Button>
                  <Select
                    size="small"
                    value="Sort: Relevance"
                    style={{ width: token.controlHeight * 4.8 }}
                    options={[{ value: 'Sort: Relevance', label: 'Sort: Relevance' }]}
                  />
                </Flex>
                <Row gutter={[token.marginSM, token.marginSM]}>
                  {[
                    { code: 'ABU66Z', name: 'Adjustable Base', price: '$8.25 · EA' },
                    { code: 'ABR902', name: 'Adjustable Brace', price: '$16.40 · EA' },
                    { code: 'HDU26', name: 'Heavy Duty U', price: '$6.75 · EA' },
                    { code: 'A35', name: 'Angle Clip', price: '$4.90 · EA' },
                    { code: 'LTP4', name: 'Light Tie Plate', price: '$3.20 · EA' },
                    { code: 'SDS25412', name: 'Strong-Drive Screw', price: '$0.62 · EA' },
                  ].map((item) => (
                    <Col key={item.code} span={8}>
                      <Card size="small">
                        <Flex align="flex-start" gap={token.marginSM}>
                          <Flex
                            align="center"
                            justify="center"
                            style={{
                              width: token.controlHeight * 2,
                              minWidth: token.controlHeight * 2,
                              height: token.controlHeight * 2,
                              background: token.colorFillAlter,
                              border: `${token.lineWidth}px ${token.lineType} ${token.colorBorderSecondary}`,
                              borderRadius: token.borderRadiusSM,
                            }}
                          >
                            <Flex
                              style={{
                                width: token.controlHeight,
                                minWidth: token.controlHeight,
                                height: token.controlHeight,
                                background: token.colorFillSecondary,
                                border: `${token.lineWidth}px ${token.lineType} ${token.colorBorderSecondary}`,
                                borderRadius: token.borderRadiusSM,
                              }}
                            />
                          </Flex>
                          <Space direction="vertical" size={0}>
                            <Typography.Text strong style={{ fontSize: token.fontSize }}>
                              {item.code}
                            </Typography.Text>
                            <Typography.Text type="secondary" style={{ fontSize: token.fontSize }}>
                              {item.name}
                            </Typography.Text>
                            <Typography.Text style={{ fontSize: token.fontSize }}>
                              {item.price}
                            </Typography.Text>
                            <Typography.Text type="secondary" style={{ fontSize: token.fontSize }}>
                              + Compare
                            </Typography.Text>
                          </Space>
                        </Flex>
                      </Card>
                    </Col>
                  ))}
                </Row>
              </Flex>
            </Flex>
          </Flex>
        </Card>
      );
    }
    if (stepId === '03') {
      return (
        <Card size="small" style={previewCardStyle}>
          <Flex style={{ minHeight: previewHeight }}>
            {renderShellSidebar('catalog')}
            <Flex vertical style={{ flex: 1 }} gap={token.marginLG}>
              {/* Top bar — px-24 py-12 border-b */}
              <Flex
                justify="space-between"
                align="center"
                style={{
                  paddingInline: token.paddingLG,
                  paddingBlock: token.paddingSM,
                  borderBottom: `${token.lineWidth}px ${token.lineType} ${token.colorBorderSecondary}`,
                }}
              >
                <Select
                  size="small"
                  value="No project selected"
                  style={{ width: token.controlHeight * 5.8 }}
                  options={[{ value: 'No project selected', label: 'No project selected' }]}
                />
              </Flex>

              {/* Content — px-24 */}
              <Flex gap={token.marginMD} style={{ paddingInline: token.paddingLG }}>
                <Flex vertical style={{ flex: 1 }} gap={token.marginSM}>
                  <Typography.Title level={4} style={{ margin: 0 }}>Catalog</Typography.Title>
                  <Card size="small">
                    <Typography.Text type="secondary" style={{ fontSize: token.fontSize }}>
                      Product grid · filters · + Compare...
                    </Typography.Text>
                  </Card>
                  <Card size="small" style={{ borderStyle: 'dashed' }}>
                    <Typography.Text type="secondary" style={{ fontSize: token.fontSize }}>
                      More results...
                    </Typography.Text>
                  </Card>
                </Flex>
                <Card
                  size="small"
                  style={{ width: '30%', minWidth: token.controlHeight * 3, borderColor: token.colorWarning }}
                >
                  <Space direction="vertical" size={token.marginXS} style={{ width: '100%' }}>
                    <Typography.Text strong>Comparison</Typography.Text>
                    <Typography.Text type="secondary" style={{ fontSize: token.fontSize }}>
                      3 items
                    </Typography.Text>
                    {['ABU66Z  $8.25', 'ABR902  $16.40', 'HDU26  $6.75'].map((line) => (
                      <Typography.Text key={line} style={{ fontSize: token.fontSize }}>
                        {line}
                      </Typography.Text>
                    ))}
                    <Divider style={{ margin: 0 }} />
                    <Typography.Text style={{ fontSize: token.fontSize }}>Est. total   $31.40</Typography.Text>
                    <Button size="small" block>
                      Save to project
                    </Button>
                    <Typography.Text type="secondary" style={{ fontSize: token.fontSize }}>
                      Optional — no gate yet
                    </Typography.Text>
                  </Space>
                </Card>
              </Flex>
            </Flex>
          </Flex>
        </Card>
      );
    }
    if (stepId === '04') {
      return (
        <Card size="small" style={previewCardStyle}>
          <Flex style={{ minHeight: previewHeight }}>
            {renderShellSidebar('bom')}
            <Flex vertical style={{ flex: 1 }} gap={token.marginLG}>
              <Flex
                justify="space-between"
                align="center"
                style={{
                  paddingInline: token.paddingLG,
                  paddingBlock: token.paddingSM,
                  borderBottom: `${token.lineWidth}px ${token.lineType} ${token.colorBorderSecondary}`,
                }}
              >
                <Select
                  size="small"
                  value="No project selected"
                  style={{ width: token.controlHeight * 5.8 }}
                  options={[{ value: 'No project selected', label: 'No project selected' }]}
                />
              </Flex>
              <Flex vertical gap={token.marginMD} style={{ paddingInline: token.paddingLG }}>
                <Card size="small" style={{ borderColor: token.colorError, background: token.colorErrorBg }}>
                  <Typography.Text type="danger">This action requires a project to continue.</Typography.Text>
                </Card>
                <Card size="small" style={{ borderStyle: 'dashed', borderColor: token.colorErrorBorder }}>
                  <Space direction="vertical" size={token.marginSM} style={{ width: '100%', textAlign: 'center' }}>
                    <Flex
                      align="center"
                      justify="center"
                      style={{
                        width: token.controlHeight * 1.5,
                        height: token.controlHeight * 1.5,
                        background: token.colorErrorBg,
                        border: `${token.lineWidth}px ${token.lineType} ${token.colorErrorBorder}`,
                        borderRadius: '50%',
                        marginBlock: token.marginSM,
                        marginInline: 'auto',
                      }}
                    >
                      <UploadOutlined style={{ fontSize: token.fontSizeXL, color: token.colorError }} />
                    </Flex>
                    <Typography.Title level={3} style={{ margin: 0 }}>Add to BOM</Typography.Title>
                    <Typography.Text type="secondary">BOMs, submittals, and approvals live inside a project.</Typography.Text>
                    <Flex justify="center" gap={token.marginSM}>
                      <Button size="small" type="primary">
                        Continue
                      </Button>
                      <Button size="small">Go back</Button>
                    </Flex>
                  </Space>
                </Card>
              </Flex>
            </Flex>
          </Flex>
        </Card>
      );
    }
    if (stepId === '05') {
      return (
        <Card size="small" style={previewCardStyle}>
          <Flex align="center" justify="center" style={{ minHeight: previewHeight }}>
            <Card
              size="small"
              style={{
                width: token.controlHeightLG * 13,
                minWidth: token.controlHeight * 4,
                background: token.colorBgContainer,
                border: `${token.lineWidth}px ${token.lineType} ${token.colorBorderSecondary}`,
              }}
              styles={{ body: { padding: 0 } }}
            >
              <Flex
                align="center"
                justify="space-between"
                style={{
                  paddingInline: token.paddingMD,
                  paddingBlock: token.paddingSM,
                  borderBottom: `${token.lineWidth}px ${token.lineType} ${token.colorBorderSecondary}`,
                }}
              >
                <Typography.Text strong>This needs a project</Typography.Text>
                <Button type="text" icon={<CloseOutlined />} />
              </Flex>

              <Space direction="vertical" size={token.marginMD} style={{ width: '100%', padding: token.paddingMD }}>
                <Typography.Paragraph type="secondary" style={{ margin: 0 }}>
                  BOMs, Submittals, and other workflows live inside a project.
                </Typography.Paragraph>
                <Flex
                  justify="flex-end"
                  gap={token.marginSM}
                  style={{
                    paddingTop: token.paddingSM,
                    borderTop: `${token.lineWidth}px ${token.lineType} ${token.colorBorderSecondary}`,
                  }}
                >
                  <Button>Cancel</Button>
                  <Button>Create new project</Button>
                  <Button type="primary">Select a project</Button>
                </Flex>
              </Space>
            </Card>
          </Flex>
        </Card>
      );
    }
    if (stepId === '06') {
      return (
        <Card size="small" style={previewCardStyle}>
          <Flex style={{ minHeight: previewHeight }}>
            {renderShellSidebar('catalog')}
            <Flex vertical style={{ flex: 1 }} gap={token.marginLG}>
              <Flex
                justify="space-between"
                align="center"
                style={{
                  paddingInline: token.paddingLG,
                  paddingBlock: token.paddingSM,
                  borderBottom: `${token.lineWidth}px ${token.lineType} ${token.colorBorderSecondary}`,
                }}
              >
                <Select
                  size="small"
                  value="No project selected"
                  style={{ width: token.controlHeight * 5.8 }}
                  options={[{ value: 'No project selected', label: 'No project selected' }]}
                />
              </Flex>

              <Flex vertical gap={token.marginMD} style={{ paddingInline: token.paddingLG }}>
                <Typography.Text strong>Choose a project</Typography.Text>
                <Flex justify="space-between" gap={token.marginSM}>
                  <Input size="small" prefix={<SearchOutlined />} placeholder="Search recent projects..." />
                  <Button size="small" type="primary">
                    + Create new project
                  </Button>
                </Flex>
                <Typography.Text type="secondary" style={{ fontSize: token.fontSize }}>
                  RECENT
                </Typography.Text>
                <Space direction="vertical" size={token.marginXS}>
                  {[
                    { name: 'Hospital Renovation A', type: 'Commercial' },
                    { name: 'School Expansion' },
                    { name: 'Office Building Annex' },
                  ].map((project) => (
                    <Card key={project.name} size="small">
                      <Flex justify="space-between" align="center">
                        <Typography.Text style={{ fontSize: token.fontSize }}>{project.name}</Typography.Text>
                        {project.type ? (
                          <Typography.Text style={{ color: token.colorTextLabel, fontSize: token.fontSize }}>
                            {project.type}
                          </Typography.Text>
                        ) : null}
                      </Flex>
                    </Card>
                  ))}
                </Space>
              </Flex>
            </Flex>
          </Flex>
        </Card>
      );
    }
    if (stepId === '07') {
      return (
        <Card size="small" style={previewCardStyle}>
          <Flex align="center" justify="center" style={{ minHeight: previewHeight }}>
            <Card size="small" style={{ width: '45%', minWidth: token.controlHeight * 4 }}>
              <Space direction="vertical" size={token.marginSM} style={{ width: '100%' }}>
                <Typography.Text strong>New project</Typography.Text>
                <Typography.Text type="secondary" style={{ fontSize: token.fontSize }}>
                  PROJECT NAME
                </Typography.Text>
                <Input size="small" value="Downtown Office Tower" />
                <Typography.Text type="secondary" style={{ fontSize: token.fontSize }}>
                  TYPE · optional
                </Typography.Text>
                <Input size="small" value="Commercial" />
                <Typography.Text type="secondary" style={{ fontSize: token.fontSize }}>
                  Members, settings, templates → after creation
                </Typography.Text>
                <Flex justify="end">
                  <Button size="small" type="primary">
                    Create & continue
                  </Button>
                </Flex>
              </Space>
            </Card>
          </Flex>
        </Card>
      );
    }
    if (stepId === '08') {
      return (
        <Card size="small" style={previewCardStyle}>
          <Flex vertical align="center" justify="center" style={{ minHeight: previewHeight }} gap={token.marginSM}>
            <Flex
              align="center"
              justify="center"
              style={{
                width: token.controlHeight * 1.8,
                height: token.controlHeight * 1.8,
                background: token.colorSuccessBg,
                border: `${token.lineWidth}px ${token.lineType} ${token.colorSuccessBorder}`,
                borderRadius: '50%',
              }}
            >
              <CheckCircleOutlined style={{ color: token.colorSuccess, fontSize: token.fontSizeXL }} />
            </Flex>
            <Typography.Text strong style={{ fontSize: token.fontSizeLG, color: token.colorTextHeading }}>
              Setting things up...
            </Typography.Text>
            <Typography.Text type="secondary" style={{ fontSize: token.fontSize }}>
              Your selected items and context are being added to
            </Typography.Text>
            <Typography.Text strong style={{ fontSize: token.fontSizeLG }}>
              Downtown Office Tower
            </Typography.Text>
            <Progress percent={70} showInfo={false} style={{ width: '45%' }} />
          </Flex>
        </Card>
      );
    }
    if (stepId === '09') {
      return (
        <Card size="small" style={previewCardStyle}>
          <Flex style={{ minHeight: previewHeight }}>
            {renderShellSidebar('bom')}
            <Flex vertical style={{ flex: 1 }} gap={token.marginLG}>
              <Flex
                justify="space-between"
                align="center"
                style={{
                  paddingInline: token.paddingLG,
                  paddingBlock: token.paddingSM,
                  borderBottom: `${token.lineWidth}px ${token.lineType} ${token.colorBorderSecondary}`,
                }}
              >
                <Select
                  size="small"
                  value="Downtown Office Tower"
                  style={{ width: token.controlHeight * 5.8 }}
                  options={[{ value: 'Downtown Office Tower', label: 'Downtown Office Tower' }]}
                />
              </Flex>
              <Flex vertical gap={token.marginMD} style={{ paddingInline: token.paddingLG }}>
                <Card size="small" style={{ borderColor: token.colorSuccess, background: token.colorSuccessBg }}>
                  <Flex align="center" gap={token.marginXS}>
                    <CheckCircleOutlined style={{ color: token.colorSuccess }} />
                    <Typography.Text style={{ color: token.colorSuccessText }}>
                      3 items from your selection moved into this project
                    </Typography.Text>
                  </Flex>
                </Card>
                <Flex justify="space-between" style={{ marginBottom: token.marginXS }}>
                  <Typography.Text strong>BOM</Typography.Text>
                  <Typography.Text type="secondary">3 items · auto-saved</Typography.Text>
                  <Button size="small" type="primary">
                    + Add items
                  </Button>
                </Flex>
                <Table
                  size="small"
                  pagination={false}
                  columns={[
                    { title: 'Item', dataIndex: 'item', key: 'item' },
                    { title: 'Qty', dataIndex: 'qty', key: 'qty', width: 80 },
                    { title: 'Unit', dataIndex: 'unit', key: 'unit', width: 80 },
                    {
                      title: 'Code',
                      dataIndex: 'code',
                      key: 'code',
                      width: 100,
                      render: (value: string) => (
                        <Flex align="center" gap={token.marginXXS}>
                          <Typography.Text>{value}</Typography.Text>
                          <CheckCircleOutlined style={{ color: token.colorSuccess }} />
                        </Flex>
                      ),
                    },
                    { title: 'Status', dataIndex: 'status', key: 'status', width: 100 },
                  ]}
                  dataSource={[
                    { key: '1', item: 'ABU66Z · Adjustable Base', qty: '2', unit: 'EA', code: 'IBC', status: 'Draft' },
                    { key: '2', item: 'ABR902 · Adjustable Brace', qty: '4', unit: 'EA', code: 'IBC', status: 'Draft' },
                    { key: '3', item: 'HDU26 · Heavy Duty U', qty: '6', unit: 'EA', code: 'IBC', status: 'Draft' },
                  ]}
                />
              </Flex>
            </Flex>
          </Flex>
        </Card>
      );
    }
    if (stepId === '10') {
      return (
        <Card size="small" style={previewCardStyle}>
          <Flex
            vertical
            align="center"
            justify="center"
            style={{ minHeight: token.controlHeight * 8.5, paddingBlock: token.paddingSM }}
            gap={token.marginLG}
          >
            <Typography.Text>
              Same project context — selections and relationships carry across modules
            </Typography.Text>
            <Flex align="center" justify="center" gap={token.marginXS} style={{ width: '100%' }}>
              <Card
                size="small"
                style={{
                  borderColor: token.colorPrimaryBorder,
                  background: token.colorPrimaryBg,
                  width: token.controlHeightLG * 4.8,
                  textAlign: 'center',
                }}
              >
                <Space direction="vertical" size={0}>
                  <Typography.Text strong>BOM</Typography.Text>
                  <Typography.Text type="secondary">Line items</Typography.Text>
                </Space>
              </Card>
              <Typography.Text type="secondary">→</Typography.Text>
              <Card size="small" style={{ width: token.controlHeightLG * 4.4, textAlign: 'center' }}>
                <Space direction="vertical" size={0}>
                  <Typography.Text strong>Submittals</Typography.Text>
                  <Typography.Text type="secondary">Packages</Typography.Text>
                </Space>
              </Card>
              <Typography.Text type="secondary">→</Typography.Text>
              <Card size="small" style={{ width: token.controlHeightLG * 4.4, textAlign: 'center' }}>
                <Space direction="vertical" size={0}>
                  <Typography.Text strong>Approvals</Typography.Text>
                  <Typography.Text type="secondary">Workflow</Typography.Text>
                </Space>
              </Card>
            </Flex>
            <Typography.Text type="secondary">
              Data persists as users move between modules once a project is active
            </Typography.Text>
          </Flex>
        </Card>
      );
    }
    if (stepId === '11') {
      return (
        <Card size="small" style={previewCardStyle}>
          <Flex style={{ minHeight: previewHeight }}>
            {renderShellSidebar('bom')}
            <Flex vertical style={{ flex: 1 }} gap={token.marginLG}>
              <Flex
                justify="space-between"
                align="center"
                style={{
                  paddingInline: token.paddingLG,
                  paddingBlock: token.paddingSM,
                  borderBottom: `${token.lineWidth}px ${token.lineType} ${token.colorBorderSecondary}`,
                }}
              >
                <Select
                  size="small"
                  value="Downtown Office Tower"
                  style={{ width: token.controlHeight * 5.8 }}
                  options={[{ value: 'Downtown Office Tower', label: 'Downtown Office Tower' }]}
                />
              </Flex>
              <Flex gap={token.marginMD} align="stretch" style={{ paddingInline: token.paddingLG }}>
                <Card size="small" style={{ width: token.controlHeightLG * 8.5, minWidth: token.controlHeight * 3 }}>
                  <Space direction="vertical" size={token.marginXXS} style={{ width: '100%' }}>
                    <Input size="small" prefix={<SearchOutlined />} placeholder="Search..." />
                    <Typography.Text type="secondary" style={{ fontSize: token.fontSize }}>
                      RECENT
                    </Typography.Text>
                    <List
                      size="small"
                      bordered
                      dataSource={[
                        { name: 'Downtown Office Tower', current: true },
                        { name: 'Hospital Renovation A' },
                        { name: 'School Expansion' },
                      ]}
                      renderItem={(item) => (
                        <List.Item style={{ paddingInline: token.paddingSM, paddingBlock: token.paddingXXS }}>
                          <Flex justify="space-between" align="center" style={{ width: '100%' }}>
                            <Typography.Text strong={item.current} style={{ fontSize: token.fontSize }}>
                              {item.name}
                            </Typography.Text>
                            {item.current ? (
                              <Flex align="center" gap={token.marginXXS}>
                                <CheckCircleOutlined style={{ color: token.colorSuccess }} />
                                <Typography.Text type="secondary">CURRENT</Typography.Text>
                              </Flex>
                            ) : null}
                          </Flex>
                        </List.Item>
                      )}
                    />
                    <Button type="link" style={{ paddingInline: 0, alignSelf: 'flex-start' }}>
                      + Create new project
                    </Button>
                  </Space>
                </Card>
                <Card size="small" style={{ flex: 1, minWidth: token.controlHeightLG * 4 }}>
                  <Flex align="center" style={{ height: '100%' }}>
                    <Typography.Text type="secondary">
                      User can switch projects anytime without losing place in the app.
                    </Typography.Text>
                  </Flex>
                </Card>
              </Flex>
            </Flex>
          </Flex>
        </Card>
      );
    }
    return (
      <Card size="small" style={previewCardStyle}>
        <Flex style={{ minHeight: previewHeight }}>
          {renderShellSidebar('catalog')}
          <Flex vertical style={{ flex: 1 }} gap={token.marginLG}>
            <Flex
              justify="space-between"
              align="center"
              style={{
                paddingInline: token.paddingLG,
                paddingBlock: token.paddingSM,
                borderBottom: `${token.lineWidth}px ${token.lineType} ${token.colorBorderSecondary}`,
              }}
            >
              <Select
                size="small"
                value="No project selected"
                style={{ width: token.controlHeight * 5.8 }}
                options={[{ value: 'No project selected', label: 'No project selected' }]}
              />
            </Flex>
            <Flex vertical gap={token.marginMD} style={{ paddingInline: token.paddingLG }}>
              <Space direction="vertical" size={token.marginXXS}>
                <Typography.Text strong style={{ fontSize: token.fontSizeLG }}>
                  Explore mode
                </Typography.Text>
                <Typography.Text type="secondary">User cleared the project from the switcher.</Typography.Text>
                <Typography.Text type="secondary">
                  Catalog and other global modules stay available; project-gated modules show commit flow again if opened without a project.
                </Typography.Text>
              </Space>
              <Card size="small" style={{ borderColor: token.colorSuccess, background: token.colorSuccessBg }}>
                <Flex align="center" gap={token.marginXS}>
                  <CheckCircleOutlined style={{ color: token.colorSuccess }} />
                  <Typography.Text style={{ color: token.colorSuccessText }}>
                    Explore-first loop closed — user can re-enter the flow whenever they add a new working set.
                  </Typography.Text>
                </Flex>
              </Card>
            </Flex>
          </Flex>
        </Flex>
      </Card>
    );
  };

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
            <Typography.Text type="secondary">Proposal · Progressive project commitment</Typography.Text>
            <Typography.Title level={2} style={{ margin: 0 }}>
              Progressive Project Commitment — proposed flow
            </Typography.Title>
            <Typography.Paragraph style={{ margin: 0 }}>
              This page stands alone as a \'proposal\' for ASC ConnectED: start with no project, build a
              temporary working set, require a project only when the workflow needs a container,
              hand selections into that project, then work across modules—or step back to open
              exploration. Product and engineering can adopt, adapt, or challenge any step
              independently.
            </Typography.Paragraph>
            <Flex gap={token.marginSM} wrap="wrap">
              <Tag color="success">Explore — no project</Tag>
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
                <Flex align="center" gap={token.marginSM}>
                  <Tag color="processing">{phase.id}</Tag>
                  <Typography.Text
                    strong
                    style={{ fontSize: token.fontSizeLG, color: token.colorTextHeading }}
                  >
                    {phase.title}
                  </Typography.Text>
                </Flex>
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
                      {renderStepPreview(step.id)}

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
              <Typography.Text strong>Principles for this proposal</Typography.Text>
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
