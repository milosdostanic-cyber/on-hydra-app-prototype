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

export function BomParsingReviewQualityAlert({
  rows,
  profile,
}: BomParsingReviewQualityAlertProps) {
  const banner = parsingReviewQualityAlert(rows, profile);
  const outlook = parsingReviewMatchOutlook(rows, profile);
  const bodyStyle = hydraTextStyleToReactCss(hydraBaseNormal);

  const primaryAlert =
    outlook.unusable > 0 ? (
      <Alert
        type="error"
        showIcon
        message={banner.message}
        description={
          <Typography.Paragraph style={{ ...bodyStyle, marginBottom: 0 }}>
            {outlook.unusable === outlook.total ? (
              <>
                None of the <AlertEmphasis>{outlook.total}</AlertEmphasis> line
                {outlook.total === 1 ? '' : 's'} have information we can match against — the values we
                could read aren&apos;t complete enough to identify a part. Add a description, SKU, or UPC,
                or <AlertEmphasis>Continue with current data</AlertEmphasis> and they&apos;ll come through
                unmatched. You may also want to re-check column mapping.
              </>
            ) : (
              <>
                <AlertEmphasis>
                  {outlook.ready} of {outlook.total} line{outlook.total === 1 ? '' : 's'}{' '}
                  {outlook.ready === 1 ? 'is' : 'are'} ready
                </AlertEmphasis>
                .{' '}
                <AlertEmphasis>
                  {outlook.unusable} line{outlook.unusable === 1 ? '' : 's'} can&apos;t be matched
                </AlertEmphasis>{' '}
                — the values we could read aren&apos;t complete enough to identify a part. Use{' '}
                <AlertEmphasis>Fix to match</AlertEmphasis> to add a description, SKU, or UPC, or{' '}
                <AlertEmphasis>Continue with current data</AlertEmphasis> and they&apos;ll come through
                unmatched.
                {outlook.limited > 0 ? (
                  <>
                    {' '}
                    Another {outlook.limited} line{outlook.limited === 1 ? '' : 's'} may match poorly.
                  </>
                ) : null}
              </>
            )}
          </Typography.Paragraph>
        }
      />
    ) : outlook.limited === 0 ? (
      <Alert
        type="success"
        showIcon
        message={banner.message}
        description={
          <Typography.Paragraph style={{ ...bodyStyle, marginBottom: 0 }}>
            We found <AlertEmphasis>{outlook.total}</AlertEmphasis> row
            {outlook.total === 1 ? '' : 's'} in your file.{' '}
            <AlertEmphasis>Continue with current data</AlertEmphasis> when you are ready — no fixes
            required.
          </Typography.Paragraph>
        }
      />
    ) : (
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
            Use <AlertEmphasis>Add info</AlertEmphasis> on a highlighted row if you want to improve them,
            or <AlertEmphasis>Continue with current data</AlertEmphasis> to move on without changes.
          </Typography.Paragraph>
        }
      />
    );

  return primaryAlert;
}
