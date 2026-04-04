import { Typography, theme } from '../ui/antd';

export function SalesBraceModule() {
  const { token } = theme.useToken();
  return (
    <Typography.Paragraph style={{ margin: 0, color: token.colorTextSecondary }}>
      Sales brace (stub): this level will show design names and brace visuals — a different layout than
      Submittal / Content, by product design.
    </Typography.Paragraph>
  );
}

export function SubmittalModule() {
  const { token } = theme.useToken();
  return (
    <Typography.Paragraph style={{ margin: 0, color: token.colorTextSecondary }}>
      Submittal manager (stub): same underlying search as Content; actions focus on adding PDFs to a
      submittal.
    </Typography.Paragraph>
  );
}

export function ContentModule() {
  const { token } = theme.useToken();
  return (
    <Typography.Paragraph style={{ margin: 0, color: token.colorTextSecondary }}>
      Content (stub): same part listing as Submittal; actions focus on downloads. Product goal is one
      search and one part page with all actions.
    </Typography.Paragraph>
  );
}
