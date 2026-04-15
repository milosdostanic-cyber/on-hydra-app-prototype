import { LeftOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

import { Button } from '../ui/antd';

type Props = {
  to: string;
  children: string;
};

/** First row above page title — same shell position everywhere. */
export function PageBackButton({ to, children }: Props) {
  const navigate = useNavigate();

  return (
    <Button
      type="default"
      icon={<LeftOutlined />}
      onClick={() => navigate(to)}
      style={{ alignSelf: 'flex-start', margin: 0 }}
    >
      {children}
    </Button>
  );
}
