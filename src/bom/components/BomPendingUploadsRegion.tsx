import type { ReactNode } from 'react';
import { Collapse, Flex, Typography, theme } from '../../ui/antd';
import type { BomImportSession } from '../bomImportProgressState';
import { hydraBaseStrong, hydraTextStyleToReactCss } from '../../theme/hydraTypography';
import { BomImportProgressStrip } from './BomImportProgressStrip';

type Props = {
  sessions: BomImportSession[];
  onContinue: (session: BomImportSession) => void;
};

function BomImportProgressShellFlush({ children }: { children: ReactNode }) {
  const { token } = theme.useToken();
  return (
    <div
      style={{
        width: `calc(100% + ${token.paddingLG * 2}px)`,
        marginInline: `calc(-1 * ${token.paddingLG}px)`,
        marginTop: `calc(-1 * ${token.paddingLG}px)`,
        marginBottom: token.paddingLG,
        background: token.colorWarningBg,
        boxShadow: token.boxShadowTertiary,
      }}
    >
      {children}
    </div>
  );
}

/** Workspace: 1–2 (or 4+) pending = stacked strips; exactly 3 = one Collapse with all strips inside. */
export function BomPendingUploadsRegion({ sessions, onContinue }: Props) {
  const { token } = theme.useToken();

  if (sessions.length === 0) return null;

  if (sessions.length !== 3) {
    return (
      <>
        {sessions.map((session, index) => (
          <BomImportProgressStrip
            key={session.uploadId}
            placement="shell-flush"
            flushAttachTop={index === 0}
            progress={session.progress}
            variant="resume"
            onContinue={() => onContinue(session)}
          />
        ))}
      </>
    );
  }

  const count = sessions.length;

  return (
    <BomImportProgressShellFlush>
      <Collapse
        bordered={false}
        expandIconPlacement="end"
        defaultActiveKey={['pending-uploads']}
        style={{ background: 'transparent' }}
        styles={{
          header: {
            alignItems: 'center',
            background: 'transparent',
            paddingInline: token.paddingLG,
            paddingBlock: token.paddingSM,
          },
          body: {
            background: 'transparent',
            padding: 0,
          },
        }}
        items={[
          {
            key: 'pending-uploads',
            label: (
              <Typography.Text strong style={hydraTextStyleToReactCss(hydraBaseStrong)}>
                {count} interrupted file uploads
              </Typography.Text>
            ),
            children: (
              <Flex vertical style={{ width: '100%' }}>
                {sessions.map((session, index) => (
                  <div
                    key={session.uploadId}
                    style={
                      index < sessions.length - 1
                        ? {
                            borderBottom: `${token.lineWidth}px ${token.lineType} ${token.colorWarningBorder}`,
                          }
                        : undefined
                    }
                  >
                    <BomImportProgressStrip
                      nested
                      progress={session.progress}
                      variant="resume"
                      onContinue={() => onContinue(session)}
                    />
                  </div>
                ))}
              </Flex>
            ),
          },
        ]}
      />
    </BomImportProgressShellFlush>
  );
}
