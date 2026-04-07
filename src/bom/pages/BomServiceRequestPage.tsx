import { Link, useNavigate, useParams } from 'react-router-dom';

import { BomPageHeader } from '../layout/BomPageHeader';
import { bomProjectTitleById } from '../data/mockData';
import { Button, Card, Form, Input, Space, theme, message } from '../../ui/antd';

const { TextArea } = Input;

export function BomServiceRequestPage() {
  const { token } = theme.useToken();
  const { bomProjectId = '' } = useParams<{ bomProjectId: string }>();
  const navigate = useNavigate();
  const projectTitle = bomProjectTitleById(bomProjectId) ?? 'BOM project';

  const onFinish = () => {
    message.success('Service request recorded (demo).');
    navigate(`/bom/projects/${bomProjectId}/workspace`);
  };

  return (
    <Space orientation="vertical" size={token.marginLG} style={{ width: '100%' }}>
      <BomPageHeader
        title="Service request"
        description={`Optional: ask a specialist to double-check substitutions or odd lines. Submitting here is a demo only. Project: ${projectTitle}.`}
      />
      <Card style={{ maxWidth: token.screenSM, borderColor: token.colorBorderSecondary }}>
        <Form layout="vertical" style={{ margin: 0 }} onFinish={onFinish}>
        <Form.Item
          label="Notes for the team"
          name="notes"
          rules={[{ required: true, message: 'Add a short note' }]}
        >
          <TextArea rows={4} placeholder="Context, deadlines, or questions…" />
        </Form.Item>
        <Form.Item>
          <Space wrap>
            <Button type="primary" htmlType="submit">
              Submit request
            </Button>
            <Button onClick={() => navigate(`/bom/projects/${bomProjectId}/workspace`)}>
              Go to workspace
            </Button>
            <Link to="/bom">
              <Button>BOM home</Button>
            </Link>
          </Space>
        </Form.Item>
      </Form>
      </Card>
    </Space>
  );
}
