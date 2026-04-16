import type { ReactNode } from 'react';

import { hydraTextStyleToReactCss, hydraTitleHeading4 } from '../../theme/hydraTypography';
import { Typography } from '../../ui/antd';

type Props = {
  children: ReactNode;
};

/** Card and section titles — Figma `Title/Heading 4` for clear scan hierarchy. */
export function BomCardTitle({ children }: Props) {
  return (
    <Typography.Title
      level={4}
      style={{
        margin: 0,
        ...hydraTextStyleToReactCss(hydraTitleHeading4),
      }}
    >
      {children}
    </Typography.Title>
  );
}
