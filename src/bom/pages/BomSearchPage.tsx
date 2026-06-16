import { SearchOutlined } from '@ant-design/icons';
import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { BomCardTitle } from '../components/BomCardTitle';
import { BomPageHeader } from '../layout/BomPageHeader';
import { useBomHubPath } from '../../context/ActiveProjectContext';
import { PageBackButton } from '../../shell/PageBackButton';
import { AppSearchInput, Button, Card, Flex, Radio, Space, Typography, message, theme } from '../../ui/antd';

type BomSearchMode = 'competitor' | 'asc';

function parseSearchMode(raw: string | null): BomSearchMode {
  return raw === 'asc' ? 'asc' : 'competitor';
}

export function BomSearchPage() {
  const { token } = theme.useToken();
  const navigate = useNavigate();
  const bomHubPath = useBomHubPath();
  const [searchParams] = useSearchParams();
  const [mode, setMode] = useState<BomSearchMode>(() => parseSearchMode(searchParams.get('mode')));
  const [q, setQ] = useState(searchParams.get('q') ?? '');

  const competitorExamples = [
    '005 FireLock coupling 4 inch grooved',
    'Victaulic grooved coupling',
    'Tyco sprinkler head 155F',
  ];
  const ascExamples = ['FP7450', '4371000570', 'Standard response sprinkler'];

  const exampleQueries = mode === 'asc' ? ascExamples : competitorExamples;

  const runSearch = () => {
    if (!q.trim()) {
      message.warning('Enter a search term');
      return;
    }
    const encoded = encodeURIComponent(q.trim());
    if (mode === 'asc') {
      navigate(`/catalog/results?q=${encoded}`);
      return;
    }
    navigate(`/bom/search/results?q=${encoded}`);
  };

  const pageTitle =
    mode === 'asc' ? 'Search ASC catalog parts' : 'Search for a competitor or unknown part';

  const pageDescription =
    mode === 'asc'
      ? 'Look up ASC figures and SKUs by part number or description. Results open in the product catalog.'
      : 'Enter a competitor part number, generic description, or plain language and we will find the closest ASC match inside the BOM flow.';

  return (
    <Space orientation="vertical" size={token.marginLG} style={{ width: '100%' }}>
      <PageBackButton to={bomHubPath}>Back to BOM</PageBackButton>
      <BomPageHeader
        title={pageTitle}
        description={pageDescription}
        actions={
          <Button type="primary" size="large" icon={<SearchOutlined />} onClick={runSearch}>
            {mode === 'asc' ? 'Search catalog' : 'Find ASC match'}
          </Button>
        }
      />

      <Card style={{ borderColor: token.colorBorderSecondary }}>
        <Space orientation="vertical" size={token.margin} style={{ width: '100%' }}>
          <Flex align="center" justify="space-between" wrap="wrap" gap={token.marginSM}>
            <BomCardTitle>Search mode</BomCardTitle>
            <Radio.Group
              value={mode}
              onChange={(event) => setMode(event.target.value as BomSearchMode)}
              optionType="button"
              buttonStyle="solid"
            >
              <Radio.Button value="competitor">Competitor / unknown</Radio.Button>
              <Radio.Button value="asc">ASC catalog</Radio.Button>
            </Radio.Group>
          </Flex>

          <AppSearchInput
            allowClear
            size="large"
            placeholder={
              mode === 'asc'
                ? 'Example: FP7450 or standard response sprinkler'
                : 'Example: 005 FireLock coupling 4 inch grooved'
            }
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onPressEnter={runSearch}
            style={{ width: '100%', maxWidth: token.screenLG }}
          />

          <Typography.Text type="secondary">
            {mode === 'asc'
              ? 'ASC search uses the product catalog with figure and SKU weighting.'
              : 'Tip: Use competitor part number first, then plain language if no direct hit.'}
          </Typography.Text>

          <Space wrap align="center">
            <Typography.Text type="secondary">Try an example:</Typography.Text>
            {exampleQueries.map((example) => (
              <Button key={example} size="small" onClick={() => setQ(example)}>
                {example}
              </Button>
            ))}
          </Space>
        </Space>
      </Card>

      {mode === 'competitor' ? (
        <Card style={{ background: token.colorFillAlter, borderColor: token.colorBorderSecondary }}>
          <Space orientation="vertical" size={token.marginXS}>
            <BomCardTitle>Competitor search tips</BomCardTitle>
            <Typography.Text type="secondary">Use competitor part numbers for direct conversions.</Typography.Text>
            <Typography.Text type="secondary">
              Describe the product in plain language (for example: &quot;4 inch grooved coupling&quot;).
            </Typography.Text>
            <Typography.Text type="secondary">
              Include size, connection type, and pressure rating when known.
            </Typography.Text>
            <Typography.Text type="secondary">
              Results stay in BOM — switch to ASC catalog mode to browse sellable parts directly.
            </Typography.Text>
          </Space>
        </Card>
      ) : (
        <Card style={{ background: token.colorFillAlter, borderColor: token.colorBorderSecondary }}>
          <Space orientation="vertical" size={token.marginXS}>
            <BomCardTitle>ASC catalog search tips</BomCardTitle>
            <Typography.Text type="secondary">Search by figure number, SKU, or product family name.</Typography.Text>
            <Typography.Text type="secondary">
              Catalog results prioritize exact SKU hits, then figure families.
            </Typography.Text>
            <Typography.Text type="secondary">
              Need to convert a competitor line? Switch to competitor / unknown mode.
            </Typography.Text>
          </Space>
        </Card>
      )}
    </Space>
  );
}
