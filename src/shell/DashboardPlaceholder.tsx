import { Typography, theme } from '../ui/antd';

export function DashboardPlaceholder() {
  const { token } = theme.useToken();
  return (
    <Typography.Paragraph style={{ margin: 0, color: token.colorTextSecondary }}>
      Dashboard placeholder — wire widgets here when the product flow is ready.
    </Typography.Paragraph>
  );
}
