import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { BomFlowStepper } from '../components/BomFlowStepper';
import { BomPageHeader } from '../layout/BomPageHeader';
import { bomProjectTitleById } from '../data/mockData';
import { Button, Card, Checkbox, Form, Space, theme, message } from '../../ui/antd';

export function BomExportPage() {
  const { token } = theme.useToken();
  const { bomProjectId = '' } = useParams<{ bomProjectId: string }>();
  const navigate = useNavigate();
  const projectTitle = bomProjectTitleById(bomProjectId) ?? 'BOM project';
  const [formats, setFormats] = useState({ excel: true, csv: false, package: false });

  const submit = () => {
    message.success('Export queued (demo). No file is generated.');
  };

  return (
    <Space orientation="vertical" size={token.marginLG} style={{ width: '100%' }}>
      <BomFlowStepper activeStep={5} projectLabel={projectTitle} />
      <BomPageHeader
        title="Export"
        description={`Choose formats for ${projectTitle}. Demo only — buttons simulate success.`}
      />
      <Card style={{ maxWidth: token.screenSM, borderColor: token.colorBorderSecondary }}>
        <Form layout="vertical" style={{ margin: 0 }}>
        <Form.Item label="Formats">
          <Space orientation="vertical" size={token.marginXS}>
            <Checkbox
              checked={formats.excel}
              onChange={(e) => setFormats((f) => ({ ...f, excel: e.target.checked }))}
            >
              Excel workbook
            </Checkbox>
            <Checkbox
              checked={formats.csv}
              onChange={(e) => setFormats((f) => ({ ...f, csv: e.target.checked }))}
            >
              CSV
            </Checkbox>
            <Checkbox
              checked={formats.package}
              onChange={(e) => setFormats((f) => ({ ...f, package: e.target.checked }))}
            >
              Submittal-style package (stub)
            </Checkbox>
          </Space>
        </Form.Item>
        <Form.Item>
          <Space wrap>
            <Button type="primary" onClick={submit}>
              Run export
            </Button>
            <Button onClick={() => navigate(`/bom/projects/${bomProjectId}/workspace`)}>
              Back to workspace
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
