import { currentPartMatchingReviewAlert } from '../bomMatchingReviewAlert';
import type { BomMatchResult } from '../data/types';
import { hydraBaseNormal, hydraTextStyleToReactCss } from '../../theme/hydraTypography';
import { Alert, Typography } from '../../ui/antd';

type BomMatchingReviewQualityAlertProps = {
  matchRow: BomMatchResult;
};

export function BomMatchingReviewQualityAlert({ matchRow }: BomMatchingReviewQualityAlertProps) {
  const banner = currentPartMatchingReviewAlert(matchRow);

  return (
    <Alert
      type={banner.type}
      showIcon
      message={banner.message}
      description={
        <Typography.Paragraph style={{ ...hydraTextStyleToReactCss(hydraBaseNormal), marginBottom: 0 }}>
          {banner.description}
        </Typography.Paragraph>
      }
    />
  );
}
