import { DownloadOutlined, PictureOutlined } from '@ant-design/icons';
import { useMemo } from 'react';
import { useParams } from 'react-router-dom';

import {
  hydraBaseNormal,
  hydraSmallNormal,
  hydraSmallStrong,
  hydraTextStyleToReactCss,
  hydraTitleHeading2,
  hydraTitleHeading4,
} from '../theme/hydraTypography';
import { PageBackButton } from '../shell/PageBackButton';
import {
  App,
  Button,
  Card,
  Col,
  Empty,
  Flex,
  Row,
  Space,
  Table,
  Typography,
  theme,
  type TableColumnsType,
} from '../ui/antd';

import { UnifiedPartActions } from './UnifiedPartActions';
import { partDetailContentFor, type PartVariationRow } from './partDetailDemoData';
import { unifiedPartByKey } from './unifiedSearchData';

function SpecField({ label, value }: { label: string; value: string }) {
  const { token } = theme.useToken();
  return (
    <div style={{ marginBottom: token.marginMD }}>
      <Typography.Text
        type="secondary"
        style={{
          display: 'block',
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
          marginBottom: token.marginXXS,
          ...hydraTextStyleToReactCss(hydraSmallNormal),
        }}
      >
        {label}
      </Typography.Text>
      <Typography.Text style={hydraTextStyleToReactCss(hydraBaseNormal)}>{value}</Typography.Text>
    </div>
  );
}

export function UnifiedPartDetailPage() {
  const { token } = theme.useToken();
  const { message } = App.useApp();
  const { partId } = useParams<{ partId: string }>();

  const part = partId ? unifiedPartByKey(partId) : undefined;
  const detail = useMemo(() => (part ? partDetailContentFor(part) : null), [part]);
  const sku = part?.sku ?? partId ?? '—';
  const partTitle = part?.description ?? `Part ${sku}`;

  const cardShellStyle = {
    background: token.colorBgContainer,
    borderRadius: token.borderRadiusLG,
    border: `${token.lineWidth}px ${token.lineType} ${token.colorBorderSecondary}`,
    boxShadow: token.boxShadowTertiary,
    overflow: 'hidden' as const,
  };

  const cardTitleStyle = {
    margin: 0,
    ...hydraTextStyleToReactCss(hydraTitleHeading4),
  };

  const variationColumns: TableColumnsType<PartVariationRow> = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (name: string) => (
        <Flex align="center" gap={token.marginSM} style={{ minWidth: 0 }}>
          <Flex
            align="center"
            justify="center"
            style={{
              flexShrink: 0,
              width: token.controlHeightLG,
              height: token.controlHeightLG,
              borderRadius: token.borderRadius,
              border: `${token.lineWidth}px ${token.lineType} ${token.colorBorderSecondary}`,
              background: token.colorFillAlter,
              color: token.colorTextQuaternary,
            }}
          >
            <PictureOutlined aria-hidden />
          </Flex>
          <Typography.Text ellipsis={{ tooltip: name }}>{name}</Typography.Text>
        </Flex>
      ),
    },
    {
      title: 'SKU',
      dataIndex: 'sku',
      key: 'sku',
      width: 120,
    },
    {
      title: 'File types',
      dataIndex: 'fileTypes',
      key: 'fileTypes',
      width: 140,
    },
    {
      title: 'Download',
      key: 'download',
      width: 96,
      align: 'center',
      render: (_, row) => (
        <Button
          type="text"
          icon={<DownloadOutlined />}
          aria-label={`Download ${row.sku}`}
          onClick={() => message.info(`Download queued for ${row.sku} (stub).`)}
        />
      ),
    },
  ];

  return (
    <Space orientation="vertical" size={token.marginLG} style={{ width: '100%' }}>
      <PageBackButton to="/dashboard">Back to home</PageBackButton>

      {/* Header: title stack + actions (left) · product image (right) */}
      <Flex align="flex-start" justify="space-between" gap={token.marginLG} wrap="wrap">
        <Flex vertical gap={token.marginSM} style={{ flex: '1 1 320px', minWidth: 0 }}>
          <Typography.Title level={2} style={{ margin: 0, ...hydraTextStyleToReactCss(hydraTitleHeading2) }}>
            {partTitle}
          </Typography.Title>
          <Typography.Text strong style={hydraTextStyleToReactCss(hydraSmallStrong)}>
            {sku}
          </Typography.Text>
          {part ? <UnifiedPartActions part={part} /> : null}
        </Flex>

        <Card
          styles={{ body: { padding: token.padding } }}
          style={{
            ...cardShellStyle,
            flex: '0 0 auto',
            width: 280,
            maxWidth: '100%',
          }}
        >
          <Flex
            align="center"
            justify="center"
            style={{
              width: '100%',
              aspectRatio: '1',
              borderRadius: token.borderRadius,
              background: token.colorFillAlter,
              color: token.colorTextQuaternary,
            }}
          >
            <Space orientation="vertical" align="center" size={token.marginXS}>
              <PictureOutlined style={{ fontSize: token.fontSizeHeading2 }} />
              <Typography.Text type="secondary" style={hydraTextStyleToReactCss(hydraSmallNormal)}>
                Product image
              </Typography.Text>
            </Space>
          </Flex>
        </Card>
      </Flex>

      {!part ? (
        <Empty description="This part is not in the demo catalog. Try another result from search." />
      ) : detail ? (
        <>
          {/* Product description */}
          <Card
            title={<Typography.Text style={cardTitleStyle}>Product description</Typography.Text>}
            styles={{ header: { borderBottom: `${token.lineWidth}px ${token.lineType} ${token.colorBorderSecondary}` } }}
            style={cardShellStyle}
          >
            <Typography.Paragraph style={{ marginBottom: token.marginLG, ...hydraTextStyleToReactCss(hydraBaseNormal) }}>
              {detail.description}
            </Typography.Paragraph>
            <Typography.Text strong style={{ display: 'block', marginBottom: token.marginXS, ...hydraTextStyleToReactCss(hydraSmallStrong) }}>
              Regulatory
            </Typography.Text>
            <Typography.Paragraph style={{ margin: 0, ...hydraTextStyleToReactCss(hydraBaseNormal) }}>
              {detail.regulatory}
            </Typography.Paragraph>
          </Card>

          {/* Sizes & variations table */}
          <Card
            title={<Typography.Text style={cardTitleStyle}>Available sizes &amp; variations</Typography.Text>}
            styles={{
              header: { borderBottom: `${token.lineWidth}px ${token.lineType} ${token.colorBorderSecondary}` },
              body: { padding: 0 },
            }}
            style={cardShellStyle}
          >
            <Typography.Paragraph
              type="secondary"
              style={{
                margin: 0,
                padding: `${token.paddingSM}px ${token.paddingLG}px`,
                borderBottom: `${token.lineWidth}px ${token.lineType} ${token.colorBorderSecondary}`,
                ...hydraTextStyleToReactCss(hydraSmallNormal),
              }}
            >
              Download cut sheets and CAD for each listed configuration.
            </Typography.Paragraph>
            <Table<PartVariationRow>
              rowKey="key"
              size="middle"
              columns={variationColumns}
              dataSource={detail.variations}
              pagination={false}
              styles={{
                header: {
                  cell: {
                    background: token.colorFillAlter,
                    borderBottomColor: token.colorBorderSecondary,
                    fontWeight: token.fontWeightStrong,
                  },
                },
                body: { cell: { borderBottomColor: token.colorBorderSecondary } },
              }}
            />
          </Card>

          {/* Technical specifications grid */}
          <Card
            title={
              <Typography.Text style={cardTitleStyle}>
                Part information &amp; technical specifications
              </Typography.Text>
            }
            styles={{ header: { borderBottom: `${token.lineWidth}px ${token.lineType} ${token.colorBorderSecondary}` } }}
            style={cardShellStyle}
          >
            <Row gutter={[token.marginLG, token.marginSM]}>
              {detail.specifications.map((field) => (
                <Col key={field.key} xs={24} sm={12} md={8}>
                  <SpecField label={field.label} value={field.value} />
                </Col>
              ))}
            </Row>
          </Card>
        </>
      ) : null}
    </Space>
  );
}
