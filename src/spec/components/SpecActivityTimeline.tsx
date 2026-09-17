import type { SpecDeliverBackActivity } from '../data/types';
import { List, Typography, theme } from '../../ui/antd';
import { hydraBaseStrong, hydraTextStyleToReactCss } from '../../theme/hydraTypography';

/**
 * G10 — chronological activity for Deliver-Back.
 */
export function SpecActivityTimeline({ activity }: { activity: SpecDeliverBackActivity[] }) {
  const { token } = theme.useToken();
  const ordered = [...activity].sort((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime());

  if (ordered.length === 0) {
    return <Typography.Text type="secondary">No activity recorded yet.</Typography.Text>;
  }

  return (
    <List
      style={{ marginTop: token.marginSM }}
      dataSource={ordered}
      renderItem={(item) => (
        <List.Item key={item.id}>
          <List.Item.Meta
            title={<Typography.Text style={hydraTextStyleToReactCss(hydraBaseStrong)}>{item.action}</Typography.Text>}
            description={
              <Typography.Text type="secondary">
                {item.actor} · {new Date(item.at).toLocaleString()}
                {item.detail ? ` — ${item.detail}` : ''}
              </Typography.Text>
            }
          />
        </List.Item>
      )}
    />
  );
}
