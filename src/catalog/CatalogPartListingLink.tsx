import { RightOutlined } from '@ant-design/icons';
import type { ButtonProps } from 'antd';

import { Button } from '../ui/antd';

export type CatalogPartListingLinkProps = {
  children: ButtonProps['children'];
  /** When the parent card handles navigation, keep the link visual-only. */
  tabIndex?: number;
  preventInteraction?: boolean;
};

/**
 * Catalog “View … listing” affordance — `Button` link + chevron; tokens only in styles.
 * Local catalog composition (category cards + featured cards).
 */
export function CatalogPartListingLink({
  children,
  tabIndex = 0,
  preventInteraction = false,
}: CatalogPartListingLinkProps) {
  return (
    <Button
      type="link"
      icon={<RightOutlined />}
      iconPosition="end"
      tabIndex={tabIndex}
      styles={{
        root: {
          padding: 0,
          margin: 0,
          height: 'auto',
          alignSelf: 'flex-start',
          ...(preventInteraction ? { pointerEvents: 'none' } : {}),
        },
      }}
    >
      {children}
    </Button>
  );
}
