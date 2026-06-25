import { CheckCircleFilled } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

import { PIPE_ATTACHMENTS, STRUCTURAL_ATTACHMENTS, SWIVEL_TYPES } from '../../data/partsCatalog';
import { useSeisBrace } from '../../context/SeisBraceContext';
import { useSeisBraceWizard } from '../../context/SeisBraceWizardContext';
import { WizardFooter } from '../../components/WizardFooter';
import { PageDescription } from '../../../shell/PageDescription';
import { draftToBraceFields } from '../../utils/draft';
import {
  App,
  Card,
  Flex,
  Radio,
  Space,
  Table,
  Typography,
  theme,
  type TableColumnsType,
} from '../../../ui/antd';
import type { PipeAttachment, StructuralAttachment, SwivelType } from '../../types';

export function PartsSelectionStep() {
  const { token } = theme.useToken();
  const { message } = App.useApp();
  const navigate = useNavigate();
  const { updateBrace } = useSeisBrace();
  const { draft, patchDraft, goToStep } = useSeisBraceWizard();

  const selectableCard = (
    selected: boolean,
    onSelect: () => void,
    title: string,
    lines: string[],
  ) => (
    <div
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') onSelect();
      }}
      style={{
        position: 'relative',
        cursor: 'pointer',
        flex: '1 1 200px',
        minWidth: 200,
        padding: token.padding,
        borderRadius: token.borderRadiusLG,
        border: `${token.lineWidth}px ${token.lineType} ${selected ? token.colorPrimary : token.colorBorder}`,
        background: selected ? token.colorPrimaryBg : token.colorBgContainer,
        boxShadow: selected ? token.boxShadowTertiary : 'none',
      }}
    >
      {selected ? (
        <CheckCircleFilled
          style={{ position: 'absolute', top: token.paddingXS, right: token.paddingXS, color: token.colorPrimary }}
        />
      ) : null}
      <Typography.Text strong style={{ display: 'block' }}>
        {title}
      </Typography.Text>
      {lines.map((line) => (
        <Typography.Text key={line} type="secondary" style={{ display: 'block' }}>
          {line}
        </Typography.Text>
      ))}
    </div>
  );

  const structuralColumns: TableColumnsType<StructuralAttachment> = [
    {
      title: '',
      key: 'select',
      width: 48,
      render: (_, row) => <Radio checked={draft.structuralAttachmentId === row.id} />,
    },
    { title: 'Attachment', dataIndex: 'name', ellipsis: true },
    { title: 'Fastener fig.', dataIndex: 'fastenerFigure', width: 130 },
    {
      title: 'Fastener load',
      dataIndex: 'fastenerLoadCapacity',
      width: 120,
      render: (v: number) => `${v.toLocaleString()} lbf`,
    },
    {
      title: 'Structural capacity',
      dataIndex: 'structuralAttachmentCapacity',
      width: 150,
      render: (v: number) => `${v.toLocaleString()} lbf`,
    },
    { title: 'Min slab', dataIndex: 'minSlabThickness', width: 100 },
  ];

  const finish = () => {
    if (draft.braceId) updateBrace(draft.braceId, draftToBraceFields(draft, 'COMPLETE'));
    message.success('Brace configuration completed.');
    navigate('/seisbrace');
  };

  const save = () => {
    if (draft.braceId) updateBrace(draft.braceId, draftToBraceFields(draft, 'INCOMPLETE'));
    message.success('Brace saved.');
    navigate('/seisbrace');
  };

  return (
    <Space orientation="vertical" size={token.marginLG} style={{ width: '100%' }}>
      <div>
        <Typography.Title level={4} style={{ margin: 0 }}>
          Parts Selection
        </Typography.Title>
        <PageDescription>
          Select the swivel fitting, structural attachment, and pipe attachment for this brace.
        </PageDescription>
      </div>

      <Card size="small" title="Sway Brace Structural Fitting (Swivel)">
        <Flex gap={token.marginSM} wrap="wrap">
          {SWIVEL_TYPES.map((swivel: SwivelType) =>
            selectableCard(
              draft.swivelTypeId === swivel.id,
              () => patchDraft({ swivelTypeId: swivel.id }),
              `${swivel.figureNumber} — ${swivel.name}`,
              [
                `Listed load: ${swivel.listedLoadRating.toLocaleString()} lbf`,
                `Adjusted load: ${swivel.adjustedLoadRating.toLocaleString()} lbf`,
              ],
            ),
          )}
        </Flex>
      </Card>

      <Card size="small" title="Structural Attachments">
        <Table<StructuralAttachment>
          rowKey="id"
          size="small"
          columns={structuralColumns}
          dataSource={STRUCTURAL_ATTACHMENTS}
          pagination={false}
          scroll={{ x: 'max-content' }}
          onRow={(row) => ({
            onClick: () => patchDraft({ structuralAttachmentId: row.id }),
            style: { cursor: 'pointer' },
          })}
        />
      </Card>

      <Card size="small" title="Sway Brace Fitting (Pipe Attachment)">
        <Flex gap={token.marginSM} wrap="wrap">
          {PIPE_ATTACHMENTS.map((pipe: PipeAttachment) =>
            selectableCard(
              draft.pipeAttachmentId === pipe.id,
              () => patchDraft({ pipeAttachmentId: pipe.id }),
              `${pipe.figureNumber} — ${pipe.name}`,
              [`Size: ${pipe.size}`, `Capacity: ${pipe.capacity.toLocaleString()} lbf`],
            ),
          )}
        </Flex>
      </Card>

      <WizardFooter
        onBack={() => goToStep('structure-sway-brace')}
        onSave={save}
        onNext={finish}
        nextLabel="Finish"
      />
    </Space>
  );
}
