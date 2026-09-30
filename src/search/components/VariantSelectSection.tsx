import type { ReactNode } from 'react';

import type { PartDetailContent } from '../partDetailDemoData';
import {
  hydraBaseNormal,
  hydraTextStyleToReactCss,
  hydraTitleHeading4,
} from '../../theme/hydraTypography';
import { Divider, Flex, Typography, theme } from '../../ui/antd';

type Props = {
  detail: PartDetailContent;
  /** Action CTAs — variant picking happens inside each action modal, not on the page. */
  actions?: ReactNode;
};

/** Part-detail actions rail — no page-level variant picker. */
export function VariantSelectSection({ detail, actions }: Props) {
  const { token } = theme.useToken();
  const variationCount = detail.variations.length;

  const sectionHeadingStyle = {
    margin: 0,
    ...hydraTextStyleToReactCss(hydraTitleHeading4),
    color: token.colorText,
  };

  return (
    <Flex vertical gap={token.paddingSM} style={{ width: '100%' }}>
      <Flex vertical gap={token.marginXXS}>
        <Typography.Text style={sectionHeadingStyle}>Actions</Typography.Text>
        <Typography.Paragraph
          style={{
            margin: 0,
            color: token.colorTextLabel,
            ...hydraTextStyleToReactCss(hydraBaseNormal),
          }}
        >
          This part has {variationCount} size{variationCount === 1 ? '' : 's'} / variation
          {variationCount === 1 ? '' : 's'}. Pick an action below — you will choose the variants in
          the next step.
        </Typography.Paragraph>
      </Flex>

      {actions ? (
        <>
          <Divider style={{ margin: 0 }} />
          {actions}
        </>
      ) : null}
    </Flex>
  );
}

export { isRedundantPimText } from './variantSelectionShared';
