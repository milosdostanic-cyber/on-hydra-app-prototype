import { CheckCircleOutlined, TableOutlined, UnorderedListOutlined } from '@ant-design/icons';

import type { MatchingReviewSummary } from '../bomMatchingReviewStatus';
import {
  hydraBaseNormal,
  hydraLargeStrong,
  hydraTextStyleToReactCss,
  hydraTitleHeading4,
} from '../../theme/hydraTypography';
import { Button, Card, Flex, Space, Typography, theme } from '../../ui/antd';

type BomGuidedReviewCompletePanelProps = {
  projectTitle: string;
  summary: MatchingReviewSummary;
  onContinueToSummary: () => void;
  onReviewSkipped: () => void;
};

export function BomGuidedReviewCompletePanel({
  projectTitle,
  summary,
  onContinueToSummary,
  onReviewSkipped,
}: BomGuidedReviewCompletePanelProps) {
  const { token } = theme.useToken();
  const readyCount = summary.confirmed + summary.chosen;
  const hasSkipped = summary.skipped > 0;

  const statCardStyle = (accentColor: string) => ({
    flex: 1,
    minWidth: 140,
    padding: token.paddingMD,
    borderRadius: token.borderRadiusLG,
    background: token.colorBgContainer,
    border: 'none',
    borderLeft: `${token.sizeUnit}px solid ${accentColor}`,
    boxShadow: token.boxShadowTertiary,
  });

  return (
    <Card
      style={{
        borderColor: token.colorSuccessBorder,
        background: token.colorBgContainer,
      }}
      styles={{ body: { padding: token.paddingMD } }}
    >
      <Flex vertical gap={token.marginMD} style={{ width: '100%' }}>
        <Flex align="flex-start" gap={token.marginMD}>
          <CheckCircleOutlined
            style={{ fontSize: token.fontSizeHeading2, color: token.colorSuccess, marginTop: token.marginXXS }}
          />
          <Space orientation="vertical" size={token.marginXS} style={{ flex: 1 }}>
            <Typography.Title level={4} style={{ margin: 0, ...hydraTextStyleToReactCss(hydraTitleHeading4) }}>
              You&apos;re done reviewing every line
            </Typography.Title>
            <Typography.Text style={hydraTextStyleToReactCss(hydraLargeStrong)}>
              {readyCount} part{readyCount !== 1 ? 's' : ''} ready to import into {projectTitle}.
            </Typography.Text>
            <Typography.Text type="secondary" style={hydraTextStyleToReactCss(hydraBaseNormal)}>
              {hasSkipped
                ? `${summary.skipped} line${summary.skipped !== 1 ? 's were' : ' was'} skipped and will not be added to your BOM.`
                : 'Every line from your file has a match decision.'}
            </Typography.Text>
          </Space>
        </Flex>

        <Flex gap={token.marginMD} wrap="wrap">
          <Flex vertical gap={token.marginXXS} style={statCardStyle(token.colorSuccessBorder)}>
            <Typography.Text type="secondary" style={hydraTextStyleToReactCss(hydraBaseNormal)}>
              Ready to import
            </Typography.Text>
            <Typography.Text style={hydraTextStyleToReactCss(hydraTitleHeading4)}>{readyCount}</Typography.Text>
          </Flex>
          <Flex vertical gap={token.marginXXS} style={statCardStyle(token.colorWarning)}>
            <Typography.Text type="secondary" style={hydraTextStyleToReactCss(hydraBaseNormal)}>
              Skipped
            </Typography.Text>
            <Typography.Text style={hydraTextStyleToReactCss(hydraTitleHeading4)}>{summary.skipped}</Typography.Text>
          </Flex>
          <Flex vertical gap={token.marginXXS} style={statCardStyle(token.colorPrimary)}>
            <Typography.Text type="secondary" style={hydraTextStyleToReactCss(hydraBaseNormal)}>
              Total in file
            </Typography.Text>
            <Typography.Text style={hydraTextStyleToReactCss(hydraTitleHeading4)}>{summary.total}</Typography.Text>
          </Flex>
        </Flex>

        <Flex gap={token.marginSM} wrap="wrap" align="center">
          <Button type="primary" size="large" icon={<TableOutlined />} onClick={onContinueToSummary}>
            Continue to import summary
          </Button>
          {hasSkipped ? (
            <Button size="large" icon={<UnorderedListOutlined />} onClick={onReviewSkipped}>
              Review {summary.skipped} skipped line{summary.skipped !== 1 ? 's' : ''}
            </Button>
          ) : null}
        </Flex>
      </Flex>
    </Card>
  );
}
