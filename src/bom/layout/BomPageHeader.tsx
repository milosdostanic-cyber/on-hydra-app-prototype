import { figmaTextStyleToReactCss, figmaTitleHeading3 } from '../../theme/figmaTypography';
import { Space, Typography, theme } from '../../ui/antd';

type Props = {
  title: string;
  description?: string;
};

export function BomPageHeader({ title, description }: Props) {
  const { token } = theme.useToken();
  return (
    <Space orientation="vertical" size={token.marginXS} style={{ width: '100%' }}>
      <Typography.Title
        level={3}
        style={{
          margin: 0,
          ...figmaTextStyleToReactCss(figmaTitleHeading3),
        }}
      >
        {title}
      </Typography.Title>
      {description ? (
        <Typography.Paragraph type="secondary" style={{ margin: 0 }}>
          {description}
        </Typography.Paragraph>
      ) : null}
    </Space>
  );
}
