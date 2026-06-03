import { useNavigate } from 'react-router-dom';

import {
  BRACE_ANGLE_OPTIONS,
  BRACE_MEMBER_OPTIONS,
  FASTENER_ORIENTATION_OPTIONS,
  FASTENER_OPTIONS,
  FASTENER_SIZE_OPTIONS,
  STRUCTURE_OPTIONS,
  SUBSTRATE_OPTIONS,
} from '../../constants/options';
import { useSeisBrace } from '../../context/SeisBraceContext';
import { useSeisBraceWizard } from '../../context/SeisBraceWizardContext';
import { WizardFooter } from '../../components/WizardFooter';
import { draftToBraceFields } from '../../utils/draft';
import {
  App,
  Card,
  Col,
  Descriptions,
  Input,
  InputNumber,
  Row,
  Select,
  Space,
  Typography,
  theme,
} from '../../../ui/antd';

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  const { token } = theme.useToken();
  return (
    <div style={{ marginBottom: token.marginSM }}>
      <Typography.Text type="secondary" style={{ display: 'block', marginBottom: token.marginXXS }}>
        {label}
      </Typography.Text>
      {children}
    </div>
  );
}

export function StructureAndSwayBraceStep() {
  const { token } = theme.useToken();
  const { message } = App.useApp();
  const navigate = useNavigate();
  const { updateBrace } = useSeisBrace();
  const { draft, patchDraft, markStepReached, goToStep } = useSeisBraceWizard();

  const structureChoice = draft.isStructureUserDefined ? 'USER_DEFINED' : draft.structure;
  const fastenerChoice = draft.isFastenerUserDefined ? 'USER_DEFINED' : draft.fastener;

  const onStructureChoice = (value: string) => {
    if (value === 'USER_DEFINED') patchDraft({ isStructureUserDefined: true, structure: '' });
    else patchDraft({ isStructureUserDefined: false, structure: value });
  };

  const onFastenerChoice = (value: string) => {
    if (value === 'USER_DEFINED') patchDraft({ isFastenerUserDefined: true, fastener: '' });
    else patchDraft({ isFastenerUserDefined: false, fastener: value });
  };

  const persist = () => {
    if (draft.braceId) updateBrace(draft.braceId, draftToBraceFields(draft, 'INCOMPLETE'));
  };

  return (
    <Space orientation="vertical" size={token.marginLG} style={{ width: '100%' }}>
      <div>
        <Typography.Title level={4} style={{ margin: 0 }}>
          Structure &amp; Sway Brace
        </Typography.Title>
        <Typography.Paragraph type="secondary" style={{ margin: 0 }}>
          Define the supporting structure, the fastener, and the brace member.
        </Typography.Paragraph>
      </div>

      <Row gutter={token.marginLG} style={{ maxWidth: 880 }}>
        <Col xs={24} md={12}>
          <Card size="small" title="Structure" style={{ height: '100%' }}>
            <Field label="Structure:">
              <Select
                value={structureChoice}
                options={STRUCTURE_OPTIONS}
                style={{ width: '100%' }}
                onChange={onStructureChoice}
              />
            </Field>
            {draft.isStructureUserDefined ? (
              <Field label="Custom Structure:">
                <Input
                  value={draft.structure}
                  placeholder="Describe the structure"
                  onChange={(e) => patchDraft({ structure: e.target.value })}
                />
              </Field>
            ) : (
              <Field label="Substrate:">
                <Select
                  value={draft.substrate}
                  options={SUBSTRATE_OPTIONS}
                  style={{ width: '100%' }}
                  onChange={(v) => patchDraft({ substrate: v })}
                />
              </Field>
            )}
          </Card>
        </Col>

        <Col xs={24} md={12}>
          <Card size="small" title="Fastener" style={{ height: '100%' }}>
            <Field label="Fastener:">
              <Select
                value={fastenerChoice}
                options={FASTENER_OPTIONS}
                style={{ width: '100%' }}
                onChange={onFastenerChoice}
              />
            </Field>
            {draft.isFastenerUserDefined ? (
              <Field label="Enter Fastener Name:">
                <Input
                  value={draft.fastener}
                  placeholder="Fastener name"
                  onChange={(e) => patchDraft({ fastener: e.target.value })}
                />
              </Field>
            ) : null}
            <Row gutter={token.marginSM}>
              <Col span={12}>
                <Field label="Orientation:">
                  <Select
                    value={draft.fastenerOrientation}
                    options={FASTENER_ORIENTATION_OPTIONS}
                    style={{ width: '100%' }}
                    onChange={(v) => patchDraft({ fastenerOrientation: v })}
                  />
                </Field>
              </Col>
              <Col span={12}>
                <Field label="Size:">
                  <Select
                    value={draft.fastenerSize}
                    options={FASTENER_SIZE_OPTIONS}
                    style={{ width: '100%' }}
                    onChange={(v) => patchDraft({ fastenerSize: v })}
                  />
                </Field>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      <Card size="small" title="Brace Type" style={{ maxWidth: 880 }}>
        <Row gutter={token.marginSM}>
          <Col xs={12} sm={6}>
            <Field label="Brace Angle Min:">
              <Select
                value={draft.braceAngleMin}
                options={BRACE_ANGLE_OPTIONS}
                style={{ width: '100%' }}
                onChange={(v) => patchDraft({ braceAngleMin: v })}
              />
            </Field>
          </Col>
          <Col xs={12} sm={6}>
            <Field label="Brace Angle Max:">
              <Select
                value={draft.braceAngleMax}
                options={BRACE_ANGLE_OPTIONS}
                style={{ width: '100%' }}
                onChange={(v) => patchDraft({ braceAngleMax: v })}
              />
            </Field>
          </Col>
          <Col xs={12} sm={6}>
            <Field label="L/R max:">
              <InputNumber
                value={draft.lrMax}
                min={0}
                style={{ width: '100%' }}
                onChange={(v) => patchDraft({ lrMax: v ?? 0 })}
              />
            </Field>
          </Col>
          <Col xs={24} sm={6}>
            <Field label="Brace Member:">
              <Select
                value={draft.braceMember}
                options={BRACE_MEMBER_OPTIONS}
                style={{ width: '100%' }}
                onChange={(v) => patchDraft({ braceMember: v })}
              />
            </Field>
          </Col>
        </Row>
      </Card>

      <Card size="small" title="Summary" style={{ maxWidth: 880, background: token.colorFillQuaternary }}>
        <Descriptions column={{ xs: 1, sm: 2 }} size="small">
          <Descriptions.Item label="Structure">
            {draft.isStructureUserDefined ? `*${draft.structure || '—'}` : draft.structure}
          </Descriptions.Item>
          <Descriptions.Item label="Fastener">
            {draft.isFastenerUserDefined ? `*${draft.fastener || '—'}` : draft.fastener}
          </Descriptions.Item>
          <Descriptions.Item label="Brace angle">
            {draft.braceAngleMin}°–{draft.braceAngleMax}°
          </Descriptions.Item>
          <Descriptions.Item label="Brace member">{draft.braceMember}</Descriptions.Item>
        </Descriptions>
      </Card>

      <WizardFooter
        onBack={() => goToStep('brace-type')}
        onSave={() => {
          persist();
          message.success('Brace saved.');
          navigate('/seisbrace');
        }}
        onNext={() => {
          persist();
          markStepReached(5);
          goToStep('parts-selection');
        }}
      />
    </Space>
  );
}
