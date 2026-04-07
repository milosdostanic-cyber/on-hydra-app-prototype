import { useNavigate, useParams } from 'react-router-dom';

import { BomCardTitle } from '../components/BomCardTitle';
import { BomPageHeader } from '../layout/BomPageHeader';
import { bomItemById, bomProjectTitleById, matchResultForItem } from '../data/mockData';
import { BomRiskTag } from '../components/BomTags';
import {
  Button,
  Card,
  Descriptions,
  List,
  Progress,
  Space,
  Typography,
  theme,
} from '../../ui/antd';

export function BomRecommendPage() {
  const { token } = theme.useToken();
  const { bomProjectId = '', itemId = '' } = useParams<{
    bomProjectId: string;
    itemId: string;
  }>();
  const navigate = useNavigate();
  const item = bomItemById(itemId);
  const match = matchResultForItem(itemId);
  const projectTitle = bomProjectTitleById(bomProjectId) ?? 'BOM project';
  const top = match?.topMatch;

  if (!item || !match || !top) {
    return (
      <Space orientation="vertical" size={token.margin}>
        <BomPageHeader title="Recommendation unavailable" description="Missing demo data for this line." />
      </Space>
    );
  }

  return (
    <Space orientation="vertical" size={token.marginLG} style={{ width: '100%' }}>
      <BomPageHeader
        title="Recommended result"
        description={`This is the catalog match we suggest after your answers. Review confidence and substitution risk, then send the line to your workspace. Project ${projectTitle}, line ${item.rowNumber}.`}
      />
      <Card styles={{ body: { padding: token.paddingLG } }}>
        <Descriptions title={top.partNumber} bordered column={1} size="small">
          <Descriptions.Item label="Description">{top.description}</Descriptions.Item>
          <Descriptions.Item label="Family">{top.productFamily}</Descriptions.Item>
          <Descriptions.Item label="Dimensions">{top.dimensions}</Descriptions.Item>
          <Descriptions.Item label="Pressure">{top.pressureRating}</Descriptions.Item>
          <Descriptions.Item label="Connection">{top.connectionType}</Descriptions.Item>
          <Descriptions.Item label="Match confidence">
            <Progress percent={top.matchConfidence} />
          </Descriptions.Item>
          <Descriptions.Item label="Substitution risk">
            <BomRiskTag risk={top.substitutionRisk} />
          </Descriptions.Item>
          <Descriptions.Item label="Conversion rule">{top.conversionRule}</Descriptions.Item>
        </Descriptions>
      </Card>
      <Card
        title={<BomCardTitle>Attribute mapping</BomCardTitle>}
        size="small"
        style={{ borderColor: token.colorBorderSecondary }}
      >
        <Space orientation="vertical" size={token.marginSM} style={{ width: '100%' }}>
          <div>
            <Typography.Text strong>Matched attributes</Typography.Text>
            <List
              size="small"
              dataSource={top.matchedAttributes}
              renderItem={(text) => <List.Item>{text}</List.Item>}
            />
          </div>
          <div>
            <Typography.Text type="secondary">Ignored attributes</Typography.Text>
            <List
              size="small"
              dataSource={top.ignoredAttributes}
              renderItem={(text) => <List.Item>{text}</List.Item>}
            />
          </div>
        </Space>
      </Card>
      <Space wrap>
        <Button type="primary" onClick={() => navigate(`/bom/projects/${bomProjectId}/workspace`)}>
          Confirm and go to workspace
        </Button>
        <Button onClick={() => navigate(`/bom/projects/${bomProjectId}/items/${itemId}/narrow`)}>
          Adjust answers
        </Button>
      </Space>
    </Space>
  );
}
