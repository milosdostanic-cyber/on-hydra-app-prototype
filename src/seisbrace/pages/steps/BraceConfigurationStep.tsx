import { ArrowDownOutlined, ArrowUpOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

import {
  ORIENTATION_OPTIONS,
  PIPE_SIZE_OPTIONS,
  PIPE_TYPE_OPTIONS,
} from '../../constants/options';
import { useSeisBrace } from '../../context/SeisBraceContext';
import { useSeisBraceWizard } from '../../context/SeisBraceWizardContext';
import { WizardFooter } from '../../components/WizardFooter';
import { draftToBraceFields, seismicDesignForce, totalZoiWeight } from '../../utils/draft';
import {
  App,
  Button,
  Card,
  Descriptions,
  Flex,
  InputNumber,
  Select,
  Space,
  Table,
  Typography,
  theme,
  type TableColumnsType,
} from '../../../ui/antd';
import type { BraceOrientation, SegmentRow } from '../../types';

export function BraceConfigurationStep() {
  const { token } = theme.useToken();
  const { message } = App.useApp();
  const navigate = useNavigate();
  const { updateBrace } = useSeisBrace();
  const { draft, patchDraft, markStepReached, goToStep } = useSeisBraceWizard();

  const setSegment = (id: string, patch: Partial<SegmentRow>) => {
    patchDraft({ segments: draft.segments.map((s) => (s.id === id ? { ...s, ...patch } : s)) });
  };

  const addSegment = () => {
    patchDraft({
      segments: [
        ...draft.segments,
        { id: `seg-${Date.now()}`, pipeSize: '2"', pipeType: 'Sch 40', pipeLength: 10, pipeWeight: 5 },
      ],
    });
  };

  const removeSegment = (id: string) => {
    patchDraft({ segments: draft.segments.filter((s) => s.id !== id) });
  };

  const moveSegment = (id: string, dir: 'up' | 'down') => {
    const index = draft.segments.findIndex((s) => s.id === id);
    const target = dir === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= draft.segments.length) return;
    const next = [...draft.segments];
    [next[index], next[target]] = [next[target], next[index]];
    patchDraft({ segments: next });
  };

  const persist = () => {
    if (draft.braceId) updateBrace(draft.braceId, draftToBraceFields(draft, 'INCOMPLETE'));
  };

  const columns: TableColumnsType<SegmentRow> = [
    {
      title: 'Pipe Size',
      dataIndex: 'pipeSize',
      render: (value: string, row) => (
        <Select
          value={value}
          options={PIPE_SIZE_OPTIONS}
          style={{ width: 110 }}
          onChange={(v) => setSegment(row.id, { pipeSize: v })}
        />
      ),
    },
    {
      title: 'Pipe Type',
      dataIndex: 'pipeType',
      render: (value: string, row) => (
        <Select
          value={value}
          options={PIPE_TYPE_OPTIONS}
          style={{ width: 110 }}
          onChange={(v) => setSegment(row.id, { pipeType: v })}
        />
      ),
    },
    {
      title: 'Pipe Length (ft)',
      dataIndex: 'pipeLength',
      render: (value: number, row) => (
        <InputNumber min={0} value={value} onChange={(v) => setSegment(row.id, { pipeLength: v ?? 0 })} />
      ),
    },
    {
      title: 'Pipe Weight (lb/ft)',
      dataIndex: 'pipeWeight',
      render: (value: number, row) => (
        <InputNumber min={0} value={value} onChange={(v) => setSegment(row.id, { pipeWeight: v ?? 0 })} />
      ),
    },
    {
      title: 'Total Weight (lb)',
      key: 'total',
      align: 'right',
      render: (_, row) => (row.pipeLength * row.pipeWeight).toLocaleString(),
    },
    {
      title: '',
      key: 'actions',
      width: 110,
      render: (_, row, index) => (
        <Space size={token.marginXXS}>
          <Button
            type="text"
            size="small"
            icon={<ArrowUpOutlined />}
            disabled={index === 0}
            aria-label="Move up"
            onClick={() => moveSegment(row.id, 'up')}
          />
          <Button
            type="text"
            size="small"
            icon={<ArrowDownOutlined />}
            disabled={index === draft.segments.length - 1}
            aria-label="Move down"
            onClick={() => moveSegment(row.id, 'down')}
          />
          <Button
            type="text"
            size="small"
            danger
            icon={<DeleteOutlined />}
            disabled={draft.segments.length <= 1}
            aria-label="Remove segment"
            onClick={() => removeSegment(row.id)}
          />
        </Space>
      ),
    },
  ];

  const wp = totalZoiWeight(draft);
  const fpw = seismicDesignForce(draft);

  return (
    <Space orientation="vertical" size={token.marginLG} style={{ width: '100%' }}>
      <div>
        <Typography.Title level={4} style={{ margin: 0 }}>
          Define Brace Type and Zone of Influence
        </Typography.Title>
        <Typography.Paragraph type="secondary" style={{ margin: 0 }}>
          Choose the brace orientation, then describe the pipe segments in the zone of influence.
        </Typography.Paragraph>
      </div>

      <Card size="small" title="Brace Orientation">
        <Flex gap={token.marginSM} wrap="wrap">
          {ORIENTATION_OPTIONS.map((opt) => {
            const selected = draft.orientation === opt.value;
            return (
              <div
                key={opt.value}
                role="button"
                tabIndex={0}
                onClick={() => patchDraft({ orientation: opt.value as BraceOrientation })}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') patchDraft({ orientation: opt.value as BraceOrientation });
                }}
                style={{
                  cursor: 'pointer',
                  minWidth: 140,
                  padding: token.padding,
                  borderRadius: token.borderRadiusLG,
                  textAlign: 'center',
                  border: `${token.lineWidth}px ${token.lineType} ${selected ? token.colorPrimary : token.colorBorder}`,
                  background: selected ? token.colorPrimaryBg : token.colorBgContainer,
                }}
              >
                <Typography.Text strong={selected}>{opt.label}</Typography.Text>
              </div>
            );
          })}
        </Flex>
      </Card>

      <Card
        size="small"
        title="Define Your Zone of Influence — Main Line"
        extra={
          <Button type="link" icon={<PlusOutlined />} onClick={addSegment}>
            Add segment
          </Button>
        }
      >
        <Table<SegmentRow>
          rowKey="id"
          size="small"
          columns={columns}
          dataSource={draft.segments}
          pagination={false}
          scroll={{ x: 'max-content' }}
        />
      </Card>

      <Card size="small" style={{ background: token.colorFillQuaternary }}>
        <Descriptions column={{ xs: 1, sm: 2, md: 4 }} size="small">
          <Descriptions.Item label="ZOI System Weight">{wp.toLocaleString()} lb</Descriptions.Item>
          <Descriptions.Item label="Design Weight Wp">{wp.toLocaleString()} lb</Descriptions.Item>
          <Descriptions.Item label="Cp">{draft.cpValue}</Descriptions.Item>
          <Descriptions.Item label="Seismic Force Fpw">{fpw.toLocaleString()} lbf</Descriptions.Item>
        </Descriptions>
      </Card>

      <WizardFooter
        onBack={() => goToStep('seismic-coefficient')}
        onSave={() => {
          persist();
          message.success('Brace saved.');
          navigate('/seisbrace');
        }}
        onNext={() => {
          persist();
          markStepReached(4);
          goToStep('structure-sway-brace');
        }}
      />
    </Space>
  );
}
