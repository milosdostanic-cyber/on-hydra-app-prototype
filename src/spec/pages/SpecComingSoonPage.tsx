import { Empty, Flex, Typography, theme } from '../../ui/antd';
import { BomPageHeader } from '../../bom/layout/BomPageHeader';
import { PageBackButton } from '../../shell/PageBackButton';
import { specHomePath } from '../specNavigation';

/** Placeholder for I2+ routes so deep links do not 404. */
export function SpecComingSoonPage({ title, increment }: { title: string; increment: string }) {
  const { token } = theme.useToken();
  return (
    <Flex vertical gap={token.marginLG} style={{ width: '100%' }}>
      <PageBackButton to={specHomePath()}>Back to Spec</PageBackButton>
      <BomPageHeader title={title} description={`This surface ships in ${increment}.`} />
      <Empty description={<Typography.Text type="secondary">Coming in {increment}</Typography.Text>} />
    </Flex>
  );
}
