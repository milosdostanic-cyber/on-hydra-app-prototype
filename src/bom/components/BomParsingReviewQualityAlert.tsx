import {
  parsingReviewMatchOutlook,
  parsingReviewQualityAlert,
} from '../bomParsingReviewAlert';
import type { BomItem, BomParsingReviewColumnProfile } from '../data/types';
import {
  hydraBaseNormal,
  hydraBaseStrong,
  hydraTextStyleToReactCss,
} from '../../theme/hydraTypography';
import { Alert, Typography } from '../../ui/antd';

type BomParsingReviewQualityAlertProps = {
  rows: BomItem[];
  profile: BomParsingReviewColumnProfile;
};

function AlertEmphasis({ children }: { children: React.ReactNode }) {
  return <span style={hydraTextStyleToReactCss(hydraBaseStrong)}>{children}</span>;
}

export function BomParsingReviewQualityAlert({ rows, profile }: BomParsingReviewQualityAlertProps) {
  const banner = parsingReviewQualityAlert(rows, profile);
  const outlook = parsingReviewMatchOutlook(rows, profile);
  const bodyStyle = hydraTextStyleToReactCss(hydraBaseNormal);

  if (outlook.limited === 0) {
    return (
      <Alert
        type="success"
        showIcon
        message={banner.message}
        description={
          <Typography.Paragraph style={{ ...bodyStyle, marginBottom: 0 }}>
            We found <AlertEmphasis>{outlook.total}</AlertEmphasis> row
            {outlook.total === 1 ? '' : 's'} in your file.{' '}
            <AlertEmphasis>Continue with current data</AlertEmphasis> when you are ready — no fixes required.
          </Typography.Paragraph>
        }
      />
    );
  }

  return (
    <Alert
      type="warning"
      showIcon
      message={banner.message}
      description={
        <Typography.Paragraph style={{ ...bodyStyle, marginBottom: 0 }}>
          We found <AlertEmphasis>{outlook.total}</AlertEmphasis> row
          {outlook.total === 1 ? '' : 's'} in your file.{' '}
          <AlertEmphasis>
            {outlook.ready} {outlook.ready === 1 ? 'has' : 'have'} enough detail
          </AlertEmphasis>{' '}
          for accurate matching;{' '}
          <AlertEmphasis>
            {outlook.limited} {outlook.limited === 1 ? 'is' : 'are'} missing information
          </AlertEmphasis>{' '}
          we usually need — those lines may not get a strong ASC match.
          <br />
          Use <AlertEmphasis>Add info</AlertEmphasis> on a highlighted row if you want to improve them, or{' '}
          <AlertEmphasis>Continue with current data</AlertEmphasis> to move on without changes.
        </Typography.Paragraph>
      }
    />
  );
}
