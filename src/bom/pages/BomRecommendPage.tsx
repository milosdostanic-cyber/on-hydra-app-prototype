import { useNavigate, useParams } from 'react-router-dom';

import { BomCardTitle } from '../components/BomCardTitle';
import { BomPageHeader } from '../layout/BomPageHeader';
import { bomItemById, bomProjectTitleById, matchResultForItem } from '../data/mockData';
import { BomRiskTag } from '../components/BomTags';
import {
  Alert,
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
  const lowConfidence = top && top.matchConfidence < 30;

  if (!item || !match) {
    return (
      <Space orientation="vertical" size={token.marginLG} style={{ width: '100%' }}>
        <BomPageHeader
          title="Recommendation unavailable"
          description="Missing match data for this line."
          actions={
            <Button type="primary" size="large" onClick={() => navigate(`/bom/projects/${bomProjectId}/matching`)}>
              Back to matching
            </Button>
          }
        />
      </Space>
    );
  }

  return (
    <Space orientation="vertical" size={token.marginLG} style={{ width: '100%' }}>
      <BomPageHeader
        title="Recommended result"
        description={`Project ${projectTitle}, line ${item.rowNumber}.`}
        actions={
          top ? (
            <Space wrap>
              <Button type="primary" size="large" onClick={() => navigate(`/bom/projects/${bomProjectId}/workspace`)}>
                Confirm and go to workspace
              </Button>
              <Button size="large" onClick={() => navigate(`/bom/projects/${bomProjectId}/asc-products`)}>
                Try different product
              </Button>
            </Space>
          ) : (
            <Space wrap>
              <Button type="primary" size="large" onClick={() => navigate(`/bom/projects/${bomProjectId}/asc-products`)}>
                Browse products
              </Button>
              <Button size="large" onClick={() => navigate(`/bom/projects/${bomProjectId}/items/${itemId}/narrow`)}>
                Adjust answers
              </Button>
            </Space>
          )
        }
      />

      {lowConfidence ? (
        <Alert
          type="warning"
          showIcon
          message={`Low confidence (${top?.matchConfidence}%)`}
          description="Consider browsing products manually before confirming."
        />
      ) : null}

      {!top ? (
        <Card>
          <Space orientation="vertical" size={token.marginSM}>
            <Typography.Text>
              No suitable match was found. Try adjusting your answers or browse products manually.
            </Typography.Text>
            <Button
              onClick={() =>
                navigate(`/bom/projects/${bomProjectId}/workspace`, {
                  state: { highlightNeedsReview: true },
                })
              }
            >
              Skip (workspace)
            </Button>
          </Space>
        </Card>
      ) : (
        <>
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
            <Button onClick={() => navigate(`/bom/projects/${bomProjectId}/items/${itemId}/narrow`)}>
              Adjust answers
            </Button>
            <Button
              onClick={() =>
                navigate(`/bom/projects/${bomProjectId}/workspace`, {
                  state: { highlightNeedsReview: true },
                })
              }
            >
              Skip (accept as-is in workspace)
            </Button>
          </Space>
        </>
      )}
    </Space>
  );
}
