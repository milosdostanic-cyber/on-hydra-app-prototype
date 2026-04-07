import {
  hydraTextStyleToReactCss,
  hydraSmallNormal,
  hydraTitleHeading2,
  hydraTitleHeading3,
} from '../../theme/hydraTypography';
import { Space, Typography, theme } from '../../ui/antd';

type Props = {
  title: string;
  description?: string;
  /** Short context above the title (e.g. what “BOM” stands for). */
  eyebrow?: string;
  /** Use 3 for a lighter landing-style headline. */
  titleLevel?: 2 | 3;
};

export function BomPageHeader({ title, description, eyebrow, titleLevel = 2 }: Props) {
  const { token } = theme.useToken();
  const heading = titleLevel === 3 ? hydraTitleHeading3 : hydraTitleHeading2;
  const antLevel = titleLevel === 3 ? 3 : 2;
  return (
    <Space orientation="vertical" size={token.marginXS} style={{ width: '100%' }}>
      {eyebrow ? (
        <Typography.Text
          type="secondary"
          style={{
            display: 'block',
            ...hydraTextStyleToReactCss(hydraSmallNormal),
          }}
        >
          {eyebrow}
        </Typography.Text>
      ) : null}
      <Typography.Title
        level={antLevel}
        style={{
          margin: 0,
          ...hydraTextStyleToReactCss(heading),
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
