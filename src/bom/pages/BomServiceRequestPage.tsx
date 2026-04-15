import { Link, useNavigate, useParams } from 'react-router-dom';
import { useState } from 'react';

import { useActiveProject } from '../../context/ActiveProjectContext';
import { BomPageHeader } from '../layout/BomPageHeader';
import { bomProjectById, bomProjectTitleById } from '../data/mockData';
import {
  Button,
  Card,
  Form,
  Input,
  Select,
  Space,
  Typography,
  Upload,
  theme,
  message,
} from '../../ui/antd';

const { TextArea } = Input;

export function BomServiceRequestPage() {
  const { token } = theme.useToken();
  const { bomProjectId = '' } = useParams<{ bomProjectId: string }>();
  const navigate = useNavigate();
  const { project } = useActiveProject();
  const projectTitle = bomProjectTitleById(bomProjectId) ?? 'BOM project';
  const meta = bomProjectById(bomProjectId);
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm();

  const onFinish = () => {
    setSubmitting(true);
    window.setTimeout(() => {
      setSubmitting(false);
      message.success('Service request submitted successfully.');
      window.setTimeout(() => navigate(`/bom/projects/${bomProjectId}/workspace`), 1600);
    }, 1200);
  };

  return (
    <Space orientation="vertical" size={token.marginLG} style={{ width: '100%' }}>
      <BomPageHeader
        title="Service request"
        description={`Ask ASC specialists for help with substitutions or difficult lines. Project: ${projectTitle}.`}
        actions={
          <Space wrap>
            <Button size="large" onClick={() => navigate(`/bom/projects/${bomProjectId}/workspace`)}>
              Back to workspace
            </Button>
            <Button type="primary" size="large" loading={submitting} onClick={() => form.submit()}>
              Submit request
            </Button>
          </Space>
        }
      />
      <Card style={{ maxWidth: token.screenMD, borderColor: token.colorBorderSecondary }}>
        <Typography.Paragraph type="secondary">
          Construction project: {project?.name ?? '—'} · {project?.city ?? ''}, {project?.state ?? ''}
        </Typography.Paragraph>
        <Form
          key={bomProjectId}
          layout="vertical"
          form={form}
          onFinish={onFinish}
          initialValues={{
            contactName: '',
            email: '',
            phone: '',
            urgency: 'normal',
            projectLabel: projectTitle,
          }}
        >
          <Form.Item
            label="Contact name"
            name="contactName"
            rules={[{ required: true, message: 'Enter your name' }]}
          >
            <Input placeholder="Your name" />
          </Form.Item>
          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: 'Enter your email' },
              { type: 'email', message: 'Enter a valid email address' },
            ]}
          >
            <Input placeholder="you@company.com" />
          </Form.Item>
          <Form.Item label="Phone" name="phone" rules={[{ required: true, message: 'Enter a phone number' }]}>
            <Input placeholder="+1 …" />
          </Form.Item>
          <Form.Item label="BOM project" name="projectLabel">
            <Input disabled />
          </Form.Item>
          {meta ? (
            <Typography.Paragraph type="secondary" style={{ marginTop: 0 }}>
              {meta.name} · {meta.items} items · {meta.status}
            </Typography.Paragraph>
          ) : null}
          <Form.Item label="Urgency" name="urgency">
            <Select
              options={[
                { value: 'normal', label: 'Normal' },
                { value: 'urgent', label: 'Urgent' },
                { value: 'critical', label: 'Critical' },
              ]}
            />
          </Form.Item>
          <Form.Item
            label="Notes"
            name="notes"
            rules={[{ required: true, message: 'Add context for the team' }]}
          >
            <TextArea rows={4} placeholder="Deadlines, risk areas, or questions…" />
          </Form.Item>
          <Form.Item label="Attachments" name="attachments" valuePropName="fileList" getValueFromEvent={(e) => e?.fileList}>
            <Upload beforeUpload={() => false} maxCount={3} listType="text">
              <Button>Upload files</Button>
            </Upload>
          </Form.Item>
          <Typography.Text type="secondary" style={{ fontSize: token.fontSizeSM }}>
            <Link to="/bom">BOM home</Link>
          </Typography.Text>
        </Form>
      </Card>
    </Space>
  );
}
