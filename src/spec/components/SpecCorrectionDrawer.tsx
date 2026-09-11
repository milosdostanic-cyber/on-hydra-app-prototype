import { useEffect } from 'react';

import {
  REQUIREMENT_CATEGORY_ORDER,
  requirementCategoryLabel,
} from '../constants/specStatusVocabulary';
import { useSpecCorrection } from '../hooks/useSpecCorrection';
import type { SpecCorrectionReason, SpecRequirement, SpecRequirementCategory } from '../data/types';
import { trackSpecEvent } from '../specAnalytics';
import {
  Alert,
  App,
  Button,
  Drawer,
  Flex,
  Form,
  Input,
  Select,
  Typography,
  theme,
} from '../../ui/antd';

const REASON_OPTIONS: { value: SpecCorrectionReason; label: string }[] = [
  { value: 'incorrect', label: 'Incorrect value' },
  { value: 'incomplete', label: 'Incomplete' },
  { value: 'wrong-category', label: 'Wrong category' },
  { value: 'duplicate', label: 'Duplicate' },
  { value: 'outdated', label: 'Outdated' },
  { value: 'other', label: 'Other' },
];

type FormValues = {
  nextValue: string;
  nextCategory: SpecRequirementCategory;
  reason: SpecCorrectionReason;
  note?: string;
};

export function SpecCorrectionDrawer({
  open,
  requirement,
  excerpt,
  onClose,
  onSaved,
}: {
  open: boolean;
  requirement: SpecRequirement | null;
  excerpt?: string;
  onClose: () => void;
  onSaved: () => void;
}) {
  const { token } = theme.useToken();
  const { message } = App.useApp();
  const [form] = Form.useForm<FormValues>();
  const { saveCorrection, saving } = useSpecCorrection();

  useEffect(() => {
    if (!open || !requirement) return;
    form.setFieldsValue({
      nextValue: requirement.value,
      nextCategory: requirement.category,
      reason: 'incorrect',
      note: undefined,
    });
    trackSpecEvent('spec_correction_opened', { requirementId: requirement.id });
  }, [open, requirement, form]);

  const handleSave = async () => {
    if (!requirement) return;
    try {
      const values = await form.validateFields();
      await saveCorrection({
        requirementId: requirement.id,
        nextValue: values.nextValue,
        nextCategory: values.nextCategory,
        reason: values.reason,
        note: values.note,
      });
      message.success('Correction saved. The requirement is now marked human verified.');
      onSaved();
      onClose();
    } catch {
      /* validation or save error — Form surfaces field errors */
    }
  };

  return (
    <Drawer
      title="Correct requirement"
      open={open}
      onClose={onClose}
      size={token.controlHeight * 12}
      destroyOnHidden
      extra={
        <Flex gap={token.marginXS}>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="primary" loading={saving} onClick={() => void handleSave()}>
            Save correction
          </Button>
        </Flex>
      }
    >
      {requirement ? (
        <Flex vertical gap={token.marginLG}>
          <Alert
            type="info"
            showIcon
            title="Source stays visible behind this drawer"
            description="Compare your correction with the highlighted citation in the document."
          />

          <div>
            <Typography.Text type="secondary">Extracted value</Typography.Text>
            <Typography.Paragraph delete style={{ marginBottom: token.marginXS }}>
              {requirement.value}
            </Typography.Paragraph>
            {excerpt ? (
              <>
                <Typography.Text type="secondary">Source excerpt</Typography.Text>
                <Typography.Paragraph
                  style={{
                    marginBottom: 0,
                    padding: token.paddingSM,
                    background: token.colorFillQuaternary,
                    borderRadius: token.borderRadiusLG,
                  }}
                >
                  {excerpt}
                </Typography.Paragraph>
              </>
            ) : null}
          </div>

          <Form form={form} layout="vertical" requiredMark="optional">
            <Form.Item
              name="nextValue"
              label="Corrected value"
              rules={[{ required: true, message: 'Enter the corrected value.' }]}
            >
              <Input.TextArea rows={3} />
            </Form.Item>
            <Form.Item
              name="nextCategory"
              label="Category"
              rules={[{ required: true, message: 'Choose a category.' }]}
            >
              <Select
                options={REQUIREMENT_CATEGORY_ORDER.map((c) => ({
                  value: c,
                  label: requirementCategoryLabel[c],
                }))}
              />
            </Form.Item>
            <Form.Item
              name="reason"
              label="Reason"
              rules={[{ required: true, message: 'Choose a reason.' }]}
            >
              <Select options={REASON_OPTIONS} />
            </Form.Item>
            <Form.Item name="note" label="Note (optional)">
              <Input.TextArea rows={2} placeholder="Anything a teammate should know" />
            </Form.Item>
          </Form>
        </Flex>
      ) : null}
    </Drawer>
  );
}
