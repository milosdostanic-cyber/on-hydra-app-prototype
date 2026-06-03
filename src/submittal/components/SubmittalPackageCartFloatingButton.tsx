import { InboxOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

import { useActiveProject } from '../../context/ActiveProjectContext';
import { useSubmittalPackages } from '../../context/SubmittalPackagesContext';
import { Badge, Button, theme } from '../../ui/antd';

/**
 * Floating "session cart" affordance shown during a part-search session (ZIP
 * `SubmittalPackageCartFloatingButton`). Rendered only when the cart has items; clicking jumps to
 * the active project's submittal packages. The shell is read-only, so this mounts inside the
 * part-search surfaces rather than globally.
 */
export function SubmittalPackageCartFloatingButton() {
  const { token } = theme.useToken();
  const navigate = useNavigate();
  const { projectId } = useActiveProject();
  const { cartCount, clearCart } = useSubmittalPackages();

  if (cartCount === 0 || !projectId) return null;

  return (
    <div style={{ position: 'fixed', right: token.marginLG, bottom: token.marginLG, zIndex: 1000 }}>
      <Badge count={cartCount}>
        <Button
          type="primary"
          size="large"
          shape="round"
          icon={<InboxOutlined />}
          onClick={() => {
            clearCart();
            navigate(`/projects/${projectId}/submittal`);
          }}
        >
          View packages
        </Button>
      </Badge>
    </div>
  );
}
